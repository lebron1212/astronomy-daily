const eventList = document.getElementById("event-list");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchAstronomyData, showError);
  } else {
    eventList.innerHTML = "<p>Geolocation not supported by this browser.</p>";
  }
}

function fetchAstronomyData(position) {
  const { latitude, longitude } = position.coords;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + btoa("APP_ID:APP_KEY") // <- Replaced by workflow only at runtime
  };

  const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${latitude}&longitude=${longitude}&from_date=today&to_date=today&elevation=0`;

  fetch(url, { headers })
    .then(response => response.json())
    .then(data => renderCelestialEvents(data.data.table.rows))
    .catch(err => {
      eventList.innerHTML = "<p>Error loading astronomy data.</p>";
      console.error(err);
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

function showError(error) {
  eventList.innerHTML = `<p>Geolocation error: ${error.message}</p>`;
}

getLocation();
