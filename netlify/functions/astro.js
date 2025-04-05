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

  // Format current UTC date and time
  const now = new Date();
  const yyyy_mm_dd = now.toISOString().split("T")[0];
  const hh_mm = now.toISOString().split("T")[1].slice(0, 5); // "HH:MM"

  const creds = Buffer.from(`${process.env.ASTRO_USER}:${process.env.ASTRO_KEY}`).toString("base64");

  const headers = {
  "Content-Type": "application/json",
  "Authorization": `Basic ${creds}`,
};

  const url = "https://api.astronomyapi.com/api/v2/bodies/positions";

  const requestBody = {
    latitude,
    longitude,
    elevation: 1,
    from_date: yyyy_mm_dd,
    to_date: yyyy_mm_dd,
    time: hh_mm,
  };

  console.log("Request body:", JSON.stringify(requestBody));

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AstronomyAPI failed:", errorText);
    return {
      statusCode: response.status,
      body: errorText,
    };
  }

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
