import { createContext, useContext } from "react";
import { action, computed, makeObservable, observable } from "mobx";

class AppStore {
  assetClasses = [];
  countries = [];
  baseAsset = null;

  constructor() {
    makeObservable(this, {
      assetClasses: observable,
      countries: observable,
      baseAsset: observable,
      setSeedData: action,
      assetClassesIdMap: computed,
      assetClassesNamesMap: computed,
      countriesIdMap: computed,
      countriesCodesMap: computed,
    });
  }

  setSeedData = (data) => {
    this.assetClasses = data?.assetClasses || [];
    this.countries = data?.countries || [];
    this.baseAsset = data?.baseAsset || {};
  };

  get assetClassesIdMap() {
    let _map = {};
    for (let assetClass of this.assetClasses) {
      _map[assetClass.id] = assetClass;
    }
    return _map;
  }

  getAssetClassById = (id) => this.assetClassesIdMap[id];

  get assetClassesNamesMap() {
    let _map = {};
    for (let assetClass of this.assetClasses) {
      _map[assetClass.name] = assetClass;
    }
    return _map;
  }

  getAssetClassByName = (name) => this.assetClassesNamesMap[name];

  get countriesIdMap() {
    let _map = {};
    for (let country of this.countries) {
      _map[country.id] = country;
    }
    return _map;
  }

  getCountryById = (id) => this.countriesIdMap[id];

  get countriesCodesMap() {
    let _map = {};
    for (let country of this.countries) {
      _map[country.code] = country;
    }
    return _map;
  }

  getCountryByCode = (code) => this.countriesCodesMap[code];
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
