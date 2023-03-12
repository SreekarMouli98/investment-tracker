import { useCallback, useEffect, useRef, useState } from 'react';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Tooltip,
} from 'antd';
import { debounce, isEmpty, map } from 'lodash';
import { observer } from 'mobx-react-lite';

import { ASSETS, CREATE_ASSET } from '../../services';
import { useAppStore } from '../../stores/AppStore';

import './style.css';

const LIMIT = 50;

function FilterGroup({ groupName, options, selectedList, setSelectedList }) {
  const isAllSelected = selectedList.length === options.length;
  const isIndeterminate =
    selectedList.length > 0 && selectedList.length < options.length;

  const onToggleSelectAll = () => {
    let newSelectedList;
    if (selectedList.length === options.length) {
      newSelectedList = [];
    } else {
      newSelectedList = map(options, 'id');
    }
    setSelectedList(newSelectedList);
  };

  const onToggleOption = (option) => {
    let newSelectedList;
    if (selectedList.indexOf(option?.id) !== -1) {
      newSelectedList = selectedList.filter((item) => item !== option?.id);
    } else {
      newSelectedList = [...selectedList, option?.id];
    }
    setSelectedList(newSelectedList);
  };

  return (
    <div style={{ padding: '10px' }}>
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={onToggleSelectAll}
      >
        <h2>{groupName}</h2>
      </Checkbox>
      {options.map((option) => (
        <div key={option?.id}>
          <Checkbox
            checked={selectedList.indexOf(option?.id) !== -1}
            onChange={() => onToggleOption(option)}
          >
            {option?.name}
          </Checkbox>
        </div>
      ))}
    </div>
  );
}

