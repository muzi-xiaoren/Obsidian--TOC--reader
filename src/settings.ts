import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
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

	/** Obsidian 1.13+ renders the tab from these definitions and indexes them for settings search. */
	getSettingDefinitions(): SettingDefinitionItem[] {
		const strings = t();
		return [
			{
				name: strings.minLevelName,
				desc: strings.minLevelDesc,
				control: { type: "slider", key: "minLevel", min: 1, max: 6, step: 1 },
			},
			{
				name: strings.maxLevelName,
				desc: strings.maxLevelDesc,
				control: { type: "slider", key: "maxLevel", min: 1, max: 6, step: 1 },
			},
			{
				name: strings.showNumbersName,
				desc: strings.showNumbersDesc,
				control: { type: "toggle", key: "showNumbers" },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		this.plugin.refreshAll();
	}

	/** Fallback for Obsidian versions older than 1.13, which never call getSettingDefinitions(). */
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
