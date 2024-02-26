import React from "react";
import ReactDOM from "react-dom/client";

import { RootStore } from "@/store";

const rootStore = new RootStore();

import App from "@/App";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App rootStore={rootStore} />
  </React.StrictMode>
);
