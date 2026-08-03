---
title: "Git 分支管理指南：如何维护开发分支与发布分支"
description: "围绕 main、develop、feature、release 和 hotfix 分支，系统整理日常开发、版本发布、线上热修复、提交整理与分支保护的通用规范。"
pubDate: 2023-08-03
tags: ["Git"]
---

很多项目最初都是直接在 `main` 分支上开发：功能做到一半就提交，修复和重构混在一起，准备发布时才发现很难判断哪些代码已经稳定、哪个提交对应线上版本。

解决这个问题的重点是明确分支职责，让开发代码、待发布代码和线上代码沿着可预测的路径流动。

本文介绍一套适合有固定版本发布、测试环境和多人协作项目的 Git 分支维护规范。

## 一、先明确每条分支的职责

一套常见的分支结构包括：

| 分支 | 主要职责 | 生命周期 | 是否允许直接提交 |
|---|---|---|---|
| `main` | 保存已经正式发布的代码 | 长期 | 不允许 |
| `develop` | 集成下一版本的开发成果 | 长期 | 通常不允许 |
| `feature/*` | 开发单个功能或完成单项任务 | 短期 | 允许 |
| `release/*` | 发布前测试、修复和版本准备 | 短期 | 仅允许发布相关修改 |
| `hotfix/*` | 修复线上正式版本的紧急问题 | 短期 | 允许 |

它们之间的典型流向如下：

```text
feature/* ──> develop ──> release/* ──> main
                  ^                       │
                  └───────────────────────┘

main ──> hotfix/* ──> main
              └─────> develop
```

最重要的原则只有两条：

- `main` 始终代表已发布或可以立即发布的正式代码。
- `develop` 始终代表正在准备的下一个版本。

只要这两个定义不被破坏，团队就能清楚地区分线上状态与开发状态。

## 二、main 分支如何维护

`main` 是正式发布分支，不应该承担日常开发工作。

建议遵守以下规则：

1. 禁止直接向 `main` 推送代码。
2. 只能通过 Pull Request 或 Merge Request 合并。
3. 合并前必须通过自动化测试、构建和必要的代码审查。
4. 每次正式发布都创建版本 Tag，例如 `v1.0.0`。
5. 不对已经共享的 `main` 执行 Rebase 或强制推送。
6. `main` 上的任意提交原则上都应该能够构建和部署。

`main` 保存的不只是代码，也是线上版本的审计记录。删除或改写它的历史，会让已经存在的 Tag、部署记录、Pull Request 和其他开发者的本地仓库失去可靠的引用关系。

因此，即使早期曾经直接在 `main` 开发，也通常没有必要清空历史。更合理的做法是保留旧记录，从一个明确的时间点开始执行新规范。

可以为这个切换点创建一个 Tag：

```bash
git switch main
git tag -a workflow-baseline-2026-08-03 -m "Start standardized branch workflow"
git push origin workflow-baseline-2026-08-03
```

## 三、develop 分支如何维护

`develop` 是下一版本的集成分支。已经完成并通过基本验证的功能，才应该进入这里。

首次建立 `develop` 时，应从当前 `main` 创建：

```bash
git switch main
git pull --ff-only origin main
git switch -c develop
git push -u origin develop
```

如果远端已经存在 `develop`，则不需要重复创建。

`develop` 同样建议开启分支保护，禁止随意强制推送。虽然它不一定像 `main` 一样随时可以上线，但至少应保持能够正常构建，并通过项目约定的基础测试。

## 四、日常功能开发流程

每个功能、缺陷或独立任务都应该从 `develop` 创建短期分支。

### 1. 创建功能分支

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/user-login
```

常见命名方式包括：

```text
feature/user-login
feature/order-export
fix/empty-company-name
refactor/payment-service
```

分支名称应表达任务内容，不建议使用 `feature/test`、`fix/bug` 之类缺少信息的名称。

### 2. 在功能分支提交代码

开发期间可以保留较细的本地提交：

```bash
git add src/login
git commit -m "feat: add login form"

git add src/api
git commit -m "feat: connect login API"

git add tests
git commit -m "test: cover login failure"
```

如果分支尚未共享，可以在提交 Pull Request 前使用交互式 Rebase 整理提交：

```bash
git rebase -i develop
```

可以合并无意义的临时提交、调整提交顺序或修改提交说明。但已经被其他人使用的分支不应随意改写历史。

### 3. 合入 `develop`

功能分支合入 `develop` 时，推荐使用 **Squash Merge**，将一个任务中的多个临时提交整理成一个完整提交：

```text
feat: add user login
```

这样既允许开发者在功能分支上频繁保存进度，又不会让 `develop` 充满 `fix typo`、`try again`、`temporary commit` 等噪声。

通过命令行操作时可以这样做：

```bash
git switch develop
git pull --ff-only origin develop
git merge --squash feature/user-login
git commit -m "feat: add user login"
git push origin develop
```

合并完成并确认远端代码正常后，删除短期分支：

```bash
git branch -d feature/user-login
git push origin --delete feature/user-login
```

## 五、正式版本发布流程

当 `develop` 已经包含某个版本计划中的全部功能时，从它创建发布分支：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release/1.4.0
git push -u origin release/1.4.0
```

