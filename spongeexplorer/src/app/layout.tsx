import './globals.css'
import type { Metadata } from 'next'
import NavBar from './components/navBar/navBar'


export const metadata: Metadata = {
  title: 'Sponge Explorer | NIO ',
  description: 'Created By The Students Of Don Bosco',
  
}

export default function RootLayout({
  
  children,
}: {
 
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-[#0A0A0A] text-white'>
      <body>
      <NavBar/>

        {children}

        </body>
    </html>
  )
}
