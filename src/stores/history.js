// 🚨 必须添加这两行导入，否则会报 ReferenceError
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', () => {
  // 初始加载：尝试从本地存储读取
  const list = ref(JSON.parse(localStorage.getItem('kb_history') || '[]'))
  
  // 深度监听：只要 list 变化，就持久化到本地硬盘
  watch(list, (val) => {
    localStorage.setItem('kb_history', JSON.stringify(val))
  }, { deep: true })
  
  return { list }
})