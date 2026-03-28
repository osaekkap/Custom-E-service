// ─── Master Reference Data ──────────────────────────────────────
// Country, Currency, Unit, Port, Transport codes for customs declarations
// Sources: ISO 3166, ISO 4217, UN/ECE Rec20, UN/LOCODE, Thai Customs

// ─── Country Codes (ISO 3166-1 alpha-2) — Top trading partners ──
export const COUNTRIES = [
  { code:"TH", name:"Thailand",          nameTh:"ไทย" },
  { code:"CN", name:"China",             nameTh:"จีน" },
  { code:"JP", name:"Japan",             nameTh:"ญี่ปุ่น" },
  { code:"US", name:"United States",     nameTh:"สหรัฐอเมริกา" },
  { code:"DE", name:"Germany",           nameTh:"เยอรมนี" },
  { code:"KR", name:"South Korea",       nameTh:"เกาหลีใต้" },
  { code:"SG", name:"Singapore",         nameTh:"สิงคโปร์" },
  { code:"MY", name:"Malaysia",          nameTh:"มาเลเซีย" },
  { code:"VN", name:"Vietnam",           nameTh:"เวียดนาม" },
  { code:"ID", name:"Indonesia",         nameTh:"อินโดนีเซีย" },
  { code:"IN", name:"India",             nameTh:"อินเดีย" },
  { code:"AU", name:"Australia",         nameTh:"ออสเตรเลีย" },
  { code:"GB", name:"United Kingdom",    nameTh:"สหราชอาณาจักร" },
  { code:"FR", name:"France",            nameTh:"ฝรั่งเศส" },
  { code:"NL", name:"Netherlands",       nameTh:"เนเธอร์แลนด์" },
  { code:"IT", name:"Italy",             nameTh:"อิตาลี" },
  { code:"AE", name:"United Arab Emirates", nameTh:"สหรัฐอาหรับเอมิเรตส์" },
  { code:"TW", name:"Taiwan",            nameTh:"ไต้หวัน" },
  { code:"HK", name:"Hong Kong",         nameTh:"ฮ่องกง" },
  { code:"PH", name:"Philippines",       nameTh:"ฟิลิปปินส์" },
  { code:"MM", name:"Myanmar",           nameTh:"เมียนมา" },
  { code:"LA", name:"Laos",              nameTh:"ลาว" },
  { code:"KH", name:"Cambodia",          nameTh:"กัมพูชา" },
  { code:"SA", name:"Saudi Arabia",      nameTh:"ซาอุดีอาระเบีย" },
  { code:"BR", name:"Brazil",            nameTh:"บราซิล" },
  { code:"MX", name:"Mexico",            nameTh:"เม็กซิโก" },
  { code:"CH", name:"Switzerland",       nameTh:"สวิตเซอร์แลนด์" },
  { code:"ES", name:"Spain",             nameTh:"สเปน" },
  { code:"IE", name:"Ireland",           nameTh:"ไอร์แลนด์" },
  { code:"NZ", name:"New Zealand",       nameTh:"นิวซีแลนด์" },
];

// ─── Currency Codes (ISO 4217) ──────────────────────────────────
export const CURRENCIES = [
  { code:"THB", name:"Thai Baht",        symbol:"฿",  nameTh:"บาท" },
  { code:"USD", name:"US Dollar",        symbol:"$",  nameTh:"ดอลลาร์สหรัฐ" },
  { code:"CNY", name:"Chinese Yuan",     symbol:"¥",  nameTh:"หยวน" },
  { code:"JPY", name:"Japanese Yen",     symbol:"¥",  nameTh:"เยน" },
  { code:"EUR", name:"Euro",             symbol:"€",  nameTh:"ยูโร" },
  { code:"GBP", name:"British Pound",    symbol:"£",  nameTh:"ปอนด์สเตอร์ลิง" },
  { code:"KRW", name:"South Korean Won", symbol:"₩",  nameTh:"วอน" },
  { code:"SGD", name:"Singapore Dollar", symbol:"S$", nameTh:"ดอลลาร์สิงคโปร์" },
  { code:"MYR", name:"Malaysian Ringgit",symbol:"RM", nameTh:"ริงกิต" },
  { code:"AUD", name:"Australian Dollar",symbol:"A$", nameTh:"ดอลลาร์ออสเตรเลีย" },
  { code:"HKD", name:"Hong Kong Dollar", symbol:"HK$",nameTh:"ดอลลาร์ฮ่องกง" },
  { code:"TWD", name:"New Taiwan Dollar",symbol:"NT$",nameTh:"ดอลลาร์ไต้หวัน" },
  { code:"INR", name:"Indian Rupee",     symbol:"₹",  nameTh:"รูปี" },
  { code:"AED", name:"UAE Dirham",       symbol:"د.إ",nameTh:"ดิรฮัม" },
  { code:"CHF", name:"Swiss Franc",      symbol:"CHF",nameTh:"ฟรังก์สวิส" },
];

