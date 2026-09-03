import { moment } from "obsidian";

/**
 * Localised UI strings.
 *
 * The language follows Obsidian's own display language (which itself defaults
 * to the system language) via `moment.locale()`; `navigator.language` is a
 * backstop for the rare case moment carries a locale we don't ship. Unknown
 * languages fall back to English.
 */
export interface TocStrings {
	emptyToc: string;
	minLevelName: string;
	minLevelDesc: string;
	maxLevelName: string;
	maxLevelDesc: string;
	showNumbersName: string;
	showNumbersDesc: string;
}

const en: TocStrings = {
	emptyToc: "TOC: no headings found",
	minLevelName: "Minimum heading level",
	minLevelDesc:
		"Headings with a level smaller than this (e.g. H1 when set to 2) are excluded from the TOC.",
	maxLevelName: "Maximum heading level",
	maxLevelDesc:
		"Headings with a level larger than this (e.g. H5/H6 when set to 4) are excluded from the TOC.",
	showNumbersName: "Show numbering",
	showNumbersDesc:
		"Prefix each TOC entry with Typora-style hierarchical numbers (1, 1.1, 1.2 …).",
};

const zhCN: TocStrings = {
	emptyToc: "TOC：未找到标题",
	minLevelName: "最小标题级别",
	minLevelDesc: "级别小于此值的标题（例如设为 2 时的 H1）不会出现在目录中。",
	maxLevelName: "最大标题级别",
	maxLevelDesc: "级别大于此值的标题（例如设为 4 时的 H5/H6）不会出现在目录中。",
	showNumbersName: "显示编号",
	showNumbersDesc: "为每个目录条目添加 Typora 风格的层级编号（1、1.1、1.2 ……）。",
};

const zhTW: TocStrings = {
	emptyToc: "TOC：找不到標題",
	minLevelName: "最小標題層級",
	minLevelDesc: "層級小於此值的標題（例如設為 2 時的 H1）不會出現在目錄中。",
	maxLevelName: "最大標題層級",
	maxLevelDesc: "層級大於此值的標題（例如設為 4 時的 H5/H6）不會出現在目錄中。",
	showNumbersName: "顯示編號",
	showNumbersDesc: "為每個目錄項目加上 Typora 風格的階層編號（1、1.1、1.2 ……）。",
};

const ja: TocStrings = {
	emptyToc: "TOC: 見出しが見つかりません",
	minLevelName: "最小見出しレベル",
	minLevelDesc: "これより小さいレベルの見出し（2 に設定した場合の H1 など）は目次に含まれません。",
	maxLevelName: "最大見出しレベル",
	maxLevelDesc:
		"これより大きいレベルの見出し（4 に設定した場合の H5/H6 など）は目次に含まれません。",
	showNumbersName: "番号を表示",
	showNumbersDesc: "各目次項目に Typora 形式の階層番号（1、1.1、1.2 …）を付けます。",
};

const ko: TocStrings = {
	emptyToc: "TOC: 제목을 찾을 수 없습니다",
	minLevelName: "최소 제목 수준",
	minLevelDesc: "이 값보다 낮은 수준의 제목(2로 설정한 경우 H1 등)은 목차에서 제외됩니다.",
	maxLevelName: "최대 제목 수준",
	maxLevelDesc: "이 값보다 높은 수준의 제목(4로 설정한 경우 H5/H6 등)은 목차에서 제외됩니다.",
	showNumbersName: "번호 표시",
	showNumbersDesc: "각 목차 항목 앞에 Typora 스타일의 계층 번호(1, 1.1, 1.2 …)를 붙입니다.",
};

const ru: TocStrings = {
	emptyToc: "TOC: заголовки не найдены",
	minLevelName: "Минимальный уровень заголовка",
	minLevelDesc:
		"Заголовки уровня меньше указанного (например, H1 при значении 2) не попадают в оглавление.",
	maxLevelName: "Максимальный уровень заголовка",
	maxLevelDesc:
		"Заголовки уровня больше указанного (например, H5/H6 при значении 4) не попадают в оглавление.",
	showNumbersName: "Показывать нумерацию",
	showNumbersDesc:
		"Добавлять к каждому пункту оглавления иерархический номер в стиле Typora (1, 1.1, 1.2 …).",
};

