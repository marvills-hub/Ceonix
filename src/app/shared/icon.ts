import{Component,input}from'@angular/core';
@Component({
selector:'app-icon',
template:`
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
@switch(name()){
@case('dashboard'){<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>}
@case('chat'){<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15Z"/>}
@case('meal'){<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M17 3c3 2 3 7 0 9"/>}
@case('poll'){<path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/>}
@case('announcement'){<path d="m3 11 14-6v14L3 13Z"/><path d="M17 10h3"/><path d="m18 6 2-2"/><path d="m18 18 2 2"/><path d="m6 14 2 6h3"/>}
@case('employees'){<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M18 15a6 6 0 0 1 4 6"/>}
@case('calendar'){<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>}
@case('request'){<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>}
@case('file'){<path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h5"/>}
@case('bell'){<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>}
@case('admin'){<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>}
@case('settings'){<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>}
@case('search'){<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>}
@case('menu'){<path d="M4 6h16M4 12h16M4 18h16"/>}
@case('arrow'){<path d="m9 18 6-6-6-6"/>}
@case('online'){<circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.2 2.2 4.8-5"/>}
@case('rocket'){<path d="M14 6c3-3 6-3 7-3 0 1 0 4-3 7l-5 5-4-4Z"/><path d="m9 11-4 1-2 2 5 1M13 15l-1 4-2 2-1-5"/><circle cx="16" cy="8" r="1"/>}
@case('trophy'){<path d="M8 4h8v4a4 4 0 0 1-8 0Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6"/>}
@case('database'){<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>}
@case('team'){<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 8 4"/>}
@case('activity'){<path d="M3 12h4l2-6 4 12 2-6h6"/>}
@case('plus'){<path d="M12 5v14M5 12h14"/>}
@case('check'){<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>}
}
</svg>
`,
styles:[`:host{display:inline-grid;width:1em;height:1em;place-items:center}svg{display:block;width:100%;height:100%}`]
})
export class Icon{name=input.required<string>()}
