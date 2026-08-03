---
title: "如何重置idea ai assistant ACP 插件中的 Cursor 账号登录状态？"
description: "在使用 JetBrains 系列 IDE（如 IntelliJ IDEA, PyCharm 等）配合插件时，经常会遇到想要更换 Cursor 账号却“退出无门”的情况。即使卸载插件还是会重新登录之前的账号。本文分享一个通过手动运行本地 Agent 脚本强制重置授权的方法。_idea里面得cursor怎么更好账号"
pubDate: 2026-03-20
tags: ["开发工具"]
source: "https://blog.csdn.net/shanghuayao/article/details/159283931"
---
在使用 JetBrains 系列 IDE（如 IntelliJ IDEA, PyCharm 等）配合 **ACP (AI Assistant)** 插件时，经常会遇到想要更换 Cursor 账号却“退出无门”的情况。即使卸载插件还是会重新登录之前的账号。

本文分享一个通过手动运行本地 Agent 脚本强制重置授权的方法。

### 💡 问题背景

Cursor 的授权信息由 ACP 插件目录下的 `cursor-agent` 独立管理。需要切换账号时，IDE目前没有提供切换的入口。

### 🛠️ 解决方案：三步强制重置法

#### 第一步：网页端取消授权

在进行本地操作前，先从源头上切断连接：

1. 打开浏览器，登录 [Cursor 官网](https://cursor.com/)。
2. 进入个人设置页面（Settings/Account）。
3. 确保登出当前账号，或者在授权列表中撤销相关授权。

![在这里插入图片描述](/Blog/images/csdn/idea-ai-assistant-acp-cursor-159283931/01-4d0bde8de153401785c721ecaa78d135.png)

#### 第二步：定位本地 Agent 目录

找到 ACP 插件存放代理程序的物理路径。根据你的截图，路径通常类似于：
 `...\JetBrains\acp-agents\cursor\0.1.0\dist-package`

> **提示：** 如果找不到，可以在 Windows 文件资源管理器中搜索 `cursor-agent.cmd`。

#### 第三步：运行重置脚本

这是最关键的一步，直接操作底层脚本来清除状态：

1. **关闭 IDE**：建议先完全退出 IntelliJ IDEA。
2. **进入目录**：打开上述 `dist-package` 文件夹。
3. **运行脚本**：找到 **`cursor-agent.cmd`** 文件。
 通过CMD来运行**`cursor-agent.cmd`** 文件
4. **重新登录**：根据命令行提示来重新在网页授权！
