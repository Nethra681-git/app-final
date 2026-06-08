import { useState, useEffect, useRef } from 'react';
import { Send, Leaf, Globe, Phone, Mail, Package, Ship, Award, MapPin, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';

// ─── TYPES ────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  html?: boolean;
}

interface ProductSpec {
  emoji: string;
  name: string;
  specs: [string, string][];
  desc: string;
}

// ─── KNOWLEDGE BASE ───────────────────────────────────────────────
const COMPANY = {
  name: 'Global Air Tech Exports (Shastika Global Impex Pvt Ltd)',
  address: 'No 41/2, ST-5, Sathy Athani Main Road, Thuckanayakanpalayam, Erode, Tamil Nadu – 638506',
  phone: '+91 73976 12015',
  whatsapp: 'https://wa.me/917397612015',
  email: 'shastikaglobalimpexpvtltd@gmail.com',
  instagram: 'https://www.instagram.com/shastika_global_impex_pvt_ltd',
  countries: ['Dubai', 'Netherlands', 'Germany', 'Hong Kong', 'North America', 'Australia', 'Mauritius'],
  certifications: ['APEDA Registered', 'FSSAI Certified', 'Phytosanitary Certificate', 'Certificate of Origin', 'DGFT Licensed'],
  capacity: '2 × 40ft Reefer Containers/day • 10 × 40ft Containers/week',
};

