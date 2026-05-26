(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});

  WorkTrack.config = {
    appVersion: 4,
    storageKey: "worktrack-capstone-state-v2",
    legacyStorageKey: "worktrack-capstone-state-v1",
    pages: {
      login: "index.html",
      signup: "signup.html",
      home: "home.html",
      calendar: "calendar.html",
      vault: "vault.html",
      report: "report.html"
    },
    languages: [
      { code: "en", label: "English", flag: "🇺🇸", locale: "en-US" },
      { code: "ko", label: "한국어", flag: "🇰🇷", locale: "ko-KR" },
      { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", locale: "vi-VN" },
      { code: "th", label: "ไทย", flag: "🇹🇭", locale: "th-TH" },
      { code: "lo", label: "ລາວ", flag: "🇱🇦", locale: "lo-LA" },
      { code: "my", label: "မြန်မာ", flag: "🇲🇲", locale: "my-MM" },
      { code: "mn", label: "Монгол", flag: "🇲🇳", locale: "mn-MN" }
    ],
    countries: [
      {
        code: "us",
        languageCode: "en",
        flag: "🇺🇸",
        names: { en: "United States", ko: "미국", vi: "Hoa Kỳ", th: "สหรัฐอเมริกา", lo: "ສະຫະລັດ", my: "အမေရိကန်", mn: "АНУ" }
      },
      {
        code: "kr",
        languageCode: "ko",
        flag: "🇰🇷",
        names: { en: "South Korea", ko: "한국", vi: "Hàn Quốc", th: "เกาหลีใต้", lo: "ເກົາຫຼີໃຕ້", my: "တောင်ကိုရီးယား", mn: "Өмнөд Солонгос" }
      },
      {
        code: "vn",
        languageCode: "vi",
        flag: "🇻🇳",
        names: { en: "Vietnam", ko: "베트남", vi: "Việt Nam", th: "เวียดนาม", lo: "ຫວຽດນາມ", my: "ဗီယက်နမ်", mn: "Вьетнам" }
      },
      {
        code: "th",
        languageCode: "th",
        flag: "🇹🇭",
        names: { en: "Thailand", ko: "태국", vi: "Thái Lan", th: "ไทย", lo: "ໄທ", my: "ထိုင်း", mn: "Тайланд" }
      },
      {
        code: "la",
        languageCode: "lo",
        flag: "🇱🇦",
        names: { en: "Laos", ko: "라오스", vi: "Lào", th: "ลาว", lo: "ລາວ", my: "လာအို", mn: "Лаос" }
      },
      {
        code: "mm",
        languageCode: "my",
        flag: "🇲🇲",
        names: { en: "Myanmar", ko: "미얀마", vi: "Myanmar", th: "เมียนมา", lo: "ມຽນມາ", my: "မြန်မာ", mn: "Мьянмар" }
      },
      {
        code: "mn",
        languageCode: "mn",
        flag: "🇲🇳",
        names: { en: "Mongolia", ko: "몽골", vi: "Mông Cổ", th: "มองโกเลีย", lo: "ມົງໂກລີ", my: "မွန်ဂိုလီးယား", mn: "Монгол" }
      }
    ],
    tabs: [
      { id: "home", icon: "home", labelKey: "navHome", page: "home.html" },
      { id: "calendar", icon: "calendar", labelKey: "navCalendar", page: "calendar.html" },
      { id: "vault", icon: "vault", labelKey: "navVault", page: "vault.html" },
      { id: "report", icon: "report", labelKey: "navReport", page: "report.html" }
    ],
    documentDefinitions: [
      { id: "contract", titleKey: "docContract", detailKey: "docContractDetail", icon: "file-text", required: true },
      { id: "payEvidence", titleKey: "docPayEvidence", detailKey: "docPayEvidenceDetail", icon: "cash", required: true },
      { id: "passport", titleKey: "docPassport", detailKey: "docPassportDetail", icon: "id-card", required: true },
      { id: "workProof", titleKey: "docWorkProof", detailKey: "docWorkProofDetail", icon: "clock", required: true },
      { id: "health", titleKey: "docHealth", detailKey: "docHealthDetail", icon: "medical", required: true }
    ],
    requiredDocumentIds: ["contract", "payEvidence", "passport", "workProof", "health"]
  };
})(window);
