import { Api } from './Api'

// Клиент из кодогенерации (npm run generate-api). baseURL '/' — запросы идут на адрес фронтенда,
// а оттуда через proxy Vite на бэкенд
export const api = new Api({ baseURL: '/' })

// JWT из Redux в заголовок запроса; гостю (пустой токен) заголовок не нужен
export const authHeader = (token: string) => {
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}
