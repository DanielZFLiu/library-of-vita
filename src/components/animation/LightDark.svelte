<script lang="ts">
	import Parametric from './Parametric.svelte';

	let { lightMode = false }: { lightMode?: boolean } = $props();
</script>

{#key lightMode}
	<div class="darkness-container">
		<Parametric
			animationName="darkness"
			paramStart={0}
			paramEnd={111}
			strokeWidth={0.001}
			width={'30vw'}
			height={'30vw'}
			resoluton={8000}
			duration={4000}
			bgColor={'none'}
			strokeColor={lightMode? "#fffff0" : "#1b1b1b"}
		/>

		<div class="circle" style="background-color: {lightMode? "#1b1b1b" : "#fffff0"};"></div>
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

		/* shape */
		width: 100vw;
		height: 100vh;

		/* user interaction */
		z-index: 1;

		/* animation */
		animation: fadeOut 0.5s 3.5s forwards;
	}

	.circle {
		/* position */
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		/* shape */
		width: 200vw;
		height: 200vw;
		border-radius: 50%;

		/* user interaction */
		z-index: -1;

		/* animation */
		animation: circle 4.3s forwards, fadeIn 0.5s forwards;
	}

	@keyframes circle {
		0% {
			width: 200vw;
			height: 200vw;
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
