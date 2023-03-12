import { createContext, useContext } from 'react';
import { action, computed, makeObservable, observable } from 'mobx';

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
    const res = {};
    this.assetClasses.forEach((assetClass) => {
      res[assetClass.id] = assetClass;
    });
    return res;
  }

  getAssetClassById = (id) => this.assetClassesIdMap[id];

  get assetClassesNamesMap() {
    const res = {};
    this.assetClasses.forEach((assetClass) => {
      res[assetClass.name] = assetClass;
    });
    return res;
  }

  getAssetClassByName = (name) => this.assetClassesNamesMap[name];

  get countriesIdMap() {
    const res = {};
    this.countries.forEach((country) => {
      res[country.id] = country;
    });
    return res;
  }

  getCountryById = (id) => this.countriesIdMap[id];

  get countriesCodesMap() {
    const res = {};
    this.countries.forEach((country) => {
      res[country.code] = country;
    });
    return res;
  }

  getCountryByCode = (code) => this.countriesCodesMap[code];
}

const defaultValue = new AppStore();

const AppStoreContext = createContext(defaultValue);

export const useAppStore = () => useContext(AppStoreContext);

export function AppStoreProvider({ children }) {
  return (
    <AppStoreContext.Provider value={defaultValue}>
      {children}
    </AppStoreContext.Provider>
  );
}
