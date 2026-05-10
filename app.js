const startBtn = document.getElementById('startBtn');
const micStatus = document.getElementById('micStatus');
const promptText = document.getElementById('promptText');

let audioContext;
let analyser;
let microphone;

startBtn.addEventListener('click', async () => {
    try {
        // 1. Искане на достъп до микрофона
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Скриваме бутона и казваме, че слушаме
        startBtn.style.display = 'none';
        micStatus.textContent = 'Микрофонът е свързан. Анализиране на шума...';
        micStatus.style.color = '#00ff66'; // Неоново зелено
        
        // 3. Настройка на аудио анализатора
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // 4. Функция за проверка на децибелите (шума)
        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for(let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let average = sum / bufferLength;

            // Оценка на шума (ако средната стойност е над 30, значи е шумно)
            if (average > 30) {
                micStatus.textContent = '⚠️ В стаята е твърде шумно!';
                micStatus.style.color = '#ff3333'; // Червено
                micStatus.style.borderColor = '#ff3333';
            } else {
                micStatus.textContent = '✅ Стаята е тиха. Можеш да записваш.';
                micStatus.style.color = '#00ff66'; // Неоново зелено
                micStatus.style.borderColor = '#00ff66';
            }
            
            // Продължаваме да слушаме нон-стоп
            requestAnimationFrame(checkVolume);
        };

        checkVolume();
        
        // Тук по-късно ще добавим стартирането на самото Караоке
        promptText.textContent = "Системата е готова. (Караоке модулът се подготвя...)";

    } catch (err) {
        console.error('Грешка при достъп до микрофона:', err);
        micStatus.textContent = '❌ Отказан достъп до микрофона!';
        micStatus.style.color = '#ff3333';
    }
});
