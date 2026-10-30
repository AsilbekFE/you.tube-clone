document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const uploadInput = document.getElementById('uploadInput');
    const fileNameSpan = document.querySelector('.file-name');
    const showButton = document.getElementById('showButton');
    const submitButton = document.getElementById('submitButton');

    // Create or select error message element
    let errorMessage = document.getElementById('errorMessage');
    if (!errorMessage && registerForm) {
        errorMessage = document.createElement('span');
        errorMessage.id = 'errorMessage';
        errorMessage.style.color = 'red';
        errorMessage.style.marginBottom = '15px';
        errorMessage.style.display = 'none';
        registerForm.insertBefore(errorMessage, registerForm.firstChild);
    }

    // Update avatar file name display
    if (uploadInput && fileNameSpan) {
        uploadInput.addEventListener('change', () => {
            if (uploadInput.files && uploadInput.files[0]) {
                fileNameSpan.textContent = uploadInput.files[0].name;
            } else {
                fileNameSpan.textContent = 'click upload a avatar picture';
            }
        });
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
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            const file = uploadInput && uploadInput.files ? uploadInput.files[0] : null;

            if (!username || !password || !file) {
                if (errorMessage) {
                    errorMessage.textContent = 'Iltimos, barcha maydonlarni to\'ldiring va avatar tanlang!';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            if (password.length < 8) {
                if (errorMessage) {
                    errorMessage.textContent = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak!';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            try {
                if (submitButton) {
                    submitButton.value = 'Ro\'yxatdan o\'tilmoqda...';
                    submitButton.disabled = true;
                }

                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
                formData.append('file', file);

                const response = await axios.post(`${BASE_URL}/register`, formData);

                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                    window.location.href = 'admin.html';
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = response.data.message || 'Ro\'yxatdan o\'tishda xatolik!';
                        errorMessage.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error(err);
                if (errorMessage) {
                    errorMessage.textContent = err.response?.data?.message || 'Foydalanuvchi allaqachon mavjud yoki server xatosi!';
                    errorMessage.style.display = 'block';
                }
            } finally {
                if (submitButton) {
                    submitButton.value = 'Register';
                    submitButton.disabled = false;
                }
            }
        });
    }
});
