// --- БИБЛИОТЕКА ПЕРСОНАЖЕЙ (Универсальный Модуль) ---
let savedCharacters = JSON.parse(localStorage.getItem('ig_dm_characters_v1')) || {};

function updateCharDropdown() {
    const characterSelect = document.getElementById('characterSelect');
    if (!characterSelect) return;
    characterSelect.innerHTML = '<option value="">-- Выбери или создай --</option>';
    for (let name in savedCharacters) {
        let opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        characterSelect.appendChild(opt);
    }
}

function loadCharacter() {
    const characterSelect = document.getElementById('characterSelect');
    if (!characterSelect) return;
    const name = characterSelect.value;
    if (!name) return; 
    const char = savedCharacters[name];
    
    // 1. Если мы в личном чате (index.html)
    if (document.getElementById('leftName')) document.getElementById('leftName').value = name;
    if (document.getElementById('leftSubtitle')) document.getElementById('leftSubtitle').value = char.subtitle || '';
    if (document.getElementById('leftAvatar')) document.getElementById('leftAvatar').value = char.avatar || '';
    if (document.getElementById('headerName')) document.getElementById('headerName').textContent = name;
    if (document.getElementById('headerSubtitle')) document.getElementById('headerSubtitle').textContent = char.subtitle || '';
    
    // 2. Если мы в генераторе историй (story.html)
    if (document.getElementById('storyUsername')) {
        // МАГИЯ ЗДЕСЬ: берем подпись (subtitle). Если она пустая, ставим имя как запасной вариант.
        document.getElementById('storyUsername').value = char.subtitle || name;
        document.getElementById('storyAvatarUrl').value = char.avatar || '';
        
        // Сразу дергаем функцию обновления превью истории
        if (typeof updateStoryHeader === 'function') updateStoryHeader();
    }

    // Обновляем глобальные аватарки для чата
    if (typeof currentAvatarSrc !== 'undefined') currentAvatarSrc = char.avatar;
    if (typeof updateAllAvatars === 'function') updateAllAvatars();
}

function saveCharacter() {
    const characterSelect = document.getElementById('characterSelect');
    
    // Ищем поле имени (в чате или в историях)
    let nameInput = document.getElementById('leftName') || document.getElementById('storyUsername');
    const name = nameInput ? nameInput.value.trim() : '';
    if(!name || name === "Введите имя...") { alert("Сначала введи имя!"); return; }
    
    const subtitle = document.getElementById('leftSubtitle') ? document.getElementById('leftSubtitle').value : "";
    
    // Ищем аватарку
    let avatar = "";
    if (typeof currentAvatarSrc !== 'undefined' && currentAvatarSrc !== "") {
        avatar = currentAvatarSrc;
    } else {
        let avInput = document.getElementById('leftAvatar') || document.getElementById('storyAvatarUrl');
        avatar = avInput ? avInput.value : "";
    }
    
    savedCharacters[name] = { avatar: avatar, subtitle: subtitle };
    localStorage.setItem('ig_dm_characters_v1', JSON.stringify(savedCharacters));
    
    updateCharDropdown(); 
    if(characterSelect) characterSelect.value = name; 
    alert("Персонаж сохранен! 💾");
}

function deleteCharacter() {
    const characterSelect = document.getElementById('characterSelect');
    if (!characterSelect) return;
    const name = characterSelect.value;
    if(!name) return;
    if(confirm(`Удалить "${name}" из базы?`)) {
        delete savedCharacters[name];
        localStorage.setItem('ig_dm_characters_v1', JSON.stringify(savedCharacters));
        updateCharDropdown(); 
        characterSelect.value = "";
    }
}

function exportLibrary() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedCharacters));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ig_library.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importLibrary(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            savedCharacters = { ...savedCharacters, ...importedData };
            localStorage.setItem('ig_dm_characters_v1', JSON.stringify(savedCharacters));
            updateCharDropdown();
            alert("Библиотека успешно загружена! 📚✨");
        } catch (err) {
            alert("Ошибка: файл поврежден или имеет неверный формат.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

document.addEventListener('DOMContentLoaded', updateCharDropdown);
