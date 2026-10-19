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
    defaultFolders: string;
    defaultFileTypes: string;
    excludedFolders: string;
    excludeSubfolders: boolean;
    excludedFileTypes: string;
    deleteOption: string;
    showLogs: boolean;
    ribbonIcon: boolean;
    language: Language;
    trashCleanupEnabled: boolean;
    trashCleanupDays: number;
}

export const DEFAULT_SETTINGS: ClearUnusedAttachmentsSettings = {
    defaultFolders: '',
    defaultFileTypes: '',
    excludedFolders: '',
    excludeSubfolders: false,
    excludedFileTypes: 'png, jpg, jpeg, gif, svg, bmp, webp, html, md',
    deleteOption: '.trash',
    showLogs: true,
    ribbonIcon: false,
    language: 'auto',
    trashCleanupEnabled: true,
    trashCleanupDays: 60,
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

        setLanguage(this.plugin.settings.language, this.app);
        const i18n = t();

        // 语言选择
        new Setting(containerEl)
            .setName(i18n.settingLanguage)
            .setDesc(i18n.settingLanguageDesc)
            .addDropdown((dropdown) => {
                dropdown.addOption('auto', i18n.optionAuto);
                dropdown.addOption('zh', '中文');
                dropdown.addOption('en', 'English');
                dropdown.setValue(this.plugin.settings.language);
                dropdown.onChange((value) => {
                    this.plugin.settings.language = value as Language;
                    void this.plugin.saveSettings().then(() => {
                        setLanguage(value as Language, this.app);
                        this.display();
                    });
                });
            });

        // --- 默认清理范围 ---
        new Setting(containerEl).setName(i18n.sectionDefaultScope).setHeading();

        new Setting(containerEl)
            .setName(i18n.settingDefaultFolders)
            .setDesc(i18n.settingDefaultFoldersDesc)
            .addTextArea((text) =>
                text
                    .setPlaceholder('例如: Attachments, Assets/Images')
                    .setValue(this.plugin.settings.defaultFolders)
                    .onChange((value) => {
                        this.plugin.settings.defaultFolders = value;
                        void this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(i18n.settingDefaultFileTypes)
            .setDesc(i18n.settingDefaultFileTypesDesc)
            .addText((text) =>
                text
                    .setPlaceholder('例如: png, jpg, pdf, zip')
                    .setValue(this.plugin.settings.defaultFileTypes)
                    .onChange((value) => {
                        this.plugin.settings.defaultFileTypes = value;
                        void this.plugin.saveSettings();
                    })
            );

        // --- 排除设置 ---
        new Setting(containerEl).setName(i18n.sectionExclusions).setHeading();

        new Setting(containerEl)
            .setName(i18n.settingExcludedFolders)
            .setDesc(i18n.settingExcludedFoldersDesc)
            .addTextArea((text) =>
                text
                    .setPlaceholder('例如: Templates/Assets, Archive/Old')
                    .setValue(this.plugin.settings.excludedFolders)
                    .onChange((value) => {
                        this.plugin.settings.excludedFolders = value;
                        void this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(i18n.settingExcludeSubfolders)
            .setDesc(i18n.settingExcludeSubfoldersDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.excludeSubfolders).onChange((value) => {
                    this.plugin.settings.excludeSubfolders = value;
                    void this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(i18n.settingExcludedFileTypes)
            .setDesc(i18n.settingExcludedFileTypesDesc)
            .addTextArea((text) => {
                text
                    .setPlaceholder('例如: png, jpg, pdf, zip')
                    .setValue(this.plugin.settings.excludedFileTypes)
                    .onChange((value) => {
                        this.plugin.settings.excludedFileTypes = value;
                        void this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
            })
            .addExtraButton((btn) =>
                btn
                    .setIcon('list-plus')
                    .setTooltip(i18n.buttonFillStandardTypes)
                    .onClick(() => {
                        this.plugin.settings.excludedFileTypes = OBSIDIAN_STANDARD_EXTENSIONS.join(', ');
                        void this.plugin.saveSettings().then(() => this.display());
                    })
            );

        // --- 删除选项 ---
        new Setting(containerEl).setName(i18n.sectionDeleteOptions).setHeading();

        new Setting(containerEl)
            .setName(i18n.settingDeleteOption)
            .setDesc(i18n.settingDeleteOptionDesc)
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', i18n.optionPermanent);
                dropdown.addOption('.trash', i18n.optionObsidianTrash);
                dropdown.addOption('system-trash', i18n.optionSystemTrash);
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    void this.plugin.saveSettings();
                });
            });

        // --- .trash 自动清理 ---
        new Setting(containerEl).setName(i18n.sectionTrashCleanup).setHeading();

        new Setting(containerEl)
            .setName(i18n.settingTrashCleanupEnabled)
            .setDesc(i18n.settingTrashCleanupEnabledDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.trashCleanupEnabled).onChange((value) => {
                    this.plugin.settings.trashCleanupEnabled = value;
                    void this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(i18n.settingTrashCleanupDays)
            .setDesc(i18n.settingTrashCleanupDaysDesc)
            .addText((text) =>
                text
                    .setPlaceholder('60')
                    .setValue(String(this.plugin.settings.trashCleanupDays))
                    .onChange((value) => {
                        const days = parseInt(value, 10);
                        if (!isNaN(days) && days > 0) {
                            this.plugin.settings.trashCleanupDays = days;
                            void this.plugin.saveSettings();
                        }
                    })
            );

        // --- 其他 ---
        new Setting(containerEl).setName(i18n.sectionOthers).setHeading();

        new Setting(containerEl)
            .setName(i18n.settingShowLogs)
            .setDesc(i18n.settingShowLogsDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showLogs).onChange((value) => {
                    this.plugin.settings.showLogs = value;
                    void this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(i18n.settingRibbonIcon)
            .setDesc(i18n.settingRibbonIconDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    void this.plugin.saveSettings().then(() => this.plugin.refreshRibbonIcon());
                })
            );
    }
}
