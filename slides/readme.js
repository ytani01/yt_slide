// スライドのデータ。player.html?slides=readme から読まれる（TODO-051）。
// このリポジトリ自体の紹介スライド一式。共通の再生エンジンは player.html の中にある。

const slidesConfig = {
    title: 'yt_slide - ファイル 2 つで動くナレーション付きプレゼン',
    heading: 'yt_slide の紹介',
    // このスライド一式だけの読みの置換表（TODO-054）。共通は player.html
    rules: [
        [/claude-memo/gi, 'クロード メモ'],
        [/yt_slide/gi, 'ワイティー スライド'],
        [/JavaScript/gi, 'ジャバスクリプト'],
        [/\bURL\b/gi, 'ユーアールエル'],
        [/\breadme\b/gi, 'リードミー'],
        [/\bdeveloper\b/gi, 'デベロッパー'],
    ],
};

const slideData = [
    // Slide 1
    {
        title: 'yt_slide',
        duration: 12,
        narration: 'yt_slide は、2 つのファイルを置くだけで、ナレーション付きのプレゼンが動き出す仕組みです。ビルドもインストールも不要で、URLを渡すだけでそのまま見てもらえます。',
        render: function() {
            return `
                <div class="flex flex-col items-start justify-center h-full px-[4cqw] py-[1.5cqw] space-y-[1.5cqw]">
                    <span class="text-sky-400 font-bold tracking-widest flex items-center gap-[1cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">
                        <i class="fa-solid fa-clapperboard text-lime-400"></i> yt_slide
                    </span>
                    <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.8rem, 5cqw, 3.8rem);">
                        ファイル <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">2 つ</span> で、
                        ナレーション付きのプレゼンが動き出す
                    </h1>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">
                        ビルドもインストールも不要。URL を渡せばそのまま見てもらえる。
                    </p>
                </div>
            `;
        }
    },
    // Slide 2
    {
        title: 'できること',
        duration: 12,
        narration: 'できることを紹介します。読み上げと字幕、自動再生、0.75倍から2.0倍の再生速度、フルスクリーン、スマホのスワイプ操作に対応しています。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-list-check text-lime-400"></i> できること
                    </h2>
                    <div class="grid grid-cols-2 gap-[1.2cqw]">
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] flex items-center gap-[1cqw]">
                            <i class="fa-solid fa-volume-high text-lime-400" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                            <div class="text-slate-100 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">読み上げと字幕表示</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] flex items-center gap-[1cqw]">
                            <i class="fa-solid fa-forward text-sky-400" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                            <div class="text-slate-100 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">自動再生で次へ</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] flex items-center gap-[1cqw]">
                            <i class="fa-solid fa-gauge-high text-lime-400" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                            <div class="text-slate-100 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">再生速度 0.75〜2.0 倍</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] flex items-center gap-[1cqw]">
                            <i class="fa-solid fa-expand text-sky-400" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                            <div class="text-slate-100 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">フルスクリーン・前後送り</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw] flex items-center gap-[1cqw] col-span-2">
                            <i class="fa-solid fa-mobile-screen-button text-lime-400" style="font-size: clamp(1.2rem, 2.4cqw, 1.8rem);"></i>
                            <div class="text-slate-100 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">スマホでもスワイプで送り、タップで再生・一時停止</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 3
    {
        title: 'すぐ試す',
        duration: 11,
        narration: 'すぐ試すには、Pythonの簡易サーバーを立てて player.html を開くだけです。URLにスライドの名前を指定すると、そのスライドが再生されます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-play text-lime-400"></i> すぐ試す
                    </h2>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-[1.6cqw] font-mono text-slate-200 space-y-[0.6cqw] mb-[1.5cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                        <div><span class="text-lime-400">$</span> python3 -m http.server 8000</div>
                        <div class="text-slate-400"># =&gt; http://localhost:8000/player.html</div>
                    </div>
                    <p class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">
                        <code class="bg-slate-900 px-[0.6cqw] py-[0.2cqw] rounded text-sky-300 font-mono">player.html?slides=&lt;名前&gt;</code>
                        で <code class="bg-slate-900 px-[0.6cqw] py-[0.2cqw] rounded text-sky-300 font-mono">slides/&lt;名前&gt;.js</code> を読む。
                    </p>
                </div>
            `;
        }
    },
    // Slide 4
    {
        title: '自分のスライドを作る',
        duration: 9,
        narration: '自分のスライドを作るときは、player.html は触りません。slidesディレクトリにJavaScriptを1つ足すだけです。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-pen-to-square text-lime-400"></i> 自分のスライドを作る
                    </h2>
                    <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.6cqw] text-sky-300 font-bold flex items-center gap-[1.2cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.8rem);">
                        <i class="fa-solid fa-lightbulb text-lime-400" style="font-size: clamp(1.4rem, 3cqw, 2.2rem);"></i>
                        <span>player.html は触らない。slides/ に JavaScript を 1 つ足すだけ</span>
                    </div>
                </div>
            `;
        }
    },
    // Slide 5
    {
        title: 'slidesConfig と slideData',
        duration: 10,
        narration: '足すファイルには、タブに出る名前を書く slidesConfig と、スライドを並べた slideData を定義します。番号や総枚数は自動で数えられます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.4cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-code text-lime-400"></i> slidesConfig と slideData
                    </h2>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 leading-normal" style="font-size: clamp(0.85rem, 1.9cqw, 1.35rem);">
<pre class="whitespace-pre-wrap"><span class="text-sky-400">const</span> slidesConfig = { title: <span class="text-lime-300">'...'</span>, heading: <span class="text-lime-300">'...'</span> };

<span class="text-sky-400">const</span> slideData = [
  { title: <span class="text-lime-300">'1枚目'</span>, duration: <span class="text-amber-300">10</span>, narration: <span class="text-lime-300">'...'</span>, render() { <span class="text-slate-500">/* HTML を返す */</span> } },
];</pre>
                    </div>
                    <p class="text-slate-400 mt-[1cqw] font-medium" style="font-size: clamp(0.85rem, 1.7cqw, 1.25rem);">スライドの番号も総枚数もどこにも書かない。並び順と duration の合計から自動で出る。</p>
                </div>
            `;
        }
    },
    // Slide 6
    {
        title: '1枚のスライドの要素',
        duration: 9,
        narration: '1枚ごとに、題名と、読み上げにかかる秒数と、読み上げる文章と、HTMLを返す関数を書きます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-layer-group text-lime-400"></i> 1枚のスライドの要素
                    </h2>
                    <div class="grid grid-cols-2 gap-[1.4cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                            <div class="text-lime-400 font-mono font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">title</div>
                            <div class="text-slate-200 font-medium mt-[0.3cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">プレイリストに出る題名</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                            <div class="text-sky-400 font-mono font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">duration</div>
                            <div class="text-slate-200 font-medium mt-[0.3cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">読み上げの実測秒数</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                            <div class="text-lime-400 font-mono font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">narration</div>
                            <div class="text-slate-200 font-medium mt-[0.3cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">読み上げる文章。字幕にも出る</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                            <div class="text-sky-400 font-mono font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">render()</div>
                            <div class="text-slate-200 font-medium mt-[0.3cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">HTML を文字列で返す関数</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 7
    {
        title: 'render() の書き方',
        duration: 8,
        narration: '見た目は Tailwind と cqw 単位の clamp で書きます。枠が拡大縮小しても崩れないようにするためです。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-ruler-combined text-lime-400"></i> render() の書き方
                    </h2>
                    <div class="space-y-[1.2cqw] text-slate-200 font-medium">
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-expand-alt text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                            <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">サイズは <code class="font-mono text-lime-300">cqw</code> と <code class="font-mono text-lime-300">clamp()</code> で書く。px や rem の直書きは崩れる</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-ban text-rose-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                            <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><code class="font-mono text-rose-300">md:</code> などのブレークポイントは枠の中では使わない</div>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-clone text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                            <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">既存の <code class="font-mono text-sky-300">slides/claude-memo.js</code> をコピーして差し替えるのが早い</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 8
    {
        title: 'duration の測り方',
        duration: 7,
        narration: 'duration は目分量で決めません。measure-duration.py というツールで実際の読み上げ秒数を測って入れます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-stopwatch text-lime-400"></i> duration の測り方
                    </h2>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 space-y-[0.5cqw]" style="font-size: clamp(0.82rem, 1.75cqw, 1.3rem);">
                        <div><span class="text-lime-400">$</span> tools/measure-duration.py --slides user --all --write</div>
                        <div class="text-slate-400">スライド 7: duration 23 -&gt; 12</div>
                        <div class="text-slate-400">user.js: 1 枚を書き換えた</div>
                    </div>
                    <p class="text-slate-200 mt-[1.4cqw] font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">
                        目分量ではなく、<span class="text-lime-400 font-bold">Online TTS の実測秒数</span>を入れる。
                    </p>
                </div>
            `;
        }
    },
    // Slide 9
    {
        title: '入っているスライド',
        duration: 12,
        narration: 'このリポジトリには、紹介用のreadme、作り方を説明するuser、内部の作りを説明するdeveloper、実例のclaude-memoの4つのスライド一式が入っています。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-folder-open text-lime-400"></i> 入っているスライド
                    </h2>
                    <div class="overflow-x-auto rounded-xl border border-slate-700/80">
                        <table class="w-full text-left text-slate-200" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                            <thead class="bg-slate-800 text-sky-400 font-bold border-b border-slate-700">
                                <tr><th class="p-[1cqw]">名前</th><th class="p-[1cqw]">中身</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                                <tr><td class="p-[1cqw] font-mono font-bold text-lime-400">readme</td><td class="p-[1cqw]">このリポジトリの紹介（既定）</td></tr>
                                <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">user</td><td class="p-[1cqw]">スライドの作り方</td></tr>
                                <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">developer</td><td class="p-[1cqw]">player.html の作り</td></tr>
                                <tr><td class="p-[1cqw] font-mono font-bold text-lime-400">claude-memo</td><td class="p-[1cqw]">実例。Claude Code の使い方 17 枚</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    },
    // Slide 10
    {
        title: 'まとめ',
        duration: 10,
        narration: 'まとめです。yt_slide を使えば、ファイル 2 つを置くだけで、ナレーション付きのプレゼンをすぐに作って公開できます。ぜひ試してみてください。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-flag-checkered text-lime-400"></i> まとめ
                    </h2>
                    <div class="space-y-[1cqw] text-slate-200 font-medium mb-[1.5cqw]">
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-file-code text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>ファイル 2 つ</strong> を置くだけで、ナレーション付きプレゼンが動く</span>
                        </div>
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-plus text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>slides/ に JavaScript を 1 つ足す</strong> だけで新しいスライドを作れる</span>
                        </div>
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-share-nodes text-amber-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>ビルド不要</strong>。URL を渡すだけでそのまま見てもらえる</span>
                        </div>
                    </div>
                    <div class="bg-sky-950/60 border border-sky-500/60 rounded-xl p-[1cqw] text-center text-sky-300 font-bold" style="font-size: clamp(0.95rem, 2.0cqw, 1.4rem);">
                        ぜひ試してみてください
                    </div>
                </div>
            `;
        }
    }
];
