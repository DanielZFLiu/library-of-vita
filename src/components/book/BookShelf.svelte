<script lang="ts">
	import type { Component } from 'svelte';

	let { data, bookClick }: { data: bookshelf, bookClick: ()=>void } = $props();
	interface bookshelf {
		shelves: Array<shelf>;
		svg: Component;
		width: number;
		height: number;
	}

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
		svg: Component;
		width: number;
		height: number;
		link: string;
	}

	function onBookClick(link: string) {
		window.open(link, '_blank');
		console.log('Book clicked');
		bookClick();
	}

	const BookshelfBg = $derived(data.svg);
</script>

{#if data}
	<div class="bookshelf" style="width:{data.width}px; height:{data.height}px;">
		<!-- bookshelf background -->
		<div class="bookshelf-bg">
			<BookshelfBg width={data.width} height={data.height}></BookshelfBg>
		</div>

		<!-- Render each shelf -->
		{#each data.shelves as shelf}
			<div
				class="shelf"
				style="left: {shelf.x}px; 
					top: {shelf.y}px; 
					width: {shelf.width}px; 
					height:{shelf.height}px; 
					transform: rotate({shelf.rotation}deg) scaleX({shelf.flipped ? -1 : 1});"
			>
				{#each shelf.books as book}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						onclick={() => onBookClick(book.link)}
						class="bookspine"
						style="width: {book.width}px; height:{book.height}px; 
							transform: scaleX({shelf.flipped ? -1 : 1});"
						role="button"
						tabindex="0"
					>
						{#snippet spine(Comp: Component, width: number, height: number)}
							<Comp width={`${width}px`} height={`${height}px`}></Comp>
						{/snippet}

						{@render spine(book.svg, book.width, book.height)}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.bookshelf {
		position: relative;

		.bookshelf-bg {
			position: absolute;
			top: 0;
			left: 0;
		}

		.shelf {
			position: absolute;
			display: flex;
			align-items: flex-end;

			.bookspine {
				cursor: pointer;
			}
		}
	}
</style>
