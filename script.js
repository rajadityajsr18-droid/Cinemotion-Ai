document.addEventListener('DOMContentLoaded', () => {
    const typingText = document.getElementById('typing-text');
    const introOverlay = document.getElementById('intro-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const loadingTimer = document.getElementById('loading-timer');

    const textToType = "Ask for a vibe. Get a cinematic recommendation";
    let charIndex = 0;
    const typingSpeed = 70; // ms

    // 1. Typing Animation
    function type() {
        if (charIndex < textToType.length) {
            typingText.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        }
    }

    // Start typing after a short delay
    setTimeout(type, 800);

    // 2. Countdown Timer
    let secondsLeft = 3;
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft >= 0) {
            loadingTimer.textContent = `Loading in ${secondsLeft}s`;
        } else {
            clearInterval(countdownInterval);
            // Optional: Auto-enter after countdown
            // enterExperience();
        }
    }, 1000);

    // 3. Navigation / Skip Logic
    function enterExperience() {
        introOverlay.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        introOverlay.style.opacity = '0';
        introOverlay.style.transform = 'scale(1.1)';

        setTimeout(() => {
            introOverlay.style.display = 'none';
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                appContainer.style.opacity = '1';
            }
            // Fetch TMDB data after revealing the app
            fetchMovies();
            fetchSeries();
        }, 800);
    }

    // ============ TMDB API ============
    const TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Free public demo key
    const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';

    function buildPosterCard(item, isMovie) {
        const title = isMovie ? item.title : item.name;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const poster = item.poster_path
            ? `${TMDB_IMG}${item.poster_path}`
            : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300';
        const card = document.createElement('div');
        card.className = 'poster-card';
        card.innerHTML = `
            <img src="${poster}" alt="${title}" loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300'">
            <div class="poster-info">
                <p class="p-title">${title}</p>
                <p class="p-rating">★ ${rating}</p>
            </div>
        `;
        return card;
    }

    async function fetchMovies() {
        const track = document.getElementById('movies-track');
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`);
            const data = await res.json();
            const items = data.results.slice(0, 20);
            // Double items for seamless loop
            [...items, ...items].forEach(movie => {
                track.appendChild(buildPosterCard(movie, true));
            });
        } catch (e) {
            // Fallback hardcoded
            const fallback = [
                { title: 'Inception', vote_average: 8.8, poster_path: null },
                { title: 'The Dark Knight', vote_average: 9.0, poster_path: null },
                { title: 'Interstellar', vote_average: 8.7, poster_path: null },
            ];
            [...fallback, ...fallback].forEach(m => track.appendChild(buildPosterCard(m, true)));
        }
    }

    async function fetchSeries() {
        const track = document.getElementById('series-track');
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=1`);
            const data = await res.json();
            const items = data.results.slice(0, 20);
            [...items, ...items].forEach(series => {
                track.appendChild(buildPosterCard(series, false));
            });
        } catch (e) {
            const fallback = [
                { name: 'Breaking Bad', vote_average: 9.5, poster_path: null },
                { name: 'Stranger Things', vote_average: 8.7, poster_path: null },
                { name: 'The Crown', vote_average: 8.0, poster_path: null },
            ];
            [...fallback, ...fallback].forEach(s => track.appendChild(buildPosterCard(s, false)));
        }
    }

    function setupMainMarquees() {
        const wrappers = document.querySelectorAll('.marquee-wrapper');
        wrappers.forEach(wrapper => {
            let isDown = false;
            let startX;
            let scrollLeft;
            let autoScrollInterval;

            const startAutoScroll = () => {
                autoScrollInterval = setInterval(() => {
                    // Reverse track scrolls the other way
                    if (wrapper.querySelector('.reverse')) {
                        wrapper.scrollLeft -= 1;
                        if (wrapper.scrollLeft <= 0) wrapper.scrollLeft = wrapper.scrollWidth;
                    } else {
                        wrapper.scrollLeft += 1;
                    }
                }, 20);
            };
            const stopAutoScroll = () => clearInterval(autoScrollInterval);

            // Start auto scroll
            setTimeout(startAutoScroll, 1000);

            // Interactivity
            wrapper.addEventListener('mouseenter', stopAutoScroll);
            wrapper.addEventListener('mouseleave', startAutoScroll);

            wrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                stopAutoScroll();
                wrapper.classList.add('active');
                startX = e.pageX - wrapper.offsetLeft;
                scrollLeft = wrapper.scrollLeft;
            });
            wrapper.addEventListener('mouseleave', () => {
                isDown = false;
                wrapper.classList.remove('active');
            });
            wrapper.addEventListener('mouseup', () => {
                isDown = false;
                wrapper.classList.remove('active');
            });
            wrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                const walk = (x - startX) * 2;
                wrapper.scrollLeft = scrollLeft - walk;
            });

            wrapper.addEventListener('wheel', (e) => {
                stopAutoScroll();
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    e.stopPropagation();
                } else if (e.deltaY !== 0) {
                    e.preventDefault();
                    wrapper.scrollBy({ left: e.deltaY * 2, behavior: 'auto' });
                }
            }, { passive: false });
        });
    }

    // Call it when the DOM is ready
    setTimeout(setupMainMarquees, 1000);

    // Event Listeners
    enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enterExperience();
    });

    // ============ MULTI-PAGE NAVIGATION ============
    const categoryView = document.getElementById('category-view');
    const mainChat = document.getElementById('main-chat');
    const categoryTitle = document.getElementById('category-title');
    const categoryGrid = document.getElementById('category-grid');
    const closeCategory = document.getElementById('close-category');

    async function openCategory(type) {
        // Prepare UI
        categoryTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        categoryGrid.innerHTML = '<div class="loading-spinner">Fetching the best content...</div>';
        categoryView.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent main page scroll

        let urls = [];
        if (type === 'movies') {
            urls = [
                `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`,
                `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=2`,
                `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=3`
            ];
        } else if (type === 'web series') {
            urls = [
                `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=1`,
                `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=2`,
                `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=3`
            ];
        } else if (type === 'trending') {
            urls = [
                `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&page=1`,
                `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&page=2`,
                `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&page=3`
            ];
        }

        try {
            categoryGrid.innerHTML = ''; // Clear loading
            
            // Fetch all pages in parallel
            const responses = await Promise.all(urls.map(url => fetch(url)));
            const dataPages = await Promise.all(responses.map(res => res.json()));
            
            dataPages.forEach(data => {
                data.results.forEach(item => {
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
                    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
                    const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300';

                    const card = document.createElement('div');
                    card.className = 'movie-card';
                    card.innerHTML = `
                        <img src="${poster}" alt="${title}" class="card-poster">
                        <div class="card-info">
                            <p class="card-title">${title}</p>
                            <div class="card-meta">
                                <span>${year}</span>
                                <span class="rating">★ ${rating}</span>
                            </div>
                        </div>
                    `;
                    categoryGrid.appendChild(card);
                });
            });
        } catch (error) {
            categoryGrid.innerHTML = '<div class="error">Failed to load content. Please try again.</div>';
        }
    }

    closeCategory.onclick = () => {
        categoryView.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // Attach to Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const text = link.textContent.toLowerCase();
            if (text === 'discover') {
                categoryView.classList.add('hidden');
                document.body.style.overflow = 'auto';
                return;
            }
            e.preventDefault();
            openCategory(text);
        });
    });

    // Ask AI Button Scroll
    const askAiNav = document.getElementById('ask-ai-nav');
    askAiNav.addEventListener('click', () => {
        // If a category is open, close it first
        categoryView.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Scroll to chat
        mainChat.scrollIntoView({ behavior: 'smooth' });
        
        // Focus the input
        setTimeout(() => chatInput.focus(), 800);
    });

    // Chat Logic
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    function addMessage(text, isUser = false, movies = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

        let movieHtml = '';
        if (movies.length > 0) {
            movieHtml = `<div class="recommendation-grid">
                ${movies.map(movie => `
                    <div class="movie-card">
                        <img src="${movie.poster}" alt="${movie.title}" class="card-poster">
                        <div class="card-info">
                            <p class="card-title">${movie.title}</p>
                            <div class="card-meta">
                                <span>${movie.year}</span>
                                <span class="rating">★ ${movie.rating}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        messageDiv.innerHTML = `
            <div class="avatar">${isUser ? '👤' : '🤖'}</div>
            <div class="message-content">
                <div class="message-bubble">${text}</div>
                ${movieHtml}
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // Attach drag-to-scroll logic
        const grid = messageDiv.querySelector('.recommendation-grid');
        if (grid) {
            let isDown = false;
            let startX;
            let scrollLeft;

            grid.addEventListener('mousedown', (e) => {
                isDown = true;
                grid.style.cursor = 'grabbing';
                startX = e.pageX - grid.offsetLeft;
                scrollLeft = grid.scrollLeft;
            });
            grid.addEventListener('mouseleave', () => {
                isDown = false;
                grid.style.cursor = 'grab';
            });
            grid.addEventListener('mouseup', () => {
                isDown = false;
                grid.style.cursor = 'grab';
            });
            grid.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - grid.offsetLeft;
                const walk = (x - startX) * 2; // scroll speed multiplier
                grid.scrollLeft = scrollLeft - walk;
            });
        }

        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- ADVANCED AI CHATBOT LOGIC ---

    const genreMap = {
        'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35, 'crime': 80,
        'documentary': 99, 'drama': 18, 'family': 10751, 'fantasy': 14, 'history': 36,
        'horror': 27, 'music': 10402, 'mystery': 9648, 'romance': 10749, 'sci-fi': 878, 'scifi': 878, 'space': 878,
        'thriller': 53, 'war': 10752, 'western': 37
    };

    const moodMap = {
        'happy': [35, 10751], 'laugh': [35], 'funny': [35], 'cheer': [35, 10751], 'feel good': [35, 10749],
        'sad': [18], 'cry': [18], 'emotional': [18], 'touching': [18, 10749], 'heartbreak': [18, 10749],
        'excited': [28, 12, 53], 'hype': [28, 12], 'pumped': [28], 'adrenaline': [28, 53], 'epic': [12, 14, 878],
        'scared': [27, 9648], 'spooky': [27], 'terrifying': [27], 'creepy': [27], 'scary': [27],
        'think': [9648, 878, 53], 'mind bending': [878, 9648], 'complex': [9648, 18], 'smart': [99, 36, 18],
        'romantic': [10749], 'love': [10749], 'date': [10749], 'cute': [10749, 35],
        'relax': [35, 16], 'chill': [35, 16, 10751], 'light': [35, 10751], 'cozy': [10751, 14],
        'dark': [80, 53, 27], 'gritty': [80, 18], 'intense': [53, 28]
    };

    async function analyzeAndFetchRecommendations(query) {
        const lowerQuery = query.toLowerCase();
        let isTV = lowerQuery.includes('series') || lowerQuery.includes('show') || lowerQuery.includes('tv') || lowerQuery.includes('web');
        const mediaType = isTV ? 'tv' : 'movie';

        let detectedGenres = new Set();
        let detectedMoods = [];

        // Check for direct genres
        for (const [genre, id] of Object.entries(genreMap)) {
            if (lowerQuery.includes(genre)) detectedGenres.add(id);
        }

        // Check for moods
        for (const [mood, ids] of Object.entries(moodMap)) {
            if (lowerQuery.includes(mood)) {
                detectedMoods.push(mood);
                ids.forEach(id => detectedGenres.add(id));
            }
        }

        const genreArray = Array.from(detectedGenres);
        let apiUrl = '';
        let aiResponseText = '';

        if (genreArray.length > 0) {
            // We found genres/moods, use Discover API
            const genreStr = genreArray.join(',');
            apiUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreStr}&page=1`;

            let contextStr = detectedMoods.length > 0
                ? `a ${detectedMoods.join(' and ')} mood`
                : 'your requested genres';
            aiResponseText = `I perfectly understand ${contextStr}. Here are some highly recommended ${isTV ? 'web series' : 'movies'} tailored to your exact vibe:`;
        } else {
            // No specific mood/genre detected, do a general search
            const encodedQuery = encodeURIComponent(query);
            apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=en-US&query=${encodedQuery}&page=1`;
            aiResponseText = `I've scoured the cinematic database for "${query}". Here is what I found for you:`;
        }

        try {
            const res = await fetch(apiUrl);
            const data = await res.json();

            // Filter out people, keep movies/tv, ensure they have posters
            let results = data.results.filter(item =>
                (item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type) &&
                item.poster_path
            ).slice(0, 20); // Recommend 20 solid options

            if (results.length === 0) {
                // Fallback to popular if search yields nothing
                const fallbackUrl = `https://api.themoviedb.org/3/${mediaType}/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;
                const fallbackRes = await fetch(fallbackUrl);
                const fallbackData = await fallbackRes.json();
                results = fallbackData.results.slice(0, 20);
                aiResponseText = `I couldn't find an exact match for that, but based on current cinematic trends, I highly recommend these 20 popular ${isTV ? 'series' : 'movies'}:`;
            }

            // Map TMDB results to our card format
            const formattedMovies = results.map(item => ({
                title: item.title || item.name,
                year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
                rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
                poster: `${TMDB_IMG}${item.poster_path}`
            }));

            addMessage(aiResponseText, false, formattedMovies);

        } catch (error) {
            console.error("TMDB Fetch Error:", error);
            addMessage("My connection to the cinematic archives was interrupted. Please try again in a moment.", false);
        }
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, true);
            chatInput.value = '';
            chatInput.style.height = 'auto';

            // Show typing indicator (optional, simulating thought)
            const typingMsg = document.createElement('div');
            typingMsg.className = 'message ai typing';
            typingMsg.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="message-content">
                    <div class="message-bubble">Analyzing your cinematic request...</div>
                </div>
            `;
            chatMessages.appendChild(typingMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Fetch after small delay for effect
            setTimeout(() => {
                typingMsg.remove();
                analyzeAndFetchRecommendations(text);
            }, 800);
        }
    }


    sendBtn.addEventListener('click', handleSend);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});
