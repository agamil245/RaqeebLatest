import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import { devicesActions } from '../store';
import fetchOrThrow from '../common/util/fetchOrThrow';

const AddDeviceDialog = ({ open, onClose }) => {
  const t = useTranslation();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [uniqueId, setUniqueId] = useState('');

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, uniqueId }),
    });
    const device = await response.json();
    dispatch(devicesActions.update([device]));
    setName('');
    setUniqueId('');
    onClose();
  });

  const handleClose = () => {
    setName('');
    setUniqueId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('sharedDevice')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label={t('sharedName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          margin="dense"
        />
        <TextField
          label={t('deviceIdentifier')}
          value={uniqueId}
          onChange={(e) => setUniqueId(e.target.value)}
          helperText={t('deviceIdentifierHelp')}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('sharedCancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name || !uniqueId}>
          {t('sharedSave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDeviceDialog;