const de: TocStrings = {
	emptyToc: "TOC: keine Überschriften gefunden",
	minLevelName: "Minimale Überschriftenebene",
	minLevelDesc:
		"Überschriften mit einer kleineren Ebene (z. B. H1 bei Wert 2) werden nicht ins Inhaltsverzeichnis aufgenommen.",
	maxLevelName: "Maximale Überschriftenebene",
	maxLevelDesc:
		"Überschriften mit einer größeren Ebene (z. B. H5/H6 bei Wert 4) werden nicht ins Inhaltsverzeichnis aufgenommen.",
	showNumbersName: "Nummerierung anzeigen",
	showNumbersDesc:
		"Jedem Eintrag eine hierarchische Nummer im Typora-Stil voranstellen (1, 1.1, 1.2 …).",
};

const fr: TocStrings = {
	emptyToc: "TOC : aucun titre trouvé",
	minLevelName: "Niveau de titre minimum",
	minLevelDesc:
		"Les titres d'un niveau inférieur à cette valeur (par exemple H1 lorsqu'elle vaut 2) sont exclus de la table des matières.",
	maxLevelName: "Niveau de titre maximum",
	maxLevelDesc:
		"Les titres d'un niveau supérieur à cette valeur (par exemple H5/H6 lorsqu'elle vaut 4) sont exclus de la table des matières.",
	showNumbersName: "Afficher la numérotation",
	showNumbersDesc:
		"Préfixer chaque entrée d'un numéro hiérarchique de style Typora (1, 1.1, 1.2 …).",
};

const es: TocStrings = {
	emptyToc: "TOC: no se encontraron encabezados",
	minLevelName: "Nivel de encabezado mínimo",
	minLevelDesc:
		"Los encabezados con un nivel inferior a este (por ejemplo, H1 cuando se establece 2) se excluyen del índice.",
	maxLevelName: "Nivel de encabezado máximo",
	maxLevelDesc:
		"Los encabezados con un nivel superior a este (por ejemplo, H5/H6 cuando se establece 4) se excluyen del índice.",
	showNumbersName: "Mostrar numeración",
	showNumbersDesc:
		"Añadir a cada entrada del índice un número jerárquico al estilo de Typora (1, 1.1, 1.2 …).",
};

const ptBR: TocStrings = {
	emptyToc: "TOC: nenhum título encontrado",
	minLevelName: "Nível mínimo de título",
	minLevelDesc:
		"Títulos com nível menor que este (por exemplo, H1 quando definido como 2) são excluídos do sumário.",
	maxLevelName: "Nível máximo de título",
	maxLevelDesc:
		"Títulos com nível maior que este (por exemplo, H5/H6 quando definido como 4) são excluídos do sumário.",
	showNumbersName: "Exibir numeração",
	showNumbersDesc:
		"Adicionar a cada item do sumário um número hierárquico no estilo do Typora (1, 1.1, 1.2 …).",
};

const LOCALES: Record<string, TocStrings> = {
	en,
	"zh-cn": zhCN,
	"zh-hans": zhCN,
	"zh-tw": zhTW,
	"zh-hk": zhTW,
	"zh-hant": zhTW,
	ja,
	ko,
	ru,
	de,
	fr,
	es,
	"pt-br": ptBR,
	pt: ptBR,
};

/** Region-less tags that need a specific regional variant. */
const BASE_ALIASES: Record<string, string> = { zh: "zh-cn" };

function resolve(tag: string | undefined): TocStrings | null {
	if (!tag) return null;
	const normalised = tag.toLowerCase().replace(/_/g, "-");
	const base = normalised.split("-")[0];
	return LOCALES[normalised] ?? LOCALES[BASE_ALIASES[base] ?? base] ?? null;
}

let cachedTag: string | undefined | null = null;
let cachedStrings: TocStrings = en;

/** Strings for the current Obsidian display language. */
export function t(): TocStrings {
	const tag = moment.locale();
	// Re-resolve only when the language actually changed, so the per-render
	// cost of a TOC rebuild stays a single string compare.
	if (tag !== cachedTag) {
		cachedTag = tag;
		cachedStrings = resolve(tag) ?? resolve(navigator?.language) ?? en;
	}
	return cachedStrings;
}
