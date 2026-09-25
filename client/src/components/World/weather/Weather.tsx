import type { WeatherKind } from './weatherRegistry'
import Rain from './Rain'
import Snow from './Snow'
import Desert from './Desert'
import Wind from './Wind'

export default function Weather({ weather }: { weather: WeatherKind }) {
  switch (weather) {
    case 'wind':
      return <Wind />
    case 'rain':
      return <Rain />
    case 'snow':
      return <Snow />
    case 'desert':
      return <Desert />
    default:
      return null
  }
}
