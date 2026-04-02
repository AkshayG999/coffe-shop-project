"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Clock, Send } from "lucide-react"
import { useScroll } from "@/contexts/scroll-context"

const contactInfo = [
  {
    icon: MapPin,
    title: "Location",
    details: ["42, MG Road, Connaught Place", "New Delhi - 110001, India"],
  },
  {
    icon: Phone,
    title: "Contact",
    details: ["+91 98765 43210", "hello@brewandco.in"],
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon-Fri: 8am - 10pm", "Sat-Sun: 9am - 11pm"],
  },
]

export function ContactSection() {
  const { contactRef } = useScroll()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message')
      }

      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ name: "", email: "", message: "" })
      
      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Contact form error:', error)
      alert(error instanceof Error ? error.message : 'Failed to send message')
      setIsSubmitting(false)
    }
  }

  return (
    <section ref={contactRef} id="contact" className="py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent uppercase tracking-widest text-sm font-medium mb-4">
            Get In Touch
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            We&apos;d Love to Hear From You
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Visit Our Shop
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you have a question, feedback, or just want to say hello, 
              we&apos;re here for you. Stop by our shop or send us a message.
            </p>

            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {info.title}
                    </h4>
                    {info.details.map((detail, index) => (
                      <p key={index} className="text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-secondary rounded-lg p-6 sm:p-8">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Send a Message
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Message Sent!</h4>
                <p className="text-muted-foreground text-sm">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-card border-border resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
