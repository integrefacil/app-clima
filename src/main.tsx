import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './lib/i18n.ts'
import './index.css'
import App from './App.tsx'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt.tsx'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60 } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <PWAUpdatePrompt />
    </QueryClientProvider>
  </StrictMode>,
)
