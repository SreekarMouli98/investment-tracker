import { useEffect } from "react";
import { HttpLink, split, useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { WebSocketLink } from "@apollo/client/link/ws";

import { Ledger } from "./pages";
import { APP_SEED_DATA } from "./services";
import { AppHeader, Sidebar, PageLoading, UnexpectedError } from "./components";
import { AppStoreProvider, useAppStore } from "./stores/AppStore";

const SERVER_PROTOCOL = process.env.REACT_APP_SERVER_PROTOCOL;
const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT;

const httpLink = new HttpLink({
  uri: `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}/graphql/`,
});

const wsLink = new WebSocketLink(
  new SubscriptionClient(`ws://${SERVER_HOST}:${SERVER_PORT}/graphql/`)
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
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
  const { loading, data, error } = useQuery(APP_SEED_DATA);

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
          <Route path="/ledger" element={<Ledger />} />
        </Routes>
      </div>
    </div>
  );
});

export default AppWrapper;
