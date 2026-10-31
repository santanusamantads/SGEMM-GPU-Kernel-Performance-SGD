document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    loadProjectData();
    initNotebookViewer();
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

/* ========================================================
   PYODIDE & NOTEBOOK VIEWER INTEGRATION
   ======================================================== */
let pyodideInstance = null;
let pyodideLoadingPromise = null;
let notebookRawCells = [];

async function initNotebookViewer() {
    const container = document.getElementById("notebookCellsContainer");
    if (!container) return;

    try {
        const response = await fetch('Assignment2_SGD.ipynb');
        if (!response.ok) throw new Error("Network response was not ok");
        const ipynbJson = await response.json();
        notebookRawCells = ipynbJson.cells || [];
        renderNotebookCells(notebookRawCells, container);
    } catch (err) {
        console.warn("Could not load Assignment2_SGD.ipynb via fetch. Falling back to data.json notebook_cells.", err);
        container.innerHTML = `<div class="loading-notice" style="color: #f85149;">Notice: Could not fetch Assignment2_SGD.ipynb directly (likely due to CORS or file:// protocol). Loaded fallback cells from data.json.</div>`;
        
        try {
            const fallbackRes = await fetch('data.json');
            const fallbackData = await fallbackRes.json();
            if (fallbackData.notebook_cells) {
                notebookRawCells = fallbackData.notebook_cells.map(c => ({
                    cell_type: c.cell_type,
                    source: c.source.split('\n'),
                    execution_count: 1,
                    outputs: [{ output_type: "stream", name: "stdout", text: [c.output] }]
                }));
                renderNotebookCells(notebookRawCells, container, true);
            }
        } catch (e) {
            container.innerHTML = `<div class="loading-notice" style="color: #f85149;">Error loading notebook data. Please run via a local HTTP server.</div>`;
        }
    }

    document.getElementById("runAllBtn").addEventListener("click", runAllCells);
    document.getElementById("resetNotebookBtn").addEventListener("click", resetNotebook);
}

function renderNotebookCells(cells, container, isFallback = false) {
    container.innerHTML = "";

    cells.forEach((cell, index) => {
        const cellDiv = document.createElement("div");
        cellDiv.className = "nb-cell-wrapper";
        cellDiv.dataset.index = index;

        if (cell.cell_type === "markdown") {
            const mdDiv = document.createElement("div");
            mdDiv.className = "nb-markdown-cell";
            const sourceText = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
            mdDiv.innerHTML = formatMarkdown(sourceText);
            cellDiv.appendChild(mdDiv);
        } else if (cell.cell_type === "code") {
            const codeCellDiv = document.createElement("div");
            codeCellDiv.className = "nb-cell";
            codeCellDiv.id = `code-cell-${index}`;

            const execCount = cell.execution_count !== null && cell.execution_count !== undefined ? cell.execution_count : " ";
            const sourceText = Array.isArray(cell.source) ? cell.source.join("") : cell.source;

            codeCellDiv.innerHTML = `
                <div class="nb-code-header">
                    <span class="cell-prompt">In [<span class="exec-count">${execCount}</span>]:</span>
                    <button class="nb-run-single-btn" onclick="runSingleCell(${index})">▶ Run Cell</button>
                </div>
                <div class="nb-editor-wrapper">
                    <textarea class="nb-textarea" id="textarea-${index}" spellcheck="false">${escapeHtml(sourceText)}</textarea>
                </div>
                <div class="nb-output-wrapper" id="output-${index}">${formatInitialOutputs(cell.outputs)}</div>
            `;
            cellDiv.appendChild(codeCellDiv);

            setTimeout(() => {
                const ta = document.getElementById(`textarea-${index}`);
                if (ta) {
                    ta.style.height = 'auto';
                    ta.style.height = (ta.scrollHeight + 4) + 'px';
                    ta.addEventListener('input', function() {
                        this.style.height = 'auto';
                        this.style.height = (this.scrollHeight + 4) + 'px';
                    });
                    ta.addEventListener('keydown', function(e) {
                        if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
                            e.preventDefault();
                            runSingleCell(index);
                        }
                    });
                }
            }, 0);
        }

        container.appendChild(cellDiv);
    });
}

function formatMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/^### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html.replace(/\n/g, '<br>');
}

