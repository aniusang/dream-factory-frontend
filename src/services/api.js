// API 基础配置
const API_BASE_URL = 'http://43.103.39.197:8000' // 根据你的后端地址修改

// 导出 API_BASE_URL 供其他组件使用
export { API_BASE_URL }

// 通用请求函数
async function request(url, options = {}) {
  const token = localStorage.getItem('access_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // 如果有 token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.detail || '请求失败',
        data
      }
    }
    
    return data
  } catch (error) {
    if (error.status) {
      throw error
    }
    throw {
      status: 0,
      message: '网络错误，请检查连接',
      data: null
    }
  }
}

// 认证相关 API
export const authAPI = {
  // 注册
  register(userData) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.phone, // 使用手机号作为用户名
        phone: userData.phone,
        password: userData.password,
        full_name: userData.nickname || userData.phone
      })
    })
  },
  
  // 登录
  login(credentials) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.phone, // 使用手机号作为用户名
        password: credentials.password
      })
    })
  },
  
  // 获取当前用户信息
  getCurrentUser() {
    return request('/api/auth/me', {
      method: 'GET'
    })
  }
}

// 绘本相关 API
export const comicsAPI = {
  // 创建绘本会话
  createSession(sessionData) {
    return request('/api/comics/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: sessionData.title || '',
        description: sessionData.description || '',
        genggai: sessionData.genggai, // 故事梗概（用户输入的故事内容）
        xingxiang: sessionData.xingxiang, // 故事形象（选择的角色）
        leibie: sessionData.leibie || '科普' // 故事类别
      })
    })
  },
  
  // 获取用户的所有绘本会话
  getSessions() {
    return request('/api/comics/sessions', {
      method: 'GET'
    })
  },
  
  // 获取指定会话的详细信息（包括所有页面）
  getSessionDetail(sessionId) {
    return request(`/api/comics/sessions/${sessionId}`, {
      method: 'GET'
    })
  }
}

export default {
  authAPI,
  comicsAPI
}
