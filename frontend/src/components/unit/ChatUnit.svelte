<script>
  import { parseTime } from "../../utils/parseTime";

  export let pith = "";
  export let id;
  export let author_name = null;
  export let created = null;
</script>

<div class="message">
  {#if author_name !== null && created !== null}
    <div class="message-title">
      <span class="message-author">{author_name}</span>
      <span class="message-time">{parseTime(created)}</span>
    </div>
  {/if}
  <div class="message-content">{pith}</div>
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
</style>
