// NOVO: Adicione sua chave da API aqui dentro das aspas
const BIBLE_API_KEY = 'COLE_SUA_CHAVE_AQUI'; 

// Guia Bíblico 40 Dias - Script Completo e Funcional com Status e Popup de Versículos
const guia40Dias = [
  {
    titulo: "Dia 1 — Conectado à Videira Verdadeira",
    tema: "Comunhão Espiritual",
    leituraPrincipal: "João 15:1-11",
    leiturasComplementares: "Salmos 1:1-3; Jeremias 17:7-8; Colossenses 2:6-7",
    comentario: "Permanecer em Cristo é condição para vida espiritual produtiva...",
    perguntas: ["..."],
    oracao: "Senhor Jesus, ensina-me a permanecer em Ti..."
  },
  {
    titulo: "Dia 2 — Oração que Transforma",
    tema: "Vida de Oração",
    leituraPrincipal: "Mateus 6:5-13",
    leiturasComplementares: "Lucas 11:1-13; Filipenses 4:6-7",
    comentario: "A oração é diálogo íntimo com Deus...",
    perguntas: ["..."],
    oracao: "Pai, ensina-me a orar com sinceridade..."
  },
  // ... adicione todos os 40 dias aqui.
];

// --- Código de preenchimento para teste ---
const sampleDay = guia40Dias[1];
for (let i = guia40Dias.length; i < 40; i++) {
    guia40Dias.push({
        ...sampleDay,
        titulo: `Dia ${i + 1} — Título de Exemplo`,
        leituraPrincipal: `Gênesis ${i-1}:1-5`
    });
}

