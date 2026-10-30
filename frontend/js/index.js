document.addEventListener('DOMContentLoaded', () => {
    let allVideos = [];
    let currentFilterUserId = null;

    // Header & User info
    const user = getCurrentUser();  
    const token = getToken();
    const avatarLink = document.getElementById('list');
    const avatarImg = document.querySelector('.avatar-img');

    if (user && avatarImg) {
        avatarImg.src = fixUrl(user.profileImg);
        avatarImg.onerror = function() {
            this.src = './img/avatar.jpg';
        };
    }
    if (avatarLink) {
        if (token) {
            avatarLink.href = './admin.html';
            avatarLink.title = `Shaxsiy kabinet (${user?.username || 'Profil'})`;
        } else {
            avatarLink.href = './login.html';
            avatarLink.title = 'Kirish / Ro\'yxatdan o\'tish';
        }
    }

    // Create video button in header
    const createBtn = document.getElementById('createVideoBtn') || document.querySelector('.header-right button:nth-child(3)');
    if (createBtn) {
        createBtn.style.cursor = 'pointer';
        createBtn.addEventListener('click', () => {
            window.location.href = token ? './admin.html' : './login.html';
        });
    }

    // Toggle menu
    const toggleMenuBtn = document.querySelector('.toggle-menu');
    const leftMenuWrapper = document.querySelector('.left-menu-wrapper');
    const iframesWrapper = document.querySelector('.iframes-wrapper');
    if (toggleMenuBtn && leftMenuWrapper && iframesWrapper) {
        toggleMenuBtn.addEventListener('click', () => {
            if (leftMenuWrapper.style.display === 'none') {
                leftMenuWrapper.style.display = 'block';
                iframesWrapper.style.left = '250px';
                iframesWrapper.style.width = 'calc(100vw - 250px)';
            } else {
                leftMenuWrapper.style.display = 'none';
                iframesWrapper.style.left = '0';
                iframesWrapper.style.width = '100vw';
            }
        });
    }

    // Elements for rendering
    const navbarList = document.querySelector('.navbar-list');
    const homeButton = document.getElementById('homeButton');
    const iframesList = document.getElementById('list1');
    const searchInput = document.getElementById('inputSearch');
    const searchForm = document.querySelector('.search-box');
    const datalist = document.getElementById('datalist');

    // Render videos into #list1
    function renderVideos(videos) {
        if (!iframesList) return;
        iframesList.innerHTML = '';

        if (!videos || videos.length === 0) {
            iframesList.innerHTML = `
                <li style="width: 100%; padding: 40px 20px; font-size: 18px; color: #666; text-align: center;">
                    Hech qanday video topilmadi.
                </li>
            `;
            return;
        }

        videos.forEach(file => {
            const li = document.createElement('li');
            li.className = 'iframe';
            li.dataset.id = file.fileId;

            const videoSrc = fixUrl(file.viewFile || file.viewLinkFile);
            const userAvatar = fixUrl(file.user?.profileImg) || './img/avatar.jpg';
            const username = file.user?.username || 'Foydalanuvchi';
            const title = file.videoInput || 'Nomsiz video';
            const timeStr = `${file.data || ''} ${file.time ? '| ' + file.time : ''}`;
            const downloadUrl = fixUrl(file.downloadLink || file.viewFile);
            const sizeStr = file.size ? `${file.size} MB` : '';

            li.innerHTML = `
                <video src="${videoSrc}" controls=""></video>
                <div class="iframe-footer">
                    <img src="${userAvatar}" alt="${username}" onerror="this.src='./img/avatar.jpg'">
                    <div class="iframe-footer-text">
                        <h2 class="channel-name" title="${username}">${username}</h2>
                        <h3 class="iframe-title" title="${title}">${title}</h3>
                        <time class="uploaded-time">${timeStr}</time>
                        <a class="download" href="${downloadUrl}" download target="_blank" title="Yuklab olish">
                            <span>${sizeStr}</span>
                            <img src="./img/download.png" alt="download">
                        </a>
                    </div>
                </div>
            `;

            iframesList.appendChild(li);
        });
    }

    // Filter videos by user and search
    function applyFilters() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = allVideos;

        if (currentFilterUserId !== null) {
            filtered = filtered.filter(item => item.user && Number(item.user.userId) === Number(currentFilterUserId));
        }

        if (query) {
            filtered = filtered.filter(item => item.videoInput && item.videoInput.toLowerCase().includes(query));
        }

        renderVideos(filtered);
    }

    // Populate datalist with video titles
    function updateDatalist(videos) {
        if (!datalist) return;
        datalist.innerHTML = '';
        const uniqueTitles = [...new Set(videos.map(v => v.videoInput).filter(Boolean))];
        uniqueTitles.slice(0, 15).forEach(title => {
            const opt = document.createElement('option');
            opt.value = title;
            datalist.appendChild(opt);
        });
    }

    // Fetch all users for left sidebar
    async function loadUsers() {
        try {
            const response = await axios.get(`${BASE_URL}/users`);
            const users = response.data.data || [];

            // Keep H1 and homeButton, remove any other children
            if (navbarList) {
                const itemsToRemove = navbarList.querySelectorAll('.channel:not(#homeButton)');
                itemsToRemove.forEach(el => el.remove());

                users.forEach(u => {
                    const li = document.createElement('li');
                    li.className = 'channel';
                    li.dataset.id = u.userId;

                    const avatarSrc = fixUrl(u.profileImg);

                    li.innerHTML = `
                        <a href="javascript:void(0)">
                            <img src="${avatarSrc}" alt="${u.username}" width="30px" height="30px" onerror="this.src='./img/avatar.jpg'">
                            <span>${u.username}</span>
                        </a>
                    `;

                    li.addEventListener('click', () => {
                        // Set active class
                        navbarList.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
                        li.classList.add('active');

                        currentFilterUserId = u.userId;
                        applyFilters();
                    });

                    navbarList.appendChild(li);
                });
            }
        } catch (err) {
            console.error('Foydalanuvchilarni yuklashda xatolik:', err);
        }
    }

    // Home button click
    if (homeButton) {
        homeButton.addEventListener('click', (e) => {
            e.preventDefault();
            navbarList.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
            homeButton.classList.add('active');

            currentFilterUserId = null;
            applyFilters();
        });
    }

    // Fetch all videos for feed
    async function loadVideos() {
        try {
            if (iframesList) {
                iframesList.innerHTML = `
                    <li style="width: 100%; padding: 40px 20px; font-size: 18px; color: #666; text-align: center;">
                        Videolar yuklanmoqda...
                    </li>
                `;
            }

            const response = await axios.get(`${BASE_URL}/files`);
            allVideos = response.data.data || [];

            // Sort newest first if possible
            allVideos.reverse();

            updateDatalist(allVideos);
            applyFilters();
        } catch (err) {
            console.error('Videolarni yuklashda xatolik:', err);
            if (iframesList) {
                iframesList.innerHTML = `
                    <li style="width: 100%; padding: 40px 20px; font-size: 18px; color: red; text-align: center;">
                        Videolarni yuklashda server xatosi yuz berdi.
                    </li>
                `;
            }
        }
    }

    // Search events
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }

    // Voice search support
    window.voice = function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Brauzeringiz ovozli qidiruvni qo\'llab-quvvatlamaydi.');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'uz-UZ';
            recognition.onresult = function(event) {
                const speechResult = event.results[0][0].transcript;
                if (searchInput) {
                    searchInput.value = speechResult;
                    applyFilters();
                }
            };
            recognition.onerror = function() {
                // fallback to general speech
            };
            recognition.start();
        } catch (e) {
            console.error(e);
        }
    };

    // Initial data fetch
    loadUsers();
    loadVideos();
});
