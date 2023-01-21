import { Button, Modal } from "antd";
import { isEmpty } from "lodash";
import { useState } from "react";

import AssetTag from "../AssetTag";
import AssetPickerCard from "../AssetPickerCard";
import "./style.css";

function AssetPicker({ asset, setAsset }) {
  const [modalVisible, setModalVisibility] = useState(false);
  const toggleModal = () => setModalVisibility(!modalVisible);
  const onChange = (newAsset) => {
    setAsset(newAsset);
    toggleModal();
  };
  return (
    <>
      <span onClick={toggleModal} className="asset-picker-tag">
        {isEmpty(asset) ? (
          <Button>Choose Asset</Button>
        ) : (
          <AssetTag
            ticker={asset?.ticker}
            assetClassId={asset?.assetClass?.id}
          />
        )}
      </span>
      <Modal
        visible={modalVisible}
        title="Pick Asset"
        footer={null}
        centered
        width="auto"
        bodyStyle={{
          padding: "0px",
        }}
        onCancel={toggleModal}
      >
        <AssetPickerCard
          preselectedAsset={asset}
          onChange={onChange}
          onCancel={toggleModal}
        />
      </Modal>
    </>
  );
}

export default AssetPicker;
