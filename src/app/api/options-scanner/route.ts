import { getPayloadForOptionsRequest } from "@/lib/data-format";

async function handler() {
  const symbol = "NIFTY";
  const dataUrl = "https://scanner.tradingview.com/options/scan2";
  const dataPayload = getPayloadForOptionsRequest(symbol);
  const response = await fetch(dataUrl, {
    method: "POST",
    body: JSON.stringify(dataPayload),
  });
  const responseJson = await response.json();
  return responseJson;
}

export async function GET() {
  try {
    const result = await handler();
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ type: "error", message: err.message });
  }
}
