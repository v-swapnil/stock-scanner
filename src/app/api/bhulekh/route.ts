export async function GET(request: Request) {
  try {
    const villageId =
      new URL(request.url).searchParams.get("village_id") || "0709165100";
    const res = await fetch(
      "https://bhulekh.mahabhumi.gov.in/Amravati/Home.aspx/getOWNER",
      {
        method: "POST",
        body: JSON.stringify({
          ptxt: "surve",
          vid: villageId,
          opt: "prln",
          did: "7",
          tid: "0709",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
      }
    );
    const resJson = await res.text();
    console.log(resJson);
    return Response.json(resJson);
  } catch (err) {
    console.log(err);
    return Response.json('');
  }
}
