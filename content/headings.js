if (!window.accessibilityChecker) {
    window.accessibilityChecker = { headingLabels: [] };
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleHeadings') {
      window.accessibilityChecker.headingsVisible = message.checked;
      showHeadings();
    }
  });
  
  function showHeadings() {
    window.accessibilityChecker.headingLabels.forEach(label => label.remove());
    window.accessibilityChecker.headingLabels = [];
  
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
    headings.forEach((heading) => {
      if (window.accessibilityChecker.headingsVisible) {
        heading.style.outline = '2px solid red';
        const label = document.createElement('div');
        label.textContent = heading.tagName;
        label.className = 'heading-label';
        document.body.appendChild(label);
  
        const rect = heading.getBoundingClientRect();
        label.style.position = 'absolute';
        label.style.left = `${rect.left + window.scrollX}px`;
        label.style.top = `${rect.top + window.scrollY - 20}px`;
        label.style.backgroundColor = 'red';
        label.style.color = 'white';
        label.style.padding = '2px 5px';
        label.style.fontSize = '14px';
        label.style.borderRadius = '4px';
        label.style.zIndex = '9999';
  
        window.accessibilityChecker.headingLabels.push(label);
      } else {
        heading.style.outline = 'none';
      }
    });
  }
  