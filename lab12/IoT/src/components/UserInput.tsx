import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface UserInputProps {
  deviceId?: number;
  onSuccess: () => void;
}

const UserInput: React.FC<UserInputProps> = ({
  deviceId: initialDeviceId,
  onSuccess,
}) => {
  const [deviceId, setDeviceId] = useState<number | "">(initialDeviceId ?? "");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const deviceOptions = Array.from({ length: 17 }, (_, i) => i);

  const handleSubmit = async () => {
    if (
      deviceId === "" ||
      temperature.trim() === "" ||
      pressure.trim() === "" ||
      humidity.trim() === ""
    ) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);
    const presNum = parseFloat(pressure);

    if (isNaN(tempNum) || isNaN(humNum) || isNaN(presNum)) {
      setError("Podaj poprawne wartości liczbowe");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const bodyPayload = {
        air: [
          { id: 1, value: tempNum },
          { id: 2, value: presNum },
          { id: 3, value: humNum },
        ],
      };

      const res = await fetch(`http://localhost:3100/api/data/${deviceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token") || "",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.message || "Błąd dodawania danych");
      } else {
        setTemperature("");
        setHumidity("");
        setPressure("");
        onSuccess();
      }
    } catch (e: any) {
      setError("Błąd sieci: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setDeviceId(value === "" ? "" : Number(value));
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        backgroundColor: "#2e2e2e",
        padding: 3,
        borderRadius: 2,
        color: "white",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Dodaj odczyt do urządzenia
      </Typography>

      <Stack spacing={2}>
        <Select
          value={deviceId === "" ? "" : deviceId.toString()}
          onChange={handleDeviceChange}
          displayEmpty
          sx={{
            backgroundColor: "#444",
            borderRadius: 1,
            color: "white",
            "& .MuiSelect-icon": { color: "white" },
            "& fieldset": { border: "none" },
          }}
          inputProps={{ "aria-label": "Wybierz urządzenie" }}
        >
          <MenuItem value="" disabled>
            Wybierz ID urządzenia
          </MenuItem>
          {deviceOptions.map((id) => (
            <MenuItem key={id} value={id.toString()}>
              Urządzenie {id}
            </MenuItem>
          ))}
        </Select>

        <input
          type="number"
          placeholder="Temperatura (°C)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />
        <input
          type="number"
          placeholder="Wilgotność (%)"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />
        <input
          type="number"
          placeholder="Ciśnienie (hPa)"
          value={pressure}
          onChange={(e) => setPressure(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
            backgroundColor: "#444",
            color: "white",
          }}
        />

        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Dodawanie..." : "Dodaj odczyt"}
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default UserInput;
