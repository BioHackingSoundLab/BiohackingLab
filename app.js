let audioCtx;
let oscillator;
let isScanning = false;

// 1. ЛОГИКА ЗА ТАБОВЕТЕ
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        
        // Махаме активните класове
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        // Слагаме активен клас
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
        
        // Спираме звука при смяна на таба за безопасност
        if (oscillator) oscillator.stop();
    });
});

// 2. ГЕНЕРАТОР НА ЧЕСТОТИ
function playFreq(f, name) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (oscillator) oscillator.stop();

    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(f, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();

    document.getElementById('rifeStatus').textContent = `Предаване: ${name} (${f}Hz)`;
}

// 3. СКЕНЕР
async function startScanner() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const btn = document.getElementById('toggleScanner');

    if (isScanning) {
        location.reload(); // Най-лесният начин да спрем всичко
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 1024;
        source.connect(analyzer);

        const data = new Uint8Array(analyzer.frequencyBinCount);
        const canvas = document.getElementById('scannerCanvas');
        const ctx = canvas.getContext('2d');

        isScanning = true;
        btn.textContent = "СПРИ СКЕНЕРА";

        function loop() {
            if (!isScanning) return;
            requestAnimationFrame(loop);
            analyzer.getByteFrequencyData(data);
            
            // Визуализация
            ctx.fillStyle = '#05070a'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 2;
            ctx.beginPath();
            let x = 0;
            for(let i=0; i<data.length; i++) {
                let y = (data[i]/255) * canvas.height;
                if(i===0) ctx.moveTo(x, canvas.height - y);
                else ctx.lineTo(x, canvas.height - y);
                x += canvas.width / data.length;
            }
            ctx.stroke();

            // Честота
            let max = 0, idx = 0;
            for(let i=0; i<data.length; i++) { if(data[i]>max) { max=data[i]; idx=i; } }
            if(max > 50) {
                let freq = Math.round(idx * audioCtx.sampleRate / analyzer.fftSize);
                document.getElementById('liveFreq').textContent = freq;
            }
        }
        loop();
    } catch(e) { alert("Микрофонът е деактивиран."); }
}

document.getElementById('toggleScanner').addEventListener('click', startScanner);

function openProtocol(id) {
    alert("Стартиране на " + id + ". (Тук ще заредим гласовия модул)");
}
