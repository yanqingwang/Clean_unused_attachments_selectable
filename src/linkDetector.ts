import { App, TFile } from 'obsidian';

/* -------------------- LINK DETECTOR -------------------- */

type LinkType = 'markdown' | 'wiki' | 'wikiTransclusion' | 'mdTransclusion';

export interface LinkMatch {
    type: LinkType;
    match: string;
    linkText: string;
    sourceFilePath: string;
}

/**
 * 扫描文件中的所有内部链接（wiki 和 markdown 格式）
 * 不使用 lookbehind 正则（iOS <16.4 不支持）
 */
export const getAllLinkMatchesInFile = async (mdFile: TFile, app: App, fileText?: string): Promise<LinkMatch[]> => {
    const linkMatches: LinkMatch[] = [];
    if (fileText === undefined) {
        fileText = await app.vault.read(mdFile);
    }

    // --> WikiLinks: [[...]]
    const wikiRegex = /\[\[([^\]]+)\]\]/g;
    let wikiMatch: RegExpExecArray | null;
    while ((wikiMatch = wikiRegex.exec(fileText)) !== null) {
        const fullMatch = wikiMatch[0];
        const inner = wikiMatch[1];
        // 去掉别名部分 |alias
        const pipeIdx = inner.indexOf('|');
        const target = pipeIdx >= 0 ? inner.substring(0, pipeIdx) : inner;

        if (target.startsWith('http')) continue;

        // 检查是否为 transclusion（包含 #）
        const hashIdx = target.indexOf('#');
        if (hashIdx >= 0) {
            const fileName = target.substring(0, hashIdx);
            if (fileName !== '') {
                const file = app.metadataCache.getFirstLinkpathDest(fileName, mdFile.path);
                linkMatches.push({
                    type: 'wikiTransclusion',
                    match: fullMatch,
                    linkText: file ? file.path : fileName,
                    sourceFilePath: mdFile.path,
                });
                continue;
            }
        }

        if (target !== '') {
            const file = app.metadataCache.getFirstLinkpathDest(target, mdFile.path);
            linkMatches.push({
                type: 'wiki',
                match: fullMatch,
                linkText: file ? file.path : target,
                sourceFilePath: mdFile.path,
            });
        }
    }

    // --> Markdown Links: [...](...)
    const markdownRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = markdownRegex.exec(fileText)) !== null) {
        const fullMatch = mdMatch[0];
        const target = mdMatch[2];

        if (target.startsWith('http')) continue;

        // 检查是否为 transclusion（包含 #）
        const hashIdx = target.indexOf('#');
        if (hashIdx >= 0) {
            const fileName = target.substring(0, hashIdx);
            if (fileName !== '') {
                const file = app.metadataCache.getFirstLinkpathDest(fileName, mdFile.path);
                linkMatches.push({
                    type: 'mdTransclusion',
                    match: fullMatch,
                    linkText: file ? file.path : fileName,
                    sourceFilePath: mdFile.path,
                });
                continue;
            }
        }

        if (target !== '') {
            const file = app.metadataCache.getFirstLinkpathDest(target, mdFile.path);
            linkMatches.push({
                type: 'markdown',
                match: fullMatch,
                linkText: file ? file.path : target,
                sourceFilePath: mdFile.path,
            });
        }
    }

    return linkMatches;
};
