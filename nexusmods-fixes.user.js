// ==UserScript==
// @name        Nexus Fixer - nexusmods.com
// @namespace   Violentmonkey Scripts
// @match       https://www.nexusmods.com/*
// @match       https://next.nexusmods.com/*
// @grant       GM_getValues
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// @version     1.0
// @author      Lummox JR
// @description Fixes problems with Nexus layout that CSS alone can't fix
// @downloadURL https://raw.githubusercontent.com/LummoxJR/Nexusmods-style-fixes/refs/heads/main/nexusmods-fixes.user.js
// ==/UserScript==

(function(){

// polyfill for Violentmonkey
function GM_getValues(kv) {
	var ret={};
	for(let k of Object.keys(kv)) ret[k] = GM_getValue(k,kv[k]);
	return ret;
}

// TODO: add settings interface
var settings = GM_getValues({
});

function debounce(fn, time, now) {
	var timer,waiting;
	return ()=>{
		if(timer) {waiting=true; return;}
		if(now) fn(); else waiting=true;
		timer = setTimeout(()=>{timer=0; if(waiting) {waiting=false; fn();}}, time);
	};
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
	// name accordion folds so CSS can deal with them individually
	for(item of document.querySelectorAll('dl.accordion dt')) {
		item.setAttribute('data-accordion-name', item.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/i,'-').replace(/^-/,'').replace(/-$/,''));
	}
	// close accordion if it was opened by default
	// seriously, why TF would it be open by default?
	for(item of document.querySelectorAll('dl.accordion dd.open'))
		item.previousElementSibling?.click();
}

const onTabChange = debounce(()=>{
	manageAccordions();
	moveMisplacedButtons();
}, 250);

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
