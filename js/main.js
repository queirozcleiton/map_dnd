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

  // 🎯 CONFIGURAÇÃO DE FILTROS
  const filters = {
    types: new Set(["cidade", "forte", "dungeon"]),
    campaign: "avernus"
  };

  // 🎨 Cor por tipo
  function getColorByType(type) {
    switch (type) {
      case "cidade": return "blue";
      case "forte": return "red";
      case "dungeon": return "purple";
      default: return "gray";
    }
  }

  // 🧠 Regra de visibilidade
  function shouldShow(loc) {
    if (!filters.types.has(loc.type)) return false;

    const status = loc.campaign?.[filters.campaign];

    return status !== undefined;
  }

  // 🔹 Carregar NPCs primeiro
  fetch('data/npcs.json')
    .then(res => res.json())
    .then(npcs => {
      npcData = npcs;
      return fetch(config.data);
    })
    .then(res => res.json())
    .then(data => {

      data.forEach(loc => {

        if (!shouldShow(loc)) return;

        const color = getColorByType(loc.type);

        const marker = L.circleMarker([loc.y, loc.x], {
          radius: 6,
          color: color,
          fillColor: color,
          fillOpacity: 0.8
        }).addTo(map);

        // 🧱 Popup
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

        // 📝 Notas (como link)
        if (loc.notes) {
          popup += `<br><br><a href="${loc.notes}" target="_blank">Ver anotações</a>`;
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

      updateLabels();
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  // 🧪 Debug coordenadas
  map.on('click', function (e) {
    console.log(
      "X:", Math.round(e.latlng.lng),
      "Y:", Math.round(e.latlng.lat)
    );
  });

  // 🎚️ Controle de labels por zoom
  function updateLabels() {
    const zoom = map.getZoom();

    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker && layer.getTooltip()) {
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