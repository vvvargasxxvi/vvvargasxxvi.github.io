// ЛОГИКА МОБИЛЬНЫХ ВКЛАДОК
function toggleMobileTab(tab) {
    const body = document.body;
    if (tab === 'preview') {
        body.classList.add('show-preview');
        document.getElementById('tabPreview').classList.add('active');
        document.getElementById('tabControls').classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            if (typeof updateVisuals === 'function') updateVisuals();
        }, 50);
    } else {
        body.classList.remove('show-preview');
        document.getElementById('tabControls').classList.add('active');
        document.getElementById('tabPreview').classList.remove('active');
    }
}

const messagesBox = document.getElementById('messagesBox');
const messageInput = document.getElementById('messageInput');
const contextMenu = document.getElementById('contextMenu');
const senderSelect = document.getElementById('senderSelect');
const mainActionBtn = document.getElementById('mainActionBtn');
const phoneWrapper = document.getElementById('captureArea');
const isForwardedCheckbox = document.getElementById('isForwardedCheckbox');
const isSeenCheckbox = document.getElementById('isSeenCheckbox');
const seenTextInput = document.getElementById('seenTextInput');

let savedChars = JSON.parse(localStorage.getItem('ig_dm_characters_v1')) || {};
let replyingToText = null; let storyData = null; let chatImgData = null;
let selectedMsgRow = null;
let editingMsgNode = null; 

function updateHeader() {
    document.getElementById('headerGroupName').textContent = document.getElementById('groupName').value;
    document.getElementById('headerAvTop').src = document.getElementById('avTop').value;
    document.getElementById('headerAvBottom').src = document.getElementById('avBottom').value;
}

function updateTimeHeader() { 
    document.getElementById('iosTimeDisplay').textContent = document.getElementById('timeHeader').value; 
}

function updateSenderList() {
    senderSelect.innerHTML = '<option value="right|Me">Я (Градиент)</option>';
    savedChars = JSON.parse(localStorage.getItem('ig_dm_characters_v1')) || {};
    for (let name in savedChars) { 
        senderSelect.add(new Option(`От лица: ${name}`, `left|${name}`)); 
    }
}

function previewMedia(input, type) {
    const reader = new FileReader();
    reader.onload = (e) => { 
        if (type === 'story') { storyData = e.target.result; } else { chatImgData = e.target.result; } 
    };
    if (input.files[0]) reader.readAsDataURL(input.files[0]);
}

function addMessage() {
    const text = messageInput.value.trim().replace(/\n/g, '<br>');
    
    if (editingMsgNode) {
        if (editingMsgNode.tagName && editingMsgNode.tagName.toLowerCase() === 'img') return; 
        editingMsgNode.innerHTML = text; 
        editingMsgNode = null;
        mainActionBtn.textContent = 'Отправить'; 
        mainActionBtn.style.background = '#0095f6';
        messageInput.value = ''; 
        updateVisuals(); 
        return;
    }

    const [side, charName] = senderSelect.value.split('|');
    if (!text && !chatImgData && !storyData) return;

    const isRight = side === 'right';
    const avatarUrl = isRight ? "" : (savedChars[charName]?.avatar || "");
    
    const isForwarded = isForwardedCheckbox.checked;
    const isSeen = isSeenCheckbox.checked;

    const row = document.createElement('div');
    row.className = `message-row ${isRight ? 'right' : 'left'}`;
    row.setAttribute('data-sender', charName); 
    
    row.onclick = function(e) {
        e.stopPropagation(); selectedMsgRow = this;
        const wrapperRect = phoneWrapper.getBoundingClientRect();
        let x = e.clientX - wrapperRect.left;
        let y = e.clientY - wrapperRect.top;
        if (x > 220) x -= 160; 
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    };

    let html = !isRight ? `<img class="msg-avatar" src="${avatarUrl}" crossorigin="anonymous">` : '';
    html += `<div class="msg-content">`;
    
    if (isForwarded) {
        const headerText = isRight ? 'Вы переслали сообщение' : 'Переслал(-а) сообщение';
        html += `<div class="reply-header">${headerText}</div>`;
    }

    if (storyData) {
        html += `<div class="reply-header">${isRight?'Вы ответили на историю':'Ответил(-а) на историю'}</div>`;
        html += `<div class="reply-wrapper"><div class="reply-line"></div><img src="${storyData}" class="story-thumbnail" crossorigin="anonymous"></div>`;
    } else if (replyingToText) {
        html += `<div class="reply-header">${isRight?'Вы ответили':'Ответил(-а)'}</div>`;
        html += `<div class="reply-wrapper"><div class="reply-line"></div><div class="reply-bubble"><div class="reply-bubble-text">${replyingToText}</div></div></div>`;
    }
    
    if (chatImgData) html += `<img src="${chatImgData}" class="msg-image-attachment" crossorigin="anonymous">`;
    
    if (text) html += `<div class="msg">${text}</div>`;
    
    if (isRight && isSeen) {
        const customTime = seenTextInput.value.trim();
        const seenStr = customTime ? (customTime.toLowerCase().startsWith('просмотр') ? customTime : `Просмотрено ${customTime}`) : 'Просмотрено';
        html += `<div class="seen-text" style="font-size: 11px; color: #8e8e8e; margin-top: 4px; align-self: flex-end; letter-spacing: 0.2px;">${seenStr}</div>`;
    }

    html += `</div>`;
    
    row.innerHTML = html;
    messagesBox.appendChild(row);

    messageInput.value = ''; 
    isForwardedCheckbox.checked = false;
    isSeenCheckbox.checked = false;
    seenTextInput.style.display = 'none';
    seenTextInput.value = '';
    
    cancelReply();
    storyData = null; chatImgData = null;
    updateVisuals(); 
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

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
    document.getElementById('timeDividerInput').value = '';
}

