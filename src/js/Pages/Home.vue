<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import Scene from '@js/Classes/Scene.js';
import Loader from '@js/Components/Loader.vue';

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
			<Loader v-if="!Scene.isSceneReady.value" />
		</Transition>

		<canvas id="scene-canvas" class="absolute inset-0 z-0 h-full w-full" />
	</div>
</template>
