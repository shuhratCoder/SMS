// Моковые данные для SMS Broadcast Admin Panel

export interface Contact {
  id: string;
  name: string;
  phone: string;
  flag: string;
  country: string;
  position: string;
  group: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  members: number;
  lastUsed: string;
  color: string;
  initial: string;
}

export interface SmsHistory {
  id: string;
  recipient: string;
  recipientAvatar?: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
}

export interface DashboardStats {
  totalContacts: number;
  activeGroups: number;
  smsSentToday: number;
  smsSentMonth: number;
  deliveryRate: number;
}

export interface SmsActivity {
  id: string;
  message: string;
  recipients: number;
  status: 'sent' | 'failed' | 'pending';
  time: string;
}

export interface ChartData {
  day: string;
  sent: number;
  delivered: number;
  failed: number;
}

// Контакты
export const contacts: Contact[] = [
  { id: '1', name: 'John Doe', phone: '+1 555 123 4567', flag: '🇺🇸', country: 'USA', position: 'Manager', group: 'Marketing Team', status: 'active' },
  { id: '2', name: 'Jane Smith', phone: '+1 555 987 6543', flag: '🇺🇸', country: 'USA', position: 'Sales Rep', group: 'Clients', status: 'active' },
  { id: '3', name: 'Michael Brown', phone: '+44 20 7946 0958', flag: '🇬🇧', country: 'UK', position: 'Marketing', group: 'Marketing Team', status: 'active' },
  { id: '4', name: 'Linda Johnson', phone: '+44 7911 123456', flag: '🇬🇧', country: 'UK', position: 'HR', group: 'Tech Support', status: 'inactive' },
  { id: '5', name: 'Robert Thompson', phone: '+1 555 654 1234', flag: '🇺🇸', country: 'USA', position: 'Director', group: 'VIP Customers', status: 'active' },
  { id: '6', name: 'Emily Davis', phone: '+1 555 333 7890', flag: '🇩🇪', country: 'Germany', position: 'Customer Support', group: 'Clients', status: 'active' },
  { id: '7', name: 'James Wilson', phone: '+49 30 12345678', flag: '🇩🇪', country: 'Germany', position: 'IT Specialist', group: 'Tech Support', status: 'active' },
  { id: '8', name: 'Amanda Parker', phone: '+49 191 2345678', flag: '🇩🇪', country: 'Germany', position: 'Accounts', group: 'Clients', status: 'active' },
  { id: '9', name: 'David Martinez', phone: '+34 912 345678', flag: '🇪🇸', country: 'Spain', position: 'Developer', group: 'Tech Support', status: 'active' },
  { id: '10', name: 'Sofia Garcia', phone: '+34 678 901234', flag: '🇪🇸', country: 'Spain', position: 'Designer', group: 'Marketing Team', status: 'inactive' },
  { id: '11', name: 'Javlon Aliyev', phone: '+998 90 123 4567', flag: '🇺🇿', country: 'Uzbekistan', position: 'CEO', group: 'VIP Customers', status: 'active' },
  { id: '12', name: 'Hasan Sultonov', phone: '+998 91 987 6543', flag: '🇺🇿', country: 'Uzbekistan', position: 'CTO', group: 'Tech Support', status: 'active' },
  { id: '13', name: 'Akmal Tursunov', phone: '+998 93 456 7890', flag: '🇺🇿', country: 'Uzbekistan', position: 'Sales Manager', group: 'Leads', status: 'active' },
  { id: '14', name: 'Pierre Dubois', phone: '+33 1 23 45 67 89', flag: '🇫🇷', country: 'France', position: 'Partner', group: 'VIP Customers', status: 'active' },
  { id: '15', name: 'Yuki Tanaka', phone: '+81 3 1234 5678', flag: '🇯🇵', country: 'Japan', position: 'Engineer', group: 'Tech Support', status: 'active' },
];

