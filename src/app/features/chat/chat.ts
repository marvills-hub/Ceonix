import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-chat',
imports:[FormsModule],
template:`
<div class="chat-shell">
<aside class="conversations">
<div class="chat-title"><div><h1>Chat</h1><p>Team conversations</p></div><button>+</button></div>
<div class="chat-search"><input placeholder="Search conversations..."></div>
<div class="section-label">CHANNELS</div>
@for(c of channels();track c.id){
<button class="conversation" [class.active]="c.name===active()" (click)="selectChannel(c)">
<span class="channel">#</span><div><strong>{{c.name}}</strong><small>{{c.description}}</small></div>
</button>
}
<div class="section-label">DIRECT MESSAGES</div>
@for(e of employees();track e.id){
@if(e.id!==1){
<button class="conversation">
<div class="avatar">{{e.initials}}<i [class.offline]="e.status!=='online'"></i></div>
<div><strong>{{e.name}}</strong><small>{{e.status==='online'?'Online':e.role}}</small></div>
</button>
}}
</aside>
<section class="messages">
<header>
<div><strong># {{active()}}</strong><span>{{activeDescription()}}</span></div>
<div class="members">{{employees().length}} members · ? {{onlineCount}} online</div>
</header>
<div class="message-list">
@if(loading()){<div class="state">Loading messages...</div>}
@else{
<div class="day"><span>Today</span></div>
@for(m of messages();track m.id){
<div class="message" [class.mine]="m.user_id===1">
<div class="avatar">{{m.initials}}</div>
<div class="bubble-wrap">
<div class="meta"><strong>{{m.name}}</strong><span>{{time(m.created_at)}}</span></div>
<div class="bubble">{{m.content}}</div>
</div>
</div>
}
@if(!messages().length){<div class="state">No messages yet. Start the conversation.</div>}
}
</div>
<form class="composer" (ngSubmit)="send()">
<button type="button">+</button>
<input [(ngModel)]="draft" name="message" autocomplete="off" [placeholder]="'Message #'+active()">
<button type="button">?</button>
<button class="send" [disabled]="sending()">?</button>
</form>
</section>
<aside class="people">
<h3>Online — {{onlineCount}}</h3>
@for(e of employees();track e.id){
@if(e.status==='online'){
<div class="person"><div class="avatar">{{e.initials}}<i></i></div><div><strong>{{e.name}}</strong><span>{{e.role}}</span></div></div>
}}
<h3>Offline</h3>
@for(e of employees();track e.id){
@if(e.status!=='online'){
<div class="person muted"><div class="avatar">{{e.initials}}</div><div><strong>{{e.name}}</strong><span>{{e.role}}</span></div></div>
}}
</aside>
</div>
`,
styleUrl:'./chat.scss'
})
export class Chat implements OnInit{
api=inject(ApiService);
channels=signal<any[]>([]);
employees=signal<any[]>([]);
messages=signal<any[]>([]);
active=signal('general');
activeId=signal(1);
activeDescription=signal('Company-wide discussion');
loading=signal(true);
sending=signal(false);
draft='';
get onlineCount(){return this.employees().filter(e=>e.status==='online').length}
async ngOnInit(){
try{
const [channels,employees]=await Promise.all([this.api.channels(),this.api.users()]);
this.channels.set(channels);
this.employees.set(employees);
const first=channels.find((c:any)=>c.name==='general')||channels[0];
if(first){this.active.set(first.name);this.activeId.set(first.id);this.activeDescription.set(first.description||'');}
await this.loadMessages();
}catch(e){console.error(e);this.loading.set(false)}
}
async selectChannel(c:any){
this.active.set(c.name);
this.activeId.set(c.id);
this.activeDescription.set(c.description||'');
await this.loadMessages();
}
async loadMessages(){
this.loading.set(true);
try{this.messages.set(await this.api.messages(this.active()))}
catch(e){console.error(e);this.messages.set([])}
finally{this.loading.set(false)}
}
async send(){
const value=this.draft.trim();
if(!value||this.sending())return;
this.sending.set(true);
try{
await this.api.sendMessage(this.activeId(),value);
this.draft='';
await this.loadMessages();
}catch(e){console.error(e)}
finally{this.sending.set(false)}
}
time(value:string){return new Date(value+'Z').toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
}
