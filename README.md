# Clipboard to Markdown Converter

A powerful Raycast extension that converts rich text clipboard content from **Google Docs, Google Sheets, websites, and any other source** into clean, properly formatted Markdown.

## ✨ Features

- 🌐 **Universal Support**: Works with content from Google Docs, Sheets, websites, Word, and more
- 📊 **Smart Table Detection**: Automatically detects and converts tables with proper header formatting
- 🎨 **Preserves Formatting**: Maintains bold, italic, headings, lists, and code blocks
- 🧹 **Intelligent Cleaning**: Removes unnecessary styling while preserving document structure
- 📝 **GitHub Flavored Markdown**: Full support for tables, task lists, and strikethrough
- 🖼️ **Two Modes**: Keep images or remove them for plain text Markdown
- 💾 **Memory Optimized**: Handles large documents (tested with 1MB+ Google Docs)
- 🖥️ **Cross-Platform**: Works on both macOS and Windows
- ⚡ **Fast & Silent**: No UI, just processes and copies instantly

## 🚀 How to Use

### Method 1: Basic Usage

1. **Copy rich text** from Google Docs, a website, or any other source
2. **Open Raycast** (Cmd+Space or your configured hotkey)
3. **Search**: Type `Convert to Markdown`
4. **Choose**:
   - `Convert to Markdown (with Media)` - Keeps images and media
   - `Convert to Plain Markdown` - Removes all images for clean text
5. **Done!** ✅ The Markdown is now in your clipboard

### Method 2: With Hotkey (Recommended)

Set up instant conversion with a keyboard shortcut:

1. Open Raycast and search for `Convert to Markdown`
2. Press `⌘+K` to open actions
3. Select **"Configure Command"**
4. Assign your hotkey (e.g., `⌘+Shift+M` for with media, `⌘+Shift+P` for plain)

Now just **copy and press your hotkey** - instant Markdown conversion! ⚡

## 💡 What Works

| Source | What Gets Converted | Notes |
|--------|---------------------|-------|
| **Google Docs** | Headings, bold, italic, tables, lists, links | Uses macOS clipboard fallback for full HTML |
| **Google Sheets** | Tables with automatic header detection | First row becomes table header |
| **Websites** | All formatting, tables, code blocks | Full HTML conversion |
| **Microsoft Word** | Headings, formatting, tables, lists | Preserves document structure |
| **Any Rich Text** | All supported Markdown elements | As long as HTML is available |

## 📋 Commands

### Convert to Markdown (with Media)
Converts everything including images:
```markdown
![Alt text](image.png)

| Column 1 | Column 2 |
| --- | --- |
| Data | Data |
```

### Convert to Plain Markdown
Removes all images and media, perfect for documentation:
```markdown
| Column 1 | Column 2 |
| --- | --- |
| Data | Data |
```

## 🔧 Technical Details

This extension uses:
- **Turndown** + **GFM Plugin**: HTML to Markdown conversion with table support
- **Cheerio**: jQuery-like HTML parsing for intelligent structure detection
- **Cheerio-TableParser**: Robust table parsing for complex spreadsheets
- **macOS Clipboard Fallback**: Direct clipboard access when Raycast API fails
- **Layout Table Detection**: Unwraps Google Docs layout tables while preserving data tables
- **Memory Optimization**: Lightweight processing for large documents (>300KB)
- **Style Conversion**: Converts inline font-weight and Google Docs classes to semantic HTML

### How It Works

1. **HTML Retrieval**: Gets HTML from clipboard (with macOS fallback for Google Docs)
2. **Style Normalization**: Converts `font-weight: 700` and classes to `<strong>` tags
3. **Layout Table Detection**: Unwraps single-column tables used for document layout
4. **Table Conversion**: Parses data tables and converts to Markdown format
5. **Cleaning**: Removes unnecessary attributes, classes, and wrapper elements
6. **Markdown Generation**: Turndown converts clean HTML to GitHub Flavored Markdown

## Installation

### For Personal Use (Mac or Windows)

1. **Clone or download this repository:**
   ```bash
   git clone https://github.com/nashtu3000/raycast-extension.git
   cd raycast-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Import into Raycast (One-Time Setup):**
   - Open Raycast
   - Go to **Settings** → **Extensions** tab
   - Click the **⋮** menu (three dots) in the top right
   - Select **"Import Extension"**
   - Navigate to the `raycast-extension` folder
   - Click **Import**

4. **Done!** The extension is now permanently installed. You don't need to keep any terminal running.

### For Development (Testing Changes)

If you want to modify the code and test it:

```bash
npm run dev
```

This starts a development server that auto-reloads when you make changes. Press `Ctrl+C` to stop.

## License

MIT
