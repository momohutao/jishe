<template>
  <div class="chat-app-layout">
    <!-- 左侧：历史对话侧边栏（可折叠） -->
    <SideBar
      ref="sideBarRef" 
      :isOpen="isSidebarOpen"
      :history="historyList"
      @toggle="isSidebarOpen = !isSidebarOpen"
      @logout="onLogout"
      @new-chat="startNewChat"
      @load-history="handleLoadHistory"
      @mention="handleMention"
      @delete-history="handleDeleteHistory" 
      @pin-history="handlePinHistory" 
      @rename-history="handleRenameHistory"
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
              v-if="msg.role === 'ai' && msg.type === 'text' && !msg.isThinking"
            >
              {{ msg.content }}
            </div>
            <div class="content outline-card" v-if="msg.type === 'outline'">
              <div class="outline-header">
                <div class="header-left">
 
                  <span class="title">内容大纲已生成</span>
                </div>
                <button class="download-word-btn" @click="downloadOutlineAsWord(msg.content)">
                  导出 Word
                </button>
              </div>

               <div class="outline-body">
                <!-- 引入 v-html 渲染解析后的 Markdown -->
                <div
                  class="outline-editor"
                  contenteditable="true"
                  v-html="parseMarkdown(msg.content)"
                >
                </div>
              </div>
              <div class="outline-footer">
                <span class="tip"
                  >💡 提示：您可以直接修改上方文字，或在下方输入意见让 AI 调整。</span
                >
              </div>
            </div>
            <!-- 3. AI 需求确认表单卡片 (保留原有功能) -->
            <div class="content form-card" v-if="msg.type === 'form'">
              <!-- 第一步：受众确认 -->
              <div v-if="msg.formType === 'audience'">
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
                      <span class="radio-icon"></span> 本科生
                    </label>
                    <label :class="{ active: msg.formData.audience === 'student' }">
                      <input
                        type="radio"
                        v-model="msg.formData.audience"
                        value="student"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 中学生
                    </label>
                    <label :class="{ active: msg.formData.audience === 'corporate' }">
                      <input
                        type="radio"
                        v-model="msg.formData.audience"
                        value="corporate"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 小学生
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

              <!-- 第二步：难度与时长确认 -->
              <div v-if="msg.formType === 'details'">
                <div class="form-group">
                  <h4>请问课程的难度级别是？</h4>
                  <div class="radio-group">
                    <label :class="{ active: msg.formData.level === 'beginner' }">
                      <input
                        type="radio"
                        v-model="msg.formData.level"
                        value="beginner"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 零基础入门
                    </label>
                    <label :class="{ active: msg.formData.level === 'intermediate' }">
                      <input
                        type="radio"
                        v-model="msg.formData.level"
                        value="intermediate"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 核心进阶
                    </label>
                    <label :class="{ active: msg.formData.level === 'advanced' }">
                      <input
                        type="radio"
                        v-model="msg.formData.level"
                        value="advanced"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 深度专业探讨
                    </label>
                  </div>
                </div>

                <div class="form-group" style="margin-top: 16px">
                  <h4>预计讲解时长是多少？</h4>
                  <div class="radio-group">
                    <label :class="{ active: msg.formData.duration === '10min' }">
                      <input
                        type="radio"
                        v-model="msg.formData.duration"
                        value="10min"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 10分钟(简述)
                    </label>
                    <label :class="{ active: msg.formData.duration === '25min' }">
                      <input
                        type="radio"
                        v-model="msg.formData.duration"
                        value="25min"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 25分钟(标准)
                    </label>
                    <label :class="{ active: msg.formData.duration === '45min' }">
                      <input
                        type="radio"
                        v-model="msg.formData.duration"
                        value="45min"
                        :disabled="msg.isSubmitted"
                      />
                      <span class="radio-icon"></span> 45分钟(长课)
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button
                    class="submit-form-btn"
                    :disabled="msg.isSubmitted"
                    @click="submitDetailsForm(msg)"
                  >
                    {{ msg.isSubmitted ? '已提交，生成大纲中...' : '生成大纲' }}
                  </button>
                </div>
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
          <div
            class="rich-textarea"
            contenteditable="true"
            ref="editorRef"
            :placeholder="
              isRecording ? '正在聆听中，请讲话...' : '输入主题，或上传参考资料提取生成 PPT...'
            "
            @input="handleEditorInput"
            @keydown.enter.prevent="handleSend"
          ></div>

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
      <PptPreview :document-config="currentPreviewPayload" @close="closePreview" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick,onMounted,onActivated,watch,computed } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { saveAs } from 'file-saver' // 用于下载文件
