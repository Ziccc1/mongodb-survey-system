<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { User } from '@survey/shared';
import { api } from '../api';
import { currentUser } from '../session';
const route = useRoute(), router = useRouter();
const register = computed(() => route.path === '/register');
const username = ref(''), password = ref(''), error = ref(''), busy = ref(false);
async function submit() {
  error.value = ''; busy.value = true;
  try {
    const result = await api<User>(register.value ? '/auth/register' : '/auth/login', 'POST', { username: username.value, password: password.value });
    password.value = '';
    if (register.value) { await router.push({ path: '/login', query: { registered: '1' } }); }
    else { currentUser.value = result; await router.push('/surveys'); }
  } catch (e) { error.value = (e as Error).message; } finally { busy.value = false; }
}
</script>
<template><section class="auth-layout"><div class="intro"><p class="eyebrow">从一个问题开始</p><h1 tabindex="-1">{{ register ? '创建你的账号' : '回到问卷工作台' }}</h1><p>将调查想法整理成问卷。你的草稿会保存在这里，下次登录可以继续查看。</p><div class="intro-note"><span aria-hidden="true">01 /</span> 先保存想法，再逐步完善。</div></div>
<div class="panel auth-panel"><h2>{{ register ? '注册' : '登录' }}</h2><p v-if="route.query.registered" class="success" role="status">注册成功，请使用新账号登录。</p><p v-if="error" class="error" role="alert">{{ error }}</p>
<form @submit.prevent="submit"><label for="username">用户名</label><input id="username" v-model="username" autocomplete="username" required maxlength="100" aria-describedby="username-help"><small id="username-help">1–50 个字符，忽略首尾空格和大小写。</small>
<label for="password">密码</label><input id="password" v-model="password" type="password" :autocomplete="register ? 'new-password' : 'current-password'" required minlength="8" maxlength="256" aria-describedby="password-help"><small id="password-help">8–128 个字符，空格也是密码的一部分。</small>
<button class="primary full" :disabled="busy">{{ busy ? '请稍候…' : register ? '创建账号' : '登录' }}</button></form>
<p class="auth-switch">{{ register ? '已有账号？' : '还没有账号？' }} <RouterLink :to="register ? '/login' : '/register'">{{ register ? '去登录' : '注册账号' }}</RouterLink></p></div></section></template>
