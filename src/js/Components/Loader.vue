<script setup>
import PulseLoader from '@js/Components/PulseLoader.vue';
import PrimaryButton from '@js/Components/PrimaryButton.vue';
import Scene from '@js/Classes/Scene.js';

// Define emits
const emit = defineEmits(['close']);

// Define functions
function startExperience() {
	// Emit
	emit('close');

	// Play audio
	const autoStartAudioElements = [
		{ id: 'bg-audio', volume: 0.1 },
		{ id: 'ocean-audio', volume: 0.2 },
		{ id: 'underwater-bg-audio', volume: 0.5 }
	];
	autoStartAudioElements.forEach((element) => {
		const audio = document.getElementById(element.id);
		if (audio) {
			audio.pause();
			audio.load();
			audio.muted = false;
			audio.currentTime = 0;
			audio.play();

			if (element.volume) {
				audio.volume = element.volume;
			}
		}
	});
}
</script>
<template>
	<div class="fixed z-50 flex h-[100dvh] w-screen items-center justify-center bg-blue-500">
		<Transition name="fade" mode="out-in">
			<PulseLoader v-if="!Scene.isSceneReady.value" class="h-20 w-20 text-white" />

			<PrimaryButton v-else @click="startExperience"> Start experience </PrimaryButton>
		</Transition>
	</div>
</template>