import PptPreview from '../components/PptPreview.vue'
import SideBar from '../components/SideBar.vue'
import ThinkingLogo from '../components/ThinkingLogo.vue'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { fetchPptTaskApi, generatePptApi } from '@/api/ppt.js' 
import { useHistoryStore } from '@/stores/history' // 👈 引入你的 store

// ==== 基础状态 ====

const historyStore = useHistoryStore()
const route = useRoute() 
const TASK_POLL_INTERVAL = 5000
const TASK_POLL_MAX_ATTEMPTS = 180
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const unwrapPayload = (payload: any) => payload?.data ?? payload ?? {}
const extractTaskId = (payload: any) => {
  const data = unwrapPayload(payload)
  const pollUrl = data.pollUrl || data.poll_url || ''
  const taskIdFromPollUrl = pollUrl ? String(pollUrl).split('/').pop() : ''
  return (
    data.taskId ||
    data.task_id ||
    data.mlTaskId ||
    data.ml_job_id ||
    taskIdFromPollUrl ||
    data.id ||
    ''
  )
}
const handleQuoteParam = () => {
  const quoteName = route.query.quoteFileName
  if (quoteName) {
    // 调用你现有的方法，把 @名字 填入输入框
    handleMention(String(quoteName))

    // 💡 关键：处理完后立刻抹掉 URL 里的参数，防止刷新页面重复触发
    router.replace({ query: {} })
  }
}
const checkQuoteParam = () => {
  // 检查路由里有没有带 quoteFileName 参数过来
  if (route.query.quoteFileName) {
    const fileName = String(route.query.quoteFileName)
    
    // 稍微延迟一下，确保输入框的 DOM 已经加载完毕/渲染完毕
    setTimeout(() => {
      // 复用你原本就写好的 handleMention 方法
      handleMention(fileName)
      
      // 消费完参数后，把 URL 里的参数抹掉，防止刷新页面时重复触发
      const newQuery = { ...route.query }
      delete newQuery.quoteFileName
      router.replace({ query: newQuery })
    }, 300)
  }
}

// 2. 情况 A：页面第一次创建时执行
onMounted(() => {
  checkQuoteParam()
})

// 3. 情况 B：页面从别的路由切回来（被缓存唤醒）时执行
onActivated(() => {
  checkQuoteParam()
})
const normalizeTaskStatus = (payload: any) => {
  const data = unwrapPayload(payload)
  const result = data.result || data.output || data.fileInfo || data.file || {}
  const merged = { ...data, ...result }
  const status = String(merged.status || merged.taskStatus || merged.state || '').toUpperCase()

  return {
    raw: merged,
    status,
    title: merged.title || '',
    fileName: merged.fileName || merged.title || merged.outputFileName || merged.name || '',
    fileType: merged.fileType || merged.type || '',
    fileId: merged.fileId || merged.outputFileId || '',
    objectKey: merged.objectKey || merged.object_key || '',
    bucketName: merged.bucketName || merged.bucket_name || '',
    apiBaseUrl: merged.apiBaseUrl || merged.api_base_url || '',
    userId: merged.userId || merged.user_id || '',
    creatorId: merged.creatorId || merged.creator_id || '',
    directDownloadUrl:
      merged.downloadUrl || merged.directDownloadUrl || merged.url || '',
  }
}

