import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import moment from "moment";

import { GET_TRANSACTIONS } from "../../services";
import AssetTag from "../AssetTag";
import AssetValue from "../AssetValue";

function LedgerTable() {
  const [transactions, setTransactions] = useState([]);
  const { loading, data } = useQuery(GET_TRANSACTIONS);

  useEffect(() => {
    if (!loading && data) {
      setTransactions([...transactions, ...data?.transactions]);
    }
  }, [loading, data]);

  const assetRenderer = (params) => (
    <AssetTag
      ticker={params.value.ticker}
      assetClassId={params.value.assetClass.id}
    />
  );

  const assetValueRenderer = (assetKey) => (params) =>
    (
      <AssetValue
        assetClassId={get(params.data, [assetKey, "assetClass", "id"])}
        countryId={get(params.data, [assetKey, "country", "id"])}
        value={params.value}
      />
    );

  const dateRenderer = (params) => moment(params.value).format("DD MMM, YYYY");

  return (
    <div style={{ width: "1000px", height: "600px" }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100%", height: "100%" }}
      >
        <AgGridReact
          rowData={transactions}
          columnDefs={[
            {
              field: "supplyAsset",
              headerName: "Supplied Asset",
              cellRenderer: assetRenderer,
            },
            {
              field: "supplyValue",
              headerName: "Supplied Value",
              cellRenderer: assetValueRenderer("supplyAsset"),
              type: "rightAligned",
            },
            {
              field: "receiveAsset",
              headerName: "Received Asset",
              cellRenderer: assetRenderer,
            },
            {
              field: "receiveValue",
              headerName: "Received Value",
              cellRenderer: assetValueRenderer("receiveAsset"),
              type: "rightAligned",
            },
            {
              field: "transactedAt",
              cellRenderer: dateRenderer,
            },
          ]}
          isRowSelectable={() => true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
      </div>
    </div>
  );
}

export default LedgerTable;
