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
	import { shelfData } from '$lib/ShelfData.svelte';
	import Zooming from '$components/animation/Zooming.svelte';
	import { onMount } from 'svelte';
	import Sun from '$components/svg/themeButton/Sun.svelte';
	import Moon from '$components/svg/themeButton/Moon.svelte';
	import LightDark from '$components/animation/LightDark.svelte';
	import SofaChair from '$components/svg/SofaChair.svelte';

	let animationStage = $state(0);
	let timeouts: number[] = [];
	let showSkipInstructions = $state(false);
	let lightMode = $state(false);
	let showDarknessAnimation = $state(false);
	let navMode = $state('');
	let position = $state({ x: 0, y: 0 });
	let scale = $state(1);
	let trigger = $state(false);
	let panned = $state(false);
	let zoomed = $state(false);
	let navAnimationPlaying = $state(false);

	onMount(() => {
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
		}

		document.documentElement.style.setProperty('color-scheme', lightMode ? 'light' : 'dark');

		// check if need to show pan / zoom instructions
		if (localStorage.getItem('panned') === 'true') {
			panned = true;
		}

		if (localStorage.getItem('zoomed') === 'true') {
			zoomed = true;
		}
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
		}, 4300);
		localStorage.setItem('lightMode', lightMode ? 'true' : 'false');
	}

	function getElementPosition(id: string) {
		const element = document.getElementById(id);

		if (!element) {
			return null;
		}

		const rect = element.getBoundingClientRect();
		return {
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height
		};
	}

	function navbarClick(item: string) {
		// check if nav animation is playing
		if (navAnimationPlaying) return;
		navAnimationPlaying = true;
		setTimeout(() => {
			navAnimationPlaying = false;
		}, 2050);

		// set highlighted item
		navMode = item;

		function goToItem(chosenItem: string) {
			const pos = getElementPosition(chosenItem);
			if (!pos) return;

			// element center
			const elementCenterX = pos.left + pos.width / 2;
			const elementCenterY = pos.top + pos.height / 2;

			// viewport center
			const viewportCenterX = window.innerWidth / 2;
			const viewportCenterY = window.innerHeight / 2;

			// desired scale
			scale = 1.5;

			// reposition so the chosen element ends up at the center
			position = {
				x: viewportCenterX - elementCenterX * scale,
				y: viewportCenterY - elementCenterY * scale
			};

			trigger = true;
		}

		// check if we are already centered
		const isCentered = scale === 1 && position.x === 0 && position.y === 0;
		if (!isCentered) {
			// return to the center of the viewport
			scale = 1;
			position = { x: 0, y: 0 };
			trigger = true;

			// wait before triggering the next animation
			setTimeout(() => {
				goToItem(item);
			}, 1050);
		} else {
			// already centered, go directly
			goToItem(item);
		}
	}

	function onPan() {
		panned = true;
		localStorage.setItem('panned', 'true');
	}

	function onZoom() {
		zoomed = true;
		localStorage.setItem('zoomed', 'true');
	}
</script>

<!-- skip animation instructions -->
{#if showSkipInstructions}
	<div
		class="skip-instructions"
		in:blur={{ delay: 500, duration: 1000 }}
		out:blur={{ duration: 750 }}
	>
		<p>Press Enter to Skip</p>
	</div>
{/if}

<!-- animation stage 0: portal & zooming -->
{#if animationStage == 0}
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

	<!-- animation stage 1: title animation -->
{:else if animationStage == 1 || animationStage == 2}
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
{#snippet navButton(name: string)}
	<button
		onclick={() => {
			navbarClick(name);
		}}
		style="text-decoration: {navMode === name ? 'underline' : 'none'};"
	>
		{name}
	</button>
{/snippet}

{#if animationStage == 3}
	{#if showDarknessAnimation}
		<LightDark {lightMode}></LightDark>
	{/if}

	<div class="zoom-pan-container">
		<div class="canvas-instructions" in:blur={{ delay: 500, duration: 500 }}>
			{#if !panned}
				<div class="pan-instruction" out:blur={{ duration: 500 }}>
					(Press scroll key or right click) & drag to pan.
				</div>
			{/if}
			<br />
			{#if !zoomed}
				<div class="zoom-instruction" out:blur={{ duration: 500 }}>Ctrl + scroll to zoom.</div>
			{/if}
		</div>

		<ZoomPanCanvas bind:position bind:scale bind:trigger {onPan} {onZoom}>
			{#snippet content()}
				<div class="bookshelves-container" in:blur={{ delay: 500, duration: 500 }}>
					<div class="writings" id="Writings">
						<BookShelf data={shelfData['Writings']}></BookShelf>
					</div>

					<div class="chair-cover1 chair-cover"></div>

					<div class="chair">
						<SofaChair></SofaChair>
					</div>

					<div class="chair-cover2 chair-cover"></div>

					<div class="projects" id="Projects">
						<BookShelf data={shelfData['Projects']}></BookShelf>
					</div>
				</div>
			{/snippet}
		</ZoomPanCanvas>

		<button class="theme-button" in:blur={{ delay: 500, duration: 500 }} onclick={switchLightMode}>
			{#if lightMode}
				<Moon></Moon>
			{:else}
				<Sun></Sun>
			{/if}
		</button>

		<div class="navbar" in:blur={{ delay: 500, duration: 500 }}>
			{@render navButton('Writings')}

			<pre> | </pre>

			{@render navButton('Projects')}
		</div>
	</div>
{/if}

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

	.navbar {
		// position
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, 0%);

		// inner
		display: flex;

		// font
		font-size: 18px;

		// user interaction
		user-select: none;

		button {
			cursor: pointer;
		}
	}

	.zoom-pan-container {
		width: 100vw;
		height: 100vh;

		.canvas-instructions {
			// position
			position: absolute;
			top: calc((95vh - 800px) / 2 + 100px);
			left: 50%;
			transform: translate(-50%, 0%);

			// shape
			width: 470px;

			// font
			font-size: 20px;

			// user interaction
			z-index: -1;
			user-select: none;

			.pan-instruction {
				// position
				position: absolute;
				top: 0px;
				left: 0px;

				// shape
				width: 100%;

				// inner
				text-align: center;
			}

			.zoom-instruction {
				// position
				position: absolute;
				top: 30px;
				left: 0px;

				// shape
				width: 100%;

				// inner
				text-align: center;
			}
		}

		.bookshelves-container {
			// position
			position: relative;
			margin: calc((95vh - 800px) / 2) auto;

			// shape
			width: 1400px;
			height: 800px;

			.writings {
				position: absolute;
				left: 78px;
				bottom: 20px;
			}

			.chair-cover {
				// shape
				width: 120px;
				height: 10px;

				// inner
				background-color: var(--primary-bg);

				// animation
				transition: background-color 1s;

				// user interaction
				z-index: 1;
			}

			.chair-cover1 {
				// position
				position: absolute;
				left: 499px;
				bottom: 125px;
			}

			.chair-cover2 {
				// position
				position: absolute;
				left: 783px;
				bottom: 125px;
			}

			.chair {
				position: absolute;
				left: 529px;
				bottom: 122px;
			}

			.projects {
				position: absolute;
				right: 202px;
				bottom: 79px;
			}
		}
	}
</style>
