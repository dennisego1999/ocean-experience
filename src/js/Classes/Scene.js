import ThreeManager from '@/Classes/ThreeManager.js';

class Scene extends ThreeManager {
	constructor() {
		super();
	}

	init(canvasId) {
		// Init three scene
		this.initThree(canvasId);

		// Setup scene
		this.setupScene();

		// Set render action
		this.setRenderAction(() => {
			// TODO: add render action here
		});

		// Start animation loop
		this.animate();
	}

	setupScene() {}
}

export default new Scene();
