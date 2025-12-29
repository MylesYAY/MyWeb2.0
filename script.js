const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const definitionResults = document.getElementById("definitionResults");
const helperText = document.getElementById("helperText");
const themeToggle = document.getElementById("themeToggle");
const helpButton = document.getElementById("helpButton");
const commandDialog = document.getElementById("commandDialog");
const closeDialog = document.getElementById("closeDialog");
const clearButton = document.getElementById("clearButton");
const chips = document.querySelectorAll(".chip");

const COMMANDS = {
  wiki: "wiki",
  clear: "clear",
};

function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeToggle.checked = isDark;
  localStorage.setItem("myweb-theme", isDark ? "dark" : "light");
}

function loadTheme() {
  const stored = localStorage.getItem("myweb-theme");
  if (stored) {
    setTheme(stored);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }
}

async function fetchDefinitions(query) {
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

function parseCommand(raw) {
  if (!raw.startsWith("/")) return null;
  const [command, ...rest] = raw.trim().slice(1).split(" ");
  return { command: command.toLowerCase(), payload: rest.join(" ").trim() };
}

async function runAction(query) {
  const parsed = parseCommand(query);

  if (parsed) {
    switch (parsed.command) {
      case COMMANDS.clear:
        searchInput.value = "";
        clearResults();
        return;
      case COMMANDS.wiki:
      default:
        if (parsed.payload) await fetchDefinitions(parsed.payload);
        helperText.textContent = "Wiki command run.";
        return;
    }
  }

  await fetchDefinitions(query);
  helperText.textContent = "Showing definitions.";
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;
  runAction(value);
});

themeToggle.addEventListener("change", (event) => {
  setTheme(event.target.checked ? "dark" : "light");
});

helpButton.addEventListener("click", () => commandDialog.showModal());
closeDialog.addEventListener("click", () => commandDialog.close());
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  clearResults();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const cmd = chip.getAttribute("data-command");
    searchInput.value = cmd;
    searchInput.focus();
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

loadTheme();
clearResults();
helperText.textContent =
  "Tip: Use /wiki or /clear, and toggle the theme in the header. Press Ctrl/Cmd + K to focus the search.";
