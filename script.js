let $ = document.querySelector.bind(document);
//let ctx = document.getElementById("map-putput").getContext("2d");

function lon2tile(lon, zoom) {
  return (lon + 180) / 360 * Math.pow(2, zoom);
}

function lat2tile(lat, zoom) {
  return (
    (1 - Math.log(Math.tan(lat * Math.PI / 180) +
    1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

let zoom = 18;

async function drawImage(ctx, url, x, y) {
  let img = new Image();
  await new Promise(r => img.onload=r, img.src=url);
  ctx.drawImage(img, x, y);
}

function parseGMaps(url) {
  let coords = url.replace("geo:", "").split("?")[0].split(",");
  return {
    lat: parseFloat(coords[0]),
    lng: parseFloat(coords[1])
  }
}

const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function getLocationText() {
  return  $("#name").value;
}

function getTimeText() {
  let d = new Date($("#date").value || Date.now());
  let datestr = d.toLocaleString('en-us', {weekday: 'short'}) + " " + d.getDate() +
      nth(d.getDate()) + " of " + d.toLocaleString('en-us', {month:'short'})
  return datestr + " @ " + $("#time").value || "09:00";
}

function update() {
  $("#location-output").innerText = getLocationText();
  $("#time-output").innerText = getTimeText();
}

async function search() {
  let query = $("#search").value;
  console.log("searching for", query);
  let url = "https://nominatim.openstreetmap.org/search?q=" +
    query + "&format=json&country_codes=gb";
  let req = await fetch(url);
  let res = await req.json();
}

autocomplete({
  input: $("#search"),
  fetch: async function(text, update) {
    let query = $("#search").value;
    let url = "https://nominatim.openstreetmap.org/search?q=" +
        query + "&format=json&countrycodes=gb";
    let req = await fetch(url);
    let res = await req.json();
    let results = res.map(r => { return {
      label: r.display_name,
      value: { lat: r.lat, lon: r.lon },
    }});
    update(results);
  },
  onSelect: function(item) {
    mymap.setView([item.value.lat, item.value.lon], 18)
    console.log("selected item", item);
  }
});

update();
$("#name").addEventListener("input", update);
$("#date").addEventListener("input", update);
$("#time").addEventListener("input", update);

$("#download").addEventListener("click", evt => {
  evt.preventDefault();
  $(".leaflet-control-zoom").style.visibility = "hidden";
  $("#search").style.visibility = "hidden";

  domtoimage.toPng($("#map-wrapper")).then(dataUrl => {
    var link = document.createElement('a');
    link.download = 'glasgow-cleanup-map.png';
    link.href = dataUrl;
    link.click();
    $(".leaflet-control-zoom").style.visibility = "visible";
    $("#search").style.visibility = "visible";
  }).catch(function (error) {
    console.error('oops, something went wrong!', error);
  });
});

let mymap = L.map('map').setView([55.8611, -4.2502], 18);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '',
    maxZoom: 19,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFsZWhhcnZleSIsImEiOiJja21xdHFoeG0wMWV1MnZ0NGg5YTdha3llIn0.bx8FLtsoZC-J79G2PtYa_g'
}).addTo(mymap);