const pollTaskUntilFinished = async (taskId: string) => {
  for (let attempt = 0; attempt < TASK_POLL_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetchPptTaskApi(taskId)
    const taskData = normalizeTaskStatus(response)

    if (['SUCCESS', 'SUCCEEDED', 'COMPLETED', 'DONE'].includes(taskData.status)) {
      return {
        ...taskData.raw,
        title: taskData.title,
        fileName: taskData.fileName,
        fileType: taskData.fileType,
        fileId: taskData.fileId,
        objectKey: taskData.objectKey,
        bucketName: taskData.bucketName,
        apiBaseUrl: taskData.apiBaseUrl,
        userId: taskData.userId,
        creatorId: taskData.creatorId,
        directDownloadUrl: taskData.directDownloadUrl,
      }
    }

    if (['FAILED', 'ERROR', 'CANCELED', 'CANCELLED'].includes(taskData.status)) {
      throw new Error(taskData.raw.message || 'PPT generation failed')
    }

    await sleep(TASK_POLL_INTERVAL)
  }

  throw new Error('PPT generation timed out')
}
const isSidebarOpen = ref(true)
const router = useRouter()
const currentPreviewPayload = ref<any | null>(null)
const inputText = ref('')
const chatListRef = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const sideBarRef = ref<any>(null)
const currentSessionId = ref(route.query.sessionId ? String(route.query.sessionId) : '')
// 新增：监听 div 的输入事件，同步到你原本的 inputText 中
const handleEditorInput = (e: Event) => {
  const target = e.target as HTMLElement
  inputText.value = target.innerText // 依然保留纯文本供后端或发送逻辑使用
}

// 修改：handleMention 逻辑
const handleMention = (kbName) => {
  if (!editorRef.value) return

  // 生成带有颜色的 HTML 标签
  const mentionHtml = `<span style="color: #F2D850;">@${kbName}</span>&nbsp;`

  // 将带有颜色的标签插入到编辑器中
  editorRef.value.innerHTML += mentionHtml

  // 同步更新 inputText (只提取纯文本内容)
  inputText.value = editorRef.value.innerText

  // 核心体验优化：让光标自动跳到文字最后面
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(editorRef.value)
  range.collapse(false) // 折叠到末尾
  sel?.removeAllRanges()
  sel?.addRange(range)
  editorRef.value.focus()
}
const onLogout = () => {
  console.log('用户已退出登录')
  // 这里写清除 Token、跳转登录页的逻辑
  router.push('/login')
}

// 1. 定义一个唯一的缓存 Key
const HISTORY_STORAGE_KEY = 'ppt_ai_history_data'

// 2. 初始化时尝试从硬盘读取数据，读取不到则给空数组
const historyList = computed(() => historyStore.list)

