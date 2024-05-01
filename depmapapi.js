const depmapURL = "https://api.cellmodelpassports.sanger.ac.uk";
let choices = [];
let modelName;
let modelType;
let modelGrowth;
let modelMutation;
let modelMutationMB;
let models;
let modelMutations;
let names;
let info;

document.addEventListener("DOMContentLoaded", async function() {
    let cache = sessionStorage.getItem('choices');
    if (cache) {
        choices = JSON.parse(cache);
        dropDownModels();
    }
    else {
        fetchURL = depmapURL + "/models?page[size]=10";
        try {
            await fetchModels(fetchURL);
            await fetchOptions();
            dropDownModels();
        }
        catch (error) {
            console.log("Failed: ", error);
        }
    }
})

async function fetchModels(url) {
    try {
        const res = await fetch(url);
        const info = await res.json();
        if (!res.ok) {
            console.log("Model Listing Error");
            return;
        }
        models = info.data.map(model => depmapURL + "/models/" + model.id);
        
    }
    catch (error) {
        console.log(error);
    }
}

async function fetchOptions() {
    try {
        let fetchPromise = models.map(async (modelURL) => {
            try {
                let res = await fetch("http://localhost:3000/?url=" + encodeURIComponent(modelURL));
                if (!res.ok) {
                    throw new Error("Failed fetching specific option");
                }
                let modelData = await res.json();
                modelName = modelData.data.attributes.names[0];
                modelType = modelData.data.attributes.model_type;
                modelGrowth = modelData.data.attributes.growth_properties;
                modelMutation = modelData.data.attributes.mutations_available;
                modelMutationMB = modelData.data.attributes.mutations_per_mb;
                return modelData.data.attributes.names[0];
            }
            catch(error) {
                console.log("Failed fetching all options: ", error);
                return null;
            }
        });
        let results = await Promise.all(fetchPromise);
        choices = results.filter(result => result != null);
    }
    catch (error) {
        console.log("Error retrieving all options: ", error);
    }
}

function dropDownModels() {
    let dropMenu = document.getElementById('model-drop-down');
    dropMenu.innerHTML = "";

    let selection = document.createElement("select");
    selection.id = "select-model";

    choices.forEach((opt) => {
        let option = document.createElement("option");
        option.id = "model-options";
        option.value = opt;
        option.textContent = opt;
        selection.appendChild(option);
    })

    selection.addEventListener("change", (event) => {
        info = event.target.value;
    });
    dropMenu.appendChild(selection);
    showData();
}

function showData() {
    let data = document.getElementById('models-data');
    data.innerHTML = '';
    let counter = 0;
    for (let i = 0; i < modelName.length; i++) {
        if (modelName[i] === info) {
            break;
        }
        counter++;
    }

    let dataContainer = document.createElement('div');
    dataContainer.style.color = "white";
    dataContainer.style.margin = "0 auto";
    dataContainer.style.marginTop = "10%";
    dataContainer.style.position = "relative";
    dataContainer.style.marginLeft = "50%";
    dataContainer.style.transform = "translateX(-50%)";

    let type = document.createElement('h2');
    type.textContent = modelType[counter];
    dataContainer.appendChild(type);

    let growthRateHead = document.createElement('p');
    growthRateHead.textContent = "Mutations Possible";
    dataContainer.appendChild(growthRateHead)

    let growth = document.createElement('p');
    growth.textContent = modelGrowth[counter];
    dataContainer.appendChild(growth);

    let mutationHEAD = document.createElement('p');
    mutationHEAD.textContent = "Mutations Possible";
    dataContainer.appendChild(mutationHEAD);

    let mutation = document.createElement('p');
    mutation.textContent = modelMutation[counter];
    dataContainer.appendChild(mutation);

    let mutationMBHEAD = document.createElement('p');
    mutationMBHEAD.textContent = "Mutations per MB";
    dataContainer.appendChild(mutationMBHEAD);

    let mutationMB = document.createElement('p');
    mutationMB.textContent = modelMutationMB[counter];
    dataContainer.appendChild(mutationMB);

    data.appendChild(dataContainer);
    console.log(modelGrowth);
    console.log(modelMutation);
    console.log(modelMutationMB);
}


