import { Notice, Plugin, TFile } from 'obsidian';
import { ClearUnusedAttachmentsSettingTab, ClearUnusedAttachmentsSettings, DEFAULT_SETTINGS } from './settings';
import { CleanSelectionModal, ConfirmDeleteModal, LogsModal } from './modals';
import { getUnusedAttachments, deleteFilesInTheList, cleanupTrashFolder } from './util';
import { setLanguage, t } from './i18n';

export default class ClearUnusedAttachments extends Plugin {
    settings: ClearUnusedAttachmentsSettings;
    ribbonIconEl: HTMLElement | undefined;

    async onload() {
        await this.loadSettings();

        // 初始化语言
        setLanguage(this.settings.language, this.app);

        // 设置页
        this.addSettingTab(new ClearUnusedAttachmentsSettingTab(this.app, this));

        // 命令
        this.addCommand({
            id: 'clear-attachments',
            name: t().commandClearAttachments,
            callback: () => {
                this.startCleanup();
            },
        });

        this.addCommand({
            id: 'clear-images',
            name: t().commandClearImages,
            callback: () => {
                this.startCleanup(['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp']);
            },
        });

        this.addCommand({
            id: 'cleanup-trash-expired',
            name: t().commandCleanupTrash,
            callback: () => {
                void this.runTrashCleanup();
            },
        });

        // Ribbon 图标
        this.refreshRibbonIcon();
    }

    onunload() {
        // cleanup
    }

    async loadSettings() {
        const saved = (await this.loadData()) as Partial<ClearUnusedAttachmentsSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshRibbonIcon() {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon('image-file', t().commandClearAttachments, () => {
                this.startCleanup();
            });
        }
    }

    /**
     * 开始清理流程
     */
    startCleanup(defaultFileTypes?: string[]) {
        new CleanSelectionModal(this.app, this, (folders, fileTypes) => {
            const effectiveFileTypes = defaultFileTypes || fileTypes;
            void this.scanAndConfirm(folders, effectiveFileTypes);
        }).open();
    }

    /**
     * 扫描未使用附件并显示确认列表
     */
    async scanAndConfirm(folders: string[], fileTypes: string[]) {
        const i18n = t();
        const notice = new Notice(i18n.noticeScanning, 0);

        try {
            const unusedFiles = await getUnusedAttachments(
                this.app,
                folders,
                fileTypes,
                this.settings.excludedFolders,
                this.settings.excludeSubfolders,
                this.settings.excludedFileTypes
            );

            notice.hide();

            if (unusedFiles.length === 0) {
                new Notice(i18n.noticeNoUnusedFiles);
                // 即使没有未使用附件，也执行 .trash 清理
                await this.maybeRunTrashCleanup('');
                return;
            }

            // 显示确认列表
            new ConfirmDeleteModal(this.app, this, unusedFiles, (selectedFiles) => {
                void this.executeDelete(selectedFiles);
            }).open();
        } catch (e) {
            notice.hide();
            new Notice(i18n.noticeScanFailed(String(e)));
            console.error('Scan error:', e);
        }
    }

    /**
     * 执行删除
     */
    async executeDelete(files: TFile[]) {
        const i18n = t();
        const notice = new Notice(i18n.noticeDeleting(files.length), 0);
        let combinedLogs = '';

        try {
            const { deletedCount, logs } = await deleteFilesInTheList(files, this, this.app);
            combinedLogs = logs;
            notice.hide();

            new Notice(i18n.noticeDeleteSuccess(deletedCount));
        } catch (e) {
            notice.hide();
            new Notice(i18n.noticeDeleteFailed(String(e)));
            console.error('Delete error:', e);
            return;
        }

        // 执行 .trash 清理并合并日志
        combinedLogs = await this.maybeRunTrashCleanup(combinedLogs);

        if (this.settings.showLogs && combinedLogs) {
            new LogsModal(this.app, combinedLogs).open();
        }
    }

    /**
     * 如果启用了 .trash 清理，则执行；返回合并后的日志
     */
    async maybeRunTrashCleanup(existingLogs: string): Promise<string> {
        if (!this.settings.trashCleanupEnabled) {
            return existingLogs;
        }
        try {
            const { logs } = await cleanupTrashFolder(this.app, this.settings.trashCleanupDays);
            return existingLogs ? existingLogs + '\n\n' + logs : logs;
        } catch (e) {
            console.error('Trash cleanup error:', e);
            return existingLogs;
        }
    }

    /**
     * 单独执行 .trash 清理命令
     */
    async runTrashCleanup() {
        const i18n = t();
        const notice = new Notice(i18n.noticeTrashCleanupStart, 0);
        try {
            const { deletedCount, logs } = await cleanupTrashFolder(this.app, this.settings.trashCleanupDays);
            notice.hide();
            new Notice(i18n.noticeTrashCleanupDone(deletedCount));
            if (this.settings.showLogs) {
                new LogsModal(this.app, logs).open();
            }
        } catch (e) {
            notice.hide();
            new Notice(i18n.noticeDeleteFailed(String(e)));
            console.error('Trash cleanup error:', e);
        }
    }
}