// ─── Unit Codes (UN/ECE Recommendation 20) ──────────────────────
export const UNITS = [
  { code:"C62", name:"Unit/Piece",         nameTh:"ชิ้น/หน่วย" },
  { code:"KGM", name:"Kilogram",           nameTh:"กิโลกรัม" },
  { code:"GRM", name:"Gram",               nameTh:"กรัม" },
  { code:"TNE", name:"Tonne (1000 kg)",    nameTh:"ตัน" },
  { code:"MTR", name:"Metre",              nameTh:"เมตร" },
  { code:"MTK", name:"Square metre",       nameTh:"ตารางเมตร" },
  { code:"MTQ", name:"Cubic metre",        nameTh:"ลูกบาศก์เมตร" },
  { code:"LTR", name:"Litre",              nameTh:"ลิตร" },
  { code:"KLT", name:"Kilolitre",          nameTh:"กิโลลิตร" },
  { code:"PR",  name:"Pair",               nameTh:"คู่" },
  { code:"SET", name:"Set",                nameTh:"ชุด" },
  { code:"DZN", name:"Dozen",              nameTh:"โหล" },
  { code:"PKG", name:"Package",            nameTh:"หีบห่อ" },
  { code:"CT",  name:"Carat",              nameTh:"กะรัต" },
  { code:"KWH", name:"Kilowatt-hour",      nameTh:"กิโลวัตต์ชั่วโมง" },
  { code:"BG",  name:"Bag",                nameTh:"กระสอบ/ถุง" },
  { code:"BX",  name:"Box",                nameTh:"กล่อง" },
  { code:"RL",  name:"Roll",               nameTh:"ม้วน" },
  { code:"DR",  name:"Drum",               nameTh:"ถัง" },
  { code:"ST",  name:"Sheet",              nameTh:"แผ่น" },
];

