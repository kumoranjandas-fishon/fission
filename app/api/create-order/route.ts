import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, name, phone } = body;
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `fishon_${Date.now()}`,
      notes: { name: name || "", phone: phone || "" },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: error?.message || "Order create failed" }, { status: 500 });
  }
}
