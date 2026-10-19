import { App, Modal, Notice, Setting, TFile } from 'obsidian';
import ClearUnusedAttachments from './main';
import { formatBytes } from './util';
import { t } from './i18n';

/**
 * 清理范围选择对话框
 * 用户可以选择按文件夹或按文件类型筛选，确认后开始扫描
 */
export class CleanSelectionModal extends Modal {
    plugin: ClearUnusedAttachments;
    onSubmit: (folders: string[], fileTypes: string[]) => void;

    constructor(app: App, plugin: ClearUnusedAttachments, onSubmit: (folders: string[], fileTypes: string[]) => void) {
        super(app);
        this.plugin = plugin;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('clear-unused-modal');

        const i18n = t();

        contentEl.createEl('h2', { text: i18n.modalSelectScope, cls: 'modal-title' });

        const hintEl = contentEl.createEl('div', { cls: 'clear-unused-hint' });
        hintEl.setText(i18n.modalSelectScopeHint);

        // 文件夹输入
        const folderSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        folderSection.createEl('div', { cls: 'clear-unused-section-title', text: i18n.labelTargetFolders });
        folderSection.createEl('div', { cls: 'clear-unused-hint', text: i18n.labelTargetFoldersHint });
        const folderInput = folderSection.createEl('textarea', { cls: 'clear-unused-textarea' });
        folderInput.value = this.plugin.settings.defaultFolders;
        folderInput.placeholder = i18n.placeholderFolders;

        // 文件类型输入
        const typeSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        typeSection.createEl('div', { cls: 'clear-unused-section-title', text: i18n.labelTargetFileTypes });
        typeSection.createEl('div', { cls: 'clear-unused-hint', text: i18n.labelTargetFileTypesHint });
        const typeInput = typeSection.createEl('input', { cls: 'clear-unused-input', type: 'text' });
        typeInput.value = this.plugin.settings.defaultFileTypes;
        typeInput.placeholder = i18n.placeholderFileTypes;

        // 快捷选择按钮
        const quickSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        quickSection.createEl('div', { cls: 'clear-unused-section-title', text: i18n.labelQuickSelect });

        const quickBtnRow = quickSection.createEl('div', { cls: 'clear-unused-button-row' });
        quickBtnRow.style.justifyContent = 'flex-start';

        const allImagesBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonAllImages });
        allImagesBtn.addEventListener('click', () => {
            typeInput.value = 'png, jpg, jpeg, gif, svg, bmp, webp';
        });

        const allDocsBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonAllDocuments });
        allDocsBtn.addEventListener('click', () => {
            typeInput.value = 'pdf, doc, docx, xls, xlsx, ppt, pptx, txt';
        });

        const allMediaBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonAllMedia });
        allMediaBtn.addEventListener('click', () => {
            typeInput.value = 'mp3, mp4, wav, avi, mov, mkv, flac';
        });

        const clearBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonClear });
        clearBtn.addEventListener('click', () => {
            typeInput.value = '';
            folderInput.value = '';
        });

        // 按钮
        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });

        const cancelBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonCancel });
        cancelBtn.addEventListener('click', () => this.close());

        const confirmBtn = btnRow.createEl('button', { cls: 'clear-unused-button clear-unused-button-primary', text: i18n.buttonStartScan });
        confirmBtn.addEventListener('click', () => {
            const folders = folderInput.value
                .split(',')
                .map((f) => f.trim())
                .filter((f) => f.length > 0);
            const fileTypes = typeInput.value
                .split(',')
                .map((t) => t.trim().toLowerCase().replace(/^\./, ''))
                .filter((t) => t.length > 0);

            this.close();
            this.onSubmit(folders, fileTypes);
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * 未使用文件确认列表对话框
 * 扫描完成后显示，用户勾选要删除的文件后确认删除
 */
export class ConfirmDeleteModal extends Modal {
    plugin: ClearUnusedAttachments;
    files: TFile[];
    onConfirm: (selectedFiles: TFile[]) => void;
    private checkboxes: HTMLInputElement[] = [];

    constructor(app: App, plugin: ClearUnusedAttachments, files: TFile[], onConfirm: (selectedFiles: TFile[]) => void) {
        super(app);
        this.plugin = plugin;
        this.files = files;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('clear-unused-modal');

        const i18n = t();

        contentEl.createEl('h2', { text: i18n.modalConfirmTitle(this.files.length), cls: 'modal-title' });

        if (this.files.length === 0) {
            contentEl.createEl('p', { text: i18n.modalNoFiles });
            const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });
            const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonClose });
            closeBtn.addEventListener('click', () => this.close());
            return;
        }

        // 头部：全选/取消全选
        const header = contentEl.createEl('div', { cls: 'file-list-header' });
        const selectAllLabel = header.createEl('label');
        const selectAllCheckbox = selectAllLabel.createEl('input', { type: 'checkbox' });
        selectAllCheckbox.checked = true;
        selectAllLabel.createSpan({ text: i18n.labelSelectAll });
        selectAllCheckbox.addEventListener('change', () => {
            const checked = selectAllCheckbox.checked;
            this.checkboxes.forEach((cb) => (cb.checked = checked));
        });

        header.createEl('span', { cls: 'file-list-count', text: i18n.labelFileCount(this.files.length) });

        // 文件列表
        const listContainer = contentEl.createEl('div', { cls: 'file-list-container' });

        for (const file of this.files) {
            const item = listContainer.createEl('div', { cls: 'file-list-item' });

            const checkbox = item.createEl('input', { type: 'checkbox', cls: 'file-list-checkbox' });
            checkbox.checked = true;
            this.checkboxes.push(checkbox);

            const pathSpan = item.createEl('span', { cls: 'file-list-path', text: file.path });
            pathSpan.title = file.path;

            item.createEl('span', { cls: 'file-list-size', text: formatBytes(file.stat.size) });
        }

        // 按钮
        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });

        const cancelBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonCancel });
        cancelBtn.addEventListener('click', () => this.close());

        const deleteBtn = btnRow.createEl('button', { cls: 'clear-unused-button clear-unused-button-danger', text: i18n.buttonDeleteSelected });
        deleteBtn.addEventListener('click', () => {
            const selected = this.files.filter((_, i) => this.checkboxes[i].checked);
            if (selected.length === 0) {
                new Notice(i18n.noticeNoFilesSelected);
                return;
            }
            this.close();
            this.onConfirm(selected);
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.checkboxes = [];
    }
}

/**
 * 操作日志弹窗
 */
export class LogsModal extends Modal {
    logs: string;

    constructor(app: App, logs: string) {
        super(app);
        this.logs = logs;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('clear-unused-modal');

        contentEl.createEl('h2', { text: t().modalLogsTitle, cls: 'modal-title' });

        const logsEl = contentEl.createEl('div', { cls: 'clear-unused-logs' });
        logsEl.innerHTML = this.logs;

        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });
        const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: t().buttonClose });
        closeBtn.addEventListener('click', () => this.close());
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
