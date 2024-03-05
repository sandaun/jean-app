import React from 'react'

import Config from 'react-native-config'
import { ApiProvider } from './api'
import Dummy from './Dummy'

const App = () => {
  return (
    <ApiProvider url={String(Config.API_URL)} token={String(Config.API_TOKEN)}>
      <Dummy />
    </ApiProvider>
  )
}

export default App
