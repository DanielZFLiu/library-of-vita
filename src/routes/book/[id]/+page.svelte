<script>
	import { renderText } from '$lib/renderer';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Render markdown
	let content = $state('');
	let renderedContent = $state('');
	$effect(() => {
		renderText(content).then((result) => {
			renderedContent = result;
		});
	});

	onMount(async () => {
        // set light mode
		if (localStorage.getItem('lightMode') === 'true') {
			document.documentElement.style.setProperty('color-scheme', 'light');
		} else {
			document.documentElement.style.setProperty('color-scheme', 'dark');
		}

        // Fetch markdown content
		try {
			const res = await fetch(`/essays/${page.params.id}.md`);
			if (!res.ok) {
				throw new Error(`Failed to fetch: ${res.statusText}`);
			}
			content = await res.text();
		} catch (error) {
			console.error('Error fetching markdown:', error);
			content = 'Error loading content.';
		}
	});
</script>

<div class="page">
	{@html renderedContent}
</div>

<style>
	.page {
		/* shape */
		width: 80vw;
		height: calc(100vh - 10vw);

		/* inner */
		padding-top: 5vw;
		padding-bottom: 5vw;
		overflow: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;

		/* position */
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.page::-webkit-scrollbar {
		display: none;
	}
</style>
