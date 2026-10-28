import type { FlightResource } from '../model/types'
import { FLIGHT_RESOURCES_MOCK } from './mock'

// В ЛР5 данные берутся только из mock. В ЛР6 тела функций заменятся на запросы к /api/flight-resources.

// Список опубликованных услуг, price — максимальная цена (как query price в GET /api/flight-resources)
export const getFlightResources = async (price?: number): Promise<FlightResource[]> => {
  return FLIGHT_RESOURCES_MOCK.filter(
    (item) => item.status === 'опубликован' && (price === undefined || item.price <= price),
  )
}

// Одна опубликованная услуга по id (как GET /api/flight-resources/feed?id=), null — не найдена
export const getFlightResourceById = async (id: number): Promise<FlightResource | null> => {
  return FLIGHT_RESOURCES_MOCK.find((item) => item.id === id && item.status === 'опубликован') ?? null
}
