/**
 * To allow reconstruction of free comments
 * - free comments: spacially free, ie user can freely decide the pos of the comment
 * (click anywhere on the page to add a comment)
 * - reconstruction: the spacial structure are preserved across different screen sizes
 * (i.e. in relation to text and position on screen)
 */

/**
 * Try to build a caret Range at (x, y).
 * Returns { range, node } when the node is a real-content text node, otherwise null.
 */
function getTextNodeAtPoint(x: number, y: number): { range: Range; node: Text } | null {
	// 1: resolve a caret range at (x, y)
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

	// 2: ensure we’re actually in a non-trivial text node
	let node: Node | null = range.startContainer;
	if (node.nodeType !== Node.TEXT_NODE) {
		node = node.firstChild; // to cover <span>text</span>
	}
	if (!node || node.nodeType !== Node.TEXT_NODE) return null;

	const text = (node as Text).data;

	// reject empty or all whitespace text nodes
	if (!/\S/.test(text)) return null;

	return { range, node: node as Text };
}

/**
 * Find the nearest text node to (startX, startY)
 * maxRadius is the furthest distance we are willing to look
 */
function findClosestTextNode(
	startX: number,
	startY: number,
	maxRadius = 100,
	step = 10
): { range: Range; node: Text } | null {
	if (maxRadius < 0) return null;

	// spiral search: (0,0), cardinal, diagonals, increasing radius
	for (let r = 0; r <= maxRadius; r += step) {
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
			if (hit) return hit; // stop at the first success
		}
	}
	return null;
}

let searchKeyWords: string[] = [];
let positions: { x: number; y: number; rect: DOMRect }[] = $state([]);
/**
 * attach a click listener that logs the 5 words nearest the click
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
