<!-- 
A simple framework that animate parametric equations by gradually changing one parameter
     
Author: Daniel (DanielZFLiu)
-->
<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { generateData, generatePathData, animationMetadata } from '$lib/animation';
	import { onMount } from 'svelte';

	interface Props {
		animationName: keyof typeof animationMetadata;
		paramStart: number;
		paramEnd: number;
		easing?: (t: number) => number;
		duration?: number;
		height?: number;
		width?: number;
		resoluton?: number;
		strokeWidth?: number;
		strokeColor?: string;
		bgColor?: string;
	}

	let {
		animationName,
        paramStart,
        paramEnd,
		easing = cubicInOut,
		duration = 6000,
		height = 500,
		width = 500,
		resoluton = 2000,
		strokeWidth = 0.01,
		strokeColor = 'black',
		bgColor = "none"
	}: Props = $props();

	let metaData: {
		generator: (proportion: number, param: number) => { x: number; y: number };
		viewBox: string;
	} = $state(animationMetadata.flower);

	let param = tweened(paramStart, { duration, easing });
	let data: { x: number; y: number }[] = $state([]);
	let pathData: string = $state('');

	$effect(() => {
		metaData = animationMetadata[animationName];
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

<svg {width} {height} viewBox={metaData.viewBox}>
	<path d={pathData} fill={bgColor} stroke={strokeColor} stroke-width={strokeWidth} />
</svg>
