import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from '../Sidebar'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Outlet />
    </Box>
  )
}

export default Layout 