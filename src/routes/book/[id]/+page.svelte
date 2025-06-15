<script lang="ts">
	import { renderText } from '$lib/renderer';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	let comments: {
		id: string;
		nearestWords: string[];
		nearestWordsOffset: number[];
		absoluteCoord: number[];
	}[] = [];

	// Render markdown
	let content = $state('');
	let renderedContent = $state('');
	$effect(() => {
		renderText(content).then((result) => {
			renderedContent = result;
		});
	});

	onMount(async () => {
		// set light mode
		if (localStorage.getItem('lightMode') === 'true') {
			document.documentElement.style.setProperty('color-scheme', 'light');
		} else {
			document.documentElement.style.setProperty('color-scheme', 'dark');
		}

		// Fetch markdown content
		try {
			const res = await fetch(`/essays/${page.params.id}.md`);
			if (!res.ok) {
				throw new Error(`Failed to fetch: ${res.statusText}`);
			}
			content = await res.text();
		} catch (error) {
			console.error('Error fetching markdown:', error);
			content = 'Error loading content.';
		}

		// document.addEventListener('click', (e) => {
		// 	const xVW = ((e.clientX / window.innerWidth) * 100).toFixed(2);

		// 	var body = document.body,
		// 		html = document.documentElement;

		// 	var height = Math.max(
		// 		body.scrollHeight,
		// 		body.offsetHeight,
		// 		html.clientHeight,
		// 		html.scrollHeight,
		// 		html.offsetHeight
		// 	);
		// 	const yVH = ((e.pageY / height) * 100).toFixed(2);

		// 	console.log(`Clicked at: ${xVW}vw, ${yVH}vh`);
		// });
		// enableWordLogging();
	});

	/**
	 * Try to build a caret Range at (x, y).
	 * Returns { range, node } when the node is a real-content TEXT_NODE, otherwise null.
	 */
	function getTextNodeAtPoint(x: number, y: number): { range: Range; node: Text } | null {
		// — Step 1 — resolve a caret range at (x, y)
		let range: Range | null = null;

		if (document.caretPositionFromPoint) {
			const pos = document.caretPositionFromPoint(x, y);
			if (pos) {
				range = document.createRange();
				range.setStart(pos.offsetNode, pos.offset);
				range.collapse(true);
			}
		} else if (document.caretRangeFromPoint) {
			range = document.caretRangeFromPoint(x, y);
		}
		if (!range) return null; // no caret → bail

		// — Step 2 — ensure we’re actually in a *non-trivial* text node
		let node: Node | null = range.startContainer;
		if (node.nodeType !== Node.TEXT_NODE) {
			node = node.firstChild; // dive one level (covers <span>text</span>)
		}
		if (!node || node.nodeType !== Node.TEXT_NODE) return null;

		const text = (node as Text).data;
		// Reject empty or all-whitespace text nodes (spaces, tabs, newlines, NBSP, etc.)
		if (!/\S/.test(text)) return null;

		return { range, node: node as Text };
	}

	/**
	 * Find the nearest text node to (startX, startY) where the above tests succeed.
	 * maxRadius is the furthest distance (in px) we’re willing to look.
	 */
	function findClosestTextNode(
		startX: number,
		startY: number,
		maxRadius = 100,
		step = 10
	): { range: Range; node: Text } | null {
		if (maxRadius < 0) return null;

		// simple spiral search: (0,0), cardinal, diagonals, increasing radius
		for (let r = 0; r <= maxRadius; r += step) {
			// test 8 directions at this radius
			const offsets: [number, number][] = [
				[0, 0],
				[r, 0],
				[-r, 0],
				[0, r],
				[0, -r],
				[r, r],
				[r, -r],
				[-r, r],
				[-r, -r]
			];

			for (const [dx, dy] of offsets) {
				const hit = getTextNodeAtPoint(startX + dx, startY + dy);
				if (hit) return hit; // stop at the first success (closest point)
			}
		}
		return null;
	}

	let searchKeyWords: string[] = [];
	let positions: { x: number; y: number; rect: DOMRect }[] = $state([]);
	/**
	 * Attach a click-listener that logs the 5 words nearest the click.
	 * Pass the element that contains your rendered text (e.g. the preview pane).
	 */
	function enableWordLogging(): void {
		document.addEventListener('click', (ev: MouseEvent) => {
			const { clientX, clientY } = ev;

			const hit = findClosestTextNode(clientX, clientY, window.innerWidth / 2, 10);
			if (!hit) return;

			const { node, range } = hit;
			const text = node.data; // same as textContent on Text nodes
			const offset = range.startOffset;

			/* ------------------------------------------------------------------
			 * 3. Tokenise the whole text node into words with their positions
			 * ------------------------------------------------------------------ */
			const wordRe = /\w+/g; // tweak to include hyphens, etc.
			const words: { word: string; start: number; end: number }[] = [];

			for (let m; (m = wordRe.exec(text)) !== null; ) {
				words.push({ word: m[0], start: m.index, end: m.index + m[0].length });
			}
			if (!words.length) return;

			/* ------------------------------------------------------------------
			 * 4. Find which word the caret is in (or nearest to)
			 * ------------------------------------------------------------------ */
			let idx = words.findIndex((w) => offset >= w.start && offset <= w.end);

			if (idx === -1) {
				// Caret is between words: pick the next word to the right,
				// or the last word if we’re past the end.
				idx = words.findIndex((w) => offset < w.start);
				if (idx === -1) idx = words.length - 1;
			}

			/* ------------------------------------------------------------------
			 * 5. Slice out up to 5 words centred on that index
			 *    (clicked word ± 2 neighbours)
			 * ------------------------------------------------------------------ */
			const MAX = 5;
			const half = Math.floor(MAX / 2); // 2
			let startIdx = Math.max(0, idx - half);
			let endIdx = Math.min(words.length, startIdx + MAX);

			// If we hit the right edge and have < MAX words,
			// shift the window left so we always return up to 5.
			if (endIdx - startIdx < MAX) {
				startIdx = Math.max(0, endIdx - MAX);
			}

			searchKeyWords = words.slice(startIdx, endIdx).map((w) => w.word);
			console.log(searchKeyWords);

			positions = findWordSequencePositions(document.getElementById('page'), searchKeyWords);
			console.log(positions);
		});
	}

	/**
	 * Find every on-screen position where a contiguous sequence of words appears.
	 *
	 * @param container root element to start searhcing in
	 * @param seq       word sequence to look for
	 * @param caseInsensitive (optional) default = true
	 * @returns Array of { x, y, rect } – one entry per match
	 */
	function findWordSequencePositions(
		container: HTMLElement,
		seq: string[],
		caseInsensitive = true
	): { x: number; y: number; rect: DOMRect }[] {
		if (!seq.length) return [];

		// Pre-process the target sequence once
		const target = caseInsensitive ? seq.map((w) => w.toLowerCase()) : seq;

		// Collect word tokens across all text nodes
		type Token = { word: string; node: Text; start: number; end: number };
		const tokens: Token[] = [];
		const wordRe = /\w+/g;
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

		while (walker.nextNode()) {
			const node = walker.currentNode as Text;
			const text = node.textContent ?? '';
			let m: RegExpExecArray | null;
			while ((m = wordRe.exec(text)) !== null) {
				tokens.push({
					word: caseInsensitive ? m[0].toLowerCase() : m[0],
					node,
					start: m.index,
					end: m.index + m[0].length
				});
			}
		}

		// Slide a window of seq.length over the token stream
		const hits: { x: number; y: number; rect: DOMRect }[] = [];
		for (let i = 0; i <= tokens.length - target.length; i++) {
			let ok = true;
			for (let j = 0; j < target.length; j++) {
				if (tokens[i + j].word !== target[j]) {
					ok = false;
					break;
				}
			}
			if (!ok) continue;

			// Build a range that span the middle word in the hit
			const middle = tokens[Math.floor(i + (target.length - 1) / 2)];
			const range = document.createRange();
			range.setStart(middle.node, middle.start);
			range.setEnd(middle.node, middle.end);

			const rect = range.getBoundingClientRect();
			const cRect = container.getBoundingClientRect();

			const relX = rect.left + rect.width / 2 - cRect.left;
			const relY = rect.top - cRect.top + container.scrollTop;

			hits.push({ x: relX, y: relY, rect });
		}

		return hits;
	}
</script>

<div class="page" id="page">
	<!-- <div
		style:position="absolute"
		style:border="solid 1px red"
		style:border-radius="50%"
		style:width="10px"
		style:height="10px"
		style:left="{positions[0]?.x ?? 0}px"
		style:top="{positions[0]?.y ?? 0}px"
	></div> -->
	{@html renderedContent}
</div>

<style>
	.page {
		/* shape */
		width: 80vw;
		height: calc(100vh - 10vw);

		/* inner */
		padding-top: 5vw;
		padding-bottom: 5vw;
		overflow: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;

		/* position */
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.page::-webkit-scrollbar {
		display: none;
	}
</style>
