import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'en' | 'hi';

const LANG_KEY = 'rq_lang';
const LANG_EVENT = 'rq_lang_change';

const T: Record<string, Record<Lang, string>> = {
  // App Header
  'app.name': { en: 'RailQuick', hi: 'रेलक्विक' },
  'app.online': { en: 'ONLINE', hi: 'ऑनलाइन' },
  'app.offline': { en: 'OFFLINE', hi: 'ऑफलाइन' },
  'app.today': { en: 'today', hi: 'आज' },
  'app.revenue': { en: 'Revenue', hi: 'आमदनी' },
  'app.aiCopilot': { en: 'AI Co-Pilot', hi: 'एआई को-पायलट' },

  // Navigation
  'nav.orders': { en: 'Orders', hi: 'ऑर्डर' },
  'nav.trains': { en: 'Trains', hi: 'ट्रेन' },
  'nav.ai': { en: 'AI Voice', hi: 'AI बातचीत' },
  'nav.stock': { en: 'Stock', hi: 'स्टॉक' },
  'nav.sales': { en: 'Sales', hi: 'बिक्री' },
  'nav.more': { en: 'Settings', hi: 'सेटिंग' },

  // Live Queue & Urgency
  'queue.liveOrders': { en: 'Live Orders Queue', hi: 'लाइव ऑर्डर क़तार' },
  'queue.packNow': { en: 'PACK THIS NOW', hi: 'अभी तुरंत पैक करें' },
  'queue.startPacking': { en: 'Start Packing', hi: 'पैकिंग शुरू' },
  'queue.markPacked': { en: 'Mark Packed ✓', hi: 'पैक हुआ ✓' },
  'queue.handoverAgent': { en: 'Handover to Agent', hi: 'एजेंट को सौंपें' },
  'queue.remaining': { en: 'remaining', hi: 'बाकी' },
  'queue.checklist': { en: 'Checklist', hi: 'जांच' },
  'queue.active': { en: 'Active Queue', hi: 'सक्रिय क़तार' },
  'queue.issues': { en: 'Issues & Blocked', hi: 'समस्याग्रस्त' },
  'queue.done': { en: 'Completed', hi: 'पूर्ण' },
  'queue.shortHalt': { en: 'Short Halt', hi: 'कम ठहराव' },
  'queue.nextInQueue': { en: 'Next in Queue', hi: 'आगे के ऑर्डर' },
  'queue.allCaughtUp': { en: 'All orders packed!', hi: 'सभी ऑर्डर पैक हो चुके हैं!' },
  'queue.watching': { en: 'Watching for new orders...', hi: 'नए ऑर्डर्स का इंतज़ार...' },
  'queue.priority': { en: 'Priority', hi: 'प्राथमिकता' },
  'queue.assignedAgent': { en: 'Delivery Agent', hi: 'डिलीवरी एजेंट' },
  'queue.urgentPriority': { en: 'URGENT PRIORITY', hi: 'अत्यंत महत्वपूर्ण' },
  'queue.highPriority': { en: 'HIGH PRIORITY', hi: 'उच्च प्राथमिकता' },
  'queue.normalPriority': { en: 'NORMAL', hi: 'सामान्य' },

  // Train Board
  'trains.board': { en: 'Live Train Board', hi: 'लाइव ट्रेन बोर्ड' },
  'trains.liveStation': { en: 'Platform Timetable', hi: 'प्लेटफ़ॉर्म समय-सारिणी' },
  'trains.approaching': { en: 'Approaching', hi: 'आ रही है' },
  'trains.atPlatform': { en: 'At Platform', hi: 'प्लेटफ़ॉर्म पर' },
  'trains.departed': { en: 'Departed', hi: 'जा चुकी' },
  'trains.halt': { en: 'halt', hi: 'ठहराव' },
  'trains.sched': { en: 'Sched', hi: 'नि.समय' },
  'trains.actual': { en: 'Actual', hi: 'असल' },
  'trains.pendingOrders': { en: 'orders pending', hi: 'ऑर्डर बाकी' },
  'trains.noOrders': { en: 'No active orders', hi: 'कोई ऑर्डर नहीं' },
  'trains.delayed': { en: 'LATE', hi: 'लेट' },
  'trains.critical': { en: 'CRITICAL HALT', hi: 'गंभीर ठहराव' },

  // Stock
  'stock.title': { en: 'Stock Inventory', hi: 'स्टॉक इन्वेंटरी' },
  'stock.aiClassifier': { en: 'AI Edge-State Intelligence Active', hi: 'AI स्टॉक स्थिति सक्रिय' },
  'stock.all': { en: 'All Items', hi: 'सभी आइटम' },
  'stock.alerts': { en: 'Stock Alerts', hi: 'स्टॉक अलर्ट' },
  'stock.restock': { en: 'Restock +10', hi: 'स्टॉक +10' },
  'stock.stockOnHand': { en: 'In Stock', hi: 'स्टॉक में' },
  'stock.reorderAt': { en: 'Reorder at', hi: 'पुनः ऑर्डर' },
  'stock.daily': { en: 'Daily avg', hi: 'रोज़ाना' },
  'stock.hoursLeft': { en: 'hrs left', hi: 'घंटे बचे' },
  'stock.ordersAffected': { en: 'Orders Affected', hi: 'प्रभावित ऑर्डर' },
  'stock.whyBlocked': { en: 'Why Blocked?', hi: 'क्यों रुका?' },

  // Edge States
  'edge.ok': { en: 'OK', hi: 'ठीक है' },
  'edge.nearLimit': { en: 'Near Limit', hi: 'कम स्टॉक' },
  'edge.overLimit': { en: 'Over Limit', hi: 'अधिक स्टॉक' },
  'edge.invalid': { en: 'INVALID', hi: 'गड़बड़' },

  // Order Status
  'status.new': { en: 'NEW', hi: 'नया' },
  'status.packing': { en: 'PACKING', hi: 'पैकिंग' },
  'status.packed': { en: 'PACKED', hi: 'पैक' },
  'status.blocked': { en: 'BLOCKED', hi: 'रुका' },
  'status.partial': { en: 'PARTIAL', hi: 'आंशिक' },
  'status.unresolved': { en: 'UNRESOLVED', hi: 'अनसुलझा' },
  'status.dispatched': { en: 'DISPATCHED', hi: 'भेजा गया' },

  // AI Voice Assistant
  'ai.title': { en: 'RailQuick AI Assistant', hi: 'रेलक्विक एआई असिस्टेंट' },
  'ai.alert': { en: 'AI Priority Insight', hi: 'AI प्राथमिकता सूचना' },
  'ai.missTrain': { en: 'Miss-Train Risk!', hi: 'ट्रेन छूटने का ख़तरा!' },
  'ai.packBy': { en: 'Pack', hi: 'पैक करें' },
  'ai.orDeparts': { en: 'before train leaves', hi: 'वरना ट्रेन निकल जाएगी' },
  'ai.speakMic': { en: 'Tap mic to speak', hi: 'बोलने के लिए माइक दबाएं' },
  'ai.listening': { en: 'Listening...', hi: 'सुन रहा हूँ...' },
  'ai.thinking': { en: 'Thinking...', hi: 'सोच रहा हूँ...' },
  'ai.suggest1': { en: 'Which order should I pack next?', hi: 'अगला कौन सा आर्डर पैक करूं?' },
  'ai.suggest2': { en: 'Which trains are arriving soon?', hi: 'कौन सी ट्रेनें आ रही हैं?' },

  // Sales
  'sales.title': { en: 'Sales Performance', hi: 'बिक्री रिपोर्ट' },
  'sales.today': { en: "Today's Summary", hi: 'आज का विवरण' },
  'sales.revenue': { en: 'Revenue', hi: 'कमाई' },
  'sales.onTime': { en: 'On-Time Delivery %', hi: 'समय पर डिलीवरी %' },
  'sales.avgPack': { en: 'Avg Packing Time', hi: 'औसत पैक समय' },
  'sales.sold': { en: 'Units Sold', hi: 'बिके आइटम' },
  'sales.topItems': { en: 'Top Selling Food Items', hi: 'सर्वाधिक बिकने वाले आइटम' },
  'sales.export': { en: 'Export CSV', hi: 'CSV डाउनलोड' },

  // Settings
  'settings.title': { en: 'Stall Settings & Simulator', hi: 'दुकान सेटिंग व सिमुलेटर' },
  'settings.buffer': { en: 'Platform Walk Buffer (minutes)', hi: 'प्लेटफ़ॉर्म तक पहुँचने का समय (मिनट)' },
  'settings.language': { en: 'App Language', hi: 'ऐप की भाषा' },
  'settings.simulator': { en: 'Live Order Simulator', hi: 'लाइव ऑर्डर सिमुलेटर' },
  'settings.reset': { en: 'Reset Demo Data', hi: 'डेटा रीसेट करें' },

  // Buttons
  'btn.save': { en: 'Save', hi: 'सहेजें' },
  'btn.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'btn.resolve': { en: 'Resolve', hi: 'सुलझाएं' },
  'btn.escalate': { en: 'Escalate', hi: 'आगे बढ़ाएं' },

  // Checklist
  'checklist.title': { en: 'Packing Item Checklist', hi: 'पैकिंग आइटम सूची' },
  'checklist.checkAll': { en: 'Check all items before marking packed', hi: 'पैक करने से पहले सभी आइटम टिक करें' },
  'checklist.reportIssue': { en: 'Report an Issue with Order', hi: 'ऑर्डर में समस्या दर्ज करें' },
  'checklist.issueDesc': { en: 'Describe the issue (e.g. out of stock, delay)...', hi: 'समस्या लिखें (जैसे स्टॉक खत्म, देरी)...' },
  'checklist.submitIssue': { en: 'Submit Issue', hi: 'समस्या दर्ज करें' },
};

export function translate(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(LANG_KEY) as Lang) ?? 'en'
  );

  useEffect(() => {
    const handler = (e: Event) => {
      setLangState((e as CustomEvent<Lang>).detail);
    };
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
    window.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: l }));
  };

  const t = (key: string) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
