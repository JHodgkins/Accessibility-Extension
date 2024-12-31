document.addEventListener('DOMContentLoaded', () => {
    restoreCheckboxStates();
  
    // Event listeners for checkboxes
    document.getElementById('showHeadings').addEventListener('change', (event) => {
      updateState('showHeadings', event.target.checked);
      sendMessage('toggleHeadings', event.target.checked);
    });
  
    document.getElementById('showTabStops').addEventListener('change', (event) => {
      updateState('showTabStops', event.target.checked);
      sendMessage('toggleTabStops', event.target.checked);
    });
  
    document.getElementById('contrastCheck').addEventListener('change', (event) => {
      updateState('contrastCheck', event.target.checked);
      const contrastLevel = document.getElementById('contrastLevel').value;
      sendMessage('toggleContrast', event.target.checked, contrastLevel);
    });
  
    document.getElementById('contrastLevel').addEventListener('change', () => {
      const contrastLevel = document.getElementById('contrastLevel').value;
      updateState('contrastLevel', contrastLevel);
  
      if (document.getElementById('contrastCheck').checked) {
        sendMessage('toggleContrast', true, contrastLevel);
      }
    });
  
    // Attach reset functionality
    document.getElementById('resetAll').addEventListener('click', resetAll);
  });
  
  function restoreCheckboxStates() {
    chrome.storage.local.get(['showHeadings', 'showTabStops', 'contrastCheck', 'contrastLevel'], (result) => {
      document.getElementById('showHeadings').checked = result.showHeadings ?? false;
      document.getElementById('showTabStops').checked = result.showTabStops ?? false;
      document.getElementById('contrastCheck').checked = result.contrastCheck ?? false;
      document.getElementById('contrastLevel').value = result.contrastLevel ?? 4.5;
    });
  }
  
  function updateState(key, value) {
    chrome.storage.local.set({ [key]: value });
  }
  
  function sendMessage(action, checked, contrastLevel = null) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action, checked, contrastLevel });
      }
    });
  }
  
  function resetAll() {
    sendMessage('resetAll');
    document.getElementById('showHeadings').checked = false;
    document.getElementById('showTabStops').checked = false;
    document.getElementById('contrastCheck').checked = false;
  
    chrome.storage.local.set({
      showHeadings: false,
      showTabStops: false,
      contrastCheck: false
    });
  }
  