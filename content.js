let contrastWarnings = [];

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleContrast') {
    checkContrast(parseFloat(message.contrastLevel));
  }
});

function checkContrast(contrastLevel) {
  contrastWarnings.forEach(warning => warning.remove());
  contrastWarnings = [];

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
  const rgba = color.match(/\d+/g);
  return { r: rgba[0], g: rgba[1], b: rgba[2] };
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
