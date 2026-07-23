export type PlaceCategory = "home" | "class" | "food" | "study" | "landmark";

export type PlaceSource = {
  label: string;
  url: string;
  checkedAt: string;
};

export type Place = {
  id: string;
  name: string;
  shortName: string;
  category: PlaceCategory;
  categoryLabel: string;
  coordinates: [number, number];
  room?: string;
  address?: string;
  summary: string;
  facts: string[];
  source: PlaceSource;
  confidence: "verified" | "cross-checked" | "review";
  markerLabel: string;
  links?: Array<{ label: string; url: string }>;
};

export const CATEGORY_META: Record<
  PlaceCategory,
  { label: string; color: string; soft: string }
> = {
  home: { label: "宿舍", color: "#d83b3e", soft: "#fff0ef" },
  class: { label: "上课", color: "#6755d9", soft: "#f1efff" },
  food: { label: "餐饮", color: "#c36b14", soft: "#fff4e6" },
  study: { label: "自习", color: "#1769aa", soft: "#eaf4ff" },
  landmark: { label: "地标", color: "#0f7b6c", soft: "#e8f7f2" },
};

export const PLACES: Place[] = [
  {
    id: "edens-1a",
    name: "Edens Quad 1A",
    shortName: "Edens 1A",
    category: "home",
    categoryLabel: "宿舍 · 默认起点",
    coordinates: [35.99847, -78.93678],
    address: "419 Towerview Drive",
    summary: "你的默认路线起点。点位已按 Duke 官方地址与建筑轮廓交叉核验。",
    facts: [
      "洗衣房：1 楼，24 小时开放",
      "无障碍/全性别卫生间：1 楼 102T、103T",
      "邮件地址：419 Towerview Drive",
      "路线终点落在 1A 建筑边缘，抵达后请以现场入口为准",
    ],
    source: {
      label: "Duke Campus Mail + OSM building",
      url: "https://postoffice.duke.edu/addressing-mail/dormitory-street-addresses/",
      checkedAt: "2026-07-23",
    },
    confidence: "cross-checked",
    markerLabel: "1A",
    links: [
      {
        label: "官方洗衣房信息",
        url: "https://www.dukestores.duke.edu/index.php/laundry/",
      },
      {
        label: "Edens 楼层图",
        url: "https://students.duke.edu/living/housing/upperclass-housing/upperclass-floor-plans/",
      },
    ],
  },
  {
    id: "physics",
    name: "Physics Building",
    shortName: "Physics",
    category: "class",
    categoryLabel: "数学课",
    coordinates: [36.003137, -78.942266],
    room: "235",
    address: "120 Science Drive",
    summary: "MATH 333 与候补 MATH 431 都在 Physics 235，换课不需要改变路线。",
    facts: [
      "MATH 333 · Complex Analysis",
      "MATH 431 · Real Analysis（候补）",
      "点位来自 Physics Building 主大厅官方 ePrint 坐标",
    ],
    source: {
      label: "Duke ePrint · Physics Lobby",
      url: "https://eprint.oit.duke.edu/printers/1081",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "P",
  },
  {
    id: "social-sciences",
    name: "Social Sciences Building",
    shortName: "Social Sciences",
    category: "class",
    categoryLabel: "全球健康课",
    coordinates: [36.001843, -78.937277],
    room: "136",
    address: "419 Chapel Drive",
    summary: "GLHLTH 101 的上课地点。点位取自楼内官方设备坐标。",
    facts: [
      "GLHLTH 101",
      "周一、周三 10:05–11:20",
      "教室：Social Sciences 136",
    ],
    source: {
      label: "Duke ePrint · SocSci 211",
      url: "https://eprint.oit.duke.edu/printers/73",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "S",
  },
  {
    id: "french-science",
    name: "French Family Science Center",
    shortName: "French Science",
    category: "class",
    categoryLabel: "会计课",
    coordinates: [36.002862, -78.943388],
    room: "2231",
    summary: "Financial Accounting 174 的计划地点。课程 section 与教室仍应以 DukeHub 为最终依据。",
    facts: [
      "Financial Accounting 174",
      "周二、周四 8:30–9:45",
      "教室：French Science 2231",
      "楼内全性别卫生间分布在低层及 1–3 楼",
    ],
    source: {
      label: "Duke ePrint · FFSC Lower Level",
      url: "https://eprint.oit.duke.edu/printers/1066",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "F",
  },
  {
    id: "languages",
    name: "Languages Building",
    shortName: "Languages",
    category: "class",
    categoryLabel: "韩语课",
    coordinates: [36.002133, -78.938161],
    summary: "KOREAN 101 的备选地点。具体 section、时间和教室需在 DukeHub 最终确认。",
    facts: [
      "KOREAN 101",
      "备选：周一、周三、周五 11:45–13:00",
      "地点坐标来自 Romance Languages 楼内官方设备",
    ],
    source: {
      label: "Duke ePrint · Romance Languages",
      url: "https://eprint.oit.duke.edu/printers/158",
      checkedAt: "2026-07-23",
    },
    confidence: "review",
    markerLabel: "L",
  },
  {
    id: "bryan-center",
    name: "Bryan Center",
    shortName: "Bryan Center",
    category: "food",
    categoryLabel: "餐饮与生活",
    coordinates: [36.001139, -78.941588],
    address: "125 Science Drive",
    summary: "2026 年官方餐饮名单已更新；旧版中的 Panda、Twinnie's 与 Starbucks 不再作为当前 Bryan 清单。",
    facts: [
      "Beyu Blue Coffee · Bryan 外、Duke Store 入口附近",
      "McDonald's · 2 楼",
      "Gothic Grill · 2 楼",
      "It's Thyme · Plaza Level",
      "ePrint：Lower Level；ATM/Vending Room 另有打印机",
    ],
    source: {
      label: "Duke ePrint · Bryan Lower Level",
      url: "https://eprint.oit.duke.edu/printers/142",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "B",
    links: [
      {
        label: "查看官方餐饮与菜单",
        url: "https://students.duke.edu/living/dining/dining-locations/",
      },
    ],
  },
  {
    id: "brodhead",
    name: "Brodhead Center",
    shortName: "Brodhead",
    category: "food",
    categoryLabel: "主餐饮中心",
    coordinates: [36.000728, -78.939136],
    summary: "原 West Union。适合课间吃饭，餐厅选择比 Bryan Center 更集中。",
    facts: [
      "主要餐饮中心，多层分布",
      "Ground Floor 058T 有全性别卫生间",
      "2 楼 Vending Room 有 ePrint",
      "营业时间与菜单以 Duke Dining 当天信息为准",
    ],
    source: {
      label: "Duke ePrint · Brodhead Center",
      url: "https://eprint.oit.duke.edu/printers/899",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "D",
    links: [
      {
        label: "查看官方餐饮与菜单",
        url: "https://students.duke.edu/living/dining/dining-locations/",
      },
    ],
  },
  {
    id: "perkins",
    name: "Perkins Library",
    shortName: "Perkins",
    category: "study",
    categoryLabel: "长时间自习",
    coordinates: [36.003264, -78.938178],
    summary: "适合数学作业和长时间学习。与 Bostock 相连。",
    facts: [
      "1 楼 Lobby / Breezeway 有多台 ePrint",
      "地下层 The Link 有 OIT 服务台",
      "开放时间会随学期变化",
    ],
    source: {
      label: "Duke ePrint · Perkins Lobby",
      url: "https://eprint.oit.duke.edu/printers/186",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "K",
    links: [
      {
        label: "Duke Libraries",
        url: "https://library.duke.edu/",
      },
    ],
  },
  {
    id: "bostock",
    name: "Bostock Library",
    shortName: "Bostock",
    category: "study",
    categoryLabel: "安静自习",
    coordinates: [36.002903, -78.938339],
    summary: "靠近 Perkins，适合课间停留和安静学习。",
    facts: [
      "The Edge 有黑白和彩色 ePrint",
      "与 Perkins 直接相连",
      "点位来自 The Edge 官方设备坐标",
    ],
    source: {
      label: "Duke ePrint · Bostock Edge",
      url: "https://eprint.oit.duke.edu/printers/172",
      checkedAt: "2026-07-23",
    },
    confidence: "verified",
    markerLabel: "O",
  },
  {
    id: "duke-chapel",
    name: "Duke Chapel",
    shortName: "Chapel",
    category: "landmark",
    categoryLabel: "方向参照",
    coordinates: [36.0018682, -78.9402861],
    summary: "West Campus 最清晰的方向参照点。",
    facts: [
      "从 Chapel 向西南可到 Bryan Center",
      "向东南可到 Brodhead 与 Social Sciences",
      "建筑点位使用 OpenStreetMap 并对照 Duke 官方校园图",
    ],
    source: {
      label: "Duke Campus Map + OpenStreetMap",
      url: "https://maps.duke.edu/",
      checkedAt: "2026-07-23",
    },
    confidence: "cross-checked",
    markerLabel: "C",
  },
];

export const FALL_2026_PLAN = [
  {
    day: "周一 / 周三",
    items: [
      { time: "10:05", course: "GLHLTH 101", placeId: "social-sciences" },
      { time: "11:45", course: "KOREAN 101 · 备选", placeId: "languages" },
    ],
  },
  {
    day: "周二 / 周四",
    items: [
      { time: "08:30", course: "FIN ACCOUNTING 174", placeId: "french-science" },
      { time: "待确认", course: "MATH 333 / 431", placeId: "physics" },
    ],
  },
];

export const OFFICIAL_LINKS = [
  { label: "Duke 官方校园地图", url: "https://maps.duke.edu/" },
  { label: "TransLoc 实时校车", url: "https://duke.transloc.com/" },
  {
    label: "Duke Dining 实时菜单",
    url: "https://students.duke.edu/living/dining/dining-locations/",
  },
  { label: "Duke ePrint 状态", url: "https://eprint.oit.duke.edu/" },
];
