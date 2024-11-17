<script lang="ts">
    /**
     * A simple framework that animates parametric equations
     * by gradually changing one parameter
     * 
     * Author: Daniel (DanielZFLiu)
     */

	import { tweened } from 'svelte/motion';
	import { cubicOut, linear, cubicInOut } from 'svelte/easing';
	import { generateData, generatePathData, flower, roseCurve } from '$lib/animation';
	import { onMount } from 'svelte';

	let {
		animationName,
        paramStart,
        paramEnd,
		duration = 6000,
		height = 500,
		width = 500,
		resoluton = 2000,
		strokeWidth = 0.01,
		strokeColor = 'black'
	} = $props();
	let metaData: {
		generator: (proportion: number, param: number) => { x: number; y: number };
		viewBox: string;
	} = $state(flower);
	let param = tweened(paramStart, { duration, easing: cubicInOut});
	let data: { x: number; y: number }[] = $state([]);
	let pathData: string = $state('');

	$effect(() => {
		switch (animationName) {
			case 'flower':
				metaData = flower;
				break;
			case 'roseCurve':
				metaData = roseCurve;
				break;
			default:
				metaData = flower;
		}
	});

	$effect(() => {
		data = generateData($param, metaData.generator, resoluton);
	});

	$effect(() => {
		pathData = generatePathData(data);
	});

    onMount(() => {
        param.set(paramEnd);
    });
</script>

<svg {width} {height} viewBox={metaData.viewBox} style="border: solid 1px red;">
	<path d={pathData} fill="none" stroke={strokeColor} stroke-width={strokeWidth} />
</svg>
