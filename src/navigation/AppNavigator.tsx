import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import InvoicesList from '../screens/InvoicesList'
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen'

export type RootStackParamList = {
  InvoicesList: undefined
  InvoiceDetail: { invoiceId: number }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InvoicesList">
        <Stack.Screen
          name="InvoicesList"
          component={InvoicesList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvoiceDetail"
          component={InvoiceDetailScreen}
          // options={{ title: 'Invoice Details' }}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
