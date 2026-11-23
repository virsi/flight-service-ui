// Публичный API слайса «услуга»: другие слои импортируют только отсюда
export type { FlightResource } from './model/types'
export {
  MAX_PRICE,
  type NewFlightResource,
  getFlightResourcesList,
  getFlightResourceFeed,
  likeFlightResource,
  deleteFlightResource,
  createFlightResource,
  loadFlightDraft,
  publishFlightDraft,
  setPriceFilter,
  resetPriceFilter,
  clearError,
  flightResourcesReducer,
} from './model/flightResourcesSlice'
export { FlightResourceCard } from './ui/FlightResourceCard/FlightResourceCard'
