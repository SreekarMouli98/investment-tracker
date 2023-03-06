import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import { Dashboard, Integrations, Ledger } from "./pages";
import { APP_SEED_DATA } from "./services";
import { AppHeader, Sidebar, PageLoading, UnexpectedError } from "./components";
import { AppStoreProvider, useAppStore } from "./stores/AppStore";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const client = new ApolloClient({
  uri: `${SERVER_URL}/graphql/`,
  cache: new InMemoryCache(),
});

function AppWrapper() {
  return (
    <div>
      <AppStoreProvider>
        <BrowserRouter>
          <ApolloProvider client={client}>
            <Portfolio />
          </ApolloProvider>
        </BrowserRouter>
      </AppStoreProvider>
    </div>
  );
}

const Portfolio = observer(() => {
  const appStore = useAppStore();
  const { loading, data, error } = useQuery(APP_SEED_DATA, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (!loading) {
      if (error) {
        return;
      } else if (data) {
        appStore.setSeedData(data);
      }
    }
  }, [loading, data, error]);

  if (loading) {
    return (
      <div style={{ height: "100vh" }}>
        <PageLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: "100vh" }}>
        <UnexpectedError />
      </div>
    );
  }

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
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: "80px",
          width: "calc(100% - 80px)",
          height: "calc(100% - 70px)",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/integrations" element={<Integrations />} />
        </Routes>
      </div>
    </div>
  );
});

export default AppWrapper;
