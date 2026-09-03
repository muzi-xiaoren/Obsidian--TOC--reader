/**
 * Minimal inline-Markdown renderer for TOC entries.
 *
 * `metadataCache` hands us heading text as raw Markdown source, so `**Bold**`
 * would otherwise show up in the TOC with its asterisks. Typora renders that
 * markup inside its [TOC], so we do too.
 *
 * Why not `MarkdownRenderer.render()`: it is async (the CM6 widget's `toDOM`
 * is not), it wraps output in a `<p>`, and it turns links into real anchors —
 * which would nest inside the TOC's own `<a>` and steal the jump click. This
 * covers the inline syntax that realistically appears in a heading, stays
 * synchronous, and builds DOM nodes directly (no `innerHTML`).
 *
 * Out of scope, left as literal text: math (`$…$`), tags, comments (`%%…%%`).
 */

type SpanTag = "strong" | "em" | "del" | "mark";

export type InlineToken =
	| { type: "text"; value: string }
	| { type: "code"; value: string }
	| { type: "span"; tag: SpanTag; children: InlineToken[] };

/** Guard against pathological nesting in a hand-written heading. */
const MAX_DEPTH = 8;

/** Characters a backslash may escape, per CommonMark. */
const ESCAPABLE = /[\\`*_{}[\]()#+\-.!~=|<>$&"']/;

const ALPHANUMERIC = /[\p{L}\p{N}_]/u;

/** Emphasis delimiters, longest first so `***x***` wins over `**x**`. */
const SPAN_RULES: Array<{ delim: string; tags: SpanTag[] }> = [
	{ delim: "***", tags: ["strong", "em"] },
	{ delim: "___", tags: ["strong", "em"] },
	{ delim: "**", tags: ["strong"] },
	{ delim: "__", tags: ["strong"] },
	{ delim: "~~", tags: ["del"] },
	{ delim: "==", tags: ["mark"] },
	{ delim: "*", tags: ["em"] },
	{ delim: "_", tags: ["em"] },
];

interface Match {
	tokens: InlineToken[];
	end: number;
}

/**
 * Parse inline Markdown into a token tree. Pure — no DOM — so it can be
 * exercised without an Obsidian runtime.
 */
export function tokenizeInline(source: string): InlineToken[] {
	return tokenize(source, 0);
}

function tokenize(src: string, depth: number): InlineToken[] {
	const out: InlineToken[] = [];
	let pending = "";

	const flush = () => {
		if (pending.length > 0) {
			out.push({ type: "text", value: pending });
			pending = "";
		}
	};

	let i = 0;
	while (i < src.length) {
		const ch = src[i];

		if (ch === "\\" && i + 1 < src.length && ESCAPABLE.test(src[i + 1])) {
			pending += src[i + 1];
			i += 2;
			continue;
		}

		// Code spans win over everything: their content is never markup.
		if (ch === "`") {
			const code = matchCode(src, i);
			if (code) {
				flush();
				out.push(...code.tokens);
				i = code.end;
				continue;
			}
		}

		const match =
			depth < MAX_DEPTH ? matchSpan(src, i, depth) ?? matchLinkLike(src, i, depth) : null;
		if (match) {
			flush();
			out.push(...match.tokens);
			i = match.end;
			continue;
		}

		pending += ch;
		i += 1;
	}

	flush();
	return out;
}

/** `` `code` ``, or an n-backtick run closed by another run of the same length. */
function matchCode(src: string, start: number): Match | null {
	let fence = start;
	while (src[fence] === "`") fence += 1;
	const marker = src.slice(start, fence);

	let i = fence;
	while (i < src.length) {
		if (src[i] !== "`") {
			i += 1;
			continue;
		}
		let run = i;
		while (src[run] === "`") run += 1;
		if (run - i === marker.length) {
			const value = src.slice(fence, i);
			// An unclosed or empty run is just literal backticks.
			if (value.length === 0) return null;
			return { tokens: [{ type: "code", value }], end: run };
		}
		i = run;
	}
	return null;
}

