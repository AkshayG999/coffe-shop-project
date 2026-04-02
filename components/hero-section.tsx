"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useScroll } from "@/contexts/scroll-context"

export function HeroSection() {
  const { heroRef } = useScroll()
  return (
    <section ref={heroRef} id="home" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-coffee.jpg"
          alt="Artisan coffee"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-2xl">
          <p className="text-secondary/80 uppercase tracking-widest text-sm mb-4">
            Welcome to Brew & Co.
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-card leading-tight text-balance">
            Best Served
            <br />
            <span className="italic">Often</span>
          </h1>
          <p className="mt-6 text-lg text-secondary/90 max-w-lg leading-relaxed">
            Experience the finest artisan coffee crafted with passion. 
            Every cup tells a story of carefully sourced beans and expert brewing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-card text-foreground hover:bg-card/90 font-medium"
            >
              <Link href="#menu">
                Explore Menu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-card text-black hover:bg-card/10 font-medium"
            >
              <Link href="#about">Our Story</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-card/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-card/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
