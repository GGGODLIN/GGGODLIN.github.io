import { convert, currencyName, evaluate, fetchRates, formatAmount, isStale } from './currency.js';

const RATES_KEY = 'currency-converter:rates';
const PREFS_KEY = 'currency-converter:prefs';
const DEFAULT_PREFS = { codes: ['TWD', 'USD', 'JPY', 'EUR', 'CNY'], activeCode: 'TWD', activeText: '100', amount: 100 };
const CHECK_INTERVAL = 10 * 60 * 1000;
const SOURCES = {
  'exchangerate-api': { text: 'Rates By Exchange Rate API', href: 'https://www.exchangerate-api.com' },
  fawazahmed0: { text: 'Rates by fawazahmed0/exchange-api', href: 'https://github.com/fawazahmed0/exchange-api' },
};

const rowsEl = document.querySelector('#rows');
const statusEl = document.querySelector('#status');
const sourceEl = document.querySelector('#source');
const refreshBtn = document.querySelector('#refresh');
const addForm = document.querySelector('#add-form');
const addSelect = document.querySelector('#add-select');
const dateFmt = new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const storedPrefs = load(PREFS_KEY);
const prefs = Array.isArray(storedPrefs?.codes) && storedPrefs.codes.length > 0
  ? { ...DEFAULT_PREFS, ...storedPrefs }
  : { ...DEFAULT_PREFS };
let snapshot = load(RATES_KEY);
let fetchError = null;
let loading = false;

function rowElement(code) {
  const li = document.createElement('li');
  li.className = 'row';
  li.dataset.code = code;

  const label = document.createElement('label');
  label.htmlFor = `amount-${code}`;
  const codeEl = document.createElement('span');
  codeEl.className = 'code';
  codeEl.textContent = code;
  const nameEl = document.createElement('span');
  nameEl.className = 'name';
  nameEl.textContent = currencyName(code);
  label.append(codeEl, nameEl);

  const input = document.createElement('input');
  input.id = `amount-${code}`;
  input.type = 'text';
  input.inputMode = 'decimal';
  input.autocomplete = 'off';
  input.enterKeyHint = 'done';
  input.spellcheck = false;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove';
  remove.textContent = '×';
  remove.setAttribute('aria-label', `移除 ${currencyName(code)}`);
  remove.hidden = prefs.codes.length === 1;

  li.append(label, input, remove);
  return li;
}

function renderRows() {
  rowsEl.replaceChildren(...prefs.codes.map(rowElement));
  updateValues();
  renderAddOptions();
}

function updateValues() {
  const rates = snapshot?.rates ?? {};
  for (const input of rowsEl.querySelectorAll('input')) {
    const code = input.closest('.row').dataset.code;
    if (code === prefs.activeCode) {
      if (document.activeElement !== input) input.value = prefs.activeText;
      continue;
    }
    const value = convert(prefs.amount, prefs.activeCode, code, rates);
    input.value = value === null ? '' : formatAmount(value, code);
    input.placeholder = value === null ? '無匯率' : '';
  }
}

function renderAddOptions() {
  const options = Object.keys(snapshot?.rates ?? {})
    .filter((code) => !prefs.codes.includes(code))
    .sort()
    .map((code) => {
      const name = currencyName(code);
      return new Option(name === code ? code : `${code} ${name}`, code);
    });
  addSelect.replaceChildren(...options);
  addForm.hidden = options.length === 0;
}

function renderStatus() {
  refreshBtn.disabled = loading;
  statusEl.classList.toggle('warn', Boolean(fetchError));
  if (!snapshot) {
    statusEl.textContent = loading ? '正在抓取匯率…' : `抓不到匯率：${fetchError}`;
    sourceEl.replaceChildren();
    return;
  }
  const parts = [`匯率資料時間 ${dateFmt.format(snapshot.updatedAt)}`, `最後檢查 ${dateFmt.format(snapshot.fetchedAt)}`];
  if (loading) parts.push('更新中…');
  if (fetchError) parts.push('連不上匯率來源，先用上次存下的匯率');
  statusEl.textContent = parts.join(' · ');

  const source = SOURCES[snapshot.source];
  if (source) {
    const a = document.createElement('a');
    a.href = source.href;
    a.textContent = source.text;
    a.target = '_blank';
    a.rel = 'noopener';
    sourceEl.replaceChildren(a);
  }
}

async function refresh({ force = false } = {}) {
  if (loading || (!force && !isStale(snapshot, Date.now()))) return;
  loading = true;
  renderStatus();
  try {
    snapshot = await fetchRates();
    fetchError = null;
    save(RATES_KEY, snapshot);
  } catch (err) {
    fetchError = err.message;
  } finally {
    loading = false;
  }
  updateValues();
  renderAddOptions();
  renderStatus();
}

rowsEl.addEventListener('input', (e) => {
  const input = e.target;
  prefs.activeCode = input.closest('.row').dataset.code;
  prefs.activeText = input.value;
  const value = evaluate(input.value);
  const empty = input.value.trim() === '';
  input.setAttribute('aria-invalid', String(value === null && !empty));
  // 打到一半的算式（例如 "100+"）算不出來，保留上一個有效金額，其他欄位才不會閃成空白；
  // 這個金額也要存檔，否則停在半截算式時重新整理，其他欄位會全變 0
  if (value !== null) prefs.amount = value;
  else if (empty) prefs.amount = 0;
  save(PREFS_KEY, prefs);
  updateValues();
});

rowsEl.addEventListener('focusin', (e) => {
  if (e.target.matches('input')) e.target.select();
});

rowsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.remove');
  if (!btn) return;
  const code = btn.closest('.row').dataset.code;
  prefs.codes = prefs.codes.filter((c) => c !== code);
  if (prefs.activeCode === code) {
    const next = prefs.codes[0];
    const value = convert(prefs.amount, code, next, snapshot?.rates);
    prefs.activeText = value === null ? '' : formatAmount(value, next);
    prefs.activeCode = next;
    prefs.amount = evaluate(prefs.activeText) ?? 0;
  }
  save(PREFS_KEY, prefs);
  renderRows();
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = addSelect.value;
  if (!code || prefs.codes.includes(code)) return;
  prefs.codes = [...prefs.codes, code];
  save(PREFS_KEY, prefs);
  renderRows();
});

refreshBtn.addEventListener('click', () => refresh({ force: true }));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refresh();
});
setInterval(() => refresh(), CHECK_INTERVAL);

renderRows();
renderStatus();
refresh();
