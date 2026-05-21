interface Props {
  name: string
  startTime: string
  endTime: string
  accessCode: string
}

export default function BookingConfirmation({ name, startTime, endTime, accessCode }: Props) {
  const start = new Date(startTime)
  const end = new Date(endTime)

  const dateStr = start.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>Hi {name}, your gym session is booked.</p>

      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{dateStr}</p>
        <p style={{ margin: '0 0 16px', color: '#555' }}>{timeStr}</p>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#888' }}>Door code</p>
        <p style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: 8 }}>{accessCode}</p>
      </div>

      <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
        The code is only valid during your booked time slot.
      </p>
      <p style={{ fontSize: 13, color: '#888' }}>
        Enter it on the keypad outside the gym door.
      </p>
    </div>
  )
}