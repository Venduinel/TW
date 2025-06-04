import React from 'react'
import { Typography, Box, Divider } from '@mui/material'
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import OpacityIcon from '@mui/icons-material/Opacity'
import { Stack } from '@mui/material'

interface DataType {
  temperature: number
  pressure: number
  humidity: number
  deviceId: number
}

interface CurrentStateProps {
  data: DataType
}

const CurrentState: React.FC<CurrentStateProps> = ({ data }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#2e2e2e',
        color: '#ffffff',
        padding: 3,
        borderRadius: 2,
        maxWidth: 400,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Device No. {data.deviceId}
      </Typography>

      <Divider sx={{ borderColor: '#ffffff', mb: 2 }} />

      <Stack spacing={1}>
        <Typography variant="h6" component="div" display="flex" alignItems="center" gap={1}>
          <DeviceThermostatIcon />
          <span>{data.temperature}</span> &deg;C
        </Typography>
        <Typography variant="h6" component="div" display="flex" alignItems="center" gap={1}>
          <CloudUploadIcon />
          <span>{data.pressure}</span> hPa
        </Typography>
        <Typography variant="h6" component="div" display="flex" alignItems="center" gap={1}>
          <OpacityIcon />
          <span>{data.humidity}</span>%
        </Typography>
      </Stack>
    </Box>
  )
}

export default CurrentState
