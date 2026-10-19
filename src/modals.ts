import { App, Modal, Notice, Setting, TFile } from 'obsidian';
import ClearUnusedAttachments from './main';
import { getUnusedAttachments, deleteFilesInTheList, formatBytes } from './util';

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

        contentEl.createEl('h2', { text: '选择清理范围', cls: 'modal-title' });

        const hintEl = contentEl.createEl('div', { cls: 'clear-unused-hint' });
        hintEl.setText('提示：以下默认值来自设置，您可以在本次清理前修改。留空表示不限制。');

        // 文件夹输入
        const folderSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        folderSection.createEl('div', { cls: 'clear-unused-section-title', text: '目标文件夹' });
        folderSection.createEl('div', { cls: 'clear-unused-hint', text: '多个路径用逗号分隔，例如: Attachments, Assets/Images' });
        const folderInput = folderSection.createEl('textarea', { cls: 'clear-unused-textarea' });
        folderInput.value = this.plugin.settings.defaultFolders;
        folderInput.placeholder = '留空表示扫描整个仓库';

        // 文件类型输入
        const typeSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        typeSection.createEl('div', { cls: 'clear-unused-section-title', text: '目标文件类型' });
        typeSection.createEl('div', { cls: 'clear-unused-hint', text: '多个扩展名用逗号分隔，例如: png, jpg, pdf, zip' });
        const typeInput = typeSection.createEl('input', { cls: 'clear-unused-input', type: 'text' });
        typeInput.value = this.plugin.settings.defaultFileTypes;
        typeInput.placeholder = '留空表示所有附件类型';

        // 快捷选择按钮
        const quickSection = contentEl.createEl('div', { cls: 'clear-unused-section' });
        quickSection.createEl('div', { cls: 'clear-unused-section-title', text: '快捷选择' });

        const quickBtnRow = quickSection.createEl('div', { cls: 'clear-unused-button-row' });
        quickBtnRow.style.justifyContent = 'flex-start';

        const allImagesBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: '所有图片' });
        allImagesBtn.addEventListener('click', () => {
            typeInput.value = 'png, jpg, jpeg, gif, svg, bmp, webp';
        });

        const allDocsBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: '所有文档' });
        allDocsBtn.addEventListener('click', () => {
            typeInput.value = 'pdf, doc, docx, xls, xlsx, ppt, pptx, txt';
        });

        const allMediaBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: '所有媒体' });
        allMediaBtn.addEventListener('click', () => {
            typeInput.value = 'mp3, mp4, wav, avi, mov, mkv, flac';
        });

        const clearBtn = quickBtnRow.createEl('button', { cls: 'clear-unused-button', text: '清空' });
        clearBtn.addEventListener('click', () => {
            typeInput.value = '';
            folderInput.value = '';
        });

        // 按钮
        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });

        const cancelBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: '取消' });
        cancelBtn.addEventListener('click', () => this.close());

        const confirmBtn = btnRow.createEl('button', { cls: 'clear-unused-button clear-unused-button-primary', text: '开始扫描' });
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

        contentEl.createEl('h2', { text: `发现 ${this.files.length} 个未使用的附件`, cls: 'modal-title' });

        if (this.files.length === 0) {
            contentEl.createEl('p', { text: '没有找到未使用的附件。' });
            const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });
            const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: '关闭' });
            closeBtn.addEventListener('click', () => this.close());
            return;
        }

        // 头部：全选/取消全选
        const header = contentEl.createEl('div', { cls: 'file-list-header' });
        const selectAllLabel = header.createEl('label');
        const selectAllCheckbox = selectAllLabel.createEl('input', { type: 'checkbox' });
        selectAllCheckbox.checked = true;
        selectAllLabel.createSpan({ text: ' 全选' });
        selectAllCheckbox.addEventListener('change', () => {
            const checked = selectAllCheckbox.checked;
            this.checkboxes.forEach((cb) => (cb.checked = checked));
        });

        header.createEl('span', { cls: 'file-list-count', text: `${this.files.length} 个文件` });

        // 文件列表
        const listContainer = contentEl.createEl('div', { cls: 'file-list-container' });

        for (const file of this.files) {
            const item = listContainer.createEl('div', { cls: 'file-list-item' });

            const checkbox = item.createEl('input', { type: 'checkbox', cls: 'file-list-checkbox' });
            checkbox.checked = true;
            this.checkboxes.push(checkbox);

            const pathSpan = item.createEl('span', { cls: 'file-list-path', text: file.path });
            pathSpan.title = file.path;

            const sizeSpan = item.createEl('span', { cls: 'file-list-size', text: formatBytes(file.stat.size) });
        }

        // 按钮
        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });

        const cancelBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: '取消' });
        cancelBtn.addEventListener('click', () => this.close());

        const deleteBtn = btnRow.createEl('button', { cls: 'clear-unused-button clear-unused-button-danger', text: '删除选中' });
        deleteBtn.addEventListener('click', () => {
            const selected = this.files.filter((_, i) => this.checkboxes[i].checked);
            if (selected.length === 0) {
                new Notice('未选择任何文件。');
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

        contentEl.createEl('h2', { text: '清理日志', cls: 'modal-title' });

        const logsEl = contentEl.createEl('div', { cls: 'clear-unused-logs' });
        logsEl.innerHTML = this.logs;

        const btnRow = contentEl.createEl('div', { cls: 'clear-unused-button-row' });
        const closeBtn = btnRow.createEl('button', { cls: 'clear-unused-button', text: '关闭' });
        closeBtn.addEventListener('click', () => this.close());
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
