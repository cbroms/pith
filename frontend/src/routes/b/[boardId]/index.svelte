<script context="module">
    export async function preload({ params }) {
        return { id: params.boardId };
    }
</script>

<script>
    import { goto } from "@sapper/app";
    import { onMount } from "svelte";

    import { boardStore } from "../../../stores/boardStore";

    import BoardLayout from "../../../components/layouts/BoardLayout.svelte";
    import DiscussionLayout from "../../../components/layouts/DiscussionLayout.svelte";
    import ChatLayout from "../../../components/layouts/ChatLayout.svelte";

    export let id;

    onMount(async () => {
        await boardStore.initialize(id);

        if (
            $boardStore.isValidBoard &&
            $boardStore.hasJoinedBoard === false &&
            $boardStore.userId === null
        ) {
            // make a user ID first
            await goto(`/b/${id}/join`);
        } else if ($boardStore.isValidBoard && $boardStore.userId !== null) {
            // try joining the board with the user ID
            await boardStore.joinBoard(id, $boardStore.userId);
        }
    });
</script>

<!-- <div>Board is valid: {$boardStore.isValidBoard}</div>
<div>Board is joined: {$boardStore.hasJoinedBoard}</div>
 -->
<!-- {#if $boardStore.isValidBoard === false}
<div>
	<h1>That board doesn't exist</h1>
</div>
{:else if $boardStore.isValidBoard &&
$boardStore.hasJoinedBoard}
<div>
	<h1>Welcome to board {id}</h1>
</div>
{:else }
<div>Loading...</div>
{/if} -->

<BoardLayout />
<DiscussionLayout>
    <div class="board-info">
        <h1>Welcome to board {id}</h1>
        <p>Select a discussion to get started...</p>
        <ul>
            <li>
                <a href="/b/{id}/d/12412/">A sample discussion</a>
            </li>
        </ul>
    </div>
</DiscussionLayout>

<style>
    .board-info {
        grid-column: 1 / 2;
        grid-row: 1 / 3;

        padding: 10px;
    }
</style>