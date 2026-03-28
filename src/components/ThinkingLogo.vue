<template>
  <div class="thinking-wrapper" :class="{ 'is-thinking': isThinking, 'is-finished': !isThinking }">
    
    <div class="logo-scene">
      <div class="center-star"></div>
      <div class="orbit-wrapper">
        <div class="orbit-ring">
          <div class="comet"></div>
        </div>
      </div>
    </div>

    <div v-if="isThinking" class="thinking-text">思考中<span class="dot-ani">...</span></div>
  </div>
</template>

<script setup>
// 完全保留 isThinking 变量名及逻辑
defineProps({
  isThinking: Boolean,
})
</script>

<style scoped>
.thinking-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

/* ================== 1. 3D 舞台容器 ================== */
/* 尺寸由原本的 160px 按比例缩小为 40px，适配组件大小 */
.logo-scene {
  position: relative;
  width: 40px; 
  height: 40px;
  perspective: 200px; /* 视角景深随之调小 */
  transform-style: preserve-3d;
}

/* 2. 中心的星星 */
.center-star {
  position: absolute;
  width: 100%;
  height: 100%;
  /* 请确保图片路径正确，或替换为你的星星素材 */
  background-image: url('../assets/images/star.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: translateZ(1px); /* 微微浮出 */
  z-index: 2;
}

/* 3. 静态的轨道倾斜控制器 */
.orbit-wrapper {
  position: absolute;
  top: 9%;
  left: 9%;
  width: 80%;
  height: 80%;
  transform-style: preserve-3d;
  transform: rotateZ(-20deg) rotateX(55deg);
}

/* 4. 真正旋转的加粗星环 */
.orbit-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;

  /* 不对称加粗！(原图 12 3 3 12 按比例等比缩小) */
  border-style: solid;
  border-width: 3px 1px 1px 3px;

  /* 主题色渐变发光 */
  border-color: #ECA427 rgba(236, 164, 39, 0.3) rgba(236, 164, 39, 0.1) #FF921C;
  box-shadow:
    0 0 5px rgba(255, 146, 28, 0.5),
    inset 0 0 4px rgba(255, 146, 28, 0.5);

  transform-style: preserve-3d;
  /* 动画默认挂载，通过父级状态控制播放或暂停 */
  animation: spinOrbit 4s linear infinite;
}

/* 5. 轨道上的大号发光金球 */
.comet {
  position: absolute;
  
  /* 将球移动到 45度的粗细边框分界点 */
  top: 14.6%;    
  left: 85.4%;   
  transform: translate(-50%, -50%); 

  /* 尺寸按比例缩小为原来的 1/4 */
  width: 6px;
  height: 6px;
  border-radius: 50%;
  
  /* 颜色和发光保持不变，发光范围按比例调整 */
  background: radial-gradient(circle at 30% 30%, #F7F19C, #ECA427, #FF921C);
  box-shadow: 
    0 0 4px #FF921C,
    0 0 8px #ECA427;
}

/* 6. 动画关键帧：轨道平面内旋转 */
@keyframes spinOrbit {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

/* ================== 状态控制 (复用 isThinking) ================== */

/* 思考中：正常无限旋转 */
.is-thinking .orbit-ring {
  animation-play-state: running;
}

/* 思考完毕：星环缓停（暂停动画），你可以按需改成 display: none 或者修改透明度 */
.is-finished .orbit-ring {
  animation-play-state: paused; 
}


/* ================== 思考中文字的动画 (保持原样) ================== */
.thinking-text {
  font-size: 14px;
  /* 如果你想让文字颜色和星环的金黄色呼应，可以把这里改为 #ECA427 */
  color: #ECA427; 
  font-weight: 500;
}

.dot-ani {
  display: inline-block;
  width: 1.5em;
  text-align: left;
  animation: dots 1.5s infinite steps(4);
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
}
</style>