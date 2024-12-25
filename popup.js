// Wait for DOM to load before adding listeners
document.addEventListener('DOMContentLoaded', () => {
  restoreCheckboxStates();

  // Event listeners for checkboxes
  document.getElementById('showHeadings').addEventListener('change', (event) => {
    updateState('showHeadings', event.target.checked);
    executeScript('toggleHeadings', event.target.checked);
  });

  document.getElementById('showTabStops').addEventListener('change', (event) => {
    updateState('showTabStops', event.target.checked);
    executeScript('toggleTabStops', event.target.checked);
  });

  document.getElementById('contrastCheck').addEventListener('change', (event) => {
    updateState('contrastCheck', event.target.checked);
    const contrastLevel = document.getElementById('contrastLevel').value;
    executeScript('toggleContrast', event.target.checked, contrastLevel);
  });

  // Event listener for contrast ratio dropdown
  document.getElementById('contrastLevel').addEventListener('change', () => {
    const contrastCheckEnabled = document.getElementById('contrastCheck').checked;
    if (contrastCheckEnabled) {
      const contrastLevel = document.getElementById('contrastLevel').value;
      updateState('contrastLevel', contrastLevel);
      executeScript('toggleContrast', true, contrastLevel);
    }
  });
});

// Restore checkbox states from storage
async function restoreCheckboxStates() {
  chrome.storage.local.get(['showHeadings', 'showTabStops', 'contrastCheck', 'contrastLevel'], (result) => {
    if (result.showHeadings !== undefined) {
      document.getElementById('showHeadings').checked = result.showHeadings;
      executeScript('toggleHeadings', result.showHeadings);
    }
    if (result.showTabStops !== undefined) {
      document.getElementById('showTabStops').checked = result.showTabStops;
      executeScript('toggleTabStops', result.showTabStops);
    }
    if (result.contrastCheck !== undefined) {
      document.getElementById('contrastCheck').checked = result.contrastCheck;
      executeScript('toggleContrast', result.contrastCheck, result.contrastLevel || 4.5);
    }
    if (result.contrastLevel !== undefined) {
      document.getElementById('contrastLevel').value = result.contrastLevel;
    }
  });
}

// Save state to chrome.storage.local
function updateState(key, value) {
  chrome.storage.local.set({ [key]: value });
}

// Execute content script and send message
async function executeScript(action, checked, contrastLevel = null) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const tabId = tab.id;

  // Inject content script if not already present
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  });

  // Send message to content script to toggle features
  chrome.tabs.sendMessage(tabId, {
    action: action,
    checked: checked,
    contrastLevel: contrastLevel
  });
}
