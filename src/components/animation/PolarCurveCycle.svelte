<!-- 
Animation of r = sin((a/5) * theta) 
-->

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let aControl = $state(1); // slider control
	const a = tweened(1, { duration: 1000, easing: cubicOut });

	let data: {x: number, y: number}[] = $state([]);
	let pathData: string = $state('');

	function generateData(aValue: number): { x: number; y: number }[] {
		const data = [];
		const numPoints = 2000; // adjust for smoother curves
		for (let i = 0; i <= numPoints; i++) {
			let theta = (i / numPoints) * 2 * Math.PI;
			let r = Math.sin((aValue / 5) * theta);
			data.push({
				x: r * Math.cos(theta), // polar to cartesian conversion
				y: r * Math.sin(theta)
			});
		}
		return data;
	}

	function generatePathData(data: { x: number; y: number }[]): string {
		// acc to accumulate the path data
		// M to move to the first point
		// L to draw a line to the next point
		return data.reduce((acc, point, index) => {
			const command = index === 0 ? 'M' : 'L';
			return `${acc} ${command} ${point.x},${point.y}`;
		}, '');
	}

	$effect(() => {
		a.set(aControl);
	});

	$effect(() => {
		data = generateData($a);
	});

	$effect(() => {
		pathData = generatePathData(data);
	});
</script>

<input type="range" min="1" max="40" step="0.1" bind:value={aControl} />

<svg width="1000" height="1000" viewBox="-2 -2 4 4">
	<path d={pathData} fill="none" stroke="black" stroke-width="0.01" />
</svg>

<style>
	input {
		width: 100%;
		margin-bottom: 1rem;
	}
</style>
