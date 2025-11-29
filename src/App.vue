<template>
  <div :class="['app-container', { 'night-mode': isNightMode }]">
    <!-- 模式过渡遮罩 -->
    <transition name="mode-transition">
      <div v-if="isTransitioning" class="mode-transition-overlay"></div>
    </transition>

    <!-- 背景装饰角色 -->
    <transition name="character-fade">
      <div v-if="!isNightMode" key="sun" class="background-character sun">
        <div class="sun-face">
          <div class="eye left"></div>
          <div class="eye right"></div>
          <div class="smile"></div>
        </div>
      </div>
      <div v-else key="moon" class="background-character moon">
        <div class="moon-face">
          <div class="eye left"></div>
          <div class="eye right"></div>
          <div class="smile"></div>
        </div>
        <div class="stars">
          <div v-for="i in 5" :key="i" class="star"></div>
        </div>
      </div>
    </transition>

    <!-- 右下角折叠菜单 -->
    <div v-if="$route.path !== '/' && $route.path !== '/auth'" class="floating-menu">
      <!-- 主按钮 -->
      <button class="menu-main-btn" :class="{ expanded: menuExpanded }" @click="menuExpanded = !menuExpanded">
        <span v-if="!menuExpanded">☰</span>
        <span v-else>×</span>
      </button>
      
      <!-- 展开的菜单项 -->
      <transition name="menu-fade">
        <div v-if="menuExpanded" class="menu-items">
          <button class="menu-item-btn" title="回到首页" @click="goHome">
            🏠
          </button>
          <button v-if="isLoggedIn" class="menu-item-btn" title="退出登录" @click="logout">
            👋
          </button>
          <button class="menu-item-btn" title="切换日夜模式" @click="toggleMode">
            <span v-if="!isNightMode">🌙</span>
            <span v-else>☀️</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- 首页和登录页的模式切换按钮 -->
    <button v-if="$route.path === '/' || $route.path === '/auth'" class="mode-toggle" title="切换日夜模式" @click="toggleMode">
      <span v-if="!isNightMode">🌙</span>
      <span v-else>☀️</span>
    </button>

    <router-view @login="handleLogin" @logout="handleLogout" />
    
    <!-- Toast 组件 -->
    <Toast ref="toast" />
  </div>
</template>

<script>
import Toast from './components/Toast.vue'

export default {
  name: 'App',
  components: {
    Toast
  },
  data() {
    return {
      isNightMode: false,
      isTransitioning: false,
      isLoggedIn: false,
      menuExpanded: false
    }
  },
  mounted() {
    // 检查登录状态
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    // 全局 toast 方法
    window.$toast = (message, type = 'success') => {
      this.$refs.toast.show(message, type)
    }
  },
  methods: {
    toggleMode() {
      this.isTransitioning = true
      setTimeout(() => {
        this.isNightMode = !this.isNightMode
        setTimeout(() => {
          this.isTransitioning = false
        }, 300)
      }, 150)
    },
    goHome() {
      this.$router.push('/')
    },
    logout() {
      localStorage.removeItem('isLoggedIn')
      this.isLoggedIn = false
      window.$toast('已退出登录', 'info')
      this.$router.push('/auth')
    },
    handleLogin() {
      this.isLoggedIn = true
    },
    handleLogout() {
      this.isLoggedIn = false
    }
  }
}
</script>

<style>
.mode-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  z-index: 9998;
  pointer-events: none;
}

.mode-transition-enter-active, .mode-transition-leave-active {
  transition: opacity 0.3s ease;
}

.mode-transition-enter-from, .mode-transition-leave-to {
  opacity: 0;
}

.character-fade-enter-active, .character-fade-leave-active {
  transition: all 0.5s ease;
}

.character-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-20deg);
}

.character-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(20deg);
}

/* 右下角折叠菜单 */
.floating-menu {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.menu-main-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.menu-main-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.menu-main-btn.expanded {
  background: #FF6B9D;
  color: white;
}

.night-mode .menu-main-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-items {
  position: absolute;
  bottom: 75px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.night-mode .menu-item-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-fade-enter-active, .menu-fade-leave-active {
  transition: all 0.3s ease;
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
