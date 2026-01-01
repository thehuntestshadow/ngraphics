/**
 * HEFAISTOS Internationalization Module
 * Lightweight i18n for key UI strings
 */

const LANGUAGES = [
    { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
    { code: 'ro', flag: '🇷🇴', name: 'Romanian', native: 'Română' },
    { code: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
    { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
    { code: 'it', flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
    { code: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
    { code: 'nl', flag: '🇳🇱', name: 'Dutch', native: 'Nederlands' },
    { code: 'pl', flag: '🇵🇱', name: 'Polish', native: 'Polski' },
    { code: 'cs', flag: '🇨🇿', name: 'Czech', native: 'Čeština' }
];

const translations = {
    en: {
        // Navigation & Header
        'nav.dashboard': 'Dashboard',
        'nav.settings': 'Settings',
        'nav.signOut': 'Sign Out',
        'nav.syncNow': 'Sync Now',

        // Common Buttons
        'btn.generate': 'Generate',
        'btn.download': 'Download',
        'btn.cancel': 'Cancel',
        'btn.save': 'Save',
        'btn.delete': 'Delete',
        'btn.clear': 'Clear',
        'btn.copy': 'Copy',
        'btn.upload': 'Upload',
        'btn.close': 'Close',
        'btn.confirm': 'Confirm',
        'btn.retry': 'Retry',

        // Status Messages
        'msg.generating': 'Generating...',
        'msg.generated': 'Generated successfully!',
        'msg.error': 'An error occurred',
        'msg.saved': 'Saved!',
        'msg.copied': 'Copied!',
        'msg.deleted': 'Deleted!',
        'msg.cleared': 'Cleared!',
        'msg.uploaded': 'Uploaded!',
        'msg.downloading': 'Downloading...',
        'msg.syncing': 'Syncing...',
        'msg.synced': 'Synced!',

        // Loading Phases
        'msg.preparing': 'Preparing...',
        'msg.connecting': 'Connecting to AI...',
        'msg.processing': 'Processing results...',
        'msg.durationShort': 'This may take 10-30 seconds',
        'msg.durationMedium': 'This may take 30-60 seconds',
        'msg.durationLong': 'This may take 1-2 minutes',

        // Empty States
        'msg.noHistory': 'No history yet',
        'msg.noFavorites': 'No favorites yet',
        'msg.noResults': 'No results found',
        'msg.uploadToStart': 'Upload an image to get started',

        // Settings Modal
        'settings.title': 'Settings',
        'settings.profile': 'Profile',
        'settings.apiKeys': 'API Keys',
        'settings.appearance': 'Appearance',
        'settings.language': 'Language',
        'settings.cloudSync': 'Cloud Sync',
        'settings.dangerZone': 'Danger Zone',
        'settings.interfaceLang': 'Interface Language',
        'settings.interfaceLangDesc': 'Controls buttons, labels, and menus',
        'settings.genLang': 'Generation Language',
        'settings.genLangDesc': 'Text in generated images and copy',
        'settings.saveProfile': 'Save Profile',
        'settings.theme': 'Theme',
        'settings.darkMode': 'Dark Mode',
        'settings.lightMode': 'Light Mode',

        // Common Labels
        'label.productPhoto': 'Product Photo',
        'label.features': 'Features',
        'label.advanced': 'Advanced Options',
        'label.history': 'History',
        'label.favorites': 'Favorites',
        'label.noHistory': 'No history yet',
        'label.noFavorites': 'No favorites yet',
        'label.variations': 'Variations',
        'label.aspectRatio': 'Aspect Ratio',
        'label.style': 'Style',
        'label.quality': 'Quality',

        // Errors
        'error.uploadImage': 'Please upload an image',
        'error.apiKey': 'API key required',
        'error.invalidFile': 'Invalid file type',
        'error.network': 'Network error',
        'error.timeout': 'Request timed out',
        'error.rateLimit': 'Rate limit exceeded',
        'error.generic': 'Something went wrong'
    },

    ro: {
        // Navigation & Header
        'nav.dashboard': 'Panou',
        'nav.settings': 'Setări',
        'nav.signOut': 'Deconectare',
        'nav.syncNow': 'Sincronizează',

        // Common Buttons
        'btn.generate': 'Generează',
        'btn.download': 'Descarcă',
        'btn.cancel': 'Anulează',
        'btn.save': 'Salvează',
        'btn.delete': 'Șterge',
        'btn.clear': 'Golește',
        'btn.copy': 'Copiază',
        'btn.upload': 'Încarcă',
        'btn.close': 'Închide',
        'btn.confirm': 'Confirmă',
        'btn.retry': 'Reîncearcă',

        // Status Messages
        'msg.generating': 'Se generează...',
        'msg.generated': 'Generat cu succes!',
        'msg.error': 'A apărut o eroare',
        'msg.saved': 'Salvat!',
        'msg.copied': 'Copiat!',
        'msg.deleted': 'Șters!',
        'msg.cleared': 'Golit!',
        'msg.uploaded': 'Încărcat!',
        'msg.downloading': 'Se descarcă...',
        'msg.syncing': 'Se sincronizează...',
        'msg.synced': 'Sincronizat!',

        // Loading Phases
        'msg.preparing': 'Se pregătește...',
        'msg.connecting': 'Se conectează la AI...',
        'msg.processing': 'Se procesează rezultatele...',
        'msg.durationShort': 'Poate dura 10-30 secunde',
        'msg.durationMedium': 'Poate dura 30-60 secunde',
        'msg.durationLong': 'Poate dura 1-2 minute',

        // Empty States
        'msg.noHistory': 'Niciun istoric',
        'msg.noFavorites': 'Niciun favorit',
        'msg.noResults': 'Niciun rezultat găsit',
        'msg.uploadToStart': 'Încarcă o imagine pentru a începe',

        // Settings Modal
        'settings.title': 'Setări',
        'settings.profile': 'Profil',
        'settings.apiKeys': 'Chei API',
        'settings.appearance': 'Aspect',
        'settings.language': 'Limbă',
        'settings.cloudSync': 'Sincronizare Cloud',
        'settings.dangerZone': 'Zona Periculoasă',
        'settings.interfaceLang': 'Limba Interfeței',
        'settings.interfaceLangDesc': 'Controlează butoanele, etichetele și meniurile',
        'settings.genLang': 'Limba Generării',
        'settings.genLangDesc': 'Textul din imaginile și conținutul generat',
        'settings.saveProfile': 'Salvează Profilul',
        'settings.theme': 'Temă',
        'settings.darkMode': 'Mod Întunecat',
        'settings.lightMode': 'Mod Luminos',

        // Common Labels
        'label.productPhoto': 'Fotografie Produs',
        'label.features': 'Caracteristici',
        'label.advanced': 'Opțiuni Avansate',
        'label.history': 'Istoric',
        'label.favorites': 'Favorite',
        'label.noHistory': 'Niciun istoric încă',
        'label.noFavorites': 'Niciun favorit încă',
        'label.variations': 'Variații',
        'label.aspectRatio': 'Raport Aspect',
        'label.style': 'Stil',
        'label.quality': 'Calitate',

        // Errors
        'error.uploadImage': 'Vă rugăm încărcați o imagine',
        'error.apiKey': 'Cheie API necesară',
        'error.invalidFile': 'Tip de fișier invalid',
        'error.network': 'Eroare de rețea',
        'error.timeout': 'Cererea a expirat',
        'error.rateLimit': 'Limită de cereri depășită',
        'error.generic': 'Ceva nu a mers bine'
    },

    de: {
        // Navigation & Header
        'nav.dashboard': 'Dashboard',
        'nav.settings': 'Einstellungen',
        'nav.signOut': 'Abmelden',
        'nav.syncNow': 'Jetzt synchronisieren',

        // Common Buttons
        'btn.generate': 'Generieren',
        'btn.download': 'Herunterladen',
        'btn.cancel': 'Abbrechen',
        'btn.save': 'Speichern',
        'btn.delete': 'Löschen',
        'btn.clear': 'Leeren',
        'btn.copy': 'Kopieren',
        'btn.upload': 'Hochladen',
        'btn.close': 'Schließen',
        'btn.confirm': 'Bestätigen',
        'btn.retry': 'Wiederholen',

        // Status Messages
        'msg.generating': 'Wird generiert...',
        'msg.generated': 'Erfolgreich generiert!',
        'msg.error': 'Ein Fehler ist aufgetreten',
        'msg.saved': 'Gespeichert!',
        'msg.copied': 'Kopiert!',
        'msg.deleted': 'Gelöscht!',
        'msg.cleared': 'Geleert!',
        'msg.uploaded': 'Hochgeladen!',
        'msg.downloading': 'Wird heruntergeladen...',
        'msg.syncing': 'Wird synchronisiert...',
        'msg.synced': 'Synchronisiert!',

        // Loading Phases
        'msg.preparing': 'Wird vorbereitet...',
        'msg.connecting': 'Verbindung zu AI...',
        'msg.processing': 'Ergebnisse werden verarbeitet...',
        'msg.durationShort': 'Dies kann 10-30 Sekunden dauern',
        'msg.durationMedium': 'Dies kann 30-60 Sekunden dauern',
        'msg.durationLong': 'Dies kann 1-2 Minuten dauern',

        // Empty States
        'msg.noHistory': 'Noch kein Verlauf',
        'msg.noFavorites': 'Noch keine Favoriten',
        'msg.noResults': 'Keine Ergebnisse gefunden',
        'msg.uploadToStart': 'Laden Sie ein Bild hoch, um zu beginnen',

        // Settings Modal
        'settings.title': 'Einstellungen',
        'settings.profile': 'Profil',
        'settings.apiKeys': 'API-Schlüssel',
        'settings.appearance': 'Erscheinungsbild',
        'settings.language': 'Sprache',
        'settings.cloudSync': 'Cloud-Synchronisierung',
        'settings.dangerZone': 'Gefahrenzone',
        'settings.interfaceLang': 'Oberflächensprache',
        'settings.interfaceLangDesc': 'Steuert Schaltflächen, Beschriftungen und Menüs',
        'settings.genLang': 'Generierungssprache',
        'settings.genLangDesc': 'Text in generierten Bildern und Texten',
        'settings.saveProfile': 'Profil speichern',
        'settings.theme': 'Design',
        'settings.darkMode': 'Dunkelmodus',
        'settings.lightMode': 'Hellmodus',

        // Common Labels
        'label.productPhoto': 'Produktfoto',
        'label.features': 'Funktionen',
        'label.advanced': 'Erweiterte Optionen',
        'label.history': 'Verlauf',
        'label.favorites': 'Favoriten',
        'label.noHistory': 'Noch kein Verlauf',
        'label.noFavorites': 'Noch keine Favoriten',
        'label.variations': 'Variationen',
        'label.aspectRatio': 'Seitenverhältnis',
        'label.style': 'Stil',
        'label.quality': 'Qualität',

        // Errors
        'error.uploadImage': 'Bitte laden Sie ein Bild hoch',
        'error.apiKey': 'API-Schlüssel erforderlich',
        'error.invalidFile': 'Ungültiger Dateityp',
        'error.network': 'Netzwerkfehler',
        'error.timeout': 'Zeitüberschreitung',
        'error.rateLimit': 'Ratenlimit überschritten',
        'error.generic': 'Etwas ist schiefgegangen'
    },

    fr: {
        // Navigation & Header
        'nav.dashboard': 'Tableau de bord',
        'nav.settings': 'Paramètres',
        'nav.signOut': 'Déconnexion',
        'nav.syncNow': 'Synchroniser',

        // Common Buttons
        'btn.generate': 'Générer',
        'btn.download': 'Télécharger',
        'btn.cancel': 'Annuler',
        'btn.save': 'Enregistrer',
        'btn.delete': 'Supprimer',
        'btn.clear': 'Effacer',
        'btn.copy': 'Copier',
        'btn.upload': 'Téléverser',
        'btn.close': 'Fermer',
        'btn.confirm': 'Confirmer',
        'btn.retry': 'Réessayer',

        // Status Messages
        'msg.generating': 'Génération en cours...',
        'msg.generated': 'Généré avec succès !',
        'msg.error': 'Une erreur est survenue',
        'msg.saved': 'Enregistré !',
        'msg.copied': 'Copié !',
        'msg.deleted': 'Supprimé !',
        'msg.cleared': 'Effacé !',
        'msg.uploaded': 'Téléversé !',
        'msg.downloading': 'Téléchargement...',
        'msg.syncing': 'Synchronisation...',
        'msg.synced': 'Synchronisé !',

        // Loading Phases
        'msg.preparing': 'Préparation...',
        'msg.connecting': 'Connexion à l\'IA...',
        'msg.processing': 'Traitement des résultats...',
        'msg.durationShort': 'Cela peut prendre 10-30 secondes',
        'msg.durationMedium': 'Cela peut prendre 30-60 secondes',
        'msg.durationLong': 'Cela peut prendre 1-2 minutes',

        // Empty States
        'msg.noHistory': 'Pas encore d\'historique',
        'msg.noFavorites': 'Pas encore de favoris',
        'msg.noResults': 'Aucun résultat trouvé',
        'msg.uploadToStart': 'Téléversez une image pour commencer',

        // Settings Modal
        'settings.title': 'Paramètres',
        'settings.profile': 'Profil',
        'settings.apiKeys': 'Clés API',
        'settings.appearance': 'Apparence',
        'settings.language': 'Langue',
        'settings.cloudSync': 'Synchronisation Cloud',
        'settings.dangerZone': 'Zone Dangereuse',
        'settings.interfaceLang': 'Langue de l\'interface',
        'settings.interfaceLangDesc': 'Contrôle les boutons, libellés et menus',
        'settings.genLang': 'Langue de génération',
        'settings.genLangDesc': 'Texte dans les images et contenus générés',
        'settings.saveProfile': 'Enregistrer le profil',
        'settings.theme': 'Thème',
        'settings.darkMode': 'Mode sombre',
        'settings.lightMode': 'Mode clair',

        // Common Labels
        'label.productPhoto': 'Photo du produit',
        'label.features': 'Fonctionnalités',
        'label.advanced': 'Options avancées',
        'label.history': 'Historique',
        'label.favorites': 'Favoris',
        'label.noHistory': 'Aucun historique',
        'label.noFavorites': 'Aucun favori',
        'label.variations': 'Variations',
        'label.aspectRatio': 'Format d\'image',
        'label.style': 'Style',
        'label.quality': 'Qualité',

        // Errors
        'error.uploadImage': 'Veuillez téléverser une image',
        'error.apiKey': 'Clé API requise',
        'error.invalidFile': 'Type de fichier invalide',
        'error.network': 'Erreur réseau',
        'error.timeout': 'Délai d\'attente dépassé',
        'error.rateLimit': 'Limite de requêtes dépassée',
        'error.generic': 'Une erreur s\'est produite'
    },

    es: {
        // Navigation & Header
        'nav.dashboard': 'Panel',
        'nav.settings': 'Configuración',
        'nav.signOut': 'Cerrar sesión',
        'nav.syncNow': 'Sincronizar ahora',

        // Common Buttons
        'btn.generate': 'Generar',
        'btn.download': 'Descargar',
        'btn.cancel': 'Cancelar',
        'btn.save': 'Guardar',
        'btn.delete': 'Eliminar',
        'btn.clear': 'Limpiar',
        'btn.copy': 'Copiar',
        'btn.upload': 'Subir',
        'btn.close': 'Cerrar',
        'btn.confirm': 'Confirmar',
        'btn.retry': 'Reintentar',

        // Status Messages
        'msg.generating': 'Generando...',
        'msg.generated': '¡Generado con éxito!',
        'msg.error': 'Ha ocurrido un error',
        'msg.saved': '¡Guardado!',
        'msg.copied': '¡Copiado!',
        'msg.deleted': '¡Eliminado!',
        'msg.cleared': '¡Limpiado!',
        'msg.uploaded': '¡Subido!',
        'msg.downloading': 'Descargando...',
        'msg.syncing': 'Sincronizando...',
        'msg.synced': '¡Sincronizado!',

        // Loading Phases
        'msg.preparing': 'Preparando...',
        'msg.connecting': 'Conectando con la IA...',
        'msg.processing': 'Procesando resultados...',
        'msg.durationShort': 'Esto puede tardar 10-30 segundos',
        'msg.durationMedium': 'Esto puede tardar 30-60 segundos',
        'msg.durationLong': 'Esto puede tardar 1-2 minutos',

        // Empty States
        'msg.noHistory': 'Sin historial aún',
        'msg.noFavorites': 'Sin favoritos aún',
        'msg.noResults': 'No se encontraron resultados',
        'msg.uploadToStart': 'Sube una imagen para comenzar',

        // Settings Modal
        'settings.title': 'Configuración',
        'settings.profile': 'Perfil',
        'settings.apiKeys': 'Claves API',
        'settings.appearance': 'Apariencia',
        'settings.language': 'Idioma',
        'settings.cloudSync': 'Sincronización en la nube',
        'settings.dangerZone': 'Zona peligrosa',
        'settings.interfaceLang': 'Idioma de la interfaz',
        'settings.interfaceLangDesc': 'Controla botones, etiquetas y menús',
        'settings.genLang': 'Idioma de generación',
        'settings.genLangDesc': 'Texto en imágenes y contenido generado',
        'settings.saveProfile': 'Guardar perfil',
        'settings.theme': 'Tema',
        'settings.darkMode': 'Modo oscuro',
        'settings.lightMode': 'Modo claro',

        // Common Labels
        'label.productPhoto': 'Foto del producto',
        'label.features': 'Características',
        'label.advanced': 'Opciones avanzadas',
        'label.history': 'Historial',
        'label.favorites': 'Favoritos',
        'label.noHistory': 'Sin historial aún',
        'label.noFavorites': 'Sin favoritos aún',
        'label.variations': 'Variaciones',
        'label.aspectRatio': 'Relación de aspecto',
        'label.style': 'Estilo',
        'label.quality': 'Calidad',

        // Errors
        'error.uploadImage': 'Por favor suba una imagen',
        'error.apiKey': 'Se requiere clave API',
        'error.invalidFile': 'Tipo de archivo inválido',
        'error.network': 'Error de red',
        'error.timeout': 'Tiempo de espera agotado',
        'error.rateLimit': 'Límite de solicitudes excedido',
        'error.generic': 'Algo salió mal'
    },

    it: {
        // Navigation & Header
        'nav.dashboard': 'Pannello',
        'nav.settings': 'Impostazioni',
        'nav.signOut': 'Esci',
        'nav.syncNow': 'Sincronizza ora',

        // Common Buttons
        'btn.generate': 'Genera',
        'btn.download': 'Scarica',
        'btn.cancel': 'Annulla',
        'btn.save': 'Salva',
        'btn.delete': 'Elimina',
        'btn.clear': 'Cancella',
        'btn.copy': 'Copia',
        'btn.upload': 'Carica',
        'btn.close': 'Chiudi',
        'btn.confirm': 'Conferma',
        'btn.retry': 'Riprova',

        // Status Messages
        'msg.generating': 'Generazione in corso...',
        'msg.generated': 'Generato con successo!',
        'msg.error': 'Si è verificato un errore',
        'msg.saved': 'Salvato!',
        'msg.copied': 'Copiato!',
        'msg.deleted': 'Eliminato!',
        'msg.cleared': 'Cancellato!',
        'msg.uploaded': 'Caricato!',
        'msg.downloading': 'Download in corso...',
        'msg.syncing': 'Sincronizzazione...',
        'msg.synced': 'Sincronizzato!',

        // Loading Phases
        'msg.preparing': 'Preparazione...',
        'msg.connecting': 'Connessione all\'IA...',
        'msg.processing': 'Elaborazione risultati...',
        'msg.durationShort': 'Potrebbe richiedere 10-30 secondi',
        'msg.durationMedium': 'Potrebbe richiedere 30-60 secondi',
        'msg.durationLong': 'Potrebbe richiedere 1-2 minuti',

        // Empty States
        'msg.noHistory': 'Nessuna cronologia',
        'msg.noFavorites': 'Nessun preferito',
        'msg.noResults': 'Nessun risultato trovato',
        'msg.uploadToStart': 'Carica un\'immagine per iniziare',

        // Settings Modal
        'settings.title': 'Impostazioni',
        'settings.profile': 'Profilo',
        'settings.apiKeys': 'Chiavi API',
        'settings.appearance': 'Aspetto',
        'settings.language': 'Lingua',
        'settings.cloudSync': 'Sincronizzazione Cloud',
        'settings.dangerZone': 'Zona Pericolosa',
        'settings.interfaceLang': 'Lingua dell\'interfaccia',
        'settings.interfaceLangDesc': 'Controlla pulsanti, etichette e menu',
        'settings.genLang': 'Lingua di generazione',
        'settings.genLangDesc': 'Testo nelle immagini e contenuti generati',
        'settings.saveProfile': 'Salva profilo',
        'settings.theme': 'Tema',
        'settings.darkMode': 'Modalità scura',
        'settings.lightMode': 'Modalità chiara',

        // Common Labels
        'label.productPhoto': 'Foto prodotto',
        'label.features': 'Funzionalità',
        'label.advanced': 'Opzioni avanzate',
        'label.history': 'Cronologia',
        'label.favorites': 'Preferiti',
        'label.noHistory': 'Nessuna cronologia',
        'label.noFavorites': 'Nessun preferito',
        'label.variations': 'Variazioni',
        'label.aspectRatio': 'Proporzioni',
        'label.style': 'Stile',
        'label.quality': 'Qualità',

        // Errors
        'error.uploadImage': 'Carica un\'immagine',
        'error.apiKey': 'Chiave API richiesta',
        'error.invalidFile': 'Tipo di file non valido',
        'error.network': 'Errore di rete',
        'error.timeout': 'Timeout della richiesta',
        'error.rateLimit': 'Limite di richieste superato',
        'error.generic': 'Qualcosa è andato storto'
    },

    pt: {
        // Navigation & Header
        'nav.dashboard': 'Painel',
        'nav.settings': 'Configurações',
        'nav.signOut': 'Sair',
        'nav.syncNow': 'Sincronizar agora',

        // Common Buttons
        'btn.generate': 'Gerar',
        'btn.download': 'Baixar',
        'btn.cancel': 'Cancelar',
        'btn.save': 'Salvar',
        'btn.delete': 'Excluir',
        'btn.clear': 'Limpar',
        'btn.copy': 'Copiar',
        'btn.upload': 'Enviar',
        'btn.close': 'Fechar',
        'btn.confirm': 'Confirmar',
        'btn.retry': 'Tentar novamente',

        // Status Messages
        'msg.generating': 'Gerando...',
        'msg.generated': 'Gerado com sucesso!',
        'msg.error': 'Ocorreu um erro',
        'msg.saved': 'Salvo!',
        'msg.copied': 'Copiado!',
        'msg.deleted': 'Excluído!',
        'msg.cleared': 'Limpo!',
        'msg.uploaded': 'Enviado!',
        'msg.downloading': 'Baixando...',
        'msg.syncing': 'Sincronizando...',
        'msg.synced': 'Sincronizado!',

        // Loading Phases
        'msg.preparing': 'Preparando...',
        'msg.connecting': 'Conectando à IA...',
        'msg.processing': 'Processando resultados...',
        'msg.durationShort': 'Pode levar 10-30 segundos',
        'msg.durationMedium': 'Pode levar 30-60 segundos',
        'msg.durationLong': 'Pode levar 1-2 minutos',

        // Empty States
        'msg.noHistory': 'Nenhum histórico ainda',
        'msg.noFavorites': 'Nenhum favorito ainda',
        'msg.noResults': 'Nenhum resultado encontrado',
        'msg.uploadToStart': 'Carregue uma imagem para começar',

        // Settings Modal
        'settings.title': 'Configurações',
        'settings.profile': 'Perfil',
        'settings.apiKeys': 'Chaves API',
        'settings.appearance': 'Aparência',
        'settings.language': 'Idioma',
        'settings.cloudSync': 'Sincronização na Nuvem',
        'settings.dangerZone': 'Zona de Perigo',
        'settings.interfaceLang': 'Idioma da Interface',
        'settings.interfaceLangDesc': 'Controla botões, rótulos e menus',
        'settings.genLang': 'Idioma de Geração',
        'settings.genLangDesc': 'Texto em imagens e conteúdo gerado',
        'settings.saveProfile': 'Salvar Perfil',
        'settings.theme': 'Tema',
        'settings.darkMode': 'Modo Escuro',
        'settings.lightMode': 'Modo Claro',

        // Common Labels
        'label.productPhoto': 'Foto do Produto',
        'label.features': 'Recursos',
        'label.advanced': 'Opções Avançadas',
        'label.history': 'Histórico',
        'label.favorites': 'Favoritos',
        'label.noHistory': 'Sem histórico ainda',
        'label.noFavorites': 'Sem favoritos ainda',
        'label.variations': 'Variações',
        'label.aspectRatio': 'Proporção',
        'label.style': 'Estilo',
        'label.quality': 'Qualidade',

        // Errors
        'error.uploadImage': 'Por favor, envie uma imagem',
        'error.apiKey': 'Chave API necessária',
        'error.invalidFile': 'Tipo de arquivo inválido',
        'error.network': 'Erro de rede',
        'error.timeout': 'Tempo limite excedido',
        'error.rateLimit': 'Limite de requisições excedido',
        'error.generic': 'Algo deu errado'
    },

    nl: {
        // Navigation & Header
        'nav.dashboard': 'Dashboard',
        'nav.settings': 'Instellingen',
        'nav.signOut': 'Uitloggen',
        'nav.syncNow': 'Nu synchroniseren',

        // Common Buttons
        'btn.generate': 'Genereren',
        'btn.download': 'Downloaden',
        'btn.cancel': 'Annuleren',
        'btn.save': 'Opslaan',
        'btn.delete': 'Verwijderen',
        'btn.clear': 'Wissen',
        'btn.copy': 'Kopiëren',
        'btn.upload': 'Uploaden',
        'btn.close': 'Sluiten',
        'btn.confirm': 'Bevestigen',
        'btn.retry': 'Opnieuw proberen',

        // Status Messages
        'msg.generating': 'Genereren...',
        'msg.generated': 'Succesvol gegenereerd!',
        'msg.error': 'Er is een fout opgetreden',
        'msg.saved': 'Opgeslagen!',
        'msg.copied': 'Gekopieerd!',
        'msg.deleted': 'Verwijderd!',
        'msg.cleared': 'Gewist!',
        'msg.uploaded': 'Geüpload!',
        'msg.downloading': 'Downloaden...',
        'msg.syncing': 'Synchroniseren...',
        'msg.synced': 'Gesynchroniseerd!',

        // Loading Phases
        'msg.preparing': 'Voorbereiden...',
        'msg.connecting': 'Verbinden met AI...',
        'msg.processing': 'Resultaten verwerken...',
        'msg.durationShort': 'Dit kan 10-30 seconden duren',
        'msg.durationMedium': 'Dit kan 30-60 seconden duren',
        'msg.durationLong': 'Dit kan 1-2 minuten duren',

        // Empty States
        'msg.noHistory': 'Nog geen geschiedenis',
        'msg.noFavorites': 'Nog geen favorieten',
        'msg.noResults': 'Geen resultaten gevonden',
        'msg.uploadToStart': 'Upload een afbeelding om te beginnen',

        // Settings Modal
        'settings.title': 'Instellingen',
        'settings.profile': 'Profiel',
        'settings.apiKeys': 'API-sleutels',
        'settings.appearance': 'Uiterlijk',
        'settings.language': 'Taal',
        'settings.cloudSync': 'Cloud Synchronisatie',
        'settings.dangerZone': 'Gevarenzone',
        'settings.interfaceLang': 'Interfacetaal',
        'settings.interfaceLangDesc': 'Regelt knoppen, labels en menu\'s',
        'settings.genLang': 'Generatietaal',
        'settings.genLangDesc': 'Tekst in gegenereerde afbeeldingen en content',
        'settings.saveProfile': 'Profiel opslaan',
        'settings.theme': 'Thema',
        'settings.darkMode': 'Donkere modus',
        'settings.lightMode': 'Lichte modus',

        // Common Labels
        'label.productPhoto': 'Productfoto',
        'label.features': 'Functies',
        'label.advanced': 'Geavanceerde opties',
        'label.history': 'Geschiedenis',
        'label.favorites': 'Favorieten',
        'label.noHistory': 'Nog geen geschiedenis',
        'label.noFavorites': 'Nog geen favorieten',
        'label.variations': 'Variaties',
        'label.aspectRatio': 'Beeldverhouding',
        'label.style': 'Stijl',
        'label.quality': 'Kwaliteit',

        // Errors
        'error.uploadImage': 'Upload een afbeelding',
        'error.apiKey': 'API-sleutel vereist',
        'error.invalidFile': 'Ongeldig bestandstype',
        'error.network': 'Netwerkfout',
        'error.timeout': 'Time-out van verzoek',
        'error.rateLimit': 'Limiet overschreden',
        'error.generic': 'Er ging iets mis'
    },

    pl: {
        // Navigation & Header
        'nav.dashboard': 'Panel',
        'nav.settings': 'Ustawienia',
        'nav.signOut': 'Wyloguj',
        'nav.syncNow': 'Synchronizuj teraz',

        // Common Buttons
        'btn.generate': 'Generuj',
        'btn.download': 'Pobierz',
        'btn.cancel': 'Anuluj',
        'btn.save': 'Zapisz',
        'btn.delete': 'Usuń',
        'btn.clear': 'Wyczyść',
        'btn.copy': 'Kopiuj',
        'btn.upload': 'Prześlij',
        'btn.close': 'Zamknij',
        'btn.confirm': 'Potwierdź',
        'btn.retry': 'Ponów',

        // Status Messages
        'msg.generating': 'Generowanie...',
        'msg.generated': 'Wygenerowano pomyślnie!',
        'msg.error': 'Wystąpił błąd',
        'msg.saved': 'Zapisano!',
        'msg.copied': 'Skopiowano!',
        'msg.deleted': 'Usunięto!',
        'msg.cleared': 'Wyczyszczono!',
        'msg.uploaded': 'Przesłano!',
        'msg.downloading': 'Pobieranie...',
        'msg.syncing': 'Synchronizacja...',
        'msg.synced': 'Zsynchronizowano!',

        // Loading Phases
        'msg.preparing': 'Przygotowywanie...',
        'msg.connecting': 'Łączenie z AI...',
        'msg.processing': 'Przetwarzanie wyników...',
        'msg.durationShort': 'To może potrwać 10-30 sekund',
        'msg.durationMedium': 'To może potrwać 30-60 sekund',
        'msg.durationLong': 'To może potrwać 1-2 minuty',

        // Empty States
        'msg.noHistory': 'Brak historii',
        'msg.noFavorites': 'Brak ulubionych',
        'msg.noResults': 'Nie znaleziono wyników',
        'msg.uploadToStart': 'Prześlij obraz, aby rozpocząć',

        // Settings Modal
        'settings.title': 'Ustawienia',
        'settings.profile': 'Profil',
        'settings.apiKeys': 'Klucze API',
        'settings.appearance': 'Wygląd',
        'settings.language': 'Język',
        'settings.cloudSync': 'Synchronizacja w chmurze',
        'settings.dangerZone': 'Strefa zagrożenia',
        'settings.interfaceLang': 'Język interfejsu',
        'settings.interfaceLangDesc': 'Steruje przyciskami, etykietami i menu',
        'settings.genLang': 'Język generowania',
        'settings.genLangDesc': 'Tekst w generowanych obrazach i treściach',
        'settings.saveProfile': 'Zapisz profil',
        'settings.theme': 'Motyw',
        'settings.darkMode': 'Tryb ciemny',
        'settings.lightMode': 'Tryb jasny',

        // Common Labels
        'label.productPhoto': 'Zdjęcie produktu',
        'label.features': 'Funkcje',
        'label.advanced': 'Opcje zaawansowane',
        'label.history': 'Historia',
        'label.favorites': 'Ulubione',
        'label.noHistory': 'Brak historii',
        'label.noFavorites': 'Brak ulubionych',
        'label.variations': 'Warianty',
        'label.aspectRatio': 'Proporcje',
        'label.style': 'Styl',
        'label.quality': 'Jakość',

        // Errors
        'error.uploadImage': 'Prześlij obraz',
        'error.apiKey': 'Wymagany klucz API',
        'error.invalidFile': 'Nieprawidłowy typ pliku',
        'error.network': 'Błąd sieci',
        'error.timeout': 'Przekroczono limit czasu',
        'error.rateLimit': 'Przekroczono limit żądań',
        'error.generic': 'Coś poszło nie tak'
    },

    cs: {
        // Navigation & Header
        'nav.dashboard': 'Přehled',
        'nav.settings': 'Nastavení',
        'nav.signOut': 'Odhlásit se',
        'nav.syncNow': 'Synchronizovat',

        // Common Buttons
        'btn.generate': 'Generovat',
        'btn.download': 'Stáhnout',
        'btn.cancel': 'Zrušit',
        'btn.save': 'Uložit',
        'btn.delete': 'Smazat',
        'btn.clear': 'Vymazat',
        'btn.copy': 'Kopírovat',
        'btn.upload': 'Nahrát',
        'btn.close': 'Zavřít',
        'btn.confirm': 'Potvrdit',
        'btn.retry': 'Zkusit znovu',

        // Status Messages
        'msg.generating': 'Generování...',
        'msg.generated': 'Úspěšně vygenerováno!',
        'msg.error': 'Došlo k chybě',
        'msg.saved': 'Uloženo!',
        'msg.copied': 'Zkopírováno!',
        'msg.deleted': 'Smazáno!',
        'msg.cleared': 'Vymazáno!',
        'msg.uploaded': 'Nahráno!',
        'msg.downloading': 'Stahování...',
        'msg.syncing': 'Synchronizace...',
        'msg.synced': 'Synchronizováno!',

        // Loading Phases
        'msg.preparing': 'Příprava...',
        'msg.connecting': 'Připojování k AI...',
        'msg.processing': 'Zpracování výsledků...',
        'msg.durationShort': 'Může to trvat 10-30 sekund',
        'msg.durationMedium': 'Může to trvat 30-60 sekund',
        'msg.durationLong': 'Může to trvat 1-2 minuty',

        // Empty States
        'msg.noHistory': 'Zatím žádná historie',
        'msg.noFavorites': 'Zatím žádné oblíbené',
        'msg.noResults': 'Nenalezeny žádné výsledky',
        'msg.uploadToStart': 'Nahrajte obrázek pro začátek',

        // Settings Modal
        'settings.title': 'Nastavení',
        'settings.profile': 'Profil',
        'settings.apiKeys': 'API klíče',
        'settings.appearance': 'Vzhled',
        'settings.language': 'Jazyk',
        'settings.cloudSync': 'Cloudová synchronizace',
        'settings.dangerZone': 'Nebezpečná zóna',
        'settings.interfaceLang': 'Jazyk rozhraní',
        'settings.interfaceLangDesc': 'Ovládá tlačítka, štítky a nabídky',
        'settings.genLang': 'Jazyk generování',
        'settings.genLangDesc': 'Text v generovaných obrázcích a obsahu',
        'settings.saveProfile': 'Uložit profil',
        'settings.theme': 'Motiv',
        'settings.darkMode': 'Tmavý režim',
        'settings.lightMode': 'Světlý režim',

        // Common Labels
        'label.productPhoto': 'Fotografie produktu',
        'label.features': 'Funkce',
        'label.advanced': 'Pokročilé možnosti',
        'label.history': 'Historie',
        'label.favorites': 'Oblíbené',
        'label.noHistory': 'Žádná historie',
        'label.noFavorites': 'Žádné oblíbené',
        'label.variations': 'Varianty',
        'label.aspectRatio': 'Poměr stran',
        'label.style': 'Styl',
        'label.quality': 'Kvalita',

        // Errors
        'error.uploadImage': 'Nahrajte obrázek',
        'error.apiKey': 'Vyžadován API klíč',
        'error.invalidFile': 'Neplatný typ souboru',
        'error.network': 'Chyba sítě',
        'error.timeout': 'Časový limit vypršel',
        'error.rateLimit': 'Překročen limit požadavků',
        'error.generic': 'Něco se pokazilo'
    }
};

// Generation language instructions for AI prompts
const GENERATION_LANG_INSTRUCTIONS = {
    en: 'English',
    ro: 'Romanian (use proper diacritics: ă, â, î, ș, ț)',
    de: 'German (use proper umlauts: ä, ö, ü, ß)',
    fr: 'French (use proper accents: é, è, ê, ç, à, ù)',
    es: 'Spanish (use proper accents: á, é, í, ó, ú, ñ, ¿, ¡)',
    it: 'Italian (use proper accents: à, è, é, ì, ò, ù)',
    pt: 'Portuguese (use proper accents: ã, õ, á, é, í, ó, ú, ç)',
    nl: 'Dutch',
    pl: 'Polish (use proper diacritics: ą, ć, ę, ł, ń, ó, ś, ź, ż)',
    cs: 'Czech (use proper diacritics: á, č, ď, é, ě, í, ň, ó, ř, š, ť, ú, ů, ý, ž)'
};

/**
 * i18n - Internationalization module
 */
const i18n = {
    _uiLang: 'en',
    _genLang: 'en',
    _initialized: false,

    /**
     * Initialize i18n from localStorage
     */
    init() {
        if (this._initialized) return;
        this._uiLang = localStorage.getItem('ngraphics_ui_language') || 'en';
        this._genLang = localStorage.getItem('ngraphics_gen_language') || 'en';
        this._initialized = true;

        // Initial UI update
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._updateUI());
        } else {
            this._updateUI();
        }
    },

    /**
     * Translate a key to current UI language
     * @param {string} key - Translation key
     * @param {string} [fallback] - Fallback text if key not found
     * @returns {string} Translated text
     */
    t(key, fallback) {
        return translations[this._uiLang]?.[key]
            || translations.en[key]
            || fallback
            || key;
    },

    /**
     * Get current UI language code
     * @returns {string} Language code (e.g., 'en', 'ro')
     */
    getUILanguage() {
        return this._uiLang;
    },

    /**
     * Set UI language
     * @param {string} lang - Language code
     */
    setUILanguage(lang) {
        if (!translations[lang]) {
            console.warn(`i18n: Unknown language "${lang}", falling back to English`);
            lang = 'en';
        }
        this._uiLang = lang;
        localStorage.setItem('ngraphics_ui_language', lang);
        this._updateUI();

        // Emit event for components that need manual update
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, type: 'ui' } }));
    },

    /**
     * Get current generation language code
     * @returns {string} Language code
     */
    getGenerationLanguage() {
        return this._genLang;
    },

    /**
     * Set generation language
     * @param {string} lang - Language code
     */
    setGenerationLanguage(lang) {
        if (!GENERATION_LANG_INSTRUCTIONS[lang]) {
            console.warn(`i18n: Unknown generation language "${lang}", falling back to English`);
            lang = 'en';
        }
        this._genLang = lang;
        localStorage.setItem('ngraphics_gen_language', lang);

        // Emit event
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, type: 'generation' } }));
    },

    /**
     * Get language prompt instruction for AI generation
     * @returns {string} Language instruction for prompt
     */
    getGenerationPrompt() {
        if (this._genLang === 'en') return ''; // No instruction needed for English
        const instruction = GENERATION_LANG_INSTRUCTIONS[this._genLang];
        return `\n\nLANGUAGE: All text in the image must be in ${instruction}. Do not use English.\n`;
    },

    /**
     * Get all supported languages
     * @returns {Array} Array of language objects
     */
    getLanguages() {
        return LANGUAGES;
    },

    /**
     * Get language info by code
     * @param {string} code - Language code
     * @returns {Object|null} Language object or null
     */
    getLanguageInfo(code) {
        return LANGUAGES.find(l => l.code === code) || null;
    },

    /**
     * Update all elements with data-i18n attribute
     * @private
     */
    _updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translated = this.t(key);

            // Handle different element types
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translated;
            } else if (el.dataset.i18nAttr) {
                // For attributes like title, aria-label
                el.setAttribute(el.dataset.i18nAttr, translated);
            } else {
                el.textContent = translated;
            }
        });
    }
};

// Auto-initialize when script loads
i18n.init();

// Export for use in other modules
window.i18n = i18n;
window.LANGUAGES = LANGUAGES;
