# Clear Unused Attachments Selectable

An Obsidian plugin to clear unused images and attachments with **folder and file type selection** before cleaning.

## Reference

This plugin is based on [oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian) by [ozntel](https://github.com/ozntel), with significant enhancements:

### Original Features (from oz-clear-unused-images)
- Detect unused images/attachments by scanning resolved links, frontmatter, and Canvas files
- Delete to Obsidian trash / System trash / Permanent delete
- Exclude folders from cleaning
- Show operation logs

### Enhancements in This Plugin
- **Pre-cleaning selection dialog**: Before scanning, a modal lets you choose target folders and file types (defaults come from settings but can be modified each time)
- **Confirmation file list**: After scanning, shows all unused files with sizes; you can check/uncheck which ones to delete
- **Default scope settings**: Configure default target folders and file types in settings, but still confirm before each clean
- **Quick type selection**: One-click buttons for common file type groups (images, documents, media)
- **Better folder matching**: Supports subfolder inclusion when filtering target folders
- **Chinese localization**: UI text in Chinese
- **More file type support**: Extended image extension list (ico, tif, tiff)

## Features

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
   - Choose delete destination (Obsidian trash / System trash / Permanent)
   - Toggle operation logs

## Installation

### Manual Installation
1. Download `main.js`, `manifest.json`, `styles.css` from the latest release
2. Copy to `{vault}/.obsidian/plugins/clear-unused-attachments-selectable/`
3. Enable in Settings → Community Plugins

### Build from Source
```bash
git clone https://github.com/yanqingwang/Clean_unused_attachments_selectable.git
cd Clean_unused_attachments_selectable
npm install
npm run build
```

## Usage

1. Open Command Palette (`Ctrl+P` / `Cmd+P`)
2. Run **"清理未使用的附件"** (Clear Unused Attachments)
3. In the selection dialog:
   - Modify target folders if needed (comma-separated)
   - Modify file types if needed (comma-separated)
   - Or use quick buttons for common types
4. Click **"开始扫描"** (Start Scan)
5. Review the list of unused files
6. Check/uncheck files you want to delete
7. Click **"删除选中"** (Delete Selected)

## Settings

| Setting | Description |
|---------|-------------|
| 默认目标文件夹 | Default folders to scan (comma-separated, empty = all) |
| 默认目标文件类型 | Default file extensions to scan (comma-separated, empty = all) |
| 排除文件夹路径 | Folders to exclude from scanning (comma-separated) |
| 排除子文件夹 | Also exclude subfolders of excluded folders |
| 删除方式 | Where deleted files go (Obsidian trash / System trash / Permanent) |
| 显示删除日志 | Show log modal after deletion |
| 功能区图标 | Show ribbon icon for quick access |

## License

MIT

## Credits

- Original plugin: [oz-clear-unused-images](https://github.com/ozntel/oz-clear-unused-images-obsidian) by ozntel
- Enhanced and maintained by [Yanqing Wang](https://github.com/yanqingwang)
