import {
  LeftOutlined,
  RightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";
import { Button, Col, Input, Row, Space, Tooltip } from "antd";
import { useEffect, useState } from "react";

function TablePagination({
  rowStart,
  rowEnd,
  totalRows,
  pageNo,
  totalPages,
  setPageNo,
  onPrev,
  onNext,
  onFirst,
  onLast,
}) {
  const [newPageNo, setNewPageNo] = useState(pageNo);

  const onPageChange = (event) => {
    let _pageNo = event.target.value;
    if (_pageNo < 0) _pageNo = 0;
    if (_pageNo > totalPages) _pageNo = totalPages;
    setNewPageNo(_pageNo);
  };

  useEffect(() => {
    setNewPageNo(pageNo);
  }, [pageNo]);

  return (
    <div
      style={{
        width: "1015px",
        height: "50px",
        border: "1px solid grey",
        fontWeight: "bold",
        backgroundColor: "#222628",
      }}
    >
      <Row style={{ height: "100%" }} justify="end" align="middle">
        <Col>
          <Space>
            <span style={{ marginRight: "30px" }}>
              {rowStart} to {rowEnd} of {totalRows}
            </span>
            <Tooltip title="Go to first page">
              <Button
                icon={<VerticalRightOutlined />}
                shape="circle"
                onClick={onFirst}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Go to previous page">
              <Button
                icon={<LeftOutlined />}
                shape="circle"
                onClick={onPrev}
                type="text"
                disabled={pageNo === 1}
              />
            </Tooltip>
            <span>
              Page
              <Input
                style={{
                  width: "50px",
                  margin: "0px 5px",
                  textAlign: "right",
                }}
                value={newPageNo}
                onChange={onPageChange}
                onBlur={() => setPageNo(newPageNo)}
              />
              of {totalPages}
            </span>
            <Tooltip title="Go to next page">
              <Button
                icon={<RightOutlined />}
                shape="circle"
                onClick={onNext}
                type="text"
                disabled={pageNo === totalPages}
              />
            </Tooltip>
            <Tooltip title="Go to last page">
              <Button
                icon={<VerticalLeftOutlined />}
                shape="circle"
                onClick={onLast}
                type="text"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default TablePagination;
