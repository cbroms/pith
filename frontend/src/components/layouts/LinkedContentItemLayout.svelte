<div class="linked-line">
  <div class="line" />
  <div class="line-item">
    <slot />
  </div>
</div>

<style>
  .line {
    border-top: 1px solid;
    width: 20px;
    display: inline-block;
    margin-right: 5px;
    font-size: 12px;
  }

  .line-item {
    width: calc(100% - 24px);
    display: inline-block;
  }

  .linked-line {
    display: flex;
    align-items: center;
  }
</style>
