export interface Env{DB:D1Database;FILES?:R2Bucket;ASSETS:Fetcher}
const headers={
'Content-Type':'application/json',
'Access-Control-Allow-Origin':'*',
'Access-Control-Allow-Headers':'Content-Type,Authorization',
'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'
};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
async function body(request:Request){try{return await request.json() as Record<string,any>}catch{return{}}}
async function user(env:Env,id:number){return await env.DB.prepare('SELECT id,email,name,initials,role,department,avatar_url,status,is_admin,phone,bio,created_at,updated_at FROM users WHERE id=?').bind(id).first()}
const enc=new TextEncoder();
function bytesHex(bytes:Uint8Array){return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('')}
function hexBytes(hex:string){const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out}
async function sha256(value:string){return bytesHex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value))))}
async function passwordHash(password:string,saltHex:string,iterations:number){
const material=await crypto.subtle.importKey(
'raw',
enc.encode(password),
{name:'PBKDF2'},
false,
['deriveBits']
);
const bits=await crypto.subtle.deriveBits(
{name:'PBKDF2',salt:hexBytes(saltHex),iterations,hash:'SHA-256'},
material,
256
);
return bytesHex(new Uint8Array(bits));
}
function randomToken(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return bytesHex(bytes)}
async function auth(request:Request,env:Env){
const value=request.headers.get('Authorization')||'';
if(!value.startsWith('Bearer '))return null;
const token=value.slice(7).trim();
if(!token)return null;
const hash=await sha256(token);
const session=await env.DB.prepare(`
SELECT s.id session_id,u.id,u.email,u.name,u.initials,u.role,u.department,u.avatar_url,u.status,u.is_admin,u.phone,u.bio
FROM sessions s JOIN users u ON u.id=s.user_id
WHERE s.token_hash=? AND s.expires_at>datetime('now')
`).bind(hash).first<any>();
if(!session)return null;
await env.DB.prepare('UPDATE sessions SET last_used_at=CURRENT_TIMESTAMP WHERE id=?').bind(session.session_id).run();
return session;
}
export default{
async fetch(request:Request,env:Env):Promise<Response>{
if(request.method==='OPTIONS')return new Response(null,{headers});
const url=new URL(request.url),path=url.pathname;
try{
if(path==='/api/health')return json({ok:true,service:'ceonix-api',time:new Date().toISOString()});

if(path==='/api/login'&&request.method==='POST'){
const b=await body(request);
const email=String(b.email||'').trim().toLowerCase();
const password=String(b.password||'');
if(!email||!password)return json({error:'Email and password required'},400);
const found=await env.DB.prepare('SELECT * FROM users WHERE lower(email)=?').bind(email).first<any>();
if(!found?.password_hash||!found?.password_salt)return json({error:'Invalid email or password'},401);
const hash=await passwordHash(password,found.password_salt,Number(found.password_iterations||100000));
if(hash!==found.password_hash)return json({error:'Invalid email or password'},401);
const token=randomToken(),tokenHash=await sha256(token);
await env.DB.prepare("DELETE FROM sessions WHERE expires_at<=datetime('now')").run();
await env.DB.prepare("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES(?,?,datetime('now','+30 days'))").bind(found.id,tokenHash).run();
return json({user:await user(env,found.id),token});
}

if(path==='/api/logout'&&request.method==='POST'){
const value=request.headers.get('Authorization')||'';
if(value.startsWith('Bearer ')){
const hash=await sha256(value.slice(7).trim());
await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(hash).run();
}
return json({ok:true});
}

if(path==='/api/me'&&request.method==='GET'){
const current=await auth(request,env);
if(!current)return json({error:'Unauthorized'},401);
return json({user:await user(env,current.id)});
}

const current=await auth(request,env);
if(!current)return json({error:'Unauthorized'},401);

if(path==='/api/users'&&request.method==='GET'){
return json((await env.DB.prepare('SELECT * FROM users ORDER BY name').all()).results);
}

if(/^\/api\/users\/\d+$/.test(path)&&request.method==='PATCH'){
const id=Number(path.split('/')[3]),b=await body(request);
if(id!==Number(current.id)&&!current.is_admin)return json({error:'Forbidden'},403);
await env.DB.prepare('UPDATE users SET name=?,role=?,department=?,phone=?,bio=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
.bind(b.name,b.role,b.department,b.phone||null,b.bio||null,id).run();
return json(await user(env,id));
}

if(path==='/api/channels'&&request.method==='GET'){
return json((await env.DB.prepare('SELECT * FROM channels ORDER BY id').all()).results);
}

if(path.startsWith('/api/messages/')&&request.method==='GET'){
const channel=path.split('/').pop();
return json((await env.DB.prepare(`
SELECT m.id,m.content,m.created_at,u.id user_id,u.name,u.initials
FROM messages m JOIN users u ON u.id=m.user_id
JOIN channels c ON c.id=m.channel_id
WHERE c.name=? ORDER BY m.id
`).bind(channel).all()).results);
}

if(path==='/api/messages'&&request.method==='POST'){
const b=await body(request);
if(!b.channelId||!b.userId||!b.content?.trim())return json({error:'Missing fields'},400);
const r=await env.DB.prepare('INSERT INTO messages(channel_id,user_id,content) VALUES(?,?,?)').bind(b.channelId,current.id,b.content.trim()).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(path==='/api/meals'&&request.method==='GET'){
return json((await env.DB.prepare(`
SELECT m.*,COUNT(v.id) votes FROM meals m
LEFT JOIN meal_votes v ON v.meal_id=m.id
WHERE m.meal_date=date('now')
GROUP BY m.id ORDER BY votes DESC,m.id
`).all()).results);
}

if(path==='/api/meals'&&request.method==='POST'){
const b=await body(request);
if(!b.name?.trim())return json({error:'Meal name required'},400);
const r=await env.DB.prepare("INSERT INTO meals(name,emoji,meal_date,created_by) VALUES(?,?,date('now'),?)").bind(b.name.trim(),b.emoji||'???',current.id).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(/^\/api\/meals\/\d+\/vote$/.test(path)&&request.method==='POST'){
const id=Number(path.split('/')[3]),b=await body(request);
try{await env.DB.prepare('INSERT INTO meal_votes(meal_id,user_id) VALUES(?,?)').bind(id,current.id).run();return json({ok:true})}
catch{return json({error:'Already voted for this meal'},409)}
}

if(path==='/api/polls'&&request.method==='GET'){
const polls=(await env.DB.prepare('SELECT p.*,u.name author FROM polls p JOIN users u ON u.id=p.created_by ORDER BY p.id DESC').all()).results as any[];
for(const p of polls)p.options=(await env.DB.prepare('SELECT o.id,o.label,COUNT(v.id) votes FROM poll_options o LEFT JOIN poll_votes v ON v.option_id=o.id WHERE o.poll_id=? GROUP BY o.id ORDER BY o.position').bind(p.id).all()).results;
return json(polls);
}

if(path==='/api/polls'&&request.method==='POST'){
const b=await body(request);
if(!b.question?.trim()||!b.options?.length||b.options.length<2)return json({error:'Invalid poll'},400);
const r=await env.DB.prepare("INSERT INTO polls(question,created_by,closes_at) VALUES(?,?,datetime('now','+7 days'))").bind(b.question.trim(),current.id).run();
for(let i=0;i<b.options.length;i++)await env.DB.prepare('INSERT INTO poll_options(poll_id,label,position) VALUES(?,?,?)').bind(r.meta.last_row_id,b.options[i],i+1).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(/^\/api\/polls\/\d+\/vote$/.test(path)&&request.method==='POST'){
const id=Number(path.split('/')[3]),b=await body(request);
try{await env.DB.prepare('INSERT INTO poll_votes(poll_id,option_id,user_id) VALUES(?,?,?)').bind(id,b.optionId,current.id).run();return json({ok:true})}
catch{return json({error:'Already voted in this poll'},409)}
}

if(path==='/api/announcements'&&request.method==='GET'){
return json((await env.DB.prepare('SELECT a.*,u.name author,u.initials FROM announcements a JOIN users u ON u.id=a.author_id ORDER BY a.pinned DESC,a.id DESC').all()).results);
}

if(path==='/api/announcements'&&request.method==='POST'){
const b=await body(request);
if(!b.title?.trim()||!b.body?.trim())return json({error:'Title and message required'},400);
const r=await env.DB.prepare('INSERT INTO announcements(title,body,author_id,pinned) VALUES(?,?,?,?)').bind(b.title.trim(),b.body.trim(),current.id,b.pinned?1:0).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(path==='/api/events'&&request.method==='GET'){
return json((await env.DB.prepare('SELECT e.*,u.name creator FROM events e LEFT JOIN users u ON u.id=e.created_by ORDER BY starts_at').all()).results);
}

if(path==='/api/events'&&request.method==='POST'){
const b=await body(request);
if(!b.title?.trim()||!b.startsAt)return json({error:'Title and date required'},400);
const r=await env.DB.prepare('INSERT INTO events(title,description,location,starts_at,ends_at,created_by) VALUES(?,?,?,?,?,?)')
.bind(b.title.trim(),b.description||'',b.location||'',b.startsAt,b.endsAt||null,current.id).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(path==='/api/requests'&&request.method==='GET'){
return json((await env.DB.prepare('SELECT r.*,u.name user_name FROM requests r JOIN users u ON u.id=r.user_id ORDER BY r.id DESC').all()).results);
}

if(path==='/api/requests'&&request.method==='POST'){
const b=await body(request);
if(!b.type||!b.title?.trim())return json({error:'Type and title required'},400);
const r=await env.DB.prepare('INSERT INTO requests(user_id,type,title,description) VALUES(?,?,?,?)').bind(current.id,b.type,b.title.trim(),b.description||'').run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(/^\/api\/requests\/\d+$/.test(path)&&request.method==='PATCH'){
const id=Number(path.split('/')[3]),b=await body(request);
await env.DB.prepare('UPDATE requests SET status=?,reviewed_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(b.status,current.id,id).run();
return json({ok:true});
}

if(path==='/api/notifications'&&request.method==='GET'){
const id=Number(current.id);
return json((await env.DB.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC').bind(id).all()).results);
}

if(/^\/api\/notifications\/\d+\/read$/.test(path)&&request.method==='PATCH'){
const id=Number(path.split('/')[3]);
await env.DB.prepare('UPDATE notifications SET is_read=1 WHERE id=?').bind(id).run();
return json({ok:true});
}

if(path==='/api/notifications/read-all'&&request.method==='PATCH'){
const b=await body(request);
await env.DB.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').bind(current.id).run();
return json({ok:true});
}

if(path==='/api/settings'&&request.method==='GET'){
const id=Number(current.id);
return json(await env.DB.prepare('SELECT * FROM user_settings WHERE user_id=?').bind(id).first());
}

if(path==='/api/settings'&&request.method==='PATCH'){
const b=await body(request);
await env.DB.prepare(`UPDATE user_settings SET email_notifications=?,chat_notifications=?,meal_notifications=?,poll_notifications=?,compact_mode=? WHERE user_id=?`)
.bind(b.email_notifications?1:0,b.chat_notifications?1:0,b.meal_notifications?1:0,b.poll_notifications?1:0,b.compact_mode?1:0,current.id).run();
return json({ok:true});
}


if(path==='/api/files'&&request.method==='GET'){
return json((await env.DB.prepare(`
SELECT f.*,u.name uploader,u.initials
FROM files f JOIN users u ON u.id=f.uploaded_by
ORDER BY f.id DESC
`).all()).results);
}

if(path==='/api/files/upload'&&request.method==='POST'){
if(!env.FILES)return json({error:'File storage is not enabled yet'},503);
const form=await request.formData();
const file=form.get('file');
const userId=Number(current.id);
if(!(file instanceof File))return json({error:'File required'},400);
if(file.size>25*1024*1024)return json({error:'Maximum file size is 25 MB'},400);
const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
const key=`${Date.now()}-${crypto.randomUUID()}-${safe}`;
await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type||'application/octet-stream'}});
const r=await env.DB.prepare('INSERT INTO files(name,object_key,mime_type,size,uploaded_by) VALUES(?,?,?,?,?)')
.bind(file.name,key,file.type||'application/octet-stream',file.size,userId).run();
return json({ok:true,id:r.meta.last_row_id},201);
}

if(/^\/api\/files\/\d+\/download$/.test(path)&&request.method==='GET'){
if(!env.FILES)return json({error:'File storage is not enabled yet'},503);
const id=Number(path.split('/')[3]);
const meta=await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(id).first<any>();
if(!meta)return json({error:'File not found'},404);
const object=await env.FILES.get(meta.object_key);
if(!object)return json({error:'Stored object not found'},404);
const h=new Headers();
object.writeHttpMetadata(h);
h.set('Content-Disposition',`attachment; filename="${String(meta.name).replace(/"/g,'')}"`);
h.set('Access-Control-Allow-Origin','*');
h.set('ETag',object.httpEtag);
return new Response(object.body,{headers:h});
}

if(/^\/api\/files\/\d+$/.test(path)&&request.method==='DELETE'){
if(!env.FILES)return json({error:'File storage is not enabled yet'},503);
const id=Number(path.split('/')[3]);
const meta=await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(id).first<any>();
if(!meta)return json({error:'File not found'},404);
await env.FILES.delete(meta.object_key);
await env.DB.prepare('DELETE FROM files WHERE id=?').bind(id).run();
return json({ok:true});
}
if(path==='/api/dashboard'&&request.method==='GET'){
const employees=await env.DB.prepare('SELECT COUNT(*) count FROM users').first<any>();
const online=await env.DB.prepare("SELECT COUNT(*) count FROM users WHERE status='online'").first<any>();
const polls=await env.DB.prepare("SELECT COUNT(*) count FROM polls WHERE status='active'").first<any>();
const requests=await env.DB.prepare("SELECT COUNT(*) count FROM requests WHERE status='pending'").first<any>();
const announcements=(await env.DB.prepare('SELECT a.*,u.name author FROM announcements a JOIN users u ON u.id=a.author_id ORDER BY a.id DESC LIMIT 3').all()).results;
const events=(await env.DB.prepare("SELECT * FROM events WHERE starts_at>=datetime('now') ORDER BY starts_at LIMIT 4").all()).results;
return json({employees:employees?.count||0,online:online?.count||0,polls:polls?.count||0,requests:requests?.count||0,announcements,events});
}

return json({error:'Not found'},404);
}catch(error){
console.error(error);
return json({error:'Internal server error'},500);
}
}
};






