// Charger les données du JSON
let allPokemons = [];
let filteredPokemons = [];
let currentPokemonIndex = 0;
let currentSortOrder = '';

// Récupérer les éléments du DOM
let pokemonGrid;
let searchInput;
let searchBtn;
let familleFilter;
let ratingFilter;
let sortFilter;
let resetFiltersBtn;
let viewPokedexBtn;
let pokedexModal;
let closePokedex;
let prevBtn;
let nextBtn;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments du DOM
    pokemonGrid = document.getElementById('pokemonGrid');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    familleFilter = document.getElementById('familleFilter');
    ratingFilter = document.getElementById('ratingFilter');
    sortFilter = document.getElementById('sortFilter');
    resetFiltersBtn = document.getElementById('resetFilters');
    viewPokedexBtn = document.getElementById('viewPokedexBtn');
    pokedexModal = document.getElementById('pokedexModal');
    closePokedex = document.getElementById('closePokedex');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');

    // Charger les données du JSON
    fetch('animaux.json')
        .then(response => response.json())
        .then(data => {
            allPokemons = data;
            filteredPokemons = Object.values(allPokemons);
            renderPokemons(filteredPokemons);
            initializeFilters();
            attachEventListeners();
        })
        .catch(error => console.error('Erreur de chargement:', error));
});

// Fonction pour créer les étoiles
function createStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<span class="star ${i <= rating ? '' : 'empty'}">★</span>`;
    }
    return starsHTML;
}

// Fonction pour générer le chemin de la photo
function getImagePath(key) {
    return `photos/${key}.jpg`;
}

// Initialiser les filtres avec les familles uniques
function initializeFilters() {
    const families = [...new Set(Object.values(allPokemons).map(p => p.Famille))];
    families.forEach(family => {
        const option = document.createElement('option');
        option.value = family;
        option.textContent = family;
        familleFilter.appendChild(option);
    });
    updateSpeciesCount();
}
// Fonction pour appliquer les filtres
function applyFilters() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedFamily = familleFilter.value;
    const selectedRating = ratingFilter.value;

    filteredPokemons = Object.values(allPokemons).filter(pokemon => {
        const matchesSearch = 
            pokemon.Nom.toLowerCase().includes(searchQuery) ||
            pokemon.Famille.toLowerCase().includes(searchQuery) ||
            pokemon.Régime_alimentaire.toLowerCase().includes(searchQuery);
        
        const matchesFamily = !selectedFamily || pokemon.Famille === selectedFamily;
        const matchesRating = !selectedRating || pokemon.Rating == selectedRating;

        return matchesSearch && matchesFamily && matchesRating;
    });

    // Appliquer le tri
    applySorting();
    renderPokemons(filteredPokemons);
    updateSpeciesCount();
}

// Fonction pour mettre à jour le compteur d'espèces
function updateSpeciesCount() {
    const speciesCountElement = document.getElementById('speciesCount');
    speciesCountElement.textContent = Object.keys(allPokemons).length;
}

// Fonction pour appliquer le tri
function applySorting() {
    const sortBy = sortFilter.value;
    currentSortOrder = sortBy;

    if (!sortBy) return;

    filteredPokemons.sort((a, b) => {
        switch(sortBy) {
            case 'nom-asc':
                return a.Nom.localeCompare(b.Nom, 'fr');
            case 'nom-desc':
                return b.Nom.localeCompare(a.Nom, 'fr');
            case 'rating-asc':
                return a.Rating - b.Rating;
            case 'rating-desc':
                return b.Rating - a.Rating;
            case 'difficulte-asc':
                return a.Difficulte - b.Difficulte;
            case 'difficulte-desc':
                return b.Difficulte - a.Difficulte;
            case 'lieu':
                return a.Photo.localeCompare(b.Photo, 'fr');
            default:
                return 0;
        }
    });
}

// Fonction pour afficher les cartes Pokémon
function renderPokemons(pokemons) {
    pokemonGrid.innerHTML = '';
    
    if (pokemons.length === 0) {
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.5em;">Aucun Pokémon trouvé</div>';
        return;
    }
    
    pokemons.forEach((pokemon, index) => {
        const key = Object.keys(allPokemons).find(k => allPokemons[k] === pokemon);
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        
        const imagePath = getImagePath(key);
        const starsHTML = createStars(pokemon.Rating);
        
        card.innerHTML = `
            <div class="card-image-container ${!pokemon.Photo ? 'no-image' : ''}">
                <img src="${imagePath}" alt="${pokemon.Nom}" onerror="this.style.display='none'">
                ${!pokemon.Photo ? '<div style="color: white;">Photo indisponible</div>' : ''}
            </div>
            <h2 class="card-name">${pokemon.Nom}</h2>
            <div class="card-meta">
                <span class="card-famille">${pokemon.Famille}</span>
            </div>
            <div class="card-rating">
                ${starsHTML}
            </div>
            <div class="card-difficulty">
                <div class="difficulty-label">
                    <span>Difficulté</span>
                    <span>${pokemon.Difficulte}/100</span>
                </div>
                <div class="difficulty-bar-container">
                    <div class="difficulty-bar" style="width: ${pokemon.Difficulte}%"></div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openPokedex(pokemon, key));
        pokemonGrid.appendChild(card);
    });
}

