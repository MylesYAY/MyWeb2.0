const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const definitionResults = document.getElementById("definitionResults");
const helperText = document.getElementById("helperText");
const clearButton = document.getElementById("clearButton");

document.documentElement.classList.add("dark");

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

async function runAction(query) {
  await fetchDefinitions(query);
  const url = new URL(window.location.href);
  url.searchParams.set("q", query);
  window.history.replaceState({}, "", url.toString());
  helperText.textContent = "Showing definitions.";
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;
  runAction(value);
});

helpButton.addEventListener("click", () => commandDialog.showModal());
closeDialog.addEventListener("click", () => commandDialog.close());
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  clearResults();
});

saveDocButton.addEventListener("click", () => {
  const name = docNameInput.value.trim() || "untitled";
  saveDoc(name, docContent.value);
});

downloadDocButton.addEventListener("click", () => {
  const name = docNameInput.value.trim() || "untitled";
  downloadDoc(name, docContent.value);
});

docFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const encoded = reader.result.toString();
    const name = file.name.replace(/\.mydoc$/i, "") || "imported";
    docNameInput.value = name;
    docContent.value = decryptDoc(encoded);
    saveDoc(name, docContent.value);
    docStatus.textContent = `Imported "${file.name}" and saved locally.`;
  };
  reader.readAsText(file);
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

clearResults();
helperText.textContent =
  "Tip: Press Ctrl/Cmd + K to focus the search.";

const params = new URLSearchParams(window.location.search);
const preset = params.get("q");
if (preset) {
  searchInput.value = preset;
  runAction(preset);
}
