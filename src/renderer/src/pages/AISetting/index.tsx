import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Dispatch, RootState } from '../../store'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
`

const Container = styled.div`
  background: rgba(30, 30, 40, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const Title = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  i {
    margin-right: 6px;
  }
`

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
`

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 14px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: rgba(76, 175, 80, 0.6);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const ToggleWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`

const Toggle = styled.input`
  appearance: none;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;

  &:checked {
    background: rgba(76, 175, 80, 0.8);
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  &:checked::after {
    transform: translateX(20px);
  }
`

const ProviderSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
`

const ProviderButton = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${(props) => props.active ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${(props) => props.active ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;

  &:hover {
    background: ${(props) => props.active ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 255, 255, 0.15)'};
  }

  i {
    margin-right: 6px;
  }
`

const SaveButton = styled.button`
  background: rgba(76, 175, 80, 0.8);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  margin-top: 10px;

  &:hover {
    background: rgba(76, 175, 80, 1);
  }
`

const Hint = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin: 0;
  line-height: 1.5;
`

const Link = styled.a`
  color: rgba(76, 175, 80, 0.8);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const AISetting: React.FC = () => {
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()
  const { config } = useSelector((state: RootState) => state.ai)

  const [formData, setFormData] = useState({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    enabled: config.enabled,
    provider: config.provider,
  })

  const handleBack = () => {
    navigate('/')
  }

  const handleSave = () => {
    dispatch.ai.setConfig(formData)
    navigate('/')
  }

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>AI 设置</Title>
          <BackButton onClick={handleBack}>
            <i className="fa fa-arrow-left"></i>
            返回
          </BackButton>
        </Header>

        <Form>
          <FormGroup>
            <Label>模型提供商</Label>
            <ProviderSelector>
              <ProviderButton
                active={formData.provider === 'qwen'}
                onClick={() => setFormData({
                  ...formData,
                  provider: 'qwen',
                  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                  model: 'qwen3.5-plus',
                })}
              >
                <i className="fa fa-cloud"></i>通义千问
              </ProviderButton>
              <ProviderButton
                active={formData.provider === 'doubao'}
                onClick={() => setFormData({
                  ...formData,
                  provider: 'doubao',
                  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
                  model: 'volcengine/doubao-seed-1-8-251228',
                })}
              >
                <i className="fa fa-comment"></i>豆包大模型
              </ProviderButton>
            </ProviderSelector>
          </FormGroup>

          <FormGroup>
            <ToggleWrapper>
              <Toggle
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) =>
                  setFormData({ ...formData, enabled: e.target.checked })
                }
              />
              <span style={{ color: '#fff', fontSize: '14px' }}>
                启用 AI 对话功能
              </span>
            </ToggleWrapper>
          </FormGroup>

          <FormGroup>
            <Label>API Key</Label>
            <Input
              type="password"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              placeholder="请输入 API Key"
            />
            <Hint>
              获取 API Key：
              {formData.provider === 'qwen' ? (
                <Link
                  href="https://dashscope.console.aliyun.com/apiKey"
                  target="_blank"
                >
                  阿里云 DashScope 控制台
                </Link>
              ) : (
                <Link
                  href="https://console.volcengine.com/ark"
                  target="_blank"
                >
                  火山引擎方舟控制台
                </Link>
              )}
            </Hint>
          </FormGroup>

          <FormGroup>
            <Label>API 基础地址</Label>
            <Input
              type="text"
              value={formData.baseUrl}
              onChange={(e) =>
                setFormData({ ...formData, baseUrl: e.target.value })
              }
              placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
            />
          </FormGroup>

          <FormGroup>
            <Label>模型</Label>
            <Input
              type="text"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              placeholder={formData.provider === 'qwen' ? 'qwen3.5-plus' : 'volcengine/doubao-seed-1-8-251228'}
            />
            <Hint>
              {formData.provider === 'qwen'
                ? '常用模型：qwen3.5-plus、qwen-max、qwen-turbo'
                : '常用模型：volcengine/doubao-seed-1-8-251228'}
            </Hint>
          </FormGroup>

          <SaveButton onClick={handleSave}>保存设置</SaveButton>
        </Form>
      </Container>
    </Wrapper>
  )
}

export default AISetting
