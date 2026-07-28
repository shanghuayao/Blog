import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const user = process.argv[2] ?? "shanghuayao";
const outputFile = path.resolve("imports/csdn-links.txt");
const profileUrl = `https://blog.csdn.net/${user}`;

const response = await fetch(profileUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  },
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status} for ${profileUrl}`);
}

const html = await response.text();
const articlePattern = new RegExp(`https?:\\/\\/blog\\.csdn\\.net\\/${user}\\/article\\/details\\/\\d+`, "g");
const links = [...new Set([...html.matchAll(articlePattern)].map((match) => match[0]))];

if (links.length === 0) {
  throw new Error(`No CSDN article links found for ${profileUrl}`);
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${links.join("\n")}\n`, "utf8");

console.log(`Collected ${links.length} links from ${profileUrl}`);
console.log(`Saved to ${outputFile}`);