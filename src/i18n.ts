import { App } from 'obsidian';

export type Language = 'auto' | 'zh' | 'en';

export interface I18nTexts {
    // Settings
    settingsTitle: string;
    sectionDefaultScope: string;
    settingDefaultFolders: string;
    settingDefaultFoldersDesc: string;
    settingDefaultFileTypes: string;
    settingDefaultFileTypesDesc: string;
    sectionExclusions: string;
    settingExcludedFolders: string;
    settingExcludedFoldersDesc: string;
    settingExcludeSubfolders: string;
    settingExcludeSubfoldersDesc: string;
    settingExcludedFileTypes: string;
    settingExcludedFileTypesDesc: string;
    buttonFillStandardTypes: string;
    sectionDeleteOptions: string;
    settingDeleteOption: string;
    settingDeleteOptionDesc: string;
    optionPermanent: string;
    optionObsidianTrash: string;
    optionSystemTrash: string;
    sectionOthers: string;
    settingShowLogs: string;
    settingShowLogsDesc: string;
    settingRibbonIcon: string;
    settingRibbonIconDesc: string;
    settingLanguage: string;
    settingLanguageDesc: string;
    optionAuto: string;

    // Commands
    commandClearAttachments: string;
    commandClearImages: string;

    // Selection Modal
    modalSelectScope: string;
    modalSelectScopeHint: string;
    labelTargetFolders: string;
    labelTargetFoldersHint: string;
    placeholderFolders: string;
    labelTargetFileTypes: string;
    labelTargetFileTypesHint: string;
    placeholderFileTypes: string;
    labelQuickSelect: string;
    buttonAllImages: string;
    buttonAllDocuments: string;
    buttonAllMedia: string;
    buttonClear: string;
    buttonCancel: string;
    buttonStartScan: string;

    // Confirm Modal
    modalConfirmTitle: (count: number) => string;
    modalNoFiles: string;
    buttonClose: string;
    labelSelectAll: string;
    labelFileCount: (count: number) => string;
    buttonDeleteSelected: string;
    noticeNoFilesSelected: string;

    // Logs Modal
    modalLogsTitle: string;

    // Notices
    noticeScanning: string;
    noticeNoUnusedFiles: string;
    noticeScanFailed: (error: string) => string;
    noticeDeleting: (count: number) => string;
    noticeDeleteSuccess: (count: number) => string;
    noticeDeleteFailed: (error: string) => string;

    // Logs
    logStart: (date: string) => string;
    logObsidianTrash: (path: string) => string;
    logSystemTrash: (path: string) => string;
    logPermanent: (path: string) => string;
    logDeleteFailed: (path: string, error: string) => string;
    logTotalProcessed: (count: number) => string;
    logComplete: (date: string) => string;
}

