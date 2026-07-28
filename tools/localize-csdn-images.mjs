import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const contentDir = path.resolve("src/content/blog");
const publicImageDir = path.resolve("public/images/csdn");
const basePath = process.env.PUBLIC_BASE_PATH ?? "/Blog/";
const markdownImageRoot = `${basePath.replace(/\/?$/, "/")}images/csdn`;
const delayMs = Number(process.env.CSDN_IMAGE_DELAY_MS ?? 500);
const maxRetries = Number(process.env.CSDN_IMAGE_RETRIES ?? 3);
const force = process.argv.includes("--force") || process.env.CSDN_IMAGE_FORCE === "1";

const imageMarkdownPattern = /!\[([^\]\n]*)\]\((https?:\/\/[^)\s]+)\)/g;
const csdnImageHostPattern = /(^|\.)csdnimg\.cn$/i;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCsdnImage(url) {
  try {
    const parsed = new URL(url);
    return csdnImageHostPattern.test(parsed.hostname);
  } catch {
    return false;
  }
}

function extensionFromContentType(contentType = "") {
  const type = contentType.split(";")[0].trim().toLowerCase();
  const mapping = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/x-icon": ".ico",
  };
  return mapping[type] ?? "";
}

function extensionFromUrl(url) {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase();
    return /^\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(ext) ? ext : "";
  } catch {
    return "";
  }
}

function safeImageName(url, index, ext) {
  const fallback = `image-${String(index + 1).padStart(2, "0")}`;
  let base = fallback;
  try {
    const parsed = new URL(url);
    base = path.basename(parsed.pathname, path.extname(parsed.pathname)) || fallback;
  } catch {
    // Keep fallback.
  }

  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || fallback;

  return `${String(index + 1).padStart(2, "0")}-${safeBase}${ext}`;
}

async function downloadImage(url) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://blog.csdn.net/",
      },
    });

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? "";
      return { buffer, contentType };
    }

    lastError = new Error(`HTTP ${response.status} for ${url}`);
    const retryable = [403, 408, 429, 500, 502, 503, 504, 521].includes(response.status);
    if (!retryable || attempt === maxRetries) break;
    await wait(delayMs * attempt);
  }
  throw lastError;
}

async function localizePost(fileName) {
  const postSlug = path.basename(fileName, ".md");
  const postPath = path.join(contentDir, fileName);
  const markdown = await readFile(postPath, "utf8");
  const matches = [...markdown.matchAll(imageMarkdownPattern)].filter((match) => isCsdnImage(match[2]));

  if (matches.length === 0) {
    return { post: fileName, downloaded: 0, reused: 0, updated: false, failed: 0 };
  }

  const postImageDir = path.join(publicImageDir, postSlug);
  await mkdir(postImageDir, { recursive: true });

  let nextMarkdown = markdown;
  let downloaded = 0;
  let reused = 0;
  let failed = 0;

  for (const [index, match] of matches.entries()) {
    const [original, alt, url] = match;
    const urlExt = extensionFromUrl(url) || ".png";
    let fileNameWithExt = safeImageName(url, index, urlExt);
    let imagePath = path.join(postImageDir, fileNameWithExt);

    try {
      if (force || !(await fileExists(imagePath))) {
        const { buffer, contentType } = await downloadImage(url);
        const contentExt = extensionFromContentType(contentType);
        if (!extensionFromUrl(url) && contentExt && contentExt !== urlExt) {
          fileNameWithExt = safeImageName(url, index, contentExt);
          imagePath = path.join(postImageDir, fileNameWithExt);
        }
        await writeFile(imagePath, buffer);
        downloaded += 1;
        await wait(delayMs);
      } else {
        reused += 1;
      }

      const localUrl = `${markdownImageRoot}/${postSlug}/${fileNameWithExt}`;
      nextMarkdown = nextMarkdown.replace(original, `![${alt}](${localUrl})`);
    } catch (error) {
      failed += 1;
      console.warn(`Failed: ${fileName} -> ${url} (${error.message})`);
    }
  }

  const updated = nextMarkdown !== markdown;
  if (updated) {
    await writeFile(postPath, nextMarkdown, "utf8");
  }

  return { post: fileName, downloaded, reused, updated, failed };
}

async function fileExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md")).sort();
const results = [];
for (const file of files) {
  results.push(await localizePost(file));
}

console.table(results.filter((result) => result.downloaded || result.reused || result.updated || result.failed));
const failedCount = results.reduce((sum, result) => sum + result.failed, 0);
if (failedCount > 0) {
  process.exitCode = 1;
}
