(function(t) {
function e(t, e, o) {
this.notify = t;
this.context = e;
this.type = o;
}
e.prototype.setNotifyMethod = function(t) {
this.notify = t;
};
e.prototype.setNotifyContext = function(t) {
this.context = t;
};
e.prototype.getNotifyMethod = function() {
return this.notify;
};
e.prototype.getNotifyContext = function() {
return this.context;
};
e.prototype.notifyObserver = function(t) {
"mediator" === this.type ? this.notify.apply(this.context, t.body) : this.notify.call(this.context, t);
};
e.prototype.compareNotifyContext = function(t) {
return t === this.context;
};
e.prototype.notify = null;
e.prototype.context = null;
function o(t, e, o) {
this.name = t;
this.body = e;
this.type = o;
}
o.prototype.getName = function() {
return this.name;
};
o.prototype.setBody = function(t) {
this.body = t;
};
o.prototype.getBody = function() {
return this.body;
};
o.prototype.setType = function(t) {
this.type = t;
};
o.prototype.getType = function() {
return this.type;
};
o.prototype.toString = function() {
var t = "Notification Name: " + this.getName();
t += "\nBody:" + (null == this.body ? "null" : this.body.toString());
return t += "\nType:" + (null == this.type ? "null" : this.type);
};
o.prototype.name = null;
o.prototype.type = null;
o.prototype.body = null;
function n() {}
n.prototype.sendNotification = function() {
var t = this.getFacade();
if (t) {
arguments[0];
for (var e = [], o = 0, n = arguments.length; o < n; o++) e.push(arguments[o]);
t.sendNotification.apply(t, e);
}
};
n.prototype.facade;
n.prototype.initializeNotifier = function(t) {
this.multitonKey = String(t);
this.facade = this.getFacade();
};
n.prototype.getFacade = function() {
if (null == this.multitonKey) throw new Error(n.MULTITON_MSG);
return s.getInstance(this.multitonKey);
};
n.prototype.multitonKey = null;
n.MULTITON_MSG = "multitonKey for this Notifier not yet initialized!";
function i() {}
i.prototype = new n();
i.prototype.constructor = i;
i.prototype.execute = function(t) {};
function r() {
this.subCommands = [];
this.initializeMacroCommand();
}
r.prototype = new n();
r.prototype.constructor = r;
r.prototype.subCommands = null;
r.prototype.initializeMacroCommand = function() {};
r.prototype.addSubCommand = function(t) {
this.subCommands.push(t);
};
r.prototype.execute = function(t) {
for (var e = 0, o = this.subCommands.length; e < o; e++) {
var n = new (0, this.subCommands[e])();
n.initializeNotifier(this.multitonKey);
t.body && t.body.length > 0 ? n.execute.apply(n, t.body) : n.execute(t);
}
this.subCommands.length = 0;
};
function p(t, e) {
this.mediatorName = t || this.constructor.NAME;
this.viewComponent = e;
}
p.NAME = "Mediator";
p.prototype = new n();
p.prototype.constructor = p;
p.prototype.getMediatorName = function() {
return this.mediatorName;
};
p.prototype.setViewComponent = function(t) {
this.viewComponent = t;
};
p.prototype.getViewComponent = function() {
return this.viewComponent;
};
p.prototype.listNotificationInterests = function() {
return [];
};
p.prototype.handleNotification = function(t) {};
p.prototype.onRegister = function() {};
p.prototype.onRemove = function() {};
p.prototype.mediatorName = null;
p.prototype.viewComponent = null;
function a(t, e) {
this.proxyName = t || this.constructor.NAME;
null != e && this.setData(e);
}
a.NAME = "Proxy";
a.prototype = new n();
a.prototype.constructor = a;
a.prototype.getProxyName = function() {
return this.proxyName;
};
a.prototype.setData = function(t) {
this.data = t;
};
a.prototype.getData = function() {
return this.data;
};
a.prototype.onRegister = function() {};
a.prototype.onRemove = function() {};
a.prototype.proxyName = null;
a.prototype.data = null;
function s(t) {
if (null != s.instanceMap[t]) throw new Error(s.MULTITON_MSG);
this.initializeNotifier(t);
s.instanceMap[t] = this;
this.initializeFacade();
}
s.prototype.initializeFacade = function() {
this.initializeModel();
this.initializeController();
this.initializeView();
};
s.getInstance = function(t) {
if (null == t) return null;
null == s.instanceMap[t] && (s.instanceMap[t] = new s(t));
return s.instanceMap[t];
};
s.prototype.initializeController = function() {
null == this.controller && (this.controller = c.getInstance(this.multitonKey));
};
s.prototype.initializeModel = function() {
null == this.model && (this.model = u.getInstance(this.multitonKey));
};
s.prototype.initializeView = function() {
null == this.view && (this.view = l.getInstance(this.multitonKey));
};
s.prototype.registerCommand = function(t, e) {
this.controller.registerCommand(t, e);
};
s.prototype.removeCommand = function(t) {
this.controller.removeCommand(t);
};
s.prototype.hasCommand = function(t) {
return this.controller.hasCommand(t);
};
s.prototype.addProxy = function(t) {
this.model.addProxy(t);
};
s.prototype.registerProxy = function() {
this.model.registerProxy();
};
s.prototype.retrieveProxy = function(t) {
return this.model.retrieveProxy(t);
};
s.prototype.removeProxy = function(t) {
var e = null;
null != this.model && (e = this.model.removeProxy(t));
return e;
};
s.prototype.hasProxy = function(t) {
return this.model.hasProxy(t);
};
s.prototype.registerMediator = function(t) {
null != this.view && this.view.registerMediator(t);
};
s.prototype.retrieveMediator = function(t) {
return this.view.retrieveMediator(t);
};
s.prototype.removeMediator = function(t) {
var e = null;
null != this.view && (e = this.view.removeMediator(t));
return e;
};
s.prototype.hasMediator = function(t) {
return this.view.hasMediator(t);
};
s.prototype.sendNotification = function() {
var t = arguments[0], e = [];
if (arguments.length > 1) for (var n = 1, i = arguments.length; n < i; n++) e.push(arguments[n]);
this.notifyObservers(new o(t, e));
};
s.prototype.notifyObservers = function(t) {
null != this.view && this.view.notifyObservers(t);
};
s.prototype.initializeNotifier = function(t) {
this.multitonKey = t;
};
s.hasCore = function(t) {
return null != s.instanceMap[t];
};
s.removeCore = function(t) {
if (null != s.instanceMap[t]) {
u.removeModel(t);
l.removeView(t);
c.removeController(t);
delete s.instanceMap[t];
}
};
s.prototype.controller = null;
s.prototype.model = null;
s.prototype.view = null;
s.prototype.multitonKey = null;
s.instanceMap = [];
s.MULTITON_MSG = "Facade instance for this Multiton key already constructed!";
function l(t) {
if (null != l.instanceMap[t]) throw new Error(l.MULTITON_MSG);
this.multitonKey = t;
l.instanceMap[this.multitonKey] = this;
this.mediatorMap = [];
this.observerMap = [];
this.initializeView();
}
l.prototype.initializeView = function() {};
l.getInstance = function(t) {
if (null == t) return null;
null == l.instanceMap[t] && (l.instanceMap[t] = new l(t));
return l.instanceMap[t];
};
l.prototype.registerObserver = function(t, e) {
null != this.observerMap[t] ? this.observerMap[t].push(e) : this.observerMap[t] = [ e ];
};
l.prototype.notifyObservers = function(t) {
if (null != this.observerMap[t.getName()]) {
for (var e, o = this.observerMap[t.getName()], n = [], i = 0; i < o.length; i++) {
e = o[i];
n.push(e);
}
for (i = 0; i < n.length; i++) (e = n[i]).notifyObserver(t);
}
};
l.prototype.removeObserver = function(t, e) {
for (var o = this.observerMap[t], n = 0; n < o.length; n++) if (1 == o[n].compareNotifyContext(e)) {
o.splice(n, 1);
break;
}
0 == o.length && delete this.observerMap[t];
};
l.prototype.registerMediator = function(t) {
if (!this.mediatorMap[t.name]) {
this.mediatorMap[t.name] = t;
var o = t.listNotificationInterests();
if (o && o.length > 0) for (var n, i, r = 0, p = o.length; r < p; r++) {
n = new e((i = o[r]).callback, t, "mediator");
this.registerObserver(i.evtType, n);
}
}
};
l.prototype.retrieveMediator = function(t) {
return this.mediatorMap[t];
};
l.prototype.removeMediator = function(t) {
var e = this.mediatorMap[t];
if (e) {
var o = e.listNotificationInterests();
if (!o || 0 === o.length) return e;
for (var n = 0; n < o.length; n++) this.removeObserver(o[n].evtType, e);
delete this.mediatorMap[t];
}
return e;
};
l.prototype.hasMediator = function(t) {
return null != this.mediatorMap[t];
};
l.removeView = function(t) {
delete l.instanceMap[t];
};
l.prototype.mediatorMap = null;
l.prototype.observerMap = null;
l.instanceMap = [];
l.prototype.multitonKey = null;
l.MULTITON_MSG = "View instance for this Multiton key already constructed!";
function u(t) {
if (u.instanceMap[t]) throw new Error(u.MULTITON_MSG);
this.multitonKey = t;
u.instanceMap[t] = this;
this.proxyMap = [];
this.initializeModel();
}
u.prototype.initializeModel = function() {};
u.getInstance = function(t) {
if (null == t) return null;
null == u.instanceMap[t] && (u.instanceMap[t] = new u(t));
return u.instanceMap[t];
};
u.prototype.addProxy = function(t) {
t.initializeNotifier(this.multitonKey);
this.proxyMap[t.getProxyName()] = t;
};
u.prototype.registerProxy = function() {
for (var t in this.proxyMap) this.proxyMap[t].onRegister();
};
u.prototype.retrieveProxy = function(t) {
return this.proxyMap[t];
};
u.prototype.hasProxy = function(t) {
return null != this.proxyMap[t];
};
u.prototype.removeProxy = function(t) {
var e = this.proxyMap[t];
if (e) {
this.proxyMap[t] = null;
e.onRemove();
}
return e;
};
u.removeModel = function(t) {
delete u.instanceMap[t];
};
u.prototype.proxyMap = null;
u.instanceMap = [];
u.prototype.multitonKey;
u.MULTITON_MSG = "Model instance for this Multiton key already constructed!";
function c(t) {
if (null != c.instanceMap[t]) throw new Error(c.MULTITON_MSG);
this.multitonKey = t;
c.instanceMap[this.multitonKey] = this;
this.commandMap = [];
this.initializeController();
}
c.prototype.initializeController = function() {
this.view = l.getInstance(this.multitonKey);
};
c.getInstance = function(t) {
if (null == t) return null;
null == this.instanceMap[t] && (this.instanceMap[t] = new this(t));
return this.instanceMap[t];
};
c.prototype.executeCommand = function(t) {
var e = this.commandMap[t.getName()];
if (null != e) {
var o = new e();
o.initializeNotifier(this.multitonKey);
t.body && t.body.length > 0 ? o.execute.apply(o, t.body) : o.execute(t);
}
};
c.prototype.registerCommand = function(t, o) {
null == this.commandMap[t] && this.view.registerObserver(t, new e(this.executeCommand, this));
this.commandMap[t] = o;
};
c.prototype.hasCommand = function(t) {
return null != this.commandMap[t];
};
c.prototype.removeCommand = function(t) {
if (this.hasCommand(t)) {
this.view.removeObserver(t, this);
this.commandMap[t] = null;
}
};
c.removeController = function(t) {
delete this.instanceMap[t];
};
c.prototype.view = null;
c.prototype.commandMap = null;
c.prototype.multitonKey = null;
c.instanceMap = [];
c.MULTITON_MSG = "controller key for this Multiton key already constructed";
t.OopHelp = {
global: {},
extend: function(t, e) {
if ("function" != typeof t) throw new TypeError("#extend- child should be Function");
if ("function" != typeof e) throw new TypeError("#extend- parent should be Function");
if (e !== t) {
t.prototype = Object.create(e.prototype);
return t.prototype.constructor = t;
}
},
decorate: function(t, e) {
for (var o in e) t[o] = e[o];
return t;
}
};
t.puremvc = {
View: l,
Model: u,
Controller: c,
SimpleCommand: i,
MacroCommand: r,
Facade: s,
Mediator: p,
Observer: e,
Notification: o,
Notifier: n,
Proxy: a,
define: function(t, e, o) {
t || (t = {});
var n, i, r = t.name, p = t.parent, a = "function" == typeof p;
t.scope;
if ("parent" in t && !a) throw new TypeError("Class parent must be Function");
if (t.hasOwnProperty("constructor")) {
if ("function" != typeof (n = t.constructor)) throw new TypeError("Class constructor must be Function");
} else n = a ? function() {
p.apply(this, arguments);
} : new Function();
a && OopHelp.extend(n, p);
if (e) {
i = n.prototype;
OopHelp.decorate(i, e);
i.constructor = n;
}
o && OopHelp.decorate(n, o);
if (r && "string" != typeof r) throw new TypeError("Class name must be primitive string");
return n;
}
};
})(window);