import React from "react";
import ReactDOM from "react-dom/client";

import { RootStore } from "@/store";
import App from "@/App";

const rootStore = new RootStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App rootStore={rootStore} />
  </React.StrictMode>
);
