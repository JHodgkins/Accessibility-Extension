let headingsVisible = false;
let tabStopsVisible = false;
let contrastCheckEnabled = false;
let contrastLevel = 4.5;
let tabStopLabels = [];
let contrastWarnings = [];

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleHeadings') {
    headingsVisible = message.checked;
    showHeadings();
  }
  if (message.action === 'toggleTabStops') {
    tabStopsVisible = message.checked;
    showTabStops();
  }
  if (message.action === 'toggleContrast') {
    contrastCheckEnabled = message.checked;
    contrastLevel = parseFloat(message.contrastLevel);
    checkContrast();
  }
});

function showHeadings() {
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.style.outline = headingsVisible ? '2px solid red' : 'none';
    heading.setAttribute('data-heading', heading.tagName);
  });
}

function showTabStops() {
  tabStopLabels.forEach(label => label.remove());
  tabStopLabels = [];

  let focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  let index = 1;

  focusableElements.forEach((el) => {
    if (tabStopsVisible) {
      el.style.outline = '2px dashed blue';

      const label = document.createElement('div');
      label.textContent = index++;
      label.className = 'tab-stop-label';
      document.body.appendChild(label);

      const rect = el.getBoundingClientRect();
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.top = `${rect.top + window.scrollY}px`;

      tabStopLabels.push(label);
    } else {
      el.style.outline = 'none';
    }
  });
}

// Contrast Checking
function checkContrast() {
  contrastWarnings.forEach(warning => warning.remove());
  contrastWarnings = [];

  if (!contrastCheckEnabled) return;

  const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');

  elements.forEach(el => {
    const fgColor = window.getComputedStyle(el).color;
    const bgColor = window.getComputedStyle(el).backgroundColor;
    const contrastRatio = calculateContrast(fgColor, bgColor);

    if (contrastRatio < contrastLevel) {
      highlightLowContrast(el, contrastRatio);
    }
  });
}

function calculateContrast(fgColor, bgColor) {
  const fgRGB = getRGB(fgColor);
  const bgRGB = getRGB(bgColor);
  const l1 = luminance(fgRGB);
  const l2 = luminance(bgRGB);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getRGB(color) {
  const match = color.match(/\d+/g);
  return { r: match[0], g: match[1], b: match[2] };
}
