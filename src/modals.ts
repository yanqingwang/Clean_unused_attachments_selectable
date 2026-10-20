import { App, Modal, Notice, TFile } from 'obsidian';
import ClearUnusedAttachments from './main';
import { formatBytes } from './util';
import { t } from './i18n';

/**
 * 清理范围选择对话框
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

        contentEl.createDiv({ cls: 'clear-unused-hint', text: i18n.modalSelectScopeHint });

        // 文件夹输入
        const folderSection = contentEl.createDiv({ cls: 'clear-unused-section' });
        folderSection.createDiv({ cls: 'clear-unused-section-title', text: i18n.labelTargetFolders });
        folderSection.createDiv({ cls: 'clear-unused-hint', text: i18n.labelTargetFoldersHint });
        const folderInput = folderSection.createEl('textarea', { cls: 'clear-unused-textarea' });
        folderInput.value = this.plugin.settings.defaultFolders;
        folderInput.placeholder = i18n.placeholderFolders;

        // 文件类型输入
        const typeSection = contentEl.createDiv({ cls: 'clear-unused-section' });
        typeSection.createDiv({ cls: 'clear-unused-section-title', text: i18n.labelTargetFileTypes });
        typeSection.createDiv({ cls: 'clear-unused-hint', text: i18n.labelTargetFileTypesHint });
        const typeInput = typeSection.createEl('input', { cls: 'clear-unused-input', type: 'text' });
        typeInput.value = this.plugin.settings.defaultFileTypes;
        typeInput.placeholder = i18n.placeholderFileTypes;

        // 快捷选择按钮
        const quickSection = contentEl.createDiv({ cls: 'clear-unused-section' });
        quickSection.createDiv({ cls: 'clear-unused-section-title', text: i18n.labelQuickSelect });

        const quickBtnRow = quickSection.createDiv({ cls: 'clear-unused-button-row clear-unused-button-row-start' });

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

        // 底部按钮
        const btnRow = contentEl.createDiv({ cls: 'clear-unused-button-row' });

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
                .map((tp) => tp.trim().toLowerCase().replace(/^\./, ''))
                .filter((tp) => tp.length > 0);

            this.close();
            this.onSubmit(folders, fileTypes);
        });
    }

    onClose() {
        this.contentEl.empty();
    }
}

/**
 * 未使用文件确认列表对话框
 */
export class ConfirmDeleteModal extends Modal {
    plugin: ClearUnusedAttachments;
    files: TFile[];
    onConfirm: (selectedFiles: TFile[]) => void;
    private checkboxes: HTMLInputElement[] = [];
    private listItems: HTMLElement[] = [];

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
            const btnRow = contentEl.createDiv({ cls: 'clear-unused-button-row' });
            const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: i18n.buttonClose });
            closeBtn.addEventListener('click', () => this.close());
            return;
        }

        // 收集筛选选项
        const folders: string[] = Array.from(new Set(this.files.map((f) => f.parent?.path ?? '/'))).sort();
        const exts: string[] = Array.from(new Set(this.files.map((f) => f.extension.toLowerCase()))).sort();

        // 头部：全选/取消全选
        const header = contentEl.createDiv({ cls: 'file-list-header' });
        const selectAllLabel = header.createEl('label');
        const selectAllCheckbox = selectAllLabel.createEl('input', { type: 'checkbox' });
        selectAllCheckbox.checked = true;
        selectAllLabel.createSpan({ text: i18n.labelSelectAll });
        selectAllCheckbox.addEventListener('change', () => {
            // 只对当前可见项生效
            const checked = selectAllCheckbox.checked;
            this.listItems.forEach((item, i) => {
                if (item.style.display !== 'none') this.checkboxes[i].checked = checked;
            });
        });

        header.createSpan({ cls: 'file-list-count', text: i18n.labelFileCount(this.files.length) });

        // 过滤栏
        const filterRow = contentEl.createDiv({ cls: 'file-list-filter-row' });

        const folderLabel = filterRow.createSpan({ text: i18n.labelFilterFolder });
        folderLabel.addClass('file-list-filter-label');
        const folderSelect = filterRow.createEl('select', { cls: 'file-list-filter-select' });
        folderSelect.createEl('option', { text: i18n.optionFilterAllFolders, value: '__all__' });
        for (const folder of folders) {
            folderSelect.createEl('option', { text: folder, value: folder });
        }

        const extLabel = filterRow.createSpan({ text: i18n.labelFilterExt });
        extLabel.addClass('file-list-filter-label');
        const extSelect = filterRow.createEl('select', { cls: 'file-list-filter-select' });
        extSelect.createEl('option', { text: i18n.optionFilterAllExts, value: '__all__' });
        for (const ext of exts) {
            extSelect.createEl('option', { text: ext, value: ext });
        }

        // 文件列表
        const listContainer = contentEl.createDiv({ cls: 'file-list-container' });

        for (const file of this.files) {
            const item = listContainer.createDiv({ cls: 'file-list-item' });

            const checkbox = item.createEl('input', { type: 'checkbox', cls: 'file-list-checkbox' });
            checkbox.checked = true;
            this.checkboxes.push(checkbox);

            const pathSpan = item.createSpan({ cls: 'file-list-path', text: file.path });
            pathSpan.title = file.path;

            item.createSpan({ cls: 'file-list-size', text: formatBytes(file.stat.size) });

            this.listItems.push(item);
        }

        // 过滤函数
        const applyFilter = () => {
            const folderFilter = folderSelect.value;
            const extFilter = extSelect.value;
            this.listItems.forEach((item, i) => {
                const file = this.files[i];
                const fileFolder = file.parent?.path ?? '/';
                const folderOk = folderFilter === '__all__' || fileFolder === folderFilter;
                const extOk = extFilter === '__all__' || file.extension.toLowerCase() === extFilter;
                item.style.display = folderOk && extOk ? '' : 'none';
            });
        };
        folderSelect.addEventListener('change', applyFilter);
        extSelect.addEventListener('change', applyFilter);

        // 按钮
        const btnRow = contentEl.createDiv({ cls: 'clear-unused-button-row' });

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
        this.contentEl.empty();
        this.checkboxes = [];
        this.listItems = [];
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

        const logsEl = contentEl.createDiv({ cls: 'clear-unused-logs' });
        // 用 innerText 替代 innerHTML，避免 XSS
        logsEl.innerText = this.logs;

        const btnRow = contentEl.createDiv({ cls: 'clear-unused-button-row' });
        const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: t().buttonClose });
        closeBtn.addEventListener('click', () => this.close());
    }

    onClose() {
        this.contentEl.empty();
    }
}
