"use client";

import { useMemo, useState } from "react";
import { Button, Card, Flex, NumberInput, Select, SelectItem, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";

export type Leg = {
  id: string;
  side: "buy" | "sell";
  type: "call" | "put";
  strike: number;
  price: number;
  qty: number;
};

function payoffAtSpot(legs: Leg[], spot: number) {
  return legs.reduce((pnl, leg) => {
    const intrinsic = leg.type === "call" ? Math.max(0, spot - leg.strike) : Math.max(0, leg.strike - spot);
    const legPnl = (leg.side === "buy" ? 1 : -1) * (intrinsic - leg.price) * leg.qty;
    return pnl + legPnl;
  }, 0);
}

function range(from: number, to: number, steps: number) {
  const res: number[] = [];
  const step = (to - from) / steps;
  for (let i = 0; i <= steps; i++) res.push(Number((from + i * step).toFixed(2)));
  return res;
}

export default function StrategyBuilder() {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [spot, setSpot] = useState(20000);
  const [width, setWidth] = useState(2000);
  const [steps, setSteps] = useState(40);

  const addLeg = () => {
    setLegs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        side: "buy",
        type: "call",
        strike: spot,
        price: 100,
        qty: 1,
      },
    ]);
  };

  const updateLeg = (id: string, updates: Partial<Leg>) => {
    setLegs((prev) => prev.map((leg) => (leg.id === id ? { ...leg, ...updates } : leg)));
  };

  const removeLeg = (id: string) => setLegs((prev) => prev.filter((leg) => leg.id !== id));

  const grid = useMemo(() => {
    const spots = range(spot - width, spot + width, steps);
    return spots.map((s) => ({ spot: s, pnl: payoffAtSpot(legs, s) }));
  }, [legs, spot, width, steps]);

  return (
    <Card className="mt-6 space-y-4">
      <Flex justifyContent="between" alignItems="center">
        <Title>Strategy Builder</Title>
        <Button size="sm" onClick={addLeg}>
          Add Leg
        </Button>
      </Flex>

      <Flex className="gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <Text>Spot</Text>
          <NumberInput value={spot} onValueChange={(v) => setSpot(Number(v))} />
        </div>
        <div className="flex flex-col gap-2">
          <Text>Width</Text>
          <NumberInput value={width} onValueChange={(v) => setWidth(Number(v))} />
        </div>
        <div className="flex flex-col gap-2">
          <Text>Steps</Text>
          <NumberInput value={steps} onValueChange={(v) => setSteps(Number(v))} />
        </div>
      </Flex>

      <div className="overflow-auto border border-gray-800 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Side</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Strike</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Qty</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {legs.map((leg) => (
              <TableRow key={leg.id}>
                <TableCell>
                  <Select value={leg.side} onValueChange={(v) => updateLeg(leg.id, { side: v as Leg["side"] })}>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={leg.type} onValueChange={(v) => updateLeg(leg.id, { type: v as Leg["type"] })}>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="put">Put</SelectItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <NumberInput value={leg.strike} onValueChange={(v) => updateLeg(leg.id, { strike: Number(v) })} />
                </TableCell>
                <TableCell>
                  <NumberInput value={leg.price} onValueChange={(v) => updateLeg(leg.id, { price: Number(v) })} />
                </TableCell>
                <TableCell>
                  <NumberInput value={leg.qty} onValueChange={(v) => updateLeg(leg.id, { qty: Number(v) })} />
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="light" onClick={() => removeLeg(leg.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card className="p-4 bg-gray-900 border border-gray-800">
        <Text>Payoff (spot vs P/L)</Text>
        <div className="mt-2 grid grid-cols-4 gap-2 max-h-64 overflow-auto text-xs">
          {grid.map((row) => (
            <div key={row.spot} className="flex justify-between border-b border-gray-800 pb-1">
              <span>{row.spot}</span>
              <span className={row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{row.pnl.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </Card>
  );
}
