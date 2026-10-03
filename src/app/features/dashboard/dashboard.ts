import{Component,inject,OnInit,signal}from'@angular/core';
import{RouterLink}from'@angular/router';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
import{Icon}from'../../shared/icon';
@Component({
selector:'app-dashboard',
imports:[RouterLink,Icon],
template:`
<section class="hero">
<div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="planet"></div>
<div class="hero-copy">
<span>WELCOME TO CEONIX</span>
<h1>Good {{greeting}}, <b>{{firstName}}</b> <app-icon name="rocket"/></h1>
<p>Together we connect, collaborate and move CEOSI forward.</p>
</div>
<div class="hero-message"><span>PEOPLE</span><span>TECHNOLOGY</span><strong>A BRIGHTER TOMORROW</strong></div>
</section>

<div class="stats">
<div class="stat blue"><div class="stat-icon"><app-icon name="employees"/></div><div class="stat-copy"><span>Online Now</span><strong>{{data()?.online||0}}</strong><small>of {{data()?.employees||0}} employees</small></div><i></i></div>
<div class="stat pink"><div class="stat-icon"><app-icon name="poll"/></div><div class="stat-copy"><span>Active Polls</span><strong>{{data()?.polls||0}}</strong><small>Team decisions</small></div></div>
<div class="stat orange"><div class="stat-icon"><app-icon name="request"/></div><div class="stat-copy"><span>Pending Requests</span><strong>{{data()?.requests||0}}</strong><small>Needs attention</small></div></div>
<div class="stat status"><div class="stat-icon"><app-icon name="online"/></div><div class="stat-copy"><span>Ceonix Status</span><strong>Online</strong><small>All systems operational</small></div><i></i></div>
</div>

<div class="dashboard-grid">
<section class="panel quick-panel">
<div class="panel-head"><div><h2>Quick Access</h2><p>Jump into Ceonix</p></div><a routerLink="/chat">View all</a></div>
<div class="quick-grid">
<a routerLink="/chat" class="quick pink-card"><div class="quick-icon"><app-icon name="chat"/></div><div><strong>Chat</strong><span>Talk with the team</span></div><b><app-icon name="arrow"/></b></a>
<a routerLink="/meals" class="quick pink-card"><div class="quick-icon"><app-icon name="meal"/></div><div><strong>Meals</strong><span>Vote for lunch</span></div><b><app-icon name="arrow"/></b></a>
<a routerLink="/polls" class="quick purple-card"><div class="quick-icon"><app-icon name="poll"/></div><div><strong>Polls</strong><span>Make decisions</span></div><b><app-icon name="arrow"/></b></a>
<a routerLink="/files" class="quick blue-card"><div class="quick-icon"><app-icon name="file"/></div><div><strong>Files</strong><span>Shared documents</span></div><b><app-icon name="arrow"/></b></a>
</div>
</section>

<section class="panel announcements-panel">
<div class="panel-head"><div><h2>Announcements</h2><p>Latest company updates</p></div><a routerLink="/announcements">View all</a></div>
<div class="announcement-list">
@for(a of data()?.announcements||[];track a.id){
<a routerLink="/announcements" class="announcement">
<div class="announce-image"><span>CEOSI</span></div>
<div><strong>{{a.title}}</strong><span>{{a.author}}</span><small>{{date(a.created_at)}}</small></div>
@if(a.pinned){<b>?</b>}
</a>
}
</div>
</section>

<section class="panel team-panel">
<div class="panel-head"><div><h2>Team Overview</h2><p>CEOSI at a glance</p></div><a routerLink="/employees">View employees</a></div>
<div class="team-stats">
<div><b class="blue-circle"><app-icon name="employees"/></b><strong>{{data()?.employees||0}}</strong><span>Total employees</span></div>
<div><b class="green-circle">?</b><strong>{{data()?.online||0}}</strong><span>Currently online</span></div>
<div><b class="purple-circle"><app-icon name="poll"/></b><strong>{{data()?.polls||0}}</strong><span>Active polls</span></div>
<div><b class="orange-circle"><app-icon name="request"/></b><strong>{{data()?.requests||0}}</strong><span>Pending requests</span></div>
</div>
<div class="brand-banner">
<div class="ceosi-mark"><span></span><span></span></div>
<div class="ceosi-word">CEOSI</div>
<div class="line"></div>
<div class="tagline"><strong>CONNECTING PEOPLE</strong><span>BEYOND LIMITS</span></div>
<div class="banner-planet"></div>
</div>
</section>

<section class="panel events-panel">
<div class="panel-head"><div><h2>Upcoming Events</h2><p>Don't miss these</p></div><a routerLink="/events">View calendar</a></div>
<div class="event-list">
@for(e of data()?.events||[];track e.id){
<a routerLink="/events" class="event">
<div class="event-date"><strong>{{day(e.starts_at)}}</strong><span>{{month(e.starts_at)}}</span></div>
<div class="event-info"><strong>{{e.title}}</strong><span><app-icon name="calendar"/> {{time(e.starts_at)}}</span><small>{{e.location||'CEOSI'}}</small></div>
<b><app-icon name="arrow"/></b>
</a>
}
</div>
</section>
</div>
`,
styleUrl:'./dashboard.scss'
})
export class Dashboard implements OnInit{
api=inject(ApiService);auth=inject(AuthService);data=signal<any>(null);
async ngOnInit(){try{this.data.set(await this.api.dashboard())}catch(e){console.error(e)}}
get greeting(){const h=new Date().getHours();return h<12?'morning':h<18?'afternoon':'evening'}
get firstName(){return(this.auth.user()?.name||'Team').split(' ')[0]}
date(v:string){return new Date(v+'Z').toLocaleDateString()}
day(v:string){return new Date(v+'Z').getDate().toString().padStart(2,'0')}
month(v:string){return new Date(v+'Z').toLocaleString('en',{month:'short'}).toUpperCase()}
time(v:string){return new Date(v+'Z').toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
}

