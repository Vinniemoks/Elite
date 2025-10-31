// Admin Applications: Fetch and render list from backend
(function() {
  const API_URL = window.GUIDE_API_URL || 'http://localhost:5000';
  const tableBody = document.querySelector('#appsTable tbody');
  const errorBox = document.getElementById('errorBox');
  const refreshBtn = document.getElementById('refreshBtn');

  async function fetchList() {
    try {
      errorBox.style.display = 'none';
      const resp = await fetch(`${API_URL}/api/guides/applications`);
      if (!resp.ok) throw new Error(`Server ${resp.status}`);
      const data = await resp.json();
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
      const resp = await fetch(`${API_URL}/api/guides/applications/${id}`);
      if (!resp.ok) throw new Error(`Server ${resp.status}`);
      const data = await resp.json();
      alert(formatDetails(data));
    } catch (err) {
      alert('Failed to load application details.');
      console.error('Detail load error:', err);
    }
  }

  function formatDetails(d) {
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
    return lines.join('\n');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  refreshBtn?.addEventListener('click', fetchList);
  fetchList();
})();