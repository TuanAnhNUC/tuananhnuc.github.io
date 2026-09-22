const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const scale = document.getElementById("scale");
const x = document.getElementById("x");
const y = document.getElementById("y");
const opacity = document.getElementById("opacity");
const rotate = document.getElementById("rotate");

const scaleVal = document.getElementById("scaleVal");
const xVal = document.getElementById("xVal");
const yVal = document.getElementById("yVal");
const opacityVal = document.getElementById("opacityVal");
const rotateVal = document.getElementById("rotateVal");

const baseImg = new Image();
baseImg.src = "images/eminem.jpg";
const overlayImg = new Image();
let hasOverlay = false;

function fitBase() {
  // Render at 3x the source resolution for a sharper exported image.
  canvas.width = 708;
  canvas.height = 1260;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

  if (!hasOverlay || !overlayImg.complete) return;

  const s = Number(scale.value) / 100;
  const w = overlayImg.naturalWidth * s;
  const h = overlayImg.naturalHeight * s;
  const cx = canvas.width / 2 + Number(x.value);
  const cy = canvas.height / 2 + Number(y.value);

  ctx.save();
  ctx.globalAlpha = Number(opacity.value) / 100;
  ctx.translate(cx, cy);
  ctx.rotate(Number(rotate.value) * Math.PI / 180);
  ctx.drawImage(overlayImg, -w/2, -h/2, w, h);
  ctx.restore();
}

function updateLabels() {
  scaleVal.textContent = scale.value + "%";
  xVal.textContent = x.value;
  yVal.textContent = y.value;
  opacityVal.textContent = opacity.value + "%";
  rotateVal.textContent = rotate.value + "°";
}

[scale, x, y, opacity, rotate].forEach(el => {
  el.addEventListener("input", () => {
    updateLabels();
    draw();
  });
});

upload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    overlayImg.onload = () => {
      hasOverlay = true;
      draw();
    };
    overlayImg.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("remove").addEventListener("click", () => {
  hasOverlay = false;
  upload.value = "";
  draw();
});

document.getElementById("reset").addEventListener("click", () => {
  scale.value = 100;
  x.value = 0;
  y.value = 0;
  opacity.value = 100;
  rotate.value = 0;
  updateLabels();
  draw();
});

// Drag to move the uploaded image.
let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

canvas.addEventListener("pointerdown", e => {
  if (!hasOverlay) return;
  dragging = true;
  canvas.classList.add("dragging");
  canvas.setPointerCapture(e.pointerId);
  const r = canvas.getBoundingClientRect();
  startX = e.clientX - r.left;
  startY = e.clientY - r.top;
  origX = Number(x.value);
  origY = Number(y.value);
});

canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  const r = canvas.getBoundingClientRect();
  const currentX = e.clientX - r.left;
  const currentY = e.clientY - r.top;
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  x.value = Math.max(-354, Math.min(354, origX + (currentX-startX)*sx));
  y.value = Math.max(-630, Math.min(630, origY + (currentY-startY)*sy));
  updateLabels();
  draw();
});

canvas.addEventListener("pointerup", () => {
  dragging = false;
  canvas.classList.remove("dragging");
});
canvas.addEventListener("pointercancel", () => {
  dragging = false;
  canvas.classList.remove("dragging");
});

document.getElementById("download").addEventListener("click", () => {
  draw();
  const link = document.createElement("a");
  link.download = "throw_anythink_output.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

baseImg.onload = () => {
  fitBase();
  updateLabels();
  draw();
};
baseImg.src = BASE;