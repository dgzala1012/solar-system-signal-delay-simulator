const canvas = document.getElementById("solarCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.75;
canvas.height = window.innerHeight;

const planets = [
  { name: "Mercury", color: "gray", orbitRadius: 60, radius: 4, speed: 0.02, angle: 0 },
  { name: "Venus", color: "orange", orbitRadius: 100, radius: 6, speed: 0.015, angle: 0 },
  { name: "Earth", color: "deepskyblue", orbitRadius: 150, radius: 7, speed: 0.012, angle: 0 },
  { name: "Mars", color: "red", orbitRadius: 200, radius: 6, speed: 0.010, angle: 0 },
  { name: "Jupiter", color: "gold", orbitRadius: 300, radius: 12, speed: 0.006, angle: 0 },
  { name: "Saturn", color: "khaki", orbitRadius: 380, radius: 10, speed: 0.005, angle: 0 },
  { name: "Uranus", color: "lightblue", orbitRadius: 460, radius: 8, speed: 0.003, angle: 0 },
  { name: "Neptune", color: "blue", orbitRadius: 540, radius: 8, speed: 0.002, angle: 0 }
];

let isRunning = true;
let timeScale = 1;
let signals = [];
const SPEED_OF_LIGHT = 299792; // km/s
const SCALE = 1_000_000; // Scale orbital units to km
const sun = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, color: "yellow" };

function updatePlanets() {
  if (!isRunning) return;
  planets.forEach(p => {
    p.angle += p.speed * timeScale;
    p.x = sun.x + Math.cos(p.angle) * p.orbitRadius;
    p.y = sun.y + Math.sin(p.angle) * p.orbitRadius;
  });
}

function drawPlanets() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = sun.color;
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
  ctx.fill();

  planets.forEach(p => {
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, p.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw signals
  for (let i = 0; i < signals.length; i++) {
    const s = signals[i];
    s.progress += 1 / (s.delay * 60); // progress per frame
    if (s.progress >= 1) {
      logMessage(`✅ Signal received at ${s.to.name}.`);
      signals.splice(i, 1);
      i--;
      continue;
    }
    const x = s.from.x + (s.to.x - s.from.x) * s.progress;
    const y = s.from.y + (s.to.y - s.from.y) * s.progress;
    ctx.strokeStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(s.from.x, s.from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  return distPixels * SCALE; // Convert to km
}

function sendSignal(from, to) {
  const dist = distance(from, to);
  const delay = dist / SPEED_OF_LIGHT; // Seconds
  logMessage(`🚀 Sending signal from ${from.name} to ${to.name}...`);
  logMessage(`🌐 Distance: ${dist.toFixed(0)} km | Delay: ${delay.toFixed(2)} s`);
  signals.push({ from, to, progress: 0, delay });
}

function logMessage(msg) {
  const logDiv = document.getElementById("log");
  const p = document.createElement("p");
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logDiv.appendChild(p);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function animate() {
  updatePlanets();
  drawPlanets();
  requestAnimationFrame(animate);
}

function initUI() {
  const sourceSelect = document.getElementById("sourceSelect");
  const destinationSelect = document.getElementById("destinationSelect");

  planets.forEach(p => {
    const opt1 = document.createElement("option");
    opt1.value = p.name;
    opt1.textContent = p.name;
    sourceSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = p.name;
    opt2.textContent = p.name;
    destinationSelect.appendChild(opt2);
  });

  document.getElementById("sendSignalBtn").addEventListener("click", () => {
    const from = planets.find(p => p.name === sourceSelect.value);
    const to = planets.find(p => p.name === destinationSelect.value);
    if (from && to && from !== to) sendSignal(from, to);
  });

  document.getElementById("startBtn").addEventListener("click", () => (isRunning = true));
  document.getElementById("pauseBtn").addEventListener("click", () => (isRunning = false));
  document.getElementById("resetBtn").addEventListener("click", () => {
    planets.forEach(p => (p.angle = 0));
    signals = [];
    document.getElementById("log").innerHTML = "";
  });

  document.getElementById("speedSlider").addEventListener("input", e => {
    timeScale = parseFloat(e.target.value);
  });
}

initUI();
animate();

