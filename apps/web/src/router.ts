import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from './pages/AuthPage.vue';
import ListPage from './pages/ListPage.vue';
import CreatePage from './pages/CreatePage.vue';
import EditorPage from './pages/EditorPage.vue';
import { restoreSession, currentUser } from './session';
export const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', redirect: '/surveys' }, { path: '/login', component: AuthPage }, { path: '/register', component: AuthPage },
  { path: '/surveys', component: ListPage, meta: { protected: true } },
  { path: '/surveys/new', component: CreatePage, meta: { protected: true } },
  { path: '/surveys/:surveyId', component: EditorPage, meta: { protected: true } },
  { path: '/:pathMatch(.*)*', redirect: '/surveys' },
] });
router.beforeEach(async to => {
  if (!to.meta.protected) return;
  // Confirm the cookie with the server even on direct navigation / refresh.
  try { await restoreSession(); } catch { return true; } // Page shows retryable network failure.
  if (!currentUser.value) return '/login';
});
router.afterEach(async () => { document.title = '问卷工作台'; setTimeout(() => document.querySelector<HTMLElement>('h1')?.focus(), 0); });
