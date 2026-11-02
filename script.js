let globalProjectData = null;

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    loadProjectData();
    initCvDrawer();
});

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
        
        const saved = localStorage.getItem("sgemm_project_data");
        if (saved) {
            globalProjectData = JSON.parse(saved);
        }

        renderPageContent(globalProjectData);
        buildDrawerForm(globalProjectData);
    } catch (error) {
        console.error("Error loading data.json", error);
    }
}

function renderPageContent(data) {
    if (data.project) {
        document.getElementById("heroTitle").textContent = data.project.title;
        document.getElementById("heroSubtitle").textContent = data.project.description;
    }
    if (data.hyperparameters && data.hyperparameters.batch_sizes) {
        populateBatchSelector(data.hyperparameters.batch_sizes);
    }
    if (data.files) {
        populateFileTable(data.files);
    }
    if (data.notebook_cells) {
        populateNotebookCells(data.notebook_cells);
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
        const showImage = cell.image_url && !cell.hide_image;
        
        item.innerHTML = `
            <div class="gfg-item-header">
                <h3>${cell.title}</h3>
                <span class="cell-type-badge ${isCode ? 'badge-code' : 'badge-markdown'}">${cell.cell_type.toUpperCase()}</span>
            </div>
            <div class="gfg-item-body">
                <div class="gfg-block">
                    <h4>Mathematical & Conceptual Intuition</h4>
                    <p>${cell.intuition || ''}</p>
                </div>
                ${showImage ? `
                <div class="gfg-block image-block">
                    <img src="${cell.image_url}" alt="${cell.title} illustration" class="cell-illustration" loading="lazy" />
                </div>` : ''}
                <div class="gfg-block code-block-wrapper">
                    <h4>${isCode ? 'Python Code (.ipynb)' : 'Markdown Source Content'}</h4>
                    <pre><code>${escapeHtml(cell.source)}</code></pre>
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
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function initCvDrawer() {
    const openBtn = document.getElementById("openEditorBtn");
    const closeBtn = document.getElementById("closeDrawerBtn");
    const drawer = document.getElementById("cvDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const downloadBtn = document.getElementById("downloadJsonBtn");
    const resetBtn = document.getElementById("resetDataBtn");

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        drawer.classList.add("open");
        backdrop.classList.add("open");
    });

    const closeDrawer = () => {
        drawer.classList.remove("open");
        backdrop.classList.remove("open");
    };

    closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    downloadBtn.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalProjectData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    resetBtn.addEventListener("click", () => {
        localStorage.removeItem("sgemm_project_data");
        location.reload();
    });
}

function buildDrawerForm(data) {
    const formContainer = document.getElementById("drawerFormContent");
    if (!formContainer) return;
    formContainer.innerHTML = "";

    const projGroup = document.createElement("div");
    projGroup.className = "drawer-section-group";
    projGroup.innerHTML = `
        <h4>Project Settings</h4>
        <label>Title</label>
        <input type="text" id="editProjTitle" value="${data.project.title}" />
        <label>Description</label>
        <textarea id="editProjDesc">${data.project.description}</textarea>
    `;
    formContainer.appendChild(projGroup);

    const cellsGroup = document.createElement("div");
    cellsGroup.className = "drawer-section-group";
    cellsGroup.innerHTML = `<h4>Notebook Cells (Intuition, Code, & Images)</h4>`;
    
    data.notebook_cells.forEach((cell, idx) => {
        const cellBox = document.createElement("div");
        cellBox.className = "drawer-subbox";
        cellBox.innerHTML = `
            <strong>${cell.title}</strong>
            <label>Intuition</label>
            <textarea data-cell-idx="${idx}" data-field="intuition">${cell.intuition || ''}</textarea>
            <label>Source Code / Text</label>
            <textarea data-cell-idx="${idx}" data-field="source" rows="3">${cell.source}</textarea>
            <label>Image URL</label>
            <input type="text" data-cell-idx="${idx}" data-field="image_url" value="${cell.image_url || ''}" placeholder="https://..." />
            <div class="checkbox-wrapper">
                <label><input type="checkbox" data-cell-idx="${idx}" data-field="hide_image" ${cell.hide_image ? 'checked' : ''} /> Hide Picture for this section</label>
            </div>
        `;
        cellsGroup.appendChild(cellBox);
    });
    formContainer.appendChild(cellsGroup);

    formContainer.addEventListener("input", (e) => {
        const target = e.target;
        if (target.id === "editProjTitle") {
            globalProjectData.project.title = target.value;
        } else if (target.id === "editProjDesc") {
            globalProjectData.project.description = target.value;
        } else if (target.dataset.cellIdx !== undefined) {
            const idx = target.dataset.cellIdx;
            const field = target.dataset.field;
            if (target.type === "checkbox") {
                globalProjectData.notebook_cells[idx][field] = target.checked;
            } else {
                globalProjectData.notebook_cells[idx][field] = target.value;
            }
        }
        localStorage.setItem("sgemm_project_data", JSON.stringify(globalProjectData));
        renderPageContent(globalProjectData);
    });
    
    formContainer.addEventListener("change", (e) => {
        const target = e.target;
        if (target.dataset.cellIdx !== undefined && target.type === "checkbox") {
            const idx = target.dataset.cellIdx;
            const field = target.dataset.field;
            globalProjectData.notebook_cells[idx][field] = target.checked;
            localStorage.setItem("sgemm_project_data", JSON.stringify(globalProjectData));
            renderPageContent(globalProjectData);
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