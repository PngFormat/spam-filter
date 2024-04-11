import React, { useState } from 'react';
import Modal from 'react-modal';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal style={{
            content: {
                width: '400px',
                height: '200px',
                margin: 'auto',
                backgroundColor:"red"
            }
        }}
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="OOOps,you are not authorized!"
        >
            <h2 style={{alignItems:"center"}}>Warning!</h2>
            <p>OOOps,you are not authorized!</p>
            <button onClick={onClose}>Close</button>
        </Modal>
    );
};
export default WarningModal

