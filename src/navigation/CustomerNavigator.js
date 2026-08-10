import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, MapPin, Calendar, Bell, User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import MapScreen from '../screens/customer/MapScreen';
import CategoryScreen from '../screens/customer/CategoryScreen';
import WorkerProfileScreen from '../screens/customer/WorkerProfileScreen';
import BookServiceScreen from '../screens/customer/BookServiceScreen';
import BookingHistoryScreen from '../screens/customer/BookingHistoryScreen';
import BookingDetailScreen from '../screens/customer/BookingDetailScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import ReviewScreen from '../screens/customer/ReviewScreen';
import NotificationScreen from '../screens/customer/NotificationScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomerTabs = () => {
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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Explore Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingHistoryScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="Categories" component={CategoryScreen} />
      <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
      <Stack.Screen name="BookService" component={BookServiceScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
