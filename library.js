// --- БИБЛИОТЕКА ПЕРСОНАЖЕВ (Модуль) ---
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
    const name = characterSelect.value;
    if (!name) return; 
    const char = savedCharacters[name];
    
    document.getElementById('leftName').value = name;
    document.getElementById('leftSubtitle').value = char.subtitle;
    document.getElementById('leftAvatar').value = char.avatar;
    
    document.getElementById('headerName').textContent = name;
    document.getElementById('headerSubtitle').textContent = char.subtitle;
    
    // Обновляем глобальную переменную и картинки в чате
    if (typeof currentAvatarSrc !== 'undefined') currentAvatarSrc = char.avatar;
    if (typeof updateAllAvatars === 'function') updateAllAvatars();
}

function saveCharacter() {
    const leftNameInput = document.getElementById('leftName');
    const leftSubtitleInput = document.getElementById('leftSubtitle');
    const characterSelect = document.getElementById('characterSelect');
    
    const name = leftNameInput.value.trim();
    if(!name || name === "Введите имя...") { alert("Сначала введи имя!"); return; }
    
    // Берем текущую аватарку (из глобальной переменной или напрямую из инпута)
    const avatar = typeof currentAvatarSrc !== 'undefined' ? currentAvatarSrc : document.getElementById('leftAvatar').value;
    
    savedCharacters[name] = { avatar: avatar, subtitle: leftSubtitleInput.value };
    localStorage.setItem('ig_dm_characters_v1', JSON.stringify(savedCharacters));
    
    updateCharDropdown(); 
    characterSelect.value = name; 
    alert("Сохранено!");
}

function deleteCharacter() {
    const characterSelect = document.getElementById('characterSelect');
    const name = characterSelect.value;
    if(!name) return;
    if(confirm(`Удалить "${name}"?`)) {
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

// Запускаем сборку списка сразу после загрузки страницы
document.addEventListener('DOMContentLoaded', updateCharDropdown);
