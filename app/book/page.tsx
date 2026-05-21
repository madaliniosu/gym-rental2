'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Slot = { hour: number; label: string; available: boolean }
type Step = 'select' | 'details' | 'payment'

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation`,
      },
    })
    if (error) {
      setError(error.message ?? 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Processing...' : 'Pay & Confirm Booking'}
      </Button>
    </form>
  )
}

export default function BookPage() {
  const [date, setDate] = useState<Date | undefined>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('select')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDateSelect(d: Date | undefined) {
    setDate(d)
    setSelectedSlot(null)
    setSlots([])
    if (!d) return
    const dateStr = d.toISOString().split('T')[0]
    const res = await fetch(`/api/slots?date=${dateStr}`)
    const data = await res.json()
    setSlots(data.slots ?? [])
  }

  async function handleContinue() {
    if (!date || !selectedSlot || !name || !email) return
    setLoading(true)
    setError(null)
    const dateStr = date.toISOString().split('T')[0]
    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, hour: selectedSlot.hour, name, email }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }
    setClientSecret(data.clientSecret)
    setStep('payment')
    setLoading(false)
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">Book a Session</h1>

      {step === 'select' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Pick a date</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={{ before: new Date() }}
              />
            </CardContent>
          </Card>

          {slots.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Pick a time slot</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.hour}
                    variant={selectedSlot?.hour === slot.hour ? 'default' : 'outline'}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className="text-sm"
                  >
                    {slot.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {selectedSlot && (
            <Button className="w-full" onClick={() => setStep('details')}>
              Continue
            </Button>
          )}
        </div>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
              <Button
                className="flex-1"
                disabled={!name || !email || loading}
                onClick={handleContinue}
              >
                {loading ? 'Loading...' : 'Continue to Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && clientSecret && (
        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm />
            </Elements>
          </CardContent>
        </Card>
      )}
    </main>
  )
}