import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { I18nProvider } from "./i18n"
import { AppStateProvider } from "./state"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <I18nProvider>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </I18nProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
