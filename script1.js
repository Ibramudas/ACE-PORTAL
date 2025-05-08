// Register form submission
if (document.getElementById('register-form')) {
  document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const Name = document.getElementById('Name').value;
      const email = document.getElementById('email').value;
      const phoneNumber = document.getElementById('phoneNumber').value;
      const Password = document.getElementById('Password').value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validation
      if (phoneNumber.length !== 10) {
          alert("Phone number must be exactly 10 digits.");
          return;
      }

      if (Password.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
      }

      if (Password !== confirmPassword) {
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
              Name,
              email,
              phoneNumber,
              Password
          })
      })
      .then((response) => response.json())
      .then((data) => {
          if (data.message === 'User registered successfully') {
              alert('Registration successful!');
              window.location.href = 'Sign-in.2.html';
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
      const Name = document.getElementById('Name').value;
      const Password = document.getElementById('Password').value;

      if (Name.length < 3) {
          alert("Username must be at least 3 characters.");
          return;
      }

      if (Password.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
      }

      // Send data to server
      fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Name, Password })
      })
      .then((response) => response.json())
      .then((data) => {
          if (data.message === 'User logged in successfully') {
              alert('Login successful!');
              window.location.href = 'Home5.html';
          } else {
              alert('Invalid username or password');
          }
      })
      .catch((error) => console.error(error));
  });
}