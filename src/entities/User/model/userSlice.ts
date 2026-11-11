import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// Состояние интерфейса: гость (isAuthenticated = false) или авторизованный пользователь.
// Как в лекции 10: запросы входа/выхода делает сам компонент через axios,
// а результат вручную передаётся сюда обычными action — без thunk и кодогенерации
interface UserState {
  login: string
  token: string // JWT из ответа /api/users/login
  isAuthenticated: boolean
}

const initialState: UserState = {
  login: '',
  token: '',
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, { payload }: PayloadAction<{ login: string; token: string }>) {
      state.login = payload.login
      state.token = payload.token
      state.isAuthenticated = true
    },
    logoutUser() {
      return initialState
    },
  },
})

export const { setUser, logoutUser } = userSlice.actions
export const userReducer = userSlice.reducer
