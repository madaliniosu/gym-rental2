import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const OPEN_HOUR = Number(process.env.OPEN_HOUR ?? 9)
const CLOSE_HOUR = Number(process.env.CLOSE_HOUR ?? 21)
const HOURLY_RATE = Number(process.env.HOURLY_RATE_CENTS ?? 1000) / 100

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Private Gym Rental
        </h1>
        <p className="max-w-md text-muted-foreground text-lg">
          Book the space, pay online, get a door code. Train on your schedule — no membership, no crowds.
        </p>
        <Button asChild size="lg">
          <Link href="/book">Book a Session</Link>
        </Button>
      </section>

      <Separator />

      {/* Details */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-4 py-16 max-w-3xl mx-auto w-full">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-2xl font-semibold mt-1">Carrer de Lluís Peixó 24, Valencia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-2xl font-semibold mt-1">€{HOURLY_RATE} / hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hours</p>
            <p className="text-2xl font-semibold mt-1">
              {OPEN_HOUR}:00 – {CLOSE_HOUR}:00
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Access</p>
            <p className="text-2xl font-semibold mt-1">Code lock</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}