<script lang="ts">
	import { onMount } from 'svelte';
	import Parametric from './Parametric.svelte';

	let { lightMode = false, viewportWidth }: { lightMode?: boolean; viewportWidth: number } =
		$props();

	let darknessHeight = $state('30vw');
	let circleSize = $state('200vw');

	onMount(() => {
		if (viewportWidth < 768) {
			darknessHeight = '50vw';
			circleSize = '150vh';
		}
	});
</script>

{#key lightMode}
	<div class="darkness-container">
		<div class="circle" 
			style="background-color: {lightMode ? '#1b1b1b' : '#fffff0'};
					width: {circleSize};
					height: {circleSize};"
		>
			<Parametric
				animationName="darkness"
				paramStart={0}
				paramEnd={111}
				strokeWidth={0.001}
				width={darknessHeight}
				height={darknessHeight}
				resoluton={8000}
				duration={4000}
				bgColor={'none'}
				strokeColor={lightMode ? '#fffff0' : '#1b1b1b'}
			/>
		</div>
	</div>
{/key}

<style>
	.darkness-container {
		/* position */
		position: absolute;

		/* inner */
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		/* shape */
		width: 100vw;
		height: 100vh;

		/* user interaction */
		z-index: 1;
	}

	.circle {
		/* position */
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		/* shape */
		border-radius: 50%;

		/* user interaction */
		z-index: -1;

		/* animation */
		animation:
			circle 4.35s forwards,
			fadeIn 0.5s forwards,
			fadeOut 0.5s 3.7s forwards;

		/* inner */
		display: flex;
		align-items: center;
		justify-content: center;

		overflow: hidden;
	}

	@keyframes circle {
		0% {
		}

		100% {
			width: 0vw;
			height: 0vw;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
