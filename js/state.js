/* ==========================================================
   LIGHTHOUSE — data definitions & current-run state
   ========================================================== */
(function (global) {
  'use strict';

  const CHARS = {
    akari:    { name: '汐崎 灯',  en: 'AKARI',    color: '#e8bd82' },
    chinatsu: { name: '小暮 千夏', en: 'CHINATSU', color: '#e58d76' },
    genzo:    { name: '白石 源藏', en: 'GENZO',    color: '#a9c4b6' },
    haruka:   { name: '佐仓 遥',  en: 'HARUKA',   color: '#c7d9da' },
    mother:   { name: '母亲',     en: 'MOTHER',   color: '#b8c8cc' }
  };

  const FRAGMENTS = {
    shell_chime: {
      name: '贝壳风铃', glyph: '鈴',
      desc: '旧屋的檐下，两只贝壳碰在一起。那声音像有人在很远的地方，叫我的名字。'
    },
    shaved_ice: {
      name: '两碗刨冰', glyph: '氷',
      desc: '「一碗不要红豆。」她替另一个人点单，语气熟练得让人心口发酸。'
    },
    ema: {
      name: '绘马上的名字', glyph: '願',
      desc: '「希望明年、后年，每一年都能一起看灯。」木牌背面，是两个并排的名字。'
    },
    pocket_watch: {
      name: '停摆的怀表', glyph: '時',
      desc: '指针停在 23:47。源藏说，那是灯塔熄灭的时刻。'
    },
    old_ticket: {
      name: '褪色的票根', glyph: '雨',
      desc: '电影的名字已经看不清了。只记得那天下了很大的雨，她把伞往我这边偏。'
    },
    keeper_log: {
      name: '灯塔日志', glyph: '灯',
      desc: '「灯不是被风吹灭的。」最后一页的字迹，被水洇开了。'
    },
    unsent_letter: {
      name: '未寄出的信', glyph: '信',
      desc: '「如果你读到这里，说明我又没能说出口。」信封上写着我的名字。'
    },
    festival_song: {
      name: '夏祭之歌', glyph: '歌',
      desc: '她哼过的调子。十年后，我在收音机的杂音里，又听见了。'
    }
  };

  const FRAGMENT_IDS = Object.keys(FRAGMENTS);

  const ENDINGS = {
    A: {
      key: 'A', title: '长夜', en: 'THE LONG NIGHT',
      epi: '海雾不会散。',
      desc: '你选择让灯塔继续沉睡。\n海雾漫过防波堤，淹没了那个夏天。她仍然在塔上，等一个不会再来的人。'
    },
    B: {
      key: 'B', title: '归港', en: 'HOMECOMING',
      epi: '愿每一艘船，都能找到归港的灯。',
      desc: '灯亮的那一夜，船回到了港口。\n她在光里向你道别。你终于明白，有些告别，是为了让彼此都靠岸。'
    },
    C: {
      key: 'C', title: '回航', en: 'RETURN VOYAGE',
      epi: '如果重来一次，我还是会遇见你。',
      desc: '你回到十年前，推开了那扇门。\n她活了下来。代价是，你们的夏天从未存在过。'
    },
    TRUE: {
      key: 'TRUE', title: '长明', en: 'EVERLIGHT',
      epi: '灯不是一个人守的。',
      desc: '这一次，记得她的不只是你。\n整座小镇的灯一起亮起，她走下灯塔，走进第一个有你的清晨。'
    }
  };

  const CHAPTERS = {
    0: { no: 'PROLOGUE', title: '归港', sub: 'The sea remembers.' },
    1: { no: 'CH. 01', title: '灯塔下的少女', sub: 'A light that should not be.' },
    2: { no: 'CH. 02', title: '潮声里的碎片', sub: 'What the town kept.' },
    3: { no: 'CH. 03', title: '杂音中的过去', sub: 'Frequency 88.1.' },
    4: { no: 'CH. 04', title: '灯守祭', sub: 'One last summer night.' },
    5: { no: 'FINALE', title: '长夜与黎明', sub: 'Choose what to remember.' }
  };

  const defaultState = () => ({
    chapter: -1,
    scene: '',
    line: 0,
    bond: 0,
    fragments: [],
    flags: {},
    day: 1,
    visits: 0,
    radioStations: [],
    playthrough: 0,
    startedAt: Date.now(),
    playtime: 0
  });

  let s = defaultState();

  function reset(playthrough) {
    s = defaultState();
    s.playthrough = playthrough || 0;
    return s;
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(s));
  }
  function restore(snap) {
    s = Object.assign(defaultState(), JSON.parse(JSON.stringify(snap || {})));
    if (!Array.isArray(s.fragments)) s.fragments = [];
    if (!Array.isArray(s.radioStations)) s.radioStations = [];
    if (!s.flags || typeof s.flags !== 'object') s.flags = {};
  }

  function applyEffects(effects) {
    if (!effects) return;
    for (const [k, v] of Object.entries(effects)) {
      if (k === 'flag') {
        if (typeof v === 'string') s.flags[v] = true;
        else if (v && typeof v === 'object') Object.assign(s.flags, v);
      } else if (k === 'flags') {
        Object.assign(s.flags, v || {});
      } else if (k === 'fragment') {
        addFragment(v);
      } else if (k === 'fragments') {
        (v || []).forEach(addFragment);
      } else if (k === 'bond') {
        s.bond = Math.max(0, Math.min(10, s.bond + Number(v || 0)));
      } else if (k in s && typeof s[k] === 'number') {
        s[k] += Number(v || 0);
      } else {
        s.flags[k] = v;
      }
    }
  }

  function addFragment(id) {
    if (!FRAGMENTS[id]) return { added: false, isNewGlobal: false };
    const addedLocal = !s.fragments.includes(id);
    if (addedLocal) s.fragments.push(id);
    const isNewGlobal = Save.addFragment(id);
    return { added: addedLocal, isNewGlobal };
  }

  function hasFrag(id) { return s.fragments.includes(id); }
  function hasGlobalFrag(id) { return Save.hasFragment(id); }
  function globalFragCount() { return Save.global.fragments.filter(id => FRAGMENTS[id]).length; }
  function localFragCount() { return s.fragments.filter(id => FRAGMENTS[id]).length; }
  function allKeyFrags() { return FRAGMENT_IDS.every(id => Save.hasFragment(id)); }

  function flag(k) { return s.flags[k]; }
  function setFlag(k, v) { s.flags[k] = v === undefined ? true : v; }

  function isNGPlus() { return s.playthrough >= 1; }

  function objective() {
    if (s.flags.radioDone) return '灯守祭之夜，登上灯塔。';
    if (s.chapter >= 3) return '回到旧屋的阁楼，修复那台旧收音机。';
    if (s.chapter === 2) return `在汐见町走走，找回关于她的记忆。（第 ${s.day} 天）`;
    if (s.chapter === 1) return '去白鹭灯塔，见那个不该存在的少女。';
    if (s.chapter === 0) return '整理外婆的旧屋，等到天黑。';
    return '等待灯塔亮起。';
  }

  global.GameData = {
    CHARS, FRAGMENTS, FRAGMENT_IDS, ENDINGS, CHAPTERS
  };

  global.State = {
    get data() { return s; },
    reset, snapshot, restore, applyEffects,
    addFragment, hasFrag, hasGlobalFrag, globalFragCount, localFragCount, allKeyFrags,
    flag, setFlag, isNGPlus, objective,
    get bond() { return s.bond; }
  };
})(window);
