<template>
  <div class="knowledge-base-page">
    <!-- 顶部导航栏 -->
    <header class="kb-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回对话
        </button>
        <h2 class="page-title"><img src="../assets/images/知识库2.png" alt="" class="icon-img">个人本地知识库</h2>
      </div>
      <div class="header-right">
        <button class="upload-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          上传新资料
        </button>
      </div>
    </header>

    <!-- 知识库内容区 -->
    <div class="kb-content">
      <div class="files-grid">
        <div class="file-card" v-for="file in fileList" :key="file.id">
          <!-- 文件类型图标 -->
          <div class="file-icon" :class="'icon-' + file.type">
            <img :src="getFileIcon(file.type)" alt="icon" class="file-type-img">
          </div>
          <!-- 文件信息 -->
          <div class="file-info">
            <h4 class="file-name" :title="file.name">{{ file.name }}</h4>
            <div class="file-meta">
              <span>{{ file.size }}</span>
              <span>{{ file.date }}</span>
            </div>
          </div>
          <!-- 悬浮操作菜单 -->
          <div class="file-actions">
            <button class="action-btn" title="引用到对话">💬</button>
            <button class="action-btn" title="预览文件">👁️</button>
            <button class="action-btn" title="删除">🗑️</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/chat') // 返回首页聊天界面
}

// 获取文件图标的辅助函数
const getFileIcon = (type) => {
  const iconMap = {
    pdf: 'src/assets/images/pdf.png',
    word: 'src/assets/images/word.png',
    ppt: 'src/assets/images/ppt.png',
    video: 'src/assets/images/video.png',
    excel: 'src/assets/images/excel.png'
  }
  return iconMap[type] || '📁'
}

// 模拟 A04 赛题相关的本地知识库文件数据 (10个左右)
const fileList = ref([
  { id: 1, name: 'A04_多模态AI互动式教学智能体赛题.pdf', type: 'pdf', size: '2.4 MB', date: '2023-10-24' },
  { id: 2, name: '锐捷网络_ICT基础设施解决方案.pdf', type: 'pdf', size: '5.1 MB', date: '2023-10-25' },
  { id: 3, name: '第一章_人工智能发展史教案.word', type: 'word', size: '1.2 MB', date: '2023-10-26' },
  { id: 4, name: '深度学习算法核心知识点梳理.ppt', type: 'ppt', size: '8.5 MB', date: '2023-10-26' },
  { id: 5, name: '云课堂多模态交互演示素材.video', type: 'video', size: '45.0 MB', date: '2023-10-27' },
  { id: 6, name: '大模型检索增强RAG技术白皮书.pdf', type: 'pdf', size: '3.6 MB', date: '2023-10-28' },
  { id: 7, name: '教学意图理解与知识融合模块设计.word', type: 'word', size: '890 KB', date: '2023-10-29' },
  { id: 8, name: '数字人教师授课测试片段.video', type: 'video', size: '120 MB', date: '2023-10-29' },
  { id: 9, name: 'AI辅助教学工具市场调研数据.excel', type: 'excel', size: '150 KB', date: '2023-10-30' },
  { id: 10, name: '最终提交_项目演示与PPT生成结果.video', type: 'video', size: '250 MB', date: '2023-10-31' }
])
</script>

<style scoped>
.knowledge-base-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f4f6f9;
}

/* 顶部导航 */
.kb-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #1677ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background-color: #4096ff;
}

/* 内容区与网格布局 */
.kb-content {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
}

.files-grid {
  display: grid;
  /* 响应式网格布局，最小宽度220px */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* 文件卡片样式 */
.file-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

/* 各类文件的图标颜色区分 */
.file-icon {
  font-size: 48px;
  margin-bottom: 16px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.icon-pdf {
  background: #ffe6e6;
  color: #ff4d4f;
}

.icon-word {
  background: #e6f0ff;
  color: #1677ff;
}

.icon-ppt {
  background: #fff1f0;
  color: #fa541c;
}

.icon-video {
  background: #f9f0ff;
  color: #722ed1;
}

.icon-excel {
  background: #f6ffed;
  color: #52c41a;
}

.file-info {
  width: 100%;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 最多显示两行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  height: 40px;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 鼠标悬浮时显示的操作按钮 */
.file-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s;
}

.file-card:hover .file-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.file-type-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.icon-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  padding: 10px;
}
</style>