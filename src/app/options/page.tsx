"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Flex, Select, SelectItem, Title, Text, NumberInput } from "@tremor/react";
import OptionChainTable from "@/components/options/OptionChainTable";
import StrategyBuilder from "@/components/options/StrategyBuilder";
import { OptionChain } from "@/lib/options";

type ChainResponse = { chain: OptionChain; summary: any };

const symbols = [
  { value: "NIFTY", label: "NIFTY" },
  { value: "NIFTYBANK", label: "BANKNIFTY" },
];

export default function OptionsPage() {
  const [symbol, setSymbol] = useState<string>(symbols[0].value);
  const [expiry, setExpiry] = useState<string>("");
  const [chain, setChain] = useState<OptionChain | null>(null);
  const [prevChain, setPrevChain] = useState<OptionChain | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleStrikes, setVisibleStrikes] = useState(50);

  const fetchChain = async (sym: string, exp?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ symbol: sym });
      if (exp) params.set("expiry", exp);
      const res = await fetch(`/api/options/chain?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load chain");
      const json: ChainResponse = await res.json();
      setPrevChain(chain);
      setChain(json.chain);
      setSummary(json.summary);
      if (!exp) setExpiry(json.chain.expiry);
    } catch (err: any) {
      setError(err?.message || "Failed to load chain");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiries = async (sym: string) => {
    const res = await fetch(`/api/options/expiries?symbol=${sym}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.expiries || [];
  };

  const [expiries, setExpiries] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      await fetchChain(symbol);
      const list = await fetchExpiries(symbol);
      setExpiries(list);
    })();
  }, [symbol]);

  useEffect(() => {
    if (expiry) fetchChain(symbol, expiry);
  }, [expiry]);

  const filteredChain = useMemo(() => {
    if (!chain) return null;
    const strikes = chain.strikes;
    if (!visibleStrikes || visibleStrikes >= strikes.length) return chain;
    const center = Math.floor(strikes.length / 2);
    const half = Math.floor(visibleStrikes / 2);
    const start = Math.max(0, center - half);
    const end = Math.min(strikes.length, center + half + 1);
    return { ...chain, strikes: strikes.slice(start, end) } as OptionChain;
  }, [chain, visibleStrikes]);

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      <Flex justifyContent="between" alignItems="center" className="flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Title>Option Chain</Title>
          <Select value={symbol} onValueChange={(v) => setSymbol(v)} enableClear={false} className="w-44">
            {symbols.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            value={expiry}
            onValueChange={(v) => setExpiry(v)}
            placeholder="Expiry"
            enableClear={false}
            className="w-52"
          >
            {expiries.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </Select>
          <div className="flex items-center gap-2">
            <Text>Visible strikes</Text>
            <NumberInput className="w-28" value={visibleStrikes} onValueChange={(v) => setVisibleStrikes(Number(v))} />
          </div>
        </div>
        <Card className="flex items-center gap-6 px-4 py-2 bg-gray-900 border border-gray-800 min-w-[320px]">
          <div>
            <div className="text-sm text-gray-400">ATM Strike</div>
            <div className="text-lg font-semibold">{summary?.atmStrike ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg Spread</div>
            <div className="text-lg font-semibold">{summary?.avgSpread ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">IV Avg</div>
            <div className="text-lg font-semibold">{summary?.ivStats?.avg ?? "-"}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">PCR</div>
            <div className="text-lg font-semibold">{summary?.pcr ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Call IV Avg</div>
            <div className="text-lg font-semibold">{summary?.callIvAvg ?? "-"}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Put IV Avg</div>
            <div className="text-lg font-semibold">{summary?.putIvAvg ?? "-"}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">IV Skew (C-P)</div>
            <div className="text-lg font-semibold">{summary?.ivSkew ?? "-"}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Implied Move</div>
            <div className="text-lg font-semibold">{summary?.impliedMovePct ? `${summary.impliedMovePct}%` : "-"}</div>
          </div>
        </Card>
      </Flex>

      {error && <Card className="border border-red-500 bg-red-950 text-red-100 p-3">{error}</Card>}
      {loading && <Card className="border border-gray-800 bg-gray-900 p-3">Loading chain…</Card>}

      {filteredChain && !loading && (
        <OptionChainTable chain={filteredChain} prevChain={prevChain} />
      )}

      <StrategyBuilder />
    </main>
  );
}
