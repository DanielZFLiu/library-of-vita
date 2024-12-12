/**
 * Text (plaintext | markdown | latex) to HTML
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
    return new Marked(
        markedHighlight({
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        })
    ).use(markedFootnote({
        prefixId: `footnote-${uuidv4()}`
    }));
}

// ==============================
// Additional Styling
// ==============================
function injectInlineStyles(html: string): string {
    const styles = {
        'table': 'border: 1px solid var(--primary-contrast); border-collapse: collapse;',
        'tr': 'border: 1px solid var(--primary-contrast);',
        'th, td': 'border: 1px solid var(--primary-contrast); padding: 5px;',
        'code': 'font-family: monospace; border-radius: 5px; font-size: 1em;',
        '.katex-html': 'display: inline-block'
    };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    Object.entries(styles).forEach(([selector, style]) => {
        doc.querySelectorAll(selector).forEach(element => {
            // @ts-ignore
            element.style.cssText += style;
        });
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