/**
 * CHRONOPATH NAVIGATOR — CORE CONTROLLER & LEAFLET MAP ENGINE
 * High-Fidelity Prototype for Pune, India
 * 
 * Features:
 * - Google-Maps-Style Leaflet interactive maps with CARTO Voyager tiles & offline SVG fallbacks
 * - Real Pune coordinates (Shaniwar Wada, Lakdi Pul, Pataleshwar, etc.)
 * - Custom category-colored teardrop pins & blue pulsing GPS dot with accuracy ring
 * - Route polylines with duration bubble markers & tap-to-select
 * - Draggable bottom sheets with 3 snap points (peek, half, full)
 * - Turn-by-turn banner, ETA dock, and proximity story alerts in Live Navigation
 * - Functional Map/List dual toggle in Discover
 * - Time travel era selector & Then/Now interactive split slider
 * - AI Smart Trip Planner with animated multi-step progress & reorderable stops
 * - Dedicated Saved Diary tab with segmented collections
 * - External Annotation Margin Rail (badges never cover UI content)
 * - Synchronized Living History Layer controls
 */

// =============================================================================
// 1. UX ANNOTATIONS KNOWLEDGE BASE (19 Evaluative Callouts)
// =============================================================================
const UX_ANNOTATIONS = {
  1: {
    screen: "landing",
    title: "Value Proposition & Brand Clarity",
    heuristic: "Nielsen #1: Visibility of System Status & #8: Minimalist Design",
    painPoint: "Awareness Phase: Traveler is unsure if the app offers unique cultural narratives or generic A-to-B GPS directions.",
    rationale: "Positioned a high-contrast hero card with a clear, memorable USP ('The road is not just distance. It is a living story.') paired with atmospheric Pune heritage photography. Immediately communicates the storytelling value."
  },
  2: {
    screen: "landing",
    title: "Rapid 3-Step Guided Onboarding",
    heuristic: "Nielsen #8: Aesthetic & Minimalist Design",
    painPoint: "Awareness Phase: Long onboarding flows cause drop-offs before users realize value.",
    rationale: "Engineered an in-situ 3-step onboarding capsule (Set Vibe ➔ Choose Route ➔ Wander) completed in under 30 seconds. Avoids upfront sign-in walls, lowering cognitive friction."
  },
  3: {
    screen: "landing",
    title: "1-Tap Ready Routes for First-Time Users",
    heuristic: "Nielsen #7: Flexibility & Efficiency of Use",
    painPoint: "Awareness Phase: First-time users feel overwhelmed by deep customization forms.",
    rationale: "Surfaced 3 ready-to-walk 1-tap trips right on the landing page: Top 3 Highlights (2h), Legendary Food Crawl (1.5h), and Rock-Cut Monolith (1h)."
  },
  4: {
    screen: "preferences",
    title: "Traveler Group Personas",
    heuristic: "Nielsen #2: Match Between System & Real World",
    painPoint: "Consideration Phase: Recommendations often fail real-world needs (e.g. steep steps for families with strollers or generic spots for friends).",
    rationale: "Designed 4 distinct group cards (Solo, Couple, Friends, Family with Kids). Each modifies the route recommendation engine's pacing, rest intervals, and venue types."
  },
  5: {
    screen: "preferences",
    title: "Constrained Bounded Time Slider",
    heuristic: "Nielsen #5: Error Prevention",
    painPoint: "Decision Phase: Users plan unrealistic itineraries that result in missed transit or exhaustion.",
    rationale: "Replaced free-text time inputs with a bounded slider (1h - 10h) with marked milestones (Quick, Half-Day, Grand), preventing time estimation errors."
  },
  6: {
    screen: "preferences",
    title: "Living History Layer Master Toggle",
    heuristic: "Nielsen #3: User Control & Freedom",
    painPoint: "Delivery / Use Phase: Travelers may want deep historical immersion on some trips, but pure efficient navigation on others.",
    rationale: "History Layer is ON by default to fulfill the core product proposition, but travelers have unambiguous freedom to switch it OFF for lightweight navigation."
  },
  7: {
    screen: "routes",
    title: "Google-Maps-Style Map & Duration Bubbles",
    heuristic: "Nielsen #2: Match Between System & Real World",
    painPoint: "Decision Phase: Abstract route cards fail to convey actual city geography and street topography.",
    rationale: "Integrated an interactive Leaflet map featuring real Pune street tiles, polyline casings, and duration bubbles ('26 min', '34 min') that can be tapped directly to select."
  },
  8: {
    screen: "routes",
    title: "Draggable Bottom Sheet with 3 Snap Points",
    heuristic: "Nielsen #7: Flexibility & Ergonomics",
    painPoint: "Decision Phase: On mobile screens, switching between map view and route details causes jarring view shifts.",
    rationale: "Mobile bottom sheet snaps to Peek (78px), Half (330px), and Full screen, letting the user balance map visibility with card information density."
  },
  9: {
    screen: "routes",
    title: "Side-by-Side 5-Dimension Route Comparison",
    heuristic: "Nielsen #6: Recognition Rather Than Recall",
    painPoint: "Decision Phase: Hard to judge differences between 4 routes without memorizing stats.",
    rationale: "Provided a dedicated Comparison Modal evaluating duration, distance, story density, food tastings, and traffic stress side-by-side."
  },
  10: {
    screen: "discover",
    title: "Map / List Dual View Flexibility",
    heuristic: "Nielsen #7: Flexibility and Efficiency of Use",
    painPoint: "Consideration Phase: Travelers with different mental models prefer either spatial maps or linear list browsing.",
    rationale: "Equipped Discover with a 1-tap Map/List switcher that re-renders pins dynamically with interactive popover place cards."
  },
  11: {
    screen: "discover",
    title: "Inline 'Why This Fits You' Tags",
    heuristic: "Nielsen #6: Recognition Over Recall",
    painPoint: "Consideration Phase: Generic tourist recommendations lack relevance context.",
    rationale: "Compact inline tag explains exactly why an attraction fits the user's specific persona, time window, and interests without cluttering the card."
  },
  12: {
    screen: "food",
    title: "Cultural Food Heritage & Origins",
    heuristic: "Nielsen #2: Match Between System and Real World",
    painPoint: "Delivery Phase: Food is treated as just restaurant ratings rather than cultural tradition.",
    rationale: "Food Explorer cards explain mill-worker origins of Puneri Misal, the cultural debating rituals, and regional kat variations with 1-tap 'Add to Route'."
  },
  13: {
    screen: "place",
    title: "Time Travel Era Selector (Multimodal History)",
    heuristic: "Nielsen #2: Match Between System & Real World",
    painPoint: "Delivery Phase: Historical monuments appear as passive ruins without context of their past grandeur.",
    rationale: "Allows travelers to shift between 750 CE, 1732 CE, 1818 CE, and 2026 CE to inspect how Shaniwar Wada evolved across dynasties."
  },
  14: {
    screen: "place",
    title: "Interactive Then vs Now Split Image Slider",
    heuristic: "Nielsen #2: Match Real World & Educational Immersion",
    painPoint: "Delivery Phase: Hard to imagine 7-storey wooden palace when looking at flat stone foundations.",
    rationale: "Interactive draggable split handle peels back 1780 CE architectural reconstruction against 2026 CE modern ruins photograph with real touch/mouse tracking."
  },
  15: {
    screen: "place",
    title: "Audio Guide Scrubber & Speed Controls",
    heuristic: "Nielsen #7: Flexibility & Efficiency",
    painPoint: "Delivery Phase: Static text boards are tedious to read while walking in sunny weather.",
    rationale: "Integrated audio player with animated waveform, variable playback speed (1.0x/1.25x/1.5x), 15s skip buttons, and an accessible written transcript."
  },
  16: {
    screen: "planner",
    title: "Natural Language AI Itinerary Architect",
    heuristic: "Nielsen #3: User Freedom & #7: Flexibility",
    painPoint: "Decision Phase: Rigid form-based trip planners require 10 fields; travelers think in conversational sentences.",
    rationale: "Users type a casual sentence (e.g. '4 hours, veg food, photo spots') and receive a reorderable, timed schedule with transit pacing."
  },
  17: {
    screen: "planner",
    title: "Visibility of AI Generation Status",
    heuristic: "Nielsen #1: Visibility of System Status",
    painPoint: "Decision Phase: Silent loaders make users think the AI service has frozen.",
    rationale: "Progress stepper visibly tracks status through Parsing Intent ➔ Checking Open Hours ➔ Pacing Transit."
  },
  18: {
    screen: "navigation",
    title: "Live Maneuver Banner & Proximity Story Popup",
    heuristic: "Nielsen #1: Status & #3: User Control",
    painPoint: "Delivery Phase: Information overload while actively walking through unfamiliar streets.",
    rationale: "Google-Maps-style dark maneuver header paired with a contextual story alert card that pops up as the user approaches Lakdi Pul bridge."
  },
  19: {
    screen: "rewards",
    title: "Post-Experience Rewards & Saved Travel Diary",
    heuristic: "Nielsen #10: Help & Closure",
    painPoint: "Post-Experience: Lack of reflection, memory capture, or incentive to explore further.",
    rationale: "Summarizes completed trail with stats, 1-tap rating, unlockable badges (Peshwa Chronicler), and a dedicated Saved Diary tab."
  },
  20: {
    screen: "auth",
    title: "Frictionless Authentication & Freedom",
    heuristic: "Nielsen #3: User Freedom & #7: Flexibility",
    painPoint: "Onboarding Phase: Mandatory registration walls cause high abandonment before value discovery.",
    rationale: "Engineered dual Sign In / Create Account with 1-tap Google/Apple social OAuth, a prominent 'Continue as Guest (No Login Required)' option, and persistent multilingual support (EN, Marathi, Hindi) for cultural inclusivity."
  }
};

