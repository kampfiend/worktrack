(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});

  const localizedDates = {
    en: {
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    ko: {
      months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      shortMonths: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      weekdays: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    },
    vi: {
      months: ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"],
      shortMonths: ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"],
      weekdays: ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    },
    th: {
      months: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
      shortMonths: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      weekdays: ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"]
    },
    lo: {
      months: ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"],
      shortMonths: ["ມ.ກ.", "ກ.ພ.", "ມີ.ນ.", "ມ.ສ.", "ພ.ພ.", "ມິ.ຖ.", "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ.", "ທ.ວ."],
      weekdays: ["ວັນອາທິດ", "ວັນຈັນ", "ວັນອັງຄານ", "ວັນພຸດ", "ວັນພະຫັດ", "ວັນສຸກ", "ວັນເສົາ"]
    },
    my: {
      months: ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"],
      shortMonths: ["ဇန်", "ဖေ", "မတ်", "ဧ", "မေ", "ဇွန်", "ဇူ", "ဩ", "စက်", "အောက်", "နို", "ဒီ"],
      weekdays: ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"]
    },
    mn: {
      months: ["нэгдүгээр сар", "хоёрдугаар сар", "гуравдугаар сар", "дөрөвдүгээр сар", "тавдугаар сар", "зургаадугаар сар", "долдугаар сар", "наймдугаар сар", "есдүгээр сар", "аравдугаар сар", "арван нэгдүгээр сар", "арван хоёрдугаар сар"],
      shortMonths: ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"],
      weekdays: ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"]
    }
  };

  const shortWeekdays = {
    en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
    lo: ["ອາ", "ຈ", "ອັ", "ພ", "ພຫ", "ສຸ", "ສະ"],
    my: ["နွေ", "လာ", "ဂါ", "ဟူး", "ကြာ", "သော", "နေ"],
    mn: ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"]
  };

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function toMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function parseMonthKey(key) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function toTimeValue(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function inferStartTime(endDate, elapsedMs) {
    return toTimeValue(new Date(endDate.getTime() - elapsedMs));
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  function formatDate(date, options = {}) {
    const language = WorkTrack.i18n?.languageMeta(WorkTrack.state?.get()?.profile?.language || "en").code || "en";
    const labels = localizedDates[language];
    if (!labels) {
      const locale = WorkTrack.i18n.languageMeta(language).locale;
      return date.toLocaleDateString(locale, options);
    }
    return formatLocalizedDate(date, options, language, labels);
  }

  function formatLocalizedDate(date, options, language, labels) {
    const monthName = monthLabel(date, options, labels);
    const weekday = options.weekday ? labels.weekdays[date.getDay()] : "";
    const day = options.day ? String(date.getDate()) : "";
    const year = options.year ? String(date.getFullYear()) : "";

    if (weekday && monthName && day && !year) return joinParts([weekday, dateWithoutYear(language, monthName, day)], ", ");
    if (monthName && day && year) return fullDate(language, year, monthName, day);
    if (monthName && year) return monthYear(language, year, monthName);
    if (monthName && day) return dateWithoutYear(language, monthName, day);
    if (weekday) return weekday;
    if (monthName) return monthName;
    if (year) return year;
    if (day) return day;
    return toDateKey(date);
  }

  function monthLabel(date, options, labels) {
    if (!options.month) return "";
    return options.month === "short" ? labels.shortMonths[date.getMonth()] : labels.months[date.getMonth()];
  }

  function fullDate(language, year, monthName, day) {
    if (language === "ko") return `${year}년 ${monthName} ${day}일`;
    if (language === "vi") return `${day} ${monthName}, ${year}`;
    if (language === "th") return `${day} ${monthName} ${year}`;
    if (language === "lo") return `${day} ${monthName} ${year}`;
    if (language === "my") return `${year} ${monthName} ${day}`;
    if (language === "mn") return `${year} оны ${monthName} ${day}`;
    return `${monthName} ${day}, ${year}`;
  }

  function monthYear(language, year, monthName) {
    if (language === "ko") return `${year}년 ${monthName}`;
    if (language === "mn") return `${year} оны ${monthName}`;
    if (language === "my") return `${year} ${monthName}`;
    return `${monthName} ${year}`;
  }

  function dateWithoutYear(language, monthName, day) {
    if (["ko"].includes(language)) return `${monthName} ${day}일`;
    if (["vi", "th", "lo"].includes(language)) return `${day} ${monthName}`;
    return `${monthName} ${day}`;
  }

  function joinParts(parts, separator) {
    return parts.filter(Boolean).join(separator);
  }

  function weekdayLabels(style = "short") {
    const language = WorkTrack.i18n?.languageMeta(WorkTrack.state?.get()?.profile?.language || "en").code || "en";
    const labels = localizedDates[language] || localizedDates.en;
    if (style === "long") return labels.weekdays;
    return shortWeekdays[language] || shortWeekdays.en;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function daysUntilPayday(date, payday) {
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let target = new Date(date.getFullYear(), date.getMonth(), Math.min(payday, daysInMonth(date)));
    if (target < today) {
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      target = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(payday, daysInMonth(nextMonth)));
    }
    return Math.round((target - today) / 86400000);
  }

  WorkTrack.date = {
    toDateKey,
    parseDateKey,
    toMonthKey,
    parseMonthKey,
    toTimeValue,
    inferStartTime,
    formatDuration,
    formatDate,
    weekdayLabels,
    addDays,
    daysUntilPayday
  };
})(window);
