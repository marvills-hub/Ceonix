import{Injectable,signal}from'@angular/core';
@Injectable({providedIn:'root'})
export class AppService{
readonly sidebarOpen=signal(true);
readonly mobileNavOpen=signal(false);
readonly notifications=signal(4);
toggleSidebar(){this.sidebarOpen.update(v=>!v)}
toggleMobile(){this.mobileNavOpen.update(v=>!v)}
closeMobile(){this.mobileNavOpen.set(false)}
}