const zh: I18nTexts = {
    settingsTitle: 'Clear Unused Attachments 设置',
    sectionDefaultScope: '默认清理范围（清理时仍会弹出确认）',
    settingDefaultFolders: '默认目标文件夹',
    settingDefaultFoldersDesc: '设置默认要清理的文件夹路径，多个用逗号分隔。留空表示整个仓库。清理时仍会弹出选择框。',
    settingDefaultFileTypes: '默认目标文件类型',
    settingDefaultFileTypesDesc: '设置默认要清理的文件扩展名，多个用逗号分隔。留空表示所有附件类型。清理时仍会弹出选择框。',
    sectionExclusions: '排除设置',
    settingExcludedFolders: '排除文件夹路径',
    settingExcludedFoldersDesc: '要排除的文件夹完整路径，多个用逗号分隔。这些文件夹中的附件永远不会被清理。',
    settingExcludeSubfolders: '排除子文件夹',
    settingExcludeSubfoldersDesc: '开启后，上述文件夹的所有子文件夹也会被排除。',
    settingExcludedFileTypes: '排除文件类型',
    settingExcludedFileTypesDesc: '这些文件类型不会被清理。默认已排除图片类型（可能被 CSS 或其他方式引用）。多个用逗号分隔。',
    buttonFillStandardTypes: '填入所有 Obsidian 标准类型',
    sectionDeleteOptions: '删除选项',
    settingDeleteOption: '删除方式',
    settingDeleteOptionDesc: '选择附件被删除后的去向',
    optionPermanent: '永久删除',
    optionObsidianTrash: '移到 Obsidian 回收站',
    optionSystemTrash: '移到系统回收站',
    sectionOthers: '其他',
    settingShowLogs: '显示删除日志',
    settingShowLogsDesc: '删除完成后显示操作日志弹窗。',
    settingRibbonIcon: '功能区图标',
    settingRibbonIconDesc: '在左侧功能区显示清理图标。',
    settingLanguage: '界面语言',
    settingLanguageDesc: '选择插件界面显示语言。',
    optionAuto: '跟随 Obsidian',

    commandClearAttachments: '清理未使用的附件',
    commandClearImages: '清理未使用的图片',

    modalSelectScope: '选择清理范围',
    modalSelectScopeHint: '提示：以下默认值来自设置，您可以在本次清理前修改。留空表示不限制。',
    labelTargetFolders: '目标文件夹',
    labelTargetFoldersHint: '多个路径用逗号分隔，例如: Attachments, Assets/Images',
    placeholderFolders: '留空表示扫描整个仓库',
    labelTargetFileTypes: '目标文件类型',
    labelTargetFileTypesHint: '多个扩展名用逗号分隔，例如: png, jpg, pdf, zip',
    placeholderFileTypes: '留空表示所有附件类型',
    labelQuickSelect: '快捷选择',
    buttonAllImages: '所有图片',
    buttonAllDocuments: '所有文档',
    buttonAllMedia: '所有媒体',
    buttonClear: '清空',
    buttonCancel: '取消',
    buttonStartScan: '开始扫描',

    modalConfirmTitle: (count) => `发现 ${count} 个未使用的附件`,
    modalNoFiles: '没有找到未使用的附件。',
    buttonClose: '关闭',
    labelSelectAll: ' 全选',
    labelFileCount: (count) => `${count} 个文件`,
    buttonDeleteSelected: '删除选中',
    noticeNoFilesSelected: '未选择任何文件。',

    modalLogsTitle: '清理日志',

    noticeScanning: '正在扫描未使用的附件...',
    noticeNoUnusedFiles: '没有找到未使用的附件。',
    noticeScanFailed: (error) => `扫描失败: ${error}`,
    noticeDeleting: (count) => `正在删除 ${count} 个文件...`,
    noticeDeleteSuccess: (count) => `成功删除 ${count} 个文件。`,
    noticeDeleteFailed: (error) => `删除失败: ${error}`,

    logStart: (date) => `[+] ${date}: 开始清理...`,
    logObsidianTrash: (path) => `[+] 移到 Obsidian 回收站: ${path}`,
    logSystemTrash: (path) => `[+] 移到系统回收站: ${path}`,
    logPermanent: (path) => `[+] 永久删除: ${path}`,
    logDeleteFailed: (path, error) => `[!] 删除失败 ${path}: ${error}`,
    logTotalProcessed: (count) => `[+] 共处理 ${count} 个文件`,
    logComplete: (date) => `[+] ${date}: 清理完成`,
};

