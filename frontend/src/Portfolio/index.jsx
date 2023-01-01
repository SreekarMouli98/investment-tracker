import { AppHeader, Sidebar } from "./components";
import { observer } from "mobx-react-lite";
import { BrowserRouter } from "react-router-dom";

import { AppStoreProvider } from "./stores/AppStore";

function AppWrapper() {
  return (
    <div>
      <AppStoreProvider>
        <BrowserRouter>
          <Portfolio />
        </BrowserRouter>
      </AppStoreProvider>
    </div>
  );
}

const Portfolio = observer(() => {
  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <AppHeader />
      <Sidebar />
    </div>
  );
});

export default AppWrapper;
