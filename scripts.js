const lendersByVertical = {
    retail: ["Wells Fargo", "EasyPay", "Acima"],
    electiveMedical: ["Care Credit", "Fortiva", "HFD"],
    homeImprovement: ["Service", "Greensky", "BreadPay"]
};

const globalLenders = ["TD Bank", "Concora"];
let selectedLenders = [];

// Reset all tiers when a vertical market changes
function resetTiers() {
    selectedLenders = [];
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`tier${i}Config`).value = "";
        document.getElementById(`tier${i}Content`).innerHTML = "";
        document.getElementById(`tier${i}Result`).value = "";
        document.getElementById(`tier${i}Designation`).value = "";
        document.getElementById(`subTier${i}Content`).innerHTML = "";
        document.getElementById(`subTier${i}Content`).classList.add('hidden');
    }
}

// Handle changes in the tier designation (Pre-Qualification or Full Apply)
function handleDesignationChange(tierNumber) {
    const designation = document.getElementById(`tier${tierNumber}Designation`).value;
    const tierResult = document.getElementById(`tier${tierNumber}Result`);
    
    // Clear previous result if designation changes
    tierResult.value = "";
    document.getElementById(`subTier${tierNumber}Content`).classList.add('hidden');
}

// Handle changes in the tier result
function handleResultChange(tierNumber) {
    const designation = document.getElementById(`tier${tierNumber}Designation`).value;
    const result = document.getElementById(`tier${tierNumber}Result`).value;
    const subTierContent = document.getElementById(`subTier${tierNumber}Content`);

    if (designation === "preQualification" && result === "offer") {
        // Populate sub-tier content for Full Apply decisioning
        subTierContent.innerHTML = `
            <h3>Sub-Tier: Full Apply Decision</h3>
            <div class="form-group">
                <label for="subTier${tierNumber}Result">Full Apply Result:</label>
                <select id="subTier${tierNumber}Result">
                    <option value="" disabled selected>Select Result</option>
                    <option value="offer">Offer</option>
                    <option value="no-offer">No Offer</option>
                    <option value="pending">Decision Pending</option>
                </select>
            </div>
        `;
        subTierContent.classList.remove('hidden');
    } else {
        subTierContent.innerHTML = "";
        subTierContent.classList.add('hidden');
    }
}

// Handle changes in the tier configuration dropdown
function handleTierChange(tierNumber) {
    const verticalMarket = document.getElementById('verticalMarket').value;
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    tierContent.innerHTML = ''; // Clear previous content

    const selectedConfig = document.getElementById(`tier${tierNumber}Config`).value;
    const bottomResult = document.getElementById(`tier${tierNumber}Result`);

    if (selectedConfig === 'standard') {
        // Populate a single lender dropdown
        addLenderDropdown(tierContent, verticalMarket);
        bottomResult.style.display = "block"; // Show the result dropdown
    } else if (selectedConfig === 'marketplace') {
        // Populate a lender dropdown and an "Add Lender" button
        addMarketplaceTier(tierContent, verticalMarket);
        bottomResult.style.display = "none"; // Hide the result dropdown
    } else if (selectedConfig === 'split') {
        // Populate the split configuration with lender dropdown and percentage fields
        addSplitDropdown(tierContent, 100, verticalMarket);
        bottomResult.style.display = "block"; // Show the result dropdown
    }
}

// Add a lender dropdown for standard configuration
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

    lenderSelect.onchange = function () {
        updateSelectedLenders();
    };

    if (beforeElement) {
        container.insertBefore(lenderSelect, beforeElement);
    } else {
        container.appendChild(lenderSelect);
    }
}

// Add lender dropdown and "Add Lender" button for marketplace configuration
function addMarketplaceTier(container, verticalMarket) {
    let lenderCount = 1;

    // Add the initial lender dropdown
    addLenderAndResultDropdown(container, verticalMarket);

    // Add the "Add Lender" button
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

    addButton.onclick = function () {
        if (lenderCount < 3) { // Allows for 2 additional lenders (total of 3)
            addLenderAndResultDropdown(container, verticalMarket, addButton);
            lenderCount++;
        }
    };

    container.appendChild(addButton);
}

// Add lender and result dropdown for marketplace and split configurations
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

    lenderSelect.onchange = function () {
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

// Add lender and percentage dropdown for split configuration
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

    lenderSelect.onchange = function () {
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

    percentageSelect.onchange = function () {
        const totalPercentage = Array.from(container.querySelectorAll('.percentage-select'))
            .reduce((total, select) => total + parseInt(select.value), 0);

        if (totalPercentage > 100) {
            alert("Total percentage exceeds 100%. Removing the last lender added.");
            container.removeChild(lenderGroup);
        } else if (totalPercentage < 100 && container.children.length < 4) {  // Ensure only one more dropdown can be added
            addSplitDropdown(container, 100 - totalPercentage, verticalMarket);
        }
    };

    lenderGroup.appendChild(percentageSelect);
    container.appendChild(lenderGroup);
}

// Update selected lenders to avoid duplicates
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
