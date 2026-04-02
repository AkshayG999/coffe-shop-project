import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { MenuSection } from "@/components/menu-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { CheckoutModal } from "@/components/checkout-modal"
import { CartProvider } from "@/contexts/cart-context"

export default function Home() {
  return (
    <CartProvider>
      <main>
        <Header />
        <HeroSection />
        <AboutSection />
        <MenuSection />
        <ContactSection />
        <Footer />
        <CartSidebar />
        <CheckoutModal />
      </main>
    </CartProvider>
  )
}
