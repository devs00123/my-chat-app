const userList = document.getElementById('user-list');

async function fetchUsers() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/users');
        const users = await res.json();

        userList.innerHTML = '';

        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <div>
                    <strong>${user.username}</strong>
                    <br>
                    <span style="font-size:0.8rem; opacity:0.6;">${user.role}</span>
                </div>
                <div>
                    <span class="status-badge ${user.isBlocked ? 'status-blocked' : 'status-active'}">
                        ${user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <!-- Action buttons can be added here later -->
                </div>
            `;
            userList.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        userList.innerHTML = '<p>Error loading users</p>';
    }
}

fetchUsers();
