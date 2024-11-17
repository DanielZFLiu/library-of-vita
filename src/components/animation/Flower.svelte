<!-- 
    x = 8 * cos(t) - 6 * (cos(8 * t / 3))^20
    y = 8 * sin(t) - 6 * (sin(8 * t / 3))
-->

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let tControl = $state(0); // slider control
	const t = tweened(1, { duration: 1000, easing: cubicOut });

	let data: { x: number; y: number }[] = $state([]);
	let pathData: string = $state('');

	function generateData(tValue: number): { x: number; y: number }[] {
		const data = [];
		const numPoints = 2000; // adjust for smoother curves
		for (let i = 0; i <= numPoints; i++) {
			let t = (tValue * i) / numPoints;
			data.push({
				x: 8 * Math.cos(t) - 6 * Math.cos((8 * t) / 3),
				y: 8 * Math.sin(t) - 6 * Math.sin((8 * t) / 3)
			});
		}
		return data;
	}

	function generatePathData(data: { x: number; y: number }[]): string {
		// acc to accumulate the path data
		// M to move to the first point
		// L to draw t line to the next point
		return data.reduce((acc, point, index) => {
			const command = index === 0 ? 'M' : 'L';
			return `${acc} ${command} ${point.x},${point.y}`;
		}, '');
	}

	$effect(() => {
		t.set(tControl);
	});

	$effect(() => {
		data = generateData($t);
	});

	$effect(() => {
		console.log('ha');
		pathData = generatePathData(data);
	});
</script>

<input type="range" min="0" max={6 * Math.PI + 0.1} step="0.1" bind:value={tControl} />

<svg width="500" height="500" viewBox="-20 -20 50 50">
	<path d={pathData} fill="none" stroke="black" stroke-width="0.1" />
</svg>

<style>
	input {
		width: 100%;
		margin-bottom: 1rem;
	}
</style>
