document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. MOTS-CLÉS DE NUTRIMUSCLE & BASE DE DONNÉES
    // ----------------------------------------------------
    const WORD_LIST = [
        // --- NUTRIMUSCLE & PRODUITS (AJOUTS ET ENRICHISSEMENT) ---
       // --- PROTÉINES & FORMULES SPÉCIFIQUES ---
    "WHEY",
    "ISOLAT",
    "CASEINE",
    "HYDROLYSAT",
    "PROTEINE",
    "NATIVE",
    "PROTIMUSCLE",
    "MUSCLEWHEY",
    "PURE MILK PROTEIN",
    "DIET PROTEIN",
    "EGG PROTEIN", // (Protéine d'œuf)
    "PEPTOPRO", // (Hydrolysat de Caséine)
    "DEEP RECOVERY",
    "NIGHT RECOVERY",
    "MUSCLEWHEGG",

    // --- ACIDES AMINÉS & PERFORMANCES ---
    "CREATINE",
    "CREAPURE", // Marque de Créatine
    "BCAA", // 2.1.2 et 4.1.1
    "GLUTAMINE",
    "CITRULLINE",
    "ARGININE",
    "BETA-ALANINE",
    "CARNOSYN", // Marque de Bêta-Alanine
    "GLYCINE",
    "TAURINE",
    "PREWORKOUT",
    "INTRA-WORKOUT",
    "PEPTIDE",

    // --- COLLAGÈNES & ARTICULATIONS ---
    "COLLAGENE",
    "PEPTAN", // Marque de Collagène
    "ARTIPRO",
    "MARIN", // Collagène Marin

    // --- NUTRITION & ÉNERGIE ---
    "MALTODEXTRINE",
    "DEXTROSE",
    "WAXY MAIZE",
    "CLUSTER DEXTRIN", // Glucide
    "CREME DE RIZ",
    "OATMEAL", // Flocons d'Avoine
    "PANCAKES",
    "BARRE",
    "MUESLI",
    "GAINER",
    "LEAN GAINER",
    "MUSCLEMASSE", // Hard Gainer
    "PATATE DOUCE", // Farine

    // --- VITAMINES, MINÉRAUX & SANTÉ ---
    "VITAMINE",
    "MINERAUX",
    "OMEGA",
    "MAGNESIUM",
    "ZINC",
    "FER",
    "ZMB", // Zinc-Magnésium-B6
    "QUALIC", // Marque Vitamine C
    "QUALID", // Marque Vitamine D3
    "EPAX", // Marque Oméga 3
    "ULTIMINE", // Marque de Minéraux
    "MULTIVITAMINES",

    // --- PLANTES & ACTIFS SPÉCIFIQUES ---
    "ASHWAGANDHA",
    "SHODEN", // Marque Ashwagandha
    "TRIBULUS",
    "CAFEINE",
    "GUARANA",
    "CURCUMINE",
    "CARNITINE",
    "CARNIPURE", // Marque Carnitine
    "FAT BURNER",
    "CHOLINE",
    "LACTIUM", // Complément Sommeil
    "DÉTOX",
    "BIO",

    // --- ACCESSOIRES & MARQUE ---
    "SHAKER",
    "NUTRIMUSCLE", "REBORN",
        // --- MUSCULATION : Mouvements & Exercices ---
        "POMPE", "SQUAT", "TRACTION", "FENTES", "DIPS", "CURLS", "PRESSE", 
        "ROWING", "DEVELOPPE", "GAINAGE", "EXTENSION", "FLEXION", "TIRAGE", "ELEVATION",
        "POULET", "ECHAUFFEMENT", "ETIREMENT", "REPETITION", "SERIE", "CHARGE", "INTENSITE",
        "HALTERE", "BARRE", "KETTLEBELL", "MACHINE", "BANCS", "TERRE", 
        "MILITAIRE", "MOLETS", "QUADRI", "ISCHIOS", "PEC", "DELTOIDE", "TRICEPS", 
        "BICEPS", "ABDOS", "TRAPEZES", "DORSEAUX", "LOMBAIRES",
    
        // --- MUSCULATION : Terminologie & Concepts ---
        "FORCE", "ENDURANCE", "VOLUME", "MASSE", "SECHE", "PRISE", "PERTE", 
        "RECUP", "RECUPERATION", "SURCHARGE", "PROGRESSION", "HYPERTROPHIE", 
        "CALORIES", "MACROS", "MICRO", "FIBRES", "METABOLISME", "ANABOLIQUE", 
        "CATABOLIQUE", "GYMNASE", "SALLE", "TRAINING", "ENTRAINEMENT", "DIETE", 
        "MACRONUTRIMENT", "REPOS", "PRISES", "CARDIO", "PHYSIQUE", "MORPHOLOGIE", 
        "ECTOMORPHE", "MESOMORPHE", "ENDOMORPHE", "PERFORMER", "PERFORMANCE", 
        "RESISTANCE", "HYDRATATION",
    
        // --- NUTRI' EXPERTS & GUNDILL ---
        "GUNDILL", "DELAVIER", "EXPERT", "AUTEUR", "LIVRE", "DOSSIER", "ANALYSE", 
        "CONSEIL", "SCIENCES", "RECHERCHE", "FORMATEUR", "CONFERENCE", "ARTICLE",
        "YOUTUBE", "CHAINE", "SPORT", "PRATIQUE", "THEORIE", "GUIDE", "REFERENCE",
        "METHODE", "PROGRAMME", "EXPERIENCE", "KNOWLEDGE", "BIOLOGIE", "PHYSIOLOGIE", 
        "BIOCHIMIE", "ALIMENTS", "CONNAISSANCE", "DEBATS"
    ];

    // CRÉATION D'UN SET POUR UNE VÉRIFICATION D'EXISTENCE RAPIDE
    const VALID_WORDS_SET = new Set(WORD_LIST); 

    // Paramètres du jeu
    const MAX_TRIES = 6;
    
    let currentGuess = '';
    let currentRow = 0;
    let solution = '';
    let solutionLength = 0;

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


    /** Choisit un mot aléatoire DANS LA LISTE. */
    const pickWord = () => {
        const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
        return WORD_LIST[randomIndex].toUpperCase();
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
        // (Le code du clavier reste inchangé)
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
        
        // S'assurer que le mot choisi est bien un mot de la liste
        solution = pickWord(); 
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

        // La boucle commence à 0, mais on ignore l'index 0 (première case)
        for (let i = 0; i < solutionLength; i++) {
            const tile = row.querySelector(`.tile:nth-child(${i + 1})`);
            const span = tile.querySelector('span'); 
            
            if (i === 0) continue; // On ignore la première case (elle est fixe)

            span.textContent = currentGuess[i] || ''; 
            
            // Met à jour la bordure uniquement si une lettre est tapée
            if (!tile.classList.contains('fixed')) {
                 tile.style.borderColor = currentGuess[i] ? 'var(--color-text)' : 'var(--color-tile-border)';
            }
        }
    };

    /** Gère l'entrée (clavier physique ou virtuel). */
    const handleKeyInput = (key) => {
        key = key.toUpperCase();
        
        // --- VÉRIFICATION DU MOT LORS DE L'APPUI SUR ENTRÉE ---
        if (key === 'ENTRER' || key === 'ENTER') {
            const guess = currentGuess.toUpperCase();
            
            // 1. Vérification de la longueur
            if (guess.length !== solutionLength) {
                showMessage(`Le mot doit faire ${solutionLength} lettres !`);
                shakeRow();
                return;
            }
            
            // 2. VÉRIFICATION DE L'EXISTENCE DANS LA BASE DE MOTS
            if (!VALID_WORDS_SET.has(guess)) {
                showMessage(`Le mot "${guess}" n'existe pas selon Louan.`);
                shakeRow();
                return; // Arrête le processus
            }

            // Si le mot est valide et a la bonne longueur :
            checkGuess();

        } else if (key === '⌫' || key === 'BACKSPACE') {
            if (currentGuess.length > 1) { // Empêche de supprimer la première lettre
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

    /** Vérifie le mot entré et applique les couleurs. (Inchangée) */
    const checkGuess = () => {
        const guess = currentGuess;
        const solutionLetters = solution.split('');
        const guessLetters = guess.split('');
        
        // 1. Initialisation de la carte des lettres (pour gérer les doublons)
        const solutionMap = {};
        solutionLetters.forEach(letter => {
            solutionMap[letter] = (solutionMap[letter] || 0) + 1;
        });
        
        // Tableau pour stocker les classes finales à appliquer 
        const tileClasses = new Array(solutionLength).fill('absent');

        // 2. Première passe : lettres CORRECTES (Bleu Vif)
        for (let i = 0; i < solutionLength; i++) {
            if (guessLetters[i] === solutionLetters[i]) {
                tileClasses[i] = 'correct';
                solutionMap[guessLetters[i]]--;
            }
        }

        // 3. Deuxième passe : lettres PRÉSENTES (Jaune d'Or) et ABSENTES (Gris Neutre)
        for (let i = 0; i < solutionLength; i++) {
            if (tileClasses[i] === 'correct') continue; 
            
            if (solutionMap[guessLetters[i]] > 0) {
                tileClasses[i] = 'present';
                solutionMap[guessLetters[i]]--;
            }
            // Sinon, tileClasses[i] reste 'absent'
        }

        // 4. Application des classes (Tuiles et Clavier)
        for (let i = 0; i < solutionLength; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            const key = document.querySelector(`.key[data-key="${guessLetters[i]}"]`);
            
            // Applique la classe à la tuile
            tile.classList.add(tileClasses[i]);
            
            // Met à jour la touche du clavier
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

        // 5. Logique de fin de partie
        if (guess === solution) {
            showMessage('Bravo, tu fais partie des Nutri-Experts !', 3000);
            document.removeEventListener('keydown', handleKeydown);
        } else if (currentRow >= MAX_TRIES - 1) {
            showMessage(`Dommage ! Le mot était : ${solution}`, 3000);
            document.removeEventListener('keydown', handleKeydown);
        } else {
            // Passe à l'essai suivant
            currentRow++;
            
            // Afficher la lettre fixe sur la nouvelle ligne
            if (currentRow < MAX_TRIES) {
                const nextTile = document.getElementById(`tile-${currentRow}-0`);
                if (nextTile) {
                    const nextSpan = nextTile.querySelector('span');
                    nextSpan.textContent = solution[0]; 
                    nextTile.classList.add('fixed');
                }
            }
            
            currentGuess = solution[0]; // Réinitialise l'essai avec la première lettre fixe
            updateBoard();
        }
    };

    /** Écoute le clavier physique. */
    const handleKeydown = (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) { 
            handleKeyInput(e.key);
        }
    };

    // Ajoute l'écouteur pour le clavier physique
    document.addEventListener('keydown', handleKeydown);

    // Lancement du jeu
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
