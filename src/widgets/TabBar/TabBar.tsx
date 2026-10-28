import './TabBar.css'
import type { FC } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../shared/config/routes'
import type { FlightResource } from '../../entities/FlightResource'

interface Props {
  flightResources: FlightResource[]
}

// Нижняя навигационная панель: 4 пункта, «Добавление» и «Вход» пока недоступны
export const TabBar: FC<Props> = ({ flightResources }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isTiles = location.pathname === ROUTES.TILES
  const isFeed = location.pathname.startsWith(ROUTES.FEED)

  const goToTiles = () => navigate(ROUTES.TILES)

  // «Лента» открывает первую услугу текущего списка; если список пуст — переход не выполняется
  const goToFeed = () => {
    const firstId = flightResources[0]?.id
    if (firstId) {
      navigate(`${ROUTES.FEED}/${firstId}`)
    }
  }

  return (
    <Navbar fixed="bottom" className="tabbar">
      <Nav className="tabbarNav">
        <Nav.Link className="tab" active={isFeed} onClick={goToFeed}>
          <span className="icon" aria-hidden="true">▶</span>
          <span className="label">{ROUTE_LABELS.FEED}</span>
          <span className="underline" />
        </Nav.Link>
        <Nav.Link className="tab" disabled>
          <span className="icon" aria-hidden="true">+</span>
          <span className="label">{ROUTE_LABELS.ADD}</span>
          <span className="underline" />
        </Nav.Link>
        <Nav.Link className="tab" active={isTiles} onClick={goToTiles}>
          <span className="icon" aria-hidden="true">▦</span>
          <span className="label">{ROUTE_LABELS.TILES}</span>
          <span className="underline" />
        </Nav.Link>
        <Nav.Link className="tab" disabled>
          <span className="icon" aria-hidden="true">⇥</span>
          <span className="label">{ROUTE_LABELS.LOGIN}</span>
          <span className="underline" />
        </Nav.Link>
      </Nav>
    </Navbar>
  )
}
