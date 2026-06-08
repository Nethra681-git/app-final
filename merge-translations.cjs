const fs = require('fs');

const en = {
  "chatbot_welcome": "Hello! 👋 I'm <strong>Shastika Chatbot</strong> – your export assistant at <strong>Global Air Tech</strong>.<br/><br/>I can help with:<br/>🥥 Product specs & live pricing<br/>🚢 Shipping & packaging info<br/>🌍 Export destinations (7+ countries)<br/>✅ Certifications & quality standards<br/>💰 Custom quotes & enquiries",
  "chatbot_products_list": "We export <strong>16 premium products</strong> from Tamil Nadu:<br/><br/><strong>🥥 Coconut Range:</strong><br/>• Tender Coconut (Diamond & Polish)<br/>• Green Coconut • Husked Coconut<br/>• Semi-Husked • Dehusked Coconut<br/><br/><strong>🍌 Banana Range:</strong><br/>• Cavendish Banana • Baby Banana (Poovan)<br/>• Nendran Banana • Red Banana (Chenkadali)<br/><br/><strong>🥬 Vegetables & Fruits:</strong><br/>• Watermelon • Black Diamond Watermelon<br/>• Yellow Pumpkin • White Pumpkin<br/>• Yellow Cucumber • Tomato<br/><br/>Ask about any product for full specs! 🌿",
  "chatbot_shipping": "<strong>🚢 Shipping & Logistics</strong><br/><br/><strong>Sea Freight (Reefer):</strong><br/>• 20ft & 40ft Reefer Containers<br/>• Temperature-controlled at 13.5°C<br/>• 15–30 days transit time<br/><br/><strong>Air Freight:</strong><br/>• 2–5 days delivery<br/>• Ideal for perishables & urgent orders<br/><br/><strong>Capacity:</strong><br/>• Daily: 2 × 40ft Reefer Containers<br/>• Weekly: 10 × 40ft Containers<br/>• Delivery: <strong>2–5 days after deposit</strong>",
  "chatbot_packaging": "<strong>📦 Export-Grade Packaging</strong><br/><br/><strong>Bananas:</strong><br/>• 5-ply High-Strength Telescopic Corrugated Boxes<br/>• Sizes: 2kg, 4kg, 5kg, 10kg, 15kg, 20kg<br/><br/><strong>Coconuts (Tender/Green):</strong><br/>• 9-piece cartons per box<br/>• Diamond cut & polished<br/><br/><strong>Vegetables:</strong><br/>• HDPE Crates | Net Bags | Corrugated Cartons<br/>• 10–20 kg per package<br/><br/><strong>Husked Coconuts:</strong><br/>• 25 pieces per jute bag<br/>• Tamper-proof packaging<br/><br/>All packaging meets <strong>ISPM-15 international standards</strong>.",
  "chatbot_countries": "<strong>🌍 Our Export Destinations:</strong><br/><br/>• Dubai<br/>• Netherlands<br/>• Germany<br/>• Hong Kong<br/>• North America<br/>• Australia<br/>• Mauritius<br/><br/>We accommodate <strong>custom destinations</strong> based on buyer requirements.<br/><br/><a href='tel:+917397612015' style='color:#4ade80'>📞 +91 73976 12015</a>",
  "chatbot_certifications": "<strong>✅ Quality Certifications</strong><br/><br/>• <strong>APEDA Registered</strong><br/>• <strong>FSSAI Certified</strong><br/>• <strong>Phytosanitary Certificate</strong><br/>• <strong>Certificate of Origin</strong><br/>• <strong>DGFT Licensed</strong><br/><br/><strong>Quality Assurance:</strong><br/>• Hand-selected at optimal maturity<br/>• 3-stage quality inspection<br/>• Cold chain maintained throughout<br/>• Full traceability – farm to port<br/>• Phytosanitary inspected per shipment<br/>• Compliant with importing country regulations",
  "chatbot_quote": "<strong>💰 Get a Custom Price Quote</strong><br/><br/>Prices vary by product, quantity & shipping mode.<br/><br/>• <a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>📱 WhatsApp: +91 73976 12015</a><br/>• 📧 <a href='mailto:shastikaglobalimpexpvtltd@gmail.com' style='color:#4ade80'>shastikaglobalimpexpvtltd@gmail.com</a><br/><br/>Please share:<br/>✓ Product type & variety<br/>✓ Quantity (kg or containers)<br/>✓ Market type (Domestic / Export)<br/>✓ Destination country<br/><br/>We respond within <strong>24 hours</strong>. 🌿",
  "chatbot_contact": "<strong>📞 Contact Global Air Tech</strong><br/><br/>🏢 <strong>Shastika Global Impex Pvt Ltd</strong><br/>📍 No 41/2, ST-5, Sathy Athani Main Road, Thuckanayakanpalayam, Erode, Tamil Nadu – 638506<br/><br/>📞 <a href='tel:+917397612015' style='color:#4ade80'>+91 73976 12015</a><br/>📱 <a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>WhatsApp Us</a><br/>📧 <a href='mailto:shastikaglobalimpexpvtltd@gmail.com' style='color:#4ade80'>shastikaglobalimpexpvtltd@gmail.com</a><br/>📸 <a href='https://www.instagram.com/shastika_global_impex_pvt_ltd' target='_blank' style='color:#4ade80'>Instagram</a>",
  "chatbot_about": "<strong>🏭 About Global Air Tech Exports</strong><br/><br/><strong>Shastika Global Impex Pvt Ltd</strong> is a premium agricultural export company based in Erode, Tamil Nadu.<br/><br/><strong>Export Capacity:</strong><br/>• 2 × 40ft Reefer Containers/day • 10 × 40ft Containers/week<br/><br/><strong>Products:</strong> 16+ varieties<br/><strong>Markets:</strong> Dubai, Netherlands, Germany, Hong Kong, North America, Australia, Mauritius<br/><br/><strong>Certifications:</strong><br/>• APEDA Registered<br/>• FSSAI Certified<br/>• Phytosanitary Certificate<br/>• Certificate of Origin<br/>• DGFT Licensed",
  "chatbot_docs": "<strong>📋 Export Documentation</strong><br/><br/>We handle all export documentation:<br/><br/>• <strong>Phytosanitary Certificate</strong> – Per shipment<br/>• <strong>Certificate of Origin</strong> – APEDA certified<br/>• <strong>FSSAI Certificate</strong> – Food safety<br/>• <strong>Packing List & Invoice</strong><br/>• <strong>Bill of Lading / Airway Bill</strong><br/>• <strong>DGFT License</strong><br/><br/>All docs comply with <strong>importing country regulations</strong>.<br/><br/><a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>📱 Contact for specific docs →</a>",
  "chatbot_thanks": "You're welcome! 😊 Feel free to ask anything else. Have a great day! 🌿",
  "chatbot_default": "Hmm, I didn't catch that! 😊 Try asking about:<br/><br/>• <strong>Products</strong> – Coconuts, bananas, vegetables<br/>• <strong>Shipping</strong> – Sea / Air freight methods<br/>• <strong>Pricing</strong> – Get a custom quote<br/>• <strong>Countries</strong> – Export destinations<br/>• <strong>Contact</strong> – Phone / WhatsApp<br/><br/><a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>📱 WhatsApp: +91 73976 12015</a>",
  "chatbot_input_placeholder": "Ask about products, shipping, quotes...",
  "chatbot_welcome_mount": "Hello! 👋 I'm <strong>Shastika Chatbot</strong> – your export assistant at <strong>Global Air Tech</strong>.<br/><br/>I can help with:<br/>🥥 Product specs & live pricing<br/>🚢 Shipping & packaging info<br/>🌍 Export destinations (7+ countries)<br/>✅ Certifications & quality standards<br/>💰 Custom quotes & enquiries",
  "chatbot_chip_products": "🌿 Products",
  "chatbot_chip_products_query": "Show all products",
  "chatbot_chip_shipping": "🚢 Shipping",
  "chatbot_chip_shipping_query": "Tell me about shipping methods",
  "chatbot_chip_quote": "💰 Get Quote",
  "chatbot_chip_quote_query": "How do I get a price quote?",
  "chatbot_chip_countries": "🌍 Countries",
  "chatbot_chip_countries_query": "Which countries do you export to?",
  "chatbot_chip_certifications": "✅ Certifications",
  "chatbot_chip_certifications_query": "What certifications do you have?",
  "chatbot_chip_contact": "📞 Contact",
  "chatbot_chip_contact_query": "What is your contact information?"
};