// =============================================================================
// MULTILINGUAL I18N DATA (English, Marathi मराठी, Hindi हिंदी)
// =============================================================================
const I18N_DATA = {
  en: {
    hero_badge: "✨ TRAVEL WITH LIVING STORIES",
    hero_title: "The road is not just distance. It is a living story.",
    hero_desc: "Discover 300-year Peshwa heritage, secret wadas, and iconic street food along your exact route — with zero advance planning.",
    quickstart_title: "First Time in Pune? 1-Tap Ready Routes",
    quickstart_sub: "No complicated forms needed. Tap any vibe to start immediately:",
    search_ph: "Search any place or craving (e.g. Shaniwar Wada, Misal...)",
    chip_all: "All Explorations",
    chip_heritage: "🏛️ Peshwa Heritage",
    chip_food: "🍲 Street Food Trails",
    chip_nature: "🌿 Tekdi Greenery",
    chip_wadas: "🏰 Old Peth Wadas",
    cta_heading: "Want a customized plan for your hours?",
    cta_subtext: "Tell us your hours and budget — we'll calculate the route.",
    btn_personalize: "Personalize",
    auth_tagline: "Your personal heritage storytelling & exploration companion",
    tab_signin: "Sign In",
    tab_signup: "Create Account",
    login_google: "Continue with Google",
    login_apple: "Continue with Apple",
    or_with_email: "or continue with email",
    label_name: "Full Name",
    ph_name: "e.g. Tanvi Joshi",
    label_email: "Email Address",
    ph_email: "you@example.com",
    label_pass: "Password",
    forgot_pass: "Forgot?",
    pref_lang: "Preferred Language",
    remember_me: "Remember me",
    btn_signin: "Sign In to Chronopath",
    btn_signup: "Create Free Account",
    guest_desc: "✨ Want to explore immediately without an account?",
    btn_guest: "Continue as Guest (No Login Required) ➔",
    stat_routes: "Routes Taken",
    stat_stories: "Stories Heard",
    stat_badges: "Badges",
    setting_pref: "Travel & Interest Preferences",
    setting_pref_desc: "History Layer, Solo/Group, Budget",
    setting_lang: "App Language",
    setting_badges: "Badges & Saved Places",
    setting_badges_desc: "View visited wadas & food spots",
    setting_rationale: "UX Evaluation & Course Rationale",
    setting_rationale_desc: "Nielsen Norman heuristics matrix",
    btn_logout: "Sign Out of Account",
    nav_home: "Home",
    nav_routes: "Routes",
    nav_discover: "Discover",
    nav_food: "Food",
    nav_planner: "Planner",
    nav_account: "Account",
    exploring_city: "EXPLORING CITY",
    pune_city: "Pune, Maharashtra",
    lang_switched: "Language switched to English",
    sign_in_welcome: "Welcome back, {name}!",
    sign_up_welcome: "Account created! Welcome to Chronopath, {name}.",
    social_login_msg: "Logged in securely with {provider}.",
    guest_login_msg: "Continuing as Guest! All maps & routes are unlocked.",
    sign_out_msg: "Signed out successfully."
  },
  mr: {
    hero_badge: "✨ जिवंत ऐतिहासिक कथांसह प्रवास",
    hero_title: "रस्ता म्हणजे केवळ अंतर नाही, ती एक जिवंत कथा आहे.",
    hero_desc: "कोणत्याही पूर्वतयारीशिवाय तुमच्या प्रवासादरम्यान ३०० वर्षांचा पेशवे वारसा, गुप्त वाडे आणि प्रसिद्ध खाद्यसंस्कृती अनुभवा.",
    quickstart_title: "पुण्यात पहिल्यांदाच? १-टॅप तयार मार्ग",
    quickstart_sub: "कोणतेही किचकट फॉर्म नाही. लगेच सुरू करण्यासाठी कोणताही पर्याय निवडा:",
    search_ph: "ठिकाण किंवा खाद्यपदार्थ शोधा (उदा. शनिवार वाडा, मिसळ...)",
    chip_all: "सर्व भ्रमंती",
    chip_heritage: "🏛️ पेशवे वारसा",
    chip_food: "🍲 खाद्य भ्रमंती",
    chip_nature: "🌿 टेकडी निसर्ग",
    chip_wadas: "🏰 पेठांमधील जुने वाडे",
    cta_heading: "तुमच्या वेळेनुसार सानुकूल नियोजन हवे आहे?",
    cta_subtext: "तुमचा वेळ आणि बजेट सांगा — आम्ही मार्ग तयार करू.",
    btn_personalize: "सानुकूल करा",
    auth_tagline: "तुमचा वैयक्तिक ऐतिहासिक वारसा आणि भ्रमंती मार्गदर्शक",
    tab_signin: "साइन इन",
    tab_signup: "नवीन खाते",
    login_google: "गुगलने पुढे जा",
    login_apple: "Apple ने पुढे जा",
    or_with_email: "किंवा ईमेलने सुरू ठेवा",
    label_name: "पूर्ण नाव",
    ph_name: "उदा. तन्वी जोशी",
    label_email: "ईमेल पत्ता",
    ph_email: "you@example.com",
    label_pass: "पासवर्ड",
    forgot_pass: "विसरलात?",
    pref_lang: "पसंतीची भाषा",
    remember_me: "माझी आठवण ठेवा",
    btn_signin: "क्रोनोपॅथमध्ये साइन इन करा",
    btn_signup: "विनामूल्य खाते तयार करा",
    guest_desc: "✨ खाते न उघडता लगेच पुणे भ्रमंती सुरू करायची आहे?",
    btn_guest: "अतिथी म्हणून पुढे जा (लॉगिनची गरज नाही) ➔",
    stat_routes: "पूर्ण केलेले मार्ग",
    stat_stories: "ऐकलेल्या गोष्टी",
    stat_badges: "प्राप्त बॅज",
    setting_pref: "भ्रमंती आणि आवड निवडी",
    setting_pref_desc: "इतिहास स्तर, गट/एकटे, बजेट",
    setting_lang: "अ‍ॅपची भाषा",
    setting_badges: "बॅज आणि जतन केलेली ठिकाणे",
    setting_badges_desc: "भेट दिलेले वाडे आणि खाद्य ठिकाणे",
    setting_rationale: "UX मूल्यमापन आणि तत्त्वे",
    setting_rationale_desc: "नील्सन नॉर्मन ह्युरिस्टिक्स तक्ता",
    btn_logout: "खात्यातून बाहेर पडा (साइन आउट)",
    nav_home: "मुख्यपृष्ठ",
    nav_routes: "मार्ग",
    nav_discover: "शोधा",
    nav_food: "खाद्य भ्रमंती",
    nav_planner: "नियोजन",
    nav_account: "खाते",
    exploring_city: "शहर भ्रमंती",
    pune_city: "पुणे, महाराष्ट्र",
    lang_switched: "भाषा मराठीत बदलली (मराठी सक्रिय)",
    sign_in_welcome: "पुन्हा स्वागत आहे, {name}!",
    sign_up_welcome: "खाते तयार झाले! क्रोनोपॅथमध्ये स्वागत, {name}.",
    social_login_msg: "{provider} द्वारे सुरक्षित साइन इन झाले.",
    guest_login_msg: "अतिथी म्हणून सुरू! सर्व नकाशे आणि मार्ग खुले आहेत.",
    sign_out_msg: "यशस्वीरित्या साइन आउट झाले."
  },
  hi: {
    hero_badge: "✨ सजीव कहानियों के साथ यात्रा",
    hero_title: "रास्ता केवल दूरी नहीं, एक जीवंत कहानी है।",
    hero_desc: "बिना किसी अग्रिम योजना के अपने मार्ग पर ३०० साल पुरानी पेशवा विरासत, गुप्त वाड़े और प्रसिद्ध स्ट्रीट फूड खोजें।",
    quickstart_title: "पुणे में पहली बार? १-टैप तैयार मार्ग",
    quickstart_sub: "कोई जटिल फॉर्म नहीं. तुरंत शुरू करने के लिए किसी भी विकल्प पर टैप करें:",
    search_ph: "कोई भी स्थान या व्यंजन खोजें (उदा. शनिवार वाड़ा, मिसल...)",
    chip_all: "सभी अन्वेषण",
    chip_heritage: "🏛️ पेशवा विरासत",
    chip_food: "🍲 स्ट्रीट फूड ट्रेल्स",
    chip_nature: "🌿 टेकड़ी हरियाली",
    chip_wadas: "🏰 पुराने पेठ वाड़े",
    cta_heading: "क्या अपने समय के अनुसार योजना चाहते हैं?",
    cta_subtext: "अपने घंटे और बजट बताएं — हम सर्वोत्तम मार्ग बनाएंगे।",
    btn_personalize: "कस्टमाइज़ करें",
    auth_tagline: "आपका व्यक्तिगत सांस्कृतिक धरोहर और यात्रा साथी",
    tab_signin: "साइन इन",
    tab_signup: "नया खाता",
    login_google: "Google के साथ जारी रखें",
    login_apple: "Apple के साथ जारी रखें",
    or_with_email: "या ईमेल द्वारा जारी रखें",
    label_name: "पूरा नाम",
    ph_name: "उदा. तन्वी जोशी",
    label_email: "ईमेल पता",
    ph_email: "you@example.com",
    label_pass: "पासवर्ड",
    forgot_pass: "भूल गए?",
    pref_lang: "पसंदीदा भाषा",
    remember_me: "मुझे याद रखें",
    btn_signin: "Chronopath में साइन इन करें",
    btn_signup: "मुफ्त खाता बनाएं",
    guest_desc: "✨ बिना खाता बनाए तुरंत पुणे एक्सप्लोर करना चाहते हैं?",
    btn_guest: "अतिथि के रूप में जारी रखें (लॉगिन जरूरी नहीं) ➔",
    stat_routes: "तय किए गए मार्ग",
    stat_stories: "सुनी गई कहानियां",
    stat_badges: "प्राप्त बैज",
    setting_pref: "यात्रा और रुचि प्राथमिकताएं",
    setting_pref_desc: "इतिहास परत, एकल/समूह, बजट",
    setting_lang: "ऐप की भाषा",
    setting_badges: "बैज और सहेजे गए स्थान",
    setting_badges_desc: "घूमे हुए वाड़े और खान-पान केंद्र",
    setting_rationale: "UX मूल्यांकन और शोध आधार",
    setting_rationale_desc: "नील्सन नॉर्मन सिद्धांत मैट्रिक्स",
    btn_logout: "खाते से बाहर निकलें (साइन आउट)",
    nav_home: "होम",
    nav_routes: "मार्ग",
    nav_discover: "खोजें",
    nav_food: "खान-पान",
    nav_planner: "योजना",
    nav_account: "प्रोफाइल",
    exploring_city: "शहर अन्वेषण",
    pune_city: "पुणे, महाराष्ट्र",
    lang_switched: "भाषा हिंदी में बदली (हिंदी सक्रिय)",
    sign_in_welcome: "वापसी पर स्वागत है, {name}!",
    sign_up_welcome: "खाता बन गया! Chronopath में स्वागत है, {name}.",
    social_login_msg: "{provider} द्वारा सुरक्षित रूप से लॉगिन किया गया.",
    guest_login_msg: "अतिथि के रूप में जारी! सभी मानचित्र और मार्ग अनलॉक हैं.",
    sign_out_msg: "सफलतापूर्वक साइन आउट किया गया."
  },
  fr: {
    hero_badge: "✨ VOYAGEZ AVEC DES HISTOIRES VIVANTES",
    hero_title: "La route n'est pas seulement une distance. C'est une histoire vivante.",
    hero_desc: "Découvrez 300 ans d'histoire des Peshwas, des wadas secrets et la cuisine de rue le long de votre itinéraire à Pune.",
    quickstart_title: "Première fois à Pune ? Itinéraires en 1 clic",
    quickstart_sub: "Aucun formulaire compliqué. Touchez une ambiance pour démarrer :",
    search_ph: "Rechercher un lieu ou une envie (ex. Shaniwar Wada, Misal...)",
    chip_all: "Toutes les explorations",
    chip_heritage: "🏛️ Patrimoine Peshwa",
    chip_food: "🍲 Balades Gourmandes",
    chip_nature: "🌿 Collines & Verdure",
    chip_wadas: "🏰 Anciens Wadas",
    cta_heading: "Un itinéraire adapté à vos horaires ?",
    cta_subtext: "Indiquez vos heures et budget — nous calculons l'itinéraire.",
    btn_personalize: "Personnaliser",
    auth_tagline: "Votre compagnon d'exploration et de récits historiques à Pune",
    tab_signin: "Connexion",
    tab_signup: "Créer un compte",
    login_google: "Continuer avec Google",
    login_apple: "Continuer avec Apple",
    or_with_email: "ou continuer par e-mail",
    label_name: "Nom complet",
    ph_name: "ex. Jean Dupont",
    label_email: "Adresse e-mail",
    ph_email: "vous@example.com",
    label_pass: "Mot de passe",
    forgot_pass: "Oublié ?",
    pref_lang: "Langue préférée",
    remember_me: "Se souvenir de moi",
    btn_signin: "Se connecter à Chronopath",
    btn_signup: "Créer un compte gratuit",
    guest_desc: "✨ Explorer immédiatement sans compte ?",
    btn_guest: "Continuer en tant qu'invité ➔",
    stat_routes: "Itinéraires",
    stat_stories: "Récits écoutés",
    stat_badges: "Badges",
    setting_pref: "Préférences de voyage",
    setting_pref_desc: "Couche historique, Solo/Groupe, Budget",
    setting_lang: "Langue de l'application",
    setting_badges: "Badges & Lieux enregistrés",
    setting_badges_desc: "Voir les wadas et restos visités",
    setting_rationale: "Évaluation UX & Justification",
    setting_rationale_desc: "Matrice heuristique de Nielsen Norman",
    btn_logout: "Se déconnecter",
    nav_home: "Accueil",
    nav_routes: "Itinéraires",
    nav_discover: "Découvrir",
    nav_food: "Cuisine",
    nav_planner: "Planificateur",
    nav_account: "Profil",
    exploring_city: "VILLE EXPLORÉE",
    pune_city: "Pune, Maharashtra",
    lang_switched: "Langue changée en Français (Mode voyageur actif)",
    sign_in_welcome: "Bienvenue, {name} !",
    sign_up_welcome: "Compte créé ! Bienvenue sur Chronopath, {name}.",
    social_login_msg: "Connexion sécurisée avec {provider}.",
    guest_login_msg: "Navigation invité active ! Toutes les cartes sont débloquées.",
    sign_out_msg: "Déconnexion réussie."
  },
  de: {
    hero_badge: "✨ REISE MIT LEBENDIGEN GESCHICHTEN",
    hero_title: "Der Weg ist nicht nur Entfernung. Er ist eine lebendige Geschichte.",
    hero_desc: "Entdecken Sie 300 Jahre Peshwa-Erbe, geheime Wadas und legendäres Streetfood entlang Ihrer Route in Pune.",
    quickstart_title: "Das erste Mal in Pune? 1-Klick-Routen",
    quickstart_sub: "Keine komplizierten Formulare. Tippen Sie auf einen Stil:",
    search_ph: "Suche nach Ort oder Speise (z.B. Shaniwar Wada, Misal...)",
    chip_all: "Alle Entdeckungen",
    chip_heritage: "🏛️ Peshwa-Kulturerbe",
    chip_food: "🍲 Streetfood-Touren",
    chip_nature: "🌿 Tekdi-Natur",
    chip_wadas: "🏰 Historische Wadas",
    cta_heading: "Individueller Plan für Ihre Zeit?",
    cta_subtext: "Geben Sie Ihre Stunden und Ihr Budget an — wir berechnen die Route.",
    btn_personalize: "Anpassen",
    auth_tagline: "Ihr persönlicher Begleiter für Geschichtserzählungen in Pune",
    tab_signin: "Anmelden",
    tab_signup: "Konto erstellen",
    login_google: "Weiter mit Google",
    login_apple: "Weiter mit Apple",
    or_with_email: "oder per E-Mail fortfahren",
    label_name: "Vollständiger Name",
    ph_name: "z.B. Max Mustermann",
    label_email: "E-Mail-Adresse",
    ph_email: "sie@example.com",
    label_pass: "Passwort",
    forgot_pass: "Vergessen?",
    pref_lang: "Bevorzugte Sprache",
    remember_me: "Angemeldet bleiben",
    btn_signin: "Bei Chronopath anmelden",
    btn_signup: "Kostenloses Konto erstellen",
    guest_desc: "✨ Sofort ohne Konto erkunden?",
    btn_guest: "Als Gast fortfahren ➔",
    stat_routes: "Routen",
    stat_stories: "Geschichten",
    stat_badges: "Abzeichen",
    setting_pref: "Reise- & Interesseneinstellungen",
    setting_pref_desc: "Geschichte-Ebene, Solo/Gruppe, Budget",
    setting_lang: "App-Sprache",
    setting_badges: "Abzeichen & Gespeicherte Orte",
    setting_badges_desc: "Besuchte Wadas & Lokale ansehen",
    setting_rationale: "UX-Bewertung & Begründung",
    setting_rationale_desc: "Nielsen-Norman-Heuristikmatrix",
    btn_logout: "Abmelden",
    nav_home: "Start",
    nav_routes: "Routen",
    nav_discover: "Entdecken",
    nav_food: "Essen",
    nav_planner: "Planer",
    nav_account: "Konto",
    exploring_city: "STADT ENTDECKEN",
    pune_city: "Pune, Maharashtra",
    lang_switched: "Sprache auf Deutsch umgestellt (Touristenmodus aktiv)",
    sign_in_welcome: "Willkommen zurück, {name}!",
    sign_up_welcome: "Konto erstellt! Willkommen bei Chronopath, {name}.",
    social_login_msg: "Sicher angemeldet mit {provider}.",
    guest_login_msg: "Als Gast aktiv! Alle Karten und Routen sind freigeschaltet.",
    sign_out_msg: "Erfolgreich abgemeldet."
  },
  es: {
    hero_badge: "✨ VIAJA CON HISTORIAS VIVAS",
    hero_title: "El camino no es solo distancia. Es una historia viva.",
    hero_desc: "Descubre 300 años de herencia Peshwa, wadas secretos y comida callejera icónica a lo largo de tu ruta en Pune.",
    quickstart_title: "¿Primera vez en Pune? Rutas en 1 toque",
    quickstart_sub: "Sin formularios complicados. Elige una experiencia para comenzar:",
    search_ph: "Busca un lugar o comida (ej. Shaniwar Wada, Misal...)",
    chip_all: "Todas las rutas",
    chip_heritage: "🏛️ Herencia Peshwa",
    chip_food: "🍲 Rutas gastronómicas",
    chip_nature: "🌿 Colinas y naturaleza",
    chip_wadas: "🏰 Antiguos Wadas",
    cta_heading: "¿Quieres un plan personalizado para tus horas?",
    cta_subtext: "Dinos tus horas y presupuesto — calcularemos la ruta.",
    btn_personalize: "Personalizar",
    auth_tagline: "Tu compañero personal de exploración e historias de Pune",
    tab_signin: "Iniciar sesión",
    tab_signup: "Crear cuenta",
    login_google: "Continuar con Google",
    login_apple: "Continuar con Apple",
    or_with_email: "o continuar con correo",
    label_name: "Nombre completo",
    ph_name: "ej. Carlos Ruiz",
    label_email: "Correo electrónico",
    ph_email: "tu@ejemplo.com",
    label_pass: "Contraseña",
    forgot_pass: "¿Olvidaste?",
    pref_lang: "Idioma preferido",
    remember_me: "Recordarme",
    btn_signin: "Iniciar sesión en Chronopath",
    btn_signup: "Crear cuenta gratis",
    guest_desc: "✨ ¿Quieres explorar de inmediato sin cuenta?",
    btn_guest: "Continuar como invitado ➔",
    stat_routes: "Rutas",
    stat_stories: "Historias",
    stat_badges: "Insignias",
    setting_pref: "Preferencias de viaje",
    setting_pref_desc: "Capa histórica, Solo/Grupo, Presupuesto",
    setting_lang: "Idioma de la app",
    setting_badges: "Insignias y Lugares guardados",
    setting_badges_desc: "Ver wadas y restaurantes visitados",
    setting_rationale: "Evaluación UX y Justificación",
    setting_rationale_desc: "Matriz heurística de Nielsen Norman",
    btn_logout: "Cerrar sesión",
    nav_home: "Inicio",
    nav_routes: "Rutas",
    nav_discover: "Descubrir",
    nav_food: "Comida",
    nav_planner: "Planificador",
    nav_account: "Cuenta",
    exploring_city: "EXPLORANDO CIUDAD",
    pune_city: "Pune, Maharashtra",
    lang_switched: "Idioma cambiado a Español (Modo viajero activo)",
    sign_in_welcome: "¡Bienvenido de nuevo, {name}!",
    sign_up_welcome: "¡Cuenta creada! Bienvenido a Chronopath, {name}.",
    social_login_msg: "Inicio seguro con {provider}.",
    guest_login_msg: "¡Continuando como invitado! Mapas y rutas desbloqueados.",
    sign_out_msg: "Sesión cerrada correctamente."
  },
  ja: {
    hero_badge: "✨ 生きた歴史の物語とともに旅する",
    hero_title: "道はただの距離ではありません。生きた物語です。",
    hero_desc: "事前準備なしで、プネーの300年のペーシュワー遺産、隠れたワダ、名物ストリートフードを発見しましょう。",
    quickstart_title: "プネーは初めてですか？ 1タップですぐに出発",
    quickstart_sub: "面倒な入力は不要。気分を選んですぐに探索開始：",
    search_ph: "場所や料理を検索（例：シャニワール・ワーダー、ミサル...）",
    chip_all: "すべての探索",
    chip_heritage: "🏛️ ペーシュワーの遺産",
    chip_food: "🍲 名物グルメ歩き",
    chip_nature: "🌿 テクディの緑と丘",
    chip_wadas: "🏰 旧市街の歴史的邸宅",
    cta_heading: "滞在時間に合わせたカスタム計画はいかがですか？",
    cta_subtext: "時間と予算を教えてください — 最適なルートを計算します。",
    btn_personalize: "カスタマイズ",
    auth_tagline: "プネーの生きた歴史と文化を巡るあなたの旅の相棒",
    tab_signin: "ログイン",
    tab_signup: "アカウント作成",
    login_google: "Googleで続ける",
    login_apple: "Appleで続ける",
    or_with_email: "またはメールアドレスで続ける",
    label_name: "氏名",
    ph_name: "例：山田 太郎",
    label_email: "メールアドレス",
    ph_email: "you@example.com",
    label_pass: "パスワード",
    forgot_pass: "お忘れですか？",
    pref_lang: "使用言語",
    remember_me: "ログイン状態を保持",
    btn_signin: "Chronopathにログイン",
    btn_signup: "無料アカウントを作成",
    guest_desc: "✨ アカウントなしですぐに探索しますか？",
    btn_guest: "ゲストとして続ける ➔",
    stat_routes: "歩いたルート",
    stat_stories: "聴いた物語",
    stat_badges: "獲得バッジ",
    setting_pref: "旅行と好みの設定",
    setting_pref_desc: "歴史レイヤー、人数、予算",
    setting_lang: "アプリの言語",
    setting_badges: "バッジと保存した場所",
    setting_badges_desc: "訪れたワダや名物店を確認",
    setting_rationale: "UX評価と設計根拠",
    setting_rationale_desc: "ニールセン・ノーマンのユーザビリティ原則",
    btn_logout: "ログアウト",
    nav_home: "ホーム",
    nav_routes: "ルート",
    nav_discover: "発見",
    nav_food: "グルメ",
    nav_planner: "計画",
    nav_account: "アカウント",
    exploring_city: "探索中の都市",
    pune_city: "プネー、マハーラーシュトラ州",
    lang_switched: "言語を日本語に切り替えました（観光ガイドモード）",
    sign_in_welcome: "おかえりなさい、{name}さん！",
    sign_up_welcome: "アカウント作成完了！Chronopathへようこそ、{name}さん。",
    social_login_msg: "{provider}で安全にログインしました。",
    guest_login_msg: "ゲストとして利用中！すべてのマップとルートが利用可能です。",
    sign_out_msg: "ログアウトしました。"
  }
};


// =============================================================================
// 2. REAL PUNE COORDINATES & LANDMARKS DATABASE
// =============================================================================
const PUNE_COORDINATES = {
  swargate: [18.5018, 73.8580],
  shaniwarWada: [18.5195, 73.8553],
  lalMahal: [18.5198, 73.8556],
  kasbaGanpati: [18.5187, 73.8526],
  dagdusheth: [18.5164, 73.8561],
  lakdiPul: [18.5107, 73.8446],
  pataleshwar: [18.5287, 73.8478],
  kataKirr: [18.5085, 73.8340],
  sujataMastani: [18.5120, 73.8520],
  nanaWada: [18.5180, 73.8540],
  vetalTekdi: [18.5265, 73.8210],
  bedekarTea: [18.5140, 73.8512],
  sinhagad: [18.3663, 73.7558]
};

// Route Polylines from Swargate to Shaniwar Wada
const PUNE_ROUTES_DATA = {
  heritage: {
    name: "Peshwa Legacy & Old Bridges Trail",
    duration: "26 min",
    distance: "4.8 km",
    isRecommended: true,
    color: "#1B6B73",
    bubbleCoord: [18.5115, 73.8470],
    points: [
      [18.5018, 73.8580], // Swargate
      [18.5042, 73.8520], // Sarasbaug
      [18.5075, 73.8485], // Tilak Road
      [18.5107, 73.8446], // Lakdi Pul
      [18.5125, 73.8475], // Alka Talkies
      [18.5160, 73.8520], // Appa Balwant Chowk
      [18.5187, 73.8526], // Kasba Ganpati
      [18.5195, 73.8553]  // Shaniwar Wada
    ]
  },
  food: {
    name: "Peth Street Food & Chai Crawl",
    duration: "34 min",
    distance: "5.4 km",
    isRecommended: false,
    color: "#E8892B",
    bubbleCoord: [18.5095, 73.8380],
    points: [
      [18.5018, 73.8580], // Swargate
      [18.5060, 73.8530], // Bajirao Rd
      [18.5085, 73.8340], // Kata Kirr Misal
      [18.5120, 73.8520], // Sujata Mastani
      [18.5155, 73.8545], // Laxmi Rd
      [18.5195, 73.8553]  // Shaniwar Wada
    ]
  },
  scenic: {
    name: "Mutha Riverbank & Shaded Walk",
    duration: "30 min",
    distance: "5.1 km",
    isRecommended: false,
    color: "#10B981",
    bubbleCoord: [18.5120, 73.8430],
    points: [
      [18.5018, 73.8580], // Swargate
      [18.5035, 73.8480], // Sarasbaug corner
      [18.5090, 73.8420], // Riverbank Rd
      [18.5140, 73.8435], // Promenade
      [18.5180, 73.8480], // Omkareshwar Ghat
      [18.5195, 73.8553]  // Shaniwar Wada
    ]
  },
  express: {
    name: "Shivaji Road Direct Arterial",
    duration: "14 min",
    distance: "3.9 km",
    isRecommended: false,
    color: "#64748B",
    bubbleCoord: [18.5125, 73.8565],
    points: [
      [18.5018, 73.8580], // Swargate
      [18.5090, 73.8565], // Shivaji Rd straight
      [18.5164, 73.8561], // Dagdusheth
      [18.5195, 73.8553]  // Shaniwar Wada
    ]
  }
};

