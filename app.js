/* НЕОН-7 — урок информатики, 7 класс.
   Логические операции и таблицы истинности.
   Как добавить карточку в тренажёр: в tasks уровня положи
   { expr, a, b, expect, why }. expr должен понимать evalExpr.
   expect — верный бит, selfCheck сверит его с формулой.
   Дела не хранят готовую пару виновных: кнопка «Арестовать»
   включается сама, когда все улики становятся равны 1. */
(function () {
  'use strict';

  var STORAGE_KEY = 'neon7-lesson-v1';
  var state = null;
  var flipToken = 0;
  var audioCtx = null;
  var swipe = null;

  var FORMULA = {
    not: '¬A',
    notnot: '¬¬A',
    and: 'A ∧ B',
    or: 'A ∨ B',
    xor: 'A ⊕ B',
    impl: 'A → B',
    eq: 'A ↔ B',
    notA_or_B: '¬A ∨ B',
    nand: '¬(A ∧ B)',
    impl_notB: 'A → ¬B',
    eq_nots: '¬A ↔ ¬B',
    xor_notB: 'A ⊕ ¬B',
    or_and_notA: '(A ∨ B) ∧ ¬A',
    nor: '¬(A ∨ B)',
    notA_and_B: '¬A ∧ B',
    A: 'A',
    notA: '¬A',
    B: 'B',
    implBA: 'B → A',
    not_eq: '¬(A ↔ B)',
    impl_notA_B: '¬A → B'
  };

  function bit(value) {
    return value ? 1 : 0;
  }

  /* Единый калькулятор. Учебные карточки и улики считают результат здесь. */
  function evalExpr(expr, a, b) {
    var A = bit(a);
    var B = bit(b);
    switch (expr) {
      case 'not': return 1 - A;
      case 'notnot': return A;
      case 'and': return A & B;
      case 'or': return A | B;
      case 'xor': return A ^ B;
      case 'impl': return (A === 1 && B === 0) ? 0 : 1;
      case 'eq': return A === B ? 1 : 0;
      case 'notA_or_B': return (1 - A) | B;
      case 'nand': return 1 - (A & B);
      case 'impl_notB': return (A === 1 && B === 1) ? 0 : 1;
      case 'eq_nots': return (1 - A) === (1 - B) ? 1 : 0;
      case 'xor_notB': return A ^ (1 - B);
      case 'or_and_notA': return (A | B) & (1 - A);
      case 'nor': return 1 - (A | B);
      case 'notA_and_B': return (1 - A) & B;
      case 'A': return A;
      case 'notA': return 1 - A;
      case 'B': return B;
      case 'implBA': return (B === 1 && A === 0) ? 0 : 1;
      case 'not_eq': return A === B ? 0 : 1;
      case 'impl_notA_B': return (A === 0 && B === 0) ? 0 : 1;
      default: return null;
    }
  }

  function isUnary(expr) {
    return expr === 'not' || expr === 'notnot';
  }

  function pretty(expr, a, b) {
    var A = bit(a);
    var B = bit(b);
    var value = evalExpr(expr, a, b);
    var text = {
      not: '¬' + A,
      notnot: '¬¬' + A,
      and: A + ' ∧ ' + B,
      or: A + ' ∨ ' + B,
      xor: A + ' ⊕ ' + B,
      impl: A + ' → ' + B,
      eq: A + ' ↔ ' + B,
      notA_or_B: '¬' + A + ' ∨ ' + B,
      nand: '¬(' + A + ' ∧ ' + B + ')',
      impl_notB: A + ' → ¬' + B,
      eq_nots: '¬' + A + ' ↔ ¬' + B,
      xor_notB: A + ' ⊕ ¬' + B,
      or_and_notA: '(' + A + ' ∨ ' + B + ') ∧ ¬' + A,
      nor: '¬(' + A + ' ∨ ' + B + ')',
      notA_and_B: '¬' + A + ' ∧ ' + B
    }[expr];
    return (text || FORMULA[expr] || expr) + ' = ' + value;
  }

  function card(expr, a, b, expect, why, callout) {
    var item = { expr: expr, a: a, b: b, expect: expect, why: why };
    if (callout) item.callout = callout;
    return item;
  }

  var LEVELS = [
    {
      id: 'not',
      code: '01',
      name: 'НЕ',
      symbol: '¬A',
      minutes: 'около 3 мин',
      blurb: 'Сигнал наоборот',
      hint: 'НЕ переворачивает бит: 0 становится 1, а 1 становится 0.',
      tableExpr: 'not',
      unary: true,
      afterword: 'Двойное НЕ возвращает исходный бит: ¬¬A = A.',
      tasks: [
        card('not', 0, 0, 1, 'Инвертор переворачивает 0 в 1. ¬0 = 1.'),
        card('not', 1, 0, 0, 'Сигнал был 1, НЕ делает его 0. ¬1 = 0.'),
        card('notnot', 0, 0, 0, 'Первое НЕ: ¬0 = 1. Второе НЕ: ¬1 = 0. Двойное отрицание вернуло исходное значение.'),
        card('notnot', 1, 0, 1, '¬1 = 0, затем ¬0 = 1. Два раза перевернули — снова 1.')
      ]
    },
    {
      id: 'and',
      code: '02',
      name: 'И',
      symbol: 'A ∧ B',
      minutes: 'около 3 мин',
      blurb: 'Нужны оба ключа',
      hint: 'И равно 1, только если оба входа равны 1.',
      tableExpr: 'and',
      unary: false,
      afterword: 'Одного «да» мало. Ноль на любом входе гасит всю связку.',
      tasks: [
        card('and', 1, 1, 1, 'Оба входа 1. Для И этого достаточно: 1 ∧ 1 = 1.'),
        card('and', 1, 0, 0, 'Второго ключа нет. 1 ∧ 0 = 0.'),
        card('and', 0, 1, 0, 'Первый вход 0, значит вся связка 0. 0 ∧ 1 = 0.'),
        card('and', 0, 0, 0, 'Оба нули. 0 ∧ 0 = 0.')
      ]
    },
    {
      id: 'or',
      code: '03',
      name: 'ИЛИ',
      symbol: 'A ∨ B',
      minutes: 'около 3 мин',
      blurb: 'Хватает одного пропуска',
      hint: 'ИЛИ равно 0, только если оба входа равны 0.',
      tableExpr: 'or',
      unary: false,
      afterword: '1 ∨ 1 остаётся 1. ИЛИ не считает «сколько», ей важно «есть ли хоть один».',
      tasks: [
        card('or', 0, 0, 0, 'Единственный ложный случай ИЛИ: оба нули. 0 ∨ 0 = 0.'),
        card('or', 1, 0, 1, 'Хватило первого входа. 1 ∨ 0 = 1.'),
        card('or', 0, 1, 1, 'Хватило второго входа. 0 ∨ 1 = 1.'),
        card('or', 1, 1, 1, 'Оба 1, результат тоже 1. 1 ∨ 1 = 1.')
      ]
    },
    {
      id: 'xor',
      code: '04',
      name: 'XOR',
      symbol: 'A ⊕ B',
      minutes: 'около 4 мин',
      blurb: 'Ровно один',
      hint: 'XOR равно 1, только если биты разные.',
      tableExpr: 'xor',
      unary: false,
      afterword: 'Две единицы — это не «ровно одна». Поэтому 1 ⊕ 1 = 0.',
      tasks: [
        card('xor', 1, 0, 1, 'Биты разные, XOR истинен. 1 ⊕ 0 = 1.'),
        card('xor', 0, 0, 0, 'Биты одинаковые. 0 ⊕ 0 = 0.'),
        card('xor', 1, 1, 0, 'Две единицы — не «ровно одна». 1 ⊕ 1 = 0.'),
        card('xor', 0, 1, 1, 'Снова разные биты. 0 ⊕ 1 = 1.')
      ]
    },
    {
      id: 'impl',
      code: '05',
      name: 'Следование',
      symbol: 'A → B',
      minutes: 'около 6 мин',
      blurb: 'Если… то…',
      hint: 'A → B ложно только при 1 → 0.',
      tableExpr: 'impl',
      unary: false,
      key: true,
      afterword: 'Запомни на тетрадь: импликация равна 0 только когда A = 1 и B = 0. Во всех остальных строках она равна 1.',
      tasks: [
        card('impl', 1, 1, 1, 'Обещание выполнено: если 1, то 1. 1 → 1 = 1.', 'Ложь у следования только в одном случае: слева 1, справа 0. Сначала проверь обычные строки и поймай эту ловушку отдельно.'),
        card('impl', 0, 0, 1, 'Слева ложь. Импликация при этом не ломается: 0 → 0 = 1.'),
        card('impl', 0, 1, 1, 'Слева 0, справа 1. Из лжи может следовать что угодно: 0 → 1 = 1.'),
        card('impl', 1, 0, 0, 'Единственный ложный случай. Обещали 1, а получили 0. 1 → 0 = 0.'),
        card('impl', 1, 0, 0, 'Повтори ловушку. A = 1 и B = 0: следование ложно. В остальных строках оно истинно.')
      ]
    },
    {
      id: 'eq',
      code: '06',
      name: 'Эквивалентность',
      symbol: 'A ↔ B',
      minutes: 'около 3 мин',
      blurb: 'Значения совпали',
      hint: 'Эквивалентность равна 1, если оба значения одинаковые.',
      tableExpr: 'eq',
      unary: false,
      afterword: 'Это XOR наоборот: XOR любит разницу, эквивалентность любит совпадение.',
      tasks: [
        card('eq', 1, 1, 1, 'Оба равны 1. 1 ↔ 1 = 1.'),
        card('eq', 0, 0, 1, 'Оба равны 0. Совпали, значит 0 ↔ 0 = 1.'),
        card('eq', 1, 0, 0, 'Значения разные. 1 ↔ 0 = 0.'),
        card('eq', 0, 1, 0, 'И здесь не совпали. 0 ↔ 1 = 0.')
      ]
    },
    {
      id: 'mix',
      code: '07',
      name: 'Составные',
      symbol: 'шаги',
      minutes: 'около 6 мин',
      blurb: 'Скобки, потом НЕ',
      hint: 'Сначала скобки и НЕ, потом операция между частями.',
      tableExpr: '',
      unary: false,
      afterword: 'Порядок на сегодня: скобки, затем НЕ, затем связка между частями.',
      tasks: [
        card('notA_or_B', 1, 0, 0, 'Шаг 1: ¬A = ¬1 = 0. Шаг 2: 0 ∨ 0 = 0. Ни одной единицы в ИЛИ нет.'),
        card('nand', 0, 1, 1, 'Сначала скобки: 0 ∧ 1 = 0. Потом НЕ: ¬0 = 1.'),
        card('impl_notB', 1, 1, 0, '¬B = ¬1 = 0. Дальше импликация 1 → 0. Это запретный случай, результат 0.'),
        card('eq_nots', 0, 0, 1, '¬A = 1 и ¬B = 1. Одинаковые значения, эквивалентность равна 1.'),
        card('xor_notB', 1, 0, 0, '¬B = ¬0 = 1. Сравниваем 1 ⊕ 1. Биты одинаковые, XOR = 0.'),
        card('or_and_notA', 0, 1, 1, 'В скобках 0 ∨ 1 = 1. ¬A = ¬0 = 1. Затем И: 1 ∧ 1 = 1.')
      ]
    },
    {
      id: 'exam',
      code: '08',
      name: 'Зачёт',
      symbol: 'без подсказок',
      minutes: 'около 7 мин',
      blurb: 'Смешанные строки',
      hint: '',
      hideHint: true,
      tableExpr: '',
      unary: false,
      afterword: '',
      tasks: [
        card('or', 1, 0, 1, '1 ∨ 0 = 1. Для ИЛИ достаточно одной единицы.'),
        card('and', 0, 0, 0, '0 ∧ 0 = 0. И не спасает ни один ноль.'),
        card('xor', 1, 1, 0, '1 ⊕ 1 = 0. XOR истинен только на разных битах.'),
        card('impl', 1, 0, 0, '1 → 0 = 0. Единственная ложная строка импликации.'),
        card('impl', 0, 1, 1, '0 → 1 = 1. Слева ложь, импликация остаётся истинной.'),
        card('eq', 0, 0, 1, '0 ↔ 0 = 1. Значения совпали.'),
        card('nor', 1, 1, 0, 'Сначала 1 ∨ 1 = 1. Отрицание: ¬1 = 0.'),
        card('notA_and_B', 0, 1, 1, '¬A = ¬0 = 1. Затем 1 ∧ 1 = 1.')
      ]
    }
  ];

  var OPS = [
    {
      id: 'not',
      name: 'НЕ',
      aka: 'отрицание',
      symbol: '¬A',
      unary: true,
      expr: 'not',
      metaphor: 'Инвертор на проводе: что пришло, то выходит наоборот.',
      rule: 'Меняет 0 на 1 и 1 на 0.',
      trap: 'Повторное НЕ не «выключает навсегда». ¬¬A снова равно A.'
    },
    {
      id: 'and',
      name: 'И',
      aka: 'конъюнкция',
      symbol: 'A ∧ B',
      unary: false,
      expr: 'and',
      metaphor: 'Дверь с двумя ключами. Откроется, только если вставлены оба.',
      rule: 'Результат 1, только когда оба высказывания равны 1.',
      trap: 'Одной единицы мало. 1 ∧ 0 = 0.'
    },
    {
      id: 'or',
      name: 'ИЛИ',
      aka: 'дизъюнкция',
      symbol: 'A ∨ B',
      unary: false,
      expr: 'or',
      metaphor: 'Хватает одного пропуска. Закрыто лишь когда нет ни одного.',
      rule: 'Результат 0, только когда оба высказывания равны 0.',
      trap: '1 ∨ 1 — это всё ещё 1, не 2.'
    },
    {
      id: 'xor',
      name: 'XOR',
      aka: 'исключающее ИЛИ',
      symbol: 'A ⊕ B',
      unary: false,
      expr: 'xor',
      metaphor: 'В комнате должен быть ровно один агент. Двое или никого — сигнал 0.',
      rule: 'Результат 1, когда значения разные.',
      trap: 'Две единицы дают 0: «оба сразу» не считается.'
    },
    {
      id: 'impl',
      name: 'Следование',
      aka: 'импликация',
      symbol: 'A → B',
      unary: false,
      expr: 'impl',
      metaphor: 'Правило «если тревога, то сирена». Оно сломано только если тревога есть, а сирены нет. Нет тревоги — правило молчит и считается истинным.',
      rule: 'Ложно только в случае 1 → 0.',
      trap: 'Если слева 0, результат 1 — даже когда справа тоже 0.'
    },
    {
      id: 'eq',
      name: 'Эквивалентность',
      aka: 'равносильность',
      symbol: 'A ↔ B',
      unary: false,
      expr: 'eq',
      metaphor: 'Два датчика должны показывать одно и то же: оба 1 или оба 0.',
      rule: 'Результат 1, когда значения совпали.',
      trap: 'Это не XOR. XOR истинен на разнице, эквивалентность — на совпадении.'
    }
  ];

  var CASES = [
    {
      id: 'c1',
      code: 'Дело 01',
      title: 'Кто стёр базу?',
      bonus: false,
      lead: 'Ночью с сервера НЕОН-7 исчезли оценки. В серверную могли войти только Алиса и Боб. Поставь каждому статус: 1 — виновен, 0 — невиновен.',
      closing: 'Смотри, какие улики ломают остальные три строки. Это и есть таблица истинности дела.',
      clues: [
        { expr: 'or', text: 'В серверной был хотя бы один из них.' },
        { expr: 'nand', text: 'Двойного входа нет: они не виновны вдвоём.' },
        { expr: 'implBA', text: 'Если Боб виновен, то Алиса тоже была в этом замешана.' },
        { expr: 'A', text: 'На клавиатуре свежий отпечаток Алисы.' }
      ]
    },
    {
      id: 'c2',
      code: 'Дело 02',
      title: 'Кто выключил камеры?',
      bonus: true,
      lead: 'Камеры погасли позже. Это отдельное дело: не переноси ответ из первой истории. Формулы другие, и виновным может оказаться другой человек.',
      closing: 'Сравни с первым делом. Те же двое, другие улики — и вывод тоже другой.',
      clues: [
        { expr: 'xor', text: 'Рубильник камер нажал ровно один человек.' },
        { expr: 'notA', text: 'Алиса в это время писала в чат класса — у щитка её не было.' },
        { expr: 'impl_notA_B', text: 'Если Алиса невиновна, виновен Боб.' },
        { expr: 'not_eq', text: 'Их показания не совпали.' }
      ]
    }
  ];

  var NAV = [
    { id: 'base', label: 'База' },
    { id: 'train', label: 'Шлюзы' },
    { id: 'case', label: 'Дело' },
    { id: 'final', label: 'Итог' }
  ];

  function satisfying(item) {
    var found = [];
    var a;
    var b;
    for (a = 0; a <= 1; a += 1) {
      for (b = 0; b <= 1; b += 1) {
        var ok = item.clues.every(function (clue) {
          return evalExpr(clue.expr, a, b) === 1;
        });
        if (ok) found.push([a, b]);
      }
    }
    return found;
  }

  function selfCheck() {
    var problems = [];
    var known = {};
    Object.keys(FORMULA).forEach(function (key) { known[key] = true; });
    LEVELS.forEach(function (level) {
      if (!level.tasks.length) problems.push(level.id + ' empty');
      level.tasks.forEach(function (task, index) {
        var got = evalExpr(task.expr, task.a, task.b);
        if (got !== task.expect) problems.push(level.id + '#' + index + ' got ' + got + ' expect ' + task.expect);
        if (!known[task.expr]) problems.push('formula ' + task.expr);
        if (!task.why) problems.push('why ' + level.id + index);
      });
    });
    CASES.forEach(function (item) {
      var found = satisfying(item);
      if (found.length !== 1) problems.push(item.id + ' models ' + found.length + ' ' + JSON.stringify(found));
      item.clues.forEach(function (clue) {
        if (!known[clue.expr]) problems.push('clue formula ' + clue.expr);
        if (evalExpr(clue.expr, 0, 0) === null) problems.push('eval ' + clue.expr);
      });
    });
    OPS.forEach(function (op) {
      if (evalExpr(op.expr, 0, 1) === null) problems.push('op ' + op.id);
    });
    return problems;
  }

  function blank() {
    return {
      name: '',
      xp: 0,
      awarded: {},
      levels: {},
      solved: {},
      solvedCombo: {},
      homeworkCopied: false,
      handbook: false,
      sound: false,
      screen: 'boot',
      tab: 'base',
      openAcc: '',
      play: { a: 0, b: 1 },
      run: null,
      caseId: null,
      bits: { c1: { a: 0, b: 0 }, c2: { a: 0, b: 0 } },
      renaming: false,
      armExit: false,
      hint: false,
      caseGain: 0,
      copyNote: '',
      problemCount: 0
    };
  }

  function plainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function loadPersisted() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!plainObject(data)) return;
      if (typeof data.name === 'string') state.name = data.name.replace(/\s+/g, ' ').trim().slice(0, 16);
      if (typeof data.xp === 'number' && isFinite(data.xp) && data.xp >= 0) state.xp = Math.floor(data.xp);
      if (plainObject(data.awarded)) state.awarded = data.awarded;
      if (plainObject(data.levels)) state.levels = data.levels;
      if (plainObject(data.solved)) state.solved = data.solved;
      if (plainObject(data.solvedCombo)) state.solvedCombo = data.solvedCombo;
      state.homeworkCopied = !!data.homeworkCopied;
      state.handbook = !!data.handbook;
      state.sound = !!data.sound;
    } catch (err) {
      /* Битая запись не должна срывать урок. */
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: state.name,
        xp: state.xp,
        awarded: state.awarded,
        levels: state.levels,
        solved: state.solved,
        solvedCombo: state.solvedCombo,
        homeworkCopied: state.homeworkCopied,
        handbook: state.handbook,
        sound: !!state.sound
      }));
    } catch (err) {
      /* В приватном режиме браузер может запретить запись. */
    }
  }

  function stampSession() {
    try {
      if (!sessionStorage.getItem('neon7-t0')) sessionStorage.setItem('neon7-t0', String(Date.now()));
    } catch (err) {}
  }

  function sessionMinutes() {
    try {
      var t0 = Number(sessionStorage.getItem('neon7-t0'));
      if (!t0) return -1;
      var mins = Math.round((Date.now() - t0) / 60000);
      if (!isFinite(mins) || mins < 0 || mins > 180) return -1;
      return mins;
    } catch (err) {
      return -1;
    }
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function levelById(id) {
    for (var i = 0; i < LEVELS.length; i += 1) {
      if (LEVELS[i].id === id) return LEVELS[i];
    }
    return null;
  }

  function caseById(id) {
    for (var i = 0; i < CASES.length; i += 1) {
      if (CASES[i].id === id) return CASES[i];
    }
    return null;
  }

  function taskKey(level, index) {
    return level.id + '-' + index;
  }

  function award(id, points) {
    if (state.awarded[id]) return 0;
    state.awarded[id] = points;
    state.xp += points;
    return points;
  }

  function starsFor(correct, total) {
    if (!total) return 0;
    var ratio = correct / total;
    if (ratio === 1) return 3;
    if (ratio >= 0.75) return 2;
    if (ratio >= 0.5) return 1;
    return 0;
  }

  function starsLabel(n) {
    var safe = Math.max(0, Math.min(3, n || 0));
    return '★'.repeat(safe) + '☆'.repeat(3 - safe);
  }

  function needCount(total) {
    return Math.ceil(total * 0.75);
  }

  function doneCount() {
    return LEVELS.filter(function (level) {
      return state.levels[level.id] && state.levels[level.id].done;
    }).length;
  }

  function recommendedId() {
    for (var i = 0; i < LEVELS.length; i += 1) {
      var pack = state.levels[LEVELS[i].id];
      if (!pack || !pack.done) return LEVELS[i].id;
    }
    return '';
  }

  function nextLevel(id) {
    var index = -1;
    var i;
    for (i = 0; i < LEVELS.length; i += 1) {
      if (LEVELS[i].id === id) index = i;
    }
    if (index < 0 || index === LEVELS.length - 1) return null;
    return LEVELS[index + 1];
  }

  function accuracy() {
    var correct = 0;
    var total = 0;
    LEVELS.forEach(function (level) {
      var pack = state.levels[level.id];
      if (!pack || !pack.done) return;
      correct += Number(pack.best) || 0;
      total += Number(pack.total) || level.tasks.length;
    });
    if (!total) return null;
    return Math.round(100 * correct / total);
  }

  function caseSolvedCount() {
    return (state.solved.c1 ? 1 : 0) + (state.solved.c2 ? 1 : 0);
  }

  function rankInfo() {
    var gates = doneCount();
    var exam = state.levels.exam;
    var caseOk = !!state.solved.c1;
    var examGood = !!(exam && exam.passed);
    if (gates >= 6 && examGood && caseOk) {
      return {
        title: 'Кибер-детектив',
        text: 'Шлюзы, зачёт и дело закрыты. Сервер НЕОН-7 снова узнаёт своих.',
        top: true
      };
    }
    if (caseOk && gates >= 4) {
      return {
        title: 'Аналитик НЕОН',
        text: 'Дело раскрыто. Если осталось время — добей зачёт хотя бы до двух звёзд и открой бонусное дело.',
        top: false
      };
    }
    if (caseOk) {
      return {
        title: 'Оператор шлюза',
        text: 'Дело уже закрыто. Дальше добери шлюзы: особенно следование и зачёт.',
        top: false
      };
    }
    if (gates >= 3) {
      return {
        title: 'Оператор шлюза',
        text: 'Шлюзы слушаются. Дальше — следование, если его ещё нет, и само дело.',
        top: false
      };
    }
    return {
      title: 'Кадет терминала',
      text: 'Система пустила тебя внутрь. Дальше протокол, шлюзы и дело.',
      top: false
    };
  }

  function haptic(pattern) {
    try {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
    } catch (err) {
      /* iPhone не умеет vibrate. На Android отдача сработает. */
    }
  }

  function beep(freq, dur, delay) {
    if (!state || !state.sound) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var start = audioCtx.currentTime + (delay || 0);
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playOk() {
    beep(740, 0.08, 0);
    beep(1180, 0.12, 0.09);
  }

  function playBad() {
    beep(180, 0.16, 0);
  }

  function tableRows(expr, unary) {
    var rows = [];
    if (unary) {
      [0, 1].forEach(function (a) {
        rows.push({ a: a, b: null, v: evalExpr(expr, a, 0) });
      });
    } else {
      [0, 1].forEach(function (a) {
        [0, 1].forEach(function (b) {
          rows.push({ a: a, b: b, v: evalExpr(expr, a, b) });
        });
      });
    }
    return rows;
  }

  function homeworkText() {
    return [
      '=== НЕОН-7 // ДОМАШНИЙ КАНАЛ ===',
      'Статус: РАСШИФРОВАНО',
      'Агент: ' + state.name,
      '',
      'Задание в тетрадь. Сдать к следующему уроку.',
      '',
      '1. Построй таблицу истинности для (A ∨ B) → ¬A.',
      '   Все 4 строки. Столбцы: A, B, A ∨ B, ¬A, ответ.',
      '',
      '2. Построй таблицу истинности для ¬A ⊕ B.',
      '',
      '3. Детектив. A — Алиса, B — Боб. 1 = виновен, 0 = невиновен.',
      '   Все улики истинны:',
      '   • A ∨ B = 1',
      '   • A → B = 1',
      '   • ¬(A ∧ B) = 1',
      '   Найди единственную пару и напиши, кто виновен.',
      '',
      '4. Придумай две свои формулы, которые вместе истинны',
      '   ТОЛЬКО при A = 0 и B = 1. Проверь остальные три строки',
      '   и покажи, какая улика в них ломается.',
      '',
      'Памятка: импликация ложна только при 1 → 0.'
    ].join('\n');
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    area.remove();
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }, function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function icon(name) {
    var paths = {
      base: '<path d="M5 5h14v14H5z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
      train: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>',
      case: '<circle cx="10" cy="10" r="5"/><path d="M14 14l5 5"/>',
      final: '<path d="M7 3h10v4H7z"/><path d="M6 7h12v13H6z"/><path d="M9 12h6"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }

  function fileBanner() {
    if (location.protocol !== 'file:') return '';
    return '<p class="file-banner">Страница открыта как файл. Для класса нужна ссылка учителя: тогда псевдоним сохранится, а урок можно поставить на экран «Домой».</p>';
  }

  function problemBanner() {
    if (!state.problemCount) return '';
    return '<p class="file-banner">В формулах урока сбой. Скажи учителю и не закрывай это окно.</p>';
  }

  function headerHtml() {
    var soundLabel = state.sound ? 'Бип' : 'Тихо';
    return '<header class="topbar"><div><p class="brand-kicker">NEON-7</p><p class="agent-name">' + esc(state.name) + '</p></div><div class="top-side"><div class="xp-pill">' + state.xp + ' XP</div><button type="button" class="sound-btn" data-action="sound" aria-pressed="' + (state.sound ? 'true' : 'false') + '" aria-label="' + (state.sound ? 'Выключить звук' : 'Включить звук') + '">' + soundLabel + '</button></div></header>';
  }

  function navHtml() {
    var buttons = NAV.map(function (item) {
      var on = state.tab === item.id;
      return '<button type="button" class="nav-btn' + (on ? ' is-active' : '') + '" data-action="tab" data-tab="' + item.id + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(item.id) + '<span>' + item.label + '</span></button>';
    }).join('');
    return '<nav class="bottom-nav" aria-label="Разделы урока">' + buttons + '</nav>';
  }

  function bitSeg(action, who, current, caseId) {
    var extra = caseId ? ' data-case="' + caseId + '"' : '';
    function btn(val, label, cls) {
      var on = current === val;
      return '<button type="button" class="' + (on ? 'is-on ' + cls : '') + '" data-action="' + action + '" data-who="' + who + '" data-val="' + val + '"' + extra + ' aria-pressed="' + (on ? 'true' : 'false') + '">' + label + '</button>';
    }
    var zeroLabel = action === 'set-bit' ? 'Невиновен · 0' : (who.toUpperCase() + ' = 0');
    var oneLabel = action === 'set-bit' ? 'Виновен · 1' : (who.toUpperCase() + ' = 1');
    var zeroCls = action === 'set-bit' ? 'innocent' : 'plain';
    var oneCls = action === 'set-bit' ? 'guilty' : 'plain';
    return '<div class="seg no-swipe">' + btn(0, zeroLabel, zeroCls) + btn(1, oneLabel, oneCls) + '</div>';
  }

  function playBlock(op) {
    var a = state.play.a ? 1 : 0;
    var b = state.play.b ? 1 : 0;
    var value = evalExpr(op.expr, a, b);
    var rows = tableRows(op.expr, op.unary).map(function (row) {
      var current = op.unary ? row.a === a : (row.a === a && row.b === b);
      var trap = op.id === 'impl' && row.a === 1 && row.b === 0;
      var left = op.unary ? ('A = ' + row.a) : ('A = ' + row.a + ', B = ' + row.b);
      return '<div class="mini-row' + (current ? ' is-current' : '') + '"><span>' + left + (trap ? ' · единственная ложь' : '') + '</span><strong class="' + (row.v ? 'ok-text' : 'bad-text') + '">' + row.v + '</strong></div>';
    }).join('');
    var bControl = op.unary ? '' : '<div><p class="note">Вход B</p>' + bitSeg('set-play', 'b', b) + '</div>';
    return '<div class="stack"><p class="note">Вход A</p>' + bitSeg('set-play', 'a', a) + bControl +
      '<div class="play-result"><span>Результат ' + esc(op.symbol) + '</span><strong class="' + (value ? 'ok-text' : 'bad-text') + '">' + value + '</strong><span>' + (value ? 'истина' : 'ложь') + '</span></div>' +
      rows + '<p class="note">Входы A и B общие для всех операций. Открой соседнюю карточку — комбинация та же, результат другой.</p></div>';
  }

  function handbookHtml() {
    return OPS.map(function (op) {
      var open = state.openAcc === op.id;
      var body = open
        ? '<div class="card"><p class="lead">' + esc(op.metaphor) + '</p><p class="lead"><strong>' + esc(op.rule) + '</strong></p><p class="callout">' + esc(op.trap) + '</p>' + playBlock(op) + '</div>'
        : '';
      return '<section class="acc"><button type="button" class="acc-head" data-action="acc" data-id="' + op.id + '" aria-expanded="' + (open ? 'true' : 'false') + '"><span><span class="acc-title">' + esc(op.name) + '</span><span class="symbol">' + esc(op.symbol) + ' · ' + esc(op.aka) + '</span></span><span class="chev" aria-hidden="true">' + (open ? '−' : '+') + '</span></button>' + body + '</section>';
    }).join('');
  }

  function checklistHtml() {
    var gates = doneCount();
    var items = [
      { tab: 'base', title: 'Протокол операций', status: state.handbook ? 'открыт' : 'раскрой карточку', ok: state.handbook },
      { tab: 'train', title: 'Шлюзы', status: gates + ' / ' + LEVELS.length, ok: gates >= 6 },
      { tab: 'case', title: 'Дело о базе', status: state.solved.c1 ? 'раскрыто' : 'ждёт', ok: !!state.solved.c1 },
      { tab: 'final', title: 'Домашний канал', status: state.homeworkCopied ? 'скопирован' : 'забрать в конце', ok: state.homeworkCopied }
    ];
    return items.map(function (item) {
      return '<button type="button" class="check-item" data-action="tab" data-tab="' + item.tab + '"><span>' + item.title + '</span><span class="mark' + (item.ok ? '' : ' wait') + '">' + esc(item.status) + '</span></button>';
    }).join('');
  }

  function baseHtml() {
    var mins = sessionMinutes();
    var clock = mins >= 1 ? '<p class="note">В эфире: ' + mins + ' мин</p>' : '';
    return '<div class="stack-lg">' + fileBanner() + problemBanner() +
      '<div><p class="kicker">Операция</p><h1>Сервер НЕОН-7</h1><p class="lead">Школьный сервер хранит оценки. Ночью базу стёрли, и система заперла двери логическими замками. Вспомни операции, прогони строки таблиц истинности и по уликам вычисли, кто это сделал.</p><p class="note">Ориентир на 45 минут: протокол около 8 минут, шлюзы около 25, дело около 10, в конце забери домашнее задание.</p>' + clock + '</div>' +
      '<section class="card"><h2>План</h2>' + checklistHtml() + '</section>' +
      '<div><h2>Протокол</h2><p class="lead">Нажми операцию, подвигай A и B и смотри подсвеченную строку. Это та же таблица истинности, только карточками.</p><div class="card">' + handbookHtml() + '</div></div>' +
      '<p class="note">Разделы внизу. По пустому месту можно листать влево и вправо.</p>' +
      '<p class="note">Телефон умеет открыть урок как приложение: меню браузера → «На экран Домой» или «Установить». Для урока хватит и обычной вкладки.</p>' +
      '<button type="button" class="ghost-btn" data-action="rename">Сменить позывной</button></div>';
  }

  function levelButton(level) {
    var pack = state.levels[level.id];
    var cls = 'choice-card' + (level.id === recommendedId() ? ' is-next' : '');
    var badge = level.key ? '<span class="badge">ключевой</span>' : '';
    var status = 'не пройден';
    var statusClass = 'note';
    if (pack && pack.done) {
      status = starsLabel(pack.stars) + ' · ' + pack.best + '/' + pack.total;
      if (level.id === 'exam') status += pack.passed ? ' · сдан' : ' · не сдан';
      statusClass = 'stars';
    }
    return '<button type="button" class="' + cls + '" data-action="open-level" data-id="' + level.id + '"><span class="choice-top"><strong>' + level.code + '  ' + esc(level.name) + '</strong>' + badge + '</span><span class="symbol">' + esc(level.symbol) + '</span><span class="note">' + esc(level.blurb) + ' · ' + esc(level.minutes) + '</span><span class="' + statusClass + '">' + esc(status) + '</span></button>';
  }

  function trainListHtml() {
    var done = doneCount();
    var width = Math.round(100 * done / LEVELS.length);
    return '<div class="stack-lg"><div><p class="kicker">Тренажёр</p><h1>Шлюзы</h1><p class="lead">Каждая строка таблицы — отдельная карта. Жми 0 или 1. Карточка перевернётся и объяснит, почему так.</p><p class="note">Иди по порядку. Если читать пояснения, шлюзы занимают около 25 минут. Самое важное место урока — следование.</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + LEVELS.length + '" aria-valuenow="' + done + '"><span style="width:' + width + '%"></span></div><p class="note">Пройдено ' + done + ' из ' + LEVELS.length + '</p></div><div class="stack">' + LEVELS.map(levelButton).join('') + '</div></div>';
  }

  function dotsHtml(index, total) {
    var html = '<div class="dots" aria-hidden="true">';
    var i;
    for (i = 0; i < total; i += 1) {
      var cls = i < index ? 'is-done' : (i === index ? 'is-on' : '');
      html += '<i class="' + cls + '"></i>';
    }
    return html + '</div>';
  }

  function bitsHtml(task) {
    var html = '<div class="bits"><div class="bit ' + (task.a ? 'is-one' : 'is-zero') + '"><span>A</span><strong>' + bit(task.a) + '</strong></div>';
    if (!isUnary(task.expr)) {
      html += '<div class="bit ' + (task.b ? 'is-one' : 'is-zero') + '"><span>B</span><strong>' + bit(task.b) + '</strong></div>';
    }
    return html + '</div>';
  }

  function exitButton() {
    var label = state.armExit ? 'Точно выйти? XP за верные карты уже сохранён' : 'К списку шлюзов';
    return '<button type="button" class="ghost-btn" data-action="exit-run">' + label + '</button>';
  }

  function answerButtons() {
    return '<div class="answer-row no-swipe"><button type="button" class="answer-btn zero" data-action="pick" data-val="0"><span class="big">0</span><span class="cap">ложь</span></button><button type="button" class="answer-btn one" data-action="pick" data-val="1"><span class="big">1</span><span class="cap">истина</span></button></div>';
  }

  function askCard(level, locked) {
    var task = level.tasks[state.run.index];
    var extra = task.callout
      ? '<p class="callout">' + esc(task.callout) + '</p>'
      : (!level.hideHint && level.hint ? '<p class="lead">' + esc(level.hint) + '</p>' : '');
    var examNote = level.hideHint && state.run.index === 0
      ? '<p class="note">Зачёт без подсказки на карте. Нужно минимум ' + needCount(level.tasks.length) + ' из ' + level.tasks.length + '.</p>'
      : '';
    var streak = state.run.streak >= 2 ? '<p class="kicker">Серия ' + state.run.streak + '</p>' : '';
    var controls = locked ? '<p class="lead">Сверяю ответ…</p>' : answerButtons();
    return '<div class="shake-wrap"><article class="card flip-card"><p class="kicker">' + esc(level.code) + ' · ' + esc(level.name) + ' · ' + (state.run.index + 1) + ' / ' + level.tasks.length + '</p>' + streak + dotsHtml(state.run.index, level.tasks.length) + examNote + bitsHtml(task) + '<p class="formula">' + esc(FORMULA[task.expr]) + '</p>' + extra + controls + exitButton() + '</article></div>';
  }

  function resultCard(level) {
    var task = level.tasks[state.run.index];
    var right = evalExpr(task.expr, task.a, task.b);
    var ok = state.run.pick === right;
    var last = state.run.index === level.tasks.length - 1;
    var bonus = ok && state.run.streak > 0 && state.run.streak % 3 === 0 ? '<p class="kicker">Серия ' + state.run.streak + ' · бонус</p>' : '';
    var gain = state.run.gained ? '<p class="note">+' + state.run.gained + ' XP</p>' : '';
    return '<article class="card flip-card is-in ' + (ok ? 'is-green' : 'is-pink') + '"><p class="verdict-word ' + (ok ? 'ok-text' : 'bad-text') + '">' + (ok ? 'ВЕРНО' : 'НЕВЕРНО') + '</p>' + bonus + '<p class="lead">Ты выбрал ' + state.run.pick + '. Верно: ' + right + '.</p><p class="formula">' + esc(pretty(task.expr, task.a, task.b)) + '</p><p class="lead">' + esc(task.why) + '</p>' + gain + '<button type="button" class="primary-btn" data-action="next-card">' + (last ? 'К разбору шлюза' : 'Следующая карта') + '</button>' + exitButton() + '</article>';
  }

  function canonicalTable(level) {
    if (!level.tableExpr) return '';
    var rows = tableRows(level.tableExpr, level.unary).map(function (row) {
      var left = level.unary ? ('A = ' + row.a) : ('A = ' + row.a + ', B = ' + row.b);
      return '<div class="mini-row"><span>' + left + '</span><strong class="' + (row.v ? 'ok-text' : 'bad-text') + '">' + row.v + '</strong></div>';
    }).join('');
    return '<section class="card"><h2>Вся таблица</h2><p class="note">' + esc(FORMULA[level.tableExpr]) + ' — строки подряд, как в тетради.</p>' + rows + '</section>';
  }

  function missesHtml(level) {
    if (!state.run.misses.length) {
      return '<section class="card is-green"><h2>Без ошибок</h2><p class="lead">Правило на этом шлюзе держится.</p></section>';
    }
    var cards = state.run.misses.map(function (miss) {
      var task = level.tasks[miss.index];
      var right = evalExpr(task.expr, task.a, task.b);
      return '<article class="card is-pink"><h2>' + esc(FORMULA[task.expr]) + '</h2><p class="note">A = ' + bit(task.a) + (isUnary(task.expr) ? '' : ', B = ' + bit(task.b)) + '. Ты выбрал ' + miss.pick + ', верно ' + right + '.</p><p class="lead">' + esc(task.why) + '</p></article>';
    }).join('');
    return '<div class="stack"><h2>Где сбилось</h2>' + cards + '</div>';
  }

  function summaryHtml(level) {
    var total = level.tasks.length;
    var correct = state.run.correct;
    var attemptStars = starsFor(correct, total);
    var best = state.levels[level.id];
    var bestLine = best && best.best !== correct
      ? '<p class="note">Лучшая попытка: ' + best.best + ' из ' + total + ' · ' + starsLabel(best.stars) + '</p>'
      : '';
    var after = level.afterword ? '<section class="card is-cyan"><p class="lead">' + esc(level.afterword) + '</p></section>' : '';
    var exam = state.levels.exam;
    var examFailed = level.id === 'exam' && !(exam && exam.passed);
    var next = nextLevel(level.id);
    var primary;
    if (examFailed) {
      primary = '<button type="button" class="primary-btn" data-action="open-level" data-id="exam">Пересдать зачёт</button><button type="button" class="ghost-btn" data-action="tab" data-tab="case">Перейти к делу</button>';
    } else if (next) {
      primary = '<button type="button" class="primary-btn" data-action="open-level" data-id="' + next.id + '">Дальше: ' + esc(next.name) + '</button>';
    } else {
      primary = '<button type="button" class="primary-btn" data-action="tab" data-tab="case">К делу</button>';
    }
    var replay = examFailed ? '' : '<button type="button" class="ghost-btn" data-action="open-level" data-id="' + level.id + '">Ещё раз этот шлюз</button>';
    return '<div class="stack-lg"><div><p class="kicker">' + esc(level.name) + '</p><h1>' + starsLabel(attemptStars) + '</h1><p class="lead">' + correct + ' из ' + total + '. ' + attemptMessage(level, correct, total) + '</p>' + bestLine + '</div>' + after + missesHtml(level) + canonicalTable(level) + primary + replay + '<button type="button" class="ghost-btn" data-action="close-run">К списку шлюзов</button></div>';
  }

  function attemptMessage(level, correct, total) {
    var need = needCount(total);
    if (level.id === 'exam') {
      if (correct >= need) return 'Зачёт сдан. Дальше — дело и домашнее задание.';
      return 'Зачёт пока не сдан: нужно минимум ' + need + ' из ' + total + '. Разбор ниже, пересдача сразу.';
    }
    if (correct === total) return 'Шлюз открыт без единой ошибки.';
    if (correct >= need) return 'Шлюз открыт. Ниже — строки, где правило сбилось.';
    return 'Шлюз засчитан, но правило ещё плавает. Ниже разбор, потом лучше ещё одна попытка.';
  }

  function trainHtml() {
    if (!state.run) return trainListHtml();
    var level = levelById(state.run.levelId);
    if (!level) {
      state.run = null;
      return trainListHtml();
    }
    if (state.run.phase === 'summary') return summaryHtml(level);
    if (state.run.phase === 'result' && state.run.flipped) return resultCard(level);
    return askCard(level, state.run.phase !== 'ask');
  }

  function describe(a, b) {
    return (a ? 'Алиса виновна' : 'Алиса невиновна') + ', ' + (b ? 'Боб виновен' : 'Боб невиновен');
  }

  function sameCombo(id) {
    var saved = state.solvedCombo[id];
    var now = state.bits[id];
    if (!saved || !now) return false;
    return bit(saved.a) === bit(now.a) && bit(saved.b) === bit(now.b);
  }

  function allGreen(item) {
    var now = state.bits[item.id];
    return item.clues.every(function (clue) {
      return evalExpr(clue.expr, now.a, now.b) === 1;
    });
  }

  function caseListHtml() {
    var cards = CASES.map(function (item) {
      var locked = item.id === 'c2' && !state.solved.c1;
      var solved = !!state.solved[item.id];
      var badge = item.bonus ? '<span class="badge">бонус</span>' : '';
      var status = solved ? '<span class="stars">раскрыто</span>' : '<span class="note">4 улики</span>';
      var inner = '<span class="choice-top"><strong>' + esc(item.code) + '</strong>' + badge + '</span><span class="acc-title">' + esc(item.title) + '</span><span class="note">' + esc(item.lead) + '</span>' + status;
      if (locked) {
        return '<div class="choice-card">' + inner + '<span class="note">Откроется, когда закроешь дело 1. Если время вышло — бонус можно не брать.</span></div>';
      }
      return '<button type="button" class="choice-card' + (solved ? ' is-next' : '') + '" data-action="open-case" data-id="' + item.id + '">' + inner + '</button>';
    }).join('');
    return '<div class="stack-lg"><div><p class="kicker">Кибер-детектив</p><h1>Дела</h1><p class="lead">Два подозреваемых, четыре комбинации — как четыре строки таблицы. Крути статусы, пока все улики не станут зелёными.</p><p class="note">Дело 1 — обязательная часть урока, около 8–10 минут. Дело 2 — если класс закончил раньше.</p></div>' + cards + '</div>';
  }

  function verdictHtml(item) {
    if (!state.solved[item.id] || !sameCombo(item.id)) return '';
    var saved = state.solvedCombo[item.id];
    var lines = [[0, 0], [0, 1], [1, 0], [1, 1]].filter(function (pair) {
      return pair[0] !== bit(saved.a) || pair[1] !== bit(saved.b);
    }).map(function (pair) {
      var failed = [];
      item.clues.forEach(function (clue, index) {
        if (evalExpr(clue.expr, pair[0], pair[1]) === 0) failed.push('улика ' + (index + 1) + ' (' + FORMULA[clue.expr] + ')');
      });
      return '<p class="note">' + esc(describe(pair[0], pair[1])) + ': ломается ' + esc(failed.join(', ')) + '.</p>';
    }).join('');
    var gain = state.caseGain ? '<p class="kicker">+' + state.caseGain + ' XP</p>' : '';
    return '<section class="card is-green">' + gain + '<p class="kicker">Дело закрыто</p><h2>' + esc(describe(saved.a, saved.b)) + '</h2><p class="lead">' + esc(item.closing) + '</p>' + lines + '</section>';
  }

  function cluesHtml(item) {
    var now = state.bits[item.id];
    return item.clues.map(function (clue, index) {
      var value = evalExpr(clue.expr, now.a, now.b);
      var good = value === 1;
      return '<article class="card ' + (good ? 'is-green' : 'is-pink') + '"><div class="clue-top"><span class="kicker">Улика ' + (index + 1) + '</span><strong class="' + (good ? 'ok-text' : 'bad-text') + '">' + (good ? 'сошлась · 1' : 'не сходится · 0') + '</strong></div><p class="lead">' + esc(clue.text) + '</p><p class="clue-formula">' + esc(FORMULA[clue.expr]) + '</p></article>';
    }).join('');
  }

  function casePlayHtml(item) {
    var now = state.bits[item.id];
    var okCount = item.clues.filter(function (clue) {
      return evalExpr(clue.expr, now.a, now.b) === 1;
    }).length;
    var solved = !!state.solved[item.id];
    var ready = okCount === item.clues.length;
    var enabled = ready && !solved;
    var buttonLabel = solved && ready ? 'Уже в деле' : 'Арестовать';
    var hint = state.hint
      ? '<p class="lead">Зелёная улика значит: формула сейчас равна 1. Красная — равна 0, эта пара не подходит. Пар всего четыре. Когда все улики зелёные, кнопка «Арестовать» загорится. Ответ вслух она не говорит — его собираешь ты.</p>'
      : '';
    var restore = solved && !sameCombo(item.id)
      ? '<button type="button" class="ghost-btn" data-action="restore-case" data-id="' + item.id + '">Вернуть версию, которая закрыла дело</button>'
      : '';
    return '<div class="stack-lg"><button type="button" class="ghost-btn" data-action="close-case">Все дела</button><div><p class="kicker">' + esc(item.code) + '</p><h1>' + esc(item.title) + '</h1><p class="lead">' + esc(item.lead) + '</p><p class="note">Вариантов четыре — как строк в таблице на два высказывания.</p></div>' +
      (solved ? '<p class="kicker">Дело уже закрыто</p>' : '') +
      verdictHtml(item) +
      '<section class="card"><div class="suspect-top"><h2>Алиса</h2><span class="symbol">A</span></div>' + bitSeg('set-bit', 'a', bit(now.a), item.id) + '</section>' +
      '<section class="card"><div class="suspect-top"><h2>Боб</h2><span class="symbol">B</span></div>' + bitSeg('set-bit', 'b', bit(now.b), item.id) + '</section>' +
      '<p class="lead" aria-live="polite">Сошлось ' + okCount + ' из ' + item.clues.length + '</p>' +
      '<p class="note">Красная улика = сейчас 0. Зелёная = сейчас 1.</p>' +
      '<button type="button" class="ghost-btn" data-action="hint">' + (state.hint ? 'Скрыть подсказку' : 'Как читать улики') + '</button>' + hint +
      cluesHtml(item) +
      '<p class="note">' + (ready ? 'Все улики сошлись. Можно брать.' : 'Кнопка включится, когда все улики станут зелёными.') + '</p>' +
      '<button type="button" class="primary-btn' + (enabled ? ' ready' : '') + '" data-action="arrest" data-id="' + item.id + '"' + (enabled ? '' : ' disabled') + '>' + buttonLabel + '</button>' +
      restore + '</div>';
  }

  function caseHtml() {
    if (!state.caseId) return caseListHtml();
    var item = caseById(state.caseId);
    if (!item) {
      state.caseId = null;
      return caseListHtml();
    }
    if (item.id === 'c2' && !state.solved.c1) {
      state.caseId = null;
      return caseListHtml();
    }
    return casePlayHtml(item);
  }

  function finalHtml() {
    var rank = rankInfo();
    var mins = sessionMinutes();
    var clock = mins >= 1 ? '<p class="note">В эфире: ' + mins + ' мин</p>' : '';
    var acc = accuracy();
    var accText = acc === null ? '—' : (acc + '%');
    var confetti = rank.top ? '<div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' : '';
    var levels = LEVELS.map(function (level) {
      var pack = state.levels[level.id];
      var status = pack && pack.done ? (starsLabel(pack.stars) + ' · ' + pack.best + '/' + pack.total) : 'не пройден';
      return '<button type="button" class="choice-card" data-action="open-level" data-id="' + level.id + '"><span class="choice-top"><strong>' + esc(level.name) + '</strong><span class="stars">' + esc(status) + '</span></span></button>';
    }).join('');
    return '<div class="stack-lg finale">' + confetti +
      '<div><p class="kicker">Канал открыт</p><h1>Готово, ' + esc(state.name) + '</h1><p class="lead">' + esc(rank.text) + '</p>' + clock + '</div>' +
      '<section class="card is-cyan"><p class="kicker">Звание</p><h2>' + esc(rank.title) + '</h2></section>' +
      '<div class="stat-grid"><section class="card"><span>Опыт</span><strong>' + state.xp + '</strong></section><section class="card"><span>Точность</span><strong>' + accText + '</strong></section><section class="card"><span>Шлюзы</span><strong>' + doneCount() + '/' + LEVELS.length + '</strong></section><section class="card"><span>Дела</span><strong>' + caseSolvedCount() + '/2</strong></section></div>' +
      '<section class="card is-green"><p class="kicker">Домашний канал</p><h2>Сообщение расшифровано</h2><p class="lead">Задание уже можно забрать, даже если не все шлюзы зелёные. Скопируй его в чат класса или в заметку.</p><pre class="hw">' + esc(homeworkText()) + '</pre><button type="button" class="primary-btn" data-action="copy-hw">Скопировать задание</button>' + (state.copyNote ? '<p class="note">' + esc(state.copyNote) + '</p>' : '') + '</section>' +
      '<div class="stack"><h2>Журнал шлюзов</h2>' + levels + '</div>' +
      '<button type="button" class="ghost-btn" data-action="rename">Сменить позывной</button>' +
      '<button type="button" class="ghost-btn" data-action="reset">Сбросить прогресс на этом телефоне</button></div>';
  }

  function bootHtml() {
    return '<section id="main" class="boot">' + fileBanner() + problemBanner() + '<div><p class="kicker">Информатика · 7 класс</p><h1 class="logo">NEON-7</h1><p class="lead">Практическая работа: логические операции и таблицы истинности.</p></div><ul class="boot-log"><li>&gt; канал защищён</li><li>&gt; протокол: логика</li><li>&gt; шлюзы ждут агента</li><li>&gt; допуск: псевдоним</li></ul><button type="button" class="primary-btn" data-action="to-login">Войти в систему</button></section>';
  }

  function loginHtml() {
    var back = state.renaming ? '<button type="button" class="ghost-btn" data-action="cancel-rename">Назад к уроку</button>' : '';
    var title = state.renaming ? 'Новый позывной' : 'Допуск агента';
    var submit = state.renaming ? 'Сохранить позывной' : 'Взломать систему';
    var value = state.renaming ? esc(state.name) : '';
    return '<section id="main" class="boot is-login"><p class="logo">NEON-7</p><h1>' + title + '</h1><p class="lead">Впиши хакерский псевдоним. Система будет звать тебя так до конца урока, имя останется в этом телефоне.</p><form class="card stack" data-action="login-form"><label for="nick">Хакерский псевдоним</label><input id="nick" name="nick" type="text" maxlength="16" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Например: Pixel" value="' + value + '" required><p class="form-error" id="login-error"></p><button class="primary-btn" type="submit">' + submit + '</button></form>' + back + '</section>';
  }

  function tabHtml() {
    if (state.tab === 'train') return trainHtml();
    if (state.tab === 'case') return caseHtml();
    if (state.tab === 'final') return finalHtml();
    return baseHtml();
  }

  function shell() {
    if (state.screen === 'boot') return bootHtml();
    if (state.screen === 'login') return loginHtml();
    return headerHtml() + '<main id="main" class="app-main">' + tabHtml() + '</main>' + navHtml();
  }

  function render(options) {
    var opts = options || {};
    var prev = document.getElementById('main');
    var y = opts.scroll === 'keep' && prev ? prev.scrollTop : 0;
    document.getElementById('app').innerHTML = shell();
    var main = document.getElementById('main');
    if (main && opts.scroll === 'keep') main.scrollTop = y;
  }

  function cleanName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 16);
  }

  function validName(name) {
    return name.length >= 2 && /[0-9A-Za-zА-Яа-яЁё]/.test(name);
  }

  function submitLogin() {
    var input = document.getElementById('nick');
    var name = cleanName(input ? input.value : '');
    var error = document.getElementById('login-error');
    if (!validName(name)) {
      if (error) error.textContent = 'Нужно от 2 до 16 символов и хотя бы одна буква или цифра.';
      if (input) input.focus();
      return;
    }
    state.name = name;
    state.renaming = false;
    state.screen = 'app';
    if (!state.tab) state.tab = 'base';
    stampSession();
    save();
    render();
  }

  function openLevel(id) {
    var level = levelById(id);
    if (!level) return;
    flipToken += 1;
    state.tab = 'train';
    state.caseId = null;
    state.armExit = false;
    state.run = {
      levelId: id,
      index: 0,
      phase: 'ask',
      pick: null,
      correct: 0,
      misses: [],
      streak: 0,
      flipped: false,
      recorded: false,
      gained: 0
    };
    render();
  }

  function recordRun() {
    if (!state.run || state.run.recorded) return;
    state.run.recorded = true;
    var level = levelById(state.run.levelId);
    var total = level.tasks.length;
    var correct = state.run.correct;
    var stars = starsFor(correct, total);
    var passed = correct >= needCount(total);
    var prev = state.levels[level.id] || null;
    var keepPrev = prev && (prev.stars > stars || (prev.stars === stars && prev.best > correct));
    if (keepPrev) {
      state.levels[level.id] = {
        stars: prev.stars,
        best: prev.best,
        total: total,
        done: true,
        passed: !!(prev.passed || passed)
      };
    } else {
      state.levels[level.id] = {
        stars: stars,
        best: correct,
        total: total,
        done: true,
        passed: passed || !!(prev && prev.passed)
      };
    }
    save();
  }

  function nextCard() {
    if (!state.run) return;
    var level = levelById(state.run.levelId);
    state.armExit = false;
    if (state.run.index + 1 >= level.tasks.length) {
      state.run.phase = 'summary';
      state.run.flipped = false;
      recordRun();
      render();
      return;
    }
    state.run.index += 1;
    state.run.phase = 'ask';
    state.run.pick = null;
    state.run.flipped = false;
    state.run.gained = 0;
    render();
  }

  function onPick(val) {
    if (!state.run || state.run.phase !== 'ask') return;
    var level = levelById(state.run.levelId);
    var task = level.tasks[state.run.index];
    var right = evalExpr(task.expr, task.a, task.b);
    var chosen = Number(val) ? 1 : 0;
    var ok = chosen === right;
    state.run.phase = 'result';
    state.run.pick = chosen;
    state.run.flipped = false;
    state.armExit = false;
    if (ok) {
      state.run.correct += 1;
      state.run.streak += 1;
      var gained = award(taskKey(level, state.run.index), 10);
      if (state.run.streak % 3 === 0) gained += award('bonus-' + taskKey(level, state.run.index), 5);
      state.run.gained = gained;
      if (gained) save();
      haptic(50);
      playOk();
    } else {
      state.run.streak = 0;
      state.run.gained = 0;
      state.run.misses.push({ index: state.run.index, pick: chosen });
      playBad();
    }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var token = ++flipToken;
    var wrap = document.querySelector('.shake-wrap');
    if (!ok && wrap && !reduce) wrap.classList.add('shake');
    window.setTimeout(function () {
      if (token !== flipToken || !state.run || state.run.phase !== 'result') return;
      var node = document.querySelector('.flip-card');
      if (!node || reduce) {
        state.run.flipped = true;
        render();
        return;
      }
      node.classList.add('is-out');
      window.setTimeout(function () {
        if (token !== flipToken || !state.run || state.run.phase !== 'result') return;
        state.run.flipped = true;
        render();
      }, 240);
    }, reduce ? 0 : (ok ? 40 : 430));
  }

  function openCase(id) {
    if (id === 'c2' && !state.solved.c1) return;
    var item = caseById(id);
    if (!item) return;
    state.caseId = id;
    state.tab = 'case';
    state.caseGain = 0;
    var saved = state.solvedCombo[id];
    if (saved) state.bits[id] = { a: bit(saved.a), b: bit(saved.b) };
    else state.bits[id] = { a: 0, b: 0 };
    render();
  }

  function setBit(caseId, who, val) {
    if (!state.bits[caseId] || (who !== 'a' && who !== 'b')) return;
    var item = caseById(caseId);
    if (!item) return;
    var before = allGreen(item);
    state.bits[caseId][who] = val ? 1 : 0;
    var after = allGreen(item);
    if (!before && after && !state.solved[caseId]) haptic([30, 40, 30]);
    render({ scroll: 'keep' });
  }

  function arrest(id) {
    var item = caseById(id);
    if (!item || !allGreen(item) || state.solved[id]) return;
    var now = state.bits[id];
    state.solved[id] = true;
    state.solvedCombo[id] = { a: bit(now.a), b: bit(now.b) };
    state.caseGain = award('case-' + id, 50);
    save();
    haptic([40, 50, 40]);
    playOk();
    render();
  }

  function restoreCase(id) {
    var saved = state.solvedCombo[id];
    if (!saved || !state.bits[id]) return;
    state.bits[id] = { a: bit(saved.a), b: bit(saved.b) };
    render();
  }

  function onCopy() {
    copyText(homeworkText()).then(function (ok) {
      if (ok) {
        state.homeworkCopied = true;
        state.copyNote = 'Скопировано. Можно вставить в чат класса или в заметку.';
        save();
        haptic(40);
      } else {
        state.copyNote = 'Само не скопировалось. Зажми текст пальцем и скопируй вручную.';
      }
      render({ scroll: 'keep' });
    });
  }

  function resetAll() {
    if (!window.confirm('Стереть псевдоним и весь прогресс на этом телефоне?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
    try { sessionStorage.removeItem('neon7-t0'); } catch (err) {}
    flipToken += 1;
    var problems = state.problemCount;
    state = blank();
    state.problemCount = problems;
    render();
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }

  function onClick(event) {
    var node = event.target.closest('[data-action]');
    if (!node) return;
    var action = node.getAttribute('data-action');
    if (action === 'to-login') {
      state.screen = 'login';
      render();
      return;
    }
    if (action === 'cancel-rename') {
      state.renaming = false;
      state.screen = 'app';
      render();
      return;
    }
    if (action === 'sound') {
      state.sound = !state.sound;
      save();
      if (state.sound) playOk();
      render({ scroll: 'keep' });
      return;
    }
    if (action === 'tab') {
      state.tab = node.getAttribute('data-tab') || 'base';
      state.armExit = false;
      render();
      return;
    }
    if (action === 'acc') {
      var acc = node.getAttribute('data-id');
      state.openAcc = state.openAcc === acc ? '' : acc;
      state.handbook = true;
      save();
      render({ scroll: 'keep' });
      return;
    }
    if (action === 'set-play') {
      var who = node.getAttribute('data-who');
      if (who !== 'a' && who !== 'b') return;
      state.play[who] = Number(node.getAttribute('data-val')) ? 1 : 0;
      state.handbook = true;
      save();
      render({ scroll: 'keep' });
      return;
    }
    if (action === 'open-level') {
      openLevel(node.getAttribute('data-id'));
      return;
    }
    if (action === 'pick') {
      onPick(node.getAttribute('data-val'));
      return;
    }
    if (action === 'next-card') {
      nextCard();
      return;
    }
    if (action === 'exit-run') {
      if (!state.armExit) {
        state.armExit = true;
        render({ scroll: 'keep' });
        return;
      }
      flipToken += 1;
      state.run = null;
      state.armExit = false;
      render();
      return;
    }
    if (action === 'close-run') {
      flipToken += 1;
      state.run = null;
      state.armExit = false;
      render();
      return;
    }
    if (action === 'open-case') {
      openCase(node.getAttribute('data-id'));
      return;
    }
    if (action === 'close-case') {
      state.caseId = null;
      render();
      return;
    }
    if (action === 'set-bit') {
      setBit(node.getAttribute('data-case'), node.getAttribute('data-who'), Number(node.getAttribute('data-val')));
      return;
    }
    if (action === 'hint') {
      state.hint = !state.hint;
      render({ scroll: 'keep' });
      return;
    }
    if (action === 'arrest') {
      arrest(node.getAttribute('data-id'));
      return;
    }
    if (action === 'restore-case') {
      restoreCase(node.getAttribute('data-id'));
      return;
    }
    if (action === 'copy-hw') {
      onCopy();
      return;
    }
    if (action === 'rename') {
      state.renaming = true;
      state.screen = 'login';
      render();
      return;
    }
    if (action === 'reset') resetAll();
  }

  function onSubmit(event) {
    var form = event.target;
    if (!form || form.getAttribute('data-action') !== 'login-form') return;
    event.preventDefault();
    submitLogin();
  }

  function onDown(event) {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    var button = event.target.closest('button');
    if (!button || button.disabled) return;
    button.classList.add('is-down');
  }

  function onUp() {
    var app = document.getElementById('app');
    if (!app) return;
    var pressed = app.querySelectorAll('.is-down');
    var i;
    for (i = 0; i < pressed.length; i += 1) pressed[i].classList.remove('is-down');
  }

  function onTouchStart(event) {
    if (event.target.closest('button, a, input, textarea, .no-swipe')) {
      swipe = null;
      return;
    }
    var touch = event.changedTouches[0];
    swipe = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event) {
    if (!swipe) return;
    var touch = event.changedTouches[0];
    var dx = touch.clientX - swipe.x;
    var dy = touch.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy)) return;
    moveTab(dx < 0 ? 1 : -1);
  }

  function moveTab(step) {
    if (!state || state.screen !== 'app') return;
    if (state.caseId) return;
    if (state.run && state.run.phase !== 'summary') return;
    var ids = ['base', 'train', 'case', 'final'];
    var index = ids.indexOf(state.tab);
    var next = index + step;
    if (next < 0 || next >= ids.length) return;
    state.tab = ids[next];
    state.armExit = false;
    render();
  }

  function onKey(event) {
    if (!state || state.screen !== 'app') return;
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (!state.run || state.run.phase !== 'ask' || state.tab !== 'train') return;
    if (event.key === '0' || event.key === '1') {
      event.preventDefault();
      onPick(Number(event.key));
    }
  }

  function init() {
    if (new URLSearchParams(location.search).has('demo')) document.body.classList.add('demo');
    state = blank();
    loadPersisted();
    state.problemCount = selfCheck().length;
    if (state.name) {
      state.screen = 'app';
      stampSession();
    }
    var app = document.getElementById('app');
    app.addEventListener('click', onClick);
    app.addEventListener('submit', onSubmit);
    app.addEventListener('pointerdown', onDown);
    app.addEventListener('pointerup', onUp);
    app.addEventListener('pointercancel', onUp);
    app.addEventListener('touchstart', onTouchStart, { passive: true });
    app.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('keydown', onKey);
    render();
    registerSW();
  }

  if (typeof window !== 'undefined') {
    init();
  } else if (typeof module !== 'undefined' && require.main === module) {
    var problems = selfCheck();
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    var cards = 0;
    LEVELS.forEach(function (level) { cards += level.tasks.length; });
    console.log('selfCheck ok, cards ' + cards);
  }
})();
