# 访问地址与部署（2026-10-17）

[← 返回项目总 README](../README.md)


填写者只需要浏览器和账号，无需安装本项目、Node.js 或 MongoDB；必须能够访问承载前端和 API 的服务器。`localhost`、`127.0.0.1` 指向访问者自己的电脑，只适用于本机，复制链接不会自动使服务进入公网。

## 配置约定

项目根目录 `.env` 仅在服务器保存。`APP_ORIGIN` 是允许写请求的唯一精确 Origin（协议、主机、端口）；`PUBLIC_APP_URL` 是分享根地址，必须与它相同，不带末尾 `/` 或子路径。已有 `.env` 没有 `PUBLIC_APP_URL` 时沿用显式的 `APP_ORIGIN`，不会覆盖现有文件。修改后重启相关服务。

`API_HOST` 默认 `127.0.0.1`，可设置 `0.0.0.0` 或 `::1`；`WEB_HOST` 默认 `localhost`，开发局域网访问时设置 `0.0.0.0`。`API_PORT` 默认 3000。服务均不自动开放防火墙。

发布回执和页面“复制链接”使用同一个公开根地址。前端通过服务器生成的 `/app-config.js`（no-store）读取 **仅含 publicAppUrl** 的运行配置；Vite 开发服务提供相同白名单资产。没有配置时页面禁用复制并提示；复制失败时选中链接供手动复制。本机地址有“仅限本机”的提示。客户端不读取 `.env`、数据库连接、JWT/CURSOR 密钥；没有新增公开业务 API。

## 本机开发

```dotenv
APP_ORIGIN=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
WEB_HOST=localhost
API_HOST=127.0.0.1
API_PORT=3000
```

两个终端分别 `npm.cmd run dev:api`、`npm.cmd run dev:web`。浏览器访问 `http://localhost:5173`，不要混用 127.0.0.1。Vite 同源代理 `/api` 到本机 API，运行配置资产由开发服务提供。`npm.cmd run configure` 仅首次生成配置，不覆盖已有 `.env`。

## 同一局域网开发访问

先用 `ipconfig` 找到其他设备可达的有线／Wi-Fi IPv4，下面 **192.168.1.20 仅是示例**，不要选虚拟网卡或照抄。配置：

```dotenv
APP_ORIGIN=http://192.168.1.20:5173
PUBLIC_APP_URL=http://192.168.1.20:5173
WEB_HOST=0.0.0.0
API_HOST=127.0.0.1
API_PORT=3000
```

重启 API 和 Vite，本机及其他设备均用 `http://192.168.1.20:5173`；填写分享链接也是该地址。前端开发服务器监听所有网卡，API 仍只监听回环，通过 Vite 代理访问，其他设备无需访问 3000 或数据库。必要时由维护者只向可信专用网络允许 TCP 5173；检查路由器 AP 隔离、防火墙、设备是否处于同一网络。不要通过开放任意 CORS 或移除 Origin 校验处理问题。配置只支持一个写请求 Origin，切换本机/LAN入口后应统一使用所配置地址。

## 构建后同源服务与域名部署准备

先 `npm.cmd run build`。本机直连构建版使用 APP_ORIGIN/PUBLIC_APP_URL=`http://localhost:3000`，`npm.cmd start`；局域网直连可以改成实际 LAN IP:3000 并设置 API_HOST=0.0.0.0，只开放该 HTTP 端口。切回开发需恢复 5173 配置并重启。

以后通过域名访问时，例如 `https://survey.example.com`：两个 URL 均设为该域名，API_HOST=127.0.0.1；Node 服务负责静态 dist、SPA 回退、`/app-config.js` 和 `/api/v1`，Nginx/Caddy 将域名下所有请求代理到 `http://127.0.0.1:3000`。DNS 指向服务器，反向代理配置正式 TLS 证书，转发 Host 和 X-Forwarded-Proto；HTTPS Origin 会使认证 cookie 使用 Secure。这样前后端同源，无需 CORS。域名变化不需要重新编译前端，需更新服务器配置并重启；不能只把 dist 上传静态托管而遗漏运行配置资产和 API 代理。

此处是部署准备说明，未购买服务器、未开公网隧道、未发布公网。现有本地 MongoDB 回环监听和未启用认证的边界仍见 README；正式服务器仍需落实认证、账号分权、备份及进程运维，浏览器永远不连接数据库。

## 本轮实际范围

本机页面和独立测试服务已验证。测试服务绑定 0.0.0.0，通过本机非回环接口 `172.18.208.1:3110` 成功访问健康检查和公开配置，错误 Origin 返回403；该地址是本次环境选择的网卡，**不作为可用 Wi-Fi 分享地址建议**。未用第二台设备验证网络/防火墙，另启真实Vite测试监听0.0.0.0，以172.18.208.1:5181访问运行配置及/api代理健康均200，测试结束已停止临时进程；业务开发服务仍保持 localhost:5173 配置。没有公网可用性验证。

[← 返回项目总 README](../README.md)
