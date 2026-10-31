document.addEventListener("DOMContentLoaded", () => {
    loadProjectData();
});

async function loadProjectData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        populateBatchSelector(data.hyperparameters.batch_sizes);
        populateFileTable(data.files);
    } catch (error) {
        console.error("Error loading data.json, using fallback configuration.", error);
        // Fallback UI population if data.json is read locally without server
        populateBatchSelector([100, 200, 400, 800, 1000, 1600]);
        populateFileTable([
            { filename: "Assignment2_SGD.ipynb", description: "Complete Jupyter notebook containing data preprocessing, custom SGD implementations, and plotting." },
            { filename: "sgd_sgemm_analysis.py", description: "Standalone Python script version of the complete SGD training pipeline." },
            { filename: "sgemm_product.csv", description: "The full SGEMM GPU Kernel Performance dataset (241,600 rows)." },
            { filename: "Readme_dataset.txt", description: "Original dataset description and source documentation." }
        ]);
    }
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