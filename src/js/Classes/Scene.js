import {
	BoxGeometry,
	Color,
	DoubleSide,
	EquirectangularReflectionMapping,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Vector2
} from 'three';
import ThreeManager from '@js/Classes/ThreeManager.js';
import oceanVertexShader from '@shaders/OceanSurface/Vertex.glsl';
import oceanFragmentShader from '@shaders/OceanSurface/Fragment.glsl';

class Scene extends ThreeManager {
	constructor() {
		super();

		this.oceanSurfaceMaterial = null;
		this.config = {
			depthColor: '#186691',
			surfaceColor: '#9bd8ff',
			fogColor: '#ffffff',
			foamColor: '#ffffff',
			dimensions: {
				height: 150,
				width: 150,
				depth: 150
			}
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
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uBigWavesElevation');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesFrequency.value, 'x')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyX');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesFrequency.value, 'y')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uBigWavesFrequencyY');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uBigWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uBigWavesSpeed');

				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesElevation, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uSmallWavesElevation');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesFrequency, 'value')
					.min(0)
					.max(30)
					.step(0.001)
					.name('uSmallWavesFrequency');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uSmallWavesSpeed, 'value')
					.min(0)
					.max(4)
					.step(0.001)
					.name('uSmallWavesSpeed');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uSmallIterations, 'value')
					.min(0)
					.max(5)
					.step(1)
					.name('uSmallIterations');

				this.gui.addColor(this.config, 'depthColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uDepthColor.value.set(this.config.depthColor);
				});
				this.gui.addColor(this.config, 'surfaceColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uSurfaceColor.value.set(this.config.surfaceColor);
				});
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uColorOffset, 'value')
					.min(0)
					.max(1)
					.step(0.001)
					.name('uColorOffset');
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uColorMultiplier, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uColorMultiplier');
				this.gui.addColor(this.config, 'fogColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uFogColor.value.set(this.config.fogColor);
				});
				this.gui
					.add(this.oceanSurfaceMaterial.uniforms.uFogIntensity, 'value')
					.min(0)
					.max(10)
					.step(0.001)
					.name('uFogIntensity');
				this.gui.addColor(this.config, 'foamColor').onChange(() => {
					this.oceanSurfaceMaterial.uniforms.uFoamColor.value.set(this.config.foamColor);
				});
				this.gui
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
			this.config.dimensions.height,
			512,
			512
		);

		// Create ocean surface mesh
		const oceanSurface = new Mesh(oceanSurfaceGeometry, this.oceanSurfaceMaterial);

		// Adjust the ocean surface mesh
		oceanSurface.rotation.x = -Math.PI / 2;

		// Add to scene
		this.scene.add(oceanSurface);

		// Add ocean subsurface geometry below the ocean
		const oceanSubsurfaceGeometry = new BoxGeometry(
			this.config.dimensions.width,
			this.config.dimensions.height,
			this.config.dimensions.depth
		);
		const oceanSubsurfaceMaterial = new ShaderMaterial({ side: DoubleSide });
		const oceanSubsurface = new Mesh(oceanSubsurfaceGeometry, oceanSubsurfaceMaterial);

		// Translate the geometry to align the bottom at the ocean plane (0, 0, 0)
		// Move down by half the height to position the bottom of the box at y = 0
		// Origin is by default at center
		const offsetHeight = this.config.dimensions.height + 0.45;
		oceanSubsurfaceGeometry.translate(0, -offsetHeight / 2, 0);

		// Add the ocean subsurface to the scene
		this.scene.add(oceanSubsurface);
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
