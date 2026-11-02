let globalProjectData = null;
let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    loadProjectData();
    initEditMode();
});

// Theme Switcher Logic
function initThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

async function loadProjectData() {
    try {
        const response = await fetch('data.json');
        globalProjectData = await response.json();
        
        populateBatchSelector(globalProjectData.hyperparameters.batch_sizes);
        populateFileTable(globalProjectData.files);
        populateNotebookCells(globalProjectData.notebook_cells);
    } catch (error) {
        console.error("Error loading data.json, using fallback configuration.", error);
    }
}

function populateNotebookCells(cells) {
    const container = document.getElementById("cellsContainer");
    if (!container || !cells) return;
    container.innerHTML = "";

    cells.forEach((cell, idx) => {
        const item = document.createElement("div");
        item.className = "gfg-item";
        
        const isCode = cell.cell_type === "code";
        
        item.innerHTML = `
            <div class="gfg-item-header">
                <h3>${cell.title}</h3>
                <span class="cell-type-badge ${isCode ? 'badge-code' : 'badge-markdown'}">${cell.cell_type.toUpperCase()}</span>
            </div>
            <div class="gfg-item-body">
                <div class="gfg-block">
                    <h4>Mathematical & Conceptual Intuition</h4>
                    <p contenteditable="${isEditMode}" class="editable-field" data-index="${idx}" data-field="intuition">${cell.intuition || 'Cell execution explanation and underlying mechanics.'}</p>
                </div>
                <div class="gfg-block code-block-wrapper">
                    <h4>${isCode ? 'Python Code (.ipynb)' : 'Markdown Source Content'}</h4>
                    <pre><code contenteditable="${isEditMode}" class="editable-field" data-index="${idx}" data-field="source">${escapeHtml(cell.source)}</code></pre>
                </div>
                ${cell.output ? `
                <div class="gfg-block output-block">
                    <h4>Execution Output</h4>
                    <pre><code>${escapeHtml(cell.output)}</code></pre>
                </div>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initEditMode() {
    const toggleBtn = document.getElementById("toggleEditBtn");
    const downloadBtn = document.getElementById("downloadJsonBtn");

    toggleBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;
        if (isEditMode) {
            toggleBtn.textContent = "💾 Edit Mode: ON (Click to Save/Disable)";
            toggleBtn.style.background = "#2ea043";
            downloadBtn.style.display = "inline-block";
            enableEditing(true);
        } else {
            toggleBtn.textContent = "✎ Edit Mode: OFF";
            toggleBtn.style.background = "";
            enableEditing(false);
            collectEdits();
        }
    });

    downloadBtn.addEventListener("click", () => {
        collectEdits();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalProjectData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

function enableEditing(enable) {
    document.querySelectorAll('.editable-field').forEach(el => {
        el.setAttribute('contenteditable', enable);
        if (enable) {
            el.style.border = '1px dashed var(--accent-color)';
            el.style.padding = '4px';
        } else {
            el.style.border = 'none';
            el.style.padding = '0';
        }
    });
}

function collectEdits() {
    if (!globalProjectData || !globalProjectData.notebook_cells) return;
    document.querySelectorAll('.editable-field').forEach(el => {
        const idx = el.getAttribute('data-index');
        const field = el.getAttribute('data-field');
        if (idx !== null && field !== null) {
            globalProjectData.notebook_cells[idx][field] = el.innerText;
        }
    });
}

function populateBatchSelector(batchSizes) {
    const container = document.getElementById("batchButtons");
    if (!container) return;
    container.innerHTML = "";

    batchSizes.forEach((size, index) => {
        const btn = document.createElement("button");
        btn.className = `batch-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = `Batch Size: ${size}`;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".batch-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("selectedBatch").textContent = size;
        });
        container.appendChild(btn);
    });
}

function populateFileTable(files) {
    const tbody = document.getElementById("fileTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    files.forEach(file => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${file.filename}</code></td>
            <td>${file.description}</td>
        `;
        tbody.appendChild(tr);
    });
}