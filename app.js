const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = new Date(); const iso = d => new Date(d).toISOString().slice(0,10);
const dateFmt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const money = n => '₹'+Number(n||0).toLocaleString('en-IN');
const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const seed = {
 books:[
  {id:'BK101',title:'Atomic Habits',author:'James Clear',isbn:'9780735211292',category:'Self-help',total:5,available:4},
  {id:'BK102',title:'The Alchemist',author:'Paulo Coelho',isbn:'9780061122415',category:'Fiction',total:4,available:3},
  {id:'BK103',title:'Clean Code',author:'Robert C. Martin',isbn:'9780132350884',category:'Technology',total:3,available:2},
  {id:'BK104',title:'A Brief History of Time',author:'Stephen Hawking',isbn:'9780553380163',category:'Science',total:3,available:3},
  {id:'BK105',title:'Wings of Fire',author:'A. P. J. Abdul Kalam',isbn:'9788173711466',category:'Biography',total:6,available:6},
  {id:'BK106',title:'The Pragmatic Programmer',author:'David Thomas',isbn:'9780135957059',category:'Technology',total:2,available:2}
 ],
 members:[
  {id:'ST201',name:'Aarav Sharma',email:'aarav@example.com',type:'Student'},
  {id:'ST202',name:'Ananya Reddy',email:'ananya@example.com',type:'Student'},
  {id:'FC301',name:'Dr. Meera Rao',email:'meera@example.com',type:'Faculty'}
 ],
 loans:[]
};
let data;
try { data=JSON.parse(localStorage.getItem('libra-data')) || seed; } catch { data=seed; }
if(!data.loans.length && !localStorage.getItem('libra-data')) {
 const past = new Date(); past.setDate(past.getDate()-4);
 data.loans=[{id:'LN501',bookId:'BK102',memberId:'ST201',issued:iso(past),due:iso(new Date(Date.now()+3*86400000)),returned:null,fine:0}];
 data.books.find(b=>b.id==='BK102').available--;
}
function save(){localStorage.setItem('libra-data',JSON.stringify(data));renderAll()}
function book(id){return data.books.find(x=>x.id===id)}
function member(id){return data.members.find(x=>x.id===id)}
function activeLoans(){return data.loans.filter(x=>!x.returned)}
function isLate(l){return !l.returned && new Date(l.due+'T23:59:59')<new Date()}
function fineFor(l){const days=Math.max(0,Math.ceil((todayAtEnd()-new Date(l.due+'T23:59:59'))/86400000));return days*(member(l.memberId)?.type==='Faculty'?2:5)}
function todayAtEnd(){return new Date(new Date().toDateString())}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
function go(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));$('#crumb').textContent=({dashboard:'Overview',books:'Books',members:'Members',circulation:'Issue & return',reports:'Reports'})[page];$('#sidebar').classList.remove('open');renderAll()}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.addEventListener('click',e=>{const p=e.target.closest('[data-page-link]');if(p)go(p.dataset.pageLink);const a=e.target.closest('[data-action]');if(a)openModal(a.dataset.action)});
$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
$('#today').textContent=today.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});

