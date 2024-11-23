let appState = {
    isSleeping: false,
    sleepStartTime: null,
    sleepEndTime: null,
    sleepHistory: [],
    darkMode: false
};

const saveToLocalStorage = () => {
    localStorage.setItem('sleepAppState', JSON.stringify(appState));
};

const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem('sleepAppState');
    if (savedState) {
        appState = JSON.parse(savedState);
        if (appState.darkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle i').classList.remove('fa-moon');
            document.querySelector('.theme-toggle i').classList.add('fa-sun');
        }
    }
};

const showNotification = (message, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: message
    });
};

const toggleTheme = () => {
    const body = document.body;
    const icon = document.querySelector('.theme-toggle i');
    
    body.classList.toggle('dark-mode');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
    
    appState.darkMode = body.classList.contains('dark-mode');
    saveToLocalStorage();

    gsap.from(body, {
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.inOut"
    });
};

const calculateSleepDuration = (startTime, endTime) => {
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    return {
        hours: Math.floor(duration.asHours()),
        minutes: Math.floor(duration.minutes())
    };
};

const resetData = () => {
    Swal.fire({
        title: getText('confirmReset'),
        text: getText('resetWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: getText('resetConfirm'),
        cancelButtonText: getText('resetCancel'),
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#7F5AF0'
    }).then((result) => {
        if (result.isConfirmed) {
            appState.sleepHistory = [];
            saveToLocalStorage();
            updateUI();
            showNotification(getText('dataReset'), 'success');
        }
    });
};

const startSleep = () => {
    if (appState.isSleeping) {
        showNotification(getText('alreadySleeping'), 'warning');
        return;
    }

    gsap.to('.sleep-buttons', {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    });

    Swal.fire({
        title: getText('sweetDreams'),
        html: `
            <div class="sleep-quality-container">
                <p class="mb-3">${getText('startingSleep')}</p>
                <div class="sleep-time-display">
                    <i class="fas fa-moon"></i>
                    ${new Date().toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <p class="small text-muted mt-3">
                    ${getText('evaluateQuality')}
                </p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: getText('startSleep'),
        cancelButtonText: getText('cancel'),
        confirmButtonColor: '#7F5AF0',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            appState.isSleeping = true;
            appState.sleepStartTime = new Date().toISOString();
            saveToLocalStorage();
            updateUI();
            showNotification(getText('sleepStarted'), 'success');
        }
    });
};

const endSleep = () => {
    if (!appState.isSleeping) {
        showNotification(getText('notSleeping'), 'warning');
        return;
    }

    appState.sleepEndTime = new Date().toISOString();
    const duration = calculateSleepDuration(
        new Date(appState.sleepStartTime),
        new Date(appState.sleepEndTime)
    );

    gsap.to('.sleep-buttons', {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    });

    Swal.fire({
        title: getText('goodMorning'),
        html: `
            <div class="sleep-quality-container">
                <h5 class="mb-3">${getText('sleepQuality')}</h5>
                <div class="sleep-quality mb-4">
                    <i class="fas fa-star quality-star" data-value="1"></i>
                    <i class="fas fa-star quality-star" data-value="2"></i>
                    <i class="fas fa-star quality-star" data-value="3"></i>
                    <i class="fas fa-star quality-star" data-value="4"></i>
                    <i class="fas fa-star quality-star" data-value="5"></i>
                </div>
                
                <div class="d-flex justify-content-center gap-3 mb-4">
                    <button class="mood-btn" data-mood="energetic">
                        <i class="fas fa-bolt fa-lg"></i>
                    </button>
                    <button class="mood-btn" data-mood="normal">
                        <i class="fas fa-smile fa-lg"></i>
                    </button>
                    <button class="mood-btn" data-mood="tired">
                        <i class="fas fa-bed fa-lg"></i>
                    </button>
                </div>

                <div class="sleep-time-display w-100 mb-3">
                    <i class="fas fa-clock"></i>
                    ${duration.hours} ${getText('hours')} ${duration.minutes} ${getText('minutes')}
                </div>
            </div>
        `,
        confirmButtonText: getText('save'),
        confirmButtonColor: '#7F5AF0',
        showCancelButton: false,
        didRender: () => {
            const stars = document.querySelectorAll('.quality-star');
            let selectedRating = 0;

            stars.forEach(star => {
                star.addEventListener('click', () => {
                    selectedRating = parseInt(star.dataset.value);
                    stars.forEach((s, index) => {
                        s.style.color = index < selectedRating ? '#FFB800' : '#ddd';
                    });
                });

                star.addEventListener('mouseenter', () => {
                    gsap.to(star, {
                        scale: 1.2,
                        duration: 0.2
                    });
                });

                star.addEventListener('mouseleave', () => {
                    gsap.to(star, {
                        scale: 1,
                        duration: 0.2
                    });
                });
            });

            const moodButtons = document.querySelectorAll('.mood-btn');
            moodButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    moodButtons.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const quality = document.querySelectorAll('.quality-star[style*="rgb(255, 184, 0)"]').length;
            const mood = document.querySelector('.mood-btn.selected')?.dataset.mood || 'normal';

            const sleepRecord = {
                startTime: appState.sleepStartTime,
                endTime: appState.sleepEndTime,
                duration: duration,
                quality: quality,
                mood: mood
            };

            appState.sleepHistory.unshift(sleepRecord);
            appState.isSleeping = false;
            appState.sleepStartTime = null;
            appState.sleepEndTime = null;

            saveToLocalStorage();
            updateUI();
            showNotification(`${duration.hours} ${getText('hours')} ${duration.minutes} ${getText('minutes')} ${getText('sleptFor')}`, 'success');
        }
    });
};

const updateUI = () => {
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    const historyContainer = document.getElementById('sleepHistory');

    startButton.disabled = appState.isSleeping;
    endButton.disabled = !appState.isSleeping;

    historyContainer.innerHTML = '';
    appState.sleepHistory.forEach((record, index) => {
        const startDate = new Date(record.startTime);
        const endDate = new Date(record.endTime);

        const entryElement = document.createElement('div');
        entryElement.className = 'sleep-entry animate-entry';
        entryElement.style.animationDelay = `${index * 0.1}s`;

        const moodIcons = {
            energetic: '<i class="fas fa-bolt text-warning"></i>',
            normal: '<i class="fas fa-smile text-success"></i>',
            tired: '<i class="fas fa-bed text-primary"></i>'
        };

        const locale = currentLang === 'en' ? 'en-US' : 
                     currentLang === 'es' ? 'es-ES' : 'tr-TR';

        const dateOptions = { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        };

        entryElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${startDate.toLocaleDateString(locale, dateOptions)}</h5>
                    <small>${startDate.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit'
                    })} - ${endDate.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</small>
                </div>
                <div class="text-end">
                    <h5 class="mb-1">${record.duration.hours} ${getText('hours')} ${record.duration.minutes} ${getText('minutes')}</h5>
                    <div>${'⭐'.repeat(record.quality)}</div>
                    ${record.mood ? `<small class="text-muted">${moodIcons[record.mood]}</small>` : ''}
                </div>
            </div>
        `;

        historyContainer.appendChild(entryElement);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateUI();
    AOS.init();

    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });

    tippy('[data-tippy-content]', {
        theme: 'light',
        animation: 'scale'
    });

    updatePageText();
});