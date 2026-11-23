/*
  הגדרות בסיס של האתר.
  אחרי הקמת Google Apps Script (ראו README-הקמה.md) מדביקים כאן את כתובת ה-Web App.
  כל השאר (שם העסק, טלפון, תמונות, קטלוג) נערך מתוך admin.html ונשמר בגוגל, לא צריך לגעת בקובץ הזה.
*/
window.GALI_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz0rkEVs4Xhs98I1V50Yr8GKuhthJ2GmLz_zCpCXvjDU_3MgRGGvZltdnZhs2dJBx0g/exec",

  // כפתור קטן (מנעול) בתחתית האתר שמוביל לרצפת הייצור. הכניסה מוגנת בחשבון Claude הפרטי שלך.
  STAFF_URL: "https://claude.ai/artifact/NJAQtKqNQvPk3dJHp3QQq9",   // לדוגמה: "https://script.google.com/macros/s/XXXXXXXX/exec"

  // ברירות מחדל עד שהפרטים יוזנו ב-admin.html
  site: {
    businessName: "גלי עיצוב אחר",
    tagline: "וילונות בהתאמה אישית, מהמדידה ועד ההתקנה",
    phone: "050-9382370",
    whatsapp: "972509382370",   // מספר בפורמט בינלאומי בלי + ובלי מקפים
    whatsappText: "היי, הגעתי מהאתר ואשמח להתייעץ לגבי וילונות",
    email: "",
    serviceArea: "",
    hours: "",
    instagram: "",
    facebook: "",
    aboutTitle: "עסק משפחתי, 34 שנים של טקסטיל ועיצוב",
    aboutText: "כבר 34 שנים שאנחנו מביאים את עולם הטקסטיל והעיצוב ישירות לסלון שלכם. גלי, שמובילה את העסק, מביאה איתה ניסיון עשיר בעיצוב פנים, ויחד איתה הדור השני של המשפחה.\n\nעם תפירה עילית כחול-לבן במתפרה מקומית ופתרונות הצללה מהיבואנים המובילים בעולם, אנחנו דואגים להלביש את הבית שלכם ביוקרה, רוך והרמוניה.\n\nאפשר לעבוד איתנו בשתי דרכים: להזמין אונליין, לבחור בד מהמבחר באתר, למדוד לבד לפי ההוראות שלנו ולקבל עד הבית, עם התקנה אם רוצים.\n\nאו\n\nלקבוע פגישת ייעוץ חינם, ואנחנו מגיעים אליכם הביתה עם מזוודה מלאה בדים ודוגמאות, מקשיבים לחלל ולאופי שלכם, מודדים ומתאימים יחד את הפתרון המדויק ביותר.",
    priceNote: "בהזמנה אונליין המחיר נקבע לפי המידות שהזנתם. בפגישת ייעוץ המחיר באתר הוא הערכה, והמחיר הסופי נקבע אחרי מדידה בבית.",
    showPrices: true
  },

  // הבדים שמוצגים באתר: מזהי בדים או שמות דגם. רשימה ריקה = כל הבדים.
  siteFabrics: [],

  // הזמנה אונליין: משלוח והתקנה
  delivery: {
    shippingFee: null,   // דמי משלוח קבועים בש״ח, לדוגמה 120. null = "יימסר לפני אישור"
    install: {
      perType: {},       // מחיר התקנה לווילון לפי סוג, לדוגמה { t_pleat: 150, t_roll: 120 }. ריק = "יימסר לפני אישור"
      areas: []          // תוספת לפי אזור, לדוגמה [{ name: "מרכז", add: 0 }, { name: "צפון", add: 250 }]. ריק = בלי בחירת אזור
    }
  },

  // רומי ישר במידות מוכנות. המחיר לפי הנוסחה הרגילה (רוחב × גובה × מחיר למ״ר).
  // במידה אישית הבד הוא מבדי הרומי הרגילים, לא הבד של הדגמים המוכנים.
  readyRoman: {
    typeId: "t_roman",
    models: [
      { id: "shamenet", name: "שמנת", note: "לבן-שמנת רך, מעביר אור",
        fabric: "assets/img/roman/shamenet-fabric.jpg",
        photos: ["assets/img/roman/shamenet-3.jpg", "assets/img/roman/shamenet-1.jpg", "assets/img/roman/shamenet-2.jpg"],
        sizes: [ { w: 120, h: 160, sku: "2006140" }, { w: 140, h: 160, sku: "2006155" }, { w: 160, h: 160, sku: "2006200" },
                 { w: 160, h: 250, sku: "2006000" }, { w: 180, h: 220, sku: "2006000" } ] },
      { id: "even", name: "אבן", note: "בז׳ טבעי, מעביר אור",
        fabric: "assets/img/roman/even-fabric.jpg",
        photos: ["assets/img/roman/even-1.jpg", "assets/img/roman/even-2.jpg"],
        sizes: [ { w: 120, h: 160, sku: "2006140" }, { w: 140, h: 160, sku: "2006155" }, { w: 160, h: 160, sku: "2006200" },
                 { w: 160, h: 250, sku: "2006000" }, { w: 180, h: 220, sku: "2006000" } ] },
      { id: "alpha", name: "אלפא האפלה", note: "שמנת עם בטנה מאפילה",
        fabric: "assets/img/roman/alpha-fabric.jpg",
        photos: ["assets/img/roman/alpha-1.jpg"],
        sizes: [ { w: 120, h: 160, sku: "2006145" }, { w: 140, h: 160, sku: "2006169" }, { w: 160, h: 160, sku: "2006215" } ] }
    ]
  },

  // סוגי מסילה לווילונות פאלדים. perM = תוספת מחיר למטר (₪). null = תוספת שמחירה עוד לא נקבע (יוצג "בתוספת תשלום").
  rails: [
    { id: "A", name: "מסילה רגילה (A)", note: "כלולה במחיר", perM: 0 },
    { id: "U", name: "מסילת U", note: "בתוספת תשלום", perM: null },
    { id: "F", name: "מסילת F צרה", note: "בתוספת תשלום · מתאימה למקומות צרים, למשל כשמסילה רגילה מפריעה לציר של ארון", perM: null },
    { id: "מתעגלת", name: "מסילה מתעגלת", note: "בתוספת תשלום · לחלונות פינתיים ומפרצים", perM: null },
    { id: "דקורטיבית", name: "מסילה דקורטיבית", note: "בתוספת תשלום", perM: null }
  ],

  // תמונות קבועות שמגיעות עם האתר. תמונה שתועלה ב-admin.html תחליף אותן.
  images: {
    hero: { url: "assets/img/hero.jpg" },
    type_t_roman: { url: "assets/img/roman/shamenet-3.jpg" }
  }
};
