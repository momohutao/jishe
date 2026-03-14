<template>
  <div id="app">
    <!-- 导航栏 -->
    <header class="navbar">
      <!-- 左侧 Logo 和项目名称 -->
      <div class="logo">
        <span class="logo-icon">🤖</span>
        <span class="project-name">AI 助手</span>
      </div>

      <!-- 右侧导航链接 -->
      <nav class="nav-links">
        <router-link to="/ai-slide">AI 幻灯片</router-link>
        <router-link to="/ai-doc">AI 文档</router-link>
        <router-link to="/login">登录</router-link>
      </nav>
    </header>

    <!-- 路由组件渲染区域 -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style scoped>
/* 整体布局 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

/* Logo 区域 */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 1.8rem;
}

.project-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #495057;
}

/* 导航链接 */
.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #42b983;
}

/* 当前激活的链接样式（可根据需要调整） */
.nav-links a.router-link-exact-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

/* 主内容区域 */
main {
  padding: 20px;
}
</style>
