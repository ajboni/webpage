
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.35.0 */

    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (239:0) {#if componentParams}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    derived(loc, _loc => _loc.location);
    derived(loc, _loc => _loc.querystring);
    const params = writable(undefined);

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$6, create_fragment$b, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});
    	}
    }

    // List of nodes to update
    const nodes = [];

    // Current location
    let location;

    // Function that updates all nodes marking the active ones
    function checkActive(el) {
        const matchesLocation = el.pattern.test(location);
        toggleClasses(el, el.className, matchesLocation);
        toggleClasses(el, el.inactiveClassName, !matchesLocation);
    }

    function toggleClasses(el, className, shouldAdd) {
        (className || '').split(' ').forEach((cls) => {
            if (!cls) {
                return
            }
            // Remove the class firsts
            el.node.classList.remove(cls);

            // If the pattern doesn't match, then set the class
            if (shouldAdd) {
                el.node.classList.add(cls);
            }
        });
    }

    // Listen to changes in the location
    loc.subscribe((value) => {
        // Update the location
        location = value.location + (value.querystring ? '?' + value.querystring : '');

        // Update all nodes
        nodes.map(checkActive);
    });

    /**
     * @typedef {Object} ActiveOptions
     * @property {string|RegExp} [path] - Path expression that makes the link active when matched (must start with '/' or '*'); default is the link's href
     * @property {string} [className] - CSS class to apply to the element when active; default value is "active"
     */

    /**
     * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
     * 
     * @param {HTMLElement} node - The target node (automatically set by Svelte)
     * @param {ActiveOptions|string|RegExp} [opts] - Can be an object of type ActiveOptions, or a string (or regular expressions) representing ActiveOptions.path.
     * @returns {{destroy: function(): void}} Destroy function
     */
    function active(node, opts) {
        // Check options
        if (opts && (typeof opts == 'string' || (typeof opts == 'object' && opts instanceof RegExp))) {
            // Interpret strings and regular expressions as opts.path
            opts = {
                path: opts
            };
        }
        else {
            // Ensure opts is a dictionary
            opts = opts || {};
        }

        // Path defaults to link target
        if (!opts.path && node.hasAttribute('href')) {
            opts.path = node.getAttribute('href');
            if (opts.path && opts.path.length > 1 && opts.path.charAt(0) == '#') {
                opts.path = opts.path.substring(1);
            }
        }

        // Default class name
        if (!opts.className) {
            opts.className = 'active';
        }

        // If path is a string, it must start with '/' or '*'
        if (!opts.path || 
            typeof opts.path == 'string' && (opts.path.length < 1 || (opts.path.charAt(0) != '/' && opts.path.charAt(0) != '*'))
        ) {
            throw Error('Invalid value for "path" argument')
        }

        // If path is not a regular expression already, make it
        const {pattern} = typeof opts.path == 'string' ?
            parse(opts.path) :
            {pattern: opts.path};

        // Add the node to the list
        const el = {
            node,
            className: opts.className,
            inactiveClassName: opts.inactiveClassName,
            pattern
        };
        nodes.push(el);

        // Trigger the action right away
        checkActive(el);

        return {
            // When the element is destroyed, remove it from the list
            destroy() {
                nodes.splice(nodes.indexOf(el), 1);
            }
        }
    }

    /* src/Nav.svelte generated by Svelte v3.35.0 */

    function add_css$a() {
    	var style = element("style");
    	style.id = "svelte-1j8b749-style";
    	style.textContent = "a.active{color:#9b4dca}a:not(.active){color:#606c76}.logoContainer.svelte-1j8b749{position:relative;height:60px;z-index:100;display:flex;align-items:center;padding:20px;border-bottom:2px solid #252728;background-color:#1a1a1d;gap:2rem}h4.svelte-1j8b749{margin:0px}";
    	append(document.head, style);
    }

    function create_fragment$a(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let a0;
    	let t3;
    	let a1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Alexis Boni";
    			t1 = space();
    			a0 = element("a");
    			a0.textContent = "Home";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Radio";
    			attr(h4, "class", "svelte-1j8b749");
    			attr(a0, "href", "/");
    			attr(a1, "href", "/radio");
    			attr(div, "class", "logoContainer svelte-1j8b749");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h4);
    			append(div, t1);
    			append(div, a0);
    			append(div, t3);
    			append(div, a1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a0)),
    					action_destroyer(active.call(null, a0)),
    					action_destroyer(link.call(null, a1)),
    					action_destroyer(active.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    class Nav extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1j8b749-style")) add_css$a();
    		init(this, options, null, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* src/Greet.svelte generated by Svelte v3.35.0 */

    function add_css$9() {
    	var style = element("style");
    	style.id = "svelte-v63kvx-style";
    	style.textContent = "a.svelte-v63kvx{color:inherit}.container.svelte-v63kvx{text-align:center;margin-top:40px}button.svelte-v63kvx{background-color:#6f4b86;border-color:#6f4b86}button.svelte-v63kvx:hover{background-color:#9b4dca;border-color:#9b4dca;color:white;cursor:pointer}";
    	append(document.head, style);
    }

    function create_fragment$9(ctx) {
    	let div2;

    	return {
    		c() {
    			div2 = element("div");

    			div2.innerHTML = `<h2>Hello World</h2> 
  

  <div class="row"><div class="column"><p>I’m a <strong>problem-solving</strong> web <strong>developer</strong>
        and <strong>IT generalist</strong> with over
        <strong>14+ years of technical expertise</strong>
        and hands-on experience. Passionate about
        <strong>Javascript, self-hosting, Linux, DIY projects, and free and
          open-source software (FOSS)</strong>, I thrive in environments where creativity and technical curiosity
        intersect.</p> 
      <a href="#contact" id="contact-btn" class="svelte-v63kvx"><button style="width: 150px" class="svelte-v63kvx">Contact Me!</button></a></div></div>`;

    			attr(div2, "class", "container svelte-v63kvx");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    		}
    	};
    }

    function instance$5($$self) {

    	onMount(() => {

    		setTimeout(
    			() => {
    			},
    			3800
    		);

    		setInterval(
    			() => {

    				setTimeout(
    					() => {
    					},
    					3500
    				); // console.log("Animate OUT");
    			},
    			6000
    		);
    	});

    	return [];
    }

    class Greet extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-v63kvx-style")) add_css$9();
    		init(this, options, instance$5, create_fragment$9, safe_not_equal, {});
    	}
    }

    const portfolioItems = [
      {
        id: 22,
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
        id: 21,
        title: "Airwindows Cheatsheet",
        description: "Cheatsheet for airwindows plugins.",
        category: "Web Development",
        skills: ["Svelte", "Bulma", "Travis"],
        img: "img/airwindows-cheatsheet.png",
        url: "https://github.com/ajboni/airwindows-cheatsheet",
        icon: "img/icons8-web-design-96.png",
      },
      {
        id: 20,
        title: "Ulauncher pipewire runtime settings",
        description: "Ulauncher extension to change PipeWire runtime settings.",
        category: "App Development",
        skills: ["Python"],
        img: "img/ulauncher-pw.png",
        url: "https://github.com/ajboni/ulauncher-pipewire-runtime-settings",
        icon: "img/icons8-github-100.png",
      },
      {
        id: 19,
        title: "Calvo",
        description: "A jalv based lv2 plugin rack for your terminal. ",
        category: "App Development",
        skills: ["Node.js", "jack", "lv2", "Linux"],
        img: "img/calvo.png",
        url: "https://github.com/ajboni/calvo",
        icon: "img/icons8-github-100.png",
      },
      {
        id: 18,
        title: "Arduino Chess Clock",
        description:
          "archckl - A simple but functional chess clock made with arduino nano and a few components.",
        category: "App Development",
        skills: ["C++", "Arduino", "Electronics"],
        url: "https://github.com/ajboni/archclk",
        icon: "img/icons8-chess-clock-96.png",
        img: "img/archclck.jpg",
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
        title: "Ateitis Corp",
        description:
          "Headless CMS and Ecommerce for Ateitis Corp made with React, Gatsby and Wordpress.",
        category: "Web Development",
        skills: ["React", "GraphQL", "Wordpress", "WooCommerce"],
        img: "img/ateitis.png",
        url: "https://ateitiscorp.com",
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

    function add_css$8() {
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

    function create_fragment$8(ctx) {
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { item } = $$props;

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	return [item];
    }

    class PortfolioItem extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1jun58v-style")) add_css$8();
    		init(this, options, instance$4, create_fragment$8, safe_not_equal, { item: 0 });
    	}
    }

    /* src/Separator.svelte generated by Svelte v3.35.0 */

    function add_css$7() {
    	var style = element("style");
    	style.id = "svelte-38wxyt-style";
    	style.textContent = ".row.svelte-38wxyt{margin-top:80px;margin-bottom:20px}hr.svelte-38wxyt{background:linear-gradient(to right, transparent, #252728, transparent);width:80%;margin-right:20px;margin-left:20px;height:2px;border-top:unset !important}";
    	append(document.head, style);
    }

    function create_fragment$7(ctx) {
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Separator extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-38wxyt-style")) add_css$7();
    		init(this, options, instance$3, create_fragment$7, safe_not_equal, {});
    	}
    }

    /* src/Portfolio.svelte generated by Svelte v3.35.0 */

    function add_css$6() {
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

    // (76:4) {#if (i + 1) % 3 === 1}
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
    		return /*func*/ ctx[6](/*i*/ ctx[11], ...args);
    	}

    	let each_value_1 = /*filteredPortfolioItems*/ ctx[0].filter(func);
    	const get_key = ctx => /*subItem*/ ctx[12].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let if_block1 = /*i*/ ctx[11] + 3 >= /*filteredPortfolioItems*/ ctx[0].length && create_if_block_1$1(ctx);

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
    					if_block1 = create_if_block_1$1(ctx);
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

    // (80:8) {#if i + 3 >= filteredPortfolioItems.length}
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

    // (81:10) {#if filteredPortfolioItems.length % 3 === 1}
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

    // (86:8) {#each filteredPortfolioItems.filter((eachElem, index) => {           return index < i + 3 && index >= i;         }) as subItem, x (subItem.id)}
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

    // (95:8) {#if i + 3 >= filteredPortfolioItems.length}
    function create_if_block_1$1(ctx) {
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

    // (96:10) {#if filteredPortfolioItems.length % 3 === 1}
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

    // (75:2) {#each filteredPortfolioItems as item, i (item.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = (/*i*/ ctx[11] + 1) % 3 === 1 && create_if_block$1(ctx);

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

    function create_fragment$6(ctx) {
    	let div3;
    	let separator;
    	let t0;
    	let div2;
    	let div0;
    	let input;
    	let t1;
    	let div1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t5;
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
    			div3 = element("div");
    			create_component(separator.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t1 = space();
    			div1 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "All";
    			option1 = element("option");
    			option1.textContent = "Text";
    			option2 = element("option");
    			option2.textContent = "Tags";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(input, "placeholder", "Search...");
    			attr(input, "class", "svelte-sd1ybq");
    			attr(div0, "class", "column svelte-sd1ybq");
    			option0.__value = "All";
    			option0.value = option0.__value;
    			option1.__value = "Text";
    			option1.value = option1.__value;
    			option2.__value = "Tags";
    			option2.value = option2.__value;
    			attr(select, "class", "svelte-sd1ybq");
    			if (/*filterType*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			attr(div1, "class", "column svelte-sd1ybq");
    			attr(div2, "class", "row svelte-sd1ybq");
    			attr(div3, "class", "container svelte-sd1ybq");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			mount_component(separator, div3, null);
    			append(div3, t0);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, input);
    			set_input_value(input, /*filter*/ ctx[1]);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, select);
    			append(select, option0);
    			append(select, option1);
    			append(select, option2);
    			select_option(select, /*filterType*/ ctx[2]);
    			append(div3, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
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
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
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
    			if (detaching) detach(div3);
    			destroy_component(separator);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		if (!document.getElementById("svelte-sd1ybq-style")) add_css$6();
    		init(this, options, instance$2, create_fragment$6, safe_not_equal, {});
    	}
    }

    const contactItems = [
      {
        id: 1,
        title: "E-mail",
        url: "mailto:mail@aboni.dev",
        img: "./img/icons8-email-sign-100.png",
      },
      {
        id: 2,
        title: "Github",
        url: "https://github.com/ajboni/",
        img: "./img/icons8-github-100.png",
      },
      {
        id: 11,
        title: "Blog",
        url: "https://blog.aboni.dev",
        img: "./img/icons8-blog-96.png",
      },
      // {
      //   id: 4,
      //   title: "Fiverr",
      //   url: "https://www.fiverr.com/ajboni?up_rollout=true",
      //   img: "./img/fiverr_logo.png",
      // },
      //   {

      {
        id: 5,
        title: "Youtube",
        url: "https://www.youtube.com/channel/UCweBjZoA-EJ1i33CXcpghgQ",
        img: "./img/icons8-play-button-100.png",
      },
      {
        id: 5,
        title: "Youtube Music",
        url: "https://www.youtube.com/@boni-music",
        img: "./img/icons8-youtube-music-96.png",
      },
      {
        id: 6,
        title: "Music",
        url: "https://open.spotify.com/artist/591vNWGZNG1MXFNfC1HoAM",
        img: "./img/icons8-spotify-100.png",
      },
    ];

    /* src/ContactForm.svelte generated by Svelte v3.35.0 */

    class ContactForm extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/Contact.svelte generated by Svelte v3.35.0 */

    function add_css$5() {
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

    function create_fragment$5(ctx) {
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
    			attr(div1, "id", "contact");
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
    		if (!document.getElementById("svelte-tj4o52-style")) add_css$5();
    		init(this, options, null, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.35.0 */

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-1la5udo-style";
    	style.textContent = "@media screen and (max-width: 767px){.footer-copyright.svelte-1la5udo{flex-direction:row;justify-content:center;flex-wrap:wrap}}footer.svelte-1la5udo{margin-top:100px;height:100px;display:flex;justify-content:center;align-items:center;flex-direction:column;border-top:2px solid #252728;background-color:#1a1a1d;font-size:90%}.footer-copyright.svelte-1la5udo{color:rgb(99, 99, 102);text-align:center;display:flex;align-items:center;margin-bottom:5px}img.svelte-1la5udo{width:20px;height:20px;margin:0px 5px}a.svelte-1la5udo{margin:0 5px}";
    	append(document.head, style);
    }

    function create_fragment$4(ctx) {
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
    			div0.textContent = "© Alexis Boni 2025";
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
    		if (!document.getElementById("svelte-1la5udo-style")) add_css$4();
    		init(this, options, null, create_fragment$4, safe_not_equal, {});
    	}
    }

    const skillsItems = {
      Dev: [
        "Javascript, HTML, CSS",
        "Nodejs, React, Alpine, Svelte, Nextjs",
        "Hugo, Gatsby, Next.js, Sapper",
        "TailwindCSS, Antd, Bulma, Bootstrap, MeterialUI",
        "Python, c#, vba, php, bash",
        "Devops, kubernetes, docker, IaaC",
        "Wordpress, WooCommerce",
        "Unity 3D, Godot Engine",
        "AI based dev, OpenAI, Langchain, Flowise, Langflow, Fooocus",
      ],
      IT: [
        "Network And Infraestructure Design, Planning and Implementation ",
        "Technical Project Management and Team Leader",
        "Technology research",
        "Router/Firewall administration",
        "Widows/Linux Server Administration",
        "Virtualization with VMWare and Proxmox",
        "Technology implementation of essential enterprise solutions.",
        "Software and Hardware Logging and monitoring",
        "Software and Hardware Tech Support",
        "Help Desk implementation and management",
        "Equipment Configuration and commisioning",
        "Cisco CCNA level: Routing and switching",
      ],
      "BI and Data": [
        "Advanced Excel",
        "Advanced PowerBI Reporting",
        "Sharepoint, Power Platform, MS List ",
        "Data Pipelines, Power Query, ETL, ELT, Airbyte, Metabase",
      ],
      Misc: [
        "CCNA official course: Routing and switching",
        "English-Spanish translation specializing in computer science and technical translation",
        "Experience in Music and Audio Production, Mixing and Mastering.",
        "English: Written: Proficient, Spoken: Intermediate",
        "Spanish: Native",
      ],
    };

    /* src/Skills.svelte generated by Svelte v3.35.0 */

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-6kzhhs-style";
    	style.textContent = ".container.svelte-6kzhhs h2.svelte-6kzhhs,h3.svelte-6kzhhs.svelte-6kzhhs{text-align:center}ul.svelte-6kzhhs.svelte-6kzhhs{margin:0}@media screen and (max-width: 767px){.title.svelte-6kzhhs.svelte-6kzhhs{width:100% !important;border-bottom:2px solid #252728;align-items:center;justify-items:center;justify-content:center}h3.svelte-6kzhhs.svelte-6kzhhs{margin:1rem 0}}.section.svelte-6kzhhs.svelte-6kzhhs{margin-bottom:4rem;border:2px solid #252728}.card.svelte-6kzhhs.svelte-6kzhhs{display:flex;flex-direction:column;padding:2rem 20px;margin:0 20px}.title.svelte-6kzhhs.svelte-6kzhhs{display:flex;align-items:center;justify-content:center;width:25%;background-color:#1a1a1a4b;margin-bottom:0;border-right:2px solid #252728}";
    	append(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (7:2) <Separator>
    function create_default_slot(ctx) {
    	let h2;

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Skills";
    			attr(h2, "class", "svelte-6kzhhs");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    		}
    	};
    }

    // (18:10) {#each cat[1] as item}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[3] + "";
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

    // (11:2) {#each Object.entries(skillsItems) as cat}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0_value = /*cat*/ ctx[0][0] + "";
    	let t0;
    	let t1;
    	let div1;
    	let ul;
    	let t2;
    	let each_value_1 = /*cat*/ ctx[0][1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr(h3, "class", "svelte-6kzhhs");
    			attr(div0, "class", "column title svelte-6kzhhs");
    			attr(ul, "class", "svelte-6kzhhs");
    			attr(div1, "class", "column card svelte-6kzhhs");
    			attr(div2, "class", "row section svelte-6kzhhs");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, h3);
    			append(h3, t0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append(div2, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*Object, skillsItems*/ 0) {
    				each_value_1 = /*cat*/ ctx[0][1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div;
    	let separator;
    	let t;
    	let current;

    	separator = new Separator({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = Object.entries(skillsItems);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");
    			create_component(separator.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "container svelte-6kzhhs");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(separator, div, null);
    			append(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const separator_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				separator_changes.$$scope = { dirty, ctx };
    			}

    			separator.$set(separator_changes);

    			if (dirty & /*Object, skillsItems*/ 0) {
    				each_value = Object.entries(skillsItems);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach(div);
    			destroy_component(separator);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    class Skills extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-6kzhhs-style")) add_css$3();
    		init(this, options, null, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src/Home.svelte generated by Svelte v3.35.0 */

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-zyhlq1-style";
    	style.textContent = ".mainContainer.svelte-zyhlq1{background-color:#1d1f21 !important;color:#d6dbdd !important;font-family:\"Droid Sans Mono\", \"monospace\", monospace,\n      \"Droid Sans Fallback\";font-weight:normal;font-size:1.08em}::-moz-selection{background-color:#6f4b86}h2{font-size:3.5rem;line-height:1.6}::selection{background-color:#6f4b86}";
    	append(document.head, style);
    }

    function create_fragment$2(ctx) {
    	let div;
    	let greet;
    	let t0;
    	let skills;
    	let t1;
    	let portfolio;
    	let t2;
    	let contact;
    	let t3;
    	let footer;
    	let current;
    	greet = new Greet({});
    	skills = new Skills({});
    	portfolio = new Portfolio({});
    	contact = new Contact({});
    	footer = new Footer({});

    	return {
    		c() {
    			div = element("div");
    			create_component(greet.$$.fragment);
    			t0 = space();
    			create_component(skills.$$.fragment);
    			t1 = space();
    			create_component(portfolio.$$.fragment);
    			t2 = space();
    			create_component(contact.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div, "class", "mainContainer svelte-zyhlq1");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(greet, div, null);
    			append(div, t0);
    			mount_component(skills, div, null);
    			append(div, t1);
    			mount_component(portfolio, div, null);
    			append(div, t2);
    			mount_component(contact, div, null);
    			append(div, t3);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(greet.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(greet.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(greet);
    			destroy_component(skills);
    			destroy_component(portfolio);
    			destroy_component(contact);
    			destroy_component(footer);
    		}
    	};
    }

    class Home extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-zyhlq1-style")) add_css$2();
    		init(this, options, null, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src/Radio.svelte generated by Svelte v3.35.0 */

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1hq8z3a-style";
    	style.textContent = ".controls.svelte-1hq8z3a.svelte-1hq8z3a{width:100%;height:100%;z-index:98;position:fixed;opacity:0.5;display:flex;gap:10rem}.previous.svelte-1hq8z3a.svelte-1hq8z3a,.next.svelte-1hq8z3a.svelte-1hq8z3a{flex-grow:0;width:10%;height:100%;cursor:pointer;position:relative}.play.svelte-1hq8z3a.svelte-1hq8z3a{flex-grow:1;height:100%;cursor:pointer;position:relative}.icon.svelte-1hq8z3a.svelte-1hq8z3a{color:white;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);opacity:0;transition:opacity 0.3s ease-in-out;width:48px;height:48px}.icon.play-icon.svelte-1hq8z3a.svelte-1hq8z3a{top:60%;left:50%;transform:translate(-50%, -60%)}.previous.svelte-1hq8z3a:hover .icon.svelte-1hq8z3a,.play.svelte-1hq8z3a:hover .icon.svelte-1hq8z3a,.next.svelte-1hq8z3a:hover .icon.svelte-1hq8z3a{opacity:1}.radio-container.svelte-1hq8z3a.svelte-1hq8z3a{display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;position:fixed;top:0px;left:0;right:0;bottom:0;animation:crtAnimation 1.2s 0.2s both;animation-timing-function:ease;animation-timing-function:cubic-bezier(0.2, -0.1, 0, 1);overflow:hidden}#yt-wrapper.svelte-1hq8z3a.svelte-1hq8z3a{height:100%;width:100%;overflow:hidden;aspect-ratio:16/9;pointer-events:none}.crt.svelte-1hq8z3a.svelte-1hq8z3a{overflow:hidden;filter:contrast(1.1) brightness(0.9) saturate(1.2)}.crt.svelte-1hq8z3a.svelte-1hq8z3a::before{content:\"\";position:absolute;top:0;left:0;width:100%;height:100%;background:repeating-linear-gradient(\n      0deg,\n      rgba(255, 255, 255, 0.05),\n      rgba(255, 255, 255, 0.05) 1px,\n      transparent 1px,\n      transparent 2px\n    );z-index:2;pointer-events:none}.crt.svelte-1hq8z3a.svelte-1hq8z3a::after{content:\"\";position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(\n      circle,\n      rgba(0, 0, 0, 0.3) 0%,\n      rgba(0, 0, 0, 0.3) 70%,\n      rgba(0, 0, 0, 0.5) 100%\n    );z-index:3;pointer-events:none;mix-blend-mode:multiply}.crt.svelte-1hq8z3a.svelte-1hq8z3a::before,.crt.svelte-1hq8z3a.svelte-1hq8z3a::after{filter:blur(0.5px)}";
    	append(document.head, style);
    }

    // (80:2) {#if showSplash}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			set_style(img, "position", "absolute");
    			set_style(img, "width", "100vw");
    			set_style(img, "height", "100vh");
    			set_style(img, "top", "0px");
    			set_style(img, "left", "0px");
    			set_style(img, "object-fit", "cover");
    			set_style(img, "z-index", "97");
    			if (img.src !== (img_src_value = "/img/gif/cover.gif")) attr(img, "src", img_src_value);
    			attr(img, "alt", "");
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (124:8) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "stroke-linecap", "round");
    			attr(path, "stroke-linejoin", "round");
    			attr(path, "d", "M15.75 5.25v13.5m-7.5-13.5v13.5");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "fill", "none");
    			attr(svg, "viewBox", "0 0 24 24");
    			attr(svg, "stroke-width", "1.5");
    			attr(svg, "stroke", "currentColor");
    			attr(svg, "class", "size-6");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    // (109:8) {#if !isPlaying}
    function create_if_block(ctx) {
    	let svg;
    	let path;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "stroke-linecap", "round");
    			attr(path, "stroke-linejoin", "round");
    			attr(path, "d", "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "fill", "none");
    			attr(svg, "viewBox", "0 0 24 24");
    			attr(svg, "stroke-width", "1.5");
    			attr(svg, "stroke", "currentColor");
    			attr(svg, "class", "size-6");
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div10;
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let svg2;
    	let t2;
    	let div2;
    	let t3;
    	let div4;
    	let t4;
    	let div9;
    	let div8;
    	let div7;
    	let div6;
    	let div5;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showSplash*/ ctx[1] && create_if_block_1();

    	function select_block_type(ctx, dirty) {
    		if (!/*isPlaying*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	return {
    		c() {
    			div10 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<svg class="icon svelte-1hq8z3a" viewBox="0 0 24 24"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></svg>`;
    			t1 = space();
    			div1 = element("div");
    			svg2 = svg_element("svg");
    			if_block1.c();
    			t2 = space();
    			div2 = element("div");
    			div2.innerHTML = `<svg class="icon svelte-1hq8z3a" viewBox="0 0 24 24"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></svg>`;
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			attr(div0, "class", "previous svelte-1hq8z3a");
    			attr(svg2, "class", "icon play-icon svelte-1hq8z3a");
    			attr(svg2, "viewBox", "0 0 24 24");
    			attr(div1, "class", "play svelte-1hq8z3a");
    			attr(div2, "class", "next svelte-1hq8z3a");
    			attr(div3, "class", "controls svelte-1hq8z3a");
    			set_style(div4, "pointer-events", "none");
    			set_style(div4, "user-select", "none");
    			set_style(div4, "z-index", "-1");
    			set_style(div4, "border-radius", "8px");
    			set_style(div4, "width", "100vw");
    			set_style(div4, "height", "200vw");
    			attr(div5, "id", "yt-wrapper");
    			attr(div5, "class", "svelte-1hq8z3a");
    			set_style(div6, "width", "100%");
    			set_style(div6, "height", "100%");
    			set_style(div7, "pointer-events", "none");
    			set_style(div7, "user-select", "none");
    			set_style(div7, "z-index", "-1");
    			set_style(div7, "border-radius", "8px");
    			set_style(div7, "width", "100vw");
    			set_style(div7, "height", "200vw");
    			set_style(div8, "width", "100%");
    			set_style(div8, "height", "100%");
    			set_style(div8, "overflow", "hidden");
    			set_style(div8, "display", "flex");
    			set_style(div8, "align-items", "center");
    			set_style(div8, "justify-content", "center");
    			set_style(div8, "border-radius", "8px");
    			set_style(div9, "position", "fixed");
    			set_style(div9, "inset", "0px");
    			set_style(div9, "display", "flex");
    			set_style(div9, "align-items", "center");
    			set_style(div9, "justify-content", "center");
    			set_style(div9, "z-index", "0");
    			set_style(div9, "background", "black");
    			attr(div9, "class", "yt-wrapper");
    			attr(div10, "class", "radio-container crt svelte-1hq8z3a");
    		},
    		m(target, anchor) {
    			insert(target, div10, anchor);
    			if (if_block0) if_block0.m(div10, null);
    			append(div10, t0);
    			append(div10, div3);
    			append(div3, div0);
    			append(div3, t1);
    			append(div3, div1);
    			append(div1, svg2);
    			if_block1.m(svg2, null);
    			append(div3, t2);
    			append(div3, div2);
    			append(div10, t3);
    			append(div10, div4);
    			append(div10, t4);
    			append(div10, div9);
    			append(div9, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			/*div5_binding*/ ctx[8](div5);

    			if (!mounted) {
    				dispose = [
    					listen(div0, "click", /*previousVideo*/ ctx[5]),
    					listen(div1, "click", /*togglePlay*/ ctx[3]),
    					listen(div2, "click", /*nextVideo*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*showSplash*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1();
    					if_block0.c();
    					if_block0.m(div10, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(svg2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div10);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			/*div5_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { playlistId = "PLanxhTsICXCzmyo7HL1QZFFQZOX6rz4gP" } = $$props;
    	let { showControls = true } = $$props;
    	let player;
    	let playerContainer;
    	let showSplash = true;
    	let isPlaying = false;

    	const startPlaying = () => {
    		if (player) {
    			player.unMute();
    			player.playVideo();
    			$$invalidate(1, showSplash = false);
    			$$invalidate(2, isPlaying = true);
    		}
    	};

    	onMount(() => {
    		// Initialize player when API is ready
    		console.log("Create player");

    		player = new YT.Player(playerContainer,
    		{
    				height: "100%",
    				width: "100%",
    				playerVars: {
    					listType: "playlist",
    					list: playlistId,
    					autoplay: 0, // Changed to 0 to prevent autoplay
    					mute: 0, // No need to mute since we're not autoplaying
    					controls: showControls ? 1 : 0,
    					modestbranding: 1,
    					showinfo: 0,
    					rel: 0,
    					loop: 1,
    					playsinline: 1
    				},
    				events: {
    					onReady: event => {
    						event.target.cuePlaylist({ list: playlistId });
    					}
    				}
    			});
    	});

    	// Video control functions
    	function togglePlay() {
    		// If first time trigger startPlaying instead to remove the splash screen
    		if (showSplash) {
    			startPlaying();
    			return;
    		}

    		if (player?.getPlayerState() === 1) {
    			pauseVideo();
    		} else {
    			playVideo();
    		}
    	}

    	function playVideo() {
    		player?.playVideo();
    		$$invalidate(2, isPlaying = true);
    	}

    	function pauseVideo() {
    		player?.pauseVideo();
    		$$invalidate(2, isPlaying = false);
    	}

    	function nextVideo() {
    		player?.nextVideo();
    	}

    	function previousVideo() {
    		player?.previousVideo();
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			playerContainer = $$value;
    			$$invalidate(0, playerContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("playlistId" in $$props) $$invalidate(6, playlistId = $$props.playlistId);
    		if ("showControls" in $$props) $$invalidate(7, showControls = $$props.showControls);
    	};

    	return [
    		playerContainer,
    		showSplash,
    		isPlaying,
    		togglePlay,
    		nextVideo,
    		previousVideo,
    		playlistId,
    		showControls,
    		div5_binding
    	];
    }

    class Radio extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1hq8z3a-style")) add_css$1();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { playlistId: 6, showControls: 7 });
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-uo8fuq-style";
    	style.textContent = ".main.svelte-uo8fuq{background:#1d1f21 !important}";
    	append(document.head, style);
    }

    function create_fragment(ctx) {
    	let div;
    	let nav;
    	let t;
    	let router;
    	let current;
    	nav = new Nav({});
    	router = new Router({ props: { routes: /*routes*/ ctx[0] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t = space();
    			create_component(router.$$.fragment);
    			attr(div, "class", "main svelte-uo8fuq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(nav, div, null);
    			append(div, t);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(nav);
    			destroy_component(router);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;
    	const routes = { "/": Home, "/radio": Radio, "*": Home };

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	return [routes, url];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-uo8fuq-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 1 });
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
