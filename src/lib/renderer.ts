/**
 * Text (plaintext | markdown | latex) to HTML
 * also supports footnote, code highlight, and internal links
 * Author: Daniel (DanielZFLiu)
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from "marked-highlight";
import 'highlight.js/styles/tokyo-night-dark.css';
import markedFootnote from 'marked-footnote'
import { v4 as uuidv4 } from 'uuid';

// ==============================
// Render Latex
// ==============================
function renderLatex(text: string): string {
    // replace multi-line and inline latex enclosed by $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, p1) => {
        try {
            const rendered = katex.renderToString(p1, {
                displayMode: true,
                throwOnError: false
            });
            return rendered;
        } catch (e) {
            console.error(e);
            return match;
        }
    });

    // replace display \[...\] with rendered HTML
    text = text.replace(/\\\[(.+?)\\\]/gs, (match, p1) => {
        try {
            const rendered = katex.renderToString(p1, {
                displayMode: true,
                throwOnError: false
            });
            return rendered;
        } catch (e) {
            console.error(e);
            return match;
        }
    });

    // replace inline LaTeX expressions \(...\) with rendered HTML
    text = text.replace(/\\\((.+?)\\\)/g, (match, p1) => {
        try {
            return katex.renderToString(p1, {
                displayMode: false,
                throwOnError: false
            });
        } catch (e) {
            console.error(e);
            return match;
        }
    });

    // replace single $...$ inline expressions
    text = text.replace(/\$(.+?)\$/g, (match, p1) => {
        try {
            return katex.renderToString(p1, {
                displayMode: false,
                throwOnError: false
            });
        } catch (e) {
            console.error(e);
            return match;
        }
    });

    return text;
}

// ==============================
// Render Markdown
// ==============================

function getMarked(): Marked {
    const md = new Marked(
        markedHighlight({
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        })
    )

    md.use(markedFootnote({
        prefixId: `footnote-${uuidv4()}`
    }));

    // an extension to support headings with {#custom-id}
    // e.g. `# Heading text {#my-id}`
    // will convert to <h1 id="my-id">Heading text</h1>
    md.use({
        tokenizer: {
            heading(src) {
                // matches headings with {#custom-id} at the end
                const rule = /^(#{1,6})\s+(.*?)\s*\{#([\w-]+)\}\s*(?:\n|$)/;
                const match = rule.exec(src);
                if (match) {
                    const [raw, hashes, text, id] = match;
                    return {
                        type: 'heading',
                        raw,
                        depth: hashes.length,
                        text,
                        tokens: this.lexer.inlineTokens(text),
                        id
                    };
                }
                return false; // fall back to default behavior if no match
            }
        },
        renderer: {
            heading(token) {
                // use the extracted id if available
                const text = this.parser.parseInline(token.tokens);
                // @ts-ignore
                const id = token.id || text.toLowerCase().replace(/[^\w]+/g, '-');
                return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
            }
        }
    });

    return md;
}

// ==============================
// Additional Styling
// ==============================
function injectInlineStyles(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const elements = doc.querySelectorAll('table, tr, th, td, code, .katex-html');

    elements.forEach(element => {
        switch (element.tagName.toLowerCase()) {
            case 'table':
                element.setAttribute('style', (element.getAttribute('style') || '') + 'border: 1px solid var(--primary-contrast); border-collapse: collapse;');
                break;
            case 'tr':
                element.setAttribute('style', (element.getAttribute('style') || '') + 'border: 1px solid var(--primary-contrast);');
                break;
            case 'th':
            case 'td':
                element.setAttribute('style', (element.getAttribute('style') || '') + 'border: 1px solid var(--primary-contrast); padding: 5px;');
                break;
            case 'code':
                element.setAttribute('style', (element.getAttribute('style') || '') + 'font-family: monospace; border-radius: 5px; font-size: 1em;');
                break;
        }

        if (element.classList.contains('katex-html')) {
            element.setAttribute('style', (element.getAttribute('style') || '') + 'display: inline-block;');
        }
    });

    return doc.body.innerHTML;
}


export async function renderText(text: string): Promise<string> {
    let renderedText = renderLatex(text);
    renderedText = await getMarked().parse(renderedText);
    return injectInlineStyles(renderedText);
}

/**
 * example usage
<script>
    import { renderText } from '$lib/renderer';
    
    let content = $state('');
    let renderedContent = $state('');
    $effect(() => {
        renderText(content).then((result) => {
            renderedContent = result;
        });
    });
</script>

<textarea name="input" id="input1" bind:value={content}></textarea>

{@html renderedContent}
 */