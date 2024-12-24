async function executeScript(action, checked, contrastLevel = null) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  chrome.tabs.sendMessage(tab.id, {
    action: action,
    checked: checked,
    contrastLevel: contrastLevel
  });
}
  
  document.getElementById('showHeadings').addEventListener('change', (event) => {
    executeScript('toggleHeadings', event.target.checked);
  });
  
  document.getElementById('showTabStops').addEventListener('change', (event) => {
    executeScript('toggleTabStops', event.target.checked);
  });
  
  document.getElementById('contrastCheck').addEventListener('change', (event) => {
    const contrastLevel = document.getElementById('contrastLevel').value;
    executeScript('toggleContrast', event.target.checked, contrastLevel);
  });