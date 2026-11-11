import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { flightResourcesReducer } from '../entities/FlightResource'
import { userReducer } from '../entities/User'

// Глобальное хранилище: услуги (список, лента, фильтр, загрузка) и пользователь (гость / авторизован).
// configureStore сам подключает middleware redux-thunk и Redux DevTools
export const store = configureStore({
  reducer: {
    flightResources: flightResourcesReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// useDispatch / useSelector с типами нашего store
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
