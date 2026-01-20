# Clipboard to Markdown Converter

A powerful Raycast extension that converts rich text clipboard content from **Google Docs, Google Sheets, websites, and any other source** into clean, properly formatted Markdown.

## ✨ Features

- 🌐 **Universal Support**: Works with Google Docs, Sheets, websites, Word, Notion, and more
- 📊 **Perfect Tables**: Converts 30+ tables correctly with smart colspan/rowspan handling
- 🎨 **Formatting Preserved**: Bold, italic, headings, lists, code blocks, and line breaks
- 🔗 **Links Preserved**: All hyperlinks convert to proper Markdown syntax
- 🧹 **Intelligent Cleaning**: Removes styling/classes while preserving structure
- 📝 **GitHub Flavored Markdown**: Full GFM support (tables, task lists, strikethrough)
- 🔄 **Bidirectional**: Convert HTML→Markdown AND Markdown→Rich Text
- 🖼️ **Two Markdown Modes**: "With Media" (images kept) or "Plain" (images removed)
- 💾 **Memory Optimized**: Handles huge documents (tested with 2.5MB+ Google Docs)
- 🎯 **Smart Processing**: Removes icon elements, Google Docs wrappers, empty tags
- 🖥️ **Cross-Platform**: Works on both macOS and Windows
- ⚡ **Fast & Silent**: No UI, instant processing and clipboard copy

## 🚀 How to Use

### Method 1: Basic Usage

1. **Copy rich text** from Google Docs, a website, or any other source
2. **Open Raycast** (Cmd+Space or your configured hotkey)
3. **Search**: Type `Convert to Markdown` or `Convert Markdown`
4. **Choose**:
   - `Convert to Markdown (with Media)` - Keeps images and media
   - `Convert to Plain Markdown` - Removes all images for clean text
   - `Convert Markdown to Rich Text` - Reverse conversion for pasting into Docs/emails
5. **Done!** ✅ The converted content is now in your clipboard

### Method 2: With Hotkey (Recommended)

Set up instant conversion with a keyboard shortcut:

1. Open Raycast and search for `Convert to Markdown`
2. Press `⌘+K` to open actions
3. Select **"Configure Command"**
4. Assign your hotkey (e.g., `⌘+Shift+M` for with media, `⌘+Shift+P` for plain)

Now just **copy and press your hotkey** - instant Markdown conversion! ⚡

## 💡 What Works

| Source | What Gets Converted | Quality |
|--------|---------------------|---------|
| **Google Docs** | Inline styled bold/italic (font-weight:700), headings, tables, lists, links, line breaks | ⭐⭐⭐⭐⭐ Perfect |
| **Google Sheets** | Complex tables with colspan/rowspan, first row as headers | ⭐⭐⭐⭐⭐ Perfect |
| **Websites** | All formatting, tables, lists, links, removes icon elements (Font Awesome, etc.) | ⭐⭐⭐⭐⭐ Perfect |
| **Microsoft Word** | Headings, bold, italic, tables, lists | ⭐⭐⭐⭐ Excellent |
| **Notion** | All formatting, tables, nested lists | ⭐⭐⭐⭐ Excellent |

### ✅ Formatting Support
- **Bold**: `font-weight:700/600/bold` → `**text**`
- **Italic**: `font-style:italic` → `_text_`
- **Links**: Full URL preservation with anchor text
- **Tables**: Smart colspan handling, header detection, GFM format
- **Line breaks**: `<br>` → Markdown line breaks (`  \n`)
- **Lists**: Bullets, numbered, nested
- **Headings**: H1-H6 converted to `#` syntax

## 📋 Commands

This extension installs 3 actions into Raycast:

### 1. Convert to Markdown (with Media)
Converts everything including images:
```markdown
![Alt text](image.png)

| Column 1 | Column 2 |
| --- | --- |
| Data | Data |
```

### 2. Convert to Plain Markdown
Removes all images and media, perfect for documentation:
```markdown
| Column 1 | Column 2 |
| --- | --- |
| Data | Data |
```

### 3. Convert Markdown to Rich Text
Converts Markdown back to rich text for pasting into Google Docs, emails, Word, and other rich text editors. Perfect for when you've written content in Markdown and need to share it in a formatted document.

## 🔧 Technical Details

### Core Technologies
- **Turndown** + **GFM Plugin**: HTML to Markdown with GitHub Flavored Markdown support
- **Cheerio**: Fast HTML parsing (used for small documents)
- **Smart Regex Processing**: Lightweight cleaning for large documents
- **macOS Clipboard API**: Direct HTML access when Raycast API doesn't detect it

### Processing Pipeline

