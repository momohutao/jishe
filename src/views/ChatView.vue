<template>
  <div class="chat-app-layout">
    <!-- 左侧：历史对话侧边栏（可折叠） -->
    <SideBar
      :isOpen="isSidebarOpen"
      :history="historyList"
      @toggle="isSidebarOpen = !isSidebarOpen"
      @logout="onLogout"
      @new-chat="startNewChat"
      @load-history="handleLoadHistory"
    />

    <!-- 中间：AI 聊天对话区 -->
    <div class="chat-main-area">
      <div class="chat-messages" ref="chatListRef">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role === 'user' ? 'message-user' : 'message-ai']"
        >
          <div class="message-wrapper">
            <!-- 1. 用户消息：包含文本与附带的多模态参考资料 -->
            <div class="content user-content-wrapper" v-if="msg.role === 'user'">
              <!-- 用户上传的参考资料展示 -->
              <div class="msg-attachments" v-if="msg.attachments && msg.attachments.length">
                <div class="msg-attach-card" v-for="(att, i) in msg.attachments" :key="i">
                  <span class="att-icon">{{ att.type === 'pdf' ? '📄' : '🎬' }}</span>
                  <div class="att-info">
                    <span class="att-name">{{ att.name }}</span>
                    <span class="att-size">{{ att.type === 'pdf' ? 'PDF文档' : '视频文件' }}</span>
                  </div>
                </div>
              </div>
              <!-- 用户文本 -->
              <div class="text-content" v-if="msg.content">
                {{ msg.content }}
              </div>
            </div>

            <!-- 2. AI 文本类型消息 -->
            <ThinkingLogo v-if="msg.role === 'ai'" :isThinking="msg.isThinking" />
            <div
              class="content text-content ai-text"
              v-if="msg.role === 'ai' && msg.type === 'text'&& !msg.isThinking"
            >
              {{ msg.content }}
            </div>

            <!-- 3. AI 需求确认表单卡片 (保留原有功能) -->
            <div class="content form-card" v-if="msg.type === 'form'">
              <!-- ...（表单内容与之前完全一致，此处略写以节省篇幅，具体保持不变）... -->
              <div class="form-group">
                <h4>这份课件给谁讲？</h4>
                <div class="radio-group">
                  <label :class="{ active: msg.formData.audience === 'college' }">
                    <input
                      type="radio"
                      v-model="msg.formData.audience"
                      value="college"
                      :disabled="msg.isSubmitted"
                    />
                    <span class="radio-icon"></span> 大学/研究生
                  </label>
                  <label :class="{ active: msg.formData.audience === 'corporate' }">
                    <input
                      type="radio"
                      v-model="msg.formData.audience"
                      value="corporate"
                      :disabled="msg.isSubmitted"
                    />
                    <span class="radio-icon"></span> 企业内训/老师培训
                  </label>
                </div>
              </div>
              <div class="form-actions">
                <button
                  class="submit-form-btn"
                  :disabled="msg.isSubmitted"
                  @click="submitRequirements(msg)"
                >
                  {{ msg.isSubmitted ? '已提交' : '提交' }}
                </button>
              </div>
            </div>

            <!-- 4. 文件卡片类型消息 (PPT 缩略图) -->
            <div
              class="content file-card"
              v-if="msg.type === 'file'"
              @click="openPreview(msg.previewPayload || msg.fileUrl)"
            >
              <div class="file-cover">PPT</div>
              <div class="file-info">
                <div class="file-name">{{ msg.content }}</div>
                <div class="file-desc">已生成完毕，点击查看并播放 👆</div>
              </div>
            </div>

            <!-- 操作反馈区 -->
            <div class="message-actions" v-if="msg.role === 'ai' && msg.showActions">
              <button class="action-btn" title="复制">
                <img
                  src="../assets/images/复制.png"
                  alt=""
                  class="icon-img"
                  @click="toggleImg($event, '../assets/images/check.png')"
                />
              </button>
              <button class="action-btn" title="赞同">
                <img
                  src="../assets/images/赞.png"
                  alt=""
                  class="icon-img"
                  @click="toggleImg($event, '../assets/images/赞2.png')"
                />
              </button>
              <button class="action-btn" title="踩">
                <img
                  src="../assets/images/踩.png"
                  alt=""
                  class="icon-img"
                  @click="toggleImg($event, '../assets/images/踩2.png')"
                />
              </button>
            </div>

            <div class="suggestions-list" v-if="msg.suggestions && msg.suggestions.length">
              <div
                class="suggestion-item"
                v-for="(sug, sIndex) in msg.suggestions"
                :key="sIndex"
                @click="sendSuggestion(sug)"
              >
                <span class="sug-text">{{ sug }}</span>
                <span class="sug-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 核心升级：输入框区域 ================= -->
      <div class="chat-input-area">
        <div class="input-wrapper" :class="{ 'is-recording': isRecording }">
          <!-- 已选择的附件展示区 (待发送) -->
          <div class="selected-attachments" v-if="pendingAttachments.length > 0">
            <div class="att-tag" v-for="(att, index) in pendingAttachments" :key="index">
              <span>{{ att.type === 'pdf' ? '📄' : '🎬' }} {{ att.name }}</span>
              <button class="remove-att" @click="removeAttachment(index)">×</button>
            </div>
          </div>

          <!-- 文本输入区 -->
          <textarea
            v-model="inputText"
            :placeholder="
              isRecording ? '正在聆听中，请讲话...' : '输入主题，或上传参考资料提取生成 PPT...'
            "
            @keydown.enter.prevent="handleSend"
          ></textarea>

          <!-- 底部工具栏：语音、附件、发送按钮 -->
          <div class="input-toolbar">
            <div class="toolbar-left">
              <!-- 附件上传菜单 -->
              <div class="upload-dropdown">
                <button class="tool-btn" title="上传参考资料 (演示多模态)">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  >
                    <path
                      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                    ></path>
                  </svg>
                </button>
                <div class="dropdown-menu">
                  <input
                    type="file"
                    ref="fileInputRef"
                    style="display: none"
                    @change="handleFileSelect"
                  />
                  <div class="dropdown-item" @click="triggerFileInput('pdf')">📄 上传 PDF 研报</div>
                  <div class="dropdown-item" @click="triggerFileInput('video')">
                    🎬 上传 视频 录像
                  </div>
                </div>
              </div>

              <!-- 语音输入按钮 -->
              <button
                class="tool-btn mic-btn"
                :class="{ 'recording-active': isRecording }"
                @click="toggleVoiceInput"
                title="语音输入"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <!-- 选择模版按钮 -->
              <button class="tool-btn" title="选择PPT模板" @click="router.push('/templates')">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span style="font-size: 13px; margin-left: 4px">选模板</span>
              </button>
            </div>

            <!-- 发送按钮 -->
            <button
              class="send-btn"
              @click="handleSend"
              :disabled="!inputText.trim() && pendingAttachments.length === 0"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：PPT 预览组件 -->
    <div class="preview-panel" v-if="currentPreviewPayload">
      <PptPreview :document-config="currentPreviewPayload" @close="closePreview"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PptPreview from '../components/PptPreview.vue'
