// Услуга — поля как в JSON-ответе бэкенда (serializer.FlightResource + is_mine / is_liked)
export interface FlightResource {
  id: number
  name: string
  description: string
  status: string
  unit: string
  price: number
  image_url: string
  video_url: string
  formed_at: string | null
  likes_count: number
  is_mine: number // 1 — услуга создана текущим пользователем (в списке)
  is_liked: number // 1 — текущий пользователь лайкнул услугу (в ленте)
}

