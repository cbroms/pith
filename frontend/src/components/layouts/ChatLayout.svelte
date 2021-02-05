<div class="layout chat-layout">
    <div class="layout-header">
        <h2>Discussion</h2>
    </div>
    <div class="layout-overflow">
        <slot />
    </div>
</div>

<style>
    .chat-layout {
        grid-column: 1 / 2;
        grid-row: 1 / 3;
    }
</style>
