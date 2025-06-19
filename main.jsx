// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import TweetService from './app.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TweetService />
  </React.StrictMode>
)
