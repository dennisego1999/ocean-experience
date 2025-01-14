import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), glsl()],
	resolve: {
		alias: {
			'@js': '/src/js',
			'@shaders': '/src/shaders',
			'@assets': '/src/assets'
		}
	}
});
