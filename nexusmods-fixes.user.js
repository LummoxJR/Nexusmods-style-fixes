// ==UserScript==
// @name        Nexus Fixer - nexusmods.com
// @namespace   Violentmonkey Scripts
// @match       https://www.nexusmods.com/*
// @match       https://next.nexusmods.com/*
// @grant       GM_getValues
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// @version     1.1.1
// @author      Lummox JR
// @description Fixes problems with Nexus layout that CSS alone can't fix
// @downloadURL https://raw.githubusercontent.com/LummoxJR/Nexusmods-style-fixes/refs/heads/main/nexusmods-fixes.user.js
// ==/UserScript==

(function(){

const shadowstyles = {
	'download-modal':
`.nxm-button-flamework {
	background-color: var(--theme-primary);
	&:is(a,:enabled):not(.nxm-button-disabled)::before {background-color: unset;}
	&:hover {background-color: var(--theme-secondary);}
}`,
	'#next-shadow-root':
`.nxm-button-flamework {
	background-color: var(--theme-primary);
	&:is(a,:enabled):not(.nxm-button-disabled)::before {background-color: unset;}
	&:hover {background-color: var(--theme-secondary);}
}`
};

// patch attachShadow()
const shadows = new WeakMap();
var oldAttachShadow=HTMLElement.prototype.attachShadow;
HTMLElement.prototype.attachShadow = function(options) {
	var e=this;
	if(!options) options = {};
	if(options.mode !== 'open') options = Object.Assign({},options,{mode:'open'});
	var sr = oldAttachShadow.apply(e,arguments);
	shadows.set(e, sr);
	return sr;
}
// END patch

// polyfill for Violentmonkey
if(!GM_getValues) GM_getValues = (kv)=>{
	var ret={};
	for(let k of Object.keys(kv)) ret[k] = GM_getValue(k,kv[k]);
	return ret;
};

// TODO: add settings interface
const settings = GM_getValues({
});

function debounce(fn, time, now) {
	var timer,waiting;
	return ()=>{
		if(timer) {waiting=true; return;}
		if(now) fn(); else waiting=true;
		timer = setTimeout(()=>{timer=0; if(waiting) {waiting=false; fn();}}, time);
	};
}

// polyfill
(function(){
	if("onbeforescriptexecute" in document) return; // Already natively supported
	let scriptWatcher = new MutationObserver(mutations => {
		for(let mutation of mutations){
			for(let node of mutation.addedNodes){
				if(node.tagName === "SCRIPT"){
					let syntheticEvent = new CustomEvent("beforescriptexecute", {
						detail: node,
						cancelable: true
					})
					// .dispatchEvent will execute the event synchrously,
					// and return false if .preventDefault() is called
					if(!document.dispatchEvent(syntheticEvent)){
						node.remove();
					}
				}
			}
		}
	})
	scriptWatcher.observe(document, {
		childList: true,
		subtree: true
	})
})();

// allow styling of buttons handled via shadow DOM
function styleNxmButtons() {
	for(let sel of Object.keys(shadowstyles)) {
		for(let e of document.querySelectorAll(sel)) {
			let sr = e.shadowRoot, sheet;
			if(!sr || sr.querySelector('style.nxm-style-fixes')) continue;
			console.log('Found item',e);
			if(!sr.nxmFixObserve) {
				sr.nxmFixObserve = true;
				const mo = new MutationObserver((ms, obs) => {
					for(const m of ms) {if(m.type == 'childList') styleNxmButtons();}
				});
				mo.observe(sr, {childList:true});
			}
			(sheet = document.createElement('style')).className = 'nxm-style-fixes';
			sheet.textContent = shadowstyles[sel];
			sr.appendChild(sheet);
		}
	}
}

// move the report and share buttons to a new menu
// these only exist in the description tab for some inexplicable reason, so they may need to be moved later
function moveMisplacedButtons() {
	let badMenu = document.querySelector('.container.tab-description ul.actions');
	let fixMenu = document.querySelector('#fixactions');
	let item;
	if(!badMenu) return;
	if(!fixMenu) {
		fixMenu = document.createElement('li');
		fixMenu.id = 'fixactions';
		fixMenu.innerHTML = '<div class=drop-down><div class="btn inline-flex"><span class=flex-label>&hellip;</span><svg class="icon icon-arrow"><use xlink:href="/assets/images/icons/icons.svg#icon-arrow"></use></svg></div><div class=subnav><ul class=sublist></ul></div></div>';
		document.querySelector('.modactions')?.appendChild(fixMenu);
	}
	fixMenu = fixMenu.querySelector('.subnav .sublist');
	if((item=badMenu.querySelector('.button-share'))) {
		item.classList.remove('button-share');	// if we keep this we need to remove its styles
		item = item.closest('li');	// .button-share is a link under the li we want
		buttonToMenuItem(item,fixMenu,'fix-button-share');
	}
	if((item=badMenu.querySelector('.report-abuse-btn'))) {
		item.classList.remove('report-abuse-btn');	// if we keep this we need to remove its styles
		buttonToMenuItem(item,fixMenu,'fix-button-report');
	}
	badMenu.remove();
}

function buttonToMenuItem(li,menu,id) {
	if(menu.querySelector('#'+id)) {li.remove(); return;}
	li.id = id;
	let a = li.querySelector('.btn');
	if(a) a.classList.remove('btn');
	a = li.querySelector('.inline-flex');
	if(a) {a.classList.remove('inline-flex'); a.classList.add('flex');}
	menu.appendChild(li);
}

function manageAccordions() {
	let item;
	let accordions = {};
	// name accordion folds so CSS can deal with them individually
	for(item of document.querySelectorAll('dl.accordion dt')) {
		let name = item.textContent.trim().toLowerCase().replace(/[^a-z]+/ig,'-').replace(/^-/,'').replace(/-$/,'');
		item.setAttribute('data-accordion-name', name);
		name = name.replace(/-([a-z])/g, (m,m1)=>m1.toUpperCase());
		accordions[name] = item;
	}
	console.log("Accordions", accordions);
	// close accordion if it was opened by default
	// seriously, why TF would it be open by default?
	for(item of document.querySelectorAll('dl.accordion dd.open'))
		item.previousElementSibling?.click();
	// move Mods using this mod below Requirements, so it follows the old order
	let using = accordions.modsUsingThisMod, using_folder = using?.nextElementSibling;
	let req = accordions.requirements, req_folder = req?.nextElementSibling;
	if(using && using.previousElementSibling != req_folder) {
		let block = using.parentNode, next = req_folder ? req_folder.nextElementSibling : block.firstElementChild;
		block.insertBefore(using,next);
		block.insertBefore(using_folder,next);
	}
}

const onTabChange = debounce(()=>{
	manageAccordions();
	moveMisplacedButtons();
	styleNxmButtons();
}, 250);

// prevent scripts that do unwanted stuff by default
document.addEventListener('beforescriptexecute',function(evt){
	var script = evt.detail || evt.target;
	var content = script.textContent||'';
	// the auto-open accordion script for collections is written to always counter the effects of manageAccordions() above
	// prevent the cookie-read behavior entirely so it always acts as if the accordion is closed
	if(content.indexOf("Cookies.get('collections_accordion_open')") >= 0) {
		// change the script to always treat the cookie as false
		evt.preventDefault();
		script = document.createElement('script');
		script.innerText = content.replace("Cookies.get('collections_accordion_open')", "'false'");
		document.head.appendChild(script);
		return;
	}
});

// on load
document.addEventListener('DOMContentLoaded',function(){
	const tabconts = document.querySelector('.tabcontent-mod-page');
	if(tabconts) {
		const mo = new MutationObserver((ms, obs) => {
			for(const m of ms) {if(m.type == 'childList') onTabChange();}
		});
		mo.observe(tabconts, {childList:true});
	}

	onTabChange();	// call immediately
});

})();