const PRODUCT_KB: Record<string, ProductSpec> = {
  'tender coconut': {
    emoji: '🥥', name: 'Tender Coconut (Diamond & Polish)',
    specs: [
      ['Type', 'Diamond & Polish – Young Coconut'],
      ['Weight', '0.9 – 1.5 kg per piece'],
      ['Water Volume', '400 – 550 ml per nut'],
      ['Shelf Life', '2 Months'],
      ['Packing', '9 pieces per carton'],
      ['40ft RF', '18,540 pcs (2010 Cartons)'],
      ['20ft RF', '8,010 pcs (890 Cartons)'],
      ['Delivery', '2–5 days after deposit'],
    ],
    desc: 'Diamond-cut and polished tender coconuts with naturally sweet water, ideal for health-conscious export markets.',
  },
  'green coconut': {
    emoji: '🌿', name: 'Green Coconut',
    specs: [
      ['Weight', '800 – 1200 grams'],
      ['Shape', 'Polished Diamond Shape'],
      ['Water', '400 – 550ml Pure Liquid'],
      ['Shelf Life', '60 Days Premium'],
      ['Packing', '9-Piece Carton'],
      ['40ft RF', '2010 Cartons (18,540 pcs)'],
      ['Delivery', '2–5 days after deposit'],
    ],
    desc: 'Premium green coconuts rich in natural water, sourced from heritage farms with full traceability.',
  },
  'husked coconut': {
    emoji: '🥥', name: 'Husked Coconut',
    specs: [
      ['Colour', 'Brown (Well Matured)'],
      ['Weight', '500 – 600 grams'],
      ['Size', '14–15 Inches'],
      ['Oil Content', '60%–63% Min'],
      ['Packing', '25 Pieces Per Bag'],
      ['Shelf Life', '6 Months'],
      ['Uses', 'Oil Factories, Hotels, Home Kitchens'],
    ],
    desc: 'Well-matured husked coconuts with high oil content, perfect for copra processing and bulk export.',
  },
  'cavendish banana': {
    emoji: '🍌', name: 'Cavendish Banana',
    specs: [
      ['Color', 'Natural Fresh Green'],
      ['Length', '18cm – 25cm (Pulp to Tip)'],
      ['Maturity', '40 to 46 Index'],
      ['Grade', 'Premium Export Quality'],
      ['Net Weight', '4kg, 5kg, 10kg & 20kg Carton'],
      ['Gross Weight', '14.1 kg / Box'],
      ['Box Type', '5-ply Bottom / 3-ply Top Strong Carton'],
      ['Temp', '13.5°C Reefer Controlled'],
      ['Daily Capacity', '2 × 40ft Containers'],
    ],
    desc: 'Hand-selected Cavendish bananas at optimal maturity, trusted by global importers for long-distance reefer shipments.',
  },
  'baby banana': {
    emoji: '🍌', name: 'Baby Banana (Poovan / Elakki)',
    specs: [
      ['Source', 'LBP Canal Belt, Erode'],
      ['Length', '8 cm – 12 cm'],
      ['Net Weight', '2kg, 4kg, 5kg, 10kg, 15kg & 20kg'],
      ['Soil', 'Black Cotton & Alluvial – Gobi region'],
      ['Taste', 'Exceptionally sweet & fragrant'],
    ],
    desc: 'Rare baby bananas sourced exclusively from the LBP canal belt in Erode – prized for their unique sweetness.',
  },
  'nendran banana': {
    emoji: '🍌', name: 'Nendran Banana',
    specs: [
      ['Length', '20–25 cm+'],
      ['Shape', 'Long & Slightly Curved'],
      ['Net Weight', '2kg / 5kg / 8kg / 15kg'],
      ['Packing', 'U-Shape Packing in 5-Ply Export Box'],
      ['Uses', 'Chips, Halwa, Traditional Dishes'],
    ],
    desc: "Premium Nendran bananas – Kerala's prized variety, popular for chips and traditional culinary uses globally.",
  },
  'red banana': {
    emoji: '🍌', name: 'Red Banana (Chenkadali / Sevvalai)',
    specs: [
      ['Source', 'Gobi & Sathyamangalam – LBP Canal Region'],
      ['Maturity', 'Harvested at 85–90%'],
      ['Appearance', 'Deep red/maroon skin, firm texture'],
      ['Weight', '2kg, 4kg, 10kg & 20kg cartons'],
      ['Taste', 'Raspberry-like sweetness'],
    ],
    desc: 'Legendary "Chenkadali" red bananas from Tamil Nadu – a gourmet variety highly prized in global markets.',
  },
  'watermelon': {
    emoji: '🍉', name: 'Watermelon',
    specs: [
      ['Quality', 'Crisp texture, deep red flesh'],
      ['Farming', 'Certified organic Indian farms'],
      ['Packing', 'Heavy-duty corrugated cartons'],
      ['Transit', 'Sea or Air Freight'],
    ],
    desc: 'Premium watermelons grown at peak maturity with naturally high sweetness, ideal for international markets.',
  },
  'black watermelon': {
    emoji: '🍉', name: 'Black Diamond Watermelon',
    specs: [
      ['Variety', 'Premium Black Diamond'],
      ['Grade', 'Export Organic'],
      ['Farming', 'Naturally grown, certified'],
    ],
    desc: 'Rare Black Diamond watermelon – a premium export-grade organic variety.',
  },
  'yellow pumpkin': {
    emoji: '🎃', name: 'Yellow Pumpkin',
    specs: [
      ['Weight', '2–8 kg (Customizable)'],
      ['Flesh', 'Deep Yellow to Orange, firm'],
      ['Shelf Life', '2–3 Months'],
      ['Temp', '10–12°C Controlled'],
      ['Packing', 'HDPE Crates, Net Bags, or Corrugated'],
      ['Modes', 'Sea or Air'],
    ],
    desc: 'Nutrient-rich yellow pumpkins, pre-cooled and graded for export.',
  },
  'white pumpkin': {
    emoji: '🎃', name: 'White Pumpkin (Ash Gourd)',
    specs: [
      ['Weight', '2–8 kg (Customizable)'],
      ['Shelf Life', '2–3 Months'],
      ['Temp', '10–12°C Controlled'],
      ['Uses', 'Medicinal, Culinary, Juice'],
    ],
    desc: 'White pumpkin (ash gourd) valued for medicinal and culinary uses worldwide.',
  },
  'yellow cucumber': {
    emoji: '🥒', name: 'Yellow Cucumber',
    specs: [
      ['Variety', 'Long / Round Type'],
      ['Grading', '2–12 kg (Customizable)'],
      ['Shelf Life', '30–60 Days'],
      ['Packing', 'Net Bags or HDPE Crates'],
      ['Modes', 'Sea & Air Freight'],
    ],
    desc: 'Organic yellow cucumbers with natural protective wax layer, ensuring long shelf life for export.',
  },
  'tomato': {
    emoji: '🍅', name: 'Fresh Export Tomato',
    specs: [
      ['Grade', 'Export Premium'],
      ['Packing', 'Ventilated industrial packaging'],
      ['Source', 'Certified heritage farms'],
      ['Traceability', 'Seed to shelf'],
    ],
    desc: 'Fresh vine-ripened tomatoes from certified heritage farms with complete traceability.',
  },
};

