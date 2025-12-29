const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const definitionResults = document.getElementById("definitionResults");
const helperText = document.getElementById("helperText");
const helpButton = document.getElementById("helpButton");
const commandDialog = document.getElementById("commandDialog");
const closeDialog = document.getElementById("closeDialog");
const clearButton = document.getElementById("clearButton");
const chips = document.querySelectorAll(".chip");
const docNameInput = document.getElementById("docName");
const docContent = document.getElementById("docContent");
const docStatus = document.getElementById("docStatus");
const docFile = document.getElementById("docFile");
const saveDocButton = document.getElementById("saveDoc");
const downloadDocButton = document.getElementById("downloadDoc");

const COMMANDS = {
  wiki: "wiki",
  doc: "doc",
  clear: "clear",
};

function initializeTheme() {
  document.documentElement.classList.add("dark");
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

function caesarShift(str, shift) {
  return Array.from(str)
    .map((char) => String.fromCharCode(char.charCodeAt(0) + shift))
    .join("");
}

function encryptDoc(content) {
  const shifted = caesarShift(content, 3);
  return btoa(shifted);
}

function decryptDoc(payload) {
  try {
    const shifted = atob(payload);
    return caesarShift(shifted, -3);
  } catch (e) {
    console.error("Failed to decrypt doc", e);
    return "";
  }
}

function saveDoc(name, content) {
  if (!name) {
    docStatus.textContent = "Add a document name before saving.";
    return;
  }
  const encoded = encryptDoc(content);
  localStorage.setItem(`mydoc:${name}`, encoded);
  docStatus.textContent = `Saved "${name}.mydoc" locally.`;
}

function loadDoc(name) {
  const stored = localStorage.getItem(`mydoc:${name}`);
  if (stored) {
    docContent.value = decryptDoc(stored);
    docStatus.textContent = `Loaded "${name}.mydoc" from storage.`;
  } else {
    docContent.value = "";
    docStatus.textContent = `Started new doc "${name}.mydoc".`;
  }
  docNameInput.value = name;
}

function downloadDoc(name, content) {
  if (!name) {
    docStatus.textContent = "Add a document name to download.";
    return;
  }
  const encoded = encryptDoc(content);
  const blob = new Blob([encoded], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.mydoc`;
  link.click();
  URL.revokeObjectURL(url);
  docStatus.textContent = `Downloaded "${name}.mydoc".`;
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
      case COMMANDS.doc:
        if (parsed.payload) {
          loadDoc(parsed.payload);
        } else {
          docStatus.textContent = "Add a document name after /doc.";
        }
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

initializeTheme();
clearResults();
helperText.textContent =
  "Tip: Use /wiki, /doc [name], or /clear. Press Ctrl/Cmd + K to focus the search.";
docStatus.textContent = "Use /doc [name] to jump to a saved note.";
