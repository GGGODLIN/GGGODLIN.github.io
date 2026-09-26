import { createAudioEngine } from './audio.js';
import { TRACKS, SCALES, SCENES, createComposition, validateComposition, randomizeComposition, eventsAtTick, noteForStep, noteName } from './model.js';

const $ = (selector) => document.querySelector(selector);
const storageKey = 'orbitarium:composition:v1';
const audio = createAudioEngine();
const orbitCanvas = $('#orbits');
const orbitContext = orbitCanvas.getContext('2d');
const skyCanvas = $('#sky');
const skyContext = skyCanvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const history = [];
const steps = [];
const meters = [];
const pulses = [];
const visualQueue = [];
let composition = createComposition();
let playing = false;
let starting = false;
let scheduler;
let frame;
let nextTick = 0;
let nextTime = 0;
let visualTick = 0;
let visualTime = 0;
let size = 0;
let toastTimer;
let persistenceAvailable = true;
let restored = false;
let focusedTrack = -1;
let lastFrame = 0;

try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    composition = validateComposition(JSON.parse(saved));
    restored = true;
  }
} catch {
  persistenceAvailable = false;
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3400);
}

function saveLocal() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(composition));
    persistenceAvailable = true;
  } catch {
    persistenceAvailable = false;
  }
  $('#save-status').textContent = persistenceAvailable ? '星圖已自動保存 · 只留在這個瀏覽器' : '無法自動保存，請用「收藏星圖」下載作品';
}

function remember() {
  history.push(structuredClone(composition));
  if (history.length > 30) history.shift();
}

function makeIcon(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
}

function buildScenes() {
  SCENES.forEach((scene, index) => {
    const button = document.createElement('button');
    button.className = 'scene-button';
    button.dataset.scene = scene.id;
    button.setAttribute('aria-label', `${scene.name} ${scene.english}`);
    const number = document.createElement('span');
    number.className = 'scene-number';
    number.textContent = `0${index + 1}`;
    const name = document.createElement('span');
    name.className = 'scene-name';
    name.textContent = scene.name;
    const english = document.createElement('small');
    english.textContent = scene.english;
    name.append(english);
    const indicator = document.createElement('span');
    indicator.className = 'scene-indicator';
    button.append(number, name, indicator);
    button.addEventListener('click', () => {
      remember();
      const next = createComposition(scene.id);
      next.volume = composition.volume;
      next.ambience = composition.ambience;
      replaceComposition(next);
      toast(`已抵達「${scene.name}」`);
    });
    $('#scenes').append(button);
  });
}

function buildTracks() {
  TRACKS.forEach((track, trackIndex) => {
    const row = document.createElement('div');
    row.className = 'track';
    row.style.setProperty('--color', track.color);
    row.dataset.track = trackIndex;
    const info = document.createElement('div');
    info.className = 'track-info';
    const symbol = document.createElement('span');
    symbol.className = 'track-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'track-name';
    name.textContent = track.name;
    const subtitle = document.createElement('small');
    subtitle.textContent = `${track.subtitle} · ${track.steps}`;
    name.append(subtitle);
    info.append(symbol, name);
    const toggle = document.createElement('button');
    toggle.className = 'track-toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-label', `${track.name}聲部`);
    toggle.addEventListener('click', () => toggleTrack(trackIndex));
    const meter = document.createElement('div');
    meter.className = 'track-meter';
    meter.setAttribute('aria-hidden', 'true');
    meters[trackIndex] = Array.from({ length: track.steps }, () => {
      const segment = document.createElement('span');
      meter.append(segment);
      return segment;
    });
    row.append(info, toggle, meter);
    row.addEventListener('mouseenter', () => { focusedTrack = trackIndex; if (!playing) drawOrbits(); });
    row.addEventListener('mouseleave', () => { focusedTrack = -1; if (!playing) drawOrbits(); });
    $('#tracks').append(row);

    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `${track.name}星軌，${track.steps}個音符`);
    steps[trackIndex] = Array.from({ length: track.steps }, (_, step) => {
      const angle = step / track.steps * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(angle) * track.radius * 100;
      const y = 50 + Math.sin(angle) * track.radius * 100;
      const button = document.createElement('button');
      button.className = 'star-step';
      button.style.cssText = `left:${x}%;top:${y}%;--color:${track.color}`;
      button.dataset.track = trackIndex;
      button.dataset.step = step;
      button.tabIndex = step === 0 ? 0 : -1;
      button.addEventListener('click', () => toggleNote(trackIndex, step));
      const showTip = () => {
        focusedTrack = trackIndex;
        $('#note-tooltip').textContent = `${track.name} · ${noteName(noteForStep(trackIndex, step, composition.scale))}`;
        $('#note-tooltip').style.left = `${x}%`;
        $('#note-tooltip').style.top = `${y}%`;
        $('#note-tooltip').classList.add('is-visible');
        if (!playing) drawOrbits();
      };
      const hideTip = () => {
        focusedTrack = -1;
        $('#note-tooltip').classList.remove('is-visible');
        if (!playing) drawOrbits();
      };
      button.addEventListener('mouseenter', showTip);
      button.addEventListener('mouseleave', hideTip);
      button.addEventListener('focus', showTip);
      button.addEventListener('blur', hideTip);
      button.addEventListener('keydown', (event) => {
        const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!direction && !['Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? track.steps - 1 : (step + direction + track.steps) % track.steps;
        steps[trackIndex].forEach((item, index) => { item.tabIndex = index === next ? 0 : -1; });
        steps[trackIndex][next].focus();
      });
      group.append(button);
      return button;
    });
    $('#star-buttons').append(group);
  });
}

