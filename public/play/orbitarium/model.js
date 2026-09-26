/** @typedef {{notes: boolean[], muted: boolean}} Track */
/** @typedef {{version: 1, scene: string, bpm: number, scale: string, volume: number, ambience: number, tracks: Track[]}} Composition */

export const TRACKS = [
  { name: '微光', subtitle: 'GLIMMER', voice: 'bell', color: '#cbb6ed', steps: 16, radius: 0.43, octave: 72 },
  { name: '流星', subtitle: 'DRIFT', voice: 'keys', color: '#e7b982', steps: 12, radius: 0.335, octave: 60 },
  { name: '塵埃', subtitle: 'STARDUST', voice: 'dust', color: '#99cbc0', steps: 9, radius: 0.24, octave: 72 },
  { name: '引力', subtitle: 'GRAVITY', voice: 'bass', color: '#829bd0', steps: 7, radius: 0.145, octave: 36 },
];

export const SCALES = {
  dream: { name: '夢境', description: 'D 大調五聲音階', root: 2, intervals: [0, 2, 4, 7, 9] },
  dusk: { name: '暮色', description: 'A 小調五聲音階', root: 9, intervals: [0, 3, 5, 7, 10] },
  float: { name: '漂浮', description: 'C 全音音階', root: 0, intervals: [0, 2, 4, 6, 8, 10] },
};

export const SCENES = [
  { id: 'voyage', name: '夜航', english: 'Night voyage', bpm: 72, scale: 'dream', notes: [[0, 3, 6, 10, 14], [0, 4, 7, 10], [0, 5], [0, 3]], description: '不急著抵達，只聽星星經過。' },
  { id: 'tide', name: '月之潮汐', english: 'Lunar tides', bpm: 58, scale: 'dusk', notes: [[0, 5, 11], [0, 3, 6, 9], [2, 6], [0, 4]], description: '一點月光，一次緩慢的呼吸。' },
  { id: 'bloom', name: '星雲花園', english: 'Nebula garden', bpm: 96, scale: 'float', notes: [[0, 2, 5, 7, 10, 13], [0, 2, 5, 8, 10], [0, 3, 6], [0, 2, 5]], description: '讓微小的聲音，長成一整片星雲。' },
];

/** @param {string} [id] @returns {Composition} */
export function createComposition(id = 'voyage') {
  const scene = SCENES.find((item) => item.id === id) ?? SCENES[0];
  return {
    version: 1, scene: scene.id, bpm: scene.bpm, scale: scene.scale, volume: 0.6, ambience: 0.5,
    tracks: TRACKS.map((track, index) => ({ notes: Array.from({ length: track.steps }, (_, step) => scene.notes[index].includes(step)), muted: false })),
  };
}

/** @param {number} trackIndex @param {number} step @param {string} scale @returns {number} */
export function noteForStep(trackIndex, step, scale) {
  const selected = SCALES[scale] ?? SCALES.dream;
  const degree = trackIndex === 3 ? (step % 2) * 3 : (step * 3 + trackIndex) % (selected.intervals.length * 2);
  return TRACKS[trackIndex].octave + selected.root + selected.intervals[degree % selected.intervals.length] + Math.floor(degree / selected.intervals.length) * 12;
}

/** @param {number} midi @returns {string} */
export function noteName(midi) {
  return `${['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Reject invalid saved files without partially applying them. @param {unknown} value @returns {Composition} */
export function validateComposition(value) {
  if (!value || typeof value !== 'object') throw new Error('這不是星軌音室的作品檔。');
  const item = /** @type {Composition} */ (value);
  const validNumber = (number, min, max) => typeof number === 'number' && Number.isFinite(number) && number >= min && number <= max;
  if (item.version !== 1 || !Object.hasOwn(SCALES, item.scale) || !validNumber(item.bpm, 40, 140) || !validNumber(item.volume, 0, 1) || !validNumber(item.ambience, 0, 1)) {
    throw new Error('作品檔的速度或音色設定不正確。');
  }
  if (!Array.isArray(item.tracks) || item.tracks.length !== TRACKS.length || item.tracks.some((track, index) => !track || typeof track.muted !== 'boolean' || !Array.isArray(track.notes) || track.notes.length !== TRACKS[index].steps || track.notes.some((note) => typeof note !== 'boolean'))) {
    throw new Error('作品檔的星軌資料不完整。');
  }
  return {
    version: 1, scene: SCENES.some((scene) => scene.id === item.scene) ? item.scene : 'custom', bpm: item.bpm, scale: item.scale, volume: item.volume, ambience: item.ambience,
    tracks: item.tracks.map((track) => ({ notes: [...track.notes], muted: track.muted })),
  };
}

/** @param {Composition} composition @param {() => number} [random] @returns {Composition} */
export function randomizeComposition(composition, random = Math.random) {
  return {
    ...composition, scene: 'custom',
    tracks: composition.tracks.map((track, index) => {
      const notes = track.notes.map(() => random() < [0.32, 0.38, 0.23, 0.28][index]);
      if (!notes.some(Boolean)) notes[0] = true;
      return { muted: track.muted, notes };
    }),
  };
}

/** @param {Composition} composition @param {number} tick @returns {{track: number, step: number, midi: number}[]} */
export function eventsAtTick(composition, tick) {
  return TRACKS.flatMap((track, index) => {
    const step = tick % track.steps;
    return !composition.tracks[index].muted && composition.tracks[index].notes[step]
      ? [{ track: index, step, midi: noteForStep(index, step, composition.scale) }] : [];
  });
}
