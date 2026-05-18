// --- ЭКСПОРТ И ИМПОРТ БЭКАПОВ ЧАТА (JSON) ---

function exportChat() {
    const messagesBox = document.getElementById('messagesBox');
    if (!messagesBox || messagesBox.children.length === 0) {
        alert('Чат пуст! Сохранять нечего.');
        return;
    }
    
    const chatData = { html: messagesBox.innerHTML };
    const jsonData = JSON.stringify(chatData);

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

// --- УМНАЯ И БЕЗОПАСНАЯ НАРЕЗКА ЧАТА ---

async function downloadChatAsZip(chatType = 'chat') {
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

        for (let i = 0; i < slidesScrollTops.length; i++) {
            let slideIndex = i + 1;
            zipBtn.innerHTML = `⏳ Слайд ${slideIndex}/${totalSlides}...`;

            messagesBox.scrollTo(0, slidesScrollTops[i]);
            
            await new Promise(r => setTimeout(r, 250));
            if (typeof updateVisuals === 'function') updateVisuals(); 
            await new Promise(r => setTimeout(r, 100));

            await captureSlide(zip, slideIndex);
        }

        messagesBox.scrollTo(0, originalScrollTop);
        if (wasHidden) document.body.classList.remove('show-preview');
        if (typeof updateVisuals === 'function') updateVisuals();

        zipBtn.innerHTML = '📦 Упаковка...';
        const content = await zip.generateAsync({type:"blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        
        link.download = `instagram_${chatType}_${Date.now()}.zip`;
        link.click();

    } catch (err) {
        console.error(err);
        alert('Произошла ошибка при нарезке.');
    } finally {
        zipBtn.innerHTML = originalBtnText;
        zipBtn.style.opacity = '1';
        zipBtn.disabled = false;
    }
}

// Функция для создания самого скриншота
async function captureSlide(zip, index) {
    const wrapper = document.getElementById('captureArea');
    
    const canvas = await html2canvas(wrapper, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0d1015',
        onclone: function(clonedDoc) {
            const clonePhone = clonedDoc.getElementById('captureArea');
            if (clonePhone) {
                clonePhone.style.setProperty('border-radius', '0', 'important');
                clonePhone.style.setProperty('border', 'none', 'important');
                clonePhone.style.setProperty('box-shadow', 'none', 'important');
            }
        }
    });

    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
    zip.file(`slide_${index}.png`, base64Data, {base64: true});
}
