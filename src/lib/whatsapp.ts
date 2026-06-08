const ADMIN_CONTACTS = [
  { name: 'Sales', phone: '919629090961' },
  { name: 'Support', phone: '919566266241' },
  { name: 'Manager', phone: '917397612015' },
  { name: 'Admin', phone: '917397612010' },
];

export const openWhatsAppRandom = (productName?: string) => {
  const admin = ADMIN_CONTACTS[Math.floor(Math.random() * ADMIN_CONTACTS.length)];
  const message = productName
    ? `Hi 👋 I am interested in your product *${productName}*. Can you share more details?`
    : `Hi 👋 I am interested in your agriculture products. Can you share more details?`;
  window.open(`https://wa.me/${admin.phone}?text=${encodeURIComponent(message)}`, '_blank');
};

export const openWhatsAppDirect = (index: number, productName?: string) => {
  const admin = ADMIN_CONTACTS[index] || ADMIN_CONTACTS[0];
  const message = productName
    ? `Hi 👋 I am interested in your product *${productName}*. Can you share more details?`
    : `Hi 👋 I need assistance regarding Shastika Global Impex products.`;
  window.open(`https://wa.me/${admin.phone}?text=${encodeURIComponent(message)}`, '_blank');
};

export const ADMIN_LABELS = ['Chat with Sales', 'Chat with Support', 'Chat with Manager', 'Chat with Admin'];

export { ADMIN_CONTACTS };
