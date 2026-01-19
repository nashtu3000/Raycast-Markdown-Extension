import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

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
    
    // Process the HTML (simplified inline conversion)
    const htmlSize = htmlContent.length;
    let cleaned = htmlContent;
    
    // Lightweight cleaning for large docs
    if (htmlSize > 300 * 1024) {
      cleaned = cleaned
        .replace(/\s+(style|class|id|dir|width)="[^"]*"/gi, "")
        .replace(/<div[^>]*>/gi, "").replace(/<\/div>/gi, "\n");
    }
    
    // Convert to Markdown
    const turndownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });
    turndownService.use(gfm);
    
    const markdown = turndownService.turndown(cleaned);
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
