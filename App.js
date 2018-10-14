import React from 'react';

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

import { createStackNavigator, createSwitchNavigator, HeaderBackButton, createDrawerNavigator, createBottomTabNavigator } from 'react-navigation';

import { colors } from './assets/general';

import LoginScreen from './views/LoginScreen';
import HomeScreen from './views/HomeScreen';
import ImageScreen from './views/ImageScreen';
import AuthLoadingScreen from './views/AuthLoadingScreen';
import PasswordScreen from './views/PasswordScreen';



const AuthStack = createStackNavigator(
	{
		SignIn: LoginScreen,
		PasswordRecover: PasswordScreen
	},
	{
		navigationOptions: {
			headerTransparent: true,
		}
	});

const imageScreen = createStackNavigator({
	ImageScreen: {
		screen: ImageScreen,
	}
});

imageScreen.navigationOptions = {
	headerTitle: 'Nova Tarefa',
	headerMode: 'screen',
	headerStyle: { backgroundColor: colors.header_primary },
	headerTitleStyle: { color: 'white' },
};

const homeScreen = createStackNavigator({
	HomeScreen: {
		screen: HomeScreen,
	}
});

homeScreen.navigationOptions = {
	header: null,
};

const AppStack = createStackNavigator(
	{
		Home: homeScreen,
		Image: imageScreen,
	},
	{
		navigationOptions: {
			headerTransparent: false,
		},
	}
);


export default createSwitchNavigator({
	AuthLoadingScreen: AuthLoadingScreen,
	Auth: AuthStack,
	App: AppStack,
}, {
		navigationOptions: {
			headerTransparent: true,
		}
	});