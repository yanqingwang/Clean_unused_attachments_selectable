# Clear Unused Attachments Selectable

[English](#english) | [中文](#中文)

---

## English

An Obsidian plugin to clear unused images and attachments with **folder and file type selection** before cleaning.

### Reference

This plugin is based on [oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian) by [ozntel](https://github.com/ozntel), with significant enhancements.

### Original Features (from oz-clear-unused-images)

- Detect unused images/attachments by scanning resolved links, frontmatter, and Canvas files
- Delete to Obsidian trash / System trash / Permanent delete
- Exclude folders from cleaning
- Show operation logs

### Enhancements in This Plugin

- **Pre-cleaning selection dialog**: Before scanning, a modal lets you choose target folders and file types (defaults come from settings but can be modified each time)
- **Confirmation file list**: After scanning, shows all unused files with sizes; you can check/uncheck which ones to delete
- **Default scope settings**: Configure default target folders and file types in settings, but still confirm before each clean
- **Excluded file types**: Prevent specific file types from ever being cleaned (default: images + html + md)
- **Quick type selection**: One-click buttons for common file type groups (images, documents, media)
- **Bilingual UI**: Chinese and English interface, auto-detect or manual selection
- **Better folder matching**: Supports subfolder inclusion when filtering target folders
- **More file type support**: Extended image extension list (ico, tif, tiff)

### Features

1. **Flexible Scope Selection**
   - Choose target folders (comma-separated paths, empty = entire vault)
   - Choose file types (comma-separated extensions, empty = all attachments)
   - Quick presets: All Images / All Documents / All Media

2. **Safe Cleaning Process**
   - Scan → Review list → Confirm → Delete
   - See file paths and sizes before deleting
   - Select/deselect individual files

3. **Smart Detection**
   - Uses Obsidian's metadata cache (resolved links)
   - Scans frontmatter for image references
   - Scans Markdown and Wiki-style links
   - Scans Canvas file nodes

4. **Configurable**
   - Set default folders and file types
   - Exclude specific folders (with optional subfolder exclusion)
   - Exclude specific file types (default: images, html, md)
   - Choose delete destination (Obsidian trash / System trash / Permanent)
   - Toggle operation logs
   - Chinese/English interface

### Installation

#### Manual Installation

1. Download `main.js`, `manifest.json`, `styles.css` from the latest release
2. Copy to `{vault}/.obsidian/plugins/clear-unused-attachments-selectable/`
3. Enable in Settings → Community Plugins

#### Build from Source

```bash
git clone https://github.com/yanqingwang/Clean_unused_attachments_selectable.git
cd Clean_unused_attachments_selectable
npm install
npm run build
```

### Usage

1. Open Command Palette (`Ctrl+P` / `Cmd+P`)
2. Run **"Clear Unused Attachments"**
3. In the selection dialog:
   - Modify target folders if needed (comma-separated)
   - Modify file types if needed (comma-separated)
   - Or use quick buttons for common types
4. Click **"Start Scan"**
5. Review the list of unused files
6. Check/uncheck files you want to delete
7. Click **"Delete Selected"**

### Settings

| Setting | Description |
|---------|-------------|
| Interface Language | Auto (follow Obsidian) / Chinese / English |
| Default Target Folders | Default folders to scan (comma-separated, empty = all) |
| Default Target File Types | Default file extensions to scan (comma-separated, empty = all) |
| Excluded Folder Paths | Folders to exclude from scanning (comma-separated) |
| Exclude Subfolders | Also exclude subfolders of excluded folders |
| Excluded File Types | File types to never clean (comma-separated) |
| Fill All Standard Types | Button to fill all Obsidian standard attachment types |
| Delete Method | Where deleted files go (Obsidian trash / System trash / Permanent) |
| Show Delete Logs | Show log modal after deletion |
| Ribbon Icon | Show ribbon icon for quick access |

### Default Excluded File Types

```text
png, jpg, jpeg, gif, svg, bmp, webp, html, md
```

These are excluded because they may be referenced via CSS, plugins, or other indirect ways that are hard to detect.

### License

MIT

### Credits

- Original plugin: [oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian) by ozntel
- Enhanced and maintained by [Yanqing Wang](https://github.com/yanqingwang)

---

## 中文

一款 Obsidian 插件，用于清理未使用的图片和附件，支持**清理前选择文件夹和文件类型**。

### 参考

本插件基于 [oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian)（作者 [ozntel](https://github.com/ozntel)）开发，并做了大量增强。

### 原插件功能

- 通过扫描 resolved links、frontmatter 和 Canvas 文件检测未使用的图片/附件
- 支持删除到 Obsidian 回收站 / 系统回收站 / 永久删除
- 支持排除文件夹
- 显示操作日志

### 本插件增强

- **清理前选择对话框**：扫描前弹出窗口，可选择目标文件夹和文件类型（默认值来自设置，但每次清理仍可修改）
- **确认文件列表**：扫描后显示所有未使用文件及大小，可勾选/取消勾选要删除的文件
- **默认范围设置**：在设置中配置默认目标文件夹和文件类型，但每次清理仍会确认
- **排除文件类型**：可设置永不清理的文件类型（默认：图片 + html + md）
- **快捷类型选择**：一键选择常见文件类型组（图片/文档/媒体）
- **中英文界面**：支持中文和英文，可自动检测或手动选择
- **更好的文件夹匹配**：过滤目标文件夹时支持包含子文件夹
- **更多文件类型支持**：扩展图片格式列表（ico, tif, tiff）

### 功能特点

1. **灵活的范围选择**
   - 选择目标文件夹（逗号分隔路径，留空 = 整个仓库）
   - 选择文件类型（逗号分隔扩展名，留空 = 所有附件）
   - 快捷预设：所有图片 / 所有文档 / 所有媒体

2. **安全的清理流程**
   - 扫描 → 确认列表 → 勾选 → 删除
   - 删除前可查看文件路径和大小
   - 可单独勾选/取消每个文件

3. **智能检测**
   - 使用 Obsidian metadata cache（resolved links）
   - 扫描 frontmatter 中的图片引用
   - 扫描 Markdown 和 Wiki 风格链接
   - 扫描 Canvas 文件节点

4. **高度可配置**
   - 设置默认文件夹和文件类型
   - 排除特定文件夹（可选是否排除子文件夹）
   - 排除特定文件类型（默认：图片、html、md）
   - 选择删除去向（Obsidian 回收站 / 系统回收站 / 永久删除）
   - 开关操作日志
   - 中英文界面

### 安装

#### 手动安装

1. 从最新 release 下载 `main.js`、`manifest.json`、`styles.css`
2. 复制到 `{vault}/.obsidian/plugins/clear-unused-attachments-selectable/`
3. 在 设置 → 第三方插件 中启用

#### 从源码构建

```bash
git clone https://github.com/yanqingwang/Clean_unused_attachments_selectable.git
cd Clean_unused_attachments_selectable
npm install
npm run build
```

### 使用方法

1. 打开命令面板（`Ctrl+P` / `Cmd+P`）
2. 执行 **"清理未使用的附件"**
3. 在选择对话框中：
   - 按需修改目标文件夹（逗号分隔）
   - 按需修改文件类型（逗号分隔）
   - 或使用快捷按钮选择常见类型
4. 点击 **"开始扫描"**
5. 查看未使用文件列表
6. 勾选/取消勾选要删除的文件
7. 点击 **"删除选中"**

### 设置项

| 设置项 | 说明 |
|--------|------|
| 界面语言 | 跟随 Obsidian / 中文 / English |
| 默认目标文件夹 | 默认扫描的文件夹（逗号分隔，留空 = 全部）|
| 默认目标文件类型 | 默认扫描的文件扩展名（逗号分隔，留空 = 全部）|
| 排除文件夹路径 | 扫描时要排除的文件夹（逗号分隔）|
| 排除子文件夹 | 同时排除上述文件夹的子文件夹 |
| 排除文件类型 | 永不清理的文件类型（逗号分隔）|
| 填入所有标准类型 | 一键填入所有 Obsidian 标准附件类型 |
| 删除方式 | 删除文件的去向（Obsidian 回收站 / 系统回收站 / 永久删除）|
| 显示删除日志 | 删除完成后显示日志弹窗 |
| 功能区图标 | 在左侧功能区显示清理图标 |

### 默认排除的文件类型

```text
png, jpg, jpeg, gif, svg, bmp, webp, html, md
```

这些类型被排除是因为它们可能通过 CSS、插件或其他间接方式被引用，难以完全检测。

### 许可证

MIT

### 致谢

- 原始插件：[oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian) by ozntel
- 增强与维护：[Yanqing Wang](https://github.com/yanqingwang)
