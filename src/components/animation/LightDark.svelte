<script>
	import Parametric from './Parametric.svelte';
</script>

<Parametric
	animationName="darkness"
	paramStart={0}
	paramEnd={111}
	strokeWidth={0.001}
	width={'100vw'}
	height={'40vw'}
	resoluton={8000}
	duration={6000}
	bgColor={'var(--primary-bg)'}
	strokeColor={'var(--primary-contrast)'}
/>
