import LoginPage from './LoginPage'
import MainPage from './MainPage'

export default function Page() {
  console.log(window.localStorage)
  if (window.localStorage.getItem('id')) {
    return <MainPage />
  }

  return <LoginPage />
}
