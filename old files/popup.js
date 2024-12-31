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

  document.getElementById('contrastLevel').addEventListener('change', () => {
    const contrastLevel = document.getElementById('contrastLevel').value;
    updateState('contrastLevel', contrastLevel);

    const contrastCheckEnabled = document.getElementById('contrastCheck').checked;
    if (contrastCheckEnabled) {
      executeScript('toggleContrast', true, contrastLevel);
    }
  });

  // Reset all features
  document.getElementById('resetAll').addEventListener('click', () => {
    resetAll();
  });
});

// Restore checkbox states from storage
async function restoreCheckboxStates() {
  chrome.storage.local.get(['showHeadings', 'showTabStops', 'contrastCheck', 'contrastLevel'], (result) => {
    if (result.showHeadings !== undefined) {
      document.getElementById('showHeadings').checked = result.showHeadings;
    }
    if (result.showTabStops !== undefined) {
      document.getElementById('showTabStops').checked = result.showTabStops;
    }
    if (result.contrastCheck !== undefined) {
      document.getElementById('contrastCheck').checked = result.contrastCheck;
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
