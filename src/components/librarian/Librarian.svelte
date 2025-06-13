<script lang="ts">
	import { librarianData } from '$lib/LibrarianData.svelte';
	import type { Component } from 'svelte';
	const stances = Object.keys(librarianData) as Array<keyof typeof librarianData>;
	let currentStance: keyof typeof librarianData =
		stances[Math.floor(Math.random() * stances.length)];
	let stanceData = librarianData[currentStance];
</script>

<div class="librarian" style="left: {stanceData.left}px; bottom: {stanceData.bottom}px;">
	{#snippet stance(Comp: Component, width: number, height: number)}
		<Comp width={`${width}px`} height={`${height}px`}></Comp>
	{/snippet}

	{@render stance(stanceData.svg, stanceData.width, stanceData.height)}
</div>

<style>
	.librarian {
		position: absolute;
	}
</style>
