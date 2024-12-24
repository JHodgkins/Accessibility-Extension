// content.js
let headingsVisible = false;
let tabStopsVisible = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleHeadings') {
    headingsVisible = message.checked;
    showHeadings();
  }
  if (message.action === 'toggleTabStops') {
    tabStopsVisible = message.checked;
    showTabStops();
  }
});

function showHeadings() {
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    if (headingsVisible) {
      heading.style.outline = '2px solid red';
      heading.setAttribute('data-heading', heading.tagName);
    } else {
      heading.style.outline = 'none';
      heading.removeAttribute('data-heading');
    }
  });
}

function showTabStops() {
  let focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  let index = 1;
  focusableElements.forEach((el) => {
    if (tabStopsVisible) {
      el.setAttribute('data-tabstop', index++);
      el.style.outline = '2px dashed red';
    } else {
      el.removeAttribute('data-tabstop');
      el.style.outline = 'none';
    }
  });
}
