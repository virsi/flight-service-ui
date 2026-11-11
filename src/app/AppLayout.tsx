import { type FC } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import { clearError } from '../entities/FlightResource'
import { TabBar } from '../widgets/TabBar/TabBar'
import { useAppDispatch, useAppSelector } from './store'
import './AppLayout.css'

export const AppLayout: FC = () => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.flightResources)

  return (
    <div className="appShell">
      {error && (
        <Alert
          className="appError"
          variant="danger"
          dismissible
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}
      <main className="appContent">
        <Outlet />
      </main>
      <TabBar />
      {/* пока идёт запрос — анимация поверх страницы, кнопки под ней недоступны */}
      {loading && (
        <div className="loadingOverlay">
          <Spinner animation="border" />
        </div>
      )}
    </div>
  )
}
