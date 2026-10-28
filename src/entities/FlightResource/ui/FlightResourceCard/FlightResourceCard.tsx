import './FlightResourceCard.css'
import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import { DEFAULT_IMAGE } from '../../../../shared/config/media'

interface Props {
  name: string
  price: number
  unit: string
  image_url: string
  likes_count: number
  onClick: () => void
}

export const FlightResourceCard: FC<Props> = ({ name, price, unit, image_url, likes_count, onClick }) => (
  <Card className="resourceCard" onClick={onClick}>
    <Card.Img
      className="resourceCardImage"
      variant="top"
      src={image_url || DEFAULT_IMAGE}
      alt={name}
      onError={(event) => {
        // файл недоступен — подставляем изображение по умолчанию (проверка защищает от бесконечного цикла)
        if (!event.currentTarget.src.endsWith(DEFAULT_IMAGE)) {
          event.currentTarget.src = DEFAULT_IMAGE
        }
      }}
    />
    <Card.Body className="resourceCardBody">
      <p className="name">{name}</p>
      <p className="price">
        {price} ₽/{unit}
      </p>
      <span className="likes">♥ {likes_count}</span>
    </Card.Body>
  </Card>
)
