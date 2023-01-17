import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import moment from "moment";
import {
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";

import { GET_TRANSACTIONS_PAGINATED } from "../../services";
import AssetTag from "../AssetTag";
import AssetValue from "../AssetValue";
import { Button, Col, Input, Row, Space, Tooltip } from "antd";

const TRANSACTIONS_LIMIT = 15;

function Pagination({
  rowStart,
  rowEnd,
  totalRows,
  pageNo,
  totalPages,
  setPageNo,
  onPrev,
  onNext,
  onFirst,
  onLast,
}) {
  const [newPageNo, setNewPageNo] = useState(pageNo);

  const onPageChange = (event) => {
    let _pageNo = event.target.value;
    if (_pageNo < 0) _pageNo = 0;
    if (_pageNo > totalPages) _pageNo = totalPages;
    setNewPageNo(_pageNo);
  };

  useEffect(() => {
    setNewPageNo(pageNo);
  }, [pageNo]);

  return (
    <div
      style={{
        width: "1015px",
        height: "50px",
        border: "1px solid grey",
        fontWeight: "bold",
        backgroundColor: "#222628",
      }}
    >
      <Row style={{ height: "100%" }} justify="end" align="middle">
        <Col>
          <Space>
            <span style={{ marginRight: "30px" }}>
              {rowStart} to {rowEnd} of {totalRows}
            </span>
            <Tooltip title="Go to first page">
              <Button
                icon={<VerticalRightOutlined />}
                shape="circle"
                onClick={onFirst}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Go to previous page">
              <Button
                icon={<LeftOutlined />}
                shape="circle"
                onClick={onPrev}
                type="text"
                disabled={pageNo === 1}
              />
            </Tooltip>
            <span>
              Page
              <Input
                style={{
                  width: "50px",
                  margin: "0px 5px",
                  textAlign: "right",
                }}
                value={newPageNo}
                onChange={onPageChange}
                onBlur={() => setPageNo(newPageNo)}
              />
              of {totalPages}
            </span>
            <Tooltip title="Go to next page">
              <Button
                icon={<RightOutlined />}
                shape="circle"
                onClick={onNext}
                type="text"
                disabled={pageNo === totalPages}
              />
            </Tooltip>
            <Tooltip title="Go to last page">
              <Button
                icon={<VerticalLeftOutlined />}
                shape="circle"
                onClick={onLast}
                type="text"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

function LedgerTable() {
  const [transactions, setTransactions] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const { loading, data } = useQuery(GET_TRANSACTIONS_PAGINATED, {
    variables: {
      limit: TRANSACTIONS_LIMIT,
      offset: pageNo * TRANSACTIONS_LIMIT,
    },
  });
  const transactionsTableRef = useRef();

  useEffect(() => {
    if (loading) {
      if (transactionsTableRef.current && transactionsTableRef.current.api) {
        transactionsTableRef.current.api.showLoadingOverlay();
      }
    }
    if (!loading && data) {
      if (transactionsTableRef.current && transactionsTableRef.current.api) {
        transactionsTableRef.current.api.hideOverlay();
      }
      setTransactions(data?.transactions);
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
    <div style={{ width: "1015px", height: "650px" }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100%", height: "100%" }}
      >
        <AgGridReact
          ref={transactionsTableRef}
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
        <Pagination
          rowStart={pageNo * TRANSACTIONS_LIMIT + 1}
          rowEnd={pageNo * TRANSACTIONS_LIMIT + data?.transactions?.length}
          totalRows={data?.transactionsCount}
          pageNo={pageNo + 1}
          setPageNo={(val) => setPageNo(val - 1)}
          totalPages={Math.ceil(data?.transactionsCount / TRANSACTIONS_LIMIT)}
          onPrev={() => setPageNo(pageNo - 1)}
          onNext={() => setPageNo(pageNo + 1)}
          onFirst={() => setPageNo(0)}
          onLast={() =>
            setPageNo(
              Math.ceil(data?.transactionsCount / TRANSACTIONS_LIMIT) - 1
            )
          }
        />
      </div>
    </div>
  );
}

export default LedgerTable;
