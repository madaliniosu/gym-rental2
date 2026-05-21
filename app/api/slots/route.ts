import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const OPEN_HOUR = Number(process.env.OPEN_HOUR ?? 9);
const CLOSE_HOUR = Number(process.env.CLOSE_HOUR ?? 21);

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    if (!date) {
        return NextResponse.json(
            { error: "date param required" },
            { status: 400 },
        );
    }

    const supabase = createAdminClient();

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const { data: bookedSlots, error } = await supabase
        .from("bookings")
        .select("start_time")
        .eq("status", "confirmed")
        .gte("start_time", dayStart.toISOString())
        .lte("start_time", dayEnd.toISOString());

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookedHours = new Set(
        bookedSlots.map((b) => new Date(b.start_time).getUTCHours()),
    );

    const slots = [];
    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
        slots.push({
            hour,
            label: `${String(hour).padStart(2, "0")}:00 – ${String(hour + 1).padStart(2, "0")}:00`,
            available: !bookedHours.has(hour),
        });
    }

    return NextResponse.json({ slots });
}
