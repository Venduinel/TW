import * as React from 'react'
import { LineChart } from '@mui/x-charts'

interface DataType {
  temperature: number
  pressure: number
  humidity: number
  deviceId: number
  readingDate: string
}

interface ChartsProps {
  deviceId: number | null
}

const Charts: React.FC<ChartsProps> = ({ deviceId }) => {
  const [data, setData] = React.useState<DataType[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (deviceId === null) return
    setLoading(true)
    setError(null)
    fetch(`http://localhost:3100/api/data/${deviceId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Błąd serwera: ${res.status}`)
        }
        return res.json()
      })
      .then((jsonData: DataType[]) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [deviceId])

  if (!deviceId) return <div>Wybierz urządzenie, aby zobaczyć wykres</div>
  if (loading) return <div>Ładowanie wykresu...</div>
  if (error) return <div>Błąd ładowania wykresu: {error}</div>
  if (data.length === 0) return <div>Brak danych do wykresu</div>

  const sortedData = [...data].sort(
    (a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
  )

  const dates = sortedData.map(d => new Date(d.readingDate))
  const temperatureData = sortedData.map(d => d.temperature)
  const pressureData = sortedData.map(d => d.pressure / 10)
  const humidityData = sortedData.map(d => d.humidity)

  return (
    <LineChart
      width={700}
      height={350}
      series={[
        { data: pressureData, label: 'Pressure /10 (hPa)', color: '#90ee90' },
        { data: humidityData, label: 'Humidity (%)', color: '#87cefa' },
        { data: temperatureData, label: 'Temperature (°C)', color: '#ff00ff' },
      ]}
      xAxis={[
        {
          data: dates,
          scaleType: 'time',
          label: 'Data odczytu',
          labelStyle: { fill: '#fff', fontWeight: 'bold' },
          stroke: '#fff',
          tickLabelStyle: { fill: '#fff', fontSize: 10 },
        },
      ]}
      yAxis={[
        {
          min: 0,
          max: 140,
          label: 'Wartość',
          labelStyle: { fill: '#fff', fontWeight: 'bold' },
          tickLabelStyle: { fill: '#fff' },
          stroke: '#fff',
        },
      ]}
      sx={{ backgroundColor: '#000' }}
      slotProps={{
        legend: {
          labelStyle: { fill: '#fff' },
        },
      }}
    />
  )
}

export default Charts