// Discover Landmark Spots
const DISCOVER_LANDMARKS = [
  {
    id: "pataleshwar",
    title: "Pataleshwar Rock-Cut Cave Temple",
    category: "gem",
    categoryLabel: "SECRET MONOLITH",
    coord: PUNE_COORDINATES.pataleshwar,
    image: "images/pataleshwar_cave.jpg",
    desc: "8th-century subterranean rock-cut cave temple carved directly into volcanic basalt.",
    rating: "4.9 ★",
    walkTime: "6 min walk"
  },
  {
    id: "nanawada",
    title: "Nana Wada & Teakwood Diwan-e-Khas",
    category: "history",
    categoryLabel: "ARCHITECTURAL GEM",
    coord: PUNE_COORDINATES.nanaWada,
    image: "images/pune_heritage_hero.jpg",
    desc: "Built by Nana Phadnavis in 1780 with carved cypress wood pillars and original Peshwa ceilings.",
    rating: "4.7 ★",
    walkTime: "9 min walk"
  },
  {
    id: "vetaltekdi",
    title: "Vetal Tekdi Secret Quarry Vista",
    category: "photo",
    categoryLabel: "NATURE & PANORAMA",
    coord: PUNE_COORDINATES.vetalTekdi,
    image: "images/vetal_tekdi.jpg",
    desc: "Highest natural peak in Pune limits (2,600 ft) with an abandoned quarry pond reflecting morning mist.",
    rating: "4.8 ★",
    walkTime: "12 min cab"
  },
  {
    id: "katakirr",
    title: "Kata Kirr Puneri Misal",
    category: "food",
    categoryLabel: "FOOD LEGEND",
    coord: PUNE_COORDINATES.kataKirr,
    image: "images/puneri_misal.jpg",
    desc: "Iconic spicy sprouted moth-bean breakfast with golden poha base and fiery kat broth.",
    rating: "4.8 ★",
    walkTime: "9 min auto"
  },
  {
    id: "shaniwar",
    title: "Shaniwar Wada Palace Ramparts",
    category: "history",
    categoryLabel: "EMPIRE SEAT",
    coord: PUNE_COORDINATES.shaniwarWada,
    image: "images/shaniwar_wada_modern.jpg",
    desc: "Fortified palace seat of the Maratha Empire, built in 1732 CE by Bajirao I.",
    rating: "4.9 ★",
    walkTime: "Destination"
  }
];

