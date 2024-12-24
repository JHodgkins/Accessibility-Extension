async function executeScript(action, checked) {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['content.js']
    });
    chrome.tabs.sendMessage(tab.id, {action: action, checked: checked});
  }
  
  document.getElementById('showHeadings').addEventListener('change', (event) => {
    executeScript('toggleHeadings', event.target.checked);
  });
  
  document.getElementById('showTabStops').addEventListener('change', (event) => {
    executeScript('toggleTabStops', event.target.checked);
  });
  