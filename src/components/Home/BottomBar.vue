<template>
  <footer class="bottom-bar">
    <div class="footer-container">
      <!-- 左右两栏布局 -->
      <div class="footer-main">
        <!-- 左侧：品牌 -->
        <div class="brand-section">
          <div class="brand">ClassWeave 织课</div>
        </div>

        <!-- 右侧：三个栏目（全部居中） -->
        <div class="columns-section">
          <!-- 集成服务栏目 -->
          <div class="footer-col">
            <h4>集成服务</h4>
            <div class="footer-links">
              <a href="#">DeepSeek</a>
            </div>
          </div>

          <!-- 产品栏目 -->
          <div class="footer-col">
            <h4>产品</h4>
            <div class="footer-links">
              <a href="#">AI 幻灯片</a>
              <a href="#">AI 教案</a>
            </div>
          </div>

          <!-- 开发者栏目 -->
          <div class="footer-col">
            <h4>开发者</h4>
            <div class="footer-links">
              <a href="#">联系我们</a>
              <a href="#">意见反馈</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部法律信息（分割线已加长） -->
      <div class="footer-bottom">
        <div class="legal-links">
          <a href="#">服务条款</a>
          <a href="#">隐私政策</a>
          <a href="#">Cookie 政策</a>
          <a href="#">中文（简体）</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 静态展示，无需逻辑
</script>

<style scoped>
.bottom-bar {
  padding: 40px 0 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.footer-container {
  --column-gap: 40px; /* 栏目间距变量 */

  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 160px 20px; /* 左右内边距160px，使内容向中心靠拢 */
  background-color: #fafafa;
  border-radius: 24px;
  border-top: 1px solid #eaeaea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

/* 主区域：左右两栏 */
.footer-main {
  display: flex;
  gap: 440px; /* 品牌与右侧间距固定，确保三列宽度足够 */
  margin-bottom: 40px;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 0 0 auto;
}

.brand {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
  white-space: nowrap;
}

/* 右侧栏目区域：三列网格 */
.columns-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--column-gap);
  flex: 1;
}

/* 列样式：所有内容居中对齐 */
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #111;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 链接列表：横向排列，允许换行 */
.footer-links {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: center;
  align-items: center;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.footer-links a:hover {
  color: #000;
  text-decoration: underline;
}

/* 底部法律信息（分割线加长） */
.footer-bottom {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
  margin-top: 20px;
  /* 分割线加长：左右各延伸20px，超出内容区域但仍在圆角内（圆角24px） */
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.legal-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.legal-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.legal-links a:hover {
  color: #000;
  text-decoration: underline;
}

/* 响应式：中等屏幕适当减小内边距和间距 */
@media (max-width: 900px) {
  .footer-container {
    --column-gap: 30px;
    padding: 40px 80px 20px; /* 左右内边距减小 */
  }

  .footer-main {
    flex-direction: column;
    gap: 30px;
  }

  .brand-section {
    text-align: center;
  }

  .brand {
    white-space: normal;
  }

  .columns-section {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 分割线加长相应调整 */
  .footer-bottom {
    margin-left: -15px;
    margin-right: -15px;
    padding-left: 15px;
    padding-right: 15px;
  }
}

/* 小于 600px 时右侧栏目改为两列 */
@media (max-width: 600px) {
  .footer-container {
    --column-gap: 24px;
    padding: 40px 40px 20px;
  }

  .columns-section {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 分割线加长进一步减小 */
  .footer-bottom {
    margin-left: -10px;
    margin-right: -10px;
    padding-left: 10px;
    padding-right: 10px;
  }
}

/* 小于 480px 时右侧栏目改为单列，分割线取消加长（保持与内容同宽） */
@media (max-width: 480px) {
  .footer-container {
    padding: 40px 16px 20px;
  }

  .columns-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .legal-links {
    gap: 16px;
  }

  .footer-bottom {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