import SideBar from '../components/SideBar.vue'
import ThinkingLogo from '../components/ThinkingLogo.vue'
// ==== 基础状态 ====
const isSidebarOpen = ref(true) // 控制开关的状态
const router = useRouter()
const currentPreviewPayload = ref<any | null>(null)
const inputText = ref('')
const chatListRef = ref<HTMLElement | null>(null)
const onLogout = () => {
  console.log('用户已退出登录')
  // 这里写清除 Token、跳转登录页的逻辑
  router.push('/login')
}

const historyList = ref([{ id: 1, title: '人工智能发展史' }])

const messages = ref<any[]>([
  {
    role: 'ai',
    type: 'text',
    content:
      '你好！我是你的 AI PPT 助手。请问你想生成什么主题的 PPT？您也可以直接上传 PDF 论文或教学视频，我将从中提取核心内容为您制作。',
  },
])

// ==== 附件处理 (演示多模态) ====
const mockOnlyOfficePreviewResponse = {
  code: 0,
  data: {
    fileId: 'pptchapter2process',
    fileName: '第二章 进程管理-融合第9章与12章.pptx',
    objectKey: '第二章 进程管理-融合第9章与12章.pptx',
    creatorId: 'u100',
    bucketName: 'ppt-files',
    apiBaseUrl: 'http://47.109.139.75:8080',
    directDownloadUrl:
      'http://47.109.139.75:9000/ppt-files/%E7%AC%AC%E4%BA%8C%E7%AB%A0%20%E8%BF%9B%E7%A8%8B%E7%AE%A1%E7%90%86-%E8%9E%8D%E5%90%88%E7%AC%AC9%E7%AB%A0%E4%B8%8E12%E7%AB%A0.pptx?response-content-disposition=attachment%3B%20filename%3D%22%E7%AC%AC%E4%BA%8C%E7%AB%A0%20%E8%BF%9B%E7%A8%8B%E7%AE%A1%E7%90%86-%E8%9E%8D%E5%90%88%E7%AC%AC9%E7%AB%A0%E4%B8%8E12%E7%AB%A0.pptx%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260317%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260317T094810Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d81da2e4b1df77a774f0914a1da738638a8742f74e5b03de3662451b468e6f88',
    mode: 'edit',
    lang: 'zh-CN',
    userId: 'u100',
  },
  message: '',
}

