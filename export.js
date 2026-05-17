// --- ЭКСПОРТ И ИМПОРТ БЭКАПОВ ЧАТА (JSON) ---

function exportChat() {

    const messagesBox = document.getElementById('messagesBox');

    if (!messagesBox || messagesBox.children.length === 0) {

        alert('Чат пуст! Сохранять нечего.');

        return;
    }

    const chatData = {
        html: messagesBox.innerHTML
    };

    const jsonData = JSON.stringify(chatData);

    // Telegram Mini App
    if (
        typeof tg !== 'undefined' &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {

        sendToBot(
            jsonData,
            `chat_backup_${Date.now()}.json`,
            "json"
        );

    } else {

        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(jsonData);

        const link = document.createElement('a');

        link.href = dataStr;

        link.download =
            `chat_backup_${Date.now()}.json`;

        link.click();
    }
}

function importChat(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const data =
                JSON.parse(e.target.result);

            if (data.html) {

                document.getElementById(
                    'messagesBox'
                ).innerHTML = data.html;

                if (
                    typeof updateVisuals === 'function'
                ) {
                    updateVisuals();
                }

                alert("Чат успешно загружен! 🔄");

            } else {

                alert(
                    "Ошибка: Неверный формат файла."
                );
            }

        } catch (err) {

            alert(
                "Ошибка: Файл поврежден или имеет неверный формат."
            );
        }
    };

    reader.readAsText(file);

    event.target.value = '';
}

// --- УМНАЯ НАРЕЗКА ЧАТА В ZIP ---

async function downloadChatAsZip(chatType = 'chat') {

    const messagesBox =
        document.getElementById('messagesBox');

    const zipBtn =
        document.getElementById('zipBtn');

    const contextMenu =
        document.getElementById('contextMenu');

    const msgs = Array
        .from(messagesBox.children)
        .filter(m => m.style.display !== 'none');

    if (msgs.length === 0) {

        alert('Чат пуст! Нечего нарезать.');

        return;
    }

    const originalBtnText = zipBtn.innerHTML;

    try {

        zipBtn.innerHTML = '⏳ Подготовка...';

        zipBtn.style.opacity = '0.5';

        zipBtn.disabled = true;

        const zip = new JSZip();

        const maxAvailableHeight = 640;

        const originalScrollTop =
            messagesBox.scrollTop;

        if (contextMenu) {
            contextMenu.style.display = 'none';
        }

        const wasHidden =
            document.body.classList.contains(
                'show-preview'
            ) === false &&
            window.innerWidth <= 950;

        if (wasHidden) {
            document.body.classList.add(
                'show-preview'
            );
        }

        // --- РАСЧЕТ СЛАЙДОВ ---

        let slidesScrollTops = [0];

        let currentScroll = 0;

        while (
            currentScroll + maxAvailableHeight <
            messagesBox.scrollHeight
        ) {

            let viewportBottom =
                currentScroll +
                maxAvailableHeight;

            let nextAnchorTop =
                viewportBottom;

            for (let msg of msgs) {

                let msgTop =
                    msg.offsetTop;

                let msgBottom =
                    msgTop +
                    msg.offsetHeight;

                if (
                    msgTop > currentScroll &&
                    msgTop < viewportBottom &&
                    msgBottom > viewportBottom
                ) {

                    nextAnchorTop =
                        msgTop - 10;

                    break;

                } else if (
                    msgTop >= viewportBottom
                ) {

                    nextAnchorTop =
                        msgTop - 10;

                    break;
                }
            }

            if (
                nextAnchorTop <= currentScroll
            ) {

                nextAnchorTop +=
                    maxAvailableHeight;
            }

            currentScroll = nextAnchorTop;

            if (
                currentScroll <
                messagesBox.scrollHeight
            ) {

                slidesScrollTops.push(
                    currentScroll
                );

            } else {

                break;
            }
        }

        const totalSlides =
            slidesScrollTops.length;

        // --- СОЗДАНИЕ СКРИНОВ ---

        for (
            let i = 0;
            i < slidesScrollTops.length;
            i++
        ) {

            let slideIndex = i + 1;

            zipBtn.innerHTML =
                `⏳ Слайд ${slideIndex}/${totalSlides}...`;

            messagesBox.scrollTo(
                0,
                slidesScrollTops[i]
            );

            await new Promise(r =>
                setTimeout(r, 250)
            );

            if (
                typeof updateVisuals === 'function'
            ) {

                updateVisuals();
            }

            await new Promise(r =>
                setTimeout(r, 100)
            );

            await captureSlide(
                zip,
                slideIndex
            );

            // Фикс Telegram WebView
            await new Promise(r =>
                setTimeout(r, 50)
            );
        }

        // --- ВОЗВРАТ СОСТОЯНИЯ ---

        messagesBox.scrollTo(
            0,
            originalScrollTop
        );

        if (wasHidden) {

            document.body.classList.remove(
                'show-preview'
            );
        }

        if (
            typeof updateVisuals === 'function'
        ) {

            updateVisuals();
        }

        zipBtn.innerHTML =
            '📦 Упаковка...';

        const content =
            await zip.generateAsync({
                type: "blob"
            });

        const link =
            document.createElement('a');

        link.href =
            URL.createObjectURL(content);

        link.download =
            `instagram_${chatType}_${Date.now()}.zip`;

        link.click();

    } catch (err) {

        console.error(err);

        alert(
            'Ошибка при создании ZIP.'
        );

    } finally {

        zipBtn.innerHTML =
            originalBtnText;

        zipBtn.style.opacity = '1';

        zipBtn.disabled = false;
    }
}

// --- СОЗДАНИЕ PNG СЛАЙДА ---
async function captureSlide(zip, index) {
    const wrapper = document.getElementById('captureArea');

    const oldBR = wrapper.style.borderRadius;
    const oldBS = wrapper.style.boxShadow;
    const oldBorder = wrapper.style.border;
    const oldTransform = wrapper.style.transform;
    const oldFilter = wrapper.style.filter;

    wrapper.style.borderRadius = '0';
    wrapper.style.boxShadow = 'none';
    wrapper.style.border = 'none';
    wrapper.style.transform = 'none';
    wrapper.style.filter = 'none';

    await new Promise(r => requestAnimationFrame(r));

    const canvas = await html2canvas(wrapper, {
        backgroundColor: '#0d1015',
        useCORS: true,
        allowTaint: false,
        scale: Math.min(2, window.devicePixelRatio || 1),
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false,
        onclone: (doc) => {
            doc.body.classList.add('export-mode');

            const cloned = doc.getElementById('captureArea');
            if (cloned) {
                cloned.style.transform = 'none';
                cloned.style.filter = 'none';
                cloned.style.opacity = '1';
                cloned.style.backdropFilter = 'none';
                cloned.style.webkitBackdropFilter = 'none';
            }

            doc.querySelectorAll('*').forEach(el => {
                el.style.filter = 'none';
                el.style.backdropFilter = 'none';
                el.style.webkitBackdropFilter = 'none';
            });
        }
    });

    wrapper.style.borderRadius = oldBR;
    wrapper.style.boxShadow = oldBS;
    wrapper.style.border = oldBorder;
    wrapper.style.transform = oldTransform;
    wrapper.style.filter = oldFilter;

    const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/png', 1.0)
    );

    zip.file(`slide_${index}.png`, blob);
}
