document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    loadProjectData();
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
        const data = await response.json();
        
        populateBatchSelector(data.hyperparameters.batch_sizes);
        populateFileTable(data.files);
        if (data.notebook_cells) {
            initNotebookWorkspace(data.notebook_cells);
        }
    } catch (error) {
        console.error("Error loading data.json, using fallback configuration.", error);
    }
}

// W3Schools style Interactive Notebook Workspace with all user notebook cells
function initNotebookWorkspace(cells) {
    const tabsContainer = document.getElementById("cellTabs");
    const editor = document.getElementById("cellEditor");
    const output = document.getElementById("cellOutput");
    const typeLabel = document.getElementById("cellTypeLabel");
    const runBtn = document.getElementById("runCellBtn");

    tabsContainer.innerHTML = "";
    let activeCellIndex = 0;

    cells.forEach((cell, index) => {
        const tab = document.createElement("button");
        tab.className = `cell-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = cell.title;
        tab.addEventListener("click", () => {
            document.querySelectorAll(".cell-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeCellIndex = index;
            editor.value = cell.source;
            output.textContent = cell.output;
            typeLabel.textContent = cell.cell_type.toUpperCase();
        });
        tabsContainer.appendChild(tab);
    });

    // Load initial active cell
    if (cells.length > 0) {
        editor.value = cells[0].source;
        output.textContent = cells[0].output;
        typeLabel.textContent = cells[0].cell_type.toUpperCase();
    }

    // Run Cell simulation action
    runBtn.addEventListener("click", () => {
        const currentCode = editor.value;
        output.textContent = "Executing cell...";
        
        setTimeout(() => {
            if (currentCode.includes("print(")) {
                // Extract string literals from print for realistic feedback
                const matches = [...currentCode.matchAll(/print\((['"])(.*?)\1\)/g)];
                if (matches.length > 0) {
                    output.textContent = matches.map(m => m[2]).join('\n');
                } else {
                    output.textContent = "[Execution Complete] Cell executed successfully with no errors.";
                }
            } else if (currentCode.includes("def sgd_RWR") || currentCode.includes("def sgd_RWOR") || currentCode.includes("def MSE")) {
                output.textContent = "[Function Definition Compiled Successfully]";
            } else {
                output.textContent = "[Execution Complete] Process executed successfully.\nFinal Test MSE evaluated: ~0.2790";
            }
        }, 250);
    });
}

function populateBatchSelector(batchSizes) {
    const container = document.getElementById("batchButtons");
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