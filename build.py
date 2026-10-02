"""Zostaví index.html + style.css s cache bustingom (?v=hash). Služby podľa katalógu Zoznam.sk (SARMEL, s. r. o., Modra), fotky ilustračné."""
import hashlib
from pathlib import Path
from PIL import Image
D = Path(__file__).parent

MARQUEE = ['Obklady a dlažby', 'Rekonštrukcie kúpeľní', 'Sadrokartón – predaj aj montáž', 'Murárske práce', 'Maliarske práce', 'Modra a okolie']
# (fotka, názov, popis)
SLUZBY = [
    ('s-obklad', 'Obklady a dlažby', 'Obklady stien a dlažby v kúpeľniach, na WC, v kuchyniach aj na chodbách. Od prípravy podkladu po škárovanie.'),
    ('s-kupelna', 'Rekonštrukcie kúpeľní', 'Kúpeľňa alebo WC celé na jednom mieste: búranie, murárske práce, sadrokartón, obklad, dlažba aj maľovka.'),
    ('s-sdk', 'Sadrokartón – predaj aj montáž', 'Priečky, podhľady a predsteny zo sadrokartónu. Materiál od nás môžete aj kúpiť.'),
    ('s-murar', 'Murárske práce', 'Murovanie priečok, vysprávky a stavebné úpravy, ktoré si rekonštrukcia vyžiada.'),
    ('s-malba', 'Maliarske práce', 'Maľovanie stien a stropov ako posledný krok, aby bol priestor hotový naraz.'),
]
# kroky rekonštrukcie kúpeľne (fotka, názov, text)
KROKY = [
    ('f-murar', 'Murárske práce', 'Najprv priestor pripravíme: búranie starého obkladu, murovanie a vysprávky stien, aby mal nový obklad pevný a rovný podklad.'),
    ('f-sdk', 'Sadrokartón', 'Predsteny pre závesné WC, podhľady alebo nové priečky. Rovné plochy, na ktoré sa dobre obkladá aj maľuje.'),
    ('f-obklad', 'Obklad a dlažba', 'Obklad a dlažbu kladieme podľa toho, ako si to vyberiete: formát, spôsob kladenia aj farbu škáry.'),
    ('f-hotovo', 'Maľovka a hotovo', 'Na záver vymaľujeme a kúpeľňa je hotová. Celý čas máte jeden kontakt, jednu firmu.'),
]
# (súbor, popis, veľkosť v mriežke: b = 2×2, w = široká, t = vysoká, '' = 1×1)
GALERIA = [
    ('g-mramor', 'Mramorový obklad pri umývadle', 'b'),
    ('g-biela', 'Biela kúpeľňa', 't'),
    ('g-mozaika', 'Kamenná mozaika', ''),
    ('g-drevo', 'Kúpeľňa s drevom', ''),
    ('g-kladenie', 'Kladenie dlaždíc', 'w'),
    ('g-obluk', 'Zrkadlo v oblúku', 't'),
    ('g-supiny', 'Obklad šupiny', 'w'),
    ('g-siva', 'Sivá kúpeľňa so sprchou', 'w'),
    ('g-kosostvorec', 'Obklad kosoštvorce', 't'),
    ('g-dlazba', 'Dlažba pred kladením', 'w'),
]

size = lambda n: Image.open(D / 'img' / f'{n}.jpg').size
marquee = ''.join(f'<span>{t}</span><b aria-hidden="true"></b>' for t in MARQUEE) * 2
sluzby = '\n' + '\n'.join(
    f'      <li class="svc__i rv" data-img="img/{f}.jpg"><span class="svc__n">{i:02d}</span><h3>{n}</h3><p>{p}</p><span class="svc__a" aria-hidden="true">→</span></li>'
    for i, (f, n, p) in enumerate(SLUZBY, 1)) + '\n    '
kroky_foto = ''.join(
    f'<img src="img/{f}.jpg" alt="" loading="lazy" width="{size(f)[0]}" height="{size(f)[1]}"{" class=\"is-on\"" if i == 0 else ""}>'
    for i, (f, _, _) in enumerate(KROKY))
kroky = '\n'.join(
    f'      <div class="bath__s" data-i="{i}"><b>{i + 1:02d}</b><h3>{n}</h3><p>{p}</p><img class="bath__m" src="img/{f}.jpg" alt="{n} (ilustračné foto)" loading="lazy" width="{size(f)[0]}" height="{size(f)[1]}"></div>'
    for i, (f, n, p) in enumerate(KROKY))
def fig(n, popis, k):
    w, h = size(n)
    cls = 'bi' + (f' bi--{k}' if k else '')
    return f'      <figure class="{cls}" data-full="img/{n}.jpg"><img src="img/{n}.jpg" alt="{popis} (ilustračné foto)" loading="lazy" width="{w}" height="{h}"><figcaption>{popis}</figcaption></figure>'
galeria = '\n' + '\n'.join(fig(*g) for g in GALERIA) + '\n    '

css = (D / 'fonts/fonts.css').read_text() + '\n' + (D / 'style.src.css').read_text()
(D / 'style.css').write_text(css)
h = lambda b: hashlib.md5(b).hexdigest()[:8]
html = (D / 'src.html').read_text()
for k, v in dict(marquee=marquee, sluzby=sluzby, kroky_foto=kroky_foto, kroky=kroky, galeria=galeria).items():
    html = html.replace('{{' + k + '}}', v)
html = html.replace('{{css}}', h(css.encode())).replace('{{js}}', h((D / 'main.js').read_bytes()))
assert '{{' not in html
(D / 'index.html').write_text(html)
print('ok')
