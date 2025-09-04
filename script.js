// SCRIPT.JS - VERSÃO FINAL (4 de Setembro, 2025)
// Lógica atualizada para ler arquivos de capítulo individuais da pasta /biblia.

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DADOS DA APLICAÇÃO ---
    const guia40Dias = [
        // ... (seus dados dos 40 dias permanecem aqui, sem alterações)
        {
            titulo: "Dia 1 — Conectado à Videira Verdadeira",
            tema: "A base de toda vida espiritual produtiva.",
            leituraPrincipal: "João 15:1-11",
            leiturasComplementares: "Salmos 1:1-3; Jeremias 17:7-8; Colossenses 2:6-7",
            comentario: "Permanecer em Cristo não é um esforço passivo...",
            perguntas: ["Como você descreveria seu 'permanecer' em Cristo hoje?", "Quais 'frutos' você tem visto em sua vida...", "Existem 'ramos secos' que precisam ser podados..."],
            oracao: "Senhor Jesus, obrigado por ser a Videira Verdadeira..."
        },
        {
            titulo: "Dia 2 — Oração que Transforma",
            tema: "Desenvolvendo um diálogo íntimo com Deus.",
            leituraPrincipal: "Mateus 6:5-13",
            leiturasComplementares: "Lucas 11:1-13; Filipenses 4:6-7",
            comentario: "A oração é menos sobre seguir uma fórmula...",
            perguntas: ["Sua vida de oração se parece mais com um monólogo ou um diálogo?", "Qual parte da Oração do Pai Nosso mais desafia você hoje?", "Como a ansiedade em sua vida pode ser transformada em oração..."],
            oracao: "Pai, ensina-me a orar com um coração sincero e humilde..."
        }
    ];

    for (let i = guia40Dias.length; i < 40; i++) {
        guia40Dias.push({ ...guia40Dias[1], titulo: `Dia ${i + 1} — Título de Exemplo`, leituraPrincipal: `Gênesis ${i - 1}:1-5` });
    }

    // --- 2. VARIÁVEIS GLOBAIS ---
    let currentPageIndex = 0;
    let progressStatus = [];
    let notesData = {};
    let bibliaIndex = null; // Armazenará o índice de livros (biblia.json)

    // --- 3. SELEÇÃO DE ELEMENTOS DO DOM ---
    const summaryView=document.getElementById("summary-view"),chapterView=document.getElementById("chapter-view"),summaryGridContainer=document.getElementById("summary-grid-container"),headerProgressFill=document.getElementById("header-progress-fill"),headerProgressText=document.getElementById("header-progress-text"),chapterQuestions=document.getElementById("chapter-questions"),notesInput=document.getElementById("notes-input"),saveNotesBtn=document.getElementById("save-notes-btn"),chapterDayNumber=document.getElementById("chapter-day-number"),chapterDayTitle=document.getElementById("chapter-day-title"),chapterDayTheme=document.getElementById("chapter-day-theme"),chapterMainReading=document.getElementById("chapter-main-reading"),chapterCompReading=document.getElementById("chapter-comp-reading"),chapterComment=document.getElementById("chapter-comment"),chapterPrayer=document.getElementById("chapter-prayer"),prevDayBtn=document.getElementById("prev-day-btn"),nextDayBtn=document.getElementById("next-day-btn"),backToSummaryBtn=document.getElementById("back-to-summary-btn"),summaryNavBtn=document.getElementById("summary-nav-btn"),completeDayBtn=document.getElementById("complete-day-btn"),progressNavBtn=document.getElementById("progress-nav-btn"),bibleModal=document.getElementById("bible-modal"),modalTitle=document.getElementById("modal-title"),modalContent=document.getElementById("modal-content"),modalCloseBtn=document.getElementById("modal-close-btn"),progressModal=document.getElementById("progress-modal"),progressModalCloseBtn=document.getElementById("progress-modal-close-btn"),statsCompleted=document.getElementById("stats-completed"),statsStreak=document.getElementById("stats-streak"),statsPercentage=document.getElementById("stats-percentage"),progressGrid=document.getElementById("progress-grid"),progressQuote=document.getElementById("progress-quote");

    // --- 4. FUNÇÕES ---

    // Mapa de normalização ATUALIZADO para corresponder ao seu biblia.json (com numerais romanos)
    const bookNormalizationMap = {
        "genesis": "Gênesis", "exodo": "Êxodo", "levitico": "Levítico", "numeros": "Números", "deuteronomio": "Deuteronômio",
        "josue": "Josué", "juizes": "Juízes", "rute": "Rute", "i samuel": "I Samuel", "ii samuel": "II Samuel", "i reis": "I Reis", "ii reis": "II Reis",
        "i cronicas": "I Crônicas", "ii cronicas": "II Crônicas", "esdras": "Esdras", "neemias": "Neemias", "ester": "Ester", "jo": "Jó",
        "salmos": "Salmos", "proverbios": "Provérbios", "eclesiastes": "Eclesiastes", "cantares de salomao": "Cantares de Salomão", "isaias": "Isaías", "jeremias": "Jeremias",
        "lamentacoes de jeremias": "Lamentações de Jeremias", "ezequiel": "Ezequiel", "daniel": "Daniel", "oseias": "Oseias", "joel": "Joel", "amos": "Amós",
        "obadias": "Obadias", "jonas": "Jonas", "miqueias": "Miqueias", "naum": "Naum", "habacuque": "Habacuque", "sofonias": "Sofonias", "ageu": "Ageu",
        "zacarias": "Zacarias", "malaquias": "Malaquias", "mateus": "Mateus", "marcos": "Marcos", "lucas": "Lucas", "joao": "João",
        "atos": "Atos", "romanos": "Romanos", "i corintios": "I Coríntios", "ii corintios": "II Coríntios", "galatas": "Gálatas", "efesios": "Efésios",
        "filipenses": "Filipenses", "colossenses": "Colossenses", "i tessalonicenses": "I Tessalonicenses", "ii tessalonicenses": "II Tessalonicenses",
        "i timoteo": "I Timóteo", "ii timoteo": "II Timóteo", "tito": "Tito", "filemom": "Filemom", "hebreus": "Hebreus", "tiago": "Tiago",
        "i pedro": "I Pedro", "ii pedro": "II Pedro", "i joao": "I João", "ii joao": "II João", "iii joao": "III João", "judas": "Judas", "apocalipse": "Apocalipse"
    };

    // ▼▼▼ FUNÇÃO DA BÍBLIA TOTALMENTE REESCRITA PARA SUA ESTRUTURA DE ARQUIVOS ▼▼▼
    async function fetchBiblePassage(reference) {
        modalContent.innerHTML = '<p>Carregando texto...</p>';

        // Passo 1: Carrega o arquivo de índice (biblia.json) se ainda não foi carregado.
        if (!bibliaIndex) {
            try {
                const response = await fetch('biblia/biblia.json');
                if (!response.ok) throw new Error('Arquivo de índice biblia/biblia.json não encontrado.');
                bibliaIndex = await response.json();
            } catch (error) {
                modalContent.innerHTML = `<p style="color: red;">${error.message}</p>`;
                return;
            }
        }

        // Passo 2: Analisa a referência do usuário (ex: "I João 5:1-4").
        const referenceRegex = /^((\d\s|i\s|ii\s|iii\s)?[a-zA-ZÀ-ú]+)\s+(\d+):?(\d+)?(?:-(\d+))?$/i;
        const match = reference.trim().match(referenceRegex);

        if (!match) {
            modalContent.innerHTML = `<p>Formato de referência inválido: "${reference}"</p>`;
            return;
        }
        
        const bookNameInput = match[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const chapterNum = parseInt(match[3], 10);
        const startVerse = match[4] ? parseInt(match[4], 10) : null;
        const endVerse = match[5] ? parseInt(match[5], 10) : (startVerse ? startVerse : null);
        
        const normalizedBookName = bookNormalizationMap[bookNameInput];
        if (!normalizedBookName) {
            modalContent.innerHTML = `<p>O livro "${bookNameInput}" não foi encontrado. Verifique a ortografia.</p>`;
            return;
        }

        // Passo 3: Encontra o ID do livro no índice.
        const bookId = Object.keys(bibliaIndex).find(key => bibliaIndex[key] === normalizedBookName);
        if (!bookId) {
            modalContent.innerHTML = `<p>Livro "${normalizedBookName}" não encontrado no arquivo de índice.</p>`;
            return;
        }
        
        // Passo 4: Determina o testamento e constrói o nome do arquivo do capítulo.
        const testament = parseInt(bookId) <= 27 ? 'nt' : 'at';
        const filename = `biblia/${testament}_book-${bookId}_chapter-${chapterNum}.json`;

        // Passo 5: Carrega o arquivo do capítulo específico.
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`Arquivo do capítulo não encontrado: ${filename}`);
            const chapterData = await response.json();

            // Passo 6: Filtra e exibe os versículos.
            const versesToDisplay = chapterData.verses.filter(verse => {
                if (!startVerse) return true; // Mostra o capítulo inteiro
                return verse.number >= startVerse && verse.number <= endVerse;
            });

            if (versesToDisplay.length === 0) {
                modalContent.innerHTML = "<p>Nenhum versículo encontrado para esta seleção.</p>";
                return;
            }
            
            const versesHtml = versesToDisplay.map(v => `<p><strong>${v.number}</strong> ${v.text}</p>`).join('');
            modalTitle.textContent = `${normalizedBookName} ${chapterNum}`;
            modalContent.innerHTML = versesHtml;

        } catch (error) {
            modalContent.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
    // ▲▲▲ FIM DA FUNÇÃO DA BÍBLIA ATUALIZADA ▲▲▲

    // (O restante do script, funções e event listeners, permanece o mesmo)
    function loadData(){const savedProgress=localStorage.getItem("guia40DiasProgress");progressStatus=savedProgress?JSON.parse(savedProgress):Array(guia40Dias.length).fill("not-started");const savedNotes=localStorage.getItem("guia40DiasNotes");notesData=savedNotes?JSON.parse(savedNotes):{}}
    function saveProgress(){localStorage.setItem("guia40DiasProgress",JSON.stringify(progressStatus))}
    function saveNotesForCurrentDay(){if(!notesData[currentPageIndex]){notesData[currentPageIndex]={}}
    const reflectionTextareas=chapterQuestions.querySelectorAll("textarea");reflectionTextareas.forEach((textarea,index)=>{notesData[currentPageIndex][`q${index}`]=textarea.value});notesData[currentPageIndex]["main"]=notesInput.value;localStorage.setItem("guia40DiasNotes",JSON.stringify(notesData))}
    function calculateProgressStats(){const completedCount=progressStatus.filter(s=>s==="completed").length;let streak=0;const firstUncompleted=progressStatus.findIndex(s=>s!=="completed");if(firstUncompleted===-1){streak=progressStatus.length}else if(firstUncompleted>0){streak=firstUncompleted}
    const percentage=Math.round(completedCount/guia40Dias.length*100);return{completedCount,streak,percentage}}
    function renderChapter(index){const dia=guia40Dias[index];if(!dia)return;currentPageIndex=index;if(progressStatus[index]==="not-started"){progressStatus[index]="in-progress";saveProgress();renderSummary()}
    completeDayBtn.textContent=progressStatus[index]==="completed"?"✓ Concluído":"✓ Marcar como Concluído";completeDayBtn.classList.toggle("disabled",progressStatus[index]==="completed");chapterDayNumber.textContent=`DIA ${String(index+1).padStart(2,"0")}`;chapterDayTitle.textContent=dia.titulo.split("—")[1]?.trim()||"Título";chapterDayTheme.textContent=dia.tema||"";chapterMainReading.innerHTML=`<a href="#" class="bible-link">${dia.leituraPrincipal}</a>`;chapterCompReading.innerHTML=dia.leiturasComplementares.split(";").map(ref=>`<a href="#" class="bible-link">${ref.trim()}</a>`).join("; ");chapterComment.textContent=dia.comentario;chapterPrayer.textContent=dia.oracao;chapterQuestions.innerHTML="";const dayNotes=notesData[index]||{};dia.perguntas.forEach((pergunta,qIndex)=>{const savedAnswer=dayNotes[`q${qIndex}`]||"";const itemHTML=`
                <div class="reflection-item">
                  <div class="question-header">
                    <span class="question-text">${pergunta}</span>
                    <span class="question-toggle">+</span>
                  </div>
                  <div class="answer-content">
                    <textarea data-q-index="${qIndex}" placeholder="Escreva sua reflexão aqui...">${savedAnswer}</textarea>
                  </div>
                </div>
            `;chapterQuestions.innerHTML+=itemHTML});notesInput.value=dayNotes["main"]||"";prevDayBtn.classList.toggle("disabled",index===0);nextDayBtn.classList.toggle("disabled",index===guia40Dias.length-1);updateOverallProgress()}
    function switchView(viewToShow){const views={summary:summaryView,chapter:chapterView};Object.values(views).forEach(view=>view.classList.add("view-hidden"));setTimeout(()=>{if(viewToShow==="chapter"){summaryView.style.display="none";chapterView.style.display="block"}else{chapterView.style.display="none";summaryView.style.display="block"}
    views[viewToShow].classList.remove("view-hidden");window.scrollTo({top:0,behavior:"smooth"})},150)}
    function updateOverallProgress(){const{completedCount}=calculateProgressStats();const percent=completedCount/guia40Dias.length*100;headerProgressFill.style.width=`${percent}%`;headerProgressText.textContent=`${completedCount} de 40 dias • ${Math.round(percent)}% completo`}
    function renderSummary(){summaryGridContainer.innerHTML="";guia40Dias.forEach((dia,index)=>{const dayTitle=dia.titulo.split("—")[1]?.trim()||"Título Indefinido";const status=progressStatus[index];const card=document.createElement("div");card.className=`day-card ${status==="completed"?"completed":""}`;card.dataset.index=index;card.innerHTML=`<div class="completion-icon">✓</div><div class="day-number">DIA ${String(index+1).padStart(2,"0")}</div><h3 class="day-title">${dayTitle}</h3><p class="day-theme">${dia.tema}</p><div class="day-status">${status==="completed"?"Concluído":status==="in-progress"?"Em andamento":"Não iniciado"}</div>`;summaryGridContainer.appendChild(card)})}
    function renderProgressView(){const stats=calculateProgressStats();statsCompleted.textContent=`${stats.completedCount}/${guia40Dias.length}`;statsStreak.innerHTML=`🔥 ${stats.streak} dias`;statsPercentage.textContent=`${stats.percentage}%`;progressGrid.innerHTML="";for(let i=0;i<guia40Dias.length;i++){const daySquare=document.createElement("div");daySquare.className="progress-day";daySquare.textContent=i+1;daySquare.dataset.index=i;if(progressStatus[i]==="completed")daySquare.classList.add("completed");else if(progressStatus[i]==="in-progress")daySquare.classList.add("in-progress");progressGrid.appendChild(daySquare)}
    if(stats.completedCount>=30)progressQuote.textContent="Você está na reta final! Continue firme, a linha de chegada está perto.";else if(stats.completedCount>=15)progressQuote.textContent="Metade do caminho já foi! Seu compromisso está gerando frutos.";else if(stats.completedCount>=7)progressQuote.textContent="Uma semana completa! Você criou um ótimo hábito. Continue assim!";else if(stats.completedCount>=1)progressQuote.textContent="Parabéns por começar! O primeiro passo é o mais importante.";else progressQuote.textContent="Toda grande jornada começa com um único passo."}
    chapterQuestions.addEventListener("click",e=>{const header=e.target.closest(".question-header");if(header){const item=header.parentElement;item.classList.toggle("active")}});chapterQuestions.addEventListener("blur",e=>{if(e.target.tagName==="TEXTAREA"){saveNotesForCurrentDay()}},true);saveNotesBtn.addEventListener("click",()=>{saveNotesForCurrentDay();saveNotesBtn.textContent="Salvo!";setTimeout(()=>{saveNotesBtn.textContent="Salvar Anotações"},1500)});summaryGridContainer.addEventListener("click",event=>{const card=event.target.closest(".day-card");if(card){const index=parseInt(card.dataset.index,10);renderChapter(index);switchView("chapter")}});chapterView.addEventListener("click",e=>{if(e.target.classList.contains("bible-link")){e.preventDefault();const reference=e.target.textContent;modalTitle.textContent=reference;bibleModal.style.display="flex";fetchBiblePassage(reference)}});modalCloseBtn.addEventListener("click",()=>bibleModal.style.display="none");bibleModal.addEventListener("click",e=>{if(e.target===bibleModal)bibleModal.style.display="none"});completeDayBtn.addEventListener("click",e=>{e.preventDefault();if(!completeDayBtn.classList.contains("disabled")){progressStatus[currentPageIndex]="completed";saveProgress();renderSummary();updateOverallProgress();completeDayBtn.textContent="✓ Concluído";completeDayBtn.classList.add("disabled")}});prevDayBtn.addEventListener("click",e=>{e.preventDefault();if(currentPageIndex>0){renderChapter(currentPageIndex-1);window.scrollTo({top:0,behavior:"smooth"})}});nextDayBtn.addEventListener("click",e=>{e.preventDefault();if(currentPageIndex<guia40Dias.length-1){renderChapter(currentPageIndex+1);window.scrollTo({top:0,behavior:"smooth"})}});backToSummaryBtn.addEventListener("click",e=>{e.preventDefault();switchView("summary")});summaryNavBtn.addEventListener("click",e=>{e.preventDefault();switchView("summary")});progressNavBtn.addEventListener("click",e=>{e.preventDefault();renderProgressView();progressModal.style.display="flex"});progressModalCloseBtn.addEventListener("click",()=>progressModal.style.display="none");progressModal.addEventListener("click",e=>{if(e.target===progressModal)progressModal.style.display="none"});progressGrid.addEventListener("click",e=>{if(e.target.classList.contains("progress-day")){const index=parseInt(e.target.dataset.index,10);renderChapter(index);progressModal.style.display="none";switchView("chapter")}});

    function init() {
        loadData();
        renderSummary();
        updateOverallProgress();
        summaryView.classList.remove('view-hidden');
    }

    init();
});