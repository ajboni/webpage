
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/Nav.svelte generated by Svelte v3.35.0 */

    function add_css$9() {
    	var style = element("style");
    	style.id = "svelte-1vpaih-style";
    	style.textContent = ".logoContainer.svelte-1vpaih{height:60px;z-index:100;display:flex;align-items:center;padding:20px;border-bottom:2px solid #252728;background-color:#1a1a1d}h4.svelte-1vpaih{margin:0px}";
    	append(document.head, style);
    }

    function create_fragment$9(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<h4 class="svelte-1vpaih">Alexis Boni</h4>`;
    			attr(div, "class", "logoContainer svelte-1vpaih");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    class Nav extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1vpaih-style")) add_css$9();
    		init(this, options, null, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* src/Prompt.svelte generated by Svelte v3.35.0 */

    function add_css$8() {
    	var style = element("style");
    	style.id = "svelte-13fc01u-style";
    	style.textContent = ".prompt.invisible.svelte-13fc01u{color:transparent}";
    	append(document.head, style);
    }

    function create_fragment$8(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			t = text("_");
    			attr(span, "class", span_class_value = "prompt " + /*prompt*/ ctx[0] + " svelte-13fc01u");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*prompt*/ 1 && span_class_value !== (span_class_value = "prompt " + /*prompt*/ ctx[0] + " svelte-13fc01u")) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { time = 250 } = $$props;
    	let prompt = "";

    	setInterval(
    		() => {
    			if (prompt == "visible") {
    				$$invalidate(0, prompt = "invisible");
    			} else $$invalidate(0, prompt = "visible");
    		},
    		time
    	);

    	$$self.$$set = $$props => {
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    	};

    	return [prompt, time];
    }

    class Prompt extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-13fc01u-style")) add_css$8();
    		init(this, options, instance$5, create_fragment$8, safe_not_equal, { time: 1 });
    	}
    }

    /* src/Greet.svelte generated by Svelte v3.35.0 */

    function add_css$7() {
    	var style = element("style");
    	style.id = "svelte-v63kvx-style";
    	style.textContent = "a.svelte-v63kvx{color:inherit}.container.svelte-v63kvx{text-align:center;margin-top:40px}button.svelte-v63kvx{background-color:#6f4b86;border-color:#6f4b86}button.svelte-v63kvx:hover{background-color:#9b4dca;border-color:#9b4dca;color:white;cursor:pointer}";
    	append(document.head, style);
    }

    // (76:4) {#if animate}
    function create_if_block$1(ctx) {
    	let span;
    	let t;
    	let span_intro;
    	let span_outro;
    	let current;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*currentSkill*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*currentSkill*/ 2) set_data(t, /*currentSkill*/ ctx[1]);
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (span_outro) span_outro.end(1);
    				if (!span_intro) span_intro = create_in_transition(span, typewriter, {});
    				span_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			if (span_intro) span_intro.invalidate();
    			span_outro = create_out_transition(span, reverseTypewriter, {});
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (detaching && span_outro) span_outro.end();
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let h3;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let prompt;
    	let t4;
    	let div1;
    	let div0;
    	let p;
    	let p_intro;
    	let t8;
    	let a0;
    	let t10;
    	let a1;
    	let current;
    	let if_block = /*animate*/ ctx[0] && create_if_block$1(ctx);
    	prompt = new Prompt({});

    	return {
    		c() {
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Hello";
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("I'm\n    ");
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(prompt.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");

    			p.innerHTML = `I&#39;m an IT Professional and developer with 10+ years of hands-on
        experience.
        <br/>
        I&#39;m currently learning skills about jamstack, webdev, devOps, gamedev, music
        production and linux.
        <br/>
        I&#39;m a self-hosted, Linux, DIY and FOSS ethusiast and always looking for fun
        projects.`;

    			t8 = space();
    			a0 = element("a");
    			a0.innerHTML = `<button style="width: 150px" class="svelte-v63kvx">Contact Me!</button>`;
    			t10 = space();
    			a1 = element("a");
    			a1.innerHTML = `<button style="width: 150px" class="svelte-v63kvx">Blog</button>`;
    			attr(a0, "href", "mailto:mail@aboni.dev");
    			attr(a0, "class", "svelte-v63kvx");
    			attr(a1, "href", "https://blog.aboni.dev");
    			attr(a1, "target", "__blank");
    			attr(a1, "class", "svelte-v63kvx");
    			attr(div0, "class", "column");
    			attr(div1, "class", "row");
    			attr(div2, "class", "container svelte-v63kvx");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, h3);
    			append(div2, t1);
    			append(div2, h2);
    			append(h2, t2);
    			if (if_block) if_block.m(h2, null);
    			append(h2, t3);
    			mount_component(prompt, h2, null);
    			append(div2, t4);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, p);
    			append(div0, t8);
    			append(div0, a0);
    			append(div0, t10);
    			append(div0, a1);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*animate*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*animate*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(h2, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(prompt.$$.fragment, local);

    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, typewriter, {});
    					p_intro.start();
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(prompt.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();
    			destroy_component(prompt);
    		}
    	};
    }

    function typewriter(node, { speed = 50 }) {
    	const text = node.textContent;
    	const duration = text.length * speed;

    	return {
    		duration,
    		tick: t => {
    			const i = ~~(text.length * t);
    			node.textContent = text.slice(0, i);
    		}
    	};
    }

    function reverseTypewriter(node, { speed = 50 }) {
    	const text = node.textContent;
    	const duration = text.length * speed;
    	+getComputedStyle(node).opacity;

    	// node.textContent = "";
    	return {
    		duration,
    		delay: 300,
    		css: t => `
                  background-color: #6f4b86; 
                  color: #FFFFFF; 
                `
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let animate = false;

    	let skills = [
    		"IT infraestructure administrator",
    		"a web developer",
    		"a network administrator and engineer",
    		"a game developer",
    		"a devOps engineer",
    		"a music maker",
    		"Linux, OSS, and DIY enthusiast"
    	];

    	let currentSkill = skills[0];
    	let currentSkillIndex = 0;

    	onMount(() => {
    		$$invalidate(0, animate = true);

    		setTimeout(
    			() => {
    				// console.log("Animate OUT");
    				$$invalidate(0, animate = false);
    			},
    			3800
    		);

    		setInterval(
    			() => {
    				// console.log("Animate IN");
    				cycleSkills();

    				$$invalidate(0, animate = true);

    				setTimeout(
    					() => {
    						$$invalidate(0, animate = false); // console.log("Animate OUT");
    					},
    					3500
    				); // console.log("Animate OUT");
    			},
    			6000
    		);
    	});

    	function cycleSkills() {
    		if (currentSkillIndex >= skills.length - 1) {
    			currentSkillIndex = -1;
    		}

    		currentSkillIndex++;
    		$$invalidate(1, currentSkill = skills[currentSkillIndex]);
    	}

    	return [animate, currentSkill];
    }

    class Greet extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-v63kvx-style")) add_css$7();
    		init(this, options, instance$4, create_fragment$7, safe_not_equal, {});
    	}
    }

    const portfolioItems = [
      {
        id: 20,
        title: "Drafft",
        description:
          "Drafft is a collaborative design and development tool for easy and organised game development.",
        category: "App Development",
        skills: ["React", "Mobx", "Electron", "Pouchdb", "Couchdb", "CI/CD"],
        img: "img/drafft.jpg",
        url: "https://baj.itch.io/drafft",
        icon: "img/drafft_icon.png",
      },

      {
        id: 19,
        title: "Arduino Chess Clock",
        description:
          "archckl - A simple but functional chess clock made with arduino nano and a few components.",
        category: "App Development",
        skills: ["C++", "Arduino", "Electronics"],
        url: "https://github.com/ajboni/archclck",
        icon: "img/icons8-chess-clock-96.png",
        img: "img/archclck.jpg",
      },

      {
        id: 18,
        title: "Ateitis Corp",
        description:
          "Headless CMS and Ecommerce for Ateitis Corp made with React, Gatsby and Wordpress.",
        category: "Web Development",
        skills: ["React", "GraphQL", "Wordpress", "WooCommerce"],
        img: "img/ateitis.png",
        url: "https://ateitiscorp.com",
        icon: "img/icons8-web-design-96.png",
      },
      {
        id: 17,
        title: "Stuck in a drum loop",
        description:
          "This game is an experiment done in 72hs for for Ludum Dare 47 game jam. Theme: Stuck in a loop. It's an excuse to learn about Tone.js",
        category: "Game Development",
        skills: ["Tone.js", "Svelte", "HTML", "CSS"],
        img: "img/siadl.png",
        url: "https://github.com/ajboni/ld47-stuck-in-a-drum-loop",
        icon: "img/icons8-control-96.png",
      },
      {
        id: 16,
        title: "Docurry",
        description: "A Spicy, Zero-Config Documentation Site Generator ",
        category: "Web Development",
        skills: ["Node.js", "HTML", "CSS"],
        img: "img/docurry.jpg",
        url: "https://github.com/ajboni/docurry",
        icon: "img/icons8-github-100.png",
      },
      {
        id: 15,
        title: "Calvo",
        description: "A jalv based lv2 plugin rack for your terminal. ",
        category: "App Development",
        skills: ["Node.js", "jack", "lv2", "Linux"],
        img: "img/calvo.png",
        url: "https://github.com/ajboni/calvo",
        icon: "img/icons8-github-100.png",
      },
      {
        id: 14,
        title: "Airwindows Cheatsheet",
        description: "Cheatsheet for airwindows plugins.",
        category: "Web Development",
        skills: ["Svelte", "Bulma", "Travis"],
        img: "img/airwindows-cheatsheet.png",
        url: "https://github.com/ajboni/airwindows-cheatsheet",
        icon: "img/icons8-web-design-96.png",
      },
      //   {
      //     id: 13,
      //     title: "Jardeco",
      //     description: "Landing page and e-commerce site for local garden shop.",
      //     category: "Web Development",
      //     skills: ["Wordpress", "WooCommerce", "Elementor"],
      //     img: "img/jardeco.png",
      //     url: "https://jardeco.com.ar",
      //     icon: "img/icons8-web-design-96.png",
      //   },
      {
        id: 12,
        title: "Pomodolfo",
        description: "Extremely simple multiplatform pomodoro timer for desktop.",
        category: "App Development",
        skills: ["Svelte", "Electron", "Bulma", "Butler"],
        img: "img/pomodolfo.png",
        url: "https://baj.itch.io/pomodolfo",
        icon: "img/pomodolfo-icon.png",
      },
      {
        id: 11,
        title: "Svelte Static Blog Generator",
        description:
          "Static blog generator powered by svelte, sapper and tailwindcss .",
        category: "App Development",
        skills: ["Svelte", "Sapper", "TailwindCSS", "Travis"],
        img: "img/blog.png",
        url: "https://github.com/ajboni/svelte-sapper-static-blog",
        icon: "img/icons8-pencil-64.png",
      },
      {
        id: 10,
        title: "TXTdit",
        description:
          "TXTDIT is an open-source featurless themeable text editor. Main features: No text formatting, Multiple Themes, Import/export. Autosave. No more features",
        category: "App Development",
        skills: ["Svelte", "CSS", "Travis", "Github Pages", "CI/CD"],
        img: "img/txtdit.png",
        url: "https://github.com/ajboni/txtdit",
        icon: "img/icons8-pencil-64.png",
      },
      {
        id: 1,
        title: "Scram (WIP)",
        description:
          "Slot Car Race Manager, server, and racer database for DIY slot car racer track controlled by Arduino. A rather complex project combining several technologies that I was interested in learning.",
        category: "App Development",
        skills: [
          "React",
          "Mobx",
          "GraphQL",
          "Hasura",
          "Postgres",
          "CI/CD",
          "Python",
          "Arduino",
          "SocketIO",
          "Flask",
        ],
        img: "img/scram.png",
        url: "https://github.com/ajboni/slot-car-race-manager",
        icon: "img/icons8-car-64.png",
      },
      {
        id: 3,
        title: "How To Cope With Boredom and Loneliness",
        description:
          "A free Steam game I've made with @poffle as Point Bleep Studios",
        category: "Game Development",
        skills: ["C#", "Unity", "Soundtrack", "Steamworks"],
        img: "img/htc.png",
        url: "https://store.steampowered.com/app/797390/How_To_Cope_With_Boredom_and_Loneliness/",
        icon: "img/icons8-steam-96.png",
      },
      {
        id: 4,
        title: "Personal Portfolio Website",
        description:
          "Landing page for my portfolio (this site). A great excuse to learn about Svelte.",
        category: "Web Development",
        skills: ["Svelte", "Milligram", "CI/CD"],
        img: "img/portfolio.png",
        url: "https://github.com/ajboni/webpage",
        icon: "img/icons8-web-design-96.png",
      },
      {
        id: 6,
        title: "The Mind Of Marlo",
        description: "A Steam game I've made with @poffle as Point Bleep Studios",
        category: "Game Development",
        skills: ["C#", "Unity", "Soundtrack", "Steamworks"],
        img: "img/mom.png",
        url: "https://store.steampowered.com/app/722870/The_Mind_of_Marlo/",
        icon: "img/icons8-steam-96.png",
      },
      {
        id: 7,
        title: "Anotador de Truco Simple ",
        description:
          "Really simple, free, no-ads and open source anottation tool for the popular argentinean game 'Truco'",
        category: "Game Development",
        skills: ["Godot", "GDScript", "Google Play"],
        img: "img/anotador_truco.png",
        url: "https://play.google.com/store/apps/details?id=anotador.de.truco.simple&hl=es_419",
        icon: "img/google_play.png",
      },
      {
        id: 8,
        title: "Arduino Midi Foot Controller",
        description: "A simple midi (foot) controller for Arduino Uno  ",
        category: "App Development",
        skills: ["C++", "Arduino", "Electronics"],
        img: "img/controller.jpg",
        url: "https://github.com/ajboni/ArduinoMidiFootController",
        icon: "img/icons8-github-100.png",
      },

      {
        id: 9,
        title: "Point Bleep Studios Games",
        description:
          "Under the name of Point Bleep Studios, @poffle and I developed several games that can be played for free at itch.io ",
        category: "Game Development",
        skills: ["C#", "Unity", "Soundtrack"],
        img: "img/pbs.png",
        url: "https://pointbleepstudios.itch.io/",
        icon: "img/icons8-control-96.png",
      },
    ];

    /* src/PortfolioItem.svelte generated by Svelte v3.35.0 */

    function add_css$6() {
    	var style = element("style");
    	style.id = "svelte-1jun58v-style";
    	style.textContent = ".card.svelte-1jun58v.svelte-1jun58v{border-radius:3px;margin-bottom:15px;min-height:100%;box-shadow:0 14px 28px rgba(0, 0, 0, 0.17), 0 10px 10px rgba(0, 0, 0, 0.17);display:flex;flex-direction:column;padding:10px;border:2px solid #252728}.title.svelte-1jun58v.svelte-1jun58v{border-bottom:1px solid #252728;padding-bottom:10px;align-content:center;display:flex;flex-direction:column;justify-content:center;min-height:4em;align-items:center}.title.svelte-1jun58v img.svelte-1jun58v{width:25px;height:25px;margin:5px 0}.title.svelte-1jun58v a.svelte-1jun58v{text-decoration:none;margin:0;padding:0;color:inherit;text-align:center}.img.svelte-1jun58v.svelte-1jun58v{padding:20px;text-align:center}.img.svelte-1jun58v img.svelte-1jun58v{width:100%;border-radius:4px;transition:all 0.2s ease-out;opacity:0.9;max-height:250px;width:250px;object-fit:contain;border:1px solid #ddd}.img.svelte-1jun58v img.svelte-1jun58v:hover{transform:scale(1.1);opacity:1}.description.svelte-1jun58v.svelte-1jun58v{font-size:85%;padding:10px}.skills.svelte-1jun58v.svelte-1jun58v{max-width:100%;display:flex;flex-wrap:wrap;padding:5px 10px 0px 10px}.skill.svelte-1jun58v.svelte-1jun58v{border-radius:3px;transition:color 0.2s;margin:0 5x 5px 0;padding:2px 8px;margin-bottom:10px;margin-right:10px;position:relative;font-size:0.6em;background-color:#6f4b86;border-color:#6f4b86}.skill.svelte-1jun58v.svelte-1jun58v:hover{background-color:#9b4dca;color:white;cursor:pointer}";
    	append(document.head, style);
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (17:4) {#each item.skills as skill}
    function create_each_block$3(ctx) {
    	let div;
    	let t_value = /*skill*/ ctx[1] + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "skill svelte-1jun58v");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*skill*/ ctx[1] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let a0;
    	let t1_value = /*item*/ ctx[0].title + "";
    	let t1;
    	let a0_href_value;
    	let t2;
    	let div1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let img1_alt_value;
    	let a1_href_value;
    	let t3;
    	let div2;
    	let t4_value = /*item*/ ctx[0].description + "";
    	let t4;
    	let t5;
    	let div3;
    	let each_value = /*item*/ ctx[0].skills;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div4 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			a0 = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			a1 = element("a");
    			img1 = element("img");
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img0.src !== (img0_src_value = /*item*/ ctx[0].icon)) attr(img0, "src", img0_src_value);
    			attr(img0, "alt", "");
    			attr(img0, "class", "svelte-1jun58v");
    			attr(a0, "href", a0_href_value = /*item*/ ctx[0].url);
    			attr(a0, "target", "__blank");
    			attr(a0, "class", "svelte-1jun58v");
    			attr(div0, "class", "title svelte-1jun58v");
    			if (img1.src !== (img1_src_value = /*item*/ ctx[0].img)) attr(img1, "src", img1_src_value);
    			attr(img1, "alt", img1_alt_value = /*item*/ ctx[0].title);
    			attr(img1, "class", "svelte-1jun58v");
    			attr(a1, "href", a1_href_value = /*item*/ ctx[0].url);
    			attr(a1, "target", "__blank");
    			attr(div1, "class", "img svelte-1jun58v");
    			attr(div2, "class", "description svelte-1jun58v");
    			attr(div3, "class", "skills svelte-1jun58v");
    			attr(div4, "class", "card svelte-1jun58v");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			append(div0, img0);
    			append(div0, t0);
    			append(div0, a0);
    			append(a0, t1);
    			append(div4, t2);
    			append(div4, div1);
    			append(div1, a1);
    			append(a1, img1);
    			append(div4, t3);
    			append(div4, div2);
    			append(div2, t4);
    			append(div4, t5);
    			append(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && img0.src !== (img0_src_value = /*item*/ ctx[0].icon)) {
    				attr(img0, "src", img0_src_value);
    			}

    			if (dirty & /*item*/ 1 && t1_value !== (t1_value = /*item*/ ctx[0].title + "")) set_data(t1, t1_value);

    			if (dirty & /*item*/ 1 && a0_href_value !== (a0_href_value = /*item*/ ctx[0].url)) {
    				attr(a0, "href", a0_href_value);
    			}

    			if (dirty & /*item*/ 1 && img1.src !== (img1_src_value = /*item*/ ctx[0].img)) {
    				attr(img1, "src", img1_src_value);
    			}

    			if (dirty & /*item*/ 1 && img1_alt_value !== (img1_alt_value = /*item*/ ctx[0].title)) {
    				attr(img1, "alt", img1_alt_value);
    			}

    			if (dirty & /*item*/ 1 && a1_href_value !== (a1_href_value = /*item*/ ctx[0].url)) {
    				attr(a1, "href", a1_href_value);
    			}

    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*item*/ ctx[0].description + "")) set_data(t4, t4_value);

    			if (dirty & /*item*/ 1) {
    				each_value = /*item*/ ctx[0].skills;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { item } = $$props;

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	return [item];
    }

    class PortfolioItem extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1jun58v-style")) add_css$6();
    		init(this, options, instance$3, create_fragment$6, safe_not_equal, { item: 0 });
    	}
    }

    /* src/Separator.svelte generated by Svelte v3.35.0 */

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-38wxyt-style";
    	style.textContent = ".row.svelte-38wxyt{margin-top:80px;margin-bottom:20px}hr.svelte-38wxyt{background:linear-gradient(to right, transparent, #252728, transparent);width:80%;margin-right:20px;margin-left:20px;height:2px;border-top:unset !important}";
    	append(document.head, style);
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<hr class="svelte-38wxyt"/>`;
    			t0 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div2 = element("div");
    			div2.innerHTML = `<hr class="svelte-38wxyt"/>`;
    			attr(div0, "class", "column");
    			attr(div1, "class", "column");
    			attr(div2, "class", "column");
    			attr(div3, "class", "row svelte-38wxyt");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div3, t0);
    			append(div3, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append(div3, t1);
    			append(div3, div2);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Separator extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-38wxyt-style")) add_css$5();
    		init(this, options, instance$2, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src/Portfolio.svelte generated by Svelte v3.35.0 */

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-sd1ybq-style";
    	style.textContent = ".container.svelte-sd1ybq h2.svelte-sd1ybq{text-align:center}.row.svelte-sd1ybq .column.svelte-sd1ybq{margin-bottom:40px !important}input.svelte-sd1ybq.svelte-sd1ybq,select.svelte-sd1ybq.svelte-sd1ybq{color:#d6dbdd !important}";
    	append(document.head, style);
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (54:2) <Separator>
    function create_default_slot$2(ctx) {
    	let h2;

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Personal Projects";
    			attr(h2, "class", "svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    		}
    	};
    }

    // (83:4) {#if (i + 1) % 3 === 1}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length && create_if_block_3(ctx);

    	function func(...args) {
    		return /*func*/ ctx[6](/*i*/ ctx[11], ...args);
    	}

    	let each_value_1 = /*filteredPortfolioItems*/ ctx[0].filter(func);
    	const get_key = ctx => /*subItem*/ ctx[12].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let if_block1 = /*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length && create_if_block_1(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			attr(div, "class", "row svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t2);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*filteredPortfolioItems*/ 1) {
    				each_value_1 = /*filteredPortfolioItems*/ ctx[0].filter(func);
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1$1, t1, get_each_context_1$1);
    				check_outros();
    			}

    			if (/*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (87:8) {#if i + 3 >= filteredPortfolioItems.length}
    function create_if_block_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*filteredPortfolioItems*/ ctx[0].length % 3 === 1 && create_if_block_4();

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*filteredPortfolioItems*/ ctx[0].length % 3 === 1) {
    				if (if_block) ; else {
    					if_block = create_if_block_4();
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (88:10) {#if filteredPortfolioItems.length % 3 === 1}
    function create_if_block_4(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "column column-25 svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (93:8) {#each filteredPortfolioItems.filter((eachElem, index) => {           return index < i + 3 && index >= i;         }) as subItem, x (subItem.id)}
    function create_each_block_1$1(key_1, ctx) {
    	let div;
    	let portfolioitem;
    	let t;
    	let current;
    	portfolioitem = new PortfolioItem({ props: { item: /*subItem*/ ctx[12] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			create_component(portfolioitem.$$.fragment);
    			t = space();
    			attr(div, "class", "column svelte-sd1ybq");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(portfolioitem, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const portfolioitem_changes = {};
    			if (dirty & /*filteredPortfolioItems*/ 1) portfolioitem_changes.item = /*subItem*/ ctx[12];
    			portfolioitem.$set(portfolioitem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(portfolioitem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(portfolioitem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(portfolioitem);
    		}
    	};
    }

    // (102:8) {#if i + 3 >= filteredPortfolioItems.length}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*filteredPortfolioItems*/ ctx[0].length % 3 === 1 && create_if_block_2();

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*filteredPortfolioItems*/ ctx[0].length % 3 === 1) {
    				if (if_block) ; else {
    					if_block = create_if_block_2();
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (103:10) {#if filteredPortfolioItems.length % 3 === 1}
    function create_if_block_2(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "column column-25 svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (82:2) {#each filteredPortfolioItems as item, i (item.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = (/*i*/ ctx[11] + 1) % 3 === 1 && create_if_block(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if ((/*i*/ ctx[11] + 1) % 3 === 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*filteredPortfolioItems*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let div5;
    	let separator;
    	let t0;
    	let div4;
    	let div0;
    	let t1;
    	let div1;
    	let input;
    	let t2;
    	let div2;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t6;
    	let div3;
    	let t7;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;

    	separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = /*filteredPortfolioItems*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[9].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	return {
    		c() {
    			div5 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			div2 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "All";
    			option1 = element("option");
    			option1.textContent = "Text";
    			option2 = element("option");
    			option2.textContent = "Tags";
    			t6 = space();
    			div3 = element("div");
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "column column-20 svelte-sd1ybq");
    			attr(input, "placeholder", "Search...");
    			attr(input, "class", "svelte-sd1ybq");
    			attr(div1, "class", "column column-40 svelte-sd1ybq");
    			option0.__value = "All";
    			option0.value = option0.__value;
    			option1.__value = "Text";
    			option1.value = option1.__value;
    			option2.__value = "Tags";
    			option2.value = option2.__value;
    			attr(select, "id", "ageRangeField");
    			attr(select, "class", "svelte-sd1ybq");
    			if (/*filterType*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			attr(div2, "class", "column column-25 svelte-sd1ybq");
    			attr(div3, "class", "column column-20 svelte-sd1ybq");
    			attr(div4, "class", "row svelte-sd1ybq");
    			attr(div5, "class", "container svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			mount_component(separator, div5, null);
    			append(div5, t0);
    			append(div5, div4);
    			append(div4, div0);
    			append(div4, t1);
    			append(div4, div1);
    			append(div1, input);
    			set_input_value(input, /*filter*/ ctx[1]);
    			append(div4, t2);
    			append(div4, div2);
    			append(div2, select);
    			append(select, option0);
    			append(select, option1);
    			append(select, option2);
    			select_option(select, /*filterType*/ ctx[2]);
    			append(div4, t6);
    			append(div4, div3);
    			append(div5, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[4]),
    					listen(input, "input", /*handleSearch*/ ctx[3]),
    					listen(select, "change", /*select_change_handler*/ ctx[5]),
    					listen(select, "change", /*handleSearch*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*filter*/ 2 && input.value !== /*filter*/ ctx[1]) {
    				set_input_value(input, /*filter*/ ctx[1]);
    			}

    			if (dirty & /*filterType*/ 4) {
    				select_option(select, /*filterType*/ ctx[2]);
    			}

    			if (dirty & /*filteredPortfolioItems*/ 1) {
    				each_value = /*filteredPortfolioItems*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div5, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(separator.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			destroy_component(separator);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let filteredPortfolioItems = portfolioItems;
    	let filter = "";
    	let filterType = "All";
    	3 - filteredPortfolioItems.length % 3;

    	function handleSearch(event) {
    		const value = event.target.value;

    		if (value.length > 0) {
    			// filteredPortfolioItems = portfolioItems.slice(0,2);
    			switch (filterType) {
    				case "Text":
    					$$invalidate(0, filteredPortfolioItems = portfolioItems.filter(item => item.description.toLowerCase().includes(filter.toLowerCase()) || item.title.toLowerCase().includes(filter.toLowerCase())));
    					break;
    				case "Tags":
    					$$invalidate(0, filteredPortfolioItems = portfolioItems.filter(item => item.skills.join("|").toLowerCase().includes(filter.toLowerCase())));
    					break;
    				default:
    					$$invalidate(0, filteredPortfolioItems = portfolioItems.filter(item => item.description.toLowerCase().includes(filter.toLowerCase()) || item.title.toLowerCase().includes(filter.toLowerCase()) || item.skills.join("|").toLowerCase().includes(filter.toLowerCase())));
    					break;
    			}
    		} else {
    			$$invalidate(0, filteredPortfolioItems = portfolioItems);
    		}
    	}

    	function input_input_handler() {
    		filter = this.value;
    		$$invalidate(1, filter);
    	}

    	function select_change_handler() {
    		filterType = select_value(this);
    		$$invalidate(2, filterType);
    	}

    	const func = (i, eachElem, index) => {
    		return index < i + 3 && index >= i;
    	};

    	return [
    		filteredPortfolioItems,
    		filter,
    		filterType,
    		handleSearch,
    		input_input_handler,
    		select_change_handler,
    		func
    	];
    }

    class Portfolio extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-sd1ybq-style")) add_css$4();
    		init(this, options, instance$1, create_fragment$4, safe_not_equal, {});
    	}
    }

    const contactItems = [
      {
        id: 1,
        title: "E-mail",
        url: "mailto:mail@aboni.dev",
        img: "./img/icons8-email-sign-100.png"
      },
      {
        id: 2,
        title: "Github",
        url: "https://github.com/ajboni/",
        img: "./img/icons8-github-100.png"
      },
      {
        id: 4,
        title: "Fiverr",
        url: "https://www.fiverr.com/ajboni?up_rollout=true",
        img: "./img/fiverr_logo.png"
      },
      {
        id: 11,
        title: "Blog",
        url: "https://blog.aboni.dev",
        img: "./img/icons8-blog-96.png"
      },


    //   {
    //     id: 3,
    //     title: "Gitlab",
    //     url: "https://gitlab.com/ajboni",
    //     img: "./img/icons8-gitlab-100.png"
    //   },

      {
        id: 5,
        title: "Youtube",
        url: "https://www.youtube.com/channel/UCweBjZoA-EJ1i33CXcpghgQ",
        img: "./img/icons8-play-button-100.png"
      },
      {
        id: 6,
        title: "Soundcloud",
        url: "https://soundcloud.com/ajboni",
        img: "./img/icons8-soundcloud-100.png"
      }
    ];

    /* src/ContactForm.svelte generated by Svelte v3.35.0 */

    class ContactForm extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/Contact.svelte generated by Svelte v3.35.0 */

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-tj4o52-style";
    	style.textContent = "@media screen and (max-width: 767px){.contact-row.svelte-tj4o52.svelte-tj4o52{flex-direction:row;flex-wrap:wrap}.contact-row.svelte-tj4o52 .column.svelte-tj4o52{width:33.33%}}.container.svelte-tj4o52 h2.svelte-tj4o52{text-align:center}.row.svelte-tj4o52.svelte-tj4o52{text-align:center}a.svelte-tj4o52.svelte-tj4o52,a.svelte-tj4o52.svelte-tj4o52:focus,a.svelte-tj4o52.svelte-tj4o52:hover{display:flex;flex-direction:column;align-items:center;text-decoration:none;color:gray !important}";
    	append(document.head, style);
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (8:2) <Separator>
    function create_default_slot$1(ctx) {
    	let h2;

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Contact me";
    			attr(h2, "class", "svelte-tj4o52");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    		}
    	};
    }

    // (13:4) {#each contactItems as item, i}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t0_value = /*item*/ ctx[0].title + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = text(t0_value);
    			t1 = space();
    			if (img.src !== (img_src_value = /*item*/ ctx[0].img)) attr(img, "src", img_src_value);
    			attr(img, "alt", /*item*/ ctx[0].title);
    			attr(a, "href", /*item*/ ctx[0].url);
    			attr(a, "target", "__blank");
    			attr(a, "class", "svelte-tj4o52");
    			attr(div, "class", "column svelte-tj4o52");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, a);
    			append(a, img);
    			append(a, t0);
    			append(div, t1);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let separator;
    	let t0;
    	let div0;
    	let t1;
    	let contactform;
    	let current;

    	separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = contactItems;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	contactform = new ContactForm({});

    	return {
    		c() {
    			div1 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(contactform.$$.fragment);
    			attr(div0, "class", "row contact-row svelte-tj4o52");
    			attr(div1, "class", "container svelte-tj4o52");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(separator, div1, null);
    			append(div1, t0);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t1);
    			mount_component(contactform, div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*contactItems*/ 0) {
    				each_value = contactItems;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			transition_in(contactform.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(separator.$$.fragment, local);
    			transition_out(contactform.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_component(separator);
    			destroy_each(each_blocks, detaching);
    			destroy_component(contactform);
    		}
    	};
    }

    class Contact extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-tj4o52-style")) add_css$3();
    		init(this, options, null, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.35.0 */

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1la5udo-style";
    	style.textContent = "@media screen and (max-width: 767px){.footer-copyright.svelte-1la5udo{flex-direction:row;justify-content:center;flex-wrap:wrap}}footer.svelte-1la5udo{margin-top:100px;height:100px;display:flex;justify-content:center;align-items:center;flex-direction:column;border-top:2px solid #252728;background-color:#1a1a1d;font-size:90%}.footer-copyright.svelte-1la5udo{color:rgb(99, 99, 102);text-align:center;display:flex;align-items:center;margin-bottom:5px}img.svelte-1la5udo{width:20px;height:20px;margin:0px 5px}a.svelte-1la5udo{margin:0 5px}";
    	append(document.head, style);
    }

    function create_fragment$2(ctx) {
    	let footer;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let t4_value = " with " + "";
    	let t4;
    	let t5;
    	let a0;
    	let t7;
    	let a1;
    	let t9;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let a2;
    	let t12;

    	return {
    		c() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "© Alexis Boni 2021";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Made with\n    ");
    			img0 = element("img");
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t7 = text("\n    and\n    ");
    			a1 = element("a");
    			a1.textContent = "Milligram";
    			t9 = text("\n    - Icons from\n    ");
    			img1 = element("img");
    			t10 = space();
    			a2 = element("a");
    			a2.textContent = "Icons8";
    			t12 = text("\n    .");
    			attr(div0, "class", "footer-copyright svelte-1la5udo");
    			if (img0.src !== (img0_src_value = "./img/icons8-heart-100.png")) attr(img0, "src", img0_src_value);
    			attr(img0, "alt", "love");
    			attr(img0, "class", "svelte-1la5udo");
    			attr(a0, "href", "https://svelte.dev/");
    			attr(a0, "alt", "Svelte");
    			attr(a0, "class", "svelte-1la5udo");
    			attr(a1, "href", "https://milligram.io/");
    			attr(a1, "alt", "Milligram");
    			attr(a1, "class", "svelte-1la5udo");
    			if (img1.src !== (img1_src_value = "./img/icons8-icons8-100.png")) attr(img1, "src", img1_src_value);
    			attr(img1, "alt", "icons8");
    			attr(img1, "class", "svelte-1la5udo");
    			attr(a2, "href", "https://icons8.com");
    			attr(a2, "alt", "Icons8");
    			attr(a2, "class", "svelte-1la5udo");
    			attr(div1, "class", "footer-copyright svelte-1la5udo");
    			attr(footer, "class", "svelte-1la5udo");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, div0);
    			append(footer, t1);
    			append(footer, div1);
    			append(div1, t2);
    			append(div1, img0);
    			append(div1, t3);
    			append(div1, t4);
    			append(div1, t5);
    			append(div1, a0);
    			append(div1, t7);
    			append(div1, a1);
    			append(div1, t9);
    			append(div1, img1);
    			append(div1, t10);
    			append(div1, a2);
    			append(div1, t12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(footer);
    		}
    	};
    }

    class Footer extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1la5udo-style")) add_css$2();
    		init(this, options, null, create_fragment$2, safe_not_equal, {});
    	}
    }

    const skillsItems = {
      dev: [
        "Javascript, HTML,CSS",
        "Node.js, React.js, Svelte, Mobx",
        "Hugo, Gatsby, Next.js, Sapper",
        "Antd, TailwindCSS, Bulma, Bootstrap, MeterialUI",
        "Wordpress, WooCommerce",
        "Game Development with Unity 3D and Godot Engine",
        "Python, c#, vba, excel, php",
        "Devops, kubernetes, docker, IaaC",
      ],
      it: [
        "Network And Infraestructure Design, Planning and Implementation ",
        "Technical Project Management and Team Leader",
        "Technology research",
        "Router/Firewall administration",
        "Widows/Linux Server Administration",
        "Virtualization with VMWare and Proxmox",
        "Technology implementation of essential enterprise solutions.",
        "Software and Hardware Logging and monitoring",
        "Tech Support (Software and Hardware)",
        "Equipment Configuration and commisioning",
        "Cisco CCNA level: Routing and switching",
      ],
      misc: [
        "4 Years of English-Spanish translation specializing in computer science and technical translation",
        "Successfully finished Cisco CCNA official course: Routing and switching",
        "Music and Audio Production, Mixing and Mastering.",
        "English: Written: Proficient, Spoken: Intermediate",
        "Spanish: Native",
      ],
    };

    /* src/Skills.svelte generated by Svelte v3.35.0 */

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-2u4pwd-style";
    	style.textContent = ".container.svelte-2u4pwd h2.svelte-2u4pwd,h3.svelte-2u4pwd.svelte-2u4pwd{text-align:center}ul.svelte-2u4pwd.svelte-2u4pwd{margin:0}@media screen and (max-width: 767px){.title.svelte-2u4pwd.svelte-2u4pwd{width:100% !important;border-bottom:2px solid #252728;align-items:center;justify-items:center;justify-content:center}h3.svelte-2u4pwd.svelte-2u4pwd{margin:1rem 0}}.section.svelte-2u4pwd.svelte-2u4pwd{margin-bottom:4rem;border:2px solid #252728}.card.svelte-2u4pwd.svelte-2u4pwd{display:flex;flex-direction:column;padding:2rem 20px;margin:0 20px}.title.svelte-2u4pwd.svelte-2u4pwd{display:flex;align-items:center;justify-content:center;width:25%;background-color:#1a1a1a4b;margin-bottom:0;border-right:2px solid #252728}";
    	append(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (7:2) <Separator>
    function create_default_slot(ctx) {
    	let h2;

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Skills";
    			attr(h2, "class", "svelte-2u4pwd");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    		}
    	};
    }

    // (16:8) {#each skillsItems.dev as item}
    function create_each_block_2(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (30:8) {#each skillsItems.it as item}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (45:8) {#each skillsItems.misc as item}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div9;
    	let separator;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let ul0;
    	let t3;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let ul1;
    	let t6;
    	let div8;
    	let div6;
    	let t8;
    	let div7;
    	let ul2;
    	let current;

    	separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value_2 = skillsItems.dev;
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = skillsItems.it;
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = skillsItems.misc;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div9 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<h3 class="svelte-2u4pwd">Dev</h3>`;
    			t2 = space();
    			div1 = element("div");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.innerHTML = `<h3 class="svelte-2u4pwd">IT</h3>`;
    			t5 = space();
    			div4 = element("div");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.innerHTML = `<h3 class="svelte-2u4pwd">Misc</h3>`;
    			t8 = space();
    			div7 = element("div");
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "column title svelte-2u4pwd");
    			attr(ul0, "class", "svelte-2u4pwd");
    			attr(div1, "class", "column card svelte-2u4pwd");
    			attr(div2, "class", "row section svelte-2u4pwd");
    			attr(div3, "class", "column title svelte-2u4pwd");
    			attr(ul1, "class", "svelte-2u4pwd");
    			attr(div4, "class", "column card svelte-2u4pwd");
    			attr(div5, "class", "row section svelte-2u4pwd");
    			attr(div6, "class", "column title svelte-2u4pwd");
    			attr(ul2, "class", "svelte-2u4pwd");
    			attr(div7, "class", "column card svelte-2u4pwd");
    			attr(div8, "class", "row section svelte-2u4pwd");
    			attr(div9, "class", "container svelte-2u4pwd");
    		},
    		m(target, anchor) {
    			insert(target, div9, anchor);
    			mount_component(separator, div9, null);
    			append(div9, t0);
    			append(div9, div2);
    			append(div2, div0);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, ul0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			append(div9, t3);
    			append(div9, div5);
    			append(div5, div3);
    			append(div5, t5);
    			append(div5, div4);
    			append(div4, ul1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			append(div9, t6);
    			append(div9, div8);
    			append(div8, div6);
    			append(div8, t8);
    			append(div8, div7);
    			append(div7, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*skillsItems*/ 0) {
    				each_value_2 = skillsItems.dev;
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*skillsItems*/ 0) {
    				each_value_1 = skillsItems.it;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*skillsItems*/ 0) {
    				each_value = skillsItems.misc;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(separator.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div9);
    			destroy_component(separator);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    class Skills extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-2u4pwd-style")) add_css$1();
    		init(this, options, null, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-zyhlq1-style";
    	style.textContent = ".mainContainer.svelte-zyhlq1{background-color:#1d1f21 !important;color:#d6dbdd !important;font-family:\"Droid Sans Mono\", \"monospace\", monospace,\n      \"Droid Sans Fallback\";font-weight:normal;font-size:1.08em}::-moz-selection{background-color:#6f4b86}h2{font-size:3.5rem;line-height:1.6}::selection{background-color:#6f4b86}";
    	append(document.head, style);
    }

    function create_fragment(ctx) {
    	let div;
    	let logonav;
    	let t0;
    	let greet;
    	let t1;
    	let skills;
    	let t2;
    	let portfolio;
    	let t3;
    	let contact;
    	let t4;
    	let footer;
    	let current;
    	logonav = new Nav({});
    	greet = new Greet({});
    	skills = new Skills({});
    	portfolio = new Portfolio({});
    	contact = new Contact({});
    	footer = new Footer({});

    	return {
    		c() {
    			div = element("div");
    			create_component(logonav.$$.fragment);
    			t0 = space();
    			create_component(greet.$$.fragment);
    			t1 = space();
    			create_component(skills.$$.fragment);
    			t2 = space();
    			create_component(portfolio.$$.fragment);
    			t3 = space();
    			create_component(contact.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr(div, "class", "mainContainer svelte-zyhlq1");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(logonav, div, null);
    			append(div, t0);
    			mount_component(greet, div, null);
    			append(div, t1);
    			mount_component(skills, div, null);
    			append(div, t2);
    			mount_component(portfolio, div, null);
    			append(div, t3);
    			mount_component(contact, div, null);
    			append(div, t4);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(logonav.$$.fragment, local);
    			transition_in(greet.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(logonav.$$.fragment, local);
    			transition_out(greet.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(logonav);
    			destroy_component(greet);
    			destroy_component(skills);
    			destroy_component(portfolio);
    			destroy_component(contact);
    			destroy_component(footer);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { name } = $$props;

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	return [name];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-zyhlq1-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world"
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
