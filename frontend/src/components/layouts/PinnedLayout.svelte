<div class="layout pinned-layout">
    <div class="layout-header">
        <h2>Pinned Messages</h2>
    </div>
    <div class="layout-overflow">
        <slot />
    </div>
</div>

<style>
    .pinned-layout {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
    }
</style>
