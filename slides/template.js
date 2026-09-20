// body だけで 1 枚書ける最小のスライド一式。player.html?slides=template で見られる。

const slidesConfig = {
    title: 'テンプレート',
    heading: 'body だけで書くスライド',
};

const slideData = [
    {
        title: '箇条書きの例',
        icon: 'fa-list-check',
        duration: 7,
        narration: 'body だけで箇条書きのスライドが作れます。見出しの枠は player.html が付けます。',
        body: `
            <ul class="text-slate-200 font-medium space-y-[1cqw]" style="font-size: clamp(1.05rem, 2.5cqw, 1.9rem);">
                <li class="flex items-center gap-[1cqw]">
                    <i class="fa-solid fa-check text-lime-400"></i>
                    <span>render() を書かずに body だけで 1 枚書ける</span>
                </li>
                <li class="flex items-center gap-[1cqw]">
                    <i class="fa-solid fa-check text-lime-400"></i>
                    <span>見出しは title と icon から自動で作られる</span>
                </li>
            </ul>
        `,
    },
];
