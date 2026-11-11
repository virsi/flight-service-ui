import {
  createAsyncThunk,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  type PayloadAction,
} from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from '../../../app/store'
import { api, authHeader } from '../../../shared/api'
import { FLIGHT_RESOURCES_MOCK } from '../api/mock'
import type { FlightResource } from './types'

export const MAX_PRICE = 20000

interface FlightResourcesState {
  // значение фильтра «Цена до», хранится в store и не сбрасывается при переходах
  priceFilter: number
  list: FlightResource[] // плитка; порядок нужен ленте для «Далее»
  feedItem: FlightResource | null | undefined // лента: undefined — загружается, null — не найдена
  loading: boolean // идёт запрос — на странице анимация, кнопки заблокированы
  error: string | null
}

const initialState: FlightResourcesState = {
  priceFilter: MAX_PRICE,
  list: [],
  feedItem: undefined,
  loading: false,
  error: null,
}

type ThunkConfig = { state: RootState; rejectValue: string }

// MinIO отдаёт абсолютные ссылки http://localhost:9100/flight-media/<файл> — отрезаем адрес,
// чтобы изображения и видео шли через второй маршрут proxy (/flight-media)
const viaProxy = (url: string) => url.replace(/^https?:\/\/[^/]+/, '')
const withProxyMedia = (item: FlightResource): FlightResource => ({
  ...item,
  image_url: viaProxy(item.image_url),
  video_url: viaProxy(item.video_url),
})

// текст ошибки из ответа бэкенда {"status":"error","description":"..."}
const errorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.description) || fallback

// Плитка: GET /api/flight-resources?price=, фильтр берётся из store.
// Бэкенд недоступен — гость получает коллекцию mock-объектов, авторизованный — ошибку
export const getFlightResourcesList = createAsyncThunk<FlightResource[], void, ThunkConfig>(
  'flightResources/getFlightResourcesList',
  async (_, { getState, rejectWithValue }) => {
    const { flightResources, user } = getState()
    try {
      const { data } = await api.flightResources.flightResourcesList(
        { price: flightResources.priceFilter },
        authHeader(user.token),
      )
      return (data.data as FlightResource[]).map(withProxyMedia)
    } catch (error) {
      if (user.isAuthenticated) {
        return rejectWithValue(errorMessage(error, 'Не удалось загрузить услуги'))
      }
      return FLIGHT_RESOURCES_MOCK.filter((item) => item.price <= flightResources.priceFilter)
    }
  },
)

// Лента: GET /api/flight-resources/feed?id= (с токеном приходит is_liked). Гость без бэкенда — mock
export const getFlightResourceFeed = createAsyncThunk<FlightResource | null, number, ThunkConfig>(
  'flightResources/getFlightResourceFeed',
  async (id, { getState, rejectWithValue }) => {
    const { user } = getState()
    try {
      const { data } = await api.flightResources.flightResourcesFeedList(
        { id },
        authHeader(user.token),
      )
      return withProxyMedia(data.data as FlightResource)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      if (user.isAuthenticated) {
        return rejectWithValue(errorMessage(error, 'Не удалось загрузить услугу'))
      }
      return FLIGHT_RESOURCES_MOCK.find((item) => item.id === id) ?? null
    }
  },
)

// Лайк: POST /api/flight-resources/{id}/like, like = 1 ставит, 0 снимает
export const likeFlightResource = createAsyncThunk<
  { id: number; like: number; likes_count: number },
  { id: number; like: 0 | 1 },
  ThunkConfig
>('flightResources/likeFlightResource', async ({ id, like }, { getState, rejectWithValue }) => {
  try {
    const { data } = await api.flightResources.flightResourcesLikeCreate(
      id,
      { like },
      authHeader(getState().user.token),
    )
    return { id, like, likes_count: data.data?.likes_count ?? 0 }
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Не удалось изменить лайк'))
  }
})

// Удаление своей услуги: DELETE /api/flight-resources/{id}
export const deleteFlightResource = createAsyncThunk<number, number, ThunkConfig>(
  'flightResources/deleteFlightResource',
  async (id, { getState, rejectWithValue }) => {
    try {
      await api.flightResources.flightResourcesDelete(id, authHeader(getState().user.token))
      return id
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось удалить услугу'))
    }
  },
)

export type NewFlightResource = Parameters<typeof api.flightResources.flightResourcesCreate>[0]

// Добавление услуги: GET /api/flight-resources/draft (незавершённое добавление), POST /api/flight-resources
// (черновик, multipart с файлами), затем PUT /api/flight-resources/draft/publish — услуга видна в плитке
export const createFlightResource = createAsyncThunk<void, NewFlightResource, ThunkConfig>(
  'flightResources/createFlightResource',
  async (newResource, { getState, rejectWithValue }) => {
    const params = authHeader(getState().user.token)
    try {
      // черновик мог остаться после неудачной публикации — удаляем его, иначе создание вернёт 409
      const draft = await api.flightResources
        .flightResourcesDraftList(params)
        .then(({ data }) => data.data)
        .catch((error) => {
          if (axios.isAxiosError(error) && error.response?.status === 404) return undefined
          throw error
        })
      if (draft?.id) await api.flightResources.flightResourcesDelete(draft.id, params)
      await api.flightResources.flightResourcesCreate(newResource, params)
      await api.flightResources.flightResourcesDraftPublishUpdate(params)
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось добавить услугу'))
    }
  },
)

const thunks = [
  getFlightResourcesList,
  getFlightResourceFeed,
  likeFlightResource,
  deleteFlightResource,
  createFlightResource,
] as const

const flightResourcesSlice = createSlice({
  name: 'flightResources',
  initialState,
  reducers: {
    setPriceFilter(state, { payload }: PayloadAction<number>) {
      state.priceFilter = payload
    },
    // при выходе пользователя фильтр сбрасывается
    resetPriceFilter(state) {
      state.priceFilter = MAX_PRICE
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFlightResourcesList.fulfilled, (state, { payload }) => {
        state.list = payload
      })
      .addCase(getFlightResourceFeed.pending, (state) => {
        state.feedItem = undefined
      })
      .addCase(getFlightResourceFeed.fulfilled, (state, { payload }) => {
        state.feedItem = payload
      })
      .addCase(likeFlightResource.fulfilled, (state, { payload }) => {
        if (state.feedItem?.id === payload.id) {
          state.feedItem.is_liked = payload.like
          state.feedItem.likes_count = payload.likes_count
        }
        const item = state.list.find((resource) => resource.id === payload.id)
        if (item) item.likes_count = payload.likes_count
      })
      .addCase(deleteFlightResource.fulfilled, (state, { payload }) => {
        state.list = state.list.filter((item) => item.id !== payload)
      })
      // общие для всех thunk состояния запроса: pending — анимация, rejected — текст ошибки
      .addMatcher(isPending(...thunks), (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(isFulfilled(...thunks), (state) => {
        state.loading = false
      })
      .addMatcher(isRejected(...thunks), (state, { payload }) => {
        state.loading = false
        state.error = payload ?? 'Ошибка запроса'
      })
  },
})

export const { setPriceFilter, resetPriceFilter, clearError } = flightResourcesSlice.actions
export const flightResourcesReducer = flightResourcesSlice.reducer
