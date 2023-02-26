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
  SaveOutlined,
  PauseOutlined,
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
  Tooltip,
  Typography,
} from "antd";
import { LedgerTableStoreProvider, useLedgerTableStore } from "./store";
import { normalizeDate, truncateStringToLength } from "../../utils";
import AssetPickerCard from "../AssetPickerCard";
import AssetPicker from "../AssetPicker";
import TablePagination from "../TablePagination";
import { useAppStore } from "../../stores/AppStore";

const TRANSACTIONS_LIMIT = 15;

const DATE_FORMAT = "MMM DD, YYYY";

const EqualsToOutlined = () => (
  <PauseOutlined
    style={{
      position: "relative",
      left: "50%",
      transform: "rotate(90deg) translateY(50%)",
    }}
  />
);

const ConversionRateInput = ({ value, onChange, ...props }) => {
  const { sourceTicker, sourceValue, receiveTicker, disableReceiveValue } =
    props;
  return (
    <Row align="middle" justify="center">
      <Col span={10}>
        <Input
          type="number"
          value={sourceValue}
          suffix={sourceTicker}
          disabled
        />
      </Col>
      <Col span={4}>
        <div>
          <EqualsToOutlined />
        </div>
      </Col>
      <Col span={10}>
        <Input
          type="number"
          value={value}
          suffix={receiveTicker}
          onChange={onChange}
          disabled={disableReceiveValue}
        />
      </Col>
    </Row>
  );
};

