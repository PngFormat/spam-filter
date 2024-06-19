import React from 'react';
import { IconButton } from '@mui/material';
import Stick from '../stickers/Stick.png';
import Star from '../stickers/star.png';

interface Props {
    onStickerSelect: (stickerUrl: string) => void;
}

const StickerPicker: React.FC<Props> = ({ onStickerSelect }) => {
    const stickers = [
        { url: Stick, name: 'Stick' },
        { url: Star, name: 'Star' }
    ];

    return (
        <div>
            {stickers.map((sticker, index) => (
                <IconButton key={index} onClick={() => onStickerSelect(sticker.url)}>
                    <img src={sticker.url} alt={`${sticker.name} Sticker`} width="30" height="30" />
                </IconButton>
            ))}
        </div>
    );
};

export default StickerPicker;