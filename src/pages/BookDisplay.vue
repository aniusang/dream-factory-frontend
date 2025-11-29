<template>
  <div class="book-display-page">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">⏳</div>
      <p class="loading-text">正在加载绘本...</p>
    </div>
    
    <!-- 加载错误 -->
    <div v-else-if="loadError" class="error-container">
      <div class="error-icon">😢</div>
      <p class="error-text">{{ loadError }}</p>
      <button class="btn btn-primary" @click="$router.push('/custom')">返回</button>
    </div>
    
    <!-- 绘本内容 -->
    <div v-else class="book-container">
      <!-- 控制面板 -->
      <div class="control-panel card">
        <div class="control-group">
          <button class="btn btn-secondary btn-sm" @click="goBack">
            ← 返回
          </button>
          <!-- <button class="btn btn-primary btn-sm" @click="showEditModal = true">
            ✏️ 编辑绘本
          </button> -->
        </div>

        <div class="control-group">
          <label class="control-label">翻页模式：</label>
          <div class="toggle-group">
            <button 
              :class="['toggle-btn', { active: !autoPlay }]" 
              @click="autoPlay = false"
            >
              手动
            </button>
            <button 
              :class="['toggle-btn', { active: autoPlay }]" 
              @click="enableAutoPlay"
            >
              自动
            </button>
          </div>
        </div>

        <div v-if="autoPlay && !autoPlayAudio" class="control-group">
          <label class="control-label">翻页速度：</label>
          <div class="speed-group">
            <button 
              :class="['speed-btn', { active: speed === 'slow' }]" 
              @click="setSpeed('slow')"
            >
              慢
            </button>
            <button 
              :class="['speed-btn', { active: speed === 'medium' }]" 
              @click="setSpeed('medium')"
            >
              一般
            </button>
            <button 
              :class="['speed-btn', { active: speed === 'fast' }]" 
              @click="setSpeed('fast')"
            >
              快
            </button>
          </div>
        </div>
        
        <div v-if="autoPlay && autoPlayAudio" class="control-group">
          <label class="control-label" style="color: #e74c3c;">
            ⚠️ 旁白模式下自动翻页
          </label>
        </div>

        <div class="control-group">
          <label class="control-label">旁白语音：</label>
          <div class="toggle-group">
            <button 
              :class="['toggle-btn', { active: autoPlayAudio }]" 
              @click="autoPlayAudio = true"
            >
              开启
            </button>
            <button 
              :class="['toggle-btn', { active: !autoPlayAudio }]" 
              @click="toggleAudioOff"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 绘本展示区 -->
      <div class="book-wrapper">
        <div ref="bookContainer" class="flipbook-container"></div>
        <!-- 再看一遍按钮 - 只在反馈窗口关闭后显示 -->
        <button v-if="feedbackClosed" class="replay-btn" title="再看一遍" @click="restart">
          🔄 再看一遍
        </button>
      </div>

      <!-- 翻页控制 -->
      <div class="page-controls">
        <button 
          class="btn btn-primary btn-nav" 
          :disabled="currentPageNum === 0" 
          @click="prevPage"
        >
          ← 上一页
        </button>
        
        <div class="page-indicator-group">
          <div class="page-indicator">
            第 {{ displayPageRange }} / 共 {{ totalPages }} 页
          </div>
          <div v-if="isPlayingAudio" class="audio-indicator">
            🔊 播放中...
          </div>
        </div>
        
        <button 
          class="btn btn-primary btn-nav" 
          :disabled="isLastPage" 
          @click="nextPage"
        >
          下一页 →
        </button>
      </div>

      <!-- 结束页面 -->
      <div v-if="isFinished" class="end-screen">
        <div class="card end-card">
          <button class="close-end-screen" title="关闭" @click="closeEndScreen">×</button>
          <h2>🎉 故事结束啦！</h2>
          <p>希望{{ childName }}喜欢这个故事</p>
          <div class="end-actions">
            <button class="btn btn-primary" @click="restart">
              🔄 重新开始
            </button>
            <button class="btn btn-secondary" @click="showFeedbackModal = true">
              💬 用户反馈
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <!-- <div class="modal" v-if="showEditModal" @click.self="showEditModal = false">
      <div class="modal-content card">
        <h3>✏️ 编辑绘本</h3>
        <div class="form-group">
          <label>孩子名字</label>
          <input type="text" v-model="editData.childName" class="input-field" />
        </div>
        <div class="form-group">
          <label>故事场景</label>
          <input type="text" v-model="editData.scene" class="input-field" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div> -->

    <!-- 反馈模态框 -->
    <div v-if="showFeedbackModal" class="modal" @click.self="showFeedbackModal = false">
      <div class="modal-content card">
        <h3>💬 用户反馈</h3>
        <div class="feedback-options">
          <div class="feedback-item">
            <label>
              <input v-model="feedback.likeStory" type="checkbox" />
              <span>❤️ 喜欢这个故事</span>
            </label>
          </div>
          <div class="feedback-item">
            <label>
              <input v-model="feedback.likeIllustration" type="checkbox" />
              <span>🎨 喜欢插画风格</span>
            </label>
          </div>
          <div class="feedback-item">
            <label>
              <input v-model="feedback.likeCharacters" type="checkbox" />
              <span>🦊 喜欢角色设定</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>其他建议</label>
          <textarea 
            v-model="feedback.comments" 
            class="input-field" 
            rows="4"
            placeholder="请告诉我们您的想法..."
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showFeedbackModal = false">取消</button>
          <button class="btn btn-primary" @click="submitFeedback">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PageFlip } from 'page-flip'
