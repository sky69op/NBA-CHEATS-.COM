import type { SiteLocale } from '../../i18n/locales';

/**
 * Locale-specific meta descriptions (og:description / SERP snippet) per blog slug.
 * English posts keep `desc` as the canonical excerpt; these variants reduce duplicate
 * patterns across es/de/fr while staying unique to each article angle.
 */
const es: Record<string, string> = {
  'nba-2k27-auto-green-cheats-explained':
    'Qué implica Auto Green en búsquedas de NBA 2K27: timing, modos y preguntas al proveedor antes de confiar en el titular.',
  'nba-2k27-cheat-menu-features-guide':
    'Cómo leer listas de menú y opciones en páginas de trucos NBA 2K27 sin mezclar plan, plataforma y alcance real.',
  'nba-2k27-attribute-changer-claims':
    'El término “cambio de atributos” en NBA 2K27: qué debe aclarar una página de producto y qué no demuestra por sí solo.',
  'nba-2k27-max-badges-cheat-questions':
    '“Máximo de insignias” en búsquedas de NBA 2K27: qué verificar en el listado y por qué el titular no basta como prueba.',
  'nba-2k27-unlock-all-cheats-explained':
    '“Desbloquear todo” en páginas de NBA 2K27: objetos, modos y límites que debe nombrar un anuncio creíble.',
  'nba-2k27-esp-and-visibility-cheat-terms':
    'ESP y visibilidad en contexto NBA 2K27: vocabulario reutilizado, riesgos de confusión y preguntas concretas al vendedor.',
  'nba-2k27-cheat-configs-and-settings':
    'Configs y ajustes en listados de NBA 2K27: qué puede significar “preset” y qué confirmar antes del pago.',
  'nba-2k27-cheats-pc-guide':
    'Guía de investigación para “trucos PC” en NBA 2K27: plataforma, requisitos y por qué el juego en PC no prueba cada producto.',
  'nba-2k27-cheat-status-after-patches':
    'Estado del producto tras parches en NBA 2K27: qué debe incluir un aviso útil y por qué “en línea” no es suficiente.',
  'nba-2k27-cheats-vs-controller-scripts':
    'Diferencia entre trucos, scripts y macros en búsquedas NBA 2K27 y por qué la etiqueta importa al comparar.',
  'nba-2k27-cheat-provider-checklist':
    'Lista corta para comparar vendedores de NBA 2K27: alcance escrito, plan, soporte y señales para pausar la compra.',
  'nba-2k27-hwid-spoofer-questions':
    'Preguntas previas a comprar HWID Spoofer en contexto NBA 2K27: alcance, requisitos y límites típicos del listado.',
  'nba-2k27-hwid-ban-vs-account-ban':
    'HWID frente a restricción de cuenta en NBA 2K27: por qué no son lo mismo y qué canal preguntar en cada caso.',
  'ugc-nba-2k27-account-appeal-guide':
    'Preparar un recurso de cuenta con UGC (Unban & Governance Control) en NBA 2K27: qué reunir sin prometer resultado.',
  'ugc-nba-2k27-appeal-evidence-checklist':
    'Lista de pruebas para investigar un recurso UGC en NBA 2K27: documentos, fechas y mensajes que suelen pedirse.',
  'cloud-dma-nba-2k27-product-questions':
    'Cloud DMA y NBA 2K27: qué aclarar sobre infraestructura, requisitos y exclusiones antes del checkout.',
  'cloud-dma-vs-hwid-spoofer-nba-2k27':
    'Cloud DMA o HWID Spoofer para NBA 2K27: preguntas distintas según el problema (cuenta frente a hardware).',
  'nba-2k27-cheats-monthly-vs-lifetime':
    'Planes mensuales y de por vida para listados NBA 2K27: duración, alcance y qué debe decir el texto legal.',
  'nba-2k27-cheat-reviews-and-testimonials':
    'Reseñas y testimonios sobre trucos NBA 2K27: cómo leer críticamente fechas, alcance y conflicto de intereses.',
  'nba-2k27-cheat-safety-claims':
    '“Seguro” e “indetectable” en páginas NBA 2K27: qué suelen omitir y qué confirmar con reglas oficiales y el proveedor.',
  'nba-2k27-product-research-checklist':
    'Checklist editorial previa al pago en NBA 2K27: plataforma, modo, estado y respuestas escritas que debe dar el socio.',
  'nba-2k27-plan-comparison':
    'Comparar planes mensuales y vitalicios NBA2K27: preguntas sobre renovación, soporte y cambios tras parches.',
  'hwid-and-account-appeals-different-questions':
    'HWID y apelaciones de cuenta en NBA 2K27 no se resuelven igual: separar producto, plataforma y documentación.',
  'third-party-software-risk-nba-2k27':
    'Riesgo de software de terceros en NBA 2K27: reglas del editor y plataforma que leer antes de interpretar un anuncio.',
  'nba-2k27-official-sources-before-cheats-research':
    'Fuentes oficiales como contexto para búsquedas de trucos NBA 2K27: qué establecen y qué no sustituyen del socio.',
};

