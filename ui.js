// ============================================================
// SHARED UI COMPONENTS
// ============================================================

function buildSidebar(activeItem) {
  const session = APP.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  const roleConfig = {
    student: {
      label: 'Student Portal',
      navItems: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: 'student-dashboard.html' },
        { id: 'submit', icon: '➕', label: 'Submit Complaint', href: '#submit-modal' },
        { id: 'my-complaints', icon: '📋', label: 'My Complaints', href: '#my-complaints' },
        { id: 'all-complaints', icon: '🌐', label: 'All Complaints', href: '#all-complaints' },
        { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', href: '#leaderboard' },
      ]
    },
    team: {
      label: APP.TEAMS[session.teamId]?.label || 'Maintenance Team',
      navItems: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: 'team-dashboard.html' },
        { id: 'assigned', icon: '📌', label: 'Assigned Issues', href: '#assigned' },
        { id: 'in-progress', icon: '⚙️', label: 'In Progress', href: '#in-progress' },
        { id: 'resolved', icon: '✅', label: 'Resolved', href: '#resolved' },
      ]
    },
    admin: {
      label: 'Admin Panel',
      navItems: [
        { id: 'dashboard', icon: '🏠', label: 'Overview', href: 'admin-dashboard.html' },
        { id: 'complaints', icon: '📋', label: 'All Complaints', href: '#complaints' },
        { id: 'analytics', icon: '📊', label: 'Analytics', href: '#analytics' },
        { id: 'teams', icon: '👥', label: 'Teams', href: '#teams' },
        { id: 'escalated', icon: '⚠️', label: 'Escalated', href: '#escalated' },
      ]
    }
  };

  const config = roleConfig[session.role] || roleConfig.student;
  const escalatedCount = APP.getComplaints().filter(c => c.status === 'escalated').length;

  const html = `
    <div class="sidebar-logo">
      <div class="logo-icon">🏛️</div>
      <div class="logo-text">
        <h3>Campus IMS</h3>
        <span>Smart Issue System</span>
      </div>
    </div>
    <div class="sidebar-role">${config.label}</div>
    <nav class="sidebar-nav">
      <div class="sidebar-nav-label">Navigation</div>
      ${config.navItems.map(item => `
        <a class="nav-item ${activeItem === item.id ? 'active' : ''}" href="${item.href}" data-section="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.id === 'escalated' && escalatedCount > 0 ? `<span class="nav-badge">${escalatedCount}</span>` : ''}
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-bottom:10px;padding:0 4px;">
        <span style="font-size:0.9rem;">👤</span> ${session.name || session.teamName || 'User'}
      </div>
      <button class="logout-btn" onclick="logout()">
        <span>🚪</span> Logout
      </button>
    </div>
  `;

  document.getElementById('sidebar').innerHTML = html;

  // Mobile sidebar logic
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').style.display = 'block';
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').style.display = 'none';
  });
}

function logout() {
  APP.clearSession();
  window.location.href = 'login.html';
}

function buildTopbar(title, subtitle) {
  const darkOn = localStorage.getItem('scims_dark') === '1';
  if (darkOn) document.documentElement.setAttribute('data-theme', 'dark');
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-subtitle').textContent = subtitle || '';
  const toggle = document.getElementById('dark-toggle');
  if (darkOn) toggle.classList.add('on');
  toggle.addEventListener('click', () => {
    const on = document.documentElement.getAttribute('data-theme') === 'dark';
    if (on) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('scims_dark', '0'); toggle.classList.remove('on'); }
    else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('scims_dark', '1'); toggle.classList.add('on'); }
  });
}

function renderComplaintCard(c, options = {}) {
  const { showAssign = false, showStatusChange = false, showDelete = false, showUpvote = true } = options;
  const cat = APP.CATEGORIES[c.category] || APP.CATEGORIES.other;
  const pri = APP.PRIORITIES[c.priority] || APP.PRIORITIES.low;
  const isEscalated = c.status === 'escalated';
  const userId = getUserId();
  const hasVoted = (c.upvotedBy || []).includes(userId);
  const timelineStep = APP.STATUSES[c.status]?.step ?? 0;

  const steps = ['pending', 'under-review', 'in-progress', 'resolved'];

  return `
    <div class="complaint-card ${isEscalated ? 'escalated' : ''} anim-fade-up" data-id="${c.id}">
      ${c.image ? `<img class="card-image" src="${c.image}" alt="Issue photo" loading="lazy"/>` : ''}
      <div class="card-header">
        <div class="card-category">
          <span class="cat-badge" style="color:${cat.color};border-color:${cat.color}20;background:${cat.color}12">
            ${cat.icon} ${cat.label}
          </span>
          <span class="priority-badge priority-${c.priority}">${pri.icon} ${pri.label}</span>
        </div>
        <span class="status-badge status-${c.status}">${APP.STATUSES[c.status]?.label || c.status}</span>
      </div>
      <div class="card-title">${escapeHtml(c.description.substring(0, 80))}${c.description.length > 80 ? '…' : ''}</div>
      <div class="card-meta flex gap-2 flex-wrap mb-4" style="font-size:0.8rem;color:var(--text-muted)">
        <span>📍 ${escapeHtml(c.location)}</span>
        <span>👤 ${escapeHtml(c.name)}</span>
        <span>🆔 ${c.id}</span>
      </div>
      ${isEscalated ? '' : `
      <div class="timeline">
        ${steps.map((s, i) => {
          const sData = APP.STATUSES[s];
          const cStep = timelineStep;
          const isDone = i < cStep;
          const isCurrent = i === cStep;
          return `<div class="timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
            <div class="step-dot">${isDone ? '✓' : i + 1}</div>
            <div class="step-label">${sData.label}</div>
          </div>`;
        }).join('')}
      </div>`}
      <div class="card-footer">
        <div>
          <div class="card-time">${timeAgo(c.timestamp)}</div>
          ${c.assignedTeam ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">👥 ${APP.TEAMS[c.assignedTeam]?.label || c.assignedTeam}</div>` : ''}
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          ${showUpvote ? `
            <button class="upvote-btn ${hasVoted ? 'voted' : ''}" onclick="handleUpvote('${c.id}', this)">
              👍 <span class="upvote-count">${c.upvotes}</span>
            </button>` : ''}
          ${showStatusChange ? `
            <select class="status-select" onchange="handleStatusChange('${c.id}', this.value)" style="font-size:0.78rem;">
              ${Object.entries(APP.STATUSES).map(([k, v]) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>` : ''}
          ${showAssign ? `
            <select class="assign-select" onchange="handleAssign('${c.id}', this.value)">
              ${Object.entries(APP.TEAMS).map(([k, v]) => `<option value="${k}" ${c.assignedTeam === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>` : ''}
          ${showDelete ? `<button class="btn btn-sm btn-danger" onclick="handleDelete('${c.id}')">🗑️</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderStats(containerId, stats) {
  const cards = [
    { label: 'Total Complaints', value: stats.total, icon: '📋', color: 'var(--primary)' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'var(--secondary)' },
    { label: 'Pending', value: stats.pending, icon: '⏳', color: 'var(--warning)' },
    { label: 'Escalated', value: stats.escalated, icon: '🚨', color: 'var(--danger)' },
  ];
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = cards.map((c, i) => `
    <div class="stat-card" style="--card-color: ${c.color}; animation-delay: ${i * 0.08}s">
      <div class="stat-card-icon">${c.icon}</div>
      <div class="stat-value" data-target="${c.value}">0</div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join('');
  container.querySelectorAll('.stat-value').forEach(el => {
    animateCounter(el, parseInt(el.dataset.target));
  });
}

function renderCategoryChart(containerId, byCategory) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...Object.values(byCategory), 1);
  el.innerHTML = Object.entries(byCategory)
    .filter(([,v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const cat = APP.CATEGORIES[k];
      return `
        <div class="chart-bar">
          <div class="bar-label">${cat.icon} ${cat.label}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:0%;background:${cat.color}" data-target="${(v/max*100).toFixed(1)}"></div>
          </div>
          <div class="bar-value">${v}</div>
        </div>`;
    }).join('') || '<div class="empty-state"><p>No data yet</p></div>';
  setTimeout(() => {
    el.querySelectorAll('.bar-fill').forEach(b => b.style.width = b.dataset.target + '%');
  }, 100);
}

function renderLocationHeatmap(containerId, byLocation) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sorted = Object.entries(byLocation).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(...sorted.map(([,v]) => v), 1);
  el.innerHTML = sorted.map(([loc, count]) => `
    <div class="heatmap-bar">
      <div class="heatmap-location"><span>${loc}</span><span style="font-weight:700;color:var(--primary)">${count}</span></div>
      <div class="heatmap-track">
        <div class="heatmap-fill" style="width:0%" data-target="${(count/max*100).toFixed(1)}%"></div>
      </div>
    </div>
  `).join('') || '<div class="empty-state"><p>No location data</p></div>';
  setTimeout(() => {
    el.querySelectorAll('.heatmap-fill').forEach(b => b.style.width = b.dataset.target);
  }, 100);
}

function renderLeaderboard(containerId, leaderboard) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = leaderboard.length ? leaderboard.map(([name, count], i) => `
    <div class="leaderboard-item">
      <div class="rank-badge rank-${i < 3 ? i+1 : 'other'}">${i + 1}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:0.9rem">${escapeHtml(name)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${count} complaint${count > 1 ? 's' : ''} reported</div>
      </div>
      <div style="font-size:1.2rem">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</div>
    </div>
  `).join('') : '<p class="text-muted text-sm">No data yet</p>';
}

function renderDailyChart(containerId, byDay) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const entries = Object.entries(byDay);
  const max = Math.max(...entries.map(([,v]) => v), 1);
  el.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:8px;height:100px;padding-bottom:20px;position:relative">
      ${entries.map(([day, val]) => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:0.7rem;font-weight:700;color:var(--primary)">${val || ''}</div>
          <div style="flex:1;width:100%;background:linear-gradient(180deg,var(--primary),var(--purple));border-radius:4px 4px 0 0;
            min-height:4px;height:${val ? Math.max(10, (val/max*80)) : 4}px;opacity:${val ? 1 : 0.2};transition:height 1s ease"></div>
          <div style="font-size:0.62rem;color:var(--text-muted);text-align:center;writing-mode:vertical-rl;transform:rotate(180deg);max-height:36px;overflow:hidden">${day.split(' ')[0]}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Upvote handler (shared)
function handleUpvote(id, btn) {
  const userId = getUserId();
  APP.upvoteComplaint(id, userId);
  const c = APP.getComplaints().find(x => x.id === id);
  if (c) {
    btn.querySelector('.upvote-count').textContent = c.upvotes;
    btn.classList.toggle('voted', (c.upvotedBy || []).includes(userId));
    showToast((c.upvotedBy || []).includes(userId) ? '👍 Upvoted!' : 'Upvote removed', 'info');
  }
}
