<template>
  <transition name="toast-fade">
    <div v-if="visible" :class="['toast', type]">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      message: '',
      type: 'success',
      timer: null
    }
  },
  computed: {
    icon() {
      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
      }
      return icons[this.type] || '✅'
    }
  },
  methods: {
    show(message, type = 'success', duration = 3000) {
      this.message = message
      this.type = type
      this.visible = true
      
      if (this.timer) clearTimeout(this.timer)
      
      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 30px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  backdrop-filter: blur(10px);
  animation: bounce-in 0.5s ease;
}

.toast.success {
  background: linear-gradient(135deg, #00b894 0%, #55efc4 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #d63031 0%, #ff7675 100%);
  color: white;
}

.toast.info {
  background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  color: white;
}

.toast.warning {
  background: linear-gradient(135deg, #fdcb6e 0%, #ffeaa7 100%);
  color: #2d3436;
}

.toast-icon {
  font-size: 1.5rem;
}

.toast-message {
  font-size: 1rem;
}

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

@keyframes bounce-in {
  0% {
    transform: translateX(-50%) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}
</style>
