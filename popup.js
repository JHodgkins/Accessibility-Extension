document.addEventListener('DOMContentLoaded', () => {
    restoreCheckboxStates();
  
    document.getElementById('showHeadings').addEventListener('change', (event) => {
      injectAndSendMessage('content/headings.js', 'toggleHeadings', event.target.checked);
      updateState('showHeadings', event.target.checked);
    });
  
    document.getElementById('showTabStops').addEventListener('change', (event) => {
      injectAndSendMessage('content/tabstops.js', 'toggleTabStops', event.target.checked);
      updateState('showTabStops', event.target.checked);
    });

    document.getElementById('checkAltText').addEventListener('change', (event) => {
      injectAndSendMessage('content/alttext.js', 'toggleAltText', event.target.checked);
      updateState('checkAltText', event.target.checked);
    });
  
    document.getElementById('contrastCheck').addEventListener('change', (event) => {
      const contrastType = document.getElementById('contrastType').value;
      injectAndSendMessage('content/contrast.js', 'toggleContrast', event.target.checked, contrastType);
      updateState('contrastCheck', event.target.checked);
      updateState('contrastType', contrastType);
    });

    document.getElementById('contrastType').addEventListener('change', (event) => {
      if (document.getElementById('contrastCheck').checked) {
        injectAndSendMessage('content/contrast.js', 'toggleContrast', true, event.target.value);
        updateState('contrastType', event.target.value);
      }
    });
  
    document.getElementById('resetAll').addEventListener('click', resetAll);
  });
  
  // Inject script and send message to active tab
  function injectAndSendMessage(scriptFile, action, checked, contrastType = null) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: [scriptFile]
        }).then(() => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: action,
            checked: checked,
            contrastType: contrastType
          });
        }).catch((error) => {
          console.error('Failed to inject content script:', error);
        });
      }
    });
  }
  
  // Restore checkbox states on popup load
  function restoreCheckboxStates() {
    chrome.storage.local.get(['showHeadings', 'showTabStops', 'checkAltText', 'contrastCheck', 'contrastType'], (result) => {
      document.getElementById('showHeadings').checked = result.showHeadings || false;
      document.getElementById('showTabStops').checked = result.showTabStops || false;
      document.getElementById('checkAltText').checked = result.checkAltText || false;
      document.getElementById('contrastCheck').checked = result.contrastCheck || false;
      document.getElementById('contrastType').value = result.contrastType || 'normalText';
    });
  }
  
  function updateState(key, value) {
    chrome.storage.local.set({ [key]: value });
  }
  
  // Reset all highlights and tooltips
  function resetAll() {
    injectAndSendMessage('content/main.js', 'resetAll');
    chrome.storage.local.set({
      showHeadings: false,
      showTabStops: false,
      checkAltText: false,
      contrastCheck: false
    });
  
    document.getElementById('showHeadings').checked = false;
    document.getElementById('showTabStops').checked = false;
    document.getElementById('checkAltText').checked = false;
    document.getElementById('contrastCheck').checked = false;
  }
  