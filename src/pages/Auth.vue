<template>
  <div class="auth-page">
    <!-- 返回首页按钮 -->
    <button class="back-btn" @click="goHome">
      <span>←</span>
      <span>返回首页</span>
    </button>

    <!-- 主内容 -->
    <div class="auth-container">
      <!-- 左侧装饰 -->
      <div class="left-decoration">
        <div class="deco-circle circle-1"></div>
        <div class="deco-circle circle-2"></div>
        <div class="deco-circle circle-3"></div>
        <div class="floating-emoji">
          <span
            v-for="(emoji, index) in emojis" :key="index" 
            :style="{ animationDelay: `${index * 0.3}s` }"
          >
            {{ emoji }}
          </span>
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="auth-card">
        <div class="card-header">
          <h2 class="auth-title">{{ isLogin ? '欢迎回来！' : '加入我们！' }}</h2>
          <p class="auth-subtitle">{{ isLogin ? '继续你的创作之旅' : '开启专属绘本创作' }}</p>
        </div>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📱</span>
              <span>手机号码</span>
            </label>
            <input 
              v-model="formData.phone" 
              type="tel" 
              class="form-input"
              placeholder="请输入11位手机号"
              pattern="[0-9]{11}"
              maxlength="11"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔐</span>
              <span>密码</span>
            </label>
            <input 
              v-model="formData.password" 
              type="password" 
              class="form-input"
              placeholder="请输入密码（至少6位）"
              minlength="6"
              required
            />
          </div>

          <div v-if="!isLogin" class="form-group">
            <label class="form-label">
              <span class="label-icon">🔐</span>
              <span>确认密码</span>
            </label>
            <input 
              v-model="formData.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="请再次输入密码"
              minlength="6"
              required
            />
          </div>

          <div v-if="!isLogin" class="form-group">
            <label class="form-label">
              <span class="label-icon">✨</span>
              <span>昵称</span>
            </label>
            <input 
              v-model="formData.nickname" 
              type="text" 
              class="form-input"
              placeholder="给自己起个好听的名字吧"
              required
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span>{{ isSubmitting ? '处理中...' : (isLogin ? '立即登录' : '立即注册') }}</span>
            <span v-if="!isSubmitting" class="btn-arrow">→</span>
          </button>
        </form>

        <div class="auth-toggle">
          <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <button class="toggle-link" @click="toggleMode">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api.js'

