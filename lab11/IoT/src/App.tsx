import { useState, useEffect } from 'react'
import CurrentState from './components/CurrentState'
import Charts from './components/Charts'
import { Typography, Box, Stack, Paper } from '@mui/material'

interface LatestDataType {
  temperature: number
  pressure: number
  humidity: number
  deviceId: number
  readingDate: string
}

function App() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)
  const [latestDataList, setLatestDataList] = useState<LatestDataType[]>([])
  const [loadingLatest, setLoadingLatest] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deviceIds = Array.from({ length: 17 }, (_, i) => i)

  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingLatest(true)
      setError(null)
      try {
        const results: LatestDataType[] = []
        for (const id of deviceIds) {
          try {
            const res = await fetch(`http://localhost:3100/api/data/${id}/latest`)
            if (!res.ok) {
              if (res.status === 404) continue
              throw new Error(`Błąd HTTP: ${res.status}`)
            }
            const json = await res.json()
            results.push(json)
          } catch (e: any) {
            console.warn(`Błąd pobierania urządzenia ${id}: ${e.message}`)
          }
        }
        setLatestDataList(results)
        if (results.length > 0) {
          setSelectedDeviceId(results[0].deviceId)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoadingLatest(false)
      }
    }

    fetchLatest()
  }, [])

  const selectedLatestData = latestDataList.find((d) => d.deviceId === selectedDeviceId) || null

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Aktualny stan urządzeń
      </Typography>

      {loadingLatest && <Typography>Ładowanie danych...</Typography>}
      {error && <Typography color="error">Błąd: {error}</Typography>}

      <Stack direction="row" spacing={4}>
        <Box sx={{ flex: 1, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack spacing={2}>
            {deviceIds.map((id) => {
              const deviceData = latestDataList.find((d) => d.deviceId === id)
              return (
                <Paper
                  key={id}
                  onClick={() => setSelectedDeviceId(id)}
                  sx={{
                    padding: 2,
                    cursor: 'pointer',
                    backgroundColor: id === selectedDeviceId ? '#1976d2' : '#2e2e2e',
                    color: 'white',
                    '&:hover': { backgroundColor: '#1565c0' },
                  }}
                  elevation={id === selectedDeviceId ? 8 : 1}
                >
                  <Typography variant="h6">Urządzenie {id}</Typography>
                  {deviceData ? (
                    <Typography variant="body2">
                      Temp: {deviceData.temperature} °C, Wilgotność: {deviceData.humidity}%
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Brak danych
                    </Typography>
                  )}
                </Paper>
              )
            })}
          </Stack>
        </Box>
        <Box sx={{ flex: 2 }}>
          <Typography variant="h5" gutterBottom>
            Szczegóły urządzenia {selectedDeviceId !== null ? selectedDeviceId : ''}
          </Typography>

          {selectedLatestData ? (
            <>
              <CurrentState data={selectedLatestData} />
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Wykres
                </Typography>
                <Charts deviceId={selectedDeviceId} />
              </Box>
            </>
          ) : (
            <Typography>Wybierz urządzenie, aby zobaczyć dane</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

export default App
