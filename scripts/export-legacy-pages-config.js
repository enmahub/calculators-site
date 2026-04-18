/**
 * Export root-level legacy calculator HTML into legacy-pages.config.json (body = card-only HTML).
 *
 * Contract: `body` must NOT include the generator "Related" block (hub line + h2 + ul + optional
 * details). That block is appended by legacyStaticTemplate / relatedHtml in generate-pages.js.
 * stripEmbeddedRelatedSection() removes known patterns; keep it aligned with relatedHtml output there.
 * If a future layout adds new markup before/after Related, extend the stripper—do not hand-edit JSON
 * to delete Related unless you also fix this script.
 */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outputPath = path.join(root, "legacy-pages.config.json");

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

/** Drop list items whose link resolves to the same page as `pageRef` (legacy card HTML). */
function stripSelfListItemsFromUls(html, pageRef) {
  const refNorm = normalizePath(pageRef);
  const selfKey = refNorm.toLowerCase();
  return html.replace(/<ul>([\s\S]*?)<\/ul>/gi, (full, inner) => {
    const cleaned = inner.replace(/<li\b[\s\S]*?<\/li>/gi, (li) => {
      const m = li.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!m) {
        return li;
      }
      const pathOnly = m[1].replace(/^\.\//, "").split("#")[0].split("?")[0];
      const resolved = normalizePath(
        path.posix.normalize(path.posix.join(path.posix.dirname(refNorm), pathOnly))
      );
      if (resolved.toLowerCase() === selfKey) {
        return "";
      }
      return li;
    });
    return `<ul>${cleaned}</ul>`;
  });
}

const CATEGORY_BY_FILE = {
  "age-calculator.html": { category: "Health", hubPath: "health-calculators.html" },
  "bmi-calculator.html": { category: "Health", hubPath: "health-calculators.html" },
  "calorie-calculator.html": { category: "Health", hubPath: "health-calculators.html" },
  "macros-calculator.html": { category: "Health", hubPath: "health-calculators.html" },
  "ovulation-calculator.html": { category: "Health", hubPath: "health-calculators.html" },
  "weight-loss-calculator.html": { category: "Health", hubPath: "health-calculators.html" },

  "gpa-calculator.html": { category: "Career", hubPath: "career-calculators.html" },
  "salary-calculator.html": { category: "Career", hubPath: "career-calculators.html" },

  "celsius-to-fahrenheit-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "hours-to-days-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "kilograms-to-pounds-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "kilometers-to-miles-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "liters-to-gallons-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "minutes-to-hours-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "percentage-calculator.html": { category: "Conversions", hubPath: "conversion-calculators.html" },
  "seconds-to-minutes-converter.html": { category: "Conversions", hubPath: "conversion-calculators.html" },

  "break-even-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "compound-interest.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "debt-payoff.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "discount-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "inflation-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "interest-rate-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "loan-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "mortgage-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "profit-margin-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "retirement-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "savings-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "tax-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" },
  "tip-calculator.html": { category: "Financial", hubPath: "financial-calculators.html" }
};

const SKIP_FILES = new Set([
  "index.html",
  "generated-calculators.html",
  "financial-calculators.html",
  "conversion-calculators.html",
  "health-calculators.html",
  "career-calculators.html",
  "about.html",
  "contact.html",
  "privacy.html",
  "terms.html",
  "google00989570bfb5b7e8.html"
]);

