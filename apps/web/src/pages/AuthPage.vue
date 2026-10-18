<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { User } from '@survey/shared';
import { api } from '../api';
import UiIcon from '../components/UiIcon.vue';
import { currentUser } from '../session';
const route = useRoute(), router = useRouter();
const register = computed(() => route.path === '/register');
const username = ref(''), password = ref(''), error = ref(''), busy = ref(false);
async function submit() {
  error.value = ''; busy.value = true;
  try {
    const result = await api<User>(register.value ? '/auth/register' : '/auth/login', 'POST', { username: username.value, password: password.value });
    password.value = '';
    if (register.value) { await router.push({ path: '/login', query: { registered: '1', ...(typeof route.query.next === 'string' ? { next: route.query.next } : {}) } }); }
    else { currentUser.value = result; const next = typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//') && new URL(route.query.next, location.origin).origin === location.origin ? route.query.next : '/dashboard'; await router.push(next); }
  } catch (e) { error.value = (e as Error).message; } finally { busy.value = false; }
}
</script>
<template><section class="auth-layout"><div class="intro"><span class="auth-context"><UiIcon name="document" :size="18"/> 问卷工作台</span><h1 tabindex="-1">{{ register ? '创建你的账号' : '回到问卷工作台' }}</h1><p>将调查想法整理成问卷。你的草稿会保存在这里，下次登录可以继续查看。</p><div class="auth-scene" aria-label="问卷结构示意"><div class="scene-toolbar"><span></span><span></span><span></span><small>问卷结构示意</small></div><div class="scene-body"><span class="scene-label">从问题，到理解</span><strong>把想了解的事，问清楚。</strong><div class="scene-question"><span class="scene-type"><UiIcon name="single" :size="16"/> 单选题</span><div class="scene-option"><i></i><span>清晰的选项</span></div><div class="scene-option is-picked"><i></i><span>准确的表达</span><UiIcon name="check" :size="14"/></div></div><div class="scene-question"><span class="scene-type"><UiIcon name="text" :size="16"/> 文本题</span><div class="scene-text">给不同的想法，留下表达空间。</div></div></div><span class="scene-seal"><UiIcon name="check" :size="16"/> 设计 · 收集 · 理解</span></div><p class="auth-footnote"><UiIcon name="layers" :size="18"/> 保存草稿，保留每一次发布版本。</p></div>
<div class="panel auth-panel"><span class="auth-form-icon"><UiIcon name="shield" :size="24"/></span><h2>{{ register ? '注册' : '登录' }}</h2><p class="auth-form-description">{{ register ? '创建账号，开启你的第一份调查。' : '登录账号，继续你的调查与发现。' }}</p><p v-if="route.query.registered" class="success" role="status">注册成功，请使用新账号登录。</p><p v-if="error" class="error" role="alert">{{ error }}</p>
<form @submit.prevent="submit"><label for="username">用户名</label><input id="username" v-model="username" autocomplete="username" required maxlength="100" aria-describedby="username-help"><small id="username-help">1–50 个字符，忽略首尾空格和大小写。</small>
<label for="password">密码</label><input id="password" v-model="password" type="password" :autocomplete="register ? 'new-password' : 'current-password'" required minlength="8" maxlength="256" aria-describedby="password-help"><small id="password-help">8–128 个字符，空格也是密码的一部分。</small>
<button class="primary full" :disabled="busy">{{ busy ? '请稍候…' : register ? '创建账号' : '登录' }}</button></form>
<p class="auth-switch">{{ register ? '已有账号？' : '还没有账号？' }} <RouterLink :to="{ path: register ? '/login' : '/register', query: typeof route.query.next === 'string' ? { next: route.query.next } : {} }">{{ register ? '去登录' : '注册账号' }}</RouterLink></p></div></section></template>
