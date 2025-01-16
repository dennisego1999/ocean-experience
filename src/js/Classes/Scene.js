import {
	Color,
	DoubleSide,
	EquirectangularReflectionMapping,
	Mesh,
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Vector2
} from 'three';
import ThreeManager from '@js/Classes/ThreeManager.js';
import oceanVertexShader from '@shaders/Ocean/Vertex.glsl';
import oceanFragmentShader from '@shaders/Ocean/Fragment.glsl';

class Scene extends ThreeManager {
	constructor() {
		super();

		this.oceanMaterial = null;
		this.config = {
			depthColor: '#186691',
			surfaceColor: '#9bd8ff',
			fogColor: '#ffffff',
			foamColor: '#ffffff'
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
			this.oceanMaterial.uniforms.uTime.value = this.clock.getElapsedTime();
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
		// Creat ocean shader material
		this.oceanMaterial = new ShaderMaterial({
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

				uDepthColor: new Uniform(new Color(this.config.depthColor)),
				uSurfaceColor: new Uniform(new Color(this.config.surfaceColor)),
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
				this.gui
					.add(this.oceanMaterial.uniforms.uBigWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uBigWavesElevation');
				this.gui
					.add(this.oceanMaterial.uniforms.uBigWavesFrequency.value, 'x')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyX');
				this.gui
					.add(this.oceanMaterial.uniforms.uBigWavesFrequency.value, 'y')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyY');
				this.gui
					.add(this.oceanMaterial.uniforms.uBigWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uBigWavesSpeed');

				this.gui
					.add(this.oceanMaterial.uniforms.uSmallWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uSmallWavesElevation');
				this.gui
					.add(this.oceanMaterial.uniforms.uSmallWavesFrequency, 'value')
					.min(0)
					.max(30)
					.step(0.001)
					.name('uSmallWavesFrequency');
				this.gui
					.add(this.oceanMaterial.uniforms.uSmallWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uSmallWavesSpeed');
				this.gui
					.add(this.oceanMaterial.uniforms.uSmallIterations, 'value')
					.min(0)
					.max(5)
					.step(1)
					.name('uSmallIterations');

				this.gui.addColor(this.config, 'depthColor').onChange(() => {
					this.oceanMaterial.uniforms.uDepthColor.value.set(this.config.depthColor);
				});
				this.gui.addColor(this.config, 'surfaceColor').onChange(() => {
					this.oceanMaterial.uniforms.uSurfaceColor.value.set(this.config.surfaceColor);
				});
				this.gui.add(this.oceanMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
				this.gui
					.add(this.oceanMaterial.uniforms.uColorMultiplier, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uColorMultiplier');
				this.gui.addColor(this.config, 'fogColor').onChange(() => {
					this.oceanMaterial.uniforms.uFogColor.value.set(this.config.fogColor);
				});
				this.gui
					.add(this.oceanMaterial.uniforms.uFogIntensity, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uFogIntensity');
				this.gui.addColor(this.config, 'foamColor').onChange(() => {
					this.oceanMaterial.uniforms.uFoamColor.value.set(this.config.foamColor);
				});
				this.gui
					.add(this.oceanMaterial.uniforms.uFoamIntensity, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uFoamIntensity');
			});
		}

		// Create ocean geometry
		const oceanGeometry = new PlaneGeometry(150, 150, 512, 512);

		// Create ocean mesh
		const ocean = new Mesh(oceanGeometry, this.oceanMaterial);

		// Adjust ocean
		ocean.rotation.x = -Math.PI / 2;

		// Add to scene
		this.scene.add(ocean);
	}

	addSky() {
		// Load the sky file
		this.EXRLoader.load('/assets/images/sky.exr', (texture) => {
			// Set texture mapping
			texture.mapping = EquirectangularReflectionMapping;

			// Set scene background
			this.scene.background = texture;
		});
	}
}

export default new Scene();
