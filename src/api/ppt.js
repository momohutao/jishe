import request from '@/utils/request'
// 文件上传的接口地址
// 优先取环境变量，没有就用默认值 /files/upload
const DEFAULT_ATTACHMENT_UPLOAD_URL =
  import.meta.env.VITE_PPT_ATTACHMENT_UPLOAD_URL || '/files/upload'
 
// 上传附件（PDF、视频）的 API
export function uploadPptAttachmentApi(file, extraData = {}) {
  const formData = new FormData()
  formData.append('file', file)

  Object.entries(extraData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  return request({
    url: DEFAULT_ATTACHMENT_UPLOAD_URL,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
//生成 PPT
export function generatePptApi(payload) {
  return request({
    url: '/ppt/generate',
    method: 'POST',
    data: payload,
  })
}

export function fetchPptTaskApi(taskId) {
  return request({
    url: `/ppt/tasks/${encodeURIComponent(taskId)}`,
    method: 'GET',
  })
}