// =============================================================================
// 3. MAP MANAGER CLASS (Leaflet.js Engine with Realistic Google-Maps Styling)
// =============================================================================
class MapManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.map = null;
    this.markers = [];
    this.routePolylines = {};
    this.durationBubbles = {};
    this.userMarker = null;
    this.activeRouteKey = 'heritage';
    this.tileLayers = { street: null, satellite: null };
    this.activeTile = 'street';
    this.navCoords = [
      [18.5107, 73.8446], // Lakdi Pul
      [18.5115, 73.8455], // Shivaji Bridge piers
      [18.5125, 73.8475], // Alka Talkies corner
      [18.5140, 73.8495], // Laxmi Road junction
      [18.5160, 73.8520], // Appa Balwant Chowk
      [18.5175, 73.8525], // Kasba Peth entrance
      [18.5187, 73.8526], // Kasba Ganpati
      [18.5195, 73.8553]  // Shaniwar Wada Arrival
    ];
    this.navStepIndex = 0;
    this.init();
  }

  init() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === 'undefined') return;

    if (el._leaflet_id) {
      return;
    }

    const defaultCenter = this.options.center || [18.5140, 73.8530];
    const defaultZoom = this.options.zoom || 14;

    this.map = L.map(this.containerId, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: false
    });

    this.setupTiles();

    if (this.options.isRoutesMap) {
      this.setupRoutesView();
    } else if (this.options.isDiscoverMap) {
      this.setupDiscoverView();
    } else if (this.options.isPlaceMap) {
      this.setupPlaceContextView();
    } else if (this.options.isNavMap) {
      this.setupLiveNavView();
    }
  }

  setupTiles() {
    // OpenStreetMap — 100% free, no API key ever required
    const osmUrl     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // CARTO Voyager — free but rate-limited without key; use as style option
    const voyagerUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    // Esri World Imagery — free satellite, no key required
    const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    try {
      // Primary: OpenStreetMap (always works, no key)
      this.tileLayers.street = L.tileLayer(osmUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      // Satellite: Esri (free, no key)
      this.tileLayers.satellite = L.tileLayer(satelliteUrl, {
        maxZoom: 19,
        attribution: '&copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics'
      });
      this.tileLayers.street.addTo(this.map);
      this.activeTile = 'street';
    } catch (e) {
      console.warn("Tile fallback", e);
      L.tileLayer(osmUrl, { maxZoom: 19 }).addTo(this.map);
    }
  }

  switchTileLayer(tileType) {
    if (!this.map || !this.tileLayers.street) return;

    if (tileType === 'satellite') {
      if (this.map.hasLayer(this.tileLayers.street)) {
        this.map.removeLayer(this.tileLayers.street);
      }
      if (!this.map.hasLayer(this.tileLayers.satellite)) {
        this.tileLayers.satellite.addTo(this.map);
      }
      this.activeTile = 'satellite';
    } else {
      if (this.map.hasLayer(this.tileLayers.satellite)) {
        this.map.removeLayer(this.tileLayers.satellite);
      }
      if (!this.map.hasLayer(this.tileLayers.street)) {
        this.tileLayers.street.addTo(this.map);
      }
      this.activeTile = 'street';
    }
  }

  // Teardrop Pin Marker Generator
  createPinIcon(category, iconSvg) {
    const catClass = `pin-${category}`;
    return L.divIcon({
      className: 'cp-pin-leaflet-div',
      html: `
        <div class="cp-pin-wrapper ${catClass}">
          <div class="pin-teardrop">
            <div class="pin-icon-content">${iconSvg}</div>
          </div>
          <div class="pin-shadow"></div>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 44],
      popupAnchor: [0, -38]
    });
  }

  // Blue Pulsing "You Are Here" GPS Dot
  createUserGPSMarker(coord) {
    const gpsIcon = L.divIcon({
      className: 'cp-gps-leaflet-div',
      html: `
        <div class="user-gps-container">
          <div class="gps-pulse-outer"></div>
          <div class="gps-center-dot"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    return L.marker(coord, { icon: gpsIcon, zIndexOffset: 1000 }).addTo(this.map);
  }

  // Duration Bubble Pill Marker
  createDurationBubbleIcon(durationText, isRec, routeKey, isSelected) {
    const selClass = isSelected ? 'selected' : '';
    const recBadge = isRec ? '<span class="bubble-badge-rec">★ Rec</span>' : '';
    return L.divIcon({
      className: 'cp-bubble-leaflet-div',
      html: `
        <div class="route-duration-bubble ${selClass}" data-route="${routeKey}">
          <span class="bubble-time-text">${durationText}</span>
          ${recBadge}
        </div>
      `,
      iconSize: [86, 32],
      iconAnchor: [43, 16]
    });
  }

  // 1. Setup Routes Screen Map
  setupRoutesView() {
    // Start Origin Marker
    const originIcon = this.createPinIcon('gem', `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/></svg>
    `);
    const originMarker = L.marker(PUNE_COORDINATES.swargate, { icon: originIcon }).addTo(this.map);
    originMarker.bindPopup(`
      <div class="map-popup-card">
        <span class="map-popup-badge">🚀 ROUTE START</span>
        <h4 class="map-popup-title">Swargate Station</h4>
        <p class="map-popup-meta">Paced walk begins here (Southern Hub)</p>
      </div>
    `);

    // Destination Pin at Shaniwar Wada
    const destIcon = this.createPinIcon('heritage', `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M12 11v4M9 21v-4a3 3 0 0 1 6 0v4"/></svg>
    `);
    const destMarker = L.marker(PUNE_COORDINATES.shaniwarWada, { icon: destIcon }).addTo(this.map);
    destMarker.bindPopup(`
      <div class="map-popup-card">
        <img src="images/shaniwar_wada_modern.jpg" class="map-popup-img" alt="Shaniwar Wada">
        <span class="map-popup-badge">🏰 DESTINATION</span>
        <h4 class="map-popup-title">Shaniwar Wada Palace</h4>
        <p class="map-popup-meta">1732 CE Seat of the Peshwas</p>
        <button class="map-popup-btn" onclick="app.navigateTo('place')">View Timeline & 3D Story</button>
      </div>
    `);

    // Intermediate Waypoint Pins
    const lakdiPulIcon = this.createPinIcon('food', `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
    `);
    L.marker(PUNE_COORDINATES.lakdiPul, { icon: lakdiPulIcon }).addTo(this.map)
      .bindPopup(`
        <div class="map-popup-card">
          <span class="map-popup-badge">🎧 AUDIO STORY SPOT</span>
          <h4 class="map-popup-title">Lakdi Pul (Shivaji Bridge)</h4>
          <p style="font-size: 0.72rem; color: #475569;">1761 Panipat retreat wooden bridge. Live narrative triggers here.</p>
          <button class="map-popup-btn" onclick="app.navigateTo('navigation')">Preview Navigation</button>
        </div>
      `);

    const foodIcon = this.createPinIcon('food', `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
    `);
    L.marker(PUNE_COORDINATES.kataKirr, { icon: foodIcon }).addTo(this.map)
      .bindPopup(`
        <div class="map-popup-card">
          <img src="images/puneri_misal.jpg" class="map-popup-img" alt="Kata Kirr Misal">
          <span class="map-popup-badge">🍲 FOOD WAYPOINT</span>
          <h4 class="map-popup-title">Kata Kirr Puneri Misal</h4>
          <p style="font-size: 0.72rem; color: #475569;">Authentic sprouted moth bean brunch stop on Food Crawl route.</p>
        </div>
      `);

    // Draw the 4 Routes with Polylines & Duration Bubbles
    Object.keys(PUNE_ROUTES_DATA).forEach(key => {
      const data = PUNE_ROUTES_DATA[key];
      const isSelected = key === this.activeRouteKey;

      // Outer White Casing
      const casing = L.polyline(data.points, {
        color: '#FFFFFF',
        weight: isSelected ? 8 : 6,
        opacity: isSelected ? 0.95 : 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);

      // Inner Colored Line
      const inner = L.polyline(data.points, {
        color: isSelected ? data.color : '#94A3B8',
        weight: isSelected ? 5 : 3.5,
        opacity: isSelected ? 1 : 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);

      // Click to select route
      const selectAction = () => {
        if (window.app) window.app.selectRouteOption(key);
      };
      casing.on('click', selectAction);
      inner.on('click', selectAction);

      this.routePolylines[key] = { casing, inner, color: data.color };

      // Duration Bubble Marker
      const bubbleIcon = this.createDurationBubbleIcon(data.duration, data.isRecommended, key, isSelected);
      const bubbleMarker = L.marker(data.bubbleCoord, { icon: bubbleIcon, zIndexOffset: isSelected ? 500 : 200 }).addTo(this.map);
      bubbleMarker.on('click', selectAction);
      this.durationBubbles[key] = bubbleMarker;
    });

    // Fit map bounds to show full route from Swargate to Shaniwar Wada
    this.map.fitBounds([
      PUNE_COORDINATES.swargate,
      PUNE_COORDINATES.shaniwarWada
    ], { padding: [50, 40] });
  }

  // Update selected route appearance
  setActiveRoute(routeKey) {
    this.activeRouteKey = routeKey;

    Object.keys(this.routePolylines).forEach(key => {
      const isSelected = key === routeKey;
      const poly = this.routePolylines[key];
      const data = PUNE_ROUTES_DATA[key];

      if (poly) {
        poly.casing.setStyle({
          weight: isSelected ? 8 : 6,
          opacity: isSelected ? 0.95 : 0.7
        });
        poly.inner.setStyle({
          color: isSelected ? poly.color : '#94A3B8',
          weight: isSelected ? 5 : 3.5,
          opacity: isSelected ? 1 : 0.65
        });
        if (isSelected) {
          poly.casing.bringToFront();
          poly.inner.bringToFront();
        }
      }

      // Update Bubble Marker Icon
      if (this.durationBubbles[key]) {
        const bubbleIcon = this.createDurationBubbleIcon(data.duration, data.isRecommended, key, isSelected);
        this.durationBubbles[key].setIcon(bubbleIcon);
        if (isSelected) this.durationBubbles[key].setZIndexOffset(500);
        else this.durationBubbles[key].setZIndexOffset(200);
      }
    });
  }

  // 2. Setup Discover Screen Map
  setupDiscoverView() {
    this.userMarker = this.createUserGPSMarker(PUNE_COORDINATES.kasbaGanpati);

    DISCOVER_LANDMARKS.forEach(item => {
      const pinIcon = this.createPinIcon(item.category, `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="8"/></svg>
      `);
      const marker = L.marker(item.coord, { icon: pinIcon }).addTo(this.map);

      marker.bindPopup(`
        <div class="map-popup-card">
          <img src="${item.image}" class="map-popup-img" alt="${item.title}">
          <span class="map-popup-badge">${item.categoryLabel}</span>
          <h4 class="map-popup-title">${item.title}</h4>
          <div class="map-popup-meta">
            <span>${item.rating}</span>
            <span>${item.walkTime}</span>
          </div>
          <p style="font-size: 0.72rem; color: #475569; margin: 3px 0;">${item.desc}</p>
          <div class="map-popup-actions">
            <button class="map-popup-btn" onclick="app.addToItinerary('${item.title}')">+ Add Stop</button>
            <button class="map-popup-btn secondary" onclick="app.navigateTo('place')">Details</button>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (window.app) window.app.showDiscoverPopover(item);
      });

      this.markers.push({ marker, category: item.category });
    });

    this.map.setView([18.518, 73.850], 14);
  }

  filterDiscoverPins(filterCategory) {
    this.markers.forEach(item => {
      if (filterCategory === 'all' || item.category === filterCategory) {
        if (!this.map.hasLayer(item.marker)) {
          this.map.addLayer(item.marker);
        }
      } else {
        if (this.map.hasLayer(item.marker)) {
          this.map.removeLayer(item.marker);
        }
      }
    });
  }

  // 3. Setup Place Context Map
  setupPlaceContextView() {
    const pin = this.createPinIcon('heritage', `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>
    `);
    L.marker(PUNE_COORDINATES.shaniwarWada, { icon: pin }).addTo(this.map);
    this.map.setView(PUNE_COORDINATES.shaniwarWada, 16);
  }

  // 4. Setup Live Navigation Map
  setupLiveNavView() {
    // Dimmed Completed Path (Swargate to Lakdi Pul)
    const pastSegment = [
      [18.5018, 73.8580],
      [18.5042, 73.8520],
      [18.5075, 73.8485],
      [18.5107, 73.8446]
    ];
    L.polyline(pastSegment, { color: '#94A3B8', weight: 5, opacity: 0.6 }).addTo(this.map);

    // Active Remaining Path (Lakdi Pul to Shaniwar Wada)
    const activeSegment = [
      [18.5107, 73.8446],
      [18.5125, 73.8475],
      [18.5160, 73.8520],
      [18.5187, 73.8526],
      [18.5195, 73.8553]
    ];
    L.polyline(activeSegment, { color: '#FFFFFF', weight: 8, opacity: 0.95 }).addTo(this.map);
    L.polyline(activeSegment, { color: '#1B6B73', weight: 5, opacity: 1 }).addTo(this.map);

    // User GPS location currently at Lakdi Pul
    this.userMarker = this.createUserGPSMarker(PUNE_COORDINATES.lakdiPul);

    // Destination Pin
    const destPin = this.createPinIcon('heritage', `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>
    `);
    L.marker(PUNE_COORDINATES.shaniwarWada, { icon: destPin }).addTo(this.map);

    // Story marker at Lakdi Pul
    const storyPin = this.createPinIcon('food', `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
    `);
    L.marker(PUNE_COORDINATES.lakdiPul, { icon: storyPin }).addTo(this.map)
      .bindPopup("<strong>Lakdi Pul (1761 Panipat Retreat)</strong><br>Proximity audio narrative active.");

    this.map.setView(PUNE_COORDINATES.lakdiPul, 16);
  }

  // Advance GPS position smoothly for Live Navigation
  advanceGps() {
    if (!this.options.isNavMap || !this.userMarker || !this.navCoords) return;

    this.navStepIndex = (this.navStepIndex + 1) % this.navCoords.length;
    const nextCoord = this.navCoords[this.navStepIndex];
    this.userMarker.setLatLng(nextCoord);
    this.map.panTo(nextCoord, { animate: true, duration: 1 });

    const maneuverStreet = document.querySelector('.maneuver-street');
    const maneuverDist = document.querySelector('.maneuver-distance');
    const etaBig = document.querySelector('.eta-big');
    const etaSub = document.querySelector('.eta-sub');

    const steps = [
      { street: "Turn Left onto Lakdi Pul (Shivaji Bridge)", dist: "In 120 meters", eta: "14 mins", sub: "1.8 km remaining • 1 stop ahead" },
      { street: "Crossing Lakdi Pul • Riverside View", dist: "In 60 meters", eta: "12 mins", sub: "1.5 km remaining • Audio Story Active" },
      { street: "Continue onto Alka Talkies Junction", dist: "In 80 meters", eta: "9 mins", sub: "1.2 km remaining • Next: Sadashiv Peth" },
      { street: "Turn Right onto Appa Balwant Chowk", dist: "In 140 meters", eta: "6 mins", sub: "800m remaining • Heritage corridor" },
      { street: "Enter Kasba Peth Heritage Gate", dist: "In 50 meters", eta: "4 mins", sub: "450m remaining • 1630 CE zone" },
      { street: "Arriving at Shaniwar Wada Palace (Dilli Darwaza)", dist: "Destination in 30m", eta: "1 min", sub: "100m remaining • You have arrived!" }
    ];

    const stepData = steps[this.navStepIndex % steps.length];
    if (maneuverStreet) maneuverStreet.innerText = stepData.street;
    if (maneuverDist) maneuverDist.innerText = stepData.dist;
    if (etaBig) etaBig.innerText = stepData.eta;
    if (etaSub) etaSub.innerText = stepData.sub;
  }

  // Controls
  zoomIn() { if (this.map) this.map.zoomIn(); }
  zoomOut() { if (this.map) this.map.zoomOut(); }
  recenter() {
    if (!this.map) return;
    if (this.options.isRoutesMap) {
      this.map.fitBounds([PUNE_COORDINATES.swargate, PUNE_COORDINATES.shaniwarWada], { padding: [50, 40] });
    } else if (this.options.isNavMap) {
      if (this.userMarker) {
        this.map.panTo(this.userMarker.getLatLng(), { animate: true });
      } else {
        this.map.setView(PUNE_COORDINATES.lakdiPul, 16);
      }
    } else if (this.options.isDiscoverMap) {
      this.map.setView([18.518, 73.850], 14);
    } else {
      this.map.setView(PUNE_COORDINATES.shaniwarWada, 15);
    }
  }

  toggleMapLayer() {
    const nextLayer = this.activeTile === 'street' ? 'satellite' : 'street';
    this.switchTileLayer(nextLayer);
    if (window.app) window.app.showToast(`Map Layer: ${nextLayer === 'satellite' ? 'Satellite Orthophoto' : 'CARTO Voyager Street Map'} active`);
  }
}

// =============================================================================
// 4. MAIN PROTOTYPE CONTROLLER CLASS
// =============================================================================
class ChronopathApp {
  constructor() {
    this.currentScreen = 'landing';
    this.deviceMode = 'mobile';
    this.annotationsActive = true;
    this.onboardingStep = 1;
    this.audioSeconds = 74;
    this.audioTotal = 222;
    this.audioSpeed = 1.0;
    this.isPlayingAudio = false;
    this.audioTimer = null;
    this.toastTimer = null;
    this.historyLayerEnabled = true;
    this.currentLang = 'en';
    this.authTab = 'signin';
    this.currentUser = null;

    // AI Itinerary stops
    this.itineraryStops = [
      { id: 1, time: '10:00 AM', duration: '45 mins', tag: '🏛️ Heritage Anchor', name: 'Shaniwar Wada Palace & Dilli Darwaza', note: 'Morning sunlight through the massive northern spiked gates.' },
      { id: 2, time: '10:51 AM', duration: '30 mins', tag: '🕊️ Sacred & Culture', name: 'Kasba Ganpati & Lal Mahal', note: 'Historic Gramdaivat of Pune established in 1630 CE.' },
      { id: 3, time: '11:30 AM', duration: '45 mins', tag: '🍲 Iconic Veg Brunch', isFood: true, name: 'Kata Kirr Misal (Karve Road)', note: 'Authentic Puneri mild coriander kat with fresh pohe base.' },
      { id: 4, time: '12:30 PM', duration: '50 mins', tag: '💎 Hidden Monolith', name: 'Pataleshwar Cave Temple (8th Century CE)', note: 'Cool subterranean basalt sanctuary carved during Rashtrakuta rule.' }
    ];

    // Map Manager instances
    this.mapManager = null;
    this.discoverMapManager = null;
    this.placeMapManager = null;
    this.navMapManager = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setLanguage(this.currentLang, false);
    this.updateAuthUI();
    this.setupThenNowSlider();
    this.renderItineraryStops();
    this.initMaps();
    this.setupBottomSheetDraggable();
    this.updateAnnotationRail('landing');
    this.updateFlowIndicator('landing');
  }

  initMaps() {
    // 1. Routes Leaflet Map (Screen 3)
    const routeId = document.getElementById('realRouteMap') ? 'realRouteMap' : 'routesLeafletMap';
    if (document.getElementById(routeId)) {
      this.routeMapManager = new MapManager(routeId, { isRoutesMap: true });
      this.mapManager = this.routeMapManager;
    }

    // 2. Discover Leaflet Map (Screen 4)
    const discoverId = document.getElementById('realDiscoverMap') ? 'realDiscoverMap' : 'discoverLeafletMap';
    if (document.getElementById(discoverId)) {
      this.discoverMapManager = new MapManager(discoverId, { isDiscoverMap: true });
    }

    // 3. Place Context Map (Screen 6)
    if (document.getElementById('placeContextMap')) {
      this.placeMapManager = new MapManager('placeContextMap', { isPlaceMap: true });
    }

    // 4. Live Navigation Map (Screen 8)
    const navId = document.getElementById('realLiveNavMap') ? 'realLiveNavMap' : 'navLeafletMap';
    if (document.getElementById(navId)) {
      this.navMapManager = new MapManager(navId, { isNavMap: true });
    }
  }

  // =============================================================================
  // SCREEN NAVIGATION & FLOW BREADCRUMBS
  // =============================================================================
  navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen');
    const targetScreen = document.getElementById(`screen-${screenId}`);

    if (!targetScreen) {
      console.warn(`Screen screen-${screenId} not found.`);
      return;
    }

    screens.forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
    this.currentScreen = screenId;

    // Update Bottom Nav Active Pill (Mobile 6 Tabs)
    const navButtons = document.querySelectorAll('.bottom-tab-btn, .nav-tab-btn');
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === screenId);
    });

    // Update Tablet Rail Active
    const railButtons = document.querySelectorAll('.rail-item');
    railButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === screenId);
    });

    // Update Laptop Sidebar Active
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.nav === screenId);
    });

    // Update Breadcrumb Flow Indicator
    this.updateFlowIndicator(screenId);

    // Update External Annotation Margin Rail
    this.updateAnnotationRail(screenId);

    // Invalidate Leaflet maps on view entry & handle live GPS simulation lifecycle
    setTimeout(() => {
      const routeMgr = this.routeMapManager || this.mapManager;
      if (screenId === 'routes' && routeMgr && routeMgr.map) {
        routeMgr.map.invalidateSize();
        routeMgr.recenter();
      } else if (screenId === 'discover' && this.discoverMapManager && this.discoverMapManager.map) {
        this.discoverMapManager.map.invalidateSize();
      } else if (screenId === 'place' && this.placeMapManager && this.placeMapManager.map) {
        this.placeMapManager.map.invalidateSize();
      } else if (screenId === 'navigation' && this.navMapManager && this.navMapManager.map) {
        this.navMapManager.map.invalidateSize();
        this.navMapManager.recenter();
        this.startLiveGpsSimulation();
      }

      if (screenId !== 'navigation') {
        this.stopLiveGpsSimulation();
      }
    }, 150);

    if (screenId === 'preferences') {
      this.updateRouteMatches(false);
    }

    // Scroll container to top
    const viewport = document.getElementById('appViewport');
    if (viewport) viewport.scrollTop = 0;
  }

  updateFlowIndicator(screenId) {
    const flowOrder = ['landing', 'preferences', 'routes', 'discover', 'food', 'place', 'planner', 'navigation', 'rewards', 'rationale'];
    const flowNames = {
      landing: 'Step 1 of 8 • Landing & Discovery',
      preferences: 'Step 2 of 8 • Preferences & Persona',
      routes: 'Step 3 of 8 • Route Options & Map',
      discover: 'Step 4 of 8 • Discover Nearby & Gems',
      food: 'Step 5 of 8 • Pune Food Explorer',
      place: 'Step 6 of 8 • Place Story & Time Travel',
      planner: 'Step 7 of 8 • AI Smart Trip Planner',
      navigation: 'Step 8 of 8 • Live Navigation Mode',
      rewards: 'Trip Complete • Post-Experience & Diary',
      saved: 'Personal Travel Diary & Collections',
      rationale: 'UX Rationale Matrix & Heuristics'
    };

    const idx = flowOrder.indexOf(screenId);
    const progressFill = document.getElementById('mobileProgressFill');
    const progressText = document.getElementById('mobileFlowProgressText');

    if (progressFill && idx !== -1) {
      const pct = ((idx + 1) / 8) * 100;
      progressFill.style.width = `${Math.min(100, pct)}%`;
    }
    if (progressText && flowNames[screenId]) {
      progressText.innerText = flowNames[screenId];
    }

    // Desktop stepper
    const stepperItems = document.querySelectorAll('.flow-step-item');
    stepperItems.forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screenId);
    });
  }

  // =============================================================================
  // DRAGGABLE BOTTOM SHEET WITH 3 SNAP POINTS (PEEK, HALF, FULL)
  // =============================================================================
  setupBottomSheetDraggable() {
    const sheet = document.getElementById('routesBottomSheet');
    const handle = document.getElementById('sheetDragHandle');
    if (!sheet || !handle) return;

    // Set initial state: snap-half
    sheet.classList.add('snap-half');

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const snapPoints = ['snap-peek', 'snap-half', 'snap-full'];

    // Handle click to cycle snaps
    handle.addEventListener('click', () => {
      if (sheet.classList.contains('snap-half')) {
        sheet.classList.remove('snap-half', 'snap-peek');
        sheet.classList.add('snap-full');
      } else if (sheet.classList.contains('snap-full')) {
        sheet.classList.remove('snap-full', 'snap-half');
        sheet.classList.add('snap-peek');
      } else {
        sheet.classList.remove('snap-peek', 'snap-full');
        sheet.classList.add('snap-half');
      }
    });

    // Touch events for drag snapping
    handle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const deltaY = currentY - startY;

      if (deltaY > 60) {
        // Dragged down
        if (sheet.classList.contains('snap-full')) {
          sheet.classList.remove('snap-full');
          sheet.classList.add('snap-half');
        } else {
          sheet.classList.remove('snap-half');
          sheet.classList.add('snap-peek');
        }
      } else if (deltaY < -60) {
        // Dragged up
        if (sheet.classList.contains('snap-peek')) {
          sheet.classList.remove('snap-peek');
          sheet.classList.add('snap-half');
        } else {
          sheet.classList.remove('snap-half');
          sheet.classList.add('snap-full');
        }
      }
    });
  }

  // Route Selection (Synchronizes Card, Polylines, Duration Bubbles)
  selectRoute(elemOrKey) {
    let routeKey = 'heritage';
    if (typeof elemOrKey === 'string') {
      routeKey = elemOrKey;
    } else if (elemOrKey && elemOrKey.dataset && elemOrKey.dataset.route) {
      routeKey = elemOrKey.dataset.route;
    }
    this.selectRouteOption(routeKey);
  }

  selectRouteOption(routeKey) {
    const cards = document.querySelectorAll('.route-card, .route-card-item');
    cards.forEach(c => {
      c.classList.toggle('selected', c.dataset.route === routeKey);
    });

    const mgr = this.routeMapManager || this.mapManager;
    if (mgr && mgr.setActiveRoute) {
      mgr.setActiveRoute(routeKey);
    }

    const routeName = PUNE_ROUTES_DATA[routeKey] ? PUNE_ROUTES_DATA[routeKey].name : routeKey;
    this.showToast(`Selected Route: ${routeName}`);
  }

  // Switch between Street & Satellite tiles across maps
  switchMapTileLayer(mapType, tileType) {
    let mgr = null;
    if (mapType === 'route') mgr = this.routeMapManager || this.mapManager;
    else if (mapType === 'discover') mgr = this.discoverMapManager;
    else if (mapType === 'nav') mgr = this.navMapManager;

    if (mgr && mgr.switchTileLayer) {
      mgr.switchTileLayer(tileType);
    }

    // Update active button state in controls
    const screenEl = mapType === 'route' ? document.getElementById('screen-routes') :
                     mapType === 'discover' ? document.getElementById('discoverMapWrapper') :
                     document.getElementById('screen-navigation');
    if (screenEl) {
      const btns = screenEl.querySelectorAll('.map-type-btn');
      btns.forEach(b => {
        const text = b.innerText.toLowerCase();
        if (text.includes(tileType) || b.dataset.mapLayer === tileType) {
          b.classList.add('active');
        } else if (!text.includes('recenter') && !text.includes('fit') && !text.includes('location')) {
          b.classList.remove('active');
        }
      });
    }

    const tileName = tileType === 'satellite' ? 'Satellite Aerial Imagery' : 'CARTO Voyager Street Map';
    this.showToast(`Map View: ${tileName} active`);
  }

  // Recenter map
  recenterMap(mapType) {
    let mgr = null;
    if (mapType === 'route') mgr = this.routeMapManager || this.mapManager;
    else if (mapType === 'discover') mgr = this.discoverMapManager;
    else if (mapType === 'nav') mgr = this.navMapManager;

    if (mgr) {
      mgr.recenter();
      this.showToast(mapType === 'route' ? "Recentered on Swargate ➔ Shaniwar Wada route" :
                     mapType === 'nav' ? "Recentered on your live GPS location" :
                     "Recentered to fit all Pune landmarks");
    }
  }

  // Live Turn-by-Turn GPS Animation Loop
  startLiveGpsSimulation() {
    this.stopLiveGpsSimulation();
    if (!this.navMapManager) return;

    this.navGpsTimer = setInterval(() => {
      if (this.currentScreen !== 'navigation') {
        this.stopLiveGpsSimulation();
        return;
      }
      if (this.navMapManager && this.navMapManager.advanceGps) {
        this.navMapManager.advanceGps();
      }
    }, 3500);
  }

  stopLiveGpsSimulation() {
    if (this.navGpsTimer) {
      clearInterval(this.navGpsTimer);
      this.navGpsTimer = null;
    }
  }

  // Discover Dual Map / List View
  toggleDiscoverView(mode) {
    this.setDiscoverView(mode);
  }

  setDiscoverView(mode) {
    const btnList = document.querySelector('.view-btn[data-view="list"]') || document.getElementById('btnDiscoverList');
    const btnMap = document.querySelector('.view-btn[data-view="map"]') || document.getElementById('btnDiscoverMap');
    const mapWrapper = document.getElementById('discoverMapWrapper');

    if (mode === 'map') {
      if (btnMap) btnMap.classList.add('active');
      if (btnList) btnList.classList.remove('active');
      if (mapWrapper) mapWrapper.classList.remove('hidden');

      setTimeout(() => {
        if (this.discoverMapManager && this.discoverMapManager.map) {
          this.discoverMapManager.map.invalidateSize();
          this.discoverMapManager.recenter();
        }
      }, 100);

      this.showToast("Discover Map View Active: Tap pins to preview secret spots");
    } else {
      if (btnList) btnList.classList.add('active');
      if (btnMap) btnMap.classList.remove('active');
      if (mapWrapper) mapWrapper.classList.add('hidden');
      this.showToast("Discover List View Active");
    }
  }

  filterDiscover(category) {
    const chips = document.querySelectorAll('#screen-discover .filter-chip, #screen-discover .cp-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.dataset.filter === category);
    });

    const cards = document.querySelectorAll('#discoverCardsList .gem-card, .gem-card-unified');
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    if (this.discoverMapManager) {
      this.discoverMapManager.filterDiscoverPins(category);
    }
  }

  filterDiscoverList(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#discoverCardsList .gem-card, .gem-card-unified');
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterFoodList(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#screen-food .food-story-card, #screen-food .food-item-card, #screen-food .food-card');
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  toggleBottomSheet() {
    const sheet = document.getElementById('navBottomSheet');
    if (sheet) {
      sheet.classList.toggle('collapsed');
      this.showToast(sheet.classList.contains('collapsed') ? "Bottom sheet collapsed" : "Bottom sheet expanded");
    }
  }

  toggleNavStoryAudio(btn) {
    if (!btn) btn = document.querySelector('.btn-mini-play');
    if (!btn) return;

    if (btn.innerText.includes('Play') || btn.innerText.includes('▶')) {
      btn.innerHTML = '<span>⏸ Pause Story (Playing...)</span>';
      this.showToast("Playing Lakdi Pul 1761 retreat narrative...");
    } else {
      btn.innerHTML = '<span>▶ Play Story (1m 15s)</span>';
      this.showToast("Story playback paused");
    }
  }


  // =============================================================================
  // AUTHENTICATION & PROFILE CONTROLLERS (Nielsen #3: User Freedom)
  // =============================================================================
  switchAuthTab(tab) {
    this.authTab = tab;
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const groupFullName = document.getElementById('groupFullName');
    const authSubmitText = document.getElementById('authSubmitText');

    if (tab === 'signin') {
      if (tabSignIn) tabSignIn.classList.add('active');
      if (tabSignUp) tabSignUp.classList.remove('active');
      if (groupFullName) groupFullName.style.display = 'none';
      if (authSubmitText) authSubmitText.textContent = this.t('btn_signin');
    } else {
      if (tabSignUp) tabSignUp.classList.add('active');
      if (tabSignIn) tabSignIn.classList.remove('active');
      if (groupFullName) groupFullName.style.display = 'flex';
      if (authSubmitText) authSubmitText.textContent = this.t('btn_signup');
    }
  }

  togglePasswordVisibility(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  }

  handleAuthSubmit() {
    const emailInput = document.getElementById('authEmail');
    const nameInput = document.getElementById('authFullName');
    const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'tanvi.j@example.com';

    if (this.authTab === 'signup') {
      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Tanvi Joshi';
      this.currentUser = { name, email, isGuest: false };
      this.showToast(this.t('sign_up_welcome').replace('{name}', name));
    } else {
      const name = 'Tanvi Joshi';
      this.currentUser = { name, email, isGuest: false };
      this.showToast(this.t('sign_in_welcome').replace('{name}', name));
    }

    this.updateAuthUI();
  }

  loginWithSocial(provider) {
    const name = provider === 'google' ? 'Tanvi Joshi (Google)' : 'Tanvi Joshi (Apple)';
    this.currentUser = { name, email: 'tanvi.j@gmail.com', isGuest: false, provider };
    this.showToast(this.t('social_login_msg').replace('{provider}', provider === 'google' ? 'Google' : 'Apple'));
    this.updateAuthUI();
  }

  continueAsGuest() {
    this.currentUser = { name: 'Guest Explorer', email: 'Browsing as Guest', isGuest: true };
    this.showToast(this.t('guest_login_msg'));
    this.updateAuthUI();
    this.navigateTo('landing');
  }

  handleSignOut() {
    this.currentUser = null;
    this.showToast(this.t('sign_out_msg'));
    this.updateAuthUI();
  }

  updateAuthUI() {
    const loggedOutView = document.getElementById('authLoggedOutView');
    const loggedInView = document.getElementById('authLoggedInView');
    const toolbarAuthLabel = document.getElementById('toolbarAuthLabel');
    const userDisplayName = document.getElementById('userDisplayName');
    const userDisplayEmail = document.getElementById('userDisplayEmail');

    if (this.currentUser && !this.currentUser.isGuest) {
      if (loggedOutView) loggedOutView.style.display = 'none';
      if (loggedInView) loggedInView.style.display = 'block';
      if (toolbarAuthLabel) toolbarAuthLabel.textContent = this.currentUser.name.split(' ')[0];
      if (userDisplayName) userDisplayName.textContent = this.currentUser.name;
      if (userDisplayEmail) userDisplayEmail.textContent = this.currentUser.email;
    } else if (this.currentUser && this.currentUser.isGuest) {
      if (loggedOutView) loggedOutView.style.display = 'none';
      if (loggedInView) loggedInView.style.display = 'block';
      if (toolbarAuthLabel) toolbarAuthLabel.textContent = 'Guest';
      if (userDisplayName) userDisplayName.textContent = 'Guest Explorer';
      if (userDisplayEmail) userDisplayEmail.textContent = 'Guest Mode • Progress Not Synced';
    } else {
      if (loggedOutView) loggedOutView.style.display = 'block';
      if (loggedInView) loggedInView.style.display = 'none';
      if (toolbarAuthLabel) toolbarAuthLabel.textContent = 'Sign In / Account';
    }
  }

  // =============================================================================
  // MULTILINGUAL I18N ENGINE (EN, मराठी, हिंदी)
  // =============================================================================
  t(key) {
    const dict = I18N_DATA[this.currentLang] || I18N_DATA['en'];
    return dict[key] || (I18N_DATA['en'] && I18N_DATA['en'][key]) || key;
  }

  setLanguage(lang, showToastNotification = true) {
    const validLangs = ['en', 'mr', 'hi', 'fr', 'de', 'es', 'ja'];
    if (!validLangs.includes(lang)) lang = 'en';
    this.currentLang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = this.t(key);
      if (text) el.textContent = text;
    });

    // Update all input placeholders with data-i18n-ph
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      const ph = this.t(key);
      if (ph) el.placeholder = ph;
    });

    // Update active class across all language selectors & modal options
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-chip-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.mini-lang-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-card-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update current lang text in profile if present
    const langSummary = document.getElementById('currentLangSummary');
    if (langSummary) {
      const langNames = { en: 'English (Universal)', mr: 'मराठी (Pune Local)', hi: 'हिंदी (National)', fr: 'Français (French)', de: 'Deutsch (German)', es: 'Español (Spanish)', ja: '日本語 (Japanese)' };
      langSummary.innerText = langNames[lang] || lang;
    }

    if (showToastNotification) {
      this.showToast(this.t('lang_switched'));
    }
  }

  openLanguageModal() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeLanguageModal() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.classList.add('hidden');
  }

  setCurrency(curr) {
    if (!['INR', 'USD', 'EUR'].includes(curr)) curr = 'INR';
    this.currentCurrency = curr;

    document.querySelectorAll('.currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.curr === curr);
    });

    // Update budget badge and segmented buttons based on currency
    const badge = document.getElementById('budgetValueBadge');
    const activeBudgetBtn = document.querySelector('.budget-seg-btn.active');
    const budgetTier = activeBudgetBtn ? activeBudgetBtn.dataset.budget : 'mid';

    const budgetLabels = {
      INR: { low: "₹ Budget (< ₹500)", mid: "₹ Moderate (₹500 - 1200)", high: "₹₹ Premium (> ₹1200)" },
      USD: { low: "$ Budget (< $6 USD)", mid: "$ Moderate ($6 - $14 USD)", high: "$$ Premium (> $14 USD)" },
      EUR: { low: "€ Budget (< €5.5 EUR)", mid: "€ Moderate (€5.5 - €13 EUR)", high: "€€ Premium (> €13 EUR)" }
    };

    const labels = budgetLabels[curr] || budgetLabels['INR'];
    document.querySelectorAll('.budget-seg-btn').forEach(btn => {
      const bTier = btn.dataset.budget;
      if (labels[bTier]) btn.innerText = labels[bTier];
    });

    if (badge && labels[budgetTier]) {
      badge.innerText = labels[budgetTier];
    }

    this.showToast(`Display currency changed to ${curr}`);
  }

  toggleUniversalVisualMode(enabled) {
    this.universalVisualMode = enabled;
    document.body.classList.toggle('universal-visual-mode', enabled);
    this.showToast(enabled ? "🌐 Universal Pictorial & Icon Mode Enabled" : "Standard Visual Mode");
  }

  playPhoneticPhrase(key, phraseText) {
    this.showToast(`🔊 Pune Tourist Audio: "${phraseText}"`);
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(phraseText.split('(')[0].trim());
        utterance.lang = 'mr-IN';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback toast already shown
      }
    }
  }

  openAnnotationDetails(id) {
    const annot = UX_ANNOTATIONS[id];
    if (!annot) return;
    const drawer = document.getElementById('annotationDrawer');
    if (!drawer) return;

    const numEl = document.getElementById('drawerAnnotNum');
    const titleEl = document.getElementById('drawerAnnotTitle');
    const subEl = document.getElementById('drawerAnnotSub');
    const painEl = document.getElementById('drawerPainPoint');
    const heurEl = document.getElementById('drawerHeuristic');
    const ratEl = document.getElementById('drawerRationale');

    if (numEl) numEl.textContent = `#${id}`;
    if (titleEl) titleEl.textContent = annot.title;
    if (subEl) subEl.textContent = annot.heuristic;
    if (painEl) painEl.textContent = annot.painPoint;
    if (heurEl) heurEl.textContent = annot.heuristic;
    if (ratEl) ratEl.textContent = annot.rationale;

    drawer.classList.remove('hidden');
    drawer.classList.add('open');
  }

  closeAnnotationDrawer() {
    const drawer = document.getElementById('annotationDrawer');
    if (drawer) drawer.classList.add('hidden');
  }

  dismissErrorState() {
    const banner = document.getElementById('errorStateBanner');
    if (banner) banner.classList.add('hidden');
    this.showToast("Offline error dismissed. Cached Pune data active.");
  }

  showDiscoverPopover(item) {
    const popover = document.getElementById('discoverPlaceCardPopover');
    const thumb = document.getElementById('popoverThumb');
    const tag = document.getElementById('popoverTag');
    const title = document.getElementById('popoverTitle');
    const desc = document.getElementById('popoverDesc');

    if (!popover) return;

    if (thumb) thumb.style.backgroundImage = `url('${item.image}')`;
    if (tag) tag.innerText = item.categoryLabel;
    if (title) title.innerText = item.title;
    if (desc) desc.innerText = item.desc;

    popover.classList.remove('hidden');
  }

  closeDiscoverPopover() {
    const popover = document.getElementById('discoverPlaceCardPopover');
    if (popover) popover.classList.add('hidden');
  }

  addStopFromMap() {
    this.closeDiscoverPopover();
    this.showToast("Spot added to your current itinerary route!");
  }

  addToItinerary(name) {
    this.showToast(`'${name}' added to your route itinerary.`);
  }

  // =============================================================================
  // TIME TRAVEL ERA SELECTOR & THEN/NOW IMAGE SLIDER
  // =============================================================================
  switchEra(era) {
    const pill = document.getElementById('eraStatusPill');
    const heading = document.getElementById('eraHeadingText');
    const desc = document.getElementById('eraDescText');
    const buttons = document.querySelectorAll('.era-pill-btn');

    buttons.forEach(b => b.classList.toggle('active', b.dataset.era === era));

    const eraMap = {
      ancient: {
        pill: "RASHTRAKUTA & YADAVA ERA • 750 CE",
        heading: "Basalt Monoliths & Sacred Punawadi Village",
        desc: "Before the fortress existed, this bend of the Mutha River was a collection of agricultural hamlets. Ascetics carved subterranean monolithic shrines out of volcanic basalt rock."
      },
      medieval: {
        pill: "PESHWA ZENITH • 1758 CE",
        heading: "The Seven-Storey Wooden Palace of Bajirao I",
        desc: "At its height, the palace contained seven majestic teakwood storeys, marble courtyards, the Hazari Karanje fountain with 1,000 jets, and housed over 1,000 palace residents."
      },
      colonial: {
        pill: "FALL TO BRITISH & THE GREAT FIRE • 1818 - 1828 CE",
        heading: "British Garrison & The 7-Day Conflagration",
        desc: "Following the Battle of Kirkee in 1817, the Union Jack was hoisted. In 1828, an unexplained fire raged continuously for seven days, incinerating all upper wooden palaces."
      },
      modern: {
        pill: "PRESENT DAY • 2026 CE",
        heading: "National Monument & Sound-and-Light Heritage Site",
        desc: "Today, only the massive granite foundation plinth, fortified ramparts, and iron-spiked Dilli Darwaza survive, preserved by the Archeological Survey of India."
      }
    };

    const current = eraMap[era] || eraMap.medieval;
    if (pill) pill.innerText = current.pill;
    if (heading) heading.innerText = current.heading;
    if (desc) desc.innerText = current.desc;
  }

  setupThenNowSlider() {
    const container = document.getElementById('thenNowContainer');
    const nowLayer = document.getElementById('nowImageLayer');
    const handle = document.getElementById('splitSliderHandle');

    if (!container || !nowLayer || !handle) return;

    let isDragging = false;

    const updateSlider = (clientX) => {
      const rect = container.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      let pct = (offsetX / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));

      nowLayer.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
      handle.setAttribute('aria-valuenow', Math.round(pct));
    };

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
    container.addEventListener('touchstart', (e) => {
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });
  }

  // Audio Guide Player Simulation
  toggleAudioPlay() {
    const playBtn = document.getElementById('playAudioBtn');
    this.isPlayingAudio = !this.isPlayingAudio;

    if (this.isPlayingAudio) {
      if (playBtn) playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      this.startAudioTimer();
      this.showToast("Playing narration: The Fall of Narayanrao");
    } else {
      if (playBtn) playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      this.stopAudioTimer();
    }
  }

  startAudioTimer() {
    this.stopAudioTimer();
    this.audioTimer = setInterval(() => {
      if (this.audioSeconds < this.audioTotal) {
        this.audioSeconds++;
        this.updateAudioDisplay();
      } else {
        this.audioSeconds = 0;
        this.toggleAudioPlay();
      }
    }, 1000 / this.audioSpeed);
  }

  stopAudioTimer() {
    if (this.audioTimer) clearInterval(this.audioTimer);
  }

  updateAudioDisplay() {
    const timeDisplay = document.getElementById('audioCurrentTime');
    const slider = document.getElementById('audioSeekSlider');
    const mins = Math.floor(this.audioSeconds / 60);
    const secs = this.audioSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (timeDisplay) timeDisplay.innerText = formatted;
    if (slider) slider.value = this.audioSeconds;
  }

  seekAudio(val) {
    this.audioSeconds = parseInt(val, 10);
    this.updateAudioDisplay();
  }

  skipAudio(delta) {
    this.audioSeconds = Math.max(0, Math.min(this.audioTotal, this.audioSeconds + delta));
    this.updateAudioDisplay();
  }

  cycleAudioSpeed() {
    const btn = document.getElementById('audioSpeedBtn');
    if (this.audioSpeed === 1.0) this.audioSpeed = 1.25;
    else if (this.audioSpeed === 1.25) this.audioSpeed = 1.5;
    else this.audioSpeed = 1.0;

    if (btn) btn.innerText = `${this.audioSpeed.toFixed(1)}x`;
    if (this.isPlayingAudio) this.startAudioTimer();
    this.showToast(`Audio speed: ${this.audioSpeed}x`);
  }

  toggleTranscript() {
    const content = document.getElementById('transcriptContent');
    const arrow = document.getElementById('transcriptArrow');
    if (content) {
      content.classList.toggle('hidden');
      if (arrow) arrow.innerText = content.classList.contains('hidden') ? '▼' : '▲';
    }
  }

  // =============================================================================
  // AI TRIP PLANNER (Natural Language & Interactive Reordering)
  // =============================================================================
  applyPromptTemplate(text) {
    const textarea = document.getElementById('aiPromptInput');
    if (textarea) textarea.value = text;
    this.generateAIItinerary();
  }

  generateAIItinerary() {
    const loading = document.getElementById('aiLoadingState');
    const output = document.getElementById('plannerOutput');
    const statusText = document.getElementById('loadingStatusText');
    const step2 = document.getElementById('stepCheck2');
    const step3 = document.getElementById('stepCheck3');
    const textarea = document.getElementById('aiPromptInput');

    if (!loading || !output) return;

    output.style.display = 'none';
    loading.classList.remove('hidden');

    // Parse duration from user prompt text or slider
    let targetHours = 4.0;
    const promptText = textarea ? textarea.value : '';
    const hrMatch = promptText.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/i);
    if (hrMatch) {
      targetHours = parseFloat(hrMatch[1]);
    } else {
      const slider = document.getElementById('timeSlider');
      if (slider) targetHours = parseFloat(slider.value) || 4.0;
    }

    // Active interests in prompt or selected
    const activeInterests = Array.from(document.querySelectorAll('.interest-pill.active')).map(p => p.dataset.interest || '');
    const wantsFood = promptText.toLowerCase().includes('food') || promptText.toLowerCase().includes('misal') || promptText.toLowerCase().includes('chai') || activeInterests.includes('food');
    const wantsNature = promptText.toLowerCase().includes('tekdi') || promptText.toLowerCase().includes('sunset') || promptText.toLowerCase().includes('nature') || activeInterests.includes('nature');

    // Candidate stop pools
    const candidateStops = [
      { id: 1, durationMin: 45, tag: '🏛️ Heritage Anchor', name: 'Shaniwar Wada Palace & Dilli Darwaza', note: 'Morning sunlight through the massive northern spiked gates.' },
      { id: 2, durationMin: 30, tag: '🕊️ Sacred & Culture', name: 'Kasba Ganpati & Lal Mahal', note: 'Historic Gramdaivat of Pune established in 1630 CE.' },
      { id: 3, durationMin: 40, tag: '🍲 Iconic Veg Food', isFood: true, name: 'Kata Kirr Misal (Karve Road)', note: 'Authentic Puneri mild coriander kat with fresh pohe base.' },
      { id: 4, durationMin: 45, tag: '💎 Hidden Monolith', name: 'Pataleshwar Cave Temple (8th Century CE)', note: 'Cool subterranean basalt sanctuary carved during Rashtrakuta rule.' },
      { id: 5, durationMin: 45, tag: '🌿 Sunset Viewpoint', name: 'Vetal Tekdi Panoramic Ridge', note: 'Highest elevation in Pune city with breezy hill views.' },
      { id: 6, durationMin: 30, tag: '☕ Heritage Cafe', isFood: true, name: 'Good Luck Cafe (FC Road)', note: 'Irani bun maska and brewed chai since 1935.' },
      { id: 7, durationMin: 60, tag: '🏰 Hill Fortress', name: 'Sinhagad Fort Mountain Bastions', note: 'Historic Maratha bastion with views of Khadakwasla valley.' },
      { id: 8, durationMin: 40, tag: '🎨 Cultural Collection', name: 'Raja Dinkar Kelkar Museum', note: '36 rooms of rare Peshwa-era musical instruments and carvings.' },
      { id: 9, durationMin: 35, tag: '🛍️ Historic Bazaar', name: 'Tulsi Baug Old Market Walk', note: 'Centuries-old pedestrian streets selling brassware and textiles.' }
    ];

    // Select stop count based on targetHours: ~1 stop per 50-60 mins
    let stopCount = Math.max(2, Math.min(6, Math.round(targetHours * 1.1)));
    if (targetHours <= 1.5) stopCount = 2;
    else if (targetHours <= 3.0) stopCount = 3;
    else if (targetHours <= 5.0) stopCount = 4;
    else if (targetHours <= 7.0) stopCount = 5;
    else stopCount = 6;

    // Filter/prioritize candidates
    let chosen = [];
    if (wantsNature) chosen.push(candidateStops[4]);
    if (wantsFood) chosen.push(candidateStops[2]);
    chosen.push(candidateStops[0]);
    chosen.push(candidateStops[1]);

    candidateStops.forEach(st => {
      if (!chosen.find(c => c.id === st.id)) chosen.push(st);
    });
    chosen = chosen.slice(0, stopCount);

    // Build timeline clock times starting from 10:00 AM
    let currentMin = 10 * 60; // 10:00 AM
    this.itineraryStops = chosen.map((stop) => {
      const h24 = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 > 12 ? h24 - 12 : (h24 === 0 ? 12 : h24);
      const timeStr = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      currentMin += stop.durationMin + 15; // 15 mins transit
      return {
        id: stop.id,
        time: timeStr,
        duration: `${stop.durationMin} mins`,
        tag: stop.tag,
        isFood: stop.isFood || false,
        name: stop.name,
        note: stop.note
      };
    });

    const totalDurMin = currentMin - (10 * 60) - 15;
    const durH = Math.floor(totalDurMin / 60);
    const durM = totalDurMin % 60;
    const estKm = (stopCount * 1.3).toFixed(1);

    setTimeout(() => {
      if (statusText) statusText.innerText = `Analyzing heritage sites and pacing schedule for ${targetHours} hours...`;
      if (step2) step2.classList.add('active');
    }, 400);

    setTimeout(() => {
      if (statusText) statusText.innerText = `Optimizing transit and dietary preferences for ${stopCount} stops...`;
      if (step3) step3.classList.add('active');
    }, 800);

    setTimeout(() => {
      loading.classList.add('hidden');
      output.style.display = 'block';

      // Update total summary line in planner output
      const totalStat = document.querySelector('.itinerary-total-stat');
      if (totalStat) {
        totalStat.innerText = `${stopCount} Stops • ${durH} hrs ${durM} mins • ${estKm} km`;
      }

      this.renderItineraryStops();
      this.showToast(`AI Itinerary updated for ${targetHours}h (${stopCount} stops)!`);
    }, 1200);
  }

  renderItineraryStops() {
    const list = document.getElementById('itineraryStopsList');
    if (!list) return;

    let html = '';
    this.itineraryStops.forEach((stop, idx) => {
      html += `
        <div class="itinerary-stop-card cp-card" data-stop-id="${stop.id}">
          <div class="stop-time-col">
            <span class="stop-clock">${stop.time}</span>
            <span class="stop-duration">${stop.duration}</span>
          </div>
          <div class="stop-content-col">
            <div class="stop-header">
              <span class="stop-category-tag ${stop.isFood ? 'food-tag' : ''}">${stop.tag}</span>
              <div class="stop-reorder-actions">
                <button class="btn-reorder" onclick="app.moveStop(${stop.id}, 'up')" title="Move earlier">▲</button>
                <button class="btn-reorder" onclick="app.moveStop(${stop.id}, 'down')" title="Move later">▼</button>
                <button class="btn-delete-stop" onclick="app.deleteStop(${stop.id})" title="Remove stop">✕</button>
              </div>
            </div>
            <h4 class="stop-name">${stop.name}</h4>
            <p class="stop-note">${stop.note}</p>
          </div>
        </div>
      `;

      if (idx < this.itineraryStops.length - 1) {
        html += `
          <div class="transit-connector">
            <span class="transit-icon">🚶</span>
            <span class="transit-text">Paced transit: ~8 min walk between historical waypoints</span>
          </div>
        `;
      }
    });

    list.innerHTML = html;
  }

  moveStop(id, direction) {
    const index = this.itineraryStops.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = this.itineraryStops[index];
      this.itineraryStops[index] = this.itineraryStops[index - 1];
      this.itineraryStops[index - 1] = temp;
      this.renderItineraryStops();
      this.showToast("Itinerary updated: Stop moved earlier");
    } else if (direction === 'down' && index < this.itineraryStops.length - 1) {
      const temp = this.itineraryStops[index];
      this.itineraryStops[index] = this.itineraryStops[index + 1];
      this.itineraryStops[index + 1] = temp;
      this.renderItineraryStops();
      this.showToast("Itinerary updated: Stop moved later");
    }
  }

  deleteStop(id) {
    this.itineraryStops = this.itineraryStops.filter(s => s.id !== id);
    this.renderItineraryStops();
    this.showToast("Stop removed from itinerary schedule.");
  }

  addCustomStopPrompt() {
    const customName = prompt("Enter a custom Pune stop name (e.g. Tulsi Baug Shopping, Raja Kelkar Museum):");
    if (customName && customName.trim() !== '') {
      const newStop = {
        id: Date.now(),
        time: '01:30 PM',
        duration: '35 mins',
        tag: '✨ Custom Addition',
        name: customName.trim(),
        note: 'Personalized stop added to your itinerary schedule.'
      };
      this.itineraryStops.push(newStop);
      this.renderItineraryStops();
      this.showToast(`Added '${newStop.name}' to itinerary!`);
    }
  }

  resetPlanner() {
    this.itineraryStops = [
      { id: 1, time: '10:00 AM', duration: '45 mins', tag: '🏛️ Heritage Anchor', name: 'Shaniwar Wada Palace & Dilli Darwaza', note: 'Morning sunlight through the massive northern spiked gates.' },
      { id: 2, time: '10:51 AM', duration: '30 mins', tag: '🕊️ Sacred & Culture', name: 'Kasba Ganpati & Lal Mahal', note: 'Historic Gramdaivat of Pune established in 1630 CE.' },
      { id: 3, time: '11:30 AM', duration: '45 mins', tag: '🍲 Iconic Veg Brunch', isFood: true, name: 'Kata Kirr Misal (Karve Road)', note: 'Authentic Puneri mild coriander kat with fresh pohe base.' },
      { id: 4, time: '12:30 PM', duration: '50 mins', tag: '💎 Hidden Monolith', name: 'Pataleshwar Cave Temple (8th Century CE)', note: 'Cool subterranean basalt sanctuary carved during Rashtrakuta rule.' }
    ];
    this.renderItineraryStops();
    this.showToast("Planner reset to standard 4-hour Pune itinerary");
  }

  // =============================================================================
  // LIVE NAVIGATION MODE CONTROLS (Turn Guidance, Proximity Stories)
  // =============================================================================
  toggleNavMute() {
    const btn = document.getElementById('muteNavBtn');
    if (!btn) return;
    btn.classList.toggle('muted');
    if (btn.classList.contains('muted')) {
      btn.style.color = '#EF4444';
      this.showToast("Voice navigation muted");
    } else {
      btn.style.color = '#FFFFFF';
      this.showToast("Voice navigation unmuted");
    }
  }

  toggleNavHistoryLayer() {
    this.historyLayerEnabled = !this.historyLayerEnabled;
    const txt = document.getElementById('navHistoryText');
    if (txt) txt.innerText = this.historyLayerEnabled ? 'ON' : 'OFF';
    this.syncHistoryToggle(this.historyLayerEnabled);
  }

  toggleNavBottomSheet() {
    const sheet = document.getElementById('navBottomSheet');
    if (sheet) sheet.classList.toggle('collapsed');
  }

  toggleNavAudio(btn) {
    if (btn.innerText.includes('Play')) {
      btn.innerText = '⏸ Pause Story';
      this.showToast("Playing Lakdi Pul 1761 retreat narrative...");
    } else {
      btn.innerText = '▶ Play Story (1m 15s)';
      this.showToast("Story paused");
    }
  }

  dismissStoryCard() {
    const card = document.getElementById('proximityStoryCard');
    if (card) card.classList.add('hidden');
    this.showToast("Story dismissed. Proceeding along Lakdi Pul.");
  }

  skipCurrentStop() {
    this.showToast("Skipped Lakdi Pul waypoint. Next destination: Shaniwar Wada Palace.");
  }

  triggerRerouteModal() {
    this.showToast("Recalculating fastest detour via Tilak Road...");
  }

  // =============================================================================
  // POST-EXPERIENCE REWARDS & DEDICATED SAVED DIARY
  // =============================================================================
  setRating(stars) {
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx < stars);
    });
    this.showToast(`Thank you! Saved ${stars}-star rating.`);
  }

  showBadgeModal(badgeName) {
    const modal = document.getElementById('badgeModal');
    const title = document.getElementById('celebrateTitle');
    if (modal && title) {
      title.innerText = `Badge Unlocked: ${badgeName}!`;
      modal.classList.remove('hidden');
    }
  }

  closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) modal.classList.add('hidden');
  }

  shareTrip() {
    this.showToast("Digital Postcard copied to clipboard! Ready to share.");
  }

  switchSavedTab(tabKey) {
    const chips = document.querySelectorAll('#screen-saved .cp-chip');
    chips.forEach(c => c.classList.toggle('active', c.dataset.savedTab === tabKey));

    const container = document.getElementById('savedItemsContainer');
    if (!container) return;

    const data = {
      places: [
        { img: 'images/shaniwar_wada_modern.jpg', title: 'Shaniwar Wada Palace', sub: 'Audio narration & 1780 timeline saved', tag: 'Historic Monument' },
        { img: 'images/pataleshwar_cave.jpg', title: 'Pataleshwar Rock-Cut Temple', sub: '8th-century subterranean monolith', tag: 'Hidden Gem' },
        { img: 'images/sinhagad_fort.jpg?v=20261005_sunrise', title: 'Sinhagad Fort Ramparts', sub: 'Saved for weekend morning trek', tag: 'Historic Fort' }
      ],
      foods: [
        { img: 'images/puneri_misal.jpg', title: 'Kata Kirr Misal (Karve Road)', sub: 'Saved for next weekend breakfast', tag: 'Food Legend', amber: true },
        { img: 'images/sujata_mastani.jpg', title: 'Sujata Mastani (Sadashiv Peth)', sub: 'Kesar Mango ice cream shake', tag: 'Dessert Icon', amber: true }
      ],
      itineraries: [
        { img: 'images/pune_heritage_hero.jpg', title: 'Old Pune Heritage Walk (3.5h)', sub: '4 stops • 4.8 km completed', tag: 'Completed Trail' }
      ],
      badges: [
        { img: 'images/shaniwar_wada_modern.jpg', title: 'Peshwa Chronicler (Level 3)', sub: 'Unlocked Shaniwar Wada & Lakdi Pul stories', tag: 'Mastery Badge' },
        { img: 'images/puneri_misal.jpg', title: 'Misal Connoisseur', sub: 'Sampled authentic Puneri kat breakfast', tag: 'Food Explorer', amber: true }
      ]
    };

    const items = data[tabKey] || data.places;
    let html = '';
    items.forEach(it => {
      html += `
        <div class="saved-item-row cp-card">
          <img src="${it.img}" alt="${it.title}" class="saved-item-thumb">
          <div class="saved-item-info">
            <strong>${it.title}</strong>
            <span>${it.sub}</span>
            <span class="saved-meta-tag ${it.amber ? 'amber' : ''}">${it.tag}</span>
          </div>
          <button class="btn-ghost-sm" onclick="event.stopPropagation(); app.showToast('Removed from saved')">✕</button>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // =============================================================================
  // EXTERNAL ANNOTATION MARGIN RAIL (Never Covers UI Content)
  // =============================================================================
  updateAnnotationRail(screenId) {
    const list = document.getElementById('railBadgesList');
    if (!list) return;

    // Filter annotations for active screen or show all with current screen prioritized
    let html = '';
    Object.keys(UX_ANNOTATIONS).forEach(id => {
      const annot = UX_ANNOTATIONS[id];
      const isCurrentScreen = annot.screen === screenId;

      html += `
        <div class="rail-badge-card ${isCurrentScreen ? 'highlighted' : ''}" style="${isCurrentScreen ? 'border-color: var(--accent-amber); background: #FFF;' : ''}">
          <div class="badge-card-header">
            <span class="badge-num-pill">#${id}</span>
            <h4 class="badge-card-title">${annot.title}</h4>
          </div>
          <span class="badge-card-heuristic">${annot.heuristic}</span>
          <p class="badge-card-pain"><strong>Pain:</strong> ${annot.painPoint}</p>
          <div class="badge-card-rationale"><strong>Solution:</strong> ${annot.rationale}</div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  toggleAnnotations() {
    this.annotationsActive = !this.annotationsActive;
    const btn = document.getElementById('toggleAnnotationsBtn');
    const txt = document.getElementById('annotStatusText');

    if (this.annotationsActive) {
      document.body.classList.remove('annotations-off');
      if (btn) btn.classList.add('active');
      if (txt) txt.innerText = 'ON';
      this.showToast("UX Annotations ON (Docked safely in margin rail)");
    } else {
      document.body.classList.add('annotations-off');
      if (btn) btn.classList.remove('active');
      if (txt) txt.innerText = 'OFF';
      this.showToast("UX Annotations hidden for clean prototype testing");
    }
  }

  // =============================================================================
  // MODALS: PROFILE, SETTINGS, COMPARE, ONBOARDING
  // =============================================================================
  openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('hidden');
  }

  openRouteCompareModal() {
    const modal = document.getElementById('routeCompareModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeRouteCompareModal() {
    const modal = document.getElementById('routeCompareModal');
    if (modal) modal.classList.add('hidden');
  }

  openOnboardingModal() {
    this.onboardingStep = 1;
    this.updateOnboardModalContent();
    const modal = document.getElementById('onboardingModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    if (modal) modal.classList.add('hidden');
  }

  nextOnboardStep() {
    if (this.onboardingStep < 3) {
      this.onboardingStep++;
      this.updateOnboardModalContent();
    } else {
      this.closeOnboardingModal();
      this.navigateTo('preferences');
    }
  }

  updateOnboardModalContent() {
    const visual = document.getElementById('onboardStepVisual');
    const heading = document.getElementById('onboardStepHeading');
    const desc = document.getElementById('onboardStepDesc');
    const dots = document.querySelectorAll('.onboard-dots-track .dot-item');
    const nextBtn = document.getElementById('onboardNextBtn');

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.onboardingStep - 1);
    });

    if (this.onboardingStep === 1) {
      if (visual) visual.innerText = "🧭";
      if (heading) heading.innerText = "1. Set your vibe & companions";
      if (desc) desc.innerText = "Solo, couple, friends, or family with kids — routes automatically adapt to your walking speed, rest needs, and interests.";
      if (nextBtn) nextBtn.innerText = "Next Step →";
    } else if (this.onboardingStep === 2) {
      if (visual) visual.innerText = "🛣️";
      if (heading) heading.innerText = "2. Pick your route flavor";
      if (desc) desc.innerText = "Choose between Heritage trails, Street Food crawls, Scenic greenery, or Fast transit. See 'Why this fits you' before deciding.";
      if (nextBtn) nextBtn.innerText = "Next Step →";
    } else if (this.onboardingStep === 3) {
      if (visual) visual.innerText = "🎧";
      if (heading) heading.innerText = "3. Listen & discover along the way";
      if (desc) desc.innerText = "As you move through Pune, location-triggered audio stories unlock the 300-year history hidden beneath everyday streets.";
      if (nextBtn) nextBtn.innerText = "Start Personalizing →";
    }
  }

  syncHistoryToggle(enabled) {
    this.historyLayerEnabled = enabled;
    const prefToggle = document.getElementById('historyLayerToggle');
    const modalToggle = document.getElementById('modalHistoryToggle');
    const statusText = document.getElementById('historyToggleText');
    const navText = document.getElementById('navHistoryText');

    if (prefToggle) prefToggle.checked = enabled;
    if (modalToggle) modalToggle.checked = enabled;
    if (statusText) {
      statusText.innerText = enabled ? "ON (Default)" : "OFF (Lightweight)";
      statusText.style.background = enabled ? "var(--status-success)" : "var(--slate-500)";
    }
    if (navText) navText.innerText = enabled ? 'ON' : 'OFF';

    this.showToast(`Living History Layer: ${enabled ? 'Active with 300-year audio narratives' : 'Disabled (Fast transit mode)'}`);
  }

  setAudioSpeed(speed) {
    this.audioSpeed = parseFloat(speed);
    this.showToast(`Audio guide narration speed: ${speed}x`);
  }

  setPlatformComplexity(mode) {
    const btnSimple = document.getElementById('btnSimpleMode');
    const btnExplorer = document.getElementById('btnExplorerMode');

    if (mode === 'simple') {
      document.body.classList.add('simple-mode');
      if (btnSimple) btnSimple.classList.add('active');
      if (btnExplorer) btnExplorer.classList.remove('active');
      this.showToast("🌱 Simple Mode Active: 1-Tap Ready Routes prioritized for beginners");
    } else {
      document.body.classList.remove('simple-mode');
      if (btnSimple) btnSimple.classList.remove('active');
      if (btnExplorer) btnExplorer.classList.add('active');
      this.showToast("⚡ Deep Explorer Mode: Full multi-filter controls and timeline editors enabled.");
    }
  }

  launchQuickTrip(tripType) {
    if (tripType === 'heritage') {
      this.navigateTo('routes');
      this.selectRouteOption('heritage');
      this.showToast("⚡ 1-Tap Route Loaded: 2-Hour Iconic Heritage Highlights!");
    } else if (tripType === 'food') {
      this.navigateTo('food');
      this.switchFoodTab('misal');
      this.showToast("⚡ 1-Tap Trail Loaded: Pune Legendary Street Food Crawl!");
    } else if (tripType === 'scenic') {
      this.navigateTo('place');
      this.switchEra('ancient');
      this.showToast("⚡ 1-Tap Landmark Loaded: 8th-Century Pataleshwar Monolith!");
    }
  }

  setDeviceMode(mode) {
    this.deviceMode = mode;
    const deviceFrame = document.getElementById('deviceFrame');
    const deviceButtons = document.querySelectorAll('.device-btn');

    deviceButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === mode);
    });

    if (deviceFrame) {
      deviceFrame.className = 'device-frame';
      deviceFrame.classList.add(`device-${mode}`);
    }

    // Invalidate Leaflet maps after layout change
    setTimeout(() => {
      if (this.mapManager && this.mapManager.map) this.mapManager.map.invalidateSize();
      if (this.discoverMapManager && this.discoverMapManager.map) this.discoverMapManager.map.invalidateSize();
      if (this.placeMapManager && this.placeMapManager.map) this.placeMapManager.map.invalidateSize();
      if (this.navMapManager && this.navMapManager.map) this.navMapManager.map.invalidateSize();
    }, 200);

    this.showToast(`Switched viewport to ${mode.toUpperCase()} responsive layout`);
  }

  setSystemState(state) {
    if (state === 'loading') {
      this.navigateTo('planner');
      this.generateAIItinerary();
    } else if (state === 'empty') {
      this.navigateTo('discover');
      const list = document.getElementById('discoverListWrapper');
      if (list) {
        list.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: #FFF; border-radius: 16px; border: 1.5px dashed #CBD5E1;">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Zero Historical Spots Found</h3>
            <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 16px;">We couldn't find matching places within a 5-minute walk of this specific query.</p>
            <button class="btn-primary" style="display: inline-flex;" onclick="app.filterDiscover('all')">
              <span>Reset Filters & Show All Pune Gems</span>
            </button>
          </div>
        `;
      }
      this.showToast("Simulating: Zero Results Empty State");
    } else if (state === 'error') {
      this.showToast("Simulating: Offline Network Error (Local Pune Heritage Pack active)");
    } else if (state === 'gps_error') {
      this.showToast("Simulating: Weak GPS Signal (Dead reckoning enabled)");
    } else {
      this.navigateTo('discover');
      this.filterDiscover('all');
      this.showToast("System State: Normal Active");
    }
  }

  showToast(message) {
    const toast = document.getElementById('appToast');
    const msg = document.getElementById('toastMessage');
    if (!toast || !msg) return;

    msg.innerText = message;
    toast.classList.remove('hidden');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  toggleBookmark(btn) {
    btn.classList.toggle('bookmarked');
    if (btn.classList.contains('bookmarked')) {
      btn.style.color = "var(--accent-amber)";
      this.showToast("Saved to your Personal Travel Diary!");
    } else {
      btn.style.color = "var(--slate-700)";
      this.showToast("Removed from Travel Diary");
    }
  }

  selectTravelGroup(cardEl, groupName) {
    document.querySelectorAll('.group-card').forEach(c => c.classList.remove('active'));
    if (cardEl) {
      cardEl.classList.add('active');
      const titleEl = cardEl.querySelector('.group-title');
      const title = titleEl ? titleEl.innerText : groupName;
      this.showToast(`Pacing adjusted for ${title} traveler`);
      this.updateRouteMatches(true);
    }
  }

  toggleInterest(pillEl) {
    if (!pillEl) return;
    pillEl.classList.toggle('active');
    const activeCount = document.querySelectorAll('.interest-pill.active').length;
    if (activeCount === 0) {
      this.showToast("Select at least 1 interest to personalize stories");
    }
    this.updateRouteMatches(true);
    if (typeof mlUpdateMatchSummary === 'function') mlUpdateMatchSummary();
    if (typeof mlDebounce === 'function' && typeof mlLoadRoutes === 'function') {
      mlDebounce(() => {
        if (window.app && window.app.currentScreen === 'routes') mlLoadRoutes();
        if (window.app && window.app.currentScreen === 'food' && typeof mlLoadFoodRecommendations === 'function') {
          mlLoadFoodRecommendations();
        }
      }, 400);
    }
  }

  selectBudget(btnEl, budgetTier) {
    document.querySelectorAll('.budget-seg-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
      const badge = document.getElementById('budgetValueBadge');
      if (badge) badge.innerText = btnEl.innerText;
      this.updateRouteMatches(true);
    }
  }

  setQuickTime(hours) {
    const timeSlider = document.getElementById('timeSlider');
    const timeBadge = document.getElementById('timeValueBadge');
    if (timeSlider) {
      timeSlider.value = hours;
      if (timeBadge) timeBadge.innerText = `${hours} Hours`;
      this.showToast(`Time window set to ${hours} hours`);
      this.updateRouteMatches(true);
    }
  }

  updateRouteMatches(userInteracted = true) {
    const timeSlider = document.getElementById('timeSlider');
    const timeVal = parseFloat(timeSlider ? timeSlider.value : 3.5);
    const activeGroupCard = document.querySelector('.group-card.active');
    const group = activeGroupCard ? activeGroupCard.dataset.group : 'solo';
    const activePills = document.querySelectorAll('.interest-pill.active');
    const activeInterests = Array.from(activePills).map(p => p.dataset.interest);

    const btnText = document.getElementById('btnGenerateRoutesText');
    const summaryText = document.getElementById('matchSummaryText');
    const dot = document.getElementById('matchIndicatorDot');

    if (!userInteracted) {
      if (btnText) btnText.innerText = "Apply Preferences & Find Routes";
      if (summaryText) summaryText.innerText = "Select persona, time window & interests above to personalize";
      if (dot) dot.className = "match-indicator-dot neutral";
      return;
    }

    // Dynamic calculation based on live user choices
    let count = 3;
    let label = "Curated";
    if (timeVal <= 1.5) {
      count = 1;
      label = "Express";
    } else if (timeVal <= 3.5) {
      count = activeInterests.includes('food') ? 3 : 2;
      label = "Half-Day";
    } else if (timeVal <= 6) {
      count = 4;
      label = "Full-Day";
    } else {
      count = 2;
      label = "Grand Heritage";
    }

    const groupNames = { solo: 'Solo Explorer', couple: 'Couple', friends: 'Friends', family: 'Family' };
    const groupLabel = groupNames[group] || 'Custom';

    if (btnText) {
      btnText.innerText = `Generate Routes (${count} Matches Found)`;
    }
    if (summaryText) {
      summaryText.innerText = `✓ Found ${count} ${label} routes for ${groupLabel} (${timeVal}h)`;
    }
    if (dot) {
      dot.className = "match-indicator-dot active";
    }
  }

  resetPreferences() {
    const timeSlider = document.getElementById('timeSlider');
    const timeBadge = document.getElementById('timeValueBadge');
    if (timeSlider) timeSlider.value = 3.5;
    if (timeBadge) timeBadge.innerText = "3.5 Hours";

    // Reset Group cards to 'solo'
    document.querySelectorAll('.group-card').forEach(card => {
      card.classList.toggle('active', card.dataset.group === 'solo');
    });

    // Reset Interests to defaults (history, food, culture, photography)
    const defaultInterests = ['history', 'food', 'culture', 'photography'];
    document.querySelectorAll('.interest-pill').forEach(pill => {
      pill.classList.toggle('active', defaultInterests.includes(pill.dataset.interest));
    });

    // Reset Budget to 'mid'
    document.querySelectorAll('.budget-seg-btn').forEach(btn => {
      const isMid = btn.dataset.budget === 'mid';
      btn.classList.toggle('active', isMid);
      if (isMid) {
        const badge = document.getElementById('budgetValueBadge');
        if (badge) badge.innerText = btn.innerText;
      }
    });

    this.syncHistoryToggle(true);
    this.updateRouteMatches(false);
    this.showToast("Preferences reset to default Solo Explorer settings");
  }

  // Bind Standard UI Event Listeners
  bindEvents() {
    // Annotation badges click to open details drawer
    document.querySelectorAll('.ux-annotation-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = badge.dataset.annotId || badge.textContent.trim();
        this.openAnnotationDetails(id);
      });
    });

    // Device preview switcher
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setDeviceMode(btn.dataset.device));
    });

    // Flow breadcrumbs
    document.querySelectorAll('.flow-step-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.screen) this.navigateTo(item.dataset.screen);
      });
    });

    // Annotations toggle
    const annotToggle = document.getElementById('toggleAnnotationsBtn');
    if (annotToggle) annotToggle.addEventListener('click', () => this.toggleAnnotations());

    // Rationale CTA
    const rationaleBtn = document.getElementById('viewRationaleBtn');
    if (rationaleBtn) rationaleBtn.addEventListener('click', () => this.navigateTo('rationale'));

    // State Selector
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
      stateSelector.addEventListener('change', (e) => this.setSystemState(e.target.value));
    }

    // Preferences: Group selection (.group-card)
    document.querySelectorAll('.group-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.group-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const titleEl = card.querySelector('.group-title');
        const title = titleEl ? titleEl.innerText : (card.dataset.group || 'Custom');
        this.showToast(`Pacing adjusted for ${title} traveler`);
      });
      // Keyboard support (Accessibility)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Preferences: Interest pills multi-select (.interest-pill)
    document.querySelectorAll('.interest-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
        const activeCount = document.querySelectorAll('.interest-pill.active').length;
        if (activeCount === 0) {
          this.showToast("Select at least 1 interest to personalize stories");
        }
        this.updateRouteMatches(true);
      });
    });

    // Preferences: Time slider
    const timeSlider = document.getElementById('timeSlider');
    const timeBadge = document.getElementById('timeValueBadge');
    if (timeSlider && timeBadge) {
      timeSlider.addEventListener('input', (e) => {
        timeBadge.innerText = `${e.target.value} Hours`;
        this.updateRouteMatches(true);
      });
    }

    // Preferences: Quick jump slider ticks
    document.querySelectorAll('.slider-ticks span').forEach(tick => {
      tick.addEventListener('click', () => {
        const text = tick.innerText;
        let val = 3.5;
        if (text.includes('1h')) val = 1;
        else if (text.includes('3h')) val = 3;
        else if (text.includes('6h')) val = 6;
        else if (text.includes('10h')) val = 10;
        
        if (timeSlider) {
          timeSlider.value = val;
          if (timeBadge) timeBadge.innerText = `${val} Hours`;
          this.showToast(`Time window set to ${val} hours`);
          this.updateRouteMatches(true);
        }
      });
    });

    // Preferences: Budget segmented control (.budget-seg-btn)
    document.querySelectorAll('.budget-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.budget-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const badge = document.getElementById('budgetValueBadge');
        if (badge) badge.innerText = btn.innerText;
        this.updateRouteMatches(true);
      });
    });

    // Preferences: History layer toggle
    const historyToggle = document.getElementById('historyLayerToggle');
    if (historyToggle) {
      historyToggle.addEventListener('change', (e) => this.syncHistoryToggle(e.target.checked));
    }

    // Landing search clear button
    const searchInput = document.getElementById('landingSearchInput');
    const clearBtn = document.getElementById('clearLandingSearch');
    if (searchInput && clearBtn) {
      searchInput.addEventListener('input', (e) => {
        clearBtn.classList.toggle('hidden', e.target.value.length === 0);
      });
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
      });
    }
  }
}

// Instantiate App
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChronopathApp();
});

// =============================================================================
// ML INTEGRATION LAYER — ChronoPath Navigator AI Engine
// Connects to FastAPI ML service on port 8001
// Gracefully degrades when API is offline (fallback to static content)
// =============================================================================

const ML_API = 'http://localhost:8001';
const ML_TIMEOUT_MS = 4000;

const ML_STATE = {
  apiOnline: false, persona: 'Casual Visitor', personaEmoji: '🚶',
  userId: null, lastRoutes: [], lastFood: [], crowdCache: {},
};

const PERSONA_EMOJI = {
  'Heritage Scholar': '🏛️', 'Foodie Explorer': '🍜',
  'Nature & Adventure Walker': '🌿', 'Diligent Planner': '📋', 'Casual Visitor': '🚶',
};

async function mlFetch(endpoint, body = null, method = 'POST') {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ML_TIMEOUT_MS);
  try {
    const opts = { method, signal: ctrl.signal, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${ML_API}${endpoint}`, opts);
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) { clearTimeout(tid); return null; }
}

