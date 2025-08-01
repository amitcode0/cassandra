document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const userList = document.getElementById("userList");
  const submitBtn = document.getElementById("submitBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Show/hide loading spinner
  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Adding...';
      loadingSpinner.style.display = "block";
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Add User";
      loadingSpinner.style.display = "none";
    }
  }

  // Show notification
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json();
      userList.innerHTML = "";

      if (users.length === 0) {
        userList.innerHTML =
          '<div class="empty-state">No users found. Add your first user above!</div>';
        return;
      }

      users.forEach((user, index) => {
        const userCard = document.createElement("div");
        userCard.className = "user-card";
        userCard.innerHTML = `
          <div class="user-info">
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="user-details">
              <h3>${user.name}</h3>
              <p>${user.email}</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="edit-btn" onclick="editUser('${
              user.id || index
            }', '${user.name}', '${user.email}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="delete-btn" onclick="deleteUser('${
              user.id || index
            }')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              </svg>
            </button>
          </div>
        `;
        userList.appendChild(userCard);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users", "error");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) throw new Error("Failed to add user");

      form.reset();
      showNotification("User added successfully!", "success");
      await fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      showNotification("Failed to add user", "error");
    } finally {
      setLoading(false);
    }
  });

  // Global functions for edit and delete
  window.editUser = function (id, name, email) {
    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    submitBtn.innerHTML = "Update User";
    submitBtn.dataset.editId = id;
    document.getElementById("name").focus();
  };

  window.deleteUser = async function (id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");

      showNotification("User deleted successfully!", "success");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
    }
  };

  // Handle form reset
  form.addEventListener("reset", () => {
    submitBtn.innerHTML = "Add User";
    delete submitBtn.dataset.editId;
  });

  fetchUsers();
});
