import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import InvoicesList from '../screens/InvoicesList'

const Stack = createNativeStackNavigator()

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InvoicesList">
        <Stack.Screen
          name="InvoicesList"
          component={InvoicesList}
          options={{ title: 'Invoices' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
