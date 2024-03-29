import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { AgGridReact } from 'ag-grid-react';
import { Col, message, Row, Typography } from 'antd';
import { observer } from 'mobx-react-lite';

import { GET_HOLDINGS_PAGINATED } from '../../services';
import { useAppStore } from '../../stores/AppStore';
import AssetTag from '../AssetTag';
import AssetValue from '../AssetValue';
import TablePagination from '../TablePagination';

const HOLDINGS_PAGE_LIMIT = 15;

function Header() {
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
    fetchPolicy: 'no-cache',
    variables: {
      limit: HOLDINGS_PAGE_LIMIT,
      offset: pageNo * HOLDINGS_PAGE_LIMIT,
    },
    notifyOnNetworkStatusChange: true,
  });
  const holdingsTableRef = useRef();
  const appStore = useAppStore();
  const { getAssetClassByName, getCountryByCode } = appStore;

  if (holdingsTableRef.current?.api) {
    if (loading) {
      holdingsTableRef.current.api.showLoadingOverlay();
    } else if (!data?.holdings?.length) {
      holdingsTableRef.current.api.showNoRowsOverlay();
    } else {
      holdingsTableRef.current.api.hideOverlay();
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
      assetClassId={params.assetClassId || params.data?.asset?.assetClass?.id}
      countryId={params.countryId || params.data?.asset?.country?.id}
      value={params.value}
    />
  );

  const getRowStyle = (params) => {
    if (params.data.isModified) {
      return { backgroundColor: 'rgb(0, 102, 255, 0.2)' };
    }
    return {};
  };

  useEffect(() => {
    if (!loading && error) {
      message.error('Unable to fetch holdings! Please try again!');
    }
  }, [loading, error]);

  return (
    <div style={{ width: '1015px', height: '650px' }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: '100%', height: '100%' }}
      >
        <Header onCreateTransaction={() => refetch()} />
        <AgGridReact
          ref={holdingsTableRef}
          rowData={data?.holdings}
          getRowStyle={getRowStyle}
          columnDefs={[
            {
              field: 'asset',
              headerName: 'Asset',
              cellRenderer: assetRenderer,
              flex: 1,
            },
            {
              field: 'value',
              headerName: 'Value',
              cellRenderer: assetValueRenderer,
              type: 'rightAligned',
              flex: 1,
            },
            {
              field: 'averageBuy',
              headerName: 'Average Buy',
              cellRenderer: assetValueRenderer,
              cellRendererParams: {
                assetClassId: getAssetClassByName('Currency')?.id,
                countryId: getCountryByCode('IND')?.id,
              },
              type: 'rightAligned',
              flex: 1,
            },
            {
              field: 'valueInBase',
              headerName: 'Invested Amount',
              cellRenderer: assetValueRenderer,
              cellRendererParams: {
                assetClassId: getAssetClassByName('Currency')?.id,
                countryId: getCountryByCode('IND')?.id,
              },
              type: 'rightAligned',
              flex: 1,
            },
          ]}
          isRowSelectable={() => true}
          rowSelection="multiple"
          suppressRowClickSelection
        />
        <TablePagination
          rowStart={pageNo * HOLDINGS_PAGE_LIMIT + 1}
          rowEnd={
            data?.holdings?.length
              ? pageNo * HOLDINGS_PAGE_LIMIT + data.holdings.length
              : 0
          }
          totalRows={data?.holdingsCount}
          pageNo={pageNo + 1}
          setPageNo={(val) => setPageNo(val - 1)}
          totalPages={
            data?.holdingsCount
              ? Math.ceil(data.holdingsCount / HOLDINGS_PAGE_LIMIT)
              : 0
          }
          onPrev={() => setPageNo(pageNo - 1)}
          onNext={() => setPageNo(pageNo + 1)}
          onFirst={() => setPageNo(0)}
          onLast={() =>
            setPageNo(
              data?.holdingsCount
                ? Math.ceil(data.holdingsCount / HOLDINGS_PAGE_LIMIT) - 1
                : 0,
            )
          }
        />
      </div>
    </div>
  );
});

export default HoldingsTable;
