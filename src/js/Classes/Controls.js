import { lerp } from '@js/Helpers/index.js';
import { Vector2, Vector3 } from 'three';

class Controls {
	constructor(camera, domElement) {
		this.camera = camera;
		this.domElement = domElement || document.body;
		this.currentMouseCoords = new Vector2();
		this.targetMouseCoords = new Vector2();
		this.lookSpeedFactor = 5;
		this.isScrolling = false;

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
		// Prevent page scroll
		event.preventDefault();

		// Attach camera y-axis to scroll
		const delta = Math.sign(event.deltaY);
		this.camera.position.y += delta * 0.1;
	}

	update() {
		// Smoothly interpolate mouse coordinates
		this.currentMouseCoords.x = lerp(this.currentMouseCoords.x, this.targetMouseCoords.x, 0.05);
		this.currentMouseCoords.y = lerp(this.currentMouseCoords.y, this.targetMouseCoords.y, 0.05);

		// Update camera look direction
		const lookAtPosition = new Vector3(
			-this.currentMouseCoords.x * this.lookSpeedFactor,
			this.currentMouseCoords.y * this.lookSpeedFactor,
			0
		);
		this.camera.lookAt(lookAtPosition);
	}
}

export default Controls;
