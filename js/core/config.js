(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});

  WorkTrack.config = {
    appVersion: 2,
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
    tabs: [
      { id: "home", icon: "H", labelKey: "navHome", page: "home.html" },
      { id: "calendar", icon: "C", labelKey: "navCalendar", page: "calendar.html" },
      { id: "vault", icon: "V", labelKey: "navVault", page: "vault.html" },
      { id: "report", icon: "R", labelKey: "navReport", page: "report.html" }
    ],
    documentDefinitions: [
      { id: "contract", titleKey: "docContract", detailKey: "docContractDetail", icon: "DOC", required: true },
      { id: "payEvidence", titleKey: "docPayEvidence", detailKey: "docPayEvidenceDetail", icon: "PAY", required: true },
      { id: "passport", titleKey: "docPassport", detailKey: "docPassportDetail", icon: "ID", required: true },
      { id: "workProof", titleKey: "docWorkProof", detailKey: "docWorkProofDetail", icon: "TIME", required: false },
      { id: "health", titleKey: "docHealth", detailKey: "docHealthDetail", icon: "MED", required: false }
    ],
    requiredDocumentIds: ["contract", "payEvidence", "passport"]
  };
})(window);