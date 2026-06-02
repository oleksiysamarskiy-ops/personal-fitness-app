// База продуктов — значения на 100 грамм
// { calories, protein, fat, carbs }

export const FOODS_DB = [
  // ── МЯСО ─────────────────────────────────────────────
  { name: "Куриная грудка (варёная)",   calories: 165, protein: 31,   fat: 3.6,  carbs: 0   },
  { name: "Куриное бедро (варёное)",    calories: 215, protein: 26,   fat: 12,   carbs: 0   },
  { name: "Куриный фарш",              calories: 143, protein: 17,   fat: 8,    carbs: 0   },
  { name: "Говядина (варёная)",         calories: 254, protein: 27,   fat: 16,   carbs: 0   },
  { name: "Говяжий фарш (жареный)",    calories: 215, protein: 24,   fat: 13,   carbs: 0   },
  { name: "Свинина (варёная)",          calories: 297, protein: 25,   fat: 21,   carbs: 0   },
  { name: "Свиная вырезка",            calories: 143, protein: 22,   fat: 5.5,  carbs: 0   },
  { name: "Индейка (филе варёное)",     calories: 189, protein: 29,   fat: 7,    carbs: 0   },
  { name: "Кролик (варёный)",           calories: 179, protein: 25,   fat: 8,    carbs: 0   },
  { name: "Телятина (варёная)",         calories: 197, protein: 30,   fat: 8,    carbs: 0   },

  // ── РЫБА И МОРЕПРОДУКТЫ ───────────────────────────────
  { name: "Лосось (запечённый)",        calories: 206, protein: 20,   fat: 13,   carbs: 0   },
  { name: "Тунец (в воде)",             calories:  99, protein: 23,   fat: 0.5,  carbs: 0   },
  { name: "Треска (варёная)",           calories:  90, protein: 20,   fat: 0.7,  carbs: 0   },
  { name: "Тилапия (запечённая)",       calories: 128, protein: 26,   fat: 2.7,  carbs: 0   },
  { name: "Минтай (варёный)",           calories:  79, protein: 17,   fat: 0.9,  carbs: 0   },
  { name: "Сёмга (слабосолёная)",       calories: 202, protein: 22,   fat: 12,   carbs: 0   },
  { name: "Скумбрия (варёная)",         calories: 205, protein: 19,   fat: 14,   carbs: 0   },
  { name: "Сельдь (солёная)",           calories: 217, protein: 18,   fat: 16,   carbs: 0   },
  { name: "Креветки (варёные)",         calories:  99, protein: 20,   fat: 1.7,  carbs: 0.9 },
  { name: "Кальмар (варёный)",          calories:  92, protein: 15,   fat: 1.4,  carbs: 3.1 },

  // ── МОЛОЧНЫЕ ПРОДУКТЫ И ЯЙЦА ──────────────────────────
  { name: "Яйцо куриное (варёное)",     calories: 155, protein: 13,   fat: 11,   carbs: 1.1 },
  { name: "Яичный белок",              calories:  52, protein: 11,   fat: 0.2,  carbs: 0.7 },
  { name: "Творог 0%",                 calories:  69, protein: 18,   fat: 0.2,  carbs: 1.8 },
  { name: "Творог 5%",                 calories: 121, protein: 17,   fat: 5,    carbs: 1.8 },
  { name: "Творог 9%",                 calories: 158, protein: 16,   fat: 9,    carbs: 2   },
  { name: "Молоко 1.5%",              calories:  44, protein: 3,    fat: 1.5,  carbs: 5   },
  { name: "Молоко 3.2%",              calories:  60, protein: 3,    fat: 3.2,  carbs: 4.8 },
  { name: "Кефир 1%",                  calories:  40, protein: 3,    fat: 1,    carbs: 4   },
  { name: "Йогурт греческий 0%",       calories:  59, protein: 10,   fat: 0.4,  carbs: 3.6 },
  { name: "Йогурт греческий 2%",       calories:  73, protein: 9,    fat: 2,    carbs: 3.6 },
  { name: "Сыр твёрдый",               calories: 402, protein: 25,   fat: 33,   carbs: 0   },
  { name: "Сыр моцарелла",             calories: 280, protein: 28,   fat: 17,   carbs: 3.1 },
  { name: "Сыр рикотта",               calories: 174, protein: 11,   fat: 13,   carbs: 3   },
  { name: "Сметана 10%",              calories: 116, protein: 3,    fat: 10,   carbs: 4   },
  { name: "Сметана 20%",              calories: 204, protein: 2.8,  fat: 20,   carbs: 3.2 },

  // ── КРУПЫ И ЗЛАКИ ────────────────────────────────────
  { name: "Овсянка (варёная)",          calories:  71, protein: 2.5,  fat: 1.5,  carbs: 12  },
  { name: "Гречка (варёная)",           calories: 110, protein: 4,    fat: 1,    carbs: 21  },
  { name: "Рис белый (варёный)",        calories: 130, protein: 2.7,  fat: 0.3,  carbs: 28  },
  { name: "Рис бурый (варёный)",        calories: 111, protein: 2.6,  fat: 0.9,  carbs: 23  },
  { name: "Перловка (варёная)",         calories: 123, protein: 2.3,  fat: 0.4,  carbs: 28  },
  { name: "Пшено (варёное)",            calories: 119, protein: 3.5,  fat: 0.9,  carbs: 23  },
  { name: "Киноа (варёная)",            calories: 120, protein: 4.4,  fat: 1.9,  carbs: 21  },
  { name: "Булгур (варёный)",           calories: 101, protein: 3.5,  fat: 0.5,  carbs: 19  },
  { name: "Кускус (варёный)",           calories: 112, protein: 3.8,  fat: 0.2,  carbs: 23  },
  { name: "Макароны (варёные)",         calories: 158, protein: 5.5,  fat: 0.9,  carbs: 31  },

  // ── ХЛЕБ И ВЫПЕЧКА ───────────────────────────────────
  { name: "Хлеб ржаной",               calories: 259, protein: 6.6,  fat: 1.2,  carbs: 55  },
  { name: "Хлеб пшеничный",            calories: 265, protein: 7.7,  fat: 1,    carbs: 56  },
  { name: "Хлебцы рисовые",            calories: 381, protein: 7,    fat: 1.8,  carbs: 84  },
  { name: "Тост пшеничный",            calories: 313, protein: 11,   fat: 4,    carbs: 60  },

  // ── БОБОВЫЕ ──────────────────────────────────────────
  { name: "Чечевица (варёная)",         calories: 116, protein: 9,    fat: 0.4,  carbs: 20  },
  { name: "Нут (варёный)",              calories: 164, protein: 8.9,  fat: 2.6,  carbs: 27  },
  { name: "Фасоль красная (варёная)",   calories: 127, protein: 8.7,  fat: 0.5,  carbs: 23  },
  { name: "Горох (варёный)",            calories: 116, protein: 8,    fat: 0.4,  carbs: 21  },
  { name: "Соя (варёная)",              calories: 173, protein: 17,   fat: 9,    carbs: 10  },
  { name: "Эдамаме",                   calories: 121, protein: 11,   fat: 5.2,  carbs: 9   },
  { name: "Тофу",                      calories:  76, protein: 8,    fat: 4.8,  carbs: 1.9 },

  // ── ОВОЩИ ────────────────────────────────────────────
  { name: "Брокколи",                  calories:  34, protein: 2.8,  fat: 0.4,  carbs: 7   },
  { name: "Цветная капуста",           calories:  25, protein: 1.9,  fat: 0.3,  carbs: 5   },
  { name: "Шпинат",                    calories:  23, protein: 2.9,  fat: 0.4,  carbs: 3.6 },
  { name: "Помидоры",                  calories:  18, protein: 0.9,  fat: 0.2,  carbs: 3.9 },
  { name: "Огурцы",                    calories:  15, protein: 0.7,  fat: 0.1,  carbs: 3.6 },
  { name: "Болгарский перец",          calories:  31, protein: 1,    fat: 0.3,  carbs: 7   },
  { name: "Морковь",                   calories:  41, protein: 0.9,  fat: 0.2,  carbs: 10  },
  { name: "Свёкла (варёная)",           calories:  44, protein: 1.7,  fat: 0.2,  carbs: 10  },
  { name: "Кабачок",                   calories:  17, protein: 1.2,  fat: 0.1,  carbs: 3.1 },
  { name: "Баклажан",                  calories:  25, protein: 1,    fat: 0.2,  carbs: 5.9 },
  { name: "Капуста белокочанная",      calories:  25, protein: 1.3,  fat: 0.1,  carbs: 6   },
  { name: "Сельдерей",                 calories:  16, protein: 0.7,  fat: 0.2,  carbs: 3   },
  { name: "Лук репчатый",             calories:  40, protein: 1.1,  fat: 0.1,  carbs: 9.3 },
  { name: "Чеснок",                    calories: 149, protein: 6.4,  fat: 0.5,  carbs: 33  },
  { name: "Картофель (варёный)",        calories:  87, protein: 1.9,  fat: 0.1,  carbs: 20  },
  { name: "Кукуруза (варёная)",         calories:  96, protein: 3.4,  fat: 1.5,  carbs: 21  },
  { name: "Зелёный горошек (свежий)",  calories:  81, protein: 5.4,  fat: 0.4,  carbs: 14  },

  // ── ФРУКТЫ И ЯГОДЫ ───────────────────────────────────
  { name: "Банан",                     calories:  89, protein: 1.1,  fat: 0.3,  carbs: 23  },
  { name: "Яблоко",                    calories:  52, protein: 0.3,  fat: 0.2,  carbs: 14  },
  { name: "Апельсин",                  calories:  47, protein: 0.9,  fat: 0.1,  carbs: 12  },
  { name: "Клубника",                  calories:  32, protein: 0.7,  fat: 0.3,  carbs: 7.7 },
  { name: "Черника",                   calories:  57, protein: 0.7,  fat: 0.3,  carbs: 14  },
  { name: "Виноград",                  calories:  69, protein: 0.7,  fat: 0.2,  carbs: 18  },
  { name: "Груша",                     calories:  57, protein: 0.4,  fat: 0.1,  carbs: 15  },
  { name: "Персик",                    calories:  39, protein: 0.9,  fat: 0.3,  carbs: 10  },
  { name: "Арбуз",                     calories:  30, protein: 0.6,  fat: 0.2,  carbs: 8   },
  { name: "Манго",                     calories:  60, protein: 0.8,  fat: 0.4,  carbs: 15  },

  // ── ОРЕХИ И СЕМЕНА ───────────────────────────────────
  { name: "Миндаль",                   calories: 579, protein: 21,   fat: 50,   carbs: 22  },
  { name: "Грецкий орех",              calories: 654, protein: 15,   fat: 65,   carbs: 14  },
  { name: "Арахис",                    calories: 567, protein: 26,   fat: 49,   carbs: 16  },
  { name: "Семена чиа",                calories: 486, protein: 17,   fat: 31,   carbs: 42  },
  { name: "Семена льна",               calories: 534, protein: 18,   fat: 42,   carbs: 29  },
  { name: "Тыквенные семечки",         calories: 559, protein: 30,   fat: 49,   carbs: 11  },
  { name: "Кешью",                     calories: 553, protein: 18,   fat: 44,   carbs: 30  },
  { name: "Фундук",                    calories: 628, protein: 15,   fat: 61,   carbs: 17  },

  // ── МАСЛА И ЖИРЫ ─────────────────────────────────────
  { name: "Масло оливковое",           calories: 884, protein: 0,    fat: 100,  carbs: 0   },
  { name: "Масло подсолнечное",        calories: 884, protein: 0,    fat: 100,  carbs: 0   },
  { name: "Масло сливочное",           calories: 717, protein: 0.9,  fat: 81,   carbs: 0.1 },
  { name: "Масло кокосовое",           calories: 862, protein: 0,    fat: 100,  carbs: 0   },
  { name: "Арахисовая паста",          calories: 588, protein: 25,   fat: 50,   carbs: 20  },

  // ── СПОРТИВНОЕ ПИТАНИЕ ────────────────────────────────
  { name: "Протеин сывороточный",      calories: 400, protein: 75,   fat: 5,    carbs: 15  },
  { name: "Казеин",                    calories: 370, protein: 77,   fat: 2,    carbs: 11  },

  // ── НАПИТКИ ──────────────────────────────────────────
  { name: "Молоко миндальное",         calories:  17, protein: 0.6,  fat: 1.1,  carbs: 1.4 },
  { name: "Молоко овсяное",            calories:  46, protein: 1,    fat: 1.5,  carbs: 7   },

  // ── СОУСЫ И ЗАПРАВКИ ─────────────────────────────────
  { name: "Томатная паста",            calories:  82, protein: 3.4,  fat: 0.4,  carbs: 19  },
  { name: "Соевый соус",               calories:  53, protein: 8,    fat: 0.1,  carbs: 4.9 },
  { name: "Мёд",                       calories: 304, protein: 0.3,  fat: 0,    carbs: 82  },
  { name: "Сахар",                     calories: 387, protein: 0,    fat: 0,    carbs: 100 },
];

// Сортируем по алфавиту для удобного поиска
FOODS_DB.sort((a, b) => a.name.localeCompare(b.name, "ru"));

export default FOODS_DB;
