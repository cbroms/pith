<script context="module">
  export async function preload({ params }) {
    return { bId: params.boardId, id: params.discussionId };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";

  // import Chat from "../../../../../components/chat/Chat.svelte"

  import { discussionStore } from "../../../../../stores/discussionStore";
  import { boardStore } from "../../../../../stores/boardStore";

  import DiscussionPageLayout from "../../../../../components/layouts/DiscussionPageLayout.svelte";
  import SectionLayout from "../../../../../components/layouts/SectionLayout.svelte";

  import Board from "../../../../../components/sections/Board.svelte";
  import Chat from "../../../../../components/sections/Chat.svelte";

  import BoardUnit from "../../../../../components/unit/BoardUnit.svelte";
  import ChatUnit from "../../../../../components/unit/ChatUnit.svelte";

  export let id;
  export let bId;

  onMount(async () => {
    if ($boardStore.userId === null) {
      // if the user hasn't joined or loaded the board yet, redirect them up to do that
      goto(`/b/${bId}/?d=${id}`);
    } else {
      await discussionStore.joinDiscussion(bId, id, $boardStore.userId);
      discussionStore.subscribeDiscussion();
    }
  });

  const onLeave = () => {
    discussionStore.leaveDiscussion(bId, id, $boardStore.userId);
    goto(`/b/${bId}/`);
  };
</script>

<DiscussionPageLayout>
  <div class="section" slot="chat">
    <SectionLayout sectionName="Chat">
      <div slot="header" class="header chat-controls">
        <div>{$discussionStore.participants.length} here now</div>
        <button on:click={onLeave} class="inline-button"
          >Leave discussion</button
        >
      </div>
      <Chat {id} />
    </SectionLayout>
  </div>

  <div class="section" slot="pinned">
    <SectionLayout sectionName="Summary">
      {#each $discussionStore.pinned as unitId}
        <ChatUnit truncate {...$discussionStore.units[unitId]} unpin />
      {/each}
    </SectionLayout>
  </div>

  <div class="section" slot="focus">
    <SectionLayout sectionName="Focusing on">
      {#if $discussionStore.focused.length === 0}
        <p>Select a unit from the board to focus your discussion.</p>
      {/if}
      {#each $discussionStore.focused as unitId}
        <BoardUnit truncate unit={$boardStore.units[unitId]} unfocus />
      {/each}
    </SectionLayout>
  </div>

  <div class="section" slot="board">
    <SectionLayout sectionName="Board">
      <Board id={bId} focus />
    </SectionLayout>
  </div>

  <!-- <ChatLayout {onLeave} numParticipants={$discussionStore.participants.length}>
    
  </ChatLayout> -->
</DiscussionPageLayout>

<style>
  .section {
    height: 100%;
    width: 100%;
  }

  .header {
    display: flex;
    margin-left: 15px;

    width: 100%;
  }

  .chat-controls {
    justify-content: space-between;
  }
</style>
