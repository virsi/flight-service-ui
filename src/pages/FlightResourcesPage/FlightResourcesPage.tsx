import './FlightResourcesPage.css'
import { type FC, useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import {
  type FlightResource,
  FlightResourceCard,
  deleteFlightResource,
  getFlightResourcesList,
  setPriceFilter,
} from '../../entities/FlightResource'
import { PriceFilter } from '../../features/PriceFilter/PriceFilter'
import { ROUTES } from '../../shared/config/routes'

// Плитка: фильтр «Цена до» и карточки услуг в 2 столбца
export const FlightResourcesPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { list, priceFilter, loading } = useAppSelector((state) => state.flightResources)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  // удалять можно только свои услуги (is_mine = 1 приходит с токеном)
  const getDeleteHandler = (item: FlightResource) => {
    if (!isAuthenticated || item.is_mine !== 1) return undefined
    return () => dispatch(deleteFlightResource(item.id))
  }

  // загрузка при открытии страницы и при входе / выходе (меняется is_mine у услуг)
  useEffect(() => {
    dispatch(getFlightResourcesList())
  }, [dispatch, isAuthenticated])

  return (
    <div className="tilesPage">
      <header className="header">
        <h1>Обслуживание рейса</h1>
        <p className="subtitle">Ресурсы обслуживания аэропорта</p>
      </header>

      <PriceFilter
        value={priceFilter}
        setValue={(value) => dispatch(setPriceFilter(value))}
        onSubmit={() => dispatch(getFlightResourcesList())}
        loading={loading}
      />

      {!list.length && !loading ? (
        <p className="empty">К сожалению, ничего не найдено</p>
      ) : (
        <Row className="grid g-3">
          {list.map((item) => (
            <Col xs={6} key={item.id}>
              <FlightResourceCard
                {...item}
                onClick={() => navigate(`${ROUTES.FEED}/${item.id}`)}
                onDelete={getDeleteHandler(item)}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
