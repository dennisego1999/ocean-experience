import { createApp } from 'vue';
import './styles/app.scss';
import router from '@/Router';
import App from '@/Layouts/AppLayout.vue';

const app = createApp(App);
app.use(router).mount('#app');