async function mlCheckHealth() {
  const data = await mlFetch('/api/health', null, 'GET');
  ML_STATE.apiOnline = !!(data && data.status === 'ok');
  renderMLStatusBadge();
  return ML_STATE.apiOnline;
}

function renderMLStatusBadge() {
  let badge = document.getElementById('mlStatusBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'mlStatusBadge';
    badge.style.cssText = 'position:fixed;bottom:80px;right:12px;z-index:9999;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;display:flex;align-items:center;gap:5px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18);transition:opacity .3s;';
    badge.title = 'ML API Status — Click to refresh';
    badge.addEventListener('click', () => { mlCheckHealth(); mlPersonaDetect(); });
    document.body.appendChild(badge);
  }
  if (ML_STATE.apiOnline) {
    badge.style.background = '#0D9488'; badge.style.color = '#fff';
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#6EE7B7;display:inline-block;"></span> ML Online';
  } else {
    badge.style.background = '#F59E0B'; badge.style.color = '#fff';
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#FDE68A;display:inline-block;"></span> ML Offline';
  }
}

function mlReadPreferences() {
  const slider = document.getElementById('timeSlider');
  const groupCard = document.querySelector('.group-card.active');
  const budgetBtn = document.querySelector('.budget-seg-btn.active');
  const pills = document.querySelectorAll('.interest-pill.active');
  const now = new Date();
  const month = now.getMonth() + 1;
  return {
    group_type: groupCard ? (groupCard.dataset.group || 'solo') : 'solo',
    time_available_h: parseFloat(slider ? slider.value : 3.5),
    budget_tier: budgetBtn ? (budgetBtn.dataset.budget || 'mid') : 'mid',
    interests: Array.from(pills).map(p => p.dataset.interest || '').filter(Boolean),
    hour_of_day: now.getHours(), day_of_week: now.getDay(), month,
    is_weekend: (now.getDay() === 0 || now.getDay() === 6) ? 1 : 0,
    weather_condition: 'sunny', traffic_level: 'low', tourist_type: 'domestic',
    season: [6,7,8,9].includes(month) ? 'monsoon' : [3,4,5].includes(month) ? 'summer' : 'winter',
  };
}

