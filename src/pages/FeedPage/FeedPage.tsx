import './FeedPage.css'
import { type FC, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import {
  getFlightResourceFeed,
  getFlightResourcesList,
  likeFlightResource,
} from '../../entities/FlightResource'
import { DEFAULT_VIDEO } from '../../shared/config/media'
import { ROUTES } from '../../shared/config/routes'

// Лента: видео услуги на весь экран, поверх — название, описание, цена, лайки и «Далее»
export const FeedPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const flightResources = useAppSelector((state) => state.flightResources.list)
  const { feedItem, loading } = useAppSelector((state) => state.flightResources)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  // пока в store лежит предыдущая услуга — считаем, что идёт загрузка
  const pageData = feedItem && String(feedItem.id) !== id ? undefined : feedItem

  // id услуги, у которой раскрыто описание: при смене услуги описание снова свёрнуто
  const [expandedId, setExpandedId] = useState<string>()
  const expanded = expandedId === id

  // услуга по id из API (с токеном приходит is_liked); перезапрос и после входа / выхода
  useEffect(() => {
    if (id) dispatch(getFlightResourceFeed(Number(id)))
  }, [dispatch, id, isAuthenticated])

  // прямой заход по ссылке: список для «Далее» ещё не загружен
  useEffect(() => {
    if (!flightResources.length) dispatch(getFlightResourcesList())
  }, [dispatch, flightResources.length])

  // следующая услуга по порядку текущего списка, с последней — снова первая (как next=true в API)
  const handleNext = () => {
    if (!flightResources.length) return
    const currentIndex = flightResources.findIndex((item) => String(item.id) === id)
    const nextItem = flightResources[(currentIndex + 1) % flightResources.length]
    navigate(`${ROUTES.FEED}/${nextItem.id}`)
  }

  // анимацию загрузки показывает AppLayout
  if (pageData === undefined) return null

  if (pageData === null) {
    return <div className="feedMessage">Услуга не найдена</div>
  }

  // лайк ставится, если его ещё нет, и снимается, если уже стоит
  const handleLike = () => {
    dispatch(likeFlightResource({ id: pageData.id, like: pageData.is_liked ? 0 : 1 }))
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
              <Button
                className={pageData.is_liked ? 'btn-like liked' : 'btn-like'}
                disabled={!isAuthenticated || loading}
                title={isAuthenticated ? 'Лайк' : 'Лайки доступны после входа'}
                aria-label="Лайк"
                aria-pressed={Boolean(pageData.is_liked)}
                onClick={handleLike}
              >
                ♥
              </Button>
              <span className="likes-count">{pageData.likes_count}</span>
            </div>
            <Button
              className="btn-next"
              onClick={handleNext}
              disabled={loading}
              title="Далее"
              aria-label="Далее"
            >
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
