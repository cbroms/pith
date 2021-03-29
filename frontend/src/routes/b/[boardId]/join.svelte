<script context="module">
  export async function preload({ params, query }) {
    return { id: params.boardId, dId: query.d };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";

  import { boardStore } from "../../../stores/boardStore";

  export let id;
  export let dId;

  let name = "";
  let nickNameError = false;
  let emptyNameError = false;

  onMount(async () => {
    if ($boardStore.isValidBoard === null) {
      // if we have arrived at this route directly, go back to the index
      await goto(`/b/${id}/${dId ? "?d=" + dId : ""}`);
    }
  });

  const submitNickname = (name) => {
    boardStore.createUser(id, name).then(
      async () => {
        // we created the user sucessfully
        await goto(`/b/${id}/${dId ? "?d=" + dId : ""}`);
      },
      (msg) => {
        // the nickname was taken, try again
        nickNameError = true;
        console.info(msg);
      }
    );
  };

  const onSubmit = () => {
    const cleanName = name.trim();
    if (cleanName === "") emptyNameError = true;
    else {
      submitNickname(cleanName);
      name = "";
      nickNameError = false;
      emptyNameError = false;
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Enter") onSubmit();
  };
</script>

{#if $boardStore.isValidBoard}
  <div class="nickname-wrapper">
    <h1>Create a nickname</h1>
    <p>
      Your nickname will be used to identify your contributions in the board.
    </p>
    <input
      placeholder="type a nickname..."
      bind:value={name}
      on:keydown={onKeydown}
    />
    {#if nickNameError}
      <div class="msg error-text">{$boardStore.nickname} is already taken</div>
    {:else if emptyNameError}
      <div class="msg error-text">Please enter a name!</div>
    {:else if $boardStore.nickname !== null && $boardStore.userId === null}
      <div class="msg">Joining as {$boardStore.nickname}...</div>
    {/if}
    <button class="button-big" on:click={onSubmit}>Join Board</button>
  </div>
{/if}

<style>
  .nickname-wrapper {
    padding: 40px;
    max-width: 500px;
  }

  button {
    margin-top: 20px;
  }

  .msg {
    margin-top: 5px;
  }
</style>
