import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const order = await req.json();

    const message = `🐟 *FISHON - NAYA ORDER!*

👤 *Customer:* ${order.name}
📱 *Phone:* ${order.phone}
📍 *Area:* ${order.area}

🛒 *Items:*
${order.items}

💰 *Total:* ₹${order.total}
💳 *Payment:* ${order.paymentMethod === 'online' ? '✅ Online Paid' : '💵 Cash on Delivery'}

🏠 *Address:* ${order.address}
🕐 *Delivery:* ${order.deliveryTime}
${order.instructions ? `📝 *Note:* ${order.instructions}` : ''}

🆔 Order ID: ${order.orderId}`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
