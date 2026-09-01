for tab in list_tabs():
  if tab["url"] == "http://127.0.0.1:4321/" and tab["title"].startswith("🐴 "):
    close_tab(tab)
before = {tab["targetId"] for tab in list_tabs()}
target = new_tab("http://127.0.0.1:4321")
created = target not in before
wait_for_load(20)
assert wait_for_element("[data-post]", timeout=20, visible=True)
assert wait_for_element(".tag-filter:not([disabled])", timeout=20, visible=True)

results = {}
results["page"] = page_info()
results["initial"] = js("(()=>({articles:document.querySelectorAll('[data-post]').length,visible:[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).length,quality:[...document.querySelectorAll('[data-topic]')].some(e=>e.textContent.trim()==='品質與驗證'),liveRegions:document.querySelectorAll('[aria-live=polite]').length,tagButtons:[...document.querySelectorAll('.tag-filter')].every(e=>e.hasAttribute('aria-pressed'))}))()")
assert results["initial"]["articles"] == 40
assert results["initial"]["visible"] == 40
assert results["initial"]["quality"] is True
assert results["initial"]["liveRegions"] == 1
assert results["initial"]["tagButtons"] is True

expected = {"hook": 9, "skill": 3, "subagent": 3, "workflow": 7}
results["exact"] = {}
for tag_id, count in expected.items():
  clicked = js("(()=>{const e=document.querySelector('.tag-filter[data-tag='+JSON.stringify(" + json.dumps(tag_id) + ")+']');if(!e)return false;e.click();return true})()")
  assert clicked is True
  state = js("(()=>({visible:[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).map(e=>e.dataset.postId).sort(),pressed:[...document.querySelectorAll('.tag-filter[data-tag='+JSON.stringify(" + json.dumps(tag_id) + ")+']')].every(e=>e.getAttribute('aria-pressed')==='true'),query:document.querySelector('#article-search').value,topics:[...document.querySelectorAll('[data-topic][aria-pressed=true]')].map(e=>e.dataset.topic).filter(Boolean)}))()")
  assert len(state["visible"]) == count, (tag_id, state)
  assert state["pressed"] is True
  assert state["query"] == ""
  assert state["topics"] == []
  results["exact"][tag_id] = state["visible"]
  js("(()=>{document.querySelector('.tag-filter[data-tag='+JSON.stringify(" + json.dumps(tag_id) + ")+']').click();return true})()")
  assert js("[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).length") == 40

set_search = "(value)=>{const e=document.querySelector('#article-search');e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));return [...document.querySelectorAll('[data-post]')].filter(x=>!x.hidden).map(x=>x.dataset.postId).sort()}"
results["search"] = {}
for query, key in [("下架八個月", "title"), ("0.09%", "description"), ("Claude Code", "label")]:
  visible = js("(" + set_search + ")(" + json.dumps(query) + ")")
  results["search"][key] = visible
assert results["search"]["title"] == ["bumblebee-still-on-disk"]
assert results["search"]["description"] == ["retire-vector-memory"]
assert len(results["search"]["label"]) == 37
js("(" + set_search + ")('')")
assert js("[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).length") == 40

assert js("(()=>{const e=document.querySelector('[data-topic=quality]');if(!e)return false;e.click();return true})()") is True
results["qualityCount"] = js("[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).length")
assert results["qualityCount"] == 12
js("document.querySelector('[data-topic=\"\"]').click()")
assert js("[...document.querySelectorAll('[data-post]')].filter(e=>!e.hidden).length") == 40

js("document.querySelector('[data-search-trigger]').click()")
if js("document.querySelector('[data-search-trigger]').getAttribute('aria-expanded')") == "true":
  js("document.querySelector('[data-search-trigger]').click()")
js("document.querySelector('[data-search-trigger]').focus()")
press_key("Enter")
results["keyboardOpen"] = js("(()=>({expanded:document.querySelector('[data-search-trigger]').getAttribute('aria-expanded'),focused:document.activeElement===document.querySelector('#article-search')}))()")
assert results["keyboardOpen"] == {"expanded": "true", "focused": True}
press_key("Escape")
results["keyboardClose"] = js("(()=>({expanded:document.querySelector('[data-search-trigger]').getAttribute('aria-expanded'),focused:document.activeElement===document.querySelector('[data-search-trigger]')}))()")
assert results["keyboardClose"] == {"expanded": "false", "focused": True}

cdp("Emulation.setDeviceMetricsOverride", width=360, height=800, deviceScaleFactor=1, mobile=False)
results["narrow"] = js("(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,noOverflow:document.documentElement.scrollWidth<=innerWidth,buttons:[...document.querySelectorAll('.tag-filter')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})}))()")
assert results["narrow"]["noOverflow"] is True
assert results["narrow"]["buttons"] is True
cdp("Emulation.clearDeviceMetricsOverride")

results["focusHidden"] = js("!!document.querySelector('[aria-hidden=true]:focus, [aria-hidden=true] :focus')")
assert results["focusHidden"] is False
print(json.dumps(results, ensure_ascii=False, sort_keys=True))

if created:
  close_tab(target)
