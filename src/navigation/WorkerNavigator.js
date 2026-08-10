import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Calendar, Clock, UserCheck, Bell } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import WorkerBookingsScreen from '../screens/worker/WorkerBookingsScreen';
import WorkerAvailabilityScreen from '../screens/worker/WorkerAvailabilityScreen';
import WorkerProfileEditScreen from '../screens/worker/WorkerProfileEditScreen';
import NotificationScreen from '../screens/customer/NotificationScreen';
import BookingDetailScreen from '../screens/customer/BookingDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const WorkerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.cardBorder,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={WorkerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="WorkerBookings"
        component={WorkerBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Availability"
        component={WorkerAvailabilityScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="WorkerProfile"
        component={WorkerProfileEditScreen}
        options={{
          tabBarLabel: 'My Rates',
          tabBarIcon: ({ color, size }) => <UserCheck size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const WorkerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkerTabs" component={WorkerTabs} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default WorkerNavigator;
