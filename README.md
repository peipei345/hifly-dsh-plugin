# 飞影 HiFly for DeepSeek Harness

[English](README.en.md)

在 DeepSeek Harness 对话中，通过已有的 `https://hifly.cc/mcp` 使用飞影数字人、声音和视频工具。每个用户使用自己的飞影账号，通过浏览器 OAuth 授权。

## 当前状态

插件安装包已准备发布，尚未进入插件市场。已在 DSH 桌面版 `0.2.2-rc.5` 完成安装、浏览器 OAuth 和真实账户只读查询；连接验证发现了 22 个工具。需要 Node.js 22 或更高版本；DSH 桌面端使用自带的 Node.js。源码发布仓库为 https://github.com/peipei345/hifly-dsh-plugin 。市场收录申请尚未提交。

## 安装与授权

1. 在 Harness 的「插件 → 添加插件」中填写安装地址：

   `https://github.com/peipei345/hifly-dsh-plugin/releases/download/v0.1.0/dsh-hifly-0.1.0.tgz`

   本地开发验证也可以填写插件目录的绝对路径。
2. 安装并启用「飞影 HiFly」。首次连接会打开飞影网站。
3. 核对账号，在飞影页面完成授权，再回到 Harness。
4. 对话中输入：`查询飞影当前套餐和可用积分，只查询，不创建作品。`

完成市场收录后，用户可在 `dshmarket` 中搜索「飞影」或「HiFly」并安装。

### 授权页面的名称与失效提示

飞影目前可能将浏览器跳转到 `hifly.cc/connect/workbuddy`。这是飞影网站的页面路径；本插件请求的客户端名称为 **HiFly for DeepSeek Harness**，远程服务仍为 `https://hifly.cc/mcp`。授权前请核对页面显示的申请方和飞影账号。

如显示「授权请求已失效或无法验证」，旧页面无法继续授权。关闭旧授权页，在 Harness 停用并重新启用飞影插件，使用这次连接新打开的页面。如果浏览器显示授权成功、Harness 仍提示连接断开，可停用后重新启用飞影插件，复用已保存的授权。不要同时运行独立连接验证和 Harness 插件，避免出现多份授权请求。

## 使用示例

- `列出 3 个飞影数字人和 3 个声音，只查询，不创建作品。`
- `用选定的数字人，把这段文案做成 1 条口播视频。先告诉我使用的资源和文案，等我确认后再创建。`
- `查询刚才那个任务的进度，完成后给我作品链接。不要重复提交。`

能用哪些工具、资源和额度，以当前飞影账号和服务端返回为准。视频等生成操作会消耗飞影积分，安装和连接本身不创建作品。

## 连接方式

插件将固定名称 `hifly` 注册到 Harness 的 MCP 管理器。远程端点固定为 `https://hifly.cc/mcp`。由于此 DSH 版本没有原生远程 OAuth 流程，使用固定版本 `mcp-remote@0.16.7` 处理标准 OAuth 发现、PKCE、回调和刷新，再通过 stdio 将工具交给 Harness。

OAuth 状态隔离存放于本机 `~/.dsh/hifly-plugin/auth/`，目录权限为 `0700`。不需要粘贴 API Token，也不包含共享凭据。插件不添加系统登录项、不修改其他 MCP 配置。停用或卸载后，由 Harness 终止连接子进程；账号授权缓存保留在本机，便于重新安装。

## 开发验证

使用 Node.js 22+：

```sh
npm ci --ignore-scripts --legacy-peer-deps
npm run check
npm run verify:connection
npm pack --ignore-scripts
```

连接验证会打开浏览器授权，只列工具并调用 `get_account_capabilities`，不会创建数字人、声音或视频。不要将 OAuth 缓存、日志或内部项目文件上传至公开仓库。

## 支持与文档

- [飞影接入页面](https://hifly.cc/agent)
- [飞影智能体快速接入指南](https://hifly.cc/study/vocation/all/hifly-agent-quick-start.html)
- [DSH Market 收录要求](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
