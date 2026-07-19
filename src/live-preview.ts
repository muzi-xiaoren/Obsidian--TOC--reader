import { EditorState, Extension, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { editorInfoField, editorLivePreviewField } from "obsidian";
import { buildTocElement, headingsSignature } from "./toc-builder";
import type TocReaderPlugin from "./main";

const TOC_LINE = /^\s*\[toc\]\s*$/i;

class TocWidget extends WidgetType {
	constructor(
		private readonly plugin: TocReaderPlugin,
		private readonly sourcePath: string,
		private readonly signature: string
	) {
		super();
	}

	eq(other: TocWidget): boolean {
		return other.sourcePath === this.sourcePath && other.signature === this.signature;
	}

	toDOM(view: EditorView): HTMLElement {
		const headings = this.plugin.app.metadataCache.getCache(this.sourcePath)?.headings ?? [];
		const el = buildTocElement(headings, this.plugin.settings, (line) => {
			const doc = view.state.doc;
			const target = doc.line(Math.min(line + 1, doc.lines));
			view.dispatch({
				selection: { anchor: target.from },
				effects: EditorView.scrollIntoView(target.from, { y: "start" }),
			});
			view.focus();
		});
		el.addClass("toc-reader-live");
		return el;
	}
}

function buildDecorations(state: EditorState, plugin: TocReaderPlugin): DecorationSet {
	// Only decorate in Live Preview; leave source mode untouched.
	if (!state.field(editorLivePreviewField, false)) return Decoration.none;
	const path = state.field(editorInfoField, false)?.file?.path;
	if (!path) return Decoration.none;

	const doc = state.doc;
	const builder = new RangeSetBuilder<Decoration>();
	let signature: string | null = null;

	for (let i = 1; i <= doc.lines; i++) {
		const line = doc.line(i);
		if (line.length > 32 || !TOC_LINE.test(line.text)) continue;

		// Reveal the raw [TOC] source while the cursor/selection touches the line.
		const onLine = state.selection.ranges.some((r) => r.from <= line.to && r.to >= line.from);
		if (onLine) continue;

		if (signature === null) {
			const headings = plugin.app.metadataCache.getCache(path)?.headings ?? [];
			signature = headingsSignature(headings, plugin.settings);
		}
		builder.add(
			line.from,
			line.to,
			Decoration.replace({ widget: new TocWidget(plugin, path, signature), block: true })
		);
	}

	return builder.finish();
}

/**
 * Block widgets must be supplied by a StateField (CodeMirror forbids block
 * decorations from ViewPlugins), so the whole document is rescanned per
 * transaction — cheap, since it is one regex test per line.
 */
export function tocLivePreviewExtension(plugin: TocReaderPlugin): Extension {
	return StateField.define<DecorationSet>({
		create: (state) => buildDecorations(state, plugin),
		update: (_deco, tr) => buildDecorations(tr.state, plugin),
		provide: (field) => EditorView.decorations.from(field),
	});
}
