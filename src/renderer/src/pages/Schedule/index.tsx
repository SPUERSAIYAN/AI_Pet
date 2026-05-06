import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Dispatch, RootState } from '../../store'
import { ScheduleItem } from '../../models/schedule'

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
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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

const AddButton = styled.button`
  background: rgba(76, 175, 80, 0.8);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin-bottom: 16px;
  flex-shrink: 0;

  &:hover {
    background: rgba(76, 175, 80, 1);
  }

  i {
    margin-right: 6px;
  }
`

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  min-height: 0;
  margin-top: 8px;

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

const ScheduleItemWrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const ItemContent = styled.div`
  flex: 1;
`

const ItemTitle = styled.div`
  color: #fff;
  font-size: 15px;
  margin-bottom: 4px;
`

const ItemTime = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
`

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  &.delete:hover {
    color: #f44336;
  }

  &.edit:hover {
    color: #2196f3;
  }
`

const ToggleButton = styled.button<{ enabled: boolean }>`
  background: ${(props) => (props.enabled ? 'rgba(76, 175, 80, 0.6)' : 'rgba(158, 158, 158, 0.4)')};
  border: none;
  border-radius: 12px;
  padding: 4px 12px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
`

// 编辑/添加对话框
const Dialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const DialogContent = styled.div`
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);

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

const DialogTitle = styled.h3`
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 18px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
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

const TimeInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: rgba(76, 175, 80, 0.6);
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }
`

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  cursor: pointer;

  &:focus {
    border-color: rgba(76, 175, 80, 0.6);
  }

  option {
    background: rgba(30, 30, 40, 0.95);
    color: #fff;
  }
`

const NumberInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: rgba(76, 175, 80, 0.6);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* 允许删除数字 */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`

const NumberInputWrapper = styled.div`
  position: relative;
`

const DeleteButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  transition: all 0.3s;

  &:hover {
    color: rgba(244, 67, 54, 0.8);
  }
`

const TypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
`

const TypeButton = styled.button<{ active: boolean }>`
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

const Hint = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin: 4px 0 0 0;
  line-height: 1.4;
