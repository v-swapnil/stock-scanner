import { fetchOptionChain, summarizeChain } from "@/lib/options";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") || "NIFTY";
  const expiry = url.searchParams.get("expiry") || undefined;

  try {
    const chain = await fetchOptionChain(symbol, expiry);
    const summary = summarizeChain(chain);
    return Response.json({ chain, summary }, { status: 200 });
  } catch (err: any) {
    return Response.json({ type: "error", message: err?.message || "Failed" }, { status: 502 });
  }
}
