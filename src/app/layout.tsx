export const metadata = {
  title: '司机配送系统',
  description: '路线记录应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-gray-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}