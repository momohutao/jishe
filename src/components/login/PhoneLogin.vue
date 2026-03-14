<!-- 手机号登录逻辑 -->
<template>
  <div class="phone-login">
    <!-- 手机号输入框 + 错误提示 -->
    <div class="form-item">
      <input
        type="tel"
        placeholder="手机号"
        class="form-input"
        :class="{ 'input-error': phoneError }"
        v-model="phone"
        @input="validatePhone"
        ref="phoneInput"
      />
      <div class="error-message" v-if="phoneError">{{ phoneError }}</div>
    </div>

    <!-- 图形验证码：输入框 + 动态验证码图片（点击刷新）+ 错误提示 -->
    <div class="form-item">
      <div class="captcha-row">
        <div class="captcha-input">
          <input
            type="text"
            placeholder="图形验证码"
            class="form-input"
            :class="{ 'input-error': captchaError }"
            v-model="captchaInput"
            @input="captchaError = ''"
            ref="captchaInputRef"
          />
        </div>
        <div class="captcha-image" aria-label="图形验证码" @click="handleRefreshClick">
          <canvas ref="captchaCanvas" width="100" height="48"></canvas>
        </div>
      </div>
      <div class="error-message" v-if="captchaError">{{ captchaError }}</div>
    </div>

    <!-- 短信验证码：输入框 + 获取按钮 + 错误提示 -->
    <div class="form-item sms-row">
      <div class="sms-input">
        <input
          type="text"
          placeholder="短信验证码"
          class="form-input"
          :class="{ 'input-error': smsCodeError }"
          v-model="smsCode"
          @input="validateSmsCode"
          ref="smsCodeInput"
        />
      </div>
      <button class="sms-btn" @click="handleGetSmsCode" :disabled="smsCountdown > 0">
        {{ smsCountdown > 0 ? `${smsCountdown}秒后重新获取` : '获取验证码' }}
      </button>
    </div>
    <div class="error-message" v-if="smsCodeError">{{ smsCodeError }}</div>

    <!-- 提示：未注册手机号将自动注册 -->
    <div class="form-tip">未注册的手机号将自动注册账号</div>

    <!-- 登录按钮 -->
    <button class="login-btn" @click="handleLogin" :disabled="loginLoading">
      <span v-if="loginLoading" class="loading-spinner"></span>
      {{ loginLoading ? '登录中...' : '登录' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useCaptcha } from '@/composables/useCaptcha'
import { useCountdown } from '@/composables/useCountdown'

// 表单数据
const phone = ref('')
const captchaInput = ref('')
const smsCode = ref('')

// 错误信息
const phoneError = ref('')
const captchaError = ref('')
const smsCodeError = ref('')

// 登录 loading
const loginLoading = ref(false)

// 短信验证码倒计时
const { countdown: smsCountdown, start: startSmsCountdown } = useCountdown(60)

// DOM 引用
const phoneInput = ref(null)
const captchaInputRef = ref(null)
const smsCodeInput = ref(null)

// 图形验证码
const { captchaCode, captchaCanvas, initCaptcha, refreshCaptcha, drawCaptcha } = useCaptcha()

// 手机号合法性检查
function validatePhone() {
  const value = phone.value.trim()
  if (!value) {
    phoneError.value = '手机号不能为空'
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    phoneError.value = '请输入合法的11位手机号'
  } else {
    phoneError.value = ''
  }
}

// 短信验证码格式检查
function validateSmsCode() {
  const value = smsCode.value.trim()
  if (value && !/^\d{6}$/.test(value)) {
    smsCodeError.value = '验证码必须为6位数字'
  } else {
    smsCodeError.value = ''
  }
}

// 获取短信验证码（模拟）
async function handleGetSmsCode() {
  validatePhone()
  if (phoneError.value) {
    phoneInput.value?.focus()
    return
  }

  if (captchaInput.value !== captchaCode.value) {
    captchaError.value = '图形验证码不正确'
    refreshCaptcha()
    await nextTick()
    captchaInputRef.value?.focus()
    return
  }

  // 模拟发送验证码，成功后开始倒计时
  alert('验证码已发送至手机（模拟）')
  startSmsCountdown()
}

// 登录操作
async function handleLogin() {
  validatePhone()
  if (phoneError.value) {
    phoneInput.value?.focus()
    return
  }

  if (captchaInput.value !== captchaCode.value) {
    captchaError.value = '图形验证码不正确'
    refreshCaptcha()
    await nextTick()
    captchaInputRef.value?.focus()
    return
  }

  validateSmsCode()
  if (smsCodeError.value) {
    smsCodeInput.value?.focus()
    return
  }

  loginLoading.value = true
  // 模拟登录请求
  setTimeout(() => {
    alert('手机号登录成功（模拟）')
    loginLoading.value = false
  }, 1000)
}

// 主动刷新（点击图片时调用）
function handleRefreshClick() {
  refreshCaptcha()
  captchaError.value = ''
  captchaInput.value = ''
}

// 初始化验证码
onMounted(() => {
  initCaptcha()
})
</script>

<style scoped>
.phone-login {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  width: 100%;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 40px;
  background-color: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition:
    border 0.2s ease,
    box-shadow 0.2s ease;
  color: #333;
}

.form-input.input-error {
  border-color: #e53e3e;
}

.form-input::placeholder {
  color: #aaa;
  font-weight: 300;
}

.form-input:focus {
  border-color: #888;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.02);
}

.error-message {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
  margin-left: 16px;
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-image {
  flex-shrink: 0;
  width: 100px;
  height: 48px;
  border-radius: 40px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.captcha-image:hover {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.captcha-image canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.sms-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sms-input {
  flex: 1;
  min-width: 0;
}

.sms-btn {
  flex-shrink: 0;
  padding: 14px 18px;
  font-size: 15px;
  color: #3a3a3a;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 40px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.3px;
  outline: none;
}

.sms-btn:hover {
  background-color: #f5f5f5;
  border-color: #aaa;
  color: #111;
}

.sms-btn:active {
  background-color: #eaeaea;
}

.form-tip {
  font-size: 14px;
  color: #777;
  text-align: center;
  margin-top: 5px;
  margin-bottom: 5px;
  letter-spacing: 0.3px;
  border-top: 1px dashed #d0d0d0;
  padding-top: 18px;
}

.login-btn {
  width: 100%;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  background-color: #2a2a2a;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  letter-spacing: 1px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.login-btn:hover {
  background-color: #111;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.login-btn:active {
  background-color: #222;
  transform: scale(0.98);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 按钮禁用样式 */
.sms-btn:disabled,
.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
