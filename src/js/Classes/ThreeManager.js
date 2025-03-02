import { GUI } from 'dat.gui';
import { ref } from 'vue';
import { BokehPass, EffectComposer, EXRLoader, OutputPass, RenderPass, SMAAPass } from 'three/addons';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {
	ACESFilmicToneMapping,
	AnimationMixer,
	Clock,
	DefaultLoadingManager,
	LoopRepeat,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	TextureLoader,
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
		this.composer = null;
		this.animationMixers = [];
		this.gui = null;
		this.debugObject = {};
		this.isSceneReady = ref(false);
		this.EXRLoader = new EXRLoader();
		this.textureLoader = new TextureLoader();
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
			canvas: this.canvas,
			powerPreference: 'high-performance',
			alpha: true
		});

		// Set size & aspect ratio
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 0.3;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		// Set pixel ratio
		this.renderer.setPixelRatio(window.devicePixelRatio);

		// Set size
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		// Setup camera
		this.setupCamera();

		// Setup controls
		this.setupControls();

		// Setup postprocessing
		this.setupPostProcessing();

		// Setup debugging
		this.setupDebugging();

		// Set scene size
		this.setSceneSize();

		// Handle scene loading
		this.handleSceneLoading();
	}

	setupCamera() {
		// Set perspective camera
		this.camera = new PerspectiveCamera(25, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 2000);

		// Set camera position
		this.camera.position.set(0, 1, -10);

		// Set aspect ratio
		this.camera.aspect = window.innerWidth / window.innerHeight;

		// Update camera projection matrix
		this.camera.updateProjectionMatrix();

		// Add camera to scene
		this.scene.add(this.camera);
	}

	setupPostProcessing() {
		// Create composer
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));

		// Add bokeh
		const bokehPass = new BokehPass(this.scene, this.camera, {
			focus: 1,
			aperture: 0.0001,
			maxblur: 0.01
		});
		this.composer.addPass(bokehPass);

		// Add SMAA
		const smaaPass = new SMAAPass(
			window.innerWidth * this.renderer.getPixelRatio(),
			window.innerHeight * this.renderer.getPixelRatio()
		);
		this.composer.addPass(smaaPass);

		// Add output
		const outputPass = new OutputPass();
		this.composer.addPass(outputPass);
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

	addAnimation(model, clip) {
		// Create new mixer
		const mixer = new AnimationMixer(model);

		// Add clip action to mixer
		const clipAction = mixer.clipAction(clip);

		// Set loop and play
		clipAction.setLoop(LoopRepeat);
		clipAction.play();

		// Add mixer to array
		this.animationMixers.push(mixer);
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

		if (this.animationMixers.length !== 0) {
			// Update animation mixer
			this.animationMixers.forEach((mixer) => mixer.update(delta));
		}

		// Render
		this.composer.render();
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
