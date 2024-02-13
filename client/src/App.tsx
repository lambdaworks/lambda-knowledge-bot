import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "react-hot-toast";

import IndexPage from "@/pages/chat";
import { Providers } from "./components/providers";
import { cn } from "./lib/utils";
import { Header } from "./components/header";

import "@/index.css";

const auth0Domain = import.meta.env.VITE_DOMAINE;
const clientId = import.meta.env.VITE_CLIENT_ID;
const url = import.meta.env.VITE_FRONT_URL;

const App = (): JSX.Element => {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: `${url}` }}
    >
      <div className={cn("font-sans antialiased")}>
        <Toaster />
        <Providers>
          <>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex flex-col flex-1 bg-muted/50">
                <IndexPage />
              </main>
            </div>
            {/* <TailwindIndicator /> */}
          </>
        </Providers>
      </div>
    </Auth0Provider>
  );
};

export default App;
