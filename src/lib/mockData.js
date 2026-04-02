export const SHIPMENTS = [
  { id:"SH-2026-0234", type:"Export", vessel:"MSC AURORA V.124",    container:"MSCU7823410", hs:"8542.31.10", fob:"USD 128,450", status:"CLEARED",         date:"2026-03-18", items:14, nsw:"NSW-TH-2026-039180", consignee:"Samsung Electronics Korea", pod:"Busan, KR" },
  { id:"SH-2026-0235", type:"Export", vessel:"EVER GIVEN V.89",     container:"EISU4561230", hs:"8708.10.90", fob:"USD 87,200",  status:"NSW_PROCESSING",  date:"2026-03-19", items:8,  nsw:"NSW-TH-2026-039201", consignee:"Toyota Motor Thailand",     pod:"Yokohama, JP" },
  { id:"SH-2026-0236", type:"Import", vessel:"OOCL EUROPE V.32",    container:"OOLU6312870", hs:"8473.30.90", fob:"USD 45,600",  status:"CUSTOMS_REVIEW",  date:"2026-03-19", items:22, nsw:"NSW-TH-2026-039215", consignee:"ไทยอิเล็กทรอนิกส์",        pod:"Laem Chabang, TH" },
  { id:"SH-2026-0237", type:"Export", vessel:"COSCO PRIDE V.67",    container:"CSNU5012340", hs:"8542.31.10", fob:"USD 234,100", status:"SUBMITTED",       date:"2026-03-20", items:31, nsw:"NSW-TH-2026-039228", consignee:"Intel Ireland Ltd",          pod:"Dublin, IE" },
  { id:"SH-2026-0238", type:"Export", vessel:"MAERSK TITAN V.41",   container:"MSKU8723410", hs:"8542.90.10", fob:"USD 63,800",  status:"DRAFT",           date:"2026-03-20", items:0,  nsw:null,                 consignee:"—",                         pod:"—" },
  { id:"SH-2026-0239", type:"Import", vessel:"EVER BLOOM V.15",     container:"EISU1203450", hs:"8424.89.90", fob:"USD 19,200",  status:"PREPARING",       date:"2026-03-20", items:6,  nsw:null,                 consignee:"ไทยอิเล็กทรอนิกส์",        pod:"Laem Chabang, TH" },
];

