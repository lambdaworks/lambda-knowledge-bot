import { createBrowserRouter } from "react-router-dom";

import IndexPage from "@/pages/chat";
import Widget from "@/pages/widget";

import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Providers>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex flex-col flex-1 bg-muted/50">
            <IndexPage />
          </main>
        </div>
        {/* <TailwindIndicator /> */}
      </Providers>
    ),
  },
  {
    path: "/test-widget",
    element: (
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-col flex-1 items-center">
          <Widget />
        </main>
      </div>
    ),
  },
]);
