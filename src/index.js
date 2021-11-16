import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
var syncMaps = require("@mapbox/mapbox-gl-sync-move");
import mapboxgl from "mapbox-gl";
import "./style.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import config from "./config.json";
import LZString from "lz-string";
import light from './os_open_zoomstack_-_light.json'
import night from './os_open_zoomstack_-_night.json'

mapboxgl.accessToken =
'pk.eyJ1IjoiZ2xhLWdpcyIsImEiOiJjanBvNGh1bncwOTkzNDNueWt5MGU1ZGtiIn0.XFxLdq2dXttcXSXTiREPTA'

// settings for layer and overlays
var settings = {};
if ("URLSearchParams" in window) {
  var searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("settings")) {
    settings = JSON.parse(
      LZString.decompressFromEncodedURIComponent(searchParams.get("settings"))
    );
  } else {
    settings = {
      mc: config.maps || 2,
      ch: config.crosshair || "black",
      l1: config.map_1.layer,
      o1: config.map_1.overlay || "",
      op1: config.map_1.overlay_opacity || 0.5,
      l2: config.map_2.layer,
      o2: config.map_2.overlay || "",
      op2: config.map_2.overlay_opacity || 0.5,
    };
  }
}

var currentURL;

function updateURLSearchParams() {
  var settingString = LZString.compressToEncodedURIComponent(
    JSON.stringify(settings)
  );
  if ("URLSearchParams" in window) {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set("settings", settingString);
    var locationHash = window.location.hash;
    window.history.pushState(
      "",
      "",
      "?" + searchParams.toString() + locationHash
    );
    currentURL = window.location.href;
  }
}

// default style
var default_style = {
  version: 8,
  name: "default_style",
  sources: {},
  //glyphs needed for measurement tools (map_1)
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [],
};

// add sources and layer from config
config.layer.forEach(function (item) {
  if (item.onlyOverlay != true) {
    default_style.sources[item.name] = {};
    default_style.sources[item.name].type = "raster";
    default_style.sources[item.name].attribution =
      "<b>" + item.name + "</b> &copy; " + item.attribution;
    // ToDo: Check for XYZ Tilesources in general
    if (item.url == "https://tile.openstreetmap.org/{z}/{x}/{y}.png") {
      default_style.sources[item.name].tiles = [item.url];
    } else {
      if (!item.style) {
        item.style = "";
      }
      default_style.sources[item.name].tiles = [
        item.url +
          "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&LAYERS=" +
          item.layer +
          "&STYLES=" +
          item.style +
          "&FORMAT=image/" +
          item.format,
      ];
    }
    default_style.sources[item.name].tileSize = 256;

    var lyr = {};
    lyr.id = item.name;
    lyr.type = "raster";
    lyr.source = item.name;
    lyr.layout = {
      visibility: "none",
    };
    default_style.layers.push(lyr);

  }
});

// add overlays from config on top of layers
config.layer.forEach(function (item) {
  const overlay_id = "ol_" + item.name;
  default_style.sources[overlay_id] = {};
  default_style.sources[overlay_id].type = "raster";
  default_style.sources[overlay_id].attribution =
    "<b>Overlay: " + item.name + "</b> &copy; " + item.attribution;
  // todo: check for XYZ Tilesources in general
  if (item.url == "https://tile.openstreetmap.org/{z}/{x}/{y}.png") {
    default_style.sources[overlay_id].tiles = [item.url];
  } else {
    if (!item.style) {
      item.style = "";
    }
    default_style.sources[overlay_id].tiles = [
      item.url +
        "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&LAYERS=" +
        item.layer +
        "&STYLES=" +
        item.style +
        "&FORMAT=image/" +
        item.format +
        "&TRANSPARENT=true",
    ];
  }
  default_style.sources[overlay_id].tileSize = 256;

  var olyr = {};
  olyr.id = "ol_" + item.name;
  olyr.type = "raster";
  olyr.source = "ol_" + item.name;
  olyr.layout = {
    visibility: "none",
  };
  default_style.layers.push(olyr);

});

var map_1 = new mapboxgl.Map({
  container: "map_1",
  style: light,
  zoom: config.zoom,
  center: config.center,
  pitchWithRotate: false,
  attributionControl: false,
  hash: true,
}).addControl(
  new mapboxgl.AttributionControl({
    compact: true,
  })
);

