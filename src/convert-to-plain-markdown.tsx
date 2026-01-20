import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/**
 * Lightweight HTML cleaning using regex for large documents
 * EXACT SAME as convert-to-markdown.tsx
 */
function cleanHtmlLightweight(html: string): string {
  let cleaned = html;
  
  // Step 1: Remove colgroup
  cleaned = cleaned.replace(/<colgroup[^>]*>.*?<\/colgroup>/gis, "");
  
  // Step 2: Remove ALL attributes from ALL opening tags
  cleaned = cleaned.replace(/<(\w+)(\s+[^>]+)>/g, "<$1>");
  
  // Step 3: Remove wrapper tags but preserve block structure for Turndown
  // KEEP <p> and <br> tags OUTSIDE tables - Turndown needs them for proper spacing
  // But REMOVE <p> tags INSIDE table cells to prevent extra newlines
  
  // First, clean up table cells specifically
  cleaned = cleaned.replace(/<t([dh])>(<p>)*(.*?)(<\/p>)*<\/t\1>/gis, (match, tagType, _1, content, _2) => {
    // Remove all <p>, </p>, <br> tags from cell content
    let cellContent = content;
    for (let pass = 0; pass < 5; pass++) {
      cellContent = cellContent.replace(/<\/?p>/gi, " ");
      cellContent = cellContent.replace(/<br\s*\/?>/gi, " ");
      cellContent = cellContent.replace(/<\/?span>/gi, "");
      cellContent = cellContent.replace(/<\/?font>/gi, "");
    }
    cellContent = cellContent.replace(/\s{2,}/g, " ").trim();
    return `<t${tagType}>${cellContent}</t${tagType}>`;
  });
  
  // Then remove inline wrappers globally (multiple passes for deep nesting)
  for (let pass = 0; pass < 10; pass++) {
    cleaned = cleaned.replace(/<\/?span>/gi, "");
    cleaned = cleaned.replace(/<\/?font>/gi, "");
    cleaned = cleaned.replace(/<div[^>]*>/gi, "");
    cleaned = cleaned.replace(/<\/div>/gi, "");
  }
  
  // Step 4: Clean up whitespace (but preserve table cell whitespace)
  cleaned = cleaned.replace(/>\s+</g, "><");
  
  // Step 5: Add table headers - find first tr in EACH table and convert its td to th
  cleaned = cleaned.replace(/<table><tbody><tr>(.*?)<\/tr>/gis, (match, firstRow) => {
    const headerRow = firstRow.replace(/<td>/gi, "<th>").replace(/<\/td>/gi, "</th>");
    return `<table><thead><tr>${headerRow}</tr></thead><tbody>`;
  });
  
  return cleaned.trim();
}

/**
 * Removes all image and media tags from Markdown
 */
function removeMediaFromMarkdown(markdown: string): string {
  let cleaned = markdown;
  
  // Remove image syntax: ![alt](url)
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  
  // Remove image reference links: ![alt][ref]
  cleaned = cleaned.replace(/!\[[^\]]*\]\[[^\]]+\]/g, "");
  
  // Remove standalone image URLs that might remain
  cleaned = cleaned.replace(/^https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|svg|webp).*$/gim, "");
  
  // Clean up extra blank lines left by removed images
  cleaned = cleaned.replace(/\n\n\n+/g, "\n\n");
  
  return cleaned.trim();
}

export default async function PlainMarkdownCommand() {
  try {
    // Import the main command's processor
    const mainModule = await import("./convert-to-markdown");
    
    // Read and process clipboard using the main command logic
    const clipboardContent = await Clipboard.read();
    
    // Check if we have HTML content
    if (!clipboardContent.html && !clipboardContent.text) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Empty Clipboard",
        message: "Please copy some content first",
      });
      return;
    }
    
    // Get markdown using the main command (it will handle HTML retrieval)
    // For now, run the conversion inline with media removal
    let htmlContent: string | undefined = clipboardContent.html;
    
    // Try macOS clipboard fallback if no HTML
    if (!htmlContent && clipboardContent.text) {
      try {
        const { execSync } = require("child_process");
        const result = execSync("osascript -e 'the clipboard as «class HTML»'", {
          encoding: "buffer",
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024,
        });
        
        const htmlHex = result.toString().replace(/«data HTML|»/g, "").trim();
        if (htmlHex && htmlHex !== "missing value" && htmlHex.length > 20) {
          htmlContent = Buffer.from(htmlHex, "hex").toString("utf-8");
        }
      } catch (error: any) {
        if (error.stdout) {
          const htmlHex = error.stdout.toString().replace(/«data HTML|»/g, "").trim();
          if (htmlHex && htmlHex !== "missing value" && htmlHex.length > 20) {
            htmlContent = Buffer.from(htmlHex, "hex").toString("utf-8");
          }
        }
      }
    }
    
    if (!htmlContent) {
      await showHUD("⚠️ No rich text found");
      return;
    }
    
    // Remove images from HTML before processing
    htmlContent = htmlContent
      .replace(/<img[^>]*>/gi, "")
      .replace(/<video[^>]*>.*?<\/video>/gis, "")
      .replace(/<audio[^>]*>.*?<\/audio>/gis, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, "");
    
    // Use the SAME cleaning logic as convert-to-markdown.tsx
    console.log(`[Plain Markdown] Processing HTML: ${(htmlContent.length / 1024).toFixed(1)} KB`);
    const cleaned = cleanHtmlLightweight(htmlContent);
    console.log(`[Plain Markdown] Cleaned HTML sample:`, cleaned.substring(0, 200));
    
    // Convert to Markdown
    const turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });
    turndownService.use(gfm);
    
    const markdown = turndownService.turndown(cleaned);
    console.log(`[Plain Markdown] Generated ${markdown.length} chars, has tables: ${markdown.includes("| --- |")}`);
    
    const cleanedMarkdown = removeMediaFromMarkdown(markdown);
    
    await Clipboard.copy(cleanedMarkdown);
    await showHUD("✅ Plain Markdown copied (media removed)!");
  } catch (error) {
    console.error("Error:", error);
    await showToast({
      style: Toast.Style.Failure,
      title: "Conversion Failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
