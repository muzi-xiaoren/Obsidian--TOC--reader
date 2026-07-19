# TOC Reader

Typora-style `[TOC]` for Obsidian. Drop a `[TOC]` line anywhere in a note and it renders as a clickable, nested table of contents — in **both reading view and Live Preview** — instead of a dead blue `[TOC]` link.

## Features

- Renders any standalone `[TOC]` / `[toc]` line as a nested table of contents, built from the note's headings.
- Works in **reading view** and in **Live Preview** (the widget turns back into editable `[TOC]` source when your cursor is on that line).
- Click an entry to **jump to the heading**. Jumps use line positions, so duplicate heading names each go to their own spot.
- Non-contiguous heading levels (an H4 directly under an H2) fold into relative indentation, like Typora.
- TOC updates automatically as you add/remove/rename headings.
- Settings: min/max heading level to include, optional Typora-style `1.2.3` numbering.

## Installation

### From Community Plugins

*Pending review.* Once accepted, search for **TOC Reader** in *Settings → Community plugins → Browse* and install it directly.

### Via BRAT (before official release)

Install [BRAT](https://github.com/TfTHacker/obsidian42-brat), then run `BRAT: Add a beta plugin` and enter `muzi-xiaoren/Obsidian--TOC--reader`.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/muzi-xiaoren/Obsidian--TOC--reader/releases).
2. Copy them into `<your-vault>/.obsidian/plugins/toc-reader/`.
3. Reload Obsidian, then enable **TOC Reader** in *Settings → Community plugins*.

### Build from source

```bash
git clone https://github.com/muzi-xiaoren/Obsidian--TOC--reader.git
cd Obsidian--TOC--reader
npm install
npm run build   # produces main.js
```

Then copy `main.js`, `manifest.json`, `styles.css` into `<your-vault>/.obsidian/plugins/toc-reader/` as above.

## Usage

Put `[TOC]` on its own line, anywhere in a note:

```markdown
# My Note

[TOC]

## Section 1
### Sub-section
## Section 2
```

In reading view and Live Preview the line becomes a nested, clickable table of contents. In source mode it stays as plain `[TOC]` text (by design).

## 中文说明

Typora 里的 `[TOC]` 标签在 Obsidian 中只会显示成一个点不动的蓝色链接。装上本插件后，`[TOC]` 会渲染成和 Typora 相似的多级目录：

- 阅读模式和实时预览（Live Preview）都支持；实时预览下光标移到 `[TOC]` 所在行会还原成源码，方便编辑。
- 目录按标题级数自动嵌套缩进，点击条目即可跳转到对应标题（重名标题也能正确各跳各的）。
- 标题增删改后目录自动刷新。
- 设置页可配置目录包含的标题级数范围，以及是否显示 Typora 风格的 `1.2.3` 编号。

## License

[Apache-2.0](LICENSE)