map_1.on("load", () => {
  map_1.addSource("map_1", {
    type: "geojson",
    data:
      "https://gist.githubusercontent.com/joe-liad/7fb39968587908b96f6b05f87b3250e0/raw/ff1ade351895b2d5ed39e3b3bfed26c9aa65fcfa/lewisham-wards.geojson",
  });

  map_1.addLayer({
    id: "map_1",
    type: "fill",
    paint: {
      "fill-opacity": 0,
    },
    source: "map_1",
  });
  map_1.addLayer({
    id: "map_1_line",
    type: "line",
    paint: {
      "line-color": "black",
    },
    source: "map_1",
  });

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  map_1.on("mousemove", "map_1", (e) => {
    map_1.getCanvas().style.cursor = "pointer";
    const coordinates = e.lngLat;
    const description = e.features[0].properties.name;
    popup.setLngLat(coordinates).setHTML(description).addTo(map_1);
  });
  map_1.on("mouseleave", "map_1", () => {
    map_1.getCanvas().style.cursor = "";
    popup.remove();
  });
});

var map_2 = new mapboxgl.Map({
  container: "map_2",
  // style: "mapbox://styles/mapbox/dark-v8",
  style: night,
  zoom: config.zoom,
  center: config.center,
  pitchWithRotate: false,
  attributionControl: false,
  hash: true,
}).addControl(
  new mapboxgl.AttributionControl({
    compact: true,
  })
);

map_2.on("load", () => {
  map_2.addSource("map_2", {
    type: "geojson",
    data:
      "https://gist.githubusercontent.com/joe-liad/e66e2ec493ce3de692595b64eeb27b99/raw/bfaafeec350dfe4e5a20866a4660a188f8e6df7d/lewisham-wards.geojson",
  });

  map_2.addLayer({
    id: "map_2",
    type: "fill",
    paint: {
      "fill-opacity": 0,
    },
    source: "map_2",
  });
  map_2.addLayer({
    id: "map_2_line",
    type: "line",
    paint: {
      "line-color": "lime",
    },
    source: "map_2",
  });

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  map_2.on("mousemove", "map_2", (e) => {
    map_2.getCanvas().style.cursor = "pointer";
    const coordinates = e.lngLat;
    const description = e.features[0].properties.Name;
    popup.setLngLat(coordinates).setHTML(description).addTo(map_2);
  });
  map_2.on("mouseleave", "map_2", () => {
    map_2.getCanvas().style.cursor = "";
    popup.remove();
  });
});

var maps = [map_1, map_2 /*, map_3, map_4*/];
var allMapsLoaded = [false, false, false, false];

// sync map windows
syncMaps(map_1, map_2 /*, map_3, map_4*/);

map_1.scrollZoom.disable();
map_1.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    types: "region,postcode,district,place,locality,neighborhood,address",
    countries: "gb",
    bbox: [
      -0.07511143283733918,
      51.41353531711062,
      0.039041594357772665,
      51.49353306666282,
    ],
    filter: function (item) {
      return item.context.some((i) => {
        return i.id.split(".").shift() === "locality" && i.text === "Lewisham";
      });
    },
  }),
  "top-left"
);
map_1.addControl(
  new mapboxgl.NavigationControl({
    showCompass: false,
  }),
  "top-left"
);
map_1.addControl(
  new mapboxgl.FullscreenControl({
    container: document.querySelector("body"),
  }),
  "top-left"
);

let fullScreenChange;

if ("onfullscreenchange" in window.document) {
  fullScreenChange = "fullscreenchange";
} else if ("onmozfullscreenchange" in window.document) {
  fullScreenChange = "mozfullscreenchange";
} else if ("onwebkitfullscreenchange" in window.document) {
  fullScreenChange = "webkitfullscreenchange";
} else if ("onmsfullscreenchange" in window.document) {
  fullScreenChange = "MSFullscreenChange";
}

function onFullscreenChange() {
  if (window.innerHeight === screen.height) {
    map_1.scrollZoom.enable();
    map_2.scrollZoom.enable();
  } else {
    map_1.scrollZoom.disable();
    map_2.scrollZoom.disable();
  }
}

window.document.addEventListener(fullScreenChange, onFullscreenChange);

map_1.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  }),
  "top-left"
);
map_2.scrollZoom.disable();
// before.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');