const AssetPickerCard = observer(({ preselectedAsset, onChange, onCancel }) => {
  const appStore = useAppStore();
  const [assetsList, setAssetsList] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedAssetClasses, setSelectedAssetClasses] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [createAssetModalVisible, setCreateAssetModalVisibility] =
    useState(false);
  const [newAssetForm] = Form.useForm();
  const [createAsset, { loading: createAssetLoading }] =
    useMutation(CREATE_ASSET);
  const [selectedAsset, setSelectedAsset] = useState(preselectedAsset);

  const onToggleFilters = () => setFiltersExpanded(!filtersExpanded);

  const { loading, data, error, refetch } = useQuery(ASSETS, {
    fetchPolicy: 'no-cache',
    variables: {
      limit: LIMIT,
      offset: pageNo * LIMIT,
      assetClasses: selectedAssetClasses,
      countries: selectedCountries,
      searchText,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    /**
     * Set the assets list after receiving the graphql response for GET_ASSETS.
     */
    if (!loading) {
      if (error) {
        message.error('Unable to load assets! Please try again later!');
      } else if (data) {
        setAssetsList((prevAssetList) => [...prevAssetList, ...data.assets]);
      }
    }
  }, [loading, data, error]);

  useEffect(() => {
    /**
     * Computing whether more assets can be loaded.
     */
    setHasMore(true);
    if (!loading) {
      if (error) {
        setHasMore(false);
      } else if (data) {
        setHasMore(assetsList.length < data?.assetsCount);
      }
    }
  }, [loading, data, error, assetsList]);

  const onToggleCreateAssetModal = () => {
    newAssetForm.resetFields();
    setCreateAssetModalVisibility(!createAssetModalVisible);
  };

  const resetList = () => {
    setAssetsList([]);
    setPageNo(0);
  };

  const onSearch = (_searchText) => {
    resetList();
    setSearchText(_searchText);
  };

  const delayedSearch = debounce(onSearch, 500);

  const scrollObserver = useRef(null);
  const listEndRef = useCallback(
    (node) => {
      if (loading) return;
      if (!hasMore) return;
      if (scrollObserver.current) scrollObserver.current.disconnect();
      scrollObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPageNo(pageNo + 1);
        }
      });
      if (node) scrollObserver.current.observe(node);
    },
    [loading, hasMore, pageNo],
  );

  return (
    <Card style={{ width: filtersExpanded ? '600px' : '350px' }}>
      <Row>
        <Col xs={filtersExpanded ? 12 : 24}>
          <Row>
            <Col xs={24}>
              <Input.Search
                onChange={(event) => delayedSearch(event.target.value)}
              />
            </Col>
            <Col xs={24}>
              <Button
                type="link"
                onClick={onToggleCreateAssetModal}
                className="create-new-asset-btn"
              >
                Create New
              </Button>
              <Modal
                title="Create New Asset"
                visible={createAssetModalVisible}
                okText="Create"
                okButtonProps={{ loading: createAssetLoading }}
                onOk={() => newAssetForm.submit()}
                onCancel={onToggleCreateAssetModal}
              >
                <Form
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  form={newAssetForm}
                  onFinish={(values) =>
                    createAsset({
                      variables: values,
                      onCompleted: (res) => {
                        /**
                         * Reset & refetch the assets list after receiving the graphql response
                         * of CREATE_ASSET.
                         */
                        if (res?.createAsset?.asset) {
                          onToggleCreateAssetModal();
                          resetList();
                          refetch();
                        }
                      },
                      onError: () => {
                        message.error(
                          'Unable to create asset! Please try again later!',
                        );
                      },
                    })
                  }
                >
                  <Form.Item
                    label="Ticker"
                    name="ticker"
                    rules={[
                      {
                        required: true,
                        message: 'Please provide a ticker!',
                      },
                    ]}
                  >
                    <Input
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .toUpperCase()
                          .replace(/[^0-9a-z_-]+/gi, '');
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: 'Please provide a name!',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Asset Class"
                    name="assetClass"
                    rules={[
                      {
                        required: true,
                        message: 'Please select the asset class!',
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      options={(appStore?.assetClasses || []).map(
                        (assetClass) => ({
                          label: assetClass?.name,
                          value: assetClass?.id,
                        }),
                      )}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Country" name="country">
                    <Select
                      showSearch
                      options={(appStore?.countries || []).map((country) => ({
                        label: country?.name,
                        value: country?.id,
                      }))}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Form>
              </Modal>
            </Col>
            <Col xs={24}>
              <List
                size="small"
                bordered
                className="asset-picker-list"
                loading={loading}
                dataSource={assetsList}
                renderItem={(asset) => (
                  <List.Item
                    className={
                      selectedAsset?.id === asset?.id
                        ? 'asset-picker-list-item asset-picker-list-item-selected'
                        : 'asset-picker-list-item'
                    }
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {asset?.name} ({asset?.ticker})
                  </List.Item>
                )}
              >
                {assetsList.length > 0 && (
                  <div ref={listEndRef}>
                    <div className="asset-picker-list-loader">
                      {loading && <Spin />}
                    </div>
                  </div>
                )}
              </List>
            </Col>
          </Row>
        </Col>
        {filtersExpanded && (
          <Col xs={12}>
            <FilterGroup
              groupName="Asset Class"
              options={appStore.assetClasses}
              selectedList={selectedAssetClasses}
              setSelectedList={(list) => {
                resetList();
                setSelectedAssetClasses(list);
              }}
            />
            <FilterGroup
              groupName="Origin"
              options={[...appStore.countries, { id: null, name: 'None' }]}
              selectedList={selectedCountries}
              setSelectedList={(list) => {
                resetList();
                setSelectedCountries(list);
              }}
            />
          </Col>
        )}
        <Col xs={24}>
          <br />
          <Button
            style={{ float: 'right' }}
            disabled={isEmpty(selectedAsset)}
            onClick={() => onChange(selectedAsset)}
            type="primary"
          >
            Select
          </Button>
          <Button style={{ float: 'right' }} onClick={onCancel}>
            Cancel
          </Button>
        </Col>
      </Row>
      <Tooltip
        title={filtersExpanded ? 'Close Filters' : 'More Filters'}
        placement="left"
      >
        <Button
          className="close-filters-btn"
          type="text"
          onClick={onToggleFilters}
          icon={
            filtersExpanded ? <DoubleLeftOutlined /> : <DoubleRightOutlined />
          }
        />
      </Tooltip>
    </Card>
  );
});

export default AssetPickerCard;