// ─── Port Codes (UN/LOCODE) ─────────────────────────────────────
export const PORTS = [
  // Thailand
  { code:"THLCH", name:"Laem Chabang",          nameTh:"แหลมฉบัง",            country:"TH", type:"sea" },
  { code:"THBKK", name:"Bangkok Port (Klong Toey)", nameTh:"ท่าเรือกรุงเทพ (คลองเตย)", country:"TH", type:"sea" },
  { code:"THSGZ", name:"Songkhla",              nameTh:"สงขลา",               country:"TH", type:"sea" },
  { code:"THSRI", name:"Sri Racha",             nameTh:"ศรีราชา",              country:"TH", type:"sea" },
  { code:"THMNK", name:"Map Ta Phut",           nameTh:"มาบตาพุด",            country:"TH", type:"sea" },
  { code:"THBMK", name:"Suvarnabhumi Airport",  nameTh:"สนามบินสุวรรณภูมิ",    country:"TH", type:"air" },
  { code:"THDMK", name:"Don Mueang Airport",    nameTh:"สนามบินดอนเมือง",     country:"TH", type:"air" },
  { code:"THCHM", name:"Chiang Mai Airport",    nameTh:"สนามบินเชียงใหม่",    country:"TH", type:"air" },
  { code:"THSDN", name:"Sadao",                 nameTh:"สะเดา",               country:"TH", type:"land" },
  { code:"THMKM", name:"Mukdahan",              nameTh:"มุกดาหาร",            country:"TH", type:"land" },
  { code:"THNKP", name:"Nong Khai",             nameTh:"หนองคาย",             country:"TH", type:"land" },

  // China
  { code:"CNSHA", name:"Shanghai",              nameTh:"เซี่ยงไฮ้",           country:"CN", type:"sea" },
  { code:"CNSZX", name:"Shenzhen",              nameTh:"เซินเจิ้น",           country:"CN", type:"sea" },
  { code:"CNNGB", name:"Ningbo",                nameTh:"หนิงโป",              country:"CN", type:"sea" },
  { code:"CNQZH", name:"Qingdao",               nameTh:"ชิงเต่า",             country:"CN", type:"sea" },
  { code:"CNTXG", name:"Tianjin",               nameTh:"เทียนจิน",            country:"CN", type:"sea" },
  { code:"CNGZH", name:"Guangzhou",             nameTh:"กว่างโจว",            country:"CN", type:"sea" },

  // Japan
  { code:"JPYOK", name:"Yokohama",              nameTh:"โยโกฮาม่า",           country:"JP", type:"sea" },
  { code:"JPOSA", name:"Osaka",                 nameTh:"โอซาก้า",             country:"JP", type:"sea" },
  { code:"JPNGO", name:"Nagoya",                nameTh:"นาโกย่า",             country:"JP", type:"sea" },
  { code:"JPTYO", name:"Tokyo",                 nameTh:"โตเกียว",             country:"JP", type:"sea" },

  // Korea
  { code:"KRPUS", name:"Busan",                 nameTh:"ปูซาน",               country:"KR", type:"sea" },
  { code:"KRICN", name:"Incheon",               nameTh:"อินชอน",              country:"KR", type:"sea" },

  // Singapore / Malaysia
  { code:"SGSIN", name:"Singapore",             nameTh:"สิงคโปร์",            country:"SG", type:"sea" },
  { code:"MYPKG", name:"Port Klang",            nameTh:"พอร์ตกลัง",           country:"MY", type:"sea" },

  // Europe
  { code:"DEHAM", name:"Hamburg",                nameTh:"ฮัมบูร์ก",            country:"DE", type:"sea" },
  { code:"NLRTM", name:"Rotterdam",             nameTh:"รอตเทอร์ดัม",         country:"NL", type:"sea" },
  { code:"GBFXT", name:"Felixstowe",            nameTh:"เฟลิกซ์โทว์",         country:"GB", type:"sea" },
  { code:"IEDUB", name:"Dublin",                nameTh:"ดับลิน",              country:"IE", type:"sea" },
  { code:"DEFRA", name:"Frankfurt Airport",     nameTh:"สนามบินแฟรงก์เฟิร์ต", country:"DE", type:"air" },

  // USA
  { code:"USLAX", name:"Los Angeles",           nameTh:"ลอสแอนเจลิส",         country:"US", type:"sea" },
  { code:"USLGB", name:"Long Beach",            nameTh:"ลองบีช",              country:"US", type:"sea" },
  { code:"USNYC", name:"New York/New Jersey",   nameTh:"นิวยอร์ก",            country:"US", type:"sea" },

  // Others
  { code:"TWKHH", name:"Kaohsiung",             nameTh:"เกาสง",               country:"TW", type:"sea" },
  { code:"TWTPE", name:"Taipei (Taoyuan Airport)",nameTh:"ไทเป",              country:"TW", type:"air" },
  { code:"HKHKG", name:"Hong Kong",             nameTh:"ฮ่องกง",              country:"HK", type:"sea" },
  { code:"VNSGN", name:"Ho Chi Minh City",      nameTh:"โฮจิมินห์",           country:"VN", type:"sea" },
  { code:"AEJEA", name:"Jebel Ali",             nameTh:"เจเบลอาลี",           country:"AE", type:"sea" },
  { code:"INBOM", name:"Mumbai (JNPT)",         nameTh:"มุมไบ",               country:"IN", type:"sea" },
];

