const lendersByVertical = {
    retail: ["Wells Fargo", "EasyPay", "Acima"],
    electiveMedical: ["Care Credit", "Fortiva", "HFD"],
    homeImprovement: ["Service", "Greensky", "BreadPay"]
};

const globalLenders = ["TD Bank", "Concora"];
let selectedLenders = [];

function resetTiers() {
    selectedLenders = [];
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`tier${i}Config`).value = "";
        document.getElementById(`tier${i}Content`).innerHTML = "";
        const bottomResult = document.getElementById(`tier${i}Result`);
        bottomResult.style.display = "block"; // Show the result dropdown
    }
}

function handleTierChange(tierNumber) {
    const verticalMarket = document.getElementById('verticalMarket').value;
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    tierContent.innerHTML = ''; // Clear previous content

    const selectedConfig = document.getElementById(`tier${tierNumber}Config`).value;
    const bottomResult = document.getElementById(`tier${tierNumber}Result`);

    if (selectedConfig === 'standard') {
        addLenderDropdown(tierContent, verticalMarket);
        bottomResult.style.display = "block"; // Show the result dropdown
    } else if (selectedConfig === 'marketplace') {
        addMarketplaceTier(tierContent, verticalMarket);
        bottomResult.style.display = "none"; // Hide the result dropdown
    } else if (selectedConfig === 'split') {
        addSplitDropdown(tierContent, 100, verticalMarket);
        bottomResult.style.display = "block"; // Show the result dropdown
    }
}

function addLenderDropdown(container, verticalMarket, beforeElement = null) {
    const lenderSelect = document.createElement('select');
    lenderSelect.classList.add('lender-select');
    lenderSelect.innerHTML = '<option value="" disabled selected>Select a lender</option>';

    if (verticalMarket) {
        const allLenders = [...lendersByVertical[verticalMarket], ...globalLenders];
        lenderSelect.innerHTML += allLenders
            .filter(lender => !selectedLenders.includes(lender))
            .map(lender => `<option value="${lender}">${lender}</option>`)
            .join('');
    }

    lenderSelect.onchange = function() {
        updateSelectedLenders();
    };

    if (beforeElement) {
        container.insertBefore(lenderSelect, beforeElement);
    } else {
        container.appendChild(lenderSelect);
    }
}

function addMarketplaceTier(container, verticalMarket) {
    let lenderCount = 1;

    addLenderAndResultDropdown(container, verticalMarket);

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-lender');
    addButton.innerText = '+ Add Lender';
    addButton.style.display = 'block';
    addButton.style.marginTop = '10px';
    addButton.style.padding = '12px';
    addButton.style.fontSize = '16px';
    addButton.style.backgroundColor = '#007bff';
    addButton.style.color = '#fff';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.cursor = 'pointer';
    addButton.style.width = '100%';

    addButton.onclick = function() {
        if (lenderCount < 3) {
            addLenderAndResultDropdown(container, verticalMarket, addButton);
            lenderCount++;
        }
    };

    container.appendChild(addButton);
}

function addLenderAndResultDropdown(container, verticalMarket, beforeElement = null) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');
    lenderGroup.style.display = 'flex';
    lenderGroup.style.alignItems = 'center';
    lenderGroup.style.gap = '10px';
    lenderGroup.style.marginBottom = '10px';

    const lenderSelect = document.createElement('select');
    lenderSelect.classList.add('lender-select');
    lenderSelect.innerHTML = '<option value="" disabled selected>Select a lender</option>';

    if (verticalMarket) {
        const allLenders = [...lendersByVertical[verticalMarket], ...globalLenders];
        lenderSelect.innerHTML += allLenders
            .filter(lender => !selectedLenders.includes(lender))
            .map(lender => `<option value="${lender}">${lender}</option>`)
            .join('');
    }

    lenderSelect.onchange = function() {
        updateSelectedLenders();
    };

    const resultSelect = document.createElement('select');
    resultSelect.innerHTML = `
        <option value="" disabled selected>Select Result</option>
        <option value="offer">Offer</option>
        <option value="no-offer">No Offer</option>
        <option value="pending">Decision Pending</option>
    `;
    resultSelect.classList.add('result-select');

    lenderGroup.appendChild(lenderSelect);
    lenderGroup.appendChild(resultSelect);

    if (beforeElement) {
        container.insertBefore(lenderGroup, beforeElement);
    } else {
        container.appendChild(lenderGroup);
    }
}

