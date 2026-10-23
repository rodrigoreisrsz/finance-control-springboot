
import { Navigate, Outlet } from 'react-router-dom'

function PrivateRoute() {
  const token = sessionStorage.getItem('jwt')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default PrivateRoute
