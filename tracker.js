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
        fetchCelestialData(34.0522, -118.2437); // Los Angeles fallback
      } else {
        fetchCelestialData(lat, lon);
      }
    })
    .catch(err => {
      console.warn("IP geolocation error — using fallback:", err);
      fetchCelestialData(34.0522, -118.2437);
    });
}

function fetchCelestialData(latitude, longitude) {
  console.log("Sending coords to Netlify:", latitude, longitude);

  fetch("/.netlify/functions/celestial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.astronomy) {
        throw new Error("Invalid response from Celestial API");
      }
      renderAstronomy(data.astronomy);
      renderConstellations(data.constellations || []);
      renderCelestialEvents(data.celestial_events || []);
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      eventList.innerHTML = `<p>Error loading celestial data.</p>`;
    });
}

function renderAstronomy(astro) {
  const el = document.createElement("div");
  el.className = "astro-event";
  el.innerHTML = `
    <h3>🌙 Moon Phase: ${astro.moon_phase_label} (${Math.round(astro.moon_phase_value * 100)}%)</h3>
    <p>Sunrise: ${astro.sunrise}</p>
    <p>Sunset: ${astro.sunset}</p>
    <p>Moonrise: ${astro.moonrise}</p>
    <p>Moonset: ${astro.moonset}</p>
    <p>Moon Altitude: ${astro.moon_altitude}&deg;</p>
    <p>Moon Illumination: ${astro.moon_illumination}%</p>
  `;
  eventList.appendChild(el);
}

function renderConstellations(constellations) {
  if (constellations.length === 0) return;

  const wrapper = document.createElement("div");
  wrapper.className = "astro-event";
  wrapper.innerHTML = `<h3>✨ Visible Constellations</h3>`;
  constellations.forEach(c => {
    const item = document.createElement("p");
    item.textContent = c.name;
    wrapper.appendChild(item);
  });
  eventList.appendChild(wrapper);
}

function renderCelestialEvents(events) {
  if (events.length === 0) return;

  const wrapper = document.createElement("div");
  wrapper.className = "astro-event";
  wrapper.innerHTML = `<h3>🚀 Upcoming Celestial Events</h3>`;
  events.forEach(e => {
    const item = document.createElement("p");
    item.innerHTML = `<strong>${e.date}</strong>: ${e.title} — ${e.description}`;
    wrapper.appendChild(item);
  });
  eventList.appendChild(wrapper);
}

fetchLocationAndData();
