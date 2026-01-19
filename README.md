# Clipboard to Markdown

A Raycast extension that converts rich text clipboard content from Google Sheets, Google Docs, websites, and other sources into clean Markdown format.

## Features

- 🎯 **Universal Support**: Works with content copied from any source (Sheets, Docs, websites, etc.)
- 🧹 **HTML Cleaning**: Automatically sanitizes and tidies HTML before conversion
- 📝 **GitHub Flavored Markdown**: Supports tables, task lists, and strikethrough
- 🖥️ **Cross-Platform**: Works on both macOS and Windows
- ⚡ **Fast & Silent**: No UI, just processes and copies instantly

## How to Use

1. Copy rich text content from any source (Sheets, Docs, websites, etc.)
2. Trigger the "Convert Clipboard to Markdown" command in Raycast
3. The cleaned Markdown is now in your clipboard, ready to paste!

## Technical Details

This extension uses:
- `turndown` for HTML to Markdown conversion
- `turndown-plugin-gfm` for GitHub Flavored Markdown support
- `sanitize-html` for cleaning HTML content
- Pure JavaScript (no native binaries) for cross-platform compatibility

## Installation

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

## License

MIT
