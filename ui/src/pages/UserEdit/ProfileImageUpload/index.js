import React, { useState, useContext } from 'react';
import AvatarEditor from 'react-avatar-editor'
import { Button, ButtonRow } from 'components/Forms';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function ProfileImageUpload({ user, update, addAlert }) {
    const { updateProfile } = useContext(AppContext);
    const [disabled, setDisabled] = useState(false);
    const [editor, setEditor] = useState();
    const [scale, setScale] = useState('1');
    const [selected, setSelected] = useState();

    async function save() {
        setDisabled(true);

        const canvas = editor.getImageScaledToCanvas();
        const blob = await new Promise(r => canvas.toBlob(r));
        const formData = new FormData();
        formData.append('image', blob);

        await fetch(`/api/v1/users/${user.username}/profile_image/`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': 'JWT ' + services.auth.getToken()
            }
        });
        sessionStorage.clear();
        const u = await services.users.getById(user.username);
        update(u);
        addAlert('success', 'Profile image saved!');
        updateProfile({image: u.image});
        setDisabled(false);
        setSelected(null);
    }

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setSelected(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <div className={ 'ProfileImageUpload' + (user.image ? '' : ' attention') }>
            <AvatarEditor
                ref={ (ref) => setEditor(ref) }
                image={ selected || user.image }
                width={256}
                height={256}
                border={0}
                borderRadius={999}
                scale={ parseFloat(scale) }
            />
            <input
                type="range"
                min="1"
                max="3"
                value={ scale }
                step="0.01"
                onChange={ (ev) => setScale(ev.target.value) }
                className="slider"
            />
            <ButtonRow>
                <label
                    className="Button button-outline"
                    htmlFor="avatar"
                    children="Choose File"
                    disabled={ disabled }
                />
                <Button
                    type="primary"
                    onClick={ save }
                    children="Upload"
                    disabled={ disabled }
                />
            </ButtonRow>
            <input id="avatar" type="file" accept="image/*" onChange={onSelectFile} />
        </div>
    );
}
