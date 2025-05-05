import { HashRouter, Route, Routes } from 'react-router-dom'
// import Gani from './Gani'  
import LoginPage from './LoginPage'
import MainPage from './MainPage'
import UncrawledPage from './UncrawledPage'

//create route
export default function App() {
  console.log(window.localStorage)
  if (!window.localStorage.getItem('id')) {
    return <LoginPage />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/uncrawled" element={<UncrawledPage />} />
      </Routes>
    </HashRouter>
  )
}
