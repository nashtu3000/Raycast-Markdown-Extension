#!/usr/bin/env node

// Standalone test of the conversion logic
const TurndownService = require("turndown");
const { gfm } = require("turndown-plugin-gfm");

// Your exact HTML input
const testHtml = `<table><colgroup><col><col><col><col><col></colgroup><tbody><tr><td><p><span>Demographic Variable</span></p></td><td><p><span>Category</span></p></td><td><p><span>Raw Distribution (Unweighted)</span></p></td><td><p><span>Wins Distribution (Sample Specific)</span></p></td><td><p><span>Winsx Distribution (Total Population)</span></p></td></tr><tr><td><p><span>Sample Split</span></p></td><td><p><span>Adolescents (15-19)</span></p></td><td><p><span>20.00%</span></p></td><td><p><span>20.00%</span></p></td><td><p><span>5.90%</span></p></td></tr><tr><td><br></td><td><p><span>Adults (18+)</span></p></td><td><p><span>80.00%</span></p></td><td><p><span>80.00%</span></p></td><td><p><span>94.10%</span></p></td></tr></tbody></table>`;

console.log("=== INPUT ===");
console.log("HTML size:", (testHtml.length / 1024).toFixed(2), "KB");
console.log("");

// Exact cleaning logic from convert-to-markdown.tsx
function cleanHtmlLightweight(html) {
  console.log("[v2026.01.20-FIXED] Running lightweight cleaning...");
  let cleaned = html;
  
  // Step 1: Remove colgroup
  cleaned = cleaned.replace(/<colgroup[^>]*>.*?<\/colgroup>/gis, "");
  
  // Step 2: Remove ALL attributes from ALL opening tags
  cleaned = cleaned.replace(/<(\w+)(\s+[^>]+)>/g, "<$1>");
  
  // Step 3: Remove wrapper tags - run many times for deep nesting
  for (let pass = 0; pass < 10; pass++) {
    cleaned = cleaned.replace(/<\/?p>/gi, " ");
    cleaned = cleaned.replace(/<\/?span>/gi, "");
    cleaned = cleaned.replace(/<\/?div>/gi, "");
    cleaned = cleaned.replace(/<br\s*\/?>/gi, " ");
  }
  
  // Step 4: Clean up whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  cleaned = cleaned.replace(/>\s+</g, "><");
  cleaned = cleaned.replace(/<td>\s*/gi, "<td>");
  cleaned = cleaned.replace(/\s*<\/td>/gi, "</td>");
  
  // Step 5: Add table headers - find first tr in EACH table and convert its td to th
  cleaned = cleaned.replace(/<table><tbody><tr>(.*?)<\/tr>/gis, (match, firstRow) => {
    const headerRow = firstRow.replace(/<td>/gi, "<th>").replace(/<\/td>/gi, "</th>");
    return `<table><thead><tr>${headerRow}</tr></thead><tbody>`;
  });
  
  console.log("[v2026.01.20-FIXED] Lightweight cleaning complete");
  console.log("Sample:", cleaned.substring(0, 200) + "...");
  return cleaned.trim();
}

const cleaned = cleanHtmlLightweight(testHtml);

console.log("");
console.log("=== CLEANED HTML ===");
console.log(cleaned);
console.log("");

// Convert to Markdown
const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});
turndownService.use(gfm);

const markdown = turndownService.turndown(cleaned);

console.log("=== FINAL MARKDOWN ===");
console.log(markdown);
console.log("");
console.log("✅ SUCCESS - Table converted to Markdown!");
