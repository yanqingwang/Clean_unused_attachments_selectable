import { App, PluginSettingTab, Setting } from 'obsidian';
import ClearUnusedAttachments from './main';
import { t, setLanguage, Language } from './i18n';

/** Obsidian 支持的标准附件类型 */
export const OBSIDIAN_STANDARD_EXTENSIONS = [
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico',
    'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac',
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'mpg', 'mpeg',
    'pdf',
    'zip', 'rar', '7z', 'tar', 'gz',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
];

export interface ClearUnusedAttachmentsSettings {
    // 预设清理范围（仅作为默认值，清理时仍会弹出选择框）
    defaultFolders: string;
    defaultFileTypes: string;
    // 排除设置
    excludedFolders: string;
    excludeSubfolders: boolean;
    // 排除的文件类型
    excludedFileTypes: string;
    // 删除选项
    deleteOption: string;
    // 其他
    showLogs: boolean;
    ribbonIcon: boolean;
    // 语言
    language: Language;
}

export const DEFAULT_SETTINGS: ClearUnusedAttachmentsSettings = {
    defaultFolders: '',
    defaultFileTypes: '',
    excludedFolders: '',
    excludeSubfolders: false,
    excludedFileTypes: 'png, jpg, jpeg, gif, svg, bmp, webp',
    deleteOption: '.trash',
    showLogs: true,
    ribbonIcon: false,
    language: 'auto',
};

export class ClearUnusedAttachmentsSettingTab extends PluginSettingTab {
    plugin: ClearUnusedAttachments;

    constructor(app: App, plugin: ClearUnusedAttachments) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('clear-unused-settings');

        // 确保语言已同步
        setLanguage(this.plugin.settings.language, this.app);

        containerEl.createEl('h2', { text: t().settingsTitle });

        // --- 语言选择 ---
        new Setting(containerEl)
            .setName(t().settingLanguage)
            .setDesc(t().settingLanguageDesc)
            .addDropdown((dropdown) => {
                dropdown.addOption('auto', t().optionAuto);
                dropdown.addOption('zh', '中文');
                dropdown.addOption('en', 'English');
                dropdown.setValue(this.plugin.settings.language);
                dropdown.onChange((value) => {
                    this.plugin.settings.language = value as Language;
                    this.plugin.saveSettings();
                    setLanguage(value as Language, this.app);
                    this.display(); // 刷新设置页以应用新语言
                });
            });

        // --- 默认清理范围 ---
        containerEl.createEl('h3', { text: t().sectionDefaultScope });

        new Setting(containerEl)
            .setName(t().settingDefaultFolders)
            .setDesc(t().settingDefaultFoldersDesc)
            .addTextArea((text) =>
                text
                    .setPlaceholder('例如: Attachments, Assets/Images')
                    .setValue(this.plugin.settings.defaultFolders)
                    .onChange((value) => {
                        this.plugin.settings.defaultFolders = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t().settingDefaultFileTypes)
            .setDesc(t().settingDefaultFileTypesDesc)
            .addText((text) =>
                text
                    .setPlaceholder('例如: png, jpg, pdf, zip')
                    .setValue(this.plugin.settings.defaultFileTypes)
                    .onChange((value) => {
                        this.plugin.settings.defaultFileTypes = value;
                        this.plugin.saveSettings();
                    })
            );

        // --- 排除设置 ---
        containerEl.createEl('h3', { text: t().sectionExclusions });

        new Setting(containerEl)
            .setName(t().settingExcludedFolders)
            .setDesc(t().settingExcludedFoldersDesc)
            .addTextArea((text) =>
                text
                    .setPlaceholder('例如: Templates/Assets, Archive/Old')
                    .setValue(this.plugin.settings.excludedFolders)
                    .onChange((value) => {
                        this.plugin.settings.excludedFolders = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t().settingExcludeSubfolders)
            .setDesc(t().settingExcludeSubfoldersDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.excludeSubfolders).onChange((value) => {
                    this.plugin.settings.excludeSubfolders = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(t().settingExcludedFileTypes)
            .setDesc(t().settingExcludedFileTypesDesc)
            .addTextArea((text) => {
                text
                    .setPlaceholder('例如: png, jpg, pdf, zip')
                    .setValue(this.plugin.settings.excludedFileTypes)
                    .onChange((value) => {
                        this.plugin.settings.excludedFileTypes = value;
                        this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
            })
            .addExtraButton((btn) =>
                btn
                    .setIcon('list-plus')
                    .setTooltip(t().buttonFillStandardTypes)
                    .onClick(() => {
                        this.plugin.settings.excludedFileTypes = OBSIDIAN_STANDARD_EXTENSIONS.join(', ');
                        this.plugin.saveSettings();
                        this.display();
                    })
            );

        // --- 删除选项 ---
        containerEl.createEl('h3', { text: t().sectionDeleteOptions });

        new Setting(containerEl)
            .setName(t().settingDeleteOption)
            .setDesc(t().settingDeleteOptionDesc)
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', t().optionPermanent);
                dropdown.addOption('.trash', t().optionObsidianTrash);
                dropdown.addOption('system-trash', t().optionSystemTrash);
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    this.plugin.saveSettings();
                });
            });

        // --- 其他 ---
        containerEl.createEl('h3', { text: t().sectionOthers });

        new Setting(containerEl)
            .setName(t().settingShowLogs)
            .setDesc(t().settingShowLogsDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showLogs).onChange((value) => {
                    this.plugin.settings.showLogs = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(t().settingRibbonIcon)
            .setDesc(t().settingRibbonIconDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshRibbonIcon();
                })
            );
    }
}
