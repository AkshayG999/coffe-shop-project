import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { OrdersProvider } from '@/contexts/orders-context'
import { ModalsProvider } from '@/contexts/modals-context'
import { ScrollProvider } from '@/contexts/scroll-context'
import { ModalsContainer } from '@/components/modals-container'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif'
});
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Brew & Co. | Artisan Coffee Shop',
  description: 'Experience the finest artisan coffee in a warm, inviting atmosphere. Discover our carefully crafted menu of specialty coffees and treats.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2d1810',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ScrollProvider>
              <OrdersProvider>
                <ModalsProvider>
                  {children}
                  <ModalsContainer />
                  <Analytics />
                </ModalsProvider>
              </OrdersProvider>
            </ScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
