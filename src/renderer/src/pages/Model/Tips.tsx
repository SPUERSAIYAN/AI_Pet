import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export interface TipsType {
  text: string
  timeout: number
  priority: number
}

const Wrapper = styled.div`
  animation: shake 50s ease-in-out 5s infinite;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 3px 15px 2px rgba(255, 255, 255, 0.3);
  font-size: 14px;
  line-height: 24px;
  margin: 2px 20px 0;
  min-height: 50px;
  opacity: 1;
  overflow: hidden;
  padding: 5px 10px;
  position: absolute;
  text-overflow: ellipsis;
  transition: opacity 1s;
  width: calc(100% - 50px);
  word-break: break-all;
  z-index: 999;
  pointer-events: none;

  span {
    color: #333333;
  }

  @keyframes shake {
    2% {
      transform: translate(0.5px, -1.5px) rotate(-0.5deg);
    }

    4% {
      transform: translate(0.5px, 1.5px) rotate(1.5deg);
    }

    6% {
      transform: translate(1.5px, 1.5px) rotate(1.5deg);
    }

    8% {
      transform: translate(2.5px, 1.5px) rotate(0.5deg);
    }

    10% {
      transform: translate(0.5px, 2.5px) rotate(0.5deg);
    }

    12% {
      transform: translate(1.5px, 1.5px) rotate(0.5deg);
    }

    14% {
      transform: translate(0.5px, 0.5px) rotate(0.5deg);
    }

    16% {
      transform: translate(-1.5px, -0.5px) rotate(1.5deg);
    }

    18% {
      transform: translate(0.5px, 0.5px) rotate(1.5deg);
    }

    20% {
      transform: translate(2.5px, 2.5px) rotate(1.5deg);
    }

    22% {
      transform: translate(0.5px, -1.5px) rotate(1.5deg);
    }

    24% {
      transform: translate(-1.5px, 1.5px) rotate(-0.5deg);
    }

    26% {
      transform: translate(1.5px, 0.5px) rotate(1.5deg);
    }

    28% {
      transform: translate(-0.5px, -0.5px) rotate(-0.5deg);
    }

    30% {
      transform: translate(1.5px, -0.5px) rotate(-0.5deg);
    }

    32% {
      transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    34% {
      transform: translate(2.5px, 2.5px) rotate(-0.5deg);
    }

    36% {
      transform: translate(0.5px, -1.5px) rotate(0.5deg);
    }

    38% {
      transform: translate(2.5px, -0.5px) rotate(-0.5deg);
    }

    40% {
      transform: translate(-0.5px, 2.5px) rotate(0.5deg);
    }

    42% {
      transform: translate(-1.5px, 2.5px) rotate(0.5deg);
    }

    44% {
      transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    46% {
      transform: translate(1.5px, -0.5px) rotate(-0.5deg);
    }

    48% {
      transform: translate(2.5px, -0.5px) rotate(0.5deg);
    }

    50% {
      transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    52% {
      transform: translate(-0.5px, 1.5px) rotate(0.5deg);
    }

    54% {
      transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    56% {
      transform: translate(0.5px, 2.5px) rotate(1.5deg);
    }

    58% {
      transform: translate(2.5px, 2.5px) rotate(0.5deg);
    }

    60% {
      transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    62% {
      transform: translate(-1.5px, 0.5px) rotate(1.5deg);
    }

    64% {
      transform: translate(-1.5px, 1.5px) rotate(1.5deg);
    }

    66% {
      transform: translate(0.5px, 2.5px) rotate(1.5deg);
    }

    68% {
      transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    70% {
      transform: translate(2.5px, 2.5px) rotate(0.5deg);
    }

    72% {
      transform: translate(-0.5px, -1.5px) rotate(1.5deg);
    }

    74% {
      transform: translate(-1.5px, 2.5px) rotate(1.5deg);
    }

    76% {
      transform: translate(-1.5px, 2.5px) rotate(1.5deg);
    }

    78% {
      transform: translate(-1.5px, 2.5px) rotate(0.5deg);
    }

    80% {
      transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
    }

    82% {
      transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
    }

    84% {
      transform: translate(-0.5px, 0.5px) rotate(1.5deg);
    }

    86% {
      transform: translate(2.5px, 1.5px) rotate(0.5deg);
    }

    88% {
      transform: translate(-1.5px, 0.5px) rotate(1.5deg);
    }

    90% {
      transform: translate(-1.5px, -0.5px) rotate(-0.5deg);
    }

    92% {
      transform: translate(-1.5px, -1.5px) rotate(1.5deg);
    }

    94% {
      transform: translate(0.5px, 0.5px) rotate(-0.5deg);
    }

    96% {
      transform: translate(2.5px, -0.5px) rotate(-0.5deg);
    }

    98% {
      transform: translate(-1.5px, -1.5px) rotate(-0.5deg);
    }

    0%,
    100% {
      transform: translate(0, 0) rotate(0);
    }
  }
`

const Tips = (props: TipsType) => {
  const [currentTips, setCurrentTips] = useState<TipsType | null>(null)
  const timerRef = useRef<number>()

  useEffect(() => {
    console.log('[Tips Component] Props changed:', props)
    console.log('[Tips Component] Timeout:', props.timeout, 'ms =', props.timeout / 1000, 'seconds')

    // 如果优先级为 -1，清除提示框
    if (props.priority === -1) {
      window.clearTimeout(timerRef.current)
      setCurrentTips(null)
      return
    }

    // 只在有文本且优先级足够高时显示
    const shouldUpdate = !currentTips || props.priority > currentTips.priority
    console.log('[Tips Component] Should update:', shouldUpdate, 'priority:', props.priority, 'current priority:', currentTips?.priority)

    if (props.text && shouldUpdate) {
      console.log('[Tips Component] Updating tips:', props.text)
      window.clearTimeout(timerRef.current)
      setCurrentTips(props)

      timerRef.current = window.setTimeout(() => {
        console.log('[Tips Component] Hiding tips')
        setCurrentTips(null)
      }, props.timeout)
    }
  }, [props.text, props.priority, props.timeout])

  if (!currentTips) {
    return null
  }

  return (
    <Wrapper dangerouslySetInnerHTML={{ __html: currentTips?.text }}></Wrapper>
  )
}

export default Tips
