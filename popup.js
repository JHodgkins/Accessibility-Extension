document.addEventListener('DOMContentLoaded', () => {
    restoreCheckboxStates();

    document.getElementById('showHeadings').addEventListener('change', (event) => {
        sendMessage('toggleHeadings', event.target.checked);
        updateState('showHeadings', event.target.checked);
    });

    document.getElementById('showTabStops').addEventListener('change', (event) => {
        sendMessage('toggleTabStops', event.target.checked);
        updateState('showTabStops', event.target.checked);
    });

    document.getElementById('resetAll').addEventListener('click', resetAll);
});

function sendMessage(action, checked) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs[0]) return;

        try {
            // First check if we can access the tab
            const tab = tabs[0];
            
            // Skip chrome:// and other restricted URLs
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || 
                tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
                console.log('Cannot access this type of page');
                return;
            }

            // Try to send the message
            await chrome.tabs.sendMessage(tab.id, {
                action: action,
                checked: checked
            });
        } catch (error) {
            console.log('Error sending message:', error);
            // If there's an error, the content script might not be injected
            // We can handle this gracefully by just logging it
        }
    });
}

function restoreCheckboxStates() {
    chrome.storage.local.get([
        'showHeadings',
        'showTabStops'
    ], (result) => {
        // Get the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (!tabs[0]) return;

            const tab = tabs[0];
            
            // Skip chrome:// and other restricted URLs
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || 
                tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
                // Disable checkboxes for restricted pages
                document.getElementById('showHeadings').disabled = true;
                document.getElementById('showTabStops').disabled = true;
                return;
            }

            // Enable checkboxes and restore states
            document.getElementById('showHeadings').disabled = false;
            document.getElementById('showTabStops').disabled = false;

            document.getElementById('showHeadings').checked = result.showHeadings || false;
            document.getElementById('showTabStops').checked = result.showTabStops || false;

            // Restore active features
            if (result.showHeadings) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleHeadings',
                        checked: true
                    });
                } catch (error) {
                    console.log('Error restoring headings state:', error);
                }
            }
            
            if (result.showTabStops) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleTabStops',
                        checked: true
                    });
                } catch (error) {
                    console.log('Error restoring tab stops state:', error);
                }
            }
        });
    });
}

function updateState(key, value) {
    chrome.storage.local.set({ [key]: value });
}

function resetAll() {
    // Reset storage
    chrome.storage.local.set({
        showHeadings: false,
        showTabStops: false
    });

    // Reset UI
    document.getElementById('showHeadings').checked = false;
    document.getElementById('showTabStops').checked = false;

    // Send reset message
    sendMessage('resetAll');
}