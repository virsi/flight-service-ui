import './LoginPage.css'
import axios from 'axios'
import { type FC, type FormEvent, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/store'
import { setUser } from '../../entities/User'
import { ROUTES } from '../../shared/config/routes'

// Вход. Как в лекции 10: запрос делает сам компонент через axios (без кодогенерации и thunk),
// результат вручную передаётся в Redux — интерфейс переключается с гостя на пользователя
export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/users/login', { login, password })
      localStorage.setItem('token', data.access_token) // JWT остаётся в Application → Local Storage
      dispatch(setUser({ login, token: data.access_token }))
      navigate(ROUTES.TILES)
    } catch {
      setError('Неверный логин или пароль')
      setLoading(false)
    }
  }

  return (
    <div className="loginPage">
      <header className="header">
        <h1>Обслуживание рейса</h1>
        <p className="subtitle">Вход в систему</p>
      </header>

      <Form className="loginForm" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="login">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            autoComplete="username"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Form.Group>
        <Button type="submit" className="w-100" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Войти'}
        </Button>
      </Form>
    </div>
  )
}
