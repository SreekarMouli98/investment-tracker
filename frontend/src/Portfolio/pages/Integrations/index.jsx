import { useEffect, useState } from 'react';
import {
  CheckOutlined,
  ExclamationCircleOutlined,
  FieldTimeOutlined,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useLazyQuery, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  message,
  Progress,
  Row,
  Select,
  Typography,
  Upload,
} from 'antd';
import { includes } from 'lodash';
import moment from 'moment';

import PageLoading from '../../components/PageLoading';
import TasksTable from '../../components/TasksTable';
import { GET_TASK_BY_ID_OR_LATEST, IMPORT_TRANSACTIONS } from '../../services';

const POLL_INTERVAL = 2000;
const DATE_FORMAT = 'MMM Do YYYY, h:mm:ss a';

function Task({ loading, task }) {
  const getTaskTitle = () => {
    switch (task?.taskName) {
      case 'IMPORT_TRANSACTIONS':
        return 'Importing Transactions...';
      case 'COMPUTE_HOLDINGS':
        return 'Computing Holdings...';
      default:
        return 'Recent Task...';
    }
  };

  const getCardIcon = () => {
    switch (task?.status) {
      case 'COMPLETED':
        return <CheckOutlined />;
      case 'FAILED':
        return <ExclamationCircleOutlined />;
      case 'PENDING':
      case 'IN_PROGRESS':
      default:
        return <LoadingOutlined />;
    }
  };

  const getProgressStatus = () => {
    switch (task?.status) {
      case 'PENDING':
        return 'active';
      case 'IN_PROGRESS':
        return 'normal';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'exception';
      default:
        return 'active';
    }
  };

  const title = getTaskTitle();

  const progressStatus = getProgressStatus();

  return (
    <Card
      title={title}
      style={{ width: '650px', fontStyle: 'italic' }}
      extra={getCardIcon()}
    >
      {loading ? (
        <PageLoading />
      ) : (
        <div>
          <Row>
            <Col span={4}>Task ID</Col>
            <Col span={20}>Progress</Col>
            <Col span={4}>{task?.id}</Col>
            <Col span={20}>
              <Progress percent={task?.percentage} status={progressStatus} />
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={12}>Started At</Col>
            <Col span={12}>{task?.endedAt ? 'Ended At' : ''}</Col>
            <Col span={12}>{moment(task?.createdAt).format(DATE_FORMAT)}</Col>
            <Col span={12}>
              {task?.endedAt ? moment(task.endedAt).format(DATE_FORMAT) : ''}
            </Col>
          </Row>
          <br />
          {task?.metaData?.warnings?.length > 0 && (
            <div>
              {task.metaData.warnings.map((warning) => (
                <>
                  <Alert
                    key={warning}
                    message={warning}
                    type="warning"
                    showIcon
                  />
                  <br />
                </>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ImportTransactions({ getTaskByIdOrLatest, loading, isTaskPending }) {
  const [importTransactions] = useLazyQuery(IMPORT_TRANSACTIONS);
  const [source, setSource] = useState();

  const uploadFiles = (files) => {
    const filesP = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          message.error('Failed to upload file! Please try again!');
          reject();
        };
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(filesP);
  };

  const onFormSubmitted = async (values) => {
    const files = [values?.file?.file];
    if (values?.source === 'Vauld') {
      files.push(values?.secondFile?.file);
    }
    const uploadedFiles = await uploadFiles(files);
    const variables = {
      source: values?.source,
    };
    if (values?.source === 'Vauld') {
      variables.encodedFiles = {
        crypto_exchanges: uploadedFiles[0],
        fiat_exchanges: uploadedFiles[1],
      };
    } else {
      [variables.encodedFiles] = uploadedFiles;
    }
    importTransactions({
      fetchPolicy: 'no-cache',
      variables,
      onCompleted: (data) => {
        const taskId = data?.importTransactions;
        getTaskByIdOrLatest({ taskId });
      },
      onError: () => {
        message.error('Failed to import transactions! Please try again!');
      },
    });
  };

  return (
    <Card title={<Typography.Title>Import Transactions</Typography.Title>}>
      <Form
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 20,
        }}
        onFinish={onFormSubmitted}
        disabled={loading || isTaskPending}
      >
        <Form.Item label="Source" name="source" required>
          <Select
            options={[
              { label: 'Zerodha', value: 'Zerodha' },
              { label: 'INDMoney', value: 'INDMoney' },
              { label: 'Vauld', value: 'Vauld' },
              { label: 'Wazirx', value: 'Wazirx' },
            ]}
            value={source}
            onChange={(value) => setSource(value)}
          />
        </Form.Item>
        {source !== 'Vauld' ? (
          <Form.Item label="File" name="file" required>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Report</Button>
            </Upload>
          </Form.Item>
        ) : (
          <>
            <Form.Item label="File" name="file" required>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>
                  Upload Cryto Exchanges Report
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item label="File" name="secondFile" required>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>
                  Upload Fiat Exchanges Report
                </Button>
              </Upload>
            </Form.Item>
          </>
        )}
        <Form.Item
          wrapperCol={{
            offset: 4,
            span: 20,
          }}
        >
          <Button htmlType="submit" loading={isTaskPending}>
            Import
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

function PastTasks() {
  const [drawerVisible, setDrawerVisibility] = useState(false);

  const toggleTable = () => setDrawerVisibility(!drawerVisible);

  return (
    <div>
      <Button type="link" onClick={toggleTable}>
        <FieldTimeOutlined /> Show past tasks
      </Button>
      <Drawer
        title="Past Tasks"
        visible={drawerVisible}
        placement="right"
        onClose={toggleTable}
        width="90%"
      >
        <TasksTable doRefetch={drawerVisible} />
      </Drawer>
    </div>
  );
}

function Integrations() {
  const {
    data,
    loading,
    error,
    startPolling,
    stopPolling,
    refetch: getTaskByIdOrLatest,
  } = useQuery(GET_TASK_BY_ID_OR_LATEST, {
    fetchPolicy: 'no-cache',
  });

  const isTaskPending = includes(
    ['PENDING', 'IN_PROGRESS'],
    data?.taskByIdOrLatest?.status,
  );

  if (isTaskPending) {
    startPolling(POLL_INTERVAL);
  } else {
    stopPolling();
  }

  useEffect(() => {
    if (!loading && error) {
      message.error('Unable to load task! Please try again!');
    }
  }, [loading, error]);

  return (
    <div
      style={{
        padding: '20px',
      }}
    >
      <Row>
        {data && data?.taskByIdOrLatest && (
          <Col span={24}>
            <Task task={data && data?.taskByIdOrLatest} />
            <Divider />
          </Col>
        )}
      </Row>
      <Row>
        <Col xs={24} lg={12}>
          <ImportTransactions
            getTaskByIdOrLatest={getTaskByIdOrLatest}
            loading={loading}
            isTaskPending={isTaskPending}
          />
        </Col>
      </Row>
      <br />
      <PastTasks />
    </div>
  );
}

export default Integrations;