function formatInitialOutputs(outputs) {
    if (!outputs || outputs.length === 0) return "";
    let html = "";
    outputs.forEach(out => {
        if (out.output_type === "stream" && out.text) {
            const txt = Array.isArray(out.text) ? out.text.join("") : out.text;
            html += escapeHtml(txt) + "\n";
        } else if (out.output_type === "execute_result" || out.output_type === "display_data") {
            if (out.data && out.data["image/png"]) {
                html += `<img src="data:image/png;base64,${out.data["image/png"]}" class="nb-plot-img" alt="Notebook plot"/>\n`;
            } else if (out.data && out.data["text/plain"]) {
                const txt = Array.isArray(out.data["text/plain"]) ? out.data["text/plain"].join("") : out.data["text/plain"];
                html += escapeHtml(txt) + "\n";
            }
        }
    });
    return html.trim();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ========================================================
   PYODIDE INITIALIZATION & EXECUTION ENGINE
   ======================================================== */
async function getPyodideInstance(statusCallback) {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoadingPromise) return pyodideLoadingPromise;

    pyodideLoadingPromise = (async () => {
        if (statusCallback) statusCallback("Loading Python runtime (Pyodide)...");
        
        if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        if (statusCallback) statusCallback("Initializing Pyodide interpreter...");
        pyodideInstance = await window.loadPyodide();

        if (statusCallback) statusCallback("Loading Python packages (numpy, pandas, matplotlib, scikit-learn)...");
        await pyodideInstance.loadPackage(["numpy", "pandas", "matplotlib", "scikit-learn"]);

        if (statusCallback) statusCallback("Pre-loading sgemm_product.csv into virtual filesystem...");
        try {
            const csvRes = await fetch('sgemm_product.csv');
            if (csvRes.ok) {
                const csvBuffer = await csvRes.arrayBuffer();
                pyodideInstance.FS.writeFile("sgemm_product.csv", new Uint8Array(csvBuffer));
            } else {
                console.warn("Could not fetch sgemm_product.csv automatically.");
            }
        } catch (e) {
            console.warn("Error pre-loading sgemm_product.csv:", e);
        }

        if (statusCallback) statusCallback("Python Runtime: Ready");
        return pyodideInstance;
    })();

    return pyodideLoadingPromise;
}

async function runSingleCell(index) {
    const cellBox = document.getElementById(`code-cell-${index}`);
    const textarea = document.getElementById(`textarea-${index}`);
    const outputDiv = document.getElementById(`output-${index}`);
    const promptSpan = cellBox.querySelector('.exec-count');
    const statusEl = document.getElementById('pyodideStatus');

    if (!textarea || !outputDiv) return;

    let code = textarea.value;
    
    const isFastMode = document.getElementById('fastModeCheckbox')?.checked;
    if (isFastMode) {
        code = code.replace(/epochs\s*=\s*100/g, 'epochs = 10');
    }

    promptSpan.textContent = "*";
    cellBox.classList.add("active-exec");
    outputDiv.className = "nb-output-wrapper";
    outputDiv.textContent = "Running...";

    try {
        statusEl.textContent = "Running cell...";
        const pyodide = await getPyodideInstance(msg => { statusEl.textContent = msg; });

        await pyodide.runPythonAsync(`
            import sys
            import io
            import matplotlib
            matplotlib.use('AGG')
            import matplotlib.pyplot as plt
            import base64

            class CapturedIO(io.StringIO):
                def write(self, s):
                    super().write(s)
            
            _stdout_capture = CapturedIO()
            sys.stdout = _stdout_capture
            sys.stderr = _stdout_capture
        `);

        let result;
        try {
            result = await pyodide.runPythonAsync(code);
        } catch (pyErr) {
            throw pyErr;
        }

        const pyOutput = await pyodide.runPythonAsync(`
            sys.stdout = sys.__stdout__
            sys.stderr = sys.__stderr__
            
            output_text = _stdout_capture.getvalue()
            
            fig_base64 = ""
            if plt.get_fignums():
                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
                buf.seek(0)
                fig_base64 = base64.b64encode(buf.read()).decode('utf-8')
                plt.close('all')
            
            import json
            json.dumps({"stdout": output_text, "plot": fig_base64})
        `);

        const parsedOut = JSON.parse(pyOutput);
        let finalHtml = "";
        if (parsedOut.stdout) {
            finalHtml += escapeHtml(parsedOut.stdout);
        }
        if (parsedOut.plot) {
            if (finalHtml) finalHtml += "\n";
            finalHtml += `<img src="data:image/png;base64,${parsedOut.plot}" class="nb-plot-img" alt="Generated plot"/>`;
        }
        if (!finalHtml.trim()) {
            finalHtml = result !== undefined && result !== null ? String(result) : "";
        }

        outputDiv.innerHTML = finalHtml;
        outputDiv.className = "nb-output-wrapper";
        promptSpan.textContent = index + 1;
    } catch (err) {
        outputDiv.textContent = err.message || String(err);
        outputDiv.className = "nb-output-wrapper error-output";
        promptSpan.textContent = "E";
    } finally {
        cellBox.classList.remove("active-exec");
        statusEl.textContent = "Python Runtime: Ready";
    }
}

async function runAllCells() {
    for (let i = 0; i < notebookRawCells.length; i++) {
        if (notebookRawCells[i].cell_type === 'code') {
            await runSingleCell(i);
        }
    }
}

function resetNotebook() {
    renderNotebookCells(notebookRawCells, document.getElementById("notebookCellsContainer"));
    document.getElementById('pyodideStatus').textContent = "Python Runtime: Ready (Reset)";
}