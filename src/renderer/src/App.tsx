import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'font-awesome/css/font-awesome.css'

import { GlobalStyles } from './styles/GlobalStyles'

import store from './store'

const Model = React.lazy(() => import('./pages/Model'))
const Setting = React.lazy(() => import('./pages/Setting'))
const Schedule = React.lazy(() => import('./pages/Schedule'))
const AISetting = React.lazy(() => import('./pages/AISetting'))

function App() {
  return (
    <Provider store={store}>
      <GlobalStyles />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={null}>
              <Model />
            </Suspense>
          }
        />
        <Route
          path="/setting"
          element={
            <Suspense fallback={null}>
              <Setting />
            </Suspense>
          }
        />
        <Route
          path="/schedule"
          element={
            <Suspense fallback={null}>
              <Schedule />
            </Suspense>
          }
        />
        <Route
          path="/ai-setting"
          element={
            <Suspense fallback={null}>
              <AISetting />
            </Suspense>
          }
        />
      </Routes>
    </Provider>
  )
}

export default App