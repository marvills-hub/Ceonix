import{Component,inject,OnInit}from'@angular/core';
import{RouterLink,RouterLinkActive,RouterOutlet}from'@angular/router';
import{AppService}from'../core/services/app.service';
import{AuthService}from'../core/services/auth.service';
import{ApiService}from'../core/services/api.service';
import{Icon}from'../shared/icon';
@Component({
selector:'app-shell',
imports:[RouterLink,RouterLinkActive,RouterOutlet,Icon],
template:`
<div class="shell" [class.collapsed]="!app.sidebarOpen()" [class.mobile-open]="app.mobileNavOpen()">
@if(app.mobileNavOpen()){<button class="backdrop" (click)="app.closeMobile()"></button>}
<aside class="sidebar">
<a routerLink="/" class="brand">
<div class="brand-logo"><img src="/assets/branding/ceosi-logo.png" alt="CEOSI"></div>
<div class="brand-copy"><strong>CEOSI</strong><b>CEONIX</b><span>EMPLOYEE CONNECT</span></div>
</a>
<nav>
@for(item of nav;track item.route){
<a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact:item.route==='/'}" (click)="app.closeMobile()">
<span class="nav-icon"><app-icon [name]="item.icon"/></span>
<span class="nav-label">{{item.label}}</span>
@if(item.route==='/notifications'&&app.notifications()){<span class="badge">{{app.notifications()}}</span>}
</a>
}
</nav>
<a routerLink="/profile" class="sidebar-user">
<div class="avatar">{{auth.user()?.initials}}</div>
<div class="user-copy"><strong>{{auth.user()?.name}}</strong><span>{{auth.user()?.role}}</span><small><i></i> Online</small></div>
<span class="user-arrow">^</span>
</a>
</aside>

<div class="main">
<header class="topbar">
<div class="header-left">
<button class="icon-btn menu" (click)="toggleMenu()"><app-icon name="menu"/></button>
<div class="mobile-brand">CEONIX</div>
<div class="search"><app-icon name="search"/><input placeholder="Search Ceonix..."><kbd>Ctrl + K</kbd></div>
</div>
<div class="header-right">
<a routerLink="/notifications" class="icon-btn bell"><app-icon name="bell"/>@if(app.notifications()){<span>{{app.notifications()}}</span>}</a>
<a routerLink="/profile" class="mini-avatar">{{auth.user()?.initials}}</a>
<span class="profile-chevron">?</span>
</div>
</header>
<main><router-outlet/></main>
</div>
</div>
`,
styleUrl:'./shell.scss'
})
export class Shell implements OnInit{
app=inject(AppService);auth=inject(AuthService);api=inject(ApiService);
nav=[
{label:'Dashboard',route:'/',icon:'dashboard'},
{label:'Chat',route:'/chat',icon:'chat'},
{label:'Meals',route:'/meals',icon:'meal'},
{label:'Polls & Voting',route:'/polls',icon:'poll'},
{label:'Announcements',route:'/announcements',icon:'announcement'},
{label:'Employees',route:'/employees',icon:'employees'},
{label:'Events',route:'/events',icon:'calendar'},
{label:'Requests',route:'/requests',icon:'request'},
{label:'Files',route:'/files',icon:'file'},
{label:'Notifications',route:'/notifications',icon:'bell'},
{label:'Administration',route:'/admin',icon:'admin'},
{label:'Settings',route:'/settings',icon:'settings'}
];
async ngOnInit(){try{const n=await this.api.notifications();this.app.notifications.set(n.filter(x=>!x.is_read).length)}catch{}}
toggleMenu(){if(innerWidth<=850)this.app.toggleMobile();else this.app.toggleSidebar()}
}

