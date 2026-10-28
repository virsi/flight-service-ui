import './FlightResourcesPage.css'
import { type FC, useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { type FlightResource, type FlightResourcesOutletContext, FlightResourceCard, getFlightResources } from '../../entities/FlightResource'
import { PriceFilter } from '../../features/PriceFilter/PriceFilter'
import { ROUTES } from '../../shared/config/routes'

// Плитка: фильтр «Цена до» и карточки услуг в 2 столбца
export const FlightResourcesPage: FC = () => {
  const { flightResources, setFlightResources, priceFilter, setPriceFilter } = useOutletContext<FlightResourcesOutletContext>()
  // price — текущее значение слайдера, priceFilter (в AppLayout) — применённый по «Найти» фильтр,
  // он сохраняется при переходе на ленту и обратно
  const [price, setPrice] = useState(priceFilter)
  const [loading, setLoading] = useState(false)
  // начальное значение — уже загруженный общий список, чтобы при возврате с ленты не мигал спиннер
  const [list, setList] = useState<FlightResource[]>(flightResources)
  const navigate = useNavigate()

  // загрузка при открытии страницы и после каждого «Найти» (меняется priceFilter);
  // список кладём и в локальное состояние (отрисовка), и в общий (порядок для «Далее» в ленте)
  useEffect(() => {
    getFlightResources(priceFilter).then((items) => {
      setList(items)
      setFlightResources(items)
      setLoading(false)
    })
  }, [priceFilter, setFlightResources])

  const handleSearch = () => {
    if (price === priceFilter) return // фильтр не изменился — список уже актуален
    setLoading(true)
    setPriceFilter(price)
  }

  const handleCardClick = (id: number) => {
    navigate(`${ROUTES.FEED}/${id}`)
  }

  return (
    <div className="tilesPage">
      <header className="header">
        <h1>Обслуживание рейса</h1>
        <p className="subtitle">Ресурсы обслуживания аэропорта</p>
      </header>

      <PriceFilter
        value={price}
        setValue={setPrice}
        onSubmit={handleSearch}
        loading={loading}
      />

      {loading && (
        <div className="loadingBg">
          <Spinner animation="border" />
        </div>
      )}
      {!loading &&
        (!list.length ? (
          <p className="empty">К сожалению, ничего не найдено</p>
        ) : (
          <Row className="grid g-3">
            {list.map((item) => (
              <Col xs={6} key={item.id}>
                <FlightResourceCard {...item} onClick={() => handleCardClick(item.id)} />
              </Col>
            ))}
          </Row>
        ))}
    </div>
  )
}
