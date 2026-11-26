// 小报静态站生成器
//
// 重做首页 / 新闻 / 教程 / 归档 / 工具箱：
//   node scripts/site.mjs build
//
// 把一篇 Markdown 写成文章，并刷新上面这些页面：
//   node scripts/site.mjs publish content/posts/your-slug.md
//
// 稿子放在 content/posts/，文件名即 slug。frontmatter 见 content/posts/site-is-a-journal.md。
// 这条命令只写本地文件，不会部署到线上。

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "content", "catalog.json");
const site = "https://devtool.blueblueliu.com";

const tools = [
  ["JSON 格式化", "/tools/json-formatter.html"],
  ["JSON 转 TypeScript", "/tools/json-to-typescript.html"],
  ["JSONPath", "/tools/jsonpath-query.html"],
  ["SQL 格式化", "/tools/sql-formatter.html"],
  ["cURL 转代码", "/tools/curl-converter.html"],
  ["代码压缩", "/tools/code-minifier.html"],
  ["Base64", "/tools/base64.html"],
  ["URL 编解码", "/tools/url-encode.html"],
  ["HTML 实体", "/tools/html-entity.html"],
  ["哈希", "/tools/hash-generator.html"],
  ["JWT 解码", "/tools/jwt-decoder.html"],
  ["JWT 编辑", "/tools/jwt-editor.html"],
  ["JWT 弱密钥", "/tools/jwt-weak-key.html"],
  ["正则测试", "/tools/regex-tester.html"],
  ["ReDoS 检查", "/tools/redos-checker.html"],
  ["密码生成", "/tools/password-generator.html"],
  ["UUID", "/tools/uuid-generator.html"],
  ["时间戳", "/tools/timestamp-converter.html"],
  ["Cron", "/tools/cron-generator.html"],
  ["颜色转换", "/tools/color-converter.html"],
  ["CSS 渐变", "/tools/css-gradient.html"],
  ["Box Shadow", "/tools/box-shadow.html"],
  ["二维码", "/tools/qrcode-generator.html"],
  ["图片压缩", "/tools/image-compressor.html"],
  ["文本对比", "/tools/text-diff.html"],
  ["字数统计", "/tools/word-counter.html"],
  ["大小写", "/tools/case-converter.html"],
  ["进制转换", "/tools/number-base.html"],
  ["Lorem Ipsum", "/tools/lorem-ipsum.html"],
  ["Markdown 预览", "/tools/markdown-preview.html"],
];

function readCatalog() {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}

function writeCatalog(items) {
  items.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "zh"));
  fs.writeFileSync(catalogPath, JSON.stringify(items, null, 2) + "\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function inline(source) {
  let text = escapeHtml(source);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const ok = href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
    return `<a href="${escapeAttr(ok ? href : "#")}">${label}</a>`;
  });
  return text;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      html += `<pre data-lang="${escapeAttr(lang)}"><code class="language-${escapeAttr(lang)}">${escapeHtml(buf.join("\n"))}</code></pre>\n`;
      continue;
    }
    if (line.startsWith("### ")) {
      html += `<h3>${inline(line.slice(4))}</h3>\n`;
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      html += `<h2>${inline(line.slice(3))}</h2>\n`;
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i += 1;
      }
      html += `<ul>${items.join("")}</ul>\n`;
      continue;
    }
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("##") &&
      !lines[i].startsWith("- ")
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    html += `<p>${inline(buf.join(" "))}</p>\n`;
  }
  return html;
}

function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) throw new Error("稿子缺少开头的 --- frontmatter");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("frontmatter 没有用 --- 闭合");
  const data = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[match[1]] = value.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
    } else {
      data[match[1]] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: text.slice(end + 5).replace(/^\n/, "") };
}

