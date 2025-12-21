import { getPayloadForOptionsRequest } from "./data-format";

export type OptionSide = "call" | "put";

export type OptionQuote = {
  side: OptionSide;
  strike: number;
  expiration: string; // YYYY-MM-DD
  bid: number | null;
  ask: number | null;
  mid: number | null;
  last: number | null;
  iv: number | null; // percent
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  theoPrice: number | null;
  spread: number | null;
  oi: number | null;
  volume: number | null;
  name: string;
};

export type OptionStrikeRow = {
  strike: number;
  expiration: string;
  call?: OptionQuote;
  put?: OptionQuote;
};

export type OptionChain = {
  symbol: string;
  expiry: string;
  strikes: OptionStrikeRow[];
  expiries: string[];
};

function normalizeDate(expiryId: number) {
  const s = expiryId.toString();
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return iso;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeOptionsScanResponse(
  symbol: string,
  payload: any,
  preferredExpiry?: string,
): OptionChain {
  const fields: string[] = payload?.fields || [];
  const symbols: Array<{ f: any[]; s: string }> = payload?.symbols || [];

  const rows = symbols.map((item) => {
    const data: Record<string, any> = {};
    fields.forEach((key, idx) => {
      data[key] = item.f[idx];
    });

    const expiryRaw = data.expiration as number;
    const expiry = normalizeDate(expiryRaw);
    const side = data["option-type"] as OptionSide;
    const strike = toNumber(data.strike) || 0;
    const bid = toNumber(data.bid);
    const ask = toNumber(data.ask);
    const mid = bid !== null && ask !== null ? (bid + ask) / 2 : null;
    const last = toNumber(data.last_price);
    const oi = toNumber(data.open_interest);
    const volume = toNumber(data.volume);

    const quote: OptionQuote = {
      side,
      strike,
      expiration: expiry,
      bid,
      ask,
      mid,
      last,
      iv: toNumber(data.iv) !== null ? toNumber(data.iv)! * 100 : null,
      delta: toNumber(data.delta),
      gamma: toNumber(data.gamma),
      theta: toNumber(data.theta),
      vega: toNumber(data.vega),
      rho: toNumber(data.rho),
      theoPrice: toNumber(data.theoPrice),
      spread:
        bid !== null && ask !== null ? Number((ask - bid).toFixed(2)) : null,
      oi,
      volume,
      name: data.name,
    };

    return { expiry, strike, side, quote };
  });

  const byExpiry: Record<string, Record<number, OptionStrikeRow>> = {};

  rows.forEach(({ expiry, strike, side, quote }) => {
    if (!byExpiry[expiry]) byExpiry[expiry] = {};
    if (!byExpiry[expiry][strike]) {
      byExpiry[expiry][strike] = { strike, expiration: expiry };
    }
    byExpiry[expiry][strike][side] = quote;
  });

  const expiries = Object.keys(byExpiry).sort();
  const chosenExpiry = preferredExpiry && expiries.includes(preferredExpiry)
    ? preferredExpiry
    : expiries[0];
  const strikes = chosenExpiry
    ? Object.values(byExpiry[chosenExpiry]).sort((a, b) => a.strike - b.strike)
    : [];

  return {
    symbol,
    expiry: chosenExpiry,
    strikes,
    expiries,
  };
}

export async function fetchOptionChain(symbol: string, expiry?: string) {
  const payload = getPayloadForOptionsRequest(symbol);
  const response = await fetch("https://scanner.tradingview.com/options/scan2", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Options scan failed: ${response.status}`);
  }

  const json = await response.json();
  return normalizeOptionsScanResponse(symbol, json, expiry);
}

export function summarizeChain(chain: OptionChain) {
  if (!chain.strikes.length) {
    return {
      atmStrike: null,
      avgSpread: null,
      ivStats: null,
      pcr: null,
      callIvAvg: null,
      putIvAvg: null,
      ivSkew: null,
      impliedMovePct: null,
      callOi: null,
      putOi: null,
    };
  }
  const strikes = chain.strikes.map((s) => s.strike);
  const atmIdx = Math.floor(strikes.length / 2);
  const atmStrike = strikes[atmIdx] || null;

  const spreads: number[] = [];
  const ivs: number[] = [];
  let callOi = 0;
  let putOi = 0;
  const callIvs: number[] = [];
  const putIvs: number[] = [];
  chain.strikes.forEach((row) => {
    [row.call, row.put].forEach((q) => {
      if (!q) return;
      if (q.spread !== null) spreads.push(q.spread);
      if (q.iv !== null) ivs.push(q.iv);
      if (q.oi) {
        if (q.side === "call") callOi += q.oi;
        if (q.side === "put") putOi += q.oi;
      }
      if (q.iv !== null) {
        if (q.side === "call") callIvs.push(q.iv);
        if (q.side === "put") putIvs.push(q.iv);
      }
    });
  });

  const atmRow = chain.strikes[atmIdx];
  const callMid = atmRow?.call?.mid ?? null;
  const putMid = atmRow?.put?.mid ?? null;
  const impliedMovePct =
    atmStrike && callMid !== null && putMid !== null
      ? Number((((callMid + putMid) / atmStrike) * 100).toFixed(2))
      : null;

  const avg = (arr: number[]) =>
    arr.length ? Number((arr.reduce((a, v) => a + v, 0) / arr.length).toFixed(2)) : null;

  const ivStats = ivs.length
    ? { avg: avg(ivs), min: Math.min(...ivs), max: Math.max(...ivs) }
    : null;

  const callIvAvg = avg(callIvs);
  const putIvAvg = avg(putIvs);

  return {
    atmStrike,
    avgSpread: avg(spreads),
    ivStats,
    pcr: callOi === 0 ? null : Number((putOi / callOi).toFixed(2)),
    callIvAvg,
    putIvAvg,
    ivSkew:
      callIvAvg !== null && putIvAvg !== null
        ? Number((callIvAvg - putIvAvg).toFixed(2))
        : null,
    impliedMovePct,
    callOi: callOi || null,
    putOi: putOi || null,
  };
}