/**
 * 获取本地 Shizuku 模型的加载路径
 * 开发环境: 使用项目 assets/models 目录
 * 生产环境: 通过 preload 注入的 assetsPath 动态构建
 */

/** 开发环境默认路径 (Windows) */
const DEV_MODEL_PATH = 'E:/IDEA/Personal_Pet/assets/models/shizuku/shizuku.model.json'

/** 默认本地模型路径标识 */
export const DEFAULT_MODEL_PATH =
  process.env.NODE_ENV === 'development' ? DEV_MODEL_PATH : 'local://models/shizuku/shizuku.model.json'

/**
 * 将模型路径解析为可用的 file:// URL
 * - local:// 开头: 生产环境路径，通过 bridge.assetsPath 解析
 * - file:// 开头: 直接返回
 * - 其他: 开发环境绝对路径
 */
export const resolveModelPath = (path: string): string => {
  if (!path.startsWith('local://')) {
    return path
  }

  const bridge = (window as any).bridge
  console.log('[modelPath] resolving local:// path:', path)
  console.log('[modelPath] bridge:', bridge ? 'available' : 'undefined')
  console.log('[modelPath] bridge.assetsPath:', bridge?.assetsPath)

  if (bridge && bridge.assetsPath) {
    const normalized = bridge.assetsPath.replace(/\\/g, '/')
    const relativePath = path.replace('local://', '')
    const result = `file:///${normalized}/${relativePath}`
    console.log('[modelPath] resolved to:', result)
    return result
  }

  // 兜底
  console.warn('[modelPath] fallback to relative path')
  return 'assets/models/shizuku/shizuku.model.json'
}
