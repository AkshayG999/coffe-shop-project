"use client"

import Image from "next/image"
import { useScroll } from "@/contexts/scroll-context"

const features = [
  {
    number: "01",
    title: "Ethically Sourced",
    description: "We partner directly with farmers to ensure fair wages and sustainable practices.",
  },
  {
    number: "02", 
    title: "Expertly Roasted",
    description: "Our master roasters bring out the unique character of every bean.",
  },
  {
    number: "03",
    title: "Freshly Brewed",
    description: "Every cup is crafted to order, ensuring perfect temperature and flavor.",
  },
]

export function AboutSection() {
  const { aboutRef } = useScroll()
  return (
    <section ref={aboutRef} id="about" className="py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent uppercase tracking-widest text-sm font-medium mb-4">
            About Us
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Crafting Perfect Moments,
            <br />
            One Cup at a Time
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/images/about-coffee-shop.jpg"
              alt="Inside our coffee shop"
              fill
              className="object-cover"
            />
          </div>

          {/* Text Content */}
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Founded in 2018, Brew & Co. started with a simple mission: to create a space 
              where coffee lovers could experience the art of specialty coffee. Our journey 
              began in a small corner shop, fueled by passion and a deep respect for the craft.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Today, we continue to honor that commitment by sourcing the finest beans from 
              around the world, roasting them to perfection, and serving them with care. 
              Every cup we serve is a testament to our dedication to quality and community.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.number} className="flex gap-6">
                  <span className="font-serif text-4xl font-bold text-accent/30">
                    {feature.number}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
