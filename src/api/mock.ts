// Mock数据 - 后端未完成时使用

export const mockUsers: Record<string, { password: string; user: any }> = {
  demo: {
    password: 'Demo1234',
    user: {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      phone: '13800138000',
      gender: 'MALE',
      status: 'ACTIVE',
      roles: ['USER'],
      createdAt: '2024-01-01T00:00:00',
    },
  },
}

export const mockLogin = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userData = mockUsers[username]
      if (userData && userData.password === password) {
        resolve({
          data: {
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            tokenType: 'Bearer',
            expiresIn: 86400,
            user: userData.user,
          },
        })
      } else {
        reject({ message: '用户名或密码错误' })
      }
    }, 500)
  })
}

export const mockRegister = (data: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockUsers[data.username]) {
        reject({ message: '用户名已存在' })
        return
      }
      const newUser = {
        id: Date.now(),
        username: data.username,
        email: data.email,
        phone: data.phone || '',
        gender: data.gender || null,
        status: 'ACTIVE',
        roles: ['USER'],
        createdAt: new Date().toISOString(),
      }
      mockUsers[data.username] = { password: data.password, user: newUser }
      resolve({ data: newUser })
    }, 500)
  })
}

// 是否启用Mock模式
export const MOCK_ENABLED = false
