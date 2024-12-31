if (!window.accessibilityChecker) {
    window.accessibilityChecker = { contrastWarnings: [] };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleContrast') {
        window.accessibilityChecker.contrastCheckEnabled = message.checked;
        window.accessibilityChecker.contrastType = message.contrastType;
        checkContrast();
    } else if (message.action === 'resetAll') {
        resetContrast();
    }
});

// Main function to check contrast across the page
function checkContrast() {
    resetContrast();  // Clear previous warnings

    if (!window.accessibilityChecker.contrastCheckEnabled) return;

    const type = window.accessibilityChecker.contrastType;
    
    switch(type) {
        case 'largeText':
            checkLargeText();
            break;
        case 'normalText':
            checkNormalText();
            break;
        case 'uiElements':
            checkUIElements();
            break;
    }
}

function checkLargeText() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        const isBold = parseInt(styles.fontWeight) >= 700;
        
        // Large text is either 18pt/24px or 14pt/19px if bold
        if ((fontSize >= 24 || (fontSize >= 19 && isBold))) {
            const fgColor = styles.color;
            const bgColor = getEffectiveBackgroundColor(el);
            
            if (!fgColor || !bgColor || el.offsetParent === null) return;

            const contrastRatio = calculateContrast(fgColor, bgColor);
            if (contrastRatio < 3) {
                highlightLowContrast(el, contrastRatio, 'Large Text');
            }
        }
    });
}

function checkNormalText() {
    // Only select text elements that don't contain other elements or have their own text content
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                // Skip elements that are part of the contrast warnings
                if (node.classList.contains('contrast-warning')) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Skip headings and UI elements
                if (node.tagName.match(/^H[1-6]$/) || 
                    node.tagName.match(/^(INPUT|SELECT|TEXTAREA|BUTTON)$/) ||
                    node.classList.contains('icon')) {
                    return NodeFilter.FILTER_REJECT;
                }

                // Only accept nodes that have direct text content
                const hasDirectText = Array.from(node.childNodes)
                    .some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0);
                
                return hasDirectText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        }
    );

    let node;
    while (node = walker.nextNode()) {
        const styles = window.getComputedStyle(node);
        const fontSize = parseFloat(styles.fontSize);
        const isBold = parseInt(styles.fontWeight) >= 700;
        
        // Skip if it qualifies as large text
        if (fontSize >= 24 || (fontSize >= 19 && isBold)) {
            continue;
        }

        const fgColor = styles.color;
        const bgColor = getEffectiveBackgroundColor(node);
        
        if (!fgColor || !bgColor || node.offsetParent === null) continue;

        const contrastRatio = calculateContrast(fgColor, bgColor);
        if (contrastRatio < 4.5) {
            highlightLowContrast(node, contrastRatio, 'Text');
        }
    }
}

function checkUIElements() {
    // Check form field borders
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const borderColor = styles.borderColor;
        const bgColor = getEffectiveBackgroundColor(el);
        
        if (borderColor && bgColor && el.offsetParent !== null) {
            const contrastRatio = calculateContrast(borderColor, bgColor);
            if (contrastRatio < 3) {
                highlightLowContrast(el, contrastRatio, 'Border');
            }
        }
    });

    // Check icons
    const icons = document.querySelectorAll('.icon, [class*="icon-"], [class*="Icon"]');
    icons.forEach(el => {
        const styles = window.getComputedStyle(el);
        let colorToCheck;
        
        // Check background color if it's being used
        if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            colorToCheck = styles.backgroundColor;
        } 
        // Check border color if background is transparent
        else if (styles.borderColor !== 'rgba(0, 0, 0, 0)') {
            colorToCheck = styles.borderColor;
        }
        // Check color property as fallback
        else {
            colorToCheck = styles.color;
        }
        
        const bgColor = getEffectiveBackgroundColor(el);
        
        if (colorToCheck && bgColor && el.offsetParent !== null) {
            const contrastRatio = calculateContrast(colorToCheck, bgColor);
            if (contrastRatio < 3) {
                highlightLowContrast(el, contrastRatio, 'Icon');
            }
        }
    });
}

