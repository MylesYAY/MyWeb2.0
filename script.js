const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const definitionResults = document.getElementById("definitionResults");
const helperText = document.getElementById("helperText");
const clearButton = document.getElementById("clearButton");
const trailCanvas = document.getElementById("trail-canvas");

document.documentElement.classList.add("dark");

async function fetchDefinitions(query) {
  if (!query) {
    clearResults();
    return;
  }
  helperText.textContent = "Fetching Wikipedia definitions...";
  definitionResults.innerHTML = "";
  definitionResults.classList.remove("empty");

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&format=json&origin=*`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    const results = data?.query?.search ?? [];

    if (!results.length) {
      definitionResults.classList.add("empty");
      definitionResults.innerHTML = "<p>No definitions found yet.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    results.slice(0, 6).forEach((item) => {
      const url = `https://en.wikipedia.org/?curid=${item.pageid}`;
      const cleanSnippet = item.snippet.replace(/<[^>]+>/g, "");
      const div = document.createElement("div");
      div.className = "result";
      div.innerHTML = `
        <h3><a href="${url}" target="_blank" rel="noreferrer">${item.title}</a></h3>
        <p>${cleanSnippet}</p>
      `;
      fragment.appendChild(div);
    });
    definitionResults.appendChild(fragment);
  } catch (error) {
    definitionResults.classList.add("empty");
    definitionResults.innerHTML = `<p>Something went wrong. Try again.</p>`;
    console.error(error);
  }
}

function clearResults() {
  definitionResults.innerHTML = "<p>Start typing to explore definitions.</p>";
  definitionResults.classList.add("empty");
  helperText.textContent = "Cleared.";
}

async function runAction(query) {
  await fetchDefinitions(query);
  const url = new URL(window.location.href);
  url.searchParams.set("q", query);
  window.history.replaceState({}, "", url.toString());
  helperText.textContent = "Showing definitions.";
}

function syncFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("q");

  if (preset) {
    searchInput.value = preset;
    runAction(preset);
  } else {
    clearResults();
    helperText.textContent = "Tip: Press Ctrl/Cmd + K to focus the search.";
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;
  runAction(value);
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  const url = new URL(window.location.href);
  url.searchParams.delete("q");
  window.history.replaceState({}, "", url.toString());
  clearResults();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

window.addEventListener("popstate", syncFromQuery);
syncFromQuery();

// --- Magic star trail ---
const ctx = trailCanvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}

function addParticles(x, y) {
  for (let i = 0; i < 6; i += 1) {
    particles.push({
      x,
      y,
      vy: 1.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.6,
      size: 2 + Math.random() * 3,
      alpha: 0.9,
      glow: Math.random() * 0.5 + 0.5,
      hue: Math.random() > 0.5 ? 210 : 195,
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  particles = particles.filter((p) => p.alpha > 0.02);
  particles.forEach((p) => {
    p.y += p.vy;
    p.x += p.vx;
    p.alpha *= 0.96;
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y + 8, 16);
    const baseColor = `hsla(${p.hue}, 90%, 70%, ${p.alpha * 0.8})`;
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
    ctx.fillStyle = gradient;
    ctx.shadowColor = `rgba(59,130,246,${p.glow})`;
    ctx.shadowBlur = 10;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(updateParticles);
}

window.addEventListener("mousemove", (event) => {
  addParticles(event.clientX, event.clientY);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
updateParticles();
