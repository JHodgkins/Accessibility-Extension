if (!window.accessibilityChecker) {
    window.accessibilityChecker = { headingLabels: [] };
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleHeadings') {
        showHeadings(message.checked);
    } else if (message.action === 'resetAll') {
        resetHeadings();
    }
});

// Show headings and add labels with heading levels
function showHeadings(enabled) {
    resetHeadings();  // Clear existing labels and outlines
    if (!enabled) return;

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
        heading.style.outline = '2px solid red';

        // Create label to display heading level (H1, H2, etc.)
        const label = document.createElement('div');
        label.textContent = heading.tagName;  // Outputs "H1", "H2", etc.
        label.className = 'heading-label';

        // Position label above the heading
        const rect = heading.getBoundingClientRect();
        label.style.position = 'absolute';
        label.style.left = `${rect.left + window.scrollX}px`;
        label.style.top = `${rect.top + window.scrollY - 25}px`;  // Place slightly above the heading
        label.style.backgroundColor = 'red';
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '14px';
        label.style.zIndex = '9999';

        document.body.appendChild(label);

        // Store label to remove it later during reset
        if (!window.accessibilityChecker.headingLabels) {
            window.accessibilityChecker.headingLabels = [];
        }
        window.accessibilityChecker.headingLabels.push(label);
    });
}

// Reset and remove all heading labels and outlines
function resetHeadings() {
    // Remove floating labels
    if (window.accessibilityChecker.headingLabels) {
        window.accessibilityChecker.headingLabels.forEach(label => label.remove());
        window.accessibilityChecker.headingLabels = [];
    }

    // Remove red outlines from headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => el.style.outline = 'none');
}
