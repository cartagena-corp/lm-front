import { redirect } from 'next/navigation'

//Aplicar redirección en proveedor de hosting

export default function Home() {
  redirect('/login')
} 