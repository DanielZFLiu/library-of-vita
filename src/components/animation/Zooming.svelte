<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	let {
		delayInSeconds = 3,
		zoomScale = 10,
		durationInSeconds = 2,
		content
	}: {
		delayInSeconds?: number;
		zoomScale?: number;
		durationInSeconds?: number;
		content: Snippet;
	} = $props();

	let scale = tweened(1, {
		duration: durationInSeconds * 1000,
		easing: cubicInOut
	});

	let timer: number;

	onMount(() => {
		timer = setTimeout(() => {
			scale.set(zoomScale);
		}, delayInSeconds * 1000);
	});

	onDestroy(() => {
		clearTimeout(timer);
	});
</script>

<div class="container" style="transform: scale({$scale});">
	{@render content()}
</div>

<style>
	.container {
		display: inline-block;
		transform-origin: center center;
	}
</style>
