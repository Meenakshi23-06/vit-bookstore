const API = window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : "";

/* -------- AUTHENTICATION -------- */
async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", username);
      window.location.href = "index.html";
    } else {
      alert("Invalid credentials");
    }
  } catch(e) {
    alert("Error logging in. Ensure backend is running.");
  }
}

async function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  try {
    await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    alert("Registered successfully! You can now log in.");
    switchTab('login');
  } catch(e) {
    alert("Error registering.");
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function checkUser() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
  }
  return user;
}

function renderNav() {
  const user = localStorage.getItem("user");
  const header = document.querySelector("header");
  
  if (header && user) {
      // Setup dynamic auth elements in header if needed.
      const userSpan = document.createElement("span");
      userSpan.innerText = `Hello, ${user} | `;
      
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.innerText = "Admin Dashboard | ";
      
      const myBooksLink = document.createElement("a");
      myBooksLink.href = "my-books.html";
      myBooksLink.innerText = "My Books | ";
      
      const logoutBtn = document.createElement("button");
      logoutBtn.innerText = "Logout";
      logoutBtn.onclick = logout;
      logoutBtn.className = "btn";
      logoutBtn.style.padding = "5px 15px";

      const navDiv = document.createElement("div");
      navDiv.className = "nav-links";
      navDiv.appendChild(adminLink);
      navDiv.appendChild(myBooksLink);
      navDiv.appendChild(logoutBtn);

      header.appendChild(navDiv);
  }
}

/* -------- BOOKS & RELATIONSHIPS -------- */
async function loadBooks(category) {
  const user = checkUser();

  try {
    const res = await fetch(`${API}/books/${category}`);
    const data = await res.json();

    const container = document.getElementById("books-container");
    container.innerHTML = "";
    
    if (data.length === 0) {
        container.innerHTML = "<p>No books found for this category.</p>";
        return;
    }

    data.forEach(book => {
      const div = document.createElement("div");
      div.className = "book";
      div.innerHTML = `
        <h2>${book.title}</h2>
        <p><strong>Author:</strong> ${book.author}</p>
        <p>${book.description}</p>
        <button class="btn add-btn" onclick="buyBook('${book.title}')">Add to Collection</button>
      `;
      container.appendChild(div);
    });
  } catch(e) {
      document.getElementById("books-container").innerHTML = "<p>Error connecting to backend.</p>";
  }
}

async function buyBook(title) {
  const user = localStorage.getItem("user");
  if (!user) return alert("Please login first");

  try {
    const res = await fetch(`${API}/books/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, title: title })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Successfully added '${title}' to your collection!`);
    } else {
      alert("Failed to add book.");
    }
  } catch (err) {
    alert("Error interacting with database.");
  }
}

async function loadMyBooks() {
  const user = checkUser();

  try {
    const res = await fetch(`${API}/my-books/${user}`);
    const data = await res.json();
    
    const container = document.getElementById("my-books-container");
    container.innerHTML = "";

    if (data.books && data.books.length > 0) {
      data.books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
          <h2>${book.title}</h2>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><em>Purchased/Added to library</em></p>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = "<p>You don't have any books yet.</p>";
    }
  } catch(e) {
      document.getElementById("my-books-container").innerHTML = "<p>Error connecting. Make sure your server is running.</p>";
  }
}