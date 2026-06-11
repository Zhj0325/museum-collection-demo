# 部署说明

## 当前在线演示（临时隧道）

本机已通过 Cloudflare 快速隧道发布演示站（无需任何账号）：

- 启动方式（两个进程，关机/关进程后失效，重开会生成新网址）：
  ```powershell
  cd museum-web
  npx vite build --config vite.config.demo.js   # 产出 dist-demo（强制演示模式）
  npx vite preview --config vite.config.demo.js --port 4173   # 本地静态服务
  npx cloudflared tunnel --url http://localhost:4173 --protocol http2   # 公网网址在输出中
  ```
- 注意：本机网络代理会干扰 QUIC，务必加 `--protocol http2`。

## 单文件版（最简单的永久发布方式）

`dist-demo/index.html` 是**完全自包含**的单个 HTML（约 380KB，内联了全部 JS/CSS，
内置 Mock 数据演示模式）。把这一个文件上传到任意静态空间即可：

- GitHub Pages：新建仓库 → 上传该文件 → Settings → Pages → 选择 main 分支根目录
- 或任意支持静态文件的服务器/网盘直链

## GitHub Pages 自动部署（推荐的正式方案）

`.github/workflows/deploy.yml` 已就绪。只需把 `museum-web` 目录推送到一个
GitHub 仓库的 main 分支，Actions 会自动构建并发布 Pages（含自动启用 Pages）。

当前阻碍：本机配置的 GitHub 令牌（账号 Zhj0325）为**只读**，无法建仓/推送。
解决其一即可：
1. 在 GitHub → Settings → Developer settings 重新生成 PAT，
   勾选 `repo` + `workflow` 权限（classic），更新到 MCP github 服务器配置；或
2. 在浏览器登录 github.com 后告诉我，我可以通过网页完成建仓与上传。

## 演示模式开关

- 触发条件（满足其一）：域名为 `*.github.io` / URL 带 `?demo` / 构建时 `VITE_DEMO=1`
- 数据保存在 sessionStorage：刷新保留，关闭标签页重置
- 连接真实后端的正常构建：`npm run build`（不设 VITE_DEMO）
