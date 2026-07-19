import { App, PluginSettingTab, Setting } from "obsidian";
import type TocReaderPlugin from "./main";

export interface TocSettings {
	/** Smallest heading level (biggest heading) included in the TOC, 1–6. */
	minLevel: number;
	/** Largest heading level (smallest heading) included in the TOC, 1–6. */
	maxLevel: number;
	/** Prefix entries with Typora-style 1.2.3 numbering. */
	showNumbers: boolean;
}

export const DEFAULT_SETTINGS: TocSettings = {
	minLevel: 1,
	maxLevel: 6,
	showNumbers: false,
};

export class TocSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: TocReaderPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Minimum heading level")
			.setDesc("Headings with a level smaller than this (e.g. H1 when set to 2) are excluded from the TOC.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 6, 1)
					.setValue(this.plugin.settings.minLevel)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.minLevel = value;
						await this.plugin.saveSettings();
						this.plugin.refreshAll();
					})
			);

		new Setting(containerEl)
			.setName("Maximum heading level")
			.setDesc("Headings with a level larger than this (e.g. H5/H6 when set to 4) are excluded from the TOC.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 6, 1)
					.setValue(this.plugin.settings.maxLevel)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLevel = value;
						await this.plugin.saveSettings();
						this.plugin.refreshAll();
					})
			);

		new Setting(containerEl)
			.setName("Show numbering")
			.setDesc("Prefix each TOC entry with Typora-style hierarchical numbers (1, 1.1, 1.2 …).")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showNumbers).onChange(async (value) => {
					this.plugin.settings.showNumbers = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAll();
				})
			);
	}
}
