import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from '../shared/config/routes'
import { FlightResourcesPage } from '../pages/FlightResourcesPage/FlightResourcesPage'
import { FeedPage } from '../pages/FeedPage/FeedPage'
import { LoginPage } from '../pages/LoginPage/LoginPage'
import { AddFlightResourcePage } from '../pages/AddFlightResourcePage/AddFlightResourcePage'

function App() {
  const Router = import.meta.env.MODE === 'pages' ? HashRouter : BrowserRouter
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.TILES} element={<FlightResourcesPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.ADD} element={<AddFlightResourcePage />} />
          <Route path={ROUTES.LOGIN} element={import.meta.env.MODE === 'pages' ? <Navigate to="/" replace /> : <LoginPage />} />
          {/* остальные адреса — на плитку */}
          <Route path="*" element={<Navigate to={ROUTES.TILES} replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
