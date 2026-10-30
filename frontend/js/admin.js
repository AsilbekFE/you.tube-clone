document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const user = getCurrentUser();

    // Guard: Require login
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Display current user profile
    const adminUsername = document.getElementById('adminUsername');
    const adminAvatar = document.getElementById('adminAvatar');
    if (user) {
        if (adminUsername) adminUsername.textContent = user.username;
        if (adminAvatar) {
            adminAvatar.src = fixUrl(user.profileImg);
            adminAvatar.onerror = function() {
                this.src = './img/avatar.jpg';
            };
        }
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Video form elements
    const videoForm = document.getElementById('videoForm');
    const videoInput = document.getElementById('videoInput');
    const uploadInput = document.getElementById('uploadInput');
    const fileNameSpan = document.querySelector('.file-name');
    const submitButton = document.getElementById('submitButton');
    const videosList = document.getElementById('videosList');

    // Update video file name
    if (uploadInput && fileNameSpan) {
        uploadInput.addEventListener('change', () => {
            if (uploadInput.files && uploadInput.files[0]) {
                fileNameSpan.textContent = uploadInput.files[0].name;
            } else {
                fileNameSpan.textContent = 'click upload a video';
            }
        });
    }

    // Video upload submission
    if (videoForm) {
        videoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = videoInput ? videoInput.value.trim() : '';
            const file = uploadInput && uploadInput.files ? uploadInput.files[0] : null;

            if (!title) {
                alert('Iltimos, video sarlavhasini kiriting!');
                return;
            }
            if (!file) {
                alert('Iltimos, video faylini tanlang!');
                return;
            }

            try {
                if (submitButton) {
                    submitButton.value = 'Yuklanmoqda...';
                    submitButton.disabled = true;
                }

                const formData = new FormData();
                formData.append('videoInput', title);
                formData.append('file', file);

                const response = await axios.post(`${BASE_URL}/files`, formData, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });

                if (response.data && (response.data.status === 200 || response.status === 200)) {
                    alert('Video muvaffaqiyatli yuklandi!');
                    videoForm.reset();
                    if (fileNameSpan) fileNameSpan.textContent = 'click upload a video';
                    loadMyVideos();
                } else {
                    alert(response.data.message || 'Video yuklashda xatolik yuz berdi!');
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 403) {
                    alert('Sessiya muddati tugagan. Qaytadan kiring.');
                    logout();
                } else {
                    alert(err.response?.data?.message || 'Video yuklashda server xatosi yuz berdi!');
                }
            } finally {
                if (submitButton) {
                    submitButton.value = 'Upload';
                    submitButton.disabled = false;
                }
            }
        });
    }

    // Fetch and render my videos
    async function loadMyVideos() {
        if (!videosList) return;

        try {
            videosList.innerHTML = '<p class="empty-videos">Videolar yuklanmoqda...</p>';

            const response = await axios.get(`${BASE_URL}/files/my`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            const files = response.data.data || [];
            videosList.innerHTML = '';

            if (files.length === 0) {
                videosList.innerHTML = '<p class="empty-videos">Sizda hali yuklangan videolar yo\'q.<br>Chap tarafdagi formadan video yuklashingiz mumkin.</p>';
                return;
            }

            files.forEach(file => {
                const li = document.createElement('li');
                li.className = 'video-item';
                li.dataset.id = file.fileId;

                const videoSrc = fixUrl(file.viewFile || file.viewLinkFile);
                const videoTitle = file.videoInput || 'Untitled';

                li.innerHTML = `
                    <video controls="true" src="${videoSrc}"></video>
                    <p class="content" contenteditable="true" title="Sarlavhani o'zgartirish uchun bosing">${videoTitle}</p>
                    <img class="delete-icon" src="./img/delete.png" width="25" alt="Delete video" title="Videoni o'chirish">
                `;

                // Edit title on blur or Enter
                const titleP = li.querySelector('.content');
                let currentVal = videoTitle;

                titleP.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        titleP.blur();
                    }
                });

                titleP.addEventListener('blur', async () => {
                    const newVal = titleP.textContent.trim();
                    if (!newVal) {
                        titleP.textContent = currentVal;
                        return;
                    }
                    if (newVal === currentVal) return;

                    try {
                        const editRes = await axios.put(`${BASE_URL}/files`, {
                            fileId: Number(file.fileId),
                            value: newVal
                        }, {
                            headers: {
                                Authorization: `Bearer ${getToken()}`
                            }
                        });

                        if (editRes.data && editRes.data.status === 200) {
                            currentVal = newVal;
                        } else {
                            alert(editRes.data.message || 'Sarlavhani yangilashda xatolik!');
                            titleP.textContent = currentVal;
                        }
                    } catch (editErr) {
                        console.error(editErr);
                        alert(editErr.response?.data?.message || 'Sarlavhani yangilashda server xatosi yuz berdi!');
                        titleP.textContent = currentVal;
                    }
                });

                // Delete video
                const deleteIcon = li.querySelector('.delete-icon');
                deleteIcon.addEventListener('click', async () => {
                    if (!confirm('Haqiqatan ham ushbu videoni o\'chirmoqchimisiz?')) {
                        return;
                    }

                    try {
                        const delRes = await axios.delete(`${BASE_URL}/files`, {
                            headers: {
                                Authorization: `Bearer ${getToken()}`
                            },
                            data: {
                                fileId: Number(file.fileId)
                            }
                        });

                        if (delRes.data && delRes.data.status === 200) {
                            li.remove();
                            if (videosList.children.length === 0) {
                                videosList.innerHTML = '<p style="padding: 20px; font-family: poppins, sans-serif; color: #666; width: 100%;">Sizda hali yuklangan videolar yo\'q. Chap tarafdagi formadan video yuklashingiz mumkin.</p>';
                            }
                        } else {
                            alert(delRes.data.message || 'Videoni o\'chirishda xatolik!');
                        }
                    } catch (delErr) {
                        console.error(delErr);
                        alert(delErr.response?.data?.message || 'Videoni o\'chirishda server xatosi yuz berdi!');
                    }
                });

                videosList.appendChild(li);
            });
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                alert('Sessiya muddati tugagan. Qaytadan kiring.');
                logout();
            } else {
                videosList.innerHTML = '<p style="padding: 20px; font-family: poppins, sans-serif; color: red; width: 100%;">Videolarni yuklashda server xatosi yuz berdi.</p>';
            }
        }
    }

    // Initial load
    loadMyVideos();
});
