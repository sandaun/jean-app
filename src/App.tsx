import React from 'react'

import Config from 'react-native-config'
import { ApiProvider } from './api'
import AppNavigator from './navigation/AppNavigator'

const App = () => {
  return (
    <ApiProvider url={String(Config.API_URL)} token={String(Config.API_TOKEN)}>
      <AppNavigator />
    </ApiProvider>
  )
}

export default App
