// A deliberately small formatter for news posts. Everything is escaped first,
// then only these are turned into HTML:
//   blank line        new paragraph
//   ## Heading        subheading (### for a smaller one)
//   - item            bulleted list
//   > quote           pull quote
//   **bold**  _italic_  [link text](https://...)

const escape = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function inline(text: string) {
	return escape(text)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|[\s(])_(.+?)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
		.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^\s)]+)\)/g, (_, label, href) => {
			const external = /^https?:/.test(href);
			return `<a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`;
		});
}

export function render(source: string) {
	return source
		.replace(/\r\n?/g, '\n')
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const lines = block.split('\n');
			if (block.startsWith('### ')) return `<h3>${inline(block.slice(4))}</h3>`;
			if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
			if (lines.every((l) => /^[-*] /.test(l))) {
				return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
			}
			if (lines.every((l) => l.startsWith('>'))) {
				return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`;
			}
			return `<p>${lines.map(inline).join('<br />')}</p>`;
		})
		.join('\n');
}
