import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CreateDonationMessage from './pages/CreateDonationPage'
import SendDonationPage from './pages/SendDonationPage'
import { Toaster } from 'react-hot-toast'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Toaster />

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CreateDonationMessage />} />
        <Route path='/donate/' element={<SendDonationPage />} />
        {/* <Route path='*' element={<Navigate to={'/'} replace />} />*/}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