// 🚨 如果你之前有写死的数据（比如 ID:1 的那个），可以作为兜底：
if (historyList.value.length === 0) {
  historyList.value = [{ id: Date.now(), title: '人工智能发展史', messagesData: [] }]
}
const parseMarkdown = (text: string) => {
  if (!text) return ''
  return text
    // 允许符号前面有空格，防止代码缩进导致的匹配失败
    .replace(/^[ \t]*###[ \t]+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^[ \t]*##[ \t]+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^[ \t]*#[ \t]+(.*)$/gm, '<h1>$1</h1>')
    .replace(/^[ \t]*-[ \t]+(.*)$/gm, '<li>$1</li>')
    .replace(/^[ \t]*---[ \t]*$/gm, '<hr>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\r\n|\n/g, '<br>')
    // 清理块级元素后面多余的换行
    .replace(/(<\/h[1-3]>|<\/li>|<hr>)<br>/g, '$1')
}
const messages = ref<any[]>([
  {
    role: 'ai',
    type: 'text',
    content:
      '你好！我是你的 AI PPT 助手。请问你想生成什么主题的 PPT？您也可以直接上传 PDF 论文或教学视频，我将从中提取核心内容为您制作。',
  },
])

 
 
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
const buildGeneratePayload = (requestContext: any, formData: any) => {
  const payload: Record<string, any> = {
    audience: formData.audience,
    prompt: String(requestContext.prompt || '').trim(),
    attachments: (requestContext.attachments || []).map((attachment: any) => ({
      type: attachment.type,
      name: attachment.name,
      fileId: attachment.fileId,
      objectKey: attachment.objectKey,
    })),
  }

  if (requestContext.templateId) {
    payload.templateId = requestContext.templateId
  }

  if (requestContext.sessionId) {
    payload.sessionId = requestContext.sessionId
  }

  return payload
}
const buildPreviewPayload = (taskData: any) => {
  if (taskData.fileId) {
    return {
      fileId: taskData.fileId,
      fileName: taskData.fileName || taskData.title,
      objectKey: taskData.objectKey || taskData.fileName,
      creatorId: taskData.creatorId || 'u100',
      bucketName: taskData.bucketName || 'ppt-files',
      apiBaseUrl: taskData.apiBaseUrl,
      directDownloadUrl: taskData.directDownloadUrl,
      mode: 'edit',
      lang: 'zh-CN',
      userId: taskData.userId || taskData.creatorId || 'u100',
    }
  }

  if (taskData.directDownloadUrl) {
    return {
      fileName: taskData.fileName || taskData.title || 'generated.pptx',
      directDownloadUrl: taskData.directDownloadUrl,
    }
  }

  return null
}

// ==== 发送逻辑 ====
const handleSend = async () => {
  if (!inputText.value.trim() && pendingAttachments.value.length === 0) return

  const userContent = inputText.value
  messages.value.push({ role: 'user', type: 'text', content: userContent })
  inputText.value = ''
  scrollToBottom()

  const thinkingIndex = messages.value.length
  messages.value.push({ role: 'ai', isThinking: true, content: '', type: 'text' })
  
  if (editorRef.value) {
    editorRef.value.innerText = ''
    editorRef.value.innerHTML = ''
  }
  pendingAttachments.value = []

  // 获取当前状态
  const hasOutline = messages.value.some((m) => m.type === 'outline')
  const hasFile = messages.value.some((m) => m.type === 'file')

  try {
    // ==========================================
    // 第一次请求：根据大纲生成全新 PPT
    // ==========================================
    if ((userContent.includes('PPT') || userContent.includes('确认')) && hasOutline) {
      messages.value[thinkingIndex].content = '教案已确认！正在为您精选模板并生成 PPT...'
        await sleep(5000)
      const outlineMsg = messages.value.find((m) => m.type === 'outline')
      // 组装第一次生成的 Payload（这里可能传的是大纲内容/受众等）
 const payload = buildGeneratePayload({
  prompt:outlineMsg ? outlineMsg.content : "请生成PPT",
  attachments: [], // 第一次生成时没有附件（或者从某处获取）
  sessionId: currentSessionId.value
}, {
  audience: messages.value.find(m => m.formType === 'audience')?.formData?.audience || 'college',
  level: messages.value.find(m => m.formType === 'details')?.formData?.level || 'beginner',
  duration: messages.value.find(m => m.formType === 'details')?.formData?.duration || '25min'
})

      // 真实调用
     // 真实调用
      const generateResponse = await generatePptApi(payload)
      const responseData = generateResponse.data || generateResponse

      let taskResult
      if (responseData.fileId || responseData.directDownloadUrl) {
        taskResult = responseData // 后端直接返回了文件，直接用！
      } else {
        const taskId = extractTaskId(generateResponse)
        taskResult = await pollTaskUntilFinished(taskId) // 没返回文件才去查进度
      }
      const previewPayload = buildPreviewPayload(taskResult)

      // 记录后端返回的 sessionId（以便第二次修改时使用）
      if (taskResult.sessionId) currentSessionId.value = taskResult.sessionId

      messages.value[thinkingIndex].isThinking = false
      messages.value.push({
        role: 'ai',
        type: 'file',
        content: previewPayload?.fileName || '已生成完毕.pptx',
        previewPayload: previewPayload,
        showActions: true,
        suggestions: ['把配色换成科技蓝', '增加三页相关历史内容'],
      })
      scrollToBottom()
    }
    // ==========================================
    // 第二次请求：基于已有 PPT 进行修改
    // ==========================================
    else if (hasFile && userContent.includes('修改')) {
      messages.value[thinkingIndex].content = `收到修改意见。正在为您重新生成...`
      await sleep(5000)
      // ❤️ 【此处是修改关键】
      // 后端说第二次请求不一样，通常是因为在“修改模式”下：
      // 1. 需要传入前一次对话的 sessionId，以便 AI 知道你在改哪个 PPT。
      // 2. prompt 是用户的修改意见（而不是完整大纲）。
      // 3. 可能需要额外的参数（如 isModify: true），具体看你后端的接口文档。
   const payload = buildGeneratePayload({
  prompt: userContent, // 修改意见
  attachments: [], // 修改时通常不需要重新上传附件
  sessionId: currentSessionId.value, // 关键：传入sessionId
  isModify: true // 如果后端需要标识修改操作
}, {
  audience: messages.value.find(m => m.formType === 'audience')?.formData?.audience || 'college',
  level: messages.value.find(m => m.formType === 'details')?.formData?.level || 'beginner',
  duration: messages.value.find(m => m.formType === 'details')?.formData?.duration || '25min'
})

      // 真实调用
    // 真实调用
      const generateResponse = await generatePptApi(payload)
      const responseData = generateResponse.data || generateResponse

      let taskResult
      if (responseData.fileId || responseData.directDownloadUrl) {
        taskResult = responseData // 后端直接返回了文件，直接用！
      } else {
        const taskId = extractTaskId(generateResponse)
        taskResult = await pollTaskUntilFinished(taskId) // 没返回文件才去查进度
      }
      const previewPayload = buildPreviewPayload(taskResult)

      messages.value[thinkingIndex].isThinking = false
      messages.value.push({
        role: 'ai',
        type: 'file',
        content: previewPayload?.fileName || '修改版_已生成.pptx',
        previewPayload: previewPayload,
        showActions: true,
        suggestions: ['排版很棒，直接下载', '再换个模板看看'],
      })
      scrollToBottom()
    }
    // 默认情况（第一次输入需求，弹表单）
    else if (hasFile) {
      messages.value[thinkingIndex].isThinking = false
      messages.value[thinkingIndex].content = 'PPT 已经生成啦，如需调整，请在输入框发送“修改 + 您的意见”。'
    } else {
      messages.value[thinkingIndex].isThinking = false
      messages.value[thinkingIndex].content = '为了帮您生成更精准的 PPT，请先选择您的课件受众：'
      messages.value.push({
        role: 'ai',
        type: 'form',
        formType: 'audience',
        isSubmitted: false,
        formData: { audience: 'college' },
      })
    }
  } catch (error: any) {
    // 错误处理
    messages.value[thinkingIndex].isThinking = false
    messages.value[thinkingIndex].content = error?.message || '生成失败，请稍后重试。'
  }
  
  scrollToBottom()
}
// 点击推荐词条直接发送
const sendSuggestion = (text: string) => {
  // 1. 将建议词填入输入框（模拟用户打字）
  inputText.value = text
  // 2. 直接触发发送逻辑
  handleSend()
}

// 提交表单 (保留生成卡片的逻辑)
const submitRequirements = (msg: any) => {
  msg.isSubmitted = true
  // 获取用户选中的受众文字
  const audienceMap: Record<string, string> = {
    college: '本科生',
    corporate: '小学生',
    student: '中学生',
  }
  const audienceText = audienceMap[msg.formData.audience] || '学生'

  messages.value.push({
    role: 'user',
    type: 'text',
    content: `确认受众：这份课件是给${audienceText}讲的。`,
  })
  scrollToBottom()
 setTimeout(() => {
    messages.value.push({
      role: 'ai',
      type: 'text',
      content: '收到！为了让大纲更贴合您的需求，请补充以下难度和时间安排：'
    })
    messages.value.push({
      role: 'ai',
      type: 'form',
      formType: 'details',
      isSubmitted: false,
      formData: { level: 'beginner', duration: '15min' }, // 默认选中入门和25分钟
    })
    scrollToBottom()
  }, 1000)
}
 const submitDetailsForm = (msg: any) => {
  msg.isSubmitted = true
  
  const levelMap: Record<string, string> = {
    beginner: '零基础入门',
    intermediate: '核心进阶',
    advanced: '深度专业探讨'
  }
  const durationMap: Record<string, string> = {
    '10min': '10分钟',
    '25min': '25分钟',
    '45min': '45分钟'
  }
  
  const levelText = levelMap[msg.formData.level] || '入门'
  const durationText = durationMap[msg.formData.duration] || '25分钟'

  messages.value.push({ 
    role: 'user', 
    type: 'text', 
    content: `确认细节：课程难度定位为【${levelText}】，预计讲解时长为【${durationText}】。请生成教案大纲。` 
  })
  const thinkingIndex = messages.value.length
  messages.value.push({ role: 'ai', isThinking: true, content: '', type: 'text' })
  scrollToBottom()

  // 模拟 AI 思考后生成大纲 (替换为你的 Transformer 真实数据)
  setTimeout(() => {
     
    messages.value[thinkingIndex].isThinking = false
    messages.value[thinkingIndex].type = 'outline'
    messages.value[thinkingIndex].content = ` # Transformer 教案
    
     
## 基本信息

- 课程名称：Transformer
- 授课对象：undergraduate（本科生）
- 知识深度：零基础入门
- 授课时长：25分钟
- 生成日期：2026-03-26

## 共源对齐

- 共源 slide 数：11
- 章节数：6
- 素材原因覆盖率：1.0
- 主线锚点：Transformer、Transformer：序列建模的新范式、序列建模方法回顾、Transformer 整体架构、Transformer 结构图示

---

## 教学目标

### 知识目标
- 理解 Transformer 模型的基本结构与原理
- 掌握自注意力机制的核心思想及其在 Transformer 中的作用

### 能力目标
- 能够识别 Transformer 模型中的主要组件
- 能够分析自注意力机制在序列建模中的应用

### 情感目标
- 激发学生对深度学习模型创新的兴趣

---

## 教学重点与难点

- 教学重点：详细介绍 Transformer 模型及其自注意力机制的基本原理
- 教学难点：自注意力机制中 Query、Key、Value 匹配过程的理解

---

## 教学流程

### 环节 1：Transformer
- 预计时长：3 分钟
- 对应页面：Slide 1
- 教师动作：开场介绍：欢迎进入《Transformer》的学习。面向对象：本科生。课堂定位：建立整体认知与学习目标。
- 学生活动：结合教师提问参与讨论，用自己的语言复述关键概念并完成即时反馈。
- 板书建议：Transformer：理解 Transformer 模型的基本结构与原理；掌握自注意力机制的核心思想及其在 Transformer 中的作用

### 环节 2：Transformer：序列建模的新范式
- 预计时长：3 分钟
- 对应页面：Slide 2
- 教师动作：说明课程主题、学习目标，回扣开场问题：为什么传统序列模型难以处理长距离依赖？
- 学生活动：参与讨论，复述关键概念并完成即时反馈。
- 板书建议：Transformer：序列建模的新范式：课程主题；学习目标

### 环节 3：序列建模方法回顾
- 预计时长：3 分钟
- 对应页面：Slide 3
- 教师动作：说明 RNN 结构特点、局限性，提问：RNN/CNN 在处理长序列时存在哪些问题？
- 学生活动：结合已知线性代数和概率基础参与讨论。
- 板书建议：序列建模方法回顾：RNN 结构特点；RNN 局限性

### 环节 4：Transformer 整体架构
- 预计时长：3 分钟
- 对应页面：Slide 4
- 教师动作：说明完全基于注意力机制、编码器-解码器结构，强调不依赖循环结构。
- 学生活动：参与讨论并完成即时反馈。
- 板书建议：Transformer 整体架构：完全基于注意力机制；编码器-解码器结构

### 环节 5：Transformer 结构图示
- 预计时长：3 分钟
- 对应页面：Slide 5
- 教师动作：说明编码器堆叠、解码器自注意力，引导观察模块输入输出关系。
- 板书建议：Transformer 结构图示：编码器堆叠；解码器自注意力

### 环节 6：自注意力机制详解
- 预计时长：3 分钟
- 对应页面：Slide 6
- 教师动作：说明与上一部分衔接，结合线性代数基础提问 Query, Key, Value 角色。
- 板书建议：自注意力机制详解：Query、Key、Value 表示；相关性打分

### 环节 7：自注意力机制互动测验
- 预计时长：3 分钟
- 对应页面：Slide 7
- 教师动作：让学生独立作答后分组讨论，讲解正确思路。
- 学生活动：独立作答，同伴核对，修正理解。

### 环节 8：实验结果与性能对比
- 预计时长：3 分钟
- 对应页面：Slide 8
- 教师动作：分析图表数据，提问 BLEU 分数提升及训练成本降低的意义。

### 环节 9：课程回顾与思考
- 预计时长：3 分钟
- 对应页面：Slide 9
- 教师动作：说明创新意义与核心价值，布置课后思考题。

### 环节 10：课堂检测：知识迁移应用
- 预计时长：3 分钟
- 对应页面：Slide 10
- 教师动作：尝试新任务应用，收集答案点评。

---

## 课后建议

- 复盘 Transformer 的核心知识点与关键应用。
- 根据课堂问答和练习结果调整下次授课节奏。`,
       messages.value[thinkingIndex].suggestions = ['确认大纲没问题，直接生成 PPT', '把第7环节测验改成具体代码演示', '时间太紧，删减最后两个环节']
    scrollToBottom()
  },5000)
}

// 2. 新增大纲导出 Word 的功能
const downloadOutlineAsWord = (content: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content.split('\n').map(
          (line) =>
            new Paragraph({
              children: [new TextRun(line)],
            })
        ),
      },
    ],
  })

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, 'PPT大纲.docx')
  })
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
  currentPreviewPayload.value = null
}
const startNewChat = () => {
  // 1. 判断当前对话是否值得保存
  const hasUserMessages = messages.value.some((msg) => msg.role === 'user')

  if (hasUserMessages) {
    const firstUserMsg = messages.value.find((msg) => msg.role === 'user')
    let chatTitle = firstUserMsg && firstUserMsg.content ? firstUserMsg.content : '未命名对话'
    if (chatTitle.length > 15) {
      chatTitle = chatTitle.substring(0, 15) + '...'
    }

 historyStore.list.unshift({
    id: Date.now(),
    title: chatTitle,
    messagesData: JSON.parse(JSON.stringify(messages.value))
  })
  }

  // 2. 恢复初始欢迎语，清空当前画布
  messages.value = [
    {
      role: 'ai',
      type: 'text',
      content:
        '你好！我是你的 AI PPT 助手。请问你想生成什么主题的 PPT？您也可以直接上传 PDF 论文或教学视频，我将从中提取核心内容为您制作。',
    },
  ]

  // 3. 彻底清空输入框和各种状态 (不仅清空文本，还要清空富文本的 HTML 标签)
  inputText.value = ''
  if (editorRef.value) {
    editorRef.value.innerHTML = '' // 核心：清空带颜色的 @ 标签
    editorRef.value.innerText = '' 
  }
  
  pendingAttachments.value = []
  if (isRecording.value) stopVoiceInput()

  // 4. 调用 SideBar 子组件暴露的方法，取消知识库勾选
  if (sideBarRef.value && sideBarRef.value.resetKnowledgeBase) {
    sideBarRef.value.resetKnowledgeBase()
  }

  scrollToBottom()
}
// ================= 历史记录操作逻辑 =================

