(function(scope) {
"use strict";
scope.KBEngine = {};
KBEngine.PUBLISH = 0;
KBEngine.DEBUG = 1;
KBEngine.is_publish = KBEngine.DEBUG;
KBEngine.Class = function() {};
KBEngine.Class.extend = function(t) {
var n = this.prototype, e = !0, i = Object.create(n);
e = !1;
var r = /xyz/.test(function() {
xyz;
}) ? /\b_super\b/ : /.*/;
for (var s in t) i[s] = "function" == typeof t[s] && "function" == typeof n[s] && r.test(t[s]) ? function(t, e) {
return function() {
var i = this._super;
this._super = n[t];
var r = e.apply(this, arguments);
this._super = i;
return r;
};
}(s, t[s]) : t[s];
function a() {
e || this.ctor && this.ctor.apply(this, arguments);
}
a.prototype = i;
a.prototype.constructor = a;
a.extend = KBEngine.Class.extend;
return a;
};
KBEngine.PACKET_MAX_SIZE = 1500;
KBEngine.PACKET_MAX_SIZE_TCP = 1460;
KBEngine.PACKET_MAX_SIZE_UDP = 1472;
KBEngine.MESSAGE_ID_LENGTH = 2;
KBEngine.MESSAGE_LENGTH_LENGTH = 2;
KBEngine.CLIENT_NO_FLOAT = 0;
KBEngine.KBE_FLT_MAX = 3.402823466e38;
KBEngine.INT64 = function(t, n) {
this.lo = t;
this.hi = n;
this.sign = 1;
if (n >= 2147483648) {
this.sign = -1;
if (this.lo > 0) {
this.lo = 4294967296 - this.lo & 4294967295;
this.hi = 4294967295 - this.hi;
} else {
this.lo = 4294967296 - this.lo & 4294967295;
this.hi = 4294967296 - this.hi;
}
}
this.toString = function() {
var t = "";
this.sign < 0 && (t += "-");
var n = this.lo.toString(16), e = this.hi.toString(16);
if (this.hi > 0) {
t += e;
for (var i = 8 - n.length; i > 0; --i) t += "0";
}
return t += n;
};
};
KBEngine.UINT64 = function(t, n) {
this.lo = t;
this.hi = n;
this.toString = function() {
var t = this.lo.toString(16), n = this.hi.toString(16), e = "";
if (this.hi > 0) {
e += n;
for (var i = 8 - t.length; i > 0; --i) e += "0";
}
return e += t;
};
};
KBEngine.INFO_MSG = function(t) {
KBEngine.is_publish !== KBEngine.PUBLISH && console.info(t);
};
KBEngine.DEBUG_MSG = function(t) {
KBEngine.is_publish !== KBEngine.PUBLISH && console.debug(t);
};
KBEngine.ERROR_MSG = function(t) {
KBEngine.is_publish !== KBEngine.PUBLISH && console.error(t);
};
KBEngine.WARNING_MSG = function(t) {
KBEngine.is_publish !== KBEngine.PUBLISH && console.warn(t);
};
KBEngine.utf8ArrayToString = function(t) {
var n, e, i, r, s, a;
n = "";
i = t.length;
e = 0;
for (;e < i; ) switch ((r = t[e++]) >> 4) {
case 1:
case 2:
case 3:
case 4:
case 5:
case 6:
case 7:
n += String.fromCharCode(r);
break;

case 12:
case 13:
s = t[e++];
n += String.fromCharCode((31 & r) << 6 | 63 & s);
break;

case 14:
s = t[e++];
a = t[e++];
n += String.fromCharCode((15 & r) << 12 | (63 & s) << 6 | (63 & a) << 0);
}
return n;
};
KBEngine.stringToUTF8Bytes = function(t) {
for (var n = [], e = 0; e < t.length; e++) {
var i = t.charCodeAt(e);
if (i < 128) n.push(i); else if (i < 2048) n.push(192 | i >> 6, 128 | 63 & i); else if (i < 55296 || i >= 57344) n.push(224 | i >> 12, 128 | i >> 6 & 63, 128 | 63 & i); else {
e++;
i = 65536 + ((1023 & i) << 10 | 1023 & t.charCodeAt(e));
n.push(240 | i >> 18, 128 | i >> 12 & 63, 128 | i >> 6 & 63, 128 | 63 & i);
}
}
return n;
};
KBEngine.EventInfo = function(t, n) {
this.callbackfn = n;
this.classinst = t;
};
KBEngine.Event = function() {
this._events = {};
this.register = function(t, n, e) {
var i = e;
if (void 0 !== i) {
var r = this._events[t];
if (void 0 === r) {
r = [];
this._events[t] = r;
}
var s = new KBEngine.EventInfo(n, i);
r.push(s);
} else KBEngine.ERROR_MSG("KBEngine.Event::fire: not found callback(" + n + ")!" + e);
};
this.deregister = function(t, n) {
if ("undefined" != typeof this._events[t]) for (var e = this._events[t], i = 0, r = e.length; i < r; i++) {
if (e[i].classinst === n) {
e.splice(i, 1);
break;
}
}
};
this.fire = function() {
if (arguments.length < 1) KBEngine.ERROR_MSG("KBEngine.Event::fire: not found eventName!"); else {
var t = arguments[0], n = this._events[t];
if (void 0 !== n) {
var e, i, r = [];
for (e = 1, i = arguments.length; e < i; e++) r.push(arguments[e]);
for (e = 0, i = n.length; e < i; e++) {
var s = n[e];
arguments.length < 1 ? s.callbackfn.apply(s.classinst) : s.callbackfn.apply(s.classinst, r);
}
}
}
};
};
KBEngine.Event = new KBEngine.Event();
KBEngine.MemoryStream = function(t) {
this.rpos = 0;
this.wpos = 0;
this.dataView = null;
this.init(t);
};
KBEngine.MemoryStream.PackFloatXType = function() {
this._unionData = new ArrayBuffer(4);
this.fv = new Float32Array(this._unionData, 0, 1);
this.uv = new Uint32Array(this._unionData, 0, 1);
this.iv = new Int32Array(this._unionData, 0, 1);
};
KBEngine.MemoryStream.prototype = {
constructor: KBEngine.MemoryStream,
init: function(t) {
t instanceof ArrayBuffer ? this.buffer = t : this.buffer = new ArrayBuffer(t);
this.rpos = 0;
this.wpos = 0;
this.dataView = new DataView(this.buffer);
},
readInt8: function() {
var t = new Int8Array(this.buffer, this.rpos, 1);
this.rpos += 1;
return t[0];
},
readInt16: function() {
var t = this.readUint16();
t >= 32768 && (t -= 65536);
return t;
},
readInt32: function() {
var t = this.readUint32();
t >= 2147483648 && (t -= 4294967296);
return t;
},
readInt64: function() {
return new KBEngine.INT64(this.readUint32(), this.readUint32());
},
readUint8: function() {
var t = new Uint8Array(this.buffer, this.rpos, 1);
this.rpos += 1;
return t[0];
},
readUint16: function() {
var t = new Uint8Array(this.buffer, this.rpos);
this.rpos += 2;
return ((255 & t[1]) << 8) + (255 & t[0]);
},
readUint32: function() {
var t = new Uint8Array(this.buffer, this.rpos);
this.rpos += 4;
return (t[3] << 24) + (t[2] << 16) + (t[1] << 8) + t[0];
},
readUint64: function() {
var t = new Uint8Array(this.buffer, this.rpos);
this.rpos += 8;
return 4294967296 * (16777216 * t[7] + (t[6] << 16) + (t[5] << 8) + t[4]) + (16777216 * t[3] + (t[2] << 16) + (t[1] << 8) + t[0]);
},
readFloat: function() {
var t;
try {
t = new Float32Array(this.buffer, this.rpos, 1);
} catch (n) {
t = new Float32Array(this.buffer.slice(this.rpos, this.rpos + 4));
}
this.rpos += 4;
return t[0];
},
readDouble: function() {
var t;
try {
t = new Float64Array(this.buffer, this.rpos, 1);
} catch (n) {
t = new Float64Array(this.buffer.slice(this.rpos, this.rpos + 8), 0, 1);
}
this.rpos += 8;
return t[0];
},
readString: function(t) {
for (var n = new Uint8Array(this.buffer, this.rpos), e = 0, i = ""; ;) {
if (0 == n[e]) {
e++;
break;
}
i += String.fromCharCode(n[e]);
e++;
if (this.rpos + e >= this.buffer.byteLength) throw new Error("KBEngine.MemoryStream::readString: rpos(" + (this.rpos + e) + ")>=" + this.buffer.byteLength + " overflow!");
}
this.rpos += t || e;
return i;
},
readStringUTF8: function(t) {
var n = new Uint8Array(this.buffer, this.rpos, t);
t && (this.rpos += t);
return KBEngine.utf8ArrayToString(n);
},
readStringGBK: function(t) {
for (var n = new Uint8Array(this.buffer, this.rpos), e = 0; ;) {
if (0 === n[e]) {
e++;
n.slice(0, e);
break;
}
e++;
if (this.rpos + e >= this.buffer.byteLength) throw new Error("KBEngine.MemoryStream::readStringGBK: rpos(" + (this.rpos + e) + ") >= " + this.buffer.byteLength + " overflow!");
}
this.rpos += t;
return "";
},
readBlob: function() {
var t = this.readUint32(), n = new Uint8Array(this.buffer, this.rpos, t);
this.rpos += t;
return n;
},
readStream: function() {
var t = new Uint8Array(this.buffer, this.rpos, this.buffer.byteLength - this.rpos);
this.rpos = this.buffer.byteLength;
return new KBEngine.MemoryStream(t);
},
readPackXZ: function() {
var t = new KBEngine.MemoryStream.PackFloatXType(), n = new KBEngine.MemoryStream.PackFloatXType();
t.fv[0] = 0;
n.fv[0] = 0;
t.uv[0] = 1073741824;
n.uv[0] = 1073741824;
var e = this.readUint8(), i = this.readUint8(), r = this.readUint8(), s = 0;
s |= e << 16;
s |= i << 8;
s |= r;
t.uv[0] |= (8384512 & s) << 3;
n.uv[0] |= (2047 & s) << 15;
t.fv[0] -= 2;
n.fv[0] -= 2;
t.uv[0] |= (8388608 & s) << 8;
n.uv[0] |= (2048 & s) << 20;
(s = new Array(2))[0] = t.fv[0];
s[1] = n.fv[0];
return s;
},
readPackY: function() {
return this.readUint16();
},
writeInt8: function(t) {
new Int8Array(this.buffer, this.wpos, 1)[0] = t;
this.wpos += 1;
},
writeInt16: function(t) {
this.writeInt8(255 & t);
this.writeInt8(t >> 8 & 255);
},
writeInt32: function(t) {
for (var n = 0; n < 4; n++) this.writeInt8(t >> 8 * n & 255);
},
writeInt64: function(t) {
this.writeInt32(t.lo);
this.writeInt32(t.hi);
},
writeUint8: function(t) {
new Uint8Array(this.buffer, this.wpos, 1)[0] = t;
this.wpos += 1;
},
writeUint16: function(t) {
this.writeUint8(255 & t);
this.writeUint8(t >> 8 & 255);
},
writeUint32: function(t) {
for (var n = 0; n < 4; n++) this.writeUint8(t >> 8 * n & 255);
},
writeUint64: function(t) {
this.writeUint32(t.lo);
this.writeUint32(t.hi);
},
writeFloat: function(t) {
var n;
try {
(n = new Float32Array(this.buffer, this.wpos, 1))[0] = t;
} catch (r) {
(n = new Float32Array(1))[0] = t;
var e = new Uint8Array(this.buffer), i = new Uint8Array(n.buffer);
e.set(i, this.wpos);
}
this.wpos += 4;
},
writeDouble: function(t) {
var n;
try {
(n = new Float64Array(this.buffer, this.wpos, 1))[0] = t;
} catch (r) {
(n = new Float64Array(1))[0] = t;
var e = new Uint8Array(this.buffer), i = new Uint8Array(n.buffer);
e.set(i, this.wpos);
}
this.wpos += 8;
},
writeBlob: function(t) {
var n = t.length;
if (n + 4 > this.space()) KBEngine.ERROR_MSG("memorystream::writeBlob: no free!"); else {
this.writeUint32(n);
var e = new Uint8Array(this.buffer, this.wpos, n);
if ("string" == typeof t) for (var i = 0; i < n; i++) e[i] = t.charCodeAt(i); else for (i = 0; i < n; i++) e[i] = t[i];
this.wpos += n;
}
},
writeString: function(t) {
if (t.length > this.space()) KBEngine.ERROR_MSG("memorystream::writeString: no free!"); else {
for (var n = new Uint8Array(this.buffer, this.wpos), e = 0, i = KBEngine.stringToUTF8Bytes(t), r = 0, s = i.length; r < s; r++) n[e++] = i[r];
n[e++] = 0;
this.wpos += e;
}
},
readSkip: function(t) {
this.rpos += t;
},
space: function() {
return this.buffer.byteLength - this.wpos;
},
length: function() {
return this.wpos - this.rpos;
},
readEOF: function() {
return this.buffer.byteLength - this.rpos <= 0;
},
done: function() {
this.rpos = this.wpos;
},
getbuffer: function(t) {
return this.buffer.slice(this.rpos, this.wpos);
},
setInt8: function(t, n) {
this.dataView.setInt8(t, n);
},
setUint8: function(t, n) {
this.dataView.setUint8(t, n);
},
setInt16: function(t, n) {
this.dataView.setInt16(t, n, !0);
},
setUint16: function(t, n) {
this.dataView.setUint16(t, n, !0);
},
setInt32: function(t, n) {
this.dataView.setInt32(t, n, !0);
},
setUint32: function(t, n) {
this.dataView.setUint32(t, n, !0);
},
getInt8: function(t) {
return this.dataView.getInt8(t);
},
getUint8: function(t) {
return this.dataView.getUint8(t);
},
getInt16: function(t) {
return this.dataView.getInt16(t, !0);
},
getUint16: function(t) {
return this.dataView.getUint16(t, !0);
},
getInt32: function(t) {
return this.dataView.getInt32(t, !0);
},
getUint32: function(t) {
return this.dataView.getUint32(t, !0);
}
};
KBEngine.Bundle = function() {
this.memorystreams = [];
this.stream = new KBEngine.MemoryStream(KBEngine.PACKET_MAX_SIZE_TCP);
this.numMessage = 0;
this.messageLengthBuffer = null;
this.messageLength = 0;
this.msgtype = null;
};
KBEngine.Bundle.prototype = {
constructor: KBEngine.Bundle,
newMessage: function(t) {
this.fini(!1);
this.msgtype = t;
this.numMessage += 1;
},
writeMsgLength: function(t) {
if (this.messageLengthBuffer) {
this.messageLengthBuffer[0] = 255 & t;
this.messageLengthBuffer[1] = t >> 8 & 255;
}
},
fini: function(t) {
if (this.numMessage > 0) {
this.writeMsgLength(this.messageLength);
this.stream && this.memorystreams.push(this.stream);
}
if (t) {
this.messageLengthBuffer = null;
this.numMessage = 0;
this.msgtype = null;
}
},
send: function(t) {
this.fini(!0);
for (var n = 0, e = this.memorystreams.length; n < e; n++) {
var i = this.memorystreams[n];
t.send(i.getbuffer());
}
this.memorystreams.length = 0;
this.stream = new KBEngine.MemoryStream(KBEngine.PACKET_MAX_SIZE_TCP);
},
checkStream: function(t) {
if (t > this.stream.space()) {
this.memorystreams.push(this.stream);
this.stream = new KBEngine.MemoryStream(KBEngine.PACKET_MAX_SIZE_TCP);
}
this.messageLength += t;
},
writeInt8: function(t) {
this.checkStream(1);
this.stream.writeInt8(t);
},
writeInt16: function(t) {
this.checkStream(2);
this.stream.writeInt16(t);
},
writeInt32: function(t) {
this.checkStream(4);
this.stream.writeInt32(t);
},
writeInt64: function(t) {
this.checkStream(8);
this.stream.writeInt64(t);
},
writeUint8: function(t) {
this.checkStream(1);
this.stream.writeUint8(t);
},
writeUint16: function(t) {
this.checkStream(2);
this.stream.writeUint16(t);
},
writeUint32: function(t) {
this.checkStream(4);
this.stream.writeUint32(t);
},
writeUint64: function(t) {
this.checkStream(8);
this.stream.writeUint64(t);
},
writeFloat: function(t) {
this.checkStream(4);
this.stream.writeFloat(t);
},
writeDouble: function(t) {
this.checkStream(8);
this.stream.writeDouble(t);
},
writeString: function(t, n) {
var e = KBEngine.stringToUTF8Bytes(t).length, i = n || e + 1;
this.checkStream(e + 1);
this.stream.writeString(t);
if (n) for (var r = e + 1; r < i; r++) this.writeUint8(0);
},
writeBlob: function(t) {
this.checkStream(t.length + 4);
this.stream.writeBlob(t);
},
writeUint8Array: function(t) {
for (var n = 0, e = t.length; n < e; n++) this.writeUint8(t[n]);
},
getStream: function(t) {
KBEngine.PACKET_MAX_SIZE_TCP;
return this.memorystreams[mindex];
},
setInt8: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setInt8(e, n);
},
setUint8: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setUint8(e, n);
},
setInt16: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setInt16(e, n);
},
setUint16: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setInt8(e, n);
},
setInt32: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setInt32(e, n);
},
setUint32: function(t, n) {
var e = t % KBEngine.PACKET_MAX_SIZE_TCP;
this.getStream(t).setUint32(e, n);
},
getInt8: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getInt8(n);
},
getUint8: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getInt8(n);
},
getInt16: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getInt16(n);
},
getUint16: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getUint16(n);
},
getInt32: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getInt32(n);
},
getUint32: function(t) {
var n = t % KBEngine.PACKET_MAX_SIZE_TCP;
return this.getStream(t).getUint32(n);
}
};
KBEngine.reader = new KBEngine.MemoryStream(0);
KBEngine.datatype2id = {};
KBEngine.datatype2id.STRING = 1;
KBEngine.datatype2id["STD::STRING"] = 1;
KBEngine.datatype2id.UINT8 = 2;
KBEngine.datatype2id.BOOL = 2;
KBEngine.datatype2id.DATATYPE = 2;
KBEngine.datatype2id.CHAR = 2;
KBEngine.datatype2id.DETAIL_TYPE = 2;
KBEngine.datatype2id.MAIL_TYPE = 2;
KBEngine.datatype2id.UINT16 = 3;
KBEngine.datatype2id["UNSIGNED SHORT"] = 3;
KBEngine.datatype2id.SERVER_ERROR_CODE = 3;
KBEngine.datatype2id.ENTITY_TYPE = 3;
KBEngine.datatype2id.ENTITY_PROPERTY_UID = 3;
KBEngine.datatype2id.ENTITY_METHOD_UID = 3;
KBEngine.datatype2id.ENTITY_SCRIPT_UID = 3;
KBEngine.datatype2id.DATATYPE_UID = 3;
KBEngine.datatype2id.UINT32 = 4;
KBEngine.datatype2id.UINT = 4;
KBEngine.datatype2id["UNSIGNED INT"] = 4;
KBEngine.datatype2id.ARRAYSIZE = 4;
KBEngine.datatype2id.SPACE_ID = 4;
KBEngine.datatype2id.GAME_TIME = 4;
KBEngine.datatype2id.TIMER_ID = 4;
KBEngine.datatype2id.UINT64 = 5;
KBEngine.datatype2id.DBID = 5;
KBEngine.datatype2id.COMPONENT_ID = 5;
KBEngine.datatype2id.INT8 = 6;
KBEngine.datatype2id.COMPONENT_ORDER = 6;
KBEngine.datatype2id.INT16 = 7;
KBEngine.datatype2id.SHORT = 7;
KBEngine.datatype2id.INT32 = 8;
KBEngine.datatype2id.INT = 8;
KBEngine.datatype2id.ENTITY_ID = 8;
KBEngine.datatype2id.CALLBACK_ID = 8;
KBEngine.datatype2id.COMPONENT_TYPE = 8;
KBEngine.datatype2id.INT64 = 9;
KBEngine.datatype2id.PYTHON = 10;
KBEngine.datatype2id.PY_DICT = 10;
KBEngine.datatype2id.PY_TUPLE = 10;
KBEngine.datatype2id.PY_LIST = 10;
KBEngine.datatype2id.MAILBOX = 10;
KBEngine.datatype2id.BLOB = 11;
KBEngine.datatype2id.UNICODE = 12;
KBEngine.datatype2id.FLOAT = 13;
KBEngine.datatype2id.DOUBLE = 14;
KBEngine.datatype2id.VECTOR2 = 15;
KBEngine.datatype2id.VECTOR3 = 16;
KBEngine.datatype2id.VECTOR4 = 17;
KBEngine.datatype2id.FIXED_DICT = 18;
KBEngine.datatype2id.ARRAY = 19;
KBEngine.bindwriter = function(t, n) {
return n == KBEngine.datatype2id.UINT8 ? t.writeUint8 : n == KBEngine.datatype2id.UINT16 ? t.writeUint16 : n == KBEngine.datatype2id.UINT32 ? t.writeUint32 : n == KBEngine.datatype2id.UINT64 ? t.writeUint64 : n == KBEngine.datatype2id.INT8 ? t.writeInt8 : n == KBEngine.datatype2id.INT16 ? t.writeInt16 : n == KBEngine.datatype2id.INT32 ? t.writeInt32 : n == KBEngine.datatype2id.INT64 ? t.writeInt64 : n == KBEngine.datatype2id.FLOAT ? t.writeFloat : n == KBEngine.datatype2id.DOUBLE ? t.writeDouble : n == KBEngine.datatype2id.STRING ? t.writeString : n == KBEngine.datatype2id.FIXED_DICT ? t.writeStream : (KBEngine.datatype2id.ARRAY, 
t.writeStream);
};
KBEngine.bindReader = function(t) {
return t == KBEngine.datatype2id.UINT8 ? KBEngine.reader.readUint8 : t == KBEngine.datatype2id.UINT16 ? KBEngine.reader.readUint16 : t == KBEngine.datatype2id.UINT32 ? KBEngine.reader.readUint32 : t == KBEngine.datatype2id.UINT64 ? KBEngine.reader.readUint64 : t == KBEngine.datatype2id.INT8 ? KBEngine.reader.readInt8 : t == KBEngine.datatype2id.INT16 ? KBEngine.reader.readInt16 : t == KBEngine.datatype2id.INT32 ? KBEngine.reader.readInt32 : t == KBEngine.datatype2id.INT64 ? KBEngine.reader.readInt64 : t == KBEngine.datatype2id.FLOAT ? KBEngine.reader.readFloat : t == KBEngine.datatype2id.DOUBLE ? KBEngine.reader.readDouble : t == KBEngine.datatype2id.STRING ? KBEngine.reader.readString : t == KBEngine.datatype2id.PYTHON ? KBEngine.reader.readStream : t == KBEngine.datatype2id.VECTOR2 ? KBEngine.reader.readStream : t == KBEngine.datatype2id.VECTOR3 ? KBEngine.reader.readStream : t == KBEngine.datatype2id.VECTOR4 ? KBEngine.reader.readStream : t == KBEngine.datatype2id.BLOB ? KBEngine.reader.readStream : t == KBEngine.datatype2id.UNICODE ? KBEngine.reader.readStream : t == KBEngine.datatype2id.FIXED_DICT ? KBEngine.reader.readStream : (KBEngine.datatype2id.ARRAY, 
KBEngine.reader.readStream);
};
KBEngine.Message = function(t, n, e, i, r, s) {
this.id = t;
this.name = n;
this.length = e;
this.argsType = i;
for (var a = 0; a < r.length; a++) r[a] = KBEngine.bindReader(r[a]);
this.args = r;
this.handler = s;
this.createFromStream = function(t) {
if (this.args.length <= 0) return t;
var n = new Array(this.args.length);
for (a = 0; a < this.args.length; a++) n[a] = this.args[a].call(t);
return n;
};
this.handleMessage = function(t) {
null != this.handler ? this.args.length <= 0 ? this.argsType < 0 ? this.handler(t) : this.handler() : this.handler.apply(KBEngine.app, this.createFromStream(t)) : KBEngine.ERROR_MSG("KBEngine.Message::handleMessage: interface(" + this.name + "/" + this.id + ") no implement!");
};
};
KBEngine.messages = {};
KBEngine.messages.loginapp = {};
KBEngine.messages.baseapp = {};
KBEngine.clientmessages = {};
KBEngine.messages.Loginapp_importClientMessages = new KBEngine.Message(5, "importClientMessages", 0, 0, new Array(), null);
KBEngine.messages.Baseapp_importClientMessages = new KBEngine.Message(207, "importClientMessages", 0, 0, new Array(), null);
KBEngine.messages.Baseapp_importClientEntityDef = new KBEngine.Message(208, "importClientEntityDef", 0, 0, new Array(), null);
KBEngine.messages.onImportClientMessages = new KBEngine.Message(518, "onImportClientMessages", -1, -1, new Array(), null);
KBEngine.bufferedCreateEntityMessage = {};
KBEngine.Vector3 = KBEngine.Class.extend({
ctor: function(t, n, e) {
this.x = t;
this.y = n;
this.z = e;
return !0;
},
distance: function(t) {
var n = t.x - this.x, e = t.y - this.y, i = t.z - this.z;
return Math.sqrt(n * n + e * e + i * i);
}
});
KBEngine.clampf = function(t, n, e) {
if (n > e) {
var i = n;
n = e;
e = i;
}
return t < n ? n : t < e ? t : e;
};
KBEngine.int82angle = function(t, n) {
return t * (Math.PI / (n ? 254 : 128));
};
KBEngine.angle2int8 = function(t, n) {
return n ? KBEngine.clampf(floorf(254 * t / float(Math.PI) + .5), -128, 127) : Math.floor(128 * t / float(Math.PI) + .5);
};
KBEngine.Entity = KBEngine.Class.extend({
ctor: function() {
return !0;
}
});
KBEngine.moduledefs = {};
KBEngine.datatypes = {};
KBEngine.DATATYPE_UINT8 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readUint8.call(t);
};
this.addToStream = function(t, n) {
t.writeUint8(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < 0 || t > 255);
};
};
KBEngine.DATATYPE_UINT16 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readUint16.call(t);
};
this.addToStream = function(t, n) {
t.writeUint16(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < 0 || t > 65535);
};
};
KBEngine.DATATYPE_UINT32 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readUint32.call(t);
};
this.addToStream = function(t, n) {
t.writeUint32(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < 0 || t > 4294967295);
};
};
KBEngine.DATATYPE_UINT64 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readUint64.call(t);
};
this.addToStream = function(t, n) {
t.writeUint64(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return t instanceof KBEngine.UINT64;
};
};
KBEngine.DATATYPE_INT8 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readInt8.call(t);
};
this.addToStream = function(t, n) {
t.writeInt8(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < -128 || t > 127);
};
};
KBEngine.DATATYPE_INT16 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readInt16.call(t);
};
this.addToStream = function(t, n) {
t.writeInt16(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < -32768 || t > 32767);
};
};
KBEngine.DATATYPE_INT32 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readInt32.call(t);
};
this.addToStream = function(t, n) {
t.writeInt32(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t && !(t < -2147483648 || t > 2147483647);
};
};
KBEngine.DATATYPE_INT64 = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readInt64.call(t);
};
this.addToStream = function(t, n) {
t.writeInt64(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return t instanceof KBEngine.INT64;
};
};
KBEngine.DATATYPE_FLOAT = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readFloat.call(t);
};
this.addToStream = function(t, n) {
t.writeFloat(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t;
};
};
KBEngine.DATATYPE_DOUBLE = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.reader.readDouble.call(t);
};
this.addToStream = function(t, n) {
t.writeDouble(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "number" == typeof t;
};
};
KBEngine.DATATYPE_STRING = function() {
this.bind = function() {};
this.createFromStream = function(t, n) {
return KBEngine.reader.readString.call(t, n);
};
this.addToStream = function(t, n) {
t.writeString(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return "string" == typeof t;
};
};
KBEngine.DATATYPE_STRING_GBK = function() {
this.bind = function() {};
this.createFromStream = function(t, n) {
return KBEngine.reader.readStringGBK.call(t, n);
};
};
KBEngine.DATATYPE_VECTOR = function(size) {
this.itemsize = size;
this.bind = function() {};
this.createFromStream = function(t) {
var n = KBEngine.reader.readUint32.call(t);
if (n == this.itemsize) return 3 == this.itemsize ? KBEngine.CLIENT_NO_FLOAT ? new KBEngine.Vector3(KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t)) : new KBEngine.Vector3(KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t)) : 4 == this.itemsize ? KBEngine.CLIENT_NO_FLOAT ? new KBEngine.Vector4(KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t)) : new KBEngine.Vector4(KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t)) : 2 == this.itemsize ? KBEngine.CLIENT_NO_FLOAT ? new KBEngine.Vector2(KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t), KBEngine.reader.readInt32.call(t)) : new KBEngine.Vector2(KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t), KBEngine.reader.readFloat.call(t)) : void 0;
KBEngine.ERROR_MSG("KBEDATATYPE_VECTOR::createFromStream: size(" + n + ") != thisSize(" + this.itemsize + ") !");
};
this.addToStream = function(t, n) {
t.writeUint32(this.itemsize);
if (KBEngine.CLIENT_NO_FLOAT) {
t.writeInt32(n.x);
t.writeInt32(n.y);
} else {
t.writeFloat(n.x);
t.writeFloat(n.y);
}
if (3 == this.itemsize) KBEngine.CLIENT_NO_FLOAT ? t.writeInt32(n.z) : t.writeFloat(n.z); else if (4 == this.itemsize) if (KBEngine.CLIENT_NO_FLOAT) {
t.writeInt32(n.z);
t.writeInt32(n.w);
} else {
t.writeFloat(n.z);
t.writeFloat(n.w);
}
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
if (2 == this.itemsize) {
if (!t instanceof KBEngine.Vector2) return !1;
} else if (3 == this.itemsize) {
if (!t instanceof KBEngine.Vector3) return !1;
} else if (4 == this.itemsize && !t instanceof KBEngine.Vector4) return !1;
return !0;
};
};
KBEngine.DATATYPE_PYTHON = function() {
this.bind = function() {};
this.createFromStream = function(t) {};
this.addToStream = function(t, n) {};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return !1;
};
};
KBEngine.DATATYPE_UNICODE = function() {
this.bind = function() {};
this.createFromStream = function(t) {
return KBEngine.utf8ArrayToString(KBEngine.reader.readBlob.call(t));
};
this.addToStream = function(t, n) {
t.writeBlob(KBEngine.stringToUTF8Bytes(n));
};
this.parseDefaultValStr = function(t) {
return "string" == typeof t ? t : "";
};
this.isSameType = function(t) {
return "string" == typeof t;
};
};
KBEngine.DATATYPE_MAILBOX = function() {
this.bind = function() {};
this.createFromStream = function(t) {};
this.addToStream = function(t, n) {};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return !1;
};
};
KBEngine.DATATYPE_BLOB = function() {
this.bind = function() {};
this.createFromStream = function(t) {
var n = KBEngine.reader.readUint32.call(t), e = new Uint8Array(t.buffer, t.rpos, n);
t.rpos += n;
return e;
};
this.addToStream = function(t, n) {
t.writeBlob(n);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
return !0;
};
};
KBEngine.DATATYPE_ARRAY = function() {
this.type = null;
this.bind = function() {
"number" == typeof this.type && (this.type = KBEngine.datatypes[this.type]);
};
this.createFromStream = function(t) {
for (var n = t.readUint32(), e = []; n > 0; ) {
n--;
e.push(this.type.createFromStream(t));
}
return e;
};
this.addToStream = function(t, n) {
t.writeUint32(n.length);
for (var e = 0; e < n.length; e++) this.type.addToStream(t, n[e]);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
for (var n = 0; n < t.length; n++) if (!this.type.isSameType(t[n])) return !1;
return !0;
};
};
KBEngine.DATATYPE_FIXED_DICT = function() {
this.dicttype = {};
this.implementedBy = null;
this.bind = function() {
for (var t in this.dicttype) {
var n = this.dicttype[t];
"number" == typeof this.dicttype[t] && (this.dicttype[t] = KBEngine.datatypes[n]);
}
};
this.createFromStream = function(t) {
var n = {};
for (var e in this.dicttype) n[e] = this.dicttype[e].createFromStream(t);
return n;
};
this.addToStream = function(t, n) {
for (var e in this.dicttype) this.dicttype[e].addToStream(t, n[e]);
};
this.parseDefaultValStr = function(v) {
return eval(v);
};
this.isSameType = function(t) {
for (var n in this.dicttype) if (!this.dicttype[n].isSameType(t[n])) return !1;
return !0;
};
};
KBEngine.datatypes.UINT8 = new KBEngine.DATATYPE_UINT8();
KBEngine.datatypes.UINT16 = new KBEngine.DATATYPE_UINT16();
KBEngine.datatypes.UINT32 = new KBEngine.DATATYPE_UINT32();
KBEngine.datatypes.UINT64 = new KBEngine.DATATYPE_UINT64();
KBEngine.datatypes.INT8 = new KBEngine.DATATYPE_INT8();
KBEngine.datatypes.INT16 = new KBEngine.DATATYPE_INT16();
KBEngine.datatypes.INT32 = new KBEngine.DATATYPE_INT32();
KBEngine.datatypes.INT64 = new KBEngine.DATATYPE_INT64();
KBEngine.datatypes.FLOAT = new KBEngine.DATATYPE_FLOAT();
KBEngine.datatypes.DOUBLE = new KBEngine.DATATYPE_DOUBLE();
KBEngine.datatypes.STRING = new KBEngine.DATATYPE_STRING();
KBEngine.datatypes.STRING_GBK = new KBEngine.DATATYPE_STRING_GBK();
KBEngine.datatypes.VECTOR2 = new KBEngine.DATATYPE_VECTOR(2);
KBEngine.datatypes.VECTOR3 = new KBEngine.DATATYPE_VECTOR(3);
KBEngine.datatypes.VECTOR4 = new KBEngine.DATATYPE_VECTOR(4);
KBEngine.datatypes.PYTHON = new KBEngine.DATATYPE_PYTHON();
KBEngine.datatypes.UNICODE = new KBEngine.DATATYPE_UNICODE();
KBEngine.datatypes.MAILBOX = new KBEngine.DATATYPE_MAILBOX();
KBEngine.datatypes.BLOB = new KBEngine.DATATYPE_BLOB();
KBEngine.KBEngineApp = function() {
this.username = null;
this.password = null;
this.ip = null;
this.port = null;
this.onopencb = null;
this.onclosecb = null;
this.socket = null;
this.stream = null;
this.net = new KBEngine.Net(this);
this.addr = "";
this.wssAddr = "";
};
KBEngine.KBEngineApp.prototype = {
constructor: KBEngine.KBEngineApp,
init: function() {
this.net = new KBEngine.Net(this);
},
reset: function() {
if (void 0 !== this.socket && null !== this.socket) {
var t = this.socket;
t.onclose = function() {};
this.socket = null;
t.close();
}
void 0 !== this.net && null !== this.net && this.net.reset();
},
connect: function(t) {
void 0 !== t && (this.onopencb = t);
var n;
if (this.wssAddr) n = this.wssAddr; else {
if (!this.ip || !this.port || 0 === this.ip.length) {
KBEngine.ERROR_MSG("wrong ip or port: " + this.ip + " " + this.port);
return;
}
n = "ws://" + this.ip + ":" + this.port;
}
KBEngine.INFO_MSG(n);
this.addr = n;
try {
this.socket = new WebSocket(n);
} catch (t) {
KBEngine.ERROR_MSG("WebSocket init error!");
KBEngine.ERROR_MSG(t);
return;
}
var e = this.socket;
e.binaryType = "arraybuffer";
e.onopen = this.onopen.bind(this);
e.onerror = this.onerror_before_onopen.bind(this);
e.onmessage = this.onmessage.bind(this);
e.onclose = this.onclose.bind(this);
},
setOnopenCallback: function(t) {
this.onopencb = t;
},
setOncloseCallback: function(t) {
this.onclosecb = t;
},
onmessage: function(t) {
null !== this.stream ? this.stream.init(t.data) : this.stream = new KBEngine.MemoryStream(t.data);
var n = this.stream, e = (n.readUint16(), n.readUint8(), n.readUint8(), n.readUint16()), i = n.readUint16();
this.net.handleMessage(e, i, n);
},
disconnect: function() {
try {
if (null != this.socket) {
var t = this.socket;
this.socket = null;
t.close();
KBEngine.INFO_MSG("disconnect!");
}
} catch (t) {}
},
onopen: function() {
KBEngine.INFO_MSG("connect success!");
this.socket.onerror = this.onerror_after_onopen;
this.onopencb && this.onopencb();
},
onerror_before_onopen: function(t) {
KBEngine.ERROR_MSG("connect error:" + t.data);
},
onerror_after_onopen: function(t) {
KBEngine.ERROR_MSG("connect error:" + t.data);
},
onclose: function() {
KBEngine.INFO_MSG("connect close");
this.onclosecb && this.onclosecb();
this.reset();
KBEngine.Event.fire("onclose");
},
send: function(t) {
this.socket.send(t);
},
close: function() {
KBEngine.INFO_MSG("close socket");
this.reset();
},
loginapp_by_id: function(t, n) {
var e = new KBEngine.Bundle();
e.newMessage();
var i = new CMD_Info(0, 0, 65), r = new CMD_Command(const_val.MDM_GR_LOGON, const_val.SUB_GR_LOGON_USERID), s = new CMD_GR_LogonByUserID();
s.dwUserID = t;
s.szPassWord = n;
i.wDataSize = i.size() + r.size() + s.size();
i.writeToStream(e);
r.writeToStream(e);
s.writeToStream(e);
e.send(this);
}
};
KBEngine.createApp = function() {
return new KBEngine.KBEngineApp();
};
KBEngine.destroyApp = function(t) {
t && t.close();
};
KBEngine.CmdInfo = function(t, n, e) {
this.target = t;
this.funcName = n;
this.protocol = e;
};
KBEngine.Net = function(t) {
this._callClientFuncs = {};
this._callServerFuncs = {};
this._funcName2Info = {};
this.network = t;
this.m_dwSendXorKey = 0;
this.m_dwRecvXorKey = 0;
this.m_dwSendPacketCount = 0;
this.m_cbSendRound = 0;
this.m_cbRecvRound = 0;
};
scope.CMD_Info = {
argTypes: [ {
name: "wDataSize",
type: "UINT16"
}, {
name: "cbCheckCode",
type: "UINT8"
}, {
name: "cbMasterOrder",
type: "UINT8"
} ],
size: function() {
return 4;
},
write2bundle: function(t, n, e, i) {
t.writeUint16(n);
t.writeUint8(e);
t.writeUint8(i);
}
};
scope.CMD_Command = {
argTypes: [ {
name: "wMainCmdID",
type: "UINT16"
}, {
name: "wSubCmdID",
type: "UINT16"
} ],
size: function() {
return 4;
},
write2bundle: function(t, n, e) {
t.writeUint16(n);
t.writeUint16(e);
}
};
KBEngine.Net.prototype = {
constructor: KBEngine.Net,
registerServer: function() {
var t = arguments[0], n = arguments[1], e = arguments[2], i = e.mainCmdID, r = e.subCmdID, s = this._callClientFuncs[i];
if ("undefined" == typeof s) {
s = {};
this._callClientFuncs[i] = s;
}
s[r] = new KBEngine.CmdInfo(t, n, e);
},
handleMessage: function(t, n, e) {
if (this._callClientFuncs[t] && this._callClientFuncs[t][n]) {
var i = this._callClientFuncs[t][n], r = i.target, s = i.funcName, a = i.protocol, o = [];
a.createFromStream(e, o);
if (o.length <= 2) r[s].apply(r, o); else {
for (var h = {}, d = 0, f = a.argTypes.length; d < f; d++) h[a.argTypes[d].name] = o[d];
r[s].call(r, h);
}
} else {
KBEngine.ERROR_MSG("mainCmdID: " + t);
KBEngine.ERROR_MSG("subCmdID: " + n);
KBEngine.INFO_MSG("__________________________________");
}
},
registerClient: function() {
var t = arguments[0], n = arguments[1], e = arguments[2], i = new KBEngine.CmdInfo(t, n, e);
this._funcName2Info[n] = i;
},
callServer: function() {
var t = arguments[0], n = this._funcName2Info[t].protocol, e = Array.prototype.splice.call(arguments, 1), i = new KBEngine.Bundle();
i.newMessage();
var r = CMD_Info.size() + CMD_Command.size() + n.size(e);
CMD_Info.write2bundle(i, r, 0, 65);
CMD_Command.write2bundle(i, n.mainCmdID, n.subCmdID);
n.write2bundle(i, e);
i.send(this.network);
},
removeServer: function(t, n) {
var e = this._callClientFuncs[t];
e && e[n] && delete e[n];
},
removeClient: function(t, n) {
var e = this._callServerFuncs[t];
e && e[n] && delete e[n];
},
reset: function() {
this._callClientFuncs = {};
this._callServerFuncs = {};
this._funcName2Info = {};
this.network = null;
}
};
scope.MD5 = {
safeAdd: function(t, n) {
var e = (65535 & t) + (65535 & n);
return (t >> 16) + (n >> 16) + (e >> 16) << 16 | 65535 & e;
},
bitRotateLeft: function(t, n) {
return t << n | t >>> 32 - n;
},
md5cmn: function(t, n, e, i, r, s) {
return this.safeAdd(this.bitRotateLeft(this.safeAdd(this.safeAdd(n, t), this.safeAdd(i, s)), r), e);
},
md5ff: function(t, n, e, i, r, s, a) {
return this.md5cmn(n & e | ~n & i, t, n, r, s, a);
},
md5gg: function(t, n, e, i, r, s, a) {
return this.md5cmn(n & i | e & ~i, t, n, r, s, a);
},
md5hh: function(t, n, e, i, r, s, a) {
return this.md5cmn(n ^ e ^ i, t, n, r, s, a);
},
md5ii: function(t, n, e, i, r, s, a) {
return this.md5cmn(e ^ (n | ~i), t, n, r, s, a);
},
binlMD5: function(t, n) {
t[n >> 5] |= 128 << n % 32;
t[14 + (n + 64 >>> 9 << 4)] = n;
var e, i, r, s, a, o = 1732584193, h = -271733879, d = -1732584194, f = 271733878;
for (e = 0; e < t.length; e += 16) {
i = o;
r = h;
s = d;
a = f;
o = this.md5ff(o, h, d, f, t[e], 7, -680876936);
f = this.md5ff(f, o, h, d, t[e + 1], 12, -389564586);
d = this.md5ff(d, f, o, h, t[e + 2], 17, 606105819);
h = this.md5ff(h, d, f, o, t[e + 3], 22, -1044525330);
o = this.md5ff(o, h, d, f, t[e + 4], 7, -176418897);
f = this.md5ff(f, o, h, d, t[e + 5], 12, 1200080426);
d = this.md5ff(d, f, o, h, t[e + 6], 17, -1473231341);
h = this.md5ff(h, d, f, o, t[e + 7], 22, -45705983);
o = this.md5ff(o, h, d, f, t[e + 8], 7, 1770035416);
f = this.md5ff(f, o, h, d, t[e + 9], 12, -1958414417);
d = this.md5ff(d, f, o, h, t[e + 10], 17, -42063);
h = this.md5ff(h, d, f, o, t[e + 11], 22, -1990404162);
o = this.md5ff(o, h, d, f, t[e + 12], 7, 1804603682);
f = this.md5ff(f, o, h, d, t[e + 13], 12, -40341101);
d = this.md5ff(d, f, o, h, t[e + 14], 17, -1502002290);
h = this.md5ff(h, d, f, o, t[e + 15], 22, 1236535329);
o = this.md5gg(o, h, d, f, t[e + 1], 5, -165796510);
f = this.md5gg(f, o, h, d, t[e + 6], 9, -1069501632);
d = this.md5gg(d, f, o, h, t[e + 11], 14, 643717713);
h = this.md5gg(h, d, f, o, t[e], 20, -373897302);
o = this.md5gg(o, h, d, f, t[e + 5], 5, -701558691);
f = this.md5gg(f, o, h, d, t[e + 10], 9, 38016083);
d = this.md5gg(d, f, o, h, t[e + 15], 14, -660478335);
h = this.md5gg(h, d, f, o, t[e + 4], 20, -405537848);
o = this.md5gg(o, h, d, f, t[e + 9], 5, 568446438);
f = this.md5gg(f, o, h, d, t[e + 14], 9, -1019803690);
d = this.md5gg(d, f, o, h, t[e + 3], 14, -187363961);
h = this.md5gg(h, d, f, o, t[e + 8], 20, 1163531501);
o = this.md5gg(o, h, d, f, t[e + 13], 5, -1444681467);
f = this.md5gg(f, o, h, d, t[e + 2], 9, -51403784);
d = this.md5gg(d, f, o, h, t[e + 7], 14, 1735328473);
h = this.md5gg(h, d, f, o, t[e + 12], 20, -1926607734);
o = this.md5hh(o, h, d, f, t[e + 5], 4, -378558);
f = this.md5hh(f, o, h, d, t[e + 8], 11, -2022574463);
d = this.md5hh(d, f, o, h, t[e + 11], 16, 1839030562);
h = this.md5hh(h, d, f, o, t[e + 14], 23, -35309556);
o = this.md5hh(o, h, d, f, t[e + 1], 4, -1530992060);
f = this.md5hh(f, o, h, d, t[e + 4], 11, 1272893353);
d = this.md5hh(d, f, o, h, t[e + 7], 16, -155497632);
h = this.md5hh(h, d, f, o, t[e + 10], 23, -1094730640);
o = this.md5hh(o, h, d, f, t[e + 13], 4, 681279174);
f = this.md5hh(f, o, h, d, t[e], 11, -358537222);
d = this.md5hh(d, f, o, h, t[e + 3], 16, -722521979);
h = this.md5hh(h, d, f, o, t[e + 6], 23, 76029189);
o = this.md5hh(o, h, d, f, t[e + 9], 4, -640364487);
f = this.md5hh(f, o, h, d, t[e + 12], 11, -421815835);
d = this.md5hh(d, f, o, h, t[e + 15], 16, 530742520);
h = this.md5hh(h, d, f, o, t[e + 2], 23, -995338651);
o = this.md5ii(o, h, d, f, t[e], 6, -198630844);
f = this.md5ii(f, o, h, d, t[e + 7], 10, 1126891415);
d = this.md5ii(d, f, o, h, t[e + 14], 15, -1416354905);
h = this.md5ii(h, d, f, o, t[e + 5], 21, -57434055);
o = this.md5ii(o, h, d, f, t[e + 12], 6, 1700485571);
f = this.md5ii(f, o, h, d, t[e + 3], 10, -1894986606);
d = this.md5ii(d, f, o, h, t[e + 10], 15, -1051523);
h = this.md5ii(h, d, f, o, t[e + 1], 21, -2054922799);
o = this.md5ii(o, h, d, f, t[e + 8], 6, 1873313359);
f = this.md5ii(f, o, h, d, t[e + 15], 10, -30611744);
d = this.md5ii(d, f, o, h, t[e + 6], 15, -1560198380);
h = this.md5ii(h, d, f, o, t[e + 13], 21, 1309151649);
o = this.md5ii(o, h, d, f, t[e + 4], 6, -145523070);
f = this.md5ii(f, o, h, d, t[e + 11], 10, -1120210379);
d = this.md5ii(d, f, o, h, t[e + 2], 15, 718787259);
h = this.md5ii(h, d, f, o, t[e + 9], 21, -343485551);
o = this.safeAdd(o, i);
h = this.safeAdd(h, r);
d = this.safeAdd(d, s);
f = this.safeAdd(f, a);
}
return [ o, h, d, f ];
},
binl2rstr: function(t) {
var n, e = "", i = 32 * t.length;
for (n = 0; n < i; n += 8) e += String.fromCharCode(t[n >> 5] >>> n % 32 & 255);
return e;
},
rstr2binl: function(t) {
var n, e = [];
e[(t.length >> 2) - 1] = void 0;
for (n = 0; n < e.length; n += 1) e[n] = 0;
var i = 8 * t.length;
for (n = 0; n < i; n += 8) e[n >> 5] |= (255 & t.charCodeAt(n / 8)) << n % 32;
return e;
},
rstrMD5: function(t) {
return this.binl2rstr(this.binlMD5(this.rstr2binl(t), 8 * t.length));
},
rstrHMACMD5: function(t, n) {
var e, i, r = this.rstr2binl(t), s = [], a = [];
s[15] = a[15] = void 0;
r.length > 16 && (r = this.binlMD5(r, 8 * t.length));
for (e = 0; e < 16; e += 1) {
s[e] = 909522486 ^ r[e];
a[e] = 1549556828 ^ r[e];
}
i = this.binlMD5(s.concat(this.rstr2binl(n)), 512 + 8 * n.length);
return this.binl2rstr(this.binlMD5(a.concat(i), 640));
},
rstr2hex: function(t) {
var n, e, i, r = "";
for (e = 0, i = t.length; e < i; e += 1) {
n = t.charCodeAt(e);
r += "0123456789abcdef".charAt(n >>> 4 & 15) + "0123456789abcdef".charAt(15 & n);
}
return r;
},
str2rstrUTF8: function(t) {
return unescape(encodeURIComponent(t));
},
rawMD5: function(t) {
return this.rstrMD5(this.str2rstrUTF8(t));
},
hexMD5: function(t) {
return this.rstr2hex(this.rawMD5(t));
},
rawHMACMD5: function(t, n) {
return this.rstrHMACMD5(this.str2rstrUTF8(t), this.str2rstrUTF8(n));
},
hexHMACMD5: function(t, n) {
return this.rstr2hex(this.rawHMACMD5(t, n));
},
md5: function(t, n, e) {
return n ? e ? this.rawHMACMD5(n, t) : this.hexHMACMD5(n, t) : e ? this.rawMD5(t) : this.hexMD5(t);
}
};
KBEngine.EncryptData = function(t) {
return scope.MD5.md5(t);
};
KBEngine.EncryptBuffer = function(t) {};
})(window);