function stripEmbeddedRelatedSection(html) {
  let next = html || "";
  // Old manual blocks (hr optional).
  next = next.replace(
    /(?:<hr\s*\/?>(?:\s|\r\n|\n)*)(?:\s|\r\n|\n)*<h2>\s*(?:Related Calculators|Calculadoras relacionadas)\s*<\/h2>\s*<ul>[\s\S]*?<\/ul>\s*/gi,
    ""
  );
  next = next.replace(/<p>\s*Related Calculators:\s*<\/p>\s*<ul>[\s\S]*?<\/ul>\s*/gi, "");
  // Generator tail: must run before orphan-hub strip so the hub <p> is last in the string.
  next = next.replace(
    /<h2>\s*(?:Related Calculators|Calculadoras relacionadas)\s*<\/h2>\s*<ul>[\s\S]*?<\/ul>(?:\s*<details>[\s\S]*?<\/details>)?\s*/gi,
    ""
  );
  // Hub line from relatedHtml (EN: home | hub; ES: home | english | hub)—only safe at end of card HTML.
  next = next.replace(
    /\s*<p>\s*(?:(?:<a[^>]+>[\s\S]*?<\/a>\s*\|\s*)+<a[^>]+>[\s\S]*?<\/a>\s*)<\/p>\s*$/i,
    ""
  );
  return next.replace(/(?:\r\n|\n|\r|\s)+$/g, "");
}

function normalizeLegacyCardHtml(content, pageRef) {
  let next = content || "";
  next = stripEmbeddedRelatedSection(next);
  if (pageRef) {
    next = stripSelfListItemsFromUls(next, pageRef);
  }
  next = next.replace(/<input([^>]*?)class="([^"]*?)"([^>]*?)>/gi, (full, before, classes, after) => {
    const filtered = classes
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item && item.toLowerCase() !== "result");
    if (filtered.length === 0) {
      return `<input${before}${after}>`;
    }
    return `<input${before}class="${filtered.join(" ")}"${after}>`;
  });
  return next;
}

function extractCardContent(content, fileName) {
  const cardMatch = content.match(
    /<div class="card">([\s\S]*?)<\/div>\s*(?:<div class="trust-block"|<div class="footer"|<details|<\/div>\s*<\/body>)/i
  );
  if (!cardMatch) {
    return "";
  }
  let cardInner = cardMatch[1];
  cardInner = cardInner.replace(/<div class="trust-block">[\s\S]*?<\/div>/gi, "");
  cardInner = cardInner.replace(/<script[^>]*src="site-analytics\.js"[^>]*><\/script>/gi, "");
  cardInner = normalizeLegacyCardHtml(cardInner, fileName).trim();
  cardInner = cardInner.replace(/^<div class="card">\s*/i, "");
  cardInner = cardInner.replace(/\s*<\/div>\s*$/i, "");
  return cardInner;
}

function isGeneratedPattern(fileName) {
  return (
    /^\d+-loan-payment-calculator\.html$/i.test(fileName) ||
    /^\d+-salary-to-hourly-calculator\.html$/i.test(fileName) ||
    /^[a-z]{3}-to-[a-z]{3}-converter\.html$/i.test(fileName)
  );
}

const files = fs
  .readdirSync(root)
  .filter((name) => name.endsWith(".html"))
  .filter((name) => !SKIP_FILES.has(name))
  .filter((name) => !isGeneratedPattern(name))
  .sort();

const pages = files.map((fileName) => {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  const titleMatch = source.match(/<title>([^<]+)<\/title>/i);
  const descriptionMatch = source.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const langMatch = source.match(/<html[^>]*\slang="([^"]+)"/i);
  const cardBody = extractCardContent(source, fileName);
  const routing = CATEGORY_BY_FILE[fileName] || {
    category: "Financial",
    hubPath: "financial-calculators.html"
  };

  return {
    fileName,
    pagePath: fileName,
    lang: langMatch ? langMatch[1].toLowerCase() : "en",
    marketId: "en",
    category: routing.category,
    hubPath: routing.hubPath,
    title: titleMatch ? titleMatch[1].trim() : "Practical Calculators",
    description: descriptionMatch ? descriptionMatch[1].trim() : "",
    h1: (cardBody.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [null, "Calculator"])[1].replace(/<[^>]+>/g, "").trim(),
    trustTopic: "calculator",
    indexable: true,
    body: cardBody
  };
});

const payload = { pages };
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${pages.length} entries to legacy-pages.config.json`);
