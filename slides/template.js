// スライドのテンプレート集。player.html?slides=template で並べて見られる。
// 使いたいテンプレートのスライドをまるごとコピーして、中身を差し替える。
//
// 19種のうち 16種は body だけで書ける。表紙・画像（全面）・章の区切りは render() を使う。
// 1枚が「// ── N. 名前 ──」のコメントから次のコメントまで。
// 要らないテンプレートは、その範囲を丸ごと削除してよい（他のスライドには影響しない）。

const slidesConfig = {
    title: 'テンプレート',
    heading: 'スライドのテンプレート 19種',
    // index.html の一覧に出す説明とアイコン（ytslide index が読む。TODO-089）
    summary: 'スライドのテンプレート 19種。コピーして使う',
    icon: 'fa-shapes',
    rules: [
        [/render\(\)/gi, 'レンダー'],
        [/\bbody\b/gi, 'ボディ'],
        [/Q&A/gi, 'キューアンドエー'],
    ],
};

const slideData = [
    // ── 1. 表紙。見出しの枠を外したいので render() で書く ──────────────
    {
        title: '表紙',
        duration: 10,
        narration: '表紙のテンプレートです。見出しの枠を外して全面を使いたいので、render() で書きます。題名を大きく出し、その下に副題と日付を添えます。',
        render: function() {
            return `
                <div class="relative h-full flex flex-col justify-center items-center text-center px-[5cqw] overflow-hidden">
                    <div class="absolute -top-[18cqw] -left-[10cqw] w-[45cqw] h-[45cqw] rounded-full bg-sky-500/20 blur-[6cqw]"></div>
                    <div class="absolute -bottom-[20cqw] -right-[8cqw] w-[40cqw] h-[40cqw] rounded-full bg-lime-500/20 blur-[6cqw]"></div>
                    <div class="relative">
                        <div class="inline-flex items-center gap-[0.8cqw] rounded-full border border-lime-400/40 bg-lime-400/10 px-[1.8cqw] py-[0.5cqw] text-lime-300 font-bold tracking-widest" style="font-size: clamp(0.8rem, 1.7cqw, 1.2rem);">
                            <i class="fa-solid fa-film"></i> YT_SLIDE
                        </div>
                        <h1 class="font-extrabold leading-tight mt-[1.8cqw]" style="font-size: clamp(2rem, 6cqw, 4.6rem);">
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-slate-50 to-lime-300">スライドのテンプレート 19種</span>
                        </h1>
                        <div class="mx-auto mt-[2cqw] h-[0.35cqw] w-[18cqw] rounded-full bg-gradient-to-r from-sky-400 to-lime-400"></div>
                        <p class="text-slate-300 font-medium mt-[2cqw]" style="font-size: clamp(1rem, 2.3cqw, 1.7rem);">
                            コピーして中身を差し替えるための見本
                        </p>
                        <p class="text-slate-500 font-medium mt-[1cqw]" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                            2026-09-20 ／ slides/template.js
                        </p>
                    </div>
                </div>
            `;
        },
    },

    // ── 2. 箇条書き ────────────────────────────────────────────────
    {
        title: '箇条書き',
        icon: 'fa-list-check',
        duration: 11,
        narration: '箇条書きのテンプレートです。項目を並べるだけのスライドは、body にリストを書くだけで作れます。印を丸いアイコンの地に置くと、行の頭が揃って見えます。',
        body: `
            <ul class="space-y-[1.4cqw]">
                <li class="flex items-start gap-[1.4cqw] rounded-xl bg-slate-800/40 border border-slate-700/70 px-[1.8cqw] py-[1.2cqw]">
                    <span class="shrink-0 grid place-items-center w-[3.4cqw] h-[3.4cqw] rounded-lg bg-lime-500/15 text-lime-400 border border-lime-500/40" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);"><i class="fa-solid fa-check"></i></span>
                    <span class="text-slate-100 font-medium leading-snug" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">外枠と見出しは <span class="font-mono text-sky-300">player.html</span> が付ける</span>
                </li>
                <li class="flex items-start gap-[1.4cqw] rounded-xl bg-slate-800/40 border border-slate-700/70 px-[1.8cqw] py-[1.2cqw]">
                    <span class="shrink-0 grid place-items-center w-[3.4cqw] h-[3.4cqw] rounded-lg bg-lime-500/15 text-lime-400 border border-lime-500/40" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);"><i class="fa-solid fa-check"></i></span>
                    <span class="text-slate-100 font-medium leading-snug" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">書くのは本文の中身だけ</span>
                </li>
                <li class="flex items-start gap-[1.4cqw] rounded-xl bg-slate-800/40 border border-slate-700/70 px-[1.8cqw] py-[1.2cqw]">
                    <span class="shrink-0 grid place-items-center w-[3.4cqw] h-[3.4cqw] rounded-lg bg-lime-500/15 text-lime-400 border border-lime-500/40" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);"><i class="fa-solid fa-check"></i></span>
                    <span class="text-slate-100 font-medium leading-snug" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">項目は 5つまでが読みやすい</span>
                </li>
            </ul>
            <p class="text-slate-400 mt-[1.4cqw] flex items-center gap-[0.8cqw] font-medium" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                <i class="fa-solid fa-lightbulb text-amber-400"></i> 強めたい語だけ色を変えると、目が迷わない
            </p>
        `,
    },

    // ── 3. 2カラム比較 ────────────────────────────────────────────
    {
        title: '2カラム比較',
        icon: 'fa-code-compare',
        duration: 12,
        narration: '2カラム比較のテンプレートです。前と後、長所と短所のように、2つを並べて見せたいときに使います。良いほうに色を付けると、どちらを勧めているかが伝わります。',
        body: `
            <div class="grid grid-cols-2 gap-[1.8cqw]">
                <div class="rounded-2xl bg-gradient-to-b from-rose-950/60 to-slate-900/40 border border-rose-500/40 p-[2cqw] shadow-lg shadow-rose-900/20">
                    <div class="flex items-center gap-[1cqw] text-rose-300 font-bold mb-[1.2cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">
                        <span class="grid place-items-center w-[3.4cqw] h-[3.4cqw] rounded-full bg-rose-500/20 border border-rose-400/50"><i class="fa-solid fa-xmark" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);"></i></span>
                        render() で書く
                    </div>
                    <p class="text-slate-300 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                        外枠・見出し・本文を毎回すべて書く。自由度は高いが、枚数ぶん同じ定型が並ぶ。
                    </p>
                    <div class="mt-[1.4cqw] inline-block rounded-md bg-rose-500/10 text-rose-300 px-[1cqw] py-[0.3cqw] font-mono" style="font-size: clamp(0.8rem, 1.7cqw, 1.2rem);">20行</div>
                </div>
                <div class="rounded-2xl bg-gradient-to-b from-lime-950/60 to-slate-900/40 border border-lime-500/50 p-[2cqw] shadow-lg shadow-lime-900/20 ring-1 ring-lime-400/20">
                    <div class="flex items-center gap-[1cqw] text-lime-300 font-bold mb-[1.2cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">
                        <span class="grid place-items-center w-[3.4cqw] h-[3.4cqw] rounded-full bg-lime-500/20 border border-lime-400/50"><i class="fa-solid fa-check" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);"></i></span>
                        body で書く
                    </div>
                    <p class="text-slate-300 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                        本文だけを書く。見出しは title と icon から作られ、枚数が増えても揃う。
                    </p>
                    <div class="mt-[1.4cqw] inline-block rounded-md bg-lime-500/10 text-lime-300 px-[1cqw] py-[0.3cqw] font-mono" style="font-size: clamp(0.8rem, 1.7cqw, 1.2rem);">6行</div>
                </div>
            </div>
        `,
    },

    // ── 4. 表 ──────────────────────────────────────────────────────
    {
        title: '表',
        icon: 'fa-table',
        duration: 13,
        narration: '表のテンプレートです。項目が多く、揃った形で見せたいときに使います。行は 5つまでが読みやすい目安です。必須か任意かのような短い値は、丸い札にすると見分けられます。',
        body: `
            <div class="overflow-hidden rounded-xl border border-slate-700/80 shadow-lg shadow-slate-950/40">
                <table class="w-full text-left text-slate-200" style="font-size: clamp(0.9rem, 1.95cqw, 1.45rem);">
                    <thead class="bg-gradient-to-r from-slate-800 to-slate-800/40 text-sky-300 font-bold border-b border-slate-700">
                        <tr><th class="p-[1cqw]">キー</th><th class="p-[1cqw]">中身</th><th class="p-[1cqw] text-center">要否</th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                        <tr class="bg-slate-900/60"><td class="p-[1cqw] font-mono font-bold text-lime-400">title</td><td class="p-[1cqw]">見出しと目次に出る題名</td><td class="p-[1cqw] text-center"><span class="rounded-full bg-rose-500/15 text-rose-300 px-[1cqw] py-[0.2cqw]">必須</span></td></tr>
                        <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">icon</td><td class="p-[1cqw]">見出しの先頭に出すアイコン</td><td class="p-[1cqw] text-center"><span class="rounded-full bg-slate-500/20 text-slate-300 px-[1cqw] py-[0.2cqw]">任意</span></td></tr>
                        <tr class="bg-slate-900/60"><td class="p-[1cqw] font-mono font-bold text-lime-400">body</td><td class="p-[1cqw]">本文の HTML</td><td class="p-[1cqw] text-center"><span class="rounded-full bg-rose-500/15 text-rose-300 px-[1cqw] py-[0.2cqw]">必須</span></td></tr>
                        <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">duration</td><td class="p-[1cqw]">読み上げの実測秒数</td><td class="p-[1cqw] text-center"><span class="rounded-full bg-rose-500/15 text-rose-300 px-[1cqw] py-[0.2cqw]">必須</span></td></tr>
                    </tbody>
                </table>
            </div>
        `,
    },

    // ── 5. コードと端末画面 ────────────────────────────────────────
    {
        title: 'コードと端末画面',
        icon: 'fa-terminal',
        duration: 11,
        narration: 'コードと端末画面のテンプレートです。等幅の文字で、コマンドと出力をそのまま見せます。上に窓の飾りを付けると、端末の画面だと一目で分かります。',
        body: `
            <div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl shadow-slate-950/60">
                <div class="flex items-center gap-[0.7cqw] bg-slate-900/80 border-b border-slate-800 px-[1.4cqw] py-[0.8cqw]">
                    <span class="w-[1cqw] h-[1cqw] rounded-full bg-rose-500/80"></span>
                    <span class="w-[1cqw] h-[1cqw] rounded-full bg-amber-400/80"></span>
                    <span class="w-[1cqw] h-[1cqw] rounded-full bg-lime-500/80"></span>
                    <span class="ml-[1cqw] text-slate-500 font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.1rem);">bash</span>
                </div>
                <div class="p-[1.6cqw] font-mono text-slate-200 space-y-[0.6cqw]" style="font-size: clamp(0.82rem, 1.75cqw, 1.3rem);">
                    <div><span class="text-lime-400">$</span> ytslide measure --slides template --all --write</div>
                    <div class="text-slate-400">スライド 4: duration 12 -&gt; 9</div>
                    <div class="-mx-[1.6cqw] px-[1.6cqw] bg-lime-500/10 border-l-2 border-lime-400 text-lime-300">template.js: 1枚を書き換えた</div>
                </div>
            </div>
            <p class="text-slate-300 mt-[1.4cqw] font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                プロンプトは <span class="text-lime-400 font-bold font-mono">$</span>、出力は
                <span class="text-slate-400 font-bold">薄い色</span>、注目させたい行だけ地を敷く。
            </p>
        `,
    },

    // ── 6. 図解 ────────────────────────────────────────────────────
    {
        title: '図解',
        icon: 'fa-diagram-project',
        duration: 13,
        narration: '図解のテンプレートです。箱と矢印で流れを見せます。画像を貼らないので、画面の大きさが変わっても崩れません。矢印の上に短い言葉を添えると、何が起きるのかが分かります。',
        body: `
            <div class="flex items-stretch justify-center gap-[1cqw] text-center">
                <div class="flex-1 rounded-2xl bg-gradient-to-b from-sky-950/60 to-slate-900/50 border border-sky-500/40 px-[1.6cqw] py-[1.8cqw] shadow-lg shadow-sky-900/20">
                    <div class="mx-auto grid place-items-center w-[6cqw] h-[6cqw] rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-300" style="font-size: clamp(1.3rem, 3cqw, 2.2rem);"><i class="fa-solid fa-file-code"></i></div>
                    <div class="font-bold text-slate-100 mt-[1cqw] font-mono" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);">slides/*.js</div>
                    <div class="text-slate-400 mt-[0.4cqw]" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">書くのはここだけ</div>
                </div>
                <div class="flex flex-col items-center justify-center shrink-0 px-[0.4cqw]">
                    <div class="text-slate-400" style="font-size: clamp(0.7rem, 1.5cqw, 1.1rem);">読み込む</div>
                    <i class="fa-solid fa-arrow-right text-lime-400" style="font-size: clamp(1.2rem, 2.6cqw, 1.9rem);"></i>
                </div>
                <div class="flex-1 rounded-2xl bg-gradient-to-b from-lime-950/60 to-slate-900/50 border border-lime-500/40 px-[1.6cqw] py-[1.8cqw] shadow-lg shadow-lime-900/20">
                    <div class="mx-auto grid place-items-center w-[6cqw] h-[6cqw] rounded-full bg-lime-500/15 border border-lime-400/40 text-lime-300" style="font-size: clamp(1.3rem, 3cqw, 2.2rem);"><i class="fa-solid fa-gears"></i></div>
                    <div class="font-bold text-slate-100 mt-[1cqw] font-mono" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);">player.html</div>
                    <div class="text-slate-400 mt-[0.4cqw]" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">枠と読み上げ</div>
                </div>
                <div class="flex flex-col items-center justify-center shrink-0 px-[0.4cqw]">
                    <div class="text-slate-400" style="font-size: clamp(0.7rem, 1.5cqw, 1.1rem);">描く</div>
                    <i class="fa-solid fa-arrow-right text-lime-400" style="font-size: clamp(1.2rem, 2.6cqw, 1.9rem);"></i>
                </div>
                <div class="flex-1 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900/50 border border-amber-500/40 px-[1.6cqw] py-[1.8cqw] shadow-lg shadow-amber-900/20">
                    <div class="mx-auto grid place-items-center w-[6cqw] h-[6cqw] rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300" style="font-size: clamp(1.3rem, 3cqw, 2.2rem);"><i class="fa-solid fa-display"></i></div>
                    <div class="font-bold text-slate-100 mt-[1cqw]" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);">ブラウザ</div>
                    <div class="text-slate-400 mt-[0.4cqw]" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">そのまま見られる</div>
                </div>
            </div>
        `,
    },

    // ── 7. 数字を大きく見せる ──────────────────────────────────────
    {
        title: '数字を大きく見せる',
        icon: 'fa-chart-simple',
        duration: 11,
        narration: '数字を大きく見せるテンプレートです。文字を減らし、数字だけを残すと印象に残ります。単位を小さく添え、数字そのものは色を抜いたグラデーションで塗ります。',
        body: `
            <div class="grid grid-cols-3 gap-[1.8cqw] text-center">
                <div class="rounded-2xl bg-slate-800/40 border border-slate-700 p-[2cqw] shadow-lg shadow-slate-950/40">
                    <div class="font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-sky-300 to-sky-500" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">2<span class="text-slate-500 font-bold" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);"> 個</span></div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.9rem, 1.95cqw, 1.4rem);">公開に要るファイル</div>
                </div>
                <div class="rounded-2xl bg-slate-800/40 border border-lime-500/40 p-[2cqw] shadow-lg shadow-lime-900/20 ring-1 ring-lime-400/20">
                    <div class="font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-lime-300 to-lime-500" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">0<span class="text-slate-500 font-bold" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);"> 手順</span></div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.9rem, 1.95cqw, 1.4rem);">ビルドの手順</div>
                </div>
                <div class="rounded-2xl bg-slate-800/40 border border-slate-700 p-[2cqw] shadow-lg shadow-slate-950/40">
                    <div class="font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">19<span class="text-slate-500 font-bold" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);"> 種</span></div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.9rem, 1.95cqw, 1.4rem);">選べるテンプレート</div>
                </div>
            </div>
        `,
    },

    // ── 8. 引用 ────────────────────────────────────────────────────
    {
        title: '引用',
        icon: 'fa-quote-left',
        duration: 11,
        narration: '引用のテンプレートです。誰かの言葉や、文書の一節をそのまま見せたいときに使います。薄い引用符を後ろに敷くと、地の文と見分けられます。',
        body: `
            <div class="relative rounded-2xl bg-slate-800/30 border border-slate-700/70 p-[2.4cqw] overflow-hidden">
                <i class="fa-solid fa-quote-right absolute -right-[1cqw] -bottom-[2cqw] text-slate-700/30" style="font-size: clamp(4rem, 12cqw, 9rem);"></i>
                <blockquote class="relative border-l-4 border-sky-500/70 pl-[2cqw]">
                    <p class="text-slate-100 font-medium italic leading-relaxed" style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">
                        サイズは cqw と clamp() で書く。px や rem の直書きは、16:9 を縮めたときに崩れる。
                    </p>
                    <footer class="mt-[1.6cqw]" style="font-size: clamp(0.85rem, 1.85cqw, 1.35rem);">
                        <a href="https://github.com/ytani01/yt_slide/blob/main/docs/UsersGuide.md" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="inline-flex items-center gap-[1cqw] text-slate-400 no-underline">
                            <span class="grid place-items-center w-[3cqw] h-[3cqw] rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-300"><i class="fa-solid fa-book" style="font-size: clamp(0.75rem, 1.6cqw, 1.1rem);"></i></span>
                            <span class="underline decoration-slate-600 underline-offset-4">docs/UsersGuide.md「render() の書き方」</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-slate-500" style="font-size: clamp(0.65rem, 1.4cqw, 1rem);"></i>
                        </a>
                    </footer>
                </blockquote>
            </div>
        `,
    },

    // ── 9. 時系列 ──────────────────────────────────────────────────
    {
        title: '時系列',
        icon: 'fa-timeline',
        duration: 10,
        narration: '時系列のテンプレートです。手順や履歴を、順番が分かる形で並べます。丸をつなぐ縦線を引くと、続きものだと分かります。',
        body: `
            <div class="relative pl-[1cqw]">
                <div class="absolute left-[3cqw] top-[2cqw] bottom-[2cqw] w-[0.25cqw] bg-gradient-to-b from-sky-500/60 to-lime-500/60"></div>
                <div class="relative space-y-[1.6cqw]">
                    <div class="flex items-center gap-[1.6cqw]">
                        <div class="relative shrink-0 grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-slate-900 border-2 border-sky-500/70 text-sky-300 font-bold" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">1</div>
                        <div class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);"><span class="font-mono text-slate-100">slides/</span> に <span class="font-mono text-slate-100">&lt;名前&gt;.js</span> を作る</div>
                    </div>
                    <div class="flex items-center gap-[1.6cqw]">
                        <div class="relative shrink-0 grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-slate-900 border-2 border-sky-500/70 text-sky-300 font-bold" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">2</div>
                        <div class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">テンプレートをコピーして中身を差し替える</div>
                    </div>
                    <div class="flex items-center gap-[1.6cqw]">
                        <div class="relative shrink-0 grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-lime-500/20 border-2 border-lime-400 text-lime-300 font-bold shadow-lg shadow-lime-900/40" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">3</div>
                        <div class="text-slate-100 font-bold" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">duration を測って書き戻す</div>
                    </div>
                </div>
            </div>
        `,
    },

    // ── 10. カード（段数を混ぜる） ─────────────────────────────────
    // 6列の格子に置き、col-span-6 / col-span-3 / col-span-2 で幅を変える。
    {
        title: 'カード（段数を混ぜる）',
        icon: 'fa-table-cells-large',
        duration: 12,
        narration: '段数を混ぜたカードのテンプレートです。6列の格子を土台にして、1枚のカードがいくつ分の幅を占めるかを変えます。大事なものほど広く取ると、目が行く順を決められます。',
        body: `
            <div class="grid grid-cols-6 gap-[1.2cqw]">
                <div class="col-span-6 rounded-2xl bg-gradient-to-r from-sky-950/70 to-slate-900/40 border border-sky-500/40 p-[1.4cqw] flex items-center gap-[1.4cqw]">
                    <span class="shrink-0 grid place-items-center w-[4.4cqw] h-[4.4cqw] rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300" style="font-size: clamp(1rem, 2.3cqw, 1.7rem);"><i class="fa-solid fa-star"></i></span>
                    <div>
                        <div class="text-slate-50 font-bold" style="font-size: clamp(1rem, 2.3cqw, 1.7rem);">一番伝えたいことを全幅で</div>
                        <div class="text-slate-300 font-medium" style="font-size: clamp(0.8rem, 1.7cqw, 1.25rem);">6列ぶんを占める</div>
                    </div>
                </div>
                <div class="col-span-3 rounded-xl bg-slate-800/50 border border-slate-700 p-[1.3cqw]">
                    <div class="text-lime-300 font-bold" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);"><i class="fa-solid fa-check mr-[0.6cqw]"></i>半分の幅</div>
                    <p class="text-slate-300 font-medium mt-[0.4cqw]" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">3列ぶん。対になる 2つを並べる。</p>
                </div>
                <div class="col-span-3 rounded-xl bg-slate-800/50 border border-slate-700 p-[1.3cqw]">
                    <div class="text-lime-300 font-bold" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);"><i class="fa-solid fa-check mr-[0.6cqw]"></i>半分の幅</div>
                    <p class="text-slate-300 font-medium mt-[0.4cqw]" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">行ごとに段数を変えてよい。</p>
                </div>
                <div class="col-span-2 rounded-xl bg-slate-800/50 border border-slate-700 p-[1.2cqw] text-center">
                    <div class="text-amber-300 font-bold" style="font-size: clamp(0.88rem, 1.9cqw, 1.4rem);">3 分の 1</div>
                    <p class="text-slate-400 font-medium mt-[0.3cqw]" style="font-size: clamp(0.72rem, 1.55cqw, 1.12rem);">2列ぶん</p>
                </div>
                <div class="col-span-2 rounded-xl bg-slate-800/50 border border-slate-700 p-[1.2cqw] text-center">
                    <div class="text-amber-300 font-bold" style="font-size: clamp(0.88rem, 1.9cqw, 1.4rem);">3 分の 1</div>
                    <p class="text-slate-400 font-medium mt-[0.3cqw]" style="font-size: clamp(0.72rem, 1.55cqw, 1.12rem);">細かい補足を並べる</p>
                </div>
                <div class="col-span-2 rounded-xl bg-slate-800/50 border border-slate-700 p-[1.2cqw] text-center">
                    <div class="text-amber-300 font-bold" style="font-size: clamp(0.88rem, 1.9cqw, 1.4rem);">3 分の 1</div>
                    <p class="text-slate-400 font-medium mt-[0.3cqw]" style="font-size: clamp(0.72rem, 1.55cqw, 1.12rem);">数は行ごとに自由</p>
                </div>
            </div>
        `,
    },

    // ── 11. ポイント・注意の帯 ─────────────────────────────────────
    {
        title: 'ポイント・注意の帯',
        icon: 'fa-bullhorn',
        duration: 13,
        narration: 'ポイントと注意の帯です。横幅いっぱいの 1行に、アイコンと短い文を入れます。強めたいところは緑、断り書きや気をつけることは赤にすると、役割が伝わります。',
        body: `
            <div class="space-y-[1.4cqw]">
                <div class="rounded-xl bg-lime-950/50 border border-lime-500/50 p-[1.4cqw] flex items-center gap-[1.4cqw] shadow-lg shadow-lime-900/20">
                    <i class="fa-solid fa-lightbulb text-lime-400 shrink-0" style="font-size: clamp(1.3rem, 2.8cqw, 2.1rem);"></i>
                    <span class="text-lime-200 font-bold" style="font-size: clamp(1rem, 2.2cqw, 1.65rem);">ポイント: 帯は本文の前後どちらに置いてもよい</span>
                </div>
                <p class="text-slate-200 font-medium leading-relaxed px-[0.4cqw]" style="font-size: clamp(0.92rem, 2.0cqw, 1.45rem);">
                    本文はここに書く。帯は 1枚に 1本までにすると効く。2本以上並べると、
                    どれも目立たなくなる。
                </p>
                <div class="rounded-xl bg-rose-950/40 border border-rose-500/40 p-[1.2cqw] flex items-center gap-[1.2cqw]">
                    <i class="fa-solid fa-triangle-exclamation text-rose-400 shrink-0" style="font-size: clamp(1.1rem, 2.3cqw, 1.7rem);"></i>
                    <span class="text-rose-200 font-medium" style="font-size: clamp(0.88rem, 1.9cqw, 1.4rem);">注意: 断り書きは小さめにして、本文より前に出さない</span>
                </div>
            </div>
        `,
    },

    // ── 12. 手順（横並び） ─────────────────────────────────────────
    // 丸の中心は各列の 12.5% / 37.5% / 62.5% / 87.5%。線はその間に渡す。
    {
        title: '手順（横並び）',
        icon: 'fa-list-ol',
        duration: 13,
        narration: '手順を横に並べるテンプレートです。番号を線でつなぎ、済んだ段は色を落として、いま居る段だけ目立たせます。物の流れを矢印で見せたいときは、図解のテンプレートを使います。',
        body: `
            <div class="relative">
                <div class="absolute left-[12.5%] right-[12.5%] top-[2.1cqw] h-[0.3cqw] -translate-y-1/2 bg-slate-700 rounded-full"></div>
                <div class="absolute left-[12.5%] w-[25%] top-[2.1cqw] h-[0.3cqw] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-lime-400 rounded-full"></div>
                <div class="relative grid grid-cols-4 gap-[1cqw] text-center">
                    <div>
                        <div class="mx-auto grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-slate-800 border-2 border-slate-600 text-slate-400" style="font-size: clamp(0.8rem, 1.8cqw, 1.3rem);"><i class="fa-solid fa-check"></i></div>
                        <div class="text-slate-500 font-bold mt-[0.8cqw]" style="font-size: clamp(0.85rem, 1.9cqw, 1.4rem);">1. 立てる</div>
                        <div class="text-slate-600 font-medium" style="font-size: clamp(0.72rem, 1.5cqw, 1.1rem);">済み</div>
                    </div>
                    <div>
                        <div class="mx-auto grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-lime-950 border-2 border-lime-400 text-lime-300 font-bold shadow-lg shadow-lime-900/40" style="font-size: clamp(0.85rem, 1.9cqw, 1.4rem);">2</div>
                        <div class="text-lime-300 font-bold mt-[0.8cqw]" style="font-size: clamp(0.9rem, 2.0cqw, 1.5rem);">2. 作る</div>
                        <div class="text-lime-400 font-medium" style="font-size: clamp(0.72rem, 1.5cqw, 1.1rem);">いまここ</div>
                    </div>
                    <div>
                        <div class="mx-auto grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-slate-900 border-2 border-slate-700 text-slate-500 font-bold" style="font-size: clamp(0.8rem, 1.8cqw, 1.3rem);">3</div>
                        <div class="text-slate-300 font-bold mt-[0.8cqw]" style="font-size: clamp(0.85rem, 1.9cqw, 1.4rem);">3. 測る</div>
                        <div class="text-slate-500 font-medium" style="font-size: clamp(0.72rem, 1.5cqw, 1.1rem);">これから</div>
                    </div>
                    <div>
                        <div class="mx-auto grid place-items-center w-[4.2cqw] h-[4.2cqw] rounded-full bg-slate-900 border-2 border-slate-700 text-slate-500 font-bold" style="font-size: clamp(0.8rem, 1.8cqw, 1.3rem);">4</div>
                        <div class="text-slate-300 font-bold mt-[0.8cqw]" style="font-size: clamp(0.85rem, 1.9cqw, 1.4rem);">4. 置く</div>
                        <div class="text-slate-500 font-medium" style="font-size: clamp(0.72rem, 1.5cqw, 1.1rem);">これから</div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-4 gap-[1cqw] mt-[1.8cqw] text-center">
                <div class="rounded-xl bg-slate-800/30 border border-slate-800 p-[1cqw] text-slate-500 font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.18rem);">TODO.md</div>
                <div class="rounded-xl bg-lime-950/40 border border-lime-500/50 p-[1cqw] text-lime-200 font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.18rem);">slides/</div>
                <div class="rounded-xl bg-slate-800/40 border border-slate-700 p-[1cqw] text-slate-300 font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.18rem);">duration</div>
                <div class="rounded-xl bg-slate-800/40 border border-slate-700 p-[1cqw] text-slate-300 font-mono" style="font-size: clamp(0.75rem, 1.6cqw, 1.18rem);">public_html</div>
            </div>
        `,
    },

    // ── 13. 前後の差分 ─────────────────────────────────────────────
    {
        title: '前後の差分',
        icon: 'fa-code-branch',
        duration: 12,
        narration: '前後の差分のテンプレートです。書き換えの前と後を、行単位で見せたいときに使います。消す行は赤、足す行は緑にすると、コードの差分と同じ見方ができます。',
        body: `
            <div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl shadow-slate-950/60 font-mono" style="font-size: clamp(0.82rem, 1.75cqw, 1.3rem);">
                <div class="flex items-center gap-[0.8cqw] bg-slate-900/80 border-b border-slate-800 px-[1.4cqw] py-[0.8cqw] text-slate-400" style="font-size: clamp(0.75rem, 1.6cqw, 1.1rem);">
                    <i class="fa-solid fa-file-lines text-sky-400"></i> slides/example.js
                </div>
                <div class="divide-y divide-slate-900">
                    <div class="flex gap-[1cqw] bg-rose-500/10 text-rose-300 px-[1.4cqw] py-[0.5cqw]"><span class="select-none opacity-70">-</span><span>render: function() { return &#96;&lt;div&gt;…&lt;/div&gt;&#96;; }</span></div>
                    <div class="flex gap-[1cqw] bg-rose-500/10 text-rose-300 px-[1.4cqw] py-[0.5cqw]"><span class="select-none opacity-70">-</span><span>// 外枠も見出しも自分で書いていた</span></div>
                    <div class="flex gap-[1cqw] bg-lime-500/10 text-lime-300 px-[1.4cqw] py-[0.5cqw]"><span class="select-none opacity-70">+</span><span>icon: 'fa-list-check',</span></div>
                    <div class="flex gap-[1cqw] bg-lime-500/10 text-lime-300 px-[1.4cqw] py-[0.5cqw]"><span class="select-none opacity-70">+</span><span>body: &#96;&lt;ul&gt;…&lt;/ul&gt;&#96;,</span></div>
                </div>
            </div>
            <p class="text-slate-300 mt-[1.4cqw] font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                行の頭の <span class="font-mono text-rose-300 font-bold">-</span> と
                <span class="font-mono text-lime-300 font-bold">+</span> は、色が付かない画面でも読める。
            </p>
        `,
    },

    // ── 14. 割合バー ───────────────────────────────────────────────
    {
        title: '割合バー',
        icon: 'fa-chart-bar',
        duration: 12,
        narration: '割合バーのテンプレートです。内訳や進み具合を、帯の長さで見せます。数字だけよりも、どれが大きいかが一目で分かります。帯の幅はパーセントで指定します。',
        body: `
            <div class="space-y-[1.8cqw]">
                <div>
                    <div class="flex justify-between items-end text-slate-200 font-medium mb-[0.6cqw]" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">
                        <span>構成を考える</span><span class="font-mono text-sky-300 font-bold">50%</span>
                    </div>
                    <div class="h-[2.2cqw] rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300" style="width: 50%;"></div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-end text-slate-200 font-medium mb-[0.6cqw]" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">
                        <span>本文を書く</span><span class="font-mono text-lime-300 font-bold">30%</span>
                    </div>
                    <div class="h-[2.2cqw] rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-300" style="width: 30%;"></div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-end text-slate-200 font-medium mb-[0.6cqw]" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">
                        <span>読み上げを整える</span><span class="font-mono text-amber-300 font-bold">20%</span>
                    </div>
                    <div class="h-[2.2cqw] rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style="width: 20%;"></div>
                    </div>
                </div>
            </div>
        `,
    },

    // ── 15. Q&A ────────────────────────────────────────────────────
    {
        title: 'Q&A',
        icon: 'fa-circle-question',
        duration: 11,
        narration: '問いと答えのテンプレートです。想定される質問に先に答えておきたいときに使います。問いと答えで色と印を変え、上下に置くと読む順が迷いません。',
        body: `
            <div class="space-y-[1.6cqw]">
                <div class="flex items-start gap-[1.4cqw] rounded-2xl bg-sky-950/40 border border-sky-500/40 p-[1.8cqw]">
                    <span class="shrink-0 grid place-items-center w-[4cqw] h-[4cqw] rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 font-extrabold" style="font-size: clamp(1rem, 2.2cqw, 1.6rem);">Q</span>
                    <p class="text-slate-100 font-bold leading-snug" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">用意された 19種で足りないときは？</p>
                </div>
                <div class="flex items-start gap-[1.4cqw] rounded-2xl bg-lime-950/30 border border-lime-500/40 p-[1.8cqw]">
                    <span class="shrink-0 grid place-items-center w-[4cqw] h-[4cqw] rounded-full bg-lime-500/20 border border-lime-400/50 text-lime-300 font-extrabold" style="font-size: clamp(1rem, 2.2cqw, 1.6rem);">A</span>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);">
                        body の中は普通の HTML。<span class="text-lime-300 font-bold">Tailwind のクラス</span>がそのまま使えるので、
                        近いテンプレートを土台にして組み替えればよい。
                    </p>
                </div>
            </div>
        `,
    },

    // ── 16. 本文と脚注 ─────────────────────────────────────────────
    {
        title: '本文と脚注',
        icon: 'fa-note-sticky',
        duration: 11,
        narration: '本文と脚注のテンプレートです。左に本文、右に補足を置く二対一の分割です。本筋を止めずに、細かい断り書きを添えたいときに使います。',
        body: `
            <div class="grid grid-cols-3 gap-[1.8cqw] items-start">
                <div class="col-span-2 space-y-[1.2cqw]">
                    <p class="text-slate-100 font-medium leading-relaxed" style="font-size: clamp(1.0rem, 2.3cqw, 1.7rem);">
                        <span class="text-sky-300 font-bold">duration</span> には、読み上げ音声を実際に測った秒数を入れる。
                        進行バーと残り時間はこの値で描かれる。
                    </p>
                    <p class="text-slate-300 font-medium leading-relaxed" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">
                        値がずれてもスライドは飛ばない。バーが先に 100% になるか、読み終わってから待たされるだけで済む。
                    </p>
                </div>
                <aside class="rounded-xl bg-slate-800/40 border-l-4 border-amber-400/70 border-y border-r border-slate-700/70 p-[1.4cqw]">
                    <div class="flex items-center gap-[0.7cqw] text-amber-300 font-bold mb-[0.8cqw]" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                        <i class="fa-solid fa-circle-info"></i> 補足
                    </div>
                    <p class="text-slate-300 font-medium leading-relaxed" style="font-size: clamp(0.78rem, 1.65cqw, 1.2rem);">
                        秒数は <span class="font-mono text-slate-100">ytslide measure</span> で測る。
                        ナレーションを直したら測り直す。
                    </p>
                </aside>
            </div>
        `,
    },

    // ── 17. 画像（本文に収める） ───────────────────────────────────
    // 画像は images/ に置き、パスは player.html から見た相対で書く。
    {
        title: '画像',
        icon: 'fa-image',
        duration: 12,
        narration: '画像のテンプレートです。写真のように、CSS では描けない絵を見せたいときに使います。幅をシーキューダブリューで指定すると、画面の大きさに合わせて伸び縮みします。',
        body: `
            <div class="grid grid-cols-5 gap-[1.8cqw] items-center">
                <figure class="col-span-3 m-0">
                    <img src="images/spheres.jpg" alt="球を並べた 3D の絵" class="w-full h-auto rounded-xl border border-slate-700 shadow-xl shadow-slate-950/60">
                    <figcaption class="text-slate-400 mt-[0.8cqw]" style="font-size: clamp(0.75rem, 1.6cqw, 1.15rem);">images/spheres.jpg</figcaption>
                </figure>
                <div class="col-span-2 space-y-[1cqw]">
                    <p class="text-slate-100 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.1cqw, 1.55rem);">
                        幅は <span class="font-mono text-sky-300">w-full</span> か
                        <span class="font-mono text-sky-300">width: 60cqw</span> で指定する。
                    </p>
                    <p class="text-slate-300 font-medium leading-relaxed" style="font-size: clamp(0.82rem, 1.75cqw, 1.28rem);">
                        高さを抑えたいときは
                        <span class="font-mono text-slate-100">max-h-[34cqw] object-contain</span> を足す。
                    </p>
                </div>
            </div>
        `,
    },

    // ── 18. 画像（全面）。枠いっぱいに敷くので render() で書く ─────
    {
        title: '画像（全面）',
        duration: 11,
        narration: '画像を全面に敷くテンプレートです。枠いっぱいに広げ、その上に文字を載せます。文字が読めるよう、画像の上に黒い膜を一枚かぶせます。',
        render: function() {
            return `
                <div class="relative h-full overflow-hidden">
                    <img src="images/nebula.jpg" alt="星雲の絵" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
                    <div class="relative h-full flex flex-col justify-end px-[4cqw] pb-[4cqw]">
                        <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.5rem, 4.4cqw, 3.4rem);">
                            全面に敷く
                        </h1>
                        <p class="text-slate-300 font-medium mt-[1cqw]" style="font-size: clamp(0.9rem, 2.0cqw, 1.5rem);">
                            <span class="font-mono text-lime-300">absolute inset-0 object-cover</span> で枠を埋め、
                            上に膜を重ねて文字を読めるようにする
                        </p>
                    </div>
                </div>
            `;
        },
    },

    // ── 19. 章の区切り。見出しの枠を外したいので render() で書く ────
    {
        title: '章の区切り',
        duration: 10,
        narration: '章の区切りは、見出しの枠を外したいので render() で書きます。画面には大きな文字だけを出し、目次に出る題名は title に残します。',
        render: function() {
            return `
                <div class="relative h-full flex flex-col justify-center items-center text-center px-[4cqw] overflow-hidden">
                    <div class="absolute inset-0 grid place-items-center">
                        <div class="w-[40cqw] h-[40cqw] rounded-full bg-sky-500/10 blur-[8cqw]"></div>
                    </div>
                    <div class="relative">
                        <div class="text-lime-400 font-bold tracking-widest mb-[1.5cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">CHAPTER 2</div>
                        <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.8rem, 5cqw, 3.8rem);">
                            スライドを<span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">作る</span>
                        </h1>
                        <p class="text-slate-300 font-medium mt-[1.5cqw]" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">
                            見出しの無い全面のスライドは render() で書く
                        </p>
                    </div>
                </div>
            `;
        },
    },
];
