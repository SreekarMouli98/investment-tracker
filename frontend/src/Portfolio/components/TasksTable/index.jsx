import { useQuery } from "@apollo/client";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import { Alert, Col, message, Row, Tooltip, Typography } from "antd";
import { isEmpty } from "lodash";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

import TablePagination from "../TablePagination";
import { GET_TASKS_PAGINATED } from "../../services";

const TASKS_PAGE_LIMIT = 15;
const DATE_FORMAT = "MMM Do YYYY, h:mm:ss a";

function Header() {
  return (
    <div
      style={{
        width: "1500px",
        border: "1px solid grey",
        backgroundColor: "#222628",
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title style={{ margin: "0px", padding: "10px" }}>
            Past Tasks
          </Typography.Title>
        </Col>
      </Row>
    </div>
  );
}

const TasksTable = observer(({ doRefetch }) => {
  const [pageNo, setPageNo] = useState(0);
  const { loading, data, refetch, error } = useQuery(GET_TASKS_PAGINATED, {
    fetchPolicy: "no-cache",
    variables: {
      limit: TASKS_PAGE_LIMIT,
      offset: pageNo * TASKS_PAGE_LIMIT,
    },
    notifyOnNetworkStatusChange: true,
  });
  const tasksTableRef = useRef();

  if (tasksTableRef.current?.api) {
    if (loading) {
      tasksTableRef.current.api.showLoadingOverlay();
    } else {
      if (!data?.tasks?.length) {
        tasksTableRef.current.api.showNoRowsOverlay();
      } else {
        tasksTableRef.current.api.hideOverlay();
      }
    }
  }

  useEffect(() => {
    if (doRefetch) {
      refetch();
    }
  }, [doRefetch]);

  const dateRenderer = (params) => moment(params.value).format(DATE_FORMAT);

  const metaInfoRenderer = (params) => {
    if (isEmpty(params.value)) {
      return;
    }
    return (
      <Tooltip
        title={
          <div>
            {params.value?.warnings?.length > 0 && (
              <>
                {params.value.warnings.map((warning, i) => (
                  <Alert key={i} message={warning} type="warning" showIcon />
                ))}
              </>
            )}
          </div>
        }
        placement="left"
      >
        <InfoCircleOutlined />
      </Tooltip>
    );
  };

  useEffect(() => {
    if (!loading && error) {
      message.error("Unable to fetch tasks! Please try again!");
    }
  }, [loading, error]);

  return (
    <div style={{ width: "1500px", height: "650px" }}>
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100%", height: "100%" }}
      >
        <Header onCreateTransaction={() => refetch()} />
        <AgGridReact
          ref={tasksTableRef}
          rowData={data?.tasks}
          columnDefs={[
            {
              field: "id",
              headerName: "Task ID",
              flex: 1,
              cellStyle: { textAlign: "center" },
            },
            {
              field: "taskName",
              headerName: "Task Name",
              flex: 2,
            },
            {
              field: "status",
              headerName: "Status",
              flex: 2,
            },
            {
              field: "percentage",
              headerName: "Progress",
              flex: 1,
              type: "rightAligned",
            },
            {
              field: "createdAt",
              headerName: "Created At",
              flex: 2,
              cellRenderer: dateRenderer,
            },
            {
              field: "startedAt",
              headerName: "Started At",
              flex: 2,
              cellRenderer: dateRenderer,
            },
            {
              field: "endedAt",
              headerName: "Ended At",
              flex: 2,
              cellRenderer: dateRenderer,
            },
            {
              field: "metaData",
              headerName: "Meta Info",
              cellRenderer: metaInfoRenderer,
              flex: 1,
              cellStyle: { textAlign: "center" },
            },
          ]}
          isRowSelectable={() => true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
        <TablePagination
          rowStart={pageNo * TASKS_PAGE_LIMIT + 1}
          rowEnd={pageNo * TASKS_PAGE_LIMIT + data?.tasks?.length}
          totalRows={data?.tasksCount}
          pageNo={pageNo + 1}
          setPageNo={(val) => setPageNo(val - 1)}
          totalPages={Math.ceil(data?.tasksCount / TASKS_PAGE_LIMIT)}
          onPrev={() => setPageNo(pageNo - 1)}
          onNext={() => setPageNo(pageNo + 1)}
          onFirst={() => setPageNo(0)}
          onLast={() =>
            setPageNo(Math.ceil(data?.tasksCount / TASKS_PAGE_LIMIT) - 1)
          }
          width="1500px"
        />
      </div>
    </div>
  );
});

export default TasksTable;
