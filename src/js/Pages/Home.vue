<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Scene from '@js/Classes/Scene.js';
import Loader from '@js/Components/Loader.vue';

// Set variables
const isLoaderVisible = ref(true);

// Define function
function closeLoader() {
	// Set ref
	isLoaderVisible.value = false;
}

// Life cycles
onMounted(() => {
	// Initiate scene
	Scene.init('scene-canvas');

	// Add event listeners
	window.addEventListener('resize', Scene.resize.bind(Scene));
});

onBeforeUnmount(() => {
	// Destroy scene
	Scene.destroy();

	// Remove event listeners
	window.removeEventListener('resize', Scene.resize.bind(Scene));
});
</script>

<template>
	<div class="flex h-[100dvh] w-screen items-stretch justify-center">
		<Transition name="fade" mode="out-in">
			<Loader v-if="isLoaderVisible" @close="closeLoader" />
		</Transition>

		<canvas id="scene-canvas" class="absolute inset-0 z-0 h-full w-full" />

		<audio id="bg-audio" src="/assets/audio/bg.mp3" muted preload="auto" class="pointer-events-none hidden" />
	</div>
</template>
