import moment from "moment";
import {
  CheckOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  message,
  Progress,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import { includes } from "lodash";

import { GET_TASK_BY_ID_OR_LATEST, IMPORT_TRANSACTIONS } from "../../services";
import PageLoading from "../../components/PageLoading";
import { useEffect } from "react";

const POLL_INTERVAL = 2000;

function Task({ loading, task }) {
  const getTaskTitle = () => {
    switch (task?.taskName) {
      case "IMPORT_TRANSACTIONS":
        return "Importing Transactions...";
      default:
        return "Recent Task...";
    }
  };

  const getCardIcon = () => {
    switch (task?.status) {
      case "PENDING":
      case "IN_PROGRESS":
      default:
        return <LoadingOutlined />;
      case "COMPLETED":
        return <CheckOutlined />;
      case "FAILED":
        return <ExclamationCircleOutlined />;
    }
  };

  const getProgressStatus = () => {
    switch (task?.status) {
      case "PENDING":
        return "active";
      case "IN_PROGRESS":
        return "normal";
      case "COMPLETED":
        return "success";
      case "FAILED":
        return "exception";
      default:
        return "active";
    }
  };

  const title = getTaskTitle();

  const progressStatus = getProgressStatus();

  return (
    <Card
      title={title}
      style={{ width: "500px", fontStyle: "italic" }}
      extra={getCardIcon()}
    >
      {loading ? (
        <PageLoading />
      ) : (
        <Row align="middle">
          <Col span={24}>
            <Progress percent={task?.percentage} status={progressStatus} />
          </Col>
          <Col span={24}>
            <Typography>
              Started at{" "}
              {moment(task?.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}
            </Typography>
          </Col>
          {task?.endedAt && (
            <Col span={24}>
              <Typography>
                Ended at{" "}
                {moment(task.endedAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}
              </Typography>
            </Col>
          )}
        </Row>
      )}
    </Card>
  );
}

function Integrations() {
  const [importTransactions] = useLazyQuery(IMPORT_TRANSACTIONS);
  const [
    getTaskByIdOrLatest,
    { data, loading, error, startPolling, stopPolling },
  ] = useLazyQuery(GET_TASK_BY_ID_OR_LATEST);

  const isTaskPending = includes(
    ["PENDING", "IN_PROGRESS"],
    data?.taskByIdOrLatest?.status
  );

  if (isTaskPending) {
    startPolling(POLL_INTERVAL);
  } else {
    stopPolling();
  }

  useEffect(() => {
    getTaskByIdOrLatest({
      fetchPolicy: "no-cache",
    });
  }, []);

  useEffect(() => {
    if (!loading && error) {
      message.error("Unable to load task! Please try again!");
    }
  }, [loading, error]);

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <Row>
        {data && data?.taskByIdOrLatest && (
          <>
            <Col span={24}>
              <Task task={data && data?.taskByIdOrLatest} />
              <Divider />
            </Col>
          </>
        )}
      </Row>
      <Row>
        <Col>
          <Card
            title={<Typography.Title>Import Transactions</Typography.Title>}
          >
            <Form
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              onFinish={(values) => {
                const reader = new FileReader();
                reader.onload = () => {
                  importTransactions({
                    fetchPolicy: "no-cache",
                    variables: {
                      source: values?.source,
                      decodedFile: reader.result,
                    },
                    onCompleted: (data) => {
                      const taskId = data?.importTransactions;
                      getTaskByIdOrLatest({ variables: { taskId } });
                    },
                    onError: () => {
                      message.error("Failed to upload file! Please try again!");
                    },
                  });
                };
                reader.onerror = (error) => {
                  message.error("Failed to upload file! Please try again!");
                };
                reader.readAsDataURL(values?.file?.file);
              }}
              disabled={loading || isTaskPending}
            >
              <Form.Item label="Source" name="source">
                <Select
                  options={[
                    { label: "Zerodha", value: "Zerodha" },
                    { label: "INDMoney", value: "INDMoney" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="File" name="file">
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Upload Report</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <Button htmlType="submit" loading={isTaskPending}>
                  Import
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Integrations;
