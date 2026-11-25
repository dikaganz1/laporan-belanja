const {parse}=require('../src/parser.js');
const t=`SAKER SMTH BELANJA
Selasa,17 Nov 2026

Uang Belanja Rp.3,483,000

DAPUR
• 5pcs Roti Tawar Cinderella 23,000x5=Rp.115,000
• 3 ikat Daun bawang 10,000x3=Rp.30,000
• 3 ikat Daun Selada 15,000x3=Rp.45,000
• 5pcs Paprika powder 27,500x5=Rp.137,500
• 2pcs Maizenaku 18,000x2=Rp.36,000
• 2kg Blue Band  136,000x2=Rp.272,000
• 5kg Ayam Filet Rp.415,000
• 2pcs Kaldu Jamur Totole 13,000x2=Rp.26,000
• 3 ikat Sawi Pokcoy 15,000x3=Rp.45,000
• 3 rak Telur Ayam 57,000x3=Rp.171,000
• 2 ikat Timun 10,000x2=Rp.20,000
• 4 ekor Ikan Cakalang Asar 40,000x4=Rp.160,000
• 3 ikat Batang Sereh 10,000x3=Rp.30,000
• 2 ikat Daun sup Besar 20,000x2=Rp.40,000
• Daun Lemon Rp.40,000

BAR
• 1Ctr Max Creamer 45,500x24=Rp.1092,000
• 4pcs Master Martini Monalisa 98,500x4=Rp.394,000
• 8pcs Nipis Madu BTL 4,500x8=Rp.36,000
• 1Crt Nipis Madu BTL Rp.54,000
• 1pcs Es Batu 20kg Rp.20,000

KASIR
• 14pcs Thermal Paper 1PLY 10,000x14=Rp.140,000
• 16pcs Thermal Paper 6,500x16=Rp.104,000 + Tas Rp.4000
• Bensin Rp.40,000
• Parkir Rp.20,000`;
const r=parse(t);
console.log(r.title,r.date,r.uang,r.cats,r.total);
r.items.forEach(i=>console.log(i.cat.padEnd(6),String(i.qty).padStart(3),i.unit.padEnd(5),i.name.padEnd(28),i.price,'x',i.n,'=',i.sub,'per',i.per,i.warn));
// wrapped/quick variants
const r2=parse(`dapur:\n5pcs Roti Tawar\n23.000x5\n2kg gula 15rb x2\nkeju @45000\n3 ikat bayam 15000\nbar\nes batu 20000\n1,5kg daging 120.000x1,5\ncabe rawit 2 ons 30rb`);
r2.items.forEach(i=>console.log(i.cat,i.qty,i.unit,'|'+i.name+'|',i.price,'x',i.n,'=',i.sub,i.warn));
