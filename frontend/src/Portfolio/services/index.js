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
        name
        decimalPlaces
      }
      country {
        id
        name
        code
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
