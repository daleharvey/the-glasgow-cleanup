let $ = document.querySelector.bind(document);
let ctx = document.getElementById("map").getContext("2d");

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

const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

async function draw() {
  let coords = parseGMaps($("#location").value);
  console.log("Drawing coords", coords);
  
  let x = lat2tile(coords.lat, zoom);
  let y = lon2tile(coords.lng, zoom);
  
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let mx = Math.floor(x - 1 + j);
      let my = Math.floor(y - 1 + i);
      
      await drawImage(
        ctx, 
        `https://a.tile.openstreetmap.org/${zoom}/${my}/${mx}.png`, 
        i * 256, 
        j * 256
      );
    }
  } 

  let markerX = (Math.round((y - Math.floor(y)) * 256)) + 256 - 32;
  let markerY = (Math.round((x - Math.floor(x)) * 256)) + 256 - 88;
      
  await drawImage(
    ctx, 
    "https://cdn.glitch.com/d12d647a-c769-4a20-b92a-8b40638b523b%2Fpin.svg?v=1616533602193", 
    markerX, 
    markerY, 64, 88
  );
  
  let height = 80;
  let d = new Date($("#date").value || Date.now());
  let datestr = d.toLocaleString('en-us', {weekday: 'short'}) + " " + d.getDate() + 
      nth(d.getDate()) + " of " + d.toLocaleString('en-us', {month:'short'}) 
  let date = datestr + " @ " + $("#time").value;
  let place = "Meet @ " + $("#name").value;

  ctx.font = `${height}px sans-serif`;
  ctx.fillStyle = "#000";
  
  let placeSize  = ctx.measureText(place);
  let dateSize  = ctx.measureText(date);
  
  ctx.fillRect(1080 - (placeSize.width + 40 + 20), 1080 - ((2 * height) + 80), placeSize.width + 40, height + 20);
  ctx.fillRect(1080 - (dateSize.width + 40 + 20), 1080 - (height + 40), dateSize.width + 40, height + 20);
  
  ctx.fillStyle = "#FFF";
  ctx.fillText(place, 1080 - (placeSize.width + 40), 1080 - (height + 80));
  ctx.fillText(date, 1080 - (dateSize.width + 40), 1080 - 40);
}

draw();
$("#location").addEventListener("input", draw);
$("#name").addEventListener("input", draw);
$("#date").addEventListener("input", draw);
$("#time").addEventListener("input", draw);
