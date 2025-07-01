// === DOM Elements ===
const body = document.body;
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

let timer;
let timeLeft = 1500;
let isPaused = false;
let currentMode = 'pomodoro';
const displayMinutes = document.getElementById('minutes');
const displaySeconds = document.getElementById('seconds');
const zenImage = document.getElementById('zen-image');
const zenCaption = document.getElementById('zen-caption');
const zenMusic = document.getElementById('zen-music');

const themes = {
  pomodoro: { time: 1500, text: 'Respira profundo, todo empieza con calma.', img: 'assets/Images/focus.gif' },
  short:    { time: 300, text: 'Toma un respiro corto y relaja tu mente.', img: 'assets/Images/shortbreak.gif' },
  long:     { time: 900, text: 'Descansa profundamente y renueva energías.', img: 'assets/Images/longbreak.gif' }
};

function updateTheme(mode) {
  const theme = themes[mode];
  zenImage.src = theme.img;
  zenCaption.textContent = theme.text;
}

function setTimer(mode) {
  clearInterval(timer);
  currentMode = mode;
  timeLeft = themes[mode].time;
  updateDisplay();
  updateTheme(mode);
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  displayMinutes.textContent = minutes.toString().padStart(2, '0');
  displaySeconds.textContent = seconds.toString().padStart(2, '0');
}

function startTimer() {
  if (isPaused) {
    isPaused = false;
  } else {
    updateTheme(currentMode);
  }

  clearInterval(timer);
  timer = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        alert('Tiempo finalizado.');
        updateStats(currentMode);
      }
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = true;
}

function toggleMusic() {
  zenMusic.paused ? zenMusic.play() : zenMusic.pause();
}

function toggleDarkMode() {
  const container = document.getElementById("container");
  body.classList.toggle("dark-mode");
  container.classList.toggle("dark-container");
  localStorage.setItem("timebox-theme", body.classList.contains("dark-mode") ? "dark" : "light");
}

function updateStats(mode) {
  const stats = JSON.parse(localStorage.getItem("timebox-stats")) || {};
  const today = new Date().toISOString().split("T")[0];
  if (!stats[today]) stats[today] = { pomodoro: 0, short: 0, long: 0, totalMinutes: 0 };

  stats[today][mode]++;
  stats[today].totalMinutes += mode === 'pomodoro' ? 25 : mode === 'short' ? 5 : 15;

  localStorage.setItem("timebox-stats", JSON.stringify(stats));
}

function showStats() {
  const rawStats = JSON.parse(localStorage.getItem("timebox-stats")) || {};
  const selectedMonth = document.getElementById("monthPicker").value || new Date().toISOString().slice(0, 7);

  const labels = [], pomodoros = [];
  let totalPomodoro = 0, totalShort = 0, totalLong = 0, totalMinutes = 0;

  Object.keys(rawStats)
    .filter(date => date.startsWith(selectedMonth))
    .sort()
    .forEach(date => {
      const stats = rawStats[date];
      labels.push(date.slice(8));
      pomodoros.push(stats.pomodoro || 0);
      totalPomodoro += stats.pomodoro || 0;
      totalShort += stats.short || 0;
      totalLong += stats.long || 0;
      totalMinutes += stats.totalMinutes || 0;
    });

  document.getElementById("pomodoro-count").textContent = totalPomodoro;
  document.getElementById("short-count").textContent = totalShort;
  document.getElementById("long-count").textContent = totalLong;
  document.getElementById("total-minutes").textContent = totalMinutes;

  const ctx = document.getElementById("statsChart").getContext("2d");
  if (window.statsChart instanceof Chart) window.statsChart.destroy();
  window.statsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Pomodoros por día",
        data: pomodoros,
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: "Pomodoros - " + selectedMonth },
        legend: { display: false }
      }
    }
  });

  document.getElementById("stats-modal").classList.remove("hidden");
}

function exportCSV() {
  const rawStats = JSON.parse(localStorage.getItem("timebox-stats")) || {};
  if (Object.keys(rawStats).length === 0) return alert("No hay datos para exportar.");

  let csv = "Fecha,Pomodoros,Descansos Cortos,Descansos Largos,Minutos Totales\n";
  for (const date in rawStats) {
    const d = rawStats[date];
    csv += `${date},${d.pomodoro || 0},${d.short || 0},${d.long || 0},${d.totalMinutes || 0}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "estadisticas_timebox.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function closeStats() {
  document.getElementById("stats-modal").classList.add("hidden");
}

window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeStats();
});
window.addEventListener("click", e => {
  if (e.target.id === "stats-modal") closeStats();
});

// === Auth Functions ===
function showRegister() {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
}

function showLogin() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
}

async function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login exitoso");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.getElementById("auth").classList.add("hidden");
      document.getElementById("container").classList.remove("hidden");
    } else {
      alert(data.message || "Error al iniciar sesión");
    }
  } catch (error) {
    alert("Error al conectar con el servidor");
  }
}

async function registerUser() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registro exitoso, ahora inicia sesión");
      showLogin();
    } else {
      alert(data.message || "Error al registrarse");
    }
  } catch (error) {
    alert("Error al conectar con el servidor");
  }
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.getElementById("auth").classList.remove("hidden");
  document.getElementById("container").classList.add("hidden");
  showLogin();
}

// === Check Auth on Load ===
window.addEventListener("DOMContentLoaded", () => {
  const savedSession = JSON.parse(localStorage.getItem("timebox-session"));
  const theme = localStorage.getItem("timebox-theme");

  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("auth").classList.add("hidden");
    document.getElementById("container").classList.remove("hidden");
  } else {
    document.getElementById("auth").classList.remove("hidden");
    document.getElementById("container").classList.add("hidden");
  }

  if (theme === "dark") {
    body.classList.add("dark-mode");
    document.getElementById("container").classList.add("dark-container");
  }

  if (savedSession) {
    timeLeft = savedSession.timeLeft || themes.pomodoro.time;
    currentMode = savedSession.currentMode || 'pomodoro';
    isPaused = savedSession.isPaused || false;
    updateDisplay();
    updateTheme(currentMode);
  } else {
    setTimer('pomodoro');
  }
});

window.addEventListener("beforeunload", () => {
  const sessionData = { timeLeft, currentMode, isPaused };
  localStorage.setItem("timebox-session", JSON.stringify(sessionData));
});