const pendingAttachments = ref<any[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
let currentUploadType = 'pdf' // 记录当前希望上传的类型

// 1. 触发系统真实的文件选择框
const triggerFileInput = (type: 'pdf' | 'video') => {
  currentUploadType = type
  if (fileInputRef.value) {
    // 动态限制可选的文件格式，提升演示体验
    fileInputRef.value.accept = type === 'pdf' ? '.pdf' : 'video/*'
    fileInputRef.value.click()
  }
}

// 2. 捕获用户在系统中选中的真实文件
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    // 拿到真实的文件名，塞入待发送列表
    pendingAttachments.value.push({
      type: currentUploadType,
      name: file.name,
    })
    // 清空 input 值，防止下次选同一个文件不触发 change 事件
    target.value = ''
  }
}

const removeAttachment = (index: number) => {
  pendingAttachments.value.splice(index, 1)
}
// ==== 语音输入处理 ====
const isRecording = ref(false)
let recognition: any = null

const toggleVoiceInput = () => {
  if (isRecording.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

const startVoiceInput = () => {
  // 使用浏览器原生 Web Speech API
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = true // 实时返回结果

    recognition.onstart = () => {
      isRecording.value = true
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      inputText.value = transcript // 实时填充到输入框
    }

    recognition.onerror = () => {
      alert('语音识别失败或未授权麦克风。已切换至演示模式。')
      simulateVoiceInput() // 降级到模拟
    }

    recognition.onend = () => {
      isRecording.value = false
    }

    recognition.start()
  } else {
    // 浏览器不支持时的模拟兜底
    simulateVoiceInput()
  }
}

const stopVoiceInput = () => {
  if (recognition) {
    recognition.stop()
  }
  isRecording.value = false
}

// 模拟语音输入 (兜底展示)
const simulateVoiceInput = () => {
  isRecording.value = true
  inputText.value = ''
  setTimeout(() => {
    inputText.value = '帮我'
  }, 500)
  setTimeout(() => {
    inputText.value = '帮我总结一下'
  }, 1000)
  setTimeout(() => {
    inputText.value = '帮我总结一下这份材料，并做成一份大纲。'
  }, 1800)
  setTimeout(() => {
    isRecording.value = false
  }, 2500)
}

// ==== 发送逻辑 ====
const handleSend = () => {
  if (!inputText.value.trim() && pendingAttachments.value.length === 0) return

  const userMsg: any = { role: 'user', type: 'text', content: inputText.value }
  if (pendingAttachments.value.length > 0) {
    userMsg.attachments = [...pendingAttachments.value]
  }
  messages.value.push(userMsg)

  inputText.value = ''
  pendingAttachments.value = []
  scrollToBottom()

  const thinkingIndex = messages.value.length
  // 思考中消息
  messages.value.push({
    role: 'ai',
    isThinking: true, // 开启当前这句的动画
    content: '',
    type: 'text',
  })
  scrollToBottom()

  setTimeout(() => {
    // 先定义 aiReply
    let aiReply = ''
    if (userMsg.attachments && userMsg.attachments.length > 0) {
      aiReply = '✅ 已解析您上传的资料，正在提取核心内容...'
    } else {
      aiReply = '收到需求，正在为您分析...'
    }

  if (messages.value[thinkingIndex]) {
      messages.value[thinkingIndex].isThinking = false; // 动画停止，变为完整态
      messages.value[thinkingIndex].content = aiReply;  // 填入文字
    }
    scrollToBottom();

    setTimeout(() => {
      messages.value.push({
        role: 'ai',
        type: 'form',
        isSubmitted: false,
        formData: { audience: 'college' },
      })
      scrollToBottom()
    }, 5000)
  }, 5200)
}

// 点击推荐词条直接发送
const sendSuggestion = (text: string) => {
  messages.value.push({ role: 'user', type: 'text', content: text })
  scrollToBottom()
  setTimeout(() => {
    messages.value.push({
      role: 'ai',
      type: 'text',
      content: `收到补充要求：“${text}”。正在对大纲与排版进行微调...`,
    })
    scrollToBottom()
  }, 800)
}

// 提交表单 (保留生成卡片的逻辑)
const submitRequirements = (msg: any) => {
  msg.isSubmitted = true
  messages.value.push({
    role: 'user',
    type: 'text',
    content: '确认需求并生成',
  })
  scrollToBottom()

  setTimeout(() => {
    messages.value.push({
      role: 'ai',
      type: 'file',
      content: mockOnlyOfficePreviewResponse.data.fileName,
      previewPayload: mockOnlyOfficePreviewResponse,
      showActions: true,
      suggestions: ['结合视频内容补充一个具体的应用案例', '将整体配色改为科技风暗色系'],
    })
    scrollToBottom()
  }, 2000)
}
const toggleImg = (event: Event, newPath: string) => {
  // 1. 获取当前点击的 img 元素
  const imgElement = event.target as HTMLImageElement

  // 2. 保存原始图片路径
  const originalSrc = imgElement.src

  // 3. 替换图片路径 (使用 new URL 兼容 Vite 的动态图片打包)
  imgElement.src = new URL(newPath, import.meta.url).href

  // 4. (可选体验优化) 移除父级 button 的置灰滤镜，让点击后的彩色图标亮起
  const parentBtn = imgElement.parentElement
  if (parentBtn) {
    parentBtn.style.filter = 'grayscale(0%)'
    parentBtn.style.opacity = '1'
  }

  // 5. 2秒后恢复原始图片
  setTimeout(() => {
    imgElement.src = originalSrc
    // 可选：恢复按钮的灰度效果
    if (parentBtn) {
      parentBtn.style.filter = 'grayscale(100%)'
      parentBtn.style.opacity = '0.6'
    }
  }, 2000)
}
const scrollToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) chatListRef.value.scrollTop = chatListRef.value.scrollHeight
  })
}
const openPreview = (payload: any) => {
  currentPreviewPayload.value = payload
}
const handleLoadHistory = (historyItem: any) => {
  // 1. 如果当前的对话还没保存，理论上这里也可以加个自动保存当前对话的逻辑（类似于 startNewChat 的上半部分）
  // 为了简单演示，我们直接覆盖

  // 2. 把历史记录里的消息拿出来重新渲染
  if (historyItem.messagesData) {
    messages.value = JSON.parse(JSON.stringify(historyItem.messagesData))
  }
}
const closePreview = () => {
  currentPreviewPayload.value = null;
}
const startNewChat = () => {
  // 1. 判断当前对话是否值得保存 (即：除了 AI 的第一句问候，用户有没有发过消息)
  const hasUserMessages = messages.value.some((msg) => msg.role === 'user')

  if (hasUserMessages) {
    // 尝试从用户的第一句话中提取标题
    const firstUserMsg = messages.value.find((msg) => msg.role === 'user')
    let chatTitle = firstUserMsg && firstUserMsg.content ? firstUserMsg.content : '未命名对话'

    // 如果标题太长，截断它
    if (chatTitle.length > 15) {
      chatTitle = chatTitle.substring(0, 15) + '...'
    }

    // 2. 将当前对话保存到历史记录的最前面
    historyList.value.unshift({
      id: Date.now(), // 用当前时间戳作为唯一标识
      title: chatTitle,
      // 深拷贝当前消息记录，防止后续清空时被联动清空
      messagesData: JSON.parse(JSON.stringify(messages.value)),
    })
  }

  // 3. 恢复初始欢迎语，清空当前画布
  messages.value = [
    {
      role: 'ai',
      type: 'text',
      content:
        '你好！我是你的 AI PPT 助手。请问你想生成什么主题的 PPT？您也可以直接上传 PDF 论文或教学视频，我将从中提取核心内容为您制作。',
    },
  ]

  // 4. 清空输入框和各种状态
  inputText.value = ''
  pendingAttachments.value = []
  if (isRecording.value) stopVoiceInput()

  scrollToBottom()
}
</script>

