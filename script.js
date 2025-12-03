document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 0. CONFIG SUPABASE (classement global)
    // ----------------------------------------------------
    const SUPABASE_URL = 'https://dkqglaybzifwjdbmyulb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWdsYXliemlmd2pkYm15dWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDUyMDIsImV4cCI6MjA4MDI4MTIwMn0.ERluxhEyiGM2UN5qUdJ5I86GzdA3y8bk_uCjv6HbR0U';
    const SUPABASE_TABLE = 'nutri_wordle_winners';

    // ----------------------------------------------------
    // 1. MOTS-CLÉS NUTRIMUSCLE
    // ----------------------------------------------------
    const WORD_LIST = [
        // Mots de la liste précédente (maintenus)
    "WHEY", "ISOLAT", "CASEINE", "PROTEINE", "NATIVE", "PEPTOPRO", "MUSCLEWHEGG",
    "CREATINE", "CREAPURE", "BCAA", "GLUTAMINE", "CITRULLINE", "ARGININE", "GLYCINE",
    "TAURINE", "PREWORKOUT", "PEPTIDE", "COLLAGENE", "PEPTAN", "ARTIPRO", "MARIN",
    "DEXTROSE", "PANCAKES", "BARRE", "MUESLI", "GAINER", "MUSCLEMASSE", "VITAMINE",
    "MINERAUX", "OMEGA", "MAGNESIUM", "ZINC", "FER", "ZMB", "QUALIC", "QUALID", "EPAX", "NATICOL",
    "ULTIMINE", "TRIBULUS", "CAFEINE", "GUARANA", "CURCUMINE", "CARNITINE", "CARNIPURE",
    "CHOLINE", "LACTIUM", "DETOX", "BIO", "SHAKER", "NUTRIMUSCLE", "REBORN", "POMPE",
    "SQUAT", "TRACTION", "FENTES", "DIPS", "CURLS", "PRESSE", "ROWING", "GAINAGE",
    "EXTENSION", "FLEXION", "TIRAGE", "ELEVATION", "POULET", "REPETITION", "SERIE",
    "CHARGE", "INTENSITE", "HALTERE", "KETTLEBELL", "MACHINE", "BANCS", "TERRE",
    "MILITAIRE", "MOLETS", "QUADRI", "ISCHIOS", "PEC", "TRICEPS", "BICEPS", "ABDOS",
    "TRAPEZES", "DORSEAUX", "FORCE", "ENDURANCE", "VOLUME", "MASSE", "SECHE", "PRISE",
    "PERTE", "RECUP", "SURCHARGE", "PROGRESSION", "CALORIES", "MACROS", "MICRO",
    "FIBRES", "GYMNASE", "SALLE", "TRAINING", "DIETE", "REPOS", "PRISES", "CARDIO",
    "PHYSIQUE", "PERFORMER", "RESISTANCE", "GUNDILL", "DELAVIER", "EXPERT", "AUTEUR",
    "LIVRE", "DOSSIER", "ANALYSE", "CONSEIL", "SCIENCES", "RECHERCHE", "FORMATEUR",
    "ARTICLE", "YOUTUBE", "CHAINE", "SPORT", "PRATIQUE", "THEORIE", "GUIDE", "REFERENCE",
    "METHODE", "PROGRAMME", "EXPERIENCE", "KNOWLEDGE", "BIOLOGIE", "ALIMENTS", "LOUAN", "AUBANGE", "POSTWORKOUT",

    // AJOUTS THÉMATIQUES (5 à 13 lettres, sans espace)
    // Entraînement et Anatomie
    "ABDUCTEUR",
    "ADDUCTEUR",
    "SOULEVE", // SOULEVE DE TERRE
    "DELTOIDE",
    "ISOMETRIE",
    "CONCENTRIQUE",
    "EXCENTRIQUE",
    "PLIOMETRIE",
    "MUSCULAR",
    "FITNESS",
    "CHRONO", // Chronobiologie
    "ECHAUFFEMENT", // ÉCHAUFFEMENT
    "MUSCULE",
    "LIGAMENT",
    "TENDON",
    "ARTICULATION",
    "PERFORMANCE",
    "ENTRAINER", "ENTRAINEMENT", "GELULE",

    // Nutrition et Compléments
    "PROTEINEE", // BARRE PROTEINEE
    "CREATININE",
    "PHOSPHATE",
    "CARBONE", // GLUCIDES
    "LIPIDES", // GRAISSES
    "GLUCIDES",
    "SANTÉ",
    "EQUILIBRE",
    "CERTIFIE", // Produit certifié
    "FLOCONS", // Flocons d'Avoine
    "CRANBERRY", // Arôme ou ingrédient
    "CACAHUETES", // Arôme ou ingrédient
    "VANILLE",
    "CHOCOLAT",
    "FRAISE",
    "BANANE",
    "AROME",
    "EDULCORANT",
    "BIOTIQUE", // Probiotique / Prébiotique
    "ENZYMES", // Enzymes digestives
    "DIGESTION",
    "ACIDE", // Acides Aminés
    "FLACON", // Contenant

    // Général, Qualité et Recherche
    "QUALITE",
    "PURETE",
    "TRACE", // Traçabilité
    "DIAGNOSTIC",
    "FORMULE",
    "VEGAN",
    "CERTIF", // Certifié
    "PROGRES", // Progression
    "BOOSTER",
    "ADAPTOGENE", // Plantes adaptogènes
    "HYDRATER", // Hydratation
    "RECUPERER", // Récupération
    "COMPLEXE",
    "SHODEN" // Ashwagandha Shoden
    ];

    const VALID_WORDS_SET = new Set(WORD_LIST);
    const MAX_TRIES = 6;

    let currentGuess = '';
    let currentRow = 0;
    let solution = '';
    let solutionLength = 0;
    let todayKey = '';
    let attempts = 0;

    const STORAGE_KEYS = {
        LAST_DATE: 'nm_word_game_last_date',
        HAS_WON_PREFIX: 'nm_word_game_has_won_'
    };

    // ----------------------------------------------------
    // 2. UTILITAIRES DATE / MOT DU JOUR
    // ----------------------------------------------------
    const getTodayKey = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getDailyWord = (dateKey) => {
        let hash = 0;
        for (let i = 0; i < dateKey.length; i++) {
            hash = (hash + dateKey.charCodeAt(i)) % WORD_LIST.length;
        }
        return WORD_LIST[hash].toUpperCase();
    };

    // ----------------------------------------------------
    // 3. SUPABASE : CLASSEMENT GLOBAL
    // ----------------------------------------------------
    async function renderWinners(dateKey) {
        let panel = document.getElementById('winners-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'winners-panel';
            panel.style.cssText = `
                margin-top: 6px;
                font-family: 'Gustavo', sans-serif;
                font-size: 0.8rem;
                text-align: center;
                opacity: 0.9;
            `;
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.appendChild(panel);
            } else {
                document.body.appendChild(panel);
            }
        }

        panel.innerHTML = `<strong>Gagnants du jour :</strong> Chargement...`;

        if (!SUPABASE_ANON_KEY) {
            panel.innerHTML = `<strong>Gagnants du jour :</strong> (clé Supabase manquante)`;
            return;
        }

        try {
            const url =
                `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}` +
                `?date=eq.${encodeURIComponent(dateKey)}&select=name,created_at&order=created_at.asc`;

            const res = await fetch(url, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!res.ok) throw new Error('Erreur Supabase select');
            const data = await res.json();

            if (!data || data.length === 0) {
                panel.innerHTML = `<strong>Gagnants du jour :</strong> Personne n'a encore gagné aujourd'hui. Soyez le premier !`;
                return;
            }

            const rowsHtml = data.map(row => {
                const dt = new Date(row.created_at);
                const hh = String(dt.getHours()).padStart(2, '0');
                const mm = String(dt.getMinutes()).padStart(2, '0');
                return `
                    <tr>
                        <td style="padding:4px 6px; border-bottom:1px solid #444;">${row.name}</td>
                        <td style="padding:4px 6px; border-bottom:1px solid #444;">${hh}h${mm}</td>
                    </tr>
                `;
            }).join('');

            panel.innerHTML = `
                <div style="margin-top:8px; text-align:left;">
                    <div style="margin-bottom:4px; font-weight:bold; text-align:center;">
                        Gagnants du jour
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                        <thead>
                            <tr>
                                <th style="text-align:left; border-bottom:1px solid #555; padding:4px 6px;">Joueur</th>
                                <th style="text-align:left; border-bottom:1px solid #555; padding:4px 6px;">Heure</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error(e);
            panel.innerHTML = `<strong>Gagnants du jour :</strong> Impossible de charger le classement.`;
        }
    }

    async function saveWinnerToSupabase(dateKey, playerName, attempts) {
        if (!SUPABASE_ANON_KEY) {
            console.warn('Supabase anon key manquante, gagnant non enregistré.');
            return null;
        }

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({ date: dateKey, name: playerName, attempts })
            });
            if (!res.ok) {
                console.error('Erreur Supabase insert', await res.text());
                return null;
            }
            const rows = await res.json();
            return rows[0] || null;
        } catch (e) {
            console.error('Erreur réseau Supabase insert', e);
            return null;
        }
    }

    async function getRankForWinner(dateKey, winnerId) {
        try {
            const url =
                `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}` +
                `?date=eq.${encodeURIComponent(dateKey)}&select=id,created_at&order=created_at.asc`;

            const res = await fetch(url, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!res.ok) throw new Error('Erreur Supabase select (rank)');
            const data = await res.json();

            const index = data.findIndex(row => row.id === winnerId);
            if (index === -1) return null;

            return index + 1;
        } catch (e) {
            console.error('Erreur calcul rang :', e);
            return null;
        }
    }

    // ----------------------------------------------------
    // 3bis. ÉCRAN DE FIN (victoire ou déjà joué) + FORMULAIRE NOM
    // ----------------------------------------------------
    async function showEndScreen(dateKey, mode, attemptsForWin = null) {
        const boardEl = document.getElementById('board');
        const keyboardEl = document.getElementById('keyboard-container');
        if (boardEl) boardEl.style.display = 'none';
        if (keyboardEl) keyboardEl.style.display = 'none';

        const played = document.getElementById('already-played');
        if (played) {
            played.style.display = 'flex';

            let textP = played.querySelector('p');
            if (!textP) {
                textP = document.createElement('p');
                textP.style.color = 'white';
                textP.style.fontSize = '1rem';
                textP.style.marginTop = '10px';
                textP.style.textAlign = 'center';
                played.appendChild(textP);
            }

            if (mode === 'win') {
                if (attemptsForWin != null) {
                    textP.textContent = `Bravo 🎉 Tu as trouvé le mot du jour en ${attemptsForWin} essai(s) !`;
                } else {
                    textP.textContent = "Bravo 🎉 Tu as trouvé le mot du jour !";
                }
            } else {
                textP.textContent = "Tu as déjà joué aujourd'hui 👀 Reviens demain pour un nouveau NutriTest.";
            }

            let existingForm = document.getElementById('winner-form');
            if (mode === 'win' && !existingForm) {
                const form = document.createElement('form');
                form.id = 'winner-form';
                form.style.marginTop = '10px';
                form.style.display = 'flex';
                form.style.gap = '6px';
                form.style.justifyContent = 'center';
                form.style.alignItems = 'center';
                form.style.flexWrap = 'wrap';

                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'winner-name-input';
                input.placeholder = 'Ton pseudo';
                input.maxLength = 40;
                input.style.padding = '6px 8px';
                input.style.borderRadius = '4px';
                input.style.border = '1px solid #555';
                input.style.fontSize = '0.9rem';

                const btn = document.createElement('button');
                btn.type = 'submit';
                btn.textContent = 'Valider';
                btn.style.padding = '6px 12px';
                btn.style.borderRadius = '4px';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';
                btn.style.backgroundColor = '#0093E5';
                btn.style.color = '#fff';
                btn.style.fontWeight = 'bold';
                btn.style.fontSize = '0.9rem';

                form.appendChild(input);
                form.appendChild(btn);
                played.appendChild(form);

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    let name = input.value.trim();
                    if (!name) {
                        input.focus();
                        return;
                    }

                    const row = await saveWinnerToSupabase(dateKey, name, attemptsForWin);

                    let rankText = '';
                    if (row && row.id) {
                        const rank = await getRankForWinner(dateKey, row.id);
                        if (rank != null) {
                            const suffix = (rank === 1) ? 'er' : 'e';
                            rankText = ` Tu es le ${rank}${suffix} à avoir trouvé le mot aujourd'hui.`;
                        }
                    }

                    if (attemptsForWin != null) {
                        textP.textContent =
                            `Bravo 🎉 Tu as trouvé le mot du jour en ${attemptsForWin} essai(s) !` +
                            (rankText || '');
                    } else {
                        textP.textContent = "Bravo 🎉 Tu as trouvé le mot du jour !" + (rankText || '');
                    }

                    form.remove();
                    await renderWinners(dateKey);
                });
            }
        }

        await renderWinners(dateKey);
    }

    // ----------------------------------------------------
    // 4. UI (messages, secousses, plateau, clavier)
    // ----------------------------------------------------
    const showMessage = (message, duration = 1500) => {
        const msgContainer = document.getElementById('message-container');
        if (!msgContainer) {
            console.error("L'élément #message-container est manquant.");
            return;
        }

        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
            background-color: #333; color: white; padding: 10px 20px;
            border-radius: 5px; z-index: 1000; font-family: sans-serif;
            opacity: 0; transition: opacity 0.3s;
            font-size: 0.9rem;
        `;
        msgContainer.appendChild(msgDiv);

        setTimeout(() => { msgDiv.style.opacity = '1'; }, 10);
        setTimeout(() => { msgDiv.style.opacity = '0'; }, duration);
        setTimeout(() => { msgContainer.removeChild(msgDiv); }, duration + 300);
    };

    const shakeRow = () => {
        const row = document.getElementById('board').querySelector(`.row:nth-child(${currentRow + 1})`);
        if (!row) return;

        row.classList.add('shake');
        row.addEventListener('animationend', () => {
            row.classList.remove('shake');
        }, { once: true });
    };

    const buildBoard = () => {
        const board = document.getElementById('board');
        board.innerHTML = '';

        for (let i = 0; i < MAX_TRIES; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            row.style.gridTemplateColumns = `repeat(${solutionLength}, 1fr)`;

            for (let j = 0; j < solutionLength; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('id', `tile-${i}-${j}`);

                const span = document.createElement('span');
                tile.appendChild(span);

                if (i === 0 && j === 0) {
                    span.textContent = solution[0];
                    tile.classList.add('fixed');
                }

                row.appendChild(tile);
            }
            board.appendChild(row);
        }
    };

    const buildKeyboard = () => {
        const keys = [
            'A','Z','E','R','T','Y','U','I','O','P',
            'Q','S','D','F','G','H','J','K','L','M',
            '⌫','W','X','C','V','B','N','ENTRER'
        ];
        const keyboardContainer = document.getElementById('keyboard-container');
        keyboardContainer.innerHTML = '';

        const rows = [
            keys.slice(0, 10),
            keys.slice(10, 20),
            keys.slice(20, 28)
        ];

        rows.forEach(rowKeys => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');

            rowKeys.forEach(keyText => {
                const key = document.createElement('div');
                key.classList.add('key');
                key.textContent = keyText;
                key.setAttribute('data-key', keyText);

                if (keyText === 'ENTRER' || keyText === '⌫') {
                    key.classList.add('large');
                }

                key.addEventListener('click', () => handleKeyInput(keyText));
                rowDiv.appendChild(key);
            });

            keyboardContainer.appendChild(rowDiv);
        });
    };

    const initGame = () => {
        const board = document.getElementById('board');
        if (board) board.innerHTML = '';

        todayKey = getTodayKey();
        solution = getDailyWord(todayKey);
        solutionLength = solution.length;
        attempts = 0;

        buildBoard();
        buildKeyboard();

        currentGuess = solution[0];
    };

    // ----------------------------------------------------
    // 5. LOGIQUE DU JEU
    // ----------------------------------------------------
    const updateBoard = () => {
        const row = document.getElementById('board').querySelector(`.row:nth-child(${currentRow + 1})`);
        if (!row) return;

        for (let i = 0; i < solutionLength; i++) {
            const tile = row.querySelector(`.tile:nth-child(${i + 1})`);
            const span = tile.querySelector('span');

            if (i === 0) continue;

            span.textContent = currentGuess[i] || '';

            if (!tile.classList.contains('fixed')) {
                tile.style.borderColor = currentGuess[i] ? 'var(--color-text)' : 'var(--color-tile-border)';
            }
        }
    };

    const handleKeyInput = (key) => {
        key = key.toUpperCase();

        if (key === 'ENTRER' || key === 'ENTER') {
            const guess = currentGuess.toUpperCase();

            if (guess.length !== solutionLength) {
                showMessage(`Le mot doit faire ${solutionLength} lettres !`);
                shakeRow();
                return;
            }

            if (!VALID_WORDS_SET.has(guess)) {
                showMessage(`Le mot "${guess}" n'existe pas selon Louan.`);
                shakeRow();
                return;
            }

            checkGuess();

        } else if (key === '⌫' || key === 'BACKSPACE') {
            if (currentGuess.length > 1) {
                currentGuess = currentGuess.slice(0, -1);
                updateBoard();
            }
        } else if (key.length === 1 && key.match(/[A-Z]/)) {
            if (currentGuess.length < solutionLength) {
                currentGuess += key;
                updateBoard();
            }
        }
    };

    const checkGuess = () => {
        attempts++;

        const guess = currentGuess;
        const solutionLetters = solution.split('');
        const guessLetters = guess.split('');

        const solutionMap = {};
        solutionLetters.forEach(letter => {
            solutionMap[letter] = (solutionMap[letter] || 0) + 1;
        });

        const tileClasses = new Array(solutionLength).fill('absent');

        // 1. Lettres bien placées
        for (let i = 0; i < solutionLength; i++) {
            if (guessLetters[i] === solutionLetters[i]) {
                tileClasses[i] = 'correct';
                solutionMap[guessLetters[i]]--;
            }
        }

        // 2. Lettres présentes mais mal placées
        for (let i = 0; i < solutionLength; i++) {
            if (tileClasses[i] === 'correct') continue;

            if (solutionMap[guessLetters[i]] > 0) {
                tileClasses[i] = 'present';
                solutionMap[guessLetters[i]]--;
            }
        }

        // 3. Application aux tuiles et touches
        for (let i = 0; i < solutionLength; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            const key = document.querySelector(`.key[data-key="${guessLetters[i]}"]`);

            tile.classList.add(tileClasses[i]);

            if (key) {
                if (tileClasses[i] === 'correct') {
                    key.classList.remove('absent', 'present');
                    key.classList.add('correct');
                } else if (tileClasses[i] === 'present' && !key.classList.contains('correct')) {
                    key.classList.remove('absent');
                    key.classList.add('present');
                } else if (tileClasses[i] === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                    key.classList.add('absent');
                }
            }
        }

        // 4. Fin de partie
        if (guess === solution) {
            showMessage('Bravo, tu fais partie des Nutri-Experts !', 1200);
            document.removeEventListener('keydown', handleKeydown);

            const today = getTodayKey();
            localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
            localStorage.setItem(STORAGE_KEYS.HAS_WON_PREFIX + today, 'true');

            showEndScreen(today, 'win', attempts);

        } else if (currentRow >= MAX_TRIES - 1) {
            showMessage(`Dommage ! Le mot était : ${solution}`, 3000);
            document.removeEventListener('keydown', handleKeydown);

            const today = getTodayKey();
            localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);

        } else {
            currentRow++;

            if (currentRow < MAX_TRIES) {
                const nextTile = document.getElementById(`tile-${currentRow}-0`);
                if (nextTile) {
                    const nextSpan = nextTile.querySelector('span');
                    nextSpan.textContent = solution[0];
                    nextTile.classList.add('fixed');
                }
            }

            currentGuess = solution[0];
            updateBoard();
        }
    };

    const handleKeydown = (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            handleKeyInput(e.key);
        }
    };

    // ----------------------------------------------------
    // 6. START GAME / LIMITATION JOURNALIÈRE
    // ----------------------------------------------------
    function startGame() {
        const startScreen = document.getElementById('start-screen');
        const gameContainer = document.getElementById('game-container');

        if (startScreen) startScreen.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';

        initGame();
        document.addEventListener('keydown', handleKeydown);
    }

    todayKey = getTodayKey();
    const lastDatePlayed = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
    const hasPlayedToday = lastDatePlayed === todayKey;

    if (hasPlayedToday) {
        const startScreen = document.getElementById('start-screen');
        const gameContainer = document.getElementById('game-container');
        if (startScreen) startScreen.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';

        showEndScreen(todayKey, 'already');
    } else {
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                startGame();
            });
        }
    }
});
