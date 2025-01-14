import { Color, Mesh, PlaneGeometry, ShaderMaterial, Uniform } from 'three';
import ThreeManager from '@js/Classes/ThreeManager.js';
import oceanFloorVertexShader from '@shaders/OceanFloar/vertex.glsl';
import oceanFloorFragmentShader from '@shaders/OceanFloar/fragment.glsl';

class Scene extends ThreeManager {
	constructor() {
		super();

		this.oceanFloorMaterial = null;
	}

	init(canvasId) {
		// Init three scene
		this.initThree(canvasId);

		// Setup scene
		this.setupScene();

		// Set render action
		this.setRenderAction(() => {
			// Update the uniform time variable of shader
			this.oceanFloorMaterial.uniforms.uTime.value = this.clock.getElapsedTime();
		});

		// Start animation loop
		this.animate();
	}

	setupScene() {
		this.addOceanFloor();
	}

	addOceanFloor() {
		// Creat ocean shader material
		this.oceanFloorMaterial = new ShaderMaterial({
			vertexShader: oceanFloorVertexShader,
			fragmentShader: oceanFloorFragmentShader,
			uniforms: {
				uTime: new Uniform(0),
				uColor: new Uniform(new Color('#004488'))
			}
		});

		// Create ocean floor geometry
		const oceanFloorGeometry = new PlaneGeometry(50, 50, 50, 50);

		// Create ocean floor mesh
		const oceanFloor = new Mesh(oceanFloorGeometry, this.oceanFloorMaterial);

		// Adjust ocean floor
		oceanFloor.rotation.x = -Math.PI / 2;

		// Add to scene
		this.scene.add(oceanFloor);
	}
}

export default new Scene();
