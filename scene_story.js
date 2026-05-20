// --- ЛОГИКА ГЕНЕРАТОРА ИСТОРИЙ ---

function toggleMobileTab(tab) {
    const body = document.body;
    if (tab === 'preview') {
        body.classList.add('show-preview');
        document.getElementById('tabPreview').classList.add('active');
        document.getElementById('tabControls').classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        body.classList.remove('show-preview');
        document.getElementById('tabControls').classList.add('active');
        document.getElementById('tabPreview').classList.remove('active');
    }
}

function updateStoryHeader() {
    const usernameInput = document.getElementById('storyUsername');
    const timeInput = document.getElementById('storyTime');
    const avatarInput = document.getElementById('storyAvatarUrl');
    const musicInput = document.getElementById('storyMusic');

    if (usernameInput) document.getElementById('displayUsername').textContent = usernameInput.value;
    if (timeInput) document.getElementById('displayTime').textContent = timeInput.value;
    if (avatarInput) document.getElementById('displayAvatar').src = avatarInput.value;
    
    if (musicInput) {
        const musicText = musicInput.value.trim();
        const musicContainer = document.getElementById('musicContainer');
        if (musicContainer) {
            if (musicText) {
                document.getElementById('displayMusic').textContent = musicText;
                musicContainer.style.display = 'flex';
            } else {
                musicContainer.style.display = 'none';
            }
        }
    }
}

function clearBackground() {
    const bgUpload = document.getElementById('bgUpload');
    if (bgUpload) bgUpload.value = '';
    const bg = document.getElementById('storyBackground');
    if (bg) {
        bg.src = '';
        bg.style.display = 'none';
    }
}

// --- БЕЗОПАСНОЕ ОБНОВЛЕНИЕ ТЕКСТА ---
function updateStoryText() {
    const input = document.getElementById('storyTextInput');
    const display = document.getElementById('storyTextDisplay');
    const colorInput = document.getElementById('textColor');
    const fontSelect = document.getElementById('fontSelect');

    if (!input || !display) return;

    // Обновляем текст на экране (сохраняя переносы строк)
    display.innerHTML = input.value.replace(/\n/g, '<br>');

    if (colorInput) display.style.color = colorInput.value;
    if (fontSelect) display.style.fontFamily = fontSelect.value;

    // Если поле ввода пустое — полностью прячем текст с экрана
    if (input.value.trim() === '') {
        display.style.display = 'none';
    } else {
        display.style.display = 'block';
    }
}

// --- БЕЗОПАСНОЕ ОБНОВЛЕНИЕ ЛОКАЦИИ ---
function updateLocationColors() {
    const sticker = document.getElementById('storyLocationDisplay');
    const icon = document.getElementById('locIcon');
    const bgColor = document.getElementById('locBgColor');
    const textColor = document.getElementById('locTextColor');
    
    if (!sticker) return;
    if (bgColor) sticker.style.backgroundColor = bgColor.value;
    if (textColor) {
        sticker.style.color = textColor.value;
        if (icon) icon.setAttribute('stroke', textColor.value);
    }
}

function updateLocation() {
    const input = document.getElementById('locationInput') || document.getElementById('storyLocationInput');
    const display = document.getElementById('storyLocationDisplay');
    const showLocation = document.getElementById('showLocation');
    
    if (!display) return;

    const text = input ? input.value.trim() : '';
    const isVisible = showLocation ? showLocation.checked : true;

    if (text === '' || !isVisible) {
        display.style.display = 'none';
    } else {
        display.style.display = 'flex';
        const textContainer = document.getElementById('locText') || display.querySelector('span') || display;
        if (textContainer) textContainer.textContent = text;
    }
    
    updateLocationColors();
}

function toggleElements() {
    const showTopHeader = document.getElementById('showTopHeader');
    if (!showTopHeader) return;
    
    const isVisible = showTopHeader.checked;
    const headerUI = document.getElementById('headerUI');
    const gradTop = document.getElementById('gradTop');
    const gradBottom = document.getElementById('gradBottom');

    if (headerUI) headerUI.style.display = isVisible ? 'block' : 'none';
    if (gradTop) gradTop.style.display = isVisible ? 'block' : 'none';
    if (gradBottom) gradBottom.style.display = isVisible ? 'block' : 'none';
}

