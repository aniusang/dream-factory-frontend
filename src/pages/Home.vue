<template>
  <div class="home-page">
    <!-- 动态Logo动画 -->
    <transition name="logo-animation">
      <div v-if="showLogo" :class="['animated-logo', { 'logo-moved': logoMoved }]">
        <div class="logo-container">
          <!-- 书本 -->
          <div class="book">
            <div class="book-left"></div>
            <div class="book-right"></div>
            <div class="book-spine"></div>
          </div>
          <!-- 画笔 -->
          <div class="brush" :class="{ 'brush-drawing': isDrawing }">
            <div class="brush-handle"></div>
            <div class="brush-ferrule"></div>
            <div class="brush-bristles"></div>
          </div>
          <!-- 绘画痕迹 -->
          <div class="paint-strokes">
            <div
              v-for="i in 3" :key="i" class="stroke" 
              :style="{ backgroundColor: strokeColors[i-1], animationDelay: `${i * 0.3}s` }"
            ></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <transition name="content-fade">
      <div v-if="showContent" class="main-content">
        <!-- 右上角按钮 -->
        <div class="top-right-actions">
          <button class="action-btn login-btn" @click="goToAuth('login')">
            <span class="btn-icon">👤</span>
            <span>登录</span>
          </button>
          <button class="action-btn register-btn" @click="goToAuth('register')">
            <span class="btn-icon">✨</span>
            <span>注册</span>
          </button>
        </div>

        <!-- 中心标语 -->
        <div class="hero-section">
          <h1 class="hero-title">
            <span
              v-for="(word, index) in titleWords" :key="index" class="title-word" 
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ word }}
            </span>
          </h1>
          <p class="hero-subtitle">
            <span
              v-for="(char, index) in subtitleChars" :key="index" class="subtitle-char"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              {{ char }}
            </span>
          </p>
          
          <!-- 开始按钮 -->
          <button class="start-btn" @click="goToCustom">
            <span class="btn-text">开始创作</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>

        <!-- 浮动装饰元素 -->
        <div class="floating-elements">
          <div
            v-for="(item, index) in floatingItems" :key="index" class="float-item"
            :style="{ 
              left: item.left, 
              top: item.top,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`
            }"
          >
            {{ item.emoji }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      showLogo: true,
      logoMoved: false,
      showContent: false,
      isDrawing: false,
      strokeColors: ['#FF6B9D', '#4ECDC4', '#FFE66D'],
      titleWords: ['记', '录', '孩', '子', '奇', '思', '妙', '想'],
      subtitleChars: '立刻生成你的专属绘本✨'.split(''),
      floatingItems: [
        { emoji: '🎨', left: '10%', top: '20%', delay: 0, duration: 3 },
        { emoji: '📚', left: '85%', top: '15%', delay: 0.5, duration: 3.5 },
        { emoji: '🌈', left: '15%', top: '70%', delay: 1, duration: 4 },
        { emoji: '⭐', left: '80%', top: '65%', delay: 1.5, duration: 3.2 },
        { emoji: '🎈', left: '5%', top: '45%', delay: 0.8, duration: 3.8 },
        { emoji: '🦄', left: '90%', top: '40%', delay: 1.2, duration: 3.6 },
        { emoji: '🎪', left: '50%', top: '10%', delay: 0.3, duration: 4.2 },
        { emoji: '🎭', left: '25%', top: '85%', delay: 1.8, duration: 3.4 }
      ]
    }
  },
  mounted() {
    // 画笔绘画动画
    setInterval(() => {
      this.isDrawing = true
      setTimeout(() => {
        this.isDrawing = false
      }, 1000)
    }, 2000)

    // Logo移动到左上角
    setTimeout(() => {
      this.logoMoved = true
      setTimeout(() => {
        this.showContent = true
      }, 800)
    }, 2000)
  },
  methods: {
    goToAuth(mode) {
      this.$router.push({ path: '/auth', query: { mode } })
    },
    goToCustom() {
      // 检查是否已登录
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (isLoggedIn) {
        this.$router.push('/custom')
      } else {
        this.$router.push('/auth')
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 动态Logo */
.animated-logo {
  position: fixed;
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 100;
}

.animated-logo.logo-moved {
  width: 80px;
  height: 80px;
  top: 40px;
  left: 40px;
  transform: translate(0, 0);
}

.logo-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 书本 */
.book {
  width: 200px;
  height: 160px;
  position: relative;
  display: flex;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

.animated-logo.logo-moved .book {
  width: 60px;
  height: 48px;
}

.book-left,
.book-right {
  width: 50%;
  height: 100%;
  background: #fff;
  border: 4px solid #000;
  position: relative;
}

.animated-logo.logo-moved .book-left,
.animated-logo.logo-moved .book-right {
  border: 2px solid #000;
}

.book-left {
  border-radius: 8px 0 0 8px;
  border-right: none;
  background: linear-gradient(to right, #f8f8f8, #fff);
  transform-origin: right center;
  animation: page-flip 3s ease-in-out infinite;
}

.book-right {
  border-radius: 0 8px 8px 0;
  border-left: none;
  background: linear-gradient(to left, #f8f8f8, #fff);
}

.book-spine {
  position: absolute;
  width: 8px;
  height: 100%;
  background: linear-gradient(to right, #ddd, #eee, #ddd);
  left: 50%;
  transform: translateX(-50%);
  border-top: 4px solid #000;
  border-bottom: 4px solid #000;
  z-index: 1;
}

.animated-logo.logo-moved .book-spine {
  width: 3px;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

@keyframes page-flip {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(-15deg);
  }
}

/* 画笔 - 大小为书本的60%以上 */
.brush {
  position: absolute;
  width: 220px;
  height: 220px;
  top: -50px;
  right: -40px;
  transform: rotate(-45deg);
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: brush-idle-large 2s ease-in-out infinite;
}

.animated-logo.logo-moved .brush {
  width: 55px;
  height: 55px;
  top: -15px;
  right: -15px;
  animation: brush-idle-small 2s ease-in-out infinite;
}

.brush.brush-drawing {
  animation: brush-paint-large 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

.animated-logo.logo-moved .brush.brush-drawing {
  animation: brush-paint-small 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* 大logo时的待机动画 */
@keyframes brush-idle-large {
  0%, 100% {
    transform: rotate(-45deg) translateY(0) translateX(0);
  }
  50% {
    transform: rotate(-45deg) translateY(-8px) translateX(-8px);
  }
}

/* 小logo时的待机动画 */
@keyframes brush-idle-small {
  0%, 100% {
    transform: rotate(-45deg) translateY(0) translateX(0);
  }
  50% {
    transform: rotate(-45deg) translateY(-2px) translateX(-2px);
  }
}

/* 大logo时的绘画动画 - 幅度大 */
@keyframes brush-paint-large {
  0% {
    transform: rotate(-45deg) translateY(-40px) translateX(-40px);
  }
  25% {
    transform: rotate(-55deg) translateY(50px) translateX(25px);
  }
  50% {
    transform: rotate(-35deg) translateY(45px) translateX(40px);
  }
  75% {
    transform: rotate(-50deg) translateY(48px) translateX(30px);
  }
  100% {
    transform: rotate(-45deg) translateY(-40px) translateX(-40px);
  }
}

/* 小logo时的绘画动画 - 幅度小 */
@keyframes brush-paint-small {
  0% {
    transform: rotate(-45deg) translateY(-8px) translateX(-8px);
  }
  25% {
    transform: rotate(-50deg) translateY(10px) translateX(5px);
  }
  50% {
    transform: rotate(-40deg) translateY(8px) translateX(8px);
  }
  75% {
    transform: rotate(-48deg) translateY(9px) translateX(6px);
  }
  100% {
    transform: rotate(-45deg) translateY(-8px) translateX(-8px);
  }
}

/* 笔杆 - 上细下粗（越靠近笔尖越粗） */
.brush-handle {
  width: 45px;
  height: 120px;
  background: linear-gradient(to bottom, #8B4513, #A0522D, #8B4513);
  border-radius: 22px 22px 4px 4px;
  border: 4px solid #000;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  /* 上细下粗的锥形效果 */
  clip-path: polygon(
    35% 0%, 65% 0%,
    70% 30%, 80% 60%,
    85% 100%, 15% 100%,
    20% 60%, 30% 30%
  );
}

.animated-logo.logo-moved .brush-handle {
  width: 14px;
  height: 35px;
  border: 2px solid #000;
  border-radius: 7px 7px 2px 2px;
  clip-path: polygon(
    35% 0%, 65% 0%,
    70% 30%, 80% 60%,
    85% 100%, 15% 100%,
    20% 60%, 30% 30%
  );
}

/* 笔箍 */
.brush-ferrule {
  width: 48px;
  height: 22px;
  background: linear-gradient(to bottom, #E0E0E0, #C0C0C0, #A8A8A8);
  border: 4px solid #000;
  border-radius: 4px;
  position: absolute;
  top: 115px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.animated-logo.logo-moved .brush-ferrule {
  width: 14px;
  height: 8px;
  border: 2px solid #000;
  top: 33px;
}

/* 笔毛 - 笔头粗 */
.brush-bristles {
  width: 56px;
  height: 45px;
  background: linear-gradient(to bottom, #FF6B9D, #FF8FB3, #FFA5C8);
  border: 4px solid #000;
  border-radius: 0 0 28px 28px;
  position: absolute;
  top: 132px;
  left: 50%;
  transform: translateX(-50%);
  clip-path: polygon(
    10% 0%, 12% 100%, 15% 95%, 18% 100%, 21% 90%, 24% 100%,
    27% 85%, 30% 100%, 33% 95%, 36% 100%, 39% 90%, 42% 100%,
    45% 85%, 48% 100%, 51% 95%, 54% 100%, 57% 90%, 60% 100%,
    63% 85%, 66% 100%, 69% 95%, 72% 100%, 75% 90%, 78% 100%,
    82% 95%, 85% 100%, 88% 100%, 90% 0%
  );
}

.animated-logo.logo-moved .brush-bristles {
  width: 16px;
  height: 14px;
  border: 2px solid #000;
  top: 39px;
  border-radius: 0 0 8px 8px;
}

/* 绘画痕迹 */
.paint-strokes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.stroke {
  position: absolute;
  height: 8px;
  border-radius: 4px;
  opacity: 0;
  animation: stroke-appear 3s ease-in-out infinite;
}

.animated-logo.logo-moved .stroke {
  height: 3px;
  border-radius: 2px;
}

.stroke:nth-child(1) {
  width: 60px;
  top: 45%;
  left: 30%;
  transform: rotate(-5deg);
}

.stroke:nth-child(2) {
  width: 50px;
  top: 55%;
  left: 35%;
  transform: rotate(3deg);
}

.stroke:nth-child(3) {
  width: 45px;
  top: 65%;
  left: 32%;
  transform: rotate(-2deg);
}

.animated-logo.logo-moved .stroke:nth-child(1) {
  width: 20px;
  top: 45%;
  left: 25%;
}

.animated-logo.logo-moved .stroke:nth-child(2) {
  width: 18px;
  top: 55%;
  left: 28%;
}

.animated-logo.logo-moved .stroke:nth-child(3) {
  width: 16px;
  top: 65%;
  left: 26%;
}

@keyframes stroke-appear {
  0%, 20% {
    opacity: 0;
    width: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

/* 主内容 */
.main-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 40px;
}

/* 右上角按钮 */
.top-right-actions {
  position: fixed;
  top: 40px;
  right: 40px;
  display: flex;
  gap: 15px;
  z-index: 50;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 4px 4px 0 #000;
}

.action-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.action-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}

.login-btn {
  background: #4ECDC4;
}

.register-btn {
  background: #FF6B9D;
  color: #fff;
}

.btn-icon {
  font-size: 1.3rem;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  max-width: 900px;
}

.hero-title {
  font-size: 5rem;
  font-weight: 900;
  margin-bottom: 30px;
  line-height: 1.2;
}

.title-word {
  display: inline-block;
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
  margin: 0 5px;
  color: #000;
  text-shadow: 
    4px 4px 0 #FFE66D,
    8px 8px 0 #FF6B9D,
    12px 12px 0 #4ECDC4;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.hero-subtitle {
  font-size: 2rem;
  margin-bottom: 50px;
  color: #000;
  font-weight: 600;
}

.subtitle-char {
  display: inline-block;
  animation: wave 1s ease-in-out both;
}

@keyframes wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 开始按钮 */
.start-btn {
  padding: 20px 60px;
  font-size: 1.8rem;
  font-weight: bold;
  border: 5px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 8px 8px 0 #000;
  display: inline-flex;
  align-items: center;
  gap: 15px;
  animation: pulse-btn 2s ease-in-out infinite;
}

.start-btn:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 #000;
}

.start-btn:active {
  transform: translate(4px, 4px);
  box-shadow: 4px 4px 0 #000;
}

@keyframes pulse-btn {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.btn-arrow {
  font-size: 2rem;
  transition: transform 0.3s ease;
}

.start-btn:hover .btn-arrow {
  transform: translateX(10px);
}

/* 浮动元素 */
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.float-item {
  position: absolute;
  font-size: 3rem;
  animation: float-around 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes float-around {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(5deg);
  }
  50% {
    transform: translate(0, -40px) rotate(-5deg);
  }
  75% {
    transform: translate(-20px, -20px) rotate(5deg);
  }
}

/* 过渡动画 */
.logo-animation-enter-active, .logo-animation-leave-active {
  transition: all 0.5s ease;
}

.logo-animation-enter-from, .logo-animation-leave-to {
  opacity: 0;
  transform: scale(0);
}

.content-fade-enter-active {
  transition: all 0.8s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .title-word {
    text-shadow: 
      2px 2px 0 #FFE66D,
      4px 4px 0 #FF6B9D,
      6px 6px 0 #4ECDC4;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .start-btn {
    font-size: 1.4rem;
    padding: 15px 40px;
  }
  
  .top-right-actions {
    top: 20px;
    right: 20px;
    flex-direction: column;
  }
  
  .float-item {
    font-size: 2rem;
  }
}
</style>
