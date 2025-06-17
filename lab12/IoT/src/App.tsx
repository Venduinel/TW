import { useState, useEffect } from "react";
import CurrentState from "./components/CurrentState";
import Charts from "./components/Charts";
import ChartsMain from "./components/ChartsMain";
import { Typography, Box, Stack, Paper } from "@mui/material";

import UserInput from "./components/UserInput";
import UserDelete from "./components/UserDelete";

interface LatestDataType {
  temperature: number;
  pressure: number;
  humidity: number;
  deviceId: number;
  readingDate: string;
}

function App() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [latestDataList, setLatestDataList] = useState<LatestDataType[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceIds = Array.from({ length: 17 }, (_, i) => i);

  const [deviceAllData, setDeviceAllData] = useState<LatestDataType[]>([]);
  const [loadingAllData, setLoadingAllData] = useState(false);

  const [devicesWarning, setDevicesWarning] = useState<Record<number, boolean>>(
    {}
  );

  function hasBigJump(data: LatestDataType[]): boolean {
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      const tempDiff =
        Math.abs(curr.temperature - prev.temperature) / (prev.temperature || 1);
      const pressureDiff =
        Math.abs(curr.pressure - prev.pressure) / (prev.pressure || 1);
      const humidityDiff =
        Math.abs(curr.humidity - prev.humidity) / (prev.humidity || 1);

      if (tempDiff > 0.2 || pressureDiff > 0.2 || humidityDiff > 0.2) {
        return true;
      }
    }
    return false;
  }

  function getMaxRelativeDifferences(data: LatestDataType[]) {
    let maxTempDiff = 0;
    let maxHumidityDiff = 0;
    let maxPressureDiff = 0;

    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      const tempDiff =
        Math.abs(curr.temperature - prev.temperature) / (prev.temperature || 1);
      const humidityDiff =
        Math.abs(curr.humidity - prev.humidity) / (prev.humidity || 1);
      const pressureDiff =
        Math.abs(curr.pressure - prev.pressure) / (prev.pressure || 1);

      if (tempDiff > maxTempDiff) maxTempDiff = tempDiff;
      if (humidityDiff > maxHumidityDiff) maxHumidityDiff = humidityDiff;
      if (pressureDiff > maxPressureDiff) maxPressureDiff = pressureDiff;
    }

    return {
      temp: (maxTempDiff * 100).toFixed(1),
      humidity: (maxHumidityDiff * 100).toFixed(1),
      pressure: (maxPressureDiff * 100).toFixed(1),
    };
  }

  useEffect(() => {
    const warnings: Record<number, boolean> = {};

    for (const id of deviceIds) {
      const deviceData = deviceAllData.filter((d) => d.deviceId === id);

      if (deviceData.length > 1 && hasBigJump(deviceData)) {
        warnings[id] = true;
      } else {
        warnings[id] = false;
      }
    }

    setDevicesWarning(warnings);
  }, [latestDataList, deviceAllData]);

  useEffect(() => {
    if (selectedDeviceId === null) {
      setDeviceAllData([]);
      return;
    }
    const fetchAllData = async () => {
      setLoadingAllData(true);
      try {
        const res = await fetch(
          `http://localhost:3100/api/data/${selectedDeviceId}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token") || "",
            },
          }
        );
        if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
        const json = await res.json();
        setDeviceAllData(json);
      } catch (e: any) {
        console.error("Błąd pobierania wszystkich danych:", e.message);
        setDeviceAllData([]);
      } finally {
        setLoadingAllData(false);
      }
    };

    fetchAllData();
  }, [selectedDeviceId]);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingLatest(true);
      setError(null);
      try {
        const results: LatestDataType[] = [];
        for (const id of deviceIds) {
          try {
            const res = await fetch(
              `http://localhost:3100/api/data/${id}/latest`,
              {
                headers: {
                  "x-access-token": localStorage.getItem("token") || "",
                },
              }
            );
            if (!res.ok) {
              if (res.status === 404) continue;
              throw new Error(`Błąd HTTP: ${res.status}`);
            }
            const json = await res.json();
            results.push(json);
          } catch (e: any) {
            console.warn(`Błąd pobierania urządzenia ${id}: ${e.message}`);
          }
        }
        setLatestDataList(results);
        if (results.length > 0) {
          setSelectedDeviceId(results[0].deviceId);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatest();
  }, []);

  const selectedLatestData =
    latestDataList.find((d) => d.deviceId === selectedDeviceId) || null;

  const diffs =
    deviceAllData.length > 1 ? getMaxRelativeDifferences(deviceAllData) : null;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Aktualny stan urządzeń
      </Typography>

      {loadingLatest && <Typography>Ładowanie danych...</Typography>}
      {error && <Typography color="error">Błąd: {error}</Typography>}

      <Stack direction="row" spacing={4}>
        <Box sx={{ flex: 1, maxHeight: "50vh", overflowY: "auto" }}>
          <Stack spacing={2}>
            {deviceIds.map((id) => {
              const deviceData = latestDataList.find((d) => d.deviceId === id);
              return (
                <Paper
                  key={id}
                  onClick={() => setSelectedDeviceId(id)}
                  sx={{
                    padding: 2,
                    cursor: "pointer",
                    backgroundColor: devicesWarning[id]
                      ? "#d32f2f"
                      : id === selectedDeviceId
                      ? "#1976d2"
                      : "#333333",
                    color: "white",
                    transition: "background-color 0.3s ease",
                    boxShadow:
                      id === selectedDeviceId
                        ? "0 0 8px 2px rgba(25, 118, 210, 0.7)"
                        : "none",
                    "&:hover": {
                      backgroundColor: devicesWarning[id]
                        ? "#b71c1c"
                        : id === selectedDeviceId
                        ? "#1565c0"
                        : "#444444",
                    },
                  }}
                  elevation={id === selectedDeviceId ? 8 : 1}
                >
                  <Typography variant="h6">Urządzenie {id}</Typography>
                  {deviceData ? (
                    <Typography variant="body2">
                      Temp: {deviceData.temperature} °C, Wilgotność:{" "}
                      {deviceData.humidity}%
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Brak danych
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Box>
        <Box sx={{ flex: 2 }}>
          <Typography variant="h5" gutterBottom>
            Szczegóły urządzenia{" "}
            {selectedDeviceId !== null ? selectedDeviceId : ""}
          </Typography>

          {selectedLatestData ? (
            <>
              <CurrentState data={selectedLatestData} />
              <Box mt={4} sx={{ display: "flex", gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    Wykres
                  </Typography>
                  <Charts deviceId={selectedDeviceId} />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    maxHeight: "400px",
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                    padding: 2,
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Wszystkie odczyty
                  </Typography>
                  {loadingAllData ? (
                    <Typography>Ładowanie danych...</Typography>
                  ) : deviceAllData.length === 0 ? (
                    <Typography>Brak danych</Typography>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {deviceAllData.map((d, idx) => (
                        <li key={idx}>
                          {new Date(d.readingDate).toLocaleString()}: Temp{" "}
                          {d.temperature}°C, Wilgotność {d.humidity}%, Ciśnienie{" "}
                          {d.pressure} hPa
                        </li>
                      ))}

                      {diffs && (
                        <li
                          style={{
                            marginTop: "10px",
                            fontStyle: "italic",
                            color: "#90caf9",
                          }}
                        >
                          Największe różnice: Temp {diffs.temp}%, Wilgotność{" "}
                          {diffs.humidity}%, Ciśnienie {diffs.pressure}%
                        </li>
                      )}
                    </ul>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Typography>Wybierz urządzenie, aby zobaczyć dane</Typography>
          )}
        </Box>
      </Stack>

      <Box mt={4} display="flex" gap={4} justifyContent="space-between">
        <Box flex={1}>
          <UserDelete
            onDeleteSuccess={() => alert("Dane usunięte pomyślnie!")}
          />
        </Box>
        <Box flex={1}>
          <ChartsMain />
        </Box>
        <Box flex={1}>
          <UserInput
            deviceId={9}
            onSuccess={() => alert("Dane dodane pomyślnie!")}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