import { comicsAPI, API_BASE_URL } from '../services/api.js'

export default {
  name: 'BookDisplay',
  data() {
    return {
      pageFlip: null,
      currentPageNum: 0,
      autoPlay: false,
      speed: 'medium',
      autoPlayTimer: null,
      showEditModal: false,
      showFeedbackModal: false,
      isFinished: false,
      feedbackClosed: false, // 反馈窗口是否已关闭
      isLoading: true,
      loadError: null,
      sessionData: null,
      childName: '小朋友',
      editData: {
        childName: '小朋友',
        scene: '森林'
      },
      feedback: {
        likeStory: false,
        likeIllustration: false,
        likeCharacters: false,
        comments: ''
      },
      stories: [],
      audioPlayer: null, // 音频播放器
      isPlayingAudio: false, // 是否正在播放语音
      autoPlayAudio: true, // 是否自动播放语音
      pendingAudioTimeout: null, // 待播放的音频定时器
      bothPagesAudioFinished: false // 双页音频是否都播放完成
    }
  },
  computed: {
    totalPages() {
      return this.stories.length
    },
    speedDuration() {
      const speeds = { slow: 5000, medium: 3000, fast: 2000 }
      return speeds[this.speed]
    },
    displayPageRange() {
      // PageFlip 显示双页，左页是偶数索引，右页是奇数索引
      const leftPage = this.currentPageNum + 1
      const rightPage = Math.min(this.currentPageNum + 2, this.totalPages)
      
      if (leftPage === rightPage) {
        return `${leftPage} 页`
      }
      return `${leftPage}-${rightPage} 页`
    },
    isLastPage() {
      // 当显示的右页等于总页数时，说明到达最后
      return this.currentPageNum + 2 >= this.totalPages
    }
  },
  watch: {
    autoPlay(val) {
      if (!val) {
        this.stopAutoPlay()
      }
    }
  },
  async mounted() {
    // 获取会话 ID
    const sessionId = localStorage.getItem('currentSessionId')
    
    if (!sessionId) {
      window.$toast('未找到绘本信息', 'error')
      this.$router.push('/custom')
      return
    }
    
    // 加载绘本数据
    await this.loadBookData(sessionId)
    
    if (this.stories.length > 0) {
      this.$nextTick(() => {
        this.initPageFlip()
        // 初始化完成后播放第一页的语音
        setTimeout(() => {
          this.playCurrentPageAudio()
        }, 500)
      })
    }
  },
  beforeUnmount() {
    this.stopAutoPlay()
    this.stopAudio()
    if (this.pageFlip) {
      this.pageFlip.destroy()
    }
  },
  methods: {
    async loadBookData(sessionId) {
      this.isLoading = true
      this.loadError = null
      
      try {
        // 获取会话详情
        const response = await comicsAPI.getSessionDetail(sessionId)
        console.log('获取绘本详情成功:', response)
        
        this.sessionData = response
        
        // 转换页面数据为 stories 格式
        if (response.pages && response.pages.length > 0) {
          // 按 order_index 排序
          const sortedPages = [...response.pages].sort((a, b) => a.order_index - b.order_index)
          
          this.stories = sortedPages.map(page => ({
            id: page.id,
            image: page.image_filename, // 图片 URL
            text: page.text_content, // 文本内容
            speechUrl: page.speech_url, // 语音 URL
            orderIndex: page.order_index
          }))
          
          // 从故事内容中提取孩子名字（如果有）
          if (response.xingxiang) {
            this.childName = response.xingxiang
            this.editData.childName = response.xingxiang
          }
        } else {
          this.loadError = '该绘本还没有生成页面'
          window.$toast('该绘本还没有生成页面', 'warning')
        }
      } catch (error) {
        console.error('加载绘本数据失败:', error)
        this.loadError = error.message || '加载失败'
        
        if (error.status === 401) {
          window.$toast('登录已过期，请重新登录', 'error')
          setTimeout(() => {
            this.$router.push('/auth')
          }, 1500)
        } else if (error.status === 404) {
          window.$toast('绘本不存在', 'error')
          setTimeout(() => {
            this.$router.push('/custom')
          }, 1500)
        } else {
          window.$toast(error.message || '加载绘本失败', 'error')
        }
      } finally {
        this.isLoading = false
      }
    },
    
    initPageFlip() {
      const container = this.$refs.bookContainer
      
      // 创建页面元素
      this.stories.forEach((story, index) => {
        const page = document.createElement('div')
        page.className = 'page'
        page.setAttribute('data-density', 'hard')
        
        const isOdd = index % 2 === 0
        
        // 判断是否是图片 URL（以 http 开头）还是 emoji
        const isImageUrl = story.image && story.image.startsWith('http')
        
        page.innerHTML = `
          <div class="page-content">
            <div class="page-layout ${isOdd ? 'text-top-image-bottom' : 'image-top-text-bottom'}">
              ${isOdd ? `
                <div class="text-section">
                  <p class="story-text">${story.text}</p>
                </div>
                <div class="illustration-section">
                  ${isImageUrl 
                    ? `<img src="${story.image}" alt="插图" class="illustration-image" />`
                    : `<div class="illustration-medium">${story.image}</div>`
                  }
                </div>
              ` : `
                <div class="illustration-section">
                  ${isImageUrl 
                    ? `<img src="${story.image}" alt="插图" class="illustration-image" />`
                    : `<div class="illustration-medium">${story.image}</div>`
                  }
                </div>
                <div class="text-section">
                  <p class="story-text">${story.text}</p>
                </div>
              `}
            </div>
            <div class="page-number">${index + 1}</div>
          </div>
        `
        
        container.appendChild(page)
      })
      
      // 初始化 PageFlip
      this.pageFlip = new PageFlip(container, {
        width: 550,
        height: 700,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 400,
        maxHeight: 1350,
        maxShadowOpacity: 0.5,
        showCover: false,
        mobileScrollSupport: false,
        swipeDistance: 30,
        clickEventForward: true,
        usePortrait: true,
        startPage: 0,
        drawShadow: true,
        flippingTime: 800,
        useMouseEvents: true,
        autoSize: true,
        showPageCorners: true,
        disableFlipByClick: false
      })
      
      this.pageFlip.loadFromHTML(container.querySelectorAll('.page'))
      
      // 监听翻页事件
      this.pageFlip.on('flip', (e) => {
        this.currentPageNum = e.data
        
        // 如果是自动播放+旁白模式，且是往前翻页（手动操作），需要重置状态
        if (this.autoPlay && this.autoPlayAudio) {
          // 停止所有音频和定时器
          this.stopAudio()
          // 重置结束状态
          this.isFinished = false
        }
        
        // 翻页时播放对应页面的语音
        this.playCurrentPageAudio()
      })
      
      // 监听翻页结束事件
      this.pageFlip.on('changeState', (e) => {
        // 检查是否到达最后一页
        // 当右页等于或超过总页数时，说明已经显示了最后一页
        if (e.data === 'read' && this.isLastPage) {
          this.showEndScreen()
        }
      })
    },
    
    // 显示结束画面
    showEndScreen() {
      // 如果是自动播放+旁白模式，由音频播放完成回调处理，这里不处理
      if (this.autoPlay && this.autoPlayAudio) {
        console.log('自动播放+旁白模式：等待音频播放完成回调处理结束画面')
        return
      }
      
      // 手动模式或无旁白模式
      // 如果开启了旁白，等待音频播放完成
      if (this.autoPlayAudio && this.isPlayingAudio) {
        console.log('等待最后一页音频播放完成...')
        // 监听音频播放完成
        const checkAudioFinished = setInterval(() => {
          if (!this.isPlayingAudio) {
            clearInterval(checkAudioFinished)
            setTimeout(() => {
              this.isFinished = true
              this.stopAutoPlay()
            }, 1000) // 音频播放完成后延迟 1 秒
          }
        }, 100)
      } else {
        // 没有旁白，延迟 3 秒显示
        setTimeout(() => {
          this.isFinished = true
          this.stopAutoPlay()
        }, 3000)
      }
    },
    nextPage() {
      if (this.pageFlip) {
        this.pageFlip.flipNext()
      }
    },
    prevPage() {
      if (this.pageFlip) {
        this.pageFlip.flipPrev()
      }
    },
    enableAutoPlay() {
      this.autoPlay = true
      this.startAutoPlay()
    },
    startAutoPlay() {
      this.stopAutoPlay()
      
      // 如果开启了旁白，不使用定时器自动翻页，而是等音频播放完成后翻页
      if (this.autoPlayAudio) {
        console.log('旁白模式：等待音频播放完成后自动翻页')
        return
      }
      
      // 没有旁白时，使用定时器自动翻页
      this.autoPlayTimer = setInterval(() => {
        if (this.isLastPage) {
          // 已经在最后一页，不再翻页
          // 结束提示由 changeState 事件处理
          this.stopAutoPlay()
        } else {
          this.nextPage()
        }
      }, this.speedDuration)
    },
    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer)
        this.autoPlayTimer = null
      }
    },
    setSpeed(speed) {
      this.speed = speed
      if (this.autoPlay) {
        this.startAutoPlay()
      }
    },
    restart() {
      this.currentPageNum = 0
      this.isFinished = false
      this.feedbackClosed = false
      if (this.pageFlip) {
        this.pageFlip.turnToPage(0)
      }
      if (this.autoPlay) {
        this.startAutoPlay()
      }
      // 重新开始时播放第一页语音
      setTimeout(() => {
        this.playCurrentPageAudio()
      }, 500)
    },
    
    closeEndScreen() {
      this.isFinished = false
      this.feedbackClosed = true
    },
    saveEdit() {
      this.childName = this.editData.childName
      this.stories = this.stories.map(story => ({
        ...story,
        text: story.text.replace(/小明/g, this.childName)
      }))
      this.showEditModal = false
      
      // 重新初始化
      if (this.pageFlip) {
        this.pageFlip.destroy()
      }
      this.$refs.bookContainer.innerHTML = ''
      this.$nextTick(() => {
        this.initPageFlip()
      })
      
      window.$toast('编辑保存成功！', 'success')
    },
    submitFeedback() {
      console.log('用户反馈：', this.feedback)
      window.$toast('感谢您的反馈！', 'success')
      this.showFeedbackModal = false
    },
    goBack() {
      const fromMyBooks = localStorage.getItem('fromMyBooks') === 'true'
      if (fromMyBooks) {
        localStorage.removeItem('fromMyBooks')
        this.$router.push({ path: '/custom', query: { tab: 'my' } })
      } else {
        this.$router.push('/custom')
      }
    },
    
    // 播放当前页面的语音（双页模式）
    playCurrentPageAudio() {
      if (!this.autoPlayAudio) return
      
      // 停止当前播放的语音和待播放的定时器
      this.stopAudio()
      this.bothPagesAudioFinished = false
      
      // PageFlip 是双页显示，需要播放左页（奇数页）和右页（偶数页）
      const leftPageIndex = this.currentPageNum
      const rightPageIndex = this.currentPageNum + 1
      
      // 保存当前页码，用于检查是否发生了翻页
      const currentPlayingPage = this.currentPageNum
      
      console.log(`准备播放第 ${leftPageIndex + 1} 页和第 ${rightPageIndex + 1} 页的语音`)
      
      // 先播放左页（奇数页）
      this.playPageAudio(leftPageIndex, () => {
        // 检查是否还在同一页（用户可能已经翻页了）
        if (this.currentPageNum !== currentPlayingPage) {
          console.log('页面已改变，取消后续音频播放')
          return
        }
        
        // 左页播放完成后，延迟 1.5 秒播放右页
        // 使用 pendingAudioTimeout 保存定时器，以便可以取消
        this.pendingAudioTimeout = setTimeout(() => {
          // 再次检查页面是否改变
          if (this.currentPageNum !== currentPlayingPage) {
            console.log('页面已改变，取消右页音频播放')
            this.pendingAudioTimeout = null
            return
          }
          
          // 再次检查是否开启了旁白
          if (this.autoPlayAudio && rightPageIndex < this.stories.length) {
            this.playPageAudio(rightPageIndex, () => {
              // 再次检查页面是否改变
              if (this.currentPageNum !== currentPlayingPage) {
                console.log('页面已改变，取消自动翻页')
                return
              }
              
              // 右页也播放完成
              this.bothPagesAudioFinished = true
              console.log('双页音频播放完成')
              
              // 如果是自动播放模式，延迟后自动翻页或显示结束画面
              if (this.autoPlay && this.autoPlayAudio) {
                setTimeout(() => {
                  // 最后一次检查页面是否改变
                  if (this.currentPageNum !== currentPlayingPage) {
                    console.log('页面已改变，取消自动翻页操作')
                    return
                  }
                  
                  if (!this.isLastPage) {
                    this.nextPage()
                  } else {
                    // 到达最后一页，显示结束画面
                    console.log('最后一页音频播放完成，显示结束画面')
                    this.isFinished = true
                    this.stopAutoPlay()
                  }
                }, 1000) // 播放完成后延迟 1 秒
              }
            })
          } else {
            // 只有左页，标记为完成
            this.bothPagesAudioFinished = true
            
            // 如果是自动播放模式且是最后一页，显示结束画面
            if (this.autoPlay && this.autoPlayAudio && this.isLastPage) {
              setTimeout(() => {
                if (this.currentPageNum === currentPlayingPage) {
                  console.log('最后一页（单页）音频播放完成，显示结束画面')
                  this.isFinished = true
                  this.stopAutoPlay()
                }
              }, 1000)
            }
          }
          this.pendingAudioTimeout = null
        }, 1500) // 延迟 1.5 秒
      })
    },
    
    // 播放指定页面的语音
    playPageAudio(pageIndex, onEnded = null) {
      const story = this.stories[pageIndex]
      if (!story || !story.speechUrl) {
        console.log(`第 ${pageIndex + 1} 页没有语音`)
        if (onEnded) onEnded()
        return
      }
      
      // 构建完整的语音 URL
      const audioUrl = story.speechUrl.startsWith('http') 
        ? story.speechUrl 
        : `${API_BASE_URL}${story.speechUrl}`
      
      console.log(`播放第 ${pageIndex + 1} 页语音:`, audioUrl)
      
      // 添加 token 到请求头（如果需要）
      const token = localStorage.getItem('access_token')
      if (token && !story.speechUrl.startsWith('http')) {
        // 注意：Audio 标签不支持自定义请求头，需要使用 fetch 预加载
        this.playAudioWithAuth(audioUrl, token, onEnded)
        return
      }
      
      // 创建音频播放器
      this.audioPlayer = new Audio(audioUrl)
      
      // 播放音频
      this.audioPlayer.play().then(() => {
        this.isPlayingAudio = true
        console.log(`第 ${pageIndex + 1} 页语音播放开始`)
      }).catch(error => {
        console.error(`第 ${pageIndex + 1} 页语音播放失败:`, error)
        this.isPlayingAudio = false
        if (onEnded) onEnded()
      })
      
      // 监听播放结束
      this.audioPlayer.addEventListener('ended', () => {
        this.isPlayingAudio = false
        console.log(`第 ${pageIndex + 1} 页语音播放结束`)
        if (onEnded) onEnded()
      })
      
      // 监听播放错误
      this.audioPlayer.addEventListener('error', (e) => {
        console.error(`第 ${pageIndex + 1} 页语音播放错误:`, e)
        this.isPlayingAudio = false
        if (onEnded) onEnded()
      })
    },
    
    // 使用认证播放音频
    async playAudioWithAuth(url, token, onEnded = null) {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('获取音频失败')
        }
        
        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        
        this.audioPlayer = new Audio(audioUrl)
        
        this.audioPlayer.play().then(() => {
          this.isPlayingAudio = true
          console.log('语音播放开始（认证）')
        }).catch(error => {
          console.error('语音播放失败:', error)
          this.isPlayingAudio = false
          if (onEnded) onEnded()
        })
        
        this.audioPlayer.addEventListener('ended', () => {
          this.isPlayingAudio = false
          URL.revokeObjectURL(audioUrl) // 释放 blob URL
          console.log('语音播放结束（认证）')
          if (onEnded) onEnded()
        })
        
        this.audioPlayer.addEventListener('error', (e) => {
          console.error('语音播放错误:', e)
          this.isPlayingAudio = false
          URL.revokeObjectURL(audioUrl)
          if (onEnded) onEnded()
        })
      } catch (error) {
        console.error('加载音频失败:', error)
        this.isPlayingAudio = false
        if (onEnded) onEnded()
      }
    },
    
    // 停止语音播放
    stopAudio() {
      // 清除待播放的定时器
      if (this.pendingAudioTimeout) {
        clearTimeout(this.pendingAudioTimeout)
        this.pendingAudioTimeout = null
      }
      
      // 停止当前播放的音频
      if (this.audioPlayer) {
        this.audioPlayer.pause()
        this.audioPlayer.currentTime = 0
        this.audioPlayer = null
        this.isPlayingAudio = false
      }
    },
    
    // 关闭语音
    toggleAudioOff() {
      this.autoPlayAudio = false
      this.stopAudio()
      
      // 如果正在自动播放，切换到一般速度的定时器翻页
      if (this.autoPlay) {
        this.speed = 'medium'
        this.startAutoPlay()
      }
    }
  }
}
</script>

