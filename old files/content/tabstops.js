
if (!window.accessibilityChecker) {
    window.accessibilityChecker = { tabStopLabels: [] };
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleTabStops') {
        window.accessibilityChecker.tabStopsVisible = message.checked;
        showTabStops();
    } else if (message.action === 'resetTabStops') {
        resetTabStops();
    }
});

function showTabStops() {
    resetTabStops();
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    let index = 1;

    focusableElements.forEach((el) => {
        if (el.offsetParent === null || el.tabIndex < 0) return;

        el.style.outline = '2px dashed blue';
        const label = document.createElement('div');
        label.textContent = index++;
        label.className = 'tab-stop-label';
        document.body.appendChild(label);

        const rect = el.getBoundingClientRect();
        label.style.position = 'absolute';
        label.style.left = `${rect.left + window.scrollX}px`;
        label.style.top = `${rect.top + window.scrollY}px`;

        window.accessibilityChecker.tabStopLabels.push(label);
    });
}

function resetTabStops() {
    window.accessibilityChecker.tabStopLabels.forEach(label => label.remove());
    window.accessibilityChecker.tabStopLabels = [];
    document.querySelectorAll('a, button, input, textarea, select')
        .forEach(el => el.style.outline = 'none');
}
