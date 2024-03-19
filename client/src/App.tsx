import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import { cn } from "@/lib/utils";
import { router } from "@/utils/routes";

import { StoreProvider, RootStore } from "./store";
import "./index.css";

const auth0Domain = import.meta.env.VITE_DOMAIN;
const clientId = import.meta.env.VITE_CLIENT_ID;

const App = ({ rootStore }: { rootStore: RootStore }): JSX.Element => {
  return (
    <StoreProvider value={rootStore}>
      <Auth0Provider
        domain={auth0Domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: `https://${auth0Domain}/api/v2/`,
          scope: "read:current_user update:current_user_metadata",
        }}
      >
        <div className={cn("font-sans antialiased")}>
          <Toaster />
          <RouterProvider router={router} />
        </div>
      </Auth0Provider>
    </StoreProvider>
  );
};

export default App;
