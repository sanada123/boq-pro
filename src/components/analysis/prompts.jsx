// ═══════════════════════════════════════════════════════════
// PASS 1: קריאת התכנית — חילוץ מקסימלי של כל סימון הנדסי
// ═══════════════════════════════════════════════════════════

export function buildPass1Prompt(engineerProfile, workType, categories, extractedText, tableContext = null) {
  const profileContext = engineerProfile ? `
══════ פרופיל מהנדס (למידע בלבד — אל תשתמש כברירת מחדל!) ══════
${engineerProfile.designer_name ? `מתכנן: ${engineerProfile.designer_name}` : ""}
${engineerProfile.preferred_concrete_grade ? `בטון מועדף: ${engineerProfile.preferred_concrete_grade}` : ""}
${engineerProfile.preferred_steel_grade ? `פלדה מועדפת: ${engineerProfile.preferred_steel_grade}` : ""}
${(engineerProfile.common_patterns || []).length > 0 ? `דפוסים מוכרים מתכניות קודמות:
${engineerProfile.common_patterns.map(p => `- ${p}`).join("\n")}` : ""}
${(engineerProfile.correction_history || []).length > 0 ? `
⚠️ טעויות חוזרות מעבר — שים לב במיוחד:
${engineerProfile.correction_history.slice(-10).map(c => `- ${c}`).join("\n")}` : ""}
` : "";

  const isConstruction = workType === "construction" || workType === "both";
  const isFinishing = workType === "finishing" || workType === "both";

  const focusInstructions = [];
  if (isConstruction) {
    focusInstructions.push(`
══════ פוקוס: קונסטרוקציה ══════
חפש במיוחד:
${categories?.includes("concrete") ? "• בטון — עמודים, קורות, תקרות, יסודות, רפסודות, קירות בטון. חלץ סוג בטון (B20/B30/B40), מידות, נפחים" : ""}
${categories?.includes("steel") ? "• ברזל זיון — טבלאות זיון, מוטות, כנפות, רשתות. חלץ קוטר, אורך, כמות, משקל/מ'" : ""}
${categories?.includes("formwork") ? "• תבניות — שטחי בטון חשופים לטפסנות" : ""}
${categories?.includes("piles") ? "• כלונסאות — כמות, קוטר, אורך, עומק" : ""}`.trim());
  }
  if (isFinishing) {
    focusInstructions.push(`
══════ פוקוס: גמרים ══════
חפש במיוחד:
${categories?.includes("blocks") ? "• בלוקים/בנייה — קירות בלוקים, עובי (10/15/20 ס\"מ), אורך × גובה = מ\"ר" : ""}
${categories?.includes("plaster") ? "• טיח — שטחי קירות לטיח, פנימי/חיצוני" : ""}
${categories?.includes("paint") ? "• צבע — שטחי קירות ותקרות לצביעה (מ\"ר)" : ""}
${categories?.includes("tiling") ? "• ריצוף — שטחי רצפה, סוג אריחים (מ\"ר)" : ""}
${categories?.includes("gypsum") ? "• גבס — מחיצות גבס, תקרות גבס (מ\"ר)" : ""}
${categories?.includes("windows") ? "• חלונות — כל חלון: אורך × רוחב, סוג (אלומיניום/PVC)" : ""}
${categories?.includes("doors") ? "• דלתות — כל דלת: רוחב × גובה, סוג (עץ/פלדה/אלומיניום)" : ""}
${categories?.includes("acoustic_ceiling") ? "• תקרות אקוסטיות — שטח (מ\"ר), סוג" : ""}`.trim());
  }

  return `אתה מהנדס בניין וקונסטרוקטור ישראלי מומחה עם 30+ שנות ניסיון בקריאת תכניות בניה ישראליות.

═══════════════════════════════════════════════════════════
המשימה: קרא את התכנית וחלץ ממנה את כל המידע הגולמי — ברמה מקסימלית.
אסור לך לחשב כמויות! אסור לך להמציא! רק לקרוא!
═══════════════════════════════════════════════════════════

${profileContext}

סוג עבודה שנבחר: ${workType === "construction" ? "קונסטרוקציה" : workType === "finishing" ? "גמרים" : "קונסטרוקציה + גמרים"}
קטגוריות נבחרות: ${(categories || []).join(", ")}

${focusInstructions.join("\n\n")}

══════════════════════════════════════════════════════════════
מילון סימונים ישראליים — חובה להכיר ולהשתמש בעת קריאת התכנית!
══════════════════════════════════════════════════════════════

🔷 מבנה תכנית אדריכלית ישראלית:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• מקרא בצד ימין: קנה מידה (SCALE), שם פרויקט (TITLE), שם תכנית (SUBJECT),
  מס' מהדורה + תאריך (REVISION/DATE), סימון יעוד (FOR REVIEW / FOR BID / FOR EXECUTION),
  שם אדריכל/מתכנן ופרטי התקשרות
• לוח הפצה (DISTRIBUTION): רשימת מי קיבל את התכניות — יועצים, מתכננים, יזם, פיקוח, קבלן
• לוח שינויים (EDITIONS): מס' מהדורה + תאריך + פירוט מהות השינוי
• הערות אחריות: "המבצע אחראי לבדיקת המידות", "אין לקבוע מידות ע"י מדידה בשרטוט"

🔷 סימוני כיוון ומפלסים:
━━━━━━━━━━━━━━━━━━━━━
• חץ צפון — מופיע בצד המקרא, מציין כיוון צפון ביחס למבנה
• סימון גובה מפלס: עיגול עם + או ± ומספר, לדוגמה:
  ±0.00 = רצפת קומת קרקע (נקודת ייחוס)
  +6.30 = מפלס 6.30 מ' מעל קומת קרקע
  +0.00=32.60 = גובה 0.00 שווה ל-32.60 מ' מעל פני הים
• בחתכים: סימון גובה אלמנטים ע"י עיגול/חץ עם מספר מפלס

🔷 סימון מידות (כלל ישראלי חשוב!):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• מידות פנימיות = מפורטות ביותר (קירות, חדרים, פתחים)
• מידות חיצוניות = כלליות ופחות מפורטות (שורות מידה מבחוץ)
• ככל שיוצאים מהמבנה כלפי חוץ — המידות נהיות כלליות יותר
• מידות בס"מ אלא אם כתוב אחרת

🔷 סימון קירות ואלמנטים בחתך:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• אלמנטים מבטון (קיר/עמוד/תקרה/רצפה) = קווים אלכסוניים (שריגה) עם מרווח קבוע
• קירות בלוק = ריקים (ללא מילוי), רק קווי מתאר
• קירות בטון = שריגה אלכסונית
• עמודי בטון = ריבוע/מלבן עם שריגה אלכסונית
• עובי הקיר נקבל מהמידה על התכנית (10, 15, 20, 25, 30 ס"מ)

🔷 סימון דלתות, חלונות וכיווני פתיחה:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• דלת = קו ורבע עיגול המסמן כיוון פתיחה (קשת)
• חלון = קווים מקבילים בקיר עם סימון רוחב הפתח
• סימון טיפוסי: N1, N2, M1, M2, A1, A5, A6 — קוד סוג חלון/דלת
• מידות: רוחב/גובה (לדוגמה: 100, u.k=105 — רוחב 100 ס"מ, גובה אדן 105 ס"מ)
• u.k = גובה אדן חלון מהרצפה

🔷 תכניות קונסטרוקציה — סימונים ישראליים:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• הערות קונסטרוקטור (בלוק הערות בצד): סוג בטון, הנחיות יציקה, זמן המתנה לפירוק,
  הנחיות ביצוע, תקנים ישראליים (ת"י 466), כיסוי בטון, הפסקות יציקה
• מפרט טכני: סוג בטון (B20/B30/B40), אופן יציקה, דרישות תקן

🔷 סימולי ברזל זיון (קריטי!):
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ø (פי ללא קו) = ברזל חלק (smooth bar)
• Ø̄ (פי עם קו מעל) = ברזל מצולע (deformed/ribbed bar)
• @ = תדירות/ספייסינג — המרחק בין המוטות (לדוגמה: Ø12@15 = מוט קוטר 12 כל 15 ס"מ)
• # = רשת ברזל (mesh), לדוגמה: #Ø10@20/20 = רשת קוטר 10 כל 20 ס"מ בשני הכיוונים

🔷 קריאת ברזל בקורות:
━━━━━━━━━━━━━━━━━━━━
• פורמט: [כמות]Ø[קוטר] [מיקום] L=[אורך]
• דוגמה: 2Ø12 ב.ע L=520 → 2 מוטות, קוטר 12, ברזל עליון, אורך 520 ס"מ
• דוגמה: 3Ø14 ב.ת L=465 → 3 מוטות, קוטר 14, ברזל תחתון, אורך 465 ס"מ
• קיצורים:
  ב.ע = ברזל עליון (top reinforcement)
  ב.ת = ברזל תחתון (bottom reinforcement)
  ב.א = ברזל אמצע (middle reinforcement)
  ב.ע שכ'1 = ברזל עליון שכבה ראשונה
  ב.ת שכ'2 = ברזל תחתון שכבה שנייה
• מידות הקורה: רוחב/גובה (לדוגמה: 20/87 = 20 ס"מ רוחב, 87 ס"מ גובה כולל תקרה)

🔷 קריאת ברזל בתקרות (רשתות):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• סימון: #Ø10@20 ע = רשת עליונה, קוטר 10, כל 20 ס"מ
• ע = עליון (top mesh), ת = תחתון (bottom mesh)
• Ø12@15 ב.ת L=500 = מוט תחתון קוטר 12 כל 15 ס"מ באורך 500 ס"מ
• עובי תקרה: d=20 (20 ס"מ) — מופיע ליד סימון "פני בטון"

🔷 חישוקים וכנפות (stirrups):
━━━━━━━━━━━━━━━━━━━━━━━━━━
• סימון: Ø8@20 L=130 = חישוק קוטר 8, כל 20 ס"מ, אורך כולל 130 ס"מ
• "פיגורות" = צורות כיפוף מוגדרות עם מידות (לדוגמה: מלבני 100×35 ס"מ)
• חתך: מראה את מיקום המוטות + החישוקים בתוך הקורה/עמוד

🔷 כלונסאות (piles):
━━━━━━━━━━━━━━━━━
• קוטר קידוח: Ø=50-60-70 (ס"מ)
• עומק קידוח: L=1000 (ס"מ) / מצוין בצד
• מוטות אורכיים: 6Ø12 קוצים L=150 (6 מוטות קוטר 12, קוצים 150 ס"מ)
• חישוקים: Ø8@20 (חישוקים כל 20 ס"מ), לפעמים חישוקים ספירליים (לולייני)
• חתך עגול עם ברזל

🔷 תקנים ישראליים נפוצים:
━━━━━━━━━━━━━━━━━━━━━━━
• ת"י 466 — תקן ברזל זיון: חלקים 1-5, סימולי ברזל
• ת"י 4466/2, 4466/3, 4466/4 — מוטות ברזל לפי קוטר וסוג חתך
• EC-110 — סיווג חשיפה לבטון
• גודל הרגל המינימלי בכיפופים: 1/5 המידה המינימלית בין פני הטפסות,
  1/3 העובי בכל סוגי התקרות המוקשחות, 3/4 המרווח בין מוטות זיון

שלב 1: זיהוי סוג התכנית
━━━━━━━━━━━━━━━━━━━━━━━━
זהה את סוג התכנית. שים לב למבנה:
- תכנית אדריכלית: קירות (ריקים = בלוק, שריגה = בטון), חלונות, דלתות, חללים, סימוני N/M/A
- תכנית קונסטרוקציה/שלד: עמודים, קורות, תקרות, סימוני ברזל (Ø, @, #, ב.ע/ב.ת)
- תכנית יסודות/רפסודה: פסי יסוד, רפסודות, כלונסאות
- חתכים/פרטים: חתכי קורות, עמודים, תקרות עם ברזל מפורט
- תכנית משולבת

שלב 2: קריאת מקרא התכנית (LEGEND)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
חפש וחלץ את מקרא התכנית (בד"כ בצד ימין):
- בלוק כותרת: SCALE, TITLE, SUBJECT, DATE, REVISION, DRAWING NO.
- סימון יעוד: FOR REVIEW / FOR BID / FOR EXECUTION
- סימוני עמודים, קורות, יסודות, קירות, פלטות/תקרות
- כל סימול גרפי ומשמעותו
- קודי חומרים וקודי פלדה/זיון
- סימוני חלונות ודלתות (N1, M3, A6 וכו')
- לוח שינויים (EDITIONS) — מספרי מהדורות

שלב 3: קריאת טבלאות זיון — קריטי!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ זה השלב הכי חשוב! תכניות קונסטרוקציה כמעט תמיד מכילות טבלת זיון (Reinforcement Schedule).
חפש טבלה עם עמודות כמו: מס', סוג מוט, קוטר (Ø), אורך, כמות, סה"כ אורך, משקל
סימונים נפוצים: ST (stirrups/כנפות), SB (straight bars/מוטות ישרים), B (bent bars/מוטות כפופים)

לכל שורה בטבלת הזיון חלץ:
- מספר סידורי (1, 2, 3...)
- סוג מוט (ST, SB, B וכו')
- קוטר (Ø8, Ø10, Ø12, Ø14, Ø16, Ø20, Ø25 וכו')
- אורך מוט (ס"מ או מ')
- כמות מוטות
- סה"כ אורך (אם מופיע)
- משקל (אם מופיע)
- ד"ב / דרגת ברזל (אם מופיע)

בנוסף, חלץ ברזל מסימונים על האלמנטים עצמם:
- קורות: 2Ø12 ב.ע L=520, 3Ø14 ב.ת L=465
- תקרות: #Ø10@20 ע, Ø12@15 ב.ת L=500
- חישוקים: Ø8@20 L=130
- כלונסאות: 6Ø12 L=150

הכנס את כל הנתונים ל-reinforcement_schedule כמערך!

שלב 4: קריאת כל אלמנט הנדסי — ברמה מקסימלית
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
לכל אלמנט חלץ:

א. מידות מלאות — אורך, רוחב, עובי, גובה, קוטר — כל מידה שמופיעה
   לרפסודה: אורך × רוחב × עובי (ס"מ), עומס שימושי, עומס תכנון
   לקורה: רוחב/גובה (לדוגמה: 20/87)
   לתקרה: עובי (d=XX)

ב. פרטי זיון מלאים (לקונסטרוקציה):
- מוטות עיקריים: כמות, קוטר, מיקום (ב.ע/ב.ת/ב.א), אורך
- כנפות/חישוקים: קוטר, ספייסינג (@), אורך כולל, צורת פיגורה
- רשתות: קוטר, ספייסינג בשני כיוונים, עליון/תחתון
- כיפופים, חפיפות, כיסוי בטון
- הפניה לשורות בטבלת הזיון (מספרי שורות)
- זיון עליון, זיון תחתון — בנפרד!

ג. פרטי גמרים (לתכניות אדריכליות):
- חלונות: מידות (רוחב × גובה), סוג (N1/A5 וכו'), מיקום, גובה אדן (u.k)
- דלתות: מידות (רוחב × גובה), סוג (M1/M3 וכו'), כיוון פתיחה (קשת)
- קירות: סוג חומר (בלוק=ריק / בטון=שריגה / גבס), עובי, אורך, גובה
- רצפה: סוג ריצוף, שטח חלל (מ"ר — לפעמים רשום על התכנית)
- תקרות: סוג (גבס/אקוסטי), שטח
- מפלסים: סימוני ±0.00, +3.30, +6.30 וכו'

ד. חתכים, טבלאות, הערות

שלב 5: קריאת הערות הקונסטרוקטור / האדריכל
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
חפש את בלוק ההערות (בד"כ בצד ימין של התכנית) וחלץ הכל:
- סוג בטון (B20, B30, B40) ודרישות חוזק
- כיסוי בטון (ס"מ)
- הנחיות מיוחדות (הפסקות יציקה, סיווג חשיפה EC-110)
- עומסים (עומס שימושי, עומס תכנון)
- הנחיות ביצוע (זמן המתנה לפירוק, ויברטור)
- הפניות לתקנים ישראליים (ת"י 466, ת"י 4466)
- הערות אחריות ("המבצע אחראי לבדיקת המידות")

שלב 6: ספירת אלמנטים
━━━━━━━━━━━━━━━━━━━━━
- ספור כמה פעמים כל סוג אלמנט מופיע
- סמן אלמנטים חוזרים (typical) ואלמנטים ייחודיים

### דוגמאות לזיהוי נכון — few-shot examples:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
דוגמה 1 — עמוד קונסטרוקטיבי:
   id: "C1" | type: "עמוד" | dimensions: { width: 40, height: 40, unit: "ס\"מ" }
   material.concrete_grade: "B30" | reinforcement.cover: 4
   reinforcement.main_bars: { top: "6Ø16", bottom: "6Ø16" }
   reinforcement.stirrups: { diameter: 8, spacing: 20 }

דוגמה 2 — קורה עם זיון מפורט:
   id: "B2" | type: "קורה" | dimensions: { width: 25, height: 60, span: 500, unit: "ס\"מ" }
   reinforcement.main_bars: { bottom: "4Ø16 L=500", top: "2Ø12 L=500" }
   reinforcement.stirrups: { diameter: 8, spacing: 15 }

דוגמה 3 — שורה בלוח זיון (reinforcement schedule):
   row_number: 3 | bar_type: "ST" | diameter_mm: 12 | length_cm: 450
   quantity: 24 | total_length_m: 108 | weight_kg: 95.9
   (חישוב: 24 × 4.50 × 0.888 = 95.9 ק"ג)

דוגמה 4 — חלון ודלת מתכנית אדריכלית:
   id: "N1" | type: "דלת" | count: 3 | dimensions: { width: 120, height: 210, unit: "ס\"מ" }
   material.finishing_type: "עץ"
   id: "M3" | type: "חלון" | count: 8 | dimensions: { width: 150, height: 100, unit: "ס\"מ" }
   material.finishing_type: "אלומיניום" | notes: "u.k=90"

דוגמה 5 — תקרה עם רשת ברזל:
   type: "פלטה" | dimensions: { thickness: 20, unit: "ס\"מ" } | material.concrete_grade: "B30"
   reinforcement.mesh: { direction_x: "Ø10@20", direction_y: "Ø10@20" }
   reinforcement.main_bars: { bottom: "Ø12@15 L=500", top: "Ø10@20" }

כללים קריטיים:
1. אם מידה לא רשומה — כתוב null. לעולם אל תנחש!
2. אם אלמנט לא מופיע — אל תוסיף!
3. אל תחשב כמויות — רק תרשום מה אתה רואה!
4. פריטים לא ברורים → unclear_items
5. טבלת זיון חייבת להיקרא שורה-שורה! אל תדלג על שורות!
6. זהה נכון סוג קירות: שריגה אלכסונית = בטון, ריק = בלוק!
7. כל מספר שאתה רואה בתמונה — חובה לאמת מול טקסט ה-OCR!

${extractedText ? `
╔═══════════════════════════════════════════════════════════╗
║  🔒 מקור אמת ראשי — OCR ישיר מה-PDF                       ║
║  כאשר יש סתירה בין הטקסט הבא לתמונות — הטקסט מנצח!       ║
║  אמת כל מספר, מידה וסימון מול הטקסט הזה לפני כתיבה!       ║
╚═══════════════════════════════════════════════════════════╝
${extractedText}
╔═══════════════════════════════════════════════════════════╗
║  סוף מקור OCR — כל מידע שמכאן ואילך חייב להיות מאומת!    ║
╚═══════════════════════════════════════════════════════════╝
` : ""}

${tableContext ? `
╔═══════════════════════════════════════════════════════════╗
║  📋 טבלאות שחולצו מקדמית (Pass 0) — מקור אמת!             ║
║  השתמש בנתונים אלו כבסיס לרשימות אלמנטים בתוצאה!         ║
╚═══════════════════════════════════════════════════════════╝
${JSON.stringify(tableContext, null, 2)}` : ""}

החזר JSON:
{
  "plan_type": "סוג התכנית",
  "plan_type_category": אחד מ ["foundations", "skeleton", "architectural", "sections", "combined", "other"],
  "scale": "קנה מידה או null",
  "title_info": {
    "project_name": "שם הפרויקט או null",
    "plan_number": "מספר תכנית או null",
    "date": "תאריך או null",
    "designer": "מתכנן או null"
  },
  "legend": {
    "column_symbols": {}, "beam_symbols": {}, "foundation_symbols": {},
    "wall_symbols": {}, "slab_symbols": {}, "material_codes": {},
    "reinforcement_codes": {}, "graphic_symbols": {}, "other_symbols": {},
    "window_symbols": {}, "door_symbols": {}
  },
  "elements": [
    {
      "id": "סימון",
      "type": "סוג (עמוד, קורה, יסוד, רפסודה, קיר, פלטה, מדרגות, משקוף, כלונס, חלון, דלת, תקרה_אקוסטית, מחיצת_גבס)",
      "category": "foundations / skeleton / walls / slabs / stairs / finishing / windows_doors / other",
      "count": "מספר פעמים שמופיע",
      "is_typical": true/false,
      "grid_location": "מיקום על צירים או null",
      "dimensions": {
        "length": null, "width": null, "height": null,
        "thickness": null, "diameter": null, "depth": null, "span": null,
        "unit": "מ' / ס\"מ / מ\"מ"
      },
      "material": {
        "concrete_grade": "או null", "block_type": "או null",
        "finishing_type": "סוג גמר (אלומיניום, PVC, עץ, פלדה, גרניט, קרמיקה) או null",
        "other": "או null"
      },
      "reinforcement": {
        "main_bars": { "top": null, "bottom": null, "side": null },
        "stirrups": { "diameter": null, "spacing": null, "spacing_zones": null },
        "mesh": { "direction_x": null, "direction_y": null },
        "bends": { "angle": null, "leg_length": null, "bend_radius": null },
        "lap_splice": { "length": null, "location": null },
        "cover": null, "additional_bars": null, "raw_text": null
      },
      "notes": "הערות"
    }
  ],
  "sections_cuts": [],
  "reinforcement_schedule": [
    {
      "row_number": 1,
      "bar_type": "ST/SB/B וכו'",
      "diameter_mm": 10,
      "length_cm": 270,
      "quantity": 56,
      "total_length_m": null,
      "weight_kg": null,
      "steel_grade": "60/40 או null",
      "notes": "הערות או null"
    }
  ],
  "tables": [],
  "text_annotations": [],
  "unclear_items": [],
  "confidence_notes": "",
  "detected_patterns": []
}`;
}