<style scoped>
/* =========== 全局与基础组件布局保持不变 =========== */
.chat-app-layout {
  display: flex;
  width: 100vw;
  height: calc(100vh - 80px);
  overflow: hidden;
  background-color: #fff;
}

.sidebar-header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 12px 10px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.message {
  display: flex;
  margin: 0 auto 30px auto;
  max-width: 800px; /* 限制最大宽度与输入框一致 */
  width: 100%;
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .avatar {
  background-color: #333;
  margin-left: 16px;
}

.message-ai .avatar {
  background-color: #FFB800;
  margin-right: 16px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  align-items: flex-start;
}

.message-user .message-wrapper {
  align-items: flex-end;
}

.content {
  border-radius: 8px;
  word-wrap: break-word;
}

.ai-text {
  background-color: #fff;
  color: #333;
  border: 1px solid #eee;
  padding: 12px 16px;
  border-radius: 2px 12px 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  line-height: 1.6;
  font-size: 14px;
}

/* =========== 用户消息(多模态附件)展示 =========== */
.user-content-wrapper {
  background-color: #dfedd6 ;
  border-radius: 12px 2px 12px 12px;
  padding: 12px;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 15px;
}

.user-content-wrapper .text-content {
  font-size: 14px;
  line-height: 1.6;
  padding: 4px;
}

.msg-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  justify-content: flex-end;
}

