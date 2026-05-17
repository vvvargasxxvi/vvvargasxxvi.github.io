// --- ЭКСПОРТ И ИМПОРТ БЭКАПОВ ЧАТА (JSON) ---

function exportChat() {
    const messagesBox = document.getElementById('messagesBox');
    if (!messagesBox || messagesBox.children.length === 0) {
        alert('Чат пуст! Сохранять нечего.');
        return;
    }
    
    // Сохраняем весь HTML чата в объект
    const chatData = {
        html: messagesBox.innerHTML
    };
    const jsonData = JSON.stringify(chatData);

    // Если открыто внутри ТГ — шлем боту, иначе — скачиваем файлом на комп
    if (typeof tg !== 'undefined' && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        sendToBot(jsonData, `chat_backup_${Date.now()}.json`, "json");
    } else {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
        const link = document.createElement('a');
        link.href = dataStr;
        link.download = `chat_backup_${Date.now()}.json`;
        link.click();
    }
}

function importChat(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.html) {
                document.getElementById('messagesBox').innerHTML = data.html;
                if (typeof updateVisuals === 'function') updateVisuals();
                alert("Чат успешно загружен! 🔄");
            } else {
                alert("Ошибка: Неверный формат файла.");
            }
        } catch (err) {
            alert("Ошибка: Файл поврежден или имеет неверный формат.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

// --- УМНАЯ И БЕЗОПАСНАЯ НАРЕЗКА ЧАТА (УНИВЕРСАЛЬНЫЙ МОДУЛЬ) ---

async function downloadChatAsZip(chatType = 'chat') {
    // Находим нужные элементы прямо внутри функции
    const messagesBox = document.getElementById('messagesBox');
    const zipBtn = document.getElementById('zipBtn');
    const contextMenu = document.getElementById('contextMenu');

    const msgs = Array.from(messagesBox.children).filter(m => m.style.display !== 'none');
    if (msgs.length === 0) return alert('Чат пуст! Нечего нарезать.');

    const originalBtnText = zipBtn.innerHTML;
    
    try {
        zipBtn.innerHTML = '⏳ Подготовка...';
        zipBtn.style.opacity = '0.5';
        zipBtn.disabled = true;

        const zip = new JSZip();
        const maxAvailableHeight = 640; 
        const originalScrollTop = messagesBox.scrollTop;
        
        if (contextMenu) contextMenu.style.display = 'none';
        const wasHidden = document.body.classList.contains('show-preview') === false && window.innerWidth <= 950;
        if (wasHidden) document.body.classList.add('show-preview');

        // 1. РАСЧЕТ ТОЧЕК СКРОЛЛА
        let slidesScrollTops = [0];
        let currentScroll = 0;

        while (currentScroll + maxAvailableHeight < messagesBox.scrollHeight) {
            let viewportBottom = currentScroll + maxAvailableHeight;
            let nextAnchorTop = viewportBottom; 

            for (let msg of msgs) {
                let msgTop = msg.offsetTop; 
                let msgBottom = msgTop + msg.offsetHeight;

                if (msgTop > currentScroll && msgTop < viewportBottom && msgBottom > viewportBottom) {
                    nextAnchorTop = msgTop - 10; 
                    break;
                } else if (msgTop >= viewportBottom) {
                    nextAnchorTop = msgTop - 10;
                    break;
                }
            }

            if (nextAnchorTop <= currentScroll) nextAnchorTop += maxAvailableHeight;
            currentScroll = nextAnchorTop;
            
            if (currentScroll < messagesBox.scrollHeight) {
                slidesScrollTops.push(currentScroll);
            } else {
                break;
            }
        }

        const totalSlides = slidesScrollTops.length;

        // 2. ЦИКЛ СКРИНШОТОВ
        for (let i = 0; i < slidesScrollTops.length; i++) {
            let slideIndex = i + 1;
            zipBtn.innerHTML = `⏳ Слайд ${slideIndex}/${totalSlides}...`;

            messagesBox.scrollTo(0, slidesScrollTops[i]);
            
            // Ждем и вызываем пересчет градиента (если функция существует на странице)
            await new Promise(r => setTimeout(r, 250));
            if (typeof updateVisuals === 'function') updateVisuals(); 
            await new Promise(r => setTimeout(r, 100));

            await captureSlide(zip, slideIndex);
        }

        // ВОЗВРАТ В ИСХОДНОЕ СОСТОЯНИЕ
        messagesBox.scrollTo(0, originalScrollTop);
        if (wasHidden) document.body.classList.remove('show-preview');
        if (typeof updateVisuals === 'function') updateVisuals();

        zipBtn.innerHTML = '📦 Упаковка...';
        const content = await zip.generateAsync({type:"blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        
        // Красивое название архива в зависимости от типа чата
        link.download = `instagram_${chatType}_${Date.now()}.zip`;
        link.click();

    } catch (err) {
        console.error(err);
        alert('Произошла ошибка при нарезке. Попробуй еще раз или уменьши количество сообщений.');
    } finally {
        zipBtn.innerHTML = originalBtnText;
        zipBtn.style.opacity = '1';
        zipBtn.disabled = false;
    }
}

// Функция для создания самого скриншота
async function captureSlide(zip, index) {
    const wrapper = document.getElementById('captureArea');
    const oldBR = wrapper.style.borderRadius;
    const oldBS = wrapper.style.boxShadow;
    const oldBorder = wrapper.style.border;

    wrapper.style.borderRadius = '0';
    wrapper.style.boxShadow = 'none';
    wrapper.style.border = 'none';

    const canvas = await html2canvas(wrapper, {
    backgroundColor: '#0d1015',

    useCORS: true,
    allowTaint: true,

    scale: 3,

    logging: false,

    removeContainer: true,

    imageTimeout: 0,

    foreignObjectRendering: false,

    onclone: (doc) => {

        const cloned = doc.getElementById(wrapper.id);

        if (cloned) {
            cloned.style.transform = 'none';
            cloned.style.filter = 'none';
            cloned.style.opacity = '1';
        }
    }
});

wrapper.style.borderRadius = oldBR;
wrapper.style.boxShadow = oldBS;
wrapper.style.border = oldBorder;

canvas.toBlob((blob) => {

    zip.file(`slide_${index}.png`, blob);

}, 'image/png', 1.0);