const de: Record<string, string> = {
  'nba-2k27-auto-green-cheats-explained':
    'Was „Auto Green“ in NBA-2K27-Cheat-Suchen meist meint: Timing, Modi und konkrete Rückfragen vor dem Kauf.',
  'nba-2k27-cheat-menu-features-guide':
    'Cheat-Menü-Listen für NBA 2K27 lesen: Plan, Plattform und tatsächlichen Leistungsumfang nicht vermischen.',
  'nba-2k27-attribute-changer-claims':
    '„Attribute changer“ bei NBA 2K27: welche Präzision eine Produktseite liefern sollte und was die Überschrift allein nicht beweist.',
  'nba-2k27-max-badges-cheat-questions':
    '„Max Badges“ als NBA-2K27-Suchbegriff: woran Sie ein Listing messen und warum das Keyword keine Beweiskraft hat.',
  'nba-2k27-unlock-all-cheats-explained':
    '„Unlock All“ bei NBA 2K27: welche Objekte, Modi und Grenzen ein seriöser Anbieter benennen sollte.',
  'nba-2k27-esp-and-visibility-cheat-terms':
    'ESP und Sichtbarkeit im Basketball-Kontext: importierte Cheat-Begriffe bei NBA 2K27 und gezielte Rückfragen.',
  'nba-2k27-cheat-configs-and-settings':
    'Configs und Einstellungen in NBA-2K27-Angeboten: was „Preset“ heißen kann und was vor der Zahlung geklärt sein sollte.',
  'nba-2k27-cheats-pc-guide':
    '„Cheats PC“ für NBA 2K27 recherchieren: Systemvoraussetzungen, Plattform-Hinweise und Grenzen von Screenshots.',
  'nba-2k27-cheat-status-after-patches':
    'Produktstatus nach Patches bei NBA 2K27: welche Angaben ein nützlicher Hinweis enthält und warum „online“ zu dünn ist.',
  'nba-2k27-cheats-vs-controller-scripts':
    'Cheats, Skripte und Makros bei NBA-2K27-Suchen: warum die Kategorie für faire Vergleiche zählt.',
  'nba-2k27-cheat-provider-checklist':
    'Kurz-Checkliste für NBA-2K27-Anbieter: schriftlicher Umfang, Plan, Support und wann Sie stoppen sollten.',
  'nba-2k27-hwid-spoofer-questions':
    'Vor dem HWID-Spoofer-Kauf zu NBA 2K27: typische Produktfragen, Ausschlüsse und Support-Erwartungen.',
  'nba-2k27-hwid-ban-vs-account-ban':
    'HWID vs. Kontosperre bei NBA 2K27: unterschiedliche Probleme, Beweise und Kontaktpunkte.',
  'ugc-nba-2k27-account-appeal-guide':
    'UGC (Unban & Governance Control) und NBA 2K27: Unterlagen sammeln für eine sachliche Einspruchsvorbereitung ohne Erfolgsversprechen.',
  'ugc-nba-2k27-appeal-evidence-checklist':
    'Beweis-Checkliste für UGC-Recherche zu NBA 2K27: Daten, Schreiben und typische Anforderungen der Plattform.',
  'cloud-dma-nba-2k27-product-questions':
    'Cloud DMA und NBA 2K27: Infrastruktur, Voraussetzungen und Ausschlüsse vor dem Kauf klären.',
  'cloud-dma-vs-hwid-spoofer-nba-2k27':
    'Cloud DMA oder HWID Spoofer für NBA 2K27: welche Fragestellung zu welchem Produkt passt.',
  'nba-2k27-cheats-monthly-vs-lifetime':
    'Monatlich oder Lifetime bei NBA2K27-Listings: Laufzeit, Leistungsumfang und was im Kleingedruckten stehen sollte.',
  'nba-2k27-cheat-reviews-and-testimonials':
    'Testimonials zu NBA-2K27-Cheats kritisch lesen: Datum, Interessenkonflikt und was Reviews nicht belegen.',
  'nba-2k27-cheat-safety-claims':
    '„Sicher“ und „Undetected“ auf NBA-2K27-Seiten: typische Lücken und offizielle Regeln als Ergänzung.',
  'nba-2k27-product-research-checklist':
    'Redaktionelle Checkliste vor dem Checkout zu NBA 2K27: Plattform, Modus, Status und schriftliche Antworten vom Support.',
  'nba-2k27-plan-comparison':
    'Monats- und Lifetime-Pläne NBA2K27 vergleichen: Support, Verlängerung und Patch-Folgen gezielt abfragen.',
  'hwid-and-account-appeals-different-questions':
    'HWID und Kontobeschwerden bei NBA 2K27 trennen: Produktseite, Plattform und Dokumentation richtig zuordnen.',
  'third-party-software-risk-nba-2k27':
    'Risiko Drittanbieter-Software bei NBA 2K27: Publisher- und Plattformregeln vor dem Lesen eines Listings.',
  'nba-2k27-official-sources-before-cheats-research':
    'Offizielle Quellen als Kontext für NBA-2K27-Cheat-Recherche: was sie belegen und was nur Support oder die Produktseite beantworten kann.',
};

