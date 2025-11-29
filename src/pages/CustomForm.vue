<template>
  <div class="custom-form-page">
    <!-- 导航栏 -->
    <nav class="top-nav">
      <div class="nav-container">
        <div class="nav-left"></div>
        <div class="nav-tabs">
          <button :class="['nav-tab', { active: activeTab === 'create' }]" @click="activeTab = 'create'">
            <span class="tab-icon">✨</span>
            <span>创建</span>
          </button>
          <button :class="['nav-tab', { active: activeTab === 'my' }]" @click="activeTab = 'my'">
            <span class="tab-icon">📚</span>
            <span>我的</span>
          </button>
        </div>
        <div class="nav-right">
          <span class="user-welcome">欢迎，</span>
          <a href="#" class="user-link" @click.prevent="activeTab = 'my'">{{ userName }}</a>
        </div>
      </div>
    </nav>

    <!-- 创建页面 -->
    <div v-if="activeTab === 'create'" class="create-section">
      <!-- 主体内容 -->
      <div class="main-content">
        <!-- 欢迎语 -->
        <div class="welcome-message">
          <h2 class="welcome-title">👋 你好！让我们一起创作故事吧</h2>
          <p class="welcome-text">选择故事类别和角色，然后告诉我你想要什么样的故事</p>
        </div>

        <!-- 对话框区域 -->
        <div class="chat-container">
          <div class="chat-box">
            <!-- 提示词显示 -->
            <div v-if="selectedCategory || selectedCharacters.length > 0" class="prompt-display">
              <span v-if="selectedCategory" class="prompt-tag category-tag" :title="categoryText">
                {{ categoryText }}
                <button class="tag-close-btn" @click="clearCategory" title="清除类别">×</button>
              </span>
              <span 
                v-if="selectedCharacters.length > 0" 
                class="prompt-tag character-tag"
                :title="characterFullText"
              >
                {{ characterText }}
                <button class="tag-close-btn" @click="clearCharacters" title="清除形象">×</button>
              </span>
            </div>

            <!-- 输入框 -->
            <textarea 
              v-model="userInput"
              class="chat-input"
              placeholder="描述你想要的故事，比如：小猪在森林里迷路了，遇到了好心的小熊..."
              rows="6"
            ></textarea>

            <!-- 底部工具栏 -->
            <div class="chat-toolbar">
              <div class="toolbar-left">
                <button class="tool-btn" @click="showCategoryModal = true">
                  <span class="btn-icon">📖</span>
                  <span>故事类别</span>
                </button>
                <button class="tool-btn" @click="showCharacterModal = true">
                  <span class="btn-icon">🎭</span>
                  <span>故事形象</span>
                </button>
              </div>
              <button class="submit-btn" :disabled="!canSubmit" @click="generateBook">
                <span>生成绘本</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 模板绘本展示 -->
        <div class="templates-section">
          <h3 class="section-title">✨ 模板绘本</h3>
          <div class="templates-grid">
            <div 
              v-for="template in templates" 
              :key="template.id"
              class="template-card"
              @click="viewTemplate(template)"
            >
              <div class="template-cover">
                <span class="cover-emoji">{{ template.emoji }}</span>
              </div>
              <div class="template-info">
                <h4 class="template-title">{{ template.title }}</h4>
                <p class="template-desc">{{ template.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的页面 -->
    <div v-else class="my-section">
      <div class="my-content">
        <h2 class="section-title">📚 我的绘本</h2>
        
        <!-- 加载状态 -->
        <div v-if="isLoadingBooks" class="loading-state">
          <div class="loading-spinner">⏳</div>
          <p>正在加载绘本列表...</p>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="myBooks.length === 0" class="empty-state">
          <div class="empty-icon">📖</div>
          <p class="empty-text">还没有创作任何绘本</p>
          <button class="create-first-btn" @click="activeTab = 'create'">
            开始创作
          </button>
        </div>
        
        <!-- 绘本列表 -->
        <div v-else class="my-books-grid">
          <div 
            v-for="book in myBooks" 
            :key="book.id"
            class="book-card"
            @click="openBook(book)"
          >
            <div class="book-cover" :style="book.thumbnailUrl ? { backgroundImage: `url(${book.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
              <span v-if="!book.thumbnailUrl" class="book-emoji">{{ book.emoji }}</span>
            </div>
            <div class="book-info">
              <h4 class="book-title">{{ book.title }}</h4>
              <p class="book-date">{{ book.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成进度小窗 -->
    <transition name="progress-fade">
      <div v-if="isGenerating" class="progress-window">
        <div class="progress-content">
          <div class="progress-header">
            <span class="progress-icon">✨</span>
            <span class="progress-title">正在生成绘本...</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </div>
    </transition>

    <!-- 生成完成小窗 -->
    <transition name="complete-fade">
      <div v-if="isComplete" class="complete-window">
        <div class="complete-content">
          <div class="complete-icon">🎉</div>
          <h3 class="complete-title">生成完毕！</h3>
          <p class="complete-text">你的专属绘本已经准备好了</p>
          <div class="complete-actions">
            <button class="action-btn secondary" @click="closeComplete">
              稍后查看
            </button>
            <button class="action-btn primary" @click="openGeneratedBook">
              立即打开
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 故事类别选择模态框 -->
    <transition name="modal-fade">
      <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
        <div class="modal-content">
          <h3 class="modal-title">选择故事类别</h3>
          <div class="category-options">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              :class="['category-option', { selected: selectedCategory === cat.value }]"
              @click="selectCategory(cat.value)"
            >
              <span class="option-icon">{{ cat.icon }}</span>
              <span class="option-label">{{ cat.label }}</span>
              <span class="option-desc">{{ cat.desc }}</span>
            </button>
          </div>
          <button class="modal-close-btn" @click="showCategoryModal = false">确定</button>
        </div>
      </div>
    </transition>

    <!-- 故事形象选择模态框 -->
    <transition name="modal-fade">
      <div v-if="showCharacterModal" class="modal-overlay" @click.self="showCharacterModal = false">
        <div class="modal-content">
          <h3 class="modal-title">选择故事形象（可多选）</h3>
          <div class="character-options">
            <button 
              v-for="char in characters" 
              :key="char.value"
              :class="['character-option', { selected: selectedCharacters.includes(char.value) }]"
              @click="toggleCharacter(char.value)"
            >
              <span class="char-emoji">{{ char.emoji }}</span>
              <span class="char-label">{{ char.label }}</span>
            </button>
          </div>
          <div class="custom-character">
            <input 
              v-model="customCharacter"
              type="text"
              class="custom-input"
              placeholder="或者输入自定义角色..."
            />
            <button class="add-custom-btn" @click="addCustomCharacter">添加</button>
          </div>
          <button class="modal-close-btn" @click="showCharacterModal = false">确定</button>
        </div>
      </div>
    </transition>

    <!-- 模板查看模态框 -->
    <transition name="modal-fade">
      <div v-if="viewingTemplate" class="modal-overlay" @click.self="viewingTemplate = null">
        <div class="template-modal">
          <button class="template-close" @click="viewingTemplate = null">×</button>
          <div class="template-preview">
            <div class="preview-cover">
              <span class="preview-emoji">{{ viewingTemplate.emoji }}</span>
            </div>
            <h3 class="preview-title">{{ viewingTemplate.title }}</h3>
            <p class="preview-desc">{{ viewingTemplate.description }}</p>
            <div class="preview-content">
              <p>{{ viewingTemplate.content }}</p>
            </div>
            <button class="use-template-btn" @click="useTemplate(viewingTemplate)">
              使用此模板
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { comicsAPI } from '../services/api.js'

export default {
  name: 'CustomForm',
  data() {
    return {
      activeTab: 'create',
      userName: '用户123',
      userInput: '',
      selectedCategory: '',
      selectedCharacters: [],
      customCharacter: '',
      showCategoryModal: false,
      showCharacterModal: false,
      isGenerating: false,
      isComplete: false,
      progress: 0,
      progressText: '正在准备...',
      viewingTemplate: null,
      generatedSessionId: null, // 保存生成的会话 ID
      isLoadingBooks: false, // 是否正在加载绘本列表
      myBooksFromAPI: [], // 从 API 获取的绘本列表
      categories: [
        { 
          value: '科普', 
          icon: '🔬', 
          label: '科普类', 
          desc: '探索自然、科学知识'
        },
        { 
          value: '心智', 
          icon: '💡', 
          label: '叙事类', 
          desc: '情感教育、品格培养'
        }
      ],
      characters: [
        { value: 'pig', emoji: '🐷', label: '小猪' },
        { value: 'bear', emoji: '🐻', label: '小熊' },
        { value: 'dog', emoji: '🐶', label: '小狗' },
        { value: 'cat', emoji: '🐱', label: '小猫' },
        { value: 'boy', emoji: '👦', label: '小男孩' },
        { value: 'girl', emoji: '👧', label: '小女孩' },
        { value: 'dino', emoji: '🦕', label: '小恐龙' },
        { value: 'rabbit', emoji: '🐰', label: '小兔子' }
      ],
      templates: [
        {
          id: 1,
          emoji: '🌳',
          title: '森林探险',
          description: '小动物们的森林冒险故事',
          content: '在茂密的森林里，小动物们发现了一个神秘的洞穴...'
        },
        {
          id: 2,
          emoji: '🌊',
          title: '海底世界',
          description: '探索神奇的海洋生物',
          content: '小鱼儿带着好奇心，游向了深海...'
        },
        {
          id: 3,
          emoji: '🚀',
          title: '太空旅行',
          description: '飞向星辰大海的冒险',
          content: '小宇航员驾驶着飞船，开始了太空探险...'
        },
        {
          id: 4,
          emoji: '🏰',
          title: '城堡奇遇',
          description: '魔法城堡里的奇妙故事',
          content: '在一座古老的城堡里，隐藏着许多秘密...'
        }
      ],
      myBooks: [] // 将使用 API 数据替代
    }
  },
  computed: {
    canSubmit() {
      return this.userInput.trim().length > 10
    },
    categoryText() {
      const cat = this.categories.find(c => c.value === this.selectedCategory)
      return cat ? `${cat.icon} ${cat.label}` : ''
    },
    characterText() {
      if (this.selectedCharacters.length === 0) return ''
      const chars = this.selectedCharacters.map(val => {
        // 检查是否是自定义角色
        if (val.startsWith('custom:')) {
          return val.replace('custom:', '')
        }
        const char = this.characters.find(c => c.value === val)
        return char ? char.label : val
      })
      if (chars.length > 3) {
        return `${chars.slice(0, 3).join('、')}...`
      }
      return chars.join('、')
    },
    // 完整的形象列表（用于悬停提示）
    characterFullText() {
      if (this.selectedCharacters.length === 0) return ''
      const chars = this.selectedCharacters.map(val => {
        if (val.startsWith('custom:')) {
          return val.replace('custom:', '')
        }
        const char = this.characters.find(c => c.value === val)
        return char ? char.label : val
      })
      return chars.join('、')
    },
    // 获取角色字符串（用于 API）
    characterString() {
      return this.selectedCharacters.map(val => {
        if (val.startsWith('custom:')) {
          return val.replace('custom:', '')
        }
        const char = this.characters.find(c => c.value === val)
        return char ? char.label : val
      }).join('、')
    }
  },
  watch: {
    // 监听标签切换，切换到"我的"时加载数据
    activeTab(newTab) {
      if (newTab === 'my') {
        this.loadMyBooks()
      }
    }
  },
  mounted() {
    // 检查是否需要切换到"我的"标签
    const tab = this.$route.query.tab
    if (tab === 'my') {
      this.activeTab = 'my'
      this.loadMyBooks() // 加载绘本列表
    }
    
    // 获取用户信息
    this.refreshUserInfo()
  },
  activated() {
    // 当组件被激活时（从其他页面返回），刷新用户信息
    this.refreshUserInfo()
  },
  methods: {
    // 清除类别选择
    clearCategory() {
      this.selectedCategory = ''
    },
    // 清除形象选择
    clearCharacters() {
      this.selectedCharacters = []
    },
    // 刷新用户信息
    refreshUserInfo() {
      const userPhone = localStorage.getItem('userPhone')
      const userNickname = localStorage.getItem('userNickname')

      if (userNickname) {
        this.userName = userNickname
      } else if (userPhone) {
        this.userName = userPhone.slice(-4)
      } else {
        this.userName = '用户123' // 默认值
      }
    },
    selectCategory(value) {
      this.selectedCategory = value
    },
    toggleCharacter(value) {
      const index = this.selectedCharacters.indexOf(value)
      if (index > -1) {
        this.selectedCharacters.splice(index, 1)
      } else {
        this.selectedCharacters.push(value)
      }
    },
    addCustomCharacter() {
      if (this.customCharacter.trim()) {
        // 添加自定义角色，格式为 "custom:角色名"
        this.selectedCharacters.push('custom:' + this.customCharacter.trim())
        this.customCharacter = ''
      }
    },
    async generateBook() {
      if (!this.canSubmit) return
      
      // 验证是否选择了故事类别
      if (!this.selectedCategory) {
        window.$toast('请选择故事类别', 'warning')
        return
      }
      
      // 验证是否选择了故事形象
      if (this.selectedCharacters.length === 0) {
        window.$toast('请选择故事形象', 'warning')
        return
      }
      
      // 检查是否登录
      const token = localStorage.getItem('access_token')
      if (!token) {
        window.$toast('请先登录', 'error')
        setTimeout(() => {
          this.$router.push('/auth')
        }, 1500)
        return
      }
      
      this.isGenerating = true
      this.progress = 0
      this.progressText = '正在准备...'
      
      try {
        // 调用后端 API 创建会话
        this.progress = 20
        this.progressText = '正在创建绘本会话...'
        
        const response = await comicsAPI.createSession({
          title: this.userInput.substring(0, 50), // 使用故事内容的前50个字符作为标题
          description: this.userInput,
          genggai: this.userInput, // 故事梗概
          xingxiang: this.characterString, // 故事形象
          leibie: this.selectedCategory // 故事类别
        })
        
        // 保存会话 ID
        this.generatedSessionId = response.id
        localStorage.setItem('currentSessionId', response.id)
        
        console.log('绘本会话创建成功:', response)
        
        // 模拟后续步骤（实际应该调用其他 API）
        const steps = [
          { progress: 40, text: '正在生成故事情节...' },
          { progress: 60, text: '正在创作插画...' },
          { progress: 80, text: '正在排版绘本...' },
          { progress: 100, text: '即将完成...' }
        ]
        
        for (const step of steps) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          this.progress = step.progress
          this.progressText = step.text
        }
        
        // 完成
        setTimeout(() => {
          this.isGenerating = false
          this.isComplete = true
          window.$toast('绘本生成成功！', 'success')
        }, 500)
        
      } catch (error) {
        console.error('生成绘本失败:', error)
        this.isGenerating = false
        
        // 根据错误状态码显示不同的提示
        if (error.status === 401) {
          window.$toast('登录已过期，请重新登录', 'error')
          setTimeout(() => {
            this.$router.push('/auth')
          }, 1500)
        } else {
          window.$toast(error.message || '生成失败，请重试', 'error')
        }
      }
    },
    closeComplete() {
      this.isComplete = false
    },
    openGeneratedBook() {
      this.isComplete = false
      this.$router.push('/book')
    },
    viewTemplate(template) {
      this.viewingTemplate = template
    },
    useTemplate(template) {
      this.userInput = template.content
      this.viewingTemplate = null
      window.$toast('模板已应用', 'success')
    },
    openBook(book) {
      // 保存当前会话 ID
      localStorage.setItem('currentSessionId', book.id)
      localStorage.setItem('fromMyBooks', 'true')
      this.$router.push('/book')
    },
    
    // 加载我的绘本列表
    async loadMyBooks() {
      // 检查是否登录
      const token = localStorage.getItem('access_token')
      if (!token) {
        window.$toast('请先登录', 'error')
        setTimeout(() => {
          this.$router.push('/auth')
        }, 1500)
        return
      }
      
      this.isLoadingBooks = true
      
      try {
        const response = await comicsAPI.getSessions()
        console.log('获取绘本列表成功:', response)
        
        // 处理返回的数据
        if (response.sessions && response.sessions.length > 0) {
          // 为每个会话获取详细信息以获取第一张图片作为缩略图
          this.myBooks = await Promise.all(
            response.sessions.map(async (session) => {
              let thumbnailUrl = null
              
              try {
                // 获取会话详细信息（包括所有页面）
                const detailResponse = await comicsAPI.getSessionDetail(session.id)
                
                // 从页面中获取第一张图片作为缩略图
                if (detailResponse.pages && detailResponse.pages.length > 0) {
                  // 使用 image_filename 字段作为图片 URL
                  thumbnailUrl = detailResponse.pages[0].image_filename
                }
              } catch (error) {
                console.warn(`获取会话 ${session.id} 的详细信息失败:`, error)
              }
              
              return {
                id: session.id,
                title: session.title || '未命名绘本',
                date: this.formatDate(session.created_at),
                emoji: this.getEmojiByCategory(session.leibie),
                thumbnailUrl: thumbnailUrl,
                description: session.description,
                genggai: session.genggai,
                xingxiang: session.xingxiang,
                leibie: session.leibie
              }
            })
          )
        } else {
          this.myBooks = []
          window.$toast('还没有创作任何绘本', 'info')
        }
      } catch (error) {
        console.error('获取绘本列表失败:', error)
        
        if (error.status === 401) {
          window.$toast('登录已过期，请重新登录', 'error')
          setTimeout(() => {
            this.$router.push('/auth')
          }, 1500)
        } else {
          window.$toast(error.message || '获取绘本列表失败', 'error')
        }
      } finally {
        this.isLoadingBooks = false
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 根据类别获取 emoji
    getEmojiByCategory(leibie) {
      const emojiMap = {
        '科普': '🔬',
        '心智': '💡'
      }
      return emojiMap[leibie] || '📚'
    }
  }
}
</script>

<style scoped>
.custom-form-page {
  min-height: 100vh;
  padding-top: 80px;
  position: relative;
  z-index: 1;
}

/* 导航栏 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 4px solid #000;
  padding: 15px 40px;
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.night-mode .top-nav {
  background: rgba(20, 20, 30, 0.9);
  border-bottom-color: #666;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-left,
.nav-right {
  flex: 1;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
}

.user-welcome {
  color: #666;
  font-size: 1rem;
}

.night-mode .user-welcome {
  color: #aaa;
}

.user-link {
  color: #FF6B9D;
  font-weight: bold;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.user-link:hover {
  color: #4ECDC4;
  text-decoration: underline;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #000;
}

.night-mode .nav-tab {
  background: rgba(255, 255, 255, 0.1);
  border-color: #666;
  color: #ddd;
}

.nav-tab.active {
  background: #FFE66D;
  box-shadow: 3px 3px 0 #000;
  color: #000;
}

.night-mode .nav-tab.active {
  background: #FFE66D;
  box-shadow: 3px 3px 0 #666;
  color: #000;
}

.nav-tab:hover {
  transform: translateY(-2px);
}

.night-mode .nav-tab:hover {
  background: rgba(255, 255, 255, 0.2);
}

.night-mode .nav-tab.active:hover {
  background: #FFE66D;
}

.tab-icon {
  font-size: 1.3rem;
}

/* 创建页面 */
.create-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

/* 欢迎语 */
.welcome-message {
  text-align: center;
  padding: 40px;
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  box-shadow: 8px 8px 0 #000;
  transition: background 0.3s ease, color 0.3s ease;
}

.night-mode .welcome-message {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 15px;
  color: #000;
}

.night-mode .welcome-title {
  color: #ddd;
}

.welcome-text {
  font-size: 1.2rem;
  color: #666;
  font-weight: 600;
}

.night-mode .welcome-text {
  color: #aaa;
}

/* 对话框 */
.chat-container {
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 8px 8px 0 #000;
  transition: background 0.3s ease;
}

.night-mode .chat-container {
  background: rgba(255, 255, 255, 0.1);
}

.chat-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prompt-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.prompt-tag {
  padding: 8px 16px;
  border: 3px solid #000;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.95rem;
  position: relative;
  padding-right: 40px;
  cursor: help;
  transition: all 0.3s ease;
}

.prompt-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.category-tag {
  background: #FF6B9D;
  color: #fff;
}

.character-tag {
  background: #4ECDC4;
  color: #fff;
}

.tag-close-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.tag-close-btn:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.tag-close-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.chat-input {
  width: 100%;
  padding: 20px;
  border: 3px solid #000;
  border-radius: 20px;
  font-size: 1.1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: #fff;
  color: #000;
}

.night-mode .chat-input {
  background: rgba(255, 255, 255, 0.15);
  color: #ddd;
  border-color: #666;
}

.chat-input:focus {
  outline: none;
  border-color: #FFE66D;
  box-shadow: 0 0 0 3px rgba(255, 230, 109, 0.3);
}

.night-mode .chat-input::placeholder {
  color: #999;
}

.chat-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 0 #000;
}

.tool-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #000;
}

.btn-icon {
  font-size: 1.2rem;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 0 #000;
}

.submit-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-arrow {
  font-size: 1.3rem;
}

/* 模板展示 */
.templates-section {
  padding: 40px;
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  box-shadow: 8px 8px 0 #000;
  transition: background 0.3s ease, color 0.3s ease;
}

.night-mode .templates-section {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.section-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 30px;
  color: #000;
}

.night-mode .section-title {
  color: #fff;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.template-card {
  border: 3px solid #000;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 5px 5px 0 #000;
}

.template-cover {
  height: 150px;
  background: linear-gradient(135deg, #FFE66D, #FF6B9D);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid #000;
}

.cover-emoji {
  font-size: 4rem;
}

.template-info {
  padding: 20px;
}

.template-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #000;
}

.night-mode .template-title {
  color: #000000ff;
}

.template-desc {
  color: #666;
  font-size: 0.95rem;
}

.night-mode .template-desc {
  color: #aaa;
}

/* 我的页面 */
.my-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.my-content {
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 8px 8px 0 #000;
  transition: background 0.3s ease, color 0.3s ease;
}

.night-mode .my-content {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.my-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.book-card {
  border: 3px solid #000;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 5px 5px 0 #000;
}

.book-cover {
  height: 200px;
  background: linear-gradient(135deg, #4ECDC4, #95E1D3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid #000;
}

.book-emoji {
  font-size: 5rem;
}

.book-info {
  padding: 15px;
}

.book-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #000;
}

.night-mode .book-title {
  color: #000;
}

.book-date {
  color: #999;
  font-size: 0.9rem;
}

.night-mode .book-date {
  color: #aaa;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

.loading-state p {
  font-size: 1.2rem;
  color: #666;
  font-weight: 600;
}

.night-mode .loading-state p {
  color: #aaa;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.3rem;
  color: #999;
  margin-bottom: 30px;
}

.night-mode .empty-text {
  color: #aaa;
}

.create-first-btn {
  padding: 15px 40px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 0 #000;
}

.create-first-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

/* 进度窗口 */
.progress-window {
  position: fixed;
  top: 100px;
  right: 40px;
  width: 350px;
  background: #fff;
  border: 4px solid #000;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 8px 8px 0 #000;
  z-index: 200;
  animation: slide-in-right 0.5s ease;
}

.night-mode .progress-window {
  background: rgba(255, 255, 255, 0.95);
}

@keyframes slide-in-right {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.progress-icon {
  font-size: 2rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #000;
}

.night-mode .progress-title {
  color: #ddd;
}

.progress-bar-container {
  height: 20px;
  background: #f0f0f0;
  border: 3px solid #000;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.night-mode .progress-bar-container {
  background: rgba(255, 255, 255, 0.2);
  border-color: #666;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FFE66D, #FF6B9D, #4ECDC4);
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  color: #666;
  font-weight: 600;
}

.night-mode .progress-text {
  color: #aaa;
}

/* 完成窗口 */
.complete-window {
  position: fixed;
  top: 100px;
  right: 40px;
  width: 350px;
  background: #fff;
  border: 4px solid #000;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 8px 8px 0 #000;
  z-index: 200;
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.night-mode .complete-window {
  background: rgba(255, 255, 255, 0.95);
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateX(400px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
}

.complete-content {
  text-align: center;
}

.complete-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: celebrate 0.6s ease;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  75% { transform: scale(1.2) rotate(10deg); }
}

.complete-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000;
}

.night-mode .complete-title {
  color: #ddd;
}

.complete-text {
  color: #666;
  margin-bottom: 25px;
}

.night-mode .complete-text {
  color: #aaa;
}

.complete-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: 3px solid #000;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.secondary {
  background: #fff;
}

.action-btn.primary {
  background: #FFE66D;
  box-shadow: 3px 3px 0 #000;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 12px 12px 0 #000;
}

.night-mode .modal-content {
  background: rgba(255, 255, 255, 0.95);
}

.modal-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  color: #000;
}

.night-mode .modal-title {
  color: #000;
}

.category-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border: 3px solid #000;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.category-option.selected {
  background: #FFE66D;
  box-shadow: 4px 4px 0 #000;
}

.category-option:hover {
  transform: translateX(5px);
}

.option-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.option-label {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #000;
}

.night-mode .option-label {
  color: #000;
}

.option-desc {
  color: #666;
  font-size: 0.95rem;
}

.night-mode .option-desc {
  color: #666;
}

.character-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.character-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border: 3px solid #000;
  border-radius: 15px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-option.selected {
  background: #4ECDC4;
  box-shadow: 3px 3px 0 #000;
}

.character-option:hover {
  transform: scale(1.05);
}

.char-emoji {
  font-size: 2.5rem;
}

.char-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #000;
}

.night-mode .char-label {
  color: #000;
}

.custom-character {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.custom-input {
  flex: 1;
  padding: 12px;
  border: 3px solid #000;
  border-radius: 15px;
  font-size: 1rem;
}

.add-custom-btn {
  padding: 12px 20px;
  border: 3px solid #000;
  border-radius: 15px;
  background: #FF6B9D;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}

.modal-close-btn {
  width: 100%;
  padding: 15px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
}

.modal-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 #000;
}

/* 模板预览模态框 */
.template-modal {
  background: #fff;
  border: 4px solid #000;
  border-radius: 30px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  position: relative;
  box-shadow: 12px 12px 0 #000;
}

.night-mode .template-modal {
  background: rgba(255, 255, 255, 0.95);
}

.template-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: 3px solid #000;
  border-radius: 50%;
  background: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-close:hover {
  background: #FF6B9D;
  color: #fff;
  transform: rotate(90deg);
}

.template-preview {
  text-align: center;
}

.preview-cover {
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #FFE66D, #FF6B9D);
  border: 4px solid #000;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-emoji {
  font-size: 6rem;
}

.preview-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #000;
}

.night-mode .preview-title {
  color: #000;
}

.preview-desc {
  color: #000;
  font-size: 1.1rem;
  margin-bottom: 25px;
}

.night-mode .preview-desc {
  color: #000;
}

.preview-content {
  text-align: left;
  padding: 25px;
  background: #f8f8f8;
  border: 3px solid #000;
  border-radius: 20px;
  margin-bottom: 25px;
  line-height: 1.8;
  color: #000;
}

.night-mode .preview-content {
  background: rgba(255, 255, 255, 0.1);
  border-color: #666;
  color: #000;
}

.use-template-btn {
  width: 100%;
  padding: 15px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #4ECDC4;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
}

.use-template-btn:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 #000;
}

/* 过渡动画 */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-enter-from .template-modal {
  transform: scale(0.8);
}

.progress-fade-enter-active, .progress-fade-leave-active,
.complete-fade-enter-active, .complete-fade-leave-active {
  transition: all 0.3s ease;
}

.progress-fade-enter-from, .progress-fade-leave-to,
.complete-fade-enter-from, .complete-fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}

/* 响应式 */
@media (max-width: 768px) {
  .top-nav {
    padding: 15px 20px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .templates-grid,
  .my-books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .progress-window,
  .complete-window {
    right: 20px;
    left: 20px;
    width: auto;
  }
  
  .character-options {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
