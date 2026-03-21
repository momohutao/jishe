import request from '@/utils/request';

// 1. 向后端注册文件
export function registerFileApi(apiBaseUrl, payload) {
  const url = apiBaseUrl ? `${apiBaseUrl}/api/onlyoffice/files/register` : `/api/onlyoffice/files/register`;
  return request({ url, method: 'POST', data: payload });
}

// 2. 获取后端返回的编辑器配置 (包含了 mode 参数)
export function fetchEditorConfigApi(apiBaseUrl, payload) {
  console.log("======== 函数被调用了！========");
  const fileId = encodeURIComponent(payload.fileId || "");
  const userId = encodeURIComponent(payload.userId || payload.creatorId || "u100");
  const mode = encodeURIComponent(payload.mode || "edit"); // 默认或传入 view / edit

  const url = apiBaseUrl 
    ? `${apiBaseUrl}/api/onlyoffice/files/${fileId}/editor-config` 
    : `/api/onlyoffice/files/${fileId}/editor-config`;

  return request({
    url,
    method: 'GET',
    params: { userId, mode }
  });
}