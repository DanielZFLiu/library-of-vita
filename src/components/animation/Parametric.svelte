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
		height?: string;
		width?: string;
		resoluton?: number;
		strokeWidth?: number;
		strokeColor?: string;
		fill?: string;
		bgColor?: string;
	}

	let {
		animationName,
        paramStart,
        paramEnd,
		easing = cubicInOut,
		duration = 6000,
		height = "500",
		width = "500",
		resoluton = 2000,
		strokeWidth = 0.01,
		strokeColor = 'black',
		fill = "none",
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

<svg {width} {height} viewBox={metaData.viewBox} style="background-color: {bgColor};">
	<path d={pathData} {fill} stroke={strokeColor} stroke-width={strokeWidth} />
</svg>

<style>
</style>

<!-- Example Use -->
<!-- <Parametric animationName="flower" paramStart={0} paramEnd={6 * Math.PI + 0.1} strokeWidth={0.1} /> -->
<!-- <Parametric animationName="roseCurve" paramStart={0} paramEnd={10} width={1000} height={1000} strokeWidth={0.01} duration={4000}/> -->
<!-- <Parametric animationName="butterfly" paramStart={0} paramEnd={40} strokeWidth={0.02} /> -->
<!-- <Parametric animationName="portal" paramStart={0} paramEnd={2 * Math.PI + 1} strokeWidth={0.01} width={"100vw"} height={"100vh"} duration={3000} easing={cubicIn} bgColor={"#FFFFF0"}/> -->
<!-- <Parametric animationName="donut" paramStart={0} paramEnd={160} strokeWidth={0.01} /> -->
<!-- <Parametric animationName="darkness" paramStart={0} paramEnd={111} strokeWidth={0.001} width={"100vw"} height={"100vh"} resoluton={8000} duration={6000} bgColor={"#1B1B1B"} strokeColor={"#FFFFF0"}/> -->
<!-- <Parametric animationName="radiantBook" paramStart={0} paramEnd={60} strokeWidth={0.02} bgColor={"#1B1B1B"} strokeColor={"#FFFFF0"}/> -->