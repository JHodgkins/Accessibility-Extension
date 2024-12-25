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
    window.accessibilityChecker.contrastWarnings.forEach(warning => warning.remove());
    window.accessibilityChecker.contrastWarnings = [];
  
    if (!window.accessibilityChecker.contrastCheckEnabled) return;
  
    const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
  
    elements.forEach(el => {
      const fgColor = window.getComputedStyle(el).color;
      const bgColor = getEffectiveBackgroundColor(el);
  
      const contrastRatio = calculateContrast(fgColor, bgColor);
      if (contrastRatio < window.accessibilityChecker.contrastLevel) {
        highlightLowContrast(el, contrastRatio);
      }
    });
  }
  