async function mlPersonaDetect() {
  if (!ML_STATE.apiOnline) return;
  const data = await mlFetch('/api/persona/detect', { user_id: ML_STATE.userId });
  if (!data) return;
  ML_STATE.persona = data.persona_label;
  ML_STATE.personaEmoji = PERSONA_EMOJI[data.persona_label] || '🚶';
  const el = document.getElementById('mlPersonaLabel');
  if (el) el.innerHTML = `${ML_STATE.personaEmoji} <strong>${data.persona_label}</strong><span style="font-size:10px;color:#6B7280;margin-left:4px;">${data.is_returning ? '(returning user)' : '(detected)'}</span>`;
}

async function mlLoadRoutes() {
  const prefs = mlReadPreferences();
  const routeList = document.getElementById('mlRoutesList');
  if (!routeList) return;
  routeList.innerHTML = '<div style="padding:16px;text-align:center;color:#6B7280;"><div style="display:inline-block;width:24px;height:24px;border:3px solid #0D9488;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="margin-top:8px;font-size:13px;">🤖 ML engine ranking routes for you…</p></div>';
  if (!ML_STATE.apiOnline) { routeList.innerHTML = '<p style="padding:16px;color:#9CA3AF;font-size:13px;">⚠️ ML API offline — start the API server.</p>'; return; }
  const data = await mlFetch('/api/route/recommend', { user_id: ML_STATE.userId, persona_label: ML_STATE.persona, group_type: prefs.group_type, time_available_h: prefs.time_available_h, budget_tier: prefs.budget_tier, interests: prefs.interests, top_n: 4 });
  if (!data || !data.recommendations || !data.recommendations.length) { routeList.innerHTML = '<p style="padding:16px;color:#9CA3AF;font-size:13px;">No routes found. Try adjusting preferences.</p>'; return; }
  ML_STATE.lastRoutes = data.recommendations;
  const topRoute = data.recommendations[0];
  const timePred = await mlFetch('/api/time/predict', { stops_count: topRoute.stops_count, total_distance_km: topRoute.avg_time_h * 2.5, time_estimated_h: topRoute.avg_time_h, route_type: topRoute.route_type, group_type: prefs.group_type, budget_tier: prefs.budget_tier, tourist_type: 'domestic', weather_condition: 'sunny', traffic_level: 'low', season: prefs.season, hour_of_day: prefs.hour_of_day, day_of_week: prefs.day_of_week, month: prefs.month, is_weekend: prefs.is_weekend, is_festival_season: 0, avg_time_available: prefs.time_available_h, visit_count: 1, badges_earned: 0, audio_plays: 2, photos_taken: 3, history_layer_used: 1, history_layer_on: 1 });
  const cuisineEmoji_r = { heritage:'🏛️', food:'🍜', nature:'🌿', mixed:'✨' };
  routeList.innerHTML = data.recommendations.map((r, idx) => {
    const isFirst = idx === 0;
    const xgbChip = isFirst && timePred ? `<span class="ml-pred-chip" title="${timePred.accuracy_note}">🤖 XGBoost: ${timePred.display}</span>` : '';
    const rankBadge = isFirst ? '<div class="route-badge-recommended">★ #1 ML PICK FOR YOU</div>' : `<div class="route-badge-gray" style="background:#6366F1;color:#fff;font-size:10px;padding:2px 8px;border-radius:10px;">#${idx+1} ML Match</div>`;
    const score = Math.round(r.hybrid_score * 100);
    const stars = '★'.repeat(Math.round(r.avg_rating)) + '☆'.repeat(5-Math.round(r.avg_rating));
    return `<div class="route-card${isFirst?' selected':''}" data-route="${r.route_id}" onclick="app.selectRoute(this)">
      <div class="route-card-header">${rankBadge}<div class="route-time-est">${r.avg_time_h}h <span>(${r.stops_count} stops)</span></div></div>
      <h3 class="route-title">${r.emoji} ${r.name}</h3>
      <p class="route-summary" style="font-size:12px;color:#6B7280;margin:4px 0 8px;">${r.route_type.charAt(0).toUpperCase()+r.route_type.slice(1)} route &bull; ${stars} ${r.avg_rating.toFixed(1)} &bull; ${Math.round(r.completion_rate*100)}% completion</p>
      <div class="why-fits-tag"><span class="fits-icon">🎯</span><span><strong>Why this fits you:</strong> ${r.why_fits}</span></div>
      <div class="route-meta-strip"><span class="meta-tag">🏛️ ${r.stops_count} Stops</span><span class="meta-tag">📊 ${score}% match</span>${xgbChip}<span class="meta-tag">${r.completion_rate>=0.8?'🟢 High completion':'🟡 Moderate pacing'}</span></div>
      <div class="route-card-actions"><button class="btn-select-route${isFirst?' active':''}" onclick="event.stopPropagation();app.navigateTo('navigation')"><span>Start Navigation</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button><button class="btn-preview-stops" onclick="event.stopPropagation();app.navigateTo('discover')">Explore Stops</button></div>
    </div>`;
  }).join('');
  const btnText = document.getElementById('btnGenerateRoutesText');
  const summaryTxt = document.getElementById('matchSummaryText');
  const dot = document.getElementById('matchIndicatorDot');
  if (btnText) btnText.innerText = `✓ ${data.recommendations.length} ML Routes Ready`;
  if (summaryTxt) summaryTxt.innerText = `${ML_STATE.personaEmoji} ${ML_STATE.persona} · ${data.total_candidates} candidates ranked by AI`;
  if (dot) dot.className = 'match-indicator-dot active';
}

