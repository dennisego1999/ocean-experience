<script setup>
import { computed, defineProps } from 'vue';

// Define props
const props = defineProps({
	progress: {
		type: Number,
		default: 0
	},
	vertical: Boolean
});

const gradientColor = computed(() => {
	const opacity = props.progress;

	// Use Tailwind color variable with dynamic opacity
	return `rgba(59, 130, 246, ${opacity})`;
});
</script>

<template>
	<div class="overflow-clip rounded-2xl bg-white" :class="[!vertical ? 'h-1 w-full' : 'h-full max-h-96 w-1']">
		<div
			class="w-full"
			:style="{
				background: `linear-gradient(to right, rgba(59, 130, 246, 0.8) 0%, ${gradientColor} ${props.progress}%)`,
				height: `${props.progress}%`
			}"
		/>
	</div>
</template>