function matchSpan(src: string, start: number, depth: number): Match | null {
	for (const { delim, tags } of SPAN_RULES) {
		if (!src.startsWith(delim, start)) continue;

		const contentStart = start + delim.length;
		// A delimiter followed by whitespace opens nothing (`a * b`).
		if (contentStart >= src.length || /\s/.test(src[contentStart])) continue;
		// `_` does not emphasise inside a word, so snake_case_names survive.
		if (delim[0] === "_" && start > 0 && ALPHANUMERIC.test(src[start - 1])) continue;

		const close = findClosing(src, contentStart, delim);
		if (close < 0) continue;
		if (/\s/.test(src[close - 1])) continue;
		const after = close + delim.length;
		if (delim[0] === "_" && after < src.length && ALPHANUMERIC.test(src[after])) continue;

		const content = src.slice(contentStart, close);
		// Nothing but more markers between the delimiters (`****`) is literal.
		if (content.length === 0 || !content.split("").some((c) => c !== delim[0])) continue;

		const children = tokenize(content, depth + 1);
		if (children.length === 0) continue;

		// tags is outermost-first: ["strong","em"] → <strong><em>…</em></strong>
		let token: InlineToken = { type: "span", tag: tags[tags.length - 1], children };
		for (let t = tags.length - 2; t >= 0; t -= 1) {
			token = { type: "span", tag: tags[t], children: [token] };
		}
		return { tokens: [token], end: after };
	}
	return null;
}

/**
 * Position of the next unescaped `delim` at or after `from`, skipping code
 * spans. A shorter run than the delimiter is not a closer (the lone `*` inside
 * `**` never closes a `**`), while a longer one closes from its start — that is
 * what lets `**a *b***` nest an `<em>` inside the `<strong>`.
 */
function findClosing(src: string, from: number, delim: string): number {
	let i = from;
	while (i < src.length) {
		if (src[i] === "\\") {
			i += 2;
			continue;
		}
		if (src[i] === "`") {
			const code = matchCode(src, i);
			if (code) {
				i = code.end;
				continue;
			}
		}
		if (src.startsWith(delim, i)) {
			let run = i;
			while (src.startsWith(delim[0], run)) run += 1;
			// Close at the run's *end*, so the leading markers of an over-long
			// run stay available to whatever is nested inside.
			if (run - i >= delim.length) return run - delim.length;
			i = run;
			continue;
		}
		i += 1;
	}
	return -1;
}

/**
 * Links and embeds. A TOC entry is already a link that jumps to the heading,
 * so link-like syntax contributes its visible text only — never a nested
 * anchor that would hijack the click.
 */
function matchLinkLike(src: string, start: number, depth: number): Match | null {
	const isEmbed = src[start] === "!";
	const open = isEmbed ? start + 1 : start;

	if (src.startsWith("[[", open)) {
		const close = src.indexOf("]]", open + 2);
		if (close < 0) return null;
		const inner = src.slice(open + 2, close);
		const end = close + 2;
		// `![[image.png]]` is an embed with no text of its own — drop it.
		if (isEmbed) return { tokens: [], end };
		const pipe = inner.indexOf("|");
		const label = pipe >= 0 ? inner.slice(pipe + 1) : inner;
		return { tokens: label.length > 0 ? [{ type: "text", value: label }] : [], end };
	}

	if (src[open] !== "[") return null;
	const labelEnd = findUnescaped(src, open + 1, "]");
	if (labelEnd < 0 || src[labelEnd + 1] !== "(") return null;
	const urlEnd = findClosingParen(src, labelEnd + 2);
	if (urlEnd < 0) return null;

	const label = src.slice(open + 1, labelEnd);
	// For `![alt](url)` the alt text is the author's own description of it.
	return { tokens: tokenize(label, depth + 1), end: urlEnd + 1 };
}

function findUnescaped(src: string, from: number, ch: string): number {
	for (let i = from; i < src.length; i += 1) {
		if (src[i] === "\\") {
			i += 1;
			continue;
		}
		if (src[i] === ch) return i;
	}
	return -1;
}

/** End of a `(…)` URL, tolerating balanced parens inside it. */
function findClosingParen(src: string, from: number): number {
	let level = 0;
	for (let i = from; i < src.length; i += 1) {
		if (src[i] === "\\") {
			i += 1;
			continue;
		}
		if (src[i] === "(") level += 1;
		else if (src[i] === ")") {
			if (level === 0) return i;
			level -= 1;
		}
	}
	return -1;
}

/** Render inline Markdown into `parent` as DOM nodes. */
export function renderInline(parent: HTMLElement, source: string): void {
	emit(parent, tokenizeInline(source));
}

function emit(parent: HTMLElement, tokens: InlineToken[]): void {
	for (const token of tokens) {
		if (token.type === "text") {
			parent.appendText(token.value);
		} else if (token.type === "code") {
			parent.createEl("code", { text: token.value });
		} else {
			emit(parent.createEl(token.tag), token.children);
		}
	}
}
