document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners or other initialization code if needed
});

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Make a request to your backend for login
  fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful:', data.message);
      // Set user name on the index page and redirect
      document.getElementById('userGreeting').innerText = `Hello, ${data.user.name}!`;
      // Uncomment the following line to redirect to /todolist
      window.location.replace('/todolist');
      // window.location.href = '/todolist';
    })
    .catch(error => {
      document.getElementById('userGreeting').innerText = `Please check your credentials`;
      console.error('Error during login:', error.message);
      // Handle login error, display a message, etc.
    });
}
