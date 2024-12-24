let headingsVisible = false;
let tabStopsVisible = false;
let contrastCheckEnabled = false;
let contrastLevel = 4.5;
let contrastWarnings = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  // Outline headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.style.outline = headingsVisible ? '2px solid red' : 'none';
  });
}

function showTabStops() {
  let focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  focusableElements.forEach((el) => {
    el.style.outline = tabStopsVisible ? '2px dashed blue' : 'none';
  });
}

function checkContrast() {
  contrastWarnings.forEach(warning => warning.remove());
  contrastWarnings = [];

  if (!contrastCheckEnabled) return;

  const elementsToCheck = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');

  elementsToCheck.forEach(el => {
    const color = window.getComputedStyle(el).color;
    const bgColor = window.getComputedStyle(el).backgroundColor;

    if (color && bgColor) {
      const contrastRatio = calculateContrast(color, bgColor);
      if (contrastRatio < contrastLevel) {
        highlightLowContrast(el, contrastRatio);
      }
    }
  });
}

function calculateContrast(fgColor, bgColor) {
  const fgRGB = getRGB(fgColor);
  const bgRGB = getRGB(bgColor);
  const l1 = luminance(fgRGB.r, fgRGB.g, fgRGB.b);
  const l2 = luminance(bgRGB.r, bgRGB.g, bgRGB.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getRGB(color) {
  const rgb = color.match(/\d+/g);
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

function highlightLowContrast(el, contrastRatio) {
  const warning = document.createElement('div');
  warning.textContent = `Low Contrast (${contrastRatio.toFixed(2)})`;
  warning.className = 'contrast-warning';
  document.body.appendChild(warning);

  const rect = el.getBoundingClientRect();
  warning.style.left = `${rect.left + window.scrollX}px`;
  warning.style.top = `${rect.top + window.scrollY - 20}px`;

  contrastWarnings.push(warning);
}
