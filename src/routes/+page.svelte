<script>
	import Parametric from '$components/animation/Parametric.svelte';
	import BookShelf from '$components/book/BookShelf.svelte';
	import ZoomPanCanvas from '$components/ZoomPanCanvas.svelte';
	import { cubicIn } from 'svelte/easing';
	import shelfData from '$lib/shelfData.json';
</script>

<!-- <ZoomPanCanvas>
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
</ZoomPanCanvas> -->
<ZoomPanCanvas>
	<BookShelf data={shelfData.projects}></BookShelf></ZoomPanCanvas
>
