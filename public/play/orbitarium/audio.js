const VOICES = new Set(['keys', 'bell', 'bass', 'dust'])
const MIN_GAIN = 0.0001

/**
 * Convert a MIDI note number to an equal-tempered frequency in hertz.
 *
 * @param {number} midi
 * @returns {number}
 */
export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12)
}

/**
 * Create Orbitarium's reusable Web Audio engine.
 *
 * Calls to trigger are ignored until unlock resolves, unless a context is
 * injected. stop silences scheduled and sounding notes without closing the
 * context, so the same engine can be used after pausing.
 *
 * @param {{ context?: BaseAudioContext }} [options]
 * @returns {{
 *   unlock: () => Promise<void>,
 *   trigger: (voice: 'keys' | 'bell' | 'bass' | 'dust', midi: number, when?: number, velocity?: number) => void,
 *   setVolume: (value: number) => void,
 *   setAmbience: (value: number) => void,
 *   stop: () => void,
 *   readonly currentTime: number,
 *   readonly state: string
 * }}
 */
export function createAudioEngine({ context } = {}) {
  let audioContext = context ?? null
  let graph = null
  let volume = 0.72
  let ambience = 0.28
  const activeNotes = new Set()

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value))
  }

  function setParam(param, value, time) {
    param.cancelScheduledValues(time)
    param.setValueAtTime(value, time)
  }

  function createAmbiencePath(input, master) {
    const send = audioContext.createGain()
    const delay = audioContext.createDelay(1)
    const feedback = audioContext.createGain()
    const wet = audioContext.createGain()

    delay.delayTime.value = 0.23
    feedback.gain.value = 0.2
    send.gain.value = ambience * 0.32
    wet.gain.value = 0.72
    input.connect(send)
    send.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(wet)
    wet.connect(master)
    return { send, delay, feedback, wet }
  }

  function buildGraph() {
    if (graph || !audioContext) return

    const input = audioContext.createGain()
    const dry = audioContext.createGain()
    const master = audioContext.createGain()
    const compressor = audioContext.createDynamicsCompressor()

    compressor.threshold.value = -18
    compressor.knee.value = 16
    compressor.ratio.value = 8
    compressor.attack.value = 0.004
    compressor.release.value = 0.22

    input.connect(dry)
    dry.connect(master)
    master.connect(compressor)
    compressor.connect(audioContext.destination)

    graph = { input, dry, master, ...createAmbiencePath(input, master) }
    setParam(master.gain, volume * 0.5, audioContext.currentTime)
  }

  function createOutput(midi) {
    const output = audioContext.createGain()
    if (typeof audioContext.createStereoPanner === 'function') {
      const panner = audioContext.createStereoPanner()
      panner.pan.value = clamp((midi - 60) / 36, -0.42, 0.42)
      output.connect(panner)
      panner.connect(graph.input)
    } else {
      output.connect(graph.input)
    }
    return output
  }

  function envelope(param, when, peak, attack, duration) {
    param.setValueAtTime(MIN_GAIN, when)
    param.linearRampToValueAtTime(peak, when + attack)
    param.exponentialRampToValueAtTime(MIN_GAIN, when + duration)
  }

  function register(sources, output, endTime) {
    const note = { sources, output }
    activeNotes.add(note)
    let remaining = sources.length
    for (const source of sources) {
      source.addEventListener('ended', () => {
        remaining -= 1
        if (remaining === 0) {
          activeNotes.delete(note)
          output.disconnect()
        }
      }, { once: true })
      source.stop(endTime)
    }
  }

  function playKeys(frequency, when, strength, midi) {
    const output = createOutput(midi)
    const filter = audioContext.createBiquadFilter()
    const fundamental = audioContext.createOscillator()
    const overtone = audioContext.createOscillator()
    const overtoneGain = audioContext.createGain()
    const duration = 1.25

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(Math.min(4200, frequency * 7), when)
    filter.frequency.exponentialRampToValueAtTime(Math.max(500, frequency * 2.2), when + duration)
    filter.Q.value = 0.8
    fundamental.type = 'triangle'
    fundamental.frequency.value = frequency
    overtone.type = 'sine'
    overtone.frequency.value = frequency * 2.005
    overtoneGain.gain.value = 0.18
    envelope(output.gain, when, 0.23 * strength, 0.008, duration)

    fundamental.connect(filter)
    overtone.connect(overtoneGain)
    overtoneGain.connect(filter)
    filter.connect(output)
    fundamental.start(when)
    overtone.start(when)
    register([fundamental, overtone], output, when + duration + 0.03)
  }

  function playBell(frequency, when, strength, midi) {
    const output = createOutput(midi)
    const sources = []
    const partials = [
      [1, 0.13, 1.7],
      [2.01, 0.07, 1.25],
      [3.93, 0.035, 0.82]
    ]

    for (const [multiple, level, duration] of partials) {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency * multiple
      envelope(gain.gain, when, level * strength, 0.004, duration)
      oscillator.connect(gain)
      gain.connect(output)
      oscillator.start(when)
      oscillator.stop(when + duration + 0.03)
      sources.push(oscillator)
    }
    output.gain.value = 1
    registerWithoutStop(sources, output)
  }

  function registerWithoutStop(sources, output) {
    const note = { sources, output }
    activeNotes.add(note)
    let remaining = sources.length
    for (const source of sources) {
      source.addEventListener('ended', () => {
        remaining -= 1
        if (remaining === 0) {
          activeNotes.delete(note)
          output.disconnect()
        }
      }, { once: true })
    }
  }

  function playBass(frequency, when, strength, midi) {
    const output = createOutput(midi)
    const sine = audioContext.createOscillator()
    const body = audioContext.createOscillator()
    const bodyGain = audioContext.createGain()
    const duration = 0.72

    sine.type = 'sine'
    sine.frequency.value = frequency
    body.type = 'triangle'
    body.frequency.value = frequency * 2
    bodyGain.gain.value = 0.08
    envelope(output.gain, when, 0.25 * strength, 0.012, duration)
    sine.connect(output)
    body.connect(bodyGain)
    bodyGain.connect(output)
    sine.start(when)
    body.start(when)
    register([sine, body], output, when + duration + 0.03)
  }

  function playDust(frequency, when, strength, midi) {
    const output = createOutput(midi)
    const noise = audioContext.createBufferSource()
    const filter = audioContext.createBiquadFilter()
    const length = Math.max(1, Math.round(audioContext.sampleRate * 0.18))
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate)
    const samples = buffer.getChannelData(0)

    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1
    }
    noise.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.value = frequency * 2
    filter.Q.value = 7
    envelope(output.gain, when, 0.11 * strength, 0.006, 0.18)
    noise.connect(filter)
    filter.connect(output)
    noise.start(when)
    register([noise], output, when + 0.2)
  }

  if (audioContext) buildGraph()

  return {
    async unlock() {
      if (!audioContext) {
        const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext
        if (!AudioContextClass) {
          throw new Error('Orbitarium audio is unavailable: this browser does not support the Web Audio API.')
        }
        audioContext = new AudioContextClass()
        buildGraph()
      }
      if (audioContext.state === 'suspended' && typeof audioContext.resume === 'function') {
        await audioContext.resume()
      }
    },

    trigger(voice, midi, when = audioContext?.currentTime ?? 0, velocity = 0.8) {
      if (!audioContext || !graph || !VOICES.has(voice)) return
      if (!Number.isFinite(midi) || !Number.isFinite(when) || !Number.isFinite(velocity)) return

      const startTime = Math.max(audioContext.currentTime, when)
      const frequency = midiToFrequency(midi)
      const strength = clamp(velocity, 0, 1)
      if (strength === 0) return

      if (voice === 'keys') playKeys(frequency, startTime, strength, midi)
      if (voice === 'bell') playBell(frequency, startTime, strength, midi)
      if (voice === 'bass') playBass(frequency, startTime, strength, midi)
      if (voice === 'dust') playDust(frequency, startTime, strength, midi)
    },

    setVolume(value) {
      volume = clamp(Number.isFinite(value) ? value : volume, 0, 1)
      if (graph && audioContext) {
        graph.master.gain.setTargetAtTime(volume * 0.5, audioContext.currentTime, 0.015)
      }
    },

    setAmbience(value) {
      ambience = clamp(Number.isFinite(value) ? value : ambience, 0, 1)
      if (graph && audioContext) {
        graph.send.gain.setTargetAtTime(ambience * 0.32, audioContext.currentTime, 0.02)
      }
    },

    stop() {
      if (!audioContext) return
      const now = audioContext.currentTime
      for (const note of [...activeNotes]) {
        const gain = note.output.gain
        if (typeof gain.cancelAndHoldAtTime === 'function') {
          gain.cancelAndHoldAtTime(now)
        } else {
          gain.cancelScheduledValues(now)
          gain.setValueAtTime(MIN_GAIN, now)
        }
        gain.linearRampToValueAtTime(MIN_GAIN, now + 0.015)
        for (const source of note.sources) {
          try {
            source.stop(now + 0.02)
          } catch {
            // A source that has already ended is already silent.
          }
        }
      }
      activeNotes.clear()

      const oldAmbience = {
        send: graph.send,
        delay: graph.delay,
        feedback: graph.feedback,
        wet: graph.wet
      }
      graph.input.disconnect(oldAmbience.send)
      oldAmbience.wet.gain.cancelScheduledValues(now)
      oldAmbience.wet.gain.setTargetAtTime(0, now, 0.005)
      Object.assign(graph, createAmbiencePath(graph.input, graph.master))
    },

    get currentTime() {
      return audioContext?.currentTime ?? 0
    },

    get state() {
      return audioContext?.state ?? 'uninitialized'
    }
  }
}
