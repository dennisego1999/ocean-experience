import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	EquirectangularReflectionMapping,
	Mesh,
	PlaneGeometry,
	Points,
	PointsMaterial,
	ShaderMaterial,
	Uniform,
	Vector2
} from 'three';
import ThreeManager from '@js/Classes/ThreeManager.js';
import oceanVertexShader from '@shaders/OceanSurface/Vertex.glsl';
import oceanFragmentShader from '@shaders/OceanSurface/Fragment.glsl';
import underwaterVertexShader from '@shaders/Underwater/Vertex.glsl';
import underwaterFragmentShader from '@shaders/Underwater/Fragment.glsl';

class Scene extends ThreeManager {
	constructor() {
		super();

		this.particleCount = 1000000;
		this.oceanSurfaceMaterial = null;
		this.underwaterMaterial = null;

		// Configuration for ocean, sky, and underwater visuals
		this.config = {
			surface: {
				surfaceColor: '#9bd8ff',
				depthColor: '#186691'
			},
			underwater: {
				surfaceColor: '#95c5e0',
				depthColor: '#186691'
			},
			fogColor: '#ffffff',
			foamColor: '#ffffff',
			dimensions: {
				height: 80,
				width: 1000,
				depth: 500
			},
			skyEXRPath: '/assets/images/sky.exr'
		};
	}

	init(canvasId) {
		// Init three scene
		this.initThree(canvasId);

		// Setup scene
		this.setupScene();

		// Set render action
		this.setRenderAction(() => {
			// Update the uniforms
			this.oceanSurfaceMaterial.uniforms.uTime.value = this.clock.getElapsedTime();

			// Set the audio muted states
			this.handleAudio();
		});

		// Start animation loop
		this.animate();
	}

	setupScene() {
		// Set up the scene
		this.addOcean();
		this.addSky();
	}

	addOcean() {
		this.addOceanSurface();
		this.addUnderwaterBox();
	}

	addOceanSurface() {
		// Create a ShaderMaterial for the ocean surface
		this.oceanSurfaceMaterial = new ShaderMaterial({
			vertexShader: oceanVertexShader,
			fragmentShader: oceanFragmentShader,
			uniforms: {
				uTime: new Uniform(0),

				uBigWavesElevation: new Uniform(0.05),
				uBigWavesFrequency: new Uniform(new Vector2(0.8, 4.2)),
				uBigWavesSpeed: new Uniform(0.75),

				uSmallWavesElevation: new Uniform(0.15),
				uSmallWavesFrequency: new Uniform(3.0),
				uSmallWavesSpeed: new Uniform(0.2),
				uSmallIterations: new Uniform(4.0),

				uDepthColor: new Uniform(new Color(this.config.surface.depthColor)),
				uSurfaceColor: new Uniform(new Color(this.config.surface.surfaceColor)),
				uColorOffset: new Uniform(0.08),
				uColorMultiplier: new Uniform(2.1),

				uFogColor: new Uniform(new Color(this.config.fogColor)),
				uFogIntensity: new Uniform(0.5),

				uFoamColor: new Uniform(new Color(this.config.foamColor)),
				uFoamIntensity: new Uniform(1.0)
			},
			side: DoubleSide
		});

		if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
			// Add debug controls
			this.addDebugControls(() => {
				const surfaceFolder = this.gui.addFolder('Surface Settings');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uBigWavesElevation');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesFrequency.value, 'x')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyX');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesFrequency.value, 'y')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyY');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uBigWavesSpeed');

				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uSmallWavesElevation');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesFrequency, 'value')
					.min(0)
					.max(30)
					.step(0.001)
					.name('uSmallWavesFrequency');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uSmallWavesSpeed');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uSmallIterations, 'value')
					.min(0)
					.max(5)
					.step(1)
					.name('uSmallIterations');