function handleReply() {
    if (!selectedMsgRow || selectedMsgRow.classList.contains('time-divider')) { contextMenu.style.display = 'none'; return; }
    contextMenu.style.display = 'none';
    const msgNode = selectedMsgRow.querySelector('.msg');
    if(!msgNode) return; 

    let fullText = "";
    if (msgNode.tagName.toLowerCase() === 'img') { 
        fullText = '📷 Фото'; 
    } else { 
        fullText = msgNode.innerHTML.replace(/<br\s*[\/]?>/gi, ' '); 
    }

    replyingToText = (fullText.length > 75) ? fullText.substring(0, 72).trim() + '...' : fullText;
    
    document.getElementById('replyPreview').textContent = replyingToText;
    document.getElementById('replyIndicator').style.display = 'block';

    if (window.innerWidth <= 950) { toggleMobileTab('controls'); }
}

function handleEdit() {
    if (!selectedMsgRow || selectedMsgRow.classList.contains('time-divider')) { contextMenu.style.display = 'none'; return; }
    contextMenu.style.display = 'none'; cancelReply(); 
    editingMsgNode = selectedMsgRow.querySelector('.msg');
    if(!editingMsgNode) return;
    if (editingMsgNode.tagName.toLowerCase() === 'img') { alert('Картинки нельзя редактировать!'); editingMsgNode = null; return; }
    let currentText = editingMsgNode.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');
    messageInput.value = currentText; 
    mainActionBtn.textContent = '💾 Сохранить изменения'; 
    mainActionBtn.style.background = '#4CAF50';

    if (window.innerWidth <= 950) { toggleMobileTab('controls'); }
}

function cancelReply() { replyingToText = null; document.getElementById('replyIndicator').style.display = 'none'; }

function handleDelete() { 
    if (!selectedMsgRow) return;
    contextMenu.style.display = 'none';
    selectedMsgRow.remove();
    if (editingMsgNode && editingMsgNode === selectedMsgRow.querySelector('.msg')) {
        editingMsgNode = null; messageInput.value = ''; 
        mainActionBtn.textContent = 'Отправить'; mainActionBtn.style.background = '#0095f6';
    }
    updateVisuals(); 
}

function clearChat() { 
    if(confirm('Очистить?')) {
        messagesBox.innerHTML = ''; 
        isForwardedCheckbox.checked = false;
        isSeenCheckbox.checked = false;
        seenTextInput.style.display = 'none';
        seenTextInput.value = '';
    }
}

