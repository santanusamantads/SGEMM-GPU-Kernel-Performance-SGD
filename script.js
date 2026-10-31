document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    loadProjectData();
});

// Theme Switcher Logic (Matches myCV portfolio style)
function initThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
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
        // Fallback UI population
        populateBatchSelector([100, 200, 400, 800, 1000, 1600]);
        populateFileTable([
            { filename: "Assignment2_SGD.ipynb", description: "Complete Jupyter notebook containing data preprocessing, custom SGD implementations, and plotting." },
            { filename: "sgd_sgemm_analysis.py", description: "Standalone Python script version of the complete SGD training pipeline." },
            { filename: "sgemm_product.csv", description: "The full SGEMM GPU Kernel Performance dataset (241,600 rows)." },
            { filename: "Readme_dataset.txt", description: "Original dataset description and source documentation." }
        ]);
        initNotebookWorkspace([
            {
                cell_type: "code",
                title: "In [1]: Import Libraries",
                source: "import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\nprint('NumPy & Pandas loaded successfully.')",
                output: "NumPy & Pandas loaded successfully."
            },
            {
                cell_type: "code",
                title: "In [2]: Load Dataset",
                source: "df = pd.read_csv('sgemm_product.csv')\nprint(f'Dataset shape: {df.shape}')",
                output: "Dataset shape: (241600, 18)"
            },
            {
                cell_type: "code",
                title: "In [3]: SGD Custom Training",
                source: "def sgd_update(X, y, weights, lr, batch_size):\n    # Stochastic Gradient Descent step implementation\n    indices = np.random.choice(len(X), batch_size, replace=True)\n    return weights - lr * np.dot(X[indices].T, np.dot(X[indices], weights) - y[indices]) / batch_size\n\nprint('SGD update function compiled successfully.')",
                output: "SGD update function compiled successfully."
            }
        ]);
    }
}

// W3Schools style Interactive Notebook Workspace
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

    // Load initial cell
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
                // Simple regex extraction for print statements to simulate output
                const match = currentCode.match(/print\((['"])(.*?)\1\)/);
                if (match) {
                    output.textContent = match[2];
                } else {
                    output.textContent = "[Execution Complete] Cell executed successfully with no errors.";
                }
            } else {
                output.textContent = "[Execution Complete] Process executed successfully.\nTest MSE evaluated: 0.2790";
            }
        }, 300);
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