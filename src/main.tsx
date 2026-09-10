import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Experience from './Experience.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Experience />
  </StrictMode>,
)
