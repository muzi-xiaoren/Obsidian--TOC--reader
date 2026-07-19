import { EditorState, Extension, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType } from "@codemirror/view";
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

		// Reveal the raw [TOC] source only when the user *selects* the line to edit
		// or delete it. An empty caret merely resting on the line — e.g. the
		// default cursor position when a note opens on a [TOC] first line — keeps
		// the TOC rendered, since [TOC] is a directive, not text you edit in place.
		const selectedOnLine = state.selection.ranges.some(
			(r) => r.from < r.to && r.from <= line.to && r.to >= line.from
		);
		if (selectedOnLine) continue;

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
function tocStateField(plugin: TocReaderPlugin): StateField<DecorationSet> {
	return StateField.define<DecorationSet>({
		create: (state) => buildDecorations(state, plugin),
		update: (_deco, tr) => buildDecorations(tr.state, plugin),
		provide: (field) => EditorView.decorations.from(field),
	});
}

/**
 * When a note opens, the state field's `create` may run before Obsidian has
 * attached the file/mode fields, so it returns no decorations and — because a
 * field only recomputes on transactions — the [TOC] line stays raw until the
 * user happens to interact. Dispatch one empty transaction after mount to force
 * a recompute once everything is ready.
 */
const tocInitialRefresh = ViewPlugin.fromClass(
	class {
		private timer: number;
		constructor(view: EditorView) {
			this.timer = window.setTimeout(() => view.dispatch({}), 0);
		}
		destroy() {
			window.clearTimeout(this.timer);
		}
	}
);

export function tocLivePreviewExtension(plugin: TocReaderPlugin): Extension {
	return [tocStateField(plugin), tocInitialRefresh];
}
