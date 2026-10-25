import { Outlet, useLocation } from 'react-router-dom'
import './PageTransition.css'

function PageTransition() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="page-transition">
      <Outlet />
    </div>
  )
}

export default PageTransition
