// База продуктов — значения на 100 грамм
// { calories, protein, fat, carbs }

export const FOODS_DB = [
  // ── КУРИЦА ─────────────────────────────
  { name: "Куриная грудка (варёная)", calories: 165, protein: 31.0, fat: 3.6, carbs: 0 },
  { name: "Куриная грудка (жареная)", calories: 197, protein: 30.0, fat: 8.0, carbs: 0 },
  { name: "Куриная грудка (запечённая)", calories: 175, protein: 32.0, fat: 4.5, carbs: 0 },
  { name: "Куриное бедро (варёное)", calories: 215, protein: 26.0, fat: 12.0, carbs: 0 },
  { name: "Куриное бедро (жареное)", calories: 247, protein: 25.0, fat: 16.0, carbs: 0 },
  { name: "Куриные голени (варёные)", calories: 191, protein: 27.0, fat: 9.0, carbs: 0 },
  { name: "Куриные крылья (запечённые)", calories: 290, protein: 27.0, fat: 19.0, carbs: 0 },
  { name: "Куриный фарш (жареный)", calories: 161, protein: 17.0, fat: 10.0, carbs: 0 },
  { name: "Куриный фарш (сырой)", calories: 143, protein: 17.0, fat: 8.0, carbs: 0 },
  { name: "Куриная печень (варёная)", calories: 140, protein: 20.0, fat: 5.5, carbs: 1.0 },

  // ── ИНДЕЙКА ───────────────────────────
  { name: "Индейка филе (варёное)", calories: 189, protein: 29.0, fat: 7.0, carbs: 0 },
  { name: "Индейка филе (запечённое)", calories: 195, protein: 30.0, fat: 7.5, carbs: 0 },
  { name: "Индейка бедро (варёное)", calories: 208, protein: 27.0, fat: 11.0, carbs: 0 },
  { name: "Индюшиный фарш (сырой)", calories: 149, protein: 17.0, fat: 8.5, carbs: 0 },
  { name: "Индюшиный фарш (жареный)", calories: 176, protein: 20.0, fat: 10.0, carbs: 0 },
  { name: "Индейка грудка (жареная)", calories: 210, protein: 32.0, fat: 9.0, carbs: 0 },

  // ── ГОВЯДИНА ──────────────────────────
  { name: "Говядина (варёная)", calories: 254, protein: 27.0, fat: 16.0, carbs: 0 },
  { name: "Говядина (жареная)", calories: 271, protein: 26.0, fat: 18.0, carbs: 0 },
  { name: "Говяжий фарш 20% (сырой)", calories: 254, protein: 17.0, fat: 20.0, carbs: 0 },
  { name: "Говяжий фарш 20% (жареный)", calories: 272, protein: 21.0, fat: 21.0, carbs: 0 },
  { name: "Говяжий фарш 10% (сырой)", calories: 174, protein: 20.0, fat: 10.0, carbs: 0 },
  { name: "Говяжий фарш 10% (жареный)", calories: 197, protein: 24.0, fat: 11.0, carbs: 0 },
  { name: "Говяжья вырезка (варёная)", calories: 217, protein: 29.0, fat: 11.0, carbs: 0 },
  { name: "Говяжья печень (варёная)", calories: 135, protein: 20.7, fat: 3.9, carbs: 3.9 },
  { name: "Телятина (варёная)", calories: 197, protein: 30.0, fat: 8.0, carbs: 0 },

  // ── СВИНИНА ───────────────────────────
  { name: "Свинина (варёная)", calories: 297, protein: 25.0, fat: 21.0, carbs: 0 },
  { name: "Свиная вырезка (варёная)", calories: 143, protein: 22.0, fat: 5.5, carbs: 0 },
  { name: "Свиная шея (жареная)", calories: 342, protein: 22.0, fat: 28.0, carbs: 0 },
  { name: "Свиной фарш (сырой)", calories: 263, protein: 16.0, fat: 22.0, carbs: 0 },
  { name: "Свиной фарш (жареный)", calories: 297, protein: 19.0, fat: 24.0, carbs: 0 },
  { name: "Свиная котлета (жареная)", calories: 305, protein: 20.0, fat: 25.0, carbs: 2.0 },
  { name: "Бекон (жареный)", calories: 541, protein: 37.0, fat: 42.0, carbs: 1.4 },
  { name: "Ветчина варёная", calories: 113, protein: 16.0, fat: 4.3, carbs: 2.0 },

  { name: "Лосось (запечённый)", calories: 206, protein: 20.0, fat: 13.0, carbs: 0 },
  { name: "Лосось (жареный)", calories: 233, protein: 22.0, fat: 15.0, carbs: 0 },
  { name: "Сёмга (слабосолёная)", calories: 202, protein: 22.0, fat: 12.0, carbs: 0 },

  { name: "Тунец (в собственном соку)", calories: 99, protein: 23.0, fat: 0.5, carbs: 0 },
  { name: "Тунец (в масле)", calories: 198, protein: 22.0, fat: 12.0, carbs: 0 },

  { name: "Треска (варёная)", calories: 90, protein: 20.0, fat: 0.7, carbs: 0 },
  { name: "Треска (запечённая)", calories: 105, protein: 23.0, fat: 0.9, carbs: 0 },

  { name: "Тилапия (запечённая)", calories: 128, protein: 26.0, fat: 2.7, carbs: 0 },
  { name: "Минтай (варёный)", calories: 79, protein: 17.0, fat: 0.9, carbs: 0 },
  { name: "Скумбрия (варёная)", calories: 205, protein: 19.0, fat: 14.0, carbs: 0 },
  { name: "Скумбрия (копчёная)", calories: 221, protein: 20.0, fat: 15.0, carbs: 0 },

  { name: "Сельдь (солёная)", calories: 217, protein: 18.0, fat: 16.0, carbs: 0 },
  { name: "Сардины (в масле)", calories: 208, protein: 24.6, fat: 11.4, carbs: 0 },

  { name: "Форель (запечённая)", calories: 190, protein: 26.0, fat: 9.0, carbs: 0 },
  { name: "Карп (варёный)", calories: 127, protein: 18.0, fat: 5.3, carbs: 0 },
  { name: "Судак (варёный)", calories: 97, protein: 21.0, fat: 1.1, carbs: 0 },
  { name: "Хек (варёный)", calories: 86, protein: 18.5, fat: 0.8, carbs: 0 },

  // ── МОРЕПРОДУКТЫ ─────────────────────
  { name: "Креветки (варёные)", calories: 99, protein: 20.0, fat: 1.7, carbs: 0.9 },
  { name: "Кальмар (варёный)", calories: 92, protein: 15.0, fat: 1.4, carbs: 3.1 },
  { name: "Мидии (варёные)", calories: 86, protein: 11.9, fat: 2.2, carbs: 3.7 },
  { name: "Осьминог (варёный)", calories: 82, protein: 14.9, fat: 1.0, carbs: 2.2 },

  { name: "Яйцо куриное (варёное)", calories: 155, protein: 13.0, fat: 11.0, carbs: 1.1 },
  { name: "Яйцо куриное (жареное)", calories: 196, protein: 14.0, fat: 15.0, carbs: 0.4 },
  { name: "Яичный белок", calories: 52, protein: 11.0, fat: 0.2, carbs: 0.7 },

  { name: "Творог 0%", calories: 69, protein: 18.0, fat: 0.2, carbs: 1.8 },
  { name: "Творог 5%", calories: 121, protein: 17.0, fat: 5.0, carbs: 1.8 },
  { name: "Творог 9%", calories: 158, protein: 16.0, fat: 9.0, carbs: 2.0 },

  { name: "Молоко 1.5%", calories: 44, protein: 3.0, fat: 1.5, carbs: 5.0 },
  { name: "Молоко 2.5%", calories: 52, protein: 2.9, fat: 2.5, carbs: 4.8 },

  { name: "Кефир 1%", calories: 40, protein: 3.0, fat: 1.0, carbs: 4.0 },

  { name: "Йогурт греческий 0%", calories: 59, protein: 10.0, fat: 0.4, carbs: 3.6 },
  { name: "Йогурт греческий 2%", calories: 73, protein: 9.0, fat: 2.0, carbs: 3.6 },

  { name: "Сметана 10%", calories: 116, protein: 3.0, fat: 10.0, carbs: 4.0 },

  { name: "Сыр Гауда", calories: 356, protein: 25.0, fat: 27.0, carbs: 2.0 },
  { name: "Сыр Пармезан", calories: 431, protein: 38.0, fat: 29.0, carbs: 4.1 },
  { name: "Сыр Моцарелла", calories: 280, protein: 28.0, fat: 17.0, carbs: 3.1 },
  { name: "Сыр Фета", calories: 264, protein: 14.2, fat: 21.3, carbs: 4.1 },
  { name: "Сыр Адыгейский", calories: 264, protein: 19.0, fat: 20.0, carbs: 2.0 },

  { name: "Молоко кокосовое (из банки)", calories: 197, protein: 2.0, fat: 21.0, carbs: 2.8 },

  { name: "Овсянка (варёная на воде)", calories: 71, protein: 2.5, fat: 1.5, carbs: 12.0 },
  { name: "Овсянка (сухая)", calories: 374, protein: 13.0, fat: 6.9, carbs: 66.0 },

  { name: "Гречка (варёная)", calories: 110, protein: 4.0, fat: 1.0, carbs: 21.0 },
  { name: "Гречка (сухая)", calories: 313, protein: 12.6, fat: 3.3, carbs: 62.0 },

  { name: "Рис белый (варёный)", calories: 130, protein: 2.7, fat: 0.3, carbs: 28.0 },
  { name: "Рис белый (сухой)", calories: 365, protein: 7.5, fat: 0.7, carbs: 79.0 },

  { name: "Рис бурый (варёный)", calories: 111, protein: 2.6, fat: 0.9, carbs: 23.0 },
  { name: "Рис бурый (сухой)", calories: 370, protein: 7.9, fat: 2.9, carbs: 77.0 },

  { name: "Рис пропаренный (варёный)", calories: 123, protein: 2.8, fat: 0.4, carbs: 26.0 },

  { name: "Перловка (варёная)", calories: 123, protein: 2.3, fat: 0.4, carbs: 28.0 },
  { name: "Пшено (варёное)", calories: 119, protein: 3.5, fat: 0.9, carbs: 23.0 },
  { name: "Кукурузная крупа (варёная)", calories: 109, protein: 2.5, fat: 0.9, carbs: 23.0 },

  { name: "Киноа (варёная)", calories: 120, protein: 4.4, fat: 1.9, carbs: 21.0 },
  { name: "Булгур (варёный)", calories: 101, protein: 3.5, fat: 0.5, carbs: 19.0 },
  { name: "Кускус (варёный)", calories: 112, protein: 3.8, fat: 0.2, carbs: 23.0 },

  { name: "Полба (варёная)", calories: 127, protein: 5.5, fat: 1.0, carbs: 26.0 },

  // ── МАКАРОНЫ ──────────────────────────
  { name: "Макароны (варёные)", calories: 158, protein: 5.5, fat: 0.9, carbs: 31.0 },
  { name: "Спагетти (варёные)", calories: 157, protein: 5.7, fat: 0.9, carbs: 30.0 },
  { name: "Макароны из твёрдой пшеницы (варёные)", calories: 165, protein: 6.5, fat: 1.0, carbs: 32.0 },
  { name: "Лапша рисовая (варёная)", calories: 109, protein: 2.0, fat: 0.2, carbs: 24.0 },
  { name: "Гречневая лапша (варёная)", calories: 113, protein: 4.8, fat: 0.5, carbs: 24.0 },

  // ── ХЛЕБ ──────────────────────────────
  { name: "Хлеб ржаной", calories: 259, protein: 6.6, fat: 1.2, carbs: 55.0 },
  { name: "Хлеб пшеничный белый", calories: 265, protein: 7.7, fat: 1.0, carbs: 56.0 },
  { name: "Хлеб цельнозерновой", calories: 247, protein: 9.0, fat: 3.0, carbs: 48.0 },
  { name: "Хлеб бородинский", calories: 201, protein: 6.8, fat: 1.3, carbs: 40.0 },
  { name: "Лаваш тонкий", calories: 277, protein: 9.1, fat: 1.1, carbs: 57.0 },

  { name: "Хлебцы рисовые", calories: 381, protein: 7.0, fat: 1.8, carbs: 84.0 },
  { name: "Хлебцы пшеничные", calories: 350, protein: 10.0, fat: 1.0, carbs: 75.0 },
  { name: "Хлебцы ржаные", calories: 336, protein: 11.5, fat: 2.5, carbs: 72.0 },

  { name: "Батон нарезной", calories: 264, protein: 8.0, fat: 2.9, carbs: 53.0 },
  { name: "Тост пшеничный", calories: 313, protein: 11.0, fat: 4.0, carbs: 60.0 },

  // ── ОВОЩИ ─────────────────────────────
  { name: "Брокколи", calories: 34, protein: 2.8, fat: 0.4, carbs: 7.0 },
  { name: "Цветная капуста", calories: 25, protein: 1.9, fat: 0.3, carbs: 5.0 },
  { name: "Белокочанная капуста", calories: 25, protein: 1.3, fat: 0.1, carbs: 6.0 },
  { name: "Краснокочанная капуста", calories: 31, protein: 1.4, fat: 0.2, carbs: 7.0 },
  { name: "Пекинская капуста", calories: 16, protein: 1.2, fat: 0.2, carbs: 3.2 },
  { name: "Брюссельская капуста", calories: 43, protein: 3.4, fat: 0.3, carbs: 9.0 },

  { name: "Шпинат", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 },
  { name: "Помидоры", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { name: "Томаты черри", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { name: "Огурцы", calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },

  { name: "Болгарский перец красный", calories: 31, protein: 1.0, fat: 0.3, carbs: 7.0 },
  { name: "Болгарский перец зелёный", calories: 20, protein: 0.9, fat: 0.2, carbs: 4.6 },
  { name: "Болгарский перец жёлтый", calories: 27, protein: 1.0, fat: 0.2, carbs: 6.3 },

  { name: "Морковь", calories: 41, protein: 0.9, fat: 0.2, carbs: 10.0 },
  { name: "Свёкла (варёная)", calories: 44, protein: 1.7, fat: 0.2, carbs: 10.0 },

  { name: "Кабачок", calories: 17, protein: 1.2, fat: 0.1, carbs: 3.1 },
  { name: "Баклажан", calories: 25, protein: 1.0, fat: 0.2, carbs: 5.9 },
  { name: "Сельдерей стебли", calories: 16, protein: 0.7, fat: 0.2, carbs: 3.0 },

  { name: "Лук репчатый", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3 },
  { name: "Лук-порей", calories: 61, protein: 1.5, fat: 0.3, carbs: 14.0 },
  { name: "Чеснок", calories: 149, protein: 6.4, fat: 0.5, carbs: 33.0 },

  { name: "Редис", calories: 16, protein: 0.7, fat: 0.1, carbs: 3.4 },
  { name: "Редька", calories: 35, protein: 1.9, fat: 0.1, carbs: 6.7 },

  { name: "Тыква", calories: 26, protein: 1.0, fat: 0.1, carbs: 6.5 },
  { name: "Патиссон", calories: 19, protein: 0.6, fat: 0.1, carbs: 4.3 },
  { name: "Артишок", calories: 47, protein: 3.3, fat: 0.2, carbs: 10.5 },
  { name: "Спаржа", calories: 20, protein: 2.2, fat: 0.1, carbs: 3.9 },

  { name: "Авокадо", calories: 160, protein: 2.0, fat: 15.0, carbs: 9.0 },

  // ── КАРТОФЕЛЬ ─────────────────────────
  { name: "Картофель (варёный)", calories: 87, protein: 1.9, fat: 0.1, carbs: 20.0 },
  { name: "Картофель (запечённый)", calories: 93, protein: 2.5, fat: 0.1, carbs: 21.0 },
  { name: "Картофельное пюре (на воде)", calories: 83, protein: 2.0, fat: 0.4, carbs: 18.0 },
  { name: "Картофельное пюре (на молоке)", calories: 113, protein: 2.5, fat: 3.5, carbs: 18.0 },
  { name: "Батат (запечённый)", calories: 90, protein: 2.0, fat: 0.1, carbs: 21.0 },

  // ── ЗЕЛЕНЬ ────────────────────────────
  { name: "Салат айсберг", calories: 14, protein: 0.9, fat: 0.1, carbs: 3.0 },
  { name: "Салат романо", calories: 17, protein: 1.2, fat: 0.3, carbs: 3.3 },
  { name: "Рукола", calories: 25, protein: 2.6, fat: 0.7, carbs: 3.7 },
  { name: "Петрушка", calories: 36, protein: 3.0, fat: 0.8, carbs: 6.3 },
  { name: "Укроп", calories: 43, protein: 2.5, fat: 1.1, carbs: 6.3 },
  { name: "Базилик", calories: 23, protein: 3.2, fat: 0.6, carbs: 2.7 },
  { name: "Кинза", calories: 23, protein: 2.1, fat: 0.5, carbs: 3.7 },

  // ── ГРИБЫ ─────────────────────────────
  { name: "Шампиньоны (свежие)", calories: 27, protein: 3.1, fat: 0.3, carbs: 3.3 },
  { name: "Шампиньоны (жареные)", calories: 35, protein: 3.0, fat: 1.7, carbs: 3.5 },
  { name: "Вешенки (варёные)", calories: 33, protein: 2.1, fat: 0.5, carbs: 6.0 },
  { name: "Лисички (жареные)", calories: 55, protein: 1.9, fat: 3.0, carbs: 5.0 },

  { name: "Банан", calories: 89, protein: 1.1, fat: 0.3, carbs: 23.0 },
  { name: "Яблоко", calories: 52, protein: 0.3, fat: 0.2, carbs: 14.0 },
  { name: "Яблоко зелёное", calories: 47, protein: 0.4, fat: 0.2, carbs: 12.0 },

  { name: "Апельсин", calories: 47, protein: 0.9, fat: 0.1, carbs: 12.0 },
  { name: "Мандарин", calories: 53, protein: 0.8, fat: 0.2, carbs: 13.0 },
  { name: "Грейпфрут", calories: 42, protein: 0.8, fat: 0.1, carbs: 11.0 },
  { name: "Лимон", calories: 29, protein: 1.1, fat: 0.3, carbs: 9.3 },

  { name: "Груша", calories: 57, protein: 0.4, fat: 0.1, carbs: 15.0 },
  { name: "Груша конференция", calories: 58, protein: 0.4, fat: 0.1, carbs: 16.0 },

  { name: "Персик", calories: 39, protein: 0.9, fat: 0.3, carbs: 10.0 },
  { name: "Нектарин", calories: 44, protein: 1.1, fat: 0.3, carbs: 11.0 },
  { name: "Абрикос", calories: 48, protein: 1.4, fat: 0.4, carbs: 11.0 },

  { name: "Слива", calories: 46, protein: 0.7, fat: 0.3, carbs: 11.0 },
  { name: "Вишня", calories: 50, protein: 1.0, fat: 0.3, carbs: 12.0 },
  { name: "Черешня", calories: 52, protein: 1.1, fat: 0.4, carbs: 12.0 },

  { name: "Виноград", calories: 69, protein: 0.7, fat: 0.2, carbs: 18.0 },
  { name: "Арбуз", calories: 30, protein: 0.6, fat: 0.2, carbs: 8.0 },
  { name: "Дыня", calories: 35, protein: 0.6, fat: 0.3, carbs: 8.7 },

  { name: "Ананас", calories: 50, protein: 0.5, fat: 0.1, carbs: 13.0 },
  { name: "Манго", calories: 60, protein: 0.8, fat: 0.4, carbs: 15.0 },
  { name: "Киви", calories: 61, protein: 1.1, fat: 0.5, carbs: 15.0 },

  { name: "Папайя", calories: 43, protein: 0.5, fat: 0.3, carbs: 11.0 },
  { name: "Хурма", calories: 70, protein: 0.5, fat: 0.4, carbs: 18.0 },

  { name: "Гранат", calories: 83, protein: 1.7, fat: 1.2, carbs: 19.0 },
  { name: "Инжир свежий", calories: 74, protein: 0.8, fat: 0.3, carbs: 19.0 },

  { name: "Клубника", calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7 },
  { name: "Черника", calories: 57, protein: 0.7, fat: 0.3, carbs: 14.0 },
  { name: "Голубика", calories: 57, protein: 0.7, fat: 0.3, carbs: 14.0 },

  { name: "Малина", calories: 52, protein: 1.2, fat: 0.7, carbs: 12.0 },
  { name: "Ежевика", calories: 43, protein: 1.4, fat: 0.5, carbs: 10.0 },

  { name: "Смородина чёрная", calories: 63, protein: 1.4, fat: 0.2, carbs: 15.0 },
  { name: "Смородина красная", calories: 43, protein: 1.0, fat: 0.2, carbs: 10.0 },

  { name: "Крыжовник", calories: 44, protein: 0.9, fat: 0.6, carbs: 10.0 },
  { name: "Клюква", calories: 46, protein: 0.4, fat: 0.1, carbs: 12.0 },

  { name: "Изюм", calories: 299, protein: 3.1, fat: 0.5, carbs: 79.0 },
  { name: "Чернослив", calories: 240, protein: 2.2, fat: 0.5, carbs: 63.0 },
  { name: "Курага", calories: 241, protein: 3.4, fat: 0.5, carbs: 63.0 },
  { name: "Финики", calories: 277, protein: 1.8, fat: 0.2, carbs: 75.0 },
  { name: "Инжир сушёный", calories: 249, protein: 3.3, fat: 1.0, carbs: 63.0 },

  { name: "Миндаль", calories: 579, protein: 21.0, fat: 50.0, carbs: 22.0 },
  { name: "Грецкий орех", calories: 654, protein: 15.0, fat: 65.0, carbs: 14.0 },
  { name: "Арахис", calories: 567, protein: 26.0, fat: 49.0, carbs: 16.0 },
  { name: "Арахис жареный", calories: 585, protein: 26.0, fat: 50.0, carbs: 16.0 },

  { name: "Кешью", calories: 553, protein: 18.0, fat: 44.0, carbs: 30.0 },
  { name: "Фундук", calories: 628, protein: 15.0, fat: 61.0, carbs: 17.0 },
  { name: "Пекан", calories: 691, protein: 9.2, fat: 72.0, carbs: 14.0 },
  { name: "Фисташки", calories: 562, protein: 20.0, fat: 45.0, carbs: 28.0 },

  { name: "Макадамия", calories: 718, protein: 7.9, fat: 76.0, carbs: 14.0 },
  { name: "Кедровый орех", calories: 673, protein: 14.0, fat: 68.0, carbs: 13.0 },

  { name: "Семена чиа", calories: 486, protein: 17.0, fat: 31.0, carbs: 42.0 },
  { name: "Семена льна", calories: 534, protein: 18.0, fat: 42.0, carbs: 29.0 },
  { name: "Тыквенные семечки", calories: 559, protein: 30.0, fat: 49.0, carbs: 11.0 },
  { name: "Подсолнечные семечки", calories: 584, protein: 21.0, fat: 51.0, carbs: 20.0 },
  { name: "Кунжут", calories: 573, protein: 17.7, fat: 49.7, carbs: 23.0 },

  { name: "Масло оливковое", calories: 884, protein: 0, fat: 100.0, carbs: 0 },
  { name: "Масло подсолнечное", calories: 884, protein: 0, fat: 100.0, carbs: 0 },
  { name: "Масло кокосовое", calories: 862, protein: 0, fat: 100.0, carbs: 0 },
  { name: "Масло льняное", calories: 884, protein: 0, fat: 100.0, carbs: 0 },

  { name: "Масло сливочное 72.5%", calories: 661, protein: 0.8, fat: 72.5, carbs: 1.0 },
  { name: "Масло сливочное 82.5%", calories: 748, protein: 0.8, fat: 82.5, carbs: 0.8 },
  { name: "Масло топлёное (гхи)", calories: 892, protein: 0.3, fat: 99.5, carbs: 0 },

  { name: "Маргарин", calories: 718, protein: 0.5, fat: 80.0, carbs: 1.0 },

  { name: "Майонез", calories: 680, protein: 2.4, fat: 74.0, carbs: 2.6 },
  { name: "Майонез лёгкий (30%)", calories: 296, protein: 1.0, fat: 30.0, carbs: 5.0 },

  { name: "Томатная паста", calories: 82, protein: 3.4, fat: 0.4, carbs: 19.0 },
  { name: "Кетчуп", calories: 97, protein: 1.3, fat: 0.3, carbs: 23.0 },
  { name: "Соевый соус", calories: 53, protein: 8.0, fat: 0.1, carbs: 4.9 },
  { name: "Соус Табаско", calories: 12, protein: 0.3, fat: 0.1, carbs: 2.9 },
  { name: "Горчица", calories: 67, protein: 3.7, fat: 3.7, carbs: 8.0 },
  { name: "Хрен", calories: 59, protein: 1.5, fat: 0.3, carbs: 11.0 },

  { name: "Хумус", calories: 177, protein: 8.0, fat: 10.0, carbs: 14.0 },
  { name: "Гуакамоле", calories: 149, protein: 1.9, fat: 13.0, carbs: 8.6 },

  // ── СЛАДКОЕ ───────────────────────────
  { name: "Мёд", calories: 304, protein: 0.3, fat: 0, carbs: 82.0 },
  { name: "Сахар белый", calories: 387, protein: 0, fat: 0, carbs: 100.0 },
  { name: "Сахар коричневый", calories: 377, protein: 0, fat: 0, carbs: 97.0 },

  { name: "Нутелла", calories: 539, protein: 6.3, fat: 30.9, carbs: 57.5 },

  { name: "Молоко миндальное (несладкое)", calories: 17, protein: 0.6, fat: 1.1, carbs: 1.4 },
  { name: "Молоко овсяное", calories: 46, protein: 1.0, fat: 1.5, carbs: 7.0 },
  { name: "Молоко соевое", calories: 54, protein: 3.5, fat: 2.0, carbs: 6.3 },
  { name: "Молоко кокосовое (из банки)", calories: 197, protein: 2.0, fat: 21.0, carbs: 2.8 },

  { name: "Апельсиновый сок свежий", calories: 45, protein: 0.7, fat: 0.2, carbs: 10.0 },
  { name: "Яблочный сок", calories: 47, protein: 0.1, fat: 0.1, carbs: 12.0 },

  { name: "Горбуша консервированная", calories: 138, protein: 20.9, fat: 5.8, carbs: 0 },
  { name: "Скумбрия консервированная", calories: 278, protein: 16.1, fat: 23.7, carbs: 0 },
  { name: "Фасоль консервированная", calories: 81, protein: 5.3, fat: 0.3, carbs: 14.0 },
  { name: "Нут консервированный", calories: 119, protein: 6.0, fat: 1.7, carbs: 19.0 },

  { name: "Сывороточный протеин", calories: 400, protein: 75.0, fat: 5.0, carbs: 15.0 },
  { name: "Казеиновый протеин", calories: 370, protein: 77.0, fat: 2.0, carbs: 11.0 },
  { name: "Растительный протеин (гороховый)", calories: 380, protein: 72.0, fat: 4.0, carbs: 14.0 },

  { name: "Гейнер", calories: 400, protein: 25.0, fat: 3.5, carbs: 65.0 },
  { name: "BCAA (порошок)", calories: 80, protein: 15.0, fat: 0, carbs: 5.0 },
  { name: "Батончик протеиновый", calories: 350, protein: 30.0, fat: 9.0, carbs: 38.0 }
];

// Сортируем по алфавиту для удобного поиска
FOODS_DB.sort((a, b) => a.name.localeCompare(b.name, "ru"));

export default FOODS_DB;
