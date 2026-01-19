import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import sanitizeHtml from "sanitize-html";

/**
 * Detects if HTML looks like it's from a spreadsheet (Google Sheets, Excel, etc.)
 */
function isSpreadsheetContent(html: string): boolean {
  // Check for Google Sheets specific attributes
  if (html.includes("data-sheets-")) {
    return true;
  }
  
  // Check if it's just a table with no other content (typical of copied spreadsheets)
  const stripped = html.replace(/\s+/g, " ").trim();
  const startsWithTable = /^<table/i.test(stripped);
  const hasOnlyTable = !/<(p|div|h[1-6]|article|section)[^>]*>/i.test(stripped);
  
  return startsWithTable && hasOnlyTable;
}

/**
 * Converts first row of table cells to header cells
 */
function convertFirstRowToHeaders(html: string): string {
  // Match the first <tr> and its contents
  return html.replace(
    /(<table[^>]*>(?:<colgroup>.*?<\/colgroup>)?(?:<caption>.*?<\/caption>)?(?:<tbody[^>]*>)?)\s*<tr[^>]*>(.*?)<\/tr>/is,
    (match, beforeFirstRow, firstRowContent) => {
      // Convert all <td> to <th> in the first row
      const headerRow = firstRowContent.replace(/<td([^>]*)>/gi, "<th$1>").replace(/<\/td>/gi, "</th>");
      
      // Wrap in <thead> if not already in one
      return `${beforeFirstRow}<thead><tr>${headerRow}</tr></thead><tbody>`;
    }
  );
}

/**
 * Cleans HTML content by removing unwanted tags, attributes, and inline styles
 * while preserving the document structure.
 */
function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "pre",
      "code",
      "span",
      "div",
      "del",
      "ins",
      "colgroup",
      "col",
      "caption",
    ]),
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title"],
      th: ["align"],
      td: ["align"],
      col: ["width"],
      "*": ["class"],
    },
    // Remove inline styles but keep structure
    allowedStyles: {},
    // Preserve text content
    textFilter: (text) => text,
    // Keep empty elements that might be meaningful
    nonBooleanAttributes: ["abbr", "accept", "accept-charset"],
  });
}

/**
 * Converts HTML to Markdown using Turndown with GitHub Flavored Markdown support
 */
function convertToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
  });

  // Add GitHub Flavored Markdown support (tables, strikethrough, task lists)
  turndownService.use(gfm);

  // Custom rules for better conversion
  turndownService.addRule("preserveLineBreaks", {
    filter: ["br"],
    replacement: () => "  \n",
  });

  return turndownService.turndown(html);
}

/**
 * Checks if a string contains HTML tags
 */
function looksLikeHtml(text: string): boolean {
  const htmlTagPattern = /<\s*([a-z][a-z0-9]*)\b[^>]*>/i;
  return htmlTagPattern.test(text);
}

export default async function Command() {
  try {
    // Read clipboard content
    const clipboardContent = await Clipboard.read();

    let htmlContent: string | undefined;

    // Debug: Log what's in the clipboard
    console.log("Clipboard content available:", {
      hasHtml: !!clipboardContent.html,
      hasText: !!clipboardContent.text,
      hasFile: !!clipboardContent.file,
      textLength: clipboardContent.text?.length,
      htmlLength: clipboardContent.html?.length,
    });

    // Check if HTML content is available as rich format
    if (clipboardContent.html) {
      htmlContent = clipboardContent.html;
      console.log("Using HTML from rich format");
    }
    // Smart fallback: check if plain text contains HTML tags
    else if (clipboardContent.text && looksLikeHtml(clipboardContent.text)) {
      htmlContent = clipboardContent.text;
      console.log("Detected HTML in plain text");
      await showHUD("🔍 Detected HTML in plain text, converting...");
    }
    // No HTML found anywhere
    else {
      if (clipboardContent.text) {
        console.log("Plain text only, no HTML detected");
        console.log("Text preview:", clipboardContent.text.substring(0, 200));
        await showHUD(
          "⚠️ No rich text or HTML found - clipboard contains plain text only",
        );
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Empty Clipboard",
          message: "Please copy some rich text content first",
        });
      }
      return;
    }

    // Detect if this is spreadsheet content and enhance it
    let processedHtml = htmlContent;
    if (isSpreadsheetContent(htmlContent)) {
      console.log("Detected spreadsheet content, converting first row to headers");
      processedHtml = convertFirstRowToHeaders(htmlContent);
    }

    // Clean the HTML
    const cleanedHtml = cleanHtml(processedHtml);

    // Convert to Markdown
    const markdown = convertToMarkdown(cleanedHtml);

    // Copy Markdown back to clipboard
    await Clipboard.copy(markdown);

    // Show success message
    await showHUD("✅ Markdown copied to clipboard!");
  } catch (error) {
    console.error("Error converting clipboard to Markdown:", error);

    await showToast({
      style: Toast.Style.Failure,
      title: "Conversion Failed",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
