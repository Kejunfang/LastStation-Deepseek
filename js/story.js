/* ==========================================================
   灯塔不眠 — 剧情数据
   原始故事 / 原创文本
   ----------------------------------------------------------
   line 类型：
     { t:"say", who, text, expr, pos, inner, cls }
     { t:"choice", choices:[{text, effects, next, locked, lockText, true}] }
     { t:"jump", next } / { t:"if", cond, then, else }
     { t:"frag", id } / { t:"flag", key, value } / { t:"inc", key }
     { t:"bg", name } / { t:"music", name } / { t:"amb", name } / { t:"sfx", name }
     { t:"show", who, expr, pos } / { t:"hide", who } / { t:"clear" }
     { t:"fx", name } / { t:"wait", ms } / { t:"radio" } / { t:"map" }
     { t:"ending", id }
   ========================================================== */
(function (global) {
  'use strict';

  const s = () => State.data;

  const atLeast = (v) => (st) => st.bond >= v;

  /* =========================================================
     场景
     ========================================================= */
  const scenes = {

    /* ==================== 序章 ==================== */

    prologue_ferry: {
      id: 'prologue_ferry', chapter: 0, title: '归港',
      bg: 'ferry_dusk', music: 'piano', amb: 'sea',
      lines: [
        { t: 'say', text: '八月的最后一周，我坐上了回汐见町的渡轮。' },
        { t: 'say', text: '海是铅灰色的。云压得很低，像一块浸了水的旧布。' },
        { t: 'say', inner: true, who: 'haruka', text: '十年了。这个小镇连海风的味道都没有变。',
          ngplus: '十年了。海风还是这个味道。可这一次，我好像不是第一次坐这班船。' },
        { t: 'say', text: '手机在口袋里震了一下。是母亲。' },
        { t: 'say', text: '「房子已经挂出去了。你收拾完就回来，别误了开学。」' },
        { t: 'say', inner: true, who: 'haruka', text: '我没有回她。因为我已经从音乐学校退学了。' },
        { t: 'say', text: '船头劈开浪，白色的水沫溅到栏杆上。远处的岬角上，白鹭灯塔一动不动。' },
        { t: 'say', text: '从我记事起，那盏灯就没有亮过。镇上的人说，它坏了；也有人说，它不想亮了。' },
        { t: 'say', inner: true, who: 'haruka', text: '外婆是在春天走的。葬礼我没有回来。那时我正在准备一场很重要的比赛，最后也没有上场。',
          ngplus: '外婆是在春天走的。这一次，我记得她葬礼那天的雨。也记得，我本该早点回来。' },
        { t: 'sfx', name: 'bell' },
        { t: 'say', text: '靠岸的汽笛响了一声，像有人在很深的地方叹了一口气。' },
        { t: 'say', text: '下船时，一枚贝壳被风送到脚边。我捡起来，贝壳内侧还留着一点体温似的暖。' },
        { t: 'say', inner: true, who: 'haruka', text: '……奇怪。胸口忽然空了一下。' }
      ],
      next: 'prologue_house'
    },

    prologue_house: {
      id: 'prologue_house', chapter: 0, title: '旧屋',
      bg: 'old_house', music: 'town', amb: 'sea',
      lines: [
        { t: 'say', text: '外婆的旧屋在坡道尽头。木门一推开，灰尘就在夕光里浮起来。' },
        { t: 'say', text: '榻榻米、旧木柜、海风的味道。这个房间好像停在很多年前的夏天。' },
        { t: 'say', text: '我把行李箱放在玄关，开始整理壁橱。最深处的纸箱里，有一只生锈的铁盒。' },
        { t: 'sfx', name: 'chime' },
        { t: 'say', text: '盒子里是一串贝壳风铃，和一张旧照片。' },
        { t: 'frag', id: 'shell_chime' },
        { t: 'say', text: '照片上，七岁的我站在灯塔前，身边有一个女孩。她的脸被阳光照得发白，只剩下轮廓。' },
        { t: 'say', inner: true, who: 'haruka', text: '她是谁？为什么我一点都想不起来。' },
        { t: 'say', text: '我把照片翻过来。背面有一行铅笔字，已经被水泡开了。' },
        { t: 'say', text: '「等灯亮起来，我们就——」' },
        { t: 'say', inner: true, who: 'haruka', text: '……头好痛。',
          ngplus: '……头好痛。可这一次，痛里还混着一点别的什么。像是有人在我耳边说：你终于回来了。' },
        { t: 'say', text: '入夜后，我听见了声音。很轻，像有人在敲玻璃。' },
        { t: 'sfx', name: 'wave' },
        { t: 'say', text: '我推开窗。海面漆黑，只有岬角上，灯塔的顶端亮着一点微弱的、金色的光。' },
        { t: 'say', inner: true, who: 'haruka', text: '……亮了？' }
      ],
      next: 'ch1_lighthouse'
    },

    /* ==================== 第一章 ==================== */

    ch1_lighthouse: {
      id: 'ch1_lighthouse', chapter: 1, title: '灯塔下的少女',
      bg: 'lighthouse_dusk', music: 'mystery', amb: 'sea',
      lines: [
        { t: 'say', text: '我沿着岬角的石阶往上走。铁门没有锁，锈迹在掌心留下一层红褐色的粉。' },
        { t: 'say', text: '塔里没有电。每上一层，海风的声音就大一点。走到灯室时，我的呼吸已经完全乱了。' },
        { t: 'bg', name: 'lantern_room' },
        { t: 'say', text: '她就站在透镜旁边。' },
        { t: 'show', who: 'akari', expr: 'distant', pos: 'center' },
        { t: 'say', text: '浅色的长发垂到腰际，白裙被风吹得贴在腿上。她赤着脚，脚边没有影子。' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「……你回来了。」',
          ngplus: '「……你这次回来得，比上一次早。」' },
        { t: 'say', who: 'haruka', text: '「你认识我？」' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「……」' },
        { t: 'say', text: '她看着我，像是要把我的脸重新描一遍。然后，她笑了。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「不认识。只是我在这里等太久了，见到谁都会这么说。」' },
        { t: 'say', inner: true, who: 'haruka', text: '她在说谎。可她的声音，为什么让我想哭。' },
        { t: 'choice', choices: [
          { text: '「你一个人住在这里？」', effects: { bond: 1, flag: 'asked_alone' }, next: 'ch1_a' },
          { text: '「刚才的灯，是你点亮的吗？」', effects: { bond: 1, flag: 'asked_light' }, next: 'ch1_b' },
          { text: '「这里不该有人。我要走了。」', effects: { bond: -1, flag: 'tried_leave' }, next: 'ch1_c' }
        ] }
      ]
    },

    ch1_a: {
      id: 'ch1_a', chapter: 1, title: '灯塔下的少女',
      bg: 'lantern_room', music: 'akari', amb: 'sea',
      lines: [
        { t: 'say', who: 'akari', expr: 'normal', text: '「嗯。从很久以前开始。」' },
        { t: 'say', who: 'haruka', text: '「你叫什么名字？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「汐崎灯。灯是灯塔的灯。」' },
        { t: 'say', text: '她说完，像是在等我的反应。' },
        { t: 'say', who: 'haruka', text: '「……佐仓遥。」' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「我知道。」' },
        { t: 'say', who: 'haruka', text: '「你刚才还说不认识我。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「名字和人是两回事。」' },
        { t: 'say', text: '她转过身，指尖隔着玻璃，碰了碰那台巨大的透镜。' },
        { t: 'say', who: 'akari', text: '「你在看那盏灯。它已经十年没有亮过了。」' },
        { t: 'say', who: 'haruka', text: '「刚才明明亮了。」' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「那是它做了一个梦。梦见有人回来。」' },
        { t: 'say', inner: true, who: 'haruka', text: '她说话的方式，像在念一首很旧的诗。' }
      ],
      next: 'ch1_tour'
    },

    ch1_b: {
      id: 'ch1_b', chapter: 1, title: '灯塔下的少女',
      bg: 'lantern_room', music: 'akari', amb: 'sea',
      lines: [
        { t: 'say', who: 'akari', expr: 'normal', text: '「不是我。是它自己。」' },
        { t: 'say', who: 'haruka', text: '「灯塔会自己亮？」' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「灯塔记得的东西，比人多。」' },
        { t: 'say', text: '她抬起手，指尖隔着玻璃，碰了碰那台巨大的透镜。' },
        { t: 'say', who: 'akari', text: '「你听。」' },
        { t: 'say', text: '我屏住呼吸。透镜里传来很轻的嗡鸣，像很远的地方有一列火车正在进站。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「它说，今天晚上有人要回来。」' },
        { t: 'say', who: 'haruka', text: '「……谁？」' },
        { t: 'say', who: 'akari', expr: 'sad', text: '「一个说话不算数的人。」' },
        { t: 'say', text: '她低下头，头发遮住了半张脸。' },
        { t: 'say', inner: true, who: 'haruka', text: '我忽然很怕问下去。' }
      ],
      next: 'ch1_tour'
    },

    ch1_c: {
      id: 'ch1_c', chapter: 1, title: '灯塔下的少女',
      bg: 'lantern_room', music: 'akari', amb: 'sea',
      lines: [
        { t: 'say', who: 'akari', expr: 'sad', text: '「……嗯。」' },
        { t: 'say', text: '她没有拦我。只是把手收回袖子里，退后一步。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「你每次都想走。没关系的，我已经习惯了。」' },
        { t: 'say', who: 'haruka', text: '「每次？」' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「我随便说的。海风太大了，容易说胡话。」' },
        { t: 'say', text: '我走到楼梯口，又停下来。身后的灯室里，她安静地站着，像一件被遗忘在阁楼上的旧物。' },
        { t: 'say', inner: true, who: 'haruka', text: '我没办法把她一个人留在这里。' },
        { t: 'say', who: 'haruka', text: '「……你叫什么名字？」' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「汐崎灯。」' },
        { t: 'say', text: '她说得很快，像是怕我反悔。' }
      ],
      next: 'ch1_tour'
    },

    ch1_tour: {
      id: 'ch1_tour', keepCast: true, chapter: 1, title: '灯室',
      bg: 'lantern_room', music: 'akari', amb: 'sea',
      lines: [
        { t: 'say', text: '灯室里有三样东西：一台德国造的旧透镜、一张落满灰的木桌、还有一本被翻烂的日志。' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「这里以前是白鹭灯塔。我父亲是守灯人。」' },
        { t: 'say', who: 'haruka', text: '「以前？」' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「十年前，灯灭了。后来就再也没有亮过。」' },
        { t: 'say', text: '她翻开那本日志，又合上。纸页间掉出一点细碎的灰尘。' },
        { t: 'say', who: 'akari', text: '「三天后是灯守祭。镇上的人会放灯，纪念所有没有回来的船。」' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「我想在那天晚上，把灯塔点亮一次。就一次。」' },
        { t: 'say', who: 'haruka', text: '「为什么？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「因为有人在等。」' },
        { t: 'say', text: '她没有说是谁。月光落在她脸上，把她的眼睛照成很浅的琥珀色。' },
        { t: 'choice', choices: [
          { text: '「我帮你。」', effects: { bond: 1, flag: 'promised' }, next: 'ch1_promise' },
          { text: '「告诉我，你到底是谁。」', effects: { bond: 1, flag: 'pressed_identity' }, next: 'ch1_press' },
          { text: '「我只是回来卖房子的。后天就走。」', effects: { flag: 'refused_help' }, next: 'ch1_refuse' }
        ] }
      ]
    },

    ch1_promise: {
      id: 'ch1_promise', keepCast: true, chapter: 1, title: '灯室',
      bg: 'lantern_room', music: 'akari',
      lines: [
        { t: 'say', who: 'akari', expr: 'surprised', text: '「……真的？」' },
        { t: 'say', who: 'haruka', text: '「反正我也没事做。」' },
        { t: 'say', text: '她笑起来的时候，眼睛先弯，嘴角才慢慢跟上。' },
        { t: 'say', who: 'akari', expr: 'happy', text: '「你以前也这么说过。「反正我也没事做。」」' },
        { t: 'say', who: 'haruka', text: '「我以前到底说过多少话？」' },
        { t: 'say', who: 'akari', expr: 'shy', text: '「……很多。多到我都快记不住了。」' },
        { t: 'say', inner: true, who: 'haruka', text: '她说「快记不住」的时候，声音很轻，像是真的在害怕忘记。' }
      ],
      next: 'ch1_close'
    },

    ch1_press: {
      id: 'ch1_press', keepCast: true, chapter: 1, title: '灯室',
      bg: 'lantern_room', music: 'akari',
      lines: [
        { t: 'say', who: 'akari', expr: 'sad', text: '「……你想听哪一种答案？」' },
        { t: 'say', who: 'haruka', text: '「真的那种。」' },
        { t: 'say', text: '她沉默了很久。久到窗外的海面又暗了一层。' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「我是汐崎灯。我住在这里。我在等一个人。」' },
        { t: 'say', who: 'akari', text: '「这三句话，都是真的。」' },
        { t: 'say', who: 'haruka', text: '「那什么是假的？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「你不需要知道。至少今晚不需要。」' },
        { t: 'say', inner: true, who: 'haruka', text: '她把「今晚」两个字咬得很重。' }
      ],
      next: 'ch1_close'
    },

    ch1_refuse: {
      id: 'ch1_refuse', keepCast: true, chapter: 1, title: '灯室',
      bg: 'lantern_room', music: 'akari',
      lines: [
        { t: 'say', who: 'akari', expr: 'normal', text: '「嗯。我知道。」' },
        { t: 'say', who: 'haruka', text: '「你知道？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「你每次回来，都是为了把房子卖掉。这一次应该也一样。」' },
        { t: 'say', text: '她说得很平静，像在说潮水什么时候涨。' },
        { t: 'say', who: 'akari', text: '「不过，离灯守祭还有三天。三天里，你可以改变主意。」' },
        { t: 'say', who: 'haruka', text: '「你就这么确定？」' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「不确定。我只是很擅长等。」' },
        { t: 'say', inner: true, who: 'haruka', text: '我发现自己没有办法对这句话生气。' }
      ],
      next: 'ch1_close'
    },

    ch1_close: {
      id: 'ch1_close', keepCast: true, chapter: 1, title: '灯室',
      bg: 'lantern_room', music: 'akari', amb: 'sea',
      lines: [
        { t: 'say', text: '她把一枚黄铜钥匙放进我手心。钥匙是温的。' },
        { t: 'say', who: 'akari', text: '「灯塔的钥匙。拿着它，你随时可以上来。」' },
        { t: 'say', who: 'haruka', text: '「你不怕我把这里搬空？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「你会吗？」' },
        { t: 'say', text: '她笑起来的时候，灯室里好像亮了一点。' },
        { t: 'flag', key: 'has_key' },
        { t: 'say', text: '钟敲了十二下。她忽然看向窗外，像是听见了什么。' },
        { t: 'say', who: 'akari', expr: 'fade', text: '「我该走了。天亮以后，我不能留在这里。」' },
        { t: 'say', who: 'haruka', text: '「等等——」' },
        { t: 'hide', who: 'akari' },
        { t: 'say', text: '灯室里只剩下风。那枚钥匙在我掌心里，越来越沉。' }
      ],
      next: 'ch2_intro'
    },

    /* ==================== 第二章 ==================== */

    ch2_intro: {
      id: 'ch2_intro', chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town', amb: 'sea',
      lines: [
        { t: 'say', text: '第二天早上，我是被敲门声吵醒的。' },
        { t: 'say', text: '门外站着一个短发的女人，手里提着一只保温桶。' },
        { t: 'show', who: 'chinatsu', expr: 'smile', pos: 'center' },
        { t: 'say', who: 'chinatsu', text: '「还真是你啊，佐仓遥。我还以为是谁家的野猫把门挠开了。」' },
        { t: 'say', who: 'haruka', text: '「小暮……千夏？」' },
        { t: 'say', who: 'chinatsu', expr: 'happy', text: '「亏你还记得。十年没见，你长高了好多。」' },
        { t: 'say', text: '她把保温桶塞进我怀里，自顾自地走进屋，像回自己家一样。' },
        { t: 'say', who: 'chinatsu', text: '「听说你回来收拾房子。收拾完就走？」' },
        { t: 'say', who: 'haruka', text: '「嗯。」' },
        { t: 'say', who: 'chinatsu', text: '「那正好。后天是灯守祭，你走之前，至少吃一碗我家的刨冰。」' },
        { t: 'say', text: '她看见桌上的黄铜钥匙，笑容停了半秒。' },
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「……你上去过了？」' },
        { t: 'say', who: 'haruka', text: '「你认识这把钥匙？」' },
        { t: 'say', who: 'chinatsu', text: '「汐见町的人，谁不认识白鹭灯塔的钥匙。」' },
        { t: 'say', who: 'chinatsu', expr: 'sad', text: '「遥，听我一句。那盏灯，别去碰。」' },
        { t: 'choice', choices: [
          { text: '「为什么？」', effects: { flag: 'asked_warning' }, next: 'ch2_warn_a' },
          { text: '「你见过她吗？灯塔上的女孩。」', effects: { flag: 'asked_chinatsu_akari', bond: 1 }, next: 'ch2_warn_b' },
          { text: '「你家的刨冰，还开着吗？」', effects: { flag: 'asked_ice' }, next: 'ch2_warn_c' }
        ] }
      ]
    },

    ch2_warn_a: {
      id: 'ch2_warn_a', keepCast: true, chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「因为那盏灯会拿走东西。」' },
        { t: 'say', who: 'haruka', text: '「拿走什么？」' },
        { t: 'say', who: 'chinatsu', text: '「你最重要的记忆。」' },
        { t: 'say', text: '她说这话的时候，没有看我，只是低头把保温桶的盖子拧紧。' },
        { t: 'say', who: 'chinatsu', expr: 'smile', text: '「不过也可能是老人家吓唬小孩的。你别当真。」' },
        { t: 'say', inner: true, who: 'haruka', text: '她的手指在发抖。' }
      ],
      next: 'ch2_start'
    },

    ch2_warn_b: {
      id: 'ch2_warn_b', keepCast: true, chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'surprised', text: '「……你也看见了。」' },
        { t: 'say', text: '她慢慢放下手里的杯子，像是怕打碎什么。' },
        { t: 'say', who: 'chinatsu', expr: 'sad', text: '「镇上的人都当她不存在。只有每年灯守祭那几天，灯塔会亮一下。」' },
        { t: 'say', who: 'chinatsu', text: '「我小时候偷偷上去过一次。她坐在透镜旁边，问我：『遥今年会来吗？』」' },
        { t: 'say', who: 'haruka', text: '「你怎么回答的？」' },
        { t: 'say', who: 'chinatsu', text: '「我说会。我那时候以为，大人说的话都算数。」' },
        { t: 'say', text: '她笑了一下，眼睛却没有笑。' }
      ],
      next: 'ch2_start'
    },

    ch2_warn_c: {
      id: 'ch2_warn_c', keepCast: true, chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「……你就只惦记这个？」' },
        { t: 'say', who: 'chinatsu', expr: 'smile', text: '「开着。今年夏天最后一天，第二碗半价。」' },
        { t: 'say', who: 'haruka', text: '「那我得吃两碗。」' },
        { t: 'say', who: 'chinatsu', expr: 'happy', text: '「你一个人吃得完吗？」' },
        { t: 'say', who: 'haruka', text: '「吃不完就打包。」' },
        { t: 'say', text: '她笑出了声，屋里的空气终于松了一点。' },
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「遥。有些事，等你吃完刨冰再说。」' }
      ],
      next: 'ch2_start'
    },

    ch2_start: {
      id: 'ch2_start', keepCast: true, chapter: 2, title: '潮声里的碎片',
      bg: 'town_day', music: 'town', amb: 'sea',
      lines: [
        { t: 'say', who: 'chinatsu', text: '「今天和明天，镇上都在准备祭典。你要是闲着，就帮我跑跑腿。」' },
        { t: 'say', who: 'chinatsu', expr: 'smile', text: '「说不定……能想起些什么。」' },
        { t: 'say', text: '她把一张手绘的小镇地图拍在我手里。地图边角画着一只很丑的猫。' },
        { t: 'set', key: 'day', value: 1 },
        { t: 'set', key: 'visits', value: 0 },
        { t: 'say', inner: true, who: 'haruka', text: '还有两天。灯守祭之前，我想把这座小镇重新走一遍。' }
      ],
      next: 'ch2_map'
    },

    ch2_map: {
      id: 'ch2_map', chapter: 2, title: '潮声里的碎片',
      bg: 'town_day', music: 'town', amb: 'sea',
      lines: [
        { t: 'if', cond: () => s().visits >= 2, then: 'ch2_day_end', else: 'ch2_map_open' }
      ]
    },

    ch2_map_open: {
      id: 'ch2_map_open', chapter: 2, title: '潮声里的碎片',
      bg: 'town_day', music: 'town', amb: 'sea',
      lines: [
        { t: 'say', text: '汐见町很小。从坡道尽头走到港口，只需要二十分钟。' },
        { t: 'map' }
      ],
      next: 'ch2_map'
    },

    ch2_day_end: {
      id: 'ch2_day_end', chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town',
      lines: [
        { t: 'if', cond: () => s().day === 1, then: 'ch2_day2', else: 'ch3_intro' }
      ]
    },

    ch2_day2: {
      id: 'ch2_day2', chapter: 2, title: '潮声里的碎片',
      bg: 'old_house', music: 'town', amb: 'sea',
      lines: [
        { t: 'set', key: 'day', value: 2 },
        { t: 'set', key: 'visits', value: 0 },
        { t: 'say', text: '第二天，天阴着。海面上浮着一层薄薄的白雾。' },
        { t: 'say', text: '镇公所的人开始搭灯守祭的架子。空气里有木柴、糖和雨的味道。' },
        { t: 'say', inner: true, who: 'haruka', text: '还剩一天。我总觉得，有些东西还没有找回来。' }
      ],
      next: 'ch2_map'
    },

    /* ---------- 第二章 · 地点 ---------- */

    loc_diner: {
      id: 'loc_diner', chapter: 2, title: '潮风食堂',
      bg: 'diner', music: 'town',
      lines: [
        { t: 'flag', key: 'visited_diner' },
        { t: 'inc', key: 'visits' },
        { t: 'say', text: '潮风食堂在坡道下面，门口挂着一块被海风磨白的暖帘。' },
        { t: 'show', who: 'chinatsu', expr: 'smile', pos: 'center' },
        { t: 'say', who: 'chinatsu', text: '「来得正好。帮我试味道。」' },
        { t: 'say', text: '她端出两碗刨冰。一碗淋了红色的草莓酱，另一碗是透明的，只加了一点蜂蜜。' },
        { t: 'say', who: 'haruka', text: '「另一碗是……？」' },
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「给灯的。她不吃红豆。」' },
        { t: 'say', who: 'haruka', text: '「灯？」' },
        { t: 'say', text: '她愣了一下，把碗放下。' },
        { t: 'say', who: 'chinatsu', text: '「……你果然不记得了。」' },
        { t: 'frag', id: 'shaved_ice' },
        { t: 'say', text: '千夏说，十年前每个夏天，灯塔上都会下来一个女孩，坐在靠窗的位置，点两碗刨冰。' },
        { t: 'say', text: '一碗给她自己，一碗给一个从城里来的男孩。' },
        { t: 'say', who: 'chinatsu', expr: 'sad', text: '「那个男孩每年都来。后来有一年，他没有来。」' },
        { t: 'say', who: 'haruka', text: '「……」' },
        { t: 'say', who: 'chinatsu', text: '「她等到刨冰化成水，才走。」' },
        { t: 'say', inner: true, who: 'haruka', text: '我看着那碗透明的刨冰，喉咙里像堵了一块冰。' },
        { t: 'choice', choices: [
          { text: '「那个男孩，是我吗？」', effects: { bond: 1 }, next: 'diner_a' },
          { text: '「她后来还来过吗？」', effects: { flag: 'asked_later' }, next: 'diner_b' },
          { text: '「对不起。」', effects: { bond: 1, flag: 'apologized' }, next: 'diner_c' }
        ] }
      ]
    },

    diner_a: {
      id: 'diner_a', keepCast: true, chapter: 2, title: '潮风食堂',
      bg: 'diner', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「你自己觉得呢？」' },
        { t: 'say', who: 'haruka', text: '「……我什么都不记得。」' },
        { t: 'say', who: 'chinatsu', expr: 'sad', text: '「那就别急着认。」' },
        { t: 'say', text: '她把那碗没有红豆的刨冰推到我面前。' },
        { t: 'say', who: 'chinatsu', text: '「先吃。化了就不好吃了。」' },
        { t: 'say', text: '蜂蜜水顺着冰屑往下淌。我舀了一勺，甜得发苦。' }
      ],
      next: 'diner_end'
    },

    diner_b: {
      id: 'diner_b', keepCast: true, chapter: 2, title: '潮风食堂',
      bg: 'diner', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'sad', text: '「来过。每年夏天都来，坐在同一个位置。」' },
        { t: 'say', who: 'chinatsu', text: '「后来我搬去城里念书，店交给我妈。再回来的时候，她就不来了。」' },
        { t: 'say', who: 'haruka', text: '「为什么？」' },
        { t: 'say', who: 'chinatsu', text: '「不知道。也许是她终于等累了。」' },
        { t: 'say', text: '她低头擦着已经很干净的杯子。' }
      ],
      next: 'diner_end'
    },

    diner_c: {
      id: 'diner_c', keepCast: true, chapter: 2, title: '潮风食堂',
      bg: 'diner', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'surprised', text: '「……你道什么歉？」' },
        { t: 'say', who: 'haruka', text: '「不知道。只是觉得，应该有人替他说这句话。」' },
        { t: 'say', text: '千夏看了我很久，然后伸手揉乱了我的头发。' },
        { t: 'say', who: 'chinatsu', expr: 'smile', text: '「你还是跟小时候一样，动不动就替别人难过。」' },
        { t: 'say', who: 'chinatsu', text: '「不过，这次你不用替谁。你只要想清楚，自己要不要留下来。」' }
      ],
      next: 'diner_end'
    },

    diner_end: {
      id: 'diner_end', keepCast: true, chapter: 2, title: '潮风食堂',
      bg: 'diner', music: 'town',
      lines: [
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「我哥那时候在渔船上。那场风暴，是灯塔的光把他带回来的。」' },
        { t: 'say', who: 'chinatsu', text: '「所以我不恨那盏灯。我只是……不想再看见有人为了它消失。」' },
        { t: 'say', text: '她转过身去擦杯子，背影很用力地挺直。' },
        { t: 'say', inner: true, who: 'haruka', text: '我没有告诉她，昨晚我已经答应了灯塔上的那个女孩。' }
      ],
      next: 'ch2_map'
    },

    loc_shrine: {
      id: 'loc_shrine', chapter: 2, title: '白鹭神社',
      bg: 'shrine', music: 'mystery',
      lines: [
        { t: 'flag', key: 'visited_shrine' },
        { t: 'inc', key: 'visits' },
        { t: 'say', text: '白鹭神社在镇子最高的地方。石阶两侧的绣球花被雨打得垂着头。' },
        { t: 'say', text: '祭典用的纸灯笼已经挂起来了，杉树之间拉着一串一串的细绳。' },
        { t: 'say', text: '我在绘马架前停下。有一块木牌挂得特别低，像是被谁反复取下来又挂回去。' },
        { t: 'frag', id: 'ema' },
        { t: 'say', text: '木牌正面：「希望明年、后年，每一年都能一起看灯。」字迹很秀气。' },
        { t: 'say', text: '背面并排写着两个名字：汐崎灯、佐仓遥。' },
        { t: 'say', inner: true, who: 'haruka', text: '我的名字。为什么会在这里。' },
        { t: 'say', text: '扫地的宫司说，这块绘马是十年前挂上去的，每年都有人来擦。' },
        { t: 'say', text: '「那个小姑娘啊，每年夏天都来。后来不来了，但她母亲一直替她擦。」' },
        { t: 'choice', choices: [
          { text: '「她母亲还住在镇上吗？」', next: 'shrine_a' },
          { text: '「您还记得她什么？」', effects: { bond: 1 }, next: 'shrine_b' },
          { text: '把绘马挂回原处。', effects: { flag: 'hung_ema' }, next: 'shrine_c' }
        ] }
      ]
    },

    shrine_a: {
      id: 'shrine_a', chapter: 2, title: '白鹭神社',
      bg: 'shrine', music: 'mystery',
      lines: [
        { t: 'say', text: '宫司摇了摇头。' },
        { t: 'say', text: '「那场事故之后，她就搬走了。每年灯守祭前，会寄一只信封回来，里面是一张新的绘马。」' },
        { t: 'say', who: 'haruka', text: '「她为什么不回来？」' },
        { t: 'say', text: '「大概是回不来吧。」宫司说，「有些地方，失去了一个人，就再也进不去了。」' },
        { t: 'say', text: '他把新的一块绘马递给我。木牌还是空的。' }
      ],
      next: 'shrine_end'
    },

    shrine_b: {
      id: 'shrine_b', chapter: 2, title: '白鹭神社',
      bg: 'shrine', music: 'mystery',
      lines: [
        { t: 'say', text: '宫司想了想。' },
        { t: 'say', text: '「她每次来，都会先擦一遍那块绘马，再买一支线香。」' },
        { t: 'say', text: '「有一次我问她，许了什么愿。她说：『希望那个人回来的时候，还能认得路。』」' },
        { t: 'say', who: 'haruka', text: '「……她等到了吗？」' },
        { t: 'say', text: '宫司看着我，没有回答。' }
      ],
      next: 'shrine_end'
    },

    shrine_c: {
      id: 'shrine_c', chapter: 2, title: '白鹭神社',
      bg: 'shrine', music: 'mystery',
      lines: [
        { t: 'say', text: '我把木牌摘下来，用袖子擦掉上面的灰，再挂回原处。' },
        { t: 'say', text: '风吹过杉树，挂着的绘马互相碰撞，发出很轻的木头声。' },
        { t: 'say', inner: true, who: 'haruka', text: '如果愿望真的能挂在这里十年，那她一定每天都在等风把它吹响。' }
      ],
      next: 'shrine_end'
    },

    shrine_end: {
      id: 'shrine_end', chapter: 2, title: '白鹭神社',
      bg: 'shrine', music: 'mystery',
      lines: [
        { t: 'say', text: '下山的时候，天已经暗了。' },
        { t: 'say', text: '我回头看了一眼。神社的灯笼在暮色里亮起来，一盏一盏，像有人沿着石阶往下走。' }
      ],
      next: 'ch2_map'
    },

    loc_breakwater: {
      id: 'loc_breakwater', chapter: 2, title: '旧防波堤',
      bg: 'breakwater', music: 'mystery', amb: 'sea',
      lines: [
        { t: 'flag', key: 'visited_breakwater' },
        { t: 'inc', key: 'visits' },
        { t: 'say', text: '傍晚，我走到旧防波堤。混凝土被夕阳晒得发烫，缝隙里长着盐生草。' },
        { t: 'say', text: '一个老人坐在尽头的折叠椅上，面前插着三根鱼竿，一根也没有动。' },
        { t: 'say', who: 'genzo', text: '「你是佐仓家的孩子。」' },
        { t: 'say', who: 'haruka', text: '「您是……白石先生？」' },
        { t: 'say', who: 'genzo', text: '「以前是这里的副守灯人。现在是看海的闲人。」' },
        { t: 'say', text: '他拍了拍旁边的空位。我坐下来，发现他的折叠椅边放着一只停摆的怀表。' },
        { t: 'frag', id: 'pocket_watch' },
        { t: 'say', who: 'genzo', text: '「那晚，灯亮了三分钟。船回来了。她父亲没有下来。」' },
        { t: 'say', who: 'haruka', text: '「那……她呢？」' },
        { t: 'say', text: '老人看着海面，很久没有说话。' },
        { t: 'say', who: 'genzo', text: '「你也见过她了，不是吗。」' },
        { t: 'choice', choices: [
          { text: '「她到底是什么？」', effects: { bond: 1 }, next: 'bw_a' },
          { text: '「你为什么现在才说？」', effects: { flag: 'angry_genzo' }, next: 'bw_b' },
          { text: '「我不信。」', effects: { flag: 'denied' }, next: 'bw_c' }
        ] }
      ]
    },

    bw_a: {
      id: 'bw_a', chapter: 2, title: '旧防波堤',
      bg: 'breakwater', music: 'mystery',
      lines: [
        { t: 'say', who: 'genzo', text: '「她是那盏灯留下来的东西。」' },
        { t: 'say', who: 'genzo', text: '「灯不亮，她就还在。灯一亮，她就得走。」' },
        { t: 'say', who: 'haruka', text: '「为什么？」' },
        { t: 'say', who: 'genzo', text: '「因为灯是靠记忆烧的。她本来就是一段记忆。」' },
        { t: 'say', text: '他把怀表翻过来。表盖内侧刻着一行很小的字：汐崎。' },
        { t: 'say', who: 'genzo', text: '「回去吧，孩子。别去点那盏灯。」' }
      ],
      next: 'bw_end'
    },

    bw_b: {
      id: 'bw_b', chapter: 2, title: '旧防波堤',
      bg: 'breakwater', music: 'mystery',
      lines: [
        { t: 'say', text: '老人没有看我。他把鱼竿收回来，线上的浮漂在暮色里晃了一下。' },
        { t: 'say', who: 'genzo', text: '「因为我说了，你也不会信。」' },
        { t: 'say', who: 'haruka', text: '「你不说，怎么知道我不会信？」' },
        { t: 'say', text: '他终于转过头。那双眼睛浑浊得像被海水泡过。' },
        { t: 'say', who: 'genzo', text: '「我守了那盏灯三十年。最后那晚，我亲手把它关了。」' },
        { t: 'say', who: 'genzo', text: '「你想知道为什么，就自己去问她。她比我诚实。」' }
      ],
      next: 'bw_end'
    },

    bw_c: {
      id: 'bw_c', chapter: 2, title: '旧防波堤',
      bg: 'breakwater', music: 'mystery',
      lines: [
        { t: 'say', who: 'genzo', text: '「不信好啊。」' },
        { t: 'say', text: '他把鱼竿重新甩出去，浮漂落在很远的海面上。' },
        { t: 'say', who: 'genzo', text: '「不信的人，活得比较轻松。」' },
        { t: 'say', text: '我坐了一会儿，起身要走。他在我身后说：' },
        { t: 'say', who: 'genzo', text: '「灯守祭那天，别上塔。算我求你。」' }
      ],
      next: 'bw_end'
    },

    bw_end: {
      id: 'bw_end', chapter: 2, title: '旧防波堤',
      bg: 'breakwater', music: 'mystery',
      lines: [
        { t: 'flag', key: 'met_genzo' },
        { t: 'say', text: '回去的路上，怀表在我口袋里一下一下地撞着腿。' },
        { t: 'say', text: '指针停在 23:47。我数了三遍，确认它没有再走。' },
        { t: 'say', inner: true, who: 'haruka', text: '二十三时四十七分。灯塔熄灭的时刻。' }
      ],
      next: 'ch2_map'
    },

    loc_cinema: {
      id: 'loc_cinema', chapter: 2, title: '汐见电影院',
      bg: 'cinema', music: 'akari',
      lines: [
        { t: 'flag', key: 'visited_cinema' },
        { t: 'inc', key: 'visits' },
        { t: 'say', text: '汐见电影院只有一块银幕，四十个座位，放映机还是胶片的。' },
        { t: 'say', text: '老板说，今天放一部老片子。下雨天没人来，就当给我一个人放。' },
        { t: 'say', text: '银幕上是一片海。黑白画面里，一艘船慢慢驶向灯塔。' },
        { t: 'say', text: '我在最后一排坐下。椅子发出很旧的响声。就在那一瞬间，记忆毫无预兆地涌了上来。' },
        { t: 'fx', name: 'flash' },
        { t: 'say', text: '十年前，也是这样一个雨天。我和她躲进这家电影院，衣服都湿透了。' },
        { t: 'say', text: '她把爆米花放在我们中间，说「这样谁都不会多拿」。' },
        { t: 'say', text: '电影放到一半，她睡着了，头轻轻靠在我肩上。我一动也不敢动。' },
        { t: 'frag', id: 'old_ticket' },
        { t: 'say', text: '我醒来时，银幕上只剩雪花。手里攥着一张褪色的票根。' },
        { t: 'say', inner: true, who: 'haruka', text: '我想起来了。那天，我跟她说：等灯塔亮起来，我就回来。' },
        { t: 'say', inner: true, who: 'haruka', text: '可是我食言了。' },
        { t: 'choice', choices: [
          { text: '「为什么我会忘掉这些？」', effects: { bond: 1, flag: 'wonder_forget' }, next: 'cinema_a' },
          { text: '「她一直在等这句话吗？」', effects: { bond: 1, flag: 'wonder_wait' }, next: 'cinema_b' }
        ] }
      ]
    },

    cinema_a: {
      id: 'cinema_a', chapter: 2, title: '汐见电影院',
      bg: 'cinema', music: 'akari',
      lines: [
        { t: 'say', text: '银幕上的雪花一直响。老板在放映室里咳嗽了一声。' },
        { t: 'say', inner: true, who: 'haruka', text: '不是忘记。更像是有人把那一页从我的脑子里撕掉了。' },
        { t: 'say', inner: true, who: 'haruka', text: '撕得很干净，只在边缘留下一点毛糙的疼。' },
        { t: 'say', text: '我把票根夹进钱包。纸已经脆了，一用力就会碎。' }
      ],
      next: 'cinema_end'
    },

    cinema_b: {
      id: 'cinema_b', chapter: 2, title: '汐见电影院',
      bg: 'cinema', music: 'akari',
      lines: [
        { t: 'say', text: '放映机的光从头顶掠过去，灰尘在光柱里慢慢翻。' },
        { t: 'say', inner: true, who: 'haruka', text: '我忽然想起她说过的话：『你每次回来，都是为了把房子卖掉。』' },
        { t: 'say', inner: true, who: 'haruka', text: '她说「每次」的时候，是不是已经等过我很多次了？' },
        { t: 'say', text: '电影结束了。灯亮起来，整个放映厅空得吓人。' }
      ],
      next: 'cinema_end'
    },

    cinema_end: {
      id: 'cinema_end', chapter: 2, title: '汐见电影院',
      bg: 'cinema', music: 'akari',
      lines: [
        { t: 'say', text: '走出电影院，雨已经停了。' },
        { t: 'say', text: '街对面的灯守祭摊位正在上货，彩色的纸灯一串一串地亮起来。' },
        { t: 'say', inner: true, who: 'haruka', text: '明天就是灯守祭了。' }
      ],
      next: 'ch2_map'
    },

    /* ==================== 第三章 ==================== */

    ch3_intro: {
      id: 'ch3_intro', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', text: '夜里，阁楼上有声音。' },
        { t: 'say', text: '沙沙的，像是有人在调一个永远调不准的频道。' },
        { t: 'say', text: '我打开灯。外婆的旧收音机亮着，指针在刻度上自己慢慢移动。' },
        { t: 'say', text: '那台收音机已经很多年没有插电了。' },
        { t: 'say', inner: true, who: 'haruka', text: '我伸手去拧那个旋钮。' }
      ],
      next: 'ch3_radio'
    },

    ch3_radio: {
      id: 'ch3_radio', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', text: '旋钮很涩，转起来发出细小的咯吱声。每转一点，杂音就变一个形状。' },
        { t: 'radio' }
      ],
      next: 'ch3_after'
    },

    ch3_after: {
      id: 'ch3_after', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', text: '最后一段杂音散去时，我听见了她的声音。' },
        { t: 'say', who: 'akari', expr: 'fade', offscreen: true, text: '「……如果那天，我没有让你走就好了。」' },
        { t: 'say', text: '我抓着收音机的边缘，指节发白。' },
        { t: 'say', inner: true, who: 'haruka', text: '她说的「那天」，是哪一天？' },
        { t: 'say', text: '楼下传来敲门声。源藏站在雨里，手里提着一盏旧马灯。' },
        { t: 'say', who: 'genzo', text: '「你听见了。」' },
        { t: 'say', who: 'genzo', text: '「那就该知道了。那盏灯，是用记忆点的。」' },
        { t: 'say', who: 'genzo', text: '「十年前，你在这里求过它。求它把你关于她的记忆拿走。」' },
        { t: 'say', who: 'haruka', text: '「……我？」' },
        { t: 'say', who: 'genzo', text: '「灯答应了。它把那段记忆留在透镜里，养成了她的样子。」' },
        { t: 'say', who: 'genzo', text: '「所以她还站在那里，等一个已经把她忘掉的人。」' },
        { t: 'say', inner: true, who: 'haruka', text: '我张了张嘴，却发不出声音。' },
        { t: 'say', inner: true, who: 'haruka', text: '原来不是她不肯走。是我一直没有让她走。' },
        { t: 'flag', key: 'knows_truth' },
        { t: 'choice', choices: [
          { text: '「我要去见她。」', effects: { bond: 1 }, next: 'ch3_go' },
          { text: '「如果点亮灯塔，她会怎么样？」', effects: { flag: 'asked_consequence' }, next: 'ch3_consequence' },
          { text: '「你为什么不早点告诉我？」', effects: { flag: 'asked_why_now' }, next: 'ch3_why' }
        ] }
      ]
    },

    ch3_go: {
      id: 'ch3_go', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', who: 'genzo', text: '「去吧。天亮之前，她还在。」' },
        { t: 'say', text: '他侧过身，让开门口。雨从屋檐上滴下来，在台阶上砸出一个个小坑。' },
        { t: 'say', who: 'genzo', text: '「遥。你记住——灯亮起来的那一刻，你会想起所有事。」' },
        { t: 'say', who: 'genzo', text: '「好的，坏的，你答应过她的，你没做到的。全部。」' },
        { t: 'say', who: 'haruka', text: '「……我知道了。」' },
        { t: 'say', text: '我抓起外套冲进雨里。背后，源藏的声音很轻：' },
        { t: 'say', who: 'genzo', text: '「你父亲当年，也是这么跑上去的。」' }
      ],
      next: 'ch3_lighthouse'
    },

    ch3_consequence: {
      id: 'ch3_consequence', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', who: 'genzo', text: '「她会走。」' },
        { t: 'say', who: 'genzo', text: '「灯会把所有属于她的记忆还给你，然后她就真的不在了。」' },
        { t: 'say', who: 'haruka', text: '「没有别的办法？」' },
        { t: 'say', text: '源藏沉默了一会儿。雨水顺着他的帽檐往下滴。' },
        { t: 'say', who: 'genzo', text: '「我守了三十年灯，只学会一件事：亮和灭，都是要付代价的。」' },
        { t: 'say', who: 'genzo', text: '「区别只是，代价由谁来付。」' }
      ],
      next: 'ch3_lighthouse'
    },

    ch3_why: {
      id: 'ch3_why', chapter: 3, title: '杂音中的过去',
      bg: 'attic', music: 'mystery',
      lines: [
        { t: 'say', who: 'genzo', text: '「因为我也怕。」' },
        { t: 'say', who: 'genzo', text: '「怕你想起她以后，会恨我。」' },
        { t: 'say', who: 'haruka', text: '「恨你什么？」' },
        { t: 'say', text: '他抬起头。那张布满皱纹的脸上，第一次露出一点近乎孩子气的无措。' },
        { t: 'say', who: 'genzo', text: '「那晚，是我把灯关掉的。」' },
        { t: 'say', who: 'genzo', text: '「她父亲还在塔上。我听见他在喊，可火已经烧到楼梯了。」' },
        { t: 'say', who: 'genzo', text: '「我关掉灯，才能让消防船靠近。」' },
        { t: 'say', text: '他说完，像是终于卸下了什么，又像是被什么压得更弯了。' }
      ],
      next: 'ch3_lighthouse'
    },

    ch3_lighthouse: {
      id: 'ch3_lighthouse', chapter: 3, title: '杂音中的过去',
      bg: 'lantern_room', music: 'akari', amb: 'rain',
      lines: [
        { t: 'say', text: '我推开灯室的门。她坐在透镜旁边，抱着膝盖，像一只躲雨的猫。' },
        { t: 'show', who: 'akari', expr: 'sad', pos: 'center' },
        { t: 'say', who: 'akari', text: '「你知道了。」' },
        { t: 'say', who: 'haruka', text: '「嗯。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「那你现在，是不是有点后悔回来？」' },
        { t: 'say', who: 'haruka', text: '「有一点。」' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「……真过分。」' },
        { t: 'say', who: 'haruka', text: '「后悔没有早点回来。」' },
        { t: 'say', text: '她愣住了。然后低下头，肩膀很轻地抖了一下。' },
        { t: 'say', who: 'akari', expr: 'cry', text: '「你以前，嘴没有这么甜的。」' },
        { t: 'say', who: 'haruka', text: '「以前的我，是什么样？」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「很笨。答应了别人的事，总是做不到。」' },
        { t: 'say', who: 'akari', text: '「可是……每次都会回来。」' },
        { t: 'say', text: '窗外的雨打在玻璃上。我第一次发现，她的脚边还是没有影子。' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「遥。明天，灯守祭。」' },
        { t: 'say', who: 'akari', text: '「如果灯亮了，我可能就不在了。」' },
        { t: 'say', who: 'haruka', text: '「……我知道。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「那就别哭丧着脸。明天，陪我去看烟花吧。」' }
      ],
      next: 'ch4_intro'
    },

    /* ==================== 第四章 ==================== */

    ch4_intro: {
      id: 'ch4_intro', chapter: 4, title: '灯守祭',
      bg: 'festival', music: 'festival', amb: 'sea',
      lines: [
        { t: 'say', text: '灯守祭的傍晚，整个汐见町都亮了起来。' },
        { t: 'say', text: '从神社到港口，几千盏纸灯沿着坡道排下去，像一条倒流的星河。' },
        { t: 'show', who: 'chinatsu', expr: 'smile', pos: 'left' },
        { t: 'say', who: 'chinatsu', text: '「发什么呆？帮我拿一下这箱苹果糖。」' },
        { t: 'say', text: '她把我拉到摊位前，塞给我一袋刚出锅的炸鸡。' },
        { t: 'say', who: 'chinatsu', expr: 'happy', text: '「今天别想那些有的没的。灯守祭是给活人过的。」' },
        { t: 'say', who: 'haruka', text: '「千夏。」' },
        { t: 'say', who: 'chinatsu', expr: 'normal', text: '「嗯？」' },
        { t: 'say', who: 'haruka', text: '「谢谢你。」' },
        { t: 'say', text: '她愣了一下，然后用力拍了一下我的背。' },
        { t: 'say', who: 'chinatsu', expr: 'smile', text: '「少来。吃完记得把箱子还我。」' },
        { t: 'hide', who: 'chinatsu' },
        { t: 'sfx', name: 'chime' },
        { t: 'say', text: '天色彻底暗下来时，人群忽然安静了一瞬。' },
        { t: 'say', text: '我回头。她站在灯下。' },
        { t: 'show', who: 'akari', expr: 'normal', pos: 'center' },
        { t: 'say', text: '还是那条白裙。可这一次，路过的人都在看她。' },
        { t: 'say', text: '卖苹果糖的婆婆叫她「小灯」，放灯的孩子拉着她的衣角。她笑着，一个一个回应。' },
        { t: 'say', inner: true, who: 'haruka', text: '原来她不是只属于我一个人的记忆。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「遥。今晚的灯，好看吗？」' },
        { t: 'say', who: 'haruka', text: '「好看。」' },
        { t: 'say', who: 'akari', text: '「比十年前的呢？」' },
        { t: 'say', who: 'haruka', text: '「……我没见过十年前的。」' },
        { t: 'say', who: 'akari', expr: 'sad', text: '「也是。」' },
        { t: 'choice', choices: [
          { text: '把贝壳风铃送给她。', effects: { bond: 1, flag: 'gave_chime' }, next: 'ch4_gift' },
          { text: '「今晚之后，你还会在吗？」', effects: { bond: 1, flag: 'asked_after' }, next: 'ch4_ask' },
          { text: '沉默地握住她的手。', effects: { bond: 1, flag: 'held_hand' }, next: 'ch4_hold' }
        ] }
      ]
    },

    ch4_gift: {
      id: 'ch4_gift', keepCast: true, chapter: 4, title: '灯守祭',
      bg: 'festival', music: 'festival',
      lines: [
        { t: 'say', text: '我从口袋里掏出那串贝壳风铃。贝壳碰在一起，发出很轻的响声。' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「……你还留着。」' },
        { t: 'say', who: 'haruka', text: '「在壁橱里找到的。应该是你送我的吧。」' },
        { t: 'say', who: 'akari', expr: 'cry', text: '「嗯。那年夏天，我在海边捡了很久的贝壳。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「有一枚怎么都穿不上孔。我急得哭了，你就把你的那枚换给我。」' },
        { t: 'say', text: '她伸手碰了碰风铃，指尖却从贝壳上穿了过去。' },
        { t: 'say', who: 'akari', text: '「……果然还是碰不到啊。」' }
      ],
      next: 'ch4_fireworks'
    },

    ch4_ask: {
      id: 'ch4_ask', keepCast: true, chapter: 4, title: '灯守祭',
      bg: 'festival', music: 'festival',
      lines: [
        { t: 'say', who: 'akari', expr: 'normal', text: '「不知道。」' },
        { t: 'say', who: 'akari', text: '「也许会在。也许不会。连我自己都说不准。」' },
        { t: 'say', who: 'haruka', text: '「那我怎么找你？」' },
        { t: 'say', text: '她想了想，抬手指向海面。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「灯亮着的地方，就是我。」' },
        { t: 'say', who: 'haruka', text: '「那我把灯一直开着。」' },
        { t: 'say', who: 'akari', expr: 'shy', text: '「……笨蛋。电费很贵的。」' }
      ],
      next: 'ch4_fireworks'
    },

    ch4_hold: {
      id: 'ch4_hold', keepCast: true, chapter: 4, title: '灯守祭',
      bg: 'festival', music: 'festival',
      lines: [
        { t: 'say', text: '我伸手握住她的手。' },
        { t: 'say', text: '她的手很凉，像刚从海水里捞出来。可她没有抽开。' },
        { t: 'say', who: 'akari', expr: 'shy', text: '「……你的手，好热。」' },
        { t: 'say', who: 'haruka', text: '「你的太凉了。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「那你多握一会儿。」' },
        { t: 'say', text: '人潮从我们身边挤过去。灯笼的光一摇一晃，把她的侧脸照得很亮。' }
      ],
      next: 'ch4_fireworks'
    },

    ch4_fireworks: {
      id: 'ch4_fireworks', keepCast: true, chapter: 4, title: '灯守祭',
      bg: 'festival', music: 'festival',
      lines: [
        { t: 'sfx', name: 'chime' },
        { t: 'say', text: '第一束烟花升起来，在海面上炸开。人群发出欢呼。' },
        { t: 'say', text: '她仰着头，眼睛里映着光。我忽然很怕这束光落下去。' },
        { t: 'say', who: 'akari', expr: 'happy', text: '「遥，你看！」' },
        { t: 'say', text: '第二束、第三束。整片海面都被照亮了。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「谢谢你回来。」' },
        { t: 'say', who: 'akari', text: '「不管今晚发生什么，我都很高兴。」' },
        { t: 'say', who: 'haruka', text: '「灯……」' },
        { t: 'say', text: '她转过头看我。烟花的光在她瞳孔里碎成很多片。' },
        { t: 'say', who: 'akari', expr: 'shy', text: '「嗯？」' },
        { t: 'say', inner: true, who: 'haruka', text: '我想说「别走」。可我知道，这句话太自私了。' },
        { t: 'sfx', name: 'thunder' },
        { t: 'say', text: '然后，风变了。' }
      ],
      next: 'ch4_storm'
    },

    ch4_storm: {
      id: 'ch4_storm', keepCast: true, chapter: 4, title: '灯守祭',
      bg: 'storm', music: 'mystery', amb: 'rain',
      lines: [
        { t: 'fx', name: 'shake' },
        { t: 'say', text: '云从海面压过来，快得不像夏天。灯笼一盏接一盏地灭。' },
        { t: 'say', text: '港口的广播响了。一艘渔船在湾口失去了动力，正在往礁石上漂。' },
        { t: 'say', text: '「白鹭灯塔，白鹭灯塔，这里是汐风丸，请求引导——」' },
        { t: 'say', text: '广播里的声音被杂音吞掉。' },
        { t: 'show', who: 'akari', expr: 'sad', pos: 'center' },
        { t: 'say', who: 'genzo', text: '「灯塔十年没亮，雷达也坏了。他们只能靠那束光。」' },
        { t: 'say', who: 'genzo', text: '「可是灯一亮，她就会走。」' },
        { t: 'say', text: '我转头看她。她站在雨里，白裙湿透了，脚边已经开始变得透明。' },
        { t: 'say', who: 'akari', expr: 'fade', text: '「没关系。」' },
        { t: 'say', who: 'akari', text: '「我等这一天，等了十年。」' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「遥，你决定吧。」' },
        { t: 'flag', key: 'finale' },
        { t: 'choice', choices: [
          {
            text: '点亮灯塔。让她归港。', next: 'ending_b_start',
            locked: () => s().bond < 7,
            lockText: '你还没有真正听懂她'
          },
          {
            text: '让灯塔继续沉睡。留住这个夏天。', next: 'ending_a_start'
          },
          {
            text: '回到十年前，改变那个夜晚。', next: 'ending_c_start',
            locked: () => !s().flags.radioDone || State.localFragCount() < 7,
            lockText: '还需要更多记忆'
          },
          {
            text: '把整座小镇的灯，一起点亮。', next: 'ending_true_start', true: true,
            locked: () => !State.isNGPlus() || !State.allKeyFrags() || s().bond < 9 || !s().flags.radioDone,
            lockText: '第二个夏天 · 集齐八段记忆 · 灯足够亮'
          }
        ] }
      ]
    },

    /* ==================== 结局 A ==================== */

    ending_a_start: {
      id: 'ending_a_start', chapter: 5, title: '长夜',
      bg: 'storm', music: 'farewell', amb: 'rain',
      lines: [
        { t: 'say', text: '我转过身，没有去碰那盏灯。' },
        { t: 'say', text: '身后的广播一遍一遍地喊，最后被雨声盖住。' },
        { t: 'say', who: 'akari', expr: 'sad', text: '「……嗯。我明白了。」' },
        { t: 'say', text: '她笑了一下，像十年前那个在电影院睡着的女孩。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「那就再等一等吧。反正我已经很会等了。」' },
        { t: 'say', text: '天亮时，风暴过去了。汐风丸被海保拖回了港，船上的人都没事。' },
        { t: 'say', text: '我坐上了第一班离岛的渡轮。灯塔在雾里，只有一个很淡的轮廓。' },
        { t: 'say', text: '后来我听说，那盏灯再也没有亮过。' },
        { t: 'say', text: '而我再也没有回过汐见町。' },
        { t: 'ending', id: 'A' }
      ]
    },

    /* ==================== 结局 B ==================== */

    ending_b_start: {
      id: 'ending_b_start', chapter: 5, title: '归港',
      bg: 'storm', music: 'farewell', amb: 'rain',
      lines: [
        { t: 'say', text: '我跑上灯塔。源藏已经在灯室里，手里握着那枚停摆的怀表。' },
        { t: 'say', who: 'genzo', text: '「想好了？」' },
        { t: 'say', who: 'haruka', text: '「嗯。」' },
        { t: 'say', text: '我转动了那枚生锈的把手。透镜开始转，先是很慢，然后越来越快。' },
        { t: 'fx', name: 'flash' },
        { t: 'say', text: '光从透镜里冲出去，切开雨幕，落在海面上。' },
        { t: 'say', text: '那一瞬间，我想起了所有事情。' },
        { t: 'say', text: '十年前，她把我推下灯塔的楼梯，自己留在了上面。她说：你还要回去弹钢琴。' },
        { t: 'say', text: '我忘记了。我把她一个人留在这里，忘了十年。' },
        { t: 'show', who: 'akari', expr: 'fade', pos: 'center' },
        { t: 'say', who: 'akari', text: '「遥。」' },
        { t: 'say', text: '她站在光里，身体一点一点变得透明。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「这次，换我走了。」' },
        { t: 'say', who: 'haruka', text: '「等等——」' },
        { t: 'say', who: 'akari', text: '「不要等。你要好好吃饭，好好弹琴，好好过每一个夏天。」' },
        { t: 'say', who: 'akari', expr: 'cry', text: '「还有，别再把我忘了。」' },
        { t: 'hide', who: 'akari' },
        { t: 'bg', name: 'dawn' },
        { t: 'say', text: '光散尽的时候，灯室里只剩下一枚温热的贝壳。' },
        { t: 'say', text: '汐风丸在黎明前回到了港口。那天之后，白鹭灯塔每晚都会亮。' },
        { t: 'say', text: '我没有卖掉外婆的房子。每年夏天，我都会回来住一阵子。' },
        { t: 'say', text: '有时候深夜醒来，我会听见风铃响。像有人从很远的地方，轻轻叫我的名字。' },
        { t: 'ending', id: 'B' }
      ]
    },

    /* ==================== 结局 C ==================== */

    ending_c_start: {
      id: 'ending_c_start', chapter: 5, title: '回航',
      bg: 'lantern_room', music: 'piano', amb: 'rain',
      lines: [
        { t: 'say', text: '我握住她的手。她的手已经没有温度了。' },
        { t: 'say', who: 'haruka', text: '「我不想再忘了你。」' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「遥……」' },
        { t: 'say', text: '我把她带到透镜前。源藏说过，那盏灯能照亮的不只是海面。' },
        { t: 'say', text: '我把手放在冰冷的玻璃上。透镜深处，有什么东西睁开了眼睛。' },
        { t: 'sfx', name: 'heartbeat' },
        { t: 'say', text: '光吞没了整座灯室。' },
        { t: 'fx', name: 'flash' },
        { t: 'say', text: '我回到了十年前的那个夜晚。' },
        { t: 'bg', name: 'storm' },
        { t: 'say', text: '雨很大。灯塔的楼梯上，九岁的我正被她推向下层。' },
        { t: 'say', text: '这一次，我没有松手。' },
        { t: 'say', text: '我抓住她的手腕，把她一起拖出了火场。' },
        { t: 'say', text: '身后，灯塔的玻璃炸开。整座塔在雨里烧成一束白色的火。' },
        { t: 'fx', name: 'flash' },
        { t: 'bg', name: 'dawn' },
        { t: 'say', text: '我醒来的时候，躺在一间不认识的房间里。窗外是海。' },
        { t: 'say', text: '母亲说，我小时候在汐见町住过，但从来没有去过灯塔。' },
        { t: 'say', text: '白鹭灯塔在十年前的那场风暴里烧毁了，后来重建。现在的守灯人，是一个姓汐崎的女人。' },
        { t: 'say', text: '有一年夏天，我回到汐见町。' },
        { t: 'say', text: '新的灯塔很白。我站在塔下，看见一个浅色长发的女孩从门里出来。' },
        { t: 'say', text: '她看见我，愣了一下，然后礼貌地笑了笑。' },
        { t: 'say', who: 'akari', expr: 'normal', text: '「你好。你是来参观的吗？」' },
        { t: 'say', text: '我说是。' },
        { t: 'say', text: '她带我上楼，给我讲灯塔的历史。她的声音很好听，像海风穿过空房间。' },
        { t: 'say', text: '走的时候，她叫住我。' },
        { t: 'say', who: 'akari', expr: 'distant', text: '「那个……我们以前见过吗？」' },
        { t: 'say', text: '我看着她，很久很久。' },
        { t: 'say', who: 'haruka', text: '「没有。」' },
        { t: 'say', who: 'haruka', text: '「但我想，我应该来过。」' },
        { t: 'ending', id: 'C' }
      ]
    },

    /* ==================== TRUE ==================== */

    ending_true_start: {
      id: 'ending_true_start', chapter: 5, title: '长明',
      bg: 'storm', music: 'true', amb: 'rain',
      lines: [
        { t: 'say', text: '我没有去碰灯塔的把手。我转身跑下了塔。' },
        { t: 'say', text: '我跑进雨里，跑向镇子。我敲开每一扇还亮着灯的门。' },
        { t: 'say', who: 'haruka', text: '「请把灯借给我。」' },
        { t: 'say', who: 'haruka', text: '「把你们记得的汐崎灯，借给我。」' },
        { t: 'say', text: '千夏第一个提着灯出来。然后是神社的宫司、卖苹果糖的婆婆、港口的渔夫。' },
        { t: 'say', text: '他们手里的灯一盏一盏亮起来，沿着坡道，像一条逆流的河。' },
        { t: 'say', text: '我们回到灯塔下。我把那八段记忆，一段一段说给他们听。' },
        { t: 'say', text: '千夏记得那两碗刨冰。宫司记得那块绘马。源藏记得她父亲的名字。' },
        { t: 'say', text: '海风把雨吹散了。整座小镇的灯，一起照向灯塔。' },
        { t: 'fx', name: 'flash' },
        { t: 'say', text: '灯亮了。不是用谁的记忆点燃的，是被所有人一起举起来的。' },
        { t: 'show', who: 'akari', expr: 'surprised', pos: 'center' },
        { t: 'say', text: '她在光里站了很久。然后，她低下头，看见自己的影子。' },
        { t: 'say', who: 'akari', expr: 'surprised', text: '「……我有影子了。」' },
        { t: 'say', text: '那天夜里，汐风丸靠着灯光回到了港口。船上的人说，他们看见灯塔上站着一个女孩，朝他们挥手。' },
        { t: 'bg', name: 'dawn' },
        { t: 'say', text: '天亮的时候，她没有消失。' },
        { t: 'say', text: '她站在灯塔门口，赤着脚，白裙上沾着泥，像一个刚刚走了很远的路才回家的人。' },
        { t: 'say', who: 'akari', expr: 'smile', text: '「遥。」' },
        { t: 'say', who: 'haruka', text: '「嗯。」' },
        { t: 'say', who: 'akari', expr: 'happy', text: '「早上好。」' },
        { t: 'say', text: '那年夏天，我没有卖外婆的房子。' },
        { t: 'say', text: '白鹭灯塔重新有了守灯人。镇上的人说，是一对很年轻的夫妻。' },
        { t: 'say', text: '每年灯守祭，我们都会把所有的灯点亮。' },
        { t: 'say', text: '因为灯不是一个人守的。' },
        { t: 'ending', id: 'TRUE' }
      ]
    }
  };

  /* =========================================================
     地点（地图用）
     ========================================================= */
  const LOCATIONS = {
    diner: {
      id: 'diner', name: '潮风食堂', sub: '刨冰与旧事', scene: 'loc_diner',
      x: 31, y: 63, desc: '千夏的店。靠窗的位置，永远留着两碗刨冰。'
    },
    shrine: {
      id: 'shrine', name: '白鹭神社', sub: '石阶与绘马', scene: 'loc_shrine',
      x: 66, y: 26, desc: '绣球花沿着石阶往下开。有一块绘马，挂了十年。'
    },
    breakwater: {
      id: 'breakwater', name: '旧防波堤', sub: '钓鱼的老人', scene: 'loc_breakwater',
      x: 76, y: 72, desc: '混凝土的尽头，海浪把时间磨得很慢。'
    },
    cinema: {
      id: 'cinema', name: '汐见电影院', sub: '雨天的旧胶片', scene: 'loc_cinema',
      x: 20, y: 33, desc: '四十个座位，一块银幕。放映机里还有那年的雨声。'
    }
  };

  global.Story = { scenes, LOCATIONS, START: 'prologue_ferry' };
})(window);
