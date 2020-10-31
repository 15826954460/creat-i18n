import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from '@/pages/Home';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home-page',
      component: HomePage,
    }
  ]
});

router.beforeEach((to, from, next) => {
  next();
})

export default router;