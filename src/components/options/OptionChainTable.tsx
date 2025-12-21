"use client";

import { OptionChain } from "@/lib/options";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";
import classNames from "classnames";

type Props = {
  chain: OptionChain;
  prevChain?: OptionChain | null;
};

export default function OptionChainTable({ chain, prevChain }: Props) {
  const strikes = chain.strikes;
  const atmIdx = Math.floor(strikes.length / 2);

  const prevMap = new Map<string, { callOi?: number | null; putOi?: number | null; callVol?: number | null; putVol?: number | null }>();
  if (prevChain) {
    prevChain.strikes.forEach((row) => {
      prevMap.set(`${row.expiration}-${row.strike}`, {
        callOi: row.call?.oi ?? null,
        putOi: row.put?.oi ?? null,
        callVol: row.call?.volume ?? null,
        putVol: row.put?.volume ?? null,
      });
    });
  }

  return (
    <div className="overflow-auto border border-gray-800 rounded-xl">
      <Table className="min-w-[960px]">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="text-center" colSpan={6}>
              Calls
            </TableHeaderCell>
            <TableHeaderCell className="text-center" colSpan={2}>
              Strike
            </TableHeaderCell>
            <TableHeaderCell className="text-center" colSpan={6}>
              Puts
            </TableHeaderCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell className="text-center">Bid</TableHeaderCell>
            <TableHeaderCell className="text-center">Ask</TableHeaderCell>
            <TableHeaderCell className="text-center">Spread</TableHeaderCell>
            <TableHeaderCell className="text-center">IV %</TableHeaderCell>
            <TableHeaderCell className="text-center">Delta</TableHeaderCell>
            <TableHeaderCell className="text-center">Theta</TableHeaderCell>
            <TableHeaderCell className="text-center">OI</TableHeaderCell>
            <TableHeaderCell className="text-center">Vol</TableHeaderCell>
            <TableHeaderCell className="text-center">OI Δ</TableHeaderCell>
            <TableHeaderCell className="text-center">Vol Δ</TableHeaderCell>
            <TableHeaderCell className="text-center">Strike</TableHeaderCell>
            <TableHeaderCell className="text-center">Expiry</TableHeaderCell>
            <TableHeaderCell className="text-center">Vol</TableHeaderCell>
            <TableHeaderCell className="text-center">OI</TableHeaderCell>
            <TableHeaderCell className="text-center">Theta</TableHeaderCell>
            <TableHeaderCell className="text-center">Delta</TableHeaderCell>
            <TableHeaderCell className="text-center">IV %</TableHeaderCell>
            <TableHeaderCell className="text-center">Spread</TableHeaderCell>
            <TableHeaderCell className="text-center">Ask</TableHeaderCell>
            <TableHeaderCell className="text-center">Bid</TableHeaderCell>
            <TableHeaderCell className="text-center">Vol Δ</TableHeaderCell>
            <TableHeaderCell className="text-center">OI Δ</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {strikes.map((row, idx) => {
            const prev = prevMap.get(`${row.expiration}-${row.strike}`);
            const callOiDelta = row.call?.oi != null && prev?.callOi != null ? row.call.oi - prev.callOi : null;
            const callVolDelta = row.call?.volume != null && prev?.callVol != null ? row.call.volume - prev.callVol : null;
            const putOiDelta = row.put?.oi != null && prev?.putOi != null ? row.put.oi - prev.putOi : null;
            const putVolDelta = row.put?.volume != null && prev?.putVol != null ? row.put.volume - prev.putVol : null;
            return (
            <TableRow key={`${row.expiration}-${row.strike}`}>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.bid ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.ask ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.spread ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.iv?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.delta?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.theta?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.oi ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {row.call?.volume ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {callOiDelta != null ? callOiDelta : "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx <= atmIdx,
                })}
              >
                {callVolDelta != null ? callVolDelta : "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center font-semibold", {
                  "bg-emerald-950": idx === atmIdx,
                })}
              >
                {row.strike}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-emerald-950": idx === atmIdx,
                })}
              >
                {row.expiration}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.volume ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.oi ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.theta?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.delta?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.iv?.toFixed(2) ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.spread ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.ask ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {row.put?.bid ?? "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {putVolDelta != null ? putVolDelta : "-"}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "bg-gray-900": idx >= atmIdx,
                })}
              >
                {putOiDelta != null ? putOiDelta : "-"}
              </TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
