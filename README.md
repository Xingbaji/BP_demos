# MariForm Research Demos

这是面向投资人的技术能力与代表性研究页面。页面依据融资 BP 的技术主线组织，以自研引擎录屏和公开视频为主要入口，说明已有工作如何共同支撑“现实理解 → 复杂物理 → 规模化数据 → 模型与真机 → 真实评测”的能力闭环。

## 当前结构

- 单页结构：核心命题 → 能力闭环 → 四项自研引擎 Demo → 关键公开证据 → 完整研究矩阵 → 十一项公开工作 Demo → 归属说明。
- 公司能力优先：`assets/engine/` 中的四段真实运行录屏单独成区，与第三方发表体系下的公开研究明确区分。
- Demo 优先：自研引擎录屏直接嵌入页面；点击任意公开研究卡片可播放官方 MP4 / YouTube，论文与项目主页保留为核验入口。
- 完整矩阵：融资讲稿中的 18 项代表工作全部列出；其中有可靠官方视频的 10 项研究加 Metric3D v2 展开为 Demo 卡片。
- 路线优先：项目按能力链排序，而不是按发表时间或论文清单平铺。
- 视频按需加载：自研引擎视频和公开研究媒体都只在用户点击播放后请求，首屏不下载 MP4 或 YouTube embed。
- 内容与页面分离：项目条目维护在 `assets/projects.js`。
- 媒体来源分离：公开研究仍只读取已验证的官方 MP4 / 官方 YouTube；四段公司自研引擎网页版本位于 `assets/engine/`。
- 当前为链接预览，页面通过 `robots` meta 请求搜索引擎不收录；公开仓库与已知网址仍可被直接访问。
- 视频播放器支持带 `?work=<id>` 参数的单项地址。

## 本地预览

站点所需的自研引擎网页视频已包含在仓库中，可以直接以 `site/` 为服务器根目录：

```bash
cd ~/bp_demo/site
python3 -m http.server 8000
```

打开 `http://localhost:8000/`。

## 媒体模式

`assets/config.js` 当前固定为 `official`：此设置只控制十一项公开研究 Demo，播放 `projects.js` 中登记的官方 MP4 或官方 YouTube embed。直链失效时显示封面，并回退到论文 / 项目页。自研引擎视频始终读取 `assets/engine/` 中的网页版本。

若后续改用自有对象存储，可把模式改为 `local`，并把 `mediaBaseUrl` 设置为 HTTPS 媒体源：

```js
window.MYRIFORM_SITE_CONFIG = {
  mediaMode: "local",
  mediaBaseUrl: "https://media.example.com/bp-demo",
};
```

对象存储中的 key 应与 `projects.js` 的 `video` 路径一致。不要把 `~/bp_demo` 的 14 GB 素材整体提交到 GitHub。

## GitHub Pages

本目录可以作为独立仓库根目录。工作流位于 `.github/workflows/deploy-pages.yml`。首次发布前：

1. 关闭素材版权、肖像、场地与机构外发授权；
2. 只上传网站代码和轻量 poster；
3. 确认各项目是否允许第三方嵌入 / hotlink；
4. 对稳定性要求高的视频转码后放入自有对象存储 / CDN；
5. 在 GitHub 仓库 Settings → Pages 中选择 GitHub Actions；
6. 若转为正式公开站点，删除 `index.html` 中的 `noindex` meta；项目子路径下的 `robots.txt` 不能代替该设置。

GitHub Pages 只负责静态前端，不提供登录、权限控制、数据库或视频处理。

官方播放器地址及 2026-08-25 检查结果见 `MEDIA_SOURCES.md`。
