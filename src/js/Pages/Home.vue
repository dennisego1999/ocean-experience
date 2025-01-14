<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import Scene from '@js/Classes/Scene.js';

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
		<canvas id="scene-canvas" class="absolute inset-0 z-0 h-full w-full" />
	</div>
</template>
