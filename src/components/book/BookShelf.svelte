<script lang="ts">
	let {
		data
	}: {
		data: {
			shelves: Array<shelf>;
			svg: string;
			width: number;
			height: number;
		};
	} = $props();

	interface shelf {
		x: number;
		y: number;
		width: number;
		height: number;
		rotation: number;
		flipped: boolean;
		books: Array<book>;
	}

	interface book {
		svg: string;
		width: number;
		height: number;
		link: URL;
	}

	function onBookClick(link: URL) {
		window.open(link, '_blank');
	}

	// Helper to compute the transform for a shelf if rotated/flipped
	function shelfTransform(shelf: shelf) {
		let transform = '';
		if (shelf.rotation) {
			transform += `rotate(${shelf.rotation}, ${shelf.x}, ${shelf.y}) `;
		}
		if (shelf.flipped) {
			const cx = shelf.x + shelf.width / 2;
			transform += `scale(-1,1) translate(-${2 * cx},0) `;
		}
		return transform.trim();
	}

	// Compute positions of books in a shelf
	// Books displayed side by side from left to right
	function getBookPositions(shelf: shelf) {
		let positions = [];
		let currentX = shelf.x;
		let currentY = shelf.y - shelf.height; // so that the bottom of the book aligns with shelf top line if desired
		// Adjust as needed. Here we assume the shelf.y is the top line and books stand on it.

		for (let book of shelf.books) {
			positions.push({
				book,
				x: currentX,
				y: currentY - (book.height - shelf.height) // position so bottom aligns on shelf
			});
			currentX += book.width + 2; // small gap between books
		}
		return positions;
	}
</script>

{#if data}
	<svg
		width="600"
		height="400"
		style="border:1px solid #ccc; background: url({data.svg}) no-repeat center/cover"
	>
		<!-- Render each shelf -->
		{#each data.shelves as shelf}
			<g transform={shelfTransform(shelf)}>
				<!-- The shelf rectangle -->
				<rect
					x={shelf.x}
					y={shelf.y}
					width={shelf.width}
					height={shelf.height}
					fill="rgba(165, 42, 42, 0.8)"
				/>

				<!-- Render books on shelf -->
				{#each getBookPositions(shelf) as { book, x, y }}
					<g on:click={() => onBookClick(book.link)} style="cursor: pointer;">
						<!-- The book spine as an image background -->
						<image href={book.svg} {x} {y} width={book.width} height={book.height} />
						<!-- Optionally, you could add text or title overlay if desired -->
					</g>
				{/each}
			</g>
		{/each}
	</svg>
{/if}
