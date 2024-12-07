<!-- A container that allows zoom and panning for things inside it -->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	interface Point {
		x: number;
		y: number;
	}

	let {
		upperLimit = 5,
		lowerLimit = 0.5,
		content
	}: { upperLimit?: number; lowerLimit?: number; content: Snippet } = $props();

	let isCtrlPressed: boolean = false;
	let scale: number = $state(1);
	let position: Point = $state({ x: 0, y: 0 });
	let isPanning: boolean = $state(false);
	let startPoint: Point = { x: 0, y: 0 };
	let panStart: Point = { x: 0, y: 0 };

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	});

	function onKeyDown(event: KeyboardEvent) {
		if (event.ctrlKey) {
			isCtrlPressed = true;
		}
	}

	function onKeyUp(event: KeyboardEvent) {
		if (!event.ctrlKey) {
			isCtrlPressed = false;
		}
	}

	function onWheel(event: WheelEvent) {
		if (isCtrlPressed) {
			event.preventDefault();
			const delta = event.deltaY < 0 ? 1.1 : 0.9;
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			let newScale = scale * delta;

			if (newScale > upperLimit) {
				newScale = upperLimit;
			} else if (newScale < lowerLimit) {
				newScale = lowerLimit;
			}

			const scaleDiff = newScale / scale;
			position.x = (position.x - mouseX) * scaleDiff + mouseX;
			position.y = (position.y - mouseY) * scaleDiff + mouseY;
			scale = newScale;
		}
	}

	function onMouseDown(event: MouseEvent) {
		if (event.button === 1) {
			event.preventDefault();
			isPanning = true;
			startPoint = { x: event.clientX, y: event.clientY };
			panStart = { x: position.x, y: position.y };
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (isPanning) {
			event.preventDefault();
			const dx = event.clientX - startPoint.x;
			const dy = event.clientY - startPoint.y;
			position.x = panStart.x + dx;
			position.y = panStart.y + dy;
		}
	}

	function onMouseUp(event: MouseEvent) {
		if (event.button === 1) {
			event.preventDefault();
			isPanning = false;
		}
	}

	function onMouseLeave() {
		if (isPanning) {
			isPanning = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="viewport {isPanning ? 'panning' : ''}"
	onwheel={onWheel}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseLeave}
>
	<div class="content" style="transform: translate({position.x}px, {position.y}px) scale({scale})">
		{@render content()}
	</div>
</div>

<style>
	.viewport {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
	}

	.content {
		transform-origin: 0 0;
	}

	.panning {
		cursor: grabbing;
	}
</style>
