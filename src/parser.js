const UNIT_ALIAS={ctr:'ctn',karton:'ctn',krt:'ctn',carton:'ctn'};
const UNITS=new Set(['ctn','krt','carton','slop','ltr','pcs','pc','kg','gr','gram','g','ons','ikat','ikt','rak','ekor','ctr','crt','karton','dus','box','btl','botol','liter','ltr','l','ml','pack','pak','pck','bks','bungkus','sachet','sct','lusin','buah','bh','sisir','papan','kaleng','klg','roll','rim','lembar','lbr','sak','tray','galon','jerigen','tabung','set','unit','bal','pouch','toples','cup','porsi','tandan','biji','btg','batang','kotak','krat','renteng','bag']);
const MONTHS={jan:1,feb:2,mar:3,apr:4,mei:5,may:5,jun:6,jul:7,agu:8,agt:8,aug:8,sep:9,okt:10,oct:10,nov:11,des:12,dec:12};
const NUM='\\d[\\d.,]*\\s*(?:rb|ribu|k|jt|juta)?';
function num(s){
  if(s==null)return NaN;
  s=String(s).trim().replace(/^rp\.?\s*/i,'');
  const m=s.match(/^(\d[\d.,]*)\s*(rb|ribu|k|jt|juta)?$/i);if(!m)return NaN;
  const t=m[1].replace(/[.,]+$/,''),p=t.split(/[.,]/);let v;
  if(p.length===1)v=+t;
  else{const last=p[p.length-1];v=last.length===3?+p.join(''):+(p.slice(0,-1).join('')+'.'+last)}
  const u=(m[2]||'').toLowerCase();
  if(u==='rb'||u==='ribu'||u==='k')v*=1000;else if(u==='jt'||u==='juta')v*=1e6;
  return v;
}
function lastMoney(s){const all=[...s.matchAll(new RegExp('(?:rp\\.?\\s*)?'+NUM,'gi'))].map(m=>num(m[0])).filter(n=>!isNaN(n));return all.length?all[all.length-1]:NaN}
function parseDate(s){
  const m=s.match(/(\d{1,2})[\s\-\/]*([a-z]{3,})[a-z]*[\s\-\/,]*(\d{4})/i);
  if(m){const mo=MONTHS[m[2].slice(0,3).toLowerCase()];if(mo)return `${m[3]}-${String(mo).padStart(2,'0')}-${m[1].padStart(2,'0')}`}
  const n=s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if(n)return `${n[3]}-${n[2].padStart(2,'0')}-${n[1].padStart(2,'0')}`;
  return '';
}
const PRICE_X=new RegExp('(?:@\\s*)?(?:rp\\.?\\s*)?('+NUM+')\\s*[x×*]\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:=\\s*(?:rp\\.?\\s*)?('+NUM+'))?\\s*$','i');
const PRICE_AT=new RegExp('@\\s*(?:rp\\.?\\s*)?('+NUM+')\\s*$','i');
const PRICE_TOT=new RegExp('(=\\s*)?(rp\\.?\\s*)?('+NUM+')\\s*$','i');
function applyPrice(it,rest){
  let m;
  if(m=rest.match(PRICE_X)){
    it.price=num(m[1]);it.n=num(m[2]);it.mode='x';
    if(m[3]){const w=num(m[3]);if(Math.abs(w-it.price*it.n)>1)it.warn=`Tertulis ${rpS(w)}, seharusnya ${rpS(it.price*it.n)}`}
    return rest.slice(0,m.index).trim();
  }
  if(m=rest.match(PRICE_AT)){it.price=num(m[1]);it.n=it.qty||1;it.mode='at';return rest.slice(0,m.index).trim()}
  if(m=rest.match(PRICE_TOT)){
    const v=num(m[3]);const before=rest.slice(0,m.index);
    if(!isNaN(v)&&(m[2]||m[1]||v>=100)&&(before===''||/[\s:=\-–]$/.test(before))){
      it.total=v;it.n=it.qty||1;it.price=v/it.n;it.mode='tot';return before.trim();
    }
  }
  return rest;
}
function rpS(n){return 'Rp'+Math.round(n||0).toLocaleString('id-ID')}
function parseItem(text,cat){
  const it={name:'',qty:0,unit:'',price:NaN,n:1,cat,warn:'',src:text};
  let rest=text.trim();
  const q=rest.match(/^(\d+(?:[.,]\d+)?)\s*([a-z]+)?\.?(?=\s|$)\s*/i);
  if(q){
    const u=(q[2]||'').toLowerCase();
    if(u&&UNITS.has(u)){it.qty=num(q[1]);it.unit=UNIT_ALIAS[u]||u;if(typeof unitHook==='function')it.unit=unitHook(it.unit,u);rest=rest.slice(q[0].length)}
    else if(!u){const q2=rest.match(/^(\d+(?:[.,]\d+)?)\s+(?=[a-z])/i);if(q2){it.qty=num(q2[1]);rest=rest.slice(q2[0].length)}}
  }
  rest=applyPrice(it,rest);
  it.name=rest.replace(/[\s:=\-–]+$/,'').trim();
  return finish(it);
}
function finish(it){
  if(isNaN(it.price)){it.sub=0;if(!it.warn)it.warn='Harga belum diisi'}
  else{it.sub=it.price*it.n;if(it.total!=null&&it.mode==='tot')it.sub=it.total}
  it.per=it.qty?it.sub/it.qty:it.sub/(it.n||1);
  if(!it.name)it.name='(tanpa nama)';
  return it;
}
const KNOWN=/^(dapur|kitchen|bar|server|kasir|operasional|ops|umum|gudang|lain-?lain|lainnya|kebersihan|cleaning|pastry|housekeeping|office|kantor)\s*:?$/i;
function isHeader(raw){const l=String(raw).replace(/^[\s•●▪·*\-–>]+/,'').replace(/[*_~]/g,'').trim();if(!l)return false;
  return KNOWN.test(l)||(!/\d/.test(l)&&l.length<=32&&(l===l.toUpperCase()||/:$/.test(l))&&/[a-z]/i.test(l))}
