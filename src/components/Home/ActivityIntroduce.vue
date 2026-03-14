<template>
  <div class="activity-introduce">
    <!-- 导航栏 -->
    <div class="nav-grid">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="nav-item"
        :class="{ selected: selectedIndex === index }"
        @click="selectItem(index)"
      >
        <span class="icon">{{ item.icon }}</span>
        {{ item.text }}
      </div>
    </div>

    <!-- 内容区域：根据选中项展示不同内容 -->
    <div class="content-area">
      <!-- 编写教案（索引0）使用子组件 LessonPlan -->
      <LessonPlan v-if="selectedIndex === 0" ref="lessonPlanRef" />

      <!-- 其他导航项的占位提示 -->
      <div v-else class="content-placeholder">
        <p>✨ 其他功能开发中，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LessonPlan from '../activity/LessonPlan.vue' // 根据实际路径调整

const items = [
  { icon: '📄', text: '编写教案' },
  { icon: '🤖', text: '通用智能体' },
  { icon: '📽️', text: '制作幻灯片' },
  { icon: '📊', text: '数据分析' },
]

const selectedIndex = ref(0)
const lessonPlanRef = ref(null)

const selectItem = (index) => {
  if (selectedIndex.value === index) {
    // 点击已选中的项：如果是教案，则重置播放动画
    if (index === 0) {
      lessonPlanRef.value?.resetAndPlay()
    }
    // 其他项可在此添加额外交互（如刷新占位内容）
  } else {
    selectedIndex.value = index
    // 切换后，子组件会自动挂载并播放（onMounted 已处理）
  }
}
</script>

<style scoped>
.activity-introduce {
  width: 100%;
  padding: 40px 20px;
  background-color: #ffffff;
}

.nav-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 40px auto;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 0 1 auto;
  min-width: 160px;
  padding: 16px 24px;
  background-color: #ffffff;
  border: 1px solid transparent;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  font-size: 18px;
  font-weight: 500;
  color: #1a2b3c;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
  line-height: 1.4;
}

.nav-item:hover {
  border-color: #eaeef2;
  background-color: #f9fafc;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.nav-item.selected {
  background-color: #e0e0e0;
}

.nav-item.selected:hover {
  background-color: #d0d0d0;
  border-color: #eaeef2;
}

.icon {
  font-size: 24px;
  line-height: 1;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
}

/* 其他功能占位样式 */
.content-placeholder {
  text-align: center;
  padding: 80px 20px;
  background-color: #f9fafc;
  border-radius: 32px;
  border: 1px dashed #d0d9e0;
  color: #7f8c8d;
  font-size: 18px;
}

/* 响应式导航调整 */
@media (max-width: 768px) {
  .nav-grid {
    gap: 16px;
  }
  .nav-item {
    min-width: 140px;
    padding: 12px 16px;
    font-size: 16px;
  }
  .icon {
    font-size: 20px;
  }
}
</style>
