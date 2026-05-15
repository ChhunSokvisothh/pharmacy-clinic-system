import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'Pharmacy & Clinic',
  description: 'Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}