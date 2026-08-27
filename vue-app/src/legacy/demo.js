const DEMO_STREAM = [
  { type: "scene", no: "03", time: "8月26日 18:42", place: "海口·秀英区 出租屋", weather: "台风 阵风12级", who: ["林晚（你）"], beat: "窗外铁皮在响，灯闪了两下" },
  { type: "notice", from: "天气预警", title: "海南省气象台发布台风紧急预警", text: "海口、文昌、琼海今夜有 12 级阵风，请避免外出。" },
  { type: "weibo_hot", items: [
    { title: "广东提醒高层住宅注意防风", heat: "980万", tag: "爆" },
    { title: "台风摩羯登陆海南", heat: "856万", tag: "爆" },
    { title: "海南发布紧急通知非必要不出门", heat: "723万", tag: "热" },
    { title: "广西启动防台风一级响应", heat: "567万", tag: "热" },
    { title: "海口市民抢购物资", heat: "489万", tag: "新" }
  ]},
  { type: "moments", name: "海口同城会", time: "2分钟前", text: "今晚千万别出门。", image: "货架空了，矿泉水和泡面所剩无几", place: "海口·秀英区", likes: ["椰风不凉", "雨下了一整晚", "不吃香菜人士"], comments: [
    { name: "椰风不凉", text: "楼下小卖部就剩两包盐了" },
    { name: "雨下了一整晚", text: "今年这个台风属实有点猛" },
    { name: "不吃香菜人士", reply_to: "椰风不凉", text: "先别出门" }
  ]},
  { type: "stamp", text: "今天 18:43" },
  { type: "wechat_sys", text: "海口同城会 邀请 椰风不凉 加入群聊" },
  { type: "wechat_group", group: "海南台风互助", name: "海口同城会", text: "今晚别出门，秀英风已经很大了" },
  { type: "wechat_group", name: "椰风不凉", text: "楼下停水了吗" },
  { type: "wechat_group", name: "雨下了一整晚", at: "海口同城会", text: "还能买到水吗" },
  { type: "order", app: "美团", shop: "琼香鸡饭 · 秀英店", status: "配送中", eta: "预计 18:46 送达", dishes: ["招牌鸡腿饭 ×1", "加蛋 ×1"], price: "¥28.6", address: "秀英区某小区 3栋", rider: "阿坤　3分钟前已取餐" },
  { type: "say", name: "林晚", said: "别出门，今晚风太大。", thought: "其实门一响自己也想跑" },
  { type: "stats", items: [{ name: "信任", value: 37 }, { name: "恐惧", value: 54 }] }
];

const DEMO_JSON = [
  { type: "scene", no: "04", time: "8月26日 19:01", place: "楼梯口", weather: "台风", who: ["林晚（你）", "海口同城会"], beat: "应急灯只剩一条白缝" },
  { type: "call", from: "海口同城会", channel: "微信视频", status: "响铃中" },
  { type: "say", name: "林晚", said: "你先挂吧。", thought: "别挂" }
];

const QUICK = [
  ["看热搜", { type: "weibo_hot", items: [
    { title: "海口多处路树倒塌", heat: "612万", tag: "爆" },
    { title: "居民楼窗户被掀翻", heat: "401万", tag: "热" },
    { title: "谁还在点外卖", heat: "188万", tag: "新" }
  ]}],
  ["来短信", { type: "sms", from: "美团", text: "验证码 184726，5分钟内有效。请勿泄露给他人。" }],
  ["刷抖音", { type: "douyin", name: "海口同城会", text: "今晚的海口，风比人响。", image: "骑楼街空无一人，招牌被吹歪", music: "原声 · 海口同城会", likes: "12.8万", replies: "8604", reposts: "2.1万", favs: "1.4万", comments: [
    { name: "椰风不凉", text: "这风声也太假了吧，滤镜？" },
    { name: "雨下了一整晚", text: "假什么假，秀英现在窗都在抖" },
    { name: "不吃香菜人士", text: "别出门挑刺了，先回家" }
  ]}],
  ["微博正文", { type: "weibo_post", name: "海口同城会", time: "今天 18:03", from: "微博视频", text: "超市货架都空了，矿泉水泡面抢得最快。大家别慌，海口不缺物资，但今晚千万别出门。", likes: "4.2万", replies: "8906", reposts: "2103", comments: [
    { name: "椰风不凉", text: "楼下小卖部就剩两包盐，老板自己都愣住了" },
    { name: "雨下了一整晚", text: "海南人年年抗台风，今年这个属实有点猛" }
  ]}],
  ["私聊", { type: "wechat_private", name: "海口同城会", text: "你那边窗户关好了吗" }]
];
