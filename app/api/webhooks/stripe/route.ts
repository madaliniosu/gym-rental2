import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { createTimedKeypadCode } from "@/lib/nuki";
import { resend } from "@/lib/resend";
import BookingConfirmation from "@/emails/BookingConfirmation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 },
        );
    }

    if (event.type !== "payment_intent.succeeded") {
        return NextResponse.json({ received: true });
    }

    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.booking_id;

    const supabase = createAdminClient();

    const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

    if (!booking) {
        return NextResponse.json(
            { error: "Booking not found" },
            { status: 404 },
        );
    }

    // Generate Nuki keypad code
    let authId: number | null = null;
    let code = "0000";

    try {
        const nuki = await createTimedKeypadCode(
            booking.name,
            new Date(booking.start_time),
            new Date(booking.end_time),
        );
        authId = nuki.authId;
        code = nuki.code;
    } catch (err) {
        console.error("Nuki error:", err);
    }

    // Confirm booking with code
    await supabase
        .from("bookings")
        .update({
            status: "confirmed",
            nuki_auth_id: authId,
            access_code: code,
        })
        .eq("id", bookingId);

    // Confirm booking with code
    await supabase
        .from("bookings")
        .update({
            status: "confirmed",
            nuki_auth_id: authId,
            access_code: code,
        })
        .eq("id", bookingId);

    // Send confirmation email
    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: booking.email,
        subject: "Your gym booking is confirmed",
        react: BookingConfirmation({
            name: booking.name,
            startTime: booking.start_time,
            endTime: booking.end_time,
            accessCode: code,
        }),
    });

    return NextResponse.json({ received: true });
}
