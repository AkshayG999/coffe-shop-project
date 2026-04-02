"use client"

import Link from "next/link"
import { Coffee, Instagram, Facebook, Twitter } from "lucide-react"
import { ScrollTarget, useScroll } from "@/contexts/scroll-context"

const navLinks: { target: ScrollTarget; label: string }[] = [
  { target: "home", label: "Home" },
  { target: "about", label: "About" },
  { target: "menu", label: "Menu" },
  { target: "contact", label: "Contact" },
]

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
]

export function Footer() {
  const { scrollToSection } = useScroll()

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Coffee className="h-8 w-8" />
              <span className="font-serif text-xl font-bold">BREW & CO.</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-3">
              Crafting exceptional coffee experiences since 2018.
              Every cup is a journey.
            </p>
            <p className="text-primary-foreground/60 text-xs">
              Oppsite Fergusson College,FC Road<br />
              Pune-411004, Maharashtra
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  type="button"
                  onClick={() => scrollToSection(link.target)}
                  className="text-left text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            ©️ {new Date().getFullYear()} Brew & Co. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
