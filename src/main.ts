import { MarkdownRenderChild, MarkdownView, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, TocSettings, TocSettingTab } from "./settings";
import { buildTocElement } from "./toc-builder";
import { tocLivePreviewExtension } from "./live-preview";

const TOC_TEXT = /^\[toc\]$/i;

export default class TocReaderPlugin extends Plugin {
	settings: TocSettings = { ...DEFAULT_SETTINGS };

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new TocSettingTab(this.app, this));

		// Reading view: swap any paragraph that is exactly "[TOC]" for the TOC tree.
		this.registerMarkdownPostProcessor((el, ctx) => {
			for (const p of Array.from(el.querySelectorAll("p"))) {
				if (TOC_TEXT.test((p.textContent ?? "").trim())) {
					ctx.addChild(new TocRenderChild(p, this, ctx.sourcePath));
				}
			}
		});

		// Live Preview: replace [TOC] lines with a widget via CM6 decorations.
		this.registerEditorExtension(tocLivePreviewExtension(this));

		// Heading edits only surface through metadataCache, which does not create
		// editor transactions — nudge open editors so the widget refreshes.
		this.registerEvent(this.app.metadataCache.on("changed", (file) => this.refreshEditorsFor(file)));
	}

	refreshEditorsFor(file: TFile) {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (view instanceof MarkdownView && view.file?.path === file.path) {
				(view.editor as unknown as { cm?: { dispatch: (tr: object) => void } }).cm?.dispatch({});
			}
		});
	}

	/** Re-render every open markdown view; used after settings changes. */
	refreshAll() {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (view instanceof MarkdownView) {
				(view.editor as unknown as { cm?: { dispatch: (tr: object) => void } }).cm?.dispatch({});
				view.previewMode?.rerender(true);
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<TocSettings> | null);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TocRenderChild extends MarkdownRenderChild {
	constructor(
		containerEl: HTMLElement,
		private plugin: TocReaderPlugin,
		private sourcePath: string
	) {
		super(containerEl);
	}

	onload() {
		this.render();
		this.registerEvent(
			this.plugin.app.metadataCache.on("changed", (file) => {
				if (file.path === this.sourcePath) this.render();
			})
		);
	}

	render() {
		const headings = this.plugin.app.metadataCache.getCache(this.sourcePath)?.headings ?? [];
		const toc = buildTocElement(headings, this.plugin.settings, (line) => this.jumpTo(line));
		this.containerEl.empty();
		this.containerEl.appendChild(toc);
	}

	jumpTo(line: number) {
		const { workspace } = this.plugin.app;
		let target = workspace.getActiveViewOfType(MarkdownView);
		if (!target || target.file?.path !== this.sourcePath) {
			target = null;
			workspace.iterateAllLeaves((leaf) => {
				if (!target && leaf.view instanceof MarkdownView && leaf.view.file?.path === this.sourcePath) {
					target = leaf.view;
				}
			});
		}
		// Jump by line number instead of #heading links so duplicate heading
		// names each resolve to their own position.
		target?.setEphemeralState({ line });
	}
}
