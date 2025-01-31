import LoginPage from './LoginPage'
import MainPage from './MainPage'
import UncrawledPage from './UncrawledPage'

export default function Page() {
  console.log(window.localStorage)
  if (!window.localStorage.getItem('id')) {
    return <LoginPage />
  }

  const location = window.location.href

  if (location.includes('/uncrawled')) {
    console.log('into uncrawled')
    return <UncrawledPage />
  }

  console.log('into linkseeker')

  return <MainPage />
}
