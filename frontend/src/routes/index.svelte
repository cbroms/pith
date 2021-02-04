<script>
    import BoardUnit from "../components/unit/BoardUnit.svelte";
</script>

<svelte:head>
    <title>Pith</title>
</svelte:head>

<div>
    <BoardUnit focus edit links />
</div>

<style>
    div {
        max-width: 400px;
    }
</style>
