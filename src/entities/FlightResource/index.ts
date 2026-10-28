// Публичный API слайса «услуга»: другие слои импортируют только отсюда
export type { FlightResource, FlightResourcesOutletContext } from './model/types'
export { getFlightResources, getFlightResourceById } from './api/flightResourcesApi'
export { FLIGHT_RESOURCES_MOCK } from './api/mock'
export { FlightResourceCard } from './ui/FlightResourceCard/FlightResourceCard'
