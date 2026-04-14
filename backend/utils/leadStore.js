const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const leadsFilePath = path.join(dataDir, 'customer-leads.json');

const DEFAULT_WHATSAPP_BROADCAST_NUMBER = process.env.WHATSAPP_BROADCAST_NUMBER || '919999999999';
const DEFAULT_WHATSAPP_GROUP_INVITE_LINK =
  process.env.WHATSAPP_GROUP_INVITE_LINK || 'https://chat.whatsapp.com/EXAMPLEGROUPLINK';

const ensureLeadFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(leadsFilePath)) {
    fs.writeFileSync(leadsFilePath, JSON.stringify({ leads: [] }, null, 2), 'utf8');
  }
};

const readLeadData = () => {
  ensureLeadFile();
  try {
    const raw = fs.readFileSync(leadsFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.leads)) return { leads: [] };
    return parsed;
  } catch (_error) {
    return { leads: [] };
  }
};

const saveLeadData = (data) => {
  ensureLeadFile();
  fs.writeFileSync(leadsFilePath, JSON.stringify(data, null, 2), 'utf8');
};

const extractPhone = (text = '') => {
  const phoneMatch = text.match(/(\+?\d[\d\s-]{7,14}\d)/);
  return phoneMatch ? phoneMatch[1].replace(/[\s-]/g, '') : '';
};

const extractName = (text = '') => {
  const nameMatch = text.match(/(?:my name is|name is|i am|i'm)\s+([a-zA-Z ]{2,50})/i);
  return nameMatch ? nameMatch[1].trim() : '';
};

const appendLead = ({
  source,
  name,
  phone,
  note = '',
  orderId = null
}) => {
  if (!phone && !name) return null;

  const data = readLeadData();
  const lead = {
    id: `lead-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    source,
    name: name || 'Unknown',
    phone: phone || 'Not provided',
    note,
    orderId,
    whatsappBroadcastNumber: DEFAULT_WHATSAPP_BROADCAST_NUMBER,
    whatsappGroupInviteLink: DEFAULT_WHATSAPP_GROUP_INVITE_LINK,
    createdAt: new Date().toISOString()
  };

  data.leads.unshift(lead);
  saveLeadData(data);
  return lead;
};

module.exports = {
  appendLead,
  extractPhone,
  extractName,
  getWhatsAppDefaults: () => ({
    whatsappBroadcastNumber: DEFAULT_WHATSAPP_BROADCAST_NUMBER,
    whatsappGroupInviteLink: DEFAULT_WHATSAPP_GROUP_INVITE_LINK
  })
};
