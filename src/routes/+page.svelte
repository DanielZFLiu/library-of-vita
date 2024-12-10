<!-- todo
1. enable ability to jump ahead through animation [v]
2. add dark / light mode switch
3. add bookshelves 
-->

<script lang="ts">
	import Parametric from '$components/animation/Parametric.svelte';
	import BookShelf from '$components/book/BookShelf.svelte';
	import ZoomPanCanvas from '$components/ZoomPanCanvas.svelte';
	import { cubicIn } from 'svelte/easing';
	import { blur, fade, fly } from 'svelte/transition';
	import shelfData from '$lib/shelfData.json';
	import Zooming from '$components/animation/Zooming.svelte';
	import { onMount } from 'svelte';
	import Sun from '$components/svg/Sun.svelte';
	import Moon from '$components/svg/Moon.svelte';
	import LightDark from '$components/animation/LightDark.svelte';

	let animationStage = $state(0);
	let timeouts: number[] = [];
	let showSkipInstructions = $state(false);
	let lightMode = $state(false);
	let showDarknessAnimation = $state(false);

	// let position = $state({ x: 0, y: 0 });
	// let scale = $state(1);
	// let trigger = $state(false);

	onMount(() => {
		// setTimeout(() => {
		// 	scale = 5;
		// 	position = { x: 500, y: 500 };
		// 	trigger = true;
		// }, 3500);

		// check if the animation has been played before
		if (localStorage.getItem('playedAnimation') === 'true') {
			showSkipInstructions = true;
			setTimeout(() => {
				showSkipInstructions = false;
			}, 3500);
			window.addEventListener('keydown', skipAnimation);
		}

		// start the animation
		timeouts.push(
			setTimeout(() => {
				animationStage = 1;
			}, 4500)
		);
		timeouts.push(
			setTimeout(() => {
				animationStage = 2;
				window.addEventListener('wheel', finishInitialAnimation);
			}, 10000)
		);

		// check if its light mode
		if (localStorage.getItem('lightMode') === 'true') {
			lightMode = true;
		} else {
			lightMode = false;
		}
		document.documentElement.style.setProperty('color-scheme', lightMode ? 'light' : 'dark');
	});

	function finishInitialAnimation() {
		animationStage = 3;
		localStorage.setItem('playedAnimation', 'true');
		window.removeEventListener('wheel', finishInitialAnimation);
		window.removeEventListener('keydown', skipAnimation);
	}

	function skipAnimation(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			for (const timeout of timeouts) {
				clearTimeout(timeout);
			}
			showSkipInstructions = false;
			finishInitialAnimation();
		}
	}

	function switchLightMode() {
		lightMode = !lightMode;
		document.documentElement.style.setProperty('color-scheme', lightMode ? 'light' : 'dark');
		showDarknessAnimation = true;
		setTimeout(() => {
			showDarknessAnimation = false;
		}, 4500);
		localStorage.setItem('lightMode', lightMode ? 'true' : 'false');
	}
</script>

{#if showSkipInstructions}
	<div
		class="skip-instructions"
		in:blur={{ delay: 500, duration: 1000 }}
		out:blur={{ duration: 750 }}
	>
		<p>Press Enter to skip</p>
	</div>
{/if}

{#if animationStage == 0}
	<!-- animation stage 0: portal & zooming -->
	<div out:blur={{ duration: 500 }}>
		<Zooming>
			{#snippet content()}
				<Parametric
					animationName="portal"
					paramStart={0}
					paramEnd={2 * Math.PI + 1}
					strokeWidth={0.01}
					width={'100vw'}
					height={'100vh'}
					duration={3000}
					easing={cubicIn}
					bgColor={'var(--primary-bg)'}
					strokeColor={'var(--primary-contrast)'}
				/>
			{/snippet}
		</Zooming>
	</div>
{:else if animationStage == 1 || animationStage == 2}
	<!-- animation stage 1: title animation -->
	<div class="logo" out:fly={{ y: -40, duration: 1000 }}>
		<Parametric
			animationName="radiantBook"
			paramStart={0}
			paramEnd={60}
			strokeWidth={0.02}
			bgColor={'var(--primary-bg)'}
			strokeColor={'var(--primary-contrast)'}
			width={'50vw'}
			height={'40vw'}
			resoluton={5000}
			duration={4000}
		/>
	</div>

	<h1 class="title" out:fly={{ y: -40, duration: 1000 }}>Library of Vita</h1>
{/if}

<!-- animation stage 2: arrow -->
{#if animationStage == 2}
	<div class="arrow" out:fly={{ y: -40, duration: 500 }}>
		<span></span>
		<span></span>
		<span></span>
	</div>
{/if}

<!-- animation stage 3: show bookshelves and navbar -->
{#if animationStage == 3}
	<button class="theme-button" in:blur={{ delay: 500, duration: 500 }} onclick={switchLightMode}>
		{#if lightMode}
			<Moon></Moon>
		{:else}
			<Sun></Sun>
		{/if}
	</button>

	{#if showDarknessAnimation}
		<LightDark {lightMode}></LightDark>
	{/if}
{/if}

<!-- <div class="navbar"></div> -->

<!-- <ZoomPanCanvas bind:position bind:scale bind:trigger>
	{#snippet content()}
		<Parametric
			animationName="portal"
			paramStart={0}
			paramEnd={2 * Math.PI + 1}
			strokeWidth={0.01}
			width={'100vw'}
			height={'100vh'}
			duration={3000}
			easing={cubicIn}
			bgColor={'var(--primary-bg)'}
			strokeColor={'var(--primary-contrast)'}
		/>
	{/snippet}
</ZoomPanCanvas> -->

<style lang="scss">
	.skip-instructions {
		// position
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		// user interaction
		z-index: 1;
	}

	.logo {
		// position
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		// animation
		animation: fadeIn 1s forwards;
	}

	.title {
		// position
		position: absolute;
		top: 49%;
		left: 50%;
		transform: translate(-50%, -50%);

		// font
		font-size: 6.5vw;
		font-weight: 400;

		// inner
		opacity: 0;
		user-select: none;

		// animation
		animation: fadeIn 1s 4.2s forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.arrow {
		// position
		position: absolute;
		top: 77%;
		left: 50%;

		// shape
		transform: translate(-50%, -50%);
		transform: rotate(0deg);

		// user interaction
		cursor: pointer;
	}

	.arrow span {
		// shape
		display: block;
		width: 20px;
		height: 20px;
		border-bottom: 2px solid var(--primary-contrast);
		border-right: 2px solid var(--primary-contrast);
		border-bottom-right-radius: 3px;
		transform: rotate(45deg);

		// position
		margin: -10px;

		// animation
		animation: animate 2s forwards;
	}
	.arrow span:nth-child(2) {
		animation-delay: -0.2s;
	}

	.arrow span:nth-child(3) {
		animation-delay: -0.4s;
	}

	@keyframes animate {
		0% {
			opacity: 0;
			transform: rotate(45deg) translate(-20px, -20px);
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate(45deg) translate(20px, 20px);
		}
	}

	.theme-button {
		// position
		position: absolute;
		bottom: 12px;
		right: 15px;

		// user interaction
		cursor: pointer;
	}
</style>