// visibility of map controls
document.getElementsByClassName("mapboxgl-ctrl-top-right")[0].style.display =
  "none"; // map_1
document.getElementsByClassName("mapboxgl-ctrl-top-right")[1].style.display =
  ""; // map_2

window.copyPermalink = function copyPermalink() {
  updateURLSearchParams();
  var message = document.createElement("div");
  message.setAttribute("class", "overlayPermalink");
  message.innerHTML = "Permalink wurde in die Zwischenablage kopiert";
  setTimeout(function () {
    message.parentNode.removeChild(message);
  }, 800);
  document.body.appendChild(message);
  return navigator.clipboard.writeText(currentURL);
};

// choose number of map windows
window.setMapNumber = function setMapNumber(map_number) {
  switch (map_number) {
    // Ein Kartenfenster
    case 1:
      // Sichtbare Kartenfenster definieren:
      map_2.setLayoutProperty(settings.l2, "visibility", "none");
      map_3.setLayoutProperty(settings.l3, "visibility", "none");
      map_4.setLayoutProperty(settings.l4, "visibility", "none");
      // Position und Größe der Kartenfenster anpassen
      document.getElementById("map_1").style.width = "100%";
      document.getElementById("map_1").style.height = "100%";
      document.getElementById("map_2").style.width = "0";
      document.getElementById("map_2").style.height = "0";
      // Fensterinhalt neu zeichnen um Darstellungsfehler zu vermeiden
      map_1.resize();
      map_2.resize();
      // Fadenkreuzpositionen und -sichtbarkeiten anpassen
      document.getElementById("cross_1").style.top = "50%";
      document.getElementById("cross_1").style.left = "50%";
      document.getElementById("cross_2").style.display = "none";
      // document.getElementById("cross_3").style.display = "none";
      // document.getElementById("cross_4").style.display = "none";
      // Darstellung der Buttons zur Auswahl der Kartenfenster anpassen
      document.getElementById("button_1map").style =
        "background:#444;border: 1px solid buttonface;border-radius: 5px;";
      document.getElementById("button_2map").style = "";
      // Sichtbarkeit der Controls einstellen
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[0].style.display = ""; // Karte 1: Controls
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[1].style.display = "none"; // Karte 2: Controls
      // document.getElementsByClassName("mapboxgl-ctrl-top-right")[2].style.display = "none"; // Karte 3: Controls

      settings.mc = 1;
      updateURLSearchParams();

      break;
    // Zwei Kartenfenster
    case 2:
      // Sichtbare Kartenfenster definieren:
      map_2.setLayoutProperty(settings.l2, "visibility", "visible");
      map_3.setLayoutProperty(settings.l3, "visibility", "none");
      map_4.setLayoutProperty(settings.l4, "visibility", "none");
      // Position und Größe der Kartenfenster anpassen
      document.getElementById("map_1").style.width = "50%";
      document.getElementById("map_1").style.height = "100%";
      document.getElementById("map_2").style.width = "50%";
      document.getElementById("map_2").style.height = "100%";
      document.getElementById("map_2").style.left = "50%";
      // Fensterinhalt neu zeichnen um Darstellungsfehler zu vermeiden
      map_1.resize();
      map_2.resize();
      map_3.resize();
      map_4.resize();
      // Fadenkreuzpositionen und -sichtbarkeiten anpassen
      document.getElementById("cross_1").style.top = "50%";
      document.getElementById("cross_1").style.left = "25%";
      document.getElementById("cross_2").style.top = "50%";
      document.getElementById("cross_2").style.left = "75%";
      document.getElementById("cross_2").style.display = "";
      // document.getElementById("cross_3").style.display = "none";
      // document.getElementById("cross_4").style.display = "none";
      // Darstellung der Buttons zur Auswahl der Kartenfenster anpassen
      document.getElementById("button_1map").style = "";
      document.getElementById("button_2map").style =
        "background:#444;border: 1px solid buttonface;border-radius: 5px;";
      document.getElementById("button_3map").style = "";
      document.getElementById("button_4map").style = "";
      // Sichtbarkeit der Controls einstellen
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[0].style.display = "none"; // Karte 1: Controls
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[1].style.display = ""; // Karte 2: Controls
      // document.getElementsByClassName("mapboxgl-ctrl-top-right")[2].style.display = "none"; // Karte 3: Controls

      settings.mc = 2;
      updateURLSearchParams();

      break;
    // Drei Kartenfenster
    case 3:
      // Sichtbare Kartenfenster definieren:
      map_2.setLayoutProperty(settings.l2, "visibility", "visible");
      map_3.setLayoutProperty(settings.l3, "visibility", "visible");
      map_4.setLayoutProperty(settings.l4, "visibility", "none");
      // Position und Größe der Kartenfenster anpassen
      document.getElementById("map_1").style.width = "33.333%";
      document.getElementById("map_1").style.height = "100%";
      document.getElementById("map_2").style.width = "33.333%";
      document.getElementById("map_2").style.height = "100%";
      document.getElementById("map_2").style.left = "33.333%";
      // Fensterinhalt neu zeichnen um Darstellungsfehler zu vermeiden
      map_1.resize();
      map_2.resize();
      // Fadenkreuzpositionen und -sichtbarkeiten anpassen
      document.getElementById("cross_1").style.top = "50%";
      document.getElementById("cross_1").style.left = "16.666%";
      document.getElementById("cross_2").style.top = "50%";
      document.getElementById("cross_2").style.left = "50%";
      document.getElementById("cross_2").style.display = "";
      // Darstellung der Buttons zur Auswahl der Kartenfenster anpassen
      document.getElementById("button_1map").style = "";
      document.getElementById("button_2map").style = "";
      document.getElementById("button_3map").style =
        "background:#444;border: 1px solid buttonface;border-radius: 5px;";
      document.getElementById("button_4map").style = "";
      // Sichtbarkeit der Controls einstellen
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[0].style.display = "none"; // Karte 1: Controls
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[1].style.display = "none"; // Karte 2: Controls
      // document.getElementsByClassName("mapboxgl-ctrl-top-right")[2].style.display = ""; // Karte 3: Controls

      settings.mc = 3;
      updateURLSearchParams();

      break;
    // Vier Kartenfenster
    case 4:
      // Sichtbare Kartenfenster definieren:
      map_2.setLayoutProperty(settings.l2, "visibility", "visible");
      map_3.setLayoutProperty(settings.l3, "visibility", "visible");
      map_4.setLayoutProperty(settings.l4, "visibility", "visible");
      // Position und Größe der Kartenfenster anpassen
      document.getElementById("map_1").style.width = "50%";
      document.getElementById("map_1").style.height = "50%";
      document.getElementById("map_2").style.width = "50%";
      document.getElementById("map_2").style.height = "50%";
      document.getElementById("map_2").style.left = "50%";
      // Fensterinhalt neu zeichnen um Darstellungsfehler zu vermeiden
      map_1.resize();
      map_2.resize();
      // Fadenkreuzpositionen und -sichtbarkeiten anpassen
      document.getElementById("cross_1").style.top = "25%";
      document.getElementById("cross_1").style.left = "25%";
      document.getElementById("cross_2").style.top = "25%";
      document.getElementById("cross_2").style.left = "75%";
      document.getElementById("cross_2").style.display = "";
      // Darstellung der Buttons zur Auswahl der Kartenfenster anpassen
      document.getElementById("button_1map").style = "";
      document.getElementById("button_2map").style = "";
      // Sichtbarkeit der Controls einstellen
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[0].style.display = "none"; // Karte 1: Controls
      document.getElementsByClassName(
        "mapboxgl-ctrl-top-right"
      )[1].style.display = ""; // Karte 2: Controls
      // document.getElementsByClassName("mapboxgl-ctrl-top-right")[2].style.display = "none"; // Karte 3: Controls

      settings.mc = 4;
      updateURLSearchParams();

      break;
    default:
      // Fehler melden
      alert("ERROR: " + map_number);
  }
};

function intitialMapNumber() {
  if (JSON.stringify(allMapsLoaded) !== "[true,true,true,true]") {
    setTimeout(function () {
      intitialMapNumber();
    }, 100);
    return;
  }
  var mc = settings.mc;
  if (mc && mc != 4) {
    setMapNumber(mc, 10);
  }
}

intitialMapNumber();

// Alle Labels zurücksetzen
window.resetLabels = function resetLabels() {
  var geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [],
        },
        properties: {
          title: "",
        },
      },
    ],
  };
  map_1.getSource("labels").setData(geojson);
};
