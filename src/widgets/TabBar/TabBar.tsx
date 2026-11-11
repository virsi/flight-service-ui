import './TabBar.css'
import axios from 'axios'
import type { FC } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { resetPriceFilter } from '../../entities/FlightResource'
import { logoutUser } from '../../entities/User'
import { LOGOUT_LABEL, ROUTES, ROUTE_LABELS } from '../../shared/config/routes'

// Нижняя навигационная панель: «Добавление» доступно после входа, крайний пункт — «Вход» у гостя и «Выход» у пользователя
export const TabBar: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const flightResources = useAppSelector((state) => state.flightResources.list)
  const { isAuthenticated, token } = useAppSelector((state) => state.user)

  const isTiles = location.pathname === ROUTES.TILES
  const isFeed = location.pathname.startsWith(ROUTES.FEED)
  const isAdd = location.pathname === ROUTES.ADD
  const isLogin = location.pathname === ROUTES.LOGIN

  // «Лента» открывает первую услугу текущего списка; если список пуст — переход не выполняется
  const goToFeed = () => {
    const firstId = flightResources[0]?.id
    if (firstId) {
      navigate(`${ROUTES.FEED}/${firstId}`)
    }
  }

  // Выход. Как и вход — только axios (без кодогенерации и thunk), состояние в Redux сбрасываем вручную
  const handleLogout = async () => {
    // токен уходит в blacklist на бэкенде; если запрос не прошёл (токен уже истёк), всё равно выходим
    await axios
      .post('/api/users/logout', null, { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => {})
    localStorage.removeItem('token')
    dispatch(logoutUser())
    dispatch(resetPriceFilter()) // при выходе сбрасывается фильтр пользователя
    navigate(ROUTES.TILES)
  }

  return (
    <Navbar fixed="bottom" className="tabbar">
      <Nav className="tabbarNav">
        <Nav.Link className="tab" active={isFeed} onClick={goToFeed}>
          <span className="icon" aria-hidden="true">▶</span>
          <span className="label">{ROUTE_LABELS.FEED}</span>
          <span className="underline" />
        </Nav.Link>
        <Nav.Link
          className="tab"
          active={isAdd}
          disabled={!isAuthenticated}
          onClick={() => navigate(ROUTES.ADD)}
        >
          <span className="icon" aria-hidden="true">+</span>
          <span className="label">{ROUTE_LABELS.ADD}</span>
          <span className="underline" />
        </Nav.Link>
        <Nav.Link className="tab" active={isTiles} onClick={() => navigate(ROUTES.TILES)}>
          <span className="icon" aria-hidden="true">▦</span>
          <span className="label">{ROUTE_LABELS.TILES}</span>
          <span className="underline" />
        </Nav.Link>
        {isAuthenticated ? (
          <Nav.Link className="tab" onClick={handleLogout}>
            <span className="icon" aria-hidden="true">⇤</span>
            <span className="label">{LOGOUT_LABEL}</span>
            <span className="underline" />
          </Nav.Link>
        ) : (
          <Nav.Link className="tab" active={isLogin} onClick={() => navigate(ROUTES.LOGIN)}>
            <span className="icon" aria-hidden="true">⇥</span>
            <span className="label">{ROUTE_LABELS.LOGIN}</span>
            <span className="underline" />
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  )
}
