const DATABASE_URL = "https://script.google.com/macros/s/AKfycbxLu6EVL5wTpu0RmsvCGsS28Fu3G7WXkVLkddkYpxHfayQQmJFSCzhxoGWjdVenCAMxgA/exec";

const quotesHarian = {
    0: "Hari minggu bossQ, istirahat yang cukup ya. Jangan capek-capek.",
    1: "Semangat seninnya, Jangan ragu sama diri sendiri. kamu tetep keren dan selalu mengagumkan dengan caramu sendiri. ",
    2: "Udah selasa aja nih. Jangan lupa senyum hari ini, karena senyuman kamu tuh nular.",
    3: "Udah hari Rabu aja, waktu terasa cepat bareng kamu.",
    4: "Kamis manis kayak yang lagi baca.",
    5: "Friday!! Bentar lagi liburr.",
    6: "Happy Saturday! Have a great day!"
};

const daftarSoal = [
    { text: "Bagaimana perjalananmu di usia 16 sejauh ini?", options: ["A. Penuh cerita baru", "B. Banyak pelajaran yang didapat", "C. Ada tawa, ada tantangan", "D. Semua benar"] },
    { text: "Jika usia 16 adalah sebuah cerita, bagaimana kamu menggambarkannya?", options: ["A. Petualangan yang seru, karena bareng shasa", "B. Perjalanan yang penuh pelajaran, karena bareng lisaa", "C. Bab yang tak akan terlupakan, karena bareng alisha", "D. Semua jawaban benar"] },
    { text: "Hal apa yang paling berharga dari usia 16?", options: ["A. Kenangan yang tercipta bareng shasa", "B. alisha", "C. Pengalaman yang tak terlupakan bareng lisaa", "D. Semua di atas"] },
    { text: "Apa yang ingin kamu bawa dari usia 16 ke usia 17?", options: ["A. Kenangan bareng shasa", "B. lisaa", "C. alisha", "D. Semua benar"] },
    { text: "Sebelum melanjutkan ke usia 17, apa yang sebaiknya dilakukan terlebih dahulu?", options: ["A. Mengingat kembali kenangan yang ada bersama shasa", "B. Mensyukuri semua perjalanan yang telah dilalui bersama lisaa", "C. Memastikan tidak ada momen berharga yang terlupakan bareng alisha", "D. Semua jawaban benar"] }
];

const teksSuratUcapan = "Happy 17th birthday! On your special day, I genuinely wish you nothing but all the best things in life. I hope this year brings you closer to everything you’ve been quietly wishing for even the things you keep to yourself.<br><br>To be completely honest, there’s something I’ve wanted to tell you. Even if I don't always show it, or if I ever seem a bit distant and quiet, I do care about you. Probably way more than it seems. I notice you, and I pay attention to the little things. Somehow, in my quiet moments when nothing is really going on, my mind just randomly wanders back to you.<br><br>Without you even knowing it, you’ve become one of my safe places. Someone I think about when things get heavy, when I need a break from everything, or when I just want some comfort. Because of that, I really hope that one day, if you ever need it, I can be that safe place for you too. Somewhere you can just run to, take a breather, and just be yourself.";

let currentIdx = 0;
let activeTab = 'ujian';
let jawabanUser = []; 

function setDailyQuote() {
    const hariIni = new Date().getDay();
    document.getElementById('quote-text').innerText = quotesHarian[hariIni];
}

function kirimKeDatabase(aksi, namaPeserta, detailJawaban = "") {
    if (namaPeserta.toLowerCase() === 'al') {
        console.log("Akses khusus 'al' terdeteksi. Data tidak dikirim ke database.");
        return; 
    }
    if(!DATABASE_URL || DATABASE_URL.includes("MASUKKAN_URL")) return;
    
    fetch(DATABASE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            aksi: aksi,
            nama: namaPeserta,
            jawaban: detailJawaban
        })
    }).catch(err => console.log("Gagal log ke database:", err));
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'page-login') {
        document.getElementById('main-header').classList.add('hidden');
    } else {
        document.getElementById('main-header').classList.remove('hidden');
    }
}

function handleLogin() {
    const nama = document.getElementById('login-nama').value.trim();
    if(!nama) {
        alert('Nama peserta tidak boleh kosong ya!');
        return;
    }
    
    // Ganti nama di kanan atas header (bukan di kiri lagi!)
    document.getElementById('header-display-name').innerText = nama;
    
    // Ganti nama di dalam dashboard kartu ujian
    document.getElementById('dash-user-name').innerText = nama;
    
    setDailyQuote();
    kirimKeDatabase("LOGIN / AKSES WEB", nama);
    navigateTo('page-dashboard');
}

function logout() {
    document.getElementById('login-nama').value = '';
    navigateTo('page-login');
}

