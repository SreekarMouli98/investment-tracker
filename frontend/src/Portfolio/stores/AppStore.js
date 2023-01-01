import { createContext, useContext } from "react";

class AppStore {}

const defaultValue = new AppStore();

const AppStoreContext = createContext(defaultValue);

export const useAppStore = () => useContext(AppStoreContext);

export const AppStoreProvider = ({ children }) => {
  return (
    <AppStoreContext.Provider value={defaultValue}>
      {children}
    </AppStoreContext.Provider>
  );
};
