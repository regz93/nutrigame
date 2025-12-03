document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. MOTS-CLÉS DE NUTRIMUSCLE & BASE DE DONNÉES
    // ----------------------------------------------------
    const WORD_LIST = [
        "WHEY",
        "ISOLAT",
        "CASEINE",
        "PROTEINE",
        "NATIVE",
        "PEPTOPRO",
        "MUSCLEWHEGG",
        "CREATINE",
        "CREAPURE",
        "BCAA",
        "GLUTAMINE",
        "CITRULLINE",
        "ARGININE",
        "GLYCINE",
        "TAURINE",
        "PREWORKOUT",
        "PEPTIDE",
        "COLLAGENE",
        "PEPTAN",
        "ARTIPRO",
        "MARIN",
        "DEXTROSE",
        "PANCAKES",
        "BARRE",
        "MUESLI",
        "GAINER",
        "MUSCLEMASSE",
        "VITAMINE",
        "MINERAUX",
        "OMEGA",
        "MAGNESIUM",
        "ZINC",
        "FER",
        "ZMB",
        "QUALIC",
        "QUALID",
        "EPAX",
        "ULTIMINE",
        "TRIBULUS",
        "CAFEINE",
        "GUARANA",
        "CURCUMINE",
        "CARNITINE",
        "CARNIPURE",
        "CHOLINE",
        "LACTIUM",
        "DETOX",
        "BIO",
        "SHAKER",
        "NUTRIMUSCLE",
        "REBORN",
        "POMPE",
        "SQUAT",
        "TRACTION",
        "FENTES",
        "DIPS",
        "CURLS",
        "PRESSE",
        "ROWING",
        "GAINAGE",
        "EXTENSION",
        "FLEXION",
        "TIRAGE",
        "ELEVATION",
        "POULET",
        "REPETITION",
        "SERIE",
        "CHARGE",
        "INTENSITE",
        "HALTERE",
        "KETTLEBELL",
        "MACHINE",
        "BANCS",
        "TERRE",
        "MILITAIRE",
        "MOLETS",
        "QUADRI",
        "ISCHIOS",
        "PEC",
        "TRICEPS",
        "BICEPS",
        "ABDOS",
        "TRAPEZES",
        "DORSEAUX",
        "FORCE",
        "ENDURANCE",
        "VOLUME",
        "MASSE",
        "SECHE",
        "PRISE",
        "PERTE",
        "RECUP",
        "SURCHARGE",
        "PROGRESSION",
        "CALORIES",
        "MACROS",
        "MICRO",
        "FIBRES",
        "GYMNASE",
        "SALLE",
        "TRAINING",
        "DIETE",
        "REPOS",
        "PRISES",
        "CARDIO",
        "PHYSIQUE",
        "PERFORMER",
        "RESISTANCE",
        "GUNDILL",
        "DELAVIER",
        "EXPERT",
        "AUTEUR",
        "LIVRE",
        "DOSSIER",
        "ANALYSE",
        "CONSEIL",
        "SCIENCES",
        "RECHERCHE",
        "FORMATEUR",
        "ARTICLE",
        "YOUTUBE",
        "CHAINE",
        "SPORT",
        "PRATIQUE",
        "THEORIE",
        "GUIDE",
        "REFERENCE",
        "METHODE",
        "PROGRAMME",
        "EXPERIENCE",
        "KNOWLEDGE",
        "BIOLOGIE",
        "ALIMENTS"
    ];

    // CRÉATION D'UN SET POUR UNE VÉRIFICATION D'EXISTENCE RAPIDE
    const VALID_WORDS_SET = new Set(WORD_LIST); 

    // Paramètres du jeu
    const MAX_TRIES = 6;
    
    let currentGuess = '';
    let currentRow = 0;
    let solution = '';
    let solutionLength = 0;
    let todayKey = '';

    const STORAGE_KEYS = {
        LAST_DATE: 'nm_word_game_last_date',
        HAS_WON_PREFIX: 'nm_word_game_has_won_',
        WINNERS_PREFIX: 'nm_word_game_winners_'
    };

    // ----------------------------------------------------
    // 1bis. FONCTIONS JOURNALIÈRES (RESET À MINUIT)
    // ----------------------------------------------------

    /** Retourne la date du jour au format YYYY-MM-DD (timezone locale navigateur). */
    const getTodayKey = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * Mot du jour déterministe en fonction de la date.
     * Comme ça tout le monde a le même mot pour une date donnée,
     * sans stockage serveur.
     */
    const getDailyWord = (dateKey) => {
        let hash = 0;
        for (let i = 0; i < dateKey.length; i++) {
            hash = (hash + dateKey.charCodeAt(i)) % WORD_LIST.length;
        }
        return WORD_LIST[hash].toUpperCase();
    };

    /** Affiche / met à jour le panneau des gagnants du jour. */
    const renderWinners = (dateKey) => {
        let winners = [];
        const raw = localStorage.getItem(STORAGE_KEYS.WINNERS_PREFIX + dateKey);
        if (raw) {
            try {
                winners = JSON.parse(raw) || [];
            } catch (e) {
                console.error('Erreur parsing winners', e);
            }
        }

        let panel = document.getElementById('winners-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'winners-panel';
            panel.style.cssText = `
                margin-top: 16px;
                font-family: sans-serif;
                text-align: center;
                font-size: 14px;
            `;
            const board = document.getElementById('board');
            if (board && board.parentNode) {
                board.parentNode.insertBefore(panel, board.nextSibling);
            } else {
                document.body.appendChild(panel);
            }
        }

        if (!winners || winners.length === 0) {
            panel.innerHTML = `<strong>Gagnants du jour :</strong> Personne n'a encore gagné aujourd'hui. Soyez le premier !`;
        } else {
            panel.innerHTML = `<strong>Gagnants du jour :</strong> ${winners.join(', ')}`;
        }
    };

    // ----------------------------------------------------
    // 2. INITIALISATION ET UI
    // ----------------------------------------------------

    /** Affiche un message temporaire à l'utilisateur */
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
        `;
        msgContainer.appendChild(msgDiv);
        
        // Fading in
        setTimeout(() => { msgDiv.style.opacity = '1'; }, 10);
        
        // Fading out and removing
        setTimeout(() => { msgDiv.style.opacity = '0'; }, duration);
        setTimeout(() => { msgContainer.removeChild(msgDiv); }, duration + 300);
    };
    
    /** Ajoute une animation de secousse à la ligne actuelle. */
    const shakeRow = () => {
        const row = document.getElementById('board').querySelector(`.row:nth-child(${currentRow + 1})`);
        if (!row) return;

        row.classList.add('shake'); // 'shake' doit être défini dans votre CSS
        row.addEventListener('animationend', () => {
            row.classList.remove('shake');
        }, { once: true });
    };

    /** Construit la grille de jeu (HTML) en fonction de la longueur du mot. */
    const buildBoard = () => {
        const board = document.getElementById('board');
        board.innerHTML = ''; 

        for (let i = 0; i < MAX_TRIES; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            
            // Définit le nombre de colonnes CSS pour cette rangée
            row.style.gridTemplateColumns = `repeat(${solutionLength}, 1fr)`; 
            
            for (let j = 0; j < solutionLength; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('id', `tile-${i}-${j}`);
                
                // Le contenu de la case est mis dans un <span> pour le centrage CSS
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

    /** Construit le clavier virtuel (HTML). */
    const buildKeyboard = () => {
        const keys = [
            'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
            'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
            '⌫', 'W', 'X', 'C', 'V', 'B', 'N', 'ENTRER'
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

    /** Fonction de démarrage du jeu. */
    const initGame = () => {
        document.getElementById('board').innerHTML = '';
        
        // Mot du jour déterministe
        todayKey = getTodayKey();
        solution = getDailyWord(todayKey);
        solutionLength = solution.length; 
        
        buildBoard();
        buildKeyboard();
        
        // Initialise l'essai avec la première lettre fixe
        currentGuess = solution[0]; 
    };

    // ----------------------------------------------------
    // 3. LOGIQUE DU JEU
    // ----------------------------------------------------

    /** Met à jour la lettre sur le plateau. */
    const updateBoard = () => {
        const row = document.getElementById('board').querySelector(`.row:nth-child(${currentRow + 1})`);
        if (!row) return;

        for (let i = 0; i < solutionLength; i++) {
            const tile = row.querySelector(`.tile:nth-child(${i + 1})`);
            const span = tile.querySelector('span'); 
            
            if (i === 0) continue; // On ignore la première case (elle est fixe)

            span.textContent = currentGuess[i] || ''; 
            
            if (!tile.classList.contains('fixed')) {
                 tile.style.borderColor = currentGuess[i] ? 'var(--color-text)' : 'var(--color-tile-border)';
            }
        }
    };

    /** Gère l'entrée (clavier physique ou virtuel). */
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

    /** Vérifie le mot entré et applique les couleurs. */
    const checkGuess = () => {
        const guess = currentGuess;
        const solutionLetters = solution.split('');
        const guessLetters = guess.split('');
        
        const solutionMap = {};
        solutionLetters.forEach(letter => {
            solutionMap[letter] = (solutionMap[letter] || 0) + 1;
        });
        
        const tileClasses = new Array(solutionLength).fill('absent');

        for (let i = 0; i < solutionLength; i++) {
            if (guessLetters[i] === solutionLetters[i]) {
                tileClasses[i] = 'correct';
                solutionMap[guessLetters[i]]--;
            }
        }

        for (let i = 0; i < solutionLength; i++) {
            if (tileClasses[i] === 'correct') continue; 
            
            if (solutionMap[guessLetters[i]] > 0) {
                tileClasses[i] = 'present';
                solutionMap[guessLetters[i]]--;
            }
        }

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

        if (guess === solution) {
            showMessage('Bravo, tu fais partie des Nutri-Experts !', 3000);
            document.removeEventListener('keydown', handleKeydown);

            try {
                const today = getTodayKey();
                localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
                localStorage.setItem(STORAGE_KEYS.HAS_WON_PREFIX + today, 'true');

                let winners = [];
                const existing = localStorage.getItem(STORAGE_KEYS.WINNERS_PREFIX + today);
                if (existing) {
                    winners = JSON.parse(existing) || [];
                }

                let playerName = prompt("Entre ton prénom ou pseudo pour apparaître dans la liste des gagnants du jour :");
                if (playerName) {
                    playerName = playerName.trim();
                    if (playerName.length > 0) {
                        winners.push(playerName);
                        localStorage.setItem(
                            STORAGE_KEYS.WINNERS_PREFIX + today,
                            JSON.stringify(winners)
                        );
                    }
                }

                renderWinners(today);
            } catch (e) {
                console.error('Erreur localStorage', e);
            }

        } else if (currentRow >= MAX_TRIES - 1) {
            showMessage(`Dommage ! Le mot était : ${solution}`, 3000);
            document.removeEventListener('keydown', handleKeydown);

            try {
                const today = getTodayKey();
                localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
            } catch (e) {
                console.error('Erreur localStorage', e);
            }

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

    /** Écoute le clavier physique. */
    const handleKeydown = (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) { 
            handleKeyInput(e.key);
        }
    };

    // ----------------------------------------------------
    // 4. GESTION "UN MOT PAR JOUR"
    // ----------------------------------------------------
    todayKey = getTodayKey();

    // Toujours afficher les gagnants du jour
    renderWinners(todayKey);

    const lastDatePlayed = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
    const hasPlayedToday = lastDatePlayed === todayKey;
    const hasWonToday = localStorage.getItem(STORAGE_KEYS.HAS_WON_PREFIX + todayKey) === 'true';

    if (hasPlayedToday) {
        if (hasWonToday) {
            showMessage("Tu as déjà gagné aujourd'hui, reviens demain pour un nouveau mot !", 4000);
        } else {
            showMessage("Tu as déjà joué aujourd'hui, reviens demain pour un nouveau mot !", 4000);
        }
        // On ne lance pas le jeu, pas d'écouteur clavier
        return;
    }

    // Lancement normal du jeu si pas encore joué aujourd'hui
    document.addEventListener('keydown', handleKeydown);
    initGame();
});

// REMARQUE: N'oubliez pas d'ajouter l'animation CSS pour .shake, par exemple:
/*
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}
.shake {
  animation: shake 0.6s;
}
*/
