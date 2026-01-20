#!/bin/bash

# Test the conversion logic with input.html
# Usage: ./test-conversion.sh

if [ ! -f "input.html" ]; then
  echo "❌ input.html not found"
  echo "   Run ./save-clipboard-html.sh first to save clipboard HTML"
  exit 1
fi

echo "🔄 Processing input.html..."

node << 'TESTEOF'
const fs = require("fs");
const TurndownService = require("turndown");
const { gfm } = require("turndown-plugin-gfm");

const inputHtml = fs.readFileSync("input.html", "utf-8");
console.log("Input:", (inputHtml.length / 1024).toFixed(1), "KB");

// Import all conversion functions
function expandColspanRowspan(html) {
  let expanded = html;
  expanded = expanded.replace(/<(td|th)([^>]*colspan=["'](\d+)["'][^>]*)>(.*?)<\/\1>/gis, 
    (match, tagName, attrs, colspan, content) => {
      const count = parseInt(colspan);
      const looksLikeHeader = /<(strong|b|h\d)/.test(content) && content.length > 30;
      if (looksLikeHeader || count >= 4) {
        return \`<\${tagName}>\${content}</\${tagName}>\`;
      }
      const cells = [];
      for (let i = 0; i < count; i++) {
        cells.push(\`<\${tagName}>\${content}</\${tagName}>\`);
      }
      return cells.join("");
    }
  );
  return expanded;
}

function cleanHtmlLightweight(html) {
  let cleaned = html;
  cleaned = expandColspanRowspan(cleaned);
  cleaned = cleaned.replace(/<colgroup[^>]*>.*?<\/colgroup>/gis, "");
  
  const linkPlaceholders = [];
  let linkCounter = 0;
  
  cleaned = cleaned.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const marker = \`___LINK_\${linkCounter}___\`;
    linkPlaceholders.push({ marker, href });
    linkCounter++;
    return \`<a>\${marker}\`;
  });
  
  cleaned = cleaned.replace(/<(\w+)(\s+[^>]+)>/g, "<$1>");
  
  linkPlaceholders.forEach(({ marker, href }) => {
    cleaned = cleaned.replace(\`<a>\${marker}\`, \`<a href="\${href}">\`);
  });
  
  cleaned = cleaned.replace(/<t([dh])>(<p>)*(.*?)(<\/p>)*<\/t\1>/gis, (match, tagType, _1, content, _2) => {
    let cellContent = content;
    for (let pass = 0; pass < 5; pass++) {
      cellContent = cellContent.replace(/<\/?p>/gi, " ");
      cellContent = cellContent.replace(/<br\s*\/?>/gi, " ");
      cellContent = cellContent.replace(/<\/?span>/gi, "");
      cellContent = cellContent.replace(/<\/?font>/gi, "");
    }
    cellContent = cellContent.replace(/\s{2,}/g, " ").trim();
    return \`<t\${tagType}>\${cellContent}</t\${tagType}>\`;
  });
  
  for (let pass = 0; pass < 10; pass++) {
    cleaned = cleaned.replace(/<\/?span>/gi, "");
    cleaned = cleaned.replace(/<\/?font>/gi, "");
    cleaned = cleaned.replace(/<div[^>]*>/gi, "");
    cleaned = cleaned.replace(/<\/div>/gi, "");
  }
  
  cleaned = cleaned.replace(/>\s+</g, "><");
  cleaned = cleaned.replace(/<table><tbody><tr>(.*?)<\/tr>/gis, (match, firstRow) => {
    const headerRow = firstRow.replace(/<td>/gi, "<th>").replace(/<\/td>/gi, "</th>");
    return \`<table><thead><tr>\${headerRow}</tr></thead><tbody>\`;
  });
  
  return cleaned.trim();
}

function postProcessMarkdown(markdown) {
  let fixed = markdown;
  fixed = fixed.replace(/^\*\*\s*$/gm, "");
  fixed = fixed.replace(/^\*\*\s*\n+/, "");
  fixed = fixed.replace(/\n+\s*\*\*\s*$/, "");
  fixed = fixed.replace(/\\-/g, "-");
  fixed = fixed.replace(/^\d+\.\s+$/gm, "");
  fixed = fixed.replace(/^●\s+(.+)$/gm, "-   $1");
  fixed = fixed.replace(/\n{4,}/g, "\n\n\n");
  fixed = fixed.replace(/[ \t]+$/gm, "");
  return fixed.trim();
}

const cleaned = cleanHtmlLightweight(inputHtml);
const turndown = new TurndownService({ headingStyle: "atx", hr: "---", bulletListMarker: "-" });
turndown.use(gfm);
const markdown = turndown.turndown(cleaned);
const final = postProcessMarkdown(markdown);

console.log("\n✅ Conversion complete!");
console.log("   Output:", (final.length / 1024).toFixed(1), "KB");
console.log("   Lines:", final.split("\n").length);
console.log("   Tables:", (final.match(/\| --- \|/g) || []).length);
console.log("   Links:", (final.match(/\[[^\]]+\]\(http[^)]+\)/g) || []).length);

fs.writeFileSync("result.md", final);
console.log("\n💾 Saved to: result.md");

TESTEOF

echo ""
echo "✅ Done! Check result.md"
