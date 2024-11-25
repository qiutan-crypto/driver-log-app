import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '司机日志',
  description: '路线记录应用',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="bg-gray-100" suppressHydrationWarning>{children}</body>
    </html>
  )
}