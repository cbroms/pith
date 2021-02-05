<div class="discussion-layout">
    <slot />
</div>

<style>
    .discussion-layout {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        display: grid;
        grid-template-columns: 65% 35%;
        grid-template-rows: 50% 50%;
    }
</style>
