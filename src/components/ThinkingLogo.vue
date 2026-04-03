<template>
  <div class="thinking-wrapper" :class="{ thinking: isThinking }">
    <div class="logo-scene">
      <div class="logo-image"></div>
    </div>
    <div v-if="isThinking" class="text">思考中<span class="dots">...</span></div>
  </div>
</template>

<script setup>
defineProps({
  isThinking: Boolean
})
</script>

<style scoped>
.thinking-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-scene {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 你的 LOGO 原图不动，只渐变色调 */
.logo-image {
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/star.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.3s ease;
}

/* 核心：1s 循环 · 高级柔和色调渐变 */
.thinking .logo-image {
  animation: logoBreath 1s ease-in-out infinite;
}

.text {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

.dots {
  display: inline-block;
  width: 1.5em;
  animation: dots 1.5s infinite steps(4);
}

/* 1s 循环 · LOGO 颜色柔和呼吸渐变（高级不刺眼） */
@keyframes logoBreath {
  0% {
    filter: saturate(1) brightness(1);
  }
  50% {
    filter: saturate(1.2) brightness(1.15);
  }
  100% {
    filter: saturate(1) brightness(1);
  }
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
}
</style>