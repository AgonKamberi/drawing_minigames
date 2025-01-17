document.addEventListener('DOMContentLoaded', () => {
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost/drawing_minigames_be/getAllUsers.php', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                populateTable(data.users);
            } else {
                console.error('Error fetching users:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const populateTable = (users) => {
        const tableBody = document.querySelector('#userTable tbody');
        tableBody.innerHTML = '';

        users.forEach((user) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role || 'User'}</td> <!-- Default to 'User' if no role -->
                <td class="action-buttons">
                    <button class="delete" data-id="${user.id}">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        addActionListeners();
    };

    const addActionListeners = () => {
        const deleteButtons = document.querySelectorAll('.delete');

        deleteButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                const userId = button.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this user?')) {
                    await deleteUser(userId);
                }
            });
        });
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch('http://localhost/drawing_minigames_be/deleteUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId }),
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('User deleted successfully');
                fetchUsers();
            } else {
                alert('Error deleting user: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchUsers();
});
