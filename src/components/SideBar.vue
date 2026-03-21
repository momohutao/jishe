<template>
  <div :class="['sidebar-container', { 'is-collapsed': !isOpen }]">
    <div class="sidebar-header">
      <div class="logo-area" v-show="isOpen">
        <button class="new-chat-btn" @click="$emit('new-chat')">
          <span class="plus-icon">＋</span>
          <span class="btn-text">开启新对话</span>
        </button>
      </div>
      <button class="toggle-btn" @click="$emit('toggle')">
        {{ isOpen ? '◀' : '▶' }}
      </button>
    </div>

    <div class="sidebar-content" v-show="isOpen">
    
      <!-- 1. 个人画像 -->
      <section class="menu-section">
        <h4 class="section-title interactive-title">
          <div class="title-left">
            <!-- 默认显示的黑色图标 -->
            <img src="../assets/images/个人画像.png" alt="" class="icon-img icon-default" />
            <!-- 悬浮时显示的蓝色图标 -->
            <img src="../assets/images/个人画像2.png" alt="" class="icon-img icon-hover" />
            <span class="title-text">个人画像</span>
          </div>
          <!-- 点击开关时阻止冒泡 -->
          <label class="switch" @click.stop>
            <input type="checkbox" />
            <span class="slider"></span>
          </label>
        </h4>
      </section>

      <!-- 2. 历史记录 -->
      <section class="menu-section">
        <h4 class="section-title interactive-title">
          <div class="title-left">
            <!-- 默认显示的黑色图标 -->
            <img src="../assets/images/历史记录.png" alt="" class="icon-img icon-default" />
            <!-- 悬浮时显示的蓝色图标 -->
            <img src="../assets/images/历史记录2.png" alt="" class="icon-img icon-hover" />
            <span class="title-text">历史记录</span>
          </div>
        </h4>
        <div class="list-items">
          <div
            class="item"
            v-for="item in history"
            :key="item.id"
            @click="$emit('load-history', item)"
          >
            {{ item.title }}
          </div>
        </div>
      </section>

      <!-- 3. 个人知识库 -->
      <section class="menu-section">
        <h4 class="section-title interactive-title" @click="goToKnowledge">
          <div class="title-left">
            <!-- 默认显示的黑色图标 -->
            <img src="../assets/images/知识库.png" alt="" class="icon-img icon-default" />
            <!-- 悬浮时显示的蓝色图标 -->
            <img src="../assets/images/知识库2.png" alt="" class="icon-img icon-hover" />
            <span class="title-text">个人知识库</span>
          </div>
          <span class="enter-arrow">进入 ➔</span>
        </h4>
        <div class="list-items">
          <div class="item">📖 2026人工智能白皮书.pdf</div>
          <div class="item">📊 市场调研数据.xlsx</div>
        </div>
      </section>

      <!-- 4. 模板库 -->
      <section class="menu-section">
        <h4 class="section-title interactive-title" @click="router.push('/templates')">
          <div class="title-left">
            <!-- 默认显示的黑色图标 -->
            <img src="../assets/images/模板库.png" alt="" class="icon-img icon-default" />
            <!-- 悬浮时显示的蓝色图标 -->
            <img src="../assets/images/模板库2.png" alt="" class="icon-img icon-hover" />
            <span class="title-text">模板库</span>
          </div>
          <span class="enter-arrow">进入 ➔</span>
        </h4>
      </section>
    </div>

    <div class="sidebar-footer" v-show="isOpen" @click="handleLogout">
      <div class="user-profile">
        <div class="user-avatar">
          <img src="../assets/images/头像.png" alt="avatar" />
        </div>
        <div class="user-info">
          <div class="user-name">MomoHutao</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToKnowledge = () => {
  router.push('/knowledge')
}

defineProps({
  isOpen: Boolean,
  history: Array,
})

const emit = defineEmits(['toggle', 'logout', 'new-chat', 'load-history'])

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    emit('logout')
  }
}
</script>

<style scoped>
/* =========== 基础布局 =========== */
.sidebar-container {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100vh;
}

.sidebar-container.is-collapsed {
  width: 60px;
}

.sidebar-header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f5f5f5;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 18px;
  color: #1677ff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.menu-section {
  margin-bottom: 24px;
}

/* =========== 核心优化：标题与排版 =========== */
.section-title {
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  user-select: none;
}

/* 带有交互效果的标题容器 */
.interactive-title {
  cursor: pointer;
}

/* 左侧：图标 + 文字的包裹层 */
.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 图标与文字的标准间距 */
}

/* 统一图标样式（稍微调小一点，让侧边栏显得更精致） */
.icon-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 统一文字样式 */
.title-text {
  font-size: 15px;
  color: #333;
  font-weight: 800;
  transform-origin: left center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 右侧箭头提示（默认隐藏，悬浮时飞入） */
.enter-arrow {
  font-size: 13px;
  color: #1677ff;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

/* =========== 核心优化：Hover 动态交互效果 =========== */

/* 1. 悬浮时整行背景变浅蓝 */
.interactive-title:hover {
  background-color: #f0f5ff;
}

/* 2. 悬浮时：文字变大 + 变蓝 */
.interactive-title:hover .title-text {
  color: #1677ff;
  transform: scale(1.08);
  /* 文字放大 1.08倍 */
}

/* 3. 悬浮时：图片放大 + 变蓝 */
.interactive-title:hover .icon-img {
  transform: scale(1.15);
  /* 图片稍微放大 */
  /* CSS 魔法滤镜：将原始图标色彩转换为主题蓝色 (#1677ff) */
}
.icon-hover {
  display: none; /* 默认状态隐藏蓝色图标 */
}
.interactive-title:hover .icon-default {
  display: none; /* 悬浮时隐藏黑色图标 */
}

.interactive-title:hover .icon-hover {
  display: block; /* 悬浮时显示蓝色图标 */
}
/* 4. 悬浮时：箭头淡入滑出 */
.interactive-title:hover .enter-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* =========== 下方列表与个人信息区域 =========== */
.list-items .item {
  padding: 8px 12px 8px 42px;
  margin-bottom: 4px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  font-weight: normal;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-items .item:hover {
  background-color: #f5f7fa;
  color: #1677ff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f5f5f5;
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eee;
}

.user-avatar img {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 14px;
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #4e78f6;
}

input:checked + .slider:before {
  transform: translateX(15px);
}
.new-chat-btn-wrapper {
  margin-bottom: 24px;
}
.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}

.new-chat-btn:hover {
  background-color: #4096ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.new-chat-btn:active {
  transform: translateY(1px);
  box-shadow: none;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}
</style>