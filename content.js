let headingsVisible = false;
let tabStopsVisible = false;
let tabStopLabels = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleHeadings') {
    headingsVisible = message.checked;
    showHeadings();
    sendResponse({status: "Headings toggled"});
  }
  if (message.action === 'toggleTabStops') {
    tabStopsVisible = message.checked;
    showTabStops();
    sendResponse({status: "Tab stops toggled"});
  }
});

function showHeadings() {
  let styleTag = document.getElementById('heading-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'heading-style';
    document.head.appendChild(styleTag);
  }

  if (headingsVisible) {
    styleTag.innerHTML = `
      h1::before, h2::before, h3::before, 
      h4::before, h5::before, h6::before {
        content: attr(data-heading);
        background: red;
        color: white;
        padding: 2px 5px;
        margin-right: 5px;
        font-weight: bold;
      }
      h1, h2, h3, h4, h5, h6 {
        outline: 2px solid red;
      }
    `;
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      heading.setAttribute('data-heading', heading.tagName);
    });
  } else {
    styleTag.innerHTML = '';
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      heading.removeAttribute('data-heading');
    });
  }
}

function showTabStops() {
  let focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  let index = 1;

  // Remove existing labels if toggle is off
  tabStopLabels.forEach(label => label.remove());
  tabStopLabels = [];

  focusableElements.forEach((el) => {
    if (tabStopsVisible) {
      el.setAttribute('data-tabstop', index);
      el.style.outline = '2px dashed red';

      // Create and position a label
      const label = document.createElement('div');
      label.textContent = index++;
      label.className = 'tab-stop-label';
      document.body.appendChild(label);

      const rect = el.getBoundingClientRect();
      label.style.position = 'absolute';
      label.style.left = `${rect.left + window.scrollX + 5}px`;
      label.style.top = `${rect.top + window.scrollY - 15}px`;
      label.style.backgroundColor = 'blue';
      label.style.color = 'white';
      label.style.padding = '2px 5px';
      label.style.fontSize = '12px';
      label.style.borderRadius = '4px';
      label.style.zIndex = '9999';

      tabStopLabels.push(label);
    } else {
      el.removeAttribute('data-tabstop');
      el.style.outline = 'none';
    }
  });
}