const Header = observer(({ onCreateTransaction }) => {
  const [createTransactionModalVisible, setCreateTransactionModalVisiblity] =
    useState(false);
  const [createTransactionForm] = Form.useForm();
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION);
  const supplyAsset = Form.useWatch("supplyAsset", createTransactionForm);
  const receiveAsset = Form.useWatch("receiveAsset", createTransactionForm);
  const appStore = useAppStore();
  const { baseAsset } = appStore;

  const onToggleCreateTransactionModal = () => {
    createTransactionForm.resetFields();
    setCreateTransactionModalVisiblity(!createTransactionModalVisible);
  };

  const onSubmitForm = (values) => {
    let variables = {
      supplyAssetId: values.supplyAsset?.id,
      supplyValue: values.supplyValue,
      supplyBaseConvRate: values?.supplyBaseConvRate || "1",
      receiveAssetId: values.receiveAsset?.id,
      receiveValue: values.receiveValue,
      receiveBaseConvRate: values?.receiveBaseConvRate || "1",
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
        width="650px"
      >
        <Form
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          form={createTransactionForm}
          onFinish={onSubmitForm}
        >
          <Form.Item
            label="Supplied Asset"
            name="supplyAsset"
            required
            rules={[
              {
                required: true,
                message: "Please choose the supplied asset!",
              },
            ]}
          >
            <AssetPicker />
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
          {!isEmpty(supplyAsset) &&
            supplyAsset?.ticker !== baseAsset.ticker && (
              <Form.Item
                label="Supplied Asset Conversion Rate"
                name="supplyBaseConvRate"
                required
                rules={[
                  {
                    required: true,
                    message: "Please provide the conversion rate!",
                  },
                ]}
              >
                <ConversionRateInput
                  sourceTicker={supplyAsset?.ticker}
                  sourceValue={1}
                  receiveTicker={baseAsset.ticker}
                  disableReceiveValue={isEmpty(supplyAsset)}
                />
              </Form.Item>
            )}
          <Form.Item
            label="Received Asset"
            name="receiveAsset"
            required
            rules={[
              {
                required: true,
                message: "Please choose the received asset!",
              },
            ]}
          >
            <AssetPicker />
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
          {!isEmpty(receiveAsset) &&
            receiveAsset?.ticker !== baseAsset.ticker && (
              <Form.Item
                label="Received Asset Conversion Rate"
                name="receiveBaseConvRate"
                required
                rules={[
                  {
                    required: true,
                    message: "Please provide the conversion rate!",
                  },
                ]}
              >
                <ConversionRateInput
                  sourceTicker={receiveAsset?.ticker}
                  sourceValue={1}
                  receiveTicker={baseAsset.ticker}
                  disableReceiveValue={isEmpty(supplyAsset)}
                />
              </Form.Item>
            )}
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
});

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

const AssetValueEditor = observer(
  forwardRef((props, ref) => {
    const [value, setValue] = useState(props.value);
    const exitFnRef = useRef(null);
    const [valueForm] = Form.useForm();
    const isSupply = props?.isSupply;
    const assetTicker = get(props.data, [
      `${isSupply ? "supply" : "receive"}Asset`,
      "ticker",
    ]);
    const valueKey = `${isSupply ? "supply" : "receive"}Value`;
    const convRateKey = `${isSupply ? "supply" : "receive"}BaseConvRate`;
    const valInBaseKey = `${isSupply ? "supply" : "receive"}InBase`;
    const initFormValues = {
      value: props.data[valueKey],
      convRate: props.data[convRateKey],
    };
    const appStore = useAppStore();
    const { baseAsset } = appStore;

    useImperativeHandle(ref, () => {
      return {
        getValue() {
          return value;
        },
      };
    });

    const onChange = (values) => {
      let newValue = parseFloat(values.value);
      let newConvRate = parseFloat(values.convRate) || 1;
      let newValInBase = parseFloat((newValue * newConvRate).toFixed(2));
      exitFnRef.current = exitFn;
      setValue({
        [valueKey]: newValue,
        [convRateKey]: newConvRate,
        [valInBaseKey]: newValInBase,
      });
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
        title={`Set ${isSupply ? "Supplied" : "Received"} Value`}
        centered
        width="auto"
        okText="Update"
        onOk={() => valueForm.submit()}
        onCancel={exitFn}
      >
        <Form
          form={valueForm}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          initialValues={initFormValues}
          onFinish={onChange}
        >
          <Form.Item
            label={`${isSupply ? "Supplied" : "Received"} Value`}
            name="value"
            required
            rules={[
              {
                required: true,
                message: `Please provide the ${
                  isSupply ? "Supplied" : "Received"
                } value!`,
              },
            ]}
          >
            <Input
              type="number"
              suffix={truncateStringToLength(assetTicker, 10)}
            />
          </Form.Item>
          {assetTicker !== baseAsset.ticker && (
            <Form.Item
              label={`${
                isSupply ? "Supplied" : "Received"
              } Asset Conversion Rate`}
              name="convRate"
              required
              rules={[
                {
                  required: true,
                  message: "Please provide the conversion rate!",
                },
              ]}
            >
              <ConversionRateInput
                sourceTicker={assetTicker}
                sourceValue={1}
                receiveTicker={baseAsset.ticker}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  })
);

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
        assetTicker={get(params.data, [`${assetKey}Asset`, "ticker"])}
        assetClassId={get(params.data, [
          `${assetKey}Asset`,
          "assetClass",
          "id",
        ])}
        countryId={get(params.data, [`${assetKey}Asset`, "country", "id"])}
        value={params.value}
        valueInBase={params.data[`${assetKey}InBase`]}
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
                  supplyBaseConvRate: params.data.supplyBaseConvRate,
                  receiveAssetId: params.data.receiveAsset.id,
                  receiveValue: params.data.receiveValue,
                  receiveBaseConvRate: params.data.receiveBaseConvRate,
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
              cellRenderer: assetValueRenderer("supply"),
              type: "rightAligned",
              editable: true,
              cellEditor: AssetValueEditor,
              cellEditorParams: { isSupply: true },
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(
                  params.data.id,
                  params.newValue
                ),
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
              cellRenderer: assetValueRenderer("receive"),
              type: "rightAligned",
              editable: true,
              cellEditor: AssetValueEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(
                  params.data.id,
                  params.newValue
                ),
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
          rowHeight={75}
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
