
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    let raf = is_client ? requestAnimationFrame : noop;

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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
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
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
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
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
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
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }
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
            const { delay = 0, duration = 300, easing = identity, tick: tick$$1 = noop, css } = config;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick$$1(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now$$1 => {
                if (running) {
                    if (now$$1 >= end_time) {
                        tick$$1(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now$$1 >= start_time) {
                        const t = easing((now$$1 - start_time) / duration);
                        tick$$1(t, 1 - t);
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
        group.remaining += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick: tick$$1 = noop, css } = config;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now$$1 => {
                if (running) {
                    if (now$$1 >= end_time) {
                        tick$$1(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.remaining) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.callbacks);
                        }
                        return false;
                    }
                    if (now$$1 >= start_time) {
                        const t = easing((now$$1 - start_time) / duration);
                        tick$$1(1 - t, t);
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        on_outro(() => {
            destroy_block(block, lookup);
        });
        block.o(1);
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
            if (block.i)
                block.i(1);
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
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
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
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
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
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
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
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
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

    /* src/Nav.svelte generated by Svelte v3.5.1 */

    const file = "src/Nav.svelte";

    function create_fragment(ctx) {
    	var div, h4;

    	return {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Alexis Boni";
    			h4.className = "svelte-o1ikfx";
    			add_location(h4, file, 20, 2, 391);
    			div.className = "logoContainer svelte-o1ikfx";
    			add_location(div, file, 18, 0, 304);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h4);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Prompt.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/Prompt.svelte";

    function create_fragment$1(ctx) {
    	var span, t, span_class_value;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text("_");
    			span.className = span_class_value = "prompt " + ctx.prompt + " svelte-13fc01u";
    			add_location(span, file$1, 15, 0, 275);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.prompt) && span_class_value !== (span_class_value = "prompt " + ctx.prompt + " svelte-13fc01u")) {
    				span.className = span_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
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

    	return { time, prompt };
    }

    class Prompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["time"]);
    	}

    	get time() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Greet.svelte generated by Svelte v3.5.1 */

    const file$2 = "src/Greet.svelte";

    // (77:4) {#if animate}
    function create_if_block(ctx) {
    	var span, t, span_intro, span_outro, current;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.currentSkill);
    			add_location(span, file$2, 77, 6, 1770);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.currentSkill) {
    				set_data(t, ctx.currentSkill);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (local) {
    				add_render_callback(() => {
    					if (span_outro) span_outro.end(1);
    					if (!span_intro) span_intro = create_in_transition(span, typewriter, {});
    					span_intro.start();
    				});
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			if (span_intro) span_intro.invalidate();

    			if (local) {
    				span_outro = create_out_transition(span, reverseTypewriter, {});
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    				if (span_outro) span_outro.end();
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var div2, h3, t1, h1, t2, t3, t4, div1, div0, p, t5, br0, t6, br1, t7, p_intro, t8, button, current;

    	var if_block = (ctx.animate) && create_if_block(ctx);

    	var prompt = new Prompt({ $$inline: true });

    	return {
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
    			t5 = text("I'm a 33 years old IT Professional with over 10 years of hands-on experience. \n      ");
    			br0 = element("br");
    			t6 = text("\n      I'm currently learning skills about webdev, devOps, kubernetes, gamedev, music production and linux.\n      ");
    			br1 = element("br");
    			t7 = text("\n      I'm a self-hosted, DIY and FOSS ethusiast and always looking for fun projects.");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Contact Me!";
    			add_location(h3, file$2, 73, 0, 1715);
    			add_location(h1, file$2, 74, 2, 1732);
    			add_location(br0, file$2, 89, 6, 2076);
    			add_location(br1, file$2, 91, 6, 2195);
    			add_location(p, file$2, 87, 6, 1967);
    			add_location(button, file$2, 94, 6, 2303);
    			div0.className = "column";
    			add_location(div0, file$2, 86, 4, 1940);
    			div1.className = "row";
    			add_location(div1, file$2, 85, 2, 1918);
    			div2.className = "container svelte-9csf2o";
    			add_location(div2, file$2, 72, 0, 1691);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, h3);
    			append(div2, t1);
    			append(div2, h1);
    			append(h1, t2);
    			if (if_block) if_block.m(h1, null);
    			append(h1, t3);
    			mount_component(prompt, h1, null);
    			append(div2, t4);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, p);
    			append(p, t5);
    			append(p, br0);
    			append(p, t6);
    			append(p, br1);
    			append(p, t7);
    			append(div0, t8);
    			append(div0, button);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.animate) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(h1, t3);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();

    			prompt.$$.fragment.i(local);

    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, typewriter, {});
    					p_intro.start();
    				});
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			prompt.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			if (if_block) if_block.d();

    			prompt.$destroy();
    		}
    	};
    }

    function typewriter(node, { speed = 50 }) 
     {
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
      }

    }

    function instance$1($$self, $$props, $$invalidate) {
    	
      let animate = false;
      let skills = ["a web developer", "a network administrator and engineer", 'a game developer', "a devOps engineer", 'a music maker', 'Linux, OSS, and DIY enthusiast'];
      let currentSkill = skills[0];
      let currentSkillIndex = 0;
      
      onMount( () => {
        $$invalidate('animate', animate = true);
        setTimeout(() => {
          console.log("Animate OUT");
          $$invalidate('animate', animate = false);
          
        },3800);    

        setInterval( () => {
          console.log("Animate IN");
          cycleSkills();
          $$invalidate('animate', animate = true);
          setTimeout(() => {
            $$invalidate('animate', animate = false);
            console.log("Animate OUT");
          },3500);    
        },6000);
      });
      
      function cycleSkills() {
        if(currentSkillIndex >= skills.length -1) { currentSkillIndex = -1;}
        currentSkillIndex++;    $$invalidate('currentSkill', currentSkill = skills[currentSkillIndex]); 
        
      }

    	return { animate, currentSkill };
    }

    class Greet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    	}
    }

    const portfolioItems = [
      {
        id: 1,
        title: "Speechr",
        description:
          "Speechr is a collaborative design and development tool for easy and organised game development.",
        category: "App Development",
        skills: ["react", "mobx", "electron", "pouchdb", "couchdb, CI/CD"],
        img: "img/speechr.png",
        url: "https://speechr.aboni.dev/",
        icon: "img/speechr-icon.png"
      }
    ];

    /* src/PortfolioItem.svelte generated by Svelte v3.5.1 */

    const file$3 = "src/PortfolioItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.skill = list[i];
    	return child_ctx;
    }

    // (86:2) {#each item.skills as skill}
    function create_each_block(ctx) {
    	var div, t_value = ctx.skill, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			div.className = "skills svelte-5e7mfc";
    			add_location(div, file$3, 86, 5, 1522);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.item) && t_value !== (t_value = ctx.skill)) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var div4, div0, img0, img0_src_value, t0, a0, t1_value = ctx.item.title, t1, a0_href_value, t2, div1, a1, img1, img1_src_value, img1_alt_value, a1_href_value, t3, div2, t4_value = ctx.item.description, t4, t5, div3;

    	var each_value = ctx.item.skills;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
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

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			img0.src = img0_src_value = ctx.item.icon;
    			img0.alt = "";
    			img0.className = "svelte-5e7mfc";
    			add_location(img0, file$3, 73, 4, 1179);
    			a0.href = a0_href_value = ctx.item.url;
    			a0.target = "__blank";
    			a0.className = "svelte-5e7mfc";
    			add_location(a0, file$3, 74, 4, 1215);
    			div0.className = "title svelte-5e7mfc";
    			add_location(div0, file$3, 72, 2, 1154);
    			img1.src = img1_src_value = ctx.item.img;
    			img1.alt = img1_alt_value = ctx.item.title;
    			img1.className = "svelte-5e7mfc";
    			add_location(img1, file$3, 79, 40, 1349);
    			a1.href = a1_href_value = ctx.item.url;
    			a1.target = "__blank";
    			add_location(a1, file$3, 79, 4, 1313);
    			div1.className = "img svelte-5e7mfc";
    			add_location(div1, file$3, 78, 2, 1291);
    			div2.className = "description svelte-5e7mfc";
    			add_location(div2, file$3, 81, 2, 1403);
    			div3.className = "skills svelte-5e7mfc";
    			add_location(div3, file$3, 84, 2, 1465);
    			div4.className = "card svelte-5e7mfc";
    			add_location(div4, file$3, 70, 0, 1130);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
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

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.item) && img0_src_value !== (img0_src_value = ctx.item.icon)) {
    				img0.src = img0_src_value;
    			}

    			if ((changed.item) && t1_value !== (t1_value = ctx.item.title)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.item) && a0_href_value !== (a0_href_value = ctx.item.url)) {
    				a0.href = a0_href_value;
    			}

    			if ((changed.item) && img1_src_value !== (img1_src_value = ctx.item.img)) {
    				img1.src = img1_src_value;
    			}

    			if ((changed.item) && img1_alt_value !== (img1_alt_value = ctx.item.title)) {
    				img1.alt = img1_alt_value;
    			}

    			if ((changed.item) && a1_href_value !== (a1_href_value = ctx.item.url)) {
    				a1.href = a1_href_value;
    			}

    			if ((changed.item) && t4_value !== (t4_value = ctx.item.description)) {
    				set_data(t4, t4_value);
    			}

    			if (changed.item) {
    				each_value = ctx.item.skills;

    				for (var i = 0; i < each_value.length; i += 1) {
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
    				detach(div4);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
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

    	return { item };
    }

    class PortfolioItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["item"]);

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

    /* src/Separator.svelte generated by Svelte v3.5.1 */

    const file$4 = "src/Separator.svelte";

    function create_fragment$4(ctx) {
    	var div3, div0, hr0, t0, div1, t1, div2, hr1, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
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
    			hr0.className = "svelte-19iv3y9";
    			add_location(hr0, file$4, 16, 22, 305);
    			div0.className = "column";
    			add_location(div0, file$4, 16, 2, 285);

    			div1.className = "column";
    			add_location(div1, file$4, 17, 2, 318);
    			hr1.className = "svelte-19iv3y9";
    			add_location(hr1, file$4, 18, 23, 383);
    			div2.className = "column";
    			add_location(div2, file$4, 18, 2, 362);
    			div3.className = "row svelte-19iv3y9";
    			add_location(div3, file$4, 15, 0, 265);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div1_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div0, hr0);
    			append(div3, t0);
    			append(div3, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append(div3, t1);
    			append(div3, div2);
    			append(div2, hr1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/Portfolio.svelte generated by Svelte v3.5.1 */

    const file$5 = "src/Portfolio.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.slot = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
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

    // (25:4) <Separator>
    function create_default_slot(ctx) {
    	var h2;

    	return {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Portfolio";
    			h2.className = "svelte-xv3pdq";
    			add_location(h2, file$5, 25, 6, 493);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h2, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h2);
    			}
    		}
    	};
    }

    // (29:6) {#if (i+1) % 3 === 1}
    function create_if_block$1(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), t0, t1, current;

    	function func(...args) {
    		return ctx.func(ctx, ...args);
    	}

    	var each_value_2 = portfolioItems.filter(func);

    	const get_key = ctx => ctx.subItem.id;

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	var if_block = ((ctx.i + 3 === portfolioItems.length + ctx.fillerSlots)) && create_if_block_1(ctx);

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div.className = "row";
    			add_location(div, file$5, 30, 8, 650);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			append(div, t0);
    			if (if_block) if_block.m(div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			const each_value_2 = portfolioItems.filter(func);

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_2, each_1_lookup, div, outro_and_destroy_block, create_each_block_2, t0, get_each_context_2);
    			check_outros();

    			if ((ctx.i + 3 === portfolioItems.length + ctx.fillerSlots)) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_2.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].o();

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			if (if_block) if_block.d();
    		}
    	};
    }

    // (32:10) {#each portfolioItems.filter((eachElem, index) => {             return index < i + 3 && index >= i             }) as subItem,x (subItem.id)}
    function create_each_block_2(key_1, ctx) {
    	var div, current;

    	var portfolioitem = new PortfolioItem({
    		props: { item: ctx.subItem },
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");
    			portfolioitem.$$.fragment.c();
    			div.className = "column";
    			add_location(div, file$5, 34, 14, 833);
    			this.first = div;
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(portfolioitem, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var portfolioitem_changes = {};
    			if (changed.portfolioItems) portfolioitem_changes.item = ctx.subItem;
    			portfolioitem.$set(portfolioitem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			portfolioitem.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			portfolioitem.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			portfolioitem.$destroy();
    		}
    	};
    }

    // (40:15) {#if (i + 3 === portfolioItems.length + fillerSlots)}
    function create_if_block_1(ctx) {
    	var each_1_anchor;

    	var each_value_1 = ctx.slotsArray;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.slotsArray) {
    				each_value_1 = ctx.slotsArray;

    				for (var i = each_blocks.length; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					each_blocks[i] = create_each_block_1();
    					each_blocks[i].c();
    					each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    				}

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (41:16) {#each slotsArray as slot}
    function create_each_block_1(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			div.className = "column";
    			add_location(div, file$5, 41, 19, 1155);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (28:4) {#each portfolioItems as item,i (item.id)}
    function create_each_block$1(key_1, ctx) {
    	var first, if_block_anchor, current;

    	var if_block = ((ctx.i+1) % 3 === 1) && create_if_block$1(ctx);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((ctx.i+1) % 3 === 1) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var div, t, each_blocks = [], each_1_lookup = new Map(), current;

    	var separator = new Separator({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var each_value = portfolioItems;

    	const get_key = ctx => ctx.item.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			separator.$$.fragment.c();
    			t = space();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			div.className = "container svelte-xv3pdq";
    			add_location(div, file$5, 23, 0, 447);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(separator, div, null);
    			append(div, t);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var separator_changes = {};
    			if (changed.$$scope) separator_changes.$$scope = { changed, ctx };
    			separator.$set(separator_changes);

    			const each_value = portfolioItems;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			separator.$$.fragment.i(local);

    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			separator.$$.fragment.o(local);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].o();

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			separator.$destroy();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    function instance$4($$self) {
    	
      let fillerSlots = 3 - portfolioItems.length % 3;
      let slotsArray = [];
      for (let index = 0; index < fillerSlots; index++) {
       slotsArray.push(index);
        
      }

    	function func({ i }, eachElem, index) {
    	            return index < i + 3 && index >= i
    	            }

    	return { fillerSlots, slotsArray, func };
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
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
        id: 3,
        title: "Gitlab",
        url: "https://gitlab.com/ajboni",
        img: "./img/icons8-gitlab-100.png"
      },
      {
        id: 4,
        title: "Twitter",
        url: "https://twitter.com/rdbdlf",
        img: "./img/icons8-twitter-100.png"
      },
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

    /* src/ContactForm.svelte generated by Svelte v3.5.1 */

    function create_fragment$6(ctx) {
    	return {
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
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/Contact.svelte generated by Svelte v3.5.1 */

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

    	return {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Contact me";
    			h2.className = "svelte-fe5hq9";
    			add_location(h2, file$6, 27, 4, 415);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h2, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h2);
    			}
    		}
    	};
    }

    // (32:4) {#each contactItems as item,i }
    function create_each_block$2(ctx) {
    	var div, a, img, img_src_value, img_alt_value, t_value = ctx.item.title, t, a_href_value;

    	return {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = text(t_value);
    			img.src = img_src_value = ctx.item.img;
    			img.alt = img_alt_value = ctx.item.title;
    			add_location(img, file$6, 33, 46, 581);
    			a.href = a_href_value = ctx.item.url;
    			a.target = "__blank";
    			a.className = "svelte-fe5hq9";
    			add_location(a, file$6, 33, 10, 545);
    			div.className = "column";
    			add_location(div, file$6, 32, 6, 513);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, a);
    			append(a, img);
    			append(a, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
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

    	var each_value = contactItems;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	var contactform = new ContactForm({ $$inline: true });

    	return {
    		c: function create() {
    			div1 = element("div");
    			separator.$$.fragment.c();
    			t0 = space();
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			contactform.$$.fragment.c();
    			div0.className = "row svelte-fe5hq9";
    			add_location(div0, file$6, 30, 2, 453);
    			div1.className = "container svelte-fe5hq9";
    			add_location(div1, file$6, 25, 0, 373);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(separator, div1, null);
    			append(div1, t0);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t1);
    			mount_component(contactform, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var separator_changes = {};
    			if (changed.$$scope) separator_changes.$$scope = { changed, ctx };
    			separator.$set(separator_changes);

    			if (changed.contactItems) {
    				each_value = contactItems;

    				for (var i = 0; i < each_value.length; i += 1) {
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
    			separator.$$.fragment.i(local);

    			contactform.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			separator.$$.fragment.o(local);
    			contactform.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			separator.$destroy();

    			destroy_each(each_blocks, detaching);

    			contactform.$destroy();
    		}
    	};
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.5.1 */

    const file$7 = "src/Footer.svelte";

    function create_fragment$8(ctx) {
    	var footer, div0, t1, div1, t2, img, t3, t4_value = " with ", t4, t5, a0, t7, a1;

    	return {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "© Alexis Boni 2019";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Made with ");
    			img = element("img");
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t7 = text(" \n    and \n    ");
    			a1 = element("a");
    			a1.textContent = "Milligram";
    			div0.className = "footer-copyright svelte-1qnri7w";
    			add_location(div0, file$7, 30, 2, 519);
    			img.src = "./img/icons8-heart-100.png";
    			img.alt = "love";
    			img.className = "svelte-1qnri7w";
    			add_location(img, file$7, 31, 42, 616);
    			a0.href = "https://svelte.dev/";
    			attr(a0, "alt", "Svelte");
    			a0.className = "svelte-1qnri7w";
    			add_location(a0, file$7, 32, 4, 683);
    			a1.href = "https://milligram.io/";
    			attr(a1, "alt", "Milligram");
    			a1.className = "svelte-1qnri7w";
    			add_location(a1, file$7, 34, 4, 752);
    			div1.className = "footer-copyright svelte-1qnri7w";
    			add_location(div1, file$7, 31, 2, 576);
    			footer.className = "svelte-1qnri7w";
    			add_location(footer, file$7, 29, 0, 508);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, div0);
    			append(footer, t1);
    			append(footer, div1);
    			append(div1, t2);
    			append(div1, img);
    			append(div1, t3);
    			append(div1, t4);
    			append(div1, t5);
    			append(div1, a0);
    			append(div1, t7);
    			append(div1, a1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(footer);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    function create_fragment$9(ctx) {
    	var t0, t1, t2, t3, current;

    	var logonav = new Nav({ $$inline: true });

    	var greet = new Greet({ $$inline: true });

    	var portfolio = new Portfolio({ $$inline: true });

    	var contact = new Contact({ $$inline: true });

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			logonav.$$.fragment.c();
    			t0 = space();
    			greet.$$.fragment.c();
    			t1 = space();
    			portfolio.$$.fragment.c();
    			t2 = space();
    			contact.$$.fragment.c();
    			t3 = space();
    			footer.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(logonav, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(greet, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(portfolio, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(contact, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			logonav.$$.fragment.i(local);

    			greet.$$.fragment.i(local);

    			portfolio.$$.fragment.i(local);

    			contact.$$.fragment.i(local);

    			footer.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			logonav.$$.fragment.o(local);
    			greet.$$.fragment.o(local);
    			portfolio.$$.fragment.o(local);
    			contact.$$.fragment.o(local);
    			footer.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			logonav.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			greet.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			portfolio.$destroy(detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			contact.$destroy(detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			footer.$destroy(detaching);
    		}
    	};
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

    	return { name };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$9, safe_not_equal, ["name"]);

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
