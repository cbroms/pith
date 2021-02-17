<script context="module">
  export async function preload({ params, query }) {
    console.log(query);
    return { id: params.boardId, dId: query.d };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";

  import { boardStore } from "../../../stores/boardStore";

  import BoardLayout from "../../../components/layouts/BoardLayout.svelte";
  import DiscussionLayout from "../../../components/layouts/DiscussionLayout.svelte";
  import Board from "../../../components/sections/Board.svelte";

  export let id;
  export let dId;

  let discussionUnit;
  let discussions;

  onMount(async () => {
    await boardStore.initialize(id);

    if (
      $boardStore.isValidBoard &&
      $boardStore.hasJoinedBoard === false &&
      $boardStore.userId === null
    ) {
      // make a user ID first
      await goto(`/b/${id}/join/${dId ? "?d=" + dId : ""}`);
    } else if ($boardStore.isValidBoard && $boardStore.userId !== null) {
      // try joining the board with the user ID
      await boardStore.loadBoard(id, $boardStore.userId);
      // now that we've loaded the board, we can redirect to a particular discussion if requested
      if (dId) {
        await goto(`/b/${id}/d/${dId}/`);
      }
    }
  });

  const onDiscussions = (unit) => {
    // requires unit called getUnit
    console.log(unit.discussions);
    discussions = unit.discussions;
    discussionUnit = unit;
  };
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

<BoardLayout>
  <Board {id} newDiscussion {onDiscussions} />
</BoardLayout>
<DiscussionLayout>
  <div class="board-info">
    {#if $boardStore.isValidBoard}
      <!-- <h1>Welcome to board {id}</h1>
      <p>Select a discussion to get started...</p>
      <ul>
        <li>
          <a href="/b/{id}/d/12412/">A sample discussion</a>
        </li>
      </ul> -->
      <ul>
        {#if !discussions}
          <div />
        {:else if discussions.length == 0}
          <h1>Discussions for {discussionUnit.id}</h1>
          <div>No discussions.</div>
        {:else}
          <h1>Discussions for {discussionUnit.id}</h1>
          {#each discussions as discussion (discussion.id)}
            <li><a href="/b/{id}/d/{discussion.id}/">{discussion.id}</a></li>
          {/each}
        {/if}
      </ul>
    {:else if $boardStore.isValidBoard === false}
      <h1>404</h1>
      <p>That board doesn't exist!</p>
    {/if}
  </div>
</DiscussionLayout>

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
<style>
  .board-info {
    grid-column: 1 / 2;
    grid-row: 1 / 3;

    padding: 10px;
  }
</style>
