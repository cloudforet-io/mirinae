<template>
    <svg class="p-spinner"
         :width="size"
         :height="size" viewBox="0 0 32 32"
         fill="none" xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <circle class="spinner-bg"
                    cx="16" cy="16" r="14"
                    :stroke="bgColor"
                    stroke-opacity="0.3"
                    stroke-width="9%"
            />
            <circle class="spinner"
                    cx="16" cy="16" r="14"
                    :stroke="spinnerColor"
                    stroke-width="9%"
                    stroke-linecap="round" stroke-dasharray="32 200"
            />
        </g>
    </svg>
</template>

<script lang="ts">
import {
    defineComponent,
} from 'vue';


interface Props {
    size?: string;
    color?: string;
}

export default defineComponent<Props>({
    name: 'PSpinner',
    components: {
    },
    props: {
        size: {
            type: String,
            default: '2rem',
        },
        spinnerColor: {
            type: String,
            default: '#898995',
        },
        bgColor: {
            type: String,
            default: '#A7A9B2',
        },
    },
});
</script>

<style lang="postcss">
.p-spinner {
    --spinner-speed: 2s;
    vertical-align: middle;
    transform-origin: center;
    animation: rotate var(--spinner-speed) linear infinite;

    .spinner {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
        stroke-linecap: round;
        animation: stretch calc(var(--spinner-speed) * 0.75) ease-in-out infinite;
    }

    @keyframes stretch {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 90, 200;
            stroke-dashoffset: -2.1875rem;
        }
        100% {
            stroke-dashoffset: -7.75rem;
        }
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>
