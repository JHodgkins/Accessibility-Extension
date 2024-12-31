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

function showHeadings(enabled) {
    resetHeadings();
    if (!enabled) return;

    // Create container for descriptions (hidden from view but available to screen readers)
    const descriptionsContainer = document.createElement('div');
    descriptionsContainer.id = 'heading-descriptions';
    descriptionsContainer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;';
    document.body.appendChild(descriptionsContainer);

    // Find all heading elements and elements with role="heading"
    const headings = [
        ...document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        ...document.querySelectorAll('[role="heading"]')
    ];

    headings.forEach((heading, index) => {
        // Get the heading level
        let level;
        if (heading.hasAttribute('aria-level')) {
            level = parseInt(heading.getAttribute('aria-level'));
        } else if (heading.tagName.startsWith('H')) {
            level = parseInt(heading.tagName[1]);
        } else {
            // Default level is 2 per ARIA spec if not specified
            level = 2;
        }

        // Create description for screen readers
        const description = document.createElement('div');
        description.id = `heading-desc-${index}`;
        const isAriaHeading = heading.getAttribute('role') === 'heading';
        description.textContent = `Highlighted heading level ${level}${isAriaHeading ? ' (ARIA heading)' : ''}`;
        descriptionsContainer.appendChild(description);

        // Add aria-describedby to the heading
        const existingDescribedby = heading.getAttribute('aria-describedby');
        heading.setAttribute('aria-describedby',
            existingDescribedby
                ? `${existingDescribedby} heading-desc-${index}`
                : `heading-desc-${index}`
        );

        // Create outline based on heading level
        const outline = document.createElement('div');
        outline.className = 'heading-indicator outline';
        outline.style.cssText = `
            position: absolute;
            border: 2px solid #4CAF50;
            border-radius: 4px;
            padding: 4px;
            margin: -4px;
            pointer-events: none;
            z-index: 9999;
        `;

        // Create level indicator
        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'heading-level';
        levelIndicator.textContent = 'H' + level;
        levelIndicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            background: #4CAF50;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            font-weight: bold;
            margin-right: 5px;
        `;

        // Add source indicator if it's an ARIA heading
        if (isAriaHeading) {
            levelIndicator.textContent += ' (ARIA)';
            outline.style.borderStyle = 'dashed';
        }

        // Create wrapper for inline display
        const wrapper = document.createElement('span');
        wrapper.className = 'heading-indicator wrapper';
        wrapper.style.cssText = `
            display: inline-flex;
            align-items: center;
            margin-right: 5px;
        `;
        wrapper.appendChild(levelIndicator);

        // Insert wrapper before the heading's content
        if (heading.firstChild) {
            heading.insertBefore(wrapper, heading.firstChild);
        } else {
            heading.appendChild(wrapper);
        }

        // Add outline
        const rect = heading.getBoundingClientRect();
        outline.style.width = rect.width + 'px';
        outline.style.height = rect.height + 'px';
        outline.style.top = rect.top + window.scrollY + 'px';
        outline.style.left = rect.left + window.scrollX + 'px';

        // Add to the page
        document.body.appendChild(outline);
        heading.dataset.hasHeadingIndicator = 'true';
    });
}

function resetHeadings() {
    // Remove all heading indicators (outlines and wrappers)
    document.querySelectorAll('.heading-indicator').forEach(el => el.remove());

    // Clean up elements that had indicators
    document.querySelectorAll('[data-has-heading-indicator]').forEach(el => {
        // Remove aria-describedby for headings
        const describedby = el.getAttribute('aria-describedby');
        if (describedby) {
            const descriptions = describedby.split(' ').filter(id => !id.startsWith('heading-desc-'));
            if (descriptions.length > 0) {
                el.setAttribute('aria-describedby', descriptions.join(' '));
            } else {
                el.removeAttribute('aria-describedby');
            }
        }
        delete el.dataset.hasHeadingIndicator;
    });

    // Remove descriptions container
    const descriptionsContainer = document.getElementById('heading-descriptions');
    if (descriptionsContainer) {
        descriptionsContainer.remove();
    }
}
