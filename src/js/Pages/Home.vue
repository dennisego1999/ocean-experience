<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Scene from '@js/Classes/Scene.js';
import Loader from '@js/Components/Loader.vue';
import PrimaryButton from '@js/Components/PrimaryButton.vue';
import ProgressBar from '@js/Components/ProgressBar.vue';

// Set variables
const isLoaderVisible = ref(true);

// Define function
function closeLoader() {
	// Set ref
	isLoaderVisible.value = false;
}

function dive() {
	// Dive to specific depth
	Scene.dive(-2);
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
	<div class="relative flex h-[100dvh] w-screen items-stretch justify-center">
		<Transition name="fade" mode="out-in">
			<ProgressBar
				v-if="Scene.isReady.value"
				class="absolute right-4 top-1/2 z-10 -translate-y-1/2"
				:progress="Scene.progress.value"
				:vertical="true"
			/>
		</Transition>

		<Transition name="fade" mode="out-in">
			<Loader v-if="isLoaderVisible" @close="closeLoader" />
		</Transition>

		<Transition name="fade" mode="out-in">
			<div
				v-if="!Scene.isReady.value"
				class="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2"
			>
				<span class="text-4xl text-white"> Enjoy the depths of our ocean </span>

				<PrimaryButton @click="dive" class="w-fit"> Take a dive </PrimaryButton>
			</div>
		</Transition>

		<canvas id="scene-canvas" class="absolute inset-0 z-0 h-full w-full" />

		<audio id="bg-audio" src="/assets/audio/bg.mp3" loop muted preload="auto" class="pointer-events-none hidden" />

		<audio
			id="ocean-audio"
			src="/assets/audio/ocean.mp3"
			loop
			muted
			preload="auto"
			class="pointer-events-none hidden"
		/>

		<audio
			id="underwater-bg-audio"
			src="/assets/audio/underwater-bg.mp3"
			loop
			muted
			preload="auto"
			class="pointer-events-none hidden"
		/>

		<audio
			id="submerge-audio"
			src="/assets/audio/submerge.mp3"
			muted
			preload="auto"
			class="pointer-events-none hidden"
		/>
	</div>
</template>
