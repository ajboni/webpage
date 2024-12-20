
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
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

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    const useLocation = () => getContext(LOCATION);

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.35.0 */
    const get_default_slot_changes$2 = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context$2 = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$d(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context$2);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, ariaCurrent*/ 65540) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_default_slot_changes$2, get_default_slot_context$2);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
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
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps","preserveScroll"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	let { preserveScroll = false } = $$props;
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const { base } = getContext(ROUTER);
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, {
    				state,
    				replace: shouldReplace,
    				preserveScroll
    			});
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("preserveScroll" in $$new_props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ("$$scope" in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			$$invalidate(12, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			$$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$9, create_fragment$d, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10,
    			preserveScroll: 11
    		});
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.35.0 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
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
    		p(ctx, dirty) {
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

    // (51:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams*/ 132) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1, get_default_slot_context$1);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (43:4) {#if component}
    function create_if_block_1$2(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	return {
    		c() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[12] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
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
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
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

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$3(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$c, safe_not_equal, { path: 6, component: 0 });
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

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.35.0 */

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, $activeRoute, $location*/ 16390) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1, get_default_slot_context_1);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (134:0) {#if viewtransition}
    function create_if_block$2(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	return {
    		c() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m(target, anchor) {
    			key_block.m(target, anchor);
    			insert(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};
    }

    // (135:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, $activeRoute, $location*/ 16390) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
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
    		if (/*viewtransition*/ ctx[0]) return 0;
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

    function instance$7($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	component_subscribe($$self, routes, value => $$invalidate(13, $routes = value));
    	const activeRoute = writable(null);
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(9, url = $$props.url);
    		if ("viewtransition" in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ("history" in $$props) $$invalidate(10, history = $$props.history);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 4096) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 10242) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$base,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$7, create_fragment$b, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});
    	}
    }

    /* src/Nav.svelte generated by Svelte v3.35.0 */

    function add_css$a() {
    	var style = element("style");
    	style.id = "svelte-1nijv70-style";
    	style.textContent = ".logoContainer.svelte-1nijv70{position:relative;height:60px;z-index:100;display:flex;align-items:center;padding:20px;border-bottom:2px solid #252728;background-color:#1a1a1d;gap:2rem}h4.svelte-1nijv70{margin:0px}";
    	append(document.head, style);
    }

    // (10:2) <Link to="/" let:active>
    function create_default_slot_1$1(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	return {
    		c() {
    			div = element("div");
    			t = text("Home");
    			attr(div, "style", div_style_value = `color: ${/*active*/ ctx[1] ? "#9b4dca" : "#606c76"}`);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*active*/ 2 && div_style_value !== (div_style_value = `color: ${/*active*/ ctx[1] ? "#9b4dca" : "#606c76"}`)) {
    				attr(div, "style", div_style_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (13:2) <Link to="/radio" let:active>
    function create_default_slot$4(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	return {
    		c() {
    			div = element("div");
    			t = text("Radio");
    			attr(div, "style", div_style_value = `color: ${/*active*/ ctx[1] ? "#9b4dca" : "#606c76"}`);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*active*/ 2 && div_style_value !== (div_style_value = `color: ${/*active*/ ctx[1] ? "#9b4dca" : "#606c76"}`)) {
    				attr(div, "style", div_style_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let link0;
    	let t2;
    	let link1;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: {
    					default: [
    						create_default_slot_1$1,
    						({ active }) => ({ 1: active }),
    						({ active }) => active ? 2 : 0
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	link1 = new Link({
    			props: {
    				to: "/radio",
    				$$slots: {
    					default: [
    						create_default_slot$4,
    						({ active }) => ({ 1: active }),
    						({ active }) => active ? 2 : 0
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Alexis Boni";
    			t1 = space();
    			create_component(link0.$$.fragment);
    			t2 = space();
    			create_component(link1.$$.fragment);
    			attr(h4, "class", "svelte-1nijv70");
    			attr(div, "class", "logoContainer svelte-1nijv70");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h4);
    			append(div, t1);
    			mount_component(link0, div, null);
    			append(div, t2);
    			mount_component(link1, div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope, active*/ 6) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope, active*/ 6) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(link0);
    			destroy_component(link1);
    		}
    	};
    }

    function instance$6($$self) {
    	useLocation();
    	return [];
    }

    class Nav extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1nijv70-style")) add_css$a();
    		init(this, options, instance$6, create_fragment$a, safe_not_equal, {});
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
    function create_default_slot$3(ctx) {
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
    				$$slots: { default: [create_default_slot$3] },
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
    function create_default_slot$2(ctx) {
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
    				$$slots: { default: [create_default_slot$2] },
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
    function create_default_slot$1(ctx) {
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
    				$$slots: { default: [create_default_slot$1] },
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

    // (15:4) <Route path="/">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({});

    	return {
    		c() {
    			create_component(home.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(home, detaching);
    		}
    	};
    }

    // (11:0) <Router {url}>
    function create_default_slot(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let route0;
    	let t1;
    	let route1;
    	let current;
    	nav = new Nav({});

    	route0 = new Route({
    			props: { path: "/radio", component: Radio }
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			attr(div, "class", "main svelte-uo8fuq");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(nav, div, null);
    			append(div, t0);
    			mount_component(route0, div, null);
    			append(div, t1);
    			mount_component(route1, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(nav);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(router.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;
    	console.log(url);

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	return [url];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-uo8fuq-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
