// SCRIPT.JS - VERSÃO FINAL COMPLETA (4 de Setembro, 2025)
// Inclui todas as funcionalidades: Leitura da Bíblia local, Diário de Reflexão,
// Progresso, e Modal para Comentários Externos.

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DADOS DA APLICAÇÃO ---
    const guia40Dias = [
        {
            titulo: "Dia 1 — Conectado à Videira Verdadeira",
            tema: "A base de toda vida espiritual produtiva.",
            leituraPrincipal: "João 15:1-11",
            leiturasComplementares: "Salmos 1:1-3; Jeremias 17:7-8; Colossenses 2:6-7",
            comentario: "Permanecer em Cristo não é um esforço passivo, mas uma decisão diária de se conectar intencionalmente com Ele através da oração, da Sua Palavra e da obediência.",
            perguntas: [
                "Como você descreveria seu 'permanecer' em Cristo hoje?",
                "Quais 'frutos' você tem visto em sua vida como resultado de sua conexão com Ele?",
                "Existem 'ramos secos' (hábitos, atitudes) que precisam ser podados para que você possa dar mais fruto?"
            ],
            oracao: "Senhor Jesus, obrigado por ser a Videira Verdadeira. Ajuda-me a permanecer em Ti hoje, não por minha própria força, mas pela Tua graça. Quero que minha vida produza frutos que Te glorifiquem. Amém.",
            comentarioLink: "https://m.egwwritings.org/pt/book/1816.143#143"
        },
        {
            titulo: "Dia 2 — Oração que Transforma",
            tema: "Desenvolvendo um diálogo íntimo com Deus.",
            leituraPrincipal: "Mateus 6:5-13",
            leiturasComplementares: "Lucas 11:1-13; Filipenses 4:6-7",
            comentario: "A oração é menos sobre seguir uma fórmula e mais sobre cultivar um relacionamento. Jesus nos ensina um modelo que foca na adoração, submissão e dependência de Deus.",
            perguntas: [
                "Sua vida de oração se parece mais com um monólogo ou um diálogo?",
                "Qual parte da Oração do Pai Nosso mais desafia você hoje?",
                "Como a ansiedade em sua vida pode ser transformada em oração, como sugerido em Filipenses?"
            ],
            oracao: "Pai, ensina-me a orar com um coração sincero e humilde. Perdoa-me pelas vezes que tornei a oração uma rotina vazia. Quero conhecer-Te mais profundamente através de nossa conversa diária. Amém.",
            comentarioLink: "https://m.egwwritings.org/pt/book/1816.155" // Link de exemplo
        }
    ];

    // Preenche com dados de exemplo para completar os 40 dias no layout
    for (let i = guia40Dias.length; i < 40; i++) {
        const sampleDay = guia40Dias[1]; // Usa o dia 2 como modelo
        guia40Dias.push({
             ...sampleDay,
             titulo: `Dia ${i + 1} — Título de Exemplo`,
             leituraPrincipal: `Gênesis ${i - 1}:5-10`,
             comentarioLink: null // Garante que dias de exemplo não tenham o botão
        });
    }

    // --- 2. VARIÁVEIS GLOBAIS ---
    let currentPageIndex = 0;
    let progressStatus = [];
    let notesData = {};
    let bibliaIndex = null;

    // --- 3. SELEÇÃO DE ELEMENTOS DO DOM ---
    const summaryView = document.getElementById("summary-view");
    const chapterView = document.getElementById("chapter-view");
    const summaryGridContainer = document.getElementById("summary-grid-container");
    const headerProgressFill = document.getElementById("header-progress-fill");
    const headerProgressText = document.getElementById("header-progress-text");
    const chapterQuestions = document.getElementById("chapter-questions");
    const notesInput = document.getElementById("notes-input");
    const saveNotesBtn = document.getElementById("save-notes-btn");
    const chapterDayNumber = document.getElementById("chapter-day-number");
    const chapterDayTitle = document.getElementById("chapter-day-title");
    const chapterDayTheme = document.getElementById("chapter-day-theme");
    const chapterMainReading = document.getElementById("chapter-main-reading");
    const chapterCompReading = document.getElementById("chapter-comp-reading");
    const chapterComment = document.getElementById("chapter-comment");
    const chapterPrayer = document.getElementById("chapter-prayer");
    const prevDayBtn = document.getElementById("prev-day-btn");
    const nextDayBtn = document.getElementById("next-day-btn");
    const backToSummaryBtn = document.getElementById("back-to-summary-btn");
    const summaryNavBtn = document.getElementById("summary-nav-btn");
    const completeDayBtn = document.getElementById("complete-day-btn");
    const progressNavBtn = document.getElementById("progress-nav-btn");
    const bibleModal = document.getElementById("bible-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const progressModal = document.getElementById("progress-modal");
    const progressModalCloseBtn = document.getElementById("progress-modal-close-btn");
    const statsCompleted = document.getElementById("stats-completed");
    const statsStreak = document.getElementById("stats-streak");
    const statsPercentage = document.getElementById("stats-percentage");
    const progressGrid = document.getElementById("progress-grid");
    const progressQuote = document.getElementById("progress-quote");
    
    // Seletores para o novo modal de comentário
    const commentaryModal = document.getElementById('commentary-modal');
    const commentaryIframe = document.getElementById('commentary-iframe');
    const openCommentBtn = document.getElementById('open-comment-btn');
    const commentaryModalCloseBtn = document.getElementById('commentary-modal-close-btn');

    // --- 4. FUNÇÕES ---

    async function fetchBiblePassage(reference) {
        modalContent.innerHTML = '<p>Carregando texto...</p>';
        if (!bibliaIndex) { try { const response = await fetch('biblia/biblia.json'); if (!response.ok) throw new Error('Arquivo de índice biblia/biblia.json não encontrado.'); bibliaIndex = await response.json(); } catch (error) { modalContent.innerHTML = `<p style="color: red;">${error.message}</p>`; return; } }
        const bookNameMap = { 'gênesis': 'Gênesis', 'êxodo': 'Êxodo', 'levítico': 'Levítico', 'números': 'Números', 'deuteronômio': 'Deuteronômio', 'josué': 'Josué', 'juízes': 'Juízes', 'rute': 'Rute', 'i samuel': 'I Samuel', 'ii samuel': 'II Samuel', 'i reis': 'I Reis', 'ii reis': 'II Reis', 'i crônicas': 'I Crônicas', 'ii crônicas': 'II Crônicas', 'esdras': 'Esdras', 'neemias': 'Neemias', 'ester': 'Ester', 'jó': 'Jó', 'salmos': 'Salmos', 'provérbios': 'Provérbios', 'eclesiastes': 'Eclesiastes', 'cantares de salomão': 'Cantares de Salomão', 'isaías': 'Isaías', 'jeremias': 'Jeremias', 'lamentações de jeremias': 'Lamentações de Jeremias', 'ezequiel': 'Ezequiel', 'daniel': 'Daniel', 'oseias': 'Oseias', 'joel': 'Joel', 'amós': 'Amós', 'obadias': 'Obadias', 'jonas': 'Jonas', 'miqueias': 'Miqueias', 'naum': 'Naum', 'habacuque': 'Habacuque', 'sofonias': 'Sofonias', 'ageu': 'Ageu', 'zacarias': 'Zacarias', 'malaquias': 'Malaquias', 'mateus': 'Mateus', 'marcos': 'Marcos', 'lucas': 'Lucas', 'joão': 'João', 'atos': 'Atos', 'romanos': 'Romanos', 'i coríntios': 'I Coríntios', 'ii coríntios': 'II Coríntios', 'gálatas': 'Gálatas', 'efésios': 'Efésios', 'filipenses': 'Filipenses', 'colossenses': 'Colossenses', 'i tessalonicenses': 'I Tessalonicenses', 'ii tessalonicenses': 'II Tessalonicenses', 'i timóteo': 'I Timóteo', 'ii timóteo': 'II Timóteo', 'tito': 'Tito', 'filemom': 'Filemom', 'hebreus': 'Hebreus', 'tiago': 'Tiago', 'i pedro': 'I Pedro', 'ii pedro': 'II Pedro', 'i joão': 'I João', 'ii joão': 'II João', 'iii joão': 'III João', 'judas': 'Judas', 'apocalipse': 'Apocalipse' };
        const referenceRegex = /^((\d\s|i\s|ii\s|iii\s)?[a-zA-ZÀ-ú\s]+)\s+(\d+):?(\d+)?(?:-(\d+))?$/i;
        const match = reference.trim().match(referenceRegex);
        if (!match) { modalContent.innerHTML = `<p>Formato de referência inválido: "${reference}"</p>`; return; }
        const bookNameInput = match[1].trim().toLowerCase();
        const chapterNum = parseInt(match[3], 10);
        const startVerse = match[4] ? parseInt(match[4], 10) : null;
        const endVerse = match[5] ? parseInt(match[5], 10) : (startVerse ? startVerse : null);
        const officialBookName = bookNameMap[bookNameInput];
        if (!officialBookName) { modalContent.innerHTML = `<p>O livro "${bookNameInput}" não foi encontrado. Verifique a ortografia.</p>`; return; }
        const bookId = Object.keys(bibliaIndex).find(key => bibliaIndex[key] === officialBookName);
        if (!bookId) { modalContent.innerHTML = `<p>Livro "${officialBookName}" não encontrado no arquivo de índice.</p>`; return; }
        const testament = parseInt(bookId) <= 27 ? 'nt' : 'at';
        const filename = `biblia/${testament}_book-${bookId}_chapter-${chapterNum}.json`;
        try { const response = await fetch(filename); if (!response.ok) { console.error(`Falha ao carregar: ${filename}. Status: ${response.status}`); throw new Error(`Arquivo do capítulo não encontrado no servidor.`); }
            const chapterData = await response.json(); const versesArray = chapterData.verses; const versesToDisplay = versesArray.filter(verseObject => { const verseNum = parseInt(Object.keys(verseObject)[0], 10); if (!startVerse) return true; return verseNum >= startVerse && verseNum <= endVerse; });
            if (versesToDisplay.length === 0) { modalContent.innerHTML = "<p>Nenhum versículo encontrado para esta seleção.</p>"; return; }
            const versesHtml = versesToDisplay.map(verseObject => { const verseNum = Object.keys(verseObject)[0]; const verseText = verseObject[verseNum]; return `<p><strong>${verseNum}</strong> ${verseText}</p>`; }).join('');
            modalTitle.textContent = `${officialBookName} ${chapterNum}`; modalContent.innerHTML = versesHtml;
        } catch (error) { modalContent.innerHTML = `<p style="color: red;">${error.message}</p>`; }
    }
    
    function loadData() {
        const savedProgress = localStorage.getItem("guia40DiasProgress");
        progressStatus = savedProgress ? JSON.parse(savedProgress) : Array(guia40Dias.length).fill("not-started");
        const savedNotes = localStorage.getItem("guia40DiasNotes");
        notesData = savedNotes ? JSON.parse(savedNotes) : {};
    }

    function saveProgress() {
        localStorage.setItem("guia40DiasProgress", JSON.stringify(progressStatus));
    }

    function saveNotesForCurrentDay() {
        if (!notesData[currentPageIndex]) { notesData[currentPageIndex] = {}; }
        const reflectionTextareas = chapterQuestions.querySelectorAll("textarea");
        reflectionTextareas.forEach((textarea, index) => { notesData[currentPageIndex][`q${index}`] = textarea.value; });
        notesData[currentPageIndex]["main"] = notesInput.value;
        localStorage.setItem("guia40DiasNotes", JSON.stringify(notesData));
    }

    function calculateProgressStats() {
        const completedCount = progressStatus.filter(s => s === "completed").length;
        let streak = 0;
        const firstUncompleted = progressStatus.findIndex(s => s !== "completed");
        if (firstUncompleted === -1) { streak = progressStatus.length; } else if (firstUncompleted > 0) { streak = firstUncompleted; }
        const percentage = Math.round(completedCount / guia40Dias.length * 100);
        return { completedCount, streak, percentage };
    }

    function renderChapter(index) {
        const dia = guia40Dias[index];
        if (!dia) return;
        currentPageIndex = index;
        if (progressStatus[index] === "not-started") { progressStatus[index] = "in-progress"; saveProgress(); renderSummary(); }
        completeDayBtn.textContent = progressStatus[index] === "completed" ? "✓ Concluído" : "✓ Marcar como Concluído";
        completeDayBtn.classList.toggle("disabled", progressStatus[index] === "completed");
        chapterDayNumber.textContent = `DIA ${String(index + 1).padStart(2, "0")}`;
        chapterDayTitle.textContent = dia.titulo.split("—")[1]?.trim() || "Título";
        chapterDayTheme.textContent = dia.tema || "";
        chapterMainReading.innerHTML = `<a href="#" class="bible-link">${dia.leituraPrincipal}</a>`;
        chapterCompReading.innerHTML = dia.leiturasComplementares.split(";").map(ref => `<a href="#" class="bible-link">${ref.trim()}</a>`).join("; ");
        chapterComment.textContent = dia.comentario;
        chapterPrayer.textContent = dia.oracao;
        
        // Lógica do botão de comentário
        if (dia.comentarioLink) {
            openCommentBtn.style.display = 'block';
            openCommentBtn.dataset.url = dia.comentarioLink;
        } else {
            openCommentBtn.style.display = 'none';
        }

        chapterQuestions.innerHTML = "";
        const dayNotes = notesData[index] || {};
        dia.perguntas.forEach((pergunta, qIndex) => {
            const savedAnswer = dayNotes[`q${qIndex}`] || "";
            const itemHTML = `
                <div class="reflection-item">
                  <div class="question-header">
                    <span class="question-text">${pergunta}</span>
                    <span class="question-toggle">+</span>
                  </div>
                  <div class="answer-content">
                    <textarea data-q-index="${qIndex}" placeholder="Escreva sua reflexão aqui...">${savedAnswer}</textarea>
                  </div>
                </div>
            `;
            chapterQuestions.innerHTML += itemHTML;
        });
        notesInput.value = dayNotes["main"] || "";
        prevDayBtn.classList.toggle("disabled", index === 0);
        nextDayBtn.classList.toggle("disabled", index === guia40Dias.length - 1);
        updateOverallProgress();
    }

    function switchView(viewToShow) {
        const views = { summary: summaryView, chapter: chapterView };
        Object.values(views).forEach(view => view.classList.add("view-hidden"));
        setTimeout(() => {
            if (viewToShow === "chapter") { summaryView.style.display = "none"; chapterView.style.display = "block"; } else { chapterView.style.display = "none"; summaryView.style.display = "block"; }
            views[viewToShow].classList.remove("view-hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 150);
    }

    function updateOverallProgress() {
        const { completedCount } = calculateProgressStats();
        const percent = (completedCount / guia40Dias.length) * 100;
        headerProgressFill.style.width = `${percent}%`;
        headerProgressText.textContent = `${completedCount} de 40 dias • ${Math.round(percent)}% completo`;
    }

    function renderSummary() {
        summaryGridContainer.innerHTML = "";
        guia40Dias.forEach((dia, index) => {
            const dayTitle = dia.titulo.split("—")[1]?.trim() || "Título Indefinido";
            const status = progressStatus[index];
            const card = document.createElement("div");
            card.className = `day-card ${status === "completed" ? "completed" : ""}`;
            card.dataset.index = index;
            card.innerHTML = `<div class="completion-icon">✓</div><div class="day-number">DIA ${String(index + 1).padStart(2, "0")}</div><h3 class="day-title">${dayTitle}</h3><p class="day-theme">${dia.tema}</p><div class="day-status">${status === "completed" ? "Concluído" : status === "in-progress" ? "Em andamento" : "Não iniciado"}</div>`;
            summaryGridContainer.appendChild(card);
        });
    }

    function renderProgressView() {
        const stats = calculateProgressStats();
        statsCompleted.textContent = `${stats.completedCount}/${guia40Dias.length}`;
        statsStreak.innerHTML = `🔥 ${stats.streak} dias`;
        statsPercentage.textContent = `${stats.percentage}%`;
        progressGrid.innerHTML = "";
        for (let i = 0; i < guia40Dias.length; i++) {
            const daySquare = document.createElement("div");
            daySquare.className = "progress-day";
            daySquare.textContent = i + 1;
            daySquare.dataset.index = i;
            if (progressStatus[i] === "completed") daySquare.classList.add("completed");
            else if (progressStatus[i] === "in-progress") daySquare.classList.add("in-progress");
            progressGrid.appendChild(daySquare);
        }
        if (stats.completedCount >= 30) progressQuote.textContent = "Você está na reta final! Continue firme, a linha de chegada está perto.";
        else if (stats.completedCount >= 15) progressQuote.textContent = "Metade do caminho já foi! Seu compromisso está gerando frutos.";
        else if (stats.completedCount >= 7) progressQuote.textContent = "Uma semana completa! Você criou um ótimo hábito. Continue assim!";
        else if (stats.completedCount >= 1) progressQuote.textContent = "Parabéns por começar! O primeiro passo é o mais importante.";
        else progressQuote.textContent = "Toda grande jornada começa com um único passo.";
    }
    
    // --- 5. EVENT LISTENERS ---
    openCommentBtn.addEventListener('click', (e) => {
        const url = e.currentTarget.dataset.url;
        if (url) { commentaryIframe.src = url; commentaryModal.style.display = 'flex'; }
    });
    commentaryModalCloseBtn.addEventListener('click', () => { commentaryModal.style.display = 'none'; commentaryIframe.src = ''; });
    commentaryModal.addEventListener('click', (e) => { if (e.target === commentaryModal) { commentaryModal.style.display = 'none'; commentaryIframe.src = ''; } });
    chapterQuestions.addEventListener("click", e => { const header = e.target.closest(".question-header"); if (header) { const item = header.parentElement; item.classList.toggle("active"); } });
    chapterQuestions.addEventListener("blur", e => { if (e.target.tagName === "TEXTAREA") { saveNotesForCurrentDay(); } }, true);
    saveNotesBtn.addEventListener("click", () => { saveNotesForCurrentDay(); saveNotesBtn.textContent = "Salvo!"; setTimeout(() => { saveNotesBtn.textContent = "Salvar Anotações"; }, 1500); });
    summaryGridContainer.addEventListener("click", event => { const card = event.target.closest(".day-card"); if (card) { const index = parseInt(card.dataset.index, 10); renderChapter(index); switchView("chapter"); } });
    chapterView.addEventListener("click", e => { if (e.target.classList.contains("bible-link")) { e.preventDefault(); const reference = e.target.textContent; modalTitle.textContent = reference; bibleModal.style.display = "flex"; fetchBiblePassage(reference); } });
    modalCloseBtn.addEventListener("click", () => bibleModal.style.display = "none");
    bibleModal.addEventListener("click", e => { if (e.target === bibleModal) bibleModal.style.display = "none"; });
    completeDayBtn.addEventListener("click", e => { e.preventDefault(); if (!completeDayBtn.classList.contains("disabled")) { progressStatus[currentPageIndex] = "completed"; saveProgress(); renderSummary(); updateOverallProgress(); completeDayBtn.textContent = "✓ Concluído"; completeDayBtn.classList.add("disabled"); } });
    prevDayBtn.addEventListener("click", e => { e.preventDefault(); if (currentPageIndex > 0) { renderChapter(currentPageIndex - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } });
    nextDayBtn.addEventListener("click", e => { e.preventDefault(); if (currentPageIndex < guia40Dias.length - 1) { renderChapter(currentPageIndex + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } });
    backToSummaryBtn.addEventListener("click", e => { e.preventDefault(); switchView("summary"); });
    summaryNavBtn.addEventListener("click", e => { e.preventDefault(); switchView("summary"); });
    progressNavBtn.addEventListener("click", e => { e.preventDefault(); renderProgressView(); progressModal.style.display = "flex"; });
    progressModalCloseBtn.addEventListener("click", () => progressModal.style.display = "none");
    progressModal.addEventListener("click", e => { if (e.target === progressModal) progressModal.style.display = "none"; });
    progressGrid.addEventListener("click", e => { if (e.target.classList.contains("progress-day")) { const index = parseInt(e.target.dataset.index, 10); renderChapter(index); progressModal.style.display = "none"; switchView("chapter"); } });

    // --- 6. INICIALIZAÇÃO ---
    function init() {
        loadData();
        renderSummary();
        updateOverallProgress();
        summaryView.classList.remove('view-hidden');
    }

    init();
});