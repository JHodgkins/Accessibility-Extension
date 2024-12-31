chrome.runtime.onInstalled.addListener(() => {
    console.log("Accessibility Checker Extension Installed");
  });
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      files: [
        'content/headings.js',
        'content/tabstops.js',
        'content/contrast.js',
        'content/main.js'
      ]
    }).catch(err => console.error('Content script injection failed:', err));
  });
  