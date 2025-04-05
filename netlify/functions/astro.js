export async function handler(event) {
  const body = JSON.parse(event.body || '{}');
  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  console.log("NETLIFY FUNC → lat:", latitude, "lon:", longitude);

  if (!latitude || !longitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid lat/lon" }),
    };
  }

  const creds = Buffer.from(
    process.env.ASTRO_USER + ":" + process.env.ASTRO_KEY
  ).toString("base64");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + creds,
  };

  const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${latitude}&longitude=${longitude}&from_date=today&to_date=today&elevation=0`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    console.error("AstronomyAPI failed:", await response.text());
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: "Failed to fetch data from AstronomyAPI" }),
    };
  }

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