.msg-attach-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-width: 140px;
}

.att-icon {
  font-size: 20px;
  margin-right: 10px;
}

.att-info {
  display: flex;
  flex-direction: column;
}

.att-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.att-size {
  font-size: 11px;
  color: #888;
}

/* =========== 卡片与操作区 =========== */
.form-card {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px;
}

.form-group h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
}

.radio-group label {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;
}

.radio-group label.active {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  font-weight: 500;
}

.submit-form-btn {
  padding: 6px 20px;
  background-color: #e6e6e6;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  float: right;
  margin-top: 10px;
}

.submit-form-btn:not(:disabled) {
  background-color: #333;
  color: #fff;
}

.file-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  cursor: pointer;
  width: 320px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.file-card:hover {
  border-color:  #FFB800;
}

.file-cover {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff7a45, #fa541c);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
}

.file-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.file-desc {
  font-size: 12px;
  color: #888;
}

.message-actions {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  margin-bottom: 16px;
  padding-left: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.2s;
}

.action-btn:hover {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.suggestion-item {
  background-color: #f4f4f4;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #e8e8e8;
}

/* ================= 核心升级：底部输入工具区 ================= */
.chat-input-area {
  padding: 0 30px;
  padding-bottom: 20px;
}

.input-wrapper {
  display: flex;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #FFB800;
  background: #fff;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.05);
}

/* 录音状态特效 */
.input-wrapper.is-recording {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
  background: #fff;
}

/* 待发送附件标签 */
.selected-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.att-tag {
  display: inline-flex;
  align-items: center;
background: #FFF7D6;
  border: 1px solid #FFB800;
  color: #CC8800;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.remove-att {
  background: transparent;
  border: none;
  color: #CC8800;
  margin-left: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  padding: 0;
}

.remove-att:hover {
  color: #ff4d4f;
}

/* 文本域 */
.input-wrapper textarea {
  width: 100%;
  height: 60px;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 15px;
  box-sizing: border-box;
}

/* 工具栏 */
.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tool-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #eee;
  color: #333;
}

/* 附件下拉菜单 */
.upload-dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  width: 160px;
  z-index: 100;
}

.upload-dropdown:hover .dropdown-menu {
  display: block;
}

/* 新增：创建一个透明的“桥”，填补按钮和菜单之间的缝隙，防止鼠标移出丢失 hover */
.dropdown-menu::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
   color: #FFB800;
}

/* 麦克风录音动画 */
.mic-btn.recording-active {
  color:  #FFB800;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    background: rgba(255, 77, 79, 0.1);
  }

  50% {
    transform: scale(1.1);
    background: rgba(255, 77, 79, 0.3);
  }

  100% {
    transform: scale(1);
    background: rgba(255, 77, 79, 0.1);
  }
}

.send-btn {
  padding: 8px 24px;
  background-color:  #a2bb7a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background-color: #9ab534;
}

.icon-img {
  width: 15px;
  height: 15px;
}

/* 右侧预览区 */
.preview-panel {
  width: 50%;
  border-left: 1px solid #e5e5e5;
  background: #fff;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
