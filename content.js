if (!window.accessibilityChecker) {
  window.accessibilityChecker = {
    headingsVisible: false,
    tabStopsVisible: false,
    contrastCheckEnabled: false,
    contrastLevel: 4.5,
    tabStopLabels: [],
    contrastWarnings: [],
    headingLabels: []
  };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleHeadings') {
    window.accessibilityChecker.headingsVisible = message.checked;
    showHeadings();
  }
  if (message.action === 'toggleTabStops') {
    window.accessibilityChecker.tabStopsVisible = message.checked;
    showTabStops();
  }
  if (message.action === 'toggleContrast') {
    window.accessibilityChecker.contrastCheckEnabled = message.checked;
    window.accessibilityChecker.contrastLevel = parseFloat(message.contrastLevel);
    checkContrast();
  }
});

// Show headings and their levels
function showHeadings() {
  // Remove existing heading labels to prevent duplication
  window.accessibilityChecker.headingLabels.forEach(label => label.remove());
  window.accessibilityChecker.headingLabels = [];

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading) => {
    if (window.accessibilityChecker.headingsVisible) {
      heading.style.outline = '2px solid red';

      // Create label showing heading level
      const label = document.createElement('div');
      label.textContent = heading.tagName;
      label.className = 'heading-label';
      document.body.appendChild(label);

      // Position label near heading
      const rect = heading.getBoundingClientRect();
      label.style.position = 'absolute';
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.top = `${rect.top + window.scrollY - 20}px`;
      label.style.backgroundColor = 'red';
      label.style.color = 'white';
      label.style.padding = '2px 5px';
      label.style.fontSize = '14px';
      label.style.borderRadius = '4px';
      label.style.zIndex = '9999';

      window.accessibilityChecker.headingLabels.push(label);
    } else {
      heading.style.outline = 'none';
    }
  });
}

// Show tab stops and their order
function showTabStops() {
  window.accessibilityChecker.tabStopLabels.forEach(label => label.remove());
  window.accessibilityChecker.tabStopLabels = [];

  let focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  let index = 1;

  focusableElements.forEach((el) => {
    if (window.accessibilityChecker.tabStopsVisible) {
      el.style.outline = '2px dashed blue';

      // Create label showing tab order
      const label = document.createElement('div');
      label.textContent = index++;
      label.className = 'tab-stop-label';
      document.body.appendChild(label);

      const rect = el.getBoundingClientRect();
      label.style.position = 'absolute';
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.top = `${rect.top + window.scrollY}px`;
      label.style.backgroundColor = 'blue';
      label.style.color = 'white';
      label.style.padding = '2px 5px';
      label.style.fontSize = '14px';
      label.style.borderRadius = '4px';
      label.style.zIndex = '9999';

      window.accessibilityChecker.tabStopLabels.push(label);
    } else {
      el.style.outline = 'none';
    }
  });
}

// Check for contrast issues across elements
function checkContrast() {
  window.accessibilityChecker.contrastWarnings.forEach(warning => warning.remove());
  window.accessibilityChecker.contrastWarnings = [];

  if (!window.accessibilityChecker.contrastCheckEnabled) return;

  const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');

  elements.forEach(el => {
    const fgColor = window.getComputedStyle(el).color;
    const bgColor = getEffectiveBackgroundColor(el);

    // Skip if the element or parent is hidden
    if (!fgColor || bgColor === 'rgba(0, 0, 0, 0)' || el.offsetParent === null) {
      return;
    }

    const contrastRatio = calculateContrast(fgColor, bgColor);

    if (contrastRatio < window.accessibilityChecker.contrastLevel) {
      highlightLowContrast(el, contrastRatio);
    }
  });
}

// Get effective background color by climbing up the DOM tree
function getEffectiveBackgroundColor(el) {
  while (el && el !== document.documentElement) {
    const bgColor = window.getComputedStyle(el).backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor;
    }
    el = el.parentElement;
  }
  return 'rgb(255, 255, 255)';  // Default to white if none found
}

// Highlight low contrast elements
function highlightLowContrast(el, contrastRatio) {
  el.style.outline = '3px solid yellow';

  const dot = document.createElement('div');
  dot.className = 'contrast-dot';
  document.body.appendChild(dot);

  const rect = el.getBoundingClientRect();
  dot.style.left = `${rect.left + window.scrollX}px`;
  dot.style.top = `${rect.top + window.scrollY}px`;

  const warning = document.createElement('div');
  warning.textContent = `⚠️ Low Contrast (${contrastRatio.toFixed(2)})`;
  warning.className = 'contrast-warning';
  document.body.appendChild(warning);

  warning.style.left = `${rect.right + window.scrollX + 10}px`;
  warning.style.top = `${rect.top + window.scrollY}px`;

  drawArrow(dot, warning);
  window.accessibilityChecker.contrastWarnings.push(dot, warning);
}

// Draw arrow from the dot to the warning
function drawArrow(startEl, endEl) {
  const startRect = startEl.getBoundingClientRect();
  const endRect = endEl.getBoundingClientRect();

  const arrow = document.createElement('div');
  arrow.className = 'contrast-arrow';
  document.body.appendChild(arrow);

  arrow.style.width = `${Math.hypot(endRect.left - startRect.left, endRect.top - startRect.top)}px`;
  arrow.style.height = '2px';
  arrow.style.backgroundColor = 'red';
  arrow.style.transformOrigin = 'top left';
  arrow.style.position = 'absolute';

  const angle = Math.atan2(
    endRect.top - startRect.top,
    endRect.left - startRect.left
  );

  arrow.style.transform = `rotate(${angle}rad)`;
  arrow.style.left = `${startRect.left + window.scrollX}px`;
  arrow.style.top = `${startRect.top + window.scrollY}px`;

  window.accessibilityChecker.contrastWarnings.push(arrow);
}
