import './App.scss';
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider } from '@shopify/polaris';
import Tabs from './Pages/tabs'

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <Tabs />
    </AppProvider>
  );
}

export default App;
