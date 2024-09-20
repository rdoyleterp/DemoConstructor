const lendersByVertical = {
    retail: ["Wells Fargo", "EasyPay", "Acima"],
    electiveMedical: ["Care Credit", "Fortiva", "HFD"],
    homeImprovement: ["Service", "Greensky", "BreadPay"]
};

const globalLenders = ["TD Bank", "Concora"];
let selectedLenders = [];

// Function to reset the tiers when the vertical market changes
function resetTiers() {
    selectedLenders = [];
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`tier${i}Config`).value = "";
        document.getElementById(`tier${i}Content`).innerHTML = "";
        document.getElementById(`tier${i}Designation`).value = "";
        document.getElementById(`subTier${i}Content`).innerHTML = "";
        document.getElementById(`subTier${i}Content`).classList.add('hidden');
    }
}

// Handles the logic for tier change based on the selection
function handleTierChange(tierNumber) {
    const verticalMarket = document.getElementById('verticalMarket').value;
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    tierContent.innerHTML = ''; // Clear previous content

    const selectedConfig = document.getElementById(`tier${tierNumber}Config`).value;

    if (selectedConfig === 'standard') {
        addLenderDropdown(tierContent, verticalMarket, tierNumber);
    } else if (selectedConfig === 'marketplace') {
        addMarketplaceTier(tierContent, verticalMarket, tierNumber);
    } else if (selectedConfig === 'split') {
        addSplitDropdown(tierContent, 100, verticalMarket, tierNumber);
    }
}

// Marketplace configuration logic
function addMarketplaceTier(container, verticalMarket, tierNumber) {
    let lenderCount = 1;
    addLenderDropdown(container, verticalMarket, tierNumber);

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-lender');
    addButton.innerText = '+ Add Lender';
    addButton.onclick = function () {
        if (lenderCount < 3) {
            addLenderDropdown(container, verticalMarket, tierNumber, addButton);
            lenderCount++;
        }
    };

    container.appendChild(addButton);
}

// Adds lender dropdown and result dropdown for tiers
function addLenderDropdown(container, verticalMarket, tierNumber, beforeElement = null) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');

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

    lenderSelect.onchange = function () {
        updateSelectedLenders();
    };
    lenderGroup.appendChild(lenderSelect);

    const resultSelect = document.createElement('select');
    resultSelect.classList.add('result-select');
    resultSelect.innerHTML = `
        <option value="" disabled selected>Select Result</option>
        <option value="offer">Offer</option>
        <option value="no-offer">No Offer</option>
        <option value="pending">Decision Pending</option>
    `;
    resultSelect.onchange = function () {
        checkSubTier(tierNumber);
        toggleAmountField(resultSelect, lenderGroup, 'Pre-qualified Amount');
    };
    lenderGroup.appendChild(resultSelect);

    if (beforeElement) {
        container.insertBefore(lenderGroup, beforeElement);
    } else {
        container.appendChild(lenderGroup);
    }
}

// Functionality for the Split configuration
function addSplitDropdown(container, initialPercentage, verticalMarket, tierNumber) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');

    addLenderDropdown(lenderGroup, verticalMarket, tierNumber);

    const percentageSelect = document.createElement('select');
    percentageSelect.classList.add('percentage-select');
    percentageSelect.innerHTML = `
        <option value="25">25%</option>
        <option value="50">50%</option>
        <option value="75">75%</option>
        <option value="100">100%</option>
    `;
    percentageSelect.value = initialPercentage;

    percentageSelect.onchange = function () {
        const totalPercentage = Array.from(container.querySelectorAll('.percentage-select'))
            .reduce((total, select) => total + parseInt(select.value), 0);

        if (totalPercentage < 100 && container.children.length < 4) {
            addSplitDropdown(container, 100 - totalPercentage, verticalMarket, tierNumber);
        }
    };

    lenderGroup.appendChild(percentageSelect);
    container.appendChild(lenderGroup);
}

// Prevents duplicate lenders across the tiers
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

// Save, Load, and Delete Configuration Functions

function saveConfiguration(name) {
    const configuration = {
        verticalMarket: document.getElementById('verticalMarket').value,
        financingAmount: document.getElementById('financingAmount').value,
        tiers: []
    };

    for (let i = 1; i <= 3; i++) {
        const tierConfig = document.getElementById(`tier${i}Config`).value;
        const tierDesignation = document.getElementById(`tier${i}Designation`).value;
        const tierLenders = Array.from(document.querySelectorAll(`#tier${i}Content .lender-group .lender-select`))
            .map(select => select.value);
        const tierResults = Array.from(document.querySelectorAll(`#tier${i}Content .lender-group .result-select`))
            .map(select => select.value);

        configuration.tiers.push({
            config: tierConfig,
            designation: tierDesignation,
            lenders: tierLenders,
            results: tierResults
        });
    }

    localStorage.setItem(name, JSON.stringify(configuration));
    alert(`Configuration "${name}" saved successfully!`);
    updateConfigDropdown(); // Update the configuration dropdown after saving
}

function loadConfiguration(name) {
    const configuration = JSON.parse(localStorage.getItem(name));

    if (configuration) {
        document.getElementById('verticalMarket').value = configuration.verticalMarket;
        document.getElementById('financingAmount').value = configuration.financingAmount;
        resetTiers(); // Reset the tiers before loading the configuration

        configuration.tiers.forEach((tier, index) => {
            const tierNumber = index + 1;
            document.getElementById(`tier${tierNumber}Config`).value = tier.config;
            document.getElementById(`tier${tierNumber}Designation`).value = tier.designation;
            handleTierChange(tierNumber); // Update tier content

            tier.lenders.forEach((lender, lenderIndex) => {
                const lenderSelects = document.querySelectorAll(`#tier${tierNumber}Content .lender-select`);
                lenderSelects[lenderIndex].value = lender;
            });

            tier.results.forEach((result, resultIndex) => {
                const resultSelects = document.querySelectorAll(`#tier${tierNumber}Content .result-select`);
                resultSelects[resultIndex].value = result;
            });
        });

        alert(`Configuration "${name}" loaded successfully!`);
    } else {
        alert(`Configuration "${name}" not found.`);
    }
}

function deleteConfiguration(name) {
    localStorage.removeItem(name);
    alert(`Configuration "${name}" deleted successfully!`);
    updateConfigDropdown(); // Update the configuration dropdown after deletion
}

// Updates the dropdown with saved configurations
function updateConfigDropdown() {
    const configSelect = document.getElementById('configSelect');
    configSelect.innerHTML = '<option value="" disabled selected>Select Configuration</option>';

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'demoConfiguration') {
            configSelect.innerHTML += `<option value="${key}">${key}</option>`;
        }
    }
}

// Preload configurations when page loads
window.onload = function () {
    updateConfigDropdown();
};

// Event Listeners for Save, Load, and Delete buttons
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
