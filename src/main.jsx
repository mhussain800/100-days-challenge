import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Keep the app at its intended scale on touch devices. The viewport meta tag
// handles supported browsers; these non-passive guards cover pinch gestures.
const preventPinchZoom = (event) => {
  if (event.touches?.length > 1) event.preventDefault()
}

document.addEventListener('touchmove', preventPinchZoom, { passive: false })
document.addEventListener('gesturestart', (event) => event.preventDefault())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
