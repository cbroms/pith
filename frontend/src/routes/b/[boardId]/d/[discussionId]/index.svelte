<script context="module">
    export async function preload({ params }) {
        return { id: params.discussionId };
    }
</script>

<script>
    import { goto } from "@sapper/app";
    import { onMount } from "svelte";

    // import Chat from "../../../../../components/chat/Chat.svelte"

    import { discussionStore } from "../../../../../stores/discussionStore";
    import DiscussionLayout from "../../../../../components/layouts/DiscussionLayout.svelte";
    import BoardLayout from "../../../../../components/layouts/BoardLayout.svelte";

    import ChatLayout from "../../../../../components/layouts/ChatLayout.svelte";
    import FocusLayout from "../../../../../components/layouts/FocusLayout.svelte";
    import PinnedLayout from "../../../../../components/layouts/PinnedLayout.svelte";

    import BoardUnit from "../../../../../components/unit/BoardUnit.svelte";
    import Chat from "../../../../../components/sections/Chat.svelte";

    export let id;

    const units = [
        {
            id: "235125123w",
            pith:
                "Libero repellat molestias et soluta nihil. Repudiandae illum officiis sunt veniam est. Quae assumenda porro ratione dolorem rerum incidunt. ",
        },
        {
            id: "235123455123w",
            pith:
                "Possimus nemo voluptatem ut beatae cumque cumque ea voluptas. Minus dolorum nostrum eos quo numquam. ",
        },
        {
            id: "235134l13j4p6l",
            pith:
                "Fugit cumque et tenetur dolore in quo illo harum. Magnam maxime tempora et omnis id neque accusantium iusto. Asperiores temporibus adipisci est occaecati perspiciatis quis quibusdam.",
        },
    ];

    const focusUnits = [
        {
            id: "235125123w",
            pith:
                "Libero repellat molestias et soluta nihil. Repudiandae illum officiis sunt veniam est. Quae assumenda porro ratione dolorem rerum incidunt. ",
        },
        {
            id: "235123455123w",
            pith:
                "Possimus nemo voluptatem ut beatae cumque cumque ea voluptas. Minus dolorum nostrum eos quo numquam. ",
        },
    ];

    // onMount(async () => {
    //     await discussionStore.initialize(id);
    // });
</script>

<DiscussionLayout>
    <ChatLayout>
        <Chat />
    </ChatLayout>
    <FocusLayout>
        {#each focusUnits as unit (unit.id)}
            <BoardUnit pith={unit.pith} unfocus />
        {/each}
    </FocusLayout>
    <PinnedLayout />
</DiscussionLayout>

<BoardLayout>
    {#each units as unit (unit.id)}
        <BoardUnit pith={unit.pith} links focus edit />
    {/each}
</BoardLayout>
