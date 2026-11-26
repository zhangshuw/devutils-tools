---
title: 这个站改成小报了
description: 首页现在放新闻和教程。在线工具还在，收进了工具箱。新稿子用 Markdown 生成后写进站点。
date: 2026-11-26
kind: news
section: 站务
minutes: 3
tags: [站点, 写作]
---

首页换成了一份小报。左边是新闻，右边是教程。原来的 JSON、JWT、正则这些页面都还在，地址也没变，只是从首页撤到了[工具箱](/tools.html)。

## 为什么改

三十个工具挤在一页上，打开先看到搜索框和一排色块。功能彼此很像，也很少有人因为某个小工具再回来。真正还能再读一遍的，是那些把坑写清楚的教程。

所以这个站接下来只做两栏：每天一条值得留档的变化，加上能照着做完的教程。

## 一篇稿怎么上去

稿子放在 `content/posts/`，文件名就是地址。这一篇是 `site-is-a-journal.md`，页面在 `/blog/site-is-a-journal.html`。

在 `web-tools` 目录运行：

```
node scripts/site.mjs publish content/posts/site-is-a-journal.md
```

它会做三件事：

- 把 Markdown 渲染成文章页
- 写进 `content/catalog.json`
- 重做首页、每日新闻、教程和归档

稿子开头要有这几行。`kind` 写成 `news` 进每日新闻，写成 `tutorial` 进教程。

```
---
title: 标题
description: 列表页上的那句摘要
date: 2026-11-26
kind: news
section: 分类
minutes: 4
tags: [标签]
---
```

改完已有的稿，再跑一次同一条命令即可，目录会按 slug 覆盖，不会多出一篇。

生成的是静态文件。要让线上读者看到，还得把 `web-tools` 部署到现在的托管上。这条命令只负责写进仓库里的页面。
