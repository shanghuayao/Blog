import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const linksFile = path.resolve("imports/csdn-links.txt");
const outputDir = path.resolve("src/content/blog");
const force = process.argv.includes("--force") || process.env.CSDN_FORCE === "1";
const delayMs = Number(process.env.CSDN_DELAY_MS ?? 2000);
const maxRetries = Number(process.env.CSDN_RETRIES ?? 3);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    mdash: "--",
    ndash: "-",
    hellip: "...",
    copy: "(c)",
  };
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (_, key) => named[key] ?? `&${key};`);
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const data = JSON.parse(decodeHtml(block[1].trim()));
      if (data.headline || data.datePublished) return data;
    } catch {
      // Ignore non-JSON snippets.
    }
  }
  return {};
}

function getMeta(html, name) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

function extractContentViews(html) {
  const marker = html.search(/<div\s+id=["']content_views["'][^>]*>/i);
  if (marker < 0) throw new Error("Cannot find #content_views");
  const openMatch = html.slice(marker).match(/<div\s+id=["']content_views["'][^>]*>/i);
  const start = marker + openMatch[0].length;
  let cursor = start;
  let depth = 1;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  while (depth > 0) {
    const match = tagRe.exec(html);
    if (!match) throw new Error("Cannot find closing #content_views div");
    if (match[0].startsWith("</")) depth -= 1;
    else depth += 1;
    cursor = match.index;
  }
  return html.slice(start, cursor);
}

function protectCodeBlocks(html) {
  const blocks = [];
  const protectedHtml = html.replace(/<pre[\s\S]*?<\/pre>/gi, (block) => {
    const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
    const classMatch = block.match(/language-([\w-]+)/i) || block.match(/class=["'][^"']*lang(?:uage)?-([\w-]+)/i);
    const lang = classMatch?.[1] ?? "";
    const raw = codeMatch ? codeMatch[1] : block;
    const text = decodeHtml(raw.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]+>/g, ""));
    const token = `\n\n@@CODE_BLOCK_${blocks.length}@@\n\n`;
    blocks.push(`\n\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`);
    return token;
  });
  return { html: protectedHtml, blocks };
}

function htmlToMarkdown(html) {
  const protectedResult = protectCodeBlocks(html);
  let value = protectedResult.html;

  value = value
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<a\s+id=["'][^"']*["'][^>]*><\/a>/gi, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => `\n\n${"#".repeat(Number(level))} ${stripTags(content)}\n\n`)
    .replace(/<img\b([^>]*)>/gi, (_, attrs) => {
      const src = attrs.match(/src=["']([^"']+)["']/i)?.[1]?.replace(/#.*$/, "") ?? "";
      const alt = attrs.match(/alt=["']([^"']*)["']/i)?.[1] ?? "";
      return src ? `\n\n![${decodeHtml(alt)}](${decodeHtml(src)})\n\n` : "";
    })
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
      const inner = htmlToMarkdown(content).trim();
      return `\n\n${inner.split(/\n+/).map((line) => `> ${line}`).join("\n")}\n\n`;
    })
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
      const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => `- ${htmlToMarkdown(item[1]).trim()}`);
      return `\n\n${items.join("\n")}\n\n`;
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
      const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item, index) => `${index + 1}. ${htmlToMarkdown(item[1]).trim()}`);
      return `\n\n${items.join("\n")}\n\n`;
    })
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `\n\n${content}\n\n`)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => `\`${decodeHtml(code.replace(/<[^>]+>/g, "")).trim()}\``)
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const label = stripTags(text);
      return label ? `[${label}](${decodeHtml(href)})` : "";
    })
    .replace(/<[^>]+>/g, "");

  value = decodeHtml(value);
  protectedResult.blocks.forEach((block, index) => {
    value = value.replace(`@@CODE_BLOCK_${index}@@`, block);
  });

  return value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function slugify(title, articleId) {
  const ascii = title
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${ascii || "csdn"}-${articleId}`;
}

async function findExistingArticle(articleId) {
  const files = await readdir(outputDir).catch(() => []);
  const file = files.find((name) => name.endsWith(`-${articleId}.md`) || name === `csdn-${articleId}.md`);
  return file ? path.join(outputDir, file) : "";
}

async function fetchHtml(url) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://blog.csdn.net/",
      },
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      return new TextDecoder("utf-8").decode(buffer);
    }

    lastError = new Error(`HTTP ${response.status} for ${url}`);
    const retryable = [403, 408, 429, 500, 502, 503, 504, 521].includes(response.status);
    if (!retryable || attempt === maxRetries) break;
    await wait(delayMs * attempt);
  }
  throw lastError;
}

async function importArticle(url) {
  const articleId = url.match(/details\/(\d+)/)?.[1] ?? Date.now().toString();
  const existingPath = await findExistingArticle(articleId);
  if (existingPath && !force) {
    return { status: "skipped", title: path.basename(existingPath), pubDate: "", outputPath: existingPath };
  }

  const html = await fetchHtml(url);
  const jsonLd = extractJsonLd(html);
  const title = decodeHtml(jsonLd.headline || html.match(/var\s+articleTitle\s*=\s*"([^"]+)"/)?.[1] || "Untitled");
  const description = getMeta(html, "description").replace(/^文章浏览阅读[^。]*。/, "");
  const keywords = getMeta(html, "keywords")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
  const pubDate = (jsonLd.datePublished || html.match(/"pubDate":"([^"]+)"/)?.[1] || new Date().toISOString()).slice(0, 10);
  const contentHtml = extractContentViews(html);
  const markdown = htmlToMarkdown(contentHtml);
  const slug = slugify(title, articleId);
  const sourceUrl = url.replace(/\?.*$/, "");
  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description || title)}`,
    `pubDate: ${pubDate}`,
    `tags: [${keywords.map(yamlString).join(", ")}]`,
    `source: ${yamlString(sourceUrl)}`,
    "---",
    "",
  ].join("\n");
  const outputPath = path.join(outputDir, `${slug}.md`);
  await writeFile(outputPath, `${frontmatter}${markdown}\n`, "utf8");
  return { status: "imported", title, pubDate, outputPath };
}

await mkdir(outputDir, { recursive: true });
const links = (await readFile(linksFile, "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const results = [];
for (const [index, link] of links.entries()) {
  try {
    results.push(await importArticle(link));
  } catch (error) {
    results.push({ status: "failed", title: "", pubDate: "", outputPath: link, error: error.message });
  }

  if (index < links.length - 1) {
    await wait(delayMs);
  }
}

console.table(results);
if (results.some((result) => result.status === "failed")) {
  process.exitCode = 1;
}