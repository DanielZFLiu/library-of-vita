<script module>
	import Projects from '$components/svg/shelf/Projects.svelte';
	import Writings from '$components/svg/shelf/Writings.svelte';
	import VNote from '$components/svg/spine/VNote.svelte';
	import Epoch from '$components/svg/spine/Epoch.svelte';

	export let shelfData = {
		Projects: {
			svg: Projects,
			shelves: [
				{
					x: 148,
					y: 105.25,
					width: 131.5,
					height: 75,
					rotation: 0,
					flipped: false,
					books: [
						{
							link: 'https://www.voithoslabs.com/',
							svg: VNote,
							width: 16,
							height: 67,
							name: "VNote: Intelligent Notetaker"
						},
						{
							link: 'https://www.epochdesign.dev/',
							svg: Epoch,
							width: 16,
							height: 60,
							name: "Epoch Design & Development"
						}
					]
				}
			],
			width: 300,
			height: 600
		},

		Writings: {
			svg: Writings,
			shelves: [],
			width: 487.5,
			height: 675
		}
	};
</script>
