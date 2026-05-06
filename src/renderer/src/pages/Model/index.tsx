import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { debounce } from '@src/renderer/src/utils'
import { resolveModelPath } from '@src/renderer/src/utils/modelPath'
import LegacyRender from './Legacy'
import CurrentRender from './Current'
import Toolbar from './Toolbar'
import Tips from './Tips'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { setScheduleNotificationCallback } from '../../models/schedule'

interface ITips {
  mouseover: Mouseover[]
  click: Mouseover[]
}

interface Mouseover {
  selector: string
  text: string[]
}

const Wrapper = styled.div<{ border: boolean }>`
  ${(props) => (props.border ? 'border: 2px dashed #ccc;' : 'padding: 2px;')}
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`

const RenderWrapper = styled.div`
  margin-top: 20px;
  height: 100%;
`

const ChatContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 500px;
  padding: 0 2vw 10px;
  z-index: 1000;
  pointer-events: none;
`

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  pointer-events: auto;
`

const InputBox = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 12px;
  color: #333;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
  pointer-events: auto;
  cursor: text;
  min-width: 0;

  &:focus {
    border-color: rgba(52, 152, 219, 0.6);
    box-shadow: 0 0 12px rgba(52, 152, 219, 0.3);
  }

  &::placeholder {
    color: rgba(100, 100, 100, 0.5);
  }
`

const SendButton = styled.button<{ disabled: boolean }>`
  background: ${(props) =>
    props.disabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(52, 152, 219, 0.8)'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s;
  flex-shrink: 0;
  pointer-events: auto;

  &:hover {
    background: ${(props) =>
      props.disabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(52, 152, 219, 1)'};
  }

  i {
    color: #fff;
    font-size: 12px;
  }
`

const LoadingSpinner = styled.div<{ visible: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(76, 175, 80, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const ResetButton = styled.button<{ visible: boolean }>`
  display: ${(props) => (props.visible ? 'flex' : 'none')};
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  pointer-events: auto;
  margin-right: 8px;

  &:hover {
    background: rgba(244, 67, 54, 1);
  }

  i {
    color: #fff;
    font-size: 12px;
  }
`

const getCavSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight - 20,
  }
}

const Model = () => {
  const {
    modelPath: originModelPath,
    resizable,
    useGhProxy,
    language,
    showTool,
  } = useSelector((state: RootState) => ({
    ...state.config,
    ...state.win,
  }))

  const { aiConfig, aiMessages, aiLoading } = useSelector((state: RootState) => ({
    aiConfig: state.ai.config,
    aiMessages: state.ai.messages,
    aiLoading: state.ai.isLoading,
  }))

  const modelPath =
    process.env.NODE_ENV === 'development'
      ? originModelPath
      : resolveModelPath(originModelPath)

  const dispatch = useDispatch<Dispatch>()

  const [tips, setTips] = useState({
    text: '',
    priority: -1,
    timeout: 0,
  })

  const [inputText, setInputText] = useState('')

  const [cavSize, setCavSize] =
    useState<{ width: number; height: number }>(getCavSize())

  const latestAIReply = aiMessages.filter(m => m.role === 'assistant').pop()

  // 显示最新回复
  const displayContent = latestAIReply?.content || ''

  useEffect(() => {
    ;(window as any).setSwitchTool = dispatch.win.setSwitchTool
    ;(window as any).setLanguage = dispatch.win.setLanguage
    ;(window as any).nextModel = dispatch.config.nextModel
    ;(window as any).prevModel = dispatch.config.prevModel

    // 设置日程通知回调 - 显示 AI 润色后的提醒（1 分钟）
    setScheduleNotificationCallback((title: string, polishedTitle?: string) => {
      // 如果有润色后的内容，显示润色版本；否则显示原始内容
      const displayText = polishedTitle ? `📅 ${polishedTitle}` : `📅 提醒：${title}`
      // 日程提醒使用最高优先级，确保能覆盖 AI 回复
      setTips({ text: displayText, timeout: 60000, priority: 100 })
    })

    // 每 10 秒检查一次日程
    const timer = setInterval(() => {
      dispatch.schedule.checkReminders()
    }, 10000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // 当有新的 AI 回复时，通过 Tips 对话框显示（1 分钟）
  useEffect(() => {
    if (latestAIReply && !aiLoading) {
      setTips({ text: latestAIReply.content, timeout: 60000, priority: 30 })
    }
  }, [latestAIReply, aiLoading])

  useEffect(() => {
    const handleDragOver = (evt: DragEvent): void => {
      evt.preventDefault()
    }
    const handleDrop = async (evt: DragEvent) => {
      evt.preventDefault()

      const files = evt.dataTransfer?.files

      if (!files) {
        return
      }

      const paths = []
      for (let i = 0; i < files.length; i++) {
        const result = await window.bridge.getModels(files[i])
        paths.push(...result)
      }

      console.log('modelList: ', paths)

      if (paths.length > 0) {
        const models = paths.map((p) => `file://${p}`)

        dispatch.config.setModelList(models)
        dispatch.config.setModelPath(models[0])
      }
    }

    document.body.addEventListener('dragover', handleDragOver)
    document.body.addEventListener('drop', handleDrop)

    return () => {
      document.body.removeEventListener('dragover', handleDragOver)
      document.body.removeEventListener('drop', handleDrop)
    }
  }, [])

  useLayoutEffect(() => {
    const resizeCanvas = debounce(() => {
      setCavSize(getCavSize())
    })

    window.addEventListener('resize', resizeCanvas, false)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    const handleBlur = () => {
      if (resizable) {
        dispatch.win.setResizable(false)
      }
    }

    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const isMoc3 = modelPath.endsWith('.model3.json')

  const Render = isMoc3 ? CurrentRender : LegacyRender

  const handleSend = () => {
    if (!inputText.trim() || aiLoading) return

    if (!aiConfig.enabled || !aiConfig.apiKey) {
      setTips({ text: '请先在 AI 设置中配置 API Key 并启用 AI 功能', timeout: 6000, priority: 20 })
      return
    }

    // 发送新问题时清除当前提示框
    setTips({ text: '', priority: -1, timeout: 0 })

    dispatch.ai.sendMessage(inputText.trim())
    setInputText('')
  }

  const handleReset = () => {
    dispatch.ai.resetLoading()
    setTips({ text: '已重置 AI 状态', timeout: 5000, priority: 20 })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Wrapper
      border={resizable}
    >
      <Tips {...tips}></Tips>
      {showTool && <Toolbar></Toolbar>}
      <RenderWrapper>
        <Render {...cavSize} modelPath={modelPath}></Render>
      </RenderWrapper>

      {/* AI 对话输入区域 */}
      <ChatContainer>
        <InputWrapper>
          <LoadingSpinner visible={aiLoading} />
          <InputBox
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiLoading ? '闪宝 思考中...' : '输入问题，与 闪宝 互动...'}
            disabled={aiLoading}
          />
          <ResetButton onClick={handleReset} visible={aiLoading}>
            <i className="fa fa-refresh"></i>
          </ResetButton>
          <SendButton onClick={handleSend} disabled={aiLoading || !inputText.trim()}>
            <i className="fa fa-send"></i>
          </SendButton>
        </InputWrapper>
      </ChatContainer>
    </Wrapper>
  )
}

export default Model