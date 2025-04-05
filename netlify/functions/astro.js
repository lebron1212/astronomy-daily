export async function handler(event) {
  const body = JSON.parse(event.body || '{}');
  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  console.log("📍 Location:", latitude, longitude);

  if (!latitude || !longitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat/lon" }),
    };
  }

  const now = new Date();
  const yyyy_mm_dd = now.toISOString().split("T")[0];
  const hh_mm = now.toISOString().split("T")[1].slice(0, 5);

  const headers = {
    "Content-Type": "application/json",
    "Auth-Token": process.env.ASTRO_AUTH_TOKEN, // ✅ THIS is the fix
  };

  const url = "https://api.astronomyapi.com/api/v2/bodies/positions";

  const bodyData = {
    latitude,
    longitude,
    elevation: 1,
    from_date: yyyy_mm_dd,
    to_date: yyyy_mm_dd,
    time: hh_mm,
  };

  console.log("🚀 Sending request to AstronomyAPI:", bodyData);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error from AstronomyAPI:", errorText);
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
