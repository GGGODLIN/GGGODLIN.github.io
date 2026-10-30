const PRIMARY_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
  'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json',
];
const HOUR = 60 * 60 * 1000;
const FETCH_TIMEOUT = 8000;

export function evaluate(input) {
  const src = String(input).replace(/[,\s]/g, '').replace(/×/g, '*').replace(/÷/g, '/');
  if (src === '') return null;
  let pos = 0;

  function factor() {
    const ch = src[pos];
    if (ch === '+' || ch === '-') {
      pos++;
      const v = factor();
      return ch === '-' ? -v : v;
    }
    if (ch === '(') {
      pos++;
      const v = expr();
      if (src[pos] !== ')') throw new SyntaxError('missing )');
      pos++;
      return v;
    }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(pos));
    if (!m) throw new SyntaxError('expected number');
    pos += m[0].length;
    return Number(m[0]);
  }

  function term() {
    let v = factor();
    while (src[pos] === '*' || src[pos] === '/') {
      const op = src[pos++];
      const r = factor();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }

  function expr() {
    let v = term();
    while (src[pos] === '+' || src[pos] === '-') {
      const op = src[pos++];
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  try {
    const v = expr();
    return pos === src.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function convert(amount, from, to, rates) {
  if (!rates?.[from] || !rates?.[to]) return null;
  return (amount / rates[from]) * rates[to];
}

function currencyDigits(code) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits;
  } catch {
    // 備援來源含 1INCH 這類非三碼代號，Intl 會丟 RangeError
    return 2;
  }
}

export function formatAmount(value, code, locale = 'zh-TW') {
  // 小於 1 的金額照幣別小數位會被捨成 0（例如 1 日圓換美元），改看有效位數
  const opts = Math.abs(value) >= 1 || value === 0
    ? { maximumFractionDigits: currencyDigits(code) }
    : { maximumSignificantDigits: 4 };
  return new Intl.NumberFormat(locale, opts).format(value);
}

export function currencyName(code, locale = 'zh-TW') {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency', fallback: 'code' }).of(code);
  } catch {
    return code;
  }
}

export function normalizeErApi(json, fetchedAt) {
  if (json?.result !== 'success' || !json.rates) throw new Error('exchangerate-api 回應格式不符');
  return {
    base: json.base_code,
    rates: json.rates,
    updatedAt: json.time_last_update_unix * 1000,
    // 官方要求至多每小時抓一次，否則會被 429 擋 20 分鐘
    nextUpdateAt: Math.max(json.time_next_update_unix * 1000, fetchedAt + HOUR),
    fetchedAt,
    source: 'exchangerate-api',
  };
}

export function normalizeFawaz(json, fetchedAt) {
  if (!json?.usd || !json.date) throw new Error('fawazahmed0 回應格式不符');
  const rates = Object.fromEntries(
    Object.entries(json.usd)
      .filter(([, v]) => Number.isFinite(v) && v > 0)
      .map(([k, v]) => [k.toUpperCase(), v]),
  );
  return {
    base: 'USD',
    rates,
    updatedAt: Date.parse(`${json.date}T00:00:00Z`),
    // 備援來源沒給下次更新時間；一小時後再試主來源
    nextUpdateAt: fetchedAt + HOUR,
    fetchedAt,
    source: 'fawazahmed0',
  };
}

export function isStale(snapshot, now) {
  if (!Number.isFinite(snapshot?.nextUpdateAt) || !snapshot.rates) return true;
  return now >= snapshot.nextUpdateAt;
}

async function getJson(fetchImpl, url) {
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRates({ fetchImpl = fetch, now = Date.now } = {}) {
  const sources = [
    [PRIMARY_URL, normalizeErApi],
    ...FALLBACK_URLS.map((url) => [url, normalizeFawaz]),
  ];
  const errors = [];
  for (const [url, normalize] of sources) {
    try {
      return normalize(await getJson(fetchImpl, url), now());
    } catch (err) {
      errors.push(`${new URL(url).host}: ${err.message}`);
    }
  }
  throw new Error(errors.join('；'));
}
