document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const showButton = document.getElementById('showButton');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');

    // Clear fake error message
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    // Toggle password visibility
    if (showButton && passwordInput) {
        showButton.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showButton.classList.remove('zmdi-eye');
                showButton.classList.add('zmdi-eye-off');
            } else {
                passwordInput.type = 'password';
                showButton.classList.remove('zmdi-eye-off');
                showButton.classList.add('zmdi-eye');
            }
        });
    }

    // Handle form submit with axios
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!username || !password) {
                if (errorMessage) {
                    errorMessage.textContent = 'Iltimos, username va parolni kiriting!';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            try {
                if (submitButton) {
                    submitButton.value = 'Kutib turing...';
                    submitButton.disabled = true;
                }

                const response = await axios.post(`${BASE_URL}/login`, {
                    username: username,
                    password: password
                });

                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                    window.location.href = 'admin.html';
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = response.data.message || 'Kirishda xatolik yuz berdi!';
                        errorMessage.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error(err);
                if (errorMessage) {
                    errorMessage.textContent = err.response?.data?.message || 'Login yoki parol noto\'g\'ri!';
                    errorMessage.style.display = 'block';
                }
            } finally {
                if (submitButton) {
                    submitButton.value = 'Log in';
                    submitButton.disabled = false;
                }
            }
        });
    }
});
