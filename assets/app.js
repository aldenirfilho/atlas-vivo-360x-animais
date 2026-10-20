
(() => {
  'use strict';
  const data = window.DomainAtlas;
  const view = document.getElementById('view');
  const sourceById = new Map(data.sources.map(source => [source.id, source]));
  const levels = [{ value: 'essencial', label: 'Essencial' }, { value: 'graduacao', label: 'Graduação' }, { value: 'avancado', label: 'Avançado' }];
  let level = 'essencial';
  let quizIndex = 0;
  const responses = new Map();
  const selections = new Map();
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const link = source => '<a href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer">' + escape(source.title) + '<span class="sr-only"> (abre em outra aba)</span></a>';
  const sourceList = ids => '<ol>' + ids.map(id => sourceById.get(id)).filter(Boolean).map(source => '<li>' + link(source) + '</li>').join('') + '</ol>';
  const symbol = '<span aria-hidden="true">↗</span>';
  const pageHead = (eyebrow, title, text) => '<header class="page-head"><div class="eyebrow">' + escape(eyebrow) + '</div><h1 id="page-title" tabindex="-1">' + escape(title) + '</h1><p>' + escape(text) + '</p></header>';
  const searchBox = (label, placeholder) => '<div class="search-wrap"><label class="search-label" for="content-search">' + escape(label) + '</label><input id="content-search" class="search" type="search" placeholder="' + escape(placeholder) + '" autocomplete="off"><p class="result-count" id="search-result" aria-live="polite"></p></div>';
  const moduleText = module => normalize(JSON.stringify(module));
  const cards = () => data.modules.map((module, i) => '<a class="module-card" data-filter-item data-search="' + escape(moduleText(module)) + '" href="#trilhas/' + encodeURIComponent(module.id) + '"><span class="number">TRILHA ' + String(i + 1).padStart(2, '0') + symbol + '</span><h3>' + escape(module.title) + '</h3><p>' + escape(module.summary) + '</p><span class="read">Explorar os três níveis →</span></a>').join('');

  function home() {
    return '<section class="hero"><div><div class="eyebrow">' + escape(data.site.eyebrow) + '</div><h1 id="page-title" tabindex="-1">' + escape(data.site.title) + '</h1><p class="lede">' + escape(data.site.subtitle) + '</p><div class="actions"><a class="button" href="#trilhas">Começar pelas trilhas <span aria-hidden="true">→</span></a><a class="button secondary" href="#questoes">Praticar questões</a></div></div><div class="hero-visual">' + data.art + '<p class="caption">ILUSTRAÇÃO EDITORIAL · SEM FUNÇÃO DE IDENTIFICAÇÃO</p></div></section><div class="stats" aria-label="Conteúdo disponível"><div class="stat"><strong>' + data.modules.length + '</strong><span>trilhas de ' + escape(data.site.noun) + '</span></div><div class="stat"><strong>' + data.questions.length + '</strong><span>questões comentadas</span></div><div class="stat"><strong>' + data.sources.length + '</strong><span>referências vinculadas</span></div></div><div class="notice"><strong>Uma base para estudar e investigar.</strong> As trilhas e questões já estão disponíveis. Fichas individuais de ' + (data.site.domain === 'zoologia' ? 'espécies animais' : 'rochas e minerais') + ' serão uma etapa futura; este site ainda não oferece um catálogo de exemplares.</div><section aria-labelledby="home-trails"><div class="section-top"><h2 id="home-trails">O conhecimento em cinco caminhos</h2><p>Essencial → Graduação → Avançado</p></div><div class="grid">' + cards() + '</div></section><section class="notice"><p><strong>Questões autorais para preparação.</strong> Os exercícios trabalham interpretação e conceitos úteis ao ENEM e aos vestibulares. Não são questões oficiais, nem constituem uma análise de incidência das provas.</p><p><a href="#sobre">Entenda o escopo e os limites editoriais →</a></p></section>';
  }

  function moduleReader(module) {
    const sections = module.core.map(section => '<section><span class="study-tag">FUNDAMENTO</span><h3>' + escape(section.heading) + '</h3><p>' + escape(section.text) + '</p></section>').join('');
    const advanced = level === 'essencial' ? '' : module.advanced.map(section => '<section><span class="study-tag">APROFUNDAMENTO</span><h3>' + escape(section.heading) + '</h3><p>' + escape(section.text) + '</p></section>').join('');
    const traps = level === 'avancado' ? '<aside class="traps" aria-label="Análise crítica"><h3>Questione a generalização</h3><ul>' + module.examTraps.map(trap => '<li>' + escape(trap) + '</li>').join('') + '</ul><p style="margin-top:16px;margin-bottom:0">Ao consultar as fontes, compare definições, exemplos e exceções. Aprofundamento de leitura não substitui revisão por especialista ou identificação em campo.</p></aside>' : '';
    return '<div class="reader-top"><p>LEITURA EM CAMADAS</p><div><label class="control-label" for="reading-level">Profundidade da leitura</label><select id="reading-level" class="level">' + levels.map(item => '<option value="' + item.value + '"' + (item.value === level ? ' selected' : '') + '>' + escape(item.label) + '</option>').join('') + '</select></div></div><h2>' + escape(module.title) + '</h2><p class="lede">' + escape(module.summary) + '</p>' + sections + advanced + traps + (level === 'essencial' ? '<div class="notice">Passe para <strong>Graduação</strong> para examinar relações e exceções; em <strong>Avançado</strong>, use os pontos de análise crítica.</div>' : '') + '<div class="reader-sources"><h3>Fontes desta trilha</h3>' + sourceList(module.sourceRefs) + '</div>';
  }

  function trails(id) {
    const selected = id ? data.modules.find(module => module.id === id) : data.modules[0];
    if (!selected) return pageHead('TRILHAS', 'Módulo não encontrado', 'Escolha uma das trilhas disponíveis.') + '<div class="grid">' + cards() + '</div>';
    return pageHead('ESTUDO EM CAMADAS', 'Trilhas de ' + data.site.noun, 'A leitura essencial apresenta os fundamentos. Graduação acrescenta relações e exceções; Avançado inclui pontos de análise crítica, sempre acompanhados de fontes.') + searchBox('Buscar nas trilhas', data.site.domain === 'zoologia' ? 'Ex.: celoma, embrião, conservação…' : 'Ex.: quartzo, textura, intemperismo…') + '<div class="study-layout"><nav class="module-menu" aria-label="Módulos disponíveis">' + data.modules.map((module, i) => '<a class="module-link" data-filter-item data-search="' + escape(moduleText(module)) + '" href="#trilhas/' + encodeURIComponent(module.id) + '"' + (module.id === selected.id ? ' aria-current="page"' : '') + '><small>TRILHA ' + String(i + 1).padStart(2, '0') + '</small>' + escape(module.title) + '</a>').join('') + '<p id="empty-results" class="empty" hidden>Nenhuma trilha encontrada.</p></nav><article class="reader" id="module-reader" aria-label="Leitura da trilha">' + moduleReader(selected) + '</article></div>';
  }

  function feedback(question) {
    const response = responses.get(question.id);
    if (!response) return '';
    return '<div class="feedback" role="status"><h3>' + (response.correct ? 'Resposta correta.' : 'Vamos conferir o raciocínio.') + ' Gabarito: ' + String.fromCharCode(65 + question.answerIndex) + '.</h3><p>' + escape(question.explanation) + '</p><div class="reader-sources"><h3>Fontes do comentário</h3>' + sourceList(question.sourceRefs) + '</div></div>';
  }

  function quiz() {
    const question = data.questions[quizIndex];
    const selected = selections.get(question.id);
    const response = responses.get(question.id);
    const correct = [...responses.values()].filter(item => item.correct).length;
    return pageHead('PRÁTICA COMENTADA', 'Observe, relacione e explique.', 'Questões autorais para preparação ao ENEM e aos vestibulares. Leia as alternativas e confira as fontes do comentário.') + '<section class="quiz" aria-label="Simulado de ' + escape(data.site.noun) + '"><div class="quiz-top"><span>Questão ' + (quizIndex + 1) + ' de ' + data.questions.length + ' · ' + escape(question.topic) + '</span><span aria-live="polite">Conferidas: ' + responses.size + ' · Acertos: ' + correct + '</span></div><form id="quiz-form" class="quiz-card"><div class="eyebrow">' + escape(question.level === 'vestibular' ? 'ENEM / VESTIBULAR · AUTORAL' : 'APROFUNDAMENTO · AUTORAL') + '</div><h2 id="quiz-title" tabindex="-1">' + escape(question.prompt) + '</h2><fieldset' + (response ? ' disabled' : '') + '><legend>Selecione uma alternativa</legend>' + question.options.map((option, i) => '<label class="answer"><input type="radio" name="answer" value="' + i + '"' + (selected === i ? ' checked' : '') + '><span><b aria-hidden="true">' + String.fromCharCode(65 + i) + '</b><span class="sr-only">Alternativa ' + String.fromCharCode(65 + i) + ': </span>' + escape(option) + '</span></label>').join('') + '</fieldset><p class="error" id="answer-error" role="alert" hidden>Escolha uma alternativa para conferir.</p>' + (!response ? '<button class="button" type="submit">Conferir resposta</button>' : '<p class="quiz-note">Resposta registrada nesta sessão. Volte às trilhas e às fontes para revisar.</p>') + feedback(question) + '</form><div class="quiz-controls"><div class="quiz-nav" aria-label="Ir para uma questão">' + data.questions.map((item, i) => '<button type="button" data-question="' + i + '" aria-label="Questão ' + (i + 1) + (responses.has(item.id) ? ', já conferida' : '') + '"' + (quizIndex === i ? ' aria-current="step"' : '') + '>' + (i + 1) + '</button>').join('') + '</div><div class="actions" style="margin:0"><button class="button secondary" type="button" data-move="-1"' + (!quizIndex ? ' disabled' : '') + '>← Anterior</button><button class="button" type="button" data-move="1"' + (quizIndex === data.questions.length - 1 ? ' disabled' : '') + '>Próxima →</button></div></div><p class="quiz-note">Progresso somente nesta sessão; recarregar a página reinicia as respostas. Não há coleta, envio ou armazenamento de resultados.</p></section>';
  }

  function sources() {
    return pageHead('RASTREABILIDADE', 'Fontes para continuar a investigação.', 'Referências vinculadas aos módulos e aos comentários das questões. Cada uma indica o assunto que fundamenta, sem equivaler a uma revisão sistemática.') + searchBox('Buscar referência ou assunto', 'Ex.: reprodução, USGS, mineral…') + '<div class="source-grid">' + data.sources.map(source => '<article class="source-card" data-filter-item data-search="' + escape(normalize(source.title + ' ' + source.scope)) + '"><h2>' + link(source) + '</h2><p>' + escape(source.scope) + '</p></article>').join('') + '</div><p id="empty-results" class="empty" hidden>Nenhuma referência encontrada.</p><aside class="notice"><p><strong>Créditos e consulta.</strong> Textos e questões desta edição são sínteses autorais. ' + (data.site.domain === 'zoologia' ? 'A bibliografia inclui capítulos de <em>Biology 2e</em>, de Mary Ann Clark, Matthew Douglas e Jung Choi, OpenStax/Rice University.' : 'A bibliografia reúne documentos institucionais de USGS, SGB e IMA-CNMNC, entre as instituições indicadas em cada referência.') + ' Consulte a edição, a autoria e a licença no site de origem. Não redistribuímos imagens ou capítulos dos livros.</p><p>Links externos exigem conexão e podem mudar. As trilhas e os exercícios locais continuam disponíveis sem serviços externos após baixar o pacote completo.</p></aside>';
  }

  function about() {
    return pageHead('PROPÓSITO & MÉTODO', 'Estudar com curiosidade e precisão.', 'Um ambiente independente de ' + data.site.noun + ' da rede Atlas Vivo 360X.') + '<div class="text-page"><section class="card"><h2>O que está disponível</h2><p>' + data.modules.length + ' trilhas, ' + data.questions.length + ' questões autorais e ' + data.sources.length + ' entradas de referência. O conteúdo trata de ' + escape(data.site.focus.join(', ').toLocaleLowerCase('pt-BR')) + '.</p><p>As três camadas apresentam os mesmos temas com extensão crescente: fundamentos, aprofundamento e análise de generalizações. Os rótulos são percursos de leitura, sem certificação de nível acadêmico.</p><p><strong>Estado editorial:</strong> revisão científica especializada e homologação humana de acessibilidade pendentes. As fontes estão ligadas aos módulos para facilitar verificação e correções.</p></section><section class="card"><h2>O catálogo será construído com evidência</h2><p>Esta edição tem trilhas educativas reais, mas ainda não contém fichas individuais de ' + (data.site.domain === 'zoologia' ? 'animais nem registros de ocorrência' : 'rochas, minerais ou locais de coleta') + '. Registros futuros deverão distinguir nome, classificação, características, origem, método de identificação, fontes e limitações.</p><p>' + (data.site.domain === 'zoologia' ? 'Fotos e descrições isoladas não confirmam a identificação de uma espécie, a segurança do manejo ou a ocorrência de uma população. O estudo não autoriza captura ou interação com animais.' : 'Semelhança visual não confirma a identificação de um mineral ou uma rocha. O estudo não autoriza coleta, exploração mineral ou entrada em áreas restritas.') + '</p></section><section class="card"><h2>Preparação para provas</h2><p>Os exercícios desta edição são originais. Foram elaborados para relacionar conceitos e interpretar situações; não são itens oficiais do ENEM ou da UFC/CCV. Não realizamos nesta edição uma análise histórica dos cadernos ou da frequência dos assuntos.</p><p>Para usar o material em pesquisa, consulte os trabalhos e documentos de origem, registre a data de acesso e confronte revisões da área.</p></section><section class="card"><h2>Privacidade e funcionamento</h2><ul><li>Não há login, publicidade, rastreadores, telemetria, fontes remotas ou bibliotecas carregadas de terceiros.</li><li>As respostas do quiz ficam na memória da aba. Recarregar ou fechar a página descarta o progresso.</li><li>O pacote completo funciona localmente sem dependências. Abrir uma fonte ou outro site exige conexão.</li><li>Ao acessar a versão hospedada, o navegador se conecta ao GitHub Pages; valem também as políticas do serviço de hospedagem.</li></ul><p><a href="README.md">Leia as informações desta edição</a> · Versão ' + escape(data.version) + '</p></section><section class="notice"><h2>Três sites, áreas próprias</h2><p>A rede reúne plantas, animais e rochas em endereços separados. Cada área conserva suas classificações e referências. A taxonomia biológica e a classificação mineralógica não são sistemas intercambiáveis.</p><p>' + Object.entries(data.urls).map(([key, url]) => '<a href="' + escape(url) + '">' + escape(key[0].toLocaleUpperCase('pt-BR') + key.slice(1)) + '</a>').join(' · ') + '</p></section></div>';
  }

  function applySearch() {
    const input = document.getElementById('content-search');
    if (!input) return;
    const value = normalize(input.value).trim();
    const items = [...view.querySelectorAll('[data-filter-item]')];
    let visible = 0;
    items.forEach(item => { item.hidden = !item.dataset.search.includes(value); if (!item.hidden) visible++; });
    const result = document.getElementById('search-result');
    if (result) result.textContent = visible + ' de ' + items.length + (location.hash.startsWith('#fontes') ? ' referências' : ' trilhas') + (location.hash.startsWith('#trilhas') ? ' · a busca filtra a lista; a leitura atual permanece aberta.' : '');
    const empty = document.getElementById('empty-results');
    if (empty) empty.hidden = visible !== 0;
  }

  function route(focus = false) {
    const pieces = location.hash.slice(1).split('/');
    const name = pieces[0] || 'inicio';
    let id = '';
    try { id = decodeURIComponent(pieces.slice(1).join('/')); } catch { id = ''; }
    const known = ['inicio', 'trilhas', 'questoes', 'fontes', 'sobre'].includes(name);
    document.querySelectorAll('.nav a').forEach(anchor => { if (anchor.hash === '#' + name) anchor.setAttribute('aria-current', 'page'); else anchor.removeAttribute('aria-current'); });
    view.innerHTML = name === 'inicio' ? home() : name === 'trilhas' ? trails(id) : name === 'questoes' ? quiz() : name === 'fontes' ? sources() : name === 'sobre' ? about() : pageHead('ENDEREÇO', 'Página não encontrada', 'Volte ao início ou escolha uma trilha no menu.') + '<a class="button" href="#inicio">Ir para o início</a>';
    document.title = (known ? ({ inicio: 'Início', trilhas: 'Trilhas de ' + data.site.noun, questoes: 'Questões comentadas', fontes: 'Fontes científicas', sobre: 'Sobre o projeto' })[name] : 'Página não encontrada') + ' · ' + data.site.name;
    applySearch();
    if (focus) document.getElementById('page-title')?.focus({ preventScroll: true });
  }

  view.addEventListener('input', event => {
    if (event.target.id === 'content-search') applySearch();
    if (event.target.matches('input[name="answer"]')) selections.set(data.questions[quizIndex].id, Number(event.target.value));
  });
  view.addEventListener('change', event => {
    if (event.target.id !== 'reading-level') return;
    if (!levels.some(item => item.value === event.target.value)) return;
    level = event.target.value;
    let id = '';
    try { id = decodeURIComponent(location.hash.slice(1).split('/').slice(1).join('/')); } catch {}
    const selected = data.modules.find(module => module.id === id) || data.modules[0];
    document.getElementById('module-reader').innerHTML = moduleReader(selected);
    document.getElementById('reading-level').focus({ preventScroll: true });
  });
  view.addEventListener('submit', event => {
    if (event.target.id !== 'quiz-form') return;
    event.preventDefault();
    const question = data.questions[quizIndex];
    if (responses.has(question.id)) return;
    const answer = selections.get(question.id);
    if (!Number.isInteger(answer)) { document.getElementById('answer-error').hidden = false; view.querySelector('input[name="answer"]')?.focus(); return; }
    responses.set(question.id, { answer, correct: answer === question.answerIndex });
    route();
    view.querySelector('.feedback')?.setAttribute('tabindex', '-1');
    view.querySelector('.feedback')?.focus({ preventScroll: true });
  });
  view.addEventListener('click', event => {
    const button = event.target.closest('button[data-question],button[data-move]');
    if (!button || button.disabled) return;
    const next = button.hasAttribute('data-question') ? Number(button.dataset.question) : quizIndex + Number(button.dataset.move);
    if (!Number.isInteger(next) || next < 0 || next >= data.questions.length) return;
    quizIndex = next;
    route();
    document.getElementById('quiz-title')?.focus({ preventScroll: true });
  });
  document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); document.getElementById('conteudo').focus(); });
  window.addEventListener('hashchange', () => { route(true); window.scrollTo({ top: 0, behavior: 'instant' }); });
  route();
})();
