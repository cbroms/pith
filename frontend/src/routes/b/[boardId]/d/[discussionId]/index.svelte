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

  console.log(id);

  onMount(async () => {
    await discussionStore.joinDiscussion(bId, id, $boardStore.userId);
  });
</script>

<DiscussionLayout>
  <ChatLayout>
    <Chat />
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
