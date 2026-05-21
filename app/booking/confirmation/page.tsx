import { createAdminClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ payment_intent?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { payment_intent } = await searchParams

  let booking = null

  if (payment_intent) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('bookings')
      .select('name, email, start_time, end_time, status')
      .eq('stripe_payment_intent_id', payment_intent)
      .single()
    booking = data
  }

  if (!booking) {
    return (
      <main className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
        <Button asChild variant="outline">
          <Link href="/book">Back to booking</Link>
        </Button>
      </main>
    )
  }

  const start = new Date(booking.start_time)
  const end = new Date(booking.end_time)

  const dateStr = start.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <main className="max-w-xl mx-auto px-4 py-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">✓</div>
        <h1 className="text-3xl font-bold">Payment received</h1>
        <p className="text-muted-foreground">Check your email for the door code.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Your booking</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{booking.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{booking.email}</span>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="w-full">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  )
}