// Fonction pour ouvrir le Pokédex
function openPokedex(pokemon, key) {
    currentPokemonIndex = filteredPokemons.findIndex(p => {
        const k = Object.keys(allPokemons).find(key => allPokemons[key] === p);
        const currentKey = Object.keys(allPokemons).find(key => allPokemons[key] === pokemon);
        return k === currentKey;
    });
    
    displayPokedexPokemon(pokemon, key);
    pokedexModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Afficher un Pokémon dans le Pokédex
function displayPokedexPokemon(pokemon, key) {
    const imagePath = getImagePath(key);
    const starsHTML = createStars(pokemon.Rating);
    const index = Object.keys(allPokemons).indexOf(key) + 1;
    
    document.getElementById('pokedexImage').src = imagePath;
    document.getElementById('pokedexImage').alt = pokemon.Nom;
    document.getElementById('pokedexLocation').textContent = pokemon.Photo;
    document.getElementById('pokedexNumber').textContent = `#${String(index).padStart(3, '0')}`;
    document.getElementById('pokedexName').textContent = pokemon.Nom;
    document.getElementById('pokedexFamille').textContent = pokemon.Famille;
    document.getElementById('pokedexRegime').textContent = pokemon.Régime_alimentaire;
    document.getElementById('pokedexTaille').textContent = pokemon.Taille;
    document.getElementById('pokedexPoids').textContent = pokemon.Poids;
    document.getElementById('pokedexDescription').textContent = pokemon.Description;
    document.getElementById('pokedexRating').innerHTML = starsHTML;
    document.getElementById('pokedexDifficulty').style.width = pokemon.Difficulte + '%';
    document.getElementById('pokedexDifficultyValue').textContent = `${pokemon.Difficulte}/100`;
}

// Naviguer dans le Pokédex
function goToPrevious() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        const pokemon = filteredPokemons[currentPokemonIndex];
        const key = Object.keys(allPokemons).find(k => allPokemons[k] === pokemon);
        displayPokedexPokemon(pokemon, key);
    }
}

function goToNext() {
    if (currentPokemonIndex < filteredPokemons.length - 1) {
        currentPokemonIndex++;
        const pokemon = filteredPokemons[currentPokemonIndex];
        const key = Object.keys(allPokemons).find(k => allPokemons[k] === pokemon);
        displayPokedexPokemon(pokemon, key);
    }
}

// Fonction pour fermer le Pokédex
function closePokedexModal() {
    pokedexModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Fonction pour attacher les écouteurs d'événements
function attachEventListeners() {
    closePokedex.addEventListener('click', closePokedexModal);
    prevBtn.addEventListener('click', goToPrevious);
    nextBtn.addEventListener('click', goToNext);
    viewPokedexBtn.addEventListener('click', () => {
        if (filteredPokemons.length > 0) {
            const pokemon = filteredPokemons[0];
            const key = Object.keys(allPokemons).find(k => allPokemons[k] === pokemon);
            openPokedex(pokemon, key);
        }
    });

    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (!pokedexModal.classList.contains('active')) return;
        
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        } else if (e.key === 'Escape') {
            closePokedexModal();
        }
    });

    // Fermer avec clique sur le fond
    pokedexModal.addEventListener('click', (e) => {
        if (e.target === pokedexModal) {
            closePokedexModal();
        }
    });

    // Recherche
    searchBtn.addEventListener('click', applyFilters);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    searchInput.addEventListener('input', applyFilters);

    // Filtres
    familleFilter.addEventListener('change', applyFilters);
    ratingFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);

    // Réinitialiser les filtres
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        familleFilter.value = '';
        ratingFilter.value = '';
        sortFilter.value = '';
        filteredPokemons = Object.values(allPokemons);
        currentSortOrder = '';
        renderPokemons(filteredPokemons);
    });
}
