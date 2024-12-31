# Accessibility Extension

A Chrome extension to help identify and test accessibility features on web pages.

## Features

### 1. Heading Structure Visualization
- Highlights all headings (h1-h6 and ARIA headings) on the page
- Shows heading levels with clear visual indicators
- Supports both HTML headings and ARIA role="heading" elements
- Screen reader announcements for heading levels
- Special indication for ARIA headings

### 2. Tab Stop Navigation
- Displays tab order numbers for all focusable elements
- Numbers are inline with elements for clear visual reference
- Reveals hidden elements (like skip links) that become visible on focus
- Screen reader announcements for tab stop order
- Special handling for elements hidden until focus

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Use the toggles to enable/disable features:
   - "Show Headings" to visualize heading structure
   - "Show Tab Stops" to display tab navigation order
3. Use the "Reset All" button to clear all indicators

## Testing

The extension includes a test page (`testpage.html`) that demonstrates:
- Different heading levels and ARIA headings
- Skip links and other hidden focusable elements
- Various tab stop scenarios

## Development

This extension is built using:
- HTML/CSS for the popup interface
- JavaScript for the core functionality
- Chrome Extension APIs for browser integration

## Contributing

Feel free to submit issues and pull requests for new features or bug fixes.

## License

This project is licensed under the MIT License - see the LICENSE file for details