// 1. 删除历史
const handleDeleteHistory = (id: number) => {
  // 直接操作 store 里的数组，它会自动触发 watch 写入 localStorage
  historyStore.list = historyStore.list.filter(item => item.id !== id)
}

// 2. 置顶历史
const handlePinHistory = (id: number) => {
  const index = historyList.value.findIndex(item => item.id === id)
  if (index > 0) {
    // 把它从原位置拔出来，塞到数组最前面
    const [pinnedItem] = historyList.value.splice(index, 1)
    historyList.value.unshift(pinnedItem)
  }
}

// 3. 重命名历史
const handleRenameHistory = (item: any) => {
  // 使用浏览器自带的 prompt 弹窗获取新名字，你也可以换成 Element Plus 的 ElMessageBox
  const newTitle = prompt('请输入新的对话名称：', item.title)
  if (newTitle !== null && newTitle.trim() !== '') {
    const target = historyList.value.find(h => h.id === item.id)
    if (target) {
      target.title = newTitle.trim()
    }
  }
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
  background-color: #ffb800;
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
  background-color: #dfedd6;
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
  border-color: #ffb800;
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
  border-color: #ffb800;
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
  background: #fff7d6;
  border: 1px solid #ffb800;
  color: #cc8800;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.remove-att {
  background: transparent;
  border: none;
  color: #cc8800;
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
  color: #ffb800;
}

