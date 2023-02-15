import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { useMutation, useQuery } from "@apollo/client";
import { get, isEmpty, omit } from "lodash";
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
  CREATE_TRANSACTION,
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
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { LedgerTableStoreProvider, useLedgerTableStore } from "./store";
import { normalizeDate, truncateStringToLength } from "../../utils";
import AssetPickerCard from "../AssetPickerCard";
import AssetPicker from "../AssetPicker";
import TablePagination from "../TablePagination";

const TRANSACTIONS_LIMIT = 15;

const DATE_FORMAT = "MMM DD, YYYY";

function Header({ onCreateTransaction }) {
  const [createTransactionModalVisible, setCreateTransactionModalVisiblity] =
    useState(false);
  const [createTransactionForm] = Form.useForm();
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION);
  const [supplyAsset, setSupplyAsset] = useState({});
  const [receiveAsset, setReceiveAsset] = useState({});

  const onToggleCreateTransactionModal = () => {
    createTransactionForm.resetFields();
    setSupplyAsset({});
    setReceiveAsset({});
    setCreateTransactionModalVisiblity(!createTransactionModalVisible);
  };

  const onSubmitForm = (values) => {
    let variables = {
      supplyAssetId: supplyAsset?.id,
      supplyValue: values.supplyValue,
      receiveAssetId: receiveAsset?.id,
      receiveValue: values.receiveValue,
      transactedAt: values.transactedAt,
    };
    createTransaction({
      variables,
      onCompleted: (data) => {
        if (data && data?.createTransaction?.transaction?.id) {
          onCreateTransaction();
          onToggleCreateTransactionModal();
        }
      },
      onError: (error) => {
        message.error("Unable to create transaction! Please try again later!");
      },
    });
  };

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
            Ledger
          </Typography.Title>
        </Col>
        <Col>
          <Button
            style={{ margin: "10px" }}
            onClick={onToggleCreateTransactionModal}
          >
            Add Transaction
          </Button>
        </Col>
      </Row>
      <Modal
        title="Create New Transaction"
        visible={createTransactionModalVisible}
        okText="Create"
        okButtonProps={{ loading }}
        onOk={() => createTransactionForm.submit()}
        onCancel={onToggleCreateTransactionModal}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          form={createTransactionForm}
          onFinish={onSubmitForm}
        >
          <Form.Item
            label="Supplied Asset"
            name="supplyAsset"
            required
            rules={[
              {
                validator: () => {
                  if (isEmpty(supplyAsset)) {
                    return Promise.reject(
                      new Error("Please choose the supplied asset")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <AssetPicker asset={supplyAsset} setAsset={setSupplyAsset} />
          </Form.Item>
          <Form.Item
            label="Supplied Value"
            name="supplyValue"
            required
            rules={[
              {
                required: true,
                message: "Please provide the supplied value!",
              },
            ]}
          >
            <Input
              type="number"
              suffix={truncateStringToLength(
                supplyAsset && supplyAsset?.ticker,
                10
              )}
              disabled={isEmpty(supplyAsset)}
            />
          </Form.Item>
          <Form.Item
            label="Received Asset"
            name="receiveAsset"
            required
            rules={[
              {
                validator: () => {
                  if (isEmpty(receiveAsset)) {
                    return Promise.reject(
                      new Error("Please choose the received asset")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <AssetPicker asset={receiveAsset} setAsset={setReceiveAsset} />
          </Form.Item>
          <Form.Item
            label="Received Value"
            name="receiveValue"
            required
            rules={[
              {
                required: true,
                message: "Please provide the received value!",
              },
            ]}
          >
            <Input
              type="number"
              suffix={truncateStringToLength(
                receiveAsset && receiveAsset?.ticker,
                10
              )}
              disabled={isEmpty(receiveAsset)}
            />
          </Form.Item>
          <Form.Item
            label="Transacted At"
            name="transactedAt"
            required
            rules={[
              {
                required: true,
                message: "Please selected the transaction date!",
              },
            ]}
          >
            <DatePicker
              format={DATE_FORMAT}
              disabledDate={(current) => current > new Date()}
            />
          </Form.Item>
        </Form>
      </Modal>
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
      <AssetPickerCard
        preselectedAsset={props.value}
        onChange={onChange}
        onCancel={exitFn}
      />
    </Modal>
  );
});

const LedgerTable = observer(() => {
  const [pageNo, setPageNo] = useState(0);
  const { loading, data, refetch, error } = useQuery(
    GET_TRANSACTIONS_PAGINATED,
    {
      fetchPolicy: "no-cache",
      variables: {
        limit: TRANSACTIONS_LIMIT,
        offset: pageNo * TRANSACTIONS_LIMIT,
      },
      notifyOnNetworkStatusChange: true,
    }
  );
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const transactionsTableRef = useRef();
  const ledgerTableStore = useLedgerTableStore();
  const { transactionsOfPage, setTransactions } = ledgerTableStore;

  if (transactionsTableRef.current?.api) {
    if (loading) {
      transactionsTableRef.current.api.showLoadingOverlay();
    } else {
      if (!transactionsOfPage.length) {
        transactionsTableRef.current.api.showNoRowsOverlay();
      } else {
        transactionsTableRef.current.api.hideOverlay();
      }
    }
  }

  useEffect(() => {
    if (!loading) {
      if (error) {
        message.error("Unable to fetch transactions! Please try again later!");
        return;
      } else if (data) {
        setTransactions(data?.transactions);
      }
    }
  }, [loading, data, error]);

  const assetRenderer = (params) => (
    <AssetTag
      ticker={params.value.ticker}
      name={params.value.name}
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
                onError: (error) => {
                  message.error(
                    "Unable to update transaction! Please try again later!"
                  );
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
              onError: (error) => {
                message.error(
                  "Unable to delete tranasction! Please try again later!"
                );
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
        <Header onCreateTransaction={() => refetch()} />
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
        <TablePagination
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
