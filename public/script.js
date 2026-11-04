// HelpIT - Frontend Registration Script 
// By: Ajani 

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // stops the page from reloading on submit

    // grab inputs from html form
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role_name = document.getElementById('reg-role').value;
    const tech_key = document.getElementById('reg-dept-key').value;

    try {
        // sent post req to backend regist
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({ username, password, role_name, tech_key })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Success: ' + (data.message || 'User registered successfully!'));
            console.log('Registered user/tech:', data);
            // clear form fields
            document.getElementById('register-form').reset();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error('Network or server error', err);
        alert('Failed to connect to the backend server');
    }
});