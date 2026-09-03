import { App, PluginSettingTab, Setting } from "obsidian";
import type TocReaderPlugin from "./main";
import { t } from "./i18n";

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
		const strings = t();
		containerEl.empty();

		new Setting(containerEl)
			.setName(strings.minLevelName)
			.setDesc(strings.minLevelDesc)
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
			.setName(strings.maxLevelName)
			.setDesc(strings.maxLevelDesc)
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
			.setName(strings.showNumbersName)
			.setDesc(strings.showNumbersDesc)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showNumbers).onChange(async (value) => {
					this.plugin.settings.showNumbers = value;
					await this.plugin.saveSettings();
					this.plugin.refreshAll();
				})
			);
	}
}
