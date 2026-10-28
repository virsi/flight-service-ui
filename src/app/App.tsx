import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from '../shared/config/routes'
import { FlightResourcesPage } from '../pages/FlightResourcesPage/FlightResourcesPage'
import { FeedPage } from '../pages/FeedPage/FeedPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.TILES} element={<FlightResourcesPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          {/* остальные адреса (в т.ч. недоступные пока /add и /login) — на плитку */}
          <Route path="*" element={<Navigate to={ROUTES.TILES} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
