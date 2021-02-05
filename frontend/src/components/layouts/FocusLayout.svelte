<div class="layout focus-layout">
    <div class="layout-header">
        <h2>Focusing on</h2>
    </div>
    <div class="layout-overflow">
        <slot />
    </div>
</div>

<style>
    .focus-layout {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
    }
</style>