const ta = {
  "chatbot_welcome": "வணக்கம்! 🥥 நான் <strong>Shastika Chatbot</strong> – Global Air Tech-இன் ஏற்றுமதி உதவியாளர்.<br/><br/>தேங்காய், வாழை, காய்கறிகள் – தமிழ்நாட்டிலிருந்து உலகளாவிய ஏற்றுமதி செய்கிறோம்.<br/><br/>விலை மேற்கோள் அல்லது பொருள் விவரம் வேண்டுமா?",
  "chatbot_products_list": "நாங்கள் ஏற்றுமதி செய்யும் <strong>16 பொருட்கள்</strong>:<br/><br/><strong>🥥 தேங்காய் வகைகள்:</strong><br/>• Tender Coconut • Green Coconut<br/>• Husked • Semi-Husked • Dehusked<br/><br/><strong>🍌 வாழை வகைகள்:</strong><br/>• Cavendish • Baby Banana<br/>• Nendran • Red Banana<br/><br/><strong>🥬 காய்கறிகள் & பழங்கள்:</strong><br/>• Watermelon • Black Diamond Watermelon<br/>• Yellow Pumpkin • White Pumpkin<br/>• Yellow Cucumber • Tomato<br/><br/>ஒரு குறிப்பிட்ட பொருளை கேளுங்கள்!",
  "chatbot_shipping": "<strong>🚢 கப்பல் & விமான சேவைகள்</strong><br/><br/><strong>கடல் வழி (Sea Freight):</strong><br/>• 20ft & 40ft Reefer Containers<br/>• 13.5°C Temperature Controlled<br/>• 15–30 days transit<br/><br/><strong>வான் வழி (Air Freight):</strong><br/>• 2–5 days delivery<br/>• அழிகின்ற பொருட்களுக்கு ஏற்றது<br/><br/><strong>திறன்:</strong><br/>• Daily: 2 × 40ft Containers<br/>• Weekly: 10 × 40ft Containers<br/>• Delivery: 2–5 days after deposit",
  "chatbot_packaging": en.chatbot_packaging,
  "chatbot_countries": "<strong>🌍 நாம் ஏற்றுமதி செய்யும் நாடுகள்:</strong><br/><br/>• Dubai<br/>• Netherlands<br/>• Germany<br/>• Hong Kong<br/>• North America<br/>• Australia<br/>• Mauritius<br/><br/>புதிய நாடுகளுக்கும் ஏற்பாடு செய்யலாம்.<br/>📞 +91 73976 12015",
  "chatbot_certifications": en.chatbot_certifications,
  "chatbot_quote": "<strong>💰 விலை மேற்கோள் பெறுங்கள்</strong><br/><br/>விலை பொருள், அளவு மற்றும் சந்தையைப் பொறுத்து மாறும்.<br/><br/>• <a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>📱 WhatsApp: +91 73976 12015</a><br/>• 📧 shastikaglobalimpexpvtltd@gmail.com<br/><br/>தேவையான தகவல்கள்:<br/>✓ பொருள் வகை ✓ அளவு<br/>✓ Domestic / Export ✓ நாடு",
  "chatbot_contact": en.chatbot_contact,
  "chatbot_about": en.chatbot_about,
  "chatbot_docs": en.chatbot_docs,
  "chatbot_thanks": "நன்றி! 😊 மேலும் எதாவது தேவைப்பட்டால் கேளுங்கள். நல்ல நாளாக இருக்கட்டும்! 🌾",
  "chatbot_default": "மன்னிக்கவும்! கீழேயுள்ளவற்றை கேளுங்கள்:<br/><br/>• <strong>பொருட்கள்</strong> – தேங்காய், வாழை, காய்கறிகள்<br/>• <strong>கப்பல்</strong> – Sea / Air freight<br/>• <strong>விலை மேற்கோள்</strong> – Quote பெறுங்கள்<br/>• <strong>நாடுகள்</strong> – ஏற்றுமதி சந்தைகள்<br/>• <strong>தொடர்பு</strong> – Phone / WhatsApp<br/><br/><a href='https://wa.me/917397612015' target='_blank' style='color:#4ade80'>📱 WhatsApp: +91 73976 12015</a>",
  "chatbot_input_placeholder": "பொருட்கள், கப்பல், விலை பற்றி கேளுங்கள்...",
  "chatbot_welcome_mount": "வணக்கம்! 🥥 நான் <strong>Shastika Chatbot</strong> – Global Air Tech-இன் ஏற்றுமதி உதவியாளர்.<br/><br/>கேட்கலாம்:<br/>🥥 பொருள் விவரங்கள் & விலைகள்<br/>🚢 கப்பல் & பேக்கேஜிங்<br/>🌍 ஏற்றுமதி நாடுகள்<br/>✅ சான்றிதழ்கள் & தரம்<br/>💰 விலை மேற்கோள்",
  "chatbot_chip_products": "🌿 பொருட்கள்",
  "chatbot_chip_products_query": "பொருட்கள் பட்டியல்",
  "chatbot_chip_shipping": "🚢 கப்பல்",
  "chatbot_chip_shipping_query": "கப்பல் முறைகள் பற்றி சொல்லுங்கள்",
  "chatbot_chip_quote": "💰 விலை",
  "chatbot_chip_quote_query": "விலை மேற்கோள் எப்படி பெறுவது?",
  "chatbot_chip_countries": "🌍 நாடுகள்",
  "chatbot_chip_countries_query": "எந்த நாடுகளுக்கு ஏற்றுமதி செய்கிறீர்கள்?",
  "chatbot_chip_certifications": "✅ சான்றிதழ்",
  "chatbot_chip_certifications_query": "உங்கள் சான்றிதழ்கள் என்ன?",
  "chatbot_chip_contact": "📞 தொடர்பு",
  "chatbot_chip_contact_query": "தொடர்பு விவரங்கள்"
};

const map = { en, ta, hi: en };
for (const [lang, translations] of Object.entries(map)) {
  const path = './src/locales/' + lang + '.json';
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path));
    Object.assign(data, translations);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }
}