`release/*` 阶段的目标是稳定版本，而不是继续加入新功能。这个分支通常只接受：

- 测试发现的缺陷修复；
- 版本号修改；
- CHANGELOG 更新；
- 构建、部署和配置调整；
- 发布前的文档补充。

测试通过后，将发布分支合入 `main`：

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff release/1.4.0 -m "release: v1.4.0"
git tag -a v1.4.0 -m "Release v1.4.0"
git push origin main
git push origin v1.4.0
```

这里使用 `--no-ff`，是为了在历史中保留一个明确的发布节点。即使 Git 可以快进合并，也会生成一条容易识别的发布提交。

发布分支中可能包含测试阶段产生的修复、版本号和文档变更，因此发布后必须将 `main` 同步回 `develop`：

```bash
git switch develop
git pull --ff-only origin develop
git merge main
git push origin develop
```

确认 `main`、`develop` 和 Tag 正确后，可以删除发布分支：

```bash
git branch -d release/1.4.0
git push origin --delete release/1.4.0
```

## 六、线上紧急修复流程

线上问题必须基于当前正式版本修复，因此 `hotfix/*` 应从 `main` 创建，而不是从 `develop` 创建。

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/1.4.1-login-timeout
```

完成修复并通过测试后，将它合入 `main`，发布补丁版本：

```bash
git switch main
git merge --no-ff hotfix/1.4.1-login-timeout -m "release: v1.4.1"
git tag -a v1.4.1 -m "Release v1.4.1"
git push origin main
git push origin v1.4.1
```

随后必须把修复同步到 `develop`，否则相同问题可能在下一个版本中再次出现：

```bash
git switch develop
git merge main
git push origin develop
```

如果此时存在尚未发布的 `release/*` 分支，也要把该修复同步进去并重新测试。

## 七、什么时候使用 Squash、Merge 和 Rebase

三种操作解决的问题不同，不应该混用。

| 操作 | 推荐场景 | 目的 |
|---|---|---|
| Squash Merge | `feature/*` 合入 `develop` | 把一个任务整理成一个提交 |
| `merge --no-ff` | `release/*` 或 `hotfix/*` 合入 `main` | 保留明确的发布节点和分支关系 |
| Rebase | 尚未共享的个人功能分支 | 整理本地提交或跟进最新基线 |

一条实用边界是：

> Rebase 自己尚未共享的提交，Merge 已经共享的历史。

不要对 `main`、`develop` 等公共分支执行 Rebase，也不要为了让提交图“看起来漂亮”而改写已经发布的历史。

如果确实需要更新自己功能分支的基线，可以执行：

```bash
git switch feature/user-login
git fetch origin
git rebase origin/develop
```

如果该分支已经推送但确认只有自己使用，更新远端时应使用：

```bash
git push --force-with-lease
```

`--force-with-lease` 会检查远端分支是否出现了自己不知道的新提交，比直接使用 `--force` 更安全，但它仍然不适用于公共分支。

## 八、提交信息规范

推荐使用 Conventional Commits 风格，让每条提交说明都表达变更类型和目的：

```text
feat: add asset import
fix: handle empty company name
refactor: simplify validation flow
test: cover duplicate submission
docs: update deployment guide
chore: upgrade dependencies
release: v1.4.0
```

常用类型包括：

| 类型 | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `refactor` | 不改变外部行为的代码重构 |
| `perf` | 性能优化 |
| `test` | 测试代码 |
| `docs` | 文档修改 |
| `build` | 构建系统或依赖修改 |
| `ci` | CI/CD 配置修改 |
| `chore` | 其他维护工作 |
| `release` | 正式版本发布 |

提交说明应描述“做了什么”，并保持一个提交只解决一个相对完整的问题。仅写“修改代码”“修复问题”通常无法为后续排查提供有效信息。

## 九、如何查看清晰的发布历史

完整 Git 历史会包含功能提交、合并节点和修复记录。查看正式发布主线时，可以只看 `main` 的第一父提交：

```bash
git log --first-parent --oneline main
```

结果会更接近版本时间线：

```text
8b9c123 release: v1.4.1
10fa762 release: v1.4.0
c2327ea release: v1.3.0
```

查看版本 Tag：

```bash
git tag --list --sort=-version:refname
```

查看两个版本之间的实际改动：

```bash
git log --oneline v1.3.0..v1.4.0
git diff v1.3.0..v1.4.0
```

版本发布情况应该以 Tag 为准，而不应依靠分支名称或聊天记录判断。

## 十、仓库保护与自动化建议

仅靠口头约定很难长期维持规范，最好在 GitHub、GitLab 或其他代码平台中设置分支保护。

`main` 建议至少启用：

- 禁止直接 Push；
- 禁止 Force Push；
- 必须通过 Pull Request 合并；
- 至少一人完成代码审查；
- CI 构建和测试通过后才能合并；
- 限制可以合并和发布的成员。

`develop` 建议启用：

- 禁止 Force Push；
- 通过 Pull Request 合并；
- 基础测试和构建必须通过；
- 功能分支优先使用 Squash Merge。

CI/CD 可以根据分支和 Tag 分工：

| 触发条件 | 建议动作 |
|---|---|
| `feature/*` 提交 | 单元测试、静态检查 |
| 合入 `develop` | 完整构建、集成测试、部署测试环境 |
| `release/*` 更新 | 回归测试、部署预发布环境 |
| `v*` Tag 创建 | 构建正式制品、部署生产环境 |

生产部署最好由不可变的 Tag 或制品版本触发，而不是简单地“部署 `main` 最新代码”。这样才能准确回滚到已知版本。

## 十一、常见错误

### 1. 长期直接在 `main` 开发

这会导致未完成代码与线上代码混在一起，难以发布、回滚和定位版本。

### 2. 把 `develop` 当作所有人的长期个人分支

开发者应在短期 `feature/*` 分支工作。`develop` 是集成结果，不是保存个人半成品的地方。

### 3. 发布后忘记同步回 `develop`

发布阶段和线上热修复产生的改动如果没有回到 `develop`，后续版本可能丢失修复。

### 4. 功能分支存在数周甚至数月

分支存活越久，与 `develop` 的差异越大，最终合并风险越高。大功能应拆分成可以独立验证的小任务。

### 5. 用普通 `--force` 推送公共分支

这可能直接覆盖其他人的提交。公共分支应禁止强制推送；个人分支确需改写时也应使用 `--force-with-lease`。

### 6. 每次提交都混合多个主题

一个提交同时包含功能、格式化、重构和依赖升级，会让审查、回滚和问题定位变得困难。

## 十二、小团队可以采用简化流程

并非所有项目都必须长期保留五类分支。对于一两个人维护、发布频率较低的项目，可以只使用：

```text
main
develop
feature/*
```

基本规则仍然相同：

1. 功能从 `develop` 拉出。
2. 功能通过 Squash Merge 合回 `develop`。
3. 发布前在 `develop` 完成测试和版本准备。
4. 通过 Pull Request 将 `develop` 合入 `main`。
5. 在 `main` 创建版本 Tag。
6. 如果发布阶段在 `main` 产生额外修改，再同步回 `develop`。

只有当项目确实存在独立的预发布测试周期时，再引入 `release/*`；只有线上需要紧急补丁时，才创建 `hotfix/*`。分支模型应服务于实际协作，而不是为了形式增加步骤。

## 十三、一份可以直接执行的维护清单

日常开发前：

- 从最新 `develop` 创建 `feature/*`。
- 一个分支只处理一个明确任务。

合入 `develop` 前：

- 完成自测、代码检查和必要文档。
- 整理提交说明。
- 使用 Squash Merge 合入。
- 合并完成后删除功能分支。

正式发布前：

- 冻结新功能。
- 从 `develop` 创建 `release/*`，或对小项目直接准备发布。
- 更新版本号与 CHANGELOG。
- 完成回归测试和发布审批。

正式发布时：

- 将发布内容合入 `main`。
- 创建并推送版本 Tag。
- 由 Tag 构建和部署正式制品。
- 将发布阶段的修改同步回 `develop`。

线上热修复时：

- 从 `main` 创建 `hotfix/*`。
- 发布补丁版本并创建新 Tag。
- 将修复同步到 `develop` 和仍在进行的发布分支。

## 总结

开发分支和发布分支的维护，本质上是维护几条稳定的约束：

- `main` 只保存正式发布状态，并用 Tag 标识具体版本；
- `develop` 集成下一个版本，不直接承担个人开发；
- 功能分支短期存在，完成后以一个清晰提交合入；
- 发布分支只做稳定化，不继续扩展需求；
- 热修复从线上版本出发，并同步回后续开发线；
- 公共历史一旦共享就不轻易改写。

好的 Git 历史不一定完全线性，也不需要删除曾经不够规范的记录。真正有价值的是：任何人都能快速判断线上是什么版本、下一个版本包含什么、某个修复是否已经进入发布，以及出现问题时应该回到哪里。
