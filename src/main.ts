import { Notice, Plugin, TFile } from 'obsidian';
import { ClearUnusedAttachmentsSettingTab, ClearUnusedAttachmentsSettings, DEFAULT_SETTINGS } from './settings';
import { CleanSelectionModal, ConfirmDeleteModal, LogsModal } from './modals';
import { getUnusedAttachments, deleteFilesInTheList } from './util';

export default class ClearUnusedAttachments extends Plugin {
    settings: ClearUnusedAttachmentsSettings;
    ribbonIconEl: HTMLElement | undefined;

    async onload() {
        console.log('Clear Unused Attachments plugin loaded');

        await this.loadSettings();

        // 设置页
        this.addSettingTab(new ClearUnusedAttachmentsSettingTab(this.app, this));

        // 命令
        this.addCommand({
            id: 'clear-unused-attachments',
            name: '清理未使用的附件',
            callback: () => this.startCleanup(),
        });

        this.addCommand({
            id: 'clear-unused-images',
            name: '清理未使用的图片',
            callback: () => this.startCleanup(['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp']),
        });

        // Ribbon 图标
        this.refreshRibbonIcon();
    }

    onunload() {
        console.log('Clear Unused Attachments plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshRibbonIcon() {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon('image-file', '清理未使用附件', () => {
                this.startCleanup();
            });
        }
    }

    /**
     * 开始清理流程
     * 1. 弹出选择框让用户选择文件夹和文件类型
     * 2. 扫描未使用的附件
     * 3. 显示确认列表
     * 4. 执行删除
     */
    startCleanup(defaultFileTypes?: string[]) {
        new CleanSelectionModal(this.app, this, (folders, fileTypes) => {
            // 如果命令指定了文件类型，使用命令的；否则用用户输入的
            const effectiveFileTypes = defaultFileTypes || fileTypes;
            this.scanAndConfirm(folders, effectiveFileTypes);
        }).open();
    }

    /**
     * 扫描未使用附件并显示确认列表
     */
    async scanAndConfirm(folders: string[], fileTypes: string[]) {
        const notice = new Notice('正在扫描未使用的附件...', 0);

        try {
            const unusedFiles = await getUnusedAttachments(
                this.app,
                folders,
                fileTypes,
                this.settings.excludedFolders,
                this.settings.excludeSubfolders
            );

            notice.hide();

            if (unusedFiles.length === 0) {
                new Notice('没有找到未使用的附件。');
                return;
            }

            // 显示确认列表
            new ConfirmDeleteModal(this.app, this, unusedFiles, (selectedFiles) => {
                this.executeDelete(selectedFiles);
            }).open();
        } catch (e) {
            notice.hide();
            new Notice(`扫描失败: ${e}`);
            console.error('Scan error:', e);
        }
    }

    /**
     * 执行删除
     */
    async executeDelete(files: TFile[]) {
        const notice = new Notice(`正在删除 ${files.length} 个文件...`, 0);

        try {
            const { deletedCount, logs } = await deleteFilesInTheList(files, this, this.app);
            notice.hide();

            new Notice(`成功删除 ${deletedCount} 个文件。`);

            if (this.settings.showLogs) {
                new LogsModal(this.app, logs).open();
            }
        } catch (e) {
            notice.hide();
            new Notice(`删除失败: ${e}`);
            console.error('Delete error:', e);
        }
    }
}
