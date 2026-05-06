import React, { FC, useEffect, useRef } from 'react'

export type LegacyType = { modelPath: string; width: number; height: number }

const Legacy: FC<LegacyType> = ({ modelPath, height, width }) => {
  const isMountRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    ;(window as any).loadlive2d('live2d', modelPath)

    // 阻止 canvas 的点击事件，防止 hitTest 错误
    const handleCanvasClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    if (canvasRef.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick, true)
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick, true)
      }
    }
  }, [modelPath])

  useEffect(() => {
    //  使用 key={+new Date()} 会导致渲染模型不完整，这里暂时对窗口改变时进行刷新
    // TODO
    if (isMountRef.current) {
      window.location.reload()
    } else {
      isMountRef.current = true
    }
  }, [height, width])

  return (
    <canvas
      id={'live2d'}
      className="live2d"
      ref={canvasRef}
      width={width}
      height={height}
    ></canvas>
  )
}

export default React.memo(Legacy)
