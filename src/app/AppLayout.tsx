import { type FC, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FLIGHT_RESOURCES_MOCK, type FlightResource } from '../entities/FlightResource'
import { TabBar } from '../widgets/TabBar/TabBar'
import './AppLayout.css'

export const AppLayout: FC = () => {
  // в mock только опубликованные услуги — сразу кладём их в список, чтобы прямой заход на /feed/:id работал
  const [flightResources, setFlightResources] = useState<FlightResource[]>(FLIGHT_RESOURCES_MOCK)
  const [priceFilter, setPriceFilter] = useState(20000)

  return (
    <div className="appShell">
      <main className="appContent">
        <Outlet context={{ flightResources, setFlightResources, priceFilter, setPriceFilter }} />
      </main>
      <TabBar flightResources={flightResources} />
    </div>
  )
}
