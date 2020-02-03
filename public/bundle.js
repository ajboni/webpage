
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
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
        else
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

    let stylesheet;
    let active = 0;
    let current_rules = {};
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
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
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
                block.p(changed, child_ctx);
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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
        document.dispatchEvent(custom_event(type, detail));
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
    }

    /* src/Nav.svelte generated by Svelte v3.12.1 */

    const file = "src/Nav.svelte";

    function create_fragment(ctx) {
    	var div, h4;

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
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Nav", options, id: create_fragment.name });
    	}
    }

    /* src/Prompt.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/Prompt.svelte";

    function create_fragment$1(ctx) {
    	var span, t, span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text("_");
    			attr_dev(span, "class", span_class_value = "prompt " + ctx.prompt + " svelte-13fc01u");
    			add_location(span, file$1, 15, 0, 275);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.prompt) && span_class_value !== (span_class_value = "prompt " + ctx.prompt + " svelte-13fc01u")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { time = 250 } = $$props;
       let prompt = "";
          setInterval(()=> {    
             if(prompt == "visible") { $$invalidate('prompt', prompt = "invisible"); } 
             else $$invalidate('prompt', prompt = "visible");
          },time);

    	const writable_props = ['time'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Prompt> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('time' in $$props) $$invalidate('time', time = $$props.time);
    	};

    	$$self.$capture_state = () => {
    		return { time, prompt };
    	};

    	$$self.$inject_state = $$props => {
    		if ('time' in $$props) $$invalidate('time', time = $$props.time);
    		if ('prompt' in $$props) $$invalidate('prompt', prompt = $$props.prompt);
    	};

    	return { time, prompt };
    }

    class Prompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["time"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Prompt", options, id: create_fragment$1.name });
    	}

    	get time() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Greet.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/Greet.svelte";

    // (86:4) {#if animate}
    function create_if_block(ctx) {
    	var span, t, span_intro, span_outro, current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.currentSkill);
    			add_location(span, file$2, 86, 6, 1825);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.currentSkill) {
    				set_data_dev(t, ctx.currentSkill);
    			}
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
    			if (detaching) {
    				detach_dev(span);
    				if (span_outro) span_outro.end();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(86:4) {#if animate}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div2, h3, t1, h1, t2, t3, t4, div1, div0, p, t5, br0, t6, br1, t7, p_intro, t8, a0, button0, t10, a1, button1, current;

    	var if_block = (ctx.animate) && create_if_block(ctx);

    	var prompt = new Prompt({ $$inline: true });

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
    			prompt.$$.fragment.c();
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t5 = text("I'm a 34 years old IT Professional with over 10 years of hands-on\n        experience.\n        ");
    			br0 = element("br");
    			t6 = text("\n        I'm currently learning skills about webdev, devOps, kubernetes, gamedev,\n        music production and linux.\n        ");
    			br1 = element("br");
    			t7 = text("\n        I'm a self-hosted, DIY and FOSS ethusiast and always looking for fun\n        projects.");
    			t8 = space();
    			a0 = element("a");
    			button0 = element("button");
    			button0.textContent = "Contact Me!";
    			t10 = space();
    			a1 = element("a");
    			button1 = element("button");
    			button1.textContent = "Blog";
    			add_location(h3, file$2, 82, 2, 1771);
    			add_location(h1, file$2, 83, 2, 1788);
    			add_location(br0, file$2, 96, 8, 2094);
    			add_location(br1, file$2, 99, 8, 2226);
    			add_location(p, file$2, 93, 6, 1974);
    			set_style(button0, "width", "150px");
    			add_location(button0, file$2, 104, 8, 2386);
    			attr_dev(a0, "href", "mailto:mail@aboni.dev");
    			attr_dev(a0, "class", "svelte-1tme8cg");
    			add_location(a0, file$2, 103, 6, 2345);
    			set_style(button1, "width", "150px");
    			add_location(button1, file$2, 108, 8, 2513);
    			attr_dev(a1, "href", "https://blog.aboni.dev");
    			attr_dev(a1, "target", "__blank");
    			attr_dev(a1, "class", "svelte-1tme8cg");
    			add_location(a1, file$2, 106, 6, 2453);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$2, 92, 4, 1947);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$2, 91, 2, 1925);
    			attr_dev(div2, "class", "container svelte-1tme8cg");
    			add_location(div2, file$2, 81, 0, 1745);
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

    		p: function update(changed, ctx) {
    			if (ctx.animate) {
    				if (if_block) {
    					if_block.p(changed, ctx);
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
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if (if_block) if_block.d();

    			destroy_component(prompt);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
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
        duration: duration,
        delay: 300,
        css: t => `
                  background-color: #9b4dca; 
                  color: #FFFFFF; 
                `
      };
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
      let animate = false;
      let skills = [
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
        $$invalidate('animate', animate = true);
        setTimeout(() => {
          // console.log("Animate OUT");
          $$invalidate('animate', animate = false);
        }, 3800);

        setInterval(() => {
          // console.log("Animate IN");
          cycleSkills();
          $$invalidate('animate', animate = true);
          setTimeout(() => {
            $$invalidate('animate', animate = false);
            // console.log("Animate OUT");
          }, 3500);
        }, 6000);
      });

      function cycleSkills() {
        if (currentSkillIndex >= skills.length - 1) {
          currentSkillIndex = -1;
        }
        currentSkillIndex++;
        $$invalidate('currentSkill', currentSkill = skills[currentSkillIndex]);
      }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('animate' in $$props) $$invalidate('animate', animate = $$props.animate);
    		if ('skills' in $$props) skills = $$props.skills;
    		if ('currentSkill' in $$props) $$invalidate('currentSkill', currentSkill = $$props.currentSkill);
    		if ('currentSkillIndex' in $$props) currentSkillIndex = $$props.currentSkillIndex;
    	};

    	return { animate, currentSkill };
    }

    class Greet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Greet", options, id: create_fragment$2.name });
    	}
    }

    const portfolioItems = [
    	{
    		id: 10,
    		title: "TXTdit",
    		description:
    			"TXTDIT is an open-source featurless themeable text editor. Main features: No text formatting, Multiple Themes, Import/export. Autosave. No more features",
    		category: "App Development",
    		skills: ["Svelte", "CSS", "Travis", "Github Pages", "CI/CD"],
    		img: "img/txtdit.png",
    		url: "https://github.com/ajboni/txtdit",
    		icon: "img/icons8-pencil-64.png"
    	},
    	{
    		id: 1,
    		title: "Scram (WIP)",
    		description:
    			"Slot Car Race Manager, server, and racer database for DIY slot car racer track controlled by Arduino. A rather complex project combining several technologies that I was interested in learning.",
    		category: "App Development",
    		skills: ["React", "Mobx", "GraphQL", "Hasura", "Postgres", "CI/CD", "Python", "Arduino", "SocketIO", "Flask"],
    		img: "img/scram.png",
    		url: "https://github.com/ajboni/slot-car-race-manager",
    		icon: "img/icons8-car-64.png"
    	},
    	{
    		id: 2,
    		title: "Speechr",
    		description:
    			"Speechr is a collaborative design and development tool for easy and organised game development.",
    		category: "App Development",
    		skills: ["React", "Mobx", "Electron", "Pouchdb", "Couchdb", "CI/CD"],
    		img: "img/speechr.png",
    		url: "https://speechr.aboni.dev/",
    		icon: "img/speechr-icon.png"
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
    		icon: "img/icons8-steam-96.png"
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
    		icon: "img/icons8-web-design-96.png"
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
    		icon: "img/icons8-web-design-96.png"
    	},
    	{
    		id: 6,
    		title: "The Mind Of Marlo",
    		description: "A Steam game I've made with @poffle as Point Bleep Studios",
    		category: "Game Development",
    		skills: ["C#", "Unity", "Soundtrack", "Steamworks"],
    		img: "img/mom.png",
    		url: "https://store.steampowered.com/app/722870/The_Mind_of_Marlo/",
    		icon: "img/icons8-steam-96.png"
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
    		icon: "img/google_play.png"
    	},
    	{
    		id: 8,
    		title: "Arduino Midi Foot Controller",
    		description: "A simple midi (foot) controller for Arduino Uno  ",
    		category: "App Development",
    		skills: ["C++", "Arduino", "Electronics"],
    		img: "img/controller.jpg",
    		url: "https://github.com/ajboni/ArduinoMidiFootController",
    		icon: "img/icons8-github-100.png"
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
    		icon: "img/icons8-control-96.png"
    	}
    ];

    /* src/PortfolioItem.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/PortfolioItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.skill = list[i];
    	return child_ctx;
    }

    // (112:4) {#each item.skills as skill}
    function create_each_block(ctx) {
    	var div, t0_value = ctx.skill + "", t0, t1;

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

    		p: function update(changed, ctx) {
    			if ((changed.item) && t0_value !== (t0_value = ctx.skill + "")) {
    				set_data_dev(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(112:4) {#each item.skills as skill}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div4, div0, img0, img0_src_value, t0, a0, t1_value = ctx.item.title + "", t1, a0_href_value, t2, div1, a1, img1, img1_src_value, img1_alt_value, a1_href_value, t3, div2, t4_value = ctx.item.description + "", t4, t5, div3;

    	let each_value = ctx.item.skills;

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
    			attr_dev(img0, "src", img0_src_value = ctx.item.icon);
    			attr_dev(img0, "alt", '');
    			attr_dev(img0, "class", "svelte-1ni1q5n");
    			add_location(img0, file$3, 101, 4, 1801);
    			attr_dev(a0, "href", a0_href_value = ctx.item.url);
    			attr_dev(a0, "target", "__blank");
    			attr_dev(a0, "class", "svelte-1ni1q5n");
    			add_location(a0, file$3, 102, 4, 1838);
    			attr_dev(div0, "class", "title svelte-1ni1q5n");
    			add_location(div0, file$3, 100, 2, 1777);
    			attr_dev(img1, "src", img1_src_value = ctx.item.img);
    			attr_dev(img1, "alt", img1_alt_value = ctx.item.title);
    			attr_dev(img1, "class", "svelte-1ni1q5n");
    			add_location(img1, file$3, 106, 6, 1969);
    			attr_dev(a1, "href", a1_href_value = ctx.item.url);
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

    		p: function update(changed, ctx) {
    			if ((changed.item) && img0_src_value !== (img0_src_value = ctx.item.icon)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if ((changed.item) && t1_value !== (t1_value = ctx.item.title + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((changed.item) && a0_href_value !== (a0_href_value = ctx.item.url)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((changed.item) && img1_src_value !== (img1_src_value = ctx.item.img)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if ((changed.item) && img1_alt_value !== (img1_alt_value = ctx.item.title)) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}

    			if ((changed.item) && a1_href_value !== (a1_href_value = ctx.item.url)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((changed.item) && t4_value !== (t4_value = ctx.item.description + "")) {
    				set_data_dev(t4, t4_value);
    			}

    			if (changed.item) {
    				each_value = ctx.item.skills;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
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
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { item } = $$props;

    	const writable_props = ['item'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PortfolioItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('item' in $$props) $$invalidate('item', item = $$props.item);
    	};

    	$$self.$capture_state = () => {
    		return { item };
    	};

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate('item', item = $$props.item);
    	};

    	return { item };
    }

    class PortfolioItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["item"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "PortfolioItem", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.item === undefined && !('item' in props)) {
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

    /* src/Separator.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/Separator.svelte";

    function create_fragment$4(ctx) {
    	var div3, div0, hr0, t0, div1, t1, div2, hr1, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

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
    			if (default_slot) default_slot.l(div1_nodes);
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

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
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
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { $$slots, $$scope };
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Separator", options, id: create_fragment$4.name });
    	}
    }

    /* src/Portfolio.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/Portfolio.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.subItem = list[i];
    	child_ctx.x = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (73:4) <Separator>
    function create_default_slot(ctx) {
    	var h2;

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
    			if (detaching) {
    				detach_dev(h2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(73:4) <Separator>", ctx });
    	return block;
    }

    // (94:6) {#if (i+1) % 3 === 1}
    function create_if_block$1(ctx) {
    	var div, t0, each_blocks = [], each_1_lookup = new Map(), t1, t2, current;

    	var if_block0 = ((ctx.i + 3 >= ctx.filteredPortfolioItems.length)) && create_if_block_3(ctx);

    	function func(...args) {
    		return ctx.func(ctx, ...args);
    	}

    	let each_value_1 = ctx.filteredPortfolioItems.filter(func);

    	const get_key = ctx => ctx.subItem.id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	var if_block1 = ((ctx.i + 3 >= ctx.filteredPortfolioItems.length)) && create_if_block_1(ctx);

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

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((ctx.i + 3 >= ctx.filteredPortfolioItems.length)) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const each_value_1 = ctx.filteredPortfolioItems.filter(func);

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t1, get_each_context_1);
    			check_outros();

    			if ((ctx.i + 3 >= ctx.filteredPortfolioItems.length)) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
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
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(94:6) {#if (i+1) % 3 === 1}", ctx });
    	return block;
    }

    // (99:10) {#if (i + 3 >= filteredPortfolioItems.length)}
    function create_if_block_3(ctx) {
    	var if_block_anchor;

    	var if_block = ((ctx.filteredPortfolioItems.length %3 === 1)) && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((ctx.filteredPortfolioItems.length %3 === 1)) {
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

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(99:10) {#if (i + 3 >= filteredPortfolioItems.length)}", ctx });
    	return block;
    }

    // (100:12) {#if (filteredPortfolioItems.length %3 === 1)}
    function create_if_block_4(ctx) {
    	var div;

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
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(100:12) {#if (filteredPortfolioItems.length %3 === 1)}", ctx });
    	return block;
    }

    // (107:10) {#each filteredPortfolioItems.filter((eachElem, index) => {             return index < i + 3 && index >= i             }) as subItem,x (subItem.id)}
    function create_each_block_1(key_1, ctx) {
    	var div, t, current;

    	var portfolioitem = new PortfolioItem({
    		props: { item: ctx.subItem },
    		$$inline: true
    	});

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");
    			portfolioitem.$$.fragment.c();
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

    		p: function update(changed, ctx) {
    			var portfolioitem_changes = {};
    			if (changed.filteredPortfolioItems) portfolioitem_changes.item = ctx.subItem;
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
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(portfolioitem);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(107:10) {#each filteredPortfolioItems.filter((eachElem, index) => {             return index < i + 3 && index >= i             }) as subItem,x (subItem.id)}", ctx });
    	return block;
    }

    // (116:10) {#if (i + 3 >= filteredPortfolioItems.length)}
    function create_if_block_1(ctx) {
    	var if_block_anchor;

    	var if_block = ((ctx.filteredPortfolioItems.length %3 === 1)) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((ctx.filteredPortfolioItems.length %3 === 1)) {
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

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(116:10) {#if (i + 3 >= filteredPortfolioItems.length)}", ctx });
    	return block;
    }

    // (117:12) {#if (filteredPortfolioItems.length %3 === 1)}
    function create_if_block_2(ctx) {
    	var div;

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
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(117:12) {#if (filteredPortfolioItems.length %3 === 1)}", ctx });
    	return block;
    }

    // (93:4) {#each filteredPortfolioItems as item,i (item.id)}
    function create_each_block$1(key_1, ctx) {
    	var first, if_block_anchor, current;

    	var if_block = ((ctx.i+1) % 3 === 1) && create_if_block$1(ctx);

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

    		p: function update(changed, ctx) {
    			if ((ctx.i+1) % 3 === 1) {
    				if (if_block) {
    					if_block.p(changed, ctx);
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
    			if (detaching) {
    				detach_dev(first);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(93:4) {#each filteredPortfolioItems as item,i (item.id)}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div5, t0, div4, div0, t1, div1, input, t2, div2, select, option0, option1, option2, t6, div3, t7, each_blocks = [], each_1_lookup = new Map(), current, dispose;

    	var separator = new Separator({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredPortfolioItems;

    	const get_key = ctx => ctx.item.id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			separator.$$.fragment.c();
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
    			if (ctx.filterType === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "id", "ageRangeField");
    			add_location(select, file$5, 83, 6, 2258);
    			attr_dev(div2, "class", "column column-25 svelte-13wwovk");
    			add_location(div2, file$5, 81, 6, 2161);
    			attr_dev(div3, "class", "column column-20 svelte-13wwovk");
    			add_location(div3, file$5, 89, 6, 2504);
    			attr_dev(div4, "class", "row svelte-13wwovk");
    			add_location(div4, file$5, 76, 3, 1960);
    			attr_dev(div5, "class", "container svelte-13wwovk");
    			add_location(div5, file$5, 71, 0, 1866);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "input", ctx.handleSearch),
    				listen_dev(select, "change", ctx.select_change_handler),
    				listen_dev(select, "change", ctx.handleSearch)
    			];
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
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, input);

    			set_input_value(input, ctx.filter);

    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);

    			select_option(select, ctx.filterType);

    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div5, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var separator_changes = {};
    			if (changed.$$scope) separator_changes.$$scope = { changed, ctx };
    			separator.$set(separator_changes);

    			if (changed.filter && (input.value !== ctx.filter)) set_input_value(input, ctx.filter);
    			if (changed.filterType) select_option(select, ctx.filterType);

    			const each_value = ctx.filteredPortfolioItems;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div5, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
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
    			if (detaching) {
    				detach_dev(div5);
    			}

    			destroy_component(separator);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      
      
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
        if(value.length > 0)  {
          // filteredPortfolioItems = portfolioItems.slice(0,2);

          switch (filterType) {
            case "Text":
              $$invalidate('filteredPortfolioItems', filteredPortfolioItems = portfolioItems.filter(item => 
                item.description.toLowerCase().includes(filter.toLowerCase()) ||
                item.title.toLowerCase().includes(filter.toLowerCase())
              ));                       
            break;
            
            case "Tags":
              $$invalidate('filteredPortfolioItems', filteredPortfolioItems = portfolioItems.filter(item => 
                item.skills.join("|").toLowerCase().includes(filter.toLowerCase())
              ));                       
            break; 
            
            default:          
              $$invalidate('filteredPortfolioItems', filteredPortfolioItems = portfolioItems.filter(item => 
                item.description.toLowerCase().includes(filter.toLowerCase()) ||
                item.title.toLowerCase().includes(filter.toLowerCase()) ||
                item.skills.join("|").toLowerCase().includes(filter.toLowerCase())            
              ));                       
            break;
          }
        }
        else {
          $$invalidate('filteredPortfolioItems', filteredPortfolioItems = portfolioItems);     
        }
          
      }

    	function input_input_handler() {
    		filter = this.value;
    		$$invalidate('filter', filter);
    	}

    	function select_change_handler() {
    		filterType = select_value(this);
    		$$invalidate('filterType', filterType);
    	}

    	const func = ({ i }, eachElem, index) => {
    	            return index < i + 3 && index >= i
    	            };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('filteredPortfolioItems' in $$props) $$invalidate('filteredPortfolioItems', filteredPortfolioItems = $$props.filteredPortfolioItems);
    		if ('filter' in $$props) $$invalidate('filter', filter = $$props.filter);
    		if ('filterType' in $$props) $$invalidate('filterType', filterType = $$props.filterType);
    		if ('slotsArray' in $$props) slotsArray = $$props.slotsArray;
    		if ('fillerSlots' in $$props) fillerSlots = $$props.fillerSlots;
    	};

    	return {
    		filteredPortfolioItems,
    		filter,
    		filterType,
    		handleSearch,
    		input_input_handler,
    		select_change_handler,
    		func
    	};
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Portfolio", options, id: create_fragment$5.name });
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

    /* src/ContactForm.svelte generated by Svelte v3.12.1 */

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ContactForm", options, id: create_fragment$6.name });
    	}
    }

    /* src/Contact.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/Contact.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (27:2) <Separator>
    function create_default_slot$1(ctx) {
    	var h2;

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
    			if (detaching) {
    				detach_dev(h2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(27:2) <Separator>", ctx });
    	return block;
    }

    // (32:4) {#each contactItems as item,i }
    function create_each_block$2(ctx) {
    	var div, a, img, t0_value = ctx.item.title + "", t0, t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(img, "src", ctx.item.img);
    			attr_dev(img, "alt", ctx.item.title);
    			add_location(img, file$6, 33, 46, 581);
    			attr_dev(a, "href", ctx.item.url);
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
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(32:4) {#each contactItems as item,i }", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var div1, t0, div0, t1, current;

    	var separator = new Separator({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	let each_value = contactItems;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	var contactform = new ContactForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			separator.$$.fragment.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			contactform.$$.fragment.c();
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

    		p: function update(changed, ctx) {
    			var separator_changes = {};
    			if (changed.$$scope) separator_changes.$$scope = { changed, ctx };
    			separator.$set(separator_changes);

    			if (changed.contactItems) {
    				each_value = contactItems;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
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
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(separator);

    			destroy_each(each_blocks, detaching);

    			destroy_component(contactform);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Contact", options, id: create_fragment$7.name });
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/Footer.svelte";

    function create_fragment$8(ctx) {
    	var footer, div0, t1, div1, t2, img0, t3, t4_value = ' with ' + "", t4, t5, a0, t7, a1, t9, img1, t10, a2, t12;

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
    			attr_dev(img0, "src", "./img/icons8-heart-100.png");
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
    			attr_dev(img1, "src", "./img/icons8-icons8-100.png");
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
    			if (detaching) {
    				detach_dev(footer);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Footer", options, id: create_fragment$8.name });
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
            "Devops, kubernetes, docker, IaaC"
        ],
        dev: [
            "Web App Development: JS, HTML, CSS, React, etc.",
            "Game Development with Unity 3D and Godot Engine",
            "python, c#, vba, excel, php"
        ],
        misc: [
            "4 Years of English-Spanish translation specializing in computer science and technical translation",
            "Successfully finished Cisco CCNA official course (certification pending)",
            "Music and Audio Production, Mixing and Mastering.",
            "English level, written: bilingual, spoken: medium"
        ]

    };

    /* src/Skills.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/Skills.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (23:4) <Separator>
    function create_default_slot$2(ctx) {
    	var h2;

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
    			if (detaching) {
    				detach_dev(h2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$2.name, type: "slot", source: "(23:4) <Separator>", ctx });
    	return block;
    }

    // (30:16) {#each skillsItems.it as item}
    function create_each_block_2(ctx) {
    	var li, t0_value = ctx.item + "", t0, t1;

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
    			if (detaching) {
    				detach_dev(li);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(30:16) {#each skillsItems.it as item}", ctx });
    	return block;
    }

    // (41:20) {#each skillsItems.dev as item}
    function create_each_block_1$1(ctx) {
    	var li, t0_value = ctx.item + "", t0, t1;

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
    			if (detaching) {
    				detach_dev(li);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(41:20) {#each skillsItems.dev as item}", ctx });
    	return block;
    }

    // (51:20) {#each skillsItems.misc as item}
    function create_each_block$3(ctx) {
    	var li, t0_value = ctx.item + "", t0, t1;

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
    			if (detaching) {
    				detach_dev(li);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(51:20) {#each skillsItems.misc as item}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var div5, t0, div4, div0, h30, t2, ul0, t3, div3, div1, h31, t5, ul1, t6, div2, h32, t8, ul2, current;

    	var separator = new Separator({
    		props: {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	let each_value_2 = skillsItems.it;

    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = skillsItems.dev;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = skillsItems.misc;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			separator.$$.fragment.c();
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

    		p: function update(changed, ctx) {
    			var separator_changes = {};
    			if (changed.$$scope) separator_changes.$$scope = { changed, ctx };
    			separator.$set(separator_changes);

    			if (changed.skillsItems) {
    				each_value_2 = skillsItems.it;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
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

    			if (changed.skillsItems) {
    				each_value_1 = skillsItems.dev;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
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

    			if (changed.skillsItems) {
    				each_value = skillsItems.misc;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
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
    			if (detaching) {
    				detach_dev(div5);
    			}

    			destroy_component(separator);

    			destroy_each(each_blocks_2, detaching);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Skills", options, id: create_fragment$9.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    function create_fragment$a(ctx) {
    	var t0, t1, t2, t3, t4, current;

    	var logonav = new Nav({ $$inline: true });

    	var greet = new Greet({ $$inline: true });

    	var skills = new Skills({ $$inline: true });

    	var portfolio = new Portfolio({ $$inline: true });

    	var contact = new Contact({ $$inline: true });

    	var footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			logonav.$$.fragment.c();
    			t0 = space();
    			greet.$$.fragment.c();
    			t1 = space();
    			skills.$$.fragment.c();
    			t2 = space();
    			portfolio.$$.fragment.c();
    			t3 = space();
    			contact.$$.fragment.c();
    			t4 = space();
    			footer.$$.fragment.c();
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

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(greet, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(skills, detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			destroy_component(portfolio, detaching);

    			if (detaching) {
    				detach_dev(t3);
    			}

    			destroy_component(contact, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			destroy_component(footer, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	
    	let { name } = $$props;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	return { name };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$a, safe_not_equal, ["name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$a.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
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
