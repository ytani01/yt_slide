import sys
from ytslide import browser, paths, video
with browser.chromium() as b:
    page = b.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(paths.PLAYER_HTML.as_uri() + '?slides=readme')
    page.wait_for_load_state('networkidle')
    page.emulate_media(media='screen')
    for i in (0, 2):
        page.evaluate(video.FIT, i)
        page.pdf(path=f'{sys.argv[1]}/slide{i+1}.pdf', width='1920px', height='1080px',
                 print_background=True, margin={'top':'0','right':'0','bottom':'0','left':'0'})