function syncUI() {
  let count = 0;
  TRACKS.forEach((track, index) => {
    const data = composition.tracks[index];
    const row = $(`.track[data-track="${index}"]`);
    row.classList.toggle('is-muted', data.muted);
    row.querySelector('.track-toggle').setAttribute('aria-checked', String(!data.muted));
    steps[index].forEach((button, step) => {
      const on = data.notes[step];
      if (on) count += 1;
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', `${track.name} 第${step + 1}顆星 ${noteName(noteForStep(index, step, composition.scale))}`);
      button.classList.toggle('is-muted', data.muted);
      meters[index][step].classList.toggle('on', on);
    });
  });
  document.querySelectorAll('.scene-button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scene === composition.scene)));
  $('#scene-description').textContent = SCENES.find((scene) => scene.id === composition.scene)?.description ?? '這片宇宙，現在有了你的樣子。';
  $('#star-count').textContent = `${String(count).padStart(2, '0')} STARS ALIGNED`;
  $('#tempo').value = composition.bpm;
  $('#tempo-value').value = composition.bpm;
  $('#scale').value = composition.scale;
  document.querySelectorAll('[data-scale]').forEach((option) => {
    const selected = option.dataset.scale === composition.scale;
    option.setAttribute('aria-selected', String(selected));
    if (selected) {
      $('#scale-value').textContent = option.querySelector('.scale-option-name').textContent;
      $('#scale-picker').style.setProperty('--mood-color', option.style.getPropertyValue('--mood-color'));
    }
  });
  $('#volume').value = Math.round(composition.volume * 100);
  $('#ambience').value = Math.round(composition.ambience * 100);
  $('#ambience-value').textContent = `${Math.round(composition.ambience * 100)}%`;
  $('#undo').disabled = history.length === 0;
  document.querySelectorAll('input[type="range"]').forEach((input) => {
    input.style.setProperty('--fill', `${(Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
  });
  audio.setVolume(composition.volume);
  audio.setAmbience(composition.ambience);
  if (!playing) drawOrbits();
}

function changed() {
  composition.scene = 'custom';
  syncUI();
  saveLocal();
}

async function toggleNote(trackIndex, step) {
  remember();
  composition.tracks[trackIndex].notes[step] = !composition.tracks[trackIndex].notes[step];
  changed();
  if (!playing && composition.tracks[trackIndex].notes[step] && !composition.tracks[trackIndex].muted) {
    try {
      await audio.unlock();
      audio.trigger(TRACKS[trackIndex].voice, noteForStep(trackIndex, step, composition.scale), undefined, 0.7);
      pulse(trackIndex, step);
      drawOrbits();
    } catch {
      toast('無法啟動聲音；星圖仍可編輯與收藏。');
    }
  }
}

function toggleTrack(index) {
  remember();
  composition.tracks[index].muted = !composition.tracks[index].muted;
  changed();
}

function replaceComposition(next) {
  const wasPlaying = playing;
  pause();
  composition = next;
  visualTick = 0;
  syncUI();
  saveLocal();
  if (wasPlaying) void play();
}

function schedule() {
  if (!playing) return;
  const now = audio.currentTime;
  // A throttled or interrupted tab must not replay a backlog of old notes.
  if (nextTime < now - 0.15) nextTime = now + 0.04;
  while (nextTime < now + 0.1) {
    const events = eventsAtTick(composition, nextTick);
    events.forEach((event) => audio.trigger(TRACKS[event.track].voice, event.midi, nextTime, event.step === 0 ? 0.85 : 0.65));
    visualQueue.push({ tick: nextTick, time: nextTime, events });
    nextTick += 1;
    nextTime += 60 / composition.bpm / 2;
  }
}

async function play() {
  if (playing || starting) return;
  starting = true;
  $('#play').disabled = true;
  $('#sun').disabled = true;
  try {
    await audio.unlock();
    if (document.hidden) return;
    playing = true;
    nextTick = 0;
    visualTick = 0;
    nextTime = audio.currentTime + 0.06;
    visualTime = nextTime;
    document.body.classList.add('is-playing');
    $('#play').setAttribute('aria-pressed', 'true');
    $('#play').setAttribute('aria-label', '暫停演奏');
    $('#sun').setAttribute('aria-label', '暫停演奏');
    $('#play use').setAttribute('href', '#i-pause');
    $('#play-label').textContent = '暫停一下';
    $('#universe-status').textContent = '星軌正在航行';
    $('#center-label').textContent = 'THE UNIVERSE IS LISTENING';
    $('#center-subtitle').textContent = SCALES[composition.scale].description;
    schedule();
    scheduler = setInterval(schedule, 25);
    frame = requestAnimationFrame(animate);
    if (!composition.tracks.some((track) => !track.muted && track.notes.some(Boolean))) toast('這裡很安靜。點亮星星、開啟聲部，就會有聲音。');
  } catch {
    toast('無法啟動音訊，請確認瀏覽器允許播放聲音後再試一次。');
  } finally {
    starting = false;
    $('#play').disabled = false;
    $('#sun').disabled = false;
  }
}

function pause() {
  playing = false;
  clearInterval(scheduler);
  cancelAnimationFrame(frame);
  audio.stop();
  visualQueue.length = 0;
  pulses.length = 0;
  document.body.classList.remove('is-playing');
  $('#play').setAttribute('aria-pressed', 'false');
  $('#play').setAttribute('aria-label', '開始演奏');
  $('#sun').setAttribute('aria-label', '開始演奏');
  $('#play use').setAttribute('href', '#i-play');
  $('#play-label').textContent = '開始演奏';
  $('#universe-status').textContent = '宇宙稍作歇息';
  $('#center-label').textContent = 'YOUR LITTLE UNIVERSE';
  $('#center-subtitle').textContent = '點亮星星，寫下旋律';
  meters.flat().forEach((item) => item.classList.remove('current'));
  drawOrbits();
}

function pulse(trackIndex, step) {
  const button = steps[trackIndex][step];
  button.classList.add('hit');
  setTimeout(() => button.classList.remove('hit'), 230);
  pulses.push({ track: trackIndex, step, birth: performance.now() });
}

function animate(timestamp) {
  if (!playing) return;
  frame = requestAnimationFrame(animate);
  if (timestamp - lastFrame < 30) return;
  lastFrame = timestamp;
  const now = audio.currentTime;
  while (visualQueue.length && visualQueue[0].time <= now) {
    const event = visualQueue.shift();
    visualTick = event.tick;
    visualTime = event.time;
    event.events.forEach((note) => pulse(note.track, note.step));
    TRACKS.forEach((track, index) => meters[index].forEach((segment, step) => segment.classList.toggle('current', !composition.tracks[index].muted && step === visualTick % track.steps)));
  }
  drawOrbits(timestamp);
}

function drawOrbits(timestamp = performance.now()) {
  if (!size) return;
  const ctx = orbitContext;
  const center = size / 2;
  ctx.clearRect(0, 0, size, size);
  const glow = ctx.createRadialGradient(center, center, 10, center, center, size * 0.46);
  glow.addColorStop(0, '#b18c5610');
  glow.addColorStop(0.35, '#a8908505');
  glow.addColorStop(1, '#10121800');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  for (let mark = 0; mark < 120; mark += 1) {
    const angle = mark / 120 * Math.PI * 2;
    const radius = size * 0.474;
    ctx.strokeStyle = mark % 10 === 0 ? '#9fa4b930' : '#9fa4b911';
    ctx.lineWidth = .6;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
    ctx.lineTo(center + Math.cos(angle) * (radius + (mark % 10 === 0 ? 5 : 2)), center + Math.sin(angle) * (radius + (mark % 10 === 0 ? 5 : 2)));
    ctx.stroke();
  }
  TRACKS.forEach((track, index) => {
    const radius = size * track.radius;
    const muted = composition.tracks[index].muted;
    const emphasis = focusedTrack === index;
    ctx.strokeStyle = `${track.color}${muted ? '0d' : emphasis ? '66' : '2b'}`;
    ctx.lineWidth = emphasis ? 1.1 : .7;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    const lit = composition.tracks[index].notes.flatMap((on, step) => on ? [step] : []);
    if (lit.length > 1 && !muted) {
      ctx.strokeStyle = `${track.color}${emphasis ? '22' : '0b'}`;
      ctx.lineWidth = .65;
      ctx.beginPath();
      lit.forEach((step, position) => {
        const angle = step / track.steps * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        if (position === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      if (lit.length > 2) ctx.closePath();
      ctx.stroke();
    }
    if (!playing || muted) return;
    const fraction = Math.max(0, Math.min(1, (audio.currentTime - visualTime) / (60 / composition.bpm / 2)));
    const angle = ((visualTick % track.steps + fraction) / track.steps) * Math.PI * 2 - Math.PI / 2;
    if (!reducedMotion.matches) {
      for (let segment = 0; segment < 18; segment += 1) {
        const end = angle - segment * .014;
        ctx.strokeStyle = `${track.color}${Math.round(100 * (1 - segment / 18)).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(center, center, radius, end - .015, end);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#fff3dd';
    ctx.shadowBlur = 12;
    ctx.shadowColor = track.color;
    ctx.beginPath();
    ctx.arc(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  for (let index = pulses.length - 1; index >= 0; index -= 1) {
    const pulse = pulses[index];
    const progress = (timestamp - pulse.birth) / 1200;
    if (progress >= 1) { pulses.splice(index, 1); continue; }
    if (reducedMotion.matches) continue;
    const track = TRACKS[pulse.track];
    const angle = pulse.step / track.steps * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = `${track.color}${Math.round((1 - progress) * 90).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = .7;
    ctx.beginPath();
    ctx.arc(center + Math.cos(angle) * size * track.radius, center + Math.sin(angle) * size * track.radius, 5 + progress * 19, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function resize() {
  const ratio = Math.min(devicePixelRatio ?? 1, 2);
  size = $('#universe').clientWidth;
  orbitCanvas.width = Math.round(size * ratio);
  orbitCanvas.height = Math.round(size * ratio);
  orbitContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = window.innerWidth;
  const height = window.innerHeight;
  skyCanvas.width = width * ratio;
  skyCanvas.height = height * ratio;
  skyContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  skyContext.clearRect(0, 0, width, height);
  let seed = 814;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let index = 0; index < Math.min(500, width * height / 3200); index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = random() > .95 ? 1 : .35 + random() * .45;
    skyContext.fillStyle = `rgba(192,199,213,${.1 + random() * .22})`;
    skyContext.beginPath();
    skyContext.arc(x, y, radius, 0, Math.PI * 2);
    skyContext.fill();
  }
  drawOrbits();
}

function undo() {
  const previous = history.pop();
  if (!previous) return;
  replaceComposition(previous);
  toast('已回到上一片星空');
}

$('#play').addEventListener('click', () => playing ? pause() : void play());
$('#sun').addEventListener('click', () => playing ? pause() : void play());
$('#randomize').addEventListener('click', () => {
  remember();
  replaceComposition(randomizeComposition(composition));
  toast('一片從未出現過的星空，送給你。');
});
$('#undo').addEventListener('click', undo);
$('#clear').addEventListener('click', () => {
  remember();
  const next = structuredClone(composition);
  next.scene = 'custom';
  next.tracks.forEach((track) => { track.notes.fill(false); });
  replaceComposition(next);
  toast('星空留白了。點擊軌道，種下第一顆星。');
});

for (const [id, property, multiplier] of [['tempo', 'bpm', 1], ['volume', 'volume', .01], ['ambience', 'ambience', .01]]) {
  const input = $(`#${id}`);
  let captured = false;
  input.addEventListener('input', () => {
    if (!captured) { remember(); captured = true; }
    composition[property] = Number(input.value) * multiplier;
    changed();
  });
  input.addEventListener('change', () => { captured = false; });
  input.addEventListener('blur', () => { captured = false; });
}
const scalePicker = $('#scale-picker');
const scaleTrigger = $('#scale');
const scaleMenu = $('#scale-menu');
const scaleOptions = Array.from(scaleMenu.querySelectorAll('[role="option"]'));

function closeScaleMenu(restoreFocus = false) {
  scaleMenu.hidden = true;
  scaleTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) scaleTrigger.focus();
}

function openScaleMenu() {
  scaleMenu.hidden = false;
  scaleTrigger.setAttribute('aria-expanded', 'true');
  scaleOptions.find((option) => option.dataset.scale === composition.scale).focus();
}

scaleTrigger.addEventListener('click', () => scaleMenu.hidden ? openScaleMenu() : closeScaleMenu());
scaleTrigger.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    openScaleMenu();
  }
});
scaleOptions.forEach((option) => option.addEventListener('click', () => {
  if (composition.scale !== option.dataset.scale) {
    remember();
    composition.scale = option.dataset.scale;
    changed();
    $('#center-subtitle').textContent = playing ? SCALES[composition.scale].description : '點亮星星，寫下旋律';
  }
  closeScaleMenu(true);
}));
scaleMenu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeScaleMenu(true);
    return;
  }
  const current = scaleOptions.indexOf(document.activeElement);
  const next = { ArrowDown: (current + 1) % scaleOptions.length, ArrowUp: (current - 1 + scaleOptions.length) % scaleOptions.length, Home: 0, End: scaleOptions.length - 1 }[event.key];
  if (next !== undefined) {
    event.preventDefault();
    scaleOptions[next].focus();
  }
});
scalePicker.addEventListener('focusout', (event) => {
  if (!scalePicker.contains(event.relatedTarget)) closeScaleMenu();
});
document.addEventListener('pointerdown', (event) => {
  if (!scalePicker.contains(event.target)) closeScaleMenu();
});

