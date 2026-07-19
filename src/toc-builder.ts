import { HeadingCache } from "obsidian";
import type { TocSettings } from "./settings";

/**
 * Stable fingerprint of the TOC input, used by the Live Preview widget to
 * decide whether its DOM needs to be rebuilt.
 */
export function headingsSignature(headings: HeadingCache[], settings: TocSettings): string {
	return (
		headings.map((h) => `${h.level}:${h.position.start.line}:${h.heading}`).join("|") +
		`#${settings.minLevel}-${settings.maxLevel}-${settings.showNumbers}`
	);
}

/**
 * Build the TOC DOM tree from cached headings.
 *
 * Heading levels are folded into *relative* depths (an H4 directly under an
 * H2 is indented one step, not two), which matches how Typora renders [TOC]
 * for documents with non-contiguous heading levels.
 */
export function buildTocElement(
	headings: HeadingCache[],
	settings: TocSettings,
	onJump: (line: number) => void
): HTMLElement {
	const container = createDiv({ cls: "toc-reader" });
	const filtered = headings.filter((h) => h.level >= settings.minLevel && h.level <= settings.maxLevel);

	if (filtered.length === 0) {
		container.createDiv({ cls: "toc-reader-empty", text: "TOC: no headings found" });
		return container;
	}

	const levelStack: number[] = [];
	const items = filtered.map((heading) => {
		while (levelStack.length > 0 && levelStack[levelStack.length - 1] >= heading.level) {
			levelStack.pop();
		}
		const depth = levelStack.length;
		levelStack.push(heading.level);
		return { heading, depth };
	});

	const root = container.createEl("ul", { cls: "toc-reader-list" });
	// ulStack[d] holds the <ul> that receives items of depth d;
	// liStack[d] is the most recent <li> created at depth d.
	const ulStack: HTMLElement[] = [root];
	const liStack: HTMLElement[] = [];
	const counters: number[] = [];

	for (const { heading, depth } of items) {
		while (ulStack.length - 1 > depth) {
			ulStack.pop();
		}
		if (ulStack.length - 1 < depth) {
			// depth grows at most one step per item, so a single push suffices
			const parentLi = liStack[depth - 1];
			ulStack.push(parentLi.createEl("ul", { cls: "toc-reader-list" }));
		}

		counters.splice(depth + 1);
		counters[depth] = (counters[depth] ?? 0) + 1;

		const li = ulStack[depth].createEl("li", { cls: "toc-reader-item" });
		liStack[depth] = li;

		const link = li.createEl("a", { cls: "toc-reader-link" });
		if (settings.showNumbers) {
			link.createSpan({ cls: "toc-reader-num", text: counters.slice(0, depth + 1).join(".") });
		}
		link.createSpan({ cls: "toc-reader-text", text: heading.heading });

		const line = heading.position.start.line;
		link.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			onJump(line);
		});
	}

	return container;
}
