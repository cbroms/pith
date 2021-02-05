<script>
    export let pith = "this is something";
    export let focus = false;
    export let edit = false;
    export let unfocus = false;
    export let links = false;

    let linksOpen = false;

    const onEdit = () => {
        console.log("on edit");
    };
    const onFocus = () => {
        console.log("on focus");
    };
    const onUnfocus = () => {
        console.log("on unfocus");
    };
    const onLinks = () => {
        linksOpen = !linksOpen;
        console.log("links open", linksOpen);
    };
</script>

<div class="board-unit">
    <div class="unit-content">{pith}</div>
    {#if focus || unfocus || edit || links}
        <div class="unit-controls">
            <span class="controls-left">
                {#if links}
                    <button on:click={onLinks}>Links</button>
                {/if}
            </span>
            <span class="controls-right">
                {#if focus}
                    <button on:click={onFocus}>Focus</button>
                {:else if unfocus}
                    <button on:click={onUnfocus}>Unfocus</button>
                {/if}
                {#if edit}
                    <button on:click={onEdit}>Edit</button>
                {/if}
            </span>
        </div>
    {/if}
</div>

<style>
    .board-unit {
        border: 1px solid black;
        margin: 10px 0;
    }

    .unit-content {
        padding: 10px;
    }

    .unit-controls {
        display: flex;
        justify-content: space-between;
    }
</style>
