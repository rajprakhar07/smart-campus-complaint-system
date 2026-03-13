// ============================================================
// SMART CAMPUS ISSUE MANAGEMENT SYSTEM - Core App Logic
// ============================================================

const APP = {
  STORAGE_KEY: 'scims_complaints',
  USERS_KEY: 'scims_users',
  SESSION_KEY: 'scims_session',

  CATEGORIES: {
    washroom: { label: 'Washroom', icon: '🚿', color: '#6366f1', keywords: ['washroom', 'toilet', 'bathroom', 'flush', 'sink', 'urinal', 'wc'] },
    water: { label: 'Water', icon: '💧', color: '#0ea5e9', keywords: ['water', 'tap', 'pipe', 'leak', 'flood', 'drain', 'plumbing'] },
    electricity: { label: 'Electricity', icon: '⚡', color: '#f59e0b', keywords: ['light', 'power', 'fan', 'electric', 'switch', 'socket', 'ac', 'air condition', 'bulb', 'wiring'] },
    wifi: { label: 'WiFi', icon: '📶', color: '#8b5cf6', keywords: ['wifi', 'internet', 'network', 'connection', 'signal', 'router', 'bandwidth'] },
    canteen: { label: 'Canteen', icon: '🍽️', color: '#f97316', keywords: ['canteen', 'food', 'cafeteria', 'meal', 'eat', 'cook', 'kitchen', 'hygiene', 'stale'] },
    cleanliness: { label: 'Cleanliness', icon: '🧹', color: '#10b981', keywords: ['dirty', 'smell', 'garbage', 'clean', 'waste', 'trash', 'dust', 'pest', 'rat', 'cockroach', 'mosquito'] },
    furniture: { label: 'Furniture', icon: '🪑', color: '#ec4899', keywords: ['chair', 'table', 'bench', 'desk', 'furniture', 'broken', 'door', 'window', 'glass'] },
    other: { label: 'Other', icon: '📋', color: '#64748b', keywords: [] }
  },

  TEAMS: {
    cleaning: { label: 'Cleaning Team', categories: ['washroom', 'cleanliness'], color: '#10b981' },
    water: { label: 'Water Team', categories: ['water'], color: '#0ea5e9' },
    electrical: { label: 'Electrical Team', categories: ['electricity', 'wifi'], color: '#f59e0b' },
    canteen: { label: 'Canteen Team', categories: ['canteen'], color: '#f97316' },
    maintenance: { label: 'Maintenance Team', categories: ['furniture', 'other'], color: '#6366f1' }
  },

  LOCATIONS: [
    'Main Block - Ground Floor', 'Main Block - 1st Floor', 'Main Block - 2nd Floor', 'Main Block - 3rd Floor',
    'Science Block - Ground Floor', 'Science Block - 1st Floor', 'Science Block - 2nd Floor',
    'Library - Ground Floor', 'Library - 1st Floor',
    'Canteen Area', 'Sports Complex', 'Hostel Block A', 'Hostel Block B', 'Hostel Block C',
    'Admin Block', 'Seminar Hall', 'Computer Lab', 'Parking Area', 'Garden Area'
  ],

  PRIORITIES: {
    low: { label: 'Low', color: '#10b981', icon: '🟢' },
    medium: { label: 'Medium', color: '#f59e0b', icon: '🟡' },
    high: { label: 'High', color: '#ef4444', icon: '🔴' },
    critical: { label: 'Critical', color: '#7c3aed', icon: '🟣' }
  },

  STATUSES: {
    pending: { label: 'Pending', color: '#64748b', step: 0 },
    'under-review': { label: 'Under Review', color: '#f59e0b', step: 1 },
    'in-progress': { label: 'In Progress', color: '#0ea5e9', step: 2 },
    resolved: { label: 'Resolved', color: '#10b981', step: 3 },
    escalated: { label: 'Escalated', color: '#ef4444', step: -1 }
  },

  // ---- DATA FUNCTIONS ----
  getComplaints() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  },

  saveComplaints(complaints) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new CustomEvent('complaintsUpdated', { detail: complaints }));
  },

  addComplaint(data) {
    const complaints = this.getComplaints();
    const id = 'CMP-' + Date.now();
    const auto = this.autoDetectCategory(data.description || '');
    const complaint = {
      id,
      name: data.anonymous ? 'Anonymous' : (data.name || 'Unknown'),
      rollNumber: data.anonymous ? '****' : (data.rollNumber || ''),
      location: data.location || '',
      category: data.category || auto.category,
      description: data.description || '',
      priority: data.priority || auto.priority,
      image: data.image || null,
      status: 'pending',
      upvotes: 0,
      upvotedBy: [],
      assignedTeam: this.autoAssignTeam(data.category || auto.category),
      timestamp: new Date().toISOString(),
      timeline: [{ status: 'pending', time: new Date().toISOString(), note: 'Complaint submitted' }],
      resolutionNotes: '',
      anonymous: data.anonymous || false
    };
    complaints.unshift(complaint);
    this.saveComplaints(complaints);
    return complaint;
  },

  updateComplaintStatus(id, status, note = '') {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    complaints[idx].status = status;
    complaints[idx].timeline.push({ status, time: new Date().toISOString(), note });
    if (note) complaints[idx].resolutionNotes = note;
    this.saveComplaints(complaints);
    return true;
  },

  upvoteComplaint(id, userId) {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const c = complaints[idx];
    if (!c.upvotedBy) c.upvotedBy = [];
    if (c.upvotedBy.includes(userId)) {
      c.upvotedBy = c.upvotedBy.filter(u => u !== userId);
      c.upvotes = Math.max(0, c.upvotes - 1);
    } else {
      c.upvotedBy.push(userId);
      c.upvotes++;
    }
    this.saveComplaints(complaints);
    return true;
  },

  deleteComplaint(id) {
    const complaints = this.getComplaints().filter(c => c.id !== id);
    this.saveComplaints(complaints);
  },

  assignTeam(id, team) {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    complaints[idx].assignedTeam = team;
    this.saveComplaints(complaints);
    return true;
  },

  autoDetectCategory(description) {
    const text = description.toLowerCase();
    for (const [key, cat] of Object.entries(this.CATEGORIES)) {
      if (key === 'other') continue;
      if (cat.keywords.some(kw => text.includes(kw))) {
        const priority = ['washroom', 'electricity', 'water'].includes(key) ? 'high' : 'medium';
        return { category: key, priority };
      }
    }
    return { category: 'other', priority: 'low' };
  },

  autoAssignTeam(category) {
    for (const [key, team] of Object.entries(this.TEAMS)) {
      if (team.categories.includes(category)) return key;
    }
    return 'maintenance';
  },

  checkEscalations() {
    const complaints = this.getComplaints();
    let changed = false;
    const now = Date.now();
    complaints.forEach(c => {
      if (c.status === 'pending' || c.status === 'under-review') {
        const age = now - new Date(c.timestamp).getTime();
        if (age > 48 * 60 * 60 * 1000) {
          c.status = 'escalated';
          changed = true;
        }
      }
    });
    if (changed) this.saveComplaints(complaints);
  },

  getStats() {
    const complaints = this.getComplaints();
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const escalated = complaints.filter(c => c.status === 'escalated').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const mostUpvoted = [...complaints].sort((a, b) => b.upvotes - a.upvotes)[0] || null;

    // By category
    const byCategory = {};
    Object.keys(this.CATEGORIES).forEach(k => byCategory[k] = 0);
    complaints.forEach(c => { if (byCategory[c.category] !== undefined) byCategory[c.category]++; });

    // By location
    const byLocation = {};
    complaints.forEach(c => {
      byLocation[c.location] = (byLocation[c.location] || 0) + 1;
    });

    // By day (last 7 days)
    const byDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      byDay[key] = 0;
    }
    complaints.forEach(c => {
      const d = new Date(c.timestamp);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      if (byDay[key] !== undefined) byDay[key]++;
    });

    // Leaderboard
    const reporters = {};
    complaints.filter(c => !c.anonymous).forEach(c => {
      reporters[c.name] = (reporters[c.name] || 0) + 1;
    });
    const leaderboard = Object.entries(reporters).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { total, resolved, pending, escalated, inProgress, mostUpvoted, byCategory, byLocation, byDay, leaderboard };
  },

  getSession() {
    return JSON.parse(sessionStorage.getItem(this.SESSION_KEY) || 'null');
  },

  setSession(data) {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
  },

  clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  // Generate sample data
  seedSampleData() {
    if (this.getComplaints().length > 0) return;
    const samples = [
      { name: 'Rahul Sharma', rollNumber: 'CSE2021001', location: 'Main Block - 3rd Floor', category: 'washroom', description: 'Washroom has been dirty for 3 days, flush not working', priority: 'high', status: 'pending', upvotes: 24 },
      { name: 'Sneha Patel', rollNumber: 'ECE2021045', location: 'Science Block - 2nd Floor', category: 'electricity', description: 'Power socket not working in lab room 204', priority: 'high', status: 'in-progress', upvotes: 18 },
      { name: 'Arjun Mehta', rollNumber: 'ME2022012', location: 'Library - 1st Floor', category: 'wifi', description: 'WiFi signal very weak in the reading room', priority: 'medium', status: 'under-review', upvotes: 15 },
      { name: 'Priya Singh', rollNumber: 'CSE2022034', location: 'Canteen Area', category: 'canteen', description: 'Food quality has deteriorated, stale food being served', priority: 'critical', status: 'pending', upvotes: 31 },
      { name: 'Anonymous', rollNumber: '****', location: 'Hostel Block A', category: 'water', description: 'Water leakage in corridor near room 105', priority: 'high', status: 'resolved', upvotes: 12, anonymous: true },
      { name: 'Rahul Sharma', rollNumber: 'CSE2021001', location: 'Main Block - 1st Floor', category: 'cleanliness', description: 'Garbage not cleared from common area since 2 days', priority: 'medium', status: 'escalated', upvotes: 9 },
      { name: 'Kavita Joshi', rollNumber: 'MBA2023005', location: 'Seminar Hall', category: 'furniture', description: 'Several chairs are broken in seminar hall 2', priority: 'low', status: 'resolved', upvotes: 7 },
      { name: 'Deepak Kumar', rollNumber: 'IT2021078', location: 'Computer Lab', category: 'electricity', description: 'AC not working in computer lab, very hot', priority: 'high', status: 'in-progress', upvotes: 22 },
    ];
    const now = Date.now();
    const complaints = samples.map((s, i) => ({
      id: 'CMP-' + (now - i * 3600000),
      name: s.name,
      rollNumber: s.rollNumber,
      location: s.location,
      category: s.category,
      description: s.description,
      priority: s.priority,
      image: null,
      status: s.status,
      upvotes: s.upvotes,
      upvotedBy: [],
      assignedTeam: APP.autoAssignTeam(s.category),
      timestamp: new Date(now - i * 5 * 3600000 - (i > 4 ? 50 * 3600000 : 0)).toISOString(),
      timeline: [{ status: 'pending', time: new Date(now - i * 5 * 3600000).toISOString(), note: 'Complaint submitted' }],
      resolutionNotes: s.status === 'resolved' ? 'Issue has been fixed by maintenance team.' : '',
      anonymous: s.anonymous || false
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(complaints));
  }
};

// Utility functions
function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  document.body.appendChild(div);
  return div;
}

function animateCounter(el, target, duration = 1000) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

function getUserId() {
  let uid = localStorage.getItem('scims_uid');
  if (!uid) { uid = 'user_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('scims_uid', uid); }
  return uid;
}

function ripple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  circle.style.cssText = `width:${diameter}px;height:${diameter}px;left:${e.clientX - btn.getBoundingClientRect().left - radius}px;top:${e.clientY - btn.getBoundingClientRect().top - radius}px`;
  circle.classList.add('ripple-effect');
  btn.querySelector('.ripple-effect')?.remove();
  btn.appendChild(circle);
}

// Init
APP.seedSampleData();
APP.checkEscalations();
