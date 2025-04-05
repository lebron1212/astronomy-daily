const eventList = document.getElementById("event-list");

function fetchLocationAndData() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(loc => {
      const lat = parseFloat(loc.latitude);
      const lon = parseFloat(loc.longitude);

      console.log("Location from IP:", lat, lon);

      if (!lat || !lon) {
        console.warn("Invalid IP location — falling back to LA");
        fetchAstronomyData(34.0522, -118.2437); // Los Angeles fallback
      } else {
        fetchAstronomyData(lat, lon);
      }
    })
    .catch(err => {
      console.warn("IP geolocation error — using fallback:", err);
      fetchAstronomyData(34.0522, -118.2437); // Fallback: Los Angeles
    });
}

function fetchAstronomyData(latitude, longitude) {
  console.log("Sending coords to Netlify:", latitude, longitude);

  fetch("/.netlify/functions/astro", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.data || !data.data.table) {
        throw new Error("Invalid response from AstronomyAPI");
      }
      renderCelestialEvents(data.data.table.rows);
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      eventList.innerHTML = `<p>Error loading celestial data.</p>`;
    });
}

function renderCelestialEvents(bodies) {
  eventList.innerHTML = "";
  bodies.forEach(row => {
    const name = row.entry.name;
    const rise = row.entry.rise?.time || "N/A";
    const set = row.entry.set?.time || "N/A";

    const el = document.createElement("div");
    el.className = "astro-event";
    el.innerHTML = `
      <h3>${name}</h3>
      <p>Rise: ${rise}</p>
      <p>Set: ${set}</p>
    `;
    eventList.appendChild(el);
  });
}

fetchLocationAndData();
