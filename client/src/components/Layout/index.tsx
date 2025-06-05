import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from '../Sidebar'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto', marginLeft: 0 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout