if (!window.accessibilityChecker) {
    window.accessibilityChecker = { altTextWarnings: [] };
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleAltText') {
        window.accessibilityChecker.altTextCheckEnabled = message.checked;
        checkAltText();
    } else if (message.action === 'resetAll') {
        resetAltText();
    }
});

function checkAltText() {
    resetAltText();

    if (!window.accessibilityChecker.altTextCheckEnabled) return;

    const images = document.querySelectorAll('img');
    images.forEach(img => {
        let warning = null;
        
        // Case 1: No alt attribute
        if (!img.hasAttribute('alt')) {
            warning = createAltTextWarning(img, 'Error: Missing alt attribute', 'error');
        }
        // Case 2: Empty alt attribute
        else if (img.getAttribute('alt').trim() === '') {
            // Check if image is decorative (has role="presentation" or aria-hidden="true")
            if (img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true') {
                warning = createAltTextWarning(img, 'Info: Decorative image with empty alt text', 'info');
            } else {
                warning = createAltTextWarning(img, 'Warning: Empty alt attribute', 'warning');
            }
        }
        // Case 3: Has alt text
        else {
            const altText = img.getAttribute('alt');
            warning = createAltTextWarning(img, `Alt text: "${altText}"`, 'info');
        }

        if (warning) {
            insertAltTextWarning(img, warning);
        }
    });
}

function createAltTextWarning(img, message, type) {
    const warning = document.createElement('div');
    warning.className = 'alt-text-warning';
    warning.setAttribute('role', 'alert');
    warning.setAttribute('aria-live', 'polite');
    
    // Style based on type
    let backgroundColor;
    switch (type) {
        case 'error':
            backgroundColor = '#ff4444';
            img.style.outline = '2px solid #ff4444';
            break;
        case 'warning':
            backgroundColor = '#ffaa33';
            img.style.outline = '2px solid #ffaa33';
            break;
        case 'info':
            backgroundColor = '#4444ff';
            img.style.outline = '2px dotted #4444ff';
            break;
    }
    
    warning.style.cssText = `
        background: ${backgroundColor};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        margin: 4px 0;
        display: block;
    `;
    
    warning.textContent = message;
    
    // Add to warnings array for cleanup
    window.accessibilityChecker.altTextWarnings.push({
        warning,
        img
    });
    
    return warning;
}

function insertAltTextWarning(img, warning) {
    // Create a container for the image and warning if needed
    let container = img.parentElement;
    
    // If the image is not in a container or the container has other content,
    // wrap the image in a new container
    if (!container || container.children.length > 1) {
        container = document.createElement('div');
        container.style.display = 'inline-block';
        img.parentElement.insertBefore(container, img);
        container.appendChild(img);
    }
    
    // Add the warning after the image
    container.appendChild(warning);
    
    // Add ARIA description
    const uniqueId = 'alt-warning-' + Math.random().toString(36).substr(2, 9);
    warning.id = uniqueId;
    img.setAttribute('aria-describedby', (img.getAttribute('aria-describedby') || '') + ' ' + uniqueId);
}

function resetAltText() {
    if (window.accessibilityChecker.altTextWarnings) {
        window.accessibilityChecker.altTextWarnings.forEach(({warning, img}) => {
            // Remove aria-describedby reference
            const id = warning.id;
            if (id && img) {
                const descriptions = img.getAttribute('aria-describedby')
                    ?.split(' ')
                    .filter(desc => desc !== id)
                    .join(' ');
                
                if (descriptions) {
                    img.setAttribute('aria-describedby', descriptions);
                } else {
                    img.removeAttribute('aria-describedby');
                }
            }
            
            // Remove the outline
            if (img) {
                img.style.outline = '';
            }
            
            // Remove the warning
            warning.remove();
            
            // If image is in a container we created, unwrap it
            const container = img?.parentElement;
            if (container && container.children.length === 1) {
                container.parentNode.insertBefore(img, container);
                container.remove();
            }
        });
        window.accessibilityChecker.altTextWarnings = [];
    }
}
