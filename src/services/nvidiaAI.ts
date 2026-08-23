import { Order, Train, SKU, DeliveryAgent, SalesLog, Vendor } from '../types';

const NVIDIA_API_KEY = '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';
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL_NAME = 'meta/llama-3.1-70b-instruct';

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AppLiveContext {
  vendor: Vendor;
  orders: Order[];
  trains: Record<string, Train>;
  skus: SKU[];
  agents: DeliveryAgent[];
  salesLogs: SalesLog[];
  lang: 'en' | 'hi';
}

export function buildLiveSystemPrompt(ctx: AppLiveContext): string {
  const activeOrders = ctx.orders.filter(o => o.status === 'new' || o.status === 'packing');
  const blockedOrders = ctx.orders.filter(o => o.status === 'blocked' || o.status === 'unresolved');
  const packedOrders = ctx.orders.filter(o => o.status === 'packed');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = ctx.salesLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + l.revenue, 0);

  const trainsList = Object.values(ctx.trains).map(t => {
    const arrTime = new Date(t.actualArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `- Train ${t.trainNumber} (${t.trainName}): PF-${t.platformNumber}, Arrival: ${arrTime}, Halt: ${t.haltMinutes}m, Status: ${t.status}, Delay: ${t.delayMinutes}m`;
  }).join('\n');

  const ordersSummary = activeOrders.map((o, idx) => {
    const itemsStr = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
    const agent = ctx.agents.find(a => a.id === o.deliveryAgentId);
    const agentStr = agent ? `${agent.name} (PF ${agent.currentPlatform})` : 'Auto-assigned at platform';
    return `${idx + 1}. [${o.id}] Status: ${o.status.toUpperCase()} | Train: ${o.trainNumber} (PF ${o.platformNumber}) | Coach: ${o.coachNumber}, Seat: ${o.seatNumber} | Passenger: ${o.passengerName} | Items: ${itemsStr} | Agent: ${agentStr} | EdgeFlag: ${o.edgeFlag}`;
  }).join('\n');

  const stockSummary = ctx.skus.map(s => {
    const isLow = s.stockOnHand <= s.reorderPoint;
    const isInvalid = s.stockOnHand < 0;
    const flag = isInvalid ? '🚨 INVALID' : isLow ? '⚠️ LOW STOCK' : '✅ OK';
    return `- ${s.name}: ${s.stockOnHand} on hand (Reorder at ${s.reorderPoint}, Max ${s.maxStock}) [${flag}]`;
  }).join('\n');

  return `You are "RailQuick AI" (रेलक्विक एआई) — an intelligent, ultra-fast AI Co-Pilot voice & chat assistant for shop/stall vendors at Indian Railway Station platforms (Station: ${ctx.vendor.stationName} - ${ctx.vendor.stationCode}, Shop: ${ctx.vendor.shopName}).

YOUR GOAL: Help the stall owner and packing staff work with lightning speed, never miss a train deadline, answer questions about orders, trains, stock, revenue, and delivery agents immediately in clear, natural Hindi, English, or Hinglish depending on what language the user speaks.

CURRENT REAL-TIME STATION & STALL CONTEXT:
=========================================
1. VENDOR / STALL INFO:
- Station: ${ctx.vendor.stationName} (${ctx.vendor.stationCode})
- Stall: ${ctx.vendor.shopName}
- Platforms Covered: ${ctx.vendor.platformNumbers.join(', ')}
- Platform Walk Buffer: ${ctx.vendor.handoffBufferMinutes} minutes
- Today's Revenue: ₹${todayRevenue.toLocaleString('en-IN')}

2. ACTIVE ORDERS TO PACK RIGHT NOW (${activeOrders.length} active):
${ordersSummary || 'No active orders in queue.'}

3. PACKED & READY ORDERS (${packedOrders.length}):
${packedOrders.map(o => `- ${o.id}: Coach ${o.coachNumber}, Agent assigned, ready for platform dispatch`).join('\n') || 'None'}

4. BLOCKED / ISSUE ORDERS (${blockedOrders.length}):
${blockedOrders.map(o => `- ${o.id}: ${o.blockReason || o.issueNotes || 'Needs staff audit'}`).join('\n') || 'None'}

5. LIVE TRAIN TIMETABLE:
${trainsList}

6. INVENTORY & STOCK LEVELS:
${stockSummary}

7. DELIVERY RUNNER AGENTS:
${ctx.agents.map(a => `- ${a.name}: Platform ${a.currentPlatform}, Available: ${a.isAvailable ? 'Yes' : 'Busy'}, Active deliveries: ${a.assignedOrderIds.length}`).join('\n')}

GUIDELINES FOR YOUR ANSWERS:
- Keep answers SHORT, CRISP, AND ACTIONABLE (1-3 sentences or clear bullet points) suitable for busy railway counter workers.
- If asked "अगला कौन सा पैक करना है?" or "What to pack next?", immediately identify the most urgent order based on the train with the shortest arrival/halt time, name the items, coach, and assigned delivery agent.
- If asked in Hindi, respond in polite, natural conversational Hindi (Devanagari or clean Hinglish).
- Always be helpful, confident, and accurate to the live context provided above.`;
}

