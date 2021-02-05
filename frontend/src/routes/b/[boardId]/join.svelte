<script context="module">
    export async function preload({ params }) {
        return { id: params.boardId };
    }
</script>

<script>
    import { goto } from "@sapper/app";
    import { onMount } from "svelte";

    import { boardStore } from "../../../stores/boardStore";

    export let id;

    let name = "";
    let error = false;

    onMount(async () => {
        if ($boardStore.isValidBoard === null) {
            // if we have arrived at this route directly, go back to the index
            await goto(`/b/${id}/`);
        }
    });

    const submitNickname = (name) => {
        boardStore.createUser(id, name).then(
            async () => {
                // we created the user sucessfully
                await goto(`/b/${id}/`);
            },
            (msg) => {
                // the nickname was taken, try again
                error = true;
                console.info(msg);
            }
        );
    };

    const onSubmit = () => {
        submitNickname(name);
        name = "";
        error = false;
    };

    const onKeydown = (e) => {
        if (e.key === "Enter") onSubmit();
    };
</script>

{#if $boardStore.isValidBoard}
    <div>
        <h1>Create a nickname</h1>
        <p>
            Your nickname will be used to identify your contributions in the
            board.
        </p>
        <input
            placeholder="type a nickname..."
            bind:value={name}
            on:keydown={onKeydown}
        />
        <button on:click={onSubmit}>Join Board</button>

        {#if error}
            <div>{$boardStore.nickname} is already taken</div>
        {:else if $boardStore.nickname !== null && $boardStore.userId === null}
            <div>Joining as {$boardStore.nickname}...</div>
        {/if}
    </div>
{/if}
