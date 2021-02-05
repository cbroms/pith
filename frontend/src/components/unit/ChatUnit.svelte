<script>
    import { parseTime } from "../../utils/parseTime";

    export let pith = "";
    export let author = null;
    export let time = null;
</script>

<div class="message">
    {#if author !== null && time !== null}
        <div class="message-title">
            <span class="message-author">{author}</span>
            <span class="message-time">{parseTime(time)}</span>
        </div>
    {/if}
    <div class="message-content">{pith}</div>
</div>

<style>
    .message-title {
        margin-top: 20px;
    }

    .message-author {
        font-weight: bold;
        margin-right: 10px;
    }
</style>
