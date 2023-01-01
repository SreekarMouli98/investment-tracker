import { createContext, useContext } from "react";
import { action, makeObservable, observable } from "mobx";

class AppStore {
  assetClasses = [];
  countries = [];

  constructor() {
    makeObservable(this, {
      assetClasses: observable,
      countries: observable,
      setSeedData: action,
    });
  }

  setSeedData = (data) => {
    this.assetClasses = data?.assetClasses || [];
    this.countries = data?.countries || [];
  };
}

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
