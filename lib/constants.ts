export const CARE_ACTIONS = [
  {
    action: "water",
    label: "Water",
    icon: "💧",
    defaultInterval: 7,
    enabledByDefault: true,
  },
  {
    action: "fertilize",
    label: "Fertilize",
    icon: "🧪",
    defaultInterval: 30,
    enabledByDefault: false,
  },
  {
    action: "repot",
    label: "Repot",
    icon: "🪴",
    defaultInterval: 365,
    enabledByDefault: false,
  },
  {
    action: "prune",
    label: "Prune",
    icon: "✂️",
    defaultInterval: 90,
    enabledByDefault: false,
  },
  {
    action: "mist",
    label: "Mist",
    icon: "🌫️",
    defaultInterval: 2,
    enabledByDefault: false,
  },
  {
    action: "rotate",
    label: "Rotate",
    icon: "🔄",
    defaultInterval: 14,
    enabledByDefault: false,
  },
] as const;
