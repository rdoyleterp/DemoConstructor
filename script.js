<script>
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

            // Add the initial lender dropdown with a result dropdown
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

            addButton.onclick = function() {
                if (lenderCount < 3) {  // Allows for 2 additional lenders (total of 3)
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

            // Add lender dropdown
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

            // Add result dropdown to the right of the lender dropdown
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

            // Add lender dropdown
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

            // Create percentage dropdown
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
                } else if (totalPercentage < 100 && container.children.length < 4) {  // Ensure only one more dropdown can be added
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

        // Save the current configuration to localStorage
        function saveConfiguration(name) {
            const configuration = {
                verticalMarket: document.getElementById('verticalMarket').value,
                financingAmount: document.getElementById('financingAmount').value,
                tiers: []
            };

            for (let i = 1; i <= 3; i++) {
                const tierConfig = document.getElementById(`tier${i}Config`).value;
                const tierLenders = Array.from(document.querySelectorAll(`#tier${i}Content .lender-group .lender-select`))
                    .map(select => select.value);
                const tierResults = Array.from(document.querySelectorAll(`#tier${i}Content .lender-group .result-select`))
                    .map(select => select.value);

                configuration.tiers.push({
                    config: tierConfig,
                    lenders: tierLenders,
                    results: tierResults
                });
            }

            localStorage.setItem(name, JSON.stringify(configuration));
            alert(`Configuration "${name}" saved successfully!`);
            updateConfigDropdown(); // Update the configuration dropdown after saving
        }

        // Load a configuration from localStorage
        function loadConfiguration(name) {
            const configuration = JSON.parse(localStorage.getItem(name));

            if (configuration) {
                document.getElementById('verticalMarket').value = configuration.verticalMarket;
                document.getElementById('financingAmount').value = configuration.financingAmount;
                resetTiers(); // Reset the tiers before loading the configuration

                configuration.tiers.forEach((tier, index) => {
                    const tierNumber = index + 1;
                    document.getElementById(`tier${tierNumber}Config`).value = tier.config;
                    handleTierChange(tierNumber); // To update the tier's content based on its configuration

                    tier.lenders.forEach((lender, lenderIndex) => {
                        if (lenderIndex === 0) {
                            // The first lender dropdown was already added by handleTierChange
                            const lenderSelects = document.querySelectorAll(`#tier${tierNumber}Content .lender-select`);
                            lenderSelects[lenderIndex].value = lender;
                        } else {
                            // Add subsequent lender dropdowns
                            const container = document.getElementById(`tier${tierNumber}Content`);
                            addLenderAndResultDropdown(container, configuration.verticalMarket);
                            const lenderSelects = document.querySelectorAll(`#tier${tierNumber}Content .lender-select`);
                            lenderSelects[lenderIndex].value = lender;
                        }
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

        // Delete a configuration from localStorage
        function deleteConfiguration(name) {
            localStorage.removeItem(name);
            alert(`Configuration "${name}" deleted successfully!`);
            updateConfigDropdown(); // Update the configuration dropdown after deletion
        }

        // Update the configuration dropdown with available saved configurations
        function updateConfigDropdown() {
            const configSelect = document.getElementById('configSelect');
            configSelect.innerHTML = '<option value="" disabled selected>Select Configuration</option>';

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key !== 'demoConfiguration') { // Exclude the demoConfiguration key
                    configSelect.innerHTML += `<option value="${key}">${key}</option>`;
                }
            }
        }

        // Preload configurations on page load
        window.onload = function() {
            updateConfigDropdown(); // Populate the dropdown with saved configurations
            // Optional: Automatically load a default configuration if desired
            const preloadedConfig = localStorage.getItem('defaultConfig');
            if (preloadedConfig) {
                loadConfiguration('defaultConfig');
            }
        };

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
            const demoConfiguration = {
                verticalMarket: document.getElementById('verticalMarket').value,
                financingAmount: document.getElementById('financingAmount').value,
                tiers: []
            };

            for (let i = 1; i <= 3; i++) {
                const tierConfig = document.getElementById(`tier${i}Config`).value;
                const tierLenders = Array.from(document.querySelectorAll(`#tier${i}Content .lender-select`))
                    .map(select => select.value);
                const tierResult = document.getElementById(`tier${i}Result`).value;

                demoConfiguration.tiers.push({
                    config: tierConfig,
                    lenders: tierLenders,
                    result: tierResult
                });
            }

            localStorage.setItem('demoConfiguration', JSON.stringify(demoConfiguration));
            alert("JSON created and demo launched!");
            console.log(JSON.stringify(demoConfiguration, null, 2)); // Outputs the JSON to the console
        });

        document.getElementById('downloadJsonBtn').addEventListener('click', () => {
            const demoConfiguration = {
                verticalMarket: document.getElementById('verticalMarket').value,
                financingAmount: document.getElementById('financingAmount').value,
                tiers: []
            };

            for (let i = 1; i <= 3; i++) {
                const tierConfig = document.getElementById(`tier${i}Config`).value;
                const tierLenders = Array.from(document.querySelectorAll(`#tier${i}Content .lender-select`))
                    .map(select => select.value);
                const tierResult = document.getElementById(`tier${i}Result`).value;

                demoConfiguration.tiers.push({
                    config: tierConfig,
                    lenders: tierLenders,
                    result: tierResult
                });
            }

            const jsonStr = JSON.stringify(demoConfiguration, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'demoConfiguration.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    </script>