function highlightLowContrast(el, contrastRatio, type) {
    // Add red outline
    el.style.outline = '2px solid #ff4444';
    
    // Create warning span that will be inserted inline
    const warning = document.createElement('span');
    warning.className = 'contrast-warning';
    warning.setAttribute('role', 'alert');
    warning.setAttribute('aria-live', 'polite');
    
    // Style the warning
    warning.style.cssText = `
        background: #ff4444;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        margin-left: 8px;
        display: inline-block;
        vertical-align: middle;
    `;
    
    const ratio = Math.round(contrastRatio * 100) / 100;
    const warningText = `${type} Contrast: ${ratio}:1`;
    warning.textContent = warningText;
    
    // For form elements, insert after the element
    if (el.matches('input, select, textarea')) {
        if (el.nextSibling) {
            el.parentNode.insertBefore(warning, el.nextSibling);
        } else {
            el.parentNode.appendChild(warning);
        }
    }
    // For icons, wrap in a span and add warning next to it
    else if (el.matches('.icon, [class*="icon-"], [class*="Icon"]')) {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        wrapper.appendChild(warning);
    }
    // For text elements, insert warning inline after the text
    else {
        // If the element only contains text nodes, append the warning
        if (Array.from(el.childNodes).every(node => node.nodeType === Node.TEXT_NODE)) {
            el.appendChild(warning);
        } else {
            // For elements with mixed content, find the last text node
            const textNodes = Array.from(el.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            if (textNodes.length > 0) {
                const lastTextNode = textNodes[textNodes.length - 1];
                el.insertBefore(warning, lastTextNode.nextSibling);
            } else {
                el.appendChild(warning);
            }
        }
    }
    
    // Add to warnings array for cleanup
    window.accessibilityChecker.contrastWarnings.push(warning);
    
    // Add ARIA description to the element
    const uniqueId = 'contrast-warning-' + Math.random().toString(36).substr(2, 9);
    warning.id = uniqueId;
    el.setAttribute('aria-describedby', (el.getAttribute('aria-describedby') || '') + ' ' + uniqueId);
}

// Reset and clear contrast highlights
function resetContrast() {
    if (window.accessibilityChecker.contrastWarnings) {
        window.accessibilityChecker.contrastWarnings.forEach(warning => {
            // Remove aria-describedby reference
            const id = warning.id;
            if (id) {
                const described = document.querySelector(`[aria-describedby~="${id}"]`);
                if (described) {
                    const descriptions = described.getAttribute('aria-describedby')
                        .split(' ')
                        .filter(desc => desc !== id)
                        .join(' ');
                    if (descriptions) {
                        described.setAttribute('aria-describedby', descriptions);
                    } else {
                        described.removeAttribute('aria-describedby');
                    }
                }
            }
            
            // If warning is in a wrapper, unwrap the icon
            if (warning.parentElement.style.display === 'inline-flex') {
                const wrapper = warning.parentElement;
                const icon = wrapper.querySelector('.icon, [class*="icon-"], [class*="Icon"]');
                if (icon) {
                    wrapper.parentNode.insertBefore(icon, wrapper);
                    wrapper.remove();
                }
            } else {
                warning.remove();
            }
        });
        window.accessibilityChecker.contrastWarnings = [];
    }
    
    // Remove outlines
    document.querySelectorAll('[style*="outline"]').forEach(el => {
        el.style.outline = '';
    });
}

function getEffectiveBackgroundColor(el) {
    while (el && el !== document.documentElement) {
        const bgColor = window.getComputedStyle(el).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            return bgColor;
        }
        el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';  // Default to white if no background found
}

function getRGB(color) {
    let r, g, b;
    if (color.startsWith('rgb')) {
        [r, g, b] = color.match(/\d+/g).map(Number);
    } else if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    return { r, g, b };
}

function luminance({ r, g, b }) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrast(fgColor, bgColor) {
    const fgRGB = getRGB(fgColor);
    const bgRGB = getRGB(bgColor);

    const l1 = luminance(fgRGB);
    const l2 = luminance(bgRGB);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
