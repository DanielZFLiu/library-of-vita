<script module>
	import Projects from "$components/svg/shelf/Projects.svelte";
	import Writings from "$components/svg/shelf/Writings.svelte";
	import VNote from "$components/svg/spine/VNote.svelte";
	import Epoch from "$components/svg/spine/Epoch.svelte";

	export let shelfData = {
		Projects: {
			svg: Projects,
			shelves: [
				{
					x: 196.5,
					y: 141,
					width: 175,
					height: 100,
					rotation: 0,
					flipped: false,
					books: [
						{
							link: 'https://example.com/book1',
							svg: VNote,
							width: 21,
							height: 89
						},

						{
							link: 'https://example.com/book2',
							svg: Epoch,
							width: 20,
							height: 79
						}
					]
				}
			],
			width: 400,
			height: 800
		},

		Writings: {
			svg: Writings,
			shelves: [],
			width: 650,
			height: 900
		},
	};
</script>
