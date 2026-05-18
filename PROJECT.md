# DeepDesk 项目书

## 项目目标
DeepDesk 是桌面 AI 伴侣 / 桌宠实验项目，当前目标是让言言可以在本地从 GitHub 拉取后直接调试 Electron + Three.js 的 MMD 桌宠。

## 当前版本状态
- Electron 入口：`core/main.js`
- 桌宠页面：`plugins/pet/index.html`
- 默认模型：`models/qq_dark_king/model.pmx`
- 默认模式：`core/config.json` 中 `defaultMode=pet`
- Linux/XRDP 启动：`npm start` 使用 `electron --no-sandbox .`

## 已验证
- QQ PMX 模型可加载：bones 781 / materials 42 / textures 71。
- VMD 动作可加载：idle、walk、flip、dance 均已通过 Three.js MMDLoader/MMDAnimationHelper 实测。
- `dance` VMD 可能出现 `unknown char code 130` 警告，但不影响加载。

## 协作规则
- 正式开发位置：共享目录 `/home/aimcafe/projects/deepdesk`。
- 远端仓库：`https://github.com/lieben/deepdesk.git`。
- 每次可运行改动必须提交并推送到 GitHub，便于言言本地拉取调试。
- 项目细节记录在本文件，避免污染全局记忆。

## 启动
```bash
npm install
npm start
```
