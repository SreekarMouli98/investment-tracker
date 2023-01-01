import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import { APP_SEED_DATA } from "./services";
import { AppHeader, Sidebar } from "./components";
import { AppStoreProvider, useAppStore } from "./stores/AppStore";

const client = new ApolloClient({
  uri: "http://localhost:8080/graphql/",
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
  const { loading, data } = useQuery(APP_SEED_DATA);

  useEffect(() => {
    if (data) {
      appStore.setSeedData(data);
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
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
    </div>
  );
});

export default AppWrapper;
