import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

const HOURLY_RATE_CENTS = Number(process.env.HOURLY_RATE_CENTS ?? 1000);

export async function POST(req: NextRequest) {
    const { date, hour, name, email } = await req.json();

    if (!date || hour === undefined || !name || !email) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 },
        );
    }

    const startTime = new Date(
        `${date}T${String(hour).padStart(2, "0")}:00:00.000Z`,
    );
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const supabase = createAdminClient();

    // Check slot is still available
    const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("status", "confirmed")
        .eq("start_time", startTime.toISOString())
        .maybeSingle();

    if (existing) {
        return NextResponse.json(
            { error: "Slot no longer available" },
            { status: 409 },
        );
    }

    // Create pending booking
    const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
            email,
            name,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
        })
        .select()
        .single();

    if (bookingError || !booking) {
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 },
        );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: HOURLY_RATE_CENTS,
        currency: "eur",
        metadata: { booking_id: booking.id },
    });

    // Store the PaymentIntent ID on the booking
    await supabase
        .from("bookings")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", booking.id);

    return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
    });
}