<style scoped>
.book-display-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.book-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 控制面板 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  flex-wrap: wrap;
  gap: 15px;
  transition: background 0.3s ease, color 0.3s ease;
}

.night-mode .control-panel {
  background: rgba(255, 255, 255, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-weight: bold;
  color: #2d3436;
  transition: color 0.3s ease;
}

.night-mode .control-label {
  color: #ddd;
}

.toggle-group, .speed-group {
  display: flex;
  gap: 5px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.night-mode .toggle-group,
.night-mode .speed-group {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-btn, .speed-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  color: #000;
}

.night-mode .toggle-btn,
.night-mode .speed-btn {
  color: #ddd;
}

.toggle-btn.active, .speed-btn.active {
  background: #6c5ce7;
  color: white;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

/* 绘本展示 */
.book-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 50px 0;
  min-height: 750px;
  position: relative;
}

.flipbook-container {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.replay-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border: 3px solid #000;
  border-radius: 50px;
  background: #FFE66D;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 0 #000;
  z-index: 10;
}

.replay-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.replay-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}

.night-mode .replay-btn {
  background: #FFE66D;
  color: #000;
}

/* 页面样式 */
:deep(.page) {
  background: linear-gradient(to bottom, #fffef7 0%, #fefcf0 100%);
  border: 3px solid #8b4513;
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

:deep(.page-content) {
  padding: 30px 35px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.page-number) {
  text-align: center;
  color: #a0826d;
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-style: italic;
}

:deep(.page-layout) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:deep(.text-top-image-bottom),
:deep(.image-top-text-bottom) {
  flex-direction: column;
}

:deep(.illustration-section) {
  flex: 7;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
  border-radius: 12px;
  padding: 8px;
  overflow: hidden;
  min-height: 0;
}

:deep(.text-section) {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  min-height: 0;
  overflow: hidden;
}

:deep(.illustration-medium) {
  font-size: 8rem;
  animation: float-illustration 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

:deep(.illustration-image) {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@keyframes float-illustration {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
}

:deep(.story-text) {
  font-size: 2.2rem;
  line-height: 1.6;
  color: #3d3d3d;
  text-align: justify;
  text-indent: 2em;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  margin: 0;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 翻页控制 */
.page-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin: 30px 0;
}

.btn-nav {
  min-width: 120px;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.page-indicator {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6c5ce7;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  transition: background 0.3s ease, color 0.3s ease;
}

.night-mode .page-indicator {
  background: rgba(255, 255, 255, 0.15);
  color: #FFE66D;
}

.audio-indicator {
  font-size: 1rem;
  font-weight: bold;
  color: #e74c3c;
  padding: 8px 16px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 15px;
  animation: pulse-audio 1.5s ease-in-out infinite;
}

@keyframes pulse-audio {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

.night-mode .audio-indicator {
  background: rgba(231, 76, 60, 0.2);
}

/* 结束屏幕 */
.end-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fade-in 0.5s ease;
}

.end-card {
  text-align: center;
  padding: 50px;
  max-width: 500px;
  position: relative;
}

.close-end-screen {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border: 3px solid #000;
  border-radius: 50%;
  background: #fff;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #000;
}

.close-end-screen:hover {
  background: #FF6B9D;
  color: #fff;
  transform: rotate(90deg);
}

.night-mode .close-end-screen {
  background: rgba(255, 255, 255, 0.9);
}

.night-mode .close-end-screen:hover {
  background: #FF6B9D;
  border-color: #FF6B9D;
}

.end-card h2 {
  font-size: 2.5rem;
  color: #6c5ce7;
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.night-mode .end-card h2 {
  color: #FFE66D;
}

.end-card p {
  font-size: 1.3rem;
  color: #636e72;
  margin-bottom: 30px;
  transition: color 0.3s ease;
}

.night-mode .end-card p {
  color: #aaa;
}

.end-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fade-in 0.3s ease;
}

.modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 1.8rem;
  color: #6c5ce7;
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.night-mode .modal-content h3 {
  color: #FFE66D;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.feedback-options {
  margin-bottom: 20px;
}

.feedback-item {
  margin-bottom: 15px;
}

.feedback-item label {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #000;
}

.night-mode .feedback-item label {
  background: rgba(255, 255, 255, 0.1);
  color: #ddd;
}

.feedback-item label:hover {
  background: #e8f8f5;
}

.night-mode .feedback-item label:hover {
  background: rgba(255, 255, 255, 0.2);
}

.feedback-item input[type="checkbox"] {
  margin-right: 10px;
}

.feedback-item span {
  font-size: 1.1rem;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 加载状态 */
.loading-container,
.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.loading-spinner {
  font-size: 6rem;
  margin-bottom: 30px;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 1.5rem;
  color: #666;
  font-weight: 600;
}

.night-mode .loading-text {
  color: #aaa;
}

.error-icon {
  font-size: 6rem;
  margin-bottom: 30px;
}

.error-text {
  font-size: 1.5rem;
  color: #e74c3c;
  margin-bottom: 30px;
  font-weight: 600;
}

.night-mode .error-text {
  color: #ff6b6b;
}

/* 响应式 */
@media (max-width: 1024px) {
  .flipbook-container {
    transform: scale(0.8);
  }
}

@media (max-width: 768px) {
  .flipbook-container {
    transform: scale(0.6);
  }
  
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: space-between;
  }
  
  .page-controls {
    flex-wrap: wrap;
  }
  
  :deep(.story-text) {
    font-size: 1.2rem;
  }
  
  :deep(.illustration-medium) {
    font-size: 6rem;
  }
}
</style>
