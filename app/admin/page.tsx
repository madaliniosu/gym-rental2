import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminLoginForm from './LoginForm'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD

  if (!isAuthenticated) return <AdminLoginForm />

  const supabase = createAdminClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Admin — Bookings</h1>
      <div className="space-y-3">
        {bookings?.map((booking) => {
          const start = new Date(booking.start_time)
          const end = new Date(booking.end_time)
          const dateStr = start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
          const timeStr = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
          return (
            <Card key={booking.id}>
              <CardContent className="pt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{booking.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.email}</p>
                  <p className="text-sm mt-1">{dateStr} · {timeStr}</p>
                  {booking.access_code && (
                    <p className="text-sm mt-1 font-mono">Code: {booking.access_code}</p>
                  )}
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
        {!bookings?.length && (
          <p className="text-muted-foreground text-center py-12">No bookings yet.</p>
        )}
      </div>
    </main>
  )
}
