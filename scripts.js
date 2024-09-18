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

    // Only show sub-tier if designation is Pre-Qualification and result is Offer
    if (designation === 'preQualification' && result === 'offer') {
        const lendersInTier = document.querySelectorAll(`#tier${tierNumber}Content .lender-select`);
        const resultsInTier = document.querySelectorAll(`#tier${tierNumber}Content .result-select`);
        const subTierHtml = [];

        lendersInTier.forEach((lenderSelect, index) => {
            const lenderName = lenderSelect.value;
            const lenderResult = resultsInTier[index].value;

            if (lenderResult === 'offer') {
                // Display lender name, full apply result dropdown, and approved amount field
                subTierHtml.push(`
                    <div class="sub-tier-lender">
                        <label>${lenderName} (Full Apply Result)</label>
                        <select class="full-apply-result">
                            <option value="" disabled selected>Select Full Apply Result</option>
                            <option value="full-apply-offer">Full Apply Offer</option>
                            <option value="full-apply-decline">Full Apply Decline</option>
                            <option value="full-apply-pending">Full Apply Decision Pending</option>
                        </select>
                        <input type="number" class="approved-amount" placeholder="Approved Amount" min="0" />
                    </div>
                `);
            }
        });

        subTierContent.innerHTML = subTierHtml.join('');
        subTierContent.classList.remove('hidden');
    } else {
        subTierContent.classList.add('hidden');
        subTierContent.innerHTML = '';
    }
}

// Handle changes in the tier configuration
function handleTierChange(tierNumber) {
    const verticalMarket = document.getElementById('verticalMarket').value;
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    tierContent.innerHTML = ''; // Clear previous content

    const selectedConfig = document.getElementById(`tier${tierNumber}Config`).value;

    if (selectedConfig === 'standard') {
        addLenderDropdown(tierContent, verticalMarket);
    } else if (selectedConfig === 'marketplace') {
        addMarketplaceTier(tierContent, verticalMarket);
    } else if (selectedConfig === 'split') {
        addSplitDropdown(tierContent, 100, verticalMarket);
    }
}

// Add lender dropdown to a tier
function addLenderDropdown(container, verticalMarket) {
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

    container.appendChild(lenderSelect);

    // Add result dropdown to the right of the lender dropdown
    const resultSelect = document.createElement('select');
    resultSelect.classList.add('result-select');
    resultSelect.innerHTML = `
        <option value="" disabled selected>Select Result</option>
        <option value="offer">Offer</option>
        <option value="no-offer">No Offer</option>
        <option value="pending">Decision Pending</option>
    `;

    container.appendChild(resultSelect);
}

// Handle Marketplace configuration by adding multiple lenders
function addMarketplaceTier(container, verticalMarket) {
    let lenderCount = 1;

    // Add the initial lender dropdown with a result dropdown
    addLenderDropdown(container, verticalMarket);

    // Add the "Add Lender" button
    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-lender');
    addButton.innerText = '+ Add Lender';
    addButton.onclick = function () {
        if (lenderCount < 3) {  // Allows for 2 additional lenders (total of 3)
            addLenderDropdown(container, verticalMarket);
            lenderCount++;
        }
    };

    container.appendChild(addButton);
}

// Add lender and percentage fields for Split configuration
function addSplitDropdown(container, initialPercentage, verticalMarket) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');

    // Add lender dropdown
    addLenderDropdown(lenderGroup, verticalMarket);

    // Add percentage dropdown
    const percentageSelect = document.createElement('select');
    percentageSelect.classList.add('percentage-select');
    percentageSelect.innerHTML = `
        <option value="25">25%</option>
        <option value="50">50%</option>
        <option value="75">75%</option>
        <option value="100">100%</option>
    `;
    percentageSelect.value = initialPercentage;

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
