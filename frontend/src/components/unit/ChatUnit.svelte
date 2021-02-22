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

  // we use the previous unit to determine if we should display the author and time
  export let prev = null;

  export let pin = true;
  export let unpin = false;

  let ogPith = null;

  let open = false;

  let orderedTransclusions = [];

  const parseTransclusions = () => {
    if (transclusions) {
      orderedTransclusions = [];
      let numMatched = 0;
      const linkRegex = /\[\[\s*(.*?)\s*\]\]/g;

      for (const id in transclusions) {
        transclusions[id] = transclusions[id].replaceAll(linkRegex, "");
      }
      transclusions = transclusions;
      // this is stupidly inefficient but will work until the transclusion shape is changed
      ogPith = ogPith === null ? pith : ogPith;

      // parse out the unit's tansclusions
      pith = ogPith.replaceAll(linkRegex, (match) => {
        numMatched++;
        orderedTransclusions.push(
          transclusions[match.replaceAll("[", "").replaceAll("]", "")]
        );
        return `[${numMatched}]`; // TODO put link here
      });
      orderedTransclusions = orderedTransclusions;
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

  const onClick = () => {
    open = !open;
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
      <div class="message-pin">
        <CopyContent {id} />
        {#if pin && !unpin}
          <button on:click={onPin}>Pin &rarr;</button>
        {:else if unpin}
          <button on:click={onUnpin}>Unpin</button>
        {/if}
      </div>
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
    min-width: 85px;
    visibility: hidden;
  }
</style>
