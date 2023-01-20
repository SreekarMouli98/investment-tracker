import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { useMutation, useQuery } from "@apollo/client";
import { get, omit } from "lodash";
import moment from "moment";
import {
  CloseOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  SaveOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";

import {
  DELETE_TRANSACTION,
  GET_TRANSACTIONS_PAGINATED,
  UPDATE_TRANSACTION,
} from "../../services";
import AssetTag from "../AssetTag";
import AssetValue from "../AssetValue";
import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tooltip,
} from "antd";
import { LedgerTableStoreProvider, useLedgerTableStore } from "./store";
import { normalizeDate } from "../../utils";
import AssetPicker from "../AssetPicker";

const TRANSACTIONS_LIMIT = 15;

const DATE_FORMAT = "MMM DD, YYYY";

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

const DateEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(moment(props.value));
  const refInput = useRef(null);
  const exitFnRef = useRef(null);

  useEffect(() => {
    refInput.current.focus();
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value.format();
      },
    };
  });

  const onChange = (date) => {
    exitFnRef.current = exitFn;
    setValue(date);
  };

  const exitFn = () => props.stopEditing();

  useEffect(() => {
    if (exitFnRef.current) {
      exitFnRef.current();
    }
  }, [value]);

  return (
    <DatePicker
      ref={refInput}
      value={value}
      format={DATE_FORMAT}
      onChange={onChange}
      open={true}
      allowClear={false}
    />
  );
});

const AssetEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value);
  const exitFnRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      },
    };
  });

  const onChange = (newValue) => {
    exitFnRef.current = exitFn;
    setValue(newValue);
  };

  const exitFn = () => props.stopEditing();

  useEffect(() => {
    if (exitFnRef.current) {
      exitFnRef.current();
    }
  }, [value]);

  return (
    <Modal
      visible={true}
      title="Pick Asset"
      footer={null}
      centered
      width="auto"
      bodyStyle={{
        padding: "0px",
      }}
      onCancel={exitFn}
    >
      <AssetPicker
        preselectedAsset={props.value}
        onChange={onChange}
        onCancel={exitFn}
      />
    </Modal>
  );
});

const LedgerTable = observer(() => {
  const [pageNo, setPageNo] = useState(0);
  const { loading, data, refetch } = useQuery(GET_TRANSACTIONS_PAGINATED, {
    variables: {
      limit: TRANSACTIONS_LIMIT,
      offset: pageNo * TRANSACTIONS_LIMIT,
    },
    notifyOnNetworkStatusChange: true,
  });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const transactionsTableRef = useRef();
  const ledgerTableStore = useLedgerTableStore();
  const { transactionsOfPage, setTransactions } = ledgerTableStore;

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

  const dateRenderer = (params) => moment(params.value).format(DATE_FORMAT);

  const actionsRenderer = (params) => {
    if (params.data.isModified) {
      return (
        <>
          <Popconfirm
            placement="bottom"
            title="Are you sure?"
            okText="Yes"
            onConfirm={() =>
              updateTransaction({
                variables: {
                  transactionId: params.data.id,
                  supplyAssetId: params.data.supplyAsset.id,
                  supplyValue: params.data.supplyValue,
                  receiveAssetId: params.data.receiveAsset.id,
                  receiveValue: params.data.receiveValue,
                  transactedAt: params.data.transactedAt,
                },
                onCompleted: (data) => {
                  if (data && data?.updateTransaction?.ok) {
                    ledgerTableStore.revertTransactionModification(
                      params.data.id
                    );
                    refetch();
                  }
                },
              })
            }
          >
            <Tooltip title="Save changes">
              <Button
                icon={<SaveOutlined />}
                shape="circle"
                type="text"
                style={{
                  display: "inline-block",
                }}
              />
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            placement="bottom"
            title="Are you sure?"
            okText="Yes"
            onConfirm={() =>
              ledgerTableStore.revertTransactionModification(params.data.id)
            }
          >
            <Tooltip title="Revert changes">
              <Button
                icon={<CloseOutlined />}
                shape="circle"
                type="text"
                style={{
                  display: "inline-block",
                }}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </>
      );
    } else {
      return (
        <Popconfirm
          placement="bottom"
          title="Are you sure?"
          okText="Yes"
          onConfirm={() =>
            deleteTransaction({
              variables: { transactionId: params.data.id },
              onCompleted: (data) => {
                if (data && data?.deleteTransaction?.ok) {
                  ledgerTableStore.revertTransactionModification(
                    params.data.id
                  );
                  refetch();
                }
              },
            })
          }
        >
          <Tooltip title="Delete transaction">
            <Button
              icon={<DeleteOutlined />}
              shape="circle"
              type="text"
              style={{ display: "inline-block" }}
            />
          </Tooltip>
        </Popconfirm>
      );
    }
  };

  const getRowStyle = (params) => {
    if (params.data.isModified) {
      return { backgroundColor: "rgb(0, 102, 255, 0.2)" };
    }
  };

  return (
    <div style={{ width: "1015px", height: "650px" }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100%", height: "100%" }}
      >
        <AgGridReact
          ref={transactionsTableRef}
          rowData={transactionsOfPage}
          getRowStyle={getRowStyle}
          columnDefs={[
            {
              field: "supplyAsset",
              headerName: "Supplied Asset",
              cellRenderer: assetRenderer,
              editable: true,
              cellEditor: AssetEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  supplyAsset: omit(params.newValue, ["name", "country"]),
                }),
              flex: 1,
            },
            {
              field: "supplyValue",
              headerName: "Supplied Value",
              cellRenderer: assetValueRenderer("supplyAsset"),
              type: "rightAligned",
              editable: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  supplyValue: parseFloat(params.newValue),
                }),
              flex: 1,
            },
            {
              field: "receiveAsset",
              headerName: "Received Asset",
              cellRenderer: assetRenderer,
              editable: true,
              cellEditor: AssetEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  receiveAsset: omit(params.newValue, ["name", "country"]),
                }),
              flex: 1,
            },
            {
              field: "receiveValue",
              headerName: "Received Value",
              cellRenderer: assetValueRenderer("receiveAsset"),
              type: "rightAligned",
              editable: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  receiveValue: parseFloat(params.newValue),
                }),
              flex: 1,
            },
            {
              field: "transactedAt",
              cellRenderer: dateRenderer,
              editable: true,
              cellEditor: DateEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  transactedAt: normalizeDate(params.newValue),
                }),
              flex: 1,
            },
            {
              headerName: "Actions",
              cellRenderer: actionsRenderer,
              flex: 1,
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
});

function LedgerTableWrapper() {
  return (
    <LedgerTableStoreProvider>
      <LedgerTable />
    </LedgerTableStoreProvider>
  );
}

export default LedgerTableWrapper;
