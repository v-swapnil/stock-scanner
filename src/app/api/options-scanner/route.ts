import { getPayloadForOptionsRequest } from "@/lib/data-format";

async function handler() {
  const dataUrl = "https://scanner.tradingview.com/options/scan2";
  const dataPayload = getPayloadForOptionsRequest();

  return null;
}

export async function GET() {
  try {
    const result = await handler();
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ type: "error", message: err.message });
  }
}
