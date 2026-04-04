import request from '@/utils/request'

 

const normalizeApiBaseUrl = (apiBaseUrl) => {
  if (!apiBaseUrl) {
    return ''
  }

  // Port 8080 is plain HTTP for the Spring Boot service in this project.
  return apiBaseUrl.replace(/^https:\/\/([^/]+:8080)(\/|$)/i, 'http://$1$2')
}

export function registerFileApi(apiBaseUrl, payload) {
  const resolvedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl)
  const url = resolvedApiBaseUrl
    ? `${resolvedApiBaseUrl}/api/onlyoffice/files/register`
    : '/api/onlyoffice/files/register'

  return request({ url, method: 'POST', data: payload })
}

export function fetchEditorConfigApi(apiBaseUrl, payload) {
  const fileId = encodeURIComponent(payload.fileId || '')
  const userId = encodeURIComponent(payload.userId || payload.creatorId || 'u100')
  const mode = encodeURIComponent(payload.mode || 'edit')
  const resolvedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl)
  const url = resolvedApiBaseUrl
    ? `${resolvedApiBaseUrl}/api/onlyoffice/files/${fileId}/editor-config`
    : `/api/onlyoffice/files/${fileId}/editor-config`

  return request({
    url,
    method: 'GET',
    params: { userId, mode },
  })
}

 