function updateVisuals() {
    const msgs = Array.from(messagesBox.children);
    const phoneRect = document.getElementById('captureArea').getBoundingClientRect();
    
    if (phoneRect.height === 0) return;
    
    msgs.forEach((row, i) => {
        if (row.classList.contains('time-divider')) return;
        
        const msg = row.querySelector('.msg');
        const sender = row.getAttribute('data-sender');
        const side = row.classList.contains('right') ? 'right' : 'left';
        
        const next = msgs[i+1];
        const isNextSameAuthor = next && !next.classList.contains('time-divider') && next.getAttribute('data-sender') === sender;
        const hasReply = row.querySelector('.reply-wrapper') !== null;

        if (msg) {
            msg.style.borderRadius = '20px';
            if (side === 'right') {
                if (row.previousElementSibling?.getAttribute('data-sender') === sender && !hasReply) msg.style.borderTopRightRadius = '4px';
                if (isNextSameAuthor) msg.style.borderBottomRightRadius = '4px';
                
                msg.style.backgroundImage = "url('https://i.postimg.cc/T1nmqVM4/фон-градиент.png')";
                msg.style.backgroundSize = `100% ${phoneRect.height}px`;
                msg.style.backgroundRepeat = 'no-repeat';
                const rect = msg.getBoundingClientRect();
                msg.style.backgroundPosition = `0px -${rect.top - phoneRect.top}px`;
            } else {
                if (row.previousElementSibling?.getAttribute('data-sender') === sender && !hasReply) msg.style.borderTopLeftRadius = '4px';
                if (isNextSameAuthor) msg.style.borderBottomLeftRadius = '4px';
            }
        }

        row.style.marginBottom = isNextSameAuthor ? '2px' : '10px';
        const avatar = row.querySelector('.msg-avatar');
        if (avatar) avatar.style.visibility = isNextSameAuthor ? 'hidden' : 'visible';
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
            backgroundColor: '#0d1015',
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
            
            if (typeof tg !== 'undefined' && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                sendToBot(imageData, `group_chat_${Date.now()}.png`, "image");
            } else {
                const link = document.createElement('a'); 
                link.download = `ig_group_chat_${Date.now()}.png`; 
                link.href = imageData; 
                link.click();
            }
        });
    }, 100);
}

// Запуск функций при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    messagesBox.addEventListener('scroll', updateVisuals);
    updateHeader(); 
    updateTimeHeader(); 
    updateSenderList();
    document.addEventListener('click', () => { contextMenu.style.display = 'none'; });
});

// --- ЛОГИКА БИБЛИОТЕКИ ГРУПП ---
document.addEventListener('DOMContentLoaded', () => {
    const groupSelect = document.getElementById('groupLibrarySelect');
    const saveBtn = document.getElementById('saveGroupBtn');
    const deleteBtn = document.getElementById('deleteGroupBtn');
    
    // Автоматически подстраиваемся под возможные ID твоих инпутов
    const groupNameInput = document.getElementById('groupName') || document.getElementById('groupNameInput');
    const groupAvatarInput = document.getElementById('groupAvatar') || document.getElementById('groupAvatarInput');
    
    // Функция загрузки списка групп в выпадающий список
    function loadGroupLibrary() {
        const groups = JSON.parse(localStorage.getItem('group_chat_library')) || {};
        groupSelect.innerHTML = '<option value="">-- Выберите группу --</option>';
        
        Object.keys(groups).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            groupSelect.appendChild(option);
        });
    }

    // При выборе группы из списка — автозаполнение полей
    groupSelect.addEventListener('change', () => {
        const selectedName = groupSelect.value;
        if (!selectedName) return;

        const groups = JSON.parse(localStorage.getItem('group_chat_library')) || {};
        const groupData = groups[selectedName];

        if (groupData) {
            if (groupNameInput) {
                groupNameInput.value = groupData.name;
                groupNameInput.dispatchEvent(new Event('input')); // Триггерим обновление текста
            }
            if (groupAvatarInput) {
                groupAvatarInput.value = groupData.avatar;
                groupAvatarInput.dispatchEvent(new Event('input')); // Триггерим обновление картинки
            }
            
            // Вызываем твои функции обновления интерфейса, если они есть
            if (typeof updateHeader === 'function') updateHeader();
            if (typeof updateVisuals === 'function') updateVisuals();
        }
    });

    // Сохранение текущей заполненной группы
    saveBtn.addEventListener('click', () => {
        const name = groupNameInput ? groupNameInput.value.trim() : '';
        const avatar = groupAvatarInput ? groupAvatarInput.value.trim() : '';

        if (!name) {
            alert('Сначала введи название группы в поле ввода!');
            return;
        }

        const groups = JSON.parse(localStorage.getItem('group_chat_library')) || {};
        groups[name] = { name: name, avatar: avatar };
        
        localStorage.setItem('group_chat_library', JSON.stringify(groups));
        loadGroupLibrary();
        groupSelect.value = name;
        alert(`Группа "${name}" успешно сохранена в библиотеку! 🔥`);
    });

    // Удаление выбранной группы
    deleteBtn.addEventListener('click', () => {
        const selectedName = groupSelect.value;
        if (!selectedName) {
            alert('Сначала выбери группу из списка, которую хочешь удалить!');
            return;
        }

        if (confirm(`Удалить группу "${selectedName}" из библиотеки?`)) {
            const groups = JSON.parse(localStorage.getItem('group_chat_library')) || {};
            delete groups[selectedName];
            
            localStorage.setItem('group_chat_library', JSON.stringify(groups));
            loadGroupLibrary();
            alert('Группа удалена из базы.');
        }
    });

    // Первичный запуск при загрузке страницы
    loadGroupLibrary();
});
