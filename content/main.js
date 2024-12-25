import './headings.js';
import './tabstops.js';
import './contrast.js';

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'resetAll') {
    resetAllHighlights();
  }
});

function resetAllHighlights() {
  // Remove all headings highlights
  window.accessibilityChecker.headingLabels?.forEach(label => label.remove());
  window.accessibilityChecker.headingLabels = [];

  // Remove all tab stop highlights
  window.accessibilityChecker.tabStopLabels?.forEach(label => label.remove());
  window.accessibilityChecker.tabStopLabels = [];

  // Remove all contrast warnings
  window.accessibilityChecker.contrastWarnings?.forEach(warning => warning.remove());
  window.accessibilityChecker.contrastWarnings = [];

  // Remove all outlines
  document.querySelectorAll('h1, h2, h3, h4, h5, h6, a, button, input, textarea, select')
    .forEach(el => el.style.outline = 'none');
}
