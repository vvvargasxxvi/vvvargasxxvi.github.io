// --- ЭКСПОРТ И ИМПОРТ СЦЕНЫ (Групповой чат) ---

function exportChat() {
    const messagesBox = document.getElementById('messagesBox');
    try {
        const chatData = {
            groupName: document.getElementById('groupName').value,
            avTop: document.getElementById('avTop').value,
            avBottom: document.getElementById('avBottom').value,
            timeHeader: document.getElementById('timeHeader').value,
            htmlContent: messagesBox.innerHTML
        };
        
        // Создаем полноценный файл в памяти браузера
        const jsonStr = JSON.stringify(chatData);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Создаем ссылку, кликаем и убираем за собой
        const link = document.createElement('a');
        link.href = url;
        link.download = `scene_group_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Очищаем память
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
            
            // Восстанавливаем настройки шапки
            document.getElementById('groupName').value = data.groupName || '';
            document.getElementById('avTop').value = data.avTop || '';
            document.getElementById('avBottom').value = data.avBottom || '';
            document.getElementById('timeHeader').value = data.timeHeader || '';
            
            // Вставляем сами сообщения
            const messagesBox = document.getElementById('messagesBox');
            messagesBox.innerHTML = data.htmlContent;

            // Обновляем визуал шапки
            if (typeof updateHeader === 'function') updateHeader();
            if (typeof updateTimeHeader === 'function') updateTimeHeader();
            
            const phoneWrapper = document.getElementById('captureArea');
            const contextMenu = document.getElementById('contextMenu');
            
            // Оживляем клики для меню (Ответить/Изменить/Удалить)
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
            alert("Групповая сцена успешно загружена! 🪄");
        } catch (err) {
            alert("Ошибка: файл поврежден или это не сохранение чата.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Сбрасываем инпут
}
