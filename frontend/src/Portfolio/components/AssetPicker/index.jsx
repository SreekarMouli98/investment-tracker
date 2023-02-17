import { Button, Modal } from "antd";
import { isEmpty } from "lodash";
import { useState } from "react";

import AssetTag from "../AssetTag";
import AssetPickerCard from "../AssetPickerCard";
import "./style.css";

function AssetPicker({ value, onChange }) {
  const asset = value;
  const setAsset = onChange;
  const [modalVisible, setModalVisibility] = useState(false);
  const toggleModal = () => setModalVisibility(!modalVisible);
  return (
    <>
      <span onClick={toggleModal} className="asset-picker-tag">
        {isEmpty(asset) ? (
          <Button>Choose Asset</Button>
        ) : (
          <AssetTag
            ticker={asset?.ticker}
            name={asset?.name}
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
          onChange={(newAsset) => {
            setAsset(newAsset);
            toggleModal();
          }}
          onCancel={toggleModal}
        />
      </Modal>
    </>
  );
}

export default AssetPicker;
