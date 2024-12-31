chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleTabStops') {
      showTabStops(message.checked);
    } else if (message.action === 'resetAll') {
      resetTabStops();
    }
  });
  
  function showTabStops(enabled) {
    resetTabStops();
    if (!enabled) return;
  
    let index = 1;
    document.querySelectorAll('a, button, input, textarea, select, [tabindex]').forEach((el) => {
      if (el.offsetParent !== null && el.tabIndex >= 0) {
        el.style.outline = '2px dashed blue';
        el.dataset.tabIndex = index++;
      }
    });
  }
  
  function resetTabStops() {
    document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
      el.style.outline = 'none';
      delete el.dataset.tabIndex;
    });
  }
  