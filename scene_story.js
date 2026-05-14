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

function downloadStory() {
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
            backgroundColor: '#0b1014' 
        }).then(canvas => {
            if (wasHidden) { document.body.classList.remove('show-preview'); }
            const link = document.createElement('a'); 
            link.download = `ig_story_${Date.now()}.png`; 
            link.href = canvas.toDataURL('image/png'); 
            link.click();
        });
    }, 100);
}

// --- БЕЗОПАСНЫЙ ЗАПУСК ---
// Этот блок ждет, пока браузер нарисует все кнопки, и только потом подключает логику загрузки файлов
document.addEventListener('DOMContentLoaded', () => {
    
    // Подключаем кнопку ФОНА
    const bgUploadBtn = document.getElementById('bgUpload');
    if (bgUploadBtn) {
        bgUploadBtn.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const bg = document.getElementById('storyBackground');
                    bg.src = event.target.result;
                    bg.style.display = 'block'; // Делаем картинку видимой
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Подключаем кнопку АВАТАРКИ
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

    // Запускаем первичное обновление текста и шапки
    updateStoryHeader();
    updateLocation();
    updateStoryText();
});
