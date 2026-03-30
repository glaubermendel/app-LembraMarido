let currentList = { name: '', items: [] };
let photoUrl = '';

const mainScreen = document.getElementById('mainScreen');
const createScreen = document.getElementById('createScreen');
const listsScreen = document.getElementById('listsScreen');
const listNameInput = document.getElementById('listName');
const screenTitle = document.getElementById('screenTitle');
const itemInput = document.getElementById('itemInput');
const itemList = document.getElementById('itemList');
const photoInput = document.getElementById('photoInput');
const preview = document.getElementById('preview');
const whatsappNumber = document.getElementById('whatsappNumber');
const listsContainer = document.getElementById('listsContainer');

// Carrega listas salvas
function loadLists() {
    const lists = localStorage.getItem('lembraMaridoLists');
    return lists ? JSON.parse(lists) : [];
}

// Salva listas
function saveLists(lists) {
    localStorage.setItem('lembraMaridoLists', JSON.stringify(lists));
}

// Tela principal -> Criar
function createList() {
    const name = listNameInput.value.trim();
    if (!name) return alert('Digite um nome!');
    currentList = { name, items: [] };
    screenTitle.textContent = `Editando: ${name}`;
    mainScreen.classList.add('hidden');
    createScreen.classList.remove('hidden');
    itemInput.focus();
}

// Adiciona item
function addItem() {
    const item = itemInput.value.trim();
    if (!item) return;
    currentList.items.push({ text: item, done: false });
    itemInput.value = '';
    renderItems();
}

// Renderiza itens
function renderItems() {
    itemList.innerHTML = currentList.items.map((item, i) => `
        <li>
            <span style="text-decoration: ${item.done ? 'line-through' : 'none'}">${item.text}</span>
            <span>
                <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleItem(${i})">
                <button onclick="removeItem(${i})" style="background: #ff4444; padding: 5px 10px; margin-left: 10px;">🗑️</button>
            </span>
        </li>
    `).join('');
}

// Toggle item
function toggleItem(index) {
    currentList.items[index].done = !currentList.items[index].done;
    renderItems();
}

// Remove item
function removeItem(index) {
    currentList.items.splice(index, 1);
    renderItems();
}

// Preview foto
function previewPhoto() {
    const file = photoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            photoUrl = e.target.result;
            preview.src = photoUrl;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Envia WhatsApp
function sendWhatsApp() {
    const number = whatsappNumber.value.replace(/\D/g, '');
    if (!number || number.length < 10) return alert('Número inválido!');
    
    let message = `*${currentList.name}*\n\n`;
    currentList.items.forEach(item => {
        const mark = item.done ? '✅' : '⭕';
        message += `${mark} ${item.text}\n`;
    });
    if (photoUrl) message += `\n📸 Anexe a foto do produto aqui!`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
}

// Salva lista atual
function saveList() {
    if (currentList.items.length === 0) return alert('Adicione itens!');
    let lists = loadLists();
    lists.push({ ...currentList, date: new Date().toLocaleDateString('pt-BR') });
    saveLists(lists);
    alert('Lista salva!');
    backToMain();
}

// Mostra listas
function showLists() {
    mainScreen.classList.add('hidden');
    listsScreen.classList.remove('hidden');
    const lists = loadLists();
    if (lists.length === 0) {
        listsContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhuma lista salva.</p>';
        return;
    }
    listsContainer.innerHTML = lists.map((list, i) => `
        <div class="list-card">
            <h3>${list.name} (${list.date})</h3>
            <p>${list.items.length} itens</p>
            <button onclick="editList(${i})">Editar</button>
            <button onclick="sendListWhatsApp(${i})">WhatsApp</button>
            <button onclick="deleteList(${i})" style="background: #ff4444;">Deletar</button>
        </div>
    `).join('');
}

// Edita lista
function editList(index) {
    const lists = loadLists();
    currentList = lists[index];
    screenTitle.textContent = `Editando: ${currentList.name}`;
    listsScreen.classList.add('hidden');
    createScreen.classList.remove('hidden');
    renderItems();
}

// Envia lista específica
function sendListWhatsApp(index) {
    const lists = loadLists();
    const list = lists[index];
    const number = whatsappNumber.value.replace(/\D/g, '') || '5511999999999';
    let message = `*${list.name}*\n\n`;
    list.items.forEach(item => {
        const mark = item.done ? '✅' : '⭕';
        message += `${mark} ${item.text}\n`;
    });
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
}

// Deleta lista
function deleteList(index) {
    if (!confirm('Deletar?')) return;
    let lists = loadLists();
    lists.splice(index, 1);
    saveLists(lists);
    showLists();
}

// Volta pra principal
function backToMain() {
    [mainScreen, createScreen, listsScreen].forEach(screen => screen.classList.add('hidden'));
    mainScreen.classList.remove('hidden');
    listNameInput.value = '';
    photoInput.value = '';
    preview.classList.add('hidden');
    photoUrl = '';
    itemList.innerHTML = '';
}

function handleEnter(event) {
    if (event.key === 'Enter' || event.keyCode === 13 || event.which === 13) {
        event.preventDefault();  // Impede "Next" pular campo
        addItem();
    }
}

// Carrega ao iniciar
window.onload = () => {
    renderItems();
};