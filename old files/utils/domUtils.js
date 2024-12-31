export function getEffectiveBackgroundColor(el) {
    while (el && el !== document.documentElement) {
      const bgColor = window.getComputedStyle(el).backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
      el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }
  