<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './api';
import { currentUser } from './session';
const router = useRouter(), error = ref(''), busy = ref(false);
async function logout() {
  busy.value = true; error.value = '';
  try { await api('/auth/logout', 'POST'); currentUser.value = null; await router.push('/login'); }
  catch (e) { error.value = (e as Error).message; } finally { busy.value = false; }
}
</script>
<template>
  <a class="skip" href="#main">跳到主要内容</a>
  <header><div class="header-inner"><RouterLink class="brand" to="/surveys"><span class="brand-mark" aria-hidden="true">问</span>问卷工作台</RouterLink>
    <nav aria-label="主导航" v-if="currentUser"><RouterLink to="/surveys">我的问卷</RouterLink><span class="username">{{ currentUser.username }}</span><button class="quiet" :disabled="busy" @click="logout">{{ busy ? '退出中…' : '退出登录' }}</button></nav>
  </div></header>
  <main id="main"><p v-if="error" role="alert" class="error">{{ error }}</p><RouterView :key="$route.fullPath" /></main>
  <footer>数据库课程项目 · 第一版工作台</footer>
</template>
