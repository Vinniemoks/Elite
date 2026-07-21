// Staff portal - service requests (leads) + recent bookings. ADMIN only.

document.addEventListener('DOMContentLoaded', async function () {
    const guard = document.getElementById('staff-guard');
    const main = document.getElementById('staff-main');
    const esc = EliteAPI.escapeHtml;

    const SERVICE_LABELS = {
        AIRPORT_TRANSFER: 'Airport Transfer',
        DESTINATION_TRIP: 'Destination Trip',
        CONSULTATION: 'Consultation',
        SECURITY: 'Private Security',
        CAR_HIRE: 'Car Hire',
        GENERAL: 'General Inquiry'
    };

    // ---- Access gate ----
    const user = EliteAPI.getUser();
    if (!EliteAPI.isLoggedIn()) {
        window.location.href = 'login.html?redirect=staff.html';
        return;
    }
    if (!user || user.userType !== 'ADMIN') {
        guard.innerHTML = '<p><i class="fas fa-lock"></i> This portal is for Elite Tours staff only.</p><p style="margin-top:12px;"><a href="index.html" class="btn btn-primary">Back to site</a></p>';
        return;
    }

    guard.style.display = 'none';
    main.style.display = 'block';

    document.getElementById('filter-status').addEventListener('change', loadLeads);
    document.getElementById('filter-type').addEventListener('change', loadLeads);
    document.getElementById('refresh-btn').addEventListener('click', (e) => { e.preventDefault(); loadLeads(); });

    await Promise.all([loadLeads(), loadBookings()]);

    // ---- Leads ----
    async function loadLeads() {
        const tbody = document.getElementById('leads-body');
        const params = {};
        const status = document.getElementById('filter-status').value;
        const type = document.getElementById('filter-type').value;
        if (status) params.status = status;
        if (type) params.type = type;

        try {
            const result = await EliteAPI.getServiceRequests(params);
            const { requests, newCount } = result.data;
            document.getElementById('new-count-badge').textContent = `${newCount} new`;

            if (!requests.length) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No requests match this filter yet.</td></tr>';
                return;
            }

            tbody.innerHTML = requests.map(r => `
                <tr data-id="${r.id}">
                    <td>${new Date(r.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                    <td class="lead-type">${SERVICE_LABELS[r.type] || r.type}</td>
                    <td class="lead-contact">
                        <div><strong>${esc(r.name)}</strong></div>
                        <div><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>
                        ${r.phone ? `<div><a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></div>` : ''}
                    </td>
                    <td>${r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : '—'}</td>
                    <td class="lead-details">${esc(r.details || '—')}</td>
                    <td><span class="status-pill status-${r.status}">${r.status.replace('_', ' ')}</span></td>
                    <td class="lead-actions">
                        <select class="lead-status">
                            <option value="NEW" ${r.status === 'NEW' ? 'selected' : ''}>New</option>
                            <option value="IN_PROGRESS" ${r.status === 'IN_PROGRESS' ? 'selected' : ''}>In progress</option>
                            <option value="CLOSED" ${r.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
                        </select>
                        <textarea class="lead-notes" placeholder="Staff notes...">${esc(r.staffNotes || '')}</textarea>
                        <button class="lead-save">Save</button>
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.lead-save').forEach(btn => {
                btn.addEventListener('click', async function () {
                    const row = this.closest('tr');
                    const id = row.dataset.id;
                    this.disabled = true;
                    this.textContent = 'Saving…';
                    try {
                        await EliteAPI.updateServiceRequest(id, {
                            status: row.querySelector('.lead-status').value,
                            staffNotes: row.querySelector('.lead-notes').value.trim()
                        });
                        this.textContent = 'Saved ✓';
                        setTimeout(() => { this.textContent = 'Save'; this.disabled = false; loadLeads(); }, 700);
                    } catch (err) {
                        alert(`Failed to save: ${err.message}`);
                        this.textContent = 'Save';
                        this.disabled = false;
                    }
                });
            });
        } catch (error) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Failed to load requests: ${esc(error.message)}</td></tr>`;
        }
    }

    // ---- Bookings ----
    async function loadBookings() {
        const tbody = document.getElementById('bookings-body');
        try {
            const result = await EliteAPI.request('/admin/bookings?limit=20', { auth: true });
            const bookings = result.data.bookings;

            if (!bookings.length) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No bookings yet.</td></tr>';
                return;
            }

            tbody.innerHTML = bookings.map(b => `
                <tr>
                    <td>${new Date(b.createdAt).toLocaleDateString()}</td>
                    <td>${esc(b.experience?.title || '—')}</td>
                    <td class="lead-contact">
                        <div><strong>${esc(b.tourist ? `${b.tourist.firstName} ${b.tourist.lastName}` : '—')}</strong></div>
                        ${b.tourist?.email ? `<div><a href="mailto:${esc(b.tourist.email)}">${esc(b.tourist.email)}</a></div>` : ''}
                        ${b.tourist?.phoneNumber ? `<div><a href="tel:${esc(b.tourist.phoneNumber)}">${esc(b.tourist.phoneNumber)}</a></div>` : ''}
                    </td>
                    <td>${esc(b.guide?.user ? `${b.guide.user.firstName} ${b.guide.user.lastName}` : '—')}</td>
                    <td>${new Date(b.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                    <td>${b.guestCount}</td>
                    <td>${EliteAPI.formatMoney(b.totalPrice, b.currency)}</td>
                    <td><span class="status-pill status-${b.status === 'PENDING' ? 'NEW' : b.status === 'CONFIRMED' ? 'IN_PROGRESS' : 'CLOSED'}">${b.status}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Failed to load bookings: ${esc(error.message)}</td></tr>`;
        }
    }
});