const fr: Record<string, string> = {
  'nba-2k27-auto-green-cheats-explained':
    'Ce que recouvre « Auto Green » dans les recherches de triche NBA 2K27 : timing, modes et questions à poser au vendeur.',
  'nba-2k27-cheat-menu-features-guide':
    'Lire les listes de menu de triche NBA 2K27 sans confondre offre, plateforme et périmètre réel du plan.',
  'nba-2k27-attribute-changer-claims':
    '« Attribute changer » et NBA 2K27 : ce qu’une fiche produit doit préciser et ce que le titre ne prouve pas.',
  'nba-2k27-max-badges-cheat-questions':
    '« Max badges » comme requête NBA 2K27 : critères pour juger une annonce et limites du mot-clé seul.',
  'nba-2k27-unlock-all-cheats-explained':
    '« Unlock All » sur les pages NBA 2K27 : objets, modes et limites qu’une description sérieuse doit nommer.',
  'nba-2k27-esp-and-visibility-cheat-terms':
    'ESP et visibilité pour NBA 2K27 : jargon importé, risques de confusion et questions ciblées au fournisseur.',
  'nba-2k27-cheat-configs-and-settings':
    'Configs et réglages dans les offres NBA 2K27 : sens possibles du mot « preset » et points à clarifier avant paiement.',
  'nba-2k27-cheats-pc-guide':
    'Recherche « cheats PC » NBA 2K27 : plateforme, prérequis et pourquoi une capture ne remplace pas les conditions écrites.',
  'nba-2k27-cheat-status-after-patches':
    'Statut produit après patch NBA 2K27 : qu’un bandeau utile doit dire et pourquoi « en ligne » ne suffit pas.',
  'nba-2k27-cheats-vs-controller-scripts':
    'Triche, scripts et macros dans les résultats NBA 2K27 : pourquoi l’étiquette change la comparaison.',
  'nba-2k27-cheat-provider-checklist':
    'Liste rapide pour comparer des vendeurs NBA 2K27 : périmètre écrit, formule, support et signaux d’arrêt.',
  'nba-2k27-hwid-spoofer-questions':
    'Avant d’acheter un HWID Spoofer lié à NBA 2K27 : questions types sur le périmètre et les exclusions.',
  'nba-2k27-hwid-ban-vs-account-ban':
    'HWID vs restriction de compte NBA 2K27 : problèmes différents, preuves et interlocuteurs distincts.',
  'ugc-nba-2k27-account-appeal-guide':
    'Préparer un dossier UGC (Unban & Governance Control) pour NBA 2K27 : rassembler les éléments sans promesse de résultat.',
  'ugc-nba-2k27-appeal-evidence-checklist':
    'Checkliste preuve pour une recherche UGC NBA 2K27 : dates, courriers et demandes habituelles des plateformes.',
  'cloud-dma-nba-2k27-product-questions':
    'Cloud DMA et NBA 2K27 : infrastructure, prérequis et exclusions à valider avant le paiement.',
  'cloud-dma-vs-hwid-spoofer-nba-2k27':
    'Cloud DMA ou HWID Spoofer pour NBA 2K27 : quelles questions vont avec quel produit.',
  'nba-2k27-cheats-monthly-vs-lifetime':
    'Formules mensuelle et à vie pour NBA2K27 : durée, périmètre et mentions à exiger dans les conditions.',
  'nba-2k27-cheat-reviews-and-testimonials':
    'Avis sur les triches NBA 2K27 : lire les dates, les intérêts et ce qu’un témoignage ne démontre pas.',
  'nba-2k27-cheat-safety-claims':
    '« Safe » et « undetected » sur les pages NBA 2K27 : angles souvent absents et règles officielles à croiser.',
  'nba-2k27-product-research-checklist':
    'Checklist éditoriale avant paiement NBA 2K27 : plateforme, mode, statut et réponses écrites du partenaire.',
  'nba-2k27-plan-comparison':
    'Comparer mensuel et lifetime NBA2K27 : renouvellement, support et effet des mises à jour du jeu.',
  'hwid-and-account-appeals-different-questions':
    'HWID et recours de compte pour NBA 2K27 : ne pas mélanger produit, plateforme et documentation.',
  'third-party-software-risk-nba-2k27':
    'Risque logiciels tiers sur NBA 2K27 : lire d’abord éditeur et plateforme avant d’interpréter une annonce.',
  'nba-2k27-official-sources-before-cheats-research':
    'Sources officielles comme contexte pour les recherches de triche NBA 2K27 : ce qu’elles établissent et ce que seul le partenaire confirme.',
};

const byLocale: Record<Exclude<SiteLocale, 'en'>, Record<string, string>> = {
  es,
  de,
  fr,
};

export function localeMetaDescriptionOverride(slug: string, locale: SiteLocale): string | undefined {
  if (locale === 'en') return undefined;
  return byLocale[locale][slug];
}
