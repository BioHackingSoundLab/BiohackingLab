let audioCtx;
let mainOscillator;
let analyzer;
let isScannerRunning = false;

// 1. ПРЕВКЛЮЧВАНЕ НА ТАБОВЕ
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
}

// 2. ГЕНЕРАТОР НА ЧЕСТОТИ (За Райф и Солфеджо)
function playRife(freq, name) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Спираме стария звук, ако има такъв
    if (mainOscillator) mainOscillator.stop();

    mainOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // За Райф честоти често се ползва Square wave (правоъгълна), за по-силен ефект
    mainOscillator.type = freq < 100 ? 'sine' : 'square'; 
    mainOscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Сила 10%
    
    mainOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    mainOscillator.start();
    document.getElementById('rifeStatus').textContent = `Предаване: ${name} (${freq} Hz)`;
    document.getElementById('rifeStatus').style.color = '#bc13fe';
}

// 3. ЧЕСТОТЕН СКЕНЕР (Анализатор)
async function startScanner() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 2048;
        source.connect(analyzer);

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = document.getElementById('visualizerCanvas');
        const ctx = canvas.getContext('2d');

        function draw() {
            if (!isScannerRunning) return;
            requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            // Намиране на най-силната честота
            let maxVal = 0;
            let maxIndex = 0;
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > maxVal) {
                    maxVal = dataArray[i];
                    maxIndex = i;
                }
            }
            const frequency = maxIndex * audioCtx.sampleRate / analyzer.fftSize;
            if (maxVal > 100) {
                document.getElementById('detectedFreq').textContent = Math.round(frequency);
                updateFreqInfo(frequency);
            }

            // Визуализация на вълните
            ctx.fillStyle = '#05070a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#00f3ff';
            ctx.beginPath();
            let sliceWidth = canvas.width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0;
                let y = v * canvas.height / 2;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.stroke();
        }
        isScannerRunning = true;
        draw();
    } catch (err) {
        alert("Грешка при стартиране на скенера: " + err);
    }
}

function updateFreqInfo(f) {
    const info = document.getElementById('freqInfo');
    if (f > 520 && f < 535) info.textContent = "🧬 ДНК Регенерация / Солфеджо 528Hz";
    else if (f > 430 && f < 435) info.textContent = "🌍 Честота на Вселената 432Hz";
    else if (f < 10) info.textContent = "🧠 Тета/Делта състояние (Дълбок сън)";
    else info.textContent = "Засечена активна вибрация...";
}

document.getElementById('startScannerBtn').addEventListener('click', startScanner);

// Навигация за Овърлея
function startProtocol(id) { document.getElementById('recordingOverlay').classList.remove('hidden'); }
function closeOverlay() { document.getElementById('recordingOverlay').classList.add('hidden'); }