function parse(text){
  const out={title:'',date:'',uang:NaN,items:[],cats:[],notes:[]};
  let cat='',seenAny=false;
  const lines=String(text||'').split(/\r?\n/);
  for(let ln=0;ln<lines.length;ln++){const raw=lines[ln];
    let l=raw.replace(/^[\s•●▪·*\-–>]+/,'').replace(/^\d{1,2}[.)]\s+/,'').replace(/[_~]/g,'').replace(/\*+$/,'').trim();
    if(!l||/^forwarded$/i.test(l)||/^diteruskan$/i.test(l))continue;
    if(/uang\s*belanja|^modal|uang\s*masuk|uang\s*kas/i.test(l)){const v=lastMoney(l);if(!isNaN(v))out.uang=v;seenAny=true;continue}
    if(/^(total|jumlah|grand\s*total|sisa|kembali|kurang)\b/i.test(l))continue;
    if(/\b(senin|selasa|rabu|kamis|jum'?at|sabtu|minggu)\b/i.test(l)||(/^\d{1,2}[\s\/\-.]/.test(l)&&parseDate(l)&&!/[x×=]/.test(l)&&l.length<30)){const d=parseDate(l);if(d){out.date=d;seenAny=true;continue}}
    const known=KNOWN.test(l);
    if(isHeader(l)){
      const name=l.replace(/:$/,'').trim().toUpperCase();
      if(!known&&!/:$/.test(l)&&!seenAny&&!out.title){out.title=l.replace(/:$/,'').trim();seenAny=true;continue}
      cat=name;if(!out.cats.includes(cat))out.cats.push(cat);seenAny=true;continue;
    }
    seenAny=true;
    const prev=out.items[out.items.length-1];
    if(prev&&isNaN(prev.price)&&!/[a-z]{2,}/i.test(l.replace(/rp/ig,''))){
      prev.warn='';const r=applyPrice(prev,l);if(!r||/^[=\s]*$/.test(r)){finish(prev);prev.src+='\n'+l;prev.lns.push(ln);continue}
    }
    const parts=l.split(/\s+\+\s*(?=[a-z])/i);
    const c=cat||'LAINNYA';if(!out.cats.includes(c))out.cats.push(c);
    parts.forEach(p=>{const it=parseItem(p,c);it.lns=[ln];it.shared=parts.length>1;out.items.push(it)});
  }
  out.cats=out.cats.filter(c=>out.items.some(i=>i.cat===c));
  out.total=out.items.reduce((s,i)=>s+(i.sub||0),0);
  return out;
}
if(typeof module!=='undefined')module.exports={parse,num,isHeader};
