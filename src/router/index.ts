import { createRouter, createWebHistory } from 'vue-router';

const HomeView = () => import('../views/HomeView.vue');
const BoxDetailView = () => import('../views/BoxDetailView.vue');
const DrawResultView = () => import('../views/DrawResultView.vue');
const ProfileView = () => import('../views/ProfileView.vue');
const CartView = () => import('../views/CartView.vue');
const AddressView = () => import('../views/AddressView.vue');
const SettingsView = () => import('../views/SettingsView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/detail/:id', name: 'detail', component: BoxDetailView, props: true },
    { path: '/result', name: 'result', component: DrawResultView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/address', name: 'address', component: AddressView },
    { path: '/settings', name: 'settings', component: SettingsView }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
