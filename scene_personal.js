// --- ЭКСПОРТ И ИМПОРТ СЦЕНЫ (Личный чат) --- 

function exportChat() {
    const messagesBox = document.getElementById('messagesBox');
    try {
        const chatData = {
            leftName: document.getElementById('leftName').value,
            leftSubtitle: document.getElementById('leftSubtitle').value,
            leftAvatar: document.getElementById('leftAvatar').value,
            timeInput: document.getElementById('timeInput').value,
            htmlContent: messagesBox.innerHTML
        };
        
        const jsonStr = JSON.stringify(chatData);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `scene_personal_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert("Ошибка при сохранении: " + err.message);
    }
}

function importChat(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.htmlContent === undefined) throw new Error("Неверный формат");
            
            document.getElementById('leftName').value = data.leftName || '';
            document.getElementById('headerName').textContent = data.leftName || 'Введите имя...';
            
            document.getElementById('leftSubtitle').value = data.leftSubtitle || '';
            document.getElementById('headerSubtitle').textContent = data.leftSubtitle || '';
            
            document.getElementById('leftAvatar').value = data.leftAvatar || '';
            
            // Обновляем глобальную переменную
            if (typeof currentAvatarSrc !== 'undefined') currentAvatarSrc = data.leftAvatar || 'https://i.pravatar.cc/150';
            if (typeof updateAllAvatars === 'function') updateAllAvatars(); 
            
            document.getElementById('timeInput').value = data.timeInput || '';
            document.getElementById('iosTimeDisplay').textContent = data.timeInput || '';
            
            const messagesBox = document.getElementById('messagesBox');
            const phoneWrapper = document.getElementById('captureArea');
            const contextMenu = document.getElementById('contextMenu');
            
            messagesBox.innerHTML = data.htmlContent;
            
            // Оживляем клики
            const items = messagesBox.querySelectorAll('.message-row, .time-divider');
            items.forEach(item => {
                item.onclick = function(ev) {
                    ev.stopPropagation(); 
                    if (typeof selectedMsgRow !== 'undefined') selectedMsgRow = this;
                    const wrapperRect = phoneWrapper.getBoundingClientRect();
                    let x = ev.clientX - wrapperRect.left; let y = ev.clientY - wrapperRect.top;
                    if (x > 220) x -= 160; 
                    contextMenu.style.display = 'block'; contextMenu.style.left = x + 'px'; contextMenu.style.top = y + 'px';
                };
            });

            if (typeof updateVisuals === 'function') updateVisuals();
            alert("Личная сцена успешно загружена! 🪄");
        } catch (err) {
            alert("Ошибка: файл поврежден или это не сохранение чата.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
