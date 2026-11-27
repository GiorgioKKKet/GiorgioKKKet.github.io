# Grafiche di Bilocale Deathmatch

Render dei modelli del gioco, con le misure di quanto pesano. Generati da `strumenti/render-grafiche.mjs`: per rifarli dopo un restyle, lancia `node strumenti/render-grafiche.mjs` dalla cartella del progetto.

**Come leggere le misure**
- **Draw call**: quante volte la scheda video disegna il modello a ogni frame (dopo l'unione delle mesh statiche fatta dal gioco). È la misura che conta di più per le prestazioni.
- **+ ombre**: draw call in più per la mappa delle ombre (solo con qualità MEDIA o ALTA).
- **Triangoli**: quanti poligoni ha il modello. Pesano molto meno delle draw call.
- Riferimento: una partita di Sopravvivenza a Mola con 4 giocatori fa circa 130 draw call e 12.400 triangoli a frame. Limiti consigliati: personaggio fino a ~25-30 draw call e ~10.000 triangoli, boss fino a ~40 draw call e ~15.000 triangoli.
- Per le **mappe** le misure sono quelle dell'intera scena vuota (senza giocatori), vista come in partita.

## Personaggi (25)

| Render | Nome | Draw call | + ombre | Triangoli |
|---|---|---:|---:|---:|
| <img src="Personaggi/sasso.webp" width="120"> | **Sasso** | 10 | 10 | 468 |
| <img src="Personaggi/squalo-delle-lamie.webp" width="120"> | **Squalo delle Lamie** | 10 | 10 | 456 |
| <img src="Personaggi/giorgio.webp" width="120"> | **Giorgio** | 11 | 11 | 300 |
| <img src="Personaggi/claudio.webp" width="120"> | **Claudio** | 11 | 11 | 1032 |
| <img src="Personaggi/phorno.webp" width="120"> | **Phorno** | 10 | 10 | 1848 |
| <img src="Personaggi/piadelloski.webp" width="120"> | **Piadelloski** | 12 | 12 | 1428 |
| <img src="Personaggi/luchino.webp" width="120"> | **Luchino** | 10 | 10 | 468 |
| <img src="Personaggi/uaims.webp" width="120"> | **Uaims** | 14 | 14 | 696 |
| <img src="Personaggi/viki.webp" width="120"> | **Viki** | 14 | 14 | 456 |
| <img src="Personaggi/il.webp" width="120"> | **IL** | 10 | 10 | 732 |
| <img src="Personaggi/azzone.webp" width="120"> | **Azzone** | 10 | 10 | 408 |
| <img src="Personaggi/marcow.webp" width="120"> | **Marcow** | 10 | 10 | 468 |
| <img src="Personaggi/pio-el-fuego-ardente.webp" width="120"> | **Pio el Fuego Ardente** | 9 | 9 | 1764 |
| <img src="Personaggi/mastino-lavico.webp" width="120"> | **Mastino Lavico** | 38 | 38 | 20.114 |
| <img src="Personaggi/sjew.webp" width="120"> | **Sjew** | 16 | 15 | 2726 |
| <img src="Personaggi/olimpia.webp" width="120"> | **Olimpia** | 30 | 30 | 1932 |
| <img src="Personaggi/ida.webp" width="120"> | **Ida** | 32 | 16 | 1256 |
| <img src="Personaggi/mauenel.webp" width="120"> | **MauEnel** | 24 | 16 | 2432 |
| <img src="Personaggi/muzungu.webp" width="120"> | **Muzungu** | 20 | 20 | 3148 |
| <img src="Personaggi/michele-7-di-denari.webp" width="120"> | **Michele 7 di denari** | 22 | 15 | 1132 |
| <img src="Personaggi/piero.webp" width="120"> | **Piero** | 15 | 15 | 780 |
| <img src="Personaggi/il-bello.webp" width="120"> | **Il Bello** | 10 | 10 | 456 |
| <img src="Personaggi/l-atleta.webp" width="120"> | **L'Atleta** | 15 | 15 | 700 |
| <img src="Personaggi/il-cuoco-fan-di-hockey.webp" width="120"> | **Il Cuoco Fan di Hockey** | 10 | 10 | 480 |
| <img src="Personaggi/il-divino-e-il-velociraptor.webp" width="120"> | **Il Divino e il Velociraptor** | 23 | 22 | 824 |

## Boss (15)

| Render | Nome | Draw call | + ombre | Triangoli |
|---|---|---:|---:|---:|
| <img src="Boss/orso-punk-a-4-braccia.webp" width="120"> | **ORSO PUNK A 4 BRACCIA** | 27 | 27 | 4670 |
| <img src="Boss/king-kong-mutante.webp" width="120"> | **KING KONG MUTANTE** | 18 | 18 | 3488 |
| <img src="Boss/cobra-alato.webp" width="120"> | **COBRA ALATO** | 7 | 7 | 3660 |
| <img src="Boss/pesce-rosso-con-le-gambe.webp" width="120"> | **PESCE ROSSO CON LE GAMBE** | 18 | 18 | 5760 |
| <img src="Boss/tricheco-col-jetpack.webp" width="120"> | **TRICHECO COL JETPACK** | 13 | 13 | 2968 |
| <img src="Boss/caimano-lanciamissili.webp" width="120"> | **CAIMANO LANCIAMISSILI** | 21 | 21 | 2160 |
| <img src="Boss/ninja-cactus.webp" width="120"> | **NINJA CACTUS** | 7 | 7 | 1492 |
| <img src="Boss/elefante-lanciascimmie.webp" width="120"> | **ELEFANTE LANCIASCIMMIE** | 26 | 26 | 3960 |
| <img src="Boss/velociraptor-coi-baffi.webp" width="120"> | **VELOCIRAPTOR COI BAFFI** | 22 | 22 | 2212 |
| <img src="Boss/blattonoide-9.webp" width="120"> | **BLATTONOIDE-9** | 77 | 60 | 3688 |
| <img src="Boss/re-di-napoli.webp" width="120"> | **RE DI NAPOLI** | 21 | 21 | 1260 |
| <img src="Boss/sassofono-volante.webp" width="120"> | **SASSOFONO VOLANTE** | 4 | 3 | 1232 |
| <img src="Boss/statua-di-fatos.webp" width="120"> | **STATUA DI FATOS** | 23 | 23 | 720 |
| <img src="Boss/calamaro-albanese.webp" width="120"> | **CALAMARO ALBANESE** | 13 | 13 | 4284 |
| <img src="Boss/cerbero-a-tre-teste.webp" width="120"> | **CERBERO A TRE TESTE** | 30 | 30 | 6161 |

## Acquistabili di "Difendi la birra" (11)

Le misure sono per un singolo modello: i polli arrivano in 4 e i mafiosi in 2.

| Render | Nome | Tipo | Draw call | + ombre | Triangoli |
|---|---|---|---:|---:|---:|
| <img src="Acquistabili/polli-impazziti.webp" width="120"> | **Polli impazziti** | Alleato (×4) | 2 | 2 | 592 |
| <img src="Acquistabili/cavaliere.webp" width="120"> | **Cavaliere** | Alleato | 4 | 4 | 120 |
| <img src="Acquistabili/mafiosi-italo-americani.webp" width="120"> | **Mafiosi italo-americani** | Alleato (×2) | 4 | 4 | 184 |
| <img src="Acquistabili/mago-sul-cinghiale.webp" width="120"> | **Mago sul cinghiale** | Alleato | 7 | 7 | 1148 |
| <img src="Acquistabili/drago-medievale.webp" width="120"> | **Drago medievale** | Alleato | 8 | 8 | 1196 |
| <img src="Acquistabili/lino-sassanelli.webp" width="120"> | **Lino Sassanelli** | Alleato | 8 | 8 | 556 |
| <img src="Acquistabili/torretta.webp" width="120"> | **Torretta** | Costruzione | 4 | 4 | 220 |
| <img src="Acquistabili/torretta-con-postazione.webp" width="120"> | **Torretta con postazione** | Costruzione | 5 | 5 | 420 |
| <img src="Acquistabili/muretto.webp" width="120"> | **Muretto** | Costruzione | 2 | 2 | 24 |
| <img src="Acquistabili/vulcano.webp" width="120"> | **Vulcano** | Costruzione | 2 | 1 | 60 |
| <img src="Acquistabili/allaccio-abusivo.webp" width="120"> | **Allaccio abusivo** | Costruzione | 4 | 4 | 452 |

## Mappe (19)

| Render | Nome | Tipo · misure | Draw call | + ombre | Triangoli |
|---|---|---|---:|---:|---:|
| <img src="Mappe/il-bilocale.webp" width="220"> | **IL BILOCALE** | normale · 30×20 m | 82 | 77 | 41.732 |
| <img src="Mappe/eta-della-pietra.webp" width="220"> | **ETÀ DELLA PIETRA** | normale · 30×20 m | 122 | 105 | 56.921 |
| <img src="Mappe/pianeta-xeno.webp" width="220"> | **PIANETA XENO** | normale · 30×20 m | 66 | 51 | 56.518 |
| <img src="Mappe/arrembaggio.webp" width="220"> | **ARREMBAGGIO** | normale · 30×20 m | 56 | 53 | 25.368 |
| <img src="Mappe/parco-aurora.webp" width="220"> | **PARCO AURORA** | normale · 30×20 m | 67 | 61 | 32.068 |
| <img src="Mappe/cockland.webp" width="220"> | **COCKLAND** | normale · 30×20 m | 45 | 42 | 17.668 |
| <img src="Mappe/villa-marconi.webp" width="220"> | **VILLA MARCONI** | normale · 30×20 m | 68 | 64 | 21.348 |
| <img src="Mappe/ipermercato.webp" width="220"> | **IPERMERCATO** | gigante · 44×28 m | 53 | 34 | 98.568 |
| <img src="Mappe/porto-di-bari.webp" width="220"> | **PORTO DI BARI** | gigante · 44×28 m | 27 | 23 | 13.720 |
| <img src="Mappe/spezzato.webp" width="220"> | **SPEZZATO** | gigante · 44×28 m | 134 | 127 | 54.870 |
| <img src="Mappe/mola-casa-diroccata.webp" width="220"> | **MOLA · CASA DIROCCATA** | gigante · 44×28 m | 130 | 121 | 12.418 |
| <img src="Mappe/chernobyl.webp" width="220"> | **CHERNOBYL** | solo cooperative · 44×28 m | 46 | 38 | 18.356 |
| <img src="Mappe/valenzano-ba.webp" width="220"> | **VALENZANO (BA)** | solo cooperative · 44×28 m | 84 | 81 | 29.676 |
| <img src="Mappe/scampia-na.webp" width="220"> | **SCAMPIA (NA)** | solo cooperative · 44×28 m | 44 | 41 | 16.688 |
| <img src="Mappe/tokyo-shibuya.webp" width="220"> | **TOKYO (SHIBUYA)** | solo cooperative · 44×28 m | 80 | 53 | 10.748 |
| <img src="Mappe/morioh-cho.webp" width="220"> | **MORIOH-CHO** | gigante · 76×34 m | 160 | 154 | 66.058 |
| <img src="Mappe/villaggio-amazzonico.webp" width="220"> | **VILLAGGIO AMAZZONICO** | solo Basket · 30×20 m | 99 | 35 | 33.864 |
| <img src="Mappe/spiaggia-tropicale.webp" width="220"> | **SPIAGGIA TROPICALE** | solo Basket · 30×20 m | 93 | 36 | 21.218 |
| <img src="Mappe/stadio-tony-sport.webp" width="220"> | **STADIO TONY SPORT** | solo Basket · 30×20 m | 112 | 54 | 24.646 |
