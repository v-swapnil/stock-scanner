import { format, startOfToday, startOfYesterday } from "date-fns";

async function handler() {
  const currentDate = format(startOfToday(), "ddMMyyyy");
  const previousDate = format(startOfYesterday(), "ddMMyyyy");

  const dailyVolatilityCSV = "FOVOLT_" + previousDate + ".csv";
  const securityInBanCSV = "fo_secban_" + currentDate + ".csv";

  return {
    currentDate,
    previousDate,
  };
}

export async function GET() {
  try {
    const result = await handler();
    return Response.json(result);
  } catch (err) {
    return Response.json({});
  }
}
