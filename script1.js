    // Register form submission
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('Name').value;
        const email = document.getElementById('Email').value;
        const phoneNumber = document.getElementById('Number').value;
        const password = document.getElementById('Password').value;
        const confirmPassword = document.getElementById("confirmPassword").value;
          if (username.length < 3) {
            alert("Username must be at least 3 characters.");
            return;
          }
    
          if (number.length < 10) {
            alert("Phone number must be at least 10 digits.");
            return;
          }
    
          if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
          }
    
          if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
          }
    

        // Send data to server
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phoneNumber,
                password
            })
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === 'User registered successfully') {
                alert('Registration successful!');
                window.location.href = 'login.html';
            } else {
                alert('Error registering user');
            }
        })
        .catch((error) => console.error(error));
    });
}

// Login form submission
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('Name').value;
      const password = document.getElementById('Password').value;
      if (username.length < 3) {
        alert("Username must be at least 3 characters.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      // Send data to server
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'User logged in successfully') {
          alert('Login successful!');
          // Fetch student data
          fetch(`/student/${username}`)
          .then((response) => response.json())
          .then((studentData) => {
            localStorage.setItem('studentData', JSON.stringify(studentData));
            window.location.href = 'Home5.html';
          })
          .catch((error) => console.error(error));
        } else {
          alert('Invalid username or password');
        }
    })
    .catch((error) => console.error(error));
  });
}
  
