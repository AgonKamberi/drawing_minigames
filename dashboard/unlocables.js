document.addEventListener('DOMContentLoaded', () => {
    const fetchUnlocables = async () => {
        try {
            const response = await fetch('http://localhost/drawing_minigames_be/getAllUnlocables.php', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                populateTable(data.unlocables);
            } else {
                console.error('Error fetching unlocables:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const populateTable = (unlocables) => {
        const tableBody = document.querySelector('#unlocableTable tbody');
        tableBody.innerHTML = '';

        unlocables.forEach((unlocable) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${unlocable.id}</td>
                <td>${unlocable.icon}</td>
                <td>${unlocable.xp}</td>
                <td class="action-buttons">
                    <button class="delete" data-id="${unlocable.id}">Delete</button>
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
                const unlocableId = button.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this unlocable?')) {
                    await deleteUnlocable(unlocableId);
                }
            });
        });
    };

    const deleteUnlocable = async (unlocableId) => {
        try {
            const response = await fetch('http://localhost/drawing_minigames_be/deleteUnlocable.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: unlocableId }),
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('Unlocable deleted successfully');
                fetchUnlocables();
            } else {
                alert('Error deleting unlocable: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addUnlocableBtn = document.getElementById('addUnlocableBtn');
    addUnlocableBtn.addEventListener('click', async () => {
        const name = document.getElementById('nameInput').value;
        const xp = document.getElementById('xpInput').value;

        if (name && xp) {
            try {
                const response = await fetch('http://localhost/drawing_minigames_be/addUnlocable.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, xp }),
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.success) {
                    alert('Unlocable added successfully');
                    fetchUnlocables();
                    document.querySelector('.add-unlocable-form').reset();
                } else {
                    alert('Error adding unlocable: ' + data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('Please provide both name and XP');
        }
    });

    fetchUnlocables();
});
