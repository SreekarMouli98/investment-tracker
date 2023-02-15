import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";

import { GET_HOLDINGS_PAGINATED } from "../../services";
import AssetTag from "../AssetTag";
import AssetValue from "../AssetValue";
import { Col, message, Row, Typography } from "antd";
import TablePagination from "../TablePagination";

const HOLDINGS_PAGE_LIMIT = 15;

function Header() {
  return (
    <div
      style={{
        width: "1015px",
        border: "1px solid grey",
        backgroundColor: "#222628",
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title style={{ margin: "0px", padding: "10px" }}>
            Holdings
          </Typography.Title>
        </Col>
      </Row>
    </div>
  );
}

const HoldingsTable = observer(() => {
  const [pageNo, setPageNo] = useState(0);
  const { loading, data, refetch, error } = useQuery(GET_HOLDINGS_PAGINATED, {
    fetchPolicy: "no-cache",
    variables: {
      limit: HOLDINGS_PAGE_LIMIT,
      offset: pageNo * HOLDINGS_PAGE_LIMIT,
    },
    notifyOnNetworkStatusChange: true,
  });
  const holdingsTableRef = useRef();

  if (holdingsTableRef.current?.api) {
    if (loading) {
      holdingsTableRef.current.api.showLoadingOverlay();
    } else {
      if (!data?.holdings?.length) {
        holdingsTableRef.current.api.showNoRowsOverlay();
      } else {
        holdingsTableRef.current.api.hideOverlay();
      }
    }
  }

  const assetRenderer = (params) => (
    <AssetTag
      ticker={params.value.ticker}
      name={params.value.name}
      assetClassId={params.value.assetClass.id}
    />
  );

  const assetValueRenderer = (params) => (
    <AssetValue
      assetClassId={params.data?.asset?.assetClass?.id}
      countryId={params.data?.asset?.country?.id}
      value={params.value}
    />
  );

  const getRowStyle = (params) => {
    if (params.data.isModified) {
      return { backgroundColor: "rgb(0, 102, 255, 0.2)" };
    }
  };

  useEffect(() => {
    if (!loading && error) {
      message.error("Unable to fetch holdings! Please try again!");
    }
  }, [loading, error]);

  return (
    <div style={{ width: "1015px", height: "650px" }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100%", height: "100%" }}
      >
        <Header onCreateTransaction={() => refetch()} />
        <AgGridReact
          ref={holdingsTableRef}
          rowData={data?.holdings}
          getRowStyle={getRowStyle}
          columnDefs={[
            {
              field: "asset",
              headerName: "Asset",
              cellRenderer: assetRenderer,
              flex: 1,
            },
            {
              field: "value",
              headerName: "Value",
              cellRenderer: assetValueRenderer,
              type: "rightAligned",
              flex: 1,
            },
          ]}
          isRowSelectable={() => true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
        <TablePagination
          rowStart={pageNo * HOLDINGS_PAGE_LIMIT + 1}
          rowEnd={pageNo * HOLDINGS_PAGE_LIMIT + data?.holdings?.length}
          totalRows={data?.holdingsCount}
          pageNo={pageNo + 1}
          setPageNo={(val) => setPageNo(val - 1)}
          totalPages={Math.ceil(data?.holdingsCount / HOLDINGS_PAGE_LIMIT)}
          onPrev={() => setPageNo(pageNo - 1)}
          onNext={() => setPageNo(pageNo + 1)}
          onFirst={() => setPageNo(0)}
          onLast={() =>
            setPageNo(Math.ceil(data?.holdingsCount / HOLDINGS_PAGE_LIMIT) - 1)
          }
        />
      </div>
    </div>
  );
});

export default HoldingsTable;
