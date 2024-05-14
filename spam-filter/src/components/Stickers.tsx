import React from 'react';
import { IconButton } from '@mui/material';
import Stick from '../stickers/Stick.png';
import Star from '../stickers/star.png';

interface Props {
    onStickerSelect: (stickerUrl: string) => void;
}

const StickerPicker: React.FC<Props> = ({ onStickerSelect }) => {
    const stickers = [
        { url: '/static/media/Stick.fc22ebc65d2b3e3721be.png', name: 'Stick' },
        { url: '/static/media/star.ef7d3fdabde9fb172fd5.png', name: 'Star' }
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
