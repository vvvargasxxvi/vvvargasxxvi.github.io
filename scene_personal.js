// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ДВИЖОК ЧАТА ---
const leftNameInput = document.getElementById('leftName');
const leftSubtitleInput = document.getElementById('leftSubtitle');
const timeInput = document.getElementById('timeInput');
const iosTimeDisplay = document.getElementById('iosTimeDisplay');
const leftAvatarInput = document.getElementById('leftAvatar');
const messageInput = document.getElementById('messageInput');
const senderSelect = document.getElementById('senderSelect');
const messagesBox = document.getElementById('messagesBox');
const contextMenu = document.getElementById('contextMenu');
const mainActionBtn = document.getElementById('mainActionBtn');
const phoneWrapper = document.getElementById('captureArea');
const replyIndicator = document.getElementById('replyIndicator');
const replyPreview = document.getElementById('replyPreview');
const storyUploadBlock = document.getElementById('storyUploadBlock');
const storyPreview = document.getElementById('storyPreview');
const cancelStoryBtn = document.getElementById('cancelStoryBtn');
const dynamicHeader = document.getElementById('dynamicHeader');
const characterSelect = document.getElementById('characterSelect');
const isForwardedCheckbox = document.getElementById('isForwardedCheckbox');
const isSeenCheckbox = document.getElementById('isSeenCheckbox');
const seenTextInput = document.getElementById('seenTextInput');

let currentGradientBg = "url('https://i.postimg.cc/T1nmqVM4/фон-градиент.png')"; 
let currentAvatarSrc = leftAvatarInput.value;
let selectedMsgRow = null; 
let editingMsgNode = null;
let replyingToText = null; 
let currentStorySrc = null;
let currentAttachedImageSrc = null;

// ЛОГИКА МОБИЛЬНЫХ ВКЛАДОК 
function toggleMobileTab(tab) {
    const body = document.body;
    if (tab === 'preview') {
        body.classList.add('show-preview');
        document.getElementById('tabPreview').classList.add('active');
        document.getElementById('tabControls').classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => { if (typeof updateVisuals === 'function') updateVisuals(); }, 150);
            });
        });
    } else {
        body.classList.remove('show-preview');
        document.getElementById('tabControls').classList.add('active');
        document.getElementById('tabPreview').classList.remove('active');
    }
}

// ОБНОВЛЕНИЕ ШАПКИ
leftNameInput.addEventListener('input', () => document.getElementById('headerName').textContent = leftNameInput.value);
leftSubtitleInput.addEventListener('input', () => document.getElementById('headerSubtitle').textContent = leftSubtitleInput.value);
timeInput.addEventListener('input', () => iosTimeDisplay.textContent = timeInput.value);

leftAvatarInput.addEventListener('input', function() { currentAvatarSrc = this.value; updateAllAvatars(); });
document.getElementById('avatarUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) { currentAvatarSrc = event.target.result; leftAvatarInput.value = ''; updateAllAvatars(); }
        reader.readAsDataURL(file);
    }
});

function updateAllAvatars() {
    document.getElementById('headerAvatar').src = currentAvatarSrc;
    const avatars = document.querySelectorAll('.msg-avatar');
    avatars.forEach(img => img.src = currentAvatarSrc);
}

window.updateHeaderPos = function() {
    dynamicHeader.style.top = document.getElementById('headerPosY').value + 'px';
    dynamicHeader.style.left = document.getElementById('headerPosX').value + 'px';
}
window.updateTimePos = function() {
    iosTimeDisplay.style.top = document.getElementById('timePosY').value + 'px';
    iosTimeDisplay.style.left = document.getElementById('timePosX').value + 'px';
}

// МЕДИА ВЛОЖЕНИЯ
document.getElementById('storyUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) { 
            currentStorySrc = event.target.result; storyPreview.src = currentStorySrc; storyPreview.style.display = 'block'; cancelStoryBtn.style.display = 'block'; cancelReply(); cancelAttachedImage();
        }
        reader.readAsDataURL(file);
    }
});

function cancelStory() { currentStorySrc = null; document.getElementById('storyUpload').value = ''; storyPreview.style.display = 'none'; cancelStoryBtn.style.display = 'none'; }

document.getElementById('imageAttachUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentAttachedImageSrc = event.target.result; document.getElementById('attachedImagePreview').src = currentAttachedImageSrc; document.getElementById('attachedImagePreview').style.display = 'block'; document.getElementById('cancelAttachedImageBtn').style.display = 'block'; cancelStory(); 
        }
        reader.readAsDataURL(file);
    }
});

function cancelAttachedImage() { currentAttachedImageSrc = null; document.getElementById('imageAttachUpload').value = ''; document.getElementById('attachedImagePreview').style.display = 'none'; document.getElementById('cancelAttachedImageBtn').style.display = 'none'; }