				surfaceFolder.addColor(this.config.surface, 'depthColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uDepthColor.value.set(this.config.surface.depthColor);
				});
				surfaceFolder.addColor(this.config.surface, 'surfaceColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uSurfaceColor.value.set(this.config.surface.surfaceColor);
				});
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uColorOffset, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uColorOffset');
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uColorMultiplier, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uColorMultiplier');
				surfaceFolder.addColor(this.config, 'fogColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uFogColor.value.set(this.config.fogColor);
				});
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uFogIntensity, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uFogIntensity');
				surfaceFolder.addColor(this.config, 'foamColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uFoamColor.value.set(this.config.foamColor);
				});
				surfaceFolder
					.add(this.oceanSurfaceMaterial.uniforms.uFoamIntensity, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uFoamIntensity');
			});
		}

		// Create ocean geometry
		const oceanSurfaceGeometry = new PlaneGeometry(
			this.config.dimensions.width,
			this.config.dimensions.depth,
			1024,
			1024
		);

		// Create ocean surface mesh
		const oceanSurface = new Mesh(oceanSurfaceGeometry, this.oceanSurfaceMaterial);

		// Rotate to lay flat
		oceanSurface.rotation.x = -Math.PI / 2;

		// Add to scene
		this.scene.add(oceanSurface);
	}

	addUnderwaterBox() {
		// Create a ShaderMaterial for the underwater environment
		this.underwaterMaterial = new ShaderMaterial({
			vertexShader: underwaterVertexShader,
			fragmentShader: underwaterFragmentShader,
			uniforms: {
				uSurfaceColor: new Uniform(new Color(this.config.underwater.surfaceColor)),
				uDepthColor: new Uniform(new Color(this.config.underwater.depthColor)),
				uFogColor: new Uniform(new Color(this.config.fogColor)),
				uFogIntensity: new Uniform(0.5),
				uLightScattering: new Uniform(1.0)
			},
			side: DoubleSide,
			transparent: true
		});

		if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
			// Add structured debug controls
			this.addDebugControls(() => {
				const underwaterFolder = this.gui.addFolder('Underwater Settings');
				underwaterFolder.addColor(this.config.underwater, 'surfaceColor').onChange(() => {
					this.underwaterMaterial.uniforms.uSurfaceColor.value.set(this.config.underwater.surfaceColor);
				});
				underwaterFolder.addColor(this.config.underwater, 'depthColor').onChange(() => {
					this.underwaterMaterial.uniforms.uDepthColor.value.set(this.config.underwater.depthColor);
				});
				underwaterFolder.addColor(this.config, 'fogColor').onChange(() => {
					this.underwaterMaterial.uniforms.uFogColor.value.set(this.config.fogColor);
				});
				underwaterFolder
					.add(this.underwaterMaterial.uniforms.uFogIntensity, 'value')
					.min(0)
					.max(5)
					.step(0.001)
					.name('uFogIntensity');
				underwaterFolder
					.add(this.underwaterMaterial.uniforms.uLightScattering, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uLightScattering');
			});
		}

		// Create a large box geometry to encompass the underwater area
		const underwaterBoxGeometry = new BoxGeometry(
			this.config.dimensions.width,
			this.config.dimensions.height,
			this.config.dimensions.depth
		);

		// Position underwater box
		underwaterBoxGeometry.translate(0, -this.config.dimensions.height / 2, 0);

		// Create a mesh with the underwater box geometry and material
		const underwaterBox = new Mesh(underwaterBoxGeometry, this.underwaterMaterial);

		// Add the underwater box to the scene
		this.scene.add(underwaterBox);
	}

	addSky() {
		// Load the EXR sky texture
		this.EXRLoader.load(this.config.skyEXRPath, (texture) => {
			// Set texture mapping
			texture.mapping = EquirectangularReflectionMapping;

			// Set scene background
			this.scene.background = texture;
		});
	}

	handleAudio() {
		const submergeAudio = document.getElementById('submerge-audio');
		const oceanAudio = document.getElementById('ocean-audio');
		const underwaterAudio = document.getElementById('underwater-bg-audio');

		if (this.camera.position.y <= 0) {
			if (submergeAudio.paused) {
				// Play submerge audio
				submergeAudio.pause();
				submergeAudio.muted = false;
				submergeAudio.currentTime = 0;
				submergeAudio.volume = 0.1;
				submergeAudio.play();
			}

			// Unmute underwater audio
			underwaterAudio.muted = false;

			// Mute ocean audio
			oceanAudio.muted = true;

			return;
		}

		// Mute submerge and reset
		submergeAudio.pause();
		submergeAudio.muted = true;
		submergeAudio.currentTime = 0;

		// Mute underwater audio
		underwaterAudio.muted = true;

		// Unmute ocean audio
		oceanAudio.muted = false;
	}
}

export default new Scene();