let currentPageIndex = 0;
let progressStatus = [];

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SELEÇÃO DOS ELEMENTOS DO DOM ---
    const summaryView = document.getElementById("summary-view");
    const chapterView = document.getElementById("chapter-view");
    const summaryGridContainer = document.getElementById("summary-grid-container");
    const headerProgressFill = document.getElementById("header-progress-fill");
    const headerProgressText = document.getElementById("header-progress-text");
    const chapterDayNumber = document.getElementById("chapter-day-number");
    const chapterDayTitle = document.getElementById("chapter-day-title");
    const chapterDayTheme = document.getElementById("chapter-day-theme");
    const chapterMainReading = document.getElementById("chapter-main-reading");
    const chapterCompReading = document.getElementById("chapter-comp-reading");
    const chapterComment = document.getElementById("chapter-comment");
    const chapterQuestions = document.getElementById("chapter-questions");
    const chapterPrayer = document.getElementById("chapter-prayer");
    const prevDayBtn = document.getElementById("prev-day-btn");
    const nextDayBtn = document.getElementById("next-day-btn");
    const backToSummaryBtn = document.getElementById("back-to-summary-btn");
    const summaryNavBtn = document.getElementById("summary-nav-btn");
    const completeDayBtn = document.getElementById("complete-day-btn");
    
    const bibleModal = document.getElementById('bible-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- 2. FUNÇÕES DE PROGRESSO (localStorage) ---
    function loadProgress() {
        const savedProgress = localStorage.getItem('guia40DiasProgress');
        if (savedProgress) {
            progressStatus = JSON.parse(savedProgress);
        } else {
            progressStatus = Array(guia40Dias.length).fill('not-started');
        }
    }

    function saveProgress() {
        localStorage.setItem('guia40DiasProgress', JSON.stringify(progressStatus));
    }

    // --- 3. FUNÇÕES PRINCIPAIS E DO MODAL ---
    
    // NOVO: Função para buscar o texto na API pesquisarnabiblia.com.br
    // ALTERADO: A função agora chama a nossa própria API segura no Netlify
    async function fetchBiblePassage(reference) {
    modalContent.innerHTML = '<p>Buscando texto na Bíblia...</p>';

    // A URL agora aponta para a nossa função que criamos
    const apiUrl = '/.netlify/functions/bible';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchReference: reference }) // Envia a referência para a nossa função
        });
        
        const result = await response.json();

        if (result && result.data && result.data.verses && result.data.verses.length > 0) {
            const verses = result.data.verses;
            const bookName = verses[0].book;
            const chapter = verses[0].chapter;

            let versesHTML = `<h4>${bookName} - Capítulo ${chapter} (NVI)</h4>`;
            verses.forEach(verse => {
                versesHTML += `<p><strong>${verse.number}</strong> ${verse.text}</p>`;
            });
            modalContent.innerHTML = versesHTML;
        } else {
            const errorMessage = result.data ? result.data.msg : (result.error || `A referência "${reference}" não foi encontrada.`);
            modalContent.innerHTML = `<p><strong>Erro:</strong> ${errorMessage}</p>`;
        }
    } catch (error) {
        console.error("Erro detalhado ao buscar versículo:", error);
        modalContent.innerHTML = '<p>Desculpe, não foi possível carregar o texto bíblico. Ocorreu uma falha na comunicação.</p>';
    }
}
    
    function renderSummary() {
        summaryGridContainer.innerHTML = "";
        guia40Dias.forEach((dia, index) => {
            const dayNumber = String(index + 1).padStart(2, '0');
            const dayTitle = dia.titulo.split('—')[1]?.trim() || "Título Indefinido";
            const status = progressStatus[index];
            let statusBadge;
            if (status === 'completed') {
                statusBadge = '<span class="status-badge status-completed">✓ Concluído</span>';
            } else if (status === 'in-progress') {
                statusBadge = '<span class="status-badge status-in-progress">Lendo</span>';
            } else {
                statusBadge = '<span class="status-badge status-not-started">Não iniciado</span>';
            }
            const cardHTML = `
                <div class="day-card" data-index="${index}">
                    <div class="day-number">${dayNumber}</div>
                    <h3 class="day-title">${dayTitle}</h3>
                    <p class="day-theme">Tema: ${dia.tema || "Não definido"}</p>
                    <div class="day-status">
                        ${statusBadge}
                        <span class="reading-time">🕒 5 min</span>
                    </div>
                </div>`;
            summaryGridContainer.innerHTML += cardHTML;
        });
    }

    function renderChapter(index) {
        const dia = guia40Dias[index];
        if (!dia) return;
        
        currentPageIndex = index;
        
        if (progressStatus[index] === 'not-started') {
            progressStatus[index] = 'in-progress';
            saveProgress();
            renderSummary();
        }
        
        if (progressStatus[index] === 'completed') {
            completeDayBtn.textContent = '✓ Concluído';
            completeDayBtn.classList.add('disabled');
        } else {
            completeDayBtn.textContent = '✓ Marcar como Concluído';
            completeDayBtn.classList.remove('disabled');
        }

        chapterDayNumber.textContent = `DIA ${String(index + 1).padStart(2, '0')}`;
        chapterDayTitle.textContent = dia.titulo.split('—')[1]?.trim() || "Título";
        chapterDayTheme.textContent = dia.tema || "";
        
        chapterMainReading.innerHTML = `<a href="#" class="bible-link">${dia.leituraPrincipal}</a>`;
        const compReadings = dia.leiturasComplementares.split(';').map(ref => 
            `<a href="#" class="bible-link">${ref.trim()}</a>`
        ).join('; ');
        chapterCompReading.innerHTML = compReadings;

        chapterComment.textContent = dia.comentario;
        chapterPrayer.textContent = dia.oracao;
        chapterQuestions.innerHTML = dia.perguntas.map(p => `<li>${p}</li>`).join("");

        updateOverallProgress();
        prevDayBtn.classList.toggle('disabled', index === 0);
        nextDayBtn.classList.toggle('disabled', index === guia40Dias.length - 1);
    }

    function switchView(viewToShow) {
        if (viewToShow === 'chapter') {
            summaryView.style.display = 'none';
            chapterView.style.display = 'block';
        } else {
            chapterView.style.display = 'none';
            summaryView.style.display = 'block';
        }
    }

    function updateOverallProgress() {
        const completedDays = progressStatus.filter(s => s === 'completed').length;
        const percent = (completedDays / guia40Dias.length) * 100;
        
        headerProgressFill.style.width = `${percent}%`;
        headerProgressText.textContent = `${completedDays} de 40 dias • ${Math.round(percent)}% completo`;
    }

    // --- 4. EVENT LISTENERS ---
    summaryGridContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.day-card');
        if (card) {
            const index = parseInt(card.dataset.index, 10);
            renderChapter(index);
            switchView('chapter');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    chapterView.addEventListener('click', (e) => {
        if (e.target.classList.contains('bible-link')) {
            e.preventDefault();
            const reference = e.target.textContent;
            modalTitle.textContent = reference;
            bibleModal.style.display = 'flex';
            fetchBiblePassage(reference);
        }
    });

    modalCloseBtn.addEventListener('click', () => {
        bibleModal.style.display = 'none';
    });
    bibleModal.addEventListener('click', (e) => {
        if (e.target === bibleModal) {
            bibleModal.style.display = 'none';
        }
    });
    
    completeDayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!completeDayBtn.classList.contains('disabled')) {
            progressStatus[currentPageIndex] = 'completed';
            saveProgress();
            renderSummary();
            updateOverallProgress();
            completeDayBtn.textContent = '✓ Concluído';
            completeDayBtn.classList.add('disabled');
        }
    });

    prevDayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPageIndex > 0) {
            renderChapter(currentPageIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextDayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPageIndex < guia40Dias.length - 1) {
            renderChapter(currentPageIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    backToSummaryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('summary');
    });

    summaryNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('summary');
    });

    // --- 5. INICIALIZAÇÃO ---
    loadProgress();
    renderSummary();
    updateOverallProgress();
});