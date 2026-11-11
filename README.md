# flight-service-ui

Фронтенд заявочной системы по курсу «Разработка Интернет Приложений» (РИП).
Тема 26 — **«Обслуживание рейса в аэропорте»**, лабораторная работа №6: завершение интерфейса пользователя на React (Redux Toolkit, redux-thunk, axios, кодогенерация из Swagger).

Бэкенд — [flight-service-api](https://github.com/virsi/flight-service-api). Карточки приходят с бэкенда. Если он недоступен, гость видит коллекцию mock-объектов.

## Стек

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/), сборщик [Vite](https://vite.dev)
- [React-Bootstrap](https://react-bootstrap.github.io) + [Bootstrap](https://getbootstrap.com) — компоненты интерфейса
- [React Router](https://reactrouter.com) — маршруты и общий layout
- [Redux Toolkit](https://redux-toolkit.js.org) + [react-redux](https://react-redux.js.org) — менеджер состояний (`configureStore`, `createSlice`, `createAsyncThunk`, middleware redux-thunk)
- [axios](https://axios-http.com) — HTTP-запросы
- [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) — кодогенерация клиента API из Swagger бэкенда
- [oxlint](https://oxc.rs/docs/guide/usage/linter) — линтер из шаблона Vite

`useReducer` и `useContext` не используются: всё общее состояние хранится в Redux.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
```

Бэкенд запускается отдельно, на `http://localhost:8080`, MinIO — на `http://localhost:9100` (см. README бэкенда, `make start`). Без бэкенда гость видит mock-данные.

### Proxy (CORS)

Браузер обращается только к dev-серверу `:3000`, поэтому ограничений CORS нет. Обратный прокси настроен в `vite.config.ts`:

| Маршрут | Куда | Что |
|---|---|---|
| `/api` | `http://localhost:8080` | методы бэкенда |
| `/flight-media` | `http://localhost:9100` | изображения и видео из MinIO (S3) |

MinIO возвращает абсолютные ссылки `http://localhost:9100/flight-media/<файл>`. Thunk'и отрезают у них адрес сервера (`viaProxy`), и файлы загружаются через `/flight-media` того же `:3000`.

### Кодогенерация API

```bash
npm run generate-api   # нужен запущенный бэкенд
```

`scripts/generate-api.mjs` скачивает `http://localhost:8080/swagger/doc.json` и генерирует `src/shared/api/Api.ts` (`httpClientType: 'axios'`). Экземпляр клиента — `api` в `src/shared/api/index.ts` (`baseURL: '/'`, запросы идут через proxy). `moduleNameIndex: 1` группирует методы по ресурсу: `api.flightResources.flightResourcesList`, `flightResourcesFeedList`, `flightResourcesDraftList`, `flightResourcesCreate`, `flightResourcesDraftPublishUpdate`, `flightResourcesDelete`, `flightResourcesLikeCreate`.

Через Docker (hot-reload работает, исходники монтируются в контейнер; proxy указывает на `localhost`, поэтому для работы с бэкендом удобнее `npm run dev`):

```bash
docker-compose up --build
```

Приложение откроется на `http://localhost:3000`. Остальные команды:

- `npm run build` — проверка типов и production-сборка в `dist/`;
- `npm run lint` — линтер.

Интерфейс свёрстан под вертикальный экран телефона. На компьютере он показывается колонкой шириной 390px по центру окна.

## Меню

Внизу экрана закреплена навигационная панель (React-Bootstrap `Navbar` + `Nav`) из 4 пунктов. Активный пункт выделен синим цветом и оранжевым подчёркиванием.

| Пункт | Доступен | Действие |
|---|---|---|
| ▶ Лента | да | открывает ленту на первой услуге текущего списка (`/feed/:id`) |
| + Добавление | после входа | страница добавления услуги (`/add`) |
| ▦ Плитка | да | открывает плитку (`/`) |
| ⇥ Вход / ⇤ Выход | да | гость — страница входа (`/login`); пользователь — выход |

## Страницы

### Плитка — `/`

Список опубликованных услуг с фильтром по цене (аналог страницы «Ресурсы» из ЛР1).

| Элемент | Что делает |
|---|---|
| заголовок «Обслуживание рейса» и подзаголовок «Ресурсы обслуживания аэропорта» | шапка страницы |
| надпись «Цена до: N ₽» | текущее значение слайдера |
| слайдер «Цена до» (`Form.Range`, 0–20000, шаг 100) и шкала 0 / 5000 / 10000 / 15000 / 20000 | выбор максимальной цены |
| кнопка «Найти» | запрос `GET /api/flight-resources?price=<значение слайдера>` |
| карточки услуг в 2 столбца (`Card` в `Row` / `Col xs={6}`) | изображение услуги, название, цена «N ₽/единица», число лайков «♥ N» |
| кнопка «Удалить» на карточке | только у авторизованного и только на своих услугах (`is_mine = 1`): `DELETE /api/flight-resources/:id` |
| клик по карточке | открывает ленту на этой услуге (`/feed/:id`) |
| «К сожалению, ничего не найдено» | показывается, если под фильтр не попала ни одна услуга |

Значение слайдера хранится в Redux, поэтому при переходах между страницами оно не сбрасывается. Список заново загружается при открытии страницы, а также при входе и выходе (меняется `is_mine`).

### Лента — `/feed/:id`

Одна услуга на весь экран (аналог страницы «Лента» из ЛР1), `:id` — id услуги.

| Элемент | Что делает |
|---|---|
| видео услуги на фоне | воспроизводится автоматически, без звука, по кругу |
| заголовок «Обслуживание рейса» и подзаголовок с рейсом | шапка страницы |
| кнопка «♥» и счётчик под ней | число лайков услуги (`likes_count`). После входа кнопка ставит или снимает лайк (`POST /api/flight-resources/:id/like`), поставленный лайк выделен оранжевым. У гостя кнопка неактивна |
| кнопка «→» (Далее) | следующая услуга по порядку текущего списка из плитки, с последней — снова первая (как `next=true` в API) |
| название услуги | — |
| описание | обрезано до 2 строк; кнопка «Ещё» раскрывает его полностью, «Скрыть» сворачивает обратно. При переходе к другой услуге описание снова свёрнуто |
| цена «N ₽/единица» | — |
| «Услуга не найдена» | показывается для несуществующего или неопубликованного id |

Услуга загружается по id: `GET /api/flight-resources/feed?id=` (с токеном в ответе есть `is_liked`). Если открыть `/feed/:id` по прямой ссылке, список для «Далее» тоже загружается.

### Вход — `/login`

Поля «Логин» и «Пароль», кнопка «Войти». Тестовые пользователи бэкенда: `dispatcher` / `dispatcher`, `engineer` / `engineer`.

### Добавление — `/add`

Доступно только после входа, гостя перенаправляет на `/login`.

| Элемент | Что делает |
|---|---|
| изображение и под ним «Выбрать изображение» | выбранный файл (jpeg/png/webp/gif) сразу показывается на месте картинки (`URL.createObjectURL`), до выбора — изображение по умолчанию |
| видео и под ним «Выбрать видео» | то же для видео (mp4/webm), до выбора — видео по умолчанию |
| «Название», «Описание», «Единица измерения», «Цена» | поля услуги |
| «Добавить» | `GET /api/flight-resources/draft` (оставшийся после ошибки черновик удаляется через `DELETE`), `POST /api/flight-resources` (multipart, черновик), затем `PUT /api/flight-resources/draft/publish`, после этого переход в плитку |

## Redux

Store — `src/app/store.ts` (`configureStore`). Middleware redux-thunk и Redux DevTools подключаются автоматически.

**`user`** (`src/entities/User/model/userSlice.ts`) — состояние интерфейса: `login`, `token`, `isAuthenticated`. Редьюсеры `setUser` и `logoutUser`.

Авторизация сделана как в лекции 10: запросы входа и выхода отправляет сам компонент через `axios`, без кодогенерации и thunk, а результат вручную передаётся в Redux.

- Вход (`LoginPage`): `axios.post('/api/users/login')`. JWT сохраняется в `localStorage` (ключ `token`), затем `dispatch(setUser(...))`.
- Выход (`TabBar`): `axios.post('/api/users/logout')` с заголовком `Authorization: Bearer`. После этого токен удаляется из `localStorage`, вызываются `dispatch(logoutUser())` и `dispatch(resetPriceFilter())`, то есть фильтр пользователя сбрасывается.
- После F5 Redux снова в начальном состоянии гостя, а JWT остаётся в Application → Local Storage. По этому токену в Postman/Insomnia (`Authorization: Bearer <token>`) приходит плитка с `is_mine = 1` у своих услуг — это признак, что услугу можно удалить.

**`flightResources`** (`src/entities/FlightResource/model/flightResourcesSlice.ts`) хранит `priceFilter`, `list`, `feedItem`, `loading` и `error`. Редьюсеры: `setPriceFilter`, `resetPriceFilter`, `clearError`. Thunk'и (`createAsyncThunk`) работают через сгенерированный клиент `api`:

| Thunk | Метод API |
|---|---|
| `getFlightResourcesList` | `api.flightResources.flightResourcesList({ price })` |
| `getFlightResourceFeed` | `api.flightResources.flightResourcesFeedList({ id })` |
| `likeFlightResource` | `api.flightResources.flightResourcesLikeCreate(id, { like })` |
| `deleteFlightResource` | `api.flightResources.flightResourcesDelete(id)` |
| `createFlightResource` | `api.flightResources.flightResourcesDraftList()` → `flightResourcesCreate(...)` + `flightResourcesDraftPublishUpdate()` |

Токен thunk'и берут из Redux (`getState().user.token`). Состояния `pending`, `fulfilled` и `rejected` у всех thunk'ов общие (`addMatcher`):
- пока идёт запрос, `AppLayout` показывает поверх страницы спиннер, который блокирует кнопки;
- текст ошибки бэкенда показывается в `Alert`.

## Mock-данные

Коллекция `FLIGHT_RESOURCES_MOCK` лежит в `src/entities/FlightResource/api/mock.ts`. Если запрос плитки или ленты не прошёл (бэкенд недоступен), thunk'и `getFlightResourcesList` и `getFlightResourceFeed` возвращают mock с тем же фильтром по цене. Так происходит только у гостя: авторизованный пользователь вместо mock видит ошибку.

Поля услуги совпадают с JSON-ответом бэкенда: `id`, `name`, `description`, `status`, `unit`, `price`, `image_url`, `video_url`, `formed_at`, `likes_count`, `is_mine`, `is_liked`.

| id | Услуга | Цена | Медиа |
|---|---|---|---|
| 1 | Аэродромный тягач Goldhofer AST-2X | 18500 ₽/час | `public/mock/tug.*` |
| 2 | Авиатопливо ТС-1 | 82 ₽/литр | `public/mock/jet-fuel.*` |
| 3 | Бортовое питание (эконом) | 460 ₽/порция | `public/mock/catering.*` |
| 4 | Наземный источник питания (GPU) | 9400 ₽/час | `public/mock/gpu.*` |
| 7 | Агент авиакомпании | 2800 ₽/час | нет — медиа по умолчанию |
| 8 | Уборка салона | 5200 ₽/рейс | нет — медиа по умолчанию |

Услуги 1–4 и их лайки взяты из `docs/lab2-seed.sql` бэкенда, файлы медиа — из бакета MinIO `flight-media`. Услуги 7 и 8 взяты из ЛР1, `image_url` и `video_url` у них пустые. id 5 и 6 в БД заняты черновиком и удалённой услугой, поэтому в mock их нет.

## Изображение и видео по умолчанию

Файлы лежат в самом проекте: `public/DefaultImage.jpg` и `public/DefaultVideo.mp4` (константы `DEFAULT_IMAGE` и `DEFAULT_VIDEO` в `src/shared/config/media.ts`).

- Пустое поле: `src={image_url || DEFAULT_IMAGE}` в карточке и `src={video_url || DEFAULT_VIDEO}` в ленте.
- Файл недоступен: `onError` подставляет файл по умолчанию. Если не загрузился и он, замены больше нет, поэтому бесконечного цикла не будет.

## Структура

Код в `src/` разложен по 7 слоям [Feature-Sliced Design](https://feature-sliced.design/ru/docs/get-started/overview) (лекция 9). Слой импортирует только из слоёв ниже себя: `app → processes → pages → widgets → features → entities → shared`.

```
index.html                              точка входа (lang="ru", заголовок вкладки)
vite.config.ts                          dev-сервер: порт 3000, proxy /api и /flight-media, usePolling (для Docker)
scripts/generate-api.mjs                кодогенерация клиента API из Swagger
Dockerfile, .dockerignore, docker-compose.yml   запуск в Docker
public/DefaultImage.jpg, DefaultVideo.mp4       медиа по умолчанию
public/mock/                            медиа услуг 1–4 (из MinIO)
src/
  main.tsx                              рендер приложения, Provider store, подключение Bootstrap и стилей
  app/                                  инициализация приложения
    App.tsx                             маршруты: AppLayout -> / (плитка), /feed/:id (лента), /add, /login
    AppLayout.tsx, AppLayout.css        колонка 390px, анимация загрузки, ошибки, TabBar
    store.ts                            configureStore, RootState, AppDispatch, useAppDispatch, useAppSelector
    index.css                           палитра Aeroflot (переменные :root) и базовые стили из ЛР1
  processes/                            сценарии из нескольких страниц — пусто
  pages/                                страницы (компоненты маршрутов)
    FlightResourcesPage/                плитка
    FeedPage/                           лента
    LoginPage/                          вход
    AddFlightResourcePage/              добавление услуги
  widgets/                              самостоятельные блоки интерфейса
    TabBar/                             нижнее меню из 4 пунктов, выход
  features/                             действия пользователя
    PriceFilter/                        фильтр: слайдер «Цена до» и кнопка «Найти»
  entities/                             бизнес-сущности
    FlightResource/                     услуга
      index.ts                          публичный API слайса
      model/types.ts                    тип FlightResource
      model/flightResourcesSlice.ts     слайс услуг и thunk'и
      api/mock.ts                       FLIGHT_RESOURCES_MOCK
      ui/FlightResourceCard/            карточка услуги в плитке (с кнопкой «Удалить»)
    User/                               пользователь
      model/userSlice.ts                слайс пользователя (setUser, logoutUser)
  shared/                               переиспользуемый код без бизнес-логики
    api/Api.ts                          сгенерированный клиент (не править руками)
    api/index.ts                        экземпляр api, authHeader(token)
    config/routes.ts                    ROUTES и подписи пунктов меню
    config/media.ts                     DEFAULT_IMAGE, DEFAULT_VIDEO
```
