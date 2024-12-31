chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleHeadings') {
      showHeadings(message.checked);
    } else if (message.action === 'resetHeadings') {
      resetHeadings();
    }
  });
  
  function showHeadings(enabled) {
    resetHeadings();
    if (!enabled) return;
  
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      heading.style.outline = '2px solid red';
    });
  }
  
  function resetHeadings() {
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => el.style.outline = 'none');
  }
  