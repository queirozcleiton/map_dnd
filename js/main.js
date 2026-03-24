function initMap(config) {
  const map = L.map(config.divId, {
    crs: L.CRS.Simple,
    minZoom: -2
  });

  const bounds = [[0, 0], [config.height, config.width]];

  L.imageOverlay(config.image, bounds).addTo(map);
  map.fitBounds(bounds);

  map.setMaxBounds(bounds);
  map.setMaxZoom(1);

  // Carregar dados
  fetch(config.data)
    .then(res => res.json())
    .then(data => {
      data.forEach(loc => {
        const marker = L.marker([loc.y, loc.x]).addTo(map);

        let popup = `<b>${loc.name}</b><br>${loc.description || ""}`;

        if (loc.link) {
          popup += `<br><br><a href="${loc.link}">Abrir mapa</a>`;
        }

        marker.bindPopup(popup);

        // 👇 NOVO: label
        marker.bindTooltip(loc.name, {
          permanent: true,
          direction: "top",
          offset: [0, -10],
          className: "map-label"
        });
      });
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  // Debug de coordenadas
  map.on('click', function(e) {
    console.log(
      "X:", Math.round(e.latlng.lng),
      "Y:", Math.round(e.latlng.lat)
    );
  });
}

function updateLabels() {
  const zoom = map.getZoom();

  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer.getTooltip()) {
      if (zoom >= -1) {
        layer.openTooltip();
      } else {
        layer.closeTooltip();
      }
    }
  });
}

map.on("zoomend", updateLabels);
updateLabels();
