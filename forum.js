var info = [];

async function fetchUserData() {
    try {
        const response = await fetch("http://localhost/drawing_minigames_be/isLoggedIn.php", {
            method: "GET",
            credentials: 'include'
        });
        const data = await response.json();

        if (data.loggedIn == false) {
            window.location.href = "startPage.html";
        }

        info = data.data;

        fetchPosts();
    } catch (error) {
        console.error("Error:", error);
    }
}

fetchUserData();

async function fetchPosts() {
    try {
        const response = await fetch("http://localhost/drawing_minigames_be/getAllPosts.php", {
            method: "GET",
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();

        data.forEach(post => {
            addPostToDOM(post);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}


function addPost(){
    const subject = document.getElementById("postSubject").value;
    const userId = info.id;

    if (subject.trim() === "") {
        alert("Please fill in the subject field");
        return;
    }

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('userId', userId);

    fetch('http://localhost/drawing_minigames_be/addPost.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            var postData = {
                username: info.username,
                icon: info.icon,
                subject: subject,
                upvotes: 0,
                postId: result.postId
            }
            addPostToDOM(postData);
        } else {
            alert(result.error);
        }
        document.getElementById("postSubject").value = null;
    })
    .catch(error => console.error('Error:', error));
}

function addPostToDOM(postData) {
    const postsContainer = document.getElementById('postsContainer');
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.id = `post-${postData.id}`;

    postElement.innerHTML = `
        <div class="post-header">
            <img src="img/faceIcons/${postData.icon}.svg" alt="User Avatar" class="post-avatar">
            <p class="post-author">${postData.username}</p>
            ${postData.username === info.username ? '<button class="btn-delete-post btn-danger btn" onclick="deletePost(' + postData.id + ')">Delete</button>' : ''}
        </div>
        <p class="post-content">${postData.subject}</p>
        <div class="post-footer">
            ${postData.user_voted 
                ? `<button class="btn-vote downvote" onclick="downvotePost(${postData.id})">
                        <i class="fa fa-thumbs-down"></i>
                   </button>`
                : `<button class="btn-vote upvote" onclick="upvotePost(${postData.id})">
                        <i class="fa fa-thumbs-up"></i>
                   </button>`
            }
            <span class="vote-counter" id="${postData.id}">${postData.upvotes}</span>
        </div>
    `;

    postsContainer.append(postElement);
}

function deletePost(postId) {
    fetch(`http://localhost/drawing_minigames_be/deletePost.php?id=${postId}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                postElement.remove();
            }
        } else {
            console.error('Error deleting post:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function upvotePost(postId) {
    const formData = new FormData();
    formData.append('postId', postId);
    formData.append('vote', 'up');
    formData.append('user_id', info.id);

    const counter = document.getElementById(postId);
    const postElement = document.getElementById(`post-${postId}`);
    fetch(`http://localhost/drawing_minigames_be/votePost.php`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            counter.textContent = parseInt(counter.textContent) + 1;

            const footer = postElement.querySelector('.post-footer');
            footer.innerHTML = `
                <button class="btn-vote downvote" onclick="downvotePost(${postId})">
                    <i class="fa fa-thumbs-down"></i>
                </button>
                <span class="vote-counter" id="${postId}">${counter.textContent}</span>
            `;
        } else {
            alert('Failed to upvote: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function downvotePost(postId) {
    const formData = new FormData();
    formData.append('postId', postId);
    formData.append('vote', 'down');
    formData.append('user_id', info.id);

    const counter = document.getElementById(postId);
    const postElement = document.getElementById(`post-${postId}`);
    fetch(`http://localhost/drawing_minigames_be/votePost.php`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            counter.textContent = parseInt(counter.textContent) - 1;

            const footer = postElement.querySelector('.post-footer');
            footer.innerHTML = `
                <button class="btn-vote upvote" onclick="upvotePost(${postId})">
                    <i class="fa fa-thumbs-up"></i>
                </button>
                <span class="vote-counter" id="${postId}">${counter.textContent}</span>
            `;
        } else {
            alert('Failed to downvote: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}


function openProfile() {
    const profileModal = document.getElementById('profileModal');
    profileModal.style.display = 'flex';
    document.getElementById('profileIcon').src = `img/faceIcons/${info.icon}.svg`;
    document.getElementById('usernameInput').value = info.username;
    document.getElementById('emailInput').value = info.email;
}

function closeProfile() {
    const profileModal = document.getElementById('profileModal');
    profileModal.style.display = 'none';
}

async function saveProfile() {
    const username = document.getElementById('usernameInput').value;
    const email = document.getElementById('emailInput').value;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('userId', info.id);

    try {
        const response = await fetch("http://localhost/drawing_minigames_be/updateProfile.php", {
            method: 'POST',
            body: formData,
        });

        const textResponse = await response.text();

        const data = JSON.parse(textResponse);
        if (data.success) {
            info.username = username;
            info.email = email;
            console.log(info);
            closeProfile();
        } else {
            alert('Error updating profile: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}