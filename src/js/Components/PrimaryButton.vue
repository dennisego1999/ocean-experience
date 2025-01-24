<script setup>
// Define emits
const emit = defineEmits(['click']);

// Define props
defineProps({
	disabled: {
		type: Boolean,
		default: false
	},
	downloadFile: {
		type: Boolean,
		default: false
	},
	downloadName: {
		type: String,
		default: 'result'
	},
	method: {
		type: String,
		default: 'get'
	},
	href: {
		type: String,
		default: null
	}
});
</script>

<template>
	<a
		v-if="href && downloadFile"
		:class="[
			'grid cursor-pointer place-content-center rounded-md border border-transparent bg-blue-400 px-3 py-2 text-xl font-medium text-white shadow-xl transition-colors hover:bg-blue-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-white',
			$attrs.class,
			{ 'pointer-events-none opacity-30': disabled }
		]"
		:href="href"
		:download="downloadName"
		@click="emit('click')"
	>
		<slot />
	</a>

	<button
		v-else
		:class="[
			'grid cursor-pointer place-content-center rounded-md border border-transparent bg-blue-400 px-3 py-2 text-xl font-medium text-white shadow-xl transition-colors hover:bg-blue-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-white',
			$attrs.class,
			{ 'pointer-events-none opacity-30': disabled }
		]"
		@click="emit('click')"
	>
		<slot />
	</button>
</template>
