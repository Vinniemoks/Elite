// Dashboard - real user data and bookings from the API

document.addEventListener('DOMContentLoaded', async function () {
    if (!window.EliteAPI) return;

    // This page requires a signed-in user
    if (!EliteAPI.isLoggedIn()) {
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }

    const user = EliteAPI.getUser();
    renderUserInfo(user);

    try {
        const result = await EliteAPI.getMyBookings();
        renderBookings(result.data || []);
    } catch (error) {
        console.error('Failed to load bookings:', error);
        if (error.status === 401) {
            EliteAPI.clearSession();
            window.location.href = 'login.html?redirect=dashboard.html';
        }
    }
});

function renderUserInfo(user) {
    if (!user) return;
    const esc = EliteAPI.escapeHtml;

    const sidebarName = document.querySelector('.sidebar-user-info h3');
    if (sidebarName) sidebarName.textContent = `${user.firstName} ${user.lastName || ''}`.trim();

    const sidebarRole = document.querySelector('.sidebar-user-info p');
    if (sidebarRole && user.userType) {
        sidebarRole.textContent = user.userType.charAt(0) + user.userType.slice(1).toLowerCase();
    }

    const welcome = document.querySelector('.dashboard-header h1');
    if (welcome) welcome.textContent = `Welcome back, ${user.firstName}!`;
}

function renderBookings(bookings) {
    const esc = EliteAPI.escapeHtml;
    const upcoming = bookings.filter(b =>
        ['PENDING', 'CONFIRMED'].includes(b.status) && new Date(b.startTime) > new Date()
    );

    // Stats: first card = upcoming bookings, second = distinct guides
    const statValues = document.querySelectorAll('.dashboard-stats .stat-info h3');
    if (statValues[0]) statValues[0].textContent = String(upcoming.length);
    if (statValues[1]) {
        statValues[1].textContent = String(new Set(bookings.map(b => b.guideId)).size);
    }
    if (statValues[2]) {
        statValues[2].textContent = String(new Set(bookings.map(b => b.experience && b.experience.location)).size);
    }
    if (statValues[3]) statValues[3].textContent = String(bookings.length);
    const statLabels = document.querySelectorAll('.dashboard-stats .stat-info p');
    if (statLabels[3]) statLabels[3].textContent = 'Total Bookings';

    const grid = document.querySelector('.bookings-grid');
    if (!grid) return;

    if (!upcoming.length) {
        grid.innerHTML = `
            <div class="booking-card" style="grid-column:1/-1;text-align:center;padding:30px;">
                <p>No upcoming bookings yet.</p>
                <p style="margin-top:10px;"><a href="experiences.html" class="btn btn-primary">Browse Experiences</a></p>
            </div>`;
        return;
    }

    grid.innerHTML = upcoming.map(booking => {
        const exp = booking.experience || {};
        const guide = exp.guide && exp.guide.user
            ? `${exp.guide.user.firstName} ${exp.guide.user.lastName}`
            : 'Your guide';
        const when = new Date(booking.startTime).toLocaleString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
        const statusColors = { PENDING: '#b98900', CONFIRMED: '#1e7e34' };

        return `
        <div class="booking-card">
            <div class="booking-img">
                <img src="${exp.images && exp.images[0] ? esc(exp.images[0]) : 'images/scene-maasai-mara.svg'}" alt="${esc(exp.title || 'Experience')}">
            </div>
            <div class="booking-content">
                <h3>${esc(exp.title || 'Experience')}</h3>
                <p class="booking-date"><i class="fas fa-calendar"></i> ${esc(when)}</p>
                <p class="booking-guide"><i class="fas fa-user"></i> Guide: ${esc(guide)}</p>
                <p class="booking-location"><i class="fas fa-map-marker-alt"></i> ${esc(exp.location || '')}</p>
                <p style="margin-top:6px;">
                    <span style="font-weight:600;color:${statusColors[booking.status] || '#555'};">${esc(booking.status)}</span>
                    · ${booking.guestCount} guest${booking.guestCount > 1 ? 's' : ''}
                    · ${EliteAPI.formatMoney(booking.totalPrice, booking.currency)}
                </p>
            </div>
        </div>`;
    }).join('');
}
