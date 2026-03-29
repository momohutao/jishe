import axios from 'axios'

import { ElMessage } from 'element-plus'

const baseURL = '/api'
const instance = axios.create({
  baseURL,
  timeout: 10000000,
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 注意：你原来的组件中成功状态是 code === 0，你的 request 中是 code == 1
    // 这里兼容一下 0 和 1 的情况，你需要根据实际后端接口做调整
    if (response.data.code == 1 || response.data.code == 0) {
      // 推荐直接返回 data，这样组件里不需要再解构一层 response.data
      return response.data
    }

    ElMessage.error(response.data.message || '服务异常')
    return Promise.reject(new Error(response.data.message || '服务异常'))
  },
  function (error) {
    ElMessage.error(error.response?.data?.message || '服务异常')
    return Promise.reject(error)
  },
)

export default instance
export { baseURL }