export default {
  name: 'Auth',
  emits: ['login'],
  data() {
    return {
      isLogin: true,
      formData: {
        phone: '',
        password: '',
        confirmPassword: '',
        nickname: ''
      },
      emojis: ['🎨', '📚', '🌈', '⭐', '🎈', '🦄', '🎪', '🎭'],
      isSubmitting: false
    }
  },
  mounted() {
    const mode = this.$route.query.mode
    if (mode === 'register') {
      this.isLogin = false
    }
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin
      this.formData = {
        phone: '',
        password: '',
        confirmPassword: '',
        nickname: ''
      }
    },
    async handleSubmit() {
      // 前端验证
      if (!this.formData.phone || this.formData.phone.length !== 11) {
        window.$toast('请输入正确的手机号码', 'error')
        return
      }
      
      if (!this.formData.password || this.formData.password.length < 6) {
        window.$toast('密码至少需要6位', 'error')
        return
      }
      
      if (!this.isLogin) {
        if (!this.formData.confirmPassword) {
          window.$toast('请确认密码', 'error')
          return
        }
        
        if (this.formData.password !== this.formData.confirmPassword) {
          window.$toast('两次输入的密码不一致', 'error')
          return
        }
        
        if (!this.formData.nickname) {
          window.$toast('请输入昵称', 'error')
          return
        }
      }
      
      // 防止重复提交
      if (this.isSubmitting) return
      this.isSubmitting = true
      
      try {
        if (this.isLogin) {
          // 登录
          const response = await authAPI.login({
            phone: this.formData.phone,
            password: this.formData.password
          })
          
          // 保存 token
          localStorage.setItem('access_token', response.access_token)
          localStorage.setItem('refresh_token', response.refresh_token)
          localStorage.setItem('isLoggedIn', 'true')
          
          // 获取用户详细信息
          try {
            const userInfo = await authAPI.getCurrentUser()
            console.log('获取用户信息成功:', userInfo)
            
            // 保存用户信息
            localStorage.setItem('userPhone', userInfo.phone)
            localStorage.setItem('userId', userInfo.id)
            
            if (userInfo.full_name) {
              localStorage.setItem('userNickname', userInfo.full_name)
            } else {
              // 如果没有昵称，使用手机号后4位
              localStorage.removeItem('userNickname')
            }
          } catch (error) {
            console.error('获取用户信息失败:', error)
            // 即使获取用户信息失败，也继续登录流程
            localStorage.setItem('userPhone', this.formData.phone)
            localStorage.removeItem('userNickname')
          }
          
          this.$emit('login')
          window.$toast('登录成功！', 'success')
          
          setTimeout(() => {
            this.$router.push('/custom')
          }, 1000)
        } else {
          // 注册
          const response = await authAPI.register({
            phone: this.formData.phone,
            password: this.formData.password,
            nickname: this.formData.nickname
          })
          
          // 注册成功后保存用户信息
          localStorage.setItem('userPhone', response.phone)
          localStorage.setItem('userNickname', response.full_name)
          
          window.$toast('注册成功！请登录', 'success')
          
          // 切换到登录模式
          setTimeout(() => {
            this.isLogin = true
            this.formData = {
              phone: this.formData.phone,
              password: '',
              confirmPassword: '',
              nickname: ''
            }
          }, 1500)
        }
      } catch (error) {
        console.error('请求失败:', error)
        
        // 根据错误状态码显示不同的提示
        if (error.status === 400) {
          window.$toast('用户名或手机号已存在', 'error')
        } else if (error.status === 401) {
          window.$toast(error.message || '用户名或密码错误', 'error')
        } else if (error.status === 422) {
          window.$toast('参数验证失败，请检查输入', 'error')
        } else {
          window.$toast(error.message || '操作失败，请重试', 'error')
        }
      } finally {
        this.isSubmitting = false
      }
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

/* 返回按钮 */
.back-btn {
  position: fixed;
  top: 40px;
  left: 40px;
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
  transition: all 0.3s ease;
  box-shadow: 4px 4px 0 #000;
  z-index: 100;
}

.back-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

/* 容器 */
.auth-container {
  display: flex;
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  width: 100%;
}

/* 左侧装饰 */
.left-decoration {
  flex: 1;
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 8px solid #000;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #FFE66D;
  animation: rotate-circle 10s linear infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #FF6B9D;
  animation: rotate-circle 8s linear infinite reverse;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: #4ECDC4;
  animation: rotate-circle 6s linear infinite;
}

@keyframes rotate-circle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.floating-emoji {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-emoji span {
  position: absolute;
  font-size: 3rem;
  animation: float-emoji 3s ease-in-out infinite;
}

.floating-emoji span:nth-child(1) { top: 10%; left: 20%; }
.floating-emoji span:nth-child(2) { top: 20%; right: 15%; }
.floating-emoji span:nth-child(3) { top: 40%; left: 10%; }
.floating-emoji span:nth-child(4) { top: 50%; right: 20%; }
.floating-emoji span:nth-child(5) { top: 70%; left: 25%; }
.floating-emoji span:nth-child(6) { top: 80%; right: 10%; }
.floating-emoji span:nth-child(7) { bottom: 10%; left: 15%; }
.floating-emoji span:nth-child(8) { bottom: 20%; right: 25%; }

@keyframes float-emoji {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* 表单卡片 */
.auth-card {
  flex: 1;
  background: #fff;
  border: 5px solid #000;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 12px 12px 0 #000;
  animation: slide-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 10px;
  text-shadow: 3px 3px 0 #FFE66D;
}

.auth-subtitle {
  font-size: 1.2rem;
  color: #666;
  font-weight: 600;
}

/* 表单 */
.auth-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 1.1rem;
  color: #000;
}

.label-icon {
  font-size: 1.3rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 3px solid #000;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #FF6B9D;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
  transform: translateY(-2px);
}

.code-group {
  display: flex;
  gap: 10px;
}

.code-group .form-input {
  flex: 1;
}

.code-btn {
  padding: 15px 25px;
  border: 3px solid #000;
  border-radius: 15px;
  background: #4ECDC4;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 0 #000;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #000;
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 18px;
  border: 4px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 6px 6px 0 #000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 #000;
}

.submit-btn:active {
  transform: translate(3px, 3px);
  box-shadow: 3px 3px 0 #000;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn:disabled:hover {
  transform: none;
  box-shadow: 6px 6px 0 #000;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* 切换模式 */
.auth-toggle {
  text-align: center;
  padding-top: 20px;
  border-top: 3px dashed #000;
  font-size: 1.1rem;
  color: #666;
}

.toggle-link {
  background: none;
  border: none;
  color: #FF6B9D;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.toggle-link:hover {
  color: #4ECDC4;
  transform: scale(1.1);
}

/* 响应式 */
@media (max-width: 1024px) {
  .auth-container {
    flex-direction: column;
  }
  
  .left-decoration {
    height: 300px;
  }
  
  .deco-circle {
    border-width: 5px;
  }
  
  .circle-1 { width: 200px; height: 200px; }
  .circle-2 { width: 130px; height: 130px; }
  .circle-3 { width: 70px; height: 70px; }
}

@media (max-width: 768px) {
  .auth-card {
    padding: 30px;
  }
  
  .auth-title {
    font-size: 2rem;
  }
  
  .back-btn {
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    font-size: 1rem;
  }
  
  .code-group {
    flex-direction: column;
  }
  
  .code-btn {
    width: 100%;
  }
}
</style>
