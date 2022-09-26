<template>
    <ul class="p-dict-list">
        <li v-for="(value, key, index) in dict" :key="`dict-list-${key}-${index}`">
            <span class="key">{{ key }}: </span>
            <span class="value">{{ value }}</span>
        </li>
    </ul>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'PDictList',
    props: {
        dict: {
            type: Object as PropType<any>,
            default: () => ({}),
        },
    },
});
</script>
<style lang="postcss">
.p-dict-list {
    display: grid;
    grid-auto-flow: column;
    gap: 0.5rem;

    li {
        @apply bg-gray-200;
        padding: 1px 8px;
        border-radius: 4px;
        line-height: 1.25;
        .key {
            font-weight: bold;
        }
    }
}
</style>
