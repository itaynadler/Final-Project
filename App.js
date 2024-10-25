import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  if (Platform.OS === 'web') {
    return (
      <BrowserRouter>
        {/* Your web routes */}
      </BrowserRouter>
    );
  } else {
    return (
      <NavigationContainer>
        {/* Your mobile routes */}
      </NavigationContainer>
    );
  }
};

export default App;
