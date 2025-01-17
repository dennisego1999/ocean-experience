import { GUI } from 'dat.gui';
import { ref } from 'vue';
import { EXRLoader } from 'three/addons';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {
	ACESFilmicToneMapping,
	Clock,
	DefaultLoadingManager,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';
import Controls from '@js/Classes/Controls.js';

export default class ThreeManager {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.canvas = null;
		this.controls = null;
		this.renderAction = null;
		this.gui = null;
		this.debugObject = {};
		this.isSceneReady = ref(false);
		this.EXRLoader = new EXRLoader();
		this.clock = new Clock();
		this.gltfLoader = new GLTFLoader();
		this.dracoLoader = new DRACOLoader();
		this.loaderManager = DefaultLoadingManager;
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
	}

	initThree(canvasId) {
		// Get canvas
		this.canvas = document.getElementById(canvasId);

		// Setup scene
		this.scene = new Scene();

		// Setup renderer
		this.renderer = new WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			canvas: this.canvas,
			alpha: true
		});

		// Set a fully transparent background color
		this.renderer.setClearColor(0x000000, 0);

		// Set size & aspect ratio
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.physicallyCorrectLights = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		// Setup camera
		this.setupCamera();

		// Setup controls
		this.setupControls();

		// Setup debugging
		this.setupDebugging();

		// Set scene size
		this.setSceneSize();

		// Handle scene loading
		this.handleSceneLoading();
	}

	setupCamera() {
		// Set perspective camera
		this.camera = new PerspectiveCamera(25, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 1000);

		// Set camera position
		this.camera.position.set(0, 1, -10);

		// Update camera projection matrix
		this.camera.updateProjectionMatrix();

		// Add camera to scene
		this.scene.add(this.camera);
	}

	setupControls() {
		// Set controls
		this.controls = new Controls(this.camera, this.renderer.domElement);

		// Bind controls events
		this.controls.bind();
	}

	setupDebugging() {
		if (import.meta.env.VITE_ENABLE_DEBUG === 'false') {
			// Only allow debugging in non-production environments
			return;
		}

		// Create instance of dat.gui
		this.gui = new GUI({ width: 340 });
	}

	addDebugControls(callback) {
		if (callback) {
			callback();
		}
	}

	setSceneSize() {
		// Set correct aspect
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		// Set canvas size again
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	handleSceneLoading() {
		// On load
		this.loaderManager.onLoad = () => {
			// Set ready state
			this.isSceneReady.value = true;
		};

		// On progress
		this.loaderManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
			// Calculate the progress and update the loadingBarElement
			// const progressRatio = (itemsLoaded / itemsTotal) * 100;
		};
	}

	animate() {
		// Render the frame
		this.render();

		// Request a new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	setRenderAction(callback) {
		if (callback) {
			// Set render action
			this.renderAction = callback;
		}
	}

	render() {
		// Get delta
		const delta = this.clock.getDelta();

		if (this.controls) {
			// Update controls
			this.controls.update();
		}

		if (this.renderAction) {
			// Call render action
			this.renderAction(delta);
		}

		// Render
		this.renderer.render(this.scene, this.camera);
	}

	destroy() {
		// Unbind controls events
		this.controls.unbind();

		// Cancel the animation frame
		if (this.animateFrameId) {
			cancelAnimationFrame(this.animateFrameId);
		}

		// Dispose of geometries, materials, and textures
		this.scene.traverse((object) => {
			if (!object.isMesh) return;

			// Dispose geometry
			if (object.geometry) {
				object.geometry.dispose();
			}

			// Dispose material
			if (object.material) {
				// Check if material is an array (e.g., multi-materials)
				if (Array.isArray(object.material)) {
					object.material.forEach((mat) => {
						if (mat.map) mat.map.dispose();
						if (mat.lightMap) mat.lightMap.dispose();
						if (mat.bumpMap) mat.bumpMap.dispose();
						if (mat.normalMap) mat.normalMap.dispose();
						if (mat.specularMap) mat.specularMap.dispose();
						if (mat.envMap) mat.envMap.dispose();
						if (mat.alphaMap) mat.alphaMap.dispose();
						mat.dispose();
					});
				} else {
					if (object.material.map) object.material.map.dispose();
					if (object.material.lightMap) object.material.lightMap.dispose();
					if (object.material.bumpMap) object.material.bumpMap.dispose();
					if (object.material.normalMap) object.material.normalMap.dispose();
					if (object.material.specularMap) object.material.specularMap.dispose();
					if (object.material.envMap) object.material.envMap.dispose();
					if (object.material.alphaMap) object.material.alphaMap.dispose();
					object.material.dispose();
				}
			}
		});

		// Clear the scene
		while (this.scene.children.length > 0) {
			this.scene.remove(this.scene.children[0]);
		}

		// Dispose of renderer
		if (this.renderer) {
			this.renderer.dispose();
		}
	}

	resize() {
		// Set new scene size
		this.setSceneSize();
	}
}