// ─── HS Code Master (ข้อมูลจริงจาก hscode8digits_ahtnprotocol2022 + HHA + สถิติส่งออก) ──
export const HS_MASTER = [
  // Electronics & Semiconductors (ส่งออกสูงสุดของไทย)
  { code:"85423110", desc:"Processors and controllers", thDesc:"ตัวประมวลผลและตัวควบคุม", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85423900", desc:"Other electronic integrated circuits", thDesc:"วงจรรวมอิเล็กทรอนิกส์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85340090", desc:"Printed circuits — other", thDesc:"แผงวงจรพิมพ์ชนิดอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84733010", desc:"Assembled printed circuit boards", thDesc:"แผงวงจรพิมพ์ที่ประกอบแล้ว", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84733090", desc:"Computer parts — other", thDesc:"ชิ้นส่วนคอมพิวเตอร์ชนิดอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84717020", desc:"Hard disk drives", thDesc:"หน่วยขับจานบันทึกแบบแข็ง", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84717050", desc:"Storage devices for ADP machines", thDesc:"อุปกรณ์หน่วยเก็บข้อมูล", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85176249", desc:"Communication apparatus — other", thDesc:"เครื่องมือสื่อสารอื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85171200", desc:"Telephones for cellular/wireless networks", thDesc:"เครื่องโทรศัพท์เซลลูลาร์", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85044090", desc:"Static converters — other", thDesc:"เครื่องแปลงกระแสไฟฟ้า", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"85371019", desc:"Electrical control panels — other", thDesc:"แผงควบคุมไฟฟ้า", unit:"C62", dutyRate:"0%", origin:"TH" },

  // Automotive (SAPT-type products)
  { code:"87042129", desc:"Motor vehicles — other", thDesc:"ยานยนต์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"87032364", desc:"Vehicles cylinder > 2,500cc", thDesc:"รถยนต์ความจุกระบอกสูบเกิน 2,500 ซีซี", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"87089980", desc:"Motor vehicle parts — other", thDesc:"ส่วนประกอบยานยนต์อื่นๆ", unit:"C62", dutyRate:"5%", origin:"TH" },
  { code:"87115090", desc:"Motorcycles — other", thDesc:"จักรยานยนต์อื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"84082022", desc:"Diesel engines for vehicles", thDesc:"เครื่องยนต์ดีเซลสำหรับยานยนต์", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"40111000", desc:"Tyres for motor cars", thDesc:"ยางล้อรถยนต์นั่ง", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"40112010", desc:"Tyres for buses/trucks — width ≤ 450mm", thDesc:"ยางล้อรถบรรทุก", unit:"C62", dutyRate:"0%", origin:"TH" },

  // Rubber & Plastics
  { code:"40011011", desc:"Centrifuged rubber latex concentrate", thDesc:"น้ำยางเข้มข้นที่ได้โดยวิธีหมุนเหวี่ยง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40012220", desc:"TSNR 20 natural rubber", thDesc:"ยางธรรมชาติ TSNR ชั้น 20", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40012130", desc:"RSS Grade 3 natural rubber", thDesc:"ยางแผ่นรมควันชั้น 3", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40028090", desc:"Synthetic rubber — other", thDesc:"ยางสังเคราะห์อื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"40151900", desc:"Gloves — other", thDesc:"ถุงมืออื่นๆ", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"39012000", desc:"Polyethylene — other", thDesc:"โพลิเอทิลีนอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39014000", desc:"Ethylene-alpha-olefin copolymers", thDesc:"เอทิลีน-อัลฟา-โอลีฟิน โคโพลิเมอร์", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39074000", desc:"Polycarbonates", thDesc:"โพลิคาร์บอเนต", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"39269099", desc:"Other articles of plastic", thDesc:"ของทำด้วยพลาสติกอื่นๆ", unit:"C62", dutyRate:"10%", origin:"TH" },

  // Food & Agriculture (MITR-type products)
  { code:"10063040", desc:"White Thai Hom Mali rice 100%", thDesc:"ข้าวเจ้าขาวหอมมะลิไทย 100%", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"11081400", desc:"Manioc (cassava) starch", thDesc:"สตาร์ชทำจากมันสำปะหลัง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"08106000", desc:"Durians", thDesc:"ทุเรียน", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"16041419", desc:"Prepared tuna — other", thDesc:"ปลาทูน่าปรุงแต่งอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"16023290", desc:"Prepared chicken — other", thDesc:"ไก่ปรุงแต่งอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"07141011", desc:"Dried cassava chips", thDesc:"มันสำปะหลังอัดเม็ด/ดรายชิพ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"23091010", desc:"Pet food — other", thDesc:"อาหารสัตว์เลี้ยงอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"22029990", desc:"Non-alcoholic beverages — other", thDesc:"เครื่องดื่มไม่มีแอลกอฮอล์อื่นๆ", unit:"LTR", dutyRate:"0%", origin:"TH" },

  // Precious metals & gems
  { code:"71081210", desc:"Gold in lumps/ingots", thDesc:"ทองคำเป็นก้อน/อินกอต", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71131190", desc:"Gold jewellery — other", thDesc:"เครื่องเพชรพลอยทำจากทองอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71131990", desc:"Gold alloy jewellery", thDesc:"เครื่องเพชรพลอยทำจากสารเจือทอง", unit:"KGM", dutyRate:"0%", origin:"TH" },
  { code:"71023900", desc:"Diamonds — other", thDesc:"เพชรอื่นๆ", unit:"KGM", dutyRate:"0%", origin:"TH" },

  // Iron & Steel / Metal (HHA-type imports)
  { code:"73181590", desc:"Bolts and screws — other", thDesc:"สกรูและโบลต์อื่นๆ", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73181690", desc:"Nuts — other", thDesc:"น็อตอื่นๆ", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73182200", desc:"Washers", thDesc:"แหวนรอง", unit:"C62", dutyRate:"10%", origin:"CN" },
  { code:"73269099", desc:"Articles of iron/steel — other", thDesc:"ของทำจากเหล็กอื่นๆ", unit:"KGM", dutyRate:"10%", origin:"CN" },
  { code:"74111000", desc:"Copper tubes/pipes — refined", thDesc:"ท่อทองแดงบริสุทธิ์", unit:"KGM", dutyRate:"5%", origin:"CN" },
  { code:"74040000", desc:"Copper waste and scrap", thDesc:"เศษทองแดง", unit:"KGM", dutyRate:"0%", origin:"TH" },

  // Machinery & Electrical (HHA-type imports)
  { code:"85015229", desc:"AC motors > 750W — other", thDesc:"มอเตอร์ไฟฟ้ากระแสสลับ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85322900", desc:"Capacitors — other", thDesc:"ตัวเก็บประจุอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85312000", desc:"Indicator panels with LCD/LED", thDesc:"แผงแสดงผล LCD/LED", unit:"C62", dutyRate:"0%", origin:"CN" },
  { code:"85444299", desc:"Electric conductors — other", thDesc:"ชุดสายไฟฟ้า", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85369099", desc:"Electrical switching apparatus — other", thDesc:"สวิตช์ไฟฟ้าอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85389019", desc:"Parts for switchgear — other", thDesc:"ชิ้นส่วนสวิตช์อื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"85472000", desc:"Insulating fittings of plastics", thDesc:"ท่อฉนวนไฟฟ้า (พลาสติก)", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"84151010", desc:"Air conditioning machines — other", thDesc:"เครื่องปรับอากาศอื่นๆ", unit:"C62", dutyRate:"10%", origin:"TH" },
  { code:"84151090", desc:"Air conditioning parts — other", thDesc:"ส่วนประกอบเครื่องปรับอากาศ", unit:"C62", dutyRate:"10%", origin:"TH" },

  // Hoses & Tubes (HHA-type imports)
  { code:"39173299", desc:"Plastic tubes/hoses — other non-rigid", thDesc:"ท่ออ่อนพลาสติกอื่นๆ", unit:"MTR", dutyRate:"10%", origin:"CN" },
  { code:"39173999", desc:"Plastic tubes/hoses — other", thDesc:"ท่อพลาสติกอื่นๆ", unit:"MTR", dutyRate:"10%", origin:"CN" },
  { code:"40169999", desc:"Rubber articles — other", thDesc:"ของทำด้วยยางอื่นๆ", unit:"KGM", dutyRate:"10%", origin:"CN" },

  // Miscellaneous
  { code:"90015000", desc:"Spectacle lenses of other materials", thDesc:"เลนส์แว่นตาทำด้วยวัตถุอื่น", unit:"C62", dutyRate:"0%", origin:"TH" },
  { code:"90251919", desc:"Temperature sensors — other", thDesc:"เซนเซอร์อุณหภูมิอื่นๆ", unit:"C62", dutyRate:"5%", origin:"CN" },
  { code:"44072997", desc:"Rubber wood — other", thDesc:"ไม้ยางพาราอื่นๆ", unit:"MTQ", dutyRate:"0%", origin:"TH" },
  { code:"27101971", desc:"Automotive diesel fuel", thDesc:"น้ำมันดีเซลสำหรับยานยนต์", unit:"LTR", dutyRate:"0%", origin:"TH" },
];

export const INVOICES_FACTORY = [
  { id:"INV-2026-0085", jobs:42, amount:"฿661,500", status:"paid",    issued:"2026-02-28", due:"2026-03-05", period:"Feb 2026" },
  { id:"INV-2026-0089", jobs:5,  amount:"฿78,750",  status:"pending", issued:"2026-03-20", due:"2026-03-25", period:"Mar 2026 (partial)" },
];
