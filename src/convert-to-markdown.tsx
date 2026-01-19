import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import sanitizeHtml from "sanitize-html";

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
    ]),
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title"],
      th: ["align"],
      td: ["align"],
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

export default async function Command() {
  try {
    // Read clipboard content
    const clipboardContent = await Clipboard.read();

    // Check if HTML content is available
    if (!clipboardContent.html) {
      // Fallback: if no HTML, check for plain text
      if (clipboardContent.text) {
        await showHUD("⚠️ No rich text found - clipboard contains plain text only");
        return;
      }

      // No content at all
      await showToast({
        style: Toast.Style.Failure,
        title: "Empty Clipboard",
        message: "Please copy some rich text content first",
      });
      return;
    }

    // Clean the HTML
    const cleanedHtml = cleanHtml(clipboardContent.html);

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
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