function renderAll(){renderDashboard();renderBooks();renderMembers();renderLoans();renderReports()}
function renderDashboard(){
 const issued=activeLoans().length, overdue=activeLoans().filter(isLate).length;
 $('#stat-books').textContent=data.books.reduce((s,b)=>s+b.total,0);
 $('#stat-issued').textContent=issued;$('#stat-members').textContent=data.members.length;$('#stat-overdue').textContent=overdue;
 const recent=[...data.loans].sort((a,b)=>b.issued.localeCompare(a.issued)).slice(0,4);
 $('#recent-activity').innerHTML=recent.length?recent.map(l=>`<div class="activity-item"><div class="activity-symbol">${l.returned?'↩':'⇧'}</div><div class="activity-copy"><b>${esc(book(l.bookId)?.title||'Removed book')} ${l.returned?'returned':'issued'}</b><small>${esc(member(l.memberId)?.name||'Unknown member')} · ${dateFmt(l.returned||l.issued)}</small></div><span class="activity-time">${l.returned?'Completed':isLate(l)?'Overdue':'Active'}</span></div>`).join(''):'<div class="empty-state">No activity yet. Issue a book to get started.</div>';
 const cats={};data.books.forEach(b=>cats[b.category]=(cats[b.category]||0)+b.total);
 $('#collection-snapshot').innerHTML=Object.entries(cats).slice(0,4).map(([c,n])=>`<div class="snapshot"><b>${n}</b><span>${esc(c)} copies</span></div>`).join('')||'<div class="empty-state">No books added yet.</div>';
}
function renderBooks(){
 const q=($('#book-search')?.value||'').toLowerCase(),f=$('#book-filter')?.value||'all';
 const rows=data.books.filter(b=>(`${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(q))&&(f==='all'||(f==='available'?b.available>0:b.available<b.total)));
 $('#books-table').innerHTML=rows.map(b=>`<tr><td><div class="book-cell"><div class="book-cover">▤</div><div><b>${esc(b.title)}</b><small>by ${esc(b.author)}</small></div></div></td><td>${esc(b.isbn)}</td><td>${esc(b.category)}</td><td><b>${b.available} / ${b.total}</b><small>available / total</small></td><td><span class="badge ${b.available?'available':'issued'}">${b.available?'Available':'All issued'}</span></td><td><div class="row-actions"><button class="small-btn" onclick="editBook('${b.id}')">Edit</button><button class="small-btn danger" onclick="deleteBook('${b.id}')">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">No books found.</td></tr>';
 $('#books-count').textContent=`Showing ${rows.length} of ${data.books.length} book records`;
}
function renderMembers(){
 const q=($('#member-search')?.value||'').toLowerCase(),f=$('#member-filter')?.value||'all';
 const rows=data.members.filter(m=>(`${m.name} ${m.id} ${m.email}`.toLowerCase().includes(q))&&(f==='all'||m.type===f));
 $('#members-grid').innerHTML=rows.map(m=>`<article class="member-card"><div class="member-top"><div class="member-avatar">${esc(m.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><div><h3>${esc(m.name)}</h3><small>${esc(m.id)} · <span class="badge ${m.type.toLowerCase()}">${m.type}</span></small></div></div><div class="member-meta"><span>${esc(m.email)}</span><b>${activeLoans().filter(l=>l.memberId===m.id).length} active loans</b></div><div class="member-actions"><button class="small-btn" onclick="editMember('${m.id}')">Edit</button><button class="small-btn danger" onclick="deleteMember('${m.id}')">Delete</button></div></article>`).join('')||'<div class="empty-state">No members found.</div>';
}
function renderLoans(){
 const q=($('#loan-search')?.value||'').toLowerCase(),f=$('#loan-filter')?.value||'active';
 const rows=[...data.loans].reverse().filter(l=>{const active=!l.returned;return (`${book(l.bookId)?.title||''} ${member(l.memberId)?.name||''} ${l.id}`.toLowerCase().includes(q))&&(f==='all'||(f==='active'&&active)||(f==='overdue'&&isLate(l))||(f==='returned'&&!active))});
 $('#loans-table').innerHTML=rows.map(l=>{const late=isLate(l),fee=l.returned?l.fine:fineFor(l);return `<tr><td><b>${esc(book(l.bookId)?.title||'Removed book')}</b><small>${esc(member(l.memberId)?.name||'Removed member')} · ${l.id}</small></td><td>${dateFmt(l.issued)}</td><td>${dateFmt(l.due)}</td><td>${money(fee)}</td><td><span class="badge ${l.returned?'returned':late?'overdue':'issued'}">${l.returned?'Returned':late?'Overdue':'Issued'}</span></td><td>${l.returned?'—':`<button class="small-btn" onclick="returnBook('${l.id}')">Return book</button>`}</td></tr>`}).join('')||'<tr><td colspan="6" class="empty-state">No transactions match your search.</td></tr>';
 $('#loans-count').textContent=`Showing ${rows.length} transaction${rows.length===1?'':'s'}`;
}
function renderReports(){
 const copies=data.books.reduce((s,b)=>s+b.total,0),available=data.books.reduce((s,b)=>s+b.available,0);
 $('#report-titles').textContent=data.books.length;$('#report-available').textContent=available;$('#report-returned').textContent=data.loans.filter(l=>l.returned).length;$('#report-fines').textContent=money(data.loans.reduce((s,l)=>s+(l.fine||0),0));
 const cats={};data.books.forEach(b=>cats[b.category]=(cats[b.category]||0)+b.total);
 $('#category-report').innerHTML=Object.entries(cats).map(([k,v])=>bar(k,v,copies)).join('')||'<div class="empty-state">No inventory data.</div>';
 const types={Student:data.members.filter(m=>m.type==='Student').length,Faculty:data.members.filter(m=>m.type==='Faculty').length};
 $('#member-report').innerHTML=Object.entries(types).map(([k,v])=>bar(k,v,data.members.length)).join('');
}
function bar(label,n,total){return `<div class="bar-row"><span>${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${total?Math.max(2,n/total*100):0}%"></div></div><b>${n}</b></div>`}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

const backdrop=$('#modal-backdrop'),form=$('#modal-form');let currentAction='',editingId=null;
function field(label,name,type='text',value='',full=false,options=[]){let input=type==='select'?`<select name="${name}" required>${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'min="1"':''} required>`;return `<div class="field ${full?'full':''}"><label>${label}</label>${input}</div>`}
function openModal(action,id=null){
 currentAction=action;editingId=id;let html='',title='';
 if(action==='add-book'||action==='edit-book'){const b=id?book(id):{};title=id?'Edit book':'Add a book';html=field('BOOK TITLE','title','text',b.title||'',true)+field('AUTHOR','author','text',b.author||'')+field('ISBN','isbn','text',b.isbn||'')+field('CATEGORY','category','select',b.category||'Technology',false,['Technology','Fiction','Science','Biography','Self-help','History','Education','Other'])+field('TOTAL COPIES','total','number',b.total||1)+ (id?`<div class="field"><label>AVAILABLE COPIES</label><input value="${b.available}" disabled></div>`:'');}
 if(action==='add-member'||action==='edit-member'){const m=id?member(id):{};title=id?'Edit member':'Register member';html=field('FULL NAME','name','text',m.name||'',true)+field('EMAIL ADDRESS','email','email',m.email||'',true)+field('MEMBER TYPE','type','select',m.type||'Student',false,['Student','Faculty']);}
 if(action==='issue-book'){title='Issue a book';const available=data.books.filter(b=>b.available>0);html=available.length?field('SELECT BOOK','bookId','select',available[0].id,false,available.map(b=>b.id+' — '+b.title).map((v,i)=>available[i].id+'|'+available[i].title)):'<p class="muted">No books are currently available to issue.</p>';if(available.length){html=html.replace(/<option[^>]*>.*?<\/option>/g, m=>m);html=field('SELECT BOOK','bookId','select',available[0].id,true,available.map(b=>b.id+'|'+b.title))+field('SELECT MEMBER','memberId','select',data.members[0]?.id||'',true,data.members.map(m=>m.id+'|'+m.name+' ('+m.type+')'))+field('ISSUE DATE','issued','date',iso(today))+field('DUE DATE','due','date',iso(new Date(Date.now()+ (member(data.members[0]?.id)?.type==='Faculty'?30:14)*86400000)));}}
 $('#modal-title').textContent=title;$('#modal-eyebrow').textContent=action==='issue-book'?'BOOK CIRCULATION':'LIBRARY DESK';$('#modal-fields').innerHTML=html;$('#modal-submit').style.display=action==='issue-book'&&!data.books.some(b=>b.available>0)?'none':'inline-block';backdrop.classList.add('show');
 // Convert pipe-separated select option labels into value/label pairs.
 $$('#modal-fields select').forEach(sel=>[...sel.options].forEach(o=>{if(o.textContent.includes('|')){const [v,...rest]=o.textContent.split('|');o.value=v;o.textContent=rest.join('|')}}));
}
function closeModal(){backdrop.classList.remove('show');form.reset();editingId=null}
$('#modal-close').onclick=$('#modal-cancel').onclick=closeModal;backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
form.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form));
 if(currentAction==='add-book'||currentAction==='edit-book'){if(editingId){const b=book(editingId);const issued=b.total-b.available;b.title=v.title;b.author=v.author;b.isbn=v.isbn;b.category=v.category;b.total=+v.total;if(b.total<issued)return showToast('Total copies cannot be less than issued copies.');b.available=b.total-issued;}else data.books.push({id:'BK'+uid(),...v,total:+v.total,available:+v.total});}
 if(currentAction==='add-member'||currentAction==='edit-member'){if(editingId)Object.assign(member(editingId),v);else data.members.push({id:(v.type==='Student'?'ST':'FC')+uid(),...v});}
 if(currentAction==='issue-book'){const b=book(v.bookId),m=member(v.memberId);if(!b||!m||b.available<1)return showToast('Book is no longer available.');const limit=m.type==='Faculty'?5:3;if(activeLoans().filter(l=>l.memberId===m.id).length>=limit)return showToast(`${m.type} borrowing limit is ${limit} books.`);if(v.due<v.issued)return showToast('Due date must be after issue date.');b.available--;data.loans.push({id:'LN'+uid(),bookId:b.id,memberId:m.id,issued:v.issued,due:v.due,returned:null,fine:0});}
 closeModal();save();showToast('Changes saved successfully.');
});
function editBook(id){openModal('edit-book',id)}function editMember(id){openModal('edit-member',id)}
function deleteBook(id){if(data.loans.some(l=>l.bookId===id&&!l.returned))return showToast('Return all issued copies before deleting this book.');if(confirm('Delete this book record?')){data.books=data.books.filter(b=>b.id!==id);save();showToast('Book deleted.')}}
function deleteMember(id){if(activeLoans().some(l=>l.memberId===id))return showToast('This member has active loans. Return them first.');if(confirm('Delete this member?')){data.members=data.members.filter(m=>m.id!==id);save();showToast('Member deleted.')}}
function returnBook(id){const l=data.loans.find(x=>x.id===id);if(!l||l.returned)return;l.returned=iso(today);l.fine=fineFor(l);const b=book(l.bookId);if(b)b.available=Math.min(b.total,b.available+1);save();showToast(`Book returned. Fine: ${money(l.fine)}`)}
['book-search','book-filter','member-search','member-filter','loan-search','loan-filter'].forEach(id=>$('#'+id).addEventListener('input',()=>{id.startsWith('book')?renderBooks():id.startsWith('member')?renderMembers():renderLoans()}));
$('#export-report').onclick=()=>{const lines=[['Book ID','Title','Author','ISBN','Category','Total copies','Available copies'],...data.books.map(b=>[b.id,b.title,b.author,b.isbn,b.category,b.total,b.available])];const csv=lines.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='library-inventory-report.csv';a.click();URL.revokeObjectURL(a.href)};
renderAll();