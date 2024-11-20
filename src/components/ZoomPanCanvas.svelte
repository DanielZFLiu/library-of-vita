<!-- A container that allows zoom and panning for things inside it -->
<script>
	import { onDestroy, onMount } from 'svelte';

	let isCtrlPressed = false;
	let scale = 1;
	let position = { x: 0, y: 0 };
	let isPanning = false;
	let startPoint = { x: 0, y: 0 };
	let panStart = { x: 0, y: 0 };

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	});

	function onKeyDown(event) {
		if (event.ctrlKey) {
			isCtrlPressed = true;
		}
	}

	function onKeyUp(event) {
		if (!event.ctrlKey) {
			isCtrlPressed = false;
		}
	}

	function onWheel(event) {
		if (isCtrlPressed) {
			event.preventDefault();
			const delta = event.deltaY < 0 ? 1.1 : 0.9;
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			const newScale = scale * delta;
			const scaleDiff = newScale / scale;
			position.x = (position.x - mouseX) * scaleDiff + mouseX;
			position.y = (position.y - mouseY) * scaleDiff + mouseY;
			scale = newScale;
		}
	}

	function onMouseDown(event) {
		if (event.button === 1) {
			event.preventDefault();
			isPanning = true;
			startPoint = { x: event.clientX, y: event.clientY };
			panStart = { x: position.x, y: position.y };
		}
	}

	function onMouseMove(event) {
		if (isPanning) {
			event.preventDefault();
			const dx = event.clientX - startPoint.x;
			const dy = event.clientY - startPoint.y;
			position.x = panStart.x + dx;
			position.y = panStart.y + dy;
		}
	}

	function onMouseUp(event) {
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

<div
	class="viewport {isPanning ? 'panning' : ''}"
	on:wheel={onWheel}
	on:mousedown={onMouseDown}
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
	on:mouseleave={onMouseLeave}
>
	<div class="content" style="transform: translate({position.x}px, {position.y}px) scale({scale})">
		<slot></slot>
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