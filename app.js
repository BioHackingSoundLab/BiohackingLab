// Глобални променливи за аудиото
let audioCtx = null;
let currentOscillator = null;
let scannerAnalyzer = null;
let isScanning = false;
let scannerFrameId = null;

// 1. СМЯНА НА ЕКРАНИТЕ (Безотказна логика)
function switchView(viewId, clickedBtn) {
    // Стъпка 1: Скриваме всички екрани
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
    });
    // Стъпка 2: Махаме "active" от всички бутони долу
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Стъпка 3: Показваме избрания екран и маркираме бутона
    document.getElementById(viewId).classList.add('active');
    clickedBtn.classList.add('active');

    // Безопасност: Спираме аудиото, ако човекът смени екрана
    stopAudio();
    if(isScanning && viewId !== 'view-scanner') {
        toggleScanner(); // Изключва скенера, ако напуснем таба
    }
}

// 2. РАЙФ ГЕНЕРАТОР (Био-Щит)
function playFrequency(freq, name) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    stopAudio(); // Спираме предишния звук

    currentOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Синусоидална вълна за чист тон
    currentOscillator.type = 'sine';
    currentOscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Плавно усилване (за да не пука в слушалките)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1); // 10% сила

    currentOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    currentOscillator.start();
    document.getElementById('rifeMonitor').textContent = `Излъчване: ${name}`;
}

function stopAudio() {
    if (currentOscillator) {
        currentOscillator.stop();
        currentOscillator.disconnect();
        currentOscillator = null;
    }
    document.getElementById('rifeMonitor').textContent = "Готовност за резонанс";
}

// 3. СКЕНЕР (Визуализатор на честоти)
async function toggleScanner() {
    const btn = document.getElementById('btnScan');
    const status = document.getElementById('scannerStatus');

    if (isScanning) {
        // Спиране на скенера
        isScanning = false;
        cancelAnimationFrame(scannerFrameId);
        btn.textContent = "ВКЛЮЧИ СКЕНЕРА";
        btn.style.color = "var(--cyan)";
        btn.style.borderColor = "var(--cyan)";
        status.textContent = "Очаква старт...";
        return;
    }

    // Стартиране на скенера
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        scannerAnalyzer = audioCtx.createAnalyser();
        scannerAnalyzer.fftSize = 2048;
        source.connect(scannerAnalyzer);

        const bufferLength = scannerAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = document.getElementById('waveCanvas');
        const ctx = canvas.getContext('2d');

        isScanning = true;
        btn.textContent = "ИЗКЛЮЧИ СКЕНЕРА";
        btn.style.color = "#ff3366";
        btn.style.borderColor = "#ff3366";
        status.textContent = "Анализиране на пространството...";

        function drawWave() {
            if (!isScanning) return;
            scannerFrameId = requestAnimationFrame(drawWave);
            scannerAnalyzer.getByteFrequencyData(dataArray);

            // Търсене на доминираща честота
            let maxVal = 0;
            let maxIndex = 0;
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > maxVal) {
                    maxVal = dataArray[i];
                    maxIndex = i;
                }
            }
            
            // Показване на херците (ако има звук, а не просто тих фонов шум)
            if (maxVal > 80) {
                let frequency = Math.round(maxIndex * audioCtx.sampleRate / scannerAnalyzer.fftSize);
                document.getElementById('hzValue').textContent = frequency;
            }

            // Чертане на вълната
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00f3ff';
            ctx.beginPath();
            
            let sliceWidth = canvas.width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0;
                let y = v * canvas.height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.stroke();
        }
        drawWave();

    } catch (err) {
        alert("Моля, разрешете достъп до микрофона, за да използвате скенера.");
    }
}