async function mlLoadCrowdBadges() {
  if (!ML_STATE.apiOnline) return;
  const prefs = mlReadPreferences();
  for (const card of document.querySelectorAll('[data-stop-id]')) {
    const stopId = card.dataset.stopId;
    if (!stopId) continue;
    const key = `${stopId}_${prefs.hour_of_day}_${prefs.is_weekend}`;
    const cached = ML_STATE.crowdCache[key];
    const data = cached || await mlFetch('/api/crowd/predict', { stop_id: stopId, hour: prefs.hour_of_day, day_of_week: prefs.day_of_week, month: prefs.month, is_weekend: prefs.is_weekend, is_festival_season: 0, weather: prefs.weather_condition, tourist_type: 'domestic' });
    if (data) { ML_STATE.crowdCache[key] = data; updateCrowdBadge(card, data); }
  }
}

function updateCrowdBadge(card, data) {
  let badge = card.querySelector('.ml-crowd-badge');
  if (!badge) { badge = document.createElement('div'); badge.className = 'ml-crowd-badge'; badge.style.cssText = 'position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:700;display:flex;align-items:center;gap:3px;z-index:5;backdrop-filter:blur(4px);box-shadow:0 1px 4px rgba(0,0,0,0.2);'; card.style.position = card.style.position || 'relative'; card.appendChild(badge); }
  const colorMap = { quiet: '#0D9488EE', moderate: '#F59E0BEE', crowded: '#EF4444EE' };
  badge.style.background = colorMap[data.crowd_label] || '#6B7280EE';
  badge.style.color = '#fff';
  badge.innerHTML = `${data.emoji} ${data.crowd_label} <span style="opacity:.7;font-weight:400">${data.confidence_pct}%</span>`;
  badge.title = data.advice;
}

