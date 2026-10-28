import './PriceFilter.css'
import type { FC } from 'react'
import { Button, Form } from 'react-bootstrap'

interface Props {
  value: number
  setValue: (value: number) => void
  onSubmit: () => void
  loading?: boolean
}

const SCALE = [0, 5000, 10000, 15000, 20000]

// Фильтр «Цена до»: слайдер 0–20000 с шагом 100 и кнопка «Найти»
export const PriceFilter: FC<Props> = ({ value, setValue, onSubmit, loading }) => (
  <Form
    className="filter"
    onSubmit={(event) => {
      event.preventDefault() // без перезагрузки страницы
      onSubmit()
    }}
  >
    <Form.Group className="filter-slider" controlId="price">
      <Form.Label>Цена до: {value} ₽</Form.Label>
      <Form.Range
        min={0}
        max={20000}
        step={100}
        value={value}
        list="price-scale"
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <datalist id="price-scale">
        {SCALE.map((mark) => (
          <option key={mark} value={mark} />
        ))}
      </datalist>
      <div className="scale">
        {SCALE.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
    </Form.Group>
    <Button className="filter-button" type="submit" disabled={loading}>
      Найти
    </Button>
  </Form>
)
