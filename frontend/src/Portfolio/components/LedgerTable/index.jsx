import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  CloseOutlined,
  DeleteOutlined,
  PauseOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { AgGridReact } from 'ag-grid-react';
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
} from 'antd';
import { get, isEmpty, omit } from 'lodash';
import { observer } from 'mobx-react-lite';
import moment from 'moment';

import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  GET_TRANSACTIONS_PAGINATED,
  UPDATE_TRANSACTION,
} from '../../services';
import { useAppStore } from '../../stores/AppStore';
import { normalizeDate, truncateStringToLength } from '../../utils';
import AssetPicker from '../AssetPicker';
import AssetPickerCard from '../AssetPickerCard';
import AssetTag from '../AssetTag';
import AssetValue from '../AssetValue';
import TablePagination from '../TablePagination';

import { LedgerTableStoreProvider, useLedgerTableStore } from './store';

const TRANSACTIONS_LIMIT = 15;

const DATE_FORMAT = 'MMM DD, YYYY';

function EqualsToOutlined() {
  return (
    <PauseOutlined
      style={{
        position: 'relative',
        left: '50%',
        transform: 'rotate(90deg) translateY(50%)',
      }}
    />
  );
}

function ConversionRateInput({ value, onChange, ...props }) {
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
}

const Header = observer(({ onCreateTransaction }) => {
  const [createTransactionModalVisible, setCreateTransactionModalVisiblity] =
    useState(false);
  const [createTransactionForm] = Form.useForm();
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION);
  const supplyAsset = Form.useWatch('supplyAsset', createTransactionForm);
  const receiveAsset = Form.useWatch('receiveAsset', createTransactionForm);
  const appStore = useAppStore();
  const { baseAsset } = appStore;

  const onToggleCreateTransactionModal = () => {
    createTransactionForm.resetFields();
    setCreateTransactionModalVisiblity(!createTransactionModalVisible);
  };

  const onSubmitForm = (values) => {
    const variables = {
      supplyAssetId: values.supplyAsset?.id,
      supplyValue: values.supplyValue,
      supplyBaseConvRate: values?.supplyBaseConvRate || '1',
      receiveAssetId: values.receiveAsset?.id,
      receiveValue: values.receiveValue,
      receiveBaseConvRate: values?.receiveBaseConvRate || '1',
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
      onError: () => {
        message.error('Unable to create transaction! Please try again later!');
      },
    });
  };

  return (
    <div
      style={{
        width: '1015px',
        border: '1px solid grey',
        backgroundColor: '#222628',
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title style={{ margin: '0px', padding: '10px' }}>
            Ledger
          </Typography.Title>
        </Col>
        <Col>
          <Button
            style={{ margin: '10px' }}
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
                message: 'Please choose the supplied asset!',
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
                message: 'Please provide the supplied value!',
              },
            ]}
          >
            <Input
              type="number"
              suffix={truncateStringToLength(
                supplyAsset && supplyAsset?.ticker,
                10,
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
                    message: 'Please provide the conversion rate!',
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
                message: 'Please choose the received asset!',
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
                message: 'Please provide the received value!',
              },
            ]}
          >
            <Input
              type="number"
              suffix={truncateStringToLength(
                receiveAsset && receiveAsset?.ticker,
                10,
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
                    message: 'Please provide the conversion rate!',
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
                message: 'Please selected the transaction date!',
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

  const exitFn = () => props.stopEditing();

  const onChange = (date) => {
    exitFnRef.current = exitFn;
    setValue(date);
  };

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
      open
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

  const exitFn = () => props.stopEditing();

  const onChange = (newValue) => {
    exitFnRef.current = exitFn;
    setValue(newValue);
  };

  useEffect(() => {
    if (exitFnRef.current) {
      exitFnRef.current();
    }
  }, [value]);

  return (
    <Modal
      visible
      title="Pick Asset"
      footer={null}
      centered
      width="auto"
      bodyStyle={{
        padding: '0px',
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
      `${isSupply ? 'supply' : 'receive'}Asset`,
      'ticker',
    ]);
    const valueKey = `${isSupply ? 'supply' : 'receive'}Value`;
    const convRateKey = `${isSupply ? 'supply' : 'receive'}BaseConvRate`;
    const valInBaseKey = `${isSupply ? 'supply' : 'receive'}InBase`;
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

    const exitFn = () => props.stopEditing();

    const onChange = (values) => {
      const newValue = parseFloat(values.value);
      const newConvRate = parseFloat(values.convRate) || 1;
      const newValInBase = parseFloat((newValue * newConvRate).toFixed(2));
      exitFnRef.current = exitFn;
      setValue({
        [valueKey]: newValue,
        [convRateKey]: newConvRate,
        [valInBaseKey]: newValInBase,
      });
    };

    useEffect(() => {
      if (exitFnRef.current) {
        exitFnRef.current();
      }
    }, [value]);

    return (
      <Modal
        visible
        title={`Set ${isSupply ? 'Supplied' : 'Received'} Value`}
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
            label={`${isSupply ? 'Supplied' : 'Received'} Value`}
            name="value"
            required
            rules={[
              {
                required: true,
                message: `Please provide the ${
                  isSupply ? 'Supplied' : 'Received'
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
                isSupply ? 'Supplied' : 'Received'
              } Asset Conversion Rate`}
              name="convRate"
              required
              rules={[
                {
                  required: true,
                  message: 'Please provide the conversion rate!',
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
  }),
);

const LedgerTable = observer(() => {
  const [pageNo, setPageNo] = useState(0);
  const { loading, data, refetch, error } = useQuery(
    GET_TRANSACTIONS_PAGINATED,
    {
      fetchPolicy: 'no-cache',
      variables: {
        limit: TRANSACTIONS_LIMIT,
        offset: pageNo * TRANSACTIONS_LIMIT,
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const transactionsTableRef = useRef();
  const ledgerTableStore = useLedgerTableStore();
  const { transactionsOfPage, setTransactions } = ledgerTableStore;

  if (transactionsTableRef.current?.api) {
    if (loading) {
      transactionsTableRef.current.api.showLoadingOverlay();
    } else if (!transactionsOfPage.length) {
      transactionsTableRef.current.api.showNoRowsOverlay();
    } else {
      transactionsTableRef.current.api.hideOverlay();
    }
  }

  useEffect(() => {
    if (!loading) {
      if (error) {
        message.error('Unable to fetch transactions! Please try again later!');
      } else if (data) {
        setTransactions(data?.transactions);
      }
    }
  }, [loading, data, error, setTransactions]);

  const assetRenderer = (params) => (
    <AssetTag
      ticker={params.value.ticker}
      name={params.value.name}
      assetClassId={params.value.assetClass.id}
    />
  );

  const assetValueRendererWrapper = (assetKey) =>
    function assetValueRenderer(params) {
      const { data: assetData, value } = params;
      return (
        <AssetValue
          assetTicker={get(assetData, [`${assetKey}Asset`, 'ticker'])}
          assetClassId={get(assetData, [
            `${assetKey}Asset`,
            'assetClass',
            'id',
          ])}
          countryId={get(assetData, [`${assetKey}Asset`, 'country', 'id'])}
          value={value}
          valueInBase={assetData[`${assetKey}InBase`]}
        />
      );
    };

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
                onCompleted: (res) => {
                  if (res && res?.updateTransaction?.ok) {
                    ledgerTableStore.revertTransactionModification(
                      params.data.id,
                    );
                    refetch();
                  }
                },
                onError: () => {
                  message.error(
                    'Unable to update transaction! Please try again later!',
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
                  display: 'inline-block',
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
                  display: 'inline-block',
                }}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </>
      );
    }
    return (
      <Popconfirm
        placement="bottom"
        title="Are you sure?"
        okText="Yes"
        onConfirm={() =>
          deleteTransaction({
            variables: { transactionId: params.data.id },
            onCompleted: (res) => {
              if (res && res?.deleteTransaction?.ok) {
                ledgerTableStore.revertTransactionModification(params.data.id);
                refetch();
              }
            },
            onError: () => {
              message.error(
                'Unable to delete tranasction! Please try again later!',
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
            style={{ display: 'inline-block' }}
          />
        </Tooltip>
      </Popconfirm>
    );
  };

  const getRowStyle = (params) => {
    if (params.data.isModified) {
      return { backgroundColor: 'rgb(0, 102, 255, 0.2)' };
    }
    return {};
  };

  return (
    <div style={{ width: '1015px', height: '650px' }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: '100%', height: '100%' }}
      >
        <Header onCreateTransaction={() => refetch()} />
        <AgGridReact
          ref={transactionsTableRef}
          rowData={transactionsOfPage}
          getRowStyle={getRowStyle}
          columnDefs={[
            {
              field: 'supplyAsset',
              headerName: 'Supplied Asset',
              cellRenderer: assetRenderer,
              editable: true,
              cellEditor: AssetEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  supplyAsset: omit(params.newValue, ['name', 'country']),
                }),
              flex: 1,
            },
            {
              field: 'supplyValue',
              headerName: 'Supplied Value',
              cellRenderer: assetValueRendererWrapper('supply'),
              type: 'rightAligned',
              editable: true,
              cellEditor: AssetValueEditor,
              cellEditorParams: { isSupply: true },
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(
                  params.data.id,
                  params.newValue,
                ),
              flex: 1,
            },
            {
              field: 'receiveAsset',
              headerName: 'Received Asset',
              cellRenderer: assetRenderer,
              editable: true,
              cellEditor: AssetEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(params.data.id, {
                  receiveAsset: omit(params.newValue, ['name', 'country']),
                }),
              flex: 1,
            },
            {
              field: 'receiveValue',
              headerName: 'Received Value',
              cellRenderer: assetValueRendererWrapper('receive'),
              type: 'rightAligned',
              editable: true,
              cellEditor: AssetValueEditor,
              cellEditorPopup: true,
              valueSetter: (params) =>
                ledgerTableStore.modifyTransaction(
                  params.data.id,
                  params.newValue,
                ),
              flex: 1,
            },
            {
              field: 'transactedAt',
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
              headerName: 'Actions',
              cellRenderer: actionsRenderer,
              flex: 1,
            },
          ]}
          isRowSelectable={() => true}
          rowSelection="multiple"
          suppressRowClickSelection
          rowHeight={75}
        />
        <TablePagination
          rowStart={pageNo * TRANSACTIONS_LIMIT + 1}
          rowEnd={
            data?.transactions?.length
              ? pageNo * TRANSACTIONS_LIMIT + data.transactions.length
              : 0
          }
          totalRows={data?.transactionsCount}
          pageNo={pageNo + 1}
          setPageNo={(val) => setPageNo(val - 1)}
          totalPages={
            data?.transactionsCount
              ? Math.ceil(data.transactionsCount / TRANSACTIONS_LIMIT)
              : 0
          }
          onPrev={() => setPageNo(pageNo - 1)}
          onNext={() => setPageNo(pageNo + 1)}
          onFirst={() => setPageNo(0)}
          onLast={() =>
            setPageNo(
              data?.transactionsCount
                ? Math.ceil(data.transactionsCount / TRANSACTIONS_LIMIT) - 1
                : 0,
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
