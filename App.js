import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

import { createStackNavigator, createSwitchNavigator, createDrawerNavigator } from 'react-navigation';

import { colors } from './assets/general';

import LoginScreen from './views/LoginScreen';
import HomeScreen from './views/HomeScreen';
import ImageScreen from './views/ImageScreen';
import AuthLoadingScreen from './views/AuthLoadingScreen';
import PasswordScreen from './views/PasswordScreen';
import ChatScreen from './views/ChatScreen';



const AuthStack = createStackNavigator(
	{
		SignIn: LoginScreen,
		PasswordRecover: PasswordScreen
	},
	{
		navigationOptions: {
			headerTransparent: true,
		}
	}
);

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
	drawerLabel: 'Nova tarefa'
};

const homeScreen = createStackNavigator({
	HomeScreen: {
		screen: HomeScreen,

	}
});

const chatScreen = createStackNavigator({
	ChatScreen: {
		screen: ChatScreen,
	}
});

chatScreen.navigationOptions = {
	headerTitle: 'Mensagem',
	headerMode: 'screen',
	headerStyle: { backgroundColor: colors.header_primary },
	headerTitleStyle: { color: 'white' },
	drawerLabel: 'Chat'
};

homeScreen.navigationOptions = {
	header: null,
	drawerLabel: 'Início'
};

const AppStack = createDrawerNavigator(
	{
		Home: homeScreen,
		Image: imageScreen,
		Chat: chatScreen,
	},
	{
		navigationOptions: {
			headerTransparent: false,
		},
	}
);


export default createSwitchNavigator(
	{
		AuthLoadingScreen: AuthLoadingScreen,
		Auth: AuthStack,
		App: AppStack,
	},
	{
		navigationOptions: {
			headerTransparent: true,
		}
	}
);