// --- ИНТЕРАКТИВНОЕ УПРАВЛЕНИЕ НА ЭКРАНЕ (ТАCКАНИЕ) ---
function makeElementInteractive(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const parent = el.parentElement; 
    let isDragging = false;

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        let rect = parent.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        el.style.left = x + '%';
        el.style.top = y + '%';
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        el.style.cursor = 'grab';
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    }

    function onStart(e) {
        isDragging = true;
        el.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });
}

// --- ФУНКЦИЯ СКАЧИВАНИЯ ИСТОРИИ ---
function downloadStory(event) {
    if (event) event.preventDefault();

    const phoneWrapper = document.getElementById('captureArea');
    const wasHidden = document.body.classList.contains('show-preview') === false && window.innerWidth <= 950;
    if (wasHidden) { document.body.classList.add('show-preview'); }

    const targetWidth = 1173;
    const exportScale = targetWidth / phoneWrapper.offsetWidth;

    setTimeout(() => {
        html2canvas(phoneWrapper, { 
            scale: exportScale, 
            useCORS: true, 
            allowTaint: true, 
            backgroundColor: '#0b1014',
            onclone: function(clonedDoc) {
                // Прячем рамки телефона
                const clonePhone = clonedDoc.getElementById('captureArea');
                if (clonePhone) {
                    clonePhone.style.setProperty('border-radius', '0', 'important');
                    clonePhone.style.setProperty('border', 'none', 'important');
                    clonePhone.style.setProperty('box-shadow', 'none', 'important');
                }
                
                // ЖЕСТКО УБИРАЕМ ПОЛЗУНОК ИЗ СКРИНШОТА
                const cloneSlider = clonedDoc.querySelector('.ig-slider-container');
                if (cloneSlider) {
                    cloneSlider.style.setProperty('display', 'none', 'important');
                }
            }
        }).then(canvas => {
            if (wasHidden) { document.body.classList.remove('show-preview'); }
            
            const imageData = canvas.toDataURL('image/png');
            
            if (typeof tg !== 'undefined' && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                sendToBot(imageData, `story_${Date.now()}.png`, "image");
            } else {
                const link = document.createElement('a'); 
                link.download = `story_${Date.now()}.png`; 
                link.href = imageData; 
                link.click();
            }
        });
    }, 100);
}

// --- ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Загрузка фона
    const bgUploadBtn = document.getElementById('bgUpload');
    if (bgUploadBtn) {
        bgUploadBtn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const bg = document.getElementById('storyBackground');
                    if (bg) {
                        bg.src = event.target.result;
                        bg.style.display = 'block';
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. Загрузка аватарки
    const avatarUploadBtn = document.getElementById('avatarUpload');
    if (avatarUploadBtn) {
        avatarUploadBtn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const displayAvatar = document.getElementById('displayAvatar');
                    const storyAvatarUrl = document.getElementById('storyAvatarUrl');
                    if (displayAvatar) displayAvatar.src = event.target.result;
                    if (storyAvatarUrl) storyAvatarUrl.value = event.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Первичное обновление данных на экране
    updateStoryHeader();
    updateLocation();
    updateStoryText();
    if (typeof toggleElements === 'function') toggleElements();

    // 4. Включаем перетаскивание
    makeElementInteractive('storyTextDisplay');
    makeElementInteractive('storyLocationDisplay');

    // 5. Привязываем инстаграмовский ползунок размера к тексту
    const igSlider = document.getElementById('igTextSizeSlider');
    const storyText = document.getElementById('storyTextDisplay');

    if (igSlider && storyText) {
        igSlider.addEventListener('input', (e) => {
            storyText.style.fontSize = e.target.value + 'px';
        });
        
        // Синхронизируем стартовый размер текста с ползунком при загрузке
        storyText.style.fontSize = igSlider.value + 'px';
    }
});
