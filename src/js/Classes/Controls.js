import { lerp } from '@js/Helpers/index.js';
import { Vector2, Vector3 } from 'three';
import Scene from '@js/Classes/Scene.js';

class Controls {
	constructor(camera, domElement) {
		this.camera = camera;
		this.domElement = domElement || document.body;
		this.currentMouseCoords = new Vector2();
		this.targetMouseCoords = new Vector2();
		this.maxScroll = 5;
		this.minScroll = -Scene.config.dimensions.depth;

		// Bind context
		this.handlePointerMove = this.handlePointerMove.bind(this);
		this.handleWheel = this.handleWheel.bind(this);
	}

	bind() {
		this.domElement.addEventListener('pointermove', this.handlePointerMove);
		this.domElement.addEventListener('wheel', this.handleWheel);
	}

	unbind() {
		this.domElement.removeEventListener('pointermove', this.handlePointerMove);
		this.domElement.removeEventListener('wheel', this.handleWheel);
	}

	handlePointerMove(event) {
		// Normalize mouse coordinates to range [-1, 1]
		this.targetMouseCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.targetMouseCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}

	handleWheel(event) {
		if (!Scene.isReady.value || this.camera.position.y <= this.minScroll) {
			return;
		}

		// Prevent page scroll
		event.preventDefault();

		// Attach camera y-axis to scroll
		const delta = Math.sign(event.deltaY);

		// Check if scrolling would exceed the limits
		const newY = this.camera.position.y + delta * 0.05;

		// Apply the scroll change only if it's within bounds
		if (newY >= this.minScroll && newY <= this.maxScroll) {
			this.camera.position.y = newY;
		}

		// Update scene progress
		Scene.updateProgress();
	}

	update() {
		// Smoothly interpolate mouse coordinates
		this.currentMouseCoords.x = lerp(this.currentMouseCoords.x, this.targetMouseCoords.x, 0.05);
		this.currentMouseCoords.y = lerp(this.currentMouseCoords.y, this.targetMouseCoords.y, 0.05);

		// Adjust pointer position based on camera height
		const offset = 1.5;
		const lookAtPosition = new Vector3(
			-this.currentMouseCoords.x * offset,
			this.camera.position.y,
			this.currentMouseCoords.y
		);

		// Camera should look at the pointer
		this.camera.lookAt(lookAtPosition);
	}
}

export default Controls;
