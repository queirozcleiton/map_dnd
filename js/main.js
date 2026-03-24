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

  let npcData = {};

  // 🔹 Carregar NPCs primeiro
  fetch('data/npcs.json')
    .then(res => res.json())
    .then(npcs => {
      npcData = npcs;

      // 🔹 Depois carregar localidades
      return fetch(config.data);
    })
    .then(res => res.json())
    .then(data => {

      data.forEach(loc => {
        const marker = L.marker([loc.y, loc.x]).addTo(map);

        // 🧱 Montagem do popup
        let popup = `<b>${loc.name}</b>`;

        // 📷 Imagem
        if (loc.image) {
          popup += `<br><img src="${loc.image}" style="width:200px; margin:5px 0;">`;
        }

        // 📄 Descrição
        if (loc.description) {
          popup += `<br>${loc.description}`;
        }

        // 🧠 NPCs
        if (loc.npcs && loc.npcs.length > 0) {
          popup += `<br><br><b>NPCs Notáveis:</b><ul>`;

          loc.npcs.forEach(npc => {
            const info = npcData[npc.id];

            popup += `<li title="${info?.description || ""}">
              ${npc.name}
            </li>`;
          });

          popup += `</ul>`;
        }

        // 📝 Notas
        if (loc.notes) {
          popup += `<br><br><i>${loc.notes}</i>`;
        }

        // 🔗 Link
        if (loc.link) {
          popup += `<br><br><a href="${loc.link}">Abrir mapa</a>`;
        }

        marker.bindPopup(popup);

        // 🏷️ Label
        marker.bindTooltip(loc.name, {
          permanent: true,
          direction: "top",
          offset: [0, -10],
          className: "map-label"
        });
      });

      // 🔄 Atualizar labels após criar markers
      updateLabels();
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  // 🧪 Debug coordenadas
  map.on('click', function(e) {
    console.log(
      "X:", Math.round(e.latlng.lng),
      "Y:", Math.round(e.latlng.lat)
    );
  });

  // 🎚️ Controle de labels por zoom
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
}