async function mlLoadFoodRecommendations() {
  if (!ML_STATE.apiOnline) return;
  const prefs = mlReadPreferences();
  const foodContainer = document.getElementById('mlFoodList');
  if (!foodContainer) return;
  foodContainer.innerHTML = '<div style="padding:12px;text-align:center;color:#6B7280;"><div style="display:inline-block;width:20px;height:20px;border:3px solid #F59E0B;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="margin-top:6px;font-size:12px;">🍜 AI ranking Pune\'s best eats for you…</p></div>';
  const budgetMap = { low: 150, mid: 400, high: 1000 };
  const now = new Date(); const h = now.getHours();
  const tod = h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 19 ? 'evening_snack' : 'dinner';
  const data = await mlFetch('/api/food/recommend', { user_id: ML_STATE.userId, is_veg: true, budget_max_inr: budgetMap[prefs.budget_tier] || 400, time_of_day: tod, top_n: 5 });
  if (!data || !data.recommendations || !data.recommendations.length) { foodContainer.innerHTML = '<p style="padding:12px;color:#9CA3AF;font-size:12px;">No recommendations available right now.</p>'; return; }
  const cuisineEmoji = { maharashtrian:'🍛', irani:'☕', mughlai:'🍖', bakery:'🥐', sweets:'🍮', dessert:'🍨', continental:'🍝', south_indian:'🥞', street_food:'🌮' };
  foodContainer.innerHTML = `<div style="padding:8px 12px 4px;display:flex;align-items:center;gap:6px;"><span style="font-size:11px;background:#0D9488;color:#fff;padding:2px 8px;border-radius:10px;font-weight:600;">🤖 ML Ranked</span><span style="font-size:11px;color:#6B7280;">${data.filter_applied}</span></div>${data.recommendations.map((r,i)=>`<div style="padding:12px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:10px;background:${i===0?'#0D9488':'#F3F4F6'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${cuisineEmoji[r.cuisine]||'🍽️'}</div><div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</div><div style="font-size:11px;color:#6B7280;">${r.cuisine} &bull; ${r.is_veg?'🟢 Veg':'🔴 Non-veg'} &bull; &#8377;${r.avg_cost_inr} &bull; ⭐${r.avg_rating}</div></div><div style="text-align:right;flex-shrink:0;"><div style="font-size:12px;font-weight:700;color:#0D9488;">${Math.round(r.hybrid_score*100)}%</div><div style="font-size:9px;color:#9CA3AF;">match</div></div></div>`).join('')}`;
}

function mlPatchNavigateTo() {
  if (!window.app) return;
  const original = window.app.navigateTo.bind(window.app);
  window.app.navigateTo = function(screenId) {
    original(screenId);
    if (screenId === 'routes') setTimeout(mlLoadRoutes, 200);
    else if (screenId === 'discover') setTimeout(mlLoadCrowdBadges, 300);
    else if (screenId === 'food') setTimeout(mlLoadFoodRecommendations, 200);
  };
}

function mlPatchGenerateBtn() {
  const btn = document.getElementById('btnGenerateRoutes');
  if (!btn) return;
  btn.onclick = async () => {
    await mlPersonaDetect();
    await mlLoadRoutes();
    if (window.app) window.app.navigateTo('routes');
  };
}

function mlInjectContainers() {
  const prefsScreen = document.getElementById('screen-preferences');
  if (prefsScreen && !document.getElementById('mlPersonaLabel')) {
    const div = document.createElement('div');
    div.id = 'mlPersonaLabel';
    div.style.cssText = 'margin:0 16px 8px;padding:8px 14px;border-radius:12px;background:linear-gradient(135deg,#ECFDF5,#F0FDF9);border:1px solid #6EE7B7;font-size:13px;color:#065F46;display:flex;align-items:center;gap:6px;';
    div.innerHTML = '🔍 <strong>Detecting your persona…</strong>';
    const anchor = prefsScreen.querySelector('.group-selection-section') || prefsScreen.querySelector('.pref-section') || prefsScreen.querySelector('.screen-top-bar');
    if (anchor) anchor.after(div); else prefsScreen.prepend(div);
  }
  const routesScreen = document.getElementById('screen-routes');
  const existingList = routesScreen && routesScreen.querySelector('.routes-list-scroll');
  if (existingList && !document.getElementById('mlRoutesList')) {
    const mlDiv = document.createElement('div');
    mlDiv.id = 'mlRoutesList';
    existingList.before(mlDiv);
    existingList.style.display = 'none';
  }
  const foodScreen = document.getElementById('screen-food');
  if (foodScreen && !document.getElementById('mlFoodList')) {
    const mlFood = document.createElement('div');
    mlFood.id = 'mlFoodList';
    mlFood.style.cssText = 'margin:12px;border-radius:14px;overflow:hidden;border:1px solid #FEF3C7;background:#fff;';
    const topBar = foodScreen.querySelector('.screen-top-bar');
    if (topBar) topBar.after(mlFood); else foodScreen.prepend(mlFood);
  }
  if (!document.getElementById('mlSpinStyle')) {
    const s = document.createElement('style');
    s.id = 'mlSpinStyle';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}} .ml-pred-chip{background:linear-gradient(135deg,#0D9488,#6366F1);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;display:inline-flex;align-items:center;gap:3px;}';
    document.head.appendChild(s);
  }
}


async function mlBootstrap() {
  mlInjectContainers();
  const online = await mlCheckHealth();
  if (online) { await mlPersonaDetect(); console.log(`[ML] API online. Persona: ${ML_STATE.persona}`); }
  else console.warn('[ML] API offline. Run: python -m uvicorn main:app --port 8001 in ml_api/');
  mlPatchNavigateTo();
  mlPatchGenerateBtn();
  mlBindPreferenceListeners();   // ← real-time updates
}

// ── Debounce helper ───────────────────────────────────────────────────────────
let _mlDebTimer = null;
function mlDebounce(fn, ms = 400) {
  clearTimeout(_mlDebTimer);
  _mlDebTimer = setTimeout(fn, ms);
}

// ── Real-time preference listeners ────────────────────────────────────────────
// Every time user changes a preference, update the match summary live.
// On the routes screen, also re-fetch recommendations after a 600ms pause.
function mlBindPreferenceListeners() {
  // 1. Time slider — update badge and re-score immediately
  const slider = document.getElementById('timeSlider');
  if (slider) {
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      const badge = document.getElementById('timeValueBadge');
      if (badge) badge.innerText = `${v} Hour${v !== 1 ? 's' : ''}`;
      mlUpdateMatchSummary();
      // If routes screen is visible, reload with debounce
      if (window.app && window.app.currentScreen === 'routes') {
        mlDebounce(mlLoadRoutes, 700);
      }
    });
  }

  // 2. Group cards — make ALL clickable and wire ML update
  document.querySelectorAll('.group-card').forEach(card => {
    // Ensure pointer events are enabled
    card.style.cursor = 'pointer';
    card.style.userSelect = 'none';
    card.addEventListener('click', () => {
      document.querySelectorAll('.group-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (window.app) window.app.updateRouteMatches(true);
      mlUpdateMatchSummary();
      if (window.app && window.app.currentScreen === 'routes') mlDebounce(mlLoadRoutes, 600);
    });
    // Keyboard accessibility
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
  });

  // 3. Interest pills — all already have onclick but also wire ML
  document.querySelectorAll('.interest-pill').forEach(pill => {
    pill.style.cursor = 'pointer';
    pill.addEventListener('click', () => {
      // Toggle handled by existing app.toggleInterest, just debounce ML
      mlDebounce(() => {
        mlUpdateMatchSummary();
        if (window.app && window.app.currentScreen === 'routes') mlLoadRoutes();
      }, 500);
    });
  });

  // 4. Budget buttons
  document.querySelectorAll('.budget-seg-btn').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      mlDebounce(() => {
        mlUpdateMatchSummary();
        if (window.app && window.app.currentScreen === 'routes') mlLoadRoutes();
        if (window.app && window.app.currentScreen === 'food')   mlLoadFoodRecommendations();
      }, 400);
    });
  });

  // 5. Quick time ticks (1h, 3h, 6h, 10h labels)
  document.querySelectorAll('.slider-ticks span').forEach(tick => {
    tick.style.cursor = 'pointer';
    tick.addEventListener('click', () => {
      setTimeout(() => {
        mlUpdateMatchSummary();
        if (window.app && window.app.currentScreen === 'routes') mlLoadRoutes();
      }, 150);
    });
  });

  // 6. History layer toggle
  const histToggle = document.getElementById('historyLayerToggle');
  if (histToggle) {
    histToggle.addEventListener('change', () => {
      mlUpdateMatchSummary();
    });
  }

  // 7. Veg toggle in food screen (if present)
  const vegToggle = document.getElementById('mlVegToggle');
  if (vegToggle) {
    vegToggle.addEventListener('change', () => mlLoadFoodRecommendations());
  }
}

// ── Live match summary update (instant, no API call) ─────────────────────────
function mlUpdateMatchSummary() {
  const prefs = mlReadPreferences();
  const btnText   = document.getElementById('btnGenerateRoutesText');
  const summaryTxt = document.getElementById('matchSummaryText');
  const dot = document.getElementById('matchIndicatorDot');

  const groupNames = { solo:'Solo Explorer', couple:'Couple', friends:'Friends Group', family:'Family' };
  const budgetNames = { low:'Budget', mid:'Moderate', high:'Premium' };
  const timeLabel = prefs.time_available_h <= 1.5 ? 'Quick' :
                    prefs.time_available_h <= 3.5 ? 'Half-Day' :
                    prefs.time_available_h <= 6   ? 'Full-Day' : 'Grand Tour';

  if (btnText) btnText.innerText = `Find ${timeLabel} Routes for ${groupNames[prefs.group_type] || 'You'}`;
  if (summaryTxt) summaryTxt.innerText =
    `${ML_STATE.personaEmoji} ${ML_STATE.persona} · ` +
    `${prefs.time_available_h}h · ${budgetNames[prefs.budget_tier] || 'Moderate'} budget · ` +
    `${prefs.interests.length} interest${prefs.interests.length !== 1 ? 's' : ''} selected`;
  if (dot) dot.className = 'match-indicator-dot active';
}

// ── Override mlLoadRoutes to show time_fit_label ──────────────────────────────
// (Patches the route card HTML to include the new time proximity label)
const _origLoadRoutes = mlLoadRoutes;
mlLoadRoutes = async function() {
  const prefs = mlReadPreferences();
  const routeList = document.getElementById('mlRoutesList');
  if (!routeList) return;
  routeList.innerHTML = '<div style="padding:16px;text-align:center;color:#6B7280;"><div style="display:inline-block;width:24px;height:24px;border:3px solid #0D9488;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="margin-top:8px;font-size:13px;">🤖 Ranking routes closest to your ' + prefs.time_available_h + 'h preference…</p></div>';
  if (!ML_STATE.apiOnline) { routeList.innerHTML = '<p style="padding:16px;color:#9CA3AF;font-size:13px;">⚠️ ML API offline — start the API server.</p>'; return; }

  const data = await mlFetch('/api/route/recommend', {
    user_id: ML_STATE.userId, persona_label: ML_STATE.persona,
    group_type: prefs.group_type, time_available_h: prefs.time_available_h,
    budget_tier: prefs.budget_tier, interests: prefs.interests, top_n: 4
  });

  if (!data || !data.recommendations || !data.recommendations.length) {
    routeList.innerHTML = '<p style="padding:16px;color:#9CA3AF;font-size:13px;">No routes found. Try adjusting preferences.</p>'; return;
  }
  ML_STATE.lastRoutes = data.recommendations;

  const topRoute = data.recommendations[0];
  const timePred = await mlFetch('/api/time/predict', {
    stops_count: topRoute.stops_count, total_distance_km: topRoute.avg_time_h * 2.5,
    time_estimated_h: topRoute.avg_time_h, route_type: topRoute.route_type,
    group_type: prefs.group_type, budget_tier: prefs.budget_tier, tourist_type: 'domestic',
    weather_condition: 'sunny', traffic_level: 'low', season: prefs.season,
    hour_of_day: prefs.hour_of_day, day_of_week: prefs.day_of_week, month: prefs.month,
    is_weekend: prefs.is_weekend, is_festival_season: 0, avg_time_available: prefs.time_available_h,
    visit_count: 1, badges_earned: 0, audio_plays: 2, photos_taken: 3,
    history_layer_used: 1, history_layer_on: 1
  });

  routeList.innerHTML = data.recommendations.map((r, idx) => {
    const isFirst = idx === 0;
    const xgbChip = isFirst && timePred
      ? `<span class="ml-pred-chip" title="${timePred.accuracy_note}">🤖 XGBoost: ${timePred.display}</span>` : '';
    const rankBadge = isFirst
      ? '<div class="route-badge-recommended">★ CLOSEST TO YOUR TIME</div>'
      : `<div class="route-badge-gray" style="background:#6366F1;color:#fff;font-size:10px;padding:2px 8px;border-radius:10px;">#${idx+1} ML Match</div>`;
    const score = Math.round(r.hybrid_score * 100);
    const stars = '★'.repeat(Math.round(r.avg_rating)) + '☆'.repeat(5 - Math.round(r.avg_rating));

    // Time fit indicator
    const timeFitColor = r.time_fit_label === 'exact match' ? '#0D9488' :
                         r.time_fit_label.includes('shorter') ? '#6366F1' : '#F59E0B';
    const timeFitChip = r.time_fit_label
      ? `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:${timeFitColor}20;color:${timeFitColor};font-weight:600;">⏱ ${r.avg_time_h}h · ${r.time_fit_label}</span>`
      : `<span class="meta-tag">⏱ ${r.avg_time_h}h</span>`;

    return `<div class="route-card${isFirst?' selected':''}" data-route="${r.route_id}" onclick="app.selectRoute(this)">
      <div class="route-card-header">${rankBadge}<div class="route-time-est">${r.avg_time_h}h <span>(${r.stops_count} stops)</span></div></div>
      <h3 class="route-title">${r.emoji} ${r.name}</h3>
      <p class="route-summary" style="font-size:12px;color:#6B7280;margin:4px 0 8px;">${r.route_type.charAt(0).toUpperCase()+r.route_type.slice(1)} · ${stars} ${r.avg_rating.toFixed(1)} · ${Math.round(r.completion_rate*100)}% completion</p>
      <div class="why-fits-tag"><span class="fits-icon">🎯</span><span><strong>Why this fits you:</strong> ${r.why_fits}</span></div>
      <div class="route-meta-strip">${timeFitChip}<span class="meta-tag">📊 ${score}% match</span>${xgbChip}<span class="meta-tag">${r.completion_rate>=0.8?'🟢 High completion':'🟡 Moderate'}</span></div>
      <div class="route-card-actions">
        <button class="btn-select-route${isFirst?' active':''}" onclick="event.stopPropagation();app.navigateTo('navigation')">
          <span>Start Navigation</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button class="btn-preview-stops" onclick="event.stopPropagation();app.navigateTo('discover')">Explore Stops</button>
      </div>
    </div>`;
  }).join('');

  const btnText = document.getElementById('btnGenerateRoutesText');
  const summaryTxt = document.getElementById('matchSummaryText');
  const dot = document.getElementById('matchIndicatorDot');
  if (btnText) btnText.innerText = `✓ ${data.recommendations.length} Routes ranked for ${prefs.time_available_h}h`;
  if (summaryTxt) summaryTxt.innerText = `${ML_STATE.personaEmoji} ${ML_STATE.persona} · closest to ${prefs.time_available_h}h first`;
  if (dot) dot.className = 'match-indicator-dot active';
};

// ── Override mlLoadFoodRecommendations to show budget_label ───────────────────
mlLoadFoodRecommendations = async function() {
  if (!ML_STATE.apiOnline) return;
  const prefs = mlReadPreferences();
  const foodContainer = document.getElementById('mlFoodList');
  if (!foodContainer) return;

  // Read veg toggle if present
  const vegToggle = document.getElementById('mlVegToggle');
  const isVeg = vegToggle ? vegToggle.checked : true;

  const budgetMap = { low: 150, mid: 400, high: 1000 };
  const budgetMax = budgetMap[prefs.budget_tier] || 400;
  const now = new Date(); const h = now.getHours();
  const tod = h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 19 ? 'evening_snack' : 'dinner';

  foodContainer.innerHTML = `<div style="padding:12px;text-align:center;color:#6B7280;"><div style="display:inline-block;width:20px;height:20px;border:3px solid #F59E0B;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="margin-top:6px;font-size:12px;">🍜 Ranking eats closest to ₹${budgetMax} budget…</p></div>`;

  const data = await mlFetch('/api/food/recommend', {
    user_id: ML_STATE.userId, is_veg: isVeg, budget_max_inr: budgetMax, time_of_day: tod, top_n: 5
  });
  if (!data || !data.recommendations || !data.recommendations.length) {
    foodContainer.innerHTML = '<p style="padding:12px;color:#9CA3AF;font-size:12px;">No recommendations available.</p>'; return;
  }
  const cuisineEmoji = { maharashtrian:'🍛', irani:'☕', mughlai:'🍖', bakery:'🥐', sweets:'🍮', dessert:'🍨', continental:'🍝', south_indian:'🥞', street_food:'🌮' };

  // Veg toggle header
  const vegHeader = `<div style="padding:8px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #FEF3C7;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:11px;background:#0D9488;color:#fff;padding:2px 8px;border-radius:10px;font-weight:600;">🤖 ML Ranked</span>
      <span style="font-size:11px;color:#6B7280;">Closest to ₹${budgetMax}</span>
    </div>
    <label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;">
      <input type="checkbox" id="mlVegToggle" ${isVeg?'checked':''} style="cursor:pointer;">
      🟢 Veg only
    </label>
  </div>`;

  foodContainer.innerHTML = vegHeader + data.recommendations.map((r, i) => `
    <div style="padding:12px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:10px;">
      <div style="width:38px;height:38px;border-radius:10px;background:${i===0?'#0D9488':'#F3F4F6'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${cuisineEmoji[r.cuisine]||'🍽️'}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</div>
        <div style="font-size:11px;color:#6B7280;">${r.cuisine} · ${r.is_veg?'🟢 Veg':'🔴 Non-veg'} · ⭐${r.avg_rating}</div>
        <div style="font-size:10px;margin-top:2px;">
          <span style="font-weight:700;color:#1F2937;">₹${r.avg_cost_inr}</span>
          <span style="color:${r.budget_label.includes('over')?'#EF4444':'#0D9488'};margin-left:4px;">${r.budget_label}</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:13px;font-weight:700;color:#0D9488;">${Math.round(r.hybrid_score*100)}%</div>
        <div style="font-size:9px;color:#9CA3AF;">match</div>
      </div>
    </div>`).join('');

  // Re-bind veg toggle
  const newVegToggle = document.getElementById('mlVegToggle');
  if (newVegToggle) newVegToggle.addEventListener('change', () => mlLoadFoodRecommendations());
};

(function waitForApp() {
  if (window.app) mlBootstrap();
  else setTimeout(waitForApp, 100);
})();


