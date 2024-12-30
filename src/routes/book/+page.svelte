<script>
    import { renderText } from '$lib/renderer';
    
    let content = $state('');
    let renderedContent = $state('');
    $effect(() => {
        renderText(content).then((result) => {
            renderedContent = result;
        });
    });
</script>

<textarea name="input" id="input1" bind:value={content}></textarea>

{@html renderedContent}