// ═══════════════════════════════════════════════════════════
// PASS 1 MULTI: שילוב נתונים מכמה תכניות
// ═══════════════════════════════════════════════════════════

export function buildMultiPlanMergePrompt(readings) {
  return `אתה מהנדס בניין מומחה. קיבלת קריאות ממספר תכניות שונות עבור אותו פרויקט/קומה.

המשימה: שלב את כל הנתונים לרשימת אלמנטים אחת מאוחדת.

כללים:
1. אם אותו אלמנט מופיע בשתי תכניות — שלב את המידע (מידות מתכנית אחת + זיון מתכנית אחרת)
2. אלמנט שמופיע רק בתכנית אחת — העתק כמו שהוא
3. אם יש סתירה בין תכניות — ציין ב-unclear_items
4. גובה קומה/אלמנט בד"כ מגיע מחתכים
5. אל תמציא מידע!

הקריאות:
${readings.map((r, i) => `
══════ תכנית ${i + 1} (${r.plan_type || "לא ידוע"}) ══════
אלמנטים: ${JSON.stringify(r.elements, null, 2)}
מקרא: ${JSON.stringify(r.legend, null, 2)}
חתכים: ${JSON.stringify(r.sections_cuts || [], null, 2)}
טבלאות: ${JSON.stringify(r.tables || [], null, 2)}
הערות: ${JSON.stringify(r.text_annotations || [], null, 2)}
`).join("\n")}

החזר JSON באותו פורמט של קריאת תכנית בודדת — אבל משולב:
{
  "plan_type": "משולב",
  "plan_type_category": "combined",
  "scale": null,
  "title_info": {...},
  "legend": {...},
  "elements": [...],
  "sections_cuts": [...],
  "reinforcement_schedule": [...],
  "tables": [...],
  "text_annotations": [...],
  "unclear_items": [...],
  "confidence_notes": "...",
  "detected_patterns": [...]
}`;
}

