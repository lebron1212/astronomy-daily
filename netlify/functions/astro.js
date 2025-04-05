// netlify/functions/astro.js
export async function handler(event) {
  const { latitude, longitude } = JSON.parse(event.body);

  const creds = Buffer.from(process.env.ASTRO_USER + ":" + process.env.ASTRO_KEY).toString("base64");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + creds,
  };

  const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${latitude}&longitude=${longitude}&from_date=today&to_date=today&elevation=0`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
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
