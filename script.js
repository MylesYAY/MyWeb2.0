const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const definitionResults = document.getElementById("definitionResults");
const helperText = document.getElementById("helperText");
const clearButton = document.getElementById("clearButton");

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
