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

  import DiscussionLayout from "../../../../../components/layouts/DiscussionLayout.svelte";
  import BoardLayout from "../../../../../components/layouts/BoardLayout.svelte";

  import ChatLayout from "../../../../../components/layouts/ChatLayout.svelte";
  import FocusLayout from "../../../../../components/layouts/FocusLayout.svelte";
  import PinnedLayout from "../../../../../components/layouts/PinnedLayout.svelte";

  import Board from "../../../../../components/sections/Board.svelte";
  import Chat from "../../../../../components/sections/Chat.svelte";

  export let id;
  export let bId;

  onMount(async () => {
    if ($boardStore.userId === null) {
      // if the user hasn't joined or loaded the board yet, redirect them up to do that
      goto(`/b/${bId}/?d=${id}`);
    } else {
      await discussionStore.joinDiscussion(bId, id, $boardStore.userId);
      discussionStore.subscribePosts();
    }
  });
</script>

<DiscussionLayout>
  <ChatLayout>
    <Chat {id} />
  </ChatLayout>
  <FocusLayout>
    <!-- {#each focusUnits as unit (unit.id)}
      <BoardUnit pith={unit.pith} unfocus />
    {/each} -->
  </FocusLayout>
  <PinnedLayout />
</DiscussionLayout>

<BoardLayout>
  <Board id={bId} />
</BoardLayout>
