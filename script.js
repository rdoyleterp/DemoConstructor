function handleTierDesignation(tierNumber) {
    const designation = document.getElementById(`tier${tierNumber}Designation`).value;
    const subTier = document.getElementById(`tier${tierNumber}SubTier`);
    const outcomeDropdown = document.getElementById(`tier${tierNumber}Config`);

    if (designation === "preApproval") {
        // If the tier is pre-approval, check for offer in the outcome dropdown to show sub-tier
        subTier.style.display = outcomeDropdown.value === "offer" ? "block" : "none";
    } else {
        // Hide sub-tier if it's full apply
        subTier.style.display = "none";
    }
}

function handleTierOutcomeChange(tierNumber) {
    const designation = document.getElementById(`tier${tierNumber}Designation`).value;
    const outcome = document.getElementById(`tier${tierNumber}Config`).value;
    const subTier = document.getElementById(`tier${tierNumber}SubTier`);

    if (designation === "preApproval" && outcome === "offer") {
        // If it's pre-approval and the outcome is offer, show sub-tier
        subTier.style.display = "block";
    } else {
        subTier.style.display = "none";
    }
}

function resetTiers() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`tier${i}Designation`).value = "";
        document.getElementById(`tier${i}Config`).value = "";
        document.getElementById(`tier${i}SubTier`).style.display = "none";
    }
}
