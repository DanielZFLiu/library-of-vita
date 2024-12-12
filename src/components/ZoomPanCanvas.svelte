<!-- A container that allows zoom and panning for things inside it -->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	interface Point {
		x: number;
		y: number;
	}

	let {
		upperLimit = 10,
		lowerLimit = 0.5,
		content,
		position = $bindable(),
		scale = $bindable(),
		trigger = $bindable(),
		onPan = () => {},
		onZoom = () => {}
	}: {
		upperLimit?: number;
		lowerLimit?: number;
		content: Snippet;
		position: Point;
		scale: number;
		trigger?: boolean;
		onPan?: Function;
		onZoom?: Function
	} = $props();

	let isCtrlPressed: boolean = false;
	let isPanning: boolean = $state(false);
	let startPoint: Point = { x: 0, y: 0 };
	let panStart: Point = { x: 0, y: 0 };
	let canvas: HTMLDivElement;
	let lastTouchDist: number | null = null;
	let lastTouchCenter: Point | null = null;
	let isTouching: boolean = false;

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	});

	$effect(() => {
		if (trigger) {
			canvas.style.transition = 'transform 1s';
			console.log('triggered');
			setTimeout(() => {
				canvas.style.transition = 'none';
				trigger = false;
			}, 1000);
		}
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
		if (isCtrlPressed && !trigger) {
			event.preventDefault();
			onZoom();
			const delta = event.deltaY < 0 ? 1.1 : 0.9;
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			performZoom(delta, { x: mouseX, y: mouseY });
		}
	}

	function onMouseDown(event: MouseEvent) {
		// Middle mouse or right mouse drag
		if (event.button === 1 || event.button === 2) {
			event.preventDefault();
			onPan();
			isPanning = true;
			startPoint = { x: event.clientX, y: event.clientY };
			panStart = { x: position.x, y: position.y };
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (isPanning && !trigger) {
			event.preventDefault();
			const dx = event.clientX - startPoint.x;
			const dy = event.clientY - startPoint.y;
			position.x = panStart.x + dx;
			position.y = panStart.y + dy;
		}
	}

	function onMouseUp(event: MouseEvent) {
		if (event.button === 1 || event.button === 2) {
			event.preventDefault();
			isPanning = false;
		}
	}

	function onMouseLeave() {
		if (isPanning) {
			isPanning = false;
		}
	}

	// touch handlers
	function onTouchStart(event: TouchEvent) {
		isTouching = true;
		event.preventDefault();

		if (event.touches.length === 1) {
			// single touch: start panning
			const touch = event.touches[0];
			onPan();
			isPanning = true;
			startPoint = { x: touch.clientX, y: touch.clientY };
			panStart = { x: position.x, y: position.y };
		} else if (event.touches.length === 2) {
			// two fingers: start pinch-zoom
			lastTouchDist = getTouchDistance(event.touches);
			lastTouchCenter = getTouchCenter(event.touches);
			isPanning = false;
		}
	}

	function onTouchMove(event: TouchEvent) {
		event.preventDefault();

		if (!trigger) {
			if (event.touches.length === 1 && isPanning) {
				// pan
				const touch = event.touches[0];
				const dx = touch.clientX - startPoint.x;
				const dy = touch.clientY - startPoint.y;
				position.x = panStart.x + dx;
				position.y = panStart.y + dy;
			} else if (event.touches.length === 2 && lastTouchDist && lastTouchCenter) {
				// pinch-zoom
				const newDist = getTouchDistance(event.touches);
				const newCenter = getTouchCenter(event.touches);

				const delta = newDist / lastTouchDist;
				performZoom(delta, newCenter);

				// update reference points
				lastTouchDist = newDist;
				lastTouchCenter = newCenter;
			}
		}
	}

	function onTouchEnd(event: TouchEvent) {
		event.preventDefault();
		if (event.touches.length === 0) {
			// all touches ended
			isTouching = false;
			isPanning = false;
			lastTouchDist = null;
			lastTouchCenter = null;
		} else if (event.touches.length === 1) {
			// one finger left: switch to pan mode
			const touch = event.touches[0];
			startPoint = { x: touch.clientX, y: touch.clientY };
			panStart = { x: position.x, y: position.y };
			isPanning = true;
			lastTouchDist = null;
			lastTouchCenter = null;
		}
	}

	function onTouchCancel(event: TouchEvent) {
		event.preventDefault();
		isTouching = false;
		isPanning = false;
		lastTouchDist = null;
		lastTouchCenter = null;
	}

	// helper functions
	function getTouchDistance(touches: TouchList): number {
		const [t1, t2] = touches;
		const dx = t2.clientX - t1.clientX;
		const dy = t2.clientY - t1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function getTouchCenter(touches: TouchList): Point {
		const [t1, t2] = touches;
		return {
			x: (t1.clientX + t2.clientX) / 2,
			y: (t1.clientY + t2.clientY) / 2
		};
	}

	function performZoom(delta: number, center: Point) {
		onZoom();
		let newScale = scale * delta;
		if (newScale > upperLimit) {
			newScale = upperLimit;
		} else if (newScale < lowerLimit) {
			newScale = lowerLimit;
		}

		const scaleDiff = newScale / scale;
		position.x = (position.x - center.x) * scaleDiff + center.x;
		position.y = (position.y - center.y) * scaleDiff + center.y;
		scale = newScale;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="viewport {isPanning ? 'panning' : ''}"
	onwheel={onWheel}
	oncontextmenu={(e)=>{e.preventDefault()}}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseLeave}

	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
	ontouchcancel={onTouchCancel}
>
	<div
		bind:this={canvas}
		class="content"
		style="transform: translate({position.x}px, {position.y}px) scale({scale})"
	>
		{@render content()}
	</div>
</div>

<style>
	.viewport {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		touch-action: none;
	}

	.content {
		transform-origin: 0 0;
	}

	.panning {
		cursor: grabbing;
	}
</style>
