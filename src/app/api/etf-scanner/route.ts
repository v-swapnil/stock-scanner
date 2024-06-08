import {
  getPayloadForETFRequest,
  getFormattedETFDataItems,
} from "@/lib/data-format";

async function handler(request: Request) {
  const dataUrl = "https://scanner.tradingview.com/india/scan";
  const dataPayload = getPayloadForETFRequest();
  const response = await fetch(dataUrl, {
    cache: "no-store",
    method: "POST",
    body: JSON.stringify(dataPayload),
  });
  const responseJson = await response.json();
  const dataItems = responseJson.data;
  const formattedDataItems = getFormattedETFDataItems(dataItems);
  return formattedDataItems;
}

export async function GET(request: Request) {
  try {
    const result = await handler(request);
    return Response.json(result);
  } catch (err) {
    return Response.json({});
  }
}
