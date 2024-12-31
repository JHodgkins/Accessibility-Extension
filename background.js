chrome.runtime.onInstalled.addListener(() => {
    console.log("Accessibility Checker Extension Installed");
});

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'injectScripts') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                console.log('Error querying tabs:', chrome.runtime.lastError);
                return;
            }

            // Make sure we have a valid tab
            if (!tabs || !tabs[0] || !tabs[0].id) {
                console.log('No valid tab found');
                return;
            }

            // Get tab details to check URL
            chrome.tabs.get(tabs[0].id, (tab) => {
                if (chrome.runtime.lastError) {
                    console.log('Error getting tab:', chrome.runtime.lastError);
                    return;
                }

                // Skip if no URL or if it's a chrome URL
                if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
                    console.log('Skipping chrome URL or invalid tab');
                    return;
                }

                // Try to inject each script individually
                const scripts = [
                    'content/headings.js',
                    'content/tabstops.js',
                    'content/contrast.js',
                    'content/alttext.js',
                    'content/main.js'
                ];

                scripts.forEach(script => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: [script]
                    }).catch(err => {
                        console.log(`Failed to inject ${script}:`, err);
                    });
                });
            });
        });
    }
});