// ─── Transport Mode Codes (กรมศุลกากร / WCO) ───────────────────
export const TRANSPORT_MODES = [
  { code:"1", name:"Sea",                       nameTh:"ทางเรือ" },
  { code:"2", name:"Rail",                      nameTh:"ทางรถไฟ" },
  { code:"3", name:"Road",                      nameTh:"ทางรถยนต์/คนเดินทางบก" },
  { code:"4", name:"Air",                       nameTh:"ทางเครื่องบิน" },
  { code:"5", name:"Mail",                      nameTh:"ทางไปรษณีย์" },
  { code:"6", name:"Passenger (Air)",           nameTh:"ทางผู้โดยสารนำพาจากอากาศยาน" },
  { code:"7", name:"Pipeline/Transmission",     nameTh:"ทางท่อขนส่ง/สายส่งไฟฟ้า" },
  { code:"8", name:"Small Vessel/Coastal",      nameTh:"เรือเล็กทางทะเล/ทางเรือที่เข้าออกด่านศุลกากรทางบก" },
];

// ─── Package Type Codes (UN/ECE Recommendation 21) ──────────────
export const PACKAGE_TYPES = [
  { code:"CT", name:"Carton",                   nameTh:"กล่องกระดาษ" },
  { code:"PK", name:"Package",                  nameTh:"หีบห่อ" },
  { code:"BG", name:"Bag",                      nameTh:"ถุง/กระสอบ" },
  { code:"BX", name:"Box",                      nameTh:"กล่อง" },
  { code:"CS", name:"Case",                     nameTh:"ลัง" },
  { code:"DR", name:"Drum",                     nameTh:"ถัง" },
  { code:"PL", name:"Pallet",                   nameTh:"พาเลท" },
  { code:"RL", name:"Roll",                     nameTh:"ม้วน" },
  { code:"CR", name:"Crate",                    nameTh:"ลังไม้" },
  { code:"CY", name:"Cylinder",                 nameTh:"ถังทรงกระบอก" },
  { code:"TK", name:"Tank",                     nameTh:"ถังขนาดใหญ่" },
  { code:"CN", name:"Container",                nameTh:"ตู้คอนเทนเนอร์" },
  { code:"BL", name:"Bale",                     nameTh:"ห่อ" },
  { code:"JR", name:"Jar",                      nameTh:"ขวดโหล" },
  { code:"NE", name:"Unpacked/Unpackaged",      nameTh:"ไม่บรรจุหีบห่อ" },
];

// ─── Customs Port Codes (ด่านศุลกากร) ──────────────────────────
export const CUSTOMS_PORTS = [
  { code:"0100", name:"Bangkok Port (Klong Toey)", nameTh:"ด่านศุลกากรท่าเรือกรุงเทพ" },
  { code:"0109", name:"Bangkok Airport",           nameTh:"ด่านศุลกากรท่าอากาศยานกรุงเทพ" },
  { code:"0110", name:"Suvarnabhumi Airport",      nameTh:"ด่านศุลกากรท่าอากาศยานสุวรรณภูมิ" },
  { code:"0200", name:"Laem Chabang",              nameTh:"ด่านศุลกากรแหลมฉบัง" },
  { code:"0201", name:"Sri Racha",                 nameTh:"ด่านศุลกากรศรีราชา" },
  { code:"0300", name:"Map Ta Phut",               nameTh:"ด่านศุลกากรมาบตาพุด" },
  { code:"0400", name:"Songkhla",                  nameTh:"ด่านศุลกากรสงขลา" },
  { code:"0500", name:"Sadao",                     nameTh:"ด่านศุลกากรสะเดา" },
  { code:"0600", name:"Chiang Mai",                nameTh:"ด่านศุลกากรเชียงใหม่" },
  { code:"0700", name:"Chiang Saen",               nameTh:"ด่านศุลกากรเชียงแสน" },
  { code:"0800", name:"Nong Khai",                 nameTh:"ด่านศุลกากรหนองคาย" },
  { code:"0900", name:"Mukdahan",                  nameTh:"ด่านศุลกากรมุกดาหาร" },
  { code:"1000", name:"Nakhon Phanom",             nameTh:"ด่านศุลกากรนครพนม" },
  { code:"1100", name:"Aranyaprathet",             nameTh:"ด่านศุลกากรอรัญประเทศ" },
  { code:"1200", name:"Phuket",                    nameTh:"ด่านศุลกากรภูเก็ต" },
  { code:"1300", name:"Surat Thani",               nameTh:"ด่านศุลกากรสุราษฎร์ธานี" },
  { code:"1400", name:"Ranong",                    nameTh:"ด่านศุลกากรระนอง" },
  { code:"1500", name:"Don Mueang Airport",        nameTh:"ด่านศุลกากรท่าอากาศยานดอนเมือง" },
];

