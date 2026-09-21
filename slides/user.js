// スライドのデータ。player.html?slides=user から読まれる（TODO-051、TODO-053）。
// docs/User.md（スライドを作る人向けの手順）の要点をスライドにしたもの。
// 共通の再生エンジンは player.html の中にある。

const slidesConfig = {
    title: 'player.html で別のスライドを作る - 使い方',
    heading: '新しいスライドを作る手順',
    // index.html の一覧に出す説明とアイコン（ytslide index が読む。TODO-089）
    summary: 'スライドの作り方',
    icon: 'fa-pen-ruler',
    // このスライド一式だけの読みの置換表（TODO-054）。共通は player.html
    rules: [
        [/\.js\b/gi, ' ドット ジェイエス'],
        [/\bwrite\b/gi, 'ライト'],
    ],
};

// 巻末のアイコン一覧（TODO-069）。用途ごとに 3〜4 件、FontAwesome 6.5.1 の
// 無料の solid から選んである。docs/User.md の付録と同じ内容。
const ICON_GROUPS = [
    ['箇条書き・一覧', ['fa-list-check', 'fa-list-ol', 'fa-table-list']],
    ['注意・禁止', ['fa-triangle-exclamation', 'fa-circle-exclamation', 'fa-ban', 'fa-circle-info']],
    ['手順・進行', ['fa-flag-checkered', 'fa-arrow-right', 'fa-circle-check']],
    ['コード・端末', ['fa-code', 'fa-terminal', 'fa-file-code']],
    ['ファイル・文書', ['fa-folder-open', 'fa-file-lines', 'fa-book']],
    ['時間・計測', ['fa-clock', 'fa-stopwatch', 'fa-gauge-high', 'fa-chart-simple']],
    ['人・対話', ['fa-users', 'fa-comments', 'fa-robot']],
    ['図解・設定', ['fa-diagram-project', 'fa-table', 'fa-gear', 'fa-sliders']],
    ['強調・ひらめき', ['fa-lightbulb', 'fa-star', 'fa-wand-magic-sparkles']],
];

