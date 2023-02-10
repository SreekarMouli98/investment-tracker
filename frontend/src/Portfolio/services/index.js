import { gql } from "@apollo/client";

export const APP_SEED_DATA = gql`
  query getAppMetadata {
    assetClasses {
      id
      name
      decimalPlaces
    }
    countries {
      id
      name
      code
    }
  }
`;

export const ASSETS = gql`
  query getAssets(
    $limit: Int
    $offset: Int
    $assetClasses: [String]
    $countries: [String]
    $searchText: String
  ) {
    assets(
      limit: $limit
      offset: $offset
      assetClasses: $assetClasses
      countries: $countries
      searchText: $searchText
    ) {
      id
      name
      ticker
      assetClass {
        id
      }
      country {
        id
      }
    }
    assetsCount(
      assetClasses: $assetClasses
      countries: $countries
      searchText: $searchText
    )
  }
`;

export const CREATE_ASSET = gql`
  mutation createAsset(
    $ticker: String!
    $name: String!
    $assetClass: ID!
    $country: ID
  ) {
    createAsset(
      ticker: $ticker
      name: $name
      assetClass: $assetClass
      country: $country
    ) {
      asset {
        id
      }
    }
  }
`;

export const GET_TRANSACTIONS_PAGINATED = gql`
  query getTransactions($limit: Int, $offset: Int) {
    transactions(limit: $limit, offset: $offset) {
      id
      supplyAsset {
        id
        ticker
        assetClass {
          id
        }
      }
      supplyValue
      receiveAsset {
        id
        ticker
        assetClass {
          id
        }
      }
      receiveValue
      transactedAt
    }
    transactionsCount
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation createTransaction(
    $supplyAssetId: ID!
    $supplyValue: Float!
    $receiveAssetId: ID!
    $receiveValue: Float!
    $transactedAt: DateTime!
  ) {
    createTransaction(
      supplyAssetId: $supplyAssetId
      supplyValue: $supplyValue
      receiveAssetId: $receiveAssetId
      receiveValue: $receiveValue
      transactedAt: $transactedAt
    ) {
      transaction {
        id
      }
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation updateTransaction(
    $transactionId: ID!
    $supplyAssetId: ID!
    $supplyValue: Float!
    $receiveAssetId: ID!
    $receiveValue: Float!
    $transactedAt: DateTime!
  ) {
    updateTransaction(
      transactionId: $transactionId
      supplyAssetId: $supplyAssetId
      supplyValue: $supplyValue
      receiveAssetId: $receiveAssetId
      receiveValue: $receiveValue
      transactedAt: $transactedAt
    ) {
      ok
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation deleteTransaction($transactionId: ID!) {
    deleteTransaction(transactionId: $transactionId) {
      ok
    }
  }
`;

export const IMPORT_TRANSACTIONS = gql`
  query importTransactions($source: String!, $decodedFile: String!) {
    importTransactions(source: $source, decodedFile: $decodedFile)
  }
`;

export const GET_TASK_BY_ID_OR_LATEST = gql`
  query getTaskByIdOrLatest($taskId: ID) {
    taskByIdOrLatest(taskId: $taskId) {
      id
      taskName
      status
      percentage
      createdAt
      startedAt
      endedAt
    }
  }
`;
