<script module>
    import Cleaning from "$components/svg/librarian/Cleaning.svelte";
    import Coffee from "$components/svg/librarian/Coffee.svelte";
    import Reading from "$components/svg/librarian/Reading.svelte";
    import Sitting from "$components/svg/librarian/Sitting.svelte";
    import Standing from "$components/svg/librarian/Standing.svelte";

	export let librarianData = {
        cleaning: {
            svg: Cleaning,
            left: 605,
            bottom: 107,
            width: 200,
            height: 300,
            description: "The librarian cleans his monacle."
        },
        coffee: {
            svg: Coffee,
            left: 602,
            bottom: 107,
            width: 200,
            height: 300,
            description: "The librarian drinks his coffee."
        },
        reading: {
            svg: Reading,
            left: 605,
            bottom: 107,
            width: 200,
            height: 300,
            description: "The librarian reads a book."
        },
        sitting: {
            svg: Sitting,
            left: 604,
            bottom: 107,
            width: 200,
            height: 300,
            description: "The librarian sits down."
        },
        standing: {
            svg: Standing,
            left: 570,
            bottom: 100,
            width: 260,
            height: 390,
            description: "The librarian stands up."
        }
	};
</script>
