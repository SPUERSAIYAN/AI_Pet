import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { Dispatch, RootState } from '../../store'

const Wrapper = styled.div`
  width: 350px;
  max-height: 400px;
  background: rgba(30, 30, 40, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1000;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const Title = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  transition: color 0.3s;

  &:hover {
    color: #fff;
  }
`

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${(props) =>
    props.isUser ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  font-size: 13px;
  line-height: 1.5;
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  word-break: break-word;
`

const InputArea = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: rgba(76, 175, 80, 0.6);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const SendButton = styled.button`
  background: rgba(76, 175, 80, 0.6);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(76, 175, 80, 1);
  }

  i {
    color: #fff;
    font-size: 14px;
  }
`

const LoadingIndicator = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  padding: 8px 14px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
`

const ChatPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dispatch = useDispatch<Dispatch>()
  const { messages, isLoading, inputText, config } = useSelector(
    (state: RootState) => state.ai
  )
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return

    if (!config.enabled || !config.apiKey) {
      alert('请先在 AI 设置中配置 API Key 并启用 AI 功能')
      onClose()
      return
    }

    dispatch.ai.sendMessage(inputText.trim())
    dispatch.ai.setInputText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Wrapper>
      <Header>
        <Title>AI 对话</Title>
        <CloseButton onClick={onClose}>
          <i className="fa fa-times"></i>
        </CloseButton>
      </Header>

      <MessageList ref={messageListRef}>
        {messages.length === 0 ? (
          <EmptyState>
            <i
              className="fa fa-magic"
              style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}
            ></i>
            <p>有什么可以帮你的吗？</p>
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <Message key={msg.id} isUser={msg.role === 'user'}>
              {msg.content}
            </Message>
          ))
        )}
        {isLoading && <LoadingIndicator>思考中...</LoadingIndicator>}
      </MessageList>

      <InputArea>
        <Input
          type="text"
          value={inputText}
          onChange={(e) => dispatch.ai.setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入问题..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading || !inputText.trim()}>
          <i className="fa fa-send"></i>
        </SendButton>
      </InputArea>
    </Wrapper>
  )
}

export default ChatPanel