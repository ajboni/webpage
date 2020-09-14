
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            throw new Error(`Function called outside component initialization`);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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
            block.m(node, next, lookup.has(block.key));
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
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Nav.svelte generated by Svelte v3.20.0 */

    const file = "src/Nav.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Alexis Boni";
    			attr_dev(h4, "class", "svelte-v5o3tc");
    			add_location(h4, file, 20, 2, 387);
    			attr_dev(div, "class", "logoContainer svelte-v5o3tc");
    			add_location(div, file, 18, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);
    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Prompt.svelte generated by Svelte v3.20.0 */

    const file$1 = "src/Prompt.svelte";

    function create_fragment$1(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("_");
    			attr_dev(span, "class", span_class_value = "prompt " + /*prompt*/ ctx[0] + " svelte-13fc01u");
    			add_location(span, file$1, 15, 0, 275);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*prompt*/ 1 && span_class_value !== (span_class_value = "prompt " + /*prompt*/ ctx[0] + " svelte-13fc01u")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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

    	const writable_props = ["time"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prompt> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prompt", $$slots, []);

    	$$self.$set = $$props => {
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    	};

    	$$self.$capture_state = () => ({ time, prompt });

    	$$self.$inject_state = $$props => {
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    		if ("prompt" in $$props) $$invalidate(0, prompt = $$props.prompt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [prompt, time];
    }

    class Prompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { time: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prompt",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get time() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Greet.svelte generated by Svelte v3.20.0 */
    const file$2 = "src/Greet.svelte";

    // (87:4) {#if animate}
    function create_if_block(ctx) {
    	let span;
    	let t;
    	let span_intro;
    	let span_outro;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*currentSkill*/ ctx[1]);
    			add_location(span, file$2, 87, 6, 1865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*currentSkill*/ 2) set_data_dev(t, /*currentSkill*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (span_outro) span_outro.end(1);
    				if (!span_intro) span_intro = create_in_transition(span, typewriter, {});
    				span_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (span_intro) span_intro.invalidate();
    			span_outro = create_out_transition(span, reverseTypewriter, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_outro) span_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(87:4) {#if animate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let h3;
    	let t1;
    	let h1;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let div0;
    	let p;
    	let t5;
    	let br0;
    	let t6;
    	let br1;
    	let t7;
    	let p_intro;
    	let t8;
    	let a0;
    	let button0;
    	let t10;
    	let a1;
    	let button1;
    	let current;
    	let if_block = /*animate*/ ctx[0] && create_if_block(ctx);
    	const prompt = new Prompt({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Hello";
    			t1 = space();
    			h1 = element("h1");
    			t2 = text("I'm\n    ");
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(prompt.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t5 = text("I'm an IT Professional with over 10 years of hands-on experience.\n        ");
    			br0 = element("br");
    			t6 = text("\n        I'm currently learning skills about webdev, devOps, kubernetes, gamedev,\n        music production and linux.\n        ");
    			br1 = element("br");
    			t7 = text("\n        I'm a self-hosted, Linux, DIY and FOSS ethusiast and always looking for\n        fun projects.");
    			t8 = space();
    			a0 = element("a");
    			button0 = element("button");
    			button0.textContent = "Contact Me!";
    			t10 = space();
    			a1 = element("a");
    			button1 = element("button");
    			button1.textContent = "Blog";
    			add_location(h3, file$2, 83, 2, 1811);
    			add_location(h1, file$2, 84, 2, 1828);
    			add_location(br0, file$2, 96, 8, 2114);
    			add_location(br1, file$2, 99, 8, 2246);
    			add_location(p, file$2, 94, 6, 2014);
    			set_style(button0, "width", "150px");
    			add_location(button0, file$2, 104, 8, 2413);
    			attr_dev(a0, "href", "mailto:mail@aboni.dev");
    			attr_dev(a0, "class", "svelte-1tme8cg");
    			add_location(a0, file$2, 103, 6, 2372);
    			set_style(button1, "width", "150px");
    			add_location(button1, file$2, 108, 8, 2540);
    			attr_dev(a1, "href", "https://blog.aboni.dev");
    			attr_dev(a1, "target", "__blank");
    			attr_dev(a1, "class", "svelte-1tme8cg");
    			add_location(a1, file$2, 106, 6, 2480);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$2, 93, 4, 1987);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$2, 92, 2, 1965);
    			attr_dev(div2, "class", "container svelte-1tme8cg");
    			add_location(div2, file$2, 82, 0, 1785);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(div2, t1);
    			append_dev(div2, h1);
    			append_dev(h1, t2);
    			if (if_block) if_block.m(h1, null);
    			append_dev(h1, t3);
    			mount_component(prompt, h1, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t5);
    			append_dev(p, br0);
    			append_dev(p, t6);
    			append_dev(p, br1);
    			append_dev(p, t7);
    			append_dev(div0, t8);
    			append_dev(div0, a0);
    			append_dev(a0, button0);
    			append_dev(div0, t10);
    			append_dev(div0, a1);
    			append_dev(a1, button1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*animate*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(h1, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
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
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_component(prompt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
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
    	const o = +getComputedStyle(node).opacity;

    	// node.textContent = "";
    	return {
    		duration,
    		delay: 300,
    		css: t => `
                  background-color: #9b4dca; 
                  color: #FFFFFF; 
                `
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Greet> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Greet", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		Prompt,
    		animate,
    		skills,
    		currentSkill,
    		currentSkillIndex,
    		cycleSkills,
    		typewriter,
    		reverseTypewriter
    	});

    	$$self.$inject_state = $$props => {
    		if ("animate" in $$props) $$invalidate(0, animate = $$props.animate);
    		if ("skills" in $$props) skills = $$props.skills;
    		if ("currentSkill" in $$props) $$invalidate(1, currentSkill = $$props.currentSkill);
    		if ("currentSkillIndex" in $$props) currentSkillIndex = $$props.currentSkillIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [animate, currentSkill];
    }

    class Greet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Greet",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const portfolioItems = [
      {
        id: 16,
        title: "Docurry",
        description: "A Spicy, Zero-Config Documentation Site Generator ",
        category: "App Development",
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
      {
        id: 13,
        title: "Jardeco",
        description: "Landing page and e-commerce site for local garden shop.",
        category: "Web Development",
        skills: ["Wordpress", "WooCommerce", "Elementor"],
        img: "img/jardeco.png",
        url: "https://jardeco.com.ar",
        icon: "img/icons8-web-design-96.png",
      },
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
        id: 2,
        title: "Speechr",
        description:
          "Speechr is a collaborative design and development tool for easy and organised game development.",
        category: "App Development",
        skills: ["React", "Mobx", "Electron", "Pouchdb", "Couchdb", "CI/CD"],
        img: "img/speechr.png",
        url: "https://baj.itch.io/speechr",
        icon: "img/speechr-icon.png",
      },
      {
        id: 3,
        title: "How To Cope With Boredom and Loneliness",
        description:
          "A free Steam game I've made with @poffle as Point Bleep Studios",
        category: "Game Development",
        skills: ["C#", "Unity", "Soundtrack", "Steamworks"],
        img: "img/htc.png",
        url:
          "https://store.steampowered.com/app/797390/How_To_Cope_With_Boredom_and_Loneliness/",
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
        id: 5,
        title: "Speechr Website",
        description:
          "Landing page for Speechr app, made with react, bootrap and semantic UI",
        category: "Web Development",
        skills: ["React", "Semantic-ui", "Bootstrap"],
        img: "img/speechr-site.png",
        url: "https://github.com/ajboni/speechr-website",
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
        url:
          "https://play.google.com/store/apps/details?id=anotador.de.truco.simple&hl=es_419",
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

    /* src/PortfolioItem.svelte generated by Svelte v3.20.0 */

    const file$3 = "src/PortfolioItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (112:4) {#each item.skills as skill}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*skill*/ ctx[1] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "skill svelte-1ni1q5n");
    			add_location(div, file$3, 112, 6, 2143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*skill*/ ctx[1] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(112:4) {#each item.skills as skill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_alt_value;
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
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
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

    			if (img0.src !== (img0_src_value = /*item*/ ctx[0].icon)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", img0_alt_value = "");
    			attr_dev(img0, "class", "svelte-1ni1q5n");
    			add_location(img0, file$3, 101, 4, 1801);
    			attr_dev(a0, "href", a0_href_value = /*item*/ ctx[0].url);
    			attr_dev(a0, "target", "__blank");
    			attr_dev(a0, "class", "svelte-1ni1q5n");
    			add_location(a0, file$3, 102, 4, 1838);
    			attr_dev(div0, "class", "title svelte-1ni1q5n");
    			add_location(div0, file$3, 100, 2, 1777);
    			if (img1.src !== (img1_src_value = /*item*/ ctx[0].img)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", img1_alt_value = /*item*/ ctx[0].title);
    			attr_dev(img1, "class", "svelte-1ni1q5n");
    			add_location(img1, file$3, 106, 6, 1969);
    			attr_dev(a1, "href", a1_href_value = /*item*/ ctx[0].url);
    			attr_dev(a1, "target", "__blank");
    			add_location(a1, file$3, 105, 4, 1926);
    			attr_dev(div1, "class", "img svelte-1ni1q5n");
    			add_location(div1, file$3, 104, 2, 1904);
    			attr_dev(div2, "class", "description svelte-1ni1q5n");
    			add_location(div2, file$3, 109, 2, 2029);
    			attr_dev(div3, "class", "skills svelte-1ni1q5n");
    			add_location(div3, file$3, 110, 2, 2083);
    			attr_dev(div4, "class", "card svelte-1ni1q5n");
    			add_location(div4, file$3, 98, 0, 1755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a0);
    			append_dev(a0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && img0.src !== (img0_src_value = /*item*/ ctx[0].icon)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*item*/ 1 && t1_value !== (t1_value = /*item*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*item*/ 1 && a0_href_value !== (a0_href_value = /*item*/ ctx[0].url)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*item*/ 1 && img1.src !== (img1_src_value = /*item*/ ctx[0].img)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*item*/ 1 && img1_alt_value !== (img1_alt_value = /*item*/ ctx[0].title)) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}

    			if (dirty & /*item*/ 1 && a1_href_value !== (a1_href_value = /*item*/ ctx[0].url)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*item*/ ctx[0].description + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*item*/ 1) {
    				each_value = /*item*/ ctx[0].skills;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { item } = $$props;
    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PortfolioItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PortfolioItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ item });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item];
    }

    class PortfolioItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PortfolioItem",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<PortfolioItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<PortfolioItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<PortfolioItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Separator.svelte generated by Svelte v3.20.0 */

    const file$4 = "src/Separator.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div0;
    	let hr0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let hr1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			hr0 = element("hr");
    			t0 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div2 = element("div");
    			hr1 = element("hr");
    			attr_dev(hr0, "class", "svelte-19iv3y9");
    			add_location(hr0, file$4, 16, 22, 305);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$4, 16, 2, 285);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$4, 17, 2, 318);
    			attr_dev(hr1, "class", "svelte-19iv3y9");
    			add_location(hr1, file$4, 18, 23, 383);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$4, 18, 2, 362);
    			attr_dev(div3, "class", "row svelte-19iv3y9");
    			add_location(div3, file$4, 15, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, hr0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, hr1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Separator> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Separator", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Separator",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Portfolio.svelte generated by Svelte v3.20.0 */
    const file$5 = "src/Portfolio.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (73:4) <Separator>
    function create_default_slot(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Personal Projects";
    			attr_dev(h2, "class", "svelte-13wwovk");
    			add_location(h2, file$5, 73, 6, 1912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(73:4) <Separator>",
    		ctx
    	});

    	return block;
    }

    // (94:6) {#if (i+1) % 3 === 1}
    function create_if_block$1(ctx) {
    	let div;
    	let t0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length && create_if_block_3(ctx);

    	function func(...args) {
    		return /*func*/ ctx[8](/*i*/ ctx[11], ...args);
    	}

    	let each_value_1 = /*filteredPortfolioItems*/ ctx[0].filter(func);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*subItem*/ ctx[12].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block1 = /*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			attr_dev(div, "class", "row svelte-13wwovk");
    			add_location(div, file$5, 95, 8, 2701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
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
    				const each_value_1 = /*filteredPortfolioItems*/ ctx[0].filter(func);
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t1, get_each_context_1);
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
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(94:6) {#if (i+1) % 3 === 1}",
    		ctx
    	});

    	return block;
    }

    // (99:10) {#if (i + 3 >= filteredPortfolioItems.length)}
    function create_if_block_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*filteredPortfolioItems*/ ctx[0].length % 3 === 1 && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*filteredPortfolioItems*/ ctx[0].length % 3 === 1) {
    				if (!if_block) {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(99:10) {#if (i + 3 >= filteredPortfolioItems.length)}",
    		ctx
    	});

    	return block;
    }

    // (100:12) {#if (filteredPortfolioItems.length %3 === 1)}
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column column-25 svelte-13wwovk");
    			add_location(div, file$5, 100, 16, 2894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(100:12) {#if (filteredPortfolioItems.length %3 === 1)}",
    		ctx
    	});

    	return block;
    }

    // (107:10) {#each filteredPortfolioItems.filter((eachElem, index) => {             return index < i + 3 && index >= i             }) as subItem,x (subItem.id)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let t;
    	let current;

    	const portfolioitem = new PortfolioItem({
    			props: { item: /*subItem*/ ctx[12] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(portfolioitem.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "column svelte-13wwovk");
    			add_location(div, file$5, 109, 14, 3184);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(portfolioitem, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const portfolioitem_changes = {};
    			if (dirty & /*filteredPortfolioItems*/ 1) portfolioitem_changes.item = /*subItem*/ ctx[12];
    			portfolioitem.$set(portfolioitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portfolioitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portfolioitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(portfolioitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(107:10) {#each filteredPortfolioItems.filter((eachElem, index) => {             return index < i + 3 && index >= i             }) as subItem,x (subItem.id)}",
    		ctx
    	});

    	return block;
    }

    // (116:10) {#if (i + 3 >= filteredPortfolioItems.length)}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*filteredPortfolioItems*/ ctx[0].length % 3 === 1 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*filteredPortfolioItems*/ ctx[0].length % 3 === 1) {
    				if (!if_block) {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(116:10) {#if (i + 3 >= filteredPortfolioItems.length)}",
    		ctx
    	});

    	return block;
    }

    // (117:12) {#if (filteredPortfolioItems.length %3 === 1)}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column column-25 svelte-13wwovk");
    			add_location(div, file$5, 117, 16, 3500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(117:12) {#if (filteredPortfolioItems.length %3 === 1)}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#each filteredPortfolioItems as item,i (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = (/*i*/ ctx[11] + 1) % 3 === 1 && create_if_block$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((/*i*/ ctx[11] + 1) % 3 === 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(93:4) {#each filteredPortfolioItems as item,i (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div5;
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
    	let dispose;

    	const separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*filteredPortfolioItems*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
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

    			attr_dev(div0, "class", "column column-20 svelte-13wwovk");
    			add_location(div0, file$5, 77, 5, 1983);
    			attr_dev(input, "placeholder", "Search...");
    			add_location(input, file$5, 79, 8, 2065);
    			attr_dev(div1, "class", "column column-40 svelte-13wwovk");
    			add_location(div1, file$5, 78, 6, 2026);
    			option0.__value = "All";
    			option0.value = option0.__value;
    			add_location(option0, file$5, 84, 8, 2344);
    			option1.__value = "Text";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 85, 8, 2385);
    			option2.__value = "Tags";
    			option2.value = option2.__value;
    			add_location(option2, file$5, 86, 8, 2428);
    			attr_dev(select, "id", "ageRangeField");
    			if (/*filterType*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
    			add_location(select, file$5, 83, 6, 2258);
    			attr_dev(div2, "class", "column column-25 svelte-13wwovk");
    			add_location(div2, file$5, 81, 6, 2161);
    			attr_dev(div3, "class", "column column-20 svelte-13wwovk");
    			add_location(div3, file$5, 89, 6, 2504);
    			attr_dev(div4, "class", "row svelte-13wwovk");
    			add_location(div4, file$5, 76, 3, 1960);
    			attr_dev(div5, "class", "container svelte-13wwovk");
    			add_location(div5, file$5, 71, 0, 1866);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div5, anchor);
    			mount_component(separator, div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*filter*/ ctx[1]);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*filterType*/ ctx[2]);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div5, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    				listen_dev(input, "input", /*handleSearch*/ ctx[3], false, false, false),
    				listen_dev(select, "change", /*select_change_handler*/ ctx[7]),
    				listen_dev(select, "change", /*handleSearch*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
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
    				const each_value = /*filteredPortfolioItems*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div5, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(separator.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(separator);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let filteredPortfolioItems = portfolioItems;
    	let filter = "";
    	let filterType = "All";
    	let slotsArray = [];
    	let fillerSlots = 3 - filteredPortfolioItems.length % 3;

    	// if(filteredPortfolioItems.length < 3) { fillerSlots = 3;}
    	for (let index = 0; index < fillerSlots; index++) {
    		slotsArray.push(index);
    	}

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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Portfolio", $$slots, []);

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

    	$$self.$capture_state = () => ({
    		portfolioItems,
    		PortfolioItem,
    		Separator,
    		filteredPortfolioItems,
    		filter,
    		filterType,
    		slotsArray,
    		fillerSlots,
    		handleSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ("filteredPortfolioItems" in $$props) $$invalidate(0, filteredPortfolioItems = $$props.filteredPortfolioItems);
    		if ("filter" in $$props) $$invalidate(1, filter = $$props.filter);
    		if ("filterType" in $$props) $$invalidate(2, filterType = $$props.filterType);
    		if ("slotsArray" in $$props) slotsArray = $$props.slotsArray;
    		if ("fillerSlots" in $$props) fillerSlots = $$props.fillerSlots;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		filteredPortfolioItems,
    		filter,
    		filterType,
    		handleSearch,
    		slotsArray,
    		fillerSlots,
    		input_input_handler,
    		select_change_handler,
    		func
    	];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$5.name
    		});
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
        id: 11,
        title: "Blog",
        url: "https://blog.aboni.dev",
        img: "./img/icons8-blog-96.png"
      },

      {
        id: 2,
        title: "Github",
        url: "https://github.com/ajboni/",
        img: "./img/icons8-github-100.png"
      },
      {
        id: 3,
        title: "Gitlab",
        url: "https://gitlab.com/ajboni",
        img: "./img/icons8-gitlab-100.png"
      },
      // {
      //   id: 4,
      //   title: "Twitter",
      //   url: "https://twitter.com/rdbdlf",
      //   img: "./img/icons8-twitter-100.png"
      // },
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

    /* src/ContactForm.svelte generated by Svelte v3.20.0 */

    function create_fragment$6(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ContactForm", $$slots, []);
    	return [];
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactForm",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Contact.svelte generated by Svelte v3.20.0 */
    const file$6 = "src/Contact.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (27:2) <Separator>
    function create_default_slot$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Contact me";
    			attr_dev(h2, "class", "svelte-fe5hq9");
    			add_location(h2, file$6, 27, 4, 415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(27:2) <Separator>",
    		ctx
    	});

    	return block;
    }

    // (32:4) {#each contactItems as item,i }
    function create_each_block$2(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0_value = /*item*/ ctx[0].title + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = text(t0_value);
    			t1 = space();
    			if (img.src !== (img_src_value = /*item*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[0].title);
    			add_location(img, file$6, 33, 46, 581);
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[0].url);
    			attr_dev(a, "target", "__blank");
    			attr_dev(a, "class", "svelte-fe5hq9");
    			add_location(a, file$6, 33, 10, 545);
    			attr_dev(div, "class", "column");
    			add_location(div, file$6, 32, 6, 513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:4) {#each contactItems as item,i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;

    	const separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = contactItems;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const contactform = new ContactForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(contactform.$$.fragment);
    			attr_dev(div0, "class", "row svelte-fe5hq9");
    			add_location(div0, file$6, 30, 2, 453);
    			attr_dev(div1, "class", "container svelte-fe5hq9");
    			add_location(div1, file$6, 25, 0, 373);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(separator, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t1);
    			mount_component(contactform, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*contactItems*/ 0) {
    				each_value = contactItems;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			transition_in(contactform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(separator.$$.fragment, local);
    			transition_out(contactform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(separator);
    			destroy_each(each_blocks, detaching);
    			destroy_component(contactform);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Contact", $$slots, []);
    	$$self.$capture_state = () => ({ contactItems, ContactForm, Separator });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.20.0 */

    const file$7 = "src/Footer.svelte";

    function create_fragment$8(ctx) {
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

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "© Alexis Boni 2019";
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
    			attr_dev(div0, "class", "footer-copyright svelte-1qnri7w");
    			add_location(div0, file$7, 30, 2, 519);
    			if (img0.src !== (img0_src_value = "./img/icons8-heart-100.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "love");
    			attr_dev(img0, "class", "svelte-1qnri7w");
    			add_location(img0, file$7, 33, 4, 625);
    			attr_dev(a0, "href", "https://svelte.dev/");
    			attr_dev(a0, "alt", "Svelte");
    			attr_dev(a0, "class", "svelte-1qnri7w");
    			add_location(a0, file$7, 35, 4, 696);
    			attr_dev(a1, "href", "https://milligram.io/");
    			attr_dev(a1, "alt", "Milligram");
    			attr_dev(a1, "class", "svelte-1qnri7w");
    			add_location(a1, file$7, 37, 4, 762);
    			if (img1.src !== (img1_src_value = "./img/icons8-icons8-100.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "icons8");
    			attr_dev(img1, "class", "svelte-1qnri7w");
    			add_location(img1, file$7, 39, 4, 845);
    			attr_dev(a2, "href", "https://icons8.com");
    			attr_dev(a2, "alt", "Icons8");
    			attr_dev(a2, "class", "svelte-1qnri7w");
    			add_location(a2, file$7, 40, 4, 904);
    			attr_dev(div1, "class", "footer-copyright svelte-1qnri7w");
    			add_location(div1, file$7, 31, 2, 576);
    			attr_dev(footer, "class", "svelte-1qnri7w");
    			add_location(footer, file$7, 29, 0, 508);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(footer, t1);
    			append_dev(footer, div1);
    			append_dev(div1, t2);
    			append_dev(div1, img0);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, a0);
    			append_dev(div1, t7);
    			append_dev(div1, a1);
    			append_dev(div1, t9);
    			append_dev(div1, img1);
    			append_dev(div1, t10);
    			append_dev(div1, a2);
    			append_dev(div1, t12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const skillsItems = {
      it: [
        "Network Planning, Cisco CCNA level: Routing and switching",
        "Router/Firewall administration",
        "Widows/Linux Server Administration",
        "Virtualization with VMWare and Proxmox",
        "Technology implementation of essential enterprise solutions (Directory services, antivirus , backup services,  policies etc)",
        "Software and Hardware Logging and monitoring",
        "Project Management and Team Leader",
        "Tech Support (Software and Hardware)",
        "Equipment Configuration and commisioning",
      ],
      dev: [
        "Javascript, HTML,CSS",
        "Node.js, React.js, Svelte, Mobx",
        "Wordpress, WooCommerce",
        "Antd, TailwindCSS, Bulma, Bootstrap, MeterialUI",
        "Game Development with Unity 3D and Godot Engine",
        "Python, c#, vba, excel, php",
        "Devops, kubernetes, docker, IaaC",
      ],
      misc: [
        "4 Years of English-Spanish translation specializing in computer science and technical translation",
        "Successfully finished Cisco CCNA official course (certification pending)",
        "Music and Audio Production, Mixing and Mastering.",
        "English level, written: bilingual, spoken: medium",
      ],
    };

    /* src/Skills.svelte generated by Svelte v3.20.0 */
    const file$8 = "src/Skills.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (23:4) <Separator>
    function create_default_slot$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Skills";
    			attr_dev(h2, "class", "svelte-1fysxq7");
    			add_location(h2, file$8, 23, 6, 357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(23:4) <Separator>",
    		ctx
    	});

    	return block;
    }

    // (30:16) {#each skillsItems.it as item}
    function create_each_block_2(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(li, file$8, 30, 20, 555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(30:16) {#each skillsItems.it as item}",
    		ctx
    	});

    	return block;
    }

    // (41:20) {#each skillsItems.dev as item}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(li, file$8, 41, 24, 914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(41:20) {#each skillsItems.dev as item}",
    		ctx
    	});

    	return block;
    }

    // (51:20) {#each skillsItems.misc as item}
    function create_each_block$3(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[0] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(li, file$8, 51, 24, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(51:20) {#each skillsItems.misc as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div5;
    	let t0;
    	let div4;
    	let div0;
    	let h30;
    	let t2;
    	let ul0;
    	let t3;
    	let div3;
    	let div1;
    	let h31;
    	let t5;
    	let ul1;
    	let t6;
    	let div2;
    	let h32;
    	let t8;
    	let ul2;
    	let current;

    	const separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_2 = skillsItems.it;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = skillsItems.dev;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = skillsItems.misc;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "IT";
    			t2 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Dev";
    			t5 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Misc";
    			t8 = space();
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h30, "class", "svelte-1fysxq7");
    			add_location(h30, file$8, 27, 12, 458);
    			add_location(ul0, file$8, 28, 12, 483);
    			attr_dev(div0, "class", "column card svelte-1fysxq7");
    			add_location(div0, file$8, 26, 8, 420);
    			attr_dev(h31, "class", "svelte-1fysxq7");
    			add_location(h31, file$8, 38, 16, 787);
    			add_location(ul1, file$8, 39, 16, 833);
    			attr_dev(div1, "class", "row card svelte-1fysxq7");
    			add_location(div1, file$8, 37, 12, 748);
    			attr_dev(h32, "class", "svelte-1fysxq7");
    			add_location(h32, file$8, 48, 16, 1137);
    			add_location(ul2, file$8, 49, 16, 1168);
    			attr_dev(div2, "class", "row card svelte-1fysxq7");
    			add_location(div2, file$8, 47, 12, 1098);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$8, 36, 8, 715);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$8, 25, 4, 394);
    			attr_dev(div5, "class", "container svelte-1fysxq7");
    			add_location(div5, file$8, 21, 1, 311);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			mount_component(separator, div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t2);
    			append_dev(div0, ul0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t5);
    			append_dev(div1, ul1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, h32);
    			append_dev(div2, t8);
    			append_dev(div2, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*skillsItems*/ 0) {
    				each_value_2 = skillsItems.it;
    				validate_each_argument(each_value_2);
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
    				each_value_1 = skillsItems.dev;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
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
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(separator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(separator);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Skills", $$slots, []);
    	$$self.$capture_state = () => ({ Separator, skillsItems });
    	return [];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.0 */

    function create_fragment$a(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	const logonav = new Nav({ $$inline: true });
    	const greet = new Greet({ $$inline: true });
    	const skills = new Skills({ $$inline: true });
    	const portfolio = new Portfolio({ $$inline: true });
    	const contact = new Contact({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
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
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(logonav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(greet, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(skills, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(portfolio, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(contact, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logonav.$$.fragment, local);
    			transition_in(greet.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logonav.$$.fragment, local);
    			transition_out(greet.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(logonav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(greet, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(skills, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(portfolio, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(contact, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		LogoNav: Nav,
    		Greet,
    		Portfolio,
    		Contact,
    		Footer,
    		Skills,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
