chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'resetAll') {
      resetAllHighlights();
    }
  });
  
  function resetAllHighlights() {
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, a, button, input, textarea, select')
      .forEach(el => {
        el.style.outline = 'none';
      });
  }
  