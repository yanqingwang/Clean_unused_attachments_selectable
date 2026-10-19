import { App, PluginSettingTab, Setting } from 'obsidian';
import ClearUnusedAttachments from './main';

export interface ClearUnusedAttachmentsSettings {
    // 预设清理范围（仅作为默认值，清理时仍会弹出选择框）
    defaultFolders: string;
    defaultFileTypes: string;
    // 排除设置
    excludedFolders: string;
    excludeSubfolders: boolean;
    // 删除选项
    deleteOption: string;
    // 其他
    showLogs: boolean;
    ribbonIcon: boolean;
}

export const DEFAULT_SETTINGS: ClearUnusedAttachmentsSettings = {
    defaultFolders: '',
    defaultFileTypes: '',
    excludedFolders: '',
    excludeSubfolders: false,
    deleteOption: '.trash',
    showLogs: true,
    ribbonIcon: false,
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

        containerEl.createEl('h2', { text: 'Clear Unused Attachments Settings' });

        // --- 默认清理范围 ---
        containerEl.createEl('h3', { text: '默认清理范围（清理时仍会弹出确认）' });

        new Setting(containerEl)
            .setName('默认目标文件夹')
            .setDesc('设置默认要清理的文件夹路径，多个用逗号分隔。留空表示整个仓库。清理时仍会弹出选择框。')
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
            .setName('默认目标文件类型')
            .setDesc('设置默认要清理的文件扩展名，多个用逗号分隔。留空表示所有附件类型。清理时仍会弹出选择框。')
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
        containerEl.createEl('h3', { text: '排除设置' });

        new Setting(containerEl)
            .setName('排除文件夹路径')
            .setDesc('要排除的文件夹完整路径，多个用逗号分隔。这些文件夹中的附件永远不会被清理。')
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
            .setName('排除子文件夹')
            .setDesc('开启后，上述文件夹的所有子文件夹也会被排除。')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.excludeSubfolders).onChange((value) => {
                    this.plugin.settings.excludeSubfolders = value;
                    this.plugin.saveSettings();
                })
            );

        // --- 删除选项 ---
        containerEl.createEl('h3', { text: '删除选项' });

        new Setting(containerEl)
            .setName('删除方式')
            .setDesc('选择附件被删除后的去向')
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', '永久删除');
                dropdown.addOption('.trash', '移到 Obsidian 回收站');
                dropdown.addOption('system-trash', '移到系统回收站');
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    this.plugin.saveSettings();
                });
            });

        // --- 其他 ---
        containerEl.createEl('h3', { text: '其他' });

        new Setting(containerEl)
            .setName('显示删除日志')
            .setDesc('删除完成后显示操作日志弹窗。')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showLogs).onChange((value) => {
                    this.plugin.settings.showLogs = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('功能区图标')
            .setDesc('在左侧功能区显示清理图标。')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshRibbonIcon();
                })
            );
    }
}
