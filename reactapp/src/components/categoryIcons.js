export const CATEGORY_FILTERS = [
  { value: "all", label: "Sve teme", icon: "all" },
  { value: "elektricni_automobili", label: "Elektricni automobili", icon: "elektricni_automobili" },
  { value: "oldtajmeri", label: "Oldtajmeri", icon: "oldtajmeri" },
  { value: "sportski", label: "Sportski", icon: "sportski" },
  { value: "odrzavanje_i_popravka", label: "Odrzavanje i popravka", icon: "odrzavanje_i_popravka" },
];

export const CATEGORY_LABELS = CATEGORY_FILTERS.filter((item) => item.value !== "all").reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

export const CATEGORY_ORDER = CATEGORY_FILTERS.filter((item) => item.value !== "all").map((item) => item.value);

export const CATEGORY_ICONS = {
  all: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="6" cy="8" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="16" r="2" fill="currentColor" />
      <circle cx="6" cy="16" r="2" fill="currentColor" opacity="0.55" />
      <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.55" />
    </svg>
  ),
  elektricni_automobili: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13 2l-9 12h7v8l9-12h-7V2z" fill="currentColor" />
    </svg>
  ),
  oldtajmeri: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 14h1.2l1.4-4.2A3 3 0 019.5 7h5a3 3 0 012.9 2.8L18.8 14H20a1 1 0 011 1v3h-2v2h-2v-2H7v2H5v-2H3v-3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  sportski: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 4h11l-3 3 3 3-3 3 3 3H6" fill="currentColor" opacity="0.9" />
    </svg>
  ),
  odrzavanje_i_popravka: (props = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 7.5a4.5 4.5 0 01-6.6 4.04L9 16.94V21H7v-3.06L3.56 14.5l1.42-1.42L7 15.1l4.46-4.46A4.5 4.5 0 0117.5 3a4.5 4.5 0 013.5 2.06L18 8.06 15.94 6l2.9-2.9A4.5 4.5 0 0121 7.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export const renderCategoryIcon = (key, props = {}) => {
  const Icon = CATEGORY_ICONS[key];
  return Icon ? <Icon {...props} /> : null;
};