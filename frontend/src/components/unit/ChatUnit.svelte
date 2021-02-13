<script>
  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";
  import { parseTime } from "../../utils/parseTime";

  export let pith = "";
  export let id;
  export let author_name = null;
  export let author_id = null;
  export let created = null;
  export let prev = null;

  const onPin = () => {
    console.log("pinning");
    discussionStore.addPinned(
      $boardStore.boardId,
      $discussionStore.discussionId,
      id
    );
  };
</script>

<div class="message">
  {#if prev === null || !(prev.author_id === author_id && Math.floor((Date.parse(created) - Date.parse(prev.created)) / 1000 / 60) < 30)}
    <div class="message-title">
      <span class="message-author">{author_name}</span>
      <span class="message-time">{parseTime(created)}</span>
    </div>
  {/if}
  <div class="message-content">
    <div>{pith}</div>
    <div class="message-pin" on:click={onPin}>Pin &rarr;</div>
  </div>
</div>

<style>
  .message {
    width: 100%;
  }
  .message-title {
    margin-top: 20px;
  }

  .message-author {
    font-weight: bold;
    margin-right: 10px;
  }

  .message-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .message:hover .message-pin {
    display: inline-block;
  }

  .message-pin {
    cursor: pointer;
    width: 50px;
    display: none;
  }
</style>