// ─── Cargo Type Codes (ประเภทสินค้า — XSD Seq.19) ──────────────
export const CARGO_TYPES = [
  { code:"1", name:"General Cargo",       nameTh:"สินค้าทั่วไป" },
  { code:"2", name:"Container Cargo",     nameTh:"สินค้าตู้คอนเทนเนอร์" },
  { code:"3", name:"Bulk Cargo",          nameTh:"สินค้าเทกอง" },
  { code:"4", name:"Liquid Bulk",         nameTh:"สินค้าเหลวเทกอง" },
  { code:"5", name:"Ro-Ro",              nameTh:"สินค้า Ro-Ro" },
  { code:"9", name:"Others",             nameTh:"อื่น ๆ" },
];

// ─── Incoterms (International Commercial Terms 2020) ────────────
export const INCOTERMS = [
  { code:"EXW", name:"Ex Works",                      group:"E" },
  { code:"FCA", name:"Free Carrier",                  group:"F" },
  { code:"FAS", name:"Free Alongside Ship",           group:"F" },
  { code:"FOB", name:"Free on Board",                 group:"F" },
  { code:"CFR", name:"Cost and Freight",              group:"C" },
  { code:"CIF", name:"Cost, Insurance and Freight",   group:"C" },
  { code:"CPT", name:"Carriage Paid To",              group:"C" },
  { code:"CIP", name:"Carriage and Insurance Paid To",group:"C" },
  { code:"DAP", name:"Delivered at Place",            group:"D" },
  { code:"DPU", name:"Delivered at Place Unloaded",   group:"D" },
  { code:"DDP", name:"Delivered Duty Paid",           group:"D" },
];

// ─── Nature of Transaction (ลักษณะธุรกรรม — กรมศุลกากร) ────────
export const NATURE_OF_TRANSACTION = [
  { code:"1", name:"Outright sale/purchase",      nameTh:"ซื้อขายขาด" },
  { code:"2", name:"Return of goods",             nameTh:"ส่งคืนสินค้า" },
  { code:"3", name:"Free of charge",              nameTh:"ไม่มีค่าตอบแทน" },
  { code:"4", name:"Temporary export/import",     nameTh:"ส่งออก/นำเข้าชั่วคราว" },
  { code:"5", name:"Processing/repair",           nameTh:"แปรรูป/ซ่อมแซม" },
  { code:"6", name:"After processing/repair",     nameTh:"หลังแปรรูป/ซ่อมแซม" },
  { code:"7", name:"Government/military",         nameTh:"รัฐบาล/กองทัพ" },
  { code:"8", name:"Financial leasing",           nameTh:"สัญญาเช่าทางการเงิน" },
  { code:"9", name:"Others",                      nameTh:"อื่น ๆ" },
];

// ─── Privilege Types (BOI / IEAT / Free Zone) ───────────────────
export const PRIVILEGE_TYPES = [
  { code:"BOI",      name:"Board of Investment",      nameTh:"คณะกรรมการส่งเสริมการลงทุน (BOI)" },
  { code:"IEAT",     name:"Industrial Estate Authority", nameTh:"การนิคมอุตสาหกรรม (กนอ.)" },
  { code:"FZ",       name:"Free Zone",                nameTh:"เขตปลอดอากร" },
  { code:"29BIS",    name:"Section 29 bis",           nameTh:"มาตรา 29 ทวิ" },
  { code:"REEXPORT", name:"Re-export",                nameTh:"ส่งกลับออกไป (Re-Export)" },
  { code:"REIMPORT", name:"Re-import",                nameTh:"นำกลับเข้ามา (Re-Import)" },
];