const en: I18nTexts = {
    settingsTitle: 'Clear Unused Attachments Settings',
    sectionDefaultScope: 'Default Scope (still confirmed before each clean)',
    settingDefaultFolders: 'Default Target Folders',
    settingDefaultFoldersDesc: 'Default folders to clean, comma-separated. Empty = entire vault. Still prompted before each clean.',
    settingDefaultFileTypes: 'Default Target File Types',
    settingDefaultFileTypesDesc: 'Default file extensions to clean, comma-separated. Empty = all attachment types. Still prompted before each clean.',
    sectionExclusions: 'Exclusions',
    settingExcludedFolders: 'Excluded Folder Paths',
    settingExcludedFoldersDesc: 'Full folder paths to exclude, comma-separated. Attachments in these folders will never be cleaned.',
    settingExcludeSubfolders: 'Exclude Subfolders',
    settingExcludeSubfoldersDesc: 'When enabled, all subfolders of the above folders will also be excluded.',
    settingExcludedFileTypes: 'Excluded File Types',
    settingExcludedFileTypesDesc: 'These file types will never be cleaned. Images are excluded by default (may be referenced via CSS). Comma-separated.',
    buttonFillStandardTypes: 'Fill All Obsidian Standard Types',
    sectionDeleteOptions: 'Delete Options',
    settingDeleteOption: 'Delete Method',
    settingDeleteOptionDesc: 'Choose where deleted attachments go',
    optionPermanent: 'Delete Permanently',
    optionObsidianTrash: 'Move to Obsidian Trash',
    optionSystemTrash: 'Move to System Trash',
    sectionOthers: 'Others',
    settingShowLogs: 'Show Delete Logs',
    settingShowLogsDesc: 'Show log modal after deletion completes.',
    settingRibbonIcon: 'Ribbon Icon',
    settingRibbonIconDesc: 'Show cleanup icon in the left ribbon.',
    settingLanguage: 'Interface Language',
    settingLanguageDesc: 'Choose the plugin interface language.',
    optionAuto: 'Follow Obsidian',

    commandClearAttachments: 'Clear Unused Attachments',
    commandClearImages: 'Clear Unused Images',

    modalSelectScope: 'Select Cleanup Scope',
    modalSelectScopeHint: 'Hint: Defaults come from settings. You can modify them before this clean. Empty = no limit.',
    labelTargetFolders: 'Target Folders',
    labelTargetFoldersHint: 'Multiple paths comma-separated, e.g.: Attachments, Assets/Images',
    placeholderFolders: 'Empty = scan entire vault',
    labelTargetFileTypes: 'Target File Types',
    labelTargetFileTypesHint: 'Multiple extensions comma-separated, e.g.: png, jpg, pdf, zip',
    placeholderFileTypes: 'Empty = all attachment types',
    labelQuickSelect: 'Quick Select',
    buttonAllImages: 'All Images',
    buttonAllDocuments: 'All Documents',
    buttonAllMedia: 'All Media',
    buttonClear: 'Clear',
    buttonCancel: 'Cancel',
    buttonStartScan: 'Start Scan',

    modalConfirmTitle: (count) => `Found ${count} unused attachment(s)`,
    modalNoFiles: 'No unused attachments found.',
    buttonClose: 'Close',
    labelSelectAll: ' Select All',
    labelFileCount: (count) => `${count} file(s)`,
    buttonDeleteSelected: 'Delete Selected',
    noticeNoFilesSelected: 'No files selected.',

    modalLogsTitle: 'Cleanup Logs',

    noticeScanning: 'Scanning for unused attachments...',
    noticeNoUnusedFiles: 'No unused attachments found.',
    noticeScanFailed: (error) => `Scan failed: ${error}`,
    noticeDeleting: (count) => `Deleting ${count} file(s)...`,
    noticeDeleteSuccess: (count) => `Successfully deleted ${count} file(s).`,
    noticeDeleteFailed: (error) => `Delete failed: ${error}`,

    logStart: (date) => `[+] ${date}: Cleanup started...`,
    logObsidianTrash: (path) => `[+] Moved to Obsidian Trash: ${path}`,
    logSystemTrash: (path) => `[+] Moved to System Trash: ${path}`,
    logPermanent: (path) => `[+] Permanently deleted: ${path}`,
    logDeleteFailed: (path, error) => `[!] Delete failed ${path}: ${error}`,
    logTotalProcessed: (count) => `[+] Total processed: ${count} file(s)`,
    logComplete: (date) => `[+] ${date}: Cleanup completed`,
};

let currentLanguage: Language = 'auto';
let obsidianLanguage: string = 'en';

export function setLanguage(lang: Language, app?: App) {
    currentLanguage = lang;
    if (app) {
        // 尝试获取 Obsidian 界面语言
        try {
            const langSetting = (app.vault as any).getConfig?.('language');
            if (langSetting) {
                obsidianLanguage = langSetting.toLowerCase();
            }
        } catch {
            // ignore
        }
    }
}

export function t(): I18nTexts {
    if (currentLanguage === 'zh') return zh;
    if (currentLanguage === 'en') return en;
    // auto: 根据 Obsidian 语言判断
    return obsidianLanguage.startsWith('zh') ? zh : en;
}
