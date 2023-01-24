import { createContext, useContext } from "react";
import { action, computed, makeObservable, observable } from "mobx";

class AppStore {
  assetClasses = [];
  countries = [];

  constructor() {
    makeObservable(this, {
      assetClasses: observable,
      countries: observable,
      setSeedData: action,
      assetClassesIdMap: computed,
      countriesIdMap: computed,
    });
  }

  setSeedData = (data) => {
    this.assetClasses = data?.assetClasses || [];
    this.countries = data?.countries || [];
  };

  get assetClassesIdMap() {
    let _map = {};
    for (let assetClass of this.assetClasses) {
      _map[assetClass.id] = assetClass;
    }
    return _map;
  }

  getAssetClassById = (id) => this.assetClassesIdMap[id];

  get countriesIdMap() {
    let _map = {};
    for (let country of this.countries) {
      _map[country.id] = country;
    }
    return _map;
  }

  getCountryById = (id) => this.countriesIdMap[id];
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
