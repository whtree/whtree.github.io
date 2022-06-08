let CHECK_TICK = 2, Heartbeat = cc.Class({
extends: cc.Component,
properties: {
connected: !1,
connectCallBack: null
},
startHeartbeat: function(t) {
cc.log("startstartstart");
this.connected = !0;
this.connectCallBack = t;
let e = cc.director.getScheduler();
e.isScheduled(this.checkHeartbeat, this) || e.schedule(this.checkHeartbeat, this, CHECK_TICK, !1);
},
stop: function() {
cc.director.getScheduler().unschedule(this.checkHeartbeat, this);
},
checkHeartbeat: function() {
0 == this.connected && this.connectCallBack();
}
});

window.heartbeat = new Heartbeat();