# DeepDesk

桌面AI小精灵 — PMX模型 + 对话 + 截图 + 双模式

## 快速开始（Windows）

1. 安装 [Node.js](https://nodejs.org)（LTS版本）
2. 把PMX模型文件放入 `models/` 目录，重命名为 `model_a.pmx`
3. 把VMD动作文件放入 `motions/`，命名：`idle.vmd` / `walk.vmd` / `dance.vmd`
4. 编辑 `core/config.json` 配置API地址
5. 双击 `start.bat`

## 插件列表

| 插件 | 功能 |
|------|------|
| `plugins/pet` | 小精灵模式：透明悬浮、走路游荡、气泡对话 |
| `plugins/galgame` | Galgame模式：立绘+对话框+打字效果 |
| `plugins/capture` | 截图（全屏/窗口/自由框选） |

## 添加新插件

在 `plugins/` 下新建目录，放入 `index.html`，在 `core/main.js` 中注册窗口即可。

## VMD动作推荐

- 待机/走路：https://bowlroll.net/file/314681
- 跳舞：https://bowlroll.net/file/326459