function addSplitDropdown(container, initialPercentage, verticalMarket) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');
    lenderGroup.style.display = 'flex';
    lenderGroup.style.alignItems = 'center';
    lenderGroup.style.gap = '10px';
    lenderGroup.style.marginBottom = '10px';

    const lenderSelect = document.createElement('select');
    lenderSelect.innerHTML = '<option value="" disabled selected>Select a lender</option>';
    lenderSelect.classList.add('lender-select');

    if (verticalMarket) {
        const allLenders = [...lendersByVertical[verticalMarket], ...globalLenders];
        lenderSelect.innerHTML += allLenders
            .filter(lender => !selectedLenders.includes(lender))
            .map(lender => `<option value="${lender}">${lender}</option>`)
            .join('');
    }
    lenderGroup.appendChild(lenderSelect);

    lenderSelect.onchange = function() {
        updateSelectedLenders();
    };

    const percentageSelect = document.createElement('select');
    percentageSelect.classList.add('percentage-select');
    percentageSelect.innerHTML = `
        <option value="25">25%</option>
        <option value="50">50%</option>
        <option value="75">75%</option>
        <option value="100">100%</option>
    `;
    percentageSelect.value = initialPercentage;

    percentageSelect.onchange = function() {
        const totalPercentage = Array.from(container.querySelectorAll('.percentage-select'))
            .reduce((total, select) => total + parseInt(select.value), 0);

        if (totalPercentage > 100) {
            alert("Total percentage exceeds 100%. Removing the last lender added.");
            container.removeChild(lenderGroup);
        } else if (totalPercentage < 100 && container.children.length < 4) {
            addSplitDropdown(container, 100 - totalPercentage, verticalMarket);
        }
    };

    lenderGroup.appendChild(percentageSelect);
    container.appendChild(lenderGroup);
}

function updateSelectedLenders() {
    selectedLenders = Array.from(document.querySelectorAll('.lender-select'))
        .map(select => select.value)
        .filter(value => value !== '');

    document.querySelectorAll('.lender-select').forEach(select => {
        const selectedValue = select.value;
        const verticalMarket = document.getElementById('verticalMarket').value;
        const allLenders = [...lendersByVertical[verticalMarket], ...globalLenders];

        select.innerHTML = '<option value="" disabled>Select a lender</option>';
        select.innerHTML += allLenders
            .filter(lender => !selectedLenders.includes(lender) || lender === selectedValue)
            .map(lender => `<option value="${lender}" ${lender === selectedValue ? 'selected' : ''}>${lender}</option>`)
            .join('');
    });
}

function toggleConfigMenu() {
    const configMenuContent = document.getElementById('configMenuContent');
    configMenuContent.style.display = configMenuContent.style.display === 'block' ? 'none' : 'block';
}

// Save and Load functionality, Create and Download JSON functionality...

// Event listeners for save, load, delete, download, and launch demo
document.getElementById('saveConfigBtn').addEventListener('click', () => {
    const configName = prompt("Enter a name for this configuration:");
    if (configName) {
        saveConfiguration(configName);
    }
});

document.getElementById('loadConfigBtn').addEventListener('click', () => {
    const configName = document.getElementById('configSelect').value;
    if (configName) {
        loadConfiguration(configName);
    }
});

document.getElementById('deleteConfigBtn').addEventListener('click', () => {
    const configName = document.getElementById('configSelect').value;
    if (configName) {
        deleteConfiguration(configName);
    }
});

document.getElementById('launchDemoBtn').addEventListener('click', () => {
    createAndLaunchDemo();
});

document.getElementById('downloadJsonBtn').addEventListener('click', () => {
    downloadJSON();
});
