<template>
  <div class="split-layout">
    <!-- 左侧对话面板：固定高度，内部滚动 -->
    <div class="chat-panel">
      <div class="messages-container" ref="messagesContainer">
        <div class="messages-list">
          <!-- 动态消息（幻灯片不使用特殊卡片） -->
          <div
            v-for="(msg, idx) in displayedMessages"
            :key="idx"
            class="message"
            :class="msg.role"
            :style="{ animationDelay: `${idx * 0.1}s` }"
          >
            <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
            <div class="bubble">{{ msg.content }}</div>
          </div>

          <!-- 正在输入指示器 -->
          <div v-if="isTyping" class="message ai typing-indicator">
            <div class="avatar">🤖</div>
            <div class="bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>

          <!-- 底部锚点，用于自动滚动 -->
          <div ref="messagesEnd" class="scroll-anchor"></div>
        </div>
      </div>

      <!-- 底部输入框（只读演示） -->
      <div class="input-area">
        <input
          type="text"
          :placeholder="isPlaying ? 'AI正在思考中...' : '请输入您的需求...'"
          readonly
        />
        <button :disabled="isPlaying">
          {{ isPlaying ? '思考中...' : '发送' }}
        </button>
      </div>
    </div>

    <!-- 右侧面板：固定高度，内部滚动，展示幻灯片预览 -->
    <div class="document-panel" ref="documentPanel">
      <div class="doc-content">
        <h3>📽️ 幻灯片预览 · 生成结果</h3>

        <!-- 模拟幻灯片缩略图列表 -->
        <div class="slide-list">
          <div class="slide-item">
            <div class="slide-number">1</div>
            <div class="slide-preview">
              <div class="slide-title">人工智能导论</div>
              <div class="slide-subtitle">大学通识课 · 2学时</div>
            </div>
          </div>
          <div class="slide-item">
            <div class="slide-number">2</div>
            <div class="slide-preview">
              <div class="slide-bullet">• 什么是人工智能？</div>
              <div class="slide-bullet">• 发展简史</div>
              <div class="slide-bullet">• 主要研究领域</div>
            </div>
          </div>
          <div class="slide-item">
            <div class="slide-number">3</div>
            <div class="slide-preview">
              <div class="slide-bullet">• 机器学习基础</div>
              <div class="slide-bullet">• 监督学习 vs 无监督学习</div>
              <div class="slide-bullet">• 神经网络简介</div>
            </div>
          </div>
          <div class="slide-item">
            <div class="slide-number">4</div>
            <div class="slide-preview">
              <div class="slide-bullet">• 图像识别案例</div>
              <div class="slide-bullet">• 自然语言处理案例</div>
              <div class="slide-bullet">• 动手体验：Teachable Machine</div>
            </div>
          </div>
          <div class="slide-item">
            <div class="slide-number">5</div>
            <div class="slide-preview">
              <div class="slide-bullet">• 算法偏见</div>
              <div class="slide-bullet">• AI伦理讨论</div>
              <div class="slide-bullet">• 科技向善</div>
            </div>
          </div>
        </div>

        <div class="info-note">
          ⚡ 当前为演示模式，对话内容为预设示例。实际使用时将根据您的需求生成幻灯片。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// 幻灯片制作示例对话流程
const conversationFlow = [
  {
    role: 'user',
    content: '我想做一个关于“人工智能导论”的幻灯片，面向大学通识课学生。',
  },
  {
    role: 'ai',
    content: '好的！我可以帮您规划大纲。您希望包含哪些部分？比如历史、原理、应用、伦理等。',
  },
  {
    role: 'user',
    content: '对，要包括历史、机器学习基础、几个典型应用，还有伦理讨论。',
  },
  {
    role: 'ai',
    content:
      '明白了。我建议结构如下：\n1. 封面与引言\n2. AI发展简史\n3. 什么是机器学习\n4. 图像识别与NLP案例\n5. 动手体验：Teachable Machine\n6. AI伦理圆桌\n7. 总结与资源\n您觉得如何？',
  },
  {
    role: 'user',
    content: '很棒！可以再加一页“未来展望”吗？',
  },
  {
    role: 'ai',
    content:
      '没问题，我会在第6页之后加入“未来展望：AI与社会”。整体大纲已更新，您可以在右侧看到预览。',
  },
  {
    role: 'user',
    content: '非常好，请把详细内容填充进去。',
  },
  {
    role: 'ai',
    content:
      '已为您生成初步幻灯片，包含标题、要点和案例。您可以在右侧预览页面缩略图，并随时调整内容。',
  },
]

const displayedMessages = ref([])
const isTyping = ref(false)
const isPlaying = ref(false)
const showDocument = ref(true) // 右侧始终显示预览

// DOM 引用
const messagesContainer = ref(null)
const messagesEnd = ref(null)

