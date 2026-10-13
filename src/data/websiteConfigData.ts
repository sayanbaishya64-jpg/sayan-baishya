import { WebsiteConfig } from '../types';

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  cafeName: 'CyberPoint Online',
  tagline: 'Authorized Digital Seva Kendra · PAN, Aadhaar, Exams & Online Forms',
  phone: '+91 98765 43210',
  whatsappPhone: '+919876543210',
  email: 'desk@cyberpointonline.in',
  address: 'Shop No. 12, Main Market Road, Near City Post Office & Tehsil Complex',
  hours: 'Mon - Sat: 8:30 AM – 9:00 PM | Sun: 10:00 AM – 6:00 PM',
  heroHeadline: 'Every Cyber Cafe Service, Now Accessible From Your Screen.',
  heroSubtitle:
    'Browse official government and cyber cafe charges transparently. Submit applications online with verified document review, send print orders remotely, or book an express counter slot to skip the queue.',
  announcementText:
    '⚡ Notice: SSC CGL 2026 & State Police form fillings are currently active at Counter 1. Book an express appointment to avoid the evening rush!',
  announcementEnabled: true,
  stat1Value: '14,500+',
  stat1Label: 'Forms filed with 0% error',
  stat2Value: '100%',
  stat2Label: 'Upfront fee transparency',
  stat3Value: '15 Mins',
  stat3Label: 'Express appointment slot',
  bwPrintRate: 2,
  colorPrintRate: 5,
  laminationRate: 20,
  spiralBindingRate: 40,
  urgentFee: 30,
};

const CONFIG_STORAGE_KEY = 'cyberpoint_website_config_v1';

export function getStoredWebsiteConfig(): WebsiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_WEBSITE_CONFIG;
    return { ...DEFAULT_WEBSITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WEBSITE_CONFIG;
  }
}

export function saveStoredWebsiteConfig(cfg: WebsiteConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save website config locally:', e);
  }
}
