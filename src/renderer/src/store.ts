import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import persistPlugin from '@rematch/persist'
import { PersistConfig, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { DEFAULT_MODEL_PATH } from '@src/renderer/src/utils/modelPath'

import { models, RootModel } from './models'

const persistConfig: PersistConfig<
  RematchRootState<RootModel, Record<string, never>>,
  any,
  any,
  any
> = {
  key: 'root',
  storage,
  whitelist: ['config', 'ai', 'schedule'],
  version: 3,
  migrate: createMigrate({
    3: (state) => {
      if (!state || !state.config) return state
      // 重置模型路径为本地路径，不再使用远程 URL
      return {
        ...state,
        config: {
          ...state.config,
          modelPath: DEFAULT_MODEL_PATH,
          modelList: [DEFAULT_MODEL_PATH],
          useGhProxy: false,
        },
      }
    },
  }),
}

const store = init({
  models,
  plugins: [
    persistPlugin<RematchRootState<RootModel>, RootModel>(persistConfig),
  ],
})

export default store

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
