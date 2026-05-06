import { Models } from '@rematch/core'
import { config } from './config'
import { win } from './win'
import { schedule } from './schedule'
import { ai } from './ai'

export interface RootModel extends Models<RootModel> {
  config: typeof config
  win: typeof win
  schedule: typeof schedule
  ai: typeof ai
}

export const models: RootModel = { config, win, schedule, ai }