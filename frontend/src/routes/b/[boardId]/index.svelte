<script context="module">
  export async function preload({ params, query }) {
    return { id: params.boardId, dId: query.d };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";

  import { parseTime } from "../../../utils/parseTime";

  import { boardStore } from "../../../stores/boardStore";
  import { boardDisplayContextStore } from "../../../stores/boardDisplayContextStore";

  import BoardPageLayout from "../../../components/layouts/BoardPageLayout.svelte";
  import LinkedContentItemLayout from "../../../components/layouts/LinkedContentItemLayout.svelte";
  import LinkedContentLayout from "../../../components/layouts/LinkedContentLayout.svelte";
  import SectionLayout from "../../../components/layouts/SectionLayout.svelte";

  import CanvasBoard from "../../../components/sections/CanvasBoard.svelte";
  import BoardUnit from "../../../components/unit/BoardUnit.svelte";

  export let id;
  export let dId;

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
      boardStore.subscribeBoard();
      if (dId) {
        await goto(`/b/${id}/d/${dId}/`);
      }
    }
  });

  const onNewDiscussion = () => {
    boardStore.createDiscussion(
      $boardStore.boardId,
      $boardDisplayContextStore.id
    );
  };
</script>

<BoardPageLayout>
  <div slot="info" class="section board-info">
    {#if $boardStore.isValidBoard}
      <h1>Welcome!</h1>
      {#if !$boardDisplayContextStore.id}
        <p>Select a unit from the board to find a discussion...</p>
      {:else}
        <div class="selected-discussion">
          <h2>Discussions about:</h2>
          <BoardUnit unit={$boardStore.units[$boardDisplayContextStore.id]} />

          <LinkedContentLayout top>
            {#each $boardStore.units[$boardDisplayContextStore.id].discussions as discussion (discussion.id)}
              <LinkedContentItemLayout>
                <div class="discussion-listing">
                  <a href="/b/{id}/d/{discussion.id}/"
                    >Join discussion created {parseTime(discussion.created)}</a
                  >
                </div>
              </LinkedContentItemLayout>
            {/each}
            <LinkedContentItemLayout>
              <button class="button-inline" on:click={onNewDiscussion}
                >Create new discussion</button
              ></LinkedContentItemLayout
            >
          </LinkedContentLayout>
        </div>
      {/if}
    {:else if $boardStore.isValidBoard === false}
      <h1>404</h1>
      <p>That board doesn't exist!</p>
    {/if}
  </div>

  <div slot="board" class="section">
    <SectionLayout sectionName="Board">
      <CanvasBoard />
    </SectionLayout>
  </div>
</BoardPageLayout>

<style>
  .section {
    height: 100%;
    width: 100%;
  }

  .board-info {
    max-width: 500px;
    padding: 20px 0;
    margin: 0 auto;
  }

  .discussion-listing {
    margin: 10px 0;
    display: inline-block;
  }

  .selected-discussion {
    margin: 20px 0;
  }
</style>
