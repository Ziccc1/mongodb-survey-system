import { ref } from 'vue';
import type { User } from '@survey/shared';
import { api, RequestError } from './api';
export const currentUser = ref<User | null>(null);
export async function restoreSession() {
  try { currentUser.value = await api<User>('/auth/me'); }
  catch (error) { if (error instanceof RequestError && error.status === 401) currentUser.value = null; else throw error; }
}