export async function askNvidiaAI(
  userQuery: string,
  history: AIChatMessage[],
  ctx: AppLiveContext
): Promise<string> {
  const systemPrompt = buildLiveSystemPrompt(ctx);

  const messages: AIChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userQuery }
  ];

  try {
    const response = await fetch(NVIDIA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        temperature: 0.5,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      return generateLocalFallbackResponse(userQuery, ctx);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) {
      return reply.trim();
    }
    return generateLocalFallbackResponse(userQuery, ctx);
  } catch (error) {
    return generateLocalFallbackResponse(userQuery, ctx);
  }
}

function generateLocalFallbackResponse(query: string, ctx: AppLiveContext): string {
  const q = query.toLowerCase();
  const activeOrders = ctx.orders.filter(o => o.status === 'new' || o.status === 'packing');

  if (q.includes('pack') || q.includes('अगला') || q.includes('next') || q.includes('order') || q.includes('ऑर्डर')) {
    if (activeOrders.length === 0) {
      return ctx.lang === 'hi' 
        ? 'अभी कोई एक्टिव ऑर्डर नहीं है। सब आर्डर पैक हो चुके हैं!' 
        : 'There are no active orders to pack right now. All caught up!';
    }
    const top = activeOrders[0];
    const items = top.items.map(i => `${i.qty}x ${i.name}`).join(', ');
    const agent = ctx.agents.find(a => a.id === top.deliveryAgentId)?.name || 'Platform Agent';

    return ctx.lang === 'hi'
      ? `🚨 सबसे पहले **${top.id}** पैक करें!\n• ट्रेन: ${top.trainName} (${top.trainNumber}) PF-${top.platformNumber}\n• कोच: ${top.coachNumber}, सीट: ${top.seatNumber}\n• सामान: ${items}\n• डिलीवरी एजेंट: ${agent}`
      : `🚨 Pack order **${top.id}** immediately!\n• Train: ${top.trainName} (${top.trainNumber}) PF-${top.platformNumber}\n• Coach: ${top.coachNumber}, Seat: ${top.seatNumber}\n• Items: ${items}\n• Delivery Agent: ${agent}`;
  }

  if (q.includes('train') || q.includes('ट्रेन') || q.includes('arrival') || q.includes('गाड़ी')) {
    const trains = Object.values(ctx.trains);
    const summary = trains.slice(0, 3).map(t => {
      const time = new Date(t.actualArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `• ${t.trainNumber} ${t.trainName}: PF-${t.platformNumber} (${time}, ठहराव ${t.haltMinutes}m)`;
    }).join('\n');

    return ctx.lang === 'hi'
      ? `🚂 लाइव ट्रेन स्थिति:\n${summary}`
      : `🚂 Live Train Status:\n${summary}`;
  }

  if (q.includes('stock') || q.includes('स्टॉक') || q.includes('सामान') || q.includes('item')) {
    const lowStock = ctx.skus.filter(s => s.stockOnHand <= s.reorderPoint);
    if (lowStock.length === 0) {
      return ctx.lang === 'hi' ? '✅ सभी आइटम का स्टॉक पर्याप्त है।' : '✅ All SKU stock levels are healthy.';
    }
    const list = lowStock.map(s => `• ${s.name}: ${s.stockOnHand} बचे (रीऑर्डर: ${s.reorderPoint})`).join('\n');
    return ctx.lang === 'hi'
      ? `⚠️ कम स्टॉक वाले आइटम:\n${list}`
      : `⚠️ Low Stock Alerts:\n${list}`;
  }

  if (q.includes('sale') || q.includes('बिक्री') || q.includes('revenue') || q.includes('कमाई') || q.includes('रुपया')) {
    const todayStr = new Date().toISOString().split('T')[0];
    const rev = ctx.salesLogs.filter(l => l.date === todayStr).reduce((s, l) => s + l.revenue, 0);
    return ctx.lang === 'hi'
      ? `💰 आज की कुल बिक्री: ₹${rev.toLocaleString('en-IN')}`
      : `💰 Today's Total Sales Revenue: ₹${rev.toLocaleString('en-IN')}`;
  }

  return ctx.lang === 'hi'
    ? 'नमस्ते! मैं आपका रेलक्विक एआई असिस्टेंट हूँ। आप मुझसे अगले आर्डर, ट्रेन के समय, स्टॉक या डिलीवरी एजेंट के बारे में पूछ सकते हैं।'
    : 'Hello! I am your RailQuick AI assistant. Ask me about your next order to pack, train schedules, low stock items, or delivery runners.';
}