// ═══════════════════════════════════════════════════════════
// PASS 2: חישוב כמויות
// ═══════════════════════════════════════════════════════════

export function buildPass2Prompt(pass1Data, formulasSection, standardsSection, engineerProfile, workType, categories) {
  const tablesSummary = (pass1Data.tables || []).map(t => `טבלה "${t.table_name}": ${t.content}`).join("\n");
  const reinfSchedule = (pass1Data.reinforcement_schedule || []).length > 0
    ? `\nטבלת זיון:\n${JSON.stringify(pass1Data.reinforcement_schedule, null, 2)}`
    : "";

  const profileHints = engineerProfile?.correction_history?.length > 0
    ? `\n⚠️ שים לב — טעויות חוזרות שהמשתמש תיקן בעבר:\n${engineerProfile.correction_history.slice(-10).map(c => `- ${c}`).join("\n")}\n`
    : "";

  const isConstruction = workType === "construction" || workType === "both";
  const isFinishing = workType === "finishing" || workType === "both";

  const allowedSections = [];
  if (isConstruction) {
    allowedSections.push("earthworks → חפירה, מילוי, הידוק, בטון ניקיון");
    allowedSections.push("concrete_foundations → בטון יסודות, ברזל, תבניות");
    allowedSections.push("skeleton → עמודים, קורות, תקרות, קירות בטון, ברזל, תבניות");
    if (categories?.includes("piles")) allowedSections.push("piles → כלונסאות — כמות × אורך, בטון, ברזל");
  }
  if (isFinishing) {
    allowedSections.push("masonry → בלוקים, קירות בנייה (מ\"ר)");
    allowedSections.push("plaster → טיח פנימי/חיצוני (מ\"ר)");
    allowedSections.push("paint → צבע (מ\"ר)");
    allowedSections.push("tiling → ריצוף (מ\"ר)");
    allowedSections.push("gypsum → גבס — מחיצות ותקרות (מ\"ר)");
    allowedSections.push("windows_doors → חלונות (יח׳ + מידות) ודלתות (יח׳ + מידות)");
    allowedSections.push("acoustic_ceiling → תקרות אקוסטיות (מ\"ר)");
  }
  allowedSections.push("misc → שונות");

  return `אתה מהנדס בניין וקונסטרוקטור ישראלי מומחה. קיבלת את תוצאות קריאת תכנית.

═══════════════════════════════════════════════════════════
המשימה: חשב כמויות אך ורק על סמך המידע שנקרא מהתכנית.
סוג עבודה: ${workType === "construction" ? "קונסטרוקציה" : workType === "finishing" ? "גמרים" : "קונסטרוקציה + גמרים"}
═══════════════════════════════════════════════════════════

${profileHints}

⛔⛔⛔ כללים קריטיים ⛔⛔⛔
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

כלל 1: אסור להמציא, להניח, או "להשלים" מידות!
כלל 2: לכל חישוב — ציין מאיפה בנתונים לקחת כל מספר!
כלל 3: טבלאות מ-Pass 1 הן מקור נתונים חשוב!
כלל 4: אם חסרה מידה — חובה לדלג! הוסף ל-skipped_elements.
כלל 5: ברזל זיון — חשב רק מנתונים מפורשים!
   משקלות מוטות (ק"ג/מ'):
   Ø8=0.395, Ø10=0.617, Ø12=0.888, Ø14=1.21, Ø16=1.58, Ø20=2.47, Ø22=2.98, Ø25=3.85, Ø28=4.83, Ø32=6.31

כלל 6: אם יש reinforcement_schedule (טבלת זיון) — חובה לחשב ברזל ממנה!
   חישוב: לכל שורה → כמות × (אורך_בס"מ / 100) × משקל_לפי_קוטר = ק"ג
   סכום כל השורות = סה"כ ברזל (ק"ג), המר לטון (÷1000)
   צור שורה נפרדת לכל קוטר, ושורת סיכום כוללת!

כלל 7: חייב ליצור פריטים נפרדים לכל סוג עבודה:
   - בטון (מ"ק) — לפי מידות האלמנט
   - ברזל זיון (טון) — מטבלת הזיון
   - תבניות (מ"ר) — שטחי בטון חשוף
   - חפירה (מ"ק) — אם יסודות
   אל תדלג על ברזל/תבניות גם אם חסר מידע חלקי!

סוגי עבודה מותרים:
${allowedSections.map(s => `- ${s}`).join("\n")}

${isFinishing ? `
הנחיות ספציפיות לגמרים:
- בלוקים: אורך קיר × גובה קיר = מ"ר (ניכוי פתחים חלונות/דלתות)
- טיח: שטחי קירות (2 צדדים!) בניכוי פתחים
- צבע: שטחי קירות + תקרות
- ריצוף: שטח רצפה לפי חללים
- גבס: שטח מחיצות/תקרות גבס
- חלונות: רשום כל חלון בנפרד — אורך × רוחב (יחידה)
- דלתות: רשום כל דלת בנפרד — רוחב × גובה (יחידה)
- תקרות אקוסטיות: שטח (מ"ר)
` : ""}

סוג התכנית: ${pass1Data.plan_type}
קטגוריה: ${pass1Data.plan_type_category}

══════ הנתונים שנקראו מהתכנית (Pass 1) ══════
מקרא: ${JSON.stringify(pass1Data.legend || {}, null, 2)}
אלמנטים: ${JSON.stringify(pass1Data.elements, null, 2)}
חתכים: ${JSON.stringify(pass1Data.sections_cuts || [], null, 2)}
${reinfSchedule}
טבלאות: ${tablesSummary || "אין טבלאות"}
הערות: ${JSON.stringify(pass1Data.text_annotations, null, 2)}
פריטים לא ברורים: ${JSON.stringify(pass1Data.unclear_items, null, 2)}

══════ נוסחאות וסטנדרטים ══════
${formulasSection}${standardsSection}

החזר JSON:
{
  "calculated_items": [
    {
      "element_ref": "הפניה לאלמנט",
      "section": "סעיף",
      "section_name_he": "שם הסעיף",
      "item_number": "מספור (01.001)",
      "description": "תיאור מפורט",
      "unit": "m3 / m2 / ml / kg / ton / unit / lump_sum",
      "unit_name_he": "שם יחידה בעברית",
      "quantity": 0,
      "calculation_detail": "פירוט חישוב עם הפניות",
      "notes": "הערות",
      "standard_reference": "תקן אם רלוונטי"
    }
  ],
  "skipped_elements": [
    { "element_ref": "סימון", "reason": "סיבת הדילוג" }
  ],
  "calculation_notes": "סיכום"
}`;
}

// ═══════════════════════════════════════════════════════════
// PASS 3: תמחור
// ═══════════════════════════════════════════════════════════

export function buildPass3Prompt(pass2Data, priceTable) {
  return `אתה מהנדס בניין מומחה בתמחור עבודות בניה בישראל.

המשימה: הצמד מחירים לכמויות שחושבו בשלב קודם.
אל תשנה כמויות, תיאורים, או יחידות — רק הוסף מחירים.

הכמויות שחושבו:
${JSON.stringify(pass2Data.calculated_items, null, 2)}

מחירי שוק ישראל 2024-2025 (₪):
${priceTable}

הנחיות:
1. לכל פריט — מצא מחיר מתאים מטבלת המחירים
2. חשב total_price = quantity × unit_price — ודא שהכפל נכון!
3. אם אין מחיר מתאים — השתמש במחיר שוק סביר וציין "מחיר שוק משוער"
4. total_estimated_cost = סכום כל ה-total_price
5. אל תוסיף פריטים חדשים!
6. אל תשנה כמויות!

החזר JSON:
{
  "items": [
    {
      "section": "מ-Pass 2",
      "section_name_he": "מ-Pass 2",
      "item_number": "מ-Pass 2",
      "description": "מ-Pass 2",
      "unit": "מ-Pass 2",
      "unit_name_he": "מ-Pass 2",
      "quantity": "מ-Pass 2 (מספר!)",
      "unit_price": 0,
      "total_price": 0,
      "notes": "הפניה + בסיס המחיר",
      "standard_reference": "תקן אם רלוונטי"
    }
  ],
  "analysis_notes": "סיכום בעברית",
  "total_estimated_cost": 0
}`;
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

export function buildStandardsSection(standards) {
  if (!standards || standards.length === 0) return "";
  const active = standards.filter((s) => s.is_active);
  if (active.length === 0) return "";
  return `\n\nהגדרות תקנים מותאמות אישית:
${active.map((s) => {
  let line = `- סעיף "${s.section}" (${s.section_name_he}): תקן ${s.standard_reference}`;
  if (s.waste_factor) line += `, פחת: ${s.waste_factor}%`;
  if (s.description) line += `. ${s.description}`;
  if (s.custom_notes) line += `. הערת מהנדס: ${s.custom_notes}`;
  return line;
}).join("\n")}`;
}

export function buildFormulasSection(formulas) {
  if (formulas && formulas.length > 0) {
    const active = formulas.filter((f) => f.is_active);
    if (active.length > 0) {
      return active.map((f) => {
        let line = `- ${f.element_name_he}: ${f.formula}`;
        if (f.formula_description_he) line += ` (${f.formula_description_he})`;
        if (f.default_values) line += `. ${f.default_values}`;
        if (f.waste_factor) line += `. פחת: ${f.waste_factor}%`;
        return line;
      }).join("\n");
    }
  }
  return `נוסחאות בסיסיות (רק עם מידות מפורשות!):
- נפח בטון: אורך × רוחב × עובי
- שטח תבניות: היקף × גובה
- חפירה: שטח × עומק + תוספת שיפועים
- ברזל: קוטר → משקל/מ' × אורך × כמות
- כנפות: היקף × (אורך/ספייסינג + 1) × משקל/מ'
- בלוקים: אורך × גובה (ניכוי פתחים)
- טיח: שטחי קירות × 2 צדדים (ניכוי פתחים)
- צבע: שטחי קירות + תקרות
- ריצוף: שטח רצפה לפי חללים`;
}

// ═══════════════════════════════════════════════════════════
// PASS 0: חילוץ טבלאות ייעודי — לפני Pass 1
// ═══════════════════════════════════════════════════════════

export function buildPass0TablePrompt() {
  return `אתה מומחה לחילוץ טבלאות מתכניות הנדסיות ישראליות.

═══════════════════════════════════════════════════════════
המשימה: חפש וחלץ את כל הטבלאות שמופיעות בתכנית זו.
התמקד אך ורק בטבלאות — אל תנתח אלמנטים אחרים!
═══════════════════════════════════════════════════════════

סוגי טבלאות שיש לחפש:

🔷 לוח ברזל זיון (Reinforcement Schedule) — הכי חשוב!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
טבלה עם עמודות כמו: מס', סוג מוט (ST/SB/B), קוטר (Ø8-Ø32),
אורך (ס"מ), כמות, סה"כ אורך (מ'), משקל (ק"ג), דרגת ברזל
לכל שורה: row_number, bar_type, diameter_mm, length_cm, quantity,
total_length_m, weight_kg, steel_grade, notes

🔷 לוח דלתות (Door Schedule)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
טבלה עם עמודות: מס' דלת (N1/M1/A1), רוחב, גובה, סוג, חומר

🔷 לוח חלונות (Window Schedule)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
טבלה עם עמודות: מס' חלון, רוחב, גובה, סוג (אלומיניום/PVC)

🔷 כל טבלה אחרת שמופיעה בתכנית
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

כללים:
1. חלץ כל שורה מהטבלה — אל תדלג על שורות!
2. אם לא בטוח בערך — כתוב null
3. אם אין טבלאות — החזר מערכים ריקים

החזר JSON:
{
  "reinforcement_tables": [
    {
      "row_number": 1,
      "bar_type": "ST/SB/B וכו'",
      "diameter_mm": 10,
      "length_cm": 270,
      "quantity": 56,
      "total_length_m": null,
      "weight_kg": null,
      "steel_grade": "60/40 או null",
      "notes": null
    }
  ],
  "door_tables": [
    {
      "number": "N1",
      "width_cm": 120,
      "height_cm": 210,
      "type": "פנימית/כניסה/וכו'",
      "material": "עץ/פלדה/אלומיניום",
      "notes": null
    }
  ],
  "window_tables": [
    {
      "number": "M3",
      "width_cm": 150,
      "height_cm": 100,
      "type": "חלון קבוע/נפתח",
      "glazing": "כפולה/בודדת",
      "notes": null
    }
  ],
  "other_tables": [
    {
      "table_name": "שם הטבלה",
      "headers": ["עמודה1", "עמודה2"],
      "rows": [{}]
    }
  ]
}`;
}

// ═══════════════════════════════════════════════════════════
// PASS 1a: זיהוי מקרא וסוג תכנית בלבד
// ═══════════════════════════════════════════════════════════

export function buildPass1aLegendPrompt(extractedText, tableContext) {
  return `אתה מהנדס בניין ישראלי מומחה. תפקידך עכשיו הוא לזהות את מבנה התכנית בלבד.

═══════════════════════════════════════════════════════════
המשימה: זהה את סוג התכנית ואת המקרא שלה — בלבד!
אל תחלץ אלמנטים! אל תנתח זיון! רק הבנה כללית!
═══════════════════════════════════════════════════════════

מה לזהות:
1. סוג התכנית: אדריכלית / קונסטרוקציה / יסודות / חתכים / משולבת
2. קנה מידה (Scale)
3. פרטי כותרת: שם פרויקט, מס' תכנית, תאריך, מתכנן
4. מקרא מלא: כל סימול גרפי ומשמעותו (עמודים, קורות, קירות, פתחים)
5. קודי חומרים (B20/B30/B40, 40/60 ברזל)
6. הערות מהנדס/אדריכל מבלוק ההערות
7. תיאור המערכת הקונסטרוקטיבית (רפסודה, שלד עמודים+קורות, וכו')

${tableContext ? `
טבלאות שנמצאו קודם (הכי אמינות):
${JSON.stringify(tableContext, null, 2)}` : ""}

${extractedText ? `
טקסט OCR (מקור אמת):
${extractedText.substring(0, 3000)}` : ""}

החזר JSON:
{
  "plan_type": "תיאור סוג התכנית",
  "plan_type_category": אחד מ ["foundations", "skeleton", "architectural", "sections", "combined", "other"],
  "scale": "1:100 וכו' או null",
  "title_info": {
    "project_name": null,
    "plan_number": null,
    "date": null,
    "designer": null
  },
  "legend": {
    "column_symbols": {},
    "beam_symbols": {},
    "foundation_symbols": {},
    "wall_symbols": {},
    "slab_symbols": {},
    "material_codes": {},
    "reinforcement_codes": {},
    "graphic_symbols": {},
    "other_symbols": {},
    "window_symbols": {},
    "door_symbols": {}
  },
  "material_codes": [],
  "engineer_notes": [],
  "structural_system": "תיאור המערכת הקונסטרוקטיבית"
}`;
}

// ═══════════════════════════════════════════════════════════
// PASS 1b: חילוץ אלמנטים עם הקשר מלא מ-Pass 1a ו-Pass 0
// ═══════════════════════════════════════════════════════════

export function buildPass1bElementsPrompt(engineerProfile, workType, categories, extractedText, pass1aContext, tableContext) {
  const profileContext = engineerProfile ? `
══════ פרופיל מהנדס ══════
${engineerProfile.designer_name ? `מתכנן: ${engineerProfile.designer_name}` : ""}
${(engineerProfile.correction_history || []).length > 0 ? `
⚠️ טעויות חוזרות מעבר — שים לב:
${engineerProfile.correction_history.slice(-10).map(c => `- ${c}`).join("\n")}` : ""}
` : "";

  const isConstruction = workType === "construction" || workType === "both";
  const isFinishing = workType === "finishing" || workType === "both";

  const focusInstructions = [];
  if (isConstruction) {
    focusInstructions.push(`פוקוס קונסטרוקציה: ${(categories || []).filter(c => ["concrete","steel","formwork","piles"].includes(c)).join(", ")}`);
  }
  if (isFinishing) {
    focusInstructions.push(`פוקוס גמרים: ${(categories || []).filter(c => ["blocks","plaster","paint","tiling","gypsum","windows","doors","acoustic_ceiling"].includes(c)).join(", ")}`);
  }

  const legendSummary = pass1aContext ? `
╔═══════════════════════════════════════════════════════════╗
║  🗺️  הקשר תכנית — נקבע ב-Pass 1a (השתמש בו!)             ║
╚═══════════════════════════════════════════════════════════╝
סוג תכנית: ${pass1aContext.plan_type} (${pass1aContext.plan_type_category})
קנה מידה: ${pass1aContext.scale || "לא ידוע"}
מערכת קונסטרוקטיבית: ${pass1aContext.structural_system || "לא ידוע"}

מקרא התכנית (ספציפי לתכנית זו!):
${JSON.stringify(pass1aContext.legend || {}, null, 2)}

קודי חומרים: ${(pass1aContext.material_codes || []).join(", ") || "לא זוהו"}
הערות מהנדס: ${(pass1aContext.engineer_notes || []).join(" | ") || "אין"}
` : "";

  const tableContextStr = tableContext ? `
╔═══════════════════════════════════════════════════════════╗
║  📋 טבלאות מ-Pass 0 — מקור אמת לזיון, דלתות, חלונות!     ║
╚═══════════════════════════════════════════════════════════╝
${JSON.stringify(tableContext, null, 2)}
` : "";

  return `אתה מהנדס בניין וקונסטרוקטור ישראלי מומחה עם 30+ שנות ניסיון.

═══════════════════════════════════════════════════════════
המשימה: חלץ את כל האלמנטים ההנדסיים מהתכנית — ברמה מקסימלית.
אסור לחשב כמויות! אסור להמציא! רק לקרוא!
═══════════════════════════════════════════════════════════

${profileContext}

סוג עבודה: ${workType === "construction" ? "קונסטרוקציה" : workType === "finishing" ? "גמרים" : "קונסטרוקציה + גמרים"}
קטגוריות: ${(categories || []).join(", ")}
${focusInstructions.join(" | ")}

${legendSummary}
${tableContextStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
שלב 3: קריאת טבלאות זיון — קריטי!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${tableContext?.reinforcement_tables?.length > 0
  ? `⚠️ טבלת זיון כבר חולצה ב-Pass 0! העתק את כל השורות ל-reinforcement_schedule.`
  : `חפש טבלת זיון (Reinforcement Schedule) עם מס', סוג מוט (ST/SB/B), קוטר, אורך, כמות, משקל.
לכל שורה: row_number, bar_type, diameter_mm, length_cm, quantity, total_length_m, weight_kg.`}

בנוסף — חלץ ברזל מסימונים על האלמנטים:
- קורות: 2Ø12 ב.ע L=520, 3Ø14 ב.ת L=465
- תקרות: #Ø10@20 ע, Ø12@15 ב.ת
- חישוקים: Ø8@20 L=130

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
שלב 4: קריאת כל אלמנט הנדסי — ברמה מקסימלית
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
לכל אלמנט חלץ: id, type, count, is_typical, grid_location, dimensions (כל מידה), material, reinforcement (פרטי זיון מלאים), notes.

${isFinishing ? `חלונות ודלתות:
${tableContext?.door_tables?.length > 0 ? `דלתות ידועות מ-Pass 0: ${JSON.stringify(tableContext.door_tables)}` : "חלץ כל דלת: id, מידות, סוג, חומר"}
${tableContext?.window_tables?.length > 0 ? `חלונות ידועים מ-Pass 0: ${JSON.stringify(tableContext.window_tables)}` : "חלץ כל חלון: id, מידות, סוג, glazing"}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
שלב 5: קריאת הערות הקונסטרוקטור / האדריכל
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
חפש הנחיות: סוג בטון, כיסוי, עומסים, הנחיות ביצוע, הפניות לתקנים (ת"י 466).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
שלב 6: ספירת אלמנטים
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ספור כמה פעמים כל סוג אלמנט מופיע. סמן חוזרים (typical) ויחודיים.

כללים קריטיים:
1. אם מידה לא רשומה — כתוב null. לעולם אל תנחש!
2. אל תחשב כמויות — רק תרשום מה אתה רואה!
3. טבלת זיון חייבת להיקרא שורה-שורה — אל תדלג!
4. זהה נכון: שריגה אלכסונית = בטון, ריק = בלוק!
5. השתמש במקרא מ-Pass 1a לפירוש סימולים ספציפיים לתכנית זו!

${extractedText ? `
╔═══════════════════════════════════════════════════════════╗
║  🔒 מקור אמת ראשי — OCR ישיר מה-PDF                       ║
║  כאשר יש סתירה בין הטקסט לתמונות — הטקסט מנצח!           ║
╚═══════════════════════════════════════════════════════════╝
${extractedText}` : ""}

החזר JSON באותו מבנה של Pass 1 (elements, reinforcement_schedule, sections_cuts, tables, text_annotations, unclear_items, confidence_notes, detected_patterns).`;
}

export function buildPriceTable(prices) {
  if (prices && prices.length > 0) {
    const active = prices.filter((p) => p.is_active);
    if (active.length > 0) {
      return active
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((p) => `- ${p.item_name_he} (${p.unit_name_he}): ${p.price} ₪`)
        .join("\n");
    }
  }
  return `מחירי שוק (₪):
— קונסטרוקציה —
- חפירה (מ"ק): 35
- מילוי חוזר (מ"ק): 25
- בטון ניקיון B15 (מ"ק): 450
- בטון B30 (מ"ק): 750
- בטון B40 (מ"ק): 900
- ברזל זיון (טון): 6500
- תבניות ליסודות (מ"ר): 120
- תבניות לעמודים (מ"ר): 180
- תבניות לקורות (מ"ר): 160
- תבניות לתקרה (מ"ר): 140
— גמרים —
- בלוקים 20 ס"מ (מ"ר): 120
- בלוקים 10 ס"מ (מ"ר): 85
- טיח פנימי (מ"ר): 65
- טיח חיצוני (מ"ר): 85
- צבע פנימי (מ"ר): 25
- צבע חיצוני (מ"ר): 35
- ריצוף קרמיקה (מ"ר): 150
- ריצוף גרניט פורצלן (מ"ר): 200
- מחיצות גבס (מ"ר): 140
- תקרות גבס (מ"ר): 120
- תקרות אקוסטיות (מ"ר): 160
- חלון אלומיניום (יח'): 1800
- חלון PVC (יח'): 1200
- דלת פנימית עץ (יח'): 1500
- דלת כניסה (יח'): 4500
- משקופי בטון (מ"א): 150`;
}