const depmapURL = "https://api.cellmodelpassports.sanger.ac.uk";
let models = [];
let currentPage = 1;
const modelsPerPage = 20;

document.addEventListener("DOMContentLoaded", async function() {
    await fetchModels();
    displayModels();
    setupPagination();
    await loadXLSXAndPlot(); 
});

async function fetchModels() {
    try {
        const res = await fetch(`${depmapURL}/models?page[size]=1000`);
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed fetching models");

        models = data.data.map(model => ({
            id: model.id,
            name: model.attributes.names[0]
        }));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

function displayModels() {
    const container = document.getElementById("models-container");
    container.innerHTML = "";

    let start = (currentPage - 1) * modelsPerPage;
    let end = start + modelsPerPage;
    let paginatedModels = models.slice(start, end);

    paginatedModels.forEach(model => {
        let div = document.createElement("div");
        div.className = "model-card";
        div.textContent = model.name;
        div.onclick = () => showModelDetails(model.id);
        container.appendChild(div);
    });
}

// Setup pagination buttons
function setupPagination() {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    let totalPages = Math.ceil(models.length / modelsPerPage);
    let maxPages = 5;

    const createPageButton = (pageNum) => {
        let btn = document.createElement("button");
        btn.className = "page-btn";
        btn.textContent = pageNum;
        btn.onclick = function () {
            currentPage = pageNum;
            displayModels();
            setupPagination();
        };
        paginationContainer.appendChild(btn);
    };

    if (totalPages <= maxPages) {
        for (let i = 1; i <= totalPages; i++) {
            createPageButton(i);
        }
    } else {
        createPageButton(1);

        if (currentPage > 3) {
            paginationContainer.appendChild(document.createTextNode('...'));
        }

        let start = Math.max(currentPage - 2, 2);
        let end = Math.min(currentPage + 2, totalPages - 1);

        for (let i = start; i <= end; i++) {
            createPageButton(i);
        }

        if (currentPage < totalPages - 2) {
            paginationContainer.appendChild(document.createTextNode('...'));
        }

        createPageButton(totalPages);
    }
}

async function showModelDetails(modelId) {
    try {
        const res = await fetch(`${depmapURL}/models/${modelId}`);
        if (!res.ok) throw new Error("Failed fetching model details");

        const data = await res.json();
        const model = data.data.attributes;

        let modalContent = `
            <h3>${model.names[0]}</h3>
            <p><strong>Type:</strong> ${model.model_type}</p>
            <p><strong>Growth Properties:</strong> ${model.growth_properties || "N/A"}</p>
            <p><strong>Mutations Available:</strong> ${model.mutations_available ? "Yes" : "No"}</p>
            <p><strong>Mutations per MB:</strong> ${model.mutations_per_mb || "N/A"}</p>
            <p><strong>Commercially Available:</strong> ${model.commercial ? "Yes" : "No"}</p>
            <p><strong>CRISPR KO Available:</strong> ${model.crispr_ko ? "Yes" : "No"}</p>
            <p><strong>Expression Data:</strong> ${model.expression_available ? "Available" : "Not Available"}</p>
        `;

        document.getElementById("modal-info").innerHTML = modalContent;
        document.getElementById("model-modal").style.display = "flex";
    } catch (error) {
        console.error("Error fetching model details:", error);
    }
}

// Close the modal
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("model-modal").style.display = "none";
});

async function loadXLSXAndPlot() {
    try {

        const xlsxFile = "/models.xlsx";
        const response = await fetch(xlsxFile);
        if (!response.ok) throw new Error("Failed to fetch XLSX file");

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet);
        console.log(jsonData);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error("XLSX data is empty.");
        }

        const tissueCounts = {};
        jsonData.forEach(row => {
            if (row.tissue) {
                let tissue = row.tissue.trim();
                tissueCounts[tissue] = (tissueCounts[tissue] || 0) + 1;
            }
        });

        console.log(tissueCounts);

        const tissues = Object.keys(tissueCounts);
        const counts = Object.values(tissueCounts);

        if (tissues.length === 0) {
            throw new Error("No tissue data found.");
        }

        const plotDiv = document.getElementById("plot-container");
        plotDiv.style.display = "block";
        plotDiv.style.height = "325px";

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

        const plotData = [{
            x: tissues,
            y: counts,
            type: 'bar',
            marker: {
                color: tissues.map((_, i) => colors[i % colors.length]),
                line: { color: '#fff', width: 2 }
            }
        }];
        

        const layout = {
            title: {
                text: 'Cancer Cell Models Distribution by Tissue',
                font: { color: '#ffffff', size: 20 }
            },
            autosize: true,
            xaxis: {
                title: { text: 'Tissue Type', font: { color: '#ffffff' } },
                color: '#ffffff'
            },
            yaxis: {
                title: { text: 'Number of Models', font: { color: '#ffffff' } },
                color: '#ffffff'
            },
            paper_bgcolor: '#333',
            plot_bgcolor: '#444'
        };
        
        Plotly.purge("plot-container");
        Plotly.newPlot("plot-container", plotData, layout);

    } catch (error) {
        console.error("Error loading XLSX:", error);
    }
};