function switchTab(tab) {
    activeTab = tab;
    const btnUjian = document.getElementById('tab-btn-ujian');
    const btnHasil = document.getElementById('tab-btn-hasil');
    const contentUjian = document.getElementById('tab-content-ujian');
    const contentHasil = document.getElementById('tab-content-hasil');
    if(tab === 'ujian') {
        btnUjian.className = "px-4 py-2.5 text-blue-600 border-b-2 border-blue-500 bg-white font-semibold";
        btnHasil.className = "px-4 py-2.5 hover:text-gray-700 border-b-2 border-transparent";
        contentUjian.classList.remove('hidden');
        contentHasil.classList.add('hidden');
    } else {
        btnHasil.className = "px-4 py-2.5 text-blue-600 border-b-2 border-blue-500 bg-white font-semibold";
        btnUjian.className = "px-4 py-2.5 hover:text-gray-700 border-b-2 border-transparent";
        contentHasil.classList.remove('hidden');
        contentUjian.classList.add('hidden');
    }
}

function startExam() {
    currentIdx = 0;
    jawabanUser = new Array(daftarSoal.length).fill("-");
    renderSoal();
    navigateTo('page-exam');
}

function simpanJawabanSementara() {
    const radioTerpilih = document.querySelector('input[name="jawaban-soal"]:checked');
    if(radioTerpilih) {
        const labelOpsi = radioTerpilih.nextElementSibling.querySelector('span:last-child').innerText;
        const hurufOpsi = radioTerpilih.nextElementSibling.querySelector('span:first-child').innerText;
        jawabanUser[currentIdx] = `${hurufOpsi}. ${labelOpsi}`;
    }
}

function renderSoal() {
    const soalObj = daftarSoal[currentIdx];
    document.getElementById('display-number-top').innerText = currentIdx + 1;
    document.getElementById('question-text').innerText = soalObj.text;
    const containerOpsi = document.getElementById('options-container');
    containerOpsi.innerHTML = '';
    
    soalObj.options.forEach((opsi, index) => {
        const checkedId = `q-${currentIdx}-opt-${index}`;
        const huruf = String.fromCharCode(65 + index);
        const isChecked = jawabanUser[currentIdx].startsWith(huruf);
        
        containerOpsi.innerHTML += `
            <label class="flex items-center cursor-pointer block select-none">
                <input type="radio" name="jawaban-soal" id="${checkedId}" class="hidden" ${isChecked ? 'checked' : ''} onchange="simpanJawabanSementara()">
                <div class="w-full border border-gray-200 bg-white p-2.5 rounded text-xs text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-3">
                    <span class="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-50 shrink-0 transition">
                        ${huruf}
                    </span>
                    <span>${opsi.substring(3)}</span>
                </div>
            </label>
        `;
    });
    
    const btnNext = document.getElementById('btn-next');
    if (currentIdx === daftarSoal.length - 1) {
        btnNext.innerHTML = `Selesai Ujian <i class="fa-solid fa-flag-checkered ml-0.5"></i>`;
        btnNext.className = "bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition shadow-sm";
    } else {
        btnNext.innerHTML = `Selanjutnya <i class="fa-solid fa-chevron-right text-[10px]"></i>`;
        btnNext.className = "bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition shadow-sm";
    }
    document.getElementById('btn-prev').disabled = currentIdx === 0;
    document.getElementById('btn-prev').style.opacity = currentIdx === 0 ? '0.5' : '1';
}

function prevQuestion() {
    if(currentIdx > 0) {
        simpanJawabanSementara();
        currentIdx--;
        renderSoal();
    }
}

function nextQuestion() {
    simpanJawabanSementara();
    if (currentIdx < daftarSoal.length - 1) {
        currentIdx++;
        renderSoal();
    } else {
        document.getElementById('modal-alert').style.display = 'flex';
    }
}

function closeModal() {
    document.getElementById('modal-alert').style.display = 'none';
}

document.addEventListener('change', function(e) {
    if(e.target && e.target.id === 'check-konfirmasi') {
        const btnSelesai = document.getElementById('btn-submit-final');
        if(e.target.checked) {
            btnSelesai.disabled = false;
            btnSelesai.className = "px-3 py-1 border border-emerald-500 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition shadow-sm cursor-pointer";
        } else {
            btnSelesai.disabled = true;
            btnSelesai.className = "px-3 py-1 border border-emerald-500 text-emerald-600 rounded bg-white opacity-40 cursor-not-allowed transition";
        }
    }
});

function sebarKonfeti() {
    var duration = 4 * 1000;
    var end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
        if (Date.now() < end) { requestAnimationFrame(frame); }
    }());
}

function finishExam() {
    closeModal();
    document.getElementById('check-konfirmasi').checked = false; 
    
    const nama = document.getElementById('header-display-name').innerText;
    let stringJawaban = jawabanUser.map((jwb, i) => `[No.${i+1}: ${jwb}]`).join(" | ");
    
    kirimKeDatabase("SUBMIT JAWABAN UJIAN", nama, stringJawaban);
    
    document.getElementById('box-ujian-tersedia').classList.add('hidden');
    document.getElementById('box-ujian-kosong').classList.remove('hidden');
    document.getElementById('hasil-belum-ada').classList.add('hidden');
    
    document.getElementById('surat-ucapan-box').innerHTML = teksSuratUcapan;
    document.getElementById('hasil-sudah-ada').classList.remove('hidden');
    
    navigateTo('page-dashboard');
    switchTab('hasil');
    sebarKonfeti();
}
