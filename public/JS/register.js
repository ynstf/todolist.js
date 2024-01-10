document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners or other initialization code if needed
});

function register() {
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Make a request to your backend for registration
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        return response.json();
    })
    .then(data => {
        console.log('Registration successful:', data.message);
        // Redirect to the home page
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Error during registration:', error.message);
        // Handle registration error, display a message, etc.
    });
}
