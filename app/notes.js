// logger.js

(function (global) {
  'use strict';

  // ---- Configuration ----
  var TELEMETRY_ENDPOINT = '/telemetry'; // change to your API
  var MAX_EVENTS_PER_BATCH = 15;         // ~1.5 seconds worth at 10 eps
  var MAX_BATCH_INTERVAL_MS = 1000;      // flush at least every 1s
  var MAX_BEACON_BYTES = 60 * 1024;      // keep under ~64 KiB typical limit[web:33][web:36]

  // ---- Internal state ----
  var buffer = [];
  var lastFlushTime = Date.now();
  var flushTimer = null;
  var isSending = false;

  // ---- Utility: estimate payload size ----
  function getSizeInBytes(str) {
    // Rough UTF‑8 byte length
    return new Blob([str]).size;
  }

  function serializeBuffer(events) {
    // Adjust schema as you like
    return JSON.stringify({
      ts: Date.now(),
      events: events
    });
  }

  // ---- Transport helpers ----

  function canUseSendBeacon() {
    return !!(navigator && navigator.sendBeacon);
  }

  function sendWithBeacon(payload) {
    // Payload must be Blob, ArrayBufferView, etc., or DOMString
    try {
      return navigator.sendBeacon(TELEMETRY_ENDPOINT, payload);
    } catch (e) {
      return false;
    }
  }

  function sendWithFetchKeepAlive(payload) {
    if (!('fetch' in window)) return false;

    try {
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        body: payload,
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(function () {
        // Swallow errors; this is fire‑and‑forget
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function sendBatch(events, opts) {
    if (!events || events.length === 0) return;

    var payload = serializeBuffer(events);
    var size = getSizeInBytes(payload);
    if (size > MAX_BEACON_BYTES && (opts && opts.useBeacon)) {
      // If too big for one beacon on close, chunk it.
      chunkAndSend(events, opts);
      return;
    }

    if (opts && opts.useBeacon) {
      var ok = false;
      if (canUseSendBeacon()) {
        ok = sendWithBeacon(payload); // non‑blocking, fire‑and‑forget[web:12]
      }
      if (!ok) {
        sendWithFetchKeepAlive(payload); // fallback when beacon fails[web:6][web:50]
      }
    } else {
      // Normal background flush: regular fetch; you can handle response if needed.
      if (!('fetch' in window)) {
        // Old browsers: you may add XHR fallback here if required.
        return;
      }
      isSending = true;
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(function () {
        // Optionally requeue on failure.
      }).finally(function () {
        isSending = false;
      });
    }
  }

  function chunkAndSend(events, opts) {
    var start = 0;
    var len = events.length;

    while (start < len) {
      var chunk = [];
      var testPayload;
      do {
        chunk.push(events[start]);
        start++;
        testPayload = serializeBuffer(chunk);
      } while (
        start < len &&
        getSizeInBytes(testPayload) < MAX_BEACON_BYTES
      );

      sendBatch(chunk, opts);
    }
  }

  // ---- Buffer management ----

  function scheduleFlush() {
    if (flushTimer) return;
    var delay = Math.max(0, MAX_BATCH_INTERVAL_MS - (Date.now() - lastFlushTime));
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush(false);
    }, delay);
  }

  function flush(useBeacon) {
    if (buffer.length === 0) return;
    var eventsToSend = buffer.slice();
    buffer = [];
    lastFlushTime = Date.now();

    sendBatch(eventsToSend, { useBeacon: useBeacon });
  }

  // ---- Public API ----

  function logEvent(type, data) {
    var event = {
      type: type,
      data: data || {},
      time: Date.now()
    };

    buffer.push(event);

    // Flush when batch size threshold reached
    if (buffer.length >= MAX_EVENTS_PER_BATCH) {
      flush(false);
      return;
    }

    // Ensure time‑based flush is scheduled
    scheduleFlush();
  }

  function forceFlush() {
    flush(false);
  }

  // ---- Lifecycle wiring: visibilitychange + pagehide ----
  // Treat "hidden" as end‑of‑session and send remaining buffer via beacon.[web:12][web:22][web:46]

  function onPageHidden() {
    if (buffer.length === 0) return;
    // Avoid re‑entrancy issues
    var eventsToSend = buffer.slice();
    buffer = [];
    sendBatch(eventsToSend, { useBeacon: true });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        onPageHidden();
      }
    });

    // Extra coverage for some browsers.[web:43][web:46]
    window.addEventListener('pagehide', function () {
      onPageHidden();
    });
  }

  // ---- Export ----
  var Logger = {
    logEvent: logEvent,
    flush: forceFlush
  };

  // UMD‑ish export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
  } else {
    global.Logger = Logger;
  }
})(this);