function shell({ title, description, canonical, body, jsonLd, extraCss = "" }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#f4f0e8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="DevUtils 小报">
<meta property="og:locale" content="zh_CN">
<meta property="og:image" content="${site}/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${site}/og-image.svg">
<meta name="google-site-verification" content="1hdAlnY_EX_FiRYppycKDYJklnmKGdFYAZYAnOK3FAk">
<script type="application/ld+json">
${jsonLd}
</script>
<link rel="stylesheet" href="/css/variables.css">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/blog.css">
<link rel="stylesheet" href="/css/publication.css">
${extraCss}
</head>
<body>
<div id="siteHeader"></div>
${body}
<div id="siteFooter"></div>
<script type="module">
import { initLayout } from "/js/layout.js";
initLayout();
</script>
</body>
</html>
`;
}

function storyHtml(post) {
  const kindLabel = post.kind === "news" ? "新闻" : "教程";
  return `<article class="story">
  <h3><a href="${escapeAttr(post.href)}">${escapeHtml(post.title)}</a></h3>
  <p class="excerpt">${escapeHtml(post.description)}</p>
  <p class="meta">${escapeHtml(post.date)} · ${escapeHtml(post.section || kindLabel)} · ${Number(post.minutes) || 5} 分钟</p>
</article>`;
}

function buildHome(posts) {
  const lead = posts[0];
  const news = posts.filter((post) => post.kind === "news" && post.slug !== lead.slug).slice(0, 6);
  const tutorials = posts.filter((post) => post.kind !== "news" && post.slug !== lead.slug).slice(0, 7);
  const newsBlock = news.length
    ? news.map(storyHtml).join("\n")
    : `<p class="empty">${lead.kind === "news" ? "今天的头条在上面。后面的新闻会接在这里。" : "新闻栏刚开。下一篇会列在这里。"}</p>`;
  const body = `<main class="paper">
  <header class="mast">
    <div>
      <p class="kicker">DevUtils Journal · 最近更新 ${escapeHtml(lead.date)}</p>
      <h1>给开发者的新闻和教程</h1>
      <p class="dek">每天留一条值得再看的变化，再加上能照着做完的教程。在线工具还在，收到工具箱里。</p>
    </div>
  </header>
  <article class="lead">
    <p class="section-label"><span>${lead.kind === "news" ? "最新新闻" : "最新教程"}</span></p>
    <h2><a href="${escapeAttr(lead.href)}">${escapeHtml(lead.title)}</a></h2>
    <p class="excerpt">${escapeHtml(lead.description)}</p>
    <p class="meta">${escapeHtml(lead.date)} · ${Number(lead.minutes) || 5} 分钟阅读</p>
  </article>
  <div class="split">
    <section>
      <h2 class="section-label"><span>每日新闻</span><a href="/news.html">全部</a></h2>
      ${newsBlock}
    </section>
    <section>
      <h2 class="section-label"><span>教程</span><a href="/tutorials.html">全部</a></h2>
      ${tutorials.map(storyHtml).join("\n")}
    </section>
  </div>
</main>`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "DevUtils 小报",
    description: "开发者新闻与教程",
    url: site + "/",
  });
  fs.writeFileSync(path.join(root, "index.html"), shell({
    title: "DevUtils 小报 — 开发者新闻与教程",
    description: "每天一条开发者新闻，加上能照着做的教程。JSON、JWT、正则这些在线工具还在工具箱里。",
    canonical: site + "/",
    body,
    jsonLd,
  }));
}

function buildListing(posts, { file, kind, title, description, kicker, canonicalPath }) {
  const items = kind ? posts.filter((post) => post.kind === kind) : posts;
  const list = items.length
    ? items.map(storyHtml).join("\n")
    : `<p class="empty">这一栏还没有文章。</p>`;
  const body = `<main class="paper">
  <header class="listing-head">
    <p class="kicker">${escapeHtml(kicker)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="dek">${escapeHtml(description)}</p>
  </header>
  ${list}
</main>`;
  fs.writeFileSync(path.join(root, file), shell({
    title: `${title} — DevUtils 小报`,
    description,
    canonical: site + canonicalPath,
    body,
    jsonLd: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: site + canonicalPath,
    }),
  }));
}

function buildTools() {
  const list = tools.map(([name, href]) => `<li><a href="${href}">${escapeHtml(name)}</a></li>`).join("");
  const body = `<main class="paper">
  <header class="listing-head">
    <p class="kicker">Toolbox</p>
    <h1>工具箱</h1>
    <p class="dek">这些页面还在，计算仍在浏览器里完成。它们不再是首页。要读的东西在新闻和教程里。</p>
  </header>
  <ul class="tool-index">${list}</ul>
</main>`;
  fs.writeFileSync(path.join(root, "tools.html"), shell({
    title: "工具箱 — DevUtils 小报",
    description: "原来的在线开发工具：JSON、JWT、正则、时间戳、哈希等，计算在浏览器本地完成。",
    canonical: site + "/tools.html",
    body,
    jsonLd: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "DevUtils 工具箱",
      url: site + "/tools.html",
    }),
  }));
}

function ensureSitemap(urls) {
  const file = path.join(root, "sitemap.xml");
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  for (const url of urls) {
    if (xml.includes(url)) continue;
    xml = xml.replace(
      "</urlset>",
      `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n</urlset>`
    );
  }
  fs.writeFileSync(file, xml);
}

function build() {
  const posts = readCatalog();
  if (!posts.length) throw new Error("catalog.json 是空的");
  buildHome(posts);
  buildListing(posts, {
    file: "news.html",
    kind: "news",
    title: "每日新闻",
    kicker: "News",
    description: "短新闻。一天一条，写一件已经发生、值得开发者留档的变化。",
    canonicalPath: "/news.html",
  });
  buildListing(posts, {
    file: "tutorials.html",
    kind: "tutorial",
    title: "教程",
    kicker: "Tutorials",
    description: "一个具体的坑，写到能照着改完。JSON、时间、编码、数据库、鉴权。",
    canonicalPath: "/tutorials.html",
  });
  buildListing(posts, {
    file: "blog.html",
    kind: null,
    title: "全部文章",
    kicker: "Archive",
    description: "新闻和教程的总目录。",
    canonicalPath: "/blog.html",
  });
  buildTools();
  ensureSitemap([
    site + "/news.html",
    site + "/tutorials.html",
    site + "/tools.html",
    ...posts.map((post) => site + post.href),
  ]);
  console.log(`built ${posts.length} posts`);
}

function publish(fileArg) {
  if (!fileArg) throw new Error("用法: node scripts/site.mjs publish content/posts/slug.md");
  const file = path.resolve(root, fileArg);
  const slug = path.basename(file, ".md");
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("文件名只能用小写字母、数字和连字符");
  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  for (const key of ["title", "description", "date", "kind"]) {
    if (!data[key]) throw new Error(`frontmatter 缺少 ${key}`);
  }
  if (data.kind !== "news" && data.kind !== "tutorial") throw new Error("kind 只能是 news 或 tutorial");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("date 要写成 YYYY-MM-DD");
  const href = `/blog/${slug}.html`;
  const entry = {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    kind: data.kind,
    section: data.section || (data.kind === "news" ? "新闻" : "教程"),
    minutes: Number(data.minutes) || 5,
    href,
    tags: data.tags || [],
  };
  const articleBody = renderMarkdown(body.trim());
  const crumb = data.kind === "news"
    ? `<a href="/news.html">每日新闻</a>`
    : `<a href="/tutorials.html">教程</a>`;
  const related = readCatalog()
    .filter((post) => post.kind === data.kind && post.slug !== slug)
    .slice(0, 2)
    .map((post) => `<a class="related-card" href="${escapeAttr(post.href)}"><div class="related-cat">${escapeHtml(post.section || "")}</div><p class="related-title">${escapeHtml(post.title)}</p><p class="related-desc">${escapeHtml(post.description)}</p></a>`)
    .join("");
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#f4f0e8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<title>${escapeHtml(entry.title)} | DevUtils 小报</title>
<meta name="description" content="${escapeAttr(entry.description)}">
<link rel="canonical" href="${site}${href}">
<meta property="og:title" content="${escapeAttr(entry.title)}">
<meta property="og:description" content="${escapeAttr(entry.description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${site}${href}">
<meta property="og:site_name" content="DevUtils 小报">
<meta property="og:image" content="${site}/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(entry.title)}">
<meta name="twitter:description" content="${escapeAttr(entry.description)}">
<meta name="twitter:image" content="${site}/og-image.svg">
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": data.kind === "news" ? "NewsArticle" : "BlogPosting",
  headline: entry.title,
  description: entry.description,
  datePublished: entry.date,
  dateModified: entry.date,
  author: { "@type": "Organization", name: "DevUtils" },
  publisher: { "@type": "Organization", name: "DevUtils" },
  mainEntityOfPage: site + href,
})}
</script>
<link rel="stylesheet" href="/css/variables.css">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/blog.css">
<link rel="stylesheet" href="/css/publication.css">
</head>
<body>
<div id="siteHeader"></div>
<div class="post-layout">
  <aside class="post-aside-left"><nav class="toc" data-toc></nav></aside>
  <article class="post">
    <nav class="breadcrumb"><a href="/">首页</a><span class="breadcrumb-sep">/</span>${crumb}<span class="breadcrumb-sep">/</span><span>${escapeHtml(entry.title)}</span></nav>
    <header class="post-header">
      <span class="category">${escapeHtml(entry.section)}</span>
      <h1>${escapeHtml(entry.title)}</h1>
      <p class="lede">${escapeHtml(entry.description)}</p>
      <div class="post-meta"><span>${escapeHtml(entry.date)}</span><span class="sep">·</span><span>约 ${entry.minutes} 分钟阅读</span></div>
    </header>
    ${articleBody}
    ${related ? `<section class="related-posts"><h2 class="section-title">继续读</h2><div class="related-grid">${related}</div></section>` : ""}
  </article>
</div>
<div id="siteFooter"></div>
<script type="module" src="/js/blog-post.js"></script>
</body>
</html>
`;
  fs.mkdirSync(path.join(root, "blog"), { recursive: true });
  fs.writeFileSync(path.join(root, "blog", `${slug}.html`), html);
  const items = readCatalog().filter((post) => post.slug !== slug);
  items.push(entry);
  writeCatalog(items);
  build();
  console.log(`published ${href}`);
}

const [command, fileArg] = process.argv.slice(2);
if (command === "publish") publish(fileArg);
else if (command === "build" || !command) build();
else {
  console.error("未知命令。用 build 或 publish <markdown>");
  process.exit(1);
}
