import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "local-dist");
const indexPath = resolve(outputDirectory, "index.html");
let html = readFileSync(indexPath, "utf8");

const scriptSource = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1];
const styleSource = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)?.[1];

if (!scriptSource || !styleSource) throw new Error("找不到本機版的 JavaScript 或 CSS 輸出。");

const script = readFileSync(resolve(outputDirectory, scriptSource), "utf8").replaceAll("</script", "<\\/script");
const style = readFileSync(resolve(outputDirectory, styleSource), "utf8").replaceAll("</style", "<\\/style");

html = html
  .replace(`<script type="module" crossorigin src="${scriptSource}"></script>`, "")
  .replace(`<link rel="stylesheet" crossorigin href="${styleSource}">`, () => `<style>${style}</style>`)
  .replace("</body>", () => `<script>${script}</script>\n  </body>`);

if (/<script[^>]+src=|<link[^>]+stylesheet|chatgpt\.site/i.test(html)) {
  throw new Error("本機版仍含有外部程式、樣式或 ChatGPT Sites 網址。");
}

writeFileSync(indexPath, html);
