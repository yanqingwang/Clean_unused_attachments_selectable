import { App, TFile } from 'obsidian';
import ClearUnusedAttachments from './main';
import { getAllLinkMatchesInFile, LinkMatch } from './linkDetector';
import { t } from './i18n';

/* ------------------ Constants ------------------ */

const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp', 'webp', 'ico', 'tif', 'tiff']);
const bannerRegex = /!\[\[(.*?)\]\]/i;
const imageRegex = /.*(jpe?g|png|gif|svg|bmp|webp|ico|tiff?)/i;

/* ------------------ Attachment Detection ------------------ */

/**
 * 获取仓库中所有未使用的附件
 * @param app Obsidian App
 * @param folders 目标文件夹列表，空数组表示全部
 * @param fileTypes 目标文件类型列表，空数组表示全部
 * @param excludedFolders 排除的文件夹列表
 * @param excludeSubfolders 是否排除子文件夹
 * @param excludedFileTypes 排除的文件类型列表
 */
export const getUnusedAttachments = async (
    app: App,
    folders: string[],
    fileTypes: string[],
    excludedFolders: string,
    excludeSubfolders: boolean,
    excludedFileTypes: string
): Promise<TFile[]> => {
    // 1. 获取所有附件（非 md/canvas 文件）
    const allAttachments = getAttachmentsInVault(app, folders, fileTypes, excludedFileTypes);

    // 2. 获取所有被引用的附件路径
    const usedAttachmentPaths = await getUsedAttachmentPaths(app);

    // 3. 对比，找出未使用的
    const unused: TFile[] = [];
    for (const attachment of allAttachments) {
        if (!usedAttachmentPaths.has(attachment.path)) {
            // 检查是否在排除文件夹中
            if (!isFileInExcludedFolder(attachment, excludedFolders, excludeSubfolders)) {
                unused.push(attachment);
            }
        }
    }

    return unused;
};

/**
 * 获取仓库中符合条件的附件文件
 */
const getAttachmentsInVault = (app: App, folders: string[], fileTypes: string[], excludedFileTypes: string): TFile[] => {
    const allFiles = app.vault.getFiles();
    const attachments: TFile[] = [];

    // 解析排除的文件类型
    const excludedTypes = new Set(
        excludedFileTypes
            .split(',')
            .map((t) => t.trim().toLowerCase().replace(/^\./, ''))
            .filter((t) => t.length > 0)
    );

    for (const file of allFiles) {
        // 跳过 md 和 canvas
        if (file.extension === 'md' || file.extension === 'canvas') {
            continue;
        }

        // 排除的文件类型直接跳过
        if (excludedTypes.has(file.extension.toLowerCase())) {
            continue;
        }

        // 按文件夹过滤
        if (folders.length > 0 && file.parent) {
            const parentPath = file.parent.path;
            const inFolder = folders.some((folder) => {
                const normalizedFolder = folder.replace(/\/+$/, ''); // 去掉末尾斜杠
                return parentPath === normalizedFolder || parentPath.startsWith(normalizedFolder + '/');
            });
            if (!inFolder) continue;
        }

        // 按文件类型过滤
        if (fileTypes.length > 0) {
            if (!fileTypes.includes(file.extension.toLowerCase())) {
                continue;
            }
        }

        attachments.push(file);
    }

    return attachments;
};

/**
 * 获取所有被引用的附件路径集合
 */
