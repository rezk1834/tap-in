import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import { ThemeProvider } from './theme.jsx'
import { DataProvider } from './store.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <LangProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </LangProvider>
    </ThemeProvider>
  </BrowserRouter>
)
