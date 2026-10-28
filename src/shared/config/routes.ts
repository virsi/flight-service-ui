export const ROUTES = {
  TILES: '/',
  FEED: '/feed',
  ADD: '/add',
  LOGIN: '/login',
}
export type RouteKeyType = keyof typeof ROUTES
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  TILES: 'Плитка',
  FEED: 'Лента',
  ADD: 'Добавление',
  LOGIN: 'Вход',
}
