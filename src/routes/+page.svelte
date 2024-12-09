<script>
	import Parametric from '$components/animation/Parametric.svelte';
	import BookShelf from '$components/book/BookShelf.svelte';
	import ZoomPanCanvas from '$components/ZoomPanCanvas.svelte';
	import { cubicIn } from 'svelte/easing';
	import { blur, fade } from 'svelte/transition';
	import shelfData from '$lib/shelfData.json';
	import Zooming from '$components/animation/Zooming.svelte';
	import { onMount } from 'svelte';

	let animationStage = 0;

	// let position = $state({ x: 0, y: 0 });
	// let scale = $state(1);
	// let trigger = $state(false);

	onMount(() => {
		// setTimeout(() => {
		// 	scale = 5;
		// 	position = { x: 500, y: 500 };
		// 	trigger = true;
		// }, 3500);
		setTimeout(() => {
			animationStage = 1;
		}, 4500);

		setTimeout(() => {
			animationStage = 2;
		}, 10000);

		// setTimeout(() => {
		// 	animationStage = 3;
		// }, 12000);
	});
</script>

<!-- 1: zooming -->
{#if animationStage == 0}
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
{:else if animationStage >= 1 && animationStage < 3}
	<!-- 2: title animation -->
	<div class="logo" out:blur={{duration: 1000}}>
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

	<h1 class="title" out:blur={{duration: 1000}}>Library of Vita</h1>
{/if}

<!-- 3: arrow -->

{#if animationStage >= 2}
	<div class="arrow">
		<span></span>
		<span></span>
		<span></span>
	</div>
{/if}

<!-- <div class="navbar"></div> -->
<!-- <Parametric
	animationName="triangle"
	paramStart={0}
	paramEnd={Math.PI}
	strokeWidth={0.05}
	width={'10vw'}
	height={'10vw'}
	duration={1000}
	easing={cubicIn}
	bgColor={'var(--primary-bg)'}
	strokeColor={'var(--primary-contrast)'}
/> -->

<!-- <Parametric animationName="darkness" paramStart={0} paramEnd={111} strokeWidth={0.001} width={"100vw"} height={"100vh"} resoluton={8000} duration={6000} bgColor={"#1B1B1B"} strokeColor={"#FFFFF0"}/> -->

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
	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
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
		position: absolute;
		top: 77%;
		left: 50%;
		transform: translate(-50%, -50%);
		transform: rotate(0deg);
		cursor: pointer;
	}

	.arrow span {
		display: block;
		width: 20px;
		height: 20px;
		border-bottom: 2px solid var(--primary-contrast);
		border-right: 2px solid var(--primary-contrast);
		border-bottom-right-radius: 3px;
		transform: rotate(45deg);
		margin: -10px;
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
</style>
