<script>
  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";
  import { parseTime } from "../../utils/parseTime";
  import { afterUpdate } from "svelte";

  import LinkedContentLayout from "../layouts/LinkedContentLayout.svelte";
  import LinkedContentItemLayout from "../layouts/LinkedContentItemLayout.svelte";
  import CopyContent from "../buttons/CopyContent.svelte";
  import TruncateText from "./TruncateText.svelte";
  import Transclusion from "./Transclusion.svelte";

  export let pith = "";
  export let id = null;
  export let author_name = null;
  export let author_id = null;
  export let created = null;
  export let transclusions = null;

  export let truncate = false;
  export let searchResult = false;
  export let publish = false;
  export let onClick = () => {
    open = !open;
  };

  // we use the previous unit to determine if we should display the author and time
  export let prev = null;

  export let pin = true;
  export let unpin = false;

  let open = false;

  let orderedTransclusions = [];

  const parseTransclusions = () => {
    if (transclusions) {
      orderedTransclusions = transclusions.list.map((e) => {
        return transclusions.map[e];
      });
      pith = transclusions.pith;
    }
  };

  afterUpdate(() => {
    parseTransclusions();
  });

  const onPin = () => {
    discussionStore.addPinned(
      $boardStore.boardId,
      $discussionStore.discussionId,
      id
    );
  };

  const onUnpin = () => {
    discussionStore.removePinned(
      $boardStore.boardId,
      $discussionStore.discussionId,
      id
    );
  };

  const onPublish = (posX, posY) => {
    //  TODO: figure out the best way to give this a real posX and posY
    boardStore.publish(
      $boardStore.boardId,
      $discussionStore.discussionId,
      id,
      posX,
      posY
    );
  };
</script>

<div class="message" on:click={onClick}>
  {#if prev === null || !(prev.author_id === author_id && Math.floor((Date.parse(created) - Date.parse(prev.created)) / 1000 / 60) < 30)}
    <div class="message-title">
      <span class="message-author">{author_name}</span>
      <span class="message-time">{parseTime(created)}</span>
    </div>
  {/if}
  <div class="message-content">
    {#if orderedTransclusions.length > 0}
      <LinkedContentLayout>
        {#each orderedTransclusions as transclusion}
          <LinkedContentItemLayout>
            <Transclusion {transclusion} truncate />
          </LinkedContentItemLayout>
        {/each}
      </LinkedContentLayout>
    {/if}
    <div class="message-line">
      <TruncateText active={truncate && !open}>
        {pith}
      </TruncateText>
      {#if !searchResult}
        <div class="message-pin">
          <CopyContent {id} />
          {#if pin && !unpin}
            <button on:click={onPin}>Pin &rarr;</button>
          {:else if unpin}
            <button on:click={onUnpin}>Unpin</button>
          {/if}
          {#if publish}
            <button on:click={onPublish}>Publish</button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .message {
    width: 100%;
  }
  .message-title {
    padding-top: 10px;
  }

  .message-author {
    font-weight: bold;
    margin-right: 10px;
  }

  .message-time {
    font-size: 12px;
  }

  .message-line {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 2px 0;
  }

  .message-content:hover {
    background-color: rgb(240, 240, 240);
  }

  .message-content:hover .message-pin {
    visibility: visible;
  }

  .message-pin {
    min-width: 90px;
    visibility: hidden;
  }
</style>
