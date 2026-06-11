import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Veluna | فيلونا – عناية بشرة المرأة',
  description: 'روتين العناية بالجسم من خطوتين. زيت إزالة الشعر وكريم الشعر تحت الجلد. مصنوع خصيصاً لبشرة المرأة المغربية.',
  openGraph: {
    title: 'Veluna | فيلونا',
    description: 'روتين العناية بالجسم من خطوتين. زيت إزالة الشعر وكريم الشعر تحت الجلد.',
    locale: 'ar_MA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
