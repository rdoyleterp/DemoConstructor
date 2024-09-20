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
        document.getElementById(`tier${i}Designation`).value = "";
        document.getElementById(`subTier${i}Content`).innerHTML = "";
        document.getElementById(`subTier${i}Content`).classList.add('hidden');
    }
}

function handleTierChange(tierNumber) {
    const verticalMarket = document.getElementById('verticalMarket').value;
    const tierContent = document.getElementById(`tier${tierNumber}Content`);
    tierContent.innerHTML = '';

    const selectedConfig = document.getElementById(`tier${tierNumber}Config`).value;

    if (selectedConfig === 'standard') {
        addLenderDropdown(tierContent, verticalMarket, tierNumber);
    } else if (selectedConfig === 'marketplace') {
        addMarketplaceTier(tierContent, verticalMarket, tierNumber);
    } else if (selectedConfig === 'split') {
        addSplitDropdown(tierContent, 100, verticalMarket, tierNumber);
    }
}

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

function toggleAmountField(resultSelect, lenderGroup, label) {
    const existingAmountField = lenderGroup.querySelector('.amount-field');
    if (resultSelect.value === 'offer' && !existingAmountField) {
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = label;
        amountInput.classList.add('amount-field');
        lenderGroup.appendChild(amountInput);
    } else if (resultSelect.value !== 'offer' && existingAmountField) {
        existingAmountField.remove();
    }
}

function checkSubTier(tierNumber) {
    const tierDesignation = document.getElementById(`tier${tierNumber}Designation`).value;
    const results = Array.from(document.querySelectorAll(`#tier${tierNumber}Content .result-select`)).map(r => r.value);
    const subTier = document.getElementById(`subTier${tierNumber}Content`);

    if (tierDesignation === 'pre-qual' && results.includes('offer')) {
        populateSubTier(tierNumber, results);
    } else {
        subTier.innerHTML = '';
        subTier.classList.add('hidden');
    }
}

function populateSubTier(tierNumber, results) {
    const subTier = document.getElementById(`subTier${tierNumber}Content`);
    subTier.innerHTML = '';
    subTier.classList.remove('hidden');

    results.forEach((result, index) => {
        if (result === 'offer') {
            const subTierGroup = document.createElement('div');
            subTierGroup.classList.add('sub-tier-group');

            const label = document.createElement('label');
            label.textContent = `Full Apply Result for Lender ${index + 1}:`;
            subTierGroup.appendChild(label);

            const resultSelect = document.createElement('select');
            resultSelect.classList.add('result-select');
            resultSelect.innerHTML = `
                <option value="" disabled selected>Select Full Apply Result</option>
                <option value="offer">Offer</option>
                <option value="no-offer">No Offer</option>
                <option value="pending">Decision Pending</option>
            `;
            subTierGroup.appendChild(resultSelect);

            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.placeholder = 'Approved Amount';
            amountInput.classList.add('amount-field');
            subTierGroup.appendChild(amountInput);

            subTier.appendChild(subTierGroup);
        }
    });
}