// ДОБАВЛЕНИЕ СООБЩЕНИЙ В ЧАТ
messagesBox.addEventListener('scroll', updateVisuals);
document.addEventListener('click', () => { contextMenu.style.display = 'none'; });

function addTimeDivider() {
    const val = document.getElementById('timeDividerInput').value.trim();
    if (!val) return;
    const div = document.createElement('div');
    div.className = 'time-divider';
    div.textContent = val;
    
    div.onclick = function(e) {
        e.stopPropagation(); selectedMsgRow = this;
        const wrapperRect = phoneWrapper.getBoundingClientRect();
        let x = e.clientX - wrapperRect.left; let y = e.clientY - wrapperRect.top;
        if (x > 220) x -= 160; 
        contextMenu.style.display = 'block'; contextMenu.style.left = x + 'px'; contextMenu.style.top = y + 'px';
    };

    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    document.getElementById('timeDividerInput').value = '';
    updateVisuals();
}

function createRowElement(sender, contentHtml) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message-row ${sender}`;
    
    msgDiv.onclick = function(e) {
        e.stopPropagation(); selectedMsgRow = this;
        const wrapperRect = phoneWrapper.getBoundingClientRect();
        let x = e.clientX - wrapperRect.left; let y = e.clientY - wrapperRect.top;
        if (x > 220) x -= 160; 
        contextMenu.style.display = 'block'; contextMenu.style.left = x + 'px'; contextMenu.style.top = y + 'px';
    };
    
    let html = '';
    if (sender === 'left') { html += `<img class="msg-avatar" src="${currentAvatarSrc}" crossorigin="anonymous">`; }
    html += `<div class="msg-content">${contentHtml}</div>`;
    
    msgDiv.innerHTML = html;
    messagesBox.appendChild(msgDiv);
}

function addMessage() {
    const text = messageInput.value.trim().replace(/\n/g, '<br>');
    if (!text && !currentStorySrc && !currentAttachedImageSrc) return; 

    if (editingMsgNode) {
        if (editingMsgNode.tagName && editingMsgNode.tagName.toLowerCase() === 'img') return; 
        editingMsgNode.innerHTML = text; editingMsgNode = null;
        mainActionBtn.textContent = 'Добавить сообщение'; mainActionBtn.style.background = '#0095f6';
        messageInput.value = ''; updateVisuals(); return;
    }
    
    const sender = senderSelect.value;
    const isForwarded = isForwardedCheckbox.checked;
    const isSeen = isSeenCheckbox.checked;
    let forwardedAdded = false;
    
    let seenHtml = '';
    if (sender === 'right' && isSeen) {
        const customTime = seenTextInput.value.trim();
        const seenStr = customTime ? (customTime.toLowerCase().startsWith('просмотр') ? customTime : `Просмотрено ${customTime}`) : 'Просмотрено';
        seenHtml = `<div class="seen-text" style="font-size: 11px; color: #8e8e8e; margin-top: 4px; align-self: flex-end; letter-spacing: 0.2px;">${seenStr}</div>`;
    }

    if (currentAttachedImageSrc) {
        let imgHtml = '';
        if (isForwarded && !forwardedAdded) {
            const headerText = sender === 'right' ? 'Вы переслали сообщение' : 'Переслал(-а) сообщение';
            const alignSelf = sender === 'right' ? 'flex-end' : 'flex-start';
            imgHtml += `<div class="reply-header" style="align-self: ${alignSelf}; margin-bottom: 4px;">${headerText}</div>`;
            forwardedAdded = true;
        }
        imgHtml += `<img src="${currentAttachedImageSrc}" class="msg msg-image-attachment" crossorigin="anonymous">`;
        if (!text && !currentStorySrc) imgHtml += seenHtml;
        createRowElement(sender, imgHtml);
    }

    if (text || currentStorySrc) {
        let html = '';
        if (isForwarded && !forwardedAdded) {
            const headerText = sender === 'right' ? 'Вы переслали сообщение' : 'Переслал(-а) сообщение';
            const alignSelf = sender === 'right' ? 'flex-end' : 'flex-start';
            html += `<div class="reply-header" style="align-self: ${alignSelf}; margin-bottom: 4px;">${headerText}</div>`;
            forwardedAdded = true;
        }

        if (currentStorySrc) {
            const headerText = sender === 'right' ? 'Вы ответили на историю' : 'Ответил(-а) на вашу историю';
            const alignSelf = sender === 'right' ? 'flex-end' : 'flex-start';
            const flexDir = sender === 'right' ? 'row-reverse' : 'row';
            html += `<div class="reply-header" style="align-self: ${alignSelf};">${headerText}</div>`;
            html += `<div class="reply-wrapper" style="flex-direction: ${flexDir};">`;
            html += `<div class="reply-line" style="background-color: #363636;"></div>`; 
            html += `<img src="${currentStorySrc}" class="story-thumbnail" crossorigin="anonymous"></div>`;
        } 
        else if (replyingToText && !currentAttachedImageSrc) { 
            const headerText = sender === 'right' ? 'Вы ответили' : 'Ответил(-а)';
            const alignSelf = sender === 'right' ? 'flex-end' : 'flex-start';
            const flexDir = sender === 'right' ? 'row-reverse' : 'row';
            html += `<div class="reply-header" style="align-self: ${alignSelf};">${headerText}</div>`;
            html += `<div class="reply-wrapper" style="flex-direction: ${flexDir};">`;
            html += `<div class="reply-line"></div>`;
            html += `<div class="reply-bubble"><div class="reply-bubble-text">${replyingToText}</div></div></div>`;
        }

        if (text) { html += `<div class="msg">${text}</div>`; }
        html += seenHtml;

        if (html !== '') { createRowElement(sender, html); }
    }

    messageInput.value = ''; messagesBox.scrollTop = messagesBox.scrollHeight;
    isForwardedCheckbox.checked = false; isSeenCheckbox.checked = false;
    seenTextInput.style.display = 'none'; seenTextInput.value = '';

    if (replyingToText) cancelReply(); if (currentStorySrc) cancelStory(); if (currentAttachedImageSrc) cancelAttachedImage();
    updateVisuals();
}

// КОНТЕКСТНОЕ МЕНЮ И ЛОГИКА СООБЩЕНИЙ
function handleReply() {
    if (!selectedMsgRow || selectedMsgRow.classList.contains('time-divider')) { contextMenu.style.display = 'none'; return; }
    contextMenu.style.display = 'none';
    const msgNode = selectedMsgRow.querySelector('.msg');
    if(!msgNode) return; 
    
    let fullText = (msgNode.tagName.toLowerCase() === 'img') ? '📷 Фото' : msgNode.innerHTML.replace(/<br\s*[\/]?>/gi, ' '); 
    replyingToText = (fullText.length > 60) ? fullText.substring(0, 57).trim() + '...' : fullText;
    
    document.getElementById('replyPreview').textContent = replyingToText; 
    document.getElementById('replyIndicator').style.display = 'block';
    
    if (window.innerWidth <= 950) { toggleMobileTab('controls'); }
    cancelStory(); cancelAttachedImage();
}

function cancelReply() { replyingToText = null; replyIndicator.style.display = 'none'; }

function handleEdit() {
    if (!selectedMsgRow || selectedMsgRow.classList.contains('time-divider')) { contextMenu.style.display = 'none'; return; }
    contextMenu.style.display = 'none'; cancelReply(); 
    editingMsgNode = selectedMsgRow.querySelector('.msg');
    if(!editingMsgNode) return;
    if (editingMsgNode.tagName.toLowerCase() === 'img') { alert('Картинки нельзя редактировать!'); editingMsgNode = null; return; }
    let currentText = editingMsgNode.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');
    messageInput.value = currentText; mainActionBtn.textContent = '💾 Сохранить изменения'; mainActionBtn.style.background = '#4CAF50';
    
    if (window.innerWidth <= 950) { toggleMobileTab('controls'); }
}

function handleDelete() {
    if (!selectedMsgRow) return;
    contextMenu.style.display = 'none';
    selectedMsgRow.remove();
    if (editingMsgNode && editingMsgNode === selectedMsgRow.querySelector('.msg')) {
        editingMsgNode = null; messageInput.value = ''; mainActionBtn.textContent = 'Добавить сообщение'; mainActionBtn.style.background = '#0095f6';
    }
    updateVisuals();
}

function clearChat() {
    if(confirm('Точно очистить весь чат?')) {
        messagesBox.innerHTML = ''; editingMsgNode = null; cancelReply(); cancelStory(); cancelAttachedImage();
        isForwardedCheckbox.checked = false; isSeenCheckbox.checked = false;
        seenTextInput.style.display = 'none'; seenTextInput.value = '';
        mainActionBtn.textContent = 'Добавить сообщение'; mainActionBtn.style.background = '#0095f6';
    }
}

function updateVisuals() {
    const msgs = Array.from(messagesBox.children);
    const phoneRect = phoneWrapper.getBoundingClientRect(); 
    
    if (phoneRect.height === 0) return;
    
    msgs.forEach((row, i) => {
        if(row.classList.contains('time-divider')) return;

        const isRight = row.classList.contains('right');
        const msg = row.querySelector('.msg');
        const hasReply = row.querySelector('.reply-wrapper') !== null;
        const prev = msgs[i-1];
        const next = msgs[i+1];
        
        const prevSame = prev && prev.classList.contains(isRight ? 'right' : 'left');
        const nextSame = next && next.classList.contains(isRight ? 'right' : 'left');

        if(msg) {
            msg.style.borderRadius = '20px';
            if (isRight) {
                if (prevSame && !hasReply) msg.style.borderTopRightRadius = '4px'; 
                if (nextSame) msg.style.borderBottomRightRadius = '4px';
            } else {
                if (prevSame && !hasReply) msg.style.borderTopLeftRadius = '4px';
                if (nextSame) msg.style.borderBottomLeftRadius = '4px';
            }

            if (isRight && msg.tagName.toLowerCase() !== 'img') {
                msg.style.background = currentGradientBg;
                msg.style.backgroundSize = `100% ${phoneRect.height}px`;
                msg.style.backgroundRepeat = 'no-repeat';
                const msgRect = msg.getBoundingClientRect();
                const relativeTop = msgRect.top - phoneRect.top;
                msg.style.backgroundPosition = `0px -${relativeTop}px`;
            }
        }

        row.style.marginBottom = nextSame ? '2px' : '10px';
        const img = row.querySelector('.msg-avatar');
        if (img) img.style.visibility = nextSame ? 'hidden' : 'visible';
    });
}

function downloadChat(event) {
    if (event) event.preventDefault();
    
    if (typeof contextMenu !== 'undefined' && contextMenu) {
        contextMenu.style.display = 'none';
    }

    const phoneWrapper = document.getElementById('captureArea');
    const wasHidden = document.body.classList.contains('show-preview') === false && window.innerWidth <= 950;
    if (wasHidden) { document.body.classList.add('show-preview'); }

    setTimeout(() => {
        html2canvas(phoneWrapper, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: true, 
            backgroundColor: '#0b1014',
            // --- НАЧАЛО НОВОГО КУСКА ---
            onclone: function(clonedDoc) {
                const clonePhone = clonedDoc.getElementById('captureArea');
                if (clonePhone) {
                    clonePhone.style.setProperty('border-radius', '0', 'important');
                    clonePhone.style.setProperty('border', 'none', 'important');
                    clonePhone.style.setProperty('box-shadow', 'none', 'important');
                }
            }
            // --- КОНЕЦ НОВОГО КУСКА ---
        }).then(canvas => {
            if (wasHidden) { document.body.classList.remove('show-preview'); }
            
            const imageData = canvas.toDataURL('image/png');
            
            if (typeof tg !== 'undefined' && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                sendToBot(imageData, `personal_chat_${Date.now()}.png`, "image");
            } else {
                const link = document.createElement('a'); 
                link.download = `ig_chat_${Date.now()}.png`; 
                link.href = imageData; 
                link.click();
            }
        });
    }, 100);
}

// --- ИСПРАВЛЕННОЕ ОЖИВЛЕНИЕ СООБЩЕНИЙ ПОСЛЕ ИМПОРТА ---
function rebindAllMessages() {
    // 1. Оживляем обычные сообщения (текст и картинки)
    const rows = document.querySelectorAll('.message-row');
    rows.forEach(row => {
        row.onclick = function(e) {
            e.stopPropagation(); 
            selectedMsgRow = this; // Используем правильную переменную твоего движка!
            
            const wrapperRect = phoneWrapper.getBoundingClientRect();
            let x = e.clientX - wrapperRect.left; 
            let y = e.clientY - wrapperRect.top;
            if (x > 220) x -= 160; 
            
            contextMenu.style.display = 'block'; 
            contextMenu.style.left = x + 'px'; 
            contextMenu.style.top = y + 'px';
        };
    });

    // 2. Оживляем разделители времени (они у тебя тоже кликабельные!)
    const dividers = document.querySelectorAll('.time-divider');
    dividers.forEach(div => {
        div.onclick = function(e) {
            e.stopPropagation(); 
            selectedMsgRow = this;
            
            const wrapperRect = phoneWrapper.getBoundingClientRect();
            let x = e.clientX - wrapperRect.left; 
            let y = e.clientY - wrapperRect.top;
            if (x > 220) x -= 160; 
            
            contextMenu.style.display = 'block'; 
            contextMenu.style.left = x + 'px'; 
            contextMenu.style.top = y + 'px';
        };
    });
}

/* === РЕАКЦИИ НА СООБЩЕНИЯХ === */
.msg, .image-msg {
    position: relative !important; /* Важно, чтобы бейдж позиционировался относительно самого пузыря */
}

.msg-reaction {
    position: absolute;
    bottom: -10px;       /* Сдвигаем вниз за край сообщения */
    right: 15px;         /* По умолчанию висит справа */
    background: #262626; /* Темный фон инсты */
    border: 2px solid #000; /* Черная рамка, чтобы сливалось с фоном чата */
    border-radius: 12px;
    padding: 2px 6px;
    font-size: 13px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}
