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
    } catch (error) {
        console.error("Error loading data.json, using fallback configuration.", error);
        populateBatchSelector([100, 200, 400, 800, 1000, 1600]);
        populateFileTable([
            { filename: "Assignment2_SGD.ipynb", description: "Complete Jupyter notebook containing data preprocessing, custom SGD implementations, and plotting." },
            { filename: "sgd_sgemm_analysis.py", description: "Standalone Python script version of complete SGD training pipeline." },
            { filename: "sgemm_product.csv", description: "Full SGEMM GPU Kernel Performance dataset (241,600 rows)." },
            { filename: "Readme_dataset.txt", description: "Original dataset description and source documentation." }
        ]);
    }
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