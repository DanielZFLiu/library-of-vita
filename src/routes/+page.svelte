<script>
	import Parametric from '$components/animation/Parametric.svelte';
	import BookShelf from '$components/book/BookShelf.svelte';
	import ZoomPanCanvas from '$components/ZoomPanCanvas.svelte';
	import { cubicIn } from 'svelte/easing';
	import shelfData from '$lib/shelfData.json';
	import Zooming from '$components/animation/Zooming.svelte';
</script>

<!-- 1: zooming -->
<!-- <Zooming>
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
			bgColor={'#FFFFF0'}
		/>
	{/snippet}
</Zooming> -->

<!-- 2: title animation -->
<!-- <Parametric
	animationName="radiantBook"
	paramStart={0}
	paramEnd={60}
	strokeWidth={0.02}
	bgColor={'var(--primary-bg)'}
	strokeColor={'var(--primary-contrast)'}
	width={'700px'}
	height={'600px'}
	resoluton={5000}
/> -->

<Parametric animationName="darkness" paramStart={0} paramEnd={111} strokeWidth={0.001} width={"100vw"} height={"100vh"} resoluton={8000} duration={6000} bgColor={"#1B1B1B"} strokeColor={"#FFFFF0"}/>

<!-- <ZoomPanCanvas>
	<BookShelf data={shelfData.projects}></BookShelf></ZoomPanCanvas
> -->

<style>
</style>
