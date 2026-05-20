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
    document.getElementById('displayUsername').textContent = document.getElementById('storyUsername').value;
    document.getElementById('displayTime').textContent = document.getElementById('storyTime').value;
    document.getElementById('displayAvatar').src = document.getElementById('storyAvatarUrl').value;
    
    const musicText = document.getElementById('storyMusic').value.trim();
    const musicContainer = document.getElementById('musicContainer');
    if (musicText) {
        document.getElementById('displayMusic').textContent = musicText;
        musicContainer.style.display = 'flex';
    } else {
        musicContainer.style.display = 'none';
    }
}

function clearBackground() {
    document.getElementById('bgUpload').value = '';
    const bg = document.getElementById('storyBackground');
    bg.src = '';
    bg.style.display = 'none';
}

function updateStoryText() {
    const textElement = document.getElementById('storyTextDisplay');
    const newText = document.getElementById('storyTextInput').value;
    const color = document.getElementById('textColor').value;
    const font = document.getElementById('fontSelect').value;
    const size = document.getElementById('textSize').value; 
    
    textElement.innerHTML = newText.replace(/\n/g, '<br>');
    textElement.style.color = color;
    textElement.style.fontFamily = font;
    textElement.style.fontSize = size + 'px'; 
}

function updateLocationColors() {
    const sticker = document.getElementById('storyLocationDisplay');
    const icon = document.getElementById('locIcon');
    const bgColor = document.getElementById('locBgColor').value;
    const textColor = document.getElementById('locTextColor').value;
    
    sticker.style.backgroundColor = bgColor;
    sticker.style.color = textColor;
    icon.setAttribute('stroke', textColor);
}

function updateLocation() {
    const text = document.getElementById('locationInput').value.trim();
    const isVisible = document.getElementById('showLocation').checked;
    const sticker = document.getElementById('storyLocationDisplay');
    
    document.getElementById('locText').textContent = text;
    sticker.style.display = (isVisible && text !== '') ? 'flex' : 'none';
    
    updateLocationColors();
}

function updatePosition(elementId, xInputId, yInputId) {
    const element = document.getElementById(elementId);
    const x = document.getElementById(xInputId).value;
    const y = document.getElementById(yInputId).value;
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
}

function toggleElements() {
    document.getElementById('headerUI').style.display = document.getElementById('showTopHeader').checked ? 'block' : 'none';
    
    const showGradients = document.getElementById('showTopHeader').checked;
    document.getElementById('gradTop').style.display = showGradients ? 'block' : 'none';
    document.getElementById('gradBottom').style.display = showGradients ? 'block' : 'none';
}

function downloadStory(event) {
    // Блокируем перезагрузку
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
            // --- ДОБАВЛЕННЫЙ БЛОК ONCLONE ---
            onclone: function(clonedDoc) {
                const clonePhone = clonedDoc.getElementById('captureArea');
                if (clonePhone) {
                    clonePhone.style.setProperty('border-radius', '0', 'important');
                    clonePhone.style.setProperty('border', 'none', 'important');
                    clonePhone.style.setProperty('box-shadow', 'none', 'important');
                }
            }
            // --- КОНЕЦ БЛОКА ---
        }).then(canvas => {
            if (wasHidden) { document.body.classList.remove('show-preview'); }
            
            const imageData = canvas.toDataURL('image/png');
            
            // Если в ТГ — отправляем в чат. Если на ноуте — скачиваем файлом.
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

// --- ДРАГ-Н-ДРОП ДЛЯ ТЕКСТА И ЛОКАЦИИ ---
function makeDraggable(elementId, xSliderId, ySliderId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const parent = el.parentElement; // Область фотографии
    const xSlider = document.getElementById(xSliderId);
    const ySlider = document.getElementById(ySliderId);

    let isDragging = false;
    el.style.cursor = 'grab';

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault(); // Блокируем скролл страницы на телефоне во время перетаскивания

        // Берем координаты мыши или пальца
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        // Вычисляем положение относительно контейнера
        let rect = parent.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // Ограничиваем, чтобы не улетало за края (от 0 до 100%)
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        // Двигаем элемент
        el.style.left = x + '%';
        el.style.top = y + '%';

        // Синхронизируем визуальные ползунки в меню
        if (xSlider) xSlider.value = x;
        if (ySlider) ySlider.value = y;
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        el.style.transition = 'left 0.1s ease, top 0.1s ease'; // Возвращаем плавность для ползунков
        el.style.cursor = 'grab';
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    }

    function onStart(e) {
        isDragging = true;
        el.style.transition = 'none'; // Отключаем CSS-задержку, чтобы текст не отставал от пальца
        el.style.cursor = 'grabbing';
        
        // Вешаем слушатели на весь экран, чтобы палец/курсор не "соскальзывал" с текста
        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    // Слушаем начало касания/клика на самом элементе
    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });
}

// --- БЕЗОПАСНЫЙ ЗАПУСК ---
document.addEventListener('DOMContentLoaded', () => {
    const bgUploadBtn = document.getElementById('bgUpload');
    if (bgUploadBtn) {
        bgUploadBtn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const bg = document.getElementById('storyBackground');
                    bg.src = event.target.result;
                    bg.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const avatarUploadBtn = document.getElementById('avatarUpload');
    if (avatarUploadBtn) {
        avatarUploadBtn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('displayAvatar').src = event.target.result;
                    document.getElementById('storyAvatarUrl').value = event.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    updateStoryHeader();
    updateLocation();
    updateStoryText();
    
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

// --- ФУНКЦИЯ СКАЧИВАНИЯ ИСТОРИИ (С СКРЫТИЕМ ПОЛЗУНКА) ---
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
                // Прячем рамки телефона при экспорте
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
    if (typeof updateStoryHeader === 'function') updateStoryHeader();
    if (typeof updateLocation === 'function') updateLocation();
    if (typeof updateStoryText === 'function') updateStoryText();

    // Включаем таскание (проверяет оба возможных ID)
    makeElementInteractive('storyText');
    makeElementInteractive('storyTextDisplay');
    makeElementInteractive('storyLocation');
    makeElementInteractive('storyLocationDisplay');

    // Привязываем ползунок размера к тексту
    const igSlider = document.getElementById('igTextSizeSlider');
    const storyText = document.getElementById('storyText') || document.getElementById('storyTextDisplay');

    if (igSlider && storyText) {
        igSlider.addEventListener('input', (e) => {
            storyText.style.fontSize = e.target.value + 'px';
        });
    }
});
