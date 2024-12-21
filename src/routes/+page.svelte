<!-- 
TODO
1. create blog page
2. responsiveness update
3. update readme [v]
4. add instruction to click on books 
5. check in google search console for seo
-->
<script lang="ts">
	import Parametric from '$components/animation/Parametric.svelte';
	import BookShelf from '$components/book/BookShelf.svelte';
	import ZoomPanCanvas from '$components/ZoomPanCanvas.svelte';
	import { cubicIn } from 'svelte/easing';
	import { blur, fly } from 'svelte/transition';
	import { shelfData } from '$lib/ShelfData.svelte';
	import Zooming from '$components/animation/Zooming.svelte';
	import { onMount } from 'svelte';
	import Sun from '$components/svg/themeButton/Sun.svelte';
	import Moon from '$components/svg/themeButton/Moon.svelte';
	import LightDark from '$components/animation/LightDark.svelte';
	import SofaChair from '$components/svg/SofaChair.svelte';
	import '$lib/mainPage.scss';

	// animation
	let animationStage = $state(0);
	let timeouts: number[] = [];
	let lightMode = $state(false);
	let showDarknessAnimation = $state(false);
	let logoWidth = $state('50vw');
	let logoHeight = $state('40vw');

	// instructions
	let showSkipInstructions = $state(false);
	let bookClicked = $state(false);
	let panned = $state(false);
	let zoomed = $state(false);
	let skipAnimationInstruction = $state('Press Enter to Skip');
	let panInstruction = $state('(Press scroll key or right click) + drag to pan.');
	let zoomInstruction = $state('Ctrl + scroll to zoom.');
	let bookInstruction = $state('Click on a book to open it.');

	// navbar
	let navMode = $state('');
	let position = $state({ x: 0, y: 0 });
	let scale = $state(1);
	let trigger = $state(false);
	let navAnimationPlaying = $state(false);
	let desiredScale = $state(1.5);

	// viewport
	let viewportWidth = $state(0);
	let viewportHeight = 0;
	let isTouchScreen = false;

	onMount(() => {
		// animation
		playAnimation();

		// detect colour scheme
		document.documentElement.style.setProperty('color-scheme', lightMode ? 'light' : 'dark');

		// check if need to show pan / zoom instructions
		if (localStorage.getItem('panned') === 'true') {
			panned = true;
		}

		if (localStorage.getItem('zoomed') === 'true') {
			zoomed = true;
		}

		if (localStorage.getItem('bookClicked') === 'true') {
			bookClicked = true;
		}

		// viewport detection
		viewportDetection();

		// cleanup when component is destroyed
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	});

	// #region animation

	function playAnimation() {
		// check if the animation has been played before
		if (localStorage.getItem('playedAnimation') === 'true') {
			showSkipInstructions = true;
			setTimeout(() => {
				showSkipInstructions = false;
			}, 3500);
			window.addEventListener('keydown', skipAnimation);
			window.addEventListener('touchstart', skipAnimation);
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
				window.addEventListener('touchmove', finishInitialAnimation);
			}, 10000)
		);

		// check if its light mode
		if (localStorage.getItem('lightMode') === 'true') {
			lightMode = true;
		}
	}

	function finishInitialAnimation() {
		animationStage = 3;
		localStorage.setItem('playedAnimation', 'true');
		window.removeEventListener('wheel', finishInitialAnimation);
		window.removeEventListener('touchmove', finishInitialAnimation);
		window.removeEventListener('keydown', skipAnimation);
		window.removeEventListener('touchstart', skipAnimation);
	}

	function skipAnimation(event: KeyboardEvent | TouchEvent) {
		if ((event instanceof KeyboardEvent && event.key === 'Enter') || event instanceof TouchEvent) {
			for (const timeout of timeouts) {
				clearTimeout(timeout);
			}
			showSkipInstructions = false;
			finishInitialAnimation();

			if (viewportWidth < 768) {
				setTimeout(() => {
					navbarClick('Writings');
				}, 1000);
			}
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

	// #endregion

	// #region instructions
	function onPan() {
		panned = true;
		localStorage.setItem('panned', 'true');
	}

	function onZoom() {
		zoomed = true;
		localStorage.setItem('zoomed', 'true');
	}

	function onBookClick() {
		bookClicked = true;
		localStorage.setItem('bookClicked', 'true');
	}
	// #endregion

	// #region navbar
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

			// set desired scale
			scale = desiredScale;

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
	// #endregion

	// #region viewport

	// update viewport size
	function updateSize() {
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;

		if (viewportWidth < 768) {
			logoWidth = '80vw';
			logoHeight = '64vw';
			skipAnimationInstruction = 'Tap to Skip';
			panInstruction = 'Drag to pan.';
			zoomInstruction = 'Pinch to zoom.';
			desiredScale = 1;
		} else {
			logoWidth = '50vw';
			logoHeight = '40vw';
			skipAnimationInstruction = 'Press Enter to Skip';
			panInstruction = '(Press scroll key or right click) + drag to pan.';
			zoomInstruction = 'Ctrl + scroll to zoom.';
			desiredScale = 1.5;
		}
	}

	function viewportDetection() {
		// init size
		updateSize();

		// listen for resize events
		window.addEventListener('resize', updateSize);

		// detect touch capability
		if ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) {
			isTouchScreen = true;
			skipAnimationInstruction = 'Tap to Skip';
			panInstruction = 'Drag to pan.';
			zoomInstruction = 'Pinch to zoom.';
		} else {
			isTouchScreen = false;
		}
	}

	// #endregion
</script>

<!-- skip animation instructions -->
{#if showSkipInstructions}
	<div
		class="skip-instructions"
		in:blur={{ delay: 500, duration: 1000 }}
		out:blur={{ duration: 750 }}
	>
		{skipAnimationInstruction}
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
			width={logoWidth}
			height={logoHeight}
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
		<LightDark {lightMode} {viewportWidth}></LightDark>
	{/if}

	<div class="zoom-pan-container">
		<div class="canvas-instructions" in:blur={{ delay: 500, duration: 500 }}>
			{#if !panned}
				<div class="pan-instruction" out:blur={{ duration: 500 }}>
					{panInstruction}
				</div>
			{/if}
			<br />
			{#if !zoomed}
				<div class="zoom-instruction" out:blur={{ duration: 500 }}>
					{zoomInstruction}
				</div>
			{/if}
			<br />
			{#if !bookClicked}
				<div class="book-instruction" out:blur={{ duration: 500 }}>
					{bookInstruction}
				</div>
			{/if}
		</div>

		<ZoomPanCanvas bind:position bind:scale bind:trigger {onPan} {onZoom}>
			{#snippet content()}
				<div class="bookshelves-container" in:blur={{ delay: 500, duration: 500 }}>
					<div class="writings" id="Writings">
						<BookShelf data={shelfData['Writings']} bookClick={onBookClick}></BookShelf>
					</div>

					<div class="chair-cover1 chair-cover"></div>

					<div class="chair">
						<SofaChair></SofaChair>
					</div>

					<div class="chair-cover2 chair-cover"></div>

					<div class="projects" id="Projects">
						<BookShelf data={shelfData['Projects']} bookClick={onBookClick}></BookShelf>
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
