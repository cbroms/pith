<script>
    export let pith = "this is something";
    export let focus = false;
    export let edit = false;
    export let unfocus = false;
    export let links = false;
</script>

<div class="board-unit">
    <div class="unit-content">{pith}</div>
    {#if focus || unfocus || edit || links}
        <div class="unit-controls">
            <span class="controls-left">
                {#if links}
                    <button>Links</button>
                {/if}
            </span>
            <span class="controls-right">
                {#if focus}
                    <button>Focus</button>
                {:else if unfocus}
                    <button>Unfocus</button>
                {/if}
                {#if edit}
                    <button>Edit</button>
                {/if}
            </span>
        </div>
    {/if}
</div>

<style>
    .board-unit {
        border: 1px solid black;
    }

    .unit-content {
        padding: 10px;
    }

    .unit-controls {
        display: flex;
        justify-content: space-between;
    }

    button {
        padding: 10px;
        outline: none;
        border: none;
        border-radius: 0;
    }
</style>
