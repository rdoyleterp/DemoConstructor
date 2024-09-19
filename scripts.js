const lendersByVertical = {
    retail: ["Wells Fargo", "EasyPay", "Acima"],
    electiveMedical: ["Care Credit", "Fortiva", "HFD"],
    homeImprovement: ["Service", "Greensky", "BreadPay"]
};

const globalLenders = ["TD Bank", "Concora"];
let selectedLenders = [];

// Resets tiers when vertical market is changed
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

// Handles changes to each tier based on the selected configuration
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

// Adds lender dropdown and corresponding result dropdown for Standard and Marketplace
function addLenderDropdown(container, verticalMarket, tierNumber) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');

    // Lender dropdown
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

    // Result dropdown for each lender
    const resultSelect = document.createElement('select');
    resultSelect.classList.add('result-select');
    resultSelect.innerHTML = `
        <option value="" disabled selected>Select Result</option>
        <option value="offer">Offer</option>
        <option value="no-offer">No Offer</option>
        <option value="pending">Decision Pending</option>
    `;
    resultSelect.onchange = function() {
        checkSubTier(tierNumber); // Check the sub-tier logic when the result is selected
    };
    lenderGroup.appendChild(resultSelect);

    container.appendChild(lenderGroup);
}

// Marketplace configuration with ability to add more lenders
function addMarketplaceTier(container, verticalMarket, tierNumber) {
    let lenderCount = 1;

    // Add initial lender and result dropdown
    addLenderDropdown(container, verticalMarket, tierNumber);

    // Add "Add Lender" button
    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-lender');
    addButton.innerText = '+ Add Lender';
    addButton.onclick = function () {
        if (lenderCount < 3) {
            addLenderDropdown(container, verticalMarket, tierNumber);
            lenderCount++;
        }
    };

    container.appendChild(addButton);
}

// Split configuration logic
function addSplitDropdown(container, initialPercentage, verticalMarket, tierNumber) {
    const lenderGroup = document.createElement('div');
    lenderGroup.classList.add('lender-group');

    // Add lender dropdown
    addLenderDropdown(lenderGroup, verticalMarket, tierNumber);

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

// Avoid duplicate lender selections across tiers
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

// Check if sub-tier should appear for full apply decisioning, based on lenders set to "offer"
function checkSubTier(tierNumber) {
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    const subTierContainer = document.getElementById(`subTier${tierNumber}Content`);
    subTierContainer.innerHTML = ''; // Clear previous content

    const lenderGroups = tierContent.querySelectorAll('.lender-group');
    let hasOffer = false;

    // Loop through each lender group in the tier
    lenderGroups.forEach((group, index) => {
        const lenderSelect = group.querySelector('.lender-select');
        const resultSelect = group.querySelector('.result-select');

        if (resultSelect.value === 'offer') {
            hasOffer = true;
            const lenderName = lenderSelect.value;

            // Create sub-tier section for this lender
            const subTierLenderGroup = document.createElement('div');
            subTierLenderGroup.classList.add('sub-tier-lender');
            
            // Sub-tier title
            const subTierTitle = document.createElement('h3');
            subTierTitle.innerText = `Full Apply Configuration for ${lenderName}`;
            subTierLenderGroup.appendChild(subTierTitle);

            // Full Apply result dropdown
            const fullApplyResultSelect = document.createElement('select');
            fullApplyResultSelect.classList.add('result-select');
            fullApplyResultSelect.innerHTML = `
                <option value="" disabled selected>Select Full Apply Result</option>
                <option value="full-apply-offer">Full Apply Offer</option>
                <option value="full-apply-decline">Full Apply Decline</option>
                <option value="full-apply-pending">Full Apply Decision Pending</option>
            `;
            subTierLenderGroup.appendChild(fullApplyResultSelect);

            // Approved Amount input (only shown if Full Apply Offer is selected)
            const approvedAmountInput = document.createElement('input');
            approvedAmountInput.type = 'number';
            approvedAmountInput.placeholder = 'Enter Approved Amount';
            approvedAmountInput.classList.add('approved-amount-input');
            approvedAmountInput.style.display = 'none'; // Hide by default

            fullApplyResultSelect.onchange = function () {
                if (fullApplyResultSelect.value === 'full-apply-offer') {
                    approvedAmountInput.style.display = 'block'; // Show amount input when offer
                } else {
                    approvedAmountInput.style.display = 'none'; // Hide otherwise
                }
            };
            subTierLenderGroup.appendChild(approvedAmountInput);

            subTierContainer.appendChild(subTierLenderGroup);
        }
    });

    if (hasOffer) {
        subTierContainer.classList.remove('hidden'); // Show sub-tier if there are offers
    } else {
        subTierContainer.classList.add('hidden'); // Hide sub-tier if no offers
    }
}

// Handle the addition of a lender based on marketplace or split settings
function handleLenderSelectionChange(tierNumber) {
    const subTierContainer = document.getElementById(`subTier${tierNumber}Content`);
    subTierContainer.classList.add('hidden'); // Hide sub-tier initially
}