// 睡眠函数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 滚动到底部（仅容器内滚动）
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// 播放对话动画
const playConversation = async () => {
  for (let i = 0; i < conversationFlow.length; i++) {
    const msg = conversationFlow[i]

    // AI 消息前显示"正在输入"
    if (msg.role === 'ai') {
      isTyping.value = true
      await scrollToBottom()
      await sleep(800 + Math.random() * 600) // 模拟思考时间
      isTyping.value = false
    } else {
      await sleep(600) // 用户"输入"时间
    }

    // 添加消息
    displayedMessages.value.push(msg)

    await scrollToBottom()
    await sleep(1000) // 消息间隔
  }

  isPlaying.value = false
}

// 重置并重新播放（暴露给父组件）
const resetAndPlay = () => {
  displayedMessages.value = []
  isTyping.value = false
  isPlaying.value = true
  playConversation()
}

// 组件挂载时自动开始
onMounted(() => {
  playConversation()
})

// 暴露方法给父组件
defineExpose({ resetAndPlay })
</script>

<style scoped>
/* 完全复用之前的样式，并添加幻灯片预览相关样式 */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  height: 600px;
  max-height: 600px;
  overflow: hidden;
}

.chat-panel {
  background-color: #f8fafc;
  border-radius: 24px;
  border: 1px solid #eaeef2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
}

.messages-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d9e0 transparent;
  scrollbar-gutter: stable;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}
.messages-container::-webkit-scrollbar-thumb {
  background-color: #d0d9e0;
  border-radius: 3px;
}
.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: #b0c0d0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: min-content;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  opacity: 0;
  animation: slideIn 0.4s ease forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.message.user .avatar {
  background-color: #e1f5fe;
}

.message.ai .avatar {
  background-color: #f3e5f5;
}

.bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  font-size: 15px;
  line-height: 1.6;
  color: #1a2b3c;
  word-break: break-word;
}

.message.user .bubble {
  background-color: #d9f0fe;
  border-bottom-right-radius: 4px;
}

.message.ai .bubble {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  opacity: 1 !important;
  animation: none !important;
}

.typing-indicator .bubble {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #90a4ae;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.scroll-anchor {
  height: 0;
  margin: 0;
  padding: 0;
}

.input-area {
  display: flex;
  padding: 16px 24px;
  border-top: 1px solid #eaeef2;
  background-color: #f8fafc;
  gap: 8px;
  flex-shrink: 0;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d0d9e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  background-color: #ffffff;
  color: #7f8c8d;
  cursor: default;
  transition: all 0.3s;
}

.input-area input:read-only {
  background-color: #f1f4f7;
  border-color: #d0d9e0;
  color: #7f8c8d;
}

.input-area button {
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  background-color: #e0e7ed;
  color: #a0b3c6;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
  transition: all 0.3s;
  white-space: nowrap;
}

.input-area button:not(:disabled) {
  background-color: #3498db;
  color: white;
  cursor: pointer;
}

/* 右侧文档面板（同前） */
.document-panel {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #eaeef2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  padding: 24px;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d9e0 transparent;
  scrollbar-gutter: stable;
  box-sizing: border-box;
}

.document-panel::-webkit-scrollbar {
  width: 6px;
}
.document-panel::-webkit-scrollbar-track {
  background: transparent;
}
.document-panel::-webkit-scrollbar-thumb {
  background-color: #d0d9e0;
  border-radius: 3px;
}
.document-panel::-webkit-scrollbar-thumb:hover {
  background-color: #b0c0d0;
}

.doc-content {
  color: #1a2b3c;
  min-height: 100%;
}

.doc-content h3 {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 16px;
  color: #2c3e50;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 8px;
}

/* 幻灯片预览列表样式 */
.slide-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.slide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #eaeef2;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.slide-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.slide-number {
  width: 28px;
  height: 28px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.slide-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slide-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.slide-subtitle {
  font-size: 13px;
  color: #7f8c8d;
}

.slide-bullet {
  font-size: 13px;
  color: #4a5a6e;
  line-height: 1.5;
}

.info-note {
  margin-top: 24px;
  padding: 12px 16px;
  background-color: #f0f7ff;
  border-left: 4px solid #3498db;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
}

/* 响应式布局 */
@media (max-width: 968px) {
  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 400px;
    height: auto;
    max-height: none;
    gap: 16px;
  }

  .chat-panel {
    height: 300px;
    max-height: 300px;
  }

  .document-panel {
    height: 400px;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .bubble {
    max-width: 85%;
    font-size: 14px;
  }

  .input-area {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .split-layout {
    grid-template-rows: 250px 350px;
  }

  .chat-panel {
    height: 250px;
    max-height: 250px;
  }

  .document-panel {
    height: 350px;
    max-height: 350px;
  }

  .bubble {
    max-width: 90%;
  }
}
</style>