/* 麦克风录音动画 */
.mic-btn.recording-active {
  color: #ffb800;
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
  background-color: #a2bb7a;
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
.rich-textarea {
  width: 100%;
  min-height: 60px;
  max-height: 120px; /* 如果内容多可以限制最大高度 */
  overflow-y: auto;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  box-sizing: border-box;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.outline-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.outline-header {
  background: #fafafa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.download-word-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.download-word-btn:hover {
  opacity: 0.8;
}

.outline-body {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.outline-editor {
  outline: none;
  line-height: 1.8;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #444;
  white-space: pre-wrap;
  padding: 8px;
  border: 1px transparent dashed;
  transition: all 0.3s;
}

.outline-editor:focus {
  background: #fffdf6;
  border-color: #ffb800;
}

.outline-footer {
  padding: 10px 16px;
  background: #fffbe6;
  border-top: 1px solid #ffe58f;
}

.outline-footer .tip {
  font-size: 12px;
  color: #856404;
}
/* 模拟 textarea 的 placeholder 效果 */
.rich-textarea:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
  display: block; /* 保证空状态下光标位置正确 */
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
.outline-editor :deep(h1) {
  font-size: 20px;
  font-weight: bold;
  margin: 16px 0 10px;
  color: #1f2328;
}

.outline-editor :deep(h2) {
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 8px;
  color: #24292f;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 6px;
}

.outline-editor :deep(h3) {
  font-size: 15px;
  font-weight: bold;
  margin: 12px 0 6px;
  color: #444;
}

.outline-editor :deep(li) {
  margin-left: 22px;
  list-style-type: disc;
  margin-bottom: 6px;
  line-height: 1.6;
}

.outline-editor :deep(hr) {
  border: none;
  border-top: 2px dashed #e1e4e8;
  margin: 20px 0;
}

.outline-editor :deep(strong) {
  color: #ff5722;
}
</style>