// Группы
export const groups: Group[] = [
  { id: '1', name: 'Marketing Team', members: 18, lastUsed: '30 min ago', color: 'from-purple-500 to-pink-500', initial: 'M' },
  { id: '2', name: 'Clients', members: 25, lastUsed: '1 hour ago', color: 'from-blue-500 to-cyan-500', initial: 'C' },
  { id: '3', name: 'Sales Department', members: 12, lastUsed: '2 hours ago', color: 'from-orange-500 to-yellow-500', initial: 'S' },
  { id: '4', name: 'Tech Support', members: 15, lastUsed: 'Yesterday', color: 'from-green-500 to-teal-500', initial: 'T' },
  { id: '5', name: 'VIP Customers', members: 8, lastUsed: '3 days ago', color: 'from-yellow-500 to-orange-500', initial: 'V' },
  { id: '6', name: 'Leads', members: 21, lastUsed: '3 days ago', color: 'from-indigo-500 to-purple-500', initial: 'L' },
];

// История SMS
export const smsHistory: SmsHistory[] = [
  { id: '1', recipient: 'Javlon Ali', message: 'Urgent meeting. Be there...', status: 'sent', sentAt: '30 min ago' },
  { id: '2', recipient: 'Hasan Sultonov', message: 'Your account has been tag...', status: 'delivered', sentAt: '2 hours ago' },
  { id: '3', recipient: 'Sales Department', message: "There's more happening be-", status: 'sent', sentAt: 'Yesterday' },
  { id: '4', recipient: 'Akmal Tursunov', message: 'Urgent meeting. be gptaber-', status: 'sent', sentAt: '3 days ago' },
  { id: '5', recipient: 'Marketing Team', message: "Don't forget: New campaig...", status: 'sent', sentAt: '3 days ago' },
  { id: '6', recipient: 'John Doe', message: 'Your order has been confirmed.', status: 'delivered', sentAt: '4 days ago' },
  { id: '7', recipient: 'Jane Smith', message: 'Meeting rescheduled to 3 PM...', status: 'failed', sentAt: '5 days ago' },
  { id: '8', recipient: 'VIP Customers', message: 'Exclusive offer just for you!', status: 'pending', sentAt: '5 days ago' },
  { id: '9', recipient: 'Tech Support', message: 'System maintenance tonight at...', status: 'delivered', sentAt: '6 days ago' },
  { id: '10', recipient: 'Michael Brown', message: 'Please review the attached doc', status: 'sent', sentAt: '1 week ago' },
];

// Статистика дашборда
export const dashboardStats: DashboardStats = {
  totalContacts: 1200,
  activeGroups: 15,
  smsSentToday: 380,
  smsSentMonth: 8500,
  deliveryRate: 96.3,
};

// Данные для графика
export const chartData: ChartData[] = [
  { day: 'M', sent: 120, delivered: 115, failed: 5 },
  { day: 'T', sent: 150, delivered: 142, failed: 8 },
  { day: 'W', sent: 180, delivered: 175, failed: 5 },
  { day: 'T', sent: 160, delivered: 152, failed: 8 },
  { day: 'F', sent: 230, delivered: 220, failed: 10 },
  { day: 'S', sent: 190, delivered: 185, failed: 5 },
  { day: 'S', sent: 210, delivered: 200, failed: 10 },
];

// Последние активности
export const recentActivities: SmsActivity[] = [
  { id: '1', message: "We're having a meeting at 3 PM today.", recipients: 57, status: 'sent', time: 'just now' },
  { id: '2', message: 'Special offer today: 20% off all items!', recipients: 182, status: 'failed', time: '15m ago' },
  { id: '3', message: 'Hello! Please confirm your attendance.', recipients: 72, status: 'pending', time: '1h ago' },
  { id: '4', message: 'Reminder: Tomorrow is the project deadline.', recipients: 25, status: 'failed', time: '2h ago' },
];

// Top группы для дашборда
export const topGroups = [
  { name: 'Marketing Team', members: 23, lastActivity: '30m ago', mentions: 18 },
  { name: 'Sales Department', members: 12, lastActivity: '22m ago', mentions: 12 },
];
