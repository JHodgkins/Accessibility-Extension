if (!window.accessibilityChecker) {
    window.accessibilityChecker = { tabStopLabels: [] };
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleTabStops') {
      window.accessibilityChecker.tabStopsVisible = message.checked;
      showTabStops();
    }
  });
  
  function showTabStops() {
    window.accessibilityChecker.tabStopLabels.forEach(label => label.remove());
    window.accessibilityChecker.tabStopLabels = [];
  
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    let index = 1;
  
    focusableElements.forEach((el) => {
      if (window.accessibilityChecker.tabStopsVisible) {
        el.style.outline = '2px dashed blue';
  
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
  