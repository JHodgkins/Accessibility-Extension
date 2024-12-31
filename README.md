# Accessibility Checker Chrome Extension

A Chrome extension that helps identify and test for common accessibility issues on web pages.

## Features

- **Heading Highlighter**: Visualizes heading structure and levels
- **Tab Order Checker**: Shows the tab order of interactive elements
- **Contrast Checker**: 
  - Large Text (3:1 minimum contrast)
  - Normal Text (4.5:1 minimum contrast)
  - UI Elements (3:1 minimum contrast for icons and borders)
- **Alt Text Checker**:
  - Identifies missing alt attributes
  - Warns about empty alt attributes on non-decorative images
  - Shows alt text content for review
  - Identifies properly marked decorative images

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select which accessibility features you want to check:
   - Show Headings
   - Show Tab Stops
   - Check Alt Text
   - Contrast Check (with options for different contrast requirements)
3. The extension will highlight relevant elements and show detailed information

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. Key files:

- `manifest.json`: Extension configuration
- `popup.html/js`: Extension popup interface
- `content/*.js`: Content scripts for different accessibility checks
- `background.js`: Background service worker
- `styles.css`: Extension styles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
