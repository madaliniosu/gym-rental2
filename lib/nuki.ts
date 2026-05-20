const NUKI_BASE_URL = 'https://api.nuki.io'
const NUKI_API_TOKEN = process.env.NUKI_API_TOKEN!
const NUKI_SMARTLOCK_ID = process.env.NUKI_SMARTLOCK_ID!

export async function createTimedKeypadCode(
  name: string,
  startTime: Date,
  endTime: Date
): Promise<{ authId: number; code: string }> {
  const response = await fetch(
    `${NUKI_BASE_URL}/smartlock/${NUKI_SMARTLOCK_ID}/auth`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${NUKI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type: 13, // keypad code
        allowedFromDate: startTime.toISOString(),
        allowedUntilDate: endTime.toISOString(),
        allowedWeekDays: 127, // all days
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Nuki API error: ${response.status}`)
  }

  const data = await response.json()
  return { authId: data.id, code: data.code }
}

export async function deleteKeypadCode(authId: number): Promise<void> {
  await fetch(
    `${NUKI_BASE_URL}/smartlock/${NUKI_SMARTLOCK_ID}/auth/${authId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${NUKI_API_TOKEN}` },
    }
  )
}