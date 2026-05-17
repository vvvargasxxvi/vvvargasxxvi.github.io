// --- TELEGRAM MINI APP ---
const tg = window.Telegram?.WebApp;

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycby0aYje6RAIOcqKB4R4fg7ZR65Is4Tu7UYYDGGaQa37Vvn-vFea7uyuUsRKjAgS7RYb/exec';

// Сообщаем Telegram что Mini App готов
if (tg) {
    tg.ready();
    tg.expand();
}

// ----------------------------
// ОТПРАВКА В БОТА
// ----------------------------
function sendToBot(fileData, fileName, fileType) {

    // Проверяем запуск внутри Telegram
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        alert('Открой Mini App внутри Telegram');
        return;
    }

    const userId = tg.initDataUnsafe.user.id;

    console.log("USER ID:", userId);

    tg.MainButton.setText('Отправляем...');
    tg.MainButton.show();
    tg.MainButton.showProgress();

    const payload = {
        chat_id: userId,
        file: fileData,
        filename: fileName,
        type: fileType
    };

    fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
    })
    .then(async (res) => {

        tg.MainButton.hide();
        tg.MainButton.hideProgress();

        const text = await res.text();

        console.log("Ответ сервера:", text);

        tg.showAlert('Файл отправлен в чат');
    })
    .catch((err) => {

        tg.MainButton.hide();
        tg.MainButton.hideProgress();

        console.error(err);

        tg.showAlert('Ошибка: ' + err.message);
    });
}

// --- БИБЛИОТЕКА ПЕРСОНАЖЕЙ ---
let savedCharacters = JSON.parse(
    localStorage.getItem('ig_dm_characters_v1')
) || {};

function updateCharDropdown() {

    const characterSelect = document.getElementById('characterSelect');

    if (!characterSelect) return;

    characterSelect.innerHTML =
        '<option value="">-- Выбери или создай --</option>';

    for (let name in savedCharacters) {

        let opt = document.createElement('option');

        opt.value = name;
        opt.textContent = name;

        characterSelect.appendChild(opt);
    }
}

function loadCharacter() {

    const characterSelect =
        document.getElementById('characterSelect');

    if (!characterSelect) return;

    const name = characterSelect.value;

    if (!name) return;

    const char = savedCharacters[name];

    if (document.getElementById('leftName')) {
        document.getElementById('leftName').value = name;
    }

    if (document.getElementById('leftSubtitle')) {
        document.getElementById('leftSubtitle').value =
            char.subtitle || '';
    }

    if (document.getElementById('leftAvatar')) {
        document.getElementById('leftAvatar').value =
            char.avatar || '';
    }

    if (document.getElementById('headerName')) {
        document.getElementById('headerName').textContent = name;
    }

    if (document.getElementById('headerSubtitle')) {
        document.getElementById('headerSubtitle').textContent =
            char.subtitle || '';
    }

    if (document.getElementById('storyUsername')) {

        document.getElementById('storyUsername').value =
            char.subtitle || name;

        document.getElementById('storyAvatarUrl').value =
            char.avatar || '';

        if (typeof updateStoryHeader === 'function') {
            updateStoryHeader();
        }
    }

    if (typeof currentAvatarSrc !== 'undefined') {
        currentAvatarSrc = char.avatar;
    }

    if (typeof updateAllAvatars === 'function') {
        updateAllAvatars();
    }
}

function saveCharacter() {

    const characterSelect =
        document.getElementById('characterSelect');

    let nameInput =
        document.getElementById('leftName') ||
        document.getElementById('storyUsername');

    const name = nameInput
        ? nameInput.value.trim()
        : '';

    if (!name || name === "Введите имя...") {
        alert("Сначала введи имя!");
        return;
    }

    const subtitle =
        document.getElementById('leftSubtitle')
            ? document.getElementById('leftSubtitle').value
            : "";

    let avatar = "";

    if (
        typeof currentAvatarSrc !== 'undefined' &&
        currentAvatarSrc !== ""
    ) {
        avatar = currentAvatarSrc;
    } else {

        let avInput =
            document.getElementById('leftAvatar') ||
            document.getElementById('storyAvatarUrl');

        avatar = avInput
            ? avInput.value
            : "";
    }

    savedCharacters[name] = {
        avatar: avatar,
        subtitle: subtitle
    };

    localStorage.setItem(
        'ig_dm_characters_v1',
        JSON.stringify(savedCharacters)
    );

    updateCharDropdown();

    if (characterSelect) {
        characterSelect.value = name;
    }

    alert("Персонаж сохранен 💾");
}

function deleteCharacter() {

    const characterSelect =
        document.getElementById('characterSelect');

    if (!characterSelect) return;

    const name = characterSelect.value;

    if (!name) return;

    if (confirm(`Удалить "${name}" из базы?`)) {

        delete savedCharacters[name];

        localStorage.setItem(
            'ig_dm_characters_v1',
            JSON.stringify(savedCharacters)
        );

        updateCharDropdown();

        characterSelect.value = "";
    }
}

function exportLibrary() {

    const jsonData = JSON.stringify(savedCharacters);

    // Если внутри Telegram — отправляем боту
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {

        sendToBot(
            jsonData,
            "ig_library.json",
            "json"
        );
    }

    // Если обычный браузер — скачиваем
    else {

        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(jsonData);

        const link =
            document.createElement('a');

        link.href = dataStr;

        link.download = "ig_library.json";

        link.click();
    }
}

function importLibrary(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const importedData =
                JSON.parse(e.target.result);

            savedCharacters = {
                ...savedCharacters,
                ...importedData
            };

            localStorage.setItem(
                'ig_dm_characters_v1',
                JSON.stringify(savedCharacters)
            );

            updateCharDropdown();

            alert("Библиотека загружена 📚");

        } catch (err) {

            alert(
                "Ошибка: файл поврежден или неверный формат"
            );
        }
    };

    reader.readAsText(file);

    event.target.value = '';
}

document.addEventListener(
    'DOMContentLoaded',
    updateCharDropdown
);
