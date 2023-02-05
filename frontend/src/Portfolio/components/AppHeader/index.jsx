import {
  Badge,
  Button,
  Card,
  Col,
  Layout,
  Popover,
  Progress,
  Row,
  Typography,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";

import "./styles.css";
import { useSubscription } from "@apollo/client";
import { NOTIFICATIONS } from "../../services";
import NoData from "../NoData";

const { Header } = Layout;

function getProgressStatus(notificationStatus) {
  let progressStatus;
  switch (notificationStatus) {
    case "PENDING":
      progressStatus = "active";
      break;
    case "IN-PROGRESS":
      progressStatus = "normal";
      break;
    case "COMPLETED":
      progressStatus = "success";
      break;
    case "FAILED":
      progressStatus = "exception";
      break;
    default:
      progressStatus = "active";
      break;
  }
  return progressStatus;
}

function Notification({ notification }) {
  let message;
  let duration;
  if (notification.endedAt) {
    duration = moment(notification.endedAt).diff(notification.createdAt);
  } else {
    duration = moment().diff(notification.createdAt);
  }
  let durationStr = moment.duration(duration).as("seconds").toFixed(0);
  let content = <></>;
  switch (notification?.taskName) {
    case "IMPORT_TRANSACTIONS":
      message = "Importing Transactions";
      let progressStatus = getProgressStatus(notification?.status);
      content = (
        <>
          <Progress
            percent={notification?.percentage}
            status={progressStatus}
          />
          <Row>
            <Col span>{durationStr} seconds ago</Col>
          </Row>
        </>
      );
      break;
    default:
      message = "Notification";
      break;
  }

  return (
    <Card size="small" title={message} style={{ margin: "10px" }}>
      {content}
    </Card>
  );
}

function Notifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentNotifications, setCurrentNotifications] = useState([]);
  const { data, loading, error } = useSubscription(NOTIFICATIONS);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    if (!loading) {
      if (error) {
      } else if (data) {
        setCurrentNotifications(data?.asyncTasksSubscription?.asyncTasks);
      }
    }
  }, [data, loading, error]);

  return (
    <>
      <Popover
        placement="bottomRight"
        title="Notifications"
        trigger="click"
        content={
          <div
            style={{
              width: "400px",
              height: "400px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {isEmpty(currentNotifications) ? (
              <NoData />
            ) : (
              currentNotifications.map((notification) => (
                <Notification notification={notification} />
              ))
            )}
          </div>
        }
      >
        <Badge count={data?.asyncTasksSubscription?.asyncTasks?.length}>
          <Button
            icon={<BellOutlined style={{ fontSize: "18px" }} />}
            type="text"
            shape="circle"
            onClick={toggleNotifications}
          />
        </Badge>
      </Popover>
    </>
  );
}

function AppHeader() {
  return (
    <>
      <Header className="app-header">
        <Row align="middle" justify="space-between">
          <Col>
            <Typography.Title level={5}>Investment Tracker</Typography.Title>
          </Col>
          <Col>
            <Notifications />
          </Col>
        </Row>
      </Header>
    </>
  );
}

export default AppHeader;
