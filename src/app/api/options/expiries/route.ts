import { fetchOptionChain } from "@/lib/options";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") || "NIFTY";

  try {
    const chain = await fetchOptionChain(symbol);
    return Response.json({ symbol, expiries: chain.expiries }, { status: 200 });
  } catch (err: any) {
    return Response.json({ type: "error", message: err?.message || "Failed" }, { status: 502 });
  }
}
