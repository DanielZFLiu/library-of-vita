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
		link: string;
	}

	function onBookClick(link: string) {
		window.open(link, '_blank');
	}
</script>

{#if data}
	<div class="bookshelf" style="width:{data.width}px; height:{data.height}px;">
		<img
			class="bookshelf-bg"
			src={data.svg}
			style="width:{data.width}px; height:{data.height}px;"
			alt="Bookshelf"
		/>

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
						<img
							src={book.svg}
							style="width: {book.width}px; height:{book.height}px;"
							alt="Book Spine"
						/>
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.bookshelf {
		position: relative;
		border: solid 1px red;

		.bookshelf-bg {
			position: absolute;
			top: 0;
			left: 0;
		}

		.shelf {
			position: absolute;
			border: solid 1px green;
			display: flex;
			align-items: flex-end;

			.bookspine {
				cursor: pointer;
				border: solid 1px red;
			}
		}
	}
</style>
