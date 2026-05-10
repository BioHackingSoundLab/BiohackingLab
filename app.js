// Навигация
function openModule(moduleId) {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('recordingStudio').classList.add('active');
}

function goBack() {
    document.getElementById('recordingStudio').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
}

// Караоке Логика
const startBtn = document.getElementById('startBtn');
const promptText = document.getElementById('promptText');
const micStatus = document.getElementById('micStatus');

// Нашите тестови фрази
const phrases = [
    "Цигарите са гнусни и гадни.",
    "Вкусът им е отвратителен и ме отблъсква.",
    "Аз дишам с лекота и удоволствие."
];

// Функция за изчакване (Пауза)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

startBtn.addEventListener('click', async () => {
    // 1. Скриваме бутона
    startBtn.style.display = 'none';
    micStatus.textContent = '🔴 Записът започна...';
    micStatus.style.color = '#ff0055';
    
    // 2. Стартираме Караокето
    for (let i = 0; i < phrases.length; i++) {
        // Скриваме стария текст
        promptText.style.opacity = 0;
        await sleep(500); // чакаме половин секунда да изчезне
        
        // Показваме новото изречение
        promptText.innerHTML = phrases[i];
        promptText.style.opacity = 1;
        
        // Време за четене (4 секунди)
        await sleep(4000); 
        
        // Скриваме го и показваме ПАУЗА
        promptText.style.opacity = 0;
        await sleep(500);
        promptText.innerHTML = "<span style='color: #00ff66; font-size: 1rem;'>[ Пауза... Поеми въздух ]</span>";
        promptText.style.opacity = 1;
        
        // Време за паузата (3 секунди)
        await sleep(3000);
    }

    // 3. Край на записа
    promptText.style.opacity = 0;
    await sleep(500);
    promptText.innerHTML = "<span style='color: #00f3ff;'>✅ Записът приключи. Генериране на протокол...</span>";
    promptText.style.opacity = 1;
    micStatus.textContent = 'Обработка...';
});
