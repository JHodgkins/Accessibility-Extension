if (!window.accessibilityChecker) {
    window.accessibilityChecker = { contrastWarnings: [] };
}
  
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleContrast') {
        window.accessibilityChecker.contrastCheckEnabled = message.checked;
        window.accessibilityChecker.contrastLevel = parseFloat(message.contrastLevel);
        checkContrast();
    }
});
  
function checkContrast() {
    // Remove previous warnings to avoid duplicates
    window.accessibilityChecker.contrastWarnings.forEach(warning => warning.remove());
    window.accessibilityChecker.contrastWarnings = [];
  
    if (!window.accessibilityChecker.contrastCheckEnabled) return;
  
    // Target relevant elements to check for contrast
    const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
  
    elements.forEach(el => {
        const fgColor = window.getComputedStyle(el).color;
        const bgColor = getEffectiveBackgroundColor(el);
  
        // Skip elements that are hidden or have no size
        if (el.offsetParent === null) {
            return;
        }

        const contrastRatio = calculateContrast(fgColor, bgColor);
        if (contrastRatio < window.accessibilityChecker.contrastLevel) {
            highlightLowContrast(el, contrastRatio);
        }
    });
}

// Retrieve the effective background color by climbing the DOM tree
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

// Calculate contrast ratio between foreground and background colors
function calculateContrast(fgColor, bgColor) {
    const fgRGB = getRGB(fgColor);
    const bgRGB = getRGB(bgColor);
    const l1 = luminance(fgRGB);
    const l2 = luminance(bgRGB);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Extract RGB values from any color format (rgba, rgb, hex)
function getRGB(color) {
    let r, g, b;
    if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        r = parseInt(match[0]), g = parseInt(match[1]), b = parseInt(match[2]);
    } else if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    return { r, g, b };
}

// Calculate luminance for contrast calculation
function luminance({ r, g, b }) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Highlight elements with low contrast
function highlightLowContrast(el, contrastRatio) {
    el.style.outline = '3px solid yellow';

    const warning = document.createElement('div');
    warning.textContent = `⚠️ Low Contrast (${contrastRatio.toFixed(2)})`;
    warning.className = 'contrast-warning';
    document.body.appendChild(warning);

    const rect = el.getBoundingClientRect();
    warning.style.position = 'absolute';
    warning.style.left = `${rect.right + window.scrollX + 10}px`;
    warning.style.top = `${rect.top + window.scrollY}px`;
    warning.style.backgroundColor = 'yellow';
    warning.style.color = 'black';
    warning.style.padding = '5px';
    warning.style.border = '1px solid black';
    warning.style.borderRadius = '4px';
    warning.style.zIndex = '10000';

    window.accessibilityChecker.contrastWarnings.push(warning);
}
