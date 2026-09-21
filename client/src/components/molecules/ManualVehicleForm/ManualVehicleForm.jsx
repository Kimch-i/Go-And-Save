import { useState } from 'react';
import TextInput from '../../atoms/TextInput/TextInput.jsx';
import Select from '../../atoms/Select/Select.jsx';
import Button from '../../atoms/Button/Button.jsx';
import styles from './ManualVehicleForm.module.css';

export default function ManualVehicleForm({ initialName, onSave }) {
  const [nickname, setNickname] = useState(initialName);
  const [fuelType, setFuelType] = useState('gasoline');
  const [kmpl, setKmpl] = useState('');
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const kmplNumber = Number(kmpl);

    const found = {};
    if (!nickname.trim()) found.nickname = 'Give the vehicle a name.';
    if (!(kmplNumber >= 3 && kmplNumber <= 80)) found.kmpl = 'Enter a km/L between 3 and 80.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({ nickname: nickname.trim(), fuelType, kmPerLiter: kmplNumber });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2>Add it yourself</h2>

      <TextInput
        label="Name it"
        id="manual-name"
        value={nickname}
        onChange={setNickname}
        placeholder="Tito’s Adventure"
        error={errors.nickname}
      />

      <div className={styles.grid}>
        <Select label="Fuel" id="manual-fuel" value={fuelType} onChange={setFuelType}>
          <option value="gasoline">Gasoline</option>
          <option value="diesel">Diesel</option>
        </Select>
        <TextInput
          label="km/L in town"
          id="manual-kmpl"
          type="number"
          inputMode="decimal"
          value={kmpl}
          onChange={setKmpl}
          placeholder="12.0"
          error={errors.kmpl}
          autoFocus
        />
      </div>

      <Button type="submit">Save vehicle</Button>
    </form>
  );
}