// ─── RESPONSE ENGINE ──────────────────────────────────────────────
function getBotResponse(input: string, t: any, liveProducts: ReturnType<typeof useStore>['products']): { text: string; html: boolean } {
  const q = input.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|வணக்கம்|helo|hai|hii|namaste)/.test(q)) {
    return { html: true, text: t('chatbot_welcome') };
  }

  // Products list
  if (/\b(products?|list|catalog|range|what do you|sell|export all|பொருட்|வகை|catalog)\b/.test(q)) {
    return { html: true, text: t('chatbot_products_list') };
  }

  // Live product from Firebase store
  const liveMatch = liveProducts.find(p => q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q));
  if (liveMatch) {
    return {
      html: true,
      text: `<strong>${liveMatch.name}</strong> 🌿<br/><br/>${liveMatch.description}<br/><br/>
<div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:10px;padding:10px;margin-top:8px;font-size:12px;">
  <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><span style="color:#86efac">Domestic Price</span><span>₹${liveMatch.domesticPrice}/${liveMatch.unit}</span></div>
  <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><span style="color:#86efac">Export Price</span><span>₹${liveMatch.exportPrice}/${liveMatch.unit}</span></div>
  <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><span style="color:#86efac">Available Stock</span><span>${liveMatch.quantity.toLocaleString()} ${liveMatch.unit}</span></div>
  <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><span style="color:#86efac">Packaging</span><span>${liveMatch.packaging}</span></div>
  <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#86efac">Shipping</span><span>${liveMatch.shippingType}</span></div>
</div><br/>
<a href="${COMPANY.whatsapp}" target="_blank" style="color:#4ade80">📱 WhatsApp us for a quote →</a>`,
    };
  }

  // Static product KB
  const kbKeys = Object.keys(PRODUCT_KB);
  const matchedKey = kbKeys.find(k =>
    q.includes(k) || k.split(' ').some(w => w.length > 4 && q.includes(w))
  );
  if (matchedKey) {
    const p = PRODUCT_KB[matchedKey];
    const specRows = p.specs
      .map(([k, v]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.07)"><span style="color:#86efac;font-size:11px">${k}</span><span style="font-size:11px">${v}</span></div>`)
      .join('');
    return {
      html: true,
      text: `${p.emoji} <strong>${p.name}</strong><br/><br/>${p.desc}<br/><br/>
<div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:10px;padding:10px;margin-top:4px">
  <div style="color:#4ade80;font-size:11px;font-weight:600;margin-bottom:6px">📋 SPECIFICATIONS</div>
  ${specRows}
</div><br/>
Interested? <a href="${COMPANY.whatsapp}" target="_blank" style="color:#4ade80">Chat on WhatsApp →</a>`,
    };
  }

  // Shipping
  if (/\b(ship|shipping|transit|sea|air|freight|cargo|reefer|container|deliver|logistic|கப்பல்|விமான)\b/.test(q)) {
    return { html: true, text: t('chatbot_shipping') };
  }

  // Packaging
  if (/\b(pack|packaging|box|carton|crate|bag|ispm|அட்டை|பை)\b/.test(q)) {
    return { html: true, text: t('chatbot_packaging') };
  }

  // Countries
  if (/\b(countr|nation|export to|where|market|destination|dubai|europe|australia|germany|hong kong|நாட|ஏற்றுமதி செய்)\b/.test(q)) {
    return { html: true, text: t('chatbot_countries') };
  }

  // Certifications / Quality
  if (/\b(certif|quality|standard|apeda|fssai|phyto|organic|audit|சான்று|தரம்|license)\b/.test(q)) {
    return { html: true, text: t('chatbot_certifications') };
  }

  // Quote / Price
  if (/\b(price|pric|quote|cost|rate|₹|\$|how much|minimum|moq|order|buy|purchase|விலை|மேற்கோள்)\b/.test(q)) {
    return { html: true, text: t('chatbot_quote') };
  }

  // Contact
  if (/\b(contact|reach|call|phone|email|whatsapp|address|location|visit|office|தொடர்பு|முகவரி)\b/.test(q)) {
    return { html: true, text: t('chatbot_contact') };
  }

  // About / Capacity
  if (/\b(about|company|who are|capacity|supply|erode|tamil|founded|நிறுவனம்|திறன்)\b/.test(q)) {
    return { html: true, text: t('chatbot_about') };
  }

  // Documentation
  if (/\b(doc|document|phyto|origin|custom|clearance|ஆவண)\b/.test(q)) {
    return { html: true, text: t('chatbot_docs') };
  }

  // Thanks
  if (/\b(thank|thanks|நன்றி)\b/.test(q)) {
    return { html: false, text: t('chatbot_thanks') };
  }

  // Default
  return { html: true, text: t('chatbot_default') };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
const ShastikaChatbot = () => {
  const { t, i18n } = useTranslation();
  const { products } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [msgId, setMsgId] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chips = [
    { label: t('chatbot_chip_products'), query: t('chatbot_chip_products_query') },
    { label: t('chatbot_chip_shipping'), query: t('chatbot_chip_shipping_query') },
    { label: t('chatbot_chip_quote'), query: t('chatbot_chip_quote_query') },
    { label: t('chatbot_chip_countries'), query: t('chatbot_chip_countries_query') },
    { label: t('chatbot_chip_certifications'), query: t('chatbot_chip_certifications_query') },
    { label: t('chatbot_chip_contact'), query: t('chatbot_chip_contact_query') },
  ];

  // Welcome message on mount & lang change
  useEffect(() => {
    setMessages(prev => {
      const welcomeMsg: Message = {
        id: 0,
        role: 'bot',
        html: true,
        text: t('chatbot_welcome_mount'),
      };
      if (prev.length === 0) return [welcomeMsg];
      
      const newMessages = [...prev];
      if (newMessages[0].id === 0) {
        newMessages[0] = welcomeMsg;
      }
      return newMessages;
    });
  }, [i18n.language, t]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMsg = (text: string, html: boolean) => {
    setMsgId(prev => {
      const newId = prev + 1;
      setMessages(m => [...m, { id: newId, role: 'bot', text, html }]);
      return newId;
    });
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const uid = msgId + 1;
    setMsgId(uid);
    setMessages(m => [...m, { id: uid, role: 'user', text, html: false }]);
    setInput('');
    setIsTyping(true);

    const delay = 600 + Math.min(text.length * 6, 1200);
    setTimeout(() => {
      setIsTyping(false);
      const { text: resp, html } = getBotResponse(text, t, products);
      addBotMsg(resp, html);
    }, delay);
  };

  const toggleLang = () => {
    const nextInfo = i18n.language.startsWith('ta') ? 'en' : 'ta';
    i18n.changeLanguage(nextInfo);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in max-w-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-gradient-to-r from-green-900 to-green-700 border border-green-600/40 shadow-lg shadow-green-900/30">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-2xl animate-pulse">
            🥥
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-green-900 animate-ping" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-white text-base tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
            SHASTIKA CHATBOT
          </h1>
          <p className="text-green-200 text-xs">Global Air Tech Export Assistant • Online</p>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs rounded-full border border-white/20 transition-all duration-200 font-medium"
        >
          <Globe className="w-3 h-3" />
          {i18n.language.startsWith('ta') ? 'English' : 'தமிழ்'}
        </button>
      </div>

      {/* ── QUICK CHIPS ── */}
      <div className="flex gap-2 flex-wrap mb-3 px-1">
        {chips.map(chip => (
          <button
            key={chip.label}
            onClick={() => sendMessage(chip.query)}
            className="text-xs px-3 py-1.5 rounded-full border border-green-700/50 bg-green-950/50 text-green-300 hover:bg-green-800/50 hover:border-green-500 hover:text-white transition-all duration-200 whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border/50 bg-card/60 p-4 space-y-4 mb-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm
                ${msg.role === 'bot'
                  ? 'bg-green-900 border border-green-600'
                  : 'bg-blue-900 border border-blue-600'
                }`}
            >
              {msg.role === 'bot' ? '🥥' : '👤'}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm border border-border/30'
                }`}
            >
              {msg.html
                ? <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                : <span className="whitespace-pre-wrap">{msg.text}</span>
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-green-900 border border-green-600 flex items-center justify-center text-sm">
              🥥
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center border border-border/30">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 px-4 py-2.5 border border-input rounded-full bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600 transition-all placeholder:text-muted-foreground"
          placeholder={t('chatbot_input_placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-900/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* ── FOOTER ── */}
      <p className="text-center text-[10px] text-muted-foreground/40 mt-2 tracking-wide">
        Global Air Tech Exports • Erode, Tamil Nadu • 
        <a href={COMPANY.whatsapp} target="_blank" className="text-green-600/50 hover:text-green-500 ml-1">
          WhatsApp
        </a>
      </p>
    </div>
  );
};

export default ShastikaChatbot;
