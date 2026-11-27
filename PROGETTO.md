# Bilocale Deathmatch

Gioco d’azione in 3D nel browser, da 1 a 8 giocatori sullo stesso schermo (tastiera e pad) oppure in rete con i telefoni. Personaggi, mappe e boss sono ispirati al gruppo di amici e a posti veri (Valenzano, Mola, Bari, Scampia…). Si gioca su **https://giorgiokkket.github.io/** e si installa come app (PWA) su PC e telefono.

## Indice
- [Come si avvia](#come-si-avvia)
- [Struttura del progetto](#struttura-del-progetto)
- [Mappa del codice (index.html)](#mappa-del-codice-indexhtml)
- [Modalità](#modalità)
- [Comandi](#comandi)
- [Personaggi](#personaggi)
- [Boss](#boss)
- [Mappe](#mappe)
- [Difendi la birra: Sexy Shop](#difendi-la-birra-sexy-shop)
- [Sopravvivenza: slot d’oro](#sopravvivenza-slot-doro)
- [Rete](#rete)
- [Grafica e prestazioni](#grafica-e-prestazioni)
- [Dati sensibili](#dati-sensibili)
- [Novità di questa versione](#novità-di-questa-versione)

## Come si avvia

- **Online:** basta aprire https://giorgiokkket.github.io/ (GitHub Pages pubblica la cartella così com’è).
- **In locale:** non c’è niente da compilare. Si apre `index.html` nel browser, oppure si avvia un piccolo server nella cartella (`python3 -m http.server`) e si va su `http://localhost:8000` (serve per il manifest dell’app e per la rete).
- **Librerie:** three.js r128 dal CDN di cdnjs; PeerJS 1.5.4 (jsDelivr, con unpkg come riserva) solo per il gioco in rete. Audio, texture e modelli sono tutti generati dal codice: non ci sono file di immagini o suoni.

## Struttura del progetto

| File | Cosa contiene |
|---|---|
| `index.html` | Tutto il gioco: stile, HTML e circa 8000 righe di JavaScript |
| `manifest.webmanifest`, `icons/` | Icone e manifest per installare il gioco come app |
| `cloudflare-worker/turn-worker.js` | Worker Cloudflare facoltativo che genera credenziali TURN temporanee (le chiavi stanno nel pannello di Cloudflare, non nel codice) |
| `Grafiche/` | Render di personaggi, boss, acquistabili di Difendi la birra e mappe, con draw call e triangoli di ciascuno (indice in `Grafiche/README.md`) |
| `strumenti/render-grafiche.mjs` | Rifà tutti i render e le misure: `node strumenti/render-grafiche.mjs` (serve Google Chrome) |
| `README.md` | Titolo del repository e rimando a questo file |
| `PROGETTO.md` | Questo documento |

## Mappa del codice (index.html)

Il JavaScript è diviso in sezioni con intestazioni `// ===== NOME =====`, nell’ordine:

- **RETE (LAN): stato condiviso**: stato della partita in rete (`NET`), `NETON()` vero sul client che mostra la partita dell’host
- **CONFIG**: dimensioni della mappa, tasti dei giocatori (`KEYS`), vite, super sayan
- **SCENA / RENDERER**: renderer three.js, luci, telecamera ortografica inclinata
- **QUALITA' GRAFICA (adattiva)**: tre livelli (BASSA/MEDIA/ALTA), risoluzione dinamica che scende se gli fps calano; tasto G
- **AUDIO**: effetti e musiche sintetizzati con Web Audio (`SFX`)
- **TEXTURE PROCEDURALI / MATERIALI E PRIMITIVE**: `ctex`/`ctexR` disegnano le texture su canvas; `bx`, `cy`, `sp`, `ell` creano i blocchi
- **OTTIMIZZAZIONE**: `mergeStatic` fonde le mesh statiche: poche draw call per mappa e per personaggio
- **DATI MAPPE / MAPPE GIGANTI / MAPPE COOPERATIVE**: griglie di caselle, mobili e scenari di ogni mappa (`MAPS`)
- **COSTRUZIONE MAPPA**: `buildMap`: pavimento dipinto, muri, mobili, scenario
- **GIOCATORI**: classe `Player`: movimento, danni (`hurt`), rinascita, animazioni
- **PERSONAGGI**: tabella `CHARS` (vita, velocità, arma) e modelli voxel
- **BOSS**: modelli dei boss (pitone, Blattonoide…)
- **INPUT / COMANDI TOUCH**: tastiera, pad e joystick del telefono
- **ARMI / OGGETTI**: `WEAPONS`, proiettili `PROJ`, `spawn`, `updateProjectiles`
- **MOSSE SPECIALI**: tabella `SPECIALS`: si caricano facendo danni, si attivano con L2/E
- **BALLETTI**: emote con le frecce del pad
- **SLOT MACHINE D'ORO**: bonus della sopravvivenza (`SLOT_B`)
- **DIFENDI LA BIRRA**: Sexy Shop, costruzioni, bot alleati, Lino Sassanelli
- **BASKET**: campo scalabile, canestri, tiro con la barra, schiacciata
- **MENU / MENU COL CONTROLLER**: schermate di scelta; il riquadro del pad prende il colore del giocatore
- **EVENTI DELLE MAPPE**: T-rex, invasione aliena, Gianni a Mola…
- **HUD**: barre in alto dei soli giocatori in partita, col loro colore; potenziamenti della sopravvivenza
- **SOPRAVVIVENZA / DIFENDI LA TORRE**: ondate (`waveQueue`), boss ogni 5 ondate
- **BOSS DI "DIFENDI LA TORRE"**: `BOSSES`: modelli, attacchi (`think`), movimento con percorso per corpi grandi
- **LOOP**: ciclo principale `loop(t)`
- **RETE: host e client**: PeerJS/WebRTC: l’host manda 20 istantanee al secondo, i client mandano i comandi

## Modalità

| Modalità | Descrizione |
|---|---|
| DEATHMATCH CLASSICO | Tutti contro tutti, da 2 a 4 giocatori (fino a 8 nelle mappe giganti). 4 vite a testa: vince l'ultimo che resta in gioco. |
| DEATHMATCH A SQUADRE 2v2 | Due squadre da due, solo in 4 giocatori. 4 vite per giocatore: perde la squadra che le esaurisce tutte. Il fuoco amico fa metà danno. |
| RE DELLA COLLINA | Tutti contro tutti, da 2 a 4 (fino a 8 nelle mappe giganti). Resta da solo dentro la zona dorata per fare punti: la zona si sposta ogni 30 s. Vince chi arriva a 60 punti. Vite infinite. |
| SOPRAVVIVENZA | Da 1 a 4 giocatori insieme (fino a 8 nelle mappe giganti) contro ondate di alieni sempre più forti, anche nelle 4 mappe apposite. 4 vite a testa, niente fuoco amico; chi viene eliminato rientra da solo dopo 5 ondate. Ogni 4 ondate si cambia mappa. Quante ondate reggete? |
| 📱 MOBILE · SOPRAVVIVENZA | Da solo, sul telefono, contro le ondate di alieni. Joystick sinistro per muoverti, joystick destro per mirare e sparare (trascina e tieni premuto); un tocco veloce a destra spara col mirino automatico. 4 vite. Si gioca in orizzontale. |
| 🍺 DIFENDI LA BIRRA | Da 1 a 4 giocatori insieme (fino a 8 nelle mappe giganti) difendono la bottiglia di birra al centro della mappa per 10 ondate, con un BOSS ogni 5. Si parte senza difese: ogni nemico ucciso dà monete 💰 da spendere al SEXY SHOP 💗 (alleati, Lino Sassanelli che riempie la birra, potenziamenti fino a 5 livelli, torrette, muretti, vulcani). Più giocatori, più nemici. 4 vite a testa: se la bottiglia si rompe, è un allagamento. |
| 📱 MOBILE · DIFENDI LA BIRRA | Da solo, sul telefono: difendi la bottiglia di birra per 10 ondate, coi boss e il Sexy Shop. Joystick sinistro per muoverti, destro per mirare e sparare; un tocco veloce a destra spara col mirino automatico. Fermati sulle piattaforme per torrette e alleati. 4 vite. |
| 🏀 BASKET | 1 contro 1, 2 contro 2 o 3 contro 3: BALLERS contro HOOPERS. Prendi la palla passandoci sopra; con la palla puoi solo passare o tirare (tieni premuto lo sparo e rilascia nella zona verde della barra). 2 punti da dentro l'arco, 3 da fuori. Dopo ogni canestro le due squadre ripartono dal proprio canestro e la palla va a chi ha subito. Nessuno muore e nessuno viene stordito: il primo colpo rallenta, il secondo fa perdere palla. Il campo è più grande con più giocatori. Si vince a 21 punti o in vantaggio dopo 3 minuti. |

## Comandi

| Giocatore | Movimento | Sparo | Speciale | Passaggio (basket) | Balletti |
|---|---|---|---|---|---|
| P1 | WASD | Q | E | F | 1-4 |
| P2 | Frecce | Invio | Shift destro | Ctrl destro | 7-0 |
| P3 | IJKL | U | O | Y | |
| P4 | Tastierino 8456 | Tastierino 0 | Tastierino + | Tastierino , | |
| P5-P8 | solo pad o telefono | | | | |

Pad: levetta sinistra per muoversi, levetta destra per mirare (spinta a fondo spara), R1/R2/A per sparare, L2 per la speciale. Esc o Start: pausa · R: torna al menu · G: qualità grafica.

Ogni giocatore ha il suo colore: **P1 rosso, P2 blu, P3 verde, P4 giallo, P5 viola, P6 rosa, P7 marrone, P8 grigio**. Lo stesso colore è usato per l’anello sotto i piedi, per le barre in alto, per i nomi nei messaggi e per il riquadro che si muove nel menu col pad.

## Personaggi

| Personaggio | Vita | Velocità | Arma | Mossa speciale |
|---|---|---|---|---|
| **Sasso** | 90 | 1.15 | Ascia enorme (Corta · 40 (15% critico 80)) | Collo rotante: allunga il collo e fa un giro completo di 360°, colpendo (48 + spinta + stordimento) chiunque sia nel raggio. |
| **Squalo delle Lamie** | 70 | 1.15 | Squalo di terra: va dritto dove miri, lascia il solco e azzanna (Lunga · 45 dove salta fuori, mira manuale) | Cavalca lo squalo di terra per 5 s: passa sotto a tutto e morde chi tocca (26 + spinta), niente sanguinamento. |
| **Giorgio** | 120 | 1.12 | Teste pelate infuocate: bruciano (Corta · 9 a fiammata (~76/s) + bruciatura) | Tre teste pelate infuocate verso i nemici vicini. |
| **Claudio** | 150 | 0.95 | Pugno che si sdoppia (Media · 22 a pugno, si sdoppia in 2 e rimbalza sui muri) | Diventa Hulk per 8 s: pugni giganti e rompe i mobili; alla fine resta senza maglietta. |
| **Phorno** | 115 | 1 | Cosce di pollo fritte (Corta · 23 + scia d'olio che fa scivolare) | Olio su tutta la mappa per 5 s: tutti gli avversari scivolano. |
| **Piadelloski** | 120 | 1.05 | Serpenti arcobaleno (Lunga · 33 perforante) | Evoca il cobra alato che combatte con lui. |
| **Luchino** | 110 | 1.05 | Pistola a raffica: 4 colpi uno dietro l'altro (Lunga · 19 ×4 a raffica) | Chiama due poliziotti in mutande come rinforzi. |
| **Uaims** | 220 | 0.9 | Piedone dal cielo (Media · fino a 83 ad area) | Pioggia di piedi: 6 piedoni in punti casuali della mappa. |
| **Viki** | 90 | 1.28 | Nasone gigante (Corta · 50) | ZA WARDO: ferma il tempo per 3 s (si muove solo lei). |
| **IL** | 80 | 1.35 | Birra gigante (Media · 32) | Cannone di birra per 3,2 s. |
| **Azzone** | 200 | 0.77 | Angurie a pallettoni: 6 angurie ravvicinate a ventaglio (30°), medio raggio (Media · 16 ×6 a ventaglio (30°)) | Saltone in avanti: atterra con danno ad area (55, raggio 3, spinta e stordimento), come King Kong. |
| **Marcow** | 100 | 1.2 | Zucchine esplosive (Lunga · fino a 38 ad area) | Cavalca Travis (gattone grigio scuro) per 10 s: travolge chi gli sta intorno. |
| **Pio el Fuego Ardente** | 140 | 0.85 | Tridente di Poseidone: lo lancia e fa un'onda (Media · 34 perforante + onda 15) | Bolla protettiva: invincibile per 3 s. |
| **Mastino Lavico** | 300 | 0.7 | Sputafuoco lavico (bruciatura) (Corta · 3 + bruciatura 20) | Sei mastini kamikaze. |
| **Sjew** | 125 | 1.38 | Shofar: soffio sonoro da vicino (Corta · 27 a cono largo) | Canzone di Sjew per 7 s: tutti gli altri ballano (niente armi, -40% velocità); Sjew e i suoi compagni invece possono attaccare. |
| **Olimpia** | 105 | 1.05 | Panzerotti: si attaccano e dopo 1 s esplodono di mozzarella filante (Media · fino a 42 ad area dopo 1 s) | Tempesta di quaglio e panzerotti per 6 s. |
| **Ida** | 95 | 1.15 | Frecce infuocate: bruciano (Lunga · 20 + bruciatura) | Tre frecce infuocate potenziate. |
| **MauEnel** | 120 | 1.25 | Saette che stordiscono per mezzo secondo (Lunga · 18 + stordisce mezzo secondo) | Vola sopra a tutti per 3,5 s, invincibile, e fulmina i nemici vicini. |
| **Muzungu** | 170 | 0.85 | Copertone: va e torna, lo devi riprendere per rilanciarlo (Lunga · 28 all'andata e al ritorno, copertone largo) | Arriva il TEMPESTA: autobus grigio con la scritta ai lati e sul tetto, 5 s, travolge e rompe i mobili. L’autobus ha 120 di vita (barra sopra): i colpi vanno a lui e se si distrugge la speciale finisce. |
| **Michele 7 di denari** | 190 | 0.82 | Anguria gigante tirata come una palla da bowling: travolge tutto (Media · 45 perforante, travolge e spinge) | Anguria gigante: più veloce del 50% e con il 30% di danno in più dell’attacco normale (59), rimbalza sui muri per 3 s. |
| **Piero** | 100 | 1.15 | Scarpe e solette: per ricaricare devi andare a riprenderle (Media · 36 · 3 scarpe (rosa, gialla, arcobaleno) da riprendere; senza: calzini) | Apre un Foot Locker che risucchia i nemici vicini. |
| **Il Bello** | 160 | 1.05 | Cerchio di bellezza tutto intorno, con posa sexy. Se vince balla la bachata (Corta · 24 tutto intorno) | Raffica di bellezza per 4 s: pugni velocissimi e +50% di vita, che svanisce a fine speciale. |
| **L'Atleta** | 105 | 1.2 | Pallonata: tiro dritto e potente, più veloce di prima (Media · 30 tiro dritto) | Selfie: il flash stordisce (1,6 s) tutti i nemici intorno, in un raggio più largo (4,5). Si ricarica in fretta. |
| **Il Cuoco Fan di Hockey** | 110 | 1.1 | Tartarughe velocissime che rimbalzano sui muri (Media · 10, rimbalza 3 volte) | Motosega per 6 s. |
| **Il Divino e il Velociraptor** | 160 | 1.4 | Il raptor morde e graffia; a 60 hp muore e il Divino alza lo scudo dorato che respinge i colpi (Corta · 30 a morso (scudo dorato sotto i 60 hp)) | Ottiene una vita in più. |

## Boss

Arrivano in Sopravvivenza e in Difendi la birra ogni 5 ondate, a rotazione (prima quelli mai visti). Vita, danni e ritmo crescono con l’ondata e col numero di giocatori. I boss a terra calcolano il percorso solo nei passaggi abbastanza larghi per il loro corpo e, se restano bloccati, prima provano a girare intorno all’ostacolo.

| Boss | Dall’ondata | Vita base | Attacchi |
|---|---|---|---|
| ORSO PUNK A 4 BRACCIA | 5 | 1000 | raffiche di pugni e colpo di coda; un po’ più veloce di prima |
| RE DI NAPOLI | 5 | 1000 | Vespa con due energumeni: pizze e carica col clacson; fa un po’ meno danni di prima |
| KING KONG MUTANTE | 5 | 1200 | salto con danno ad area, massi, pugni |
| COBRA ALATO | 5 | 850 | veleno a ventaglio e scatto |
| SASSOFONO VOLANTE | 5 | 1100 | vortice, pioggia di gelati e carte |
| PESCE ROSSO CON LE GAMBE | 5 | 1150 | scivolata e bolle che rallentano |
| TRICHECO COL JETPACK | 5 | 1100 | bombe dall’alto e carica |
| CALAMARO ALBANESE | 5 | 1250 | NUOVO, dal render "Super Calamaro Albanese": calamaro palestrato a blocchi con qeleshe, baffoni e becco giallo; 8 bracci che strisciano, bicipite gonfio sul tentacolo sinistro e bandiera albanese che sventola nel destro; quando attacca "pompa" i muscoli. Fa spuntare tentacoli da sottoterra (prima il cerchio rosso, poi esce e colpisce), ogni tanto chiude il bersaglio in una gabbia di tentacoli, da vicino spruzza inchiostro che rallenta |
| BLATTONOIDE-9 | 10 | 1500 | raggio al plasma e spada |
| CAIMANO LANCIAMISSILI | 5 | 1400 | missili a ricerca: ora un po’ più lenti e meno precisi, e lui un filo più lento |
| NINJA CACTUS | 5 | 950 | si teletrasporta dietro di te e spara le spine 1 secondo dopo essere ricomparso; spine al contatto |
| STATUA DI FATOS | 10 | 1500 | raffiche di mitra |
| CERBERO A TRE TESTE | 10 | 1500 | NUOVO. Testa di geco che sputa mele, testa centrale (un dildo) che si allunga lungo la linea rossa di avviso, testa di squalo martello che dà martellate da vicino |
| ELEFANTE LANCIASCIMMIE | 15 | 1600 | lancia scimmie e gorilla che restano in campo |
| VELOCIRAPTOR COI BAFFI | 20 | 1200 | salti e graffi |

## Mappe

| Mappa | Tipo | Descrizione |
|---|---|---|
| IL BILOCALE | normale | L'appartamento originale: soggiorno, cucina, corridoio, camera da letto, bagno e ripostiglio. |
| ETÀ DELLA PIETRA | normale | Villaggio preistorico con capanne di pietra, auto a rulli, scheletro di mammut e catrame. Ogni 10-25 s un T-REX attraversa uno dei due sentieri a strisce: chi lo tocca muore all'istante! |
| PIANETA XENO | normale | Arena aliena tonda: al centro una pozza di melma (ci si spara sopra, ma non ci si cammina), cristalli, astronave schiantata e due portali che teletrasportano da un lato all'altro. Ogni tanto arriva un'INVASIONE di alienini kamikaze. |
| ARREMBAGGIO | normale | Due galeoni pirata in una baia, collegati da tre passerelle e da un isolotto col tesoro: duelli a distanza sopra l'acqua e corpo a corpo sulle passerelle. Nel 2v2 ogni squadra parte dalla propria nave. |
| PARCO AURORA | normale | Il parco comunale di Via Cartesio a Valenzano, in proporzioni reali: campo da calcetto recintato, giochi per bambini, piazzale in ghiaia, giardino con piazzetta tonda e panchine curve, più parcheggio e Via Cartesio intorno. Gli alberi diventano trasparenti quando ci passi sotto. |
| COCKLAND | normale | Piazza viola al neon con un pene gigante disegnato sul pavimento: palle a sinistra, asta coi pilastri, glande con la fontana a destra. Ogni tanto arriva la TEMPESTA DI QUAGLIO: una nuvola attraversa la mappa e fa piovere gocce bianche (il cerchio a terra avvisa dove cadono). Le chiazze che lasciano dimezzano la velocità di chi ci cammina sopra, alieni compresi. Nel 2v2: palle contro glande. |
| VILLA MARCONI | normale | Il parco di Valenzano accanto all'ufficio postale giallo: parcheggi e strade intorno, vialetti in diagonale, anfiteatro coi gradoni (ci si spara sopra), campetto in erba, rudere in pietra e il parco calisthenics con le sbarre. |
| IPERMERCATO | gigante (fino a 8) | Mappa gigante fino a 8 giocatori: corsie di scaffali, frigoriferi, banco salumi, casse e parcheggio. Ogni tanto i carrelli impazziti sfrecciano lungo una corsia: la striscia rossa ti avvisa. |
| PORTO DI BARI | gigante (fino a 8) | Mappa gigante fino a 8 giocatori: il molo con la nave, le gru e le file di container colorati, con blocchi di cemento come ripari. Ogni tanto una gru molla un container dove c'è il segno rosso: chi ci sta sotto è spacciato. |
| SPEZZATO | gigante (fino a 8) | Mappa gigante fino a 8 giocatori, dallo schizzo dello Spezzato: due prati divisi da Via del Parco. A sinistra il calcetto in terra rossa dentro la recinzione (6 varchi), altalena, scivolo e il laghetto (ci si spara sopra ma non si attraversa); a destra il campetto da pallavolo; intorno la piazza in porfido col bar, il chiosco e le auto parcheggiate. Quando la striscia rossa lampeggia sulla strada passa a tutta velocità una Panda verde del 2002 o una Golf modificata (ancora più veloce): chi viene preso perde 45 HP e finisce sul marciapiede. |
| MOLA · CASA DIROCCATA | gigante (fino a 8) | Mappa gigante fino a 8 giocatori: la casa diroccata sul mare di Mola, senza tetto, con muri crollati, il frigo ribaltato, la fetta di speck gigante, il materasso e il divano. Il CAVO DELLA MORTE ogni tanto scarica l'alta tensione su chi gli sta vicino (il cerchio giallo segna la zona). Dalle crepe escono le SUPER BLATTE: resistono a quasi tutto, ma lo SPRAY PER BLATTE le secca al primo colpo. Attenti alla spiaggia: GIANNI, il pitone gigante, esce dal mare senza avvisare e si mangia chi ci trova (sennò un ombrellone o una palma). |
| CHERNOBYL | gigante, solo cooperative | Solo per Sopravvivenza e Difendi la birra: Pripyat abbandonata, coi palazzoni vuoti, gli autoscontri, la ruota panoramica gialla e il sarcofago del reattore sullo sfondo. Ampi spazi aperti. Le pozze RADIOATTIVE verdi tolgono vita a chiunque ci stia dentro, alieni compresi. |
| VALENZANO (BA) | gigante, solo cooperative | Solo per Sopravvivenza e Difendi la birra: la piazza grande di Valenzano con la chiesa madre e il campanile, il bar coi tavolini, le case bianche e i vicoli, l'Ape e le Vespe, e a sud l'uliveto coi muretti a secco (bassi: ci si spara sopra). |
| SCAMPIA (NA) | gigante, solo cooperative | Solo per Sopravvivenza e Difendi la birra: la grande piazza di cemento tra le Vele a gradoni, col campetto da basket al centro, i murales, i motorini, i cassonetti e i blocchi di cemento come ripari. |
| TOKYO (SHIBUYA) | gigante, solo cooperative | Solo per Sopravvivenza e Difendi la birra: il grande incrocio a zebra di Shibuya al centro, i palazzi con le insegne al neon, i distributori automatici, il parchetto coi ciliegi in fiore e il torii rosso. Dietro i palazzi passa il treno della Yamanote. |
| MORIOH-CHO | gigante (fino a 8) | Una città bizzarra |
| VILLAGGIO AMAZZONICO | solo Basket | Solo per il Basket: un campo di terra battuta in mezzo alla foresta, tra capanne di paglia, il fiume e le torce. I tifosi del villaggio sulle panche di legno esultano a ogni canestro. |
| SPIAGGIA TROPICALE | solo Basket | Solo per il Basket: campo sulla sabbia davanti al mare, ombrelloni, palme e i venditori di cocco sullo sfondo. Il pubblico sui teli da mare esulta a ogni canestro. |
| STADIO TONY SPORT | solo Basket | Solo per il Basket: il campo sportivo comunale di Valenzano con due canestri al posto delle porte. Cartelloni pubblicitari, pista in terra battuta, tribuna rossa con la scritta TONY SPORT e il pubblico che esulta a ogni canestro. |

Note: a **Mola** Gianni (il pitone gigante) ora è più grande, esce dall’acqua senza “spuntare” di colpo e la coda arrotolata resta sott’acqua. Al **Parco Aurora** sono stati tolti alcuni piccoli ostacoli (un albero, una giostrina a molla, una panchina e un pezzo di aiuole) per muoversi meglio. Nel **Basket** il campo diventa 36×24 con 4 giocatori e 42×28 con 6.

## Difendi la birra: Sexy Shop

Ci si ferma sul tappeto rosa davanti al negozio. Le monete arrivano dalle uccisioni. Il numero di nemici dipende da quanti giocatori hanno **iniziato** la partita.

**Bot** (costano il 50% in più se chi compra ne ha già uno dello stesso tipo vivo in campo):

| Bot | Prezzo | Descrizione |
|---|---|---|
| Polli impazziti | 60 | Quattro polli velocissimi che beccano tutto. Fragili. |
| Cavaliere | 120 | Armatura pesante e spadone: tiene la linea. |
| Mafiosi italo-americani | 170 | Due picciotti col mitra a tamburo. Raffiche corte. |
| Mago sul cinghiale | 210 | Corre in giro sul suo cinghiale e lancia sfere magiche che esplodono. |
| Drago medievale | 360 | Vola sopra a tutto e brucia i nemici col fiato. Costa caro. |
| Lino Sassanelli | 200 | Ubriaco fradicio: va alla birra e la riempie di 5 vita al secondo per 60 secondi. I nemici lo possono colpire! |

**Potenziamenti** (fino a 5 livelli ciascuno):

| Potenziamento | Prezzo | Max | Descrizione |
|---|---|---|---|
| Birra rinforzata | 150 | 5 | +300 vita massima alla bottiglia e la ripara di 300. |
| Danni +10% | 160 | 5 | Tutti i giocatori fanno più male. |
| Velocità +8% | 120 | 5 | Tutti i giocatori corrono di più. |
| Vita +25 | 140 | 5 | Vita massima +25 a tutti i giocatori. |
| Costruzioni potenziate | 180 | 5 | Torrette, vulcani e allacci fanno il 25% di danni in più. |
| Costruzioni blindate | 160 | 5 | +30% vita alle costruzioni (anche a quelle già piazzate). |
| Alleati più forti | 150 | 5 | +25% vita e danni agli alleati comprati da adesso. |
| Ripara le costruzioni | variabile |  | Costa il 75% del prezzo di ogni costruzione danneggiata. |
| Resuscita un compagno | 450 |  | Riporta in partita un giocatore eliminato. |

**Costruzioni:**

| Costruzione | Prezzo | Descrizione |
|---|---|---|
| Torretta | 120 | Spara da sola ai nemici vicini. Non fortissima, ma non si stanca mai. |
| Torretta con postazione | 220 | Ci sali sopra e spari da lassù: finché regge, nessuno può colpirti. Sali passandoci sopra, scendi con il tasto della speciale. |
| Muretto | 40 | Basso: ferma i nemici ma ci spari sopra. |
| Vulcano | 280 | Erutta palle di lava sui nemici intorno e li lascia bruciare. |
| Allaccio abusivo | 240 | Un palo della luce collegato a caso: fulmina fino a tre nemici alla volta. |

Le costruzioni non si possono piazzare sopra o addosso a un giocatore, a un nemico o a un alleato. I punti di rinascita evitano edifici, negozio e costruzioni. Chi resta incastrato viene spostato fuori in automatico.

## Sopravvivenza: slot d’oro

Ogni giocatore la può usare una volta ogni 3 ondate. Dopo il risultato il gioco riparte in **2 secondi**. Chi viene eliminato rientra da solo **dopo 5 ondate**. Sotto la barra del giocatore, in alto, compaiono solo gli aumenti **totali** di danno, velocità e portata. I bonus si moltiplicano tra loro: Danno +5% e poi +7% fanno +12%, Velocità +10% due volte fa +21%.

| Rarità | Bonus |
|---|---|
| COMUNE | +10 vita massima |
| RARO | +20 vita massima |
| RARISSIMO | +30 vita massima |
| RARO | Vita piena (solo sotto il 70% di vita) |
| COMUNE | Danno +5% |
| RARO | Danno +7% |
| RARISSIMO | Danno +10% |
| COMUNE | Velocità +5% |
| RARO | Velocità +7% |
| RARISSIMO | Velocità +10% |
| JACKPOT | +1 vita |
| RARO | 2 robottini che sparano con te |
| COMUNE | Portata +4% |
| RARO | Portata +7% |
| RARISSIMO | Portata +10% |
| RARISSIMO | Invincibile per 45 secondi |
| RARISSIMO | Fiamma viola per 25 secondi |
| RARO | Resuscita un compagno |
| SFIGA | dildo fucsia: niente bonus e la slot si sposta |

## Rete

- L’host apre una stanza con un codice di 4 lettere. Col tasto 🚪 **Chiudi la stanza** (nel menu o nella pausa) la chiude: chi era collegato viene avvisato. Il guest esce col tasto 🚪 **Esci dalla stanza** (nella sala d'attesa o in alto a sinistra durante la partita) e torna al menu principale.
- Il codice passa una sola volta dal server pubblico di PeerJS, poi i dati vanno diretti via WebRTC.
- L’host fa girare tutta la partita e manda 20 istantanee al secondo (posizioni, eventi, HUD). I client mandano solo i comandi, 30 volte al secondo. Fino a 7 telefoni collegati.
- Server ICE: STUN di Cloudflare e Google; TURN pubblico di PeerJS. Un TURN personale (per esempio Metered, o il Worker Cloudflare in `cloudflare-worker/`) si inserisce dal menu 🔑 TURN e resta salvato solo nel browser (`localStorage`).

## Grafica e prestazioni

- Qualità adattiva: se gli fps scendono sotto 42 prima cala la risoluzione, poi si spengono le ombre; il tasto G cambia livello a mano.
- Le mesh statiche di mappe e personaggi vengono fuse (`mergeStatic`): da 20 a 300 draw call per mappa.
- La logica di gioco costa circa 0,3 ms a frame (misurata in Sopravvivenza a Mola con 4 giocatori).

## Dati sensibili

Controllati il codice e tutta la storia git: **non ci sono chiavi API né password private**. Ci sono solo le credenziali **pubbliche** del server TURN demo di PeerJS (`peerjs` / `peerjsp`), pubblicate da PeerJS stesso. Le chiavi Cloudflare del Worker stanno nelle variabili del pannello di Cloudflare, e l’indirizzo TURN personale resta nel browser di chi lo inserisce.

## Novità di questa versione

### Ultime modifiche
- **Basket:** dopo ogni canestro tutte e due le squadre ripartono dal proprio canestro; la palla va alla squadra che ha subito.
- **Azzone:** 6 pallettoni invece di 3, più ravvicinati, sempre nel cono di 30°, da 16 di danno l’uno (prima 20).
- **Sopravvivenza:** nella casella del giocatore si vedono solo gli aumenti totali di danno 💥, velocità 👟 e portata 🎯 presi alla slot, anche sul telefono (lì in piccolo, solo icona e percentuale).
- **L’Atleta:** attacca più in fretta (ricarica da 0,8 a 0,55 s) e il selfie ha un raggio più largo (da 3,2 a 4,5).
- **Rete:** tasto per chiudere la stanza (host) o uscirne (guest) e tornare al menu principale.

### Personaggi
- **Squalo delle Lamie:** l’attacco va dritto dove miri (non insegue più) e non fa più sanguinamento, nemmeno con la speciale.
- **Michele 7 di denari:** nuova speciale. Anguria gigante più veloce del 50% e col 30% di danno in più dell’attacco normale, che rimbalza sui muri per 3 secondi.
- **MauEnel:** la speciale dura il 30% in meno (da 5 a 3,5 s).
- **Muzungu:** risolto il copertone che a volte spariva (presa più larga e rete di sicurezza se il copertone non torna). Copertone più grande, più veloce e con più portata. L’autobus della speciale è grigio, ha TEMPESTA ben leggibile sui fianchi e sul tetto, e ha una barra di 120 di vita.
- **Sjew:** durante la canzone Sjew (e i suoi compagni) può attaccare; chi balla è più lento del 40%. Velocità +20% (da 1,15 a 1,38).
- **L’Atleta:** tiro dritto invece della palombella. Nuova speciale: selfie col flash che stordisce chi è intorno, e si ricarica in fretta.
- **Azzone:** velocità +10%. L’attacco è a pallettoni: 3 angurie in un cono di 30°, medio raggio, senza esplosione. Nuova speciale: salto in avanti con danno ad area all’atterraggio.
- **Sasso:** più veloce (da 1 a 1,15). Nuova speciale: allunga il collo e fa un giro di 360°.
- **Il Bello:** vita da 130 a 160 e raggio dell’attacco da 2,4 a 2,95. Durante la speciale ha +50% di vita, che svanisce alla fine.
- **Marcow:** Travis è di un grigio più scuro.

### Basket
- Canestri rifatti come quelli veri: palo fuori dal campo, braccio, tabellone col quadrato rosso, ferro e retina davanti (prima il ferro stava dietro il tabellone).
- Campo più grande con più giocatori: 30×20 in 1 contro 1, 36×24 in 2 contro 2, 42×28 in 3 contro 3.
- I colpi non stordiscono più: il primo rallenta, il secondo fa perdere la palla (e per un attimo non la si può riprendere).

### Difendi la birra
- Niente più rinascite dentro edifici o costruzioni; le costruzioni non si piazzano addosso ai giocatori; chi resta incastrato viene spostato fuori.
- Bot +50% di prezzo se chi compra ne ha già uno uguale vivo in campo.
- Nemici in base a quanti giocatori hanno iniziato la partita.
- Potenziamenti fino a 5 livelli (corretto anche il calcolo di “Costruzioni blindate” dal secondo livello in su).
- Nuovo bot **Lino Sassanelli**: ubriaco, va alla birra e la riempie di 5 vita al secondo per 60 secondi; i nemici lo possono colpire.

### Sopravvivenza
- La slot riparte dopo 2 secondi invece di 5.
- Chi viene eliminato rientra da solo dopo 5 ondate.
- “Resuscita un compagno” è diventato raro.
- Tolti i bonus “+10 hp” e “+25 hp”.
- “Vita piena” esce solo sotto il 70% di vita.

### Boss
- Ninja Cactus: spara 1 secondo dopo il teletrasporto.
- Caimano: lui e i missili sono un po’ più lenti, e i missili meno precisi.
- Orso punk: un po’ più veloce.
- Re di Napoli: fa circa il 22% di danni in meno.
- Nuovi boss: **Calamaro albanese** e **Cerbero a tre teste**.
- Boss più furbi: il percorso passa solo dove ci stanno, e se restano bloccati provano prima a girare intorno.

### Mappe
- Mola: Gianni più grande, esce dall’acqua con gli schizzi e la coda arrotolata resta sott’acqua.
- Parco Aurora: tolti alcuni piccoli ostacoli.

### Generale
- Sul PC in alto ci sono solo le barre di chi gioca: più grandi, col colore del giocatore, con la barra della vita e, in Sopravvivenza, l’elenco dei potenziamenti presi.
- Un colore per ogni giocatore (P1 rosso … P8 grigio), usato anche per il riquadro del menu col pad.
- Scritte che prima non si vedevano (SEXY SHOP, FOOT LOCKER, l’etichetta della birra, TEMPESTA): ora si leggono.
- Prestazioni: la TV di Mola costa molto meno, l’HUD non ricalcola più l’impaginazione a ogni colpo, e il primo frame non può più avere un tempo negativo (prima a volte faceva crashare l’animazione del cavo a Mola).