const getUsedAttachmentPaths = async (app: App): Promise<Set<string>> => {
    const usedPaths = new Set<string>();

    // 方法1: 使用 metadataCache.resolvedLinks
    const resolvedLinks = app.metadataCache.resolvedLinks;
    if (resolvedLinks) {
        for (const [mdFile, links] of Object.entries(resolvedLinks)) {
            for (const [filePath] of Object.entries(resolvedLinks[mdFile])) {
                if (!filePath.endsWith('.md')) {
                    usedPaths.add(filePath);
                }
            }
        }
    }

    // 方法2: 遍历所有文件，检查 frontmatter 和正文链接
    const allFiles = app.vault.getFiles();
    for (const file of allFiles) {
        if (file.extension === 'md') {
            // Frontmatter
            const fileCache = app.metadataCache.getFileCache(file);
            if (fileCache?.frontmatter) {
                const frontmatter = fileCache.frontmatter;
                for (const key of Object.keys(frontmatter)) {
                    const value = frontmatter[key];
                    if (typeof value === 'string') {
                        // banner 类型: ![[image.png]]
                        const bannerMatch = value.match(bannerRegex);
                        if (bannerMatch) {
                            const fileName = bannerMatch[1];
                            const resolved = app.metadataCache.getFirstLinkpathDest(fileName, file.path);
                            if (resolved) {
                                usedPaths.add(resolved.path);
                            }
                        }
                        // 直接是图片路径
                        else if (pathIsAnImage(value)) {
                            usedPaths.add(value);
                        }
                    }
                }
            }

            // 正文链接
            const linkMatches = await getAllLinkMatchesInFile(file, app);
            for (const match of linkMatches) {
                usedPaths.add(match.linkText);
            }
        } else if (file.extension === 'canvas') {
            // Canvas 文件
            try {
                const fileText = await app.vault.cachedRead(file);
                const canvasData = JSON.parse(fileText) as {
                    nodes?: Array<{ type?: string; file?: string; text?: string }>;
                };
                if (canvasData.nodes && canvasData.nodes.length > 0) {
                    for (const node of canvasData.nodes) {
                        if (node.type === 'file' && typeof node.file === 'string') {
                            usedPaths.add(node.file);
                        } else if (node.type === 'text' && typeof node.text === 'string') {
                            const linkMatches = await getAllLinkMatchesInFile(file, app, node.text);
                            for (const match of linkMatches) {
                                usedPaths.add(match.linkText);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing canvas file:', file.path, e);
            }
        }
    }

    return usedPaths;
};

/* ------------------ Delete Operations ------------------ */

/**
 * 删除文件列表
 */
export const deleteFilesInTheList = async (
    files: TFile[],
    plugin: ClearUnusedAttachments,
    app: App
): Promise<{ deletedCount: number; logs: string }> => {
    const deleteOption = plugin.settings.deleteOption;
    const i18n = t();
    let deletedCount = 0;
    let logs = i18n.logStart(getFormattedDate()) + '\n';

    for (const file of files) {
        try {
            if (deleteOption === '.trash') {
                await app.fileManager.trashFile(file);
                logs += i18n.logObsidianTrash(file.path) + '\n';
            } else if (deleteOption === 'system-trash') {
                await app.fileManager.trashFile(file);
                logs += i18n.logSystemTrash(file.path) + '\n';
            } else if (deleteOption === 'permanent') {
                await app.vault.delete(file);
                logs += i18n.logPermanent(file.path) + '\n';
            }
            deletedCount++;
        } catch (e) {
            logs += i18n.logDeleteFailed(file.path, e instanceof Error ? e.message : String(e)) + '\n';
        }
    }

    logs += i18n.logTotalProcessed(deletedCount) + '\n';
    logs += i18n.logComplete(getFormattedDate());

    return { deletedCount, logs };
};

/* ------------------ Helpers ------------------ */

/**
 * 检查文件是否在排除文件夹中
 */
const isFileInExcludedFolder = (file: TFile, excludedFolders: string, excludeSubfolders: boolean): boolean => {
    if (!excludedFolders || excludedFolders.trim() === '') {
        return false;
    }

    const excludedPaths = new Set(
        excludedFolders
            .split(',')
            .map((p) => p.trim().replace(/\/+$/, ''))
            .filter((p) => p.length > 0)
    );

    if (excludedPaths.size === 0) return false;

    if (!file.parent) return false;
    const fileParentPath = file.parent.path;

    if (excludeSubfolders) {
        // 检查是否在任何排除路径下
        for (const excludedPath of excludedPaths) {
            if (fileParentPath === excludedPath || fileParentPath.startsWith(excludedPath + '/')) {
                return true;
            }
        }
        return false;
    } else {
        // 仅精确匹配父文件夹
        return excludedPaths.has(fileParentPath);
    }
};

/**
 * 检查路径是否是图片
 */
const pathIsAnImage = (path: string): boolean => {
    return imageRegex.test(path);
};

/* ------------------ .trash Cleanup ------------------ */

/**
 * 清理 .trash 文件夹中超过指定天数的文件
 * @returns 删除的文件数量和日志
 */
export const cleanupTrashFolder = async (
    app: App,
    daysThreshold: number
): Promise<{ deletedCount: number; logs: string }> => {
    const i18n = t();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    const now = Date.now();

    let deletedCount = 0;
    let logs = i18n.logTrashCleanupStart(getFormattedDate(), daysThreshold) + '\n';

    // 收集 .trash 下的所有文件（包括子文件夹）
    const allFiles = app.vault.getFiles();
    const trashFiles: { file: TFile; daysOld: number }[] = [];

    for (const file of allFiles) {
        // 检查文件是否在 .trash 文件夹中
        const pathParts = file.path.split('/');
        if (pathParts[0] !== '.trash') continue;

        const ageMs = now - file.stat.mtime;
        const daysOld = Math.floor(ageMs / (24 * 60 * 60 * 1000));

        if (ageMs > thresholdMs) {
            trashFiles.push({ file, daysOld });
        }
    }

    // 永久删除过期文件
    for (const { file, daysOld } of trashFiles) {
        try {
            await app.vault.delete(file);
            logs += i18n.logTrashCleanupItem(file.path, daysOld) + '\n';
            deletedCount++;
        } catch (e) {
            console.error('Failed to delete trash file:', file.path, e);
        }
    }

    logs += i18n.logTrashCleanupDone(deletedCount);
    return { deletedCount, logs };
};

/**
 * 格式化文件大小
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 获取格式化日期时间
 */
export const getFormattedDate = (): string => {
    const dt = new Date();
    return dt.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