1. **Icon Removal**: Strip Font Awesome and icon elements (`<i class="fa">`, etc.)
2. **Wrapper Cleanup**: Remove Google Docs `<b id="docs-internal-guid-...">` wrapper
3. **Style → Semantic**: Convert `font-weight:700` to `<strong>`, `font-style:italic` to `<em>`
4. **Colspan/Rowspan**: Duplicate cell content across spanned columns (smart header detection)
5. **Link Preservation**: Use placeholder markers to keep `href` during attribute removal
6. **Attribute Removal**: Strip all `style`, `class`, `id`, etc. (except preserved `href`)
7. **Table Cell Cleaning**: Remove `<p>`, `<span>`, `<br>` from cells to prevent newlines
8. **Wrapper Removal**: Strip `<span>`, `<font>`, `<div>` while keeping block structure
9. **Table Headers**: Convert first row `<td>` to `<th>` and wrap in `<thead>`/`<tbody>`
10. **Turndown Conversion**: Convert semantic HTML to GFM Markdown
11. **Post-Processing**: Remove orphaned `**`, un-escape `\-`, clean empty list items

### Special Handling
- **Large Documents** (>200KB): Uses regex-only processing to avoid memory issues
- **Google Docs**: Detects and handles inline styles, wrapper elements, class-based styling
- **Spreadsheets**: Auto-converts first row to table headers
- **Line Breaks**: Preserves `<br>` as Markdown line breaks (`  \n`)
- **Nested Tables**: Unwraps layout tables, preserves data tables

## ✅ Verified Test Cases

The extension has been extensively tested with real-world content:

| Test Case | Size | Tables | Links | Bold Items | Status |
|-----------|------|--------|-------|------------|--------|
| Google Docs Technical Report | 2.5MB | 32 | 44 | 207 | ✅ Perfect |
| Google Sheets Data Export | 126KB | 15 | 0 | 45 | ✅ Perfect |
| Website HTML (with icons) | 7.5KB | 0 | 0 | 3 | ✅ Perfect |
| Mixed Content (tables + links) | Various | ✓ | ✓ | ✓ | ✅ Perfect |

**All test cases produce clean Markdown with:**
- Zero raw HTML tags
- No escaped characters (`\-`)
- No unicode artifacts (`●`)
- No orphaned formatting markers
- Proper paragraph spacing

## 📥 Installation

### For Personal Use (Permanent Installation)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/nashtu3000/Raycast-Markdown-Extension.git
   cd Raycast-Markdown-Extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Import into Raycast (One-Time Setup):**
   - Open **Raycast**
   - Go to **Raycast Settings** (Cmd+,)
   - Click **Extensions** tab
   - Click the **⋮** menu (three dots) in the top right corner
   - Select **"Import Extension"**
   - Navigate to your `Raycast-Markdown-Extension` folder
   - Click **Import**

4. **You're done!** 🎉 The extension is now permanently installed. You can close the terminal - it will keep working.

### Sharing with Friends

To share this extension with friends or colleagues:

1. **Share the GitHub repository link**: `https://github.com/nashtu3000/Raycast-Markdown-Extension`
2. They follow the installation steps above
3. That's it! No publishing to the store required for private use.

### For Development (Live Testing)

If you want to modify the code and test changes:

```bash
npm run dev
```

This starts a development server that auto-reloads on file changes. Press `Ctrl+C` to stop.

## 🧪 Testing Tools

Quick command-line tools for testing the conversion logic:

```bash
# 1. Save current clipboard HTML to input.html
./save-clipboard-html.sh

# 2. Convert input.html to result.md
node test-convert.js

# 3. View the result
cat result.md
```

Perfect for testing before using in Raycast or debugging issues. See [`TESTING.md`](./TESTING.md) for details.

## 🐛 Troubleshooting

### Extension not appearing in Raycast?
- Make sure `npm run dev` is running in the terminal
- Try "Reload Extensions" in Raycast
- Check Terminal for "ready - built extension successfully"

### Bold/italic formatting lost?
- ✅ **Fixed!** Now converts Google Docs inline styles (`font-weight:700`)
- Works with both `<strong>` tags and `style` attributes

### Links not preserved?
- ✅ **Fixed!** All hyperlinks now preserved during conversion
- Table of contents links work perfectly

### Tables showing as raw HTML?
- ✅ **Fixed!** All tables convert to Markdown (tested with 32-table document)
- Colspan/rowspan cells are intelligently duplicated

### Line breaks missing?
- ✅ **Fixed!** `<br>` tags preserve as Markdown line breaks (`  \n`)
- Won't collide with `<b>` to `<strong>` conversion

### Icon garbage in list items?
- ✅ **Fixed!** Font Awesome and icon elements automatically removed

## 📄 License

MIT

## ⭐ Credits

Built with:
- [Turndown](https://github.com/mixmark-io/turndown) - HTML to Markdown conversion
- [Cheerio](https://cheerio.js.org/) - HTML parsing and manipulation
- [Raycast API](https://developers.raycast.com/) - Extension framework
