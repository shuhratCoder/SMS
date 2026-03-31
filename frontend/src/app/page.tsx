import { redirect } from 'next/navigation'

// Редирект с главной страницы на логин
export default function HomePage() {
  redirect('/login')
}
