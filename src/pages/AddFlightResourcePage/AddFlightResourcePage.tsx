import './AddFlightResourcePage.css'
import { type FC, type FormEvent, useEffect, useMemo, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { type FlightResource, type NewFlightResource, createFlightResource, loadFlightDraft, publishFlightDraft } from '../../entities/FlightResource'
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from '../../shared/config/media'
import { ROUTES } from '../../shared/config/routes'

// Ссылка на выбранный файл, чтобы сразу показать его на странице; старая ссылка освобождается
const useFilePreview = (file?: File) => {
  const url = useMemo(() => file && URL.createObjectURL(file), [file])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}

export const AddFlightResourcePage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const loading = useAppSelector((state) => state.flightResources.loading)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<File>()
  const [video, setVideo] = useState<File>()

  const imagePreview = useFilePreview(image)
  const videoPreview = useFilePreview(video)

  const [draft, setDraft] = useState<FlightResource | null>()
  useEffect(() => {
    let active = true
    if (isAuthenticated) dispatch(loadFlightDraft()).unwrap().then((value) => {
      if (active) setDraft(value)
    }).catch(() => {})
    return () => { active = false }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (draft) {
      dispatch(publishFlightDraft()).unwrap().then(() => navigate(ROUTES.TILES)).catch(() => {})
      return
    }
    const newResource: NewFlightResource = { name, description, unit, price: Number(price) }
    // необязательные файлы отправляем, только если выбраны
    if (image) newResource.image = image
    if (video) newResource.video = video
    dispatch(createFlightResource(newResource))
      .unwrap()
      .then(setDraft)
      .catch(() => {}) // текст ошибки уже в store, его показывает AppLayout
  }

  return (
    <div className="addPage">
      <header className="header">
        <h1>Обслуживание рейса</h1>
        <p className="subtitle">{draft ? 'Черновик услуги' : 'Подготовка черновика'}</p>
      </header>

      {draft !== undefined && <Form className="addForm" onSubmit={handleSubmit}>
        {draft ? <section>
          <h2>{draft.name}</h2><p>{draft.description}</p>
          <p>{draft.price} ₽/{draft.unit}</p><p>Статус — {draft.status}</p>
        </section> : <>
        <img className="addPreview" src={imagePreview || DEFAULT_IMAGE} alt="Изображение услуги" />
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Выбрать изображение</Form.Label>
          <Form.Control
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setImage((event.target as HTMLInputElement).files?.[0])}
          />
        </Form.Group>
        <video
          className="addPreview"
          src={videoPreview || DEFAULT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
        <Form.Group className="mb-3" controlId="video">
          <Form.Label>Выбрать видео</Form.Label>
          <Form.Control
            type="file"
            accept="video/mp4,video/webm"
            onChange={(event) => setVideo((event.target as HTMLInputElement).files?.[0])}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Название</Form.Label>
          <Form.Control
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Описание</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={255}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="unit">
          <Form.Label>Единица измерения</Form.Label>
          <Form.Control
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            maxLength={20}
            placeholder="час"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Цена, ₽</Form.Label>
          <Form.Control
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </Form.Group>
        </>}
        <Button type="submit" className="w-100" disabled={loading}>
          {draft ? 'Опубликовать' : 'Сохранить черновик'}
        </Button>
      </Form>}
    </div>
  )
}
