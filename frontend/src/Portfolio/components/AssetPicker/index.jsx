import { useMutation, useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { debounce, isEmpty, map } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
  Spin,
  Tooltip,
} from "antd";

import { ASSETS, CREATE_ASSET } from "../../services";
import { useAppStore } from "../../stores/AppStore";

import "./style.css";

const LIMIT = 50;

const FilterGroup = ({ groupName, options, selectedList, setSelectedList }) => {
  const isAllSelected = selectedList.length === options.length;
  const isIndeterminate =
    selectedList.length > 0 && selectedList.length < options.length;

  const onToggleSelectAll = () => {
    let _selectedList;
    if (selectedList.length === options.length) {
      _selectedList = [];
    } else {
      _selectedList = map(options, "id");
    }
    setSelectedList(_selectedList);
  };

  const onToggleOption = (option) => {
    let _selectedList;
    if (selectedList.indexOf(option?.id) !== -1) {
      _selectedList = selectedList.filter((item) => item !== option?.id);
    } else {
      _selectedList = [...selectedList, option?.id];
    }
    setSelectedList(_selectedList);
  };

  return (
    <div style={{ padding: "10px" }}>
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
};

function AssetPicker({ selectedAsset, setSelectedAsset }) {
  const appStore = useAppStore();
  const [assetsList, setAssetsList] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedAssetClasses, setSelectedAssetClasses] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [createAssetModalVisible, setCreateAssetModalVisibility] =
    useState(false);
  const [newAssetForm] = Form.useForm();
  const [createAsset, { loading: createAssetLoading, data: createAssetRes }] =
    useMutation(CREATE_ASSET);

  const onToggleFilters = () => setFiltersExpanded(!filtersExpanded);

  const { loading, data, refetch } = useQuery(ASSETS, {
    variables: {
      limit: LIMIT,
      offset: pageNo * LIMIT,
      assetClasses: selectedAssetClasses,
      countries: selectedCountries,
      searchText: searchText,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    /**
     * Set the assets list after receiving the graphql response for GET_ASSETS.
     */
    if (!loading && data) {
      setAssetsList([...assetsList, ...data?.assets]);
      if (assetsList.length + data?.assets?.length >= data?.assetsCount) {
        setHasMore(false);
      }
    }
  }, [loading, data]);

  const onToggleCreateAssetModal = () => {
    newAssetForm.resetFields();
    setCreateAssetModalVisibility(!createAssetModalVisible);
  };

  const resetList = () => {
    setAssetsList([]);
    setPageNo(0);
  };

  useEffect(() => {
    /**
     * Reset & refetch the assets list after receiving the graphql response
     * of CREATE_ASSET.
     */
    if (
      !createAssetLoading &&
      createAssetRes &&
      createAssetRes?.createAsset?.asset
    ) {
      onToggleCreateAssetModal();
      resetList();
      refetch();
    }
  }, [
    createAssetLoading,
    createAssetRes,
    pageNo,
    selectedAssetClasses,
    selectedCountries,
    searchText,
    refetch,
  ]);

  const onSearch = (_searchText) => {
    resetList();
    setSearchText(_searchText);
  };

  const delayedSearch = debounce(onSearch, 500);

  const observer = useRef(null);
  const listEndRef = useCallback(
    (node) => {
      if (loading) return;
      if (!hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPageNo(pageNo + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, pageNo]
  );

  return (
    <Card style={{ width: filtersExpanded ? "600px" : "350px" }}>
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
                  onFinish={(values) => createAsset({ variables: values })}
                >
                  <Form.Item
                    label="Ticker"
                    name="ticker"
                    rules={[
                      {
                        required: true,
                        message: "Please provide a ticker!",
                      },
                    ]}
                  >
                    <Input
                      onInput={(e) =>
                        (e.target.value = e.target.value
                          .toUpperCase()
                          .replace(/[^0-9a-z_-]+/gi, ""))
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please provide a name!",
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
                        message: "Please select the asset class!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      options={(appStore?.assetClasses || []).map(
                        (assetClass) => ({
                          label: assetClass?.name,
                          value: assetClass?.id,
                        })
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
              >
                {assetsList.map((asset, i) => (
                  <List.Item
                    className={
                      selectedAsset?.id === asset?.id
                        ? "asset-picker-list-item asset-picker-list-item-selected"
                        : "asset-picker-list-item"
                    }
                    onClick={() => setSelectedAsset(asset)}
                    key={i}
                  >
                    {asset?.name} ({asset?.ticker})
                  </List.Item>
                ))}
                <div ref={listEndRef}>
                  <div className="asset-picker-list-loader">
                    {loading && <Spin />}
                  </div>
                </div>
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
              options={[...appStore.countries, { id: null, name: "None" }]}
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
          <Button style={{ float: "right" }} disabled={isEmpty(selectedAsset)}>
            Add
          </Button>
          <Button style={{ float: "right" }}>Cancel</Button>
        </Col>
      </Row>
      <Tooltip
        title={filtersExpanded ? "Close Filters" : "More Filters"}
        placement="left"
      >
        <div className="close-filters-btn-wrapper" onClick={onToggleFilters}>
          <div className="close-filters-btn">
            {filtersExpanded ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
          </div>
        </div>
      </Tooltip>
    </Card>
  );
}

export default observer(AssetPicker);
