# MYRIFORM Research Atlas

这是 `~/bp_demo` 视频素材的首版网站框架。它把研究成果组织为六段能力链，而不是一次加载全部视频的素材墙。

## 当前结构

- 单页叙事：首页主张 → 六段能力链 → 可筛选研究卡 → 证据边界。
- 视频按需加载：只有打开播放器时才请求 MP4。
- 内容与页面分离：项目条目维护在 `assets/projects.js`。
- 媒体与网站分离：首版只读取已验证的官方 MP4 / 官方 YouTube，不提交本地视频。
- 当前为内部预览，`robots.txt` 禁止搜索引擎收录。

## 本地预览

站点不再依赖本地视频，可以直接以 `site/` 为服务器根目录：

```bash
cd ~/bp_demo/site
python3 -m http.server 8000
```

打开 `http://localhost:8000/`。

## 媒体模式

`assets/config.js` 当前固定为 `official`：所有展项播放 `projects.js` 中登记的官方 MP4 或官方 YouTube embed。直链失效时显示封面，并回退到论文 / 项目页。

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
6. 若转为正式公开站点，再修改 `robots.txt`。

GitHub Pages 只负责静态前端，不提供登录、权限控制、数据库或视频处理。

官方播放器地址及 2026-08-25 检查结果见 `MEDIA_SOURCES.md`。