$('#save').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(composition, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orbitarium-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('星圖已交給瀏覽器下載，隨時都能再打開。');
});
$('#import').addEventListener('click', () => $('#file-input').click());
$('#file-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 20000) throw new Error('這個檔案太大了，請選擇星軌音室匯出的 JSON 作品。');
    const next = validateComposition(JSON.parse(await file.text()));
    remember();
    replaceComposition(next);
    toast('歡迎回來。你的宇宙已經就位。');
  } catch (error) {
    toast(error instanceof SyntaxError ? '讀不到星圖，請選擇有效的 JSON 作品檔。' : error.message);
  } finally {
    event.target.value = '';
  }
});

const dialog = $('#help-dialog');
$('#help').addEventListener('click', () => dialog.showModal());
$('#close-help').addEventListener('click', () => dialog.close());
$('#start-exploring').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });

document.addEventListener('keydown', (event) => {
  if (dialog.open || event.target.closest('input, select, textarea, [role="combobox"], [role="listbox"]') || event.altKey || event.repeat) return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
  if (event.metaKey || event.ctrlKey) return;
  if (event.code === 'Space' && !event.target.closest('button, a')) { event.preventDefault(); playing ? pause() : void play(); }
  if (event.key.toLowerCase() === 'r') $('#randomize').click();
  if (/^[1-4]$/.test(event.key)) toggleTrack(Number(event.key) - 1);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) { pause(); toast('先替宇宙按下暫停，回來再繼續。'); }
});
window.addEventListener('pagehide', pause);

buildScenes();
buildTracks();
new ResizeObserver(resize).observe($('#universe'));
window.addEventListener('resize', resize);
resize();
syncUI();
if (restored) $('#save-status').textContent = '已找回你上次留下的星空';
if (!persistenceAvailable) $('#save-status').textContent = '無法讀取自動保存，請用「收藏星圖」下載作品';