`

const RepeatSettings = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
`

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`

const DialogButton = styled.button<{ primary?: boolean }>`
  background: ${(props) => (props.primary ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 255, 255, 0.1)')};
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: ${(props) => (props.primary ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 255, 255, 0.2)')};
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
`

const Schedule: React.FC = () => {
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()
  const { items } = useSelector((state: RootState) => state.schedule)

  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    time: '09:00',
    type: 'once' as 'once' | 'repeat',
    interval: '10',
    duration: '1',
    maxNotify: '3',
  })

  const handleBack = () => {
    dispatch.schedule.setShowSchedulePanel(false)
    navigate('/')
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ title: '', time: '09:00', type: 'once', interval: '10', duration: '1', maxNotify: '3' })
    setShowDialog(true)
  }

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      time: item.time,
      type: item.type || 'once',
      interval: String(item.interval || 10),
      duration: String(item.duration || 1),
      maxNotify: String(item.maxNotify || 3),
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    dispatch.schedule.deleteItem(id)
  }

  const handleToggle = (item: ScheduleItem) => {
    dispatch.schedule.updateItem({ ...item, enabled: !item.enabled })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    // 将字符串转换为数字
    const intervalNum = parseInt(formData.interval) || 10
    const durationNum = parseInt(formData.duration) || 1
    const maxNotifyNum = parseInt(formData.maxNotify) || 3

    if (editingItem) {
      dispatch.schedule.updateItem({
        ...editingItem,
        title: formData.title,
        time: formData.time,
        type: formData.type,
        interval: formData.type === 'repeat' ? intervalNum : undefined,
        duration: formData.type === 'repeat' ? durationNum : undefined,
        maxNotify: formData.type === 'repeat' ? maxNotifyNum : undefined,
      })
    } else {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        title: formData.title,
        time: formData.time,
        type: formData.type,
        enabled: true,
        notified: false,
        interval: formData.type === 'repeat' ? intervalNum : undefined,
        duration: formData.type === 'repeat' ? durationNum : undefined,
        maxNotify: formData.type === 'repeat' ? maxNotifyNum : undefined,
        notifyCount: 0,
      }
      dispatch.schedule.addItem(newItem)
    }

    setShowDialog(false)
  }

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>日程管理</Title>
          <BackButton onClick={handleBack}>
            <i className="fa fa-arrow-left"></i>
            返回
          </BackButton>
        </Header>

        <AddButton onClick={handleAdd}>
          <i className="fa fa-plus"></i>
          添加日程
        </AddButton>

        <ScheduleList>
          {items.length === 0 ? (
            <EmptyState>
              <i className="fa fa-calendar-o" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
              <p>暂无日程，点击右上角添加</p>
            </EmptyState>
          ) : (
            items.map((item) => (
              <ScheduleItemWrapper key={item.id}>
                <ItemContent>
                  <ItemTitle>
                    {item.type === 'repeat' && <i className="fa fa-refresh" style={{ marginRight: '6px', color: 'rgba(76, 175, 80, 0.8)' }}></i>}
                    {item.title}
                  </ItemTitle>
                  <ItemTime>
                    <i className="fa fa-clock-o"></i> {item.time}
                    {item.type === 'repeat' && (
                      <span style={{ marginLeft: '8px', color: 'rgba(76, 175, 80, 0.6)' }}>
                        已提醒 {item.notifyCount || 0}/{item.maxNotify || 3} 次
                      </span>
                    )}
                  </ItemTime>
                </ItemContent>
                <ItemActions>
                  <ToggleButton enabled={item.enabled} onClick={() => handleToggle(item)}>
                    {item.enabled ? '已启用' : '已禁用'}
                  </ToggleButton>
                  <IconButton className="edit" onClick={() => handleEdit(item)}>
                    <i className="fa fa-edit"></i>
                  </IconButton>
                  <IconButton className="delete" onClick={() => handleDelete(item.id)}>
                    <i className="fa fa-trash"></i>
                  </IconButton>
                </ItemActions>
              </ScheduleItemWrapper>
            ))
          )}
        </ScheduleList>
      </Container>

      {showDialog && (
        <Dialog onClick={() => setShowDialog(false)}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>{editingItem ? '编辑日程' : '添加日程'}</DialogTitle>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>日程标题</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入日程标题"
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label>提醒时间</Label>
                <TimeInput
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>提醒类型</Label>
                <TypeSelector>
                  <TypeButton
                    active={formData.type === 'once'}
                    onClick={() => setFormData({ ...formData, type: 'once' })}
                  >
                    <i className="fa fa-dot-circle-o"></i>单次触发
                  </TypeButton>
                  <TypeButton
                    active={formData.type === 'repeat'}
                    onClick={() => setFormData({ ...formData, type: 'repeat' })}
                  >
                    <i className="fa fa-refresh"></i>重复提醒
                  </TypeButton>
                </TypeSelector>
                <Hint>
                  {formData.type === 'once'
                    ? '单次触发：如开会、看电影等一次性事件，触发后自动禁用'
                    : '重复提醒：如学英语、健身等需要持续提醒的任务'}
                </Hint>
              </FormGroup>

              {formData.type === 'repeat' && (
                <RepeatSettings>
                  <FormGroup>
                    <Label>提醒间隔（分钟）</Label>
                    <NumberInputWrapper>
                      <NumberInput
                        type="text"
                        value={formData.interval}
                        onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                      />
                      <DeleteButton
                        type="button"
                        onClick={() => setFormData({ ...formData, interval: '' })}
                        title="清空"
                      >
                        <i className="fa fa-times"></i>
                      </DeleteButton>
                    </NumberInputWrapper>
                    <Hint>每次提醒之间的时间间隔，默认 10 分钟</Hint>
                  </FormGroup>

                  <FormGroup>
                    <Label>自律时长（小时）</Label>
                    <NumberInputWrapper>
                      <NumberInput
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                      <DeleteButton
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: '' })}
                        title="清空"
                      >
                        <i className="fa fa-times"></i>
                      </DeleteButton>
                    </NumberInputWrapper>
                    <Hint>在此时长内会按照间隔重复提醒，默认 1 小时</Hint>
                  </FormGroup>

                  <FormGroup>
                    <Label>最大提醒次数</Label>
                    <NumberInputWrapper>
                      <NumberInput
                        type="text"
                        value={formData.maxNotify}
                        onChange={(e) => {
                          const val = e.target.value
                          // 只允许输入数字
                          if (val === '' || /^\d+$/.test(val)) {
                            setFormData({ ...formData, maxNotify: val })
                          }
                        }}
                      />
                      <DeleteButton
                        type="button"
                        onClick={() => setFormData({ ...formData, maxNotify: '' })}
                        title="清空"
                      >
                        <i className="fa fa-times"></i>
                      </DeleteButton>
                    </NumberInputWrapper>
                    <Hint>最多提醒 3 次，默认 3 次</Hint>
                  </FormGroup>
                </RepeatSettings>
              )}

              <DialogActions>
                <DialogButton type="button" onClick={() => setShowDialog(false)}>
                  取消
                </DialogButton>
                <DialogButton type="submit" primary>
                  {editingItem ? '保存' : '添加'}
                </DialogButton>
              </DialogActions>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </Wrapper>
  )
}

export default Schedule
