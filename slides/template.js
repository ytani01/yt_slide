// スライドの型の見本。player.html?slides=template で並べて見られる。
// 使いたい型のスライドをまるごとコピーして、中身を差し替える。
// 8 種類は body だけで書ける。最後の「章の区切り」だけ render() を使う。

const slidesConfig = {
    title: 'テンプレート',
    heading: 'スライドの型 9 種',
    rules: [
        [/render\(\)/gi, 'レンダー'],
        [/\bbody\b/gi, 'ボディ'],
    ],
};

const slideData = [
    // 1. 箇条書き
    {
        title: '箇条書き',
        icon: 'fa-list-check',
        duration: 6,
        narration: '箇条書きの型です。項目を並べるだけのスライドは、body にリストを書くだけで作れます。',
        body: `
            <ul class="text-slate-200 font-medium space-y-[1.2cqw]" style="font-size: clamp(1.05rem, 2.5cqw, 1.9rem);">
                <li class="flex items-start gap-[1.2cqw]">
                    <i class="fa-solid fa-check text-lime-400 mt-[0.5cqw]"></i>
                    <span>外枠と見出しは <span class="font-mono text-sky-300">player.html</span> が付ける</span>
                </li>
                <li class="flex items-start gap-[1.2cqw]">
                    <i class="fa-solid fa-check text-lime-400 mt-[0.5cqw]"></i>
                    <span>書くのは本文の中身だけ</span>
                </li>
                <li class="flex items-start gap-[1.2cqw]">
                    <i class="fa-solid fa-check text-lime-400 mt-[0.5cqw]"></i>
                    <span>項目は 5 つまでが読みやすい</span>
                </li>
            </ul>
        `,
    },

    // 2. 2 カラム比較
    {
        title: '2 カラム比較',
        icon: 'fa-code-compare',
        duration: 7,
        narration: '2 カラム比較の型です。前と後、長所と短所のように、2 つを並べて見せたいときに使います。',
        body: `
            <div class="grid grid-cols-2 gap-[1.8cqw]">
                <div class="bg-rose-950/40 border border-rose-500/50 rounded-xl p-[2cqw]">
                    <div class="text-rose-400 font-bold mb-[1cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">
                        <i class="fa-solid fa-xmark"></i> render() で書く
                    </div>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                        外枠・見出し・本文を毎回すべて書く。自由度は高いが、枚数ぶん同じ定型が並ぶ。
                    </p>
                </div>
                <div class="bg-lime-950/40 border border-lime-500/50 rounded-xl p-[2cqw]">
                    <div class="text-lime-400 font-bold mb-[1cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">
                        <i class="fa-solid fa-check"></i> body で書く
                    </div>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                        本文だけを書く。見出しは title と icon から作られ、枚数が増えても揃う。
                    </p>
                </div>
            </div>
        `,
    },

    // 3. 表
    {
        title: '表',
        icon: 'fa-table',
        duration: 8,
        narration: '表の型です。項目が多く、揃った形で見せたいときに使います。行は 5 つまでが読みやすい目安です。',
        body: `
            <div class="overflow-x-auto rounded-xl border border-slate-700/80">
                <table class="w-full text-left text-slate-200" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">
                    <thead class="bg-slate-800 text-sky-400 font-bold border-b border-slate-700">
                        <tr><th class="p-[1cqw]">キー</th><th class="p-[1cqw]">中身</th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                        <tr><td class="p-[1cqw] font-mono font-bold text-lime-400">title</td><td class="p-[1cqw]">見出しと目次に出る題名</td></tr>
                        <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">icon</td><td class="p-[1cqw]">見出しの先頭に出すアイコン</td></tr>
                        <tr><td class="p-[1cqw] font-mono font-bold text-lime-400">body</td><td class="p-[1cqw]">本文の HTML</td></tr>
                        <tr><td class="p-[1cqw] font-mono font-bold text-sky-400">duration</td><td class="p-[1cqw]">読み上げの実測秒数</td></tr>
                    </tbody>
                </table>
            </div>
        `,
    },

    // 4. コードと端末画面
    {
        title: 'コードと端末画面',
        icon: 'fa-terminal',
        duration: 6,
        narration: 'コードと端末画面の型です。等幅の文字で、コマンドと出力をそのまま見せます。',
        body: `
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-[1.6cqw] font-mono text-slate-200 space-y-[0.6cqw]" style="font-size: clamp(0.82rem, 1.75cqw, 1.3rem);">
                <div><span class="text-lime-400">$</span> tools/measure-duration.py --slides template --all --write</div>
                <div class="text-slate-400">スライド 4: duration 12 -&gt; 9</div>
                <div class="text-slate-400">template.js: 1 枚を書き換えた</div>
            </div>
            <p class="text-slate-200 mt-[1.4cqw] font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">
                プロンプトは <span class="text-lime-400 font-bold font-mono">$</span>、出力は
                <span class="text-slate-400 font-bold">薄い色</span>で書き分ける。
            </p>
        `,
    },

    // 5. 図解
    {
        title: '図解',
        icon: 'fa-diagram-project',
        duration: 8,
        narration: '図解の型です。箱と矢印で流れを見せます。画像を貼らないので、画面の大きさが変わっても崩れません。',
        body: `
            <div class="flex items-center justify-center gap-[1.4cqw] text-center">
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl px-[2cqw] py-[1.6cqw] flex-1">
                    <div class="text-sky-400 mb-[0.8cqw]" style="font-size: clamp(1.6rem, 3.6cqw, 2.6rem);"><i class="fa-solid fa-file-code"></i></div>
                    <div class="font-bold text-slate-100" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">slides/*.js</div>
                </div>
                <i class="fa-solid fa-arrow-right text-lime-400" style="font-size: clamp(1.2rem, 2.6cqw, 1.9rem);"></i>
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl px-[2cqw] py-[1.6cqw] flex-1">
                    <div class="text-lime-400 mb-[0.8cqw]" style="font-size: clamp(1.6rem, 3.6cqw, 2.6rem);"><i class="fa-solid fa-gears"></i></div>
                    <div class="font-bold text-slate-100" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">player.html</div>
                </div>
                <i class="fa-solid fa-arrow-right text-lime-400" style="font-size: clamp(1.2rem, 2.6cqw, 1.9rem);"></i>
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl px-[2cqw] py-[1.6cqw] flex-1">
                    <div class="text-amber-400 mb-[0.8cqw]" style="font-size: clamp(1.6rem, 3.6cqw, 2.6rem);"><i class="fa-solid fa-display"></i></div>
                    <div class="font-bold text-slate-100" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">ブラウザ</div>
                </div>
            </div>
        `,
    },

    // 6. 数字を大きく見せる
    {
        title: '数字を大きく見せる',
        icon: 'fa-chart-simple',
        duration: 6,
        narration: '数字を大きく見せる型です。文字を減らし、数字だけを残すと印象に残ります。',
        body: `
            <div class="grid grid-cols-3 gap-[2cqw] text-center">
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                    <div class="font-extrabold text-sky-400 leading-none" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">2</div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">公開に要るファイル</div>
                </div>
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                    <div class="font-extrabold text-lime-400 leading-none" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">0</div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">ビルドの手順</div>
                </div>
                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                    <div class="font-extrabold text-amber-400 leading-none" style="font-size: clamp(2.2rem, 6cqw, 4.5rem);">9</div>
                    <div class="text-slate-200 font-medium mt-[0.8cqw]" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">選べる型</div>
                </div>
            </div>
        `,
    },

    // 7. 引用
    {
        title: '引用',
        icon: 'fa-quote-left',
        duration: 6,
        narration: '引用の型です。誰かの言葉や、文書の一節をそのまま見せたいときに使います。',
        body: `
            <blockquote class="border-l-4 border-sky-500/70 pl-[2cqw] py-[0.5cqw]">
                <p class="text-slate-100 font-medium italic leading-relaxed" style="font-size: clamp(1.2rem, 2.9cqw, 2.2rem);">
                    サイズは cqw と clamp() で書く。px や rem の直書きは、16:9 を縮めたときに崩れる。
                </p>
                <footer class="text-slate-400 mt-[1.2cqw]" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">
                    — docs/User.md「render() の書き方」
                </footer>
            </blockquote>
        `,
    },

    // 8. 時系列
    {
        title: '時系列',
        icon: 'fa-timeline',
        duration: 5,
        narration: '時系列の型です。手順や履歴を、順番が分かる形で並べます。',
        body: `
            <div class="space-y-[1.2cqw]">
                <div class="flex items-center gap-[1.4cqw]">
                    <div class="shrink-0 w-[4cqw] h-[4cqw] rounded-full bg-sky-500/20 border border-sky-500/60 text-sky-400 font-bold flex items-center justify-center" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">1</div>
                    <div class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);"><span class="font-mono text-slate-100">slides/</span> に <span class="font-mono text-slate-100">&lt;名前&gt;.js</span> を作る</div>
                </div>
                <div class="flex items-center gap-[1.4cqw]">
                    <div class="shrink-0 w-[4cqw] h-[4cqw] rounded-full bg-sky-500/20 border border-sky-500/60 text-sky-400 font-bold flex items-center justify-center" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">2</div>
                    <div class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">この見本から型をコピーして中身を差し替える</div>
                </div>
                <div class="flex items-center gap-[1.4cqw]">
                    <div class="shrink-0 w-[4cqw] h-[4cqw] rounded-full bg-lime-500/20 border border-lime-500/60 text-lime-400 font-bold flex items-center justify-center" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">3</div>
                    <div class="text-slate-200 font-medium" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">duration を測って書き戻す</div>
                </div>
            </div>
        `,
    },

    // 9. 章の区切り。見出しの枠を外したいので render() で書く
    {
        title: '章の区切り',
        duration: 10,
        narration: '章の区切りは、見出しの枠を外したいので render() で書きます。画面には大きな文字だけを出し、目次に出る題名は title に残します。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center items-center text-center px-[4cqw]">
                    <div class="text-lime-400 font-bold tracking-widest mb-[1.5cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">CHAPTER 2</div>
                    <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.8rem, 5cqw, 3.8rem);">
                        スライドを<span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">作る</span>
                    </h1>
                    <p class="text-slate-300 font-medium mt-[1.5cqw]" style="font-size: clamp(1.0rem, 2.2cqw, 1.65rem);">
                        見出しの無い全面のスライドは render() で書く
                    </p>
                </div>
            `;
        },
    },
];
