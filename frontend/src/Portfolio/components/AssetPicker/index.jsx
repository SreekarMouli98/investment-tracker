import { useState } from 'react';
import { Button, Modal } from 'antd';
import { isEmpty } from 'lodash';

import AssetPickerCard from '../AssetPickerCard';
import AssetTag from '../AssetTag';

import './style.css';

function AssetPicker({ value, onChange }) {
  const asset = value;
  const setAsset = onChange;
  const [modalVisible, setModalVisibility] = useState(false);
  const toggleModal = () => setModalVisibility(!modalVisible);
  return (
    <>
      {isEmpty(asset) ? (
        <Button onClick={toggleModal}>Choose Asset</Button>
      ) : (
        <button
          onClick={toggleModal}
          type="button"
          className="asset-picker-tag-btn"
        >
          <AssetTag
            ticker={asset?.ticker}
            name={asset?.name}
            assetClassId={asset?.assetClass?.id}
          />
        </button>
      )}
      <Modal
        visible={modalVisible}
        title="Pick Asset"
        footer={null}
        centered
        width="auto"
        bodyStyle={{
          padding: '0px',
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
