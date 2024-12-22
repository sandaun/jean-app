import React from 'react'
import Config from 'react-native-config'
import { ApiProvider } from './api'
import AppNavigator from './navigation/AppNavigator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider
        url={String(Config.API_URL)}
        token={String(Config.API_TOKEN)}
      >
        <AppNavigator />
      </ApiProvider>
    </QueryClientProvider>
  )
}

export default App
