import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Search from './search.tsx'

createRoot(document.getElementById('search')!).render(
  <StrictMode>
    <Search />
  </StrictMode>,
)
