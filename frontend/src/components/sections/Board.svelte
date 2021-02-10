<script>
  import { boardStore } from "../../stores/boardStore";
  export let id;

  let content = "";

  const onSubmit = () => {
    if (content !== "") {
      boardStore.addUnit(id, content);
      content = "";
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Enter") onSubmit();
  };
</script>

<div>
  <input
    placeholder="type a unit..."
    bind:value={content}
    on:keydown={onKeydown}
  />
</div>
