import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import IndexPage from '@/pages/chat';
import RootLayout from '@/layout';

const auth0Domain = import.meta.env.VITE_DOMAINE;
const clientId = import.meta.env.VITE_CLIENT_ID
const url = import.meta.env.VITE_FRONT_URL

const App = (): JSX.Element => {

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: `${url}`}}
    >
      <RootLayout>
        <IndexPage />
      </RootLayout>
    </Auth0Provider>
  );
};

export default App;
