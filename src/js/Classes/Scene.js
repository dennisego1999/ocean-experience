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
		this.particleGeometry = null;

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
				height: 250,
				width: 250,
				depth: 250
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

			// Animate the particles
			this.animateParticles();

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
		this.addParticles();
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
			this.config.dimensions.height,
			512,
			512
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

	addParticles() {
		// Create a massive amount of particles
		this.particleGeometry = new BufferGeometry();
		const positions = new Float32Array(this.particleCount * 3);
		const velocities = new Float32Array(this.particleCount * 3);
		const colors = new Float32Array(this.particleCount * 3);

		// Initialize particle positions, velocities, and colors
		for (let i = 0; i < this.particleCount; i++) {
			// Randomize positions within the underwater box, ensuring they are in front of the camera
			positions[i * 3] = (Math.random() - 0.5) * this.config.dimensions.width * 2; // X
			positions[i * 3 + 1] = -(Math.random() * this.config.dimensions.height); // Y (below surface)
			positions[i * 3 + 2] = -(Math.random() * this.config.dimensions.depth); // Z (in front of the camera)

			// Randomize velocities for smooth drifting
			velocities[i * 3] = (Math.random() - 0.5) * 0.01; // Velocity in X
			velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01; // Velocity in Y
			velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01; // Velocity in Z

			// Randomize particle colors (R, G, B)
			colors[i * 3] = Math.random(); // Red
			colors[i * 3 + 1] = Math.random(); // Green
			colors[i * 3 + 2] = Math.random(); // Blue
		}

		// Assign attributes to the geometry
		this.particleGeometry.setAttribute('position', new BufferAttribute(positions, 3));
		this.particleGeometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
		this.particleGeometry.setAttribute('color', new BufferAttribute(colors, 3));

		// Create a PointsMaterial for the particles with vertex colors
		const particleMaterial = new PointsMaterial({
			size: 0.1, // Particle size
			transparent: true,
			opacity: 0.7, // Slight transparency
			depthWrite: false, // Disable depth write for better blending
			vertexColors: true // Enable vertex colors
		});

		// Create the particle system
		const particles = new Points(this.particleGeometry, particleMaterial);
		this.scene.add(particles);
	}

	animateParticles() {
		const positions = this.particleGeometry.attributes.position.array;
		const velocities = this.particleGeometry.attributes.velocity.array;

		for (let i = 0; i < this.particleCount; i++) {
			// Update particle positions based on velocity
			positions[i * 3] += velocities[i * 3]; // X
			positions[i * 3 + 1] += velocities[i * 3 + 1]; // Y
			positions[i * 3 + 2] += velocities[i * 3 + 2]; // Z

			// Reset particles if they go out of bounds (respect underwater box dimensions)
			if (positions[i * 3] > this.config.dimensions.width || positions[i * 3] < -this.config.dimensions.width) {
				positions[i * 3] = (Math.random() - 0.5) * this.config.dimensions.width * 2;
			}
			if (positions[i * 3 + 1] > 0 || positions[i * 3 + 1] < -this.config.dimensions.height) {
				positions[i * 3 + 1] = -(Math.random() * this.config.dimensions.height);
			}
			if (positions[i * 3 + 2] > 0 || positions[i * 3 + 2] < -this.config.dimensions.depth) {
				positions[i * 3 + 2] = -(Math.random() * this.config.dimensions.depth); // Keep in front of the camera
			}
		}

		// Notify Three.js of position updates
		this.particleGeometry.attributes.position.needsUpdate = true;
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
