import { useQuery } from "@apollo/client";
import { observer } from "mobx-react-lite";
import { debounce, isEmpty, map } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  List,
  Row,
  Spin,
  Tooltip,
} from "antd";

import { ASSETS } from "../../services";
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

  const onToggleFilters = () => setFiltersExpanded(!filtersExpanded);

  const { loading, data } = useQuery(ASSETS, {
    variables: {
      limit: LIMIT,
      offset: pageNo * LIMIT,
      assetClasses: selectedAssetClasses,
      countries: selectedCountries,
      searchText: searchText,
    },
  });

  useEffect(() => {
    if (data) {
      setAssetsList([...assetsList, ...data?.assets]);
      if (assetsList.length + data?.assets?.length >= data?.assetsCount) {
        setHasMore(false);
      }
    }
  }, [data]);

  const resetList = () => {
    setAssetsList([]);
    setPageNo(0);
  };

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
              <br />
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
