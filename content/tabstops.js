chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleTabStops') {
        showTabStops(message.checked);
    } else if (message.action === 'resetAll') {
        resetTabStops();
    }
});

function isHiddenElement(element) {
    const style = window.getComputedStyle(element);
    const isClipped = style.clip === 'rect(0px, 0px, 0px, 0px)' || 
                     style.clip === 'rect(0 0 0 0)';
    const isHiddenByPosition = style.position === 'absolute' && 
                              (style.left === '-999px' || 
                               style.left === '-9999px' || 
                               parseInt(style.left) < -90);
    const hasZeroSize = element.offsetWidth === 0 && element.offsetHeight === 0;
    const isHiddenByVisibility = style.visibility === 'hidden' || 
                                style.display === 'none';

    return (isClipped || isHiddenByPosition || hasZeroSize) && !isHiddenByVisibility;
}

function showTabStops(enabled) {
    resetTabStops();
    if (!enabled) return;

    // Create container for descriptions (hidden from view but available to screen readers)
    const descriptionsContainer = document.createElement('div');
    descriptionsContainer.id = 'tab-stop-descriptions';
    descriptionsContainer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;';
    document.body.appendChild(descriptionsContainer);

    // Get all focusable elements
    const focusableElements = Array.from(document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]'))
        .filter(el => {
            const tabindex = el.getAttribute('tabindex');
            return tabindex === null || parseInt(tabindex) >= 0;
        });

    // Sort elements by tabindex
    focusableElements.sort((a, b) => {
        const aIndex = a.getAttribute('tabindex');
        const bIndex = b.getAttribute('tabindex');
        if (aIndex === null && bIndex === null) return 0;
        if (aIndex === null) return 1;
        if (bIndex === null) return -1;
        return parseInt(aIndex) - parseInt(bIndex);
    });

    // Create container for revealed hidden elements
    const revealedContainer = document.createElement('div');
    revealedContainer.className = 'revealed-hidden-elements';
    revealedContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f0f8ff;
        border-bottom: 2px solid #000;
        padding: 10px;
        z-index: 10000;
        display: flex;
        gap: 20px;
        align-items: center;
    `;
    document.body.insertBefore(revealedContainer, document.body.firstChild);

    // Add label for revealed elements
    const label = document.createElement('div');
    label.textContent = 'Hidden focusable elements:';
    label.style.fontWeight = 'bold';
    revealedContainer.appendChild(label);

    // Process each focusable element
    focusableElements.forEach((el, index) => {
        const isHidden = isHiddenElement(el);
        const tabStopNumber = index + 1;
        
        // Create description for screen readers
        const description = document.createElement('div');
        description.id = `tab-stop-desc-${tabStopNumber}`;
        description.textContent = `Tab stop number ${tabStopNumber}`;
        descriptionsContainer.appendChild(description);
        
        // Add aria-describedby to the element
        const existingDescribedby = el.getAttribute('aria-describedby');
        el.setAttribute('aria-describedby', 
            existingDescribedby 
                ? `${existingDescribedby} tab-stop-desc-${tabStopNumber}`
                : `tab-stop-desc-${tabStopNumber}`
        );
        
        // Create tab order indicator
        const indicator = document.createElement('div');
        indicator.className = 'tab-order-indicator';
        indicator.textContent = tabStopNumber;
        
        if (isHidden) {
            // Style for hidden elements
            indicator.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #800080;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                margin-right: 5px;
                font-size: 12px;
            `;
            
            // Create a visible version of the hidden element
            const revealedElement = document.createElement('div');
            revealedElement.style.cssText = `
                display: inline-flex;
                align-items: center;
                background: white;
                padding: 5px 10px;
                border: 2px solid #800080;
                border-radius: 4px;
                font-size: 14px;
                color: #800080;
            `;
            
            // Combine indicator and element text
            const elementText = el.textContent.trim() || el.value || el.getAttribute('aria-label') || 'Unnamed element';
            revealedElement.appendChild(indicator);
            revealedElement.appendChild(document.createTextNode(elementText));
            
            // Add to container
            revealedContainer.appendChild(revealedElement);
            
            // Store reference for cleanup
            el.dataset.hasRevealedVersion = 'true';
        } else {
            // Style for visible elements
            indicator.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: blue;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 12px;
                margin-right: 5px;
            `;

            // Create wrapper for inline display
            const wrapper = document.createElement('span');
            wrapper.style.cssText = `
                display: inline-flex;
                align-items: center;
                margin-right: 5px;
            `;
            wrapper.appendChild(indicator);

            // Insert wrapper before the element's content
            if (el.firstChild) {
                el.insertBefore(wrapper, el.firstChild);
            } else {
                el.appendChild(wrapper);
            }
            
            // Add outline to visible element
            el.style.outline = '2px dashed blue';
        }
        
        // Store indicator reference
        el.dataset.tabOrderIndicator = 'true';
    });

    // Only show the revealed container if there are hidden elements
    if (!revealedContainer.querySelector('.tab-order-indicator')) {
        revealedContainer.remove();
    }
}

function resetTabStops() {
    // Remove all indicators and outlines
    document.querySelectorAll('[data-tab-order-indicator]').forEach(el => {
        el.style.outline = '';
        // Remove aria-describedby for tab stops
        const describedby = el.getAttribute('aria-describedby');
        if (describedby) {
            const descriptions = describedby.split(' ').filter(id => !id.startsWith('tab-stop-desc-'));
            if (descriptions.length > 0) {
                el.setAttribute('aria-describedby', descriptions.join(' '));
            } else {
                el.removeAttribute('aria-describedby');
            }
        }
        delete el.dataset.tabOrderIndicator;
    });

    // Remove all revealed elements container
    document.querySelectorAll('.revealed-hidden-elements').forEach(el => el.remove());

    // Remove all indicators
    document.querySelectorAll('.tab-order-indicator').forEach(el => el.remove());

    // Remove descriptions container
    const descriptionsContainer = document.getElementById('tab-stop-descriptions');
    if (descriptionsContainer) {
        descriptionsContainer.remove();
    }
}