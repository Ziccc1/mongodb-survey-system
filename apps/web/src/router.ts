import FillPage from './pages/FillPage.vue';
import VersionsPage from './pages/VersionsPage.vue';
import StatisticsPage from './pages/StatisticsPage.vue';
import HistoryPage from './pages/HistoryPage.vue';
import AnswerListPage from './pages/AnswerListPage.vue';
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
  { path: '/surveys/:surveyId/preview', component: FillPage, meta: { protected: true, preview: true } },
  { path: '/survey/:publicId', component: FillPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/versions', component: VersionsPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/statistics', component: StatisticsPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/questions/:questionId/statistics', component: StatisticsPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/questions/:questionId/answers', component: AnswerListPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/responses', component: HistoryPage, meta: { protected: true } },
  { path: '/surveys/:surveyId/responses/:responseId', component: HistoryPage, meta: { protected: true } },
  { path: '/:pathMatch(.*)*', redirect: '/surveys' },
] });
router.beforeEach(async to => {
  if (!to.meta.protected) return;
  // Confirm the cookie with the server even on direct navigation / refresh.
  try { await restoreSession(); } catch { return true; } // Page shows retryable network failure.
  if (!currentUser.value) return { path: '/login', query: { next: to.fullPath } };
});
router.afterEach(async () => { document.title = '问卷工作台'; setTimeout(() => document.querySelector<HTMLElement>('h1')?.focus(), 0); });
