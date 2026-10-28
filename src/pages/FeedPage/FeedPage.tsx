import './FeedPage.css'
import { type FC, useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { type FlightResource, type FlightResourcesOutletContext, getFlightResourceById } from '../../entities/FlightResource'
import { DEFAULT_VIDEO } from '../../shared/config/media'
import { ROUTES } from '../../shared/config/routes'

// Лента: видео услуги на весь экран, поверх — название, описание, цена, лайки и «Далее»
export const FeedPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { flightResources } = useOutletContext<FlightResourcesOutletContext>()

  // услуга из общего списка; если её там нет (прямой заход по ссылке) — запрашиваем по id
  const fromList = flightResources.find((item) => String(item.id) === id)
  // загруженная по id услуга; item: null — услуга не найдена. Пока id не совпал — идёт загрузка
  const [loaded, setLoaded] = useState<{ id: string; item: FlightResource | null }>()
  const pageData = fromList ?? (loaded && loaded.id === id ? loaded.item : undefined)

  // id услуги, у которой раскрыто описание: при смене услуги описание снова свёрнуто
  const [expandedId, setExpandedId] = useState<string>()
  const expanded = expandedId === id

  useEffect(() => {
    if (fromList || !id) return
    getFlightResourceById(Number(id)).then((item) => setLoaded({ id, item }))
  }, [id, fromList])

  // следующая услуга по порядку текущего списка, с последней — снова первая (как next=true в API)
  const handleNext = () => {
    if (!flightResources.length) return
    const currentIndex = flightResources.findIndex((item) => String(item.id) === id)
    const nextItem = flightResources[(currentIndex + 1) % flightResources.length]
    navigate(`${ROUTES.FEED}/${nextItem.id}`)
  }

  if (pageData === undefined) {
    return (
      <div className="feedMessage">
        <Spinner animation="border" />
      </div>
    )
  }

  if (pageData === null) {
    return <div className="feedMessage">Услуга не найдена</div>
  }

  return (
    <div className="feedPage">
      <video
        key={pageData.id}
        className="feed-video"
        src={pageData.video_url || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        onError={(event) => {
          // файл недоступен — подставляем видео по умолчанию (проверка защищает от бесконечного цикла)
          if (!event.currentTarget.src.endsWith(DEFAULT_VIDEO)) {
            event.currentTarget.src = DEFAULT_VIDEO
          }
        }}
      />

      <div className="feed-overlay">
        <header className="feed-header">
          <h1>Обслуживание рейса</h1>
          <p className="subtitle">Рейс SU-123 · 12:30</p>
        </header>

        <div className="feed-content">
          <div className="feed-actions">
            <div className="like-group">
              <Button className="btn-like" disabled title="Лайки доступны после входа" aria-label="Лайк">
                ♥
              </Button>
              <span className="likes-count">{pageData.likes_count}</span>
            </div>
            <Button className="btn-next" onClick={handleNext} title="Далее" aria-label="Далее">
              →
            </Button>
          </div>
          <h2 className="feed-name">{pageData.name}</h2>
          <div className="feed-desc-wrap">
            <p className={expanded ? 'feed-desc expanded' : 'feed-desc'}>{pageData.description}</p>
            <Button variant="link" className="more" onClick={() => setExpandedId(expanded ? undefined : id)}>
              {expanded ? 'Скрыть' : 'Ещё'}
            </Button>
          </div>
          <p className="feed-price">
            {pageData.price} ₽/{pageData.unit}
          </p>
        </div>
      </div>
    </div>
  )
}
