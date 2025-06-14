<script module>
	import Projects from '$components/svg/shelf/Projects.svelte';
	import Writings from '$components/svg/shelf/Writings.svelte';
	import VNote from '$components/svg/spine/VNote.svelte';
	import Epoch from '$components/svg/spine/Epoch.svelte';
	import ArtAndAi from '$components/svg/spine/ArtAndAI.svelte';
	import FreeWill from '$components/svg/spine/FreeWill.svelte';

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
			shelves: [
				{
					x: 78,
					y: 145,
					width: 234,
					height: 75,
					rotation: 0,
					flipped: false,
					books: [
						{
							link: '/book/ArtAndAI',
							svg: ArtAndAi,
							width: 20,
							height: 85,
							name: "Art, Aesthetic Value, and AI"
						},
						{
							link: '/book/FreeWill',
							svg: FreeWill,
							width: 20,
							height: 84,
							name: "On Free Will"
						}
					]
				}
			],
			width: 487.5,
			height: 675
		}
	};
</script>
