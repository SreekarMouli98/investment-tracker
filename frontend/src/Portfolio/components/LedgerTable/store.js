import { createContext, useContext } from "react";
import { action, computed, makeObservable, observable, toJS } from "mobx";

class LedgerTableStore {
  transactions = [];
  modifiedTransactions = {};

  constructor() {
    makeObservable(this, {
      transactions: observable,
      setTransactions: action,
      transactionsIdMap: computed,
      modifiedTransactions: observable,
      modifyTransaction: action,
      revertTransactionModification: action,
      transactionsOfPage: computed,
    });
  }

  setTransactions = (_transactions) => {
    this.transactions = _transactions;
  };

  get transactionsIdMap() {
    let obj = {};
    for (let transaction of this.transactions) {
      obj[transaction.id] = transaction;
    }
    return obj;
  }

  getTransactionById = (transactionId) => this.transactionsIdMap[transactionId];

  get transactionsOfPage() {
    return this.transactions.map((transaction) => {
      if (transaction.id in this.modifiedTransactions) {
        return {
          ...this.modifiedTransactions[transaction.id],
          isModified: true,
        };
      } else {
        return transaction;
      }
    });
  }

  modifyTransaction = (transactionId, updates) => {
    let originalTransaction = toJS(this.getTransactionById(transactionId));
    let modifiedTransaction = this.modifiedTransactions[transactionId];
    if (!modifiedTransaction) {
      modifiedTransaction = originalTransaction;
    }
    modifiedTransaction = {
      ...toJS(modifiedTransaction),
      ...updates,
    };
    if (
      JSON.stringify(modifiedTransaction) ===
      JSON.stringify(originalTransaction)
    ) {
      this.revertTransactionModification(transactionId);
    } else {
      this.modifiedTransactions[transactionId] = modifiedTransaction;
    }
  };

  revertTransactionModification = (transactionId) => {
    delete this.modifiedTransactions[transactionId];
  };
}

const defaultValue = new LedgerTableStore();

const LedgerTableContext = createContext(defaultValue);

export const useLedgerTableStore = () => useContext(LedgerTableContext);

export const LedgerTableStoreProvider = ({ children }) => {
  return (
    <LedgerTableContext.Provider value={defaultValue}>
      {children}
    </LedgerTableContext.Provider>
  );
};
