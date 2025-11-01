// Admin Applications: Fetch and render list from backend
(function() {
  const API_URL = window.GUIDE_API_URL || 'http://localhost:5000';
  const tableBody = document.querySelector('#appsTable tbody');
  const errorBox = document.getElementById('errorBox');
  const refreshBtn = document.getElementById('refreshBtn');

  async function fetchList() {
    try {
      errorBox.style.display = 'none';
      
      // Get stored credentials or prompt for them
      let credentials = getStoredCredentials();
      if (!credentials) {
        credentials = await promptForCredentials();
        if (!credentials) return; // User cancelled
      }
      
      const resp = await fetch(`${API_URL}/api/guides/applications`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        credentials: 'include'
      });
      
      if (resp.status === 401) {
        // Clear invalid credentials and retry
        clearStoredCredentials();
        credentials = await promptForCredentials();
        if (!credentials) return;
        
        const retryResp = await fetch(`${API_URL}/api/guides/applications`, {
          headers: {
            'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
          },
          credentials: 'include'
        });
        
        if (!retryResp.ok) throw new Error(`Authentication failed (${retryResp.status})`);
        const data = await retryResp.json();
        storeCredentials(credentials);
        renderRows(data.items || []);
        return;
      }
      
      if (!resp.ok) throw new Error(`Server ${resp.status}`);
      const data = await resp.json();
      storeCredentials(credentials);
      renderRows(data.items || []);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7">Failed to load applications.</td></tr>`;
      errorBox.textContent = `Error: ${err.message}`;
      errorBox.style.display = 'block';
      console.error('Admin list fetch error:', err);
    }
  }

  function renderRows(items) {
    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="7">No applications found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = items.map(item => {
      const resume = item.resume ? `<span class="tag">Yes</span>` : `<span class="tag">No</span>`;
      const video = item.video ? `<span class="tag">Yes</span>` : `<span class="tag">No</span>`;
      const submitted = item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-';
      const viewLink = `admin-applications.html#${encodeURIComponent(item.id)}`;
      const detailBtn = `<button class="btn btn-outline" data-id="${encodeURIComponent(item.id)}">Details</button>`;
      return `<tr>
        <td>${submitted}</td>
        <td>${escapeHtml(item.fullName || '')}</td>
        <td>${escapeHtml(item.email || '')}</td>
        <td>${escapeHtml(item.location || '')}</td>
        <td>${resume}</td>
        <td>${video}</td>
        <td class="actions">${detailBtn}</td>
      </tr>`;
    }).join('');

    // Wire detail buttons
    tableBody.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => loadDetails(btn.getAttribute('data-id')));
    });
  }

  async function loadDetails(id) {
    try {
      const credentials = getStoredCredentials();
      if (!credentials) {
        alert('Please refresh the page to authenticate');
        return;
      }
      
      const resp = await fetch(`${API_URL}/api/guides/applications/${encodeURIComponent(id)}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        credentials: 'include'
      });
      
      if (resp.status === 401) {
        clearStoredCredentials();
        alert('Authentication expired. Please refresh the page.');
        return;
      }
      
      if (!resp.ok) throw new Error(`Server ${resp.status}`);
      const data = await resp.json();
      showDetails(data);
    } catch (err) {
      alert(`Failed to load details: ${err.message}`);
    }
  }

  function showDetails(d) {
    const lines = [
      `Submitted: ${d.submittedAt || '-'}`,
      `Name: ${d.fullName || '-'}`,
      `Email: ${d.email || '-'}`,
      `Phone: ${d.phone || '-'}`,
      `Location: ${d.location || '-'}`,
      `Languages: ${d.languages || '-'}`,
      `Experience Years: ${d.experienceYears || '-'}`,
      `Resume: ${d.files && d.files.resume ? 'Yes' : 'No'}`,
      `Video: ${d.files && d.files.video ? 'Yes' : 'No'}`,
    ];
    alert(lines.join('\n'));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  // Authentication helper functions
  function getStoredCredentials() {
    const stored = sessionStorage.getItem('adminCredentials');
    return stored ? JSON.parse(stored) : null;
  }

  function storeCredentials(credentials) {
    sessionStorage.setItem('adminCredentials', JSON.stringify(credentials));
  }

  function clearStoredCredentials() {
    sessionStorage.removeItem('adminCredentials');
  }

  function promptForCredentials() {
    return new Promise((resolve) => {
      const modal = document.getElementById('loginModal');
      const form = document.getElementById('loginForm');
      const cancelBtn = document.getElementById('cancelLogin');
      
      // Show modal
      modal.style.display = 'flex';
      
      // Handle form submission
      const handleSubmit = (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username && password) {
          modal.style.display = 'none';
          form.removeEventListener('submit', handleSubmit);
          cancelBtn.removeEventListener('click', handleCancel);
          resolve({ username, password });
        }
      };
      
      // Handle cancel
      const handleCancel = () => {
        modal.style.display = 'none';
        form.removeEventListener('submit', handleSubmit);
        cancelBtn.removeEventListener('click', handleCancel);
        resolve(null);
      };
      
      form.addEventListener('submit', handleSubmit);
      cancelBtn.addEventListener('click', handleCancel);
      
      // Focus username field
      document.getElementById('username').focus();
    });
  }

  refreshBtn?.addEventListener('click', fetchList);
  fetchList();
})();