// 1 枚ぶん（3 グループ）を 3 カラムに並べる
function iconTable(groups) {
    return `
        <div class="grid grid-cols-3 gap-[1.2cqw]">
            ${groups.map(([label, names]) => `
                <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-[1.2cqw]">
                    <div class="text-sky-300 font-bold mb-[0.9cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">${label}</div>
                    <div class="space-y-[0.7cqw] text-slate-200">
                        ${names.map((name) => `
                            <div class="flex items-center gap-[0.9cqw]">
                                <i class="fa-solid ${name} text-lime-400 flex-shrink-0 text-center" style="width: 2.4cqw; font-size: clamp(0.95rem, 2cqw, 1.45rem);"></i>
                                <code class="font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.15rem);">${name}</code>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

const slideData = [
    // Slide 1
    {
        title: 'player.html で別のスライドを作る',
        duration: 7,
        narration: 'このプレゼンでは、player.html を触らずに自分のスライドを作成する手順をご紹介します。',
        render: function() {
            return `
                <div class="flex flex-col items-start justify-center h-full px-[4cqw] py-[1.5cqw] space-y-[1.5cqw]">
                    <span class="text-sky-400 font-bold tracking-widest flex items-center gap-[1cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">
                        <i class="fa-solid fa-clapperboard text-lime-400"></i> USAGE GUIDE
                    </span>
                    <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.6rem, 4.6cqw, 3.4rem);">
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">player.html</span> で別のスライドを作る
                    </h1>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(1.05rem, 2.5cqw, 1.9rem);">
                        スライド作成者向けの手順
                    </p>
                </div>
            `;
        }
    },
    // Slide 2
    {
        title: '基本方針',
        duration: 10,
        narration: '再生エンジンは player.html が持っています。新しいスライドを作るときは、slides フォルダに名前.js を1つ足すだけで済みます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-compass text-lime-400"></i> 基本方針
                    </h2>
                    <div class="grid grid-cols-2 gap-[1.8cqw] items-center">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.8cqw] text-center">
                            <i class="fa-solid fa-gear text-slate-500 mb-[0.8cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"></i>
                            <div class="text-slate-300 font-bold" style="font-size: clamp(1.05rem, 2.3cqw, 1.7rem);">player.html</div>
                            <div class="text-slate-400 mt-[0.4cqw] font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">再生エンジン。触らない</div>
                        </div>
                        <div class="bg-sky-950/40 border border-sky-500/50 rounded-xl p-[1.8cqw] text-center">
                            <i class="fa-solid fa-file-circle-plus text-lime-400 mb-[0.8cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"></i>
                            <div class="text-sky-300 font-bold font-mono" style="font-size: clamp(1.05rem, 2.3cqw, 1.7rem);">slides/&lt;名前&gt;.js</div>
                            <div class="text-slate-200 mt-[0.4cqw] font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">これを1つ足すだけでよい</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 3
    {
        title: '準備する',
        duration: 15,
        narration: 'まず ytslide をインストールします。作業用のディレクトリを作って移動し、ytslide init を実行します。これで player.html と index.html、slides フォルダが用意されます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-screwdriver-wrench text-lime-400"></i> 準備する
                    </h2>
                    <div class="space-y-[0.9cqw] font-mono text-slate-100" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                        <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw]">uv tool install 'git+https://github.com/ytani01/yt_slide'</div>
                        <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw]">mkdir ~/my-slides &amp;&amp; cd ~/my-slides</div>
                        <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw]">ytslide init</div>
                    </div>
                    <div class="bg-amber-950/40 border border-amber-500/40 rounded-xl p-[1.3cqw] mt-[1.3cqw] text-amber-300 flex items-center gap-[1.2cqw] font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                        <i class="fa-solid fa-circle-info text-amber-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                        <span><code>uv</code> が未導入なら、先に README の「インストール」を見る</span>
                    </div>
                </div>
            `;
        }
    },
    // Slide 4
    {
        title: '書いて確かめる',
        duration: 17,
        narration: 'User.md の最小例を slides/sample.js に保存し、まず 1 枚だけ自分の内容に直します。保存したら player.html?slides=sample をブラウザで開き、再読み込みして見た目と読み上げを確かめます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-pen-to-square text-lime-400"></i> 書いて確かめる
                    </h2>
                    <div class="space-y-[1cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                        <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw] text-slate-100 font-mono">slides/sample.js を作る</div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.2cqw] text-slate-200 font-medium">題名・本文・ナレーションを自分用に直す。<code class="font-mono text-lime-400">duration</code> は省略せず、おおよその秒数でよい</div>
                        <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.2cqw] text-sky-300 font-mono break-all">player.html?slides=sample</div>
                        <div class="text-slate-300 font-medium flex items-center gap-[0.8cqw]"><i class="fa-solid fa-arrows-rotate text-lime-400"></i> 保存 → 再読み込み → 見た目と読み上げを確認 → 修正</div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 5
    {
        title: '一覧・仕上げ・共有',
        duration: 15,
        narration: '一覧から開きたいときは ytslide index を実行します。時間表示を合わせたいときだけ、ナレーションが固まってから update を 1 回実行します。共有は Web サーバーへ置くか、MP4 に書き出します。',
        body: `
            <div class="space-y-[1cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                <div class="bg-slate-800/80 border border-lime-500 p-[1.2cqw] rounded-xl text-slate-200 font-medium"><code class="font-mono text-lime-400">ytslide index</code> — ファイルや一覧の説明・アイコンを変えたら、一覧を作り直す</div>
                <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.2cqw] text-sky-300 font-medium"><code class="font-mono">ytslide update --slides sample</code> — 時間表示を合わせたいときだけ。測定して一覧も作り直す</div>
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.2cqw] text-slate-200 font-medium"><i class="fa-solid fa-share-nodes text-lime-400 mr-[0.7cqw]"></i>共有は Web サーバーへ置くか、<code class="font-mono">ytslide video</code> で MP4 にする</div>
            </div>
        `,
    },
    // Slide 6
    {
        title: 'slideData の中身',
        duration: 10,
        narration: 'slideData は配列で、1つの要素が1枚のスライドです。題名と秒数と読み上げ文と、本文の HTML を持ちます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.4cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-table-list text-lime-400"></i> slideData の中身
                    </h2>
                    <p class="text-slate-300 mb-[1.2cqw] font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.4rem);">配列の1要素が1枚のスライド。4つのキーを持つ。</p>
                    <div class="space-y-[0.8cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-center gap-[1.2cqw]">
                            <span class="font-mono font-bold text-sky-400 w-[15cqw] flex-shrink-0" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">title</span>
                            <span class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">プレイリストに出る題名</span>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-center gap-[1.2cqw]">
                            <span class="font-mono font-bold text-lime-400 w-[15cqw] flex-shrink-0" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">duration</span>
                            <span class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">このスライドのおおよその秒数。省略しない</span>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-center gap-[1.2cqw]">
                            <span class="font-mono font-bold text-amber-400 w-[15cqw] flex-shrink-0" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">narration</span>
                            <span class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">読み上げる文章。字幕にもそのまま出る</span>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-center gap-[1.2cqw]">
                            <span class="font-mono font-bold text-purple-400 w-[15cqw] flex-shrink-0" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">body</span>
                            <span class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">本文の HTML を文字列で書く</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 7
    {
        title: '番号と枚数は自動',
        duration: 9,
        narration: 'スライドの番号や総枚数は自分で書きません。slideData の並び順と duration の合計から、自動で計算されます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-wand-magic-sparkles text-lime-400"></i> 番号と枚数は自動
                    </h2>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.6cqw] text-center text-slate-200 font-mono font-bold mb-[1.6cqw]" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">
                        SLIDE 01 / 16
                    </div>
                    <div class="grid grid-cols-2 gap-[1.6cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] text-center">
                            <div class="text-sky-400 font-bold mb-[0.4cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">番号・総枚数</div>
                            <div class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.85cqw, 1.35rem);">slideData の並び順と長さから決まる</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] text-center">
                            <div class="text-lime-400 font-bold mb-[0.4cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">総時間</div>
                            <div class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.85cqw, 1.35rem);">duration の合計から決まる</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 8
    {
        title: 'body で書く',
        icon: 'fa-pen',
        duration: 9,
        narration: 'スライドは body に、本文の HTML だけを書きます。外枠と見出しは、title と icon から自動で作られます。',
        body: `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 mb-[1.4cqw] whitespace-pre" style="font-size: clamp(0.8rem, 1.7cqw, 1.25rem);">{
    title: '注意点',
    icon: 'fa-triangle-exclamation',
    body: &#96;&lt;ul&gt;…&lt;/ul&gt;&#96;,
}</div>
            <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.2cqw] text-sky-300 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                外側の div や h2 は書かない。見出しとアイコンは自動で付く
            </div>
        `,
    },
    // Slide 9
    {
        title: 'render() の書き方',
        duration: 14,
        narration: 'body で足りないときだけ render を使います。画面は960かける540の16対9です。サイズは cqw と clamp で指定します。px や rem の直書きは、枠を縮めたときに崩れます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-ruler-combined text-lime-400"></i> render() の書き方
                    </h2>
                    <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.4cqw] mb-[1.4cqw] text-sky-300 font-bold flex items-center gap-[1.2cqw]" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">
                        <i class="fa-solid fa-lightbulb text-lime-400" style="font-size: clamp(1.2rem, 2.6cqw, 2.0rem);"></i>
                        <span>枠は 960x540 の 16:9。<code class="font-mono">cqw</code> と <code class="font-mono">clamp()</code> で書く</span>
                    </div>
                    <div class="space-y-[0.8cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-start gap-[1.2cqw]">
                            <i class="fa-solid fa-xmark text-rose-400 mt-[0.15cqw] flex-shrink-0" style="font-size: clamp(1.0rem, 2.0cqw, 1.5rem);"></i>
                            <div class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.85cqw, 1.35rem);"><code class="font-mono">px</code> や <code class="font-mono">rem</code> の直書きは、縮小すると崩れる</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.1cqw] flex items-start gap-[1.2cqw]">
                            <i class="fa-solid fa-xmark text-rose-400 mt-[0.15cqw] flex-shrink-0" style="font-size: clamp(1.0rem, 2.0cqw, 1.5rem);"></i>
                            <div class="text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.85cqw, 1.35rem);"><code class="font-mono">md:</code> などのブレークポイントは枠の中では使わない</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 10
    {
        title: '近い見た目をコピーする',
        duration: 9,
        narration: '近い見た目の既存スライドをコピーして、中身を差し替えるのが早い方法です。細かい書き方は User.md に書いてあります。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-copy text-lime-400"></i> 近い見た目をコピーする
                    </h2>
                    <div class="grid grid-cols-2 gap-[2cqw] items-center">
                        <a href="https://github.com/ytani01/yt_slide/blob/main/slides/template.js" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="block no-underline bg-slate-800/60 border border-slate-700 rounded-xl p-[1.8cqw] text-center">
                            <i class="fa-solid fa-shapes text-sky-400 mb-[0.8cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"></i>
                            <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.3cqw, 1.7rem);">template.js</div>
                            <div class="text-slate-300 mt-[0.4cqw] font-medium" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">次の見た目を整えるときに、型の見本 19 種から選ぶ</div>
                        </a>
                        <a href="https://github.com/ytani01/yt_slide/blob/main/docs/User.md" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="block no-underline bg-slate-800/60 border border-slate-700 rounded-xl p-[1.8cqw] text-center">
                            <i class="fa-solid fa-book text-lime-400 mb-[0.8cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"></i>
                            <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.3cqw, 1.7rem);">docs/User.md</div>
                            <div class="text-slate-300 mt-[0.4cqw] font-medium" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">細かい書き方はこちらを見る</div>
                        </a>
                    </div>
                </div>
            `;
        }
    },
    // Slide 11
    {
        title: 'duration の測り方',
        duration: 11,
        narration: 'duration はおおよその秒数でよく、最初から測定は要りません。時間表示を合わせたいときは、ナレーションが固まってから ytslide measure で測れます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.6cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-stopwatch text-lime-400"></i> duration の測り方
                    </h2>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 mb-[1.4cqw] break-all" style="font-size: clamp(0.8rem, 1.7cqw, 1.25rem);">
                        ytslide measure --slides sample --text '文章'
                    </div>
                    <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] text-slate-200 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                        <i class="fa-solid fa-arrow-right text-lime-400 mr-[0.6cqw]"></i>出てきた <span class="font-mono text-lime-400 font-bold">duration: 2</span> の値を、必要ならそのまま書けばよい
                    </div>
                </div>
            `;
        }
    },
    // Slide 12
    {
        title: '仕上げでまとめて書き換える',
        duration: 11,
        narration: 'ナレーションが固まって時間表示を合わせたいときは、ytslide update を 1 回実行します。測った結果で duration を直接書き換え、一覧も作り直します。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.6cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-rotate text-lime-400"></i> 仕上げでまとめて書き換える
                    </h2>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 mb-[1.4cqw] break-all" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                        ytslide update --slides sample
                    </div>
                    <div class="bg-rose-950/40 border border-rose-500/40 rounded-xl p-[1.1cqw] text-rose-300 flex items-center gap-[1cqw] font-medium" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                        <i class="fa-solid fa-triangle-exclamation text-rose-400 flex-shrink-0" style="font-size: clamp(1.1rem, 2.2cqw, 1.6rem);"></i>
                        <span>Online TTS で測定するため <code class="bg-slate-950 px-[0.5cqw] py-[0.1cqw] rounded font-mono">curl</code> と <code class="bg-slate-950 px-[0.5cqw] py-[0.1cqw] rounded font-mono">ffprobe</code> が要る</span>
                    </div>
                </div>
            `;
        }
    },
    // Slide 13
    {
        title: 'まとめ',
        duration: 10,
        narration: 'player.html は触らず、slides に名前.js を1つ足すだけです。細かい注意点は User.md を見てください。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.6cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-flag-checkered text-lime-400"></i> まとめ
                    </h2>
                    <div class="space-y-[0.9cqw] text-slate-200 font-medium">
                        <div class="bg-slate-800/60 p-[1.1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-ban text-rose-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>player.html は触らない</strong></span>
                        </div>
                        <div class="bg-slate-800/60 p-[1.1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-file-circle-plus text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong class="font-mono">slides/&lt;名前&gt;.js</strong> を1つ足すだけ</span>
                        </div>
                        <div class="bg-slate-800/60 p-[1.1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-book text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">細かい注意点は <strong>docs/User.md</strong> へ</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 14
    {
        title: 'アイコン名の例 1 - 一覧・注意・手順',
        icon: 'fa-icons',
        duration: 8,
        narration: 'ここからは icon に書けるアイコン名の例です。まずは箇条書き、注意や禁止、手順を示すものです。',
        body: iconTable(ICON_GROUPS.slice(0, 3)),
    },
    // Slide 15
    {
        title: 'アイコン名の例 2 - コード・文書・時間',
        icon: 'fa-icons',
        duration: 8,
        narration: 'コードや端末の画面、ファイルや文書、時間と計測を表すものです。名前を間違えるとアイコンは何も出ません。',
        body: iconTable(ICON_GROUPS.slice(3, 6)),
    },
    // Slide 16
    {
        title: 'アイコン名の例 3 - 人・図解・強調',
        icon: 'fa-icons',
        duration: 12,
        narration: '人や対話、図解と設定、強調に使うものです。ここに無いものは FontAwesome のサイトで探せます。同じ一覧が User.md の巻末にもあります。',
        body: iconTable(ICON_GROUPS.slice(6, 9)),
    },
];
