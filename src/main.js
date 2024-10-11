import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import router from './router';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

const options = {};

app.use(router);
app.use(Toast, options);

app.mount('#app');