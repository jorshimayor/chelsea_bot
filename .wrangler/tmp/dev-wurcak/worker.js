var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// dist/worker.mjs
var __defProp2 = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var public_default = `<!doctype html>\r
<html lang="en">\r
  <head>\r
    <meta charset="utf-8" />\r
    <meta name="viewport" content="width=device-width, initial-scale=1" />\r
    <title>Chelsea Bot \u2014 Dashboard</title>\r
    <script src="https://cdn.tailwindcss.com"><\/script>\r
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"><\/script>\r
    <style>\r
      html,\r
      body {\r
        background: #03122f;\r
        color: #e6ecff;\r
      }\r
      .chip {\r
        background: #0a2a66;\r
        border: 1px solid #1d4ed8;\r
      }\r
      .card {\r
        background: #0a1a3d;\r
        border: 1px solid #1e3a8a;\r
      }\r
      .btn {\r
        background: #034694;\r
        border: 1px solid #3b82f6;\r
      }\r
      .btn:hover {\r
        background: #1d4ed8;\r
      }\r
      .muted {\r
        color: #9dbcf5;\r
      }\r
    </style>\r
  </head>\r
  <body class="min-h-screen">\r
    <main class="max-w-6xl mx-auto p-6 space-y-6">\r
      <header class="flex items-center justify-between">\r
        <div>\r
          <h1 class="text-3xl font-bold">Chelsea Bot \u{1F499}</h1>\r
          <p class="muted text-sm">\r
            BlueBanter TS \u2014 fixtures, stats, and tweet studio\r
          </p>\r
        </div>\r
        <div class="flex gap-2">\r
          <button id="refresh" class="btn rounded px-3 py-2 text-sm">\r
            Refresh\r
          </button>\r
        </div>\r
      </header>\r
\r
      <!-- Fixtures -->\r
      <section class="card rounded-xl p-4">\r
        <h2 class="text-xl font-semibold mb-3">Upcoming Fixtures</h2>\r
        <div id="fixtures" class="grid md:grid-cols-2 gap-3">\r
          <div class="muted">Loading\u2026</div>\r
        </div>\r
      </section>\r
\r
      <!-- Chart of last match -->\r
      <section class="card rounded-xl p-4">\r
        <h2 class="text-xl font-semibold mb-3">\r
          Last Match Stats\r
          <span id="lastOpp" class="muted text-sm font-normal"></span>\r
        </h2>\r
        <canvas id="statsChart" height="120"></canvas>\r
      </section>\r
\r
      <!-- Tweet studio -->\r
      <section class="card rounded-xl p-4 space-y-3">\r
        <h2 class="text-xl font-semibold">Tweet Studio</h2>\r
        <div class="grid md:grid-cols-3 gap-3">\r
          <label class="text-sm">\r
            Kind\r
            <select\r
              id="kind"\r
              class="w-full mt-1 rounded p-2 bg-[#0a2a66] border border-[#1d4ed8]"\r
            >\r
              <option value="match_preview">Match preview</option>\r
              <option value="live_update">Live update</option>\r
              <option value="post_match">Post-match</option>\r
              <option value="player_stat">Player stat</option>\r
              <option value="transfer_news">Transfer news</option>\r
              <option value="weekly_deep_dive">Weekly deep-dive</option>\r
            </select>\r
          </label>\r
          <label class="text-sm">\r
            Tone\r
            <select\r
              id="tone"\r
              class="w-full mt-1 rounded p-2 bg-[#0a2a66] border border-[#1d4ed8]"\r
            >\r
              <option value="professional">Professional</option>\r
              <option value="savage">Savage</option>\r
            </select>\r
          </label>\r
          <label class="text-sm">\r
            Data (JSON)\r
            <textarea\r
              id="data"\r
              rows="3"\r
              class="w-full mt-1 rounded p-2 bg-[#0a2a66] border border-[#1d4ed8] font-mono text-xs"\r
            >\r
{"opponent":"Arsenal","competition":"Premier League","date":"Sat 3 PM","venue":"Stamford Bridge"}</textarea>\r
          </label>\r
        </div>\r
        <div class="flex gap-2">\r
          <button id="generate" class="btn rounded px-3 py-2 text-sm">\r
            Generate\r
          </button>\r
          <button\r
            id="post"\r
            class="btn rounded px-3 py-2 text-sm"\r
            disabled\r
            title="Requires server-side OAuth + confirm=1"\r
          >\r
            Post to X\r
          </button>\r
        </div>\r
        <pre\r
          id="preview"\r
          class="whitespace-pre-wrap rounded p-3 bg-[#04183b] border border-[#1e3a8a] text-sm min-h-[4rem]"\r
        ></pre>\r
        <p id="meta" class="muted text-xs"></p>\r
      </section>\r
\r
      <!-- Recent posts -->\r
      <section class="card rounded-xl p-4">\r
        <h2 class="text-xl font-semibold mb-3">Recent Tweets (last 10)</h2>\r
        <ul id="posts" class="space-y-2 text-sm">\r
          <li class="muted">Loading\u2026</li>\r
        </ul>\r
      </section>\r
    </main>\r
\r
    <script>\r
      let chart;\r
\r
      async function load() {\r
        try {\r
          const res = await fetch("/api/dashboard");\r
          if (!res.ok) {\r
            document.getElementById("fixtures").innerHTML =\r
              '<div class="muted">Dashboard endpoint failed (' +\r
              res.status +\r
              ")</div>";\r
            return;\r
          }\r
          const d = await res.json();\r
          renderFixtures(d.upcoming || []);\r
          renderChart(d.lastFixture, d.lastStats);\r
          renderPosts(d.recentPosts || []);\r
        } catch (e) {\r
          document.getElementById("fixtures").innerHTML =\r
            '<div class="muted">Dashboard fetch error: ' + e.message + "</div>";\r
        }\r
      }\r
\r
      function renderFixtures(list) {\r
        const el = document.getElementById("fixtures");\r
        if (!list.length) {\r
          el.innerHTML = '<div class="muted">No upcoming fixtures.</div>';\r
          return;\r
        }\r
        el.innerHTML = list\r
          .map(function (f) {\r
            const when = new Date(f.date).toLocaleString("en-GB", {\r
              timeZone: "Africa/Lagos",\r
              weekday: "short",\r
              day: "numeric",\r
              month: "short",\r
              hour: "2-digit",\r
              minute: "2-digit",\r
            });\r
            const matchup = f.isChelseaHome\r
              ? "Chelsea vs " + f.opponent\r
              : f.opponent + " vs Chelsea";\r
            return (\r
              '<div class="chip rounded-lg p-3">' +\r
              '<div class="text-xs muted uppercase">' +\r
              escapeHtml(f.competition) +\r
              "</div>" +\r
              '<div class="font-semibold">' +\r
              escapeHtml(matchup) +\r
              "</div>" +\r
              '<div class="text-xs muted">' +\r
              when +\r
              " \u2014 " +\r
              escapeHtml(f.venue || "") +\r
              "</div>" +\r
              "</div>"\r
            );\r
          })\r
          .join("");\r
      }\r
\r
      function renderChart(fx, stats) {\r
        const ctx = document.getElementById("statsChart").getContext("2d");\r
        const oppEl = document.getElementById("lastOpp");\r
        if (!fx || !stats) {\r
          oppEl.textContent = "\u2014 no data";\r
          if (chart) chart.destroy();\r
          return;\r
        }\r
        oppEl.textContent =\r
          "(" + (fx.isChelseaHome ? "vs " : "@ ") + fx.opponent + ")";\r
        const labels = ["Possession %", "Shots", "On target", "xG", "Pass %"];\r
        const data = [\r
          stats.possession || 0,\r
          stats.shotsTotal || 0,\r
          stats.shotsOnTarget || 0,\r
          stats.xg || 0,\r
          stats.passAccuracy || 0,\r
        ];\r
        if (chart) chart.destroy();\r
        chart = new Chart(ctx, {\r
          type: "bar",\r
          data: {\r
            labels: labels,\r
            datasets: [\r
              {\r
                label: "Chelsea",\r
                data: data,\r
                backgroundColor: "rgba(59, 130, 246, 0.75)",\r
                borderColor: "#3b82f6",\r
                borderWidth: 1,\r
              },\r
            ],\r
          },\r
          options: {\r
            scales: { y: { beginAtZero: true, ticks: { color: "#9dbcf5" } } },\r
            plugins: { legend: { labels: { color: "#e6ecff" } } },\r
          },\r
        });\r
      }\r
\r
      function renderPosts(list) {\r
        const el = document.getElementById("posts");\r
        if (!list.length) {\r
          el.innerHTML = '<li class="muted">No posts yet.</li>';\r
          return;\r
        }\r
        el.innerHTML = list\r
          .map(function (p) {\r
            return (\r
              '<li class="chip rounded p-2">' +\r
              "<div>" +\r
              escapeHtml(p.content) +\r
              "</div>" +\r
              '<div class="muted text-xs mt-1">' +\r
              new Date(p.createdAt).toLocaleString() +\r
              " \u2014 " +\r
              escapeHtml(p.modelUsed || "n/a") +\r
              "</div>" +\r
              "</li>"\r
            );\r
          })\r
          .join("");\r
      }\r
\r
      function escapeHtml(s) {\r
        const map = {\r
          "&": "&amp;",\r
          "<": "&lt;",\r
          ">": "&gt;",\r
          '"': "&quot;",\r
          "'": "&#39;",\r
        };\r
        return String(s).replace(/[&<>"']/g, function (c) {\r
          return map[c];\r
        });\r
      }\r
\r
      document.getElementById("refresh").addEventListener("click", load);\r
\r
      document\r
        .getElementById("generate")\r
        .addEventListener("click", async function () {\r
          const kind = document.getElementById("kind").value;\r
          const tone = document.getElementById("tone").value;\r
          let data = {};\r
          try {\r
            data = JSON.parse(document.getElementById("data").value || "{}");\r
          } catch (e) {\r
            document.getElementById("preview").textContent =\r
              "Invalid JSON in the data field.";\r
            return;\r
          }\r
          document.getElementById("preview").textContent = "Generating\u2026";\r
          document.getElementById("meta").textContent = "";\r
          try {\r
            const res = await fetch("/api/generate-tweet", {\r
              method: "POST",\r
              headers: { "Content-Type": "application/json" },\r
              body: JSON.stringify({ kind: kind, tone: tone, data: data }),\r
            });\r
            const j = await res.json();\r
            document.getElementById("preview").textContent =\r
              j.tweet || j.error || "(empty)";\r
            document.getElementById("meta").textContent =\r
              "model=" +\r
              (j.model || "n/a") +\r
              " \u2022 length=" +\r
              (j.length || 0) +\r
              "/280";\r
            document.getElementById("post").disabled = !j.tweet;\r
          } catch (e) {\r
            document.getElementById("preview").textContent =\r
              "Error: " + e.message;\r
          }\r
        });\r
\r
      document\r
        .getElementById("post")\r
        .addEventListener("click", async function () {\r
          const text = document.getElementById("preview").textContent;\r
          if (!text) return;\r
          const url =\r
            "/api/x/publish?confirm=1&text=" + encodeURIComponent(text);\r
          const res = await fetch(url);\r
          const j = await res.json().catch(function () {\r
            return {};\r
          });\r
          document.getElementById("meta").textContent =\r
            "posted id=" + (j.id || "(none)");\r
        });\r
\r
      load();\r
    <\/script>\r
  </body>\r
</html>\r
`;
var default_format = "RFC3986";
var formatters = {
  RFC1738: /* @__PURE__ */ __name((v2) => String(v2).replace(/%20/g, "+"), "RFC1738"),
  RFC3986: /* @__PURE__ */ __name((v2) => String(v2), "RFC3986")
};
var RFC1738 = "RFC1738";
var is_array = Array.isArray;
var hex_table = (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
var limit = 1024;
var encode = /* @__PURE__ */ __name((str2, _defaultEncoder, charset, _kind, format) => {
  if (str2.length === 0) {
    return str2;
  }
  let string = str2;
  if (typeof str2 === "symbol") {
    string = Symbol.prototype.toString.call(str2);
  } else if (typeof str2 !== "string") {
    string = String(str2);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || // -
      c === 46 || // .
      c === 95 || // _
      c === 126 || // ~
      c >= 48 && c <= 57 || // 0-9
      c >= 65 && c <= 90 || // a-z
      c >= 97 && c <= 122 || // A-Z
      format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
}, "encode");
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
__name(is_buffer, "is_buffer");
function maybe_map(val, fn) {
  if (is_array(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}
__name(maybe_map, "maybe_map");
var has = Object.prototype.hasOwnProperty;
var array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
var is_array2 = Array.isArray;
var push = Array.prototype.push;
var push_to_array = /* @__PURE__ */ __name(function(arr, value_or_array) {
  push.apply(arr, is_array2(value_or_array) ? value_or_array : [value_or_array]);
}, "push_to_array");
var to_ISO = Date.prototype.toISOString;
var defaults = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: formatters[default_format],
  /** @deprecated */
  indices: false,
  serializeDate(date2) {
    return to_ISO.call(date2);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v2) {
  return typeof v2 === "string" || typeof v2 === "number" || typeof v2 === "boolean" || typeof v2 === "symbol" || typeof v2 === "bigint";
}
__name(is_non_nullish_primitive, "is_non_nullish_primitive");
var sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && is_array2(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
      return [
        formatter?.(key_value) + "=" + // @ts-expect-error
        formatter?.(encoder(obj, defaults.encoder, charset, "value", format))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && is_array2(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (is_array2(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && is_array2(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && is_array2(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = is_array2(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && is_array2(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
__name(inner_stringify, "inner_stringify");
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has.call(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || is_array2(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
__name(normalize_stringify_options, "normalize_stringify_options");
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (is_array2(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}
__name(stringify, "stringify");
var VERSION = "4.104.0";
var auto = false;
var kind = void 0;
var fetch2 = void 0;
var Request2 = void 0;
var Response2 = void 0;
var Headers2 = void 0;
var FormData2 = void 0;
var Blob2 = void 0;
var File2 = void 0;
var ReadableStream2 = void 0;
var getMultipartRequestOptions = void 0;
var getDefaultAgent = void 0;
var fileFromPath = void 0;
var isFsReadStream = void 0;
function setShims(shims, options = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import 'openai/shims/${shims.kind}'\` before importing anything else from openai`);
  }
  if (kind) {
    throw new Error(`can't \`import 'openai/shims/${shims.kind}'\` after \`import 'openai/shims/${kind}'\``);
  }
  auto = options.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}
__name(setShims, "setShims");
var MultipartBody = class {
  static {
    __name(this, "MultipartBody");
  }
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
};
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from 'openai'\`:
- \`import 'openai/shims/node'\` (if you're running on Node)
- \`import 'openai/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: (
      // @ts-ignore
      typeof FormData !== "undefined" ? FormData : class FormData {
        static {
          __name(this, "FormData");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
        }
      }
    ),
    Blob: typeof Blob !== "undefined" ? Blob : class Blob {
      static {
        __name(this, "Blob");
      }
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: (
      // @ts-ignore
      typeof File !== "undefined" ? File : class File {
        static {
          __name(this, "File");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
        }
      }
    ),
    ReadableStream: (
      // @ts-ignore
      typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream {
        static {
          __name(this, "ReadableStream");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
        }
      }
    ),
    getMultipartRequestOptions: /* @__PURE__ */ __name(async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }), "getMultipartRequestOptions"),
    getDefaultAgent: /* @__PURE__ */ __name((url) => void 0, "getDefaultAgent"),
    fileFromPath: /* @__PURE__ */ __name(() => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/openai/openai-node#file-uploads");
    }, "fileFromPath"),
    isFsReadStream: /* @__PURE__ */ __name((value) => false, "isFsReadStream")
  };
}
__name(getRuntime, "getRuntime");
var init = /* @__PURE__ */ __name(() => {
  if (!kind) setShims(getRuntime(), { auto: true });
}, "init");
init();
var OpenAIError = class extends Error {
  static {
    __name(this, "OpenAIError");
  }
};
var APIError = class _APIError extends OpenAIError {
  static {
    __name(this, "_APIError");
  }
  constructor(status, error, message, headers) {
    super(`${_APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.request_id = headers?.["x-request-id"];
    this.error = error;
    const data = error;
    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse?.["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new _APIError(status, error, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  static {
    __name(this, "APIUserAbortError");
  }
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  static {
    __name(this, "APIConnectionError");
  }
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  static {
    __name(this, "APIConnectionTimeoutError");
  }
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
  static {
    __name(this, "BadRequestError");
  }
};
var AuthenticationError = class extends APIError {
  static {
    __name(this, "AuthenticationError");
  }
};
var PermissionDeniedError = class extends APIError {
  static {
    __name(this, "PermissionDeniedError");
  }
};
var NotFoundError = class extends APIError {
  static {
    __name(this, "NotFoundError");
  }
};
var ConflictError = class extends APIError {
  static {
    __name(this, "ConflictError");
  }
};
var UnprocessableEntityError = class extends APIError {
  static {
    __name(this, "UnprocessableEntityError");
  }
};
var RateLimitError = class extends APIError {
  static {
    __name(this, "RateLimitError");
  }
};
var InternalServerError = class extends APIError {
  static {
    __name(this, "InternalServerError");
  }
};
var LengthFinishReasonError = class extends OpenAIError {
  static {
    __name(this, "LengthFinishReasonError");
  }
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
};
var ContentFilterFinishReasonError = class extends OpenAIError {
  static {
    __name(this, "ContentFilterFinishReasonError");
  }
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
};
var __classPrivateFieldSet = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet");
var __classPrivateFieldGet = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet");
var _LineDecoder_carriageReturnIndex;
var LineDecoder = class {
  static {
    __name(this, "LineDecoder");
  }
  constructor() {
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    this.buffer = new Uint8Array();
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(this.buffer.length + binaryChunk.length);
    newData.set(this.buffer);
    newData.set(binaryChunk, this.buffer.length);
    this.buffer = newData;
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(this.buffer, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(this.decodeText(this.buffer.slice(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        this.buffer = this.buffer.slice(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"));
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line2 = this.decodeText(this.buffer.slice(0, endIndex));
      lines.push(line2);
      this.buffer = this.buffer.slice(patternIndex.index);
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new OpenAIError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length) {
      return [];
    }
    return this.decode("\n");
  }
};
_LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
__name(findNewlineIndex, "findNewlineIndex");
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
__name(findDoubleNewlineIndex, "findDoubleNewlineIndex");
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
__name(ReadableStreamToAsyncIterable, "ReadableStreamToAsyncIterable");
var Stream = class _Stream {
  static {
    __name(this, "_Stream");
  }
  constructor(iterator, controller) {
    this.iterator = iterator;
    this.controller = controller;
  }
  static fromSSEResponse(response, controller) {
    let consumed = false;
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null || sse.event.startsWith("response.") || sse.event.startsWith("transcript.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, createResponseHeaders(response.headers));
            }
            yield data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (sse.event == "error") {
              throw new APIError(void 0, data.error, data.message, void 0);
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line2 of lineDecoder.decode(chunk)) {
          yield line2;
        }
      }
      for (const line2 of lineDecoder.flush()) {
        yield line2;
      }
    }
    __name(iterLines, "iterLines");
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line2 of iterLines()) {
          if (done)
            continue;
          if (line2)
            yield JSON.parse(line2);
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = /* @__PURE__ */ __name((queue) => {
      return {
        next: /* @__PURE__ */ __name(() => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }, "next")
      };
    }, "teeIterator");
    return [
      new _Stream(() => teeIterator(left), this.controller),
      new _Stream(() => teeIterator(right), this.controller)
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self = this;
    let iter;
    const encoder = new TextEncoder();
    return new ReadableStream2({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
};
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line2 of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line2);
      if (sse)
        yield sse;
    }
  }
  for (const line2 of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line2);
    if (sse)
      yield sse;
  }
}
__name(_iterSSEMessages, "_iterSSEMessages");
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
__name(iterSSEChunks, "iterSSEChunks");
var SSEDecoder = class {
  static {
    __name(this, "SSEDecoder");
  }
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line2) {
    if (line2.endsWith("\r")) {
      line2 = line2.substring(0, line2.length - 1);
    }
    if (!line2) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line2);
    if (line2.startsWith(":")) {
      return null;
    }
    let [fieldname, _2, value] = partition(line2, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str2, delimiter) {
  const index2 = str2.indexOf(delimiter);
  if (index2 !== -1) {
    return [str2.substring(0, index2), delimiter, str2.substring(index2 + delimiter.length)];
  }
  return [str2, "", ""];
}
__name(partition, "partition");
var isResponseLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", "isResponseLike");
var isFileLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value), "isFileLike");
var isBlobLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", "isBlobLike");
var isUploadable = /* @__PURE__ */ __name((value) => {
  return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
}, "isUploadable");
async function toFile(value, name, options) {
  value = await value;
  if (isFileLike(value)) {
    return value;
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File2(data, name, options);
  }
  const bits = await getBytes(value);
  name || (name = getName(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File2(bits, name, options);
}
__name(toFile, "toFile");
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
__name(getBytes, "getBytes");
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p2) => `"${p2}"`).join(", ")}]`;
}
__name(propsForError, "propsForError");
function getName(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || // For fs.ReadStream
  getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
}
__name(getName, "getName");
var getStringFromMaybeBuffer = /* @__PURE__ */ __name((x2) => {
  if (typeof x2 === "string")
    return x2;
  if (typeof Buffer !== "undefined" && x2 instanceof Buffer)
    return String(x2);
  return void 0;
}, "getStringFromMaybeBuffer");
var isAsyncIterableIterator = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", "isAsyncIterableIterator");
var isMultipartBody = /* @__PURE__ */ __name((body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody", "isMultipartBody");
var multipartFormRequestOptions = /* @__PURE__ */ __name(async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
}, "multipartFormRequestOptions");
var createForm = /* @__PURE__ */ __name(async (body) => {
  const form = new FormData2();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
}, "createForm");
var addFormValue = /* @__PURE__ */ __name(async (form, key, value) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
}, "addFormValue");
var __classPrivateFieldSet2 = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet2");
var __classPrivateFieldGet2 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet2");
var _AbstractPage_client;
init();
async function defaultParseResponse(props) {
  const { response } = props;
  if (props.options.stream) {
    debug("response", response.status, response.url, response.headers, response.body);
    if (props.options.__streamClass) {
      return props.options.__streamClass.fromSSEResponse(response, props.controller);
    }
    return Stream.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const mediaType = contentType?.split(";")[0]?.trim();
  const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
  if (isJSON) {
    const json6 = await response.json();
    debug("response", response.status, response.url, response.headers, json6);
    return _addRequestID(json6, response);
  }
  const text2 = await response.text();
  debug("response", response.status, response.url, response.headers, text2);
  return text2;
}
__name(defaultParseResponse, "defaultParseResponse");
function _addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
__name(_addRequestID, "_addRequestID");
var APIPromise = class _APIPromise extends Promise {
  static {
    __name(this, "_APIPromise");
  }
  constructor(responsePromise, parseResponse3 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse3;
  }
  _thenUnwrap(transform2) {
    return new _APIPromise(this.responsePromise, async (props) => _addRequestID(transform2(await this.parseResponse(props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  asResponse() {
    return this.responsePromise.then((p2) => p2.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
var APIClient = class {
  static {
    __name(this, "APIClient");
  }
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 6e5,
    // 10 minutes
    httpAgent,
    fetch: overriddenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overriddenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  /**
   * Override this to add your own default headers, for example:
   *
   *  {
   *    ...super.defaultHeaders(),
   *    Authorization: 'Bearer 123',
   *  }
   */
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  /**
   * Override this to add your own headers validation:
   */
  validateHeaders(headers, customHeaders) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page2, opts) {
    return this.requestAPIList(Page2, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = options.timeout + 1e3;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!inputOptions.idempotencyKey)
        inputOptions.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = inputOptions.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength, retryCount });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      // @ts-ignore node-fetch uses a custom AbortSignal type that is
      // not compatible with standard web types
      signal: options.signal ?? null
    };
    return { req, url, timeout: options.timeout };
  }
  buildHeaders({ options, headers, contentLength, retryCount }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);
    if (isMultipartBody(options.body) && kind !== "node") {
      delete reqHeaders["content-type"];
    }
    if (getHeader(defaultHeaders, "x-stainless-retry-count") === void 0 && getHeader(headers, "x-stainless-retry-count") === void 0) {
      reqHeaders["x-stainless-retry-count"] = String(retryCount);
    }
    if (getHeader(defaultHeaders, "x-stainless-timeout") === void 0 && getHeader(headers, "x-stainless-timeout") === void 0 && options.timeout) {
      reqHeaders["x-stainless-timeout"] = String(Math.trunc(options.timeout / 1e3));
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  parseHeaders(headers) {
    return !headers ? {} : Symbol.iterator in headers ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
    await this.prepareRequest(req, { url, options });
    debug("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError(e).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise(this, request, Page2);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_2, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new OpenAIError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init2, ms2, controller) {
    const { signal, ...options } = init2 || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms2);
    const fetchOptions = {
      signal: controller.signal,
      ...options
    };
    if (fetchOptions.method) {
      fetchOptions.method = fetchOptions.method.toUpperCase();
    }
    return (
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      this.fetch.call(void 0, url, fetchOptions).finally(() => {
        clearTimeout(timeout);
      })
    );
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
};
var AbstractPage = class {
  static {
    __name(this, "AbstractPage");
  }
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet2(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageInfo() != null;
  }
  async getNextPage() {
    const nextInfo = this.nextPageInfo();
    if (!nextInfo) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    const nextOptions = { ...this.options };
    if ("params" in nextInfo && typeof nextOptions.query === "object") {
      nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
    } else if ("url" in nextInfo) {
      const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
      for (const [key, value] of params) {
        nextInfo.url.searchParams.set(key, value);
      }
      nextOptions.query = void 0;
      nextOptions.path = nextInfo.url.toString();
    }
    return await __classPrivateFieldGet2(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
};
var PagePromise = class extends APIPromise {
  static {
    __name(this, "PagePromise");
  }
  constructor(client, request, Page2) {
    super(request, async (props) => new Page2(client, props.response, await defaultParseResponse(props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
};
var createResponseHeaders = /* @__PURE__ */ __name((headers) => {
  return new Proxy(Object.fromEntries(
    // @ts-ignore
    headers.entries()
  ), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
}, "createResponseHeaders");
var requestOptionsKeys = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,
  maxRetries: true,
  stream: true,
  timeout: true,
  httpAgent: true,
  signal: true,
  idempotencyKey: true,
  __metadata: true,
  __binaryRequest: true,
  __binaryResponse: true,
  __streamClass: true
};
var isRequestOptions = /* @__PURE__ */ __name((obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k) => hasOwn(requestOptionsKeys, k));
}, "isRequestOptions");
var getPlatformProperties = /* @__PURE__ */ __name(() => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, "getPlatformProperties");
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec("Cloudflare-Workers");
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
__name(getBrowserInfo, "getBrowserInfo");
var normalizeArch = /* @__PURE__ */ __name((arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
}, "normalizeArch");
var normalizePlatform = /* @__PURE__ */ __name((platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
}, "normalizePlatform");
var _platformHeaders;
var getPlatformHeaders = /* @__PURE__ */ __name(() => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
}, "getPlatformHeaders");
var safeJSON = /* @__PURE__ */ __name((text2) => {
  try {
    return JSON.parse(text2);
  } catch (err) {
    return void 0;
  }
}, "safeJSON");
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = /* @__PURE__ */ __name((url) => {
  return startsWithSchemeRegexp.test(url);
}, "isAbsoluteURL");
var sleep = /* @__PURE__ */ __name((ms2) => new Promise((resolve) => setTimeout(resolve, ms2)), "sleep");
var validatePositiveInteger = /* @__PURE__ */ __name((name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
}, "validatePositiveInteger");
var castToError = /* @__PURE__ */ __name((err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
}, "castToError");
var readEnv = /* @__PURE__ */ __name((env2) => {
  if (typeof process !== "undefined") {
    return process.env?.[env2]?.trim() ?? void 0;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env2)?.trim();
  }
  return void 0;
}, "readEnv");
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
__name(isEmptyObj, "isEmptyObj");
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
__name(hasOwn, "hasOwn");
function applyHeadersMut(targetHeaders, newHeaders) {
  for (const k in newHeaders) {
    if (!hasOwn(newHeaders, k))
      continue;
    const lowerKey = k.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== void 0) {
      targetHeaders[lowerKey] = val;
    }
  }
}
__name(applyHeadersMut, "applyHeadersMut");
var SENSITIVE_HEADERS = /* @__PURE__ */ new Set(["authorization", "api-key"]);
function debug(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    const modifiedArgs = args.map((arg) => {
      if (!arg) {
        return arg;
      }
      if (arg["headers"]) {
        const modifiedArg2 = { ...arg, headers: { ...arg["headers"] } };
        for (const header in arg["headers"]) {
          if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
            modifiedArg2["headers"][header] = "REDACTED";
          }
        }
        return modifiedArg2;
      }
      let modifiedArg = null;
      for (const header in arg) {
        if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
          modifiedArg ?? (modifiedArg = { ...arg });
          modifiedArg[header] = "REDACTED";
        }
      }
      return modifiedArg ?? arg;
    });
    console.log(`OpenAI:DEBUG:${action}`, ...modifiedArgs);
  }
}
__name(debug, "debug");
var uuid4 = /* @__PURE__ */ __name(() => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v2 = c === "x" ? r : r & 3 | 8;
    return v2.toString(16);
  });
}, "uuid4");
var isRunningInBrowser = /* @__PURE__ */ __name(() => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
}, "isRunningInBrowser");
var isHeadersProtocol = /* @__PURE__ */ __name((headers) => {
  return typeof headers?.get === "function";
}, "isHeadersProtocol");
var getHeader = /* @__PURE__ */ __name((headers, header) => {
  const lowerCasedHeader = header.toLowerCase();
  if (isHeadersProtocol(headers)) {
    const intercapsHeader = header[0]?.toUpperCase() + header.substring(1).replace(/([^\w])(\w)/g, (_m, g1, g2) => g1 + g2.toUpperCase());
    for (const key of [header, lowerCasedHeader, header.toUpperCase(), intercapsHeader]) {
      const value = headers.get(key);
      if (value) {
        return value;
      }
    }
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerCasedHeader) {
      if (Array.isArray(value)) {
        if (value.length <= 1)
          return value[0];
        console.warn(`Received ${value.length} entries for the ${header} header, using the first entry.`);
        return value[0];
      }
      return value;
    }
  }
  return void 0;
}, "getHeader");
var toFloat32Array = /* @__PURE__ */ __name((base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
}, "toFloat32Array");
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
__name(isObj, "isObj");
var Page = class extends AbstractPage {
  static {
    __name(this, "Page");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  // @deprecated Please use `nextPageInfo()` instead
  /**
   * This page represents a response that isn't actually paginated at the API level
   * so there will never be any next page params.
   */
  nextPageParams() {
    return null;
  }
  nextPageInfo() {
    return null;
  }
};
var CursorPage = class extends AbstractPage {
  static {
    __name(this, "CursorPage");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams() {
    const info = this.nextPageInfo();
    if (!info)
      return null;
    if ("params" in info)
      return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length)
      return null;
    return params;
  }
  nextPageInfo() {
    const data = this.getPaginatedItems();
    if (!data.length) {
      return null;
    }
    const id = data[data.length - 1]?.id;
    if (!id) {
      return null;
    }
    return { params: { after: id } };
  }
};
var APIResource = class {
  static {
    __name(this, "APIResource");
  }
  constructor(client) {
    this._client = client;
  }
};
var Messages = class extends APIResource {
  static {
    __name(this, "Messages");
  }
  list(completionId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(completionId, {}, query);
    }
    return this._client.getAPIList(`/chat/completions/${completionId}/messages`, ChatCompletionStoreMessagesPage, { query, ...options });
  }
};
var Completions = class extends APIResource {
  static {
    __name(this, "Completions");
  }
  constructor() {
    super(...arguments);
    this.messages = new Messages(this._client);
  }
  create(body, options) {
    return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(completionId, options) {
    return this._client.get(`/chat/completions/${completionId}`, options);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(completionId, body, options) {
    return this._client.post(`/chat/completions/${completionId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/chat/completions", ChatCompletionsPage, { query, ...options });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.del('completion_id');
   * ```
   */
  del(completionId, options) {
    return this._client.delete(`/chat/completions/${completionId}`, options);
  }
};
var ChatCompletionsPage = class extends CursorPage {
  static {
    __name(this, "ChatCompletionsPage");
  }
};
var ChatCompletionStoreMessagesPage = class extends CursorPage {
  static {
    __name(this, "ChatCompletionStoreMessagesPage");
  }
};
Completions.ChatCompletionsPage = ChatCompletionsPage;
Completions.Messages = Messages;
var Chat = class extends APIResource {
  static {
    __name(this, "Chat");
  }
  constructor() {
    super(...arguments);
    this.completions = new Completions(this._client);
  }
};
Chat.Completions = Completions;
Chat.ChatCompletionsPage = ChatCompletionsPage;
var Speech = class extends APIResource {
  static {
    __name(this, "Speech");
  }
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(body, options) {
    return this._client.post("/audio/speech", {
      body,
      ...options,
      headers: { Accept: "application/octet-stream", ...options?.headers },
      __binaryResponse: true
    });
  }
};
var Transcriptions = class extends APIResource {
  static {
    __name(this, "Transcriptions");
  }
  create(body, options) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options,
      stream: body.stream ?? false,
      __metadata: { model: body.model }
    }));
  }
};
var Translations = class extends APIResource {
  static {
    __name(this, "Translations");
  }
  create(body, options) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }));
  }
};
var Audio = class extends APIResource {
  static {
    __name(this, "Audio");
  }
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
};
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;
var Batches = class extends APIResource {
  static {
    __name(this, "Batches");
  }
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options) {
    return this._client.post("/batches", { body, ...options });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchId, options) {
    return this._client.get(`/batches/${batchId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/batches", BatchesPage, { query, ...options });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchId, options) {
    return this._client.post(`/batches/${batchId}/cancel`, options);
  }
};
var BatchesPage = class extends CursorPage {
  static {
    __name(this, "BatchesPage");
  }
};
Batches.BatchesPage = BatchesPage;
var __classPrivateFieldSet3 = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet3");
var __classPrivateFieldGet3 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet3");
var _EventStream_instances;
var _EventStream_connectedPromise;
var _EventStream_resolveConnectedPromise;
var _EventStream_rejectConnectedPromise;
var _EventStream_endPromise;
var _EventStream_resolveEndPromise;
var _EventStream_rejectEndPromise;
var _EventStream_listeners;
var _EventStream_ended;
var _EventStream_errored;
var _EventStream_aborted;
var _EventStream_catchingPromiseCreated;
var _EventStream_handleError;
var EventStream = class {
  static {
    __name(this, "EventStream");
  }
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => {
    });
    _EventStream_rejectConnectedPromise.set(this, () => {
    });
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => {
    });
    _EventStream_rejectEndPromise.set(this, () => {
    });
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet3(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet3(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet3(this, _EventStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet3(this, _EventStream_endPromise, "f").catch(() => {
    });
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet3(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet3(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet3(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet3(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet3(this, _EventStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index2 = listeners.findIndex((l) => l.listener === listener);
    if (index2 >= 0)
      listeners.splice(index2, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet3(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet3(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet3(this, _EventStream_ended, true, "f");
      __classPrivateFieldGet3(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
  }
};
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = /* @__PURE__ */ __name(function _EventStream_handleError2(error) {
  __classPrivateFieldSet3(this, _EventStream_errored, true, "f");
  if (error instanceof Error && error.name === "AbortError") {
    error = new APIUserAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet3(this, _EventStream_aborted, true, "f");
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
}, "_EventStream_handleError2");
var __classPrivateFieldGet4 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet4");
var __classPrivateFieldSet4 = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet4");
var _AssistantStream_instances;
var _AssistantStream_events;
var _AssistantStream_runStepSnapshots;
var _AssistantStream_messageSnapshots;
var _AssistantStream_messageSnapshot;
var _AssistantStream_finalRun;
var _AssistantStream_currentContentIndex;
var _AssistantStream_currentContent;
var _AssistantStream_currentToolCallIndex;
var _AssistantStream_currentToolCall;
var _AssistantStream_currentEvent;
var _AssistantStream_currentRunSnapshot;
var _AssistantStream_currentRunStepSnapshot;
var _AssistantStream_addEvent;
var _AssistantStream_endRequest;
var _AssistantStream_handleMessage;
var _AssistantStream_handleRunStep;
var _AssistantStream_handleEvent;
var _AssistantStream_accumulateRunStep;
var _AssistantStream_accumulateMessage;
var _AssistantStream_accumulateContent;
var _AssistantStream_handleRun;
var AssistantStream = class _AssistantStream extends EventStream {
  static {
    __name(this, "_AssistantStream");
  }
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_events.set(this, []);
    _AssistantStream_runStepSnapshots.set(this, {});
    _AssistantStream_messageSnapshots.set(this, {});
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  static fromReadableStream(stream) {
    const runner = new _AssistantStream();
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
  static createToolAssistantStream(threadId, runId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runToolAssistantStream(threadId, runId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, threadId, runId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.submitToolOutputs(threadId, runId, body, {
      ...options,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static createThreadAssistantStream(params, thread, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  static createAssistantStream(threadId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  currentEvent() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentEvent, "f");
  }
  currentRun() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunSnapshot, "f");
  }
  currentMessageSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f");
  }
  currentRunStepSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f"));
  }
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f"));
  }
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run was not received.");
    return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static accumulateDelta(acc, delta) {
    for (const [key, deltaValue] of Object.entries(delta)) {
      if (!acc.hasOwnProperty(key)) {
        acc[key] = deltaValue;
        continue;
      }
      let accValue = acc[key];
      if (accValue === null || accValue === void 0) {
        acc[key] = deltaValue;
        continue;
      }
      if (key === "index" || key === "type") {
        acc[key] = deltaValue;
        continue;
      }
      if (typeof accValue === "string" && typeof deltaValue === "string") {
        accValue += deltaValue;
      } else if (typeof accValue === "number" && typeof deltaValue === "number") {
        accValue += deltaValue;
      } else if (isObj(accValue) && isObj(deltaValue)) {
        accValue = this.accumulateDelta(accValue, deltaValue);
      } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
        if (accValue.every((x2) => typeof x2 === "string" || typeof x2 === "number")) {
          accValue.push(...deltaValue);
          continue;
        }
        for (const deltaEntry of deltaValue) {
          if (!isObj(deltaEntry)) {
            throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
          }
          const index2 = deltaEntry["index"];
          if (index2 == null) {
            console.error(deltaEntry);
            throw new Error("Expected array delta entry to have an `index` property");
          }
          if (typeof index2 !== "number") {
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index2}`);
          }
          const accEntry = accValue[index2];
          if (accEntry == null) {
            accValue.push(deltaEntry);
          } else {
            accValue[index2] = this.accumulateDelta(accEntry, deltaEntry);
          }
        }
        continue;
      } else {
        throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
      }
      acc[key] = accValue;
    }
    return acc;
  }
  _addRun(run) {
    return run;
  }
  async _threadAssistantStream(params, thread, options) {
    return await this._createThreadAssistantStream(thread, params, options);
  }
  async _runAssistantStream(threadId, runs, params, options) {
    return await this._createAssistantStream(runs, threadId, params, options);
  }
  async _runToolAssistantStream(threadId, runId, runs, params, options) {
    return await this._createToolAssistantStream(runs, threadId, runId, params, options);
  }
};
_AssistantStream_addEvent = /* @__PURE__ */ __name(function _AssistantStream_addEvent2(event) {
  if (this.ended)
    return;
  __classPrivateFieldSet4(this, _AssistantStream_currentEvent, event, "f");
  __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
  switch (event.event) {
    case "thread.created":
      break;
    case "thread.run.created":
    case "thread.run.queued":
    case "thread.run.in_progress":
    case "thread.run.requires_action":
    case "thread.run.completed":
    case "thread.run.incomplete":
    case "thread.run.failed":
    case "thread.run.cancelling":
    case "thread.run.cancelled":
    case "thread.run.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
      break;
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
      break;
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
      break;
    case "error":
      throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    default:
      assertNever(event);
  }
}, "_AssistantStream_addEvent2"), _AssistantStream_endRequest = /* @__PURE__ */ __name(function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
    throw Error("Final run has not been received");
  return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
}, "_AssistantStream_endRequest2"), _AssistantStream_handleMessage = /* @__PURE__ */ __name(function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
  __classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if (snapshotContent?.type == "text") {
      this._emit("textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created":
      this._emit("messageCreated", event.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      this._emit("messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type == "text" && content.text) {
            let textDelta = content.text;
            let snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type == "text") {
              this._emit("textDelta", textDelta, snapshot.text);
            } else {
              throw Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index != __classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").type) {
                case "text":
                  this._emit("textDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentContentIndex, content.index, "f");
          }
          __classPrivateFieldSet4(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
        }
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file":
              this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
            case "text":
              this._emit("textDone", currentContent.text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
          }
        }
      }
      if (__classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f")) {
        this._emit("messageDone", event.data);
      }
      __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, void 0, "f");
  }
}, "_AssistantStream_handleMessage2"), _AssistantStream_handleRunStep = /* @__PURE__ */ __name(function _AssistantStream_handleRunStep2(event) {
  const accumulatedRunStep = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
  __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
  switch (event.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", event.data);
      break;
    case "thread.run.step.delta":
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index == __classPrivateFieldGet4(this, _AssistantStream_currentToolCallIndex, "f")) {
            this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"))
              this._emit("toolCallCreated", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          }
        }
      }
      this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, void 0, "f");
      const details = event.data.step_details;
      if (details.type == "tool_calls") {
        if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
        }
      }
      this._emit("runStepDone", event.data, accumulatedRunStep);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, "_AssistantStream_handleRunStep2"), _AssistantStream_handleEvent = /* @__PURE__ */ __name(function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet4(this, _AssistantStream_events, "f").push(event);
  this._emit("event", event);
}, "_AssistantStream_handleEvent2"), _AssistantStream_accumulateRunStep = /* @__PURE__ */ __name(function _AssistantStream_accumulateRunStep2(event) {
  switch (event.event) {
    case "thread.run.step.created":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      return event.data;
    case "thread.run.step.delta":
      let snapshot = __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      if (!snapshot) {
        throw Error("Received a RunStepDelta before creation of a snapshot");
      }
      let data = event.data;
      if (data.delta) {
        const accumulated = AssistantStream.accumulateDelta(snapshot, data.delta);
        __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
      }
      return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      break;
  }
  if (__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
    return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
  throw new Error("No snapshot available");
}, "_AssistantStream_accumulateRunStep2"), _AssistantStream_accumulateMessage = /* @__PURE__ */ __name(function _AssistantStream_accumulateMessage2(event, snapshot) {
  let newContent = [];
  switch (event.event) {
    case "thread.message.created":
      return [event.data, newContent];
    case "thread.message.delta":
      if (!snapshot) {
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      let data = event.data;
      if (data.delta.content) {
        for (const contentElement of data.delta.content) {
          if (contentElement.index in snapshot.content) {
            let currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
          } else {
            snapshot.content[contentElement.index] = contentElement;
            newContent.push(contentElement);
          }
        }
      }
      return [snapshot, newContent];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (snapshot) {
        return [snapshot, newContent];
      } else {
        throw Error("Received thread message event with no existing snapshot");
      }
  }
  throw Error("Tried to accumulate a non-message event");
}, "_AssistantStream_accumulateMessage2"), _AssistantStream_accumulateContent = /* @__PURE__ */ __name(function _AssistantStream_accumulateContent2(contentElement, currentContent) {
  return AssistantStream.accumulateDelta(currentContent, contentElement);
}, "_AssistantStream_accumulateContent2"), _AssistantStream_handleRun = /* @__PURE__ */ __name(function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet4(this, _AssistantStream_currentRunSnapshot, event.data, "f");
  switch (event.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
      __classPrivateFieldSet4(this, _AssistantStream_finalRun, event.data, "f");
      if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
        this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
        __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
      }
      break;
    case "thread.run.cancelling":
      break;
  }
}, "_AssistantStream_handleRun2");
function assertNever(_x) {
}
__name(assertNever, "assertNever");
var Assistants = class extends APIResource {
  static {
    __name(this, "Assistants");
  }
  /**
   * Create an assistant with a model and instructions.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.create({
   *   model: 'gpt-4o',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/assistants", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.retrieve(
   *   'assistant_id',
   * );
   * ```
   */
  retrieve(assistantId, options) {
    return this._client.get(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.update(
   *   'assistant_id',
   * );
   * ```
   */
  update(assistantId, body, options) {
    return this._client.post(`/assistants/${assistantId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/assistants", AssistantsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete an assistant.
   *
   * @example
   * ```ts
   * const assistantDeleted = await client.beta.assistants.del(
   *   'assistant_id',
   * );
   * ```
   */
  del(assistantId, options) {
    return this._client.delete(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var AssistantsPage = class extends CursorPage {
  static {
    __name(this, "AssistantsPage");
  }
};
Assistants.AssistantsPage = AssistantsPage;
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}
__name(isRunnableFunctionWithParse, "isRunnableFunctionWithParse");
var isAssistantMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "assistant";
}, "isAssistantMessage");
var isFunctionMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "function";
}, "isFunctionMessage");
var isToolMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "tool";
}, "isToolMessage");
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
__name(isAutoParsableResponseFormat, "isAutoParsableResponseFormat");
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
__name(isAutoParsableTool, "isAutoParsableTool");
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : void 0
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
__name(maybeParseChatCompletion, "maybeParseChatCompletion");
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
__name(parseChatCompletion, "parseChatCompletion");
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
__name(parseResponseFormat, "parseResponseFormat");
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
__name(parseToolCall, "parseToolCall");
function shouldParseToolCall(params, toolCall) {
  if (!params) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return isAutoParsableTool(inputTool) || inputTool?.function.strict || false;
}
__name(shouldParseToolCall, "shouldParseToolCall");
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t) => isAutoParsableTool(t) || t.type === "function" && t.function.strict === true) ?? false;
}
__name(hasAutoParseableInput, "hasAutoParseableInput");
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
__name(validateInputTools, "validateInputTools");
var __classPrivateFieldGet5 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet5");
var _AbstractChatCompletionRunner_instances;
var _AbstractChatCompletionRunner_getFinalContent;
var _AbstractChatCompletionRunner_getFinalMessage;
var _AbstractChatCompletionRunner_getFinalFunctionCall;
var _AbstractChatCompletionRunner_getFinalFunctionCallResult;
var _AbstractChatCompletionRunner_calculateTotalUsage;
var _AbstractChatCompletionRunner_validateParams;
var _AbstractChatCompletionRunner_stringifyFunctionCallResult;
var DEFAULT_MAX_CHAT_COMPLETIONS = 10;
var AbstractChatCompletionRunner = class extends EventStream {
  static {
    __name(this, "AbstractChatCompletionRunner");
  }
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = chatCompletion.choices[0]?.message;
    if (message)
      this._addMessage(message);
    return chatCompletion;
  }
  _addMessage(message, emit = true) {
    if (!("content" in message))
      message.content = null;
    this.messages.push(message);
    if (emit) {
      this._emit("message", message);
      if ((isFunctionMessage(message) || isToolMessage(message)) && message.content) {
        this._emit("functionCallResult", message.content);
      } else if (isAssistantMessage(message) && message.function_call) {
        this._emit("functionCall", message.function_call);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionCall() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
  }
  async finalFunctionCallResult() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
  }
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion)
      this._emit("finalChatCompletion", completion);
    const finalMessage = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage)
      this._emit("finalMessage", finalMessage);
    const finalContent = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent)
      this._emit("finalContent", finalContent);
    const finalFunctionCall = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
    if (finalFunctionCall)
      this._emit("finalFunctionCall", finalFunctionCall);
    const finalFunctionCallResult = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
    if (finalFunctionCallResult != null)
      this._emit("finalFunctionCallResult", finalFunctionCallResult);
    if (this._chatCompletions.some((c) => c.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options) {
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    return await this._createChatCompletion(client, params, options);
  }
  async _runFunctions(client, params, options) {
    const role = "function";
    const { function_call = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof function_call !== "string" && function_call?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const functionsByName = {};
    for (const f of params.functions) {
      functionsByName[f.name || f.function.name] = f;
    }
    const functions = params.functions.map((f) => ({
      name: f.name || f.function.name,
      parameters: f.parameters,
      description: f.description
    }));
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        function_call,
        functions,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.function_call)
        return;
      const { name, arguments: args } = message.function_call;
      const fn = functionsByName[name];
      if (!fn) {
        const content2 = `Invalid function_call: ${JSON.stringify(name)}. Available options are: ${functions.map((f) => JSON.stringify(f.name)).join(", ")}. Please try again`;
        this._addMessage({ role, name, content: content2 });
        continue;
      } else if (singleFunctionToCall && singleFunctionToCall !== name) {
        const content2 = `Invalid function_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
        this._addMessage({ role, name, content: content2 });
        continue;
      }
      let parsed;
      try {
        parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
      } catch (error) {
        this._addMessage({
          role,
          name,
          content: error instanceof Error ? error.message : String(error)
        });
        continue;
      }
      const rawContent = await fn.function(parsed, this);
      const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
      this._addMessage({ role, name, content });
      if (singleFunctionToCall)
        return;
    }
  }
  async _runTools(client, params, options) {
    const role = "tool";
    const { tool_choice = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice?.function?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = {};
    for (const f of inputTools) {
      if (f.type === "function") {
        functionsByName[f.function.name || f.function.function.name] = f.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
      type: "function",
      function: {
        name: t.function.name || t.function.function.name,
        parameters: t.function.parameters,
        description: t.function.description,
        strict: t.function.strict
      }
    } : t) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.tool_calls?.length) {
        return;
      }
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function")
          continue;
        const tool_call_id = tool_call.id;
        const { name, arguments: args } = tool_call.function;
        const fn = functionsByName[name];
        if (!fn) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
        } catch (error) {
          const content2 = error instanceof Error ? error.message : String(error);
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        const rawContent = await fn.function(parsed, this);
        const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, tool_call_id, content });
        if (singleFunctionToCall) {
          return;
        }
      }
    }
    return;
  }
};
_AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, "_AbstractChatCompletionRunner_getFinalContent2"), _AbstractChatCompletionRunner_getFinalMessage = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const { function_call, ...rest } = message;
      const ret = {
        ...rest,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      if (function_call) {
        ret.function_call = function_call;
      }
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, "_AbstractChatCompletionRunner_getFinalMessage2"), _AbstractChatCompletionRunner_getFinalFunctionCall = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalFunctionCall2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && message?.function_call) {
      return message.function_call;
    }
    if (isAssistantMessage(message) && message?.tool_calls?.length) {
      return message.tool_calls.at(-1)?.function;
    }
  }
  return;
}, "_AbstractChatCompletionRunner_getFinalFunctionCall2"), _AbstractChatCompletionRunner_getFinalFunctionCallResult = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalFunctionCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isFunctionMessage(message) && message.content != null) {
      return message.content;
    }
    if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x2) => x2.role === "assistant" && x2.tool_calls?.some((y2) => y2.type === "function" && y2.id === message.tool_call_id))) {
      return message.content;
    }
  }
  return;
}, "_AbstractChatCompletionRunner_getFinalFunctionCallResult2"), _AbstractChatCompletionRunner_calculateTotalUsage = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, "_AbstractChatCompletionRunner_calculateTotalUsage2"), _AbstractChatCompletionRunner_validateParams = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, "_AbstractChatCompletionRunner_validateParams2"), _AbstractChatCompletionRunner_stringifyFunctionCallResult = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
}, "_AbstractChatCompletionRunner_stringifyFunctionCallResult2");
var ChatCompletionRunner = class _ChatCompletionRunner extends AbstractChatCompletionRunner {
  static {
    __name(this, "_ChatCompletionRunner");
  }
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
  _addMessage(message, emit = true) {
    super._addMessage(message, emit);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
};
var STR = 1;
var NUM = 2;
var ARR = 4;
var OBJ = 8;
var NULL = 16;
var BOOL = 32;
var NAN = 64;
var INFINITY = 128;
var MINUS_INFINITY = 256;
var INF = INFINITY | MINUS_INFINITY;
var SPECIAL = NULL | BOOL | INF | NAN;
var ATOM = STR | NUM | SPECIAL;
var COLLECTION = ARR | OBJ;
var ALL = ATOM | COLLECTION;
var Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
var PartialJSON = class extends Error {
  static {
    __name(this, "PartialJSON");
  }
};
var MalformedJSON = class extends Error {
  static {
    __name(this, "MalformedJSON");
  }
};
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
__name(parseJSON, "parseJSON");
var _parseJSON = /* @__PURE__ */ __name((jsonString, allow) => {
  const length = jsonString.length;
  let index2 = 0;
  const markPartialJSON = /* @__PURE__ */ __name((msg) => {
    throw new PartialJSON(`${msg} at position ${index2}`);
  }, "markPartialJSON");
  const throwMalformedError = /* @__PURE__ */ __name((msg) => {
    throw new MalformedJSON(`${msg} at position ${index2}`);
  }, "throwMalformedError");
  const parseAny = /* @__PURE__ */ __name(() => {
    skipBlank();
    if (index2 >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index2] === '"')
      return parseStr();
    if (jsonString[index2] === "{")
      return parseObj();
    if (jsonString[index2] === "[")
      return parseArr();
    if (jsonString.substring(index2, index2 + 4) === "null" || Allow.NULL & allow && length - index2 < 4 && "null".startsWith(jsonString.substring(index2))) {
      index2 += 4;
      return null;
    }
    if (jsonString.substring(index2, index2 + 4) === "true" || Allow.BOOL & allow && length - index2 < 4 && "true".startsWith(jsonString.substring(index2))) {
      index2 += 4;
      return true;
    }
    if (jsonString.substring(index2, index2 + 5) === "false" || Allow.BOOL & allow && length - index2 < 5 && "false".startsWith(jsonString.substring(index2))) {
      index2 += 5;
      return false;
    }
    if (jsonString.substring(index2, index2 + 8) === "Infinity" || Allow.INFINITY & allow && length - index2 < 8 && "Infinity".startsWith(jsonString.substring(index2))) {
      index2 += 8;
      return Infinity;
    }
    if (jsonString.substring(index2, index2 + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index2 && length - index2 < 9 && "-Infinity".startsWith(jsonString.substring(index2))) {
      index2 += 9;
      return -Infinity;
    }
    if (jsonString.substring(index2, index2 + 3) === "NaN" || Allow.NAN & allow && length - index2 < 3 && "NaN".startsWith(jsonString.substring(index2))) {
      index2 += 3;
      return NaN;
    }
    return parseNum();
  }, "parseAny");
  const parseStr = /* @__PURE__ */ __name(() => {
    const start = index2;
    let escape2 = false;
    index2++;
    while (index2 < length && (jsonString[index2] !== '"' || escape2 && jsonString[index2 - 1] === "\\")) {
      escape2 = jsonString[index2] === "\\" ? !escape2 : false;
      index2++;
    }
    if (jsonString.charAt(index2) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index2 - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index2 - Number(escape2)) + '"');
      } catch (e) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  }, "parseStr");
  const parseObj = /* @__PURE__ */ __name(() => {
    index2++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index2] !== "}") {
        skipBlank();
        if (index2 >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index2++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e;
        }
        skipBlank();
        if (jsonString[index2] === ",")
          index2++;
      }
    } catch (e) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index2++;
    return obj;
  }, "parseObj");
  const parseArr = /* @__PURE__ */ __name(() => {
    index2++;
    const arr = [];
    try {
      while (jsonString[index2] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index2] === ",") {
          index2++;
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index2++;
    return arr;
  }, "parseArr");
  const parseNum = /* @__PURE__ */ __name(() => {
    if (index2 === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ("." === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e2) {
          }
        }
        throwMalformedError(String(e));
      }
    }
    const start = index2;
    if (jsonString[index2] === "-")
      index2++;
    while (jsonString[index2] && !",]}".includes(jsonString[index2]))
      index2++;
    if (index2 == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index2));
    } catch (e) {
      if (jsonString.substring(start, index2) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e2) {
        throwMalformedError(String(e2));
      }
    }
  }, "parseNum");
  const skipBlank = /* @__PURE__ */ __name(() => {
    while (index2 < length && " \n\r	".includes(jsonString[index2])) {
      index2++;
    }
  }, "skipBlank");
  return parseAny();
}, "_parseJSON");
var partialParse = /* @__PURE__ */ __name((input) => parseJSON(input, Allow.ALL ^ Allow.NUM), "partialParse");
var __classPrivateFieldSet5 = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet5");
var __classPrivateFieldGet6 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet6");
var _ChatCompletionStream_instances;
var _ChatCompletionStream_params;
var _ChatCompletionStream_choiceEventStates;
var _ChatCompletionStream_currentChatCompletionSnapshot;
var _ChatCompletionStream_beginRequest;
var _ChatCompletionStream_getChoiceEventState;
var _ChatCompletionStream_addChunk;
var _ChatCompletionStream_emitToolCallDoneEvent;
var _ChatCompletionStream_emitContentDoneEvents;
var _ChatCompletionStream_endRequest;
var _ChatCompletionStream_getAutoParseableResponseFormat;
var _ChatCompletionStream_accumulateChatCompletion;
var ChatCompletionStream = class _ChatCompletionStream extends AbstractChatCompletionRunner {
  static {
    __name(this, "_ChatCompletionStream");
  }
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    __classPrivateFieldSet5(this, _ChatCompletionStream_params, params, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createChatCompletion(client, params, options) {
    const runner = new _ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  async _createChatCompletion(client, params, options) {
    super._createChatCompletion;
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const chunk of stream) {
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const chunk of stream) {
      if (chatId && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      chatId = chunk.id;
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = /* @__PURE__ */ __name(function _ChatCompletionStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
  }, "_ChatCompletionStream_beginRequest2"), _ChatCompletionStream_getChoiceEventState = /* @__PURE__ */ __name(function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state = __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state) {
      return state;
    }
    state = {
      content_done: false,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    };
    __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
    return state;
  }, "_ChatCompletionStream_getChoiceEventState2"), _ChatCompletionStream_addChunk = /* @__PURE__ */ __name(function _ChatCompletionStream_addChunk2(chunk) {
    if (this.ended)
      return;
    const completion = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const choiceSnapshot = completion.choices[choice.index];
      if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
        this._emit("content", choice.delta.content, choiceSnapshot.message.content);
        this._emit("content.delta", {
          delta: choice.delta.content,
          snapshot: choiceSnapshot.message.content,
          parsed: choiceSnapshot.message.parsed
        });
      }
      if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
        this._emit("refusal.delta", {
          delta: choice.delta.refusal,
          snapshot: choiceSnapshot.message.refusal
        });
      }
      if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.content.delta", {
          content: choice.logprobs?.content,
          snapshot: choiceSnapshot.logprobs?.content ?? []
        });
      }
      if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: choice.logprobs?.refusal,
          snapshot: choiceSnapshot.logprobs?.refusal ?? []
        });
      }
      const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state.current_tool_call_index != null) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
        }
      }
      for (const toolCall of choice.delta.tool_calls ?? []) {
        if (state.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        state.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of choice.delta.tool_calls ?? []) {
        const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
        if (!toolCallSnapshot?.type) {
          continue;
        }
        if (toolCallSnapshot?.type === "function") {
          this._emit("tool_calls.function.arguments.delta", {
            name: toolCallSnapshot.function?.name,
            index: toolCallDelta.index,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: toolCallDelta.function?.arguments ?? ""
          });
        } else {
          assertNever2(toolCallSnapshot?.type);
        }
      }
    }
  }, "_ChatCompletionStream_addChunk2"), _ChatCompletionStream_emitToolCallDoneEvent = /* @__PURE__ */ __name(function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => tool.type === "function" && tool.function.name === toolCallSnapshot.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: toolCallSnapshot.function.arguments,
        parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
      });
    } else {
      assertNever2(toolCallSnapshot.type);
    }
  }, "_ChatCompletionStream_emitToolCallDoneEvent2"), _ChatCompletionStream_emitContentDoneEvents = /* @__PURE__ */ __name(function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (choiceSnapshot.message.content && !state.content_done) {
      state.content_done = true;
      const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
      this._emit("content.done", {
        content: choiceSnapshot.message.content,
        parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
      });
    }
    if (choiceSnapshot.message.refusal && !state.refusal_done) {
      state.refusal_done = true;
      this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
    }
    if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
      state.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
      state.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, "_ChatCompletionStream_emitContentDoneEvents2"), _ChatCompletionStream_endRequest = /* @__PURE__ */ __name(function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"));
  }, "_ChatCompletionStream_endRequest2"), _ChatCompletionStream_getAutoParseableResponseFormat = /* @__PURE__ */ __name(function _ChatCompletionStream_getAutoParseableResponseFormat2() {
    const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.response_format;
    if (isAutoParsableResponseFormat(responseFormat)) {
      return responseFormat;
    }
    return null;
  }, "_ChatCompletionStream_getAutoParseableResponseFormat2"), _ChatCompletionStream_accumulateChatCompletion = /* @__PURE__ */ __name(function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
    var _a2, _b, _c, _d;
    let snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, ...rest } = chunk;
    if (!snapshot) {
      snapshot = __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
        ...rest,
        choices: []
      }, "f");
    } else {
      Object.assign(snapshot, rest);
    }
    for (const { delta, finish_reason, index: index2, logprobs = null, ...other } of chunk.choices) {
      let choice = snapshot.choices[index2];
      if (!choice) {
        choice = snapshot.choices[index2] = { finish_reason, index: index2, message: {}, logprobs, ...other };
      }
      if (logprobs) {
        if (!choice.logprobs) {
          choice.logprobs = Object.assign({}, logprobs);
        } else {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          assertIsEmpty(rest3);
          Object.assign(choice.logprobs, rest3);
          if (content2) {
            (_a2 = choice.logprobs).content ?? (_a2.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b = choice.logprobs).refusal ?? (_b.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      Object.assign(choice, other);
      if (!delta)
        continue;
      const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
      assertIsEmpty(rest2);
      Object.assign(choice.message, rest2);
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role)
        choice.message.role = role;
      if (function_call) {
        if (!choice.message.function_call) {
          choice.message.function_call = function_call;
        } else {
          if (function_call.name)
            choice.message.function_call.name = function_call.name;
          if (function_call.arguments) {
            (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        }
      }
      if (content) {
        choice.message.content = (choice.message.content || "") + content;
        if (!choice.message.refusal && __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
          choice.message.parsed = partialParse(choice.message.content);
        }
      }
      if (tool_calls) {
        if (!choice.message.tool_calls)
          choice.message.tool_calls = [];
        for (const { index: index3, id, type, function: fn, ...rest3 } of tool_calls) {
          const tool_call = (_d = choice.message.tool_calls)[index3] ?? (_d[index3] = {});
          Object.assign(tool_call, rest3);
          if (id)
            tool_call.id = id;
          if (type)
            tool_call.type = type;
          if (fn)
            tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
          if (fn?.name)
            tool_call.function.name = fn.name;
          if (fn?.arguments) {
            tool_call.function.arguments += fn.arguments;
            if (shouldParseToolCall(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"), tool_call)) {
              tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
            }
          }
        }
      }
    }
    return snapshot;
  }, "_ChatCompletionStream_accumulateChatCompletion2"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("chunk", (chunk) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(chunk);
      } else {
        pushQueue.push(chunk);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message, finish_reason, index: index2, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index2}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index2}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index2}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index2}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index: index2,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index: index2,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index2}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index2}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index2}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index2}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index: index2,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
__name(finalizeChatCompletion, "finalizeChatCompletion");
function str(x2) {
  return JSON.stringify(x2);
}
__name(str, "str");
function assertIsEmpty(obj) {
  return;
}
__name(assertIsEmpty, "assertIsEmpty");
function assertNever2(_x) {
}
__name(assertNever2, "assertNever2");
var ChatCompletionStreamingRunner = class _ChatCompletionStreamingRunner extends ChatCompletionStream {
  static {
    __name(this, "_ChatCompletionStreamingRunner");
  }
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(null);
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
};
var Completions2 = class extends APIResource {
  static {
    __name(this, "Completions2");
  }
  parse(body, options) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options,
      headers: {
        ...options?.headers,
        "X-Stainless-Helper-Method": "beta.chat.completions.parse"
      }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runFunctions(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runFunctions(this._client, body, options);
    }
    return ChatCompletionRunner.runFunctions(this._client, body, options);
  }
  runTools(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options);
    }
    return ChatCompletionRunner.runTools(this._client, body, options);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options);
  }
};
var Chat2 = class extends APIResource {
  static {
    __name(this, "Chat2");
  }
  constructor() {
    super(...arguments);
    this.completions = new Completions2(this._client);
  }
};
(function(Chat3) {
  Chat3.Completions = Completions2;
})(Chat2 || (Chat2 = {}));
var Sessions = class extends APIResource {
  static {
    __name(this, "Sessions");
  }
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var TranscriptionSessions = class extends APIResource {
  static {
    __name(this, "TranscriptionSessions");
  }
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var Realtime = class extends APIResource {
  static {
    __name(this, "Realtime");
  }
  constructor() {
    super(...arguments);
    this.sessions = new Sessions(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
};
Realtime.Sessions = Sessions;
Realtime.TranscriptionSessions = TranscriptionSessions;
var Messages2 = class extends APIResource {
  static {
    __name(this, "Messages2");
  }
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadId, body, options) {
    return this._client.post(`/threads/${threadId}/messages`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, messageId, options) {
    return this._client.get(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, messageId, body, options) {
    return this._client.post(`/threads/${threadId}/messages/${messageId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/messages`, MessagesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, messageId, options) {
    return this._client.delete(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var MessagesPage = class extends CursorPage {
  static {
    __name(this, "MessagesPage");
  }
};
Messages2.MessagesPage = MessagesPage;
var Steps = class extends APIResource {
  static {
    __name(this, "Steps");
  }
  retrieve(threadId, runId, stepId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(threadId, runId, stepId, {}, query);
    }
    return this._client.get(`/threads/${threadId}/runs/${runId}/steps/${stepId}`, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, runId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs/${runId}/steps`, RunStepsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var RunStepsPage = class extends CursorPage {
  static {
    __name(this, "RunStepsPage");
  }
};
Steps.RunStepsPage = RunStepsPage;
var Runs = class extends APIResource {
  static {
    __name(this, "Runs");
  }
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadId, params, options) {
    const { include, ...body } = params;
    return this._client.post(`/threads/${threadId}/runs`, {
      query: { include },
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: params.stream ?? false
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, runId, options) {
    return this._client.get(`/threads/${threadId}/runs/${runId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs`, RunsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(threadId, runId, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options) {
    const run = await this.create(threadId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(threadId, runId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: run, response } = await this.retrieve(threadId, runId, {
        ...options,
        headers: { ...options?.headers, ...headers }
      }).withResponse();
      switch (run.status) {
        //If we are in any sort of intermediate state we poll
        case "queued":
        case "in_progress":
        case "cancelling":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        //We return the run in any terminal state.
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return run;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  submitToolOutputs(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(threadId, runId, body, options) {
    const run = await this.submitToolOutputs(threadId, runId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(threadId, runId, body, options) {
    return AssistantStream.createToolAssistantStream(threadId, runId, this._client.beta.threads.runs, body, options);
  }
};
var RunsPage = class extends CursorPage {
  static {
    __name(this, "RunsPage");
  }
};
Runs.RunsPage = RunsPage;
Runs.Steps = Steps;
Runs.RunStepsPage = RunStepsPage;
var Threads = class extends APIResource {
  static {
    __name(this, "Threads");
  }
  constructor() {
    super(...arguments);
    this.runs = new Runs(this._client);
    this.messages = new Messages2(this._client);
  }
  create(body = {}, options) {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post("/threads", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, options) {
    return this._client.get(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, body, options) {
    return this._client.post(`/threads/${threadId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, options) {
    return this._client.delete(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  createAndRun(body, options) {
    return this._client.post("/threads/runs", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options) {
    const run = await this.createAndRun(body, options);
    return await this.runs.poll(run.thread_id, run.id, options);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
  }
};
Threads.Runs = Runs;
Threads.RunsPage = RunsPage;
Threads.Messages = Messages2;
Threads.MessagesPage = MessagesPage;
var Beta = class extends APIResource {
  static {
    __name(this, "Beta");
  }
  constructor() {
    super(...arguments);
    this.realtime = new Realtime(this._client);
    this.chat = new Chat2(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads(this._client);
  }
};
Beta.Realtime = Realtime;
Beta.Assistants = Assistants;
Beta.AssistantsPage = AssistantsPage;
Beta.Threads = Threads;
var Completions3 = class extends APIResource {
  static {
    __name(this, "Completions3");
  }
  create(body, options) {
    return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
  }
};
var Content = class extends APIResource {
  static {
    __name(this, "Content");
  }
  /**
   * Retrieve Container File Content
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
};
var Files = class extends APIResource {
  static {
    __name(this, "Files");
  }
  constructor() {
    super(...arguments);
    this.content = new Content(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerId, body, options) {
    return this._client.post(`/containers/${containerId}/files`, multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Retrieve Container File
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}`, options);
  }
  list(containerId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(containerId, {}, query);
    }
    return this._client.getAPIList(`/containers/${containerId}/files`, FileListResponsesPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Container File
   */
  del(containerId, fileId, options) {
    return this._client.delete(`/containers/${containerId}/files/${fileId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var FileListResponsesPage = class extends CursorPage {
  static {
    __name(this, "FileListResponsesPage");
  }
};
Files.FileListResponsesPage = FileListResponsesPage;
Files.Content = Content;
var Containers = class extends APIResource {
  static {
    __name(this, "Containers");
  }
  constructor() {
    super(...arguments);
    this.files = new Files(this._client);
  }
  /**
   * Create Container
   */
  create(body, options) {
    return this._client.post("/containers", { body, ...options });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerId, options) {
    return this._client.get(`/containers/${containerId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/containers", ContainerListResponsesPage, { query, ...options });
  }
  /**
   * Delete Container
   */
  del(containerId, options) {
    return this._client.delete(`/containers/${containerId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ContainerListResponsesPage = class extends CursorPage {
  static {
    __name(this, "ContainerListResponsesPage");
  }
};
Containers.ContainerListResponsesPage = ContainerListResponsesPage;
Containers.Files = Files;
Containers.FileListResponsesPage = FileListResponsesPage;
var Embeddings = class extends APIResource {
  static {
    __name(this, "Embeddings");
  }
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(body, options) {
    const hasUserProvidedEncodingFormat = !!body.encoding_format;
    let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
    if (hasUserProvidedEncodingFormat) {
      debug("Request", "User defined encoding_format:", body.encoding_format);
    }
    const response = this._client.post("/embeddings", {
      body: {
        ...body,
        encoding_format
      },
      ...options
    });
    if (hasUserProvidedEncodingFormat) {
      return response;
    }
    debug("response", "Decoding base64 embeddings to float32 array");
    return response._thenUnwrap((response2) => {
      if (response2 && response2.data) {
        response2.data.forEach((embeddingBase64Obj) => {
          const embeddingBase64Str = embeddingBase64Obj.embedding;
          embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
        });
      }
      return response2;
    });
  }
};
var OutputItems = class extends APIResource {
  static {
    __name(this, "OutputItems");
  }
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(evalId, runId, outputItemId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}/output_items/${outputItemId}`, options);
  }
  list(evalId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, runId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs/${runId}/output_items`, OutputItemListResponsesPage, { query, ...options });
  }
};
var OutputItemListResponsesPage = class extends CursorPage {
  static {
    __name(this, "OutputItemListResponsesPage");
  }
};
OutputItems.OutputItemListResponsesPage = OutputItemListResponsesPage;
var Runs2 = class extends APIResource {
  static {
    __name(this, "Runs2");
  }
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalId, body, options) {
    return this._client.post(`/evals/${evalId}/runs`, { body, ...options });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(evalId, runId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}`, options);
  }
  list(evalId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs`, RunListResponsesPage, { query, ...options });
  }
  /**
   * Delete an eval run.
   */
  del(evalId, runId, options) {
    return this._client.delete(`/evals/${evalId}/runs/${runId}`, options);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(evalId, runId, options) {
    return this._client.post(`/evals/${evalId}/runs/${runId}`, options);
  }
};
var RunListResponsesPage = class extends CursorPage {
  static {
    __name(this, "RunListResponsesPage");
  }
};
Runs2.RunListResponsesPage = RunListResponsesPage;
Runs2.OutputItems = OutputItems;
Runs2.OutputItemListResponsesPage = OutputItemListResponsesPage;
var Evals = class extends APIResource {
  static {
    __name(this, "Evals");
  }
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(body, options) {
    return this._client.post("/evals", { body, ...options });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalId, options) {
    return this._client.get(`/evals/${evalId}`, options);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalId, body, options) {
    return this._client.post(`/evals/${evalId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/evals", EvalListResponsesPage, { query, ...options });
  }
  /**
   * Delete an evaluation.
   */
  del(evalId, options) {
    return this._client.delete(`/evals/${evalId}`, options);
  }
};
var EvalListResponsesPage = class extends CursorPage {
  static {
    __name(this, "EvalListResponsesPage");
  }
};
Evals.EvalListResponsesPage = EvalListResponsesPage;
Evals.Runs = Runs2;
Evals.RunListResponsesPage = RunListResponsesPage;
var Files2 = class extends APIResource {
  static {
    __name(this, "Files2");
  }
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and the size of all files uploaded by one organization can be up
   * to 100 GB.
   *
   * The Assistants API supports files up to 2 million tokens and of specific file
   * types. See the
   * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
   * details.
   *
   * The Fine-tuning API only supports `.jsonl` files. The input also has certain
   * required formats for fine-tuning
   * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
   * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   * models.
   *
   * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
   * has a specific required
   * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(body, options) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileId, options) {
    return this._client.get(`/files/${fileId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/files", FileObjectsPage, { query, ...options });
  }
  /**
   * Delete a file.
   */
  del(fileId, options) {
    return this._client.delete(`/files/${fileId}`, options);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
  /**
   * Returns the contents of the specified file.
   *
   * @deprecated The `.content()` method should be used instead
   */
  retrieveContent(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, options);
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
};
var FileObjectsPage = class extends CursorPage {
  static {
    __name(this, "FileObjectsPage");
  }
};
Files2.FileObjectsPage = FileObjectsPage;
var Methods = class extends APIResource {
  static {
    __name(this, "Methods");
  }
};
var Graders = class extends APIResource {
  static {
    __name(this, "Graders");
  }
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   *   reference_answer: 'string',
   * });
   * ```
   */
  run(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
  }
};
var Alpha = class extends APIResource {
  static {
    __name(this, "Alpha");
  }
  constructor() {
    super(...arguments);
    this.graders = new Graders(this._client);
  }
};
Alpha.Graders = Graders;
var Permissions = class extends APIResource {
  static {
    __name(this, "Permissions");
  }
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(fineTunedModelCheckpoint, body, options) {
    return this._client.getAPIList(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, PermissionCreateResponsesPage, { body, method: "post", ...options });
  }
  retrieve(fineTunedModelCheckpoint, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(fineTunedModelCheckpoint, {}, query);
    }
    return this._client.get(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.del(
   *     'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *   );
   * ```
   */
  del(fineTunedModelCheckpoint, permissionId, options) {
    return this._client.delete(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions/${permissionId}`, options);
  }
};
var PermissionCreateResponsesPage = class extends Page {
  static {
    __name(this, "PermissionCreateResponsesPage");
  }
};
Permissions.PermissionCreateResponsesPage = PermissionCreateResponsesPage;
var Checkpoints = class extends APIResource {
  static {
    __name(this, "Checkpoints");
  }
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints.Permissions = Permissions;
Checkpoints.PermissionCreateResponsesPage = PermissionCreateResponsesPage;
var Checkpoints2 = class extends APIResource {
  static {
    __name(this, "Checkpoints2");
  }
  list(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/checkpoints`, FineTuningJobCheckpointsPage, { query, ...options });
  }
};
var FineTuningJobCheckpointsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobCheckpointsPage");
  }
};
Checkpoints2.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;
var Jobs = class extends APIResource {
  static {
    __name(this, "Jobs");
  }
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/fine_tuning/jobs", { body, ...options });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(fineTuningJobId, options) {
    return this._client.get(`/fine_tuning/jobs/${fineTuningJobId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/fine_tuning/jobs", FineTuningJobsPage, { query, ...options });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/cancel`, options);
  }
  listEvents(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listEvents(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/events`, FineTuningJobEventsPage, {
      query,
      ...options
    });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/pause`, options);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/resume`, options);
  }
};
var FineTuningJobsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobsPage");
  }
};
var FineTuningJobEventsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobEventsPage");
  }
};
Jobs.FineTuningJobsPage = FineTuningJobsPage;
Jobs.FineTuningJobEventsPage = FineTuningJobEventsPage;
Jobs.Checkpoints = Checkpoints2;
Jobs.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;
var FineTuning = class extends APIResource {
  static {
    __name(this, "FineTuning");
  }
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints(this._client);
    this.alpha = new Alpha(this._client);
  }
};
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.FineTuningJobsPage = FineTuningJobsPage;
FineTuning.FineTuningJobEventsPage = FineTuningJobEventsPage;
FineTuning.Checkpoints = Checkpoints;
FineTuning.Alpha = Alpha;
var GraderModels = class extends APIResource {
  static {
    __name(this, "GraderModels");
  }
};
var Graders2 = class extends APIResource {
  static {
    __name(this, "Graders2");
  }
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
};
Graders2.GraderModels = GraderModels;
var Images = class extends APIResource {
  static {
    __name(this, "Images");
  }
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(body, options) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an edited or extended image given one or more source images and a
   * prompt. This endpoint only supports `gpt-image-1` and `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.edit({
   *   image: fs.createReadStream('path/to/file'),
   *   prompt: 'A cute baby sea otter wearing a beret',
   * });
   * ```
   */
  edit(body, options) {
    return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an image given a prompt.
   * [Learn more](https://platform.openai.com/docs/guides/images).
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.generate({
   *   prompt: 'A cute baby sea otter',
   * });
   * ```
   */
  generate(body, options) {
    return this._client.post("/images/generations", { body, ...options });
  }
};
var Models = class extends APIResource {
  static {
    __name(this, "Models");
  }
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options) {
    return this._client.get(`/models/${model}`, options);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options) {
    return this._client.getAPIList("/models", ModelsPage, options);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  del(model, options) {
    return this._client.delete(`/models/${model}`, options);
  }
};
var ModelsPage = class extends Page {
  static {
    __name(this, "ModelsPage");
  }
};
Models.ModelsPage = ModelsPage;
var Moderations = class extends APIResource {
  static {
    __name(this, "Moderations");
  }
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(body, options) {
    return this._client.post("/moderations", { body, ...options });
  }
};
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
__name(maybeParseResponse, "maybeParseResponse");
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
__name(parseResponse, "parseResponse");
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
__name(parseTextFormat, "parseTextFormat");
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
__name(hasAutoParseableInput2, "hasAutoParseableInput2");
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
__name(isAutoParsableTool2, "isAutoParsableTool2");
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
__name(getInputToolByName, "getInputToolByName");
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
__name(parseToolCall2, "parseToolCall2");
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
__name(addOutputText, "addOutputText");
var InputItems = class extends APIResource {
  static {
    __name(this, "InputItems");
  }
  list(responseId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(responseId, {}, query);
    }
    return this._client.getAPIList(`/responses/${responseId}/input_items`, ResponseItemsPage, {
      query,
      ...options
    });
  }
};
var __classPrivateFieldSet6 = /* @__PURE__ */ __name(function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, "__classPrivateFieldSet6");
var __classPrivateFieldGet7 = /* @__PURE__ */ __name(function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, "__classPrivateFieldGet7");
var _ResponseStream_instances;
var _ResponseStream_params;
var _ResponseStream_currentResponseSnapshot;
var _ResponseStream_finalResponse;
var _ResponseStream_beginRequest;
var _ResponseStream_addEvent;
var _ResponseStream_endRequest;
var _ResponseStream_accumulateResponse;
var ResponseStream = class _ResponseStream extends EventStream {
  static {
    __name(this, "_ResponseStream");
  }
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    __classPrivateFieldSet6(this, _ResponseStream_params, params, "f");
  }
  static createResponse(client, params, options) {
    const runner = new _ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream;
    let starting_after = null;
    if ("response_id" in params) {
      stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = /* @__PURE__ */ __name(function _ResponseStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
  }, "_ResponseStream_beginRequest2"), _ResponseStream_addEvent = /* @__PURE__ */ __name(function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended)
      return;
    const maybeEmit = /* @__PURE__ */ __name((name, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name, event2);
      }
    }, "maybeEmit");
    const response = __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
    maybeEmit("event", event);
    switch (event.type) {
      case "response.output_text.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...event,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...event,
            snapshot: output.arguments
          });
        }
        break;
      }
      default:
        maybeEmit(event.type, event);
        break;
    }
  }, "_ResponseStream_addEvent2"), _ResponseStream_endRequest = /* @__PURE__ */ __name(function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet7(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet6(this, _ResponseStream_finalResponse, parsedResponse, "f");
    return parsedResponse;
  }, "_ResponseStream_endRequest2"), _ResponseStream_accumulateResponse = /* @__PURE__ */ __name(function _ResponseStream_accumulateResponse2(event) {
    let snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      if (event.type !== "response.created") {
        throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
      }
      snapshot = __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
      return snapshot;
    }
    switch (event.type) {
      case "response.output_item.added": {
        snapshot.output.push(event.item);
        break;
      }
      case "response.content_part.added": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          output.content.push(event.part);
        }
        break;
      }
      case "response.output_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          output.arguments += event.delta;
        }
        break;
      }
      case "response.completed": {
        __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
        break;
      }
    }
    return snapshot;
  }, "_ResponseStream_accumulateResponse2"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
        }
        const event = pushQueue.shift();
        return { value: event, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet7(this, _ResponseStream_finalResponse, "f");
    if (!response)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return response;
  }
};
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
__name(finalizeResponse, "finalizeResponse");
var Responses = class extends APIResource {
  static {
    __name(this, "Responses");
  }
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems(this._client);
  }
  create(body, options) {
    return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseId, query = {}, options) {
    return this._client.get(`/responses/${responseId}`, {
      query,
      ...options,
      stream: query?.stream ?? false
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.del(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  del(responseId, options) {
    return this._client.delete(`/responses/${responseId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  parse(body, options) {
    return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options) {
    return ResponseStream.createResponse(this._client, body, options);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseId, options) {
    return this._client.post(`/responses/${responseId}/cancel`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ResponseItemsPage = class extends CursorPage {
  static {
    __name(this, "ResponseItemsPage");
  }
};
Responses.InputItems = InputItems;
var Parts = class extends APIResource {
  static {
    __name(this, "Parts");
  }
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/parts`, multipartFormRequestOptions({ body, ...options }));
  }
};
var Uploads = class extends APIResource {
  static {
    __name(this, "Uploads");
  }
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body, options) {
    return this._client.post("/uploads", { body, ...options });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadId, options) {
    return this._client.post(`/uploads/${uploadId}/cancel`, options);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/complete`, { body, ...options });
  }
};
Uploads.Parts = Parts;
var allSettledWithThrow = /* @__PURE__ */ __name(async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
}, "allSettledWithThrow");
var Files3 = class extends APIResource {
  static {
    __name(this, "Files3");
  }
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(vectorStoreId, fileId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(vectorStoreId, fileId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(vectorStoreId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(vectorStoreId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files`, VectorStoreFilesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  del(vectorStoreId, fileId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const file = await this.create(vectorStoreId, body, options);
    return await this.poll(vectorStoreId, file.id, options);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreId, fileId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const fileResponse = await this.retrieve(vectorStoreId, fileId, {
        ...options,
        headers
      }).withResponse();
      const file = fileResponse.data;
      switch (file.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "completed":
          return file;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options) {
    const fileInfo = await this.upload(vectorStoreId, file, options);
    return await this.poll(vectorStoreId, fileInfo.id, options);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(vectorStoreId, fileId, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files/${fileId}/content`, FileContentResponsesPage, { ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
};
var VectorStoreFilesPage = class extends CursorPage {
  static {
    __name(this, "VectorStoreFilesPage");
  }
};
var FileContentResponsesPage = class extends Page {
  static {
    __name(this, "FileContentResponsesPage");
  }
};
Files3.VectorStoreFilesPage = VectorStoreFilesPage;
Files3.FileContentResponsesPage = FileContentResponsesPage;
var FileBatches = class extends APIResource {
  static {
    __name(this, "FileBatches");
  }
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(vectorStoreId, batchId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/file_batches/${batchId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(vectorStoreId, batchId, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }
  listFiles(vectorStoreId, batchId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listFiles(vectorStoreId, batchId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/files`, VectorStoreFilesPage, { query, ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreId, batchId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: batch, response } = await this.retrieve(vectorStoreId, batchId, {
        ...options,
        headers
      }).withResponse();
      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
    if (files == null || files.length == 0) {
      throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
    }
    const configuredConcurrency = options?.maxConcurrency ?? 5;
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);
    const client = this._client;
    const fileIterator = files.values();
    const allFileIds = [...fileIds];
    async function processFiles(iterator) {
      for (let item of iterator) {
        const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
        allFileIds.push(fileObj.id);
      }
    }
    __name(processFiles, "processFiles");
    const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
    await allSettledWithThrow(workers);
    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds
    });
  }
};
var VectorStores = class extends APIResource {
  static {
    __name(this, "VectorStores");
  }
  constructor() {
    super(...arguments);
    this.files = new Files3(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options) {
    return this._client.post("/vector_stores", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/vector_stores", VectorStoresPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store.
   */
  del(vectorStoreId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreId, body, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/search`, VectorStoreSearchResponsesPage, {
      body,
      method: "post",
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var VectorStoresPage = class extends CursorPage {
  static {
    __name(this, "VectorStoresPage");
  }
};
var VectorStoreSearchResponsesPage = class extends Page {
  static {
    __name(this, "VectorStoreSearchResponsesPage");
  }
};
VectorStores.VectorStoresPage = VectorStoresPage;
VectorStores.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
VectorStores.Files = Files3;
VectorStores.VectorStoreFilesPage = VectorStoreFilesPage;
VectorStores.FileContentResponsesPage = FileContentResponsesPage;
VectorStores.FileBatches = FileBatches;
var _a;
var OpenAI = class extends APIClient {
  static {
    __name(this, "OpenAI");
  }
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, ...opts } = {}) {
    if (apiKey === void 0) {
      throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    }
    const options = {
      apiKey,
      organization,
      project,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    super({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 6e5,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch
    });
    this.completions = new Completions3(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files2(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.responses = new Responses(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    this._options = options;
    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(opts) {
    return {
      ...super.defaultHeaders(opts),
      "OpenAI-Organization": this.organization,
      "OpenAI-Project": this.project,
      ...this._options.defaultHeaders
    };
  }
  authHeaders(opts) {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
  stringifyQuery(query) {
    return stringify(query, { arrayFormat: "brackets" });
  }
};
_a = OpenAI;
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.toFile = toFile;
OpenAI.fileFromPath = fileFromPath;
OpenAI.Completions = Completions3;
OpenAI.Chat = Chat;
OpenAI.ChatCompletionsPage = ChatCompletionsPage;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files2;
OpenAI.FileObjectsPage = FileObjectsPage;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.ModelsPage = ModelsPage;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.VectorStoresPage = VectorStoresPage;
OpenAI.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.BatchesPage = BatchesPage;
OpenAI.Uploads = Uploads;
OpenAI.Responses = Responses;
OpenAI.Evals = Evals;
OpenAI.EvalListResponsesPage = EvalListResponsesPage;
OpenAI.Containers = Containers;
OpenAI.ContainerListResponsesPage = ContainerListResponsesPage;
var openai_default = OpenAI;
var REQUIRED = ["OPENROUTER_API_KEY", "NEON_DATABASE_URL"];
function read(key) {
  const procEnv = globalThis.process?.env;
  return procEnv ? procEnv[key] : void 0;
}
__name(read, "read");
var env = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop !== "string") return void 0;
    const key = prop;
    const raw = read(key);
    if (raw === void 0 || raw === "") {
      if (REQUIRED.includes(key)) {
        throw new Error(
          `Missing env: ${String(
            key
          )}. Add it to .env/.dev.vars (local) or Cloudflare Worker secrets (prod).`
        );
      }
      return void 0;
    }
    return raw;
  }
});
var models = [
  { id: "x-ai/grok-4.1-fast", maxOutputTokens: 1200, priceRank: 1 },
  { id: "anthropic/claude-3-5-sonnet-20241022", maxOutputTokens: 1200, priceRank: 2 },
  { id: "meta/llama-3.1-405b", maxOutputTokens: 1200, priceRank: 3 },
  { id: "qwen/qwen-2.5-110b", maxOutputTokens: 1200, priceRank: 4 }
];
var _client = null;
function getClient() {
  if (_client) return _client;
  _client = new openai_default({ baseURL: "https://openrouter.ai/api/v1", apiKey: env.OPENROUTER_API_KEY });
  return _client;
}
__name(getClient, "getClient");
async function routeAndChat(input) {
  const model = models[0];
  const res = await getClient().chat.completions.create({ model: model.id, messages: input.messages, max_tokens: model.maxOutputTokens });
  const content = res.choices?.[0]?.message?.content || "";
  return { id: res.id || "", model: model.id, content };
}
__name(routeAndChat, "routeAndChat");
async function routeAndStream(input) {
  const model = models[0];
  const enc = new TextEncoder();
  const res = await getClient().chat.completions.create({ model: model.id, messages: input.messages, max_tokens: model.maxOutputTokens, stream: true });
  const it = res;
  let totalTokens = 0;
  const usagePromise = (async () => totalTokens)();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const ev of it) {
        const delta = ev?.choices?.[0]?.delta?.content || ev?.choices?.[0]?.message?.content || "";
        if (ev?.usage?.total_tokens) totalTokens = ev.usage.total_tokens;
        if (delta) controller.enqueue(enc.encode(delta));
      }
      controller.close();
    }
  });
  return { stream, usage: usagePromise };
}
__name(routeAndStream, "routeAndStream");
async function generateImage(input) {
  const model = input.modelId || "black-forest-labs/flux-pro";
  const size = input.size || "1024x1024";
  const res = await getClient().images.generate({ model, prompt: input.prompt, size });
  const first = res?.data?.[0] || {};
  const url = first.url || (first.b64_json ? `data:image/png;base64,${first.b64_json}` : "");
  return { url, model };
}
__name(generateImage, "generateImage");
function startTrace(name, attrs) {
  return { name, ts: Date.now(), attrs };
}
__name(startTrace, "startTrace");
async function endTrace(t) {
  if (!env.OTLP_ENDPOINT) return;
  const payload = { name: t.name, ts: t.ts, attrs: t.attrs, endTs: Date.now() };
  try {
    await fetch(env.OTLP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch {
  }
}
__name(endTrace, "endTrace");
function errorId() {
  const g2 = globalThis.crypto;
  if (g2 && g2.randomUUID) return g2.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
__name(errorId, "errorId");
function withErrorLogging(handler12) {
  return async (req) => {
    try {
      return await handler12(req);
    } catch (e) {
      const id = errorId();
      const url = req.url;
      const method = req.method;
      const msg = e?.message || String(e);
      const stack = e?.stack || "";
      try {
        console.error("handler_error", { id, url, method, msg, stack });
      } catch {
      }
      if (env.OTLP_ENDPOINT) {
        const payload = { type: "error", id, url, method, msg, stack };
        try {
          await fetch(env.OTLP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        } catch {
        }
      }
      const body = JSON.stringify({ ok: false, error: { id, message: msg } });
      return new Response(body, { status: 500, headers: { "Content-Type": "application/json", "x-error-id": id } });
    }
  };
}
__name(withErrorLogging, "withErrorLogging");
var api_default = withErrorLogging(/* @__PURE__ */ __name(async function handler(req) {
  const citations = (req.headers.get("x-citations") || "").split(" ").filter(Boolean);
  const t = startTrace("openrouter-stream", { citations });
  const { stream, usage } = await routeAndStream({
    messages: [
      { role: "system", content: "You are BlueBanter" },
      { role: "user", content: citations.join(" ") }
    ]
  });
  const usageValue = await usage;
  await endTrace(t);
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "x-token-usage": String(usageValue)
    }
  });
}, "handler"));
var webCrypto = globalThis.crypto;
var subtle = webCrypto.subtle;
var __defProp22 = Object.defineProperty;
var __export2 = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp22(target, name, { get: all[name], enumerable: true });
}, "__export2");
var error_exports2 = {};
__export2(error_exports2, {
  UpstashError: /* @__PURE__ */ __name(() => UpstashError, "UpstashError"),
  UpstashJSONParseError: /* @__PURE__ */ __name(() => UpstashJSONParseError, "UpstashJSONParseError"),
  UrlError: /* @__PURE__ */ __name(() => UrlError, "UrlError")
});
var UpstashError = class extends Error {
  static {
    __name(this, "UpstashError");
  }
  constructor(message, options) {
    super(message, options);
    this.name = "UpstashError";
  }
};
var UrlError = class extends Error {
  static {
    __name(this, "UrlError");
  }
  constructor(url) {
    super(
      `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
    );
    this.name = "UrlError";
  }
};
var UpstashJSONParseError = class extends UpstashError {
  static {
    __name(this, "UpstashJSONParseError");
  }
  constructor(body, options) {
    const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body;
    super(`Unable to parse response body: ${truncatedBody}`, options);
    this.name = "UpstashJSONParseError";
  }
};
function parseRecursive(obj) {
  const parsed = Array.isArray(obj) ? obj.map((o) => {
    try {
      return parseRecursive(o);
    } catch {
      return o;
    }
  }) : JSON.parse(obj);
  if (typeof parsed === "number" && parsed.toString() !== obj) {
    return obj;
  }
  return parsed;
}
__name(parseRecursive, "parseRecursive");
function parseResponse2(result) {
  try {
    return parseRecursive(result);
  } catch {
    return result;
  }
}
__name(parseResponse2, "parseResponse2");
function deserializeScanResponse(result) {
  return [result[0], ...parseResponse2(result.slice(1))];
}
__name(deserializeScanResponse, "deserializeScanResponse");
function deserializeScanWithTypesResponse(result) {
  const [cursor, keys] = result;
  const parsedKeys = [];
  for (let i = 0; i < keys.length; i += 2) {
    parsedKeys.push({ key: keys[i], type: keys[i + 1] });
  }
  return [cursor, parsedKeys];
}
__name(deserializeScanWithTypesResponse, "deserializeScanWithTypesResponse");
function mergeHeaders(...headers) {
  const merged = {};
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of Object.entries(header)) {
      if (value !== void 0 && value !== null) {
        merged[key] = value;
      }
    }
  }
  return merged;
}
__name(mergeHeaders, "mergeHeaders");
function kvArrayToObject(v2) {
  if (typeof v2 === "object" && v2 !== null && !Array.isArray(v2)) return v2;
  if (!Array.isArray(v2)) return {};
  const obj = {};
  for (let i = 0; i < v2.length; i += 2) {
    if (typeof v2[i] === "string") obj[v2[i]] = v2[i + 1];
  }
  return obj;
}
__name(kvArrayToObject, "kvArrayToObject");
var MAX_BUFFER_SIZE = 1024 * 1024;
var HttpClient = class {
  static {
    __name(this, "HttpClient");
  }
  baseUrl;
  headers;
  options;
  readYourWrites;
  upstashSyncToken = "";
  hasCredentials;
  retry;
  constructor(config) {
    this.options = {
      backend: config.options?.backend,
      agent: config.agent,
      responseEncoding: config.responseEncoding ?? "base64",
      // default to base64
      cache: config.cache,
      signal: config.signal,
      keepAlive: config.keepAlive ?? true
    };
    this.upstashSyncToken = "";
    this.readYourWrites = config.readYourWrites ?? true;
    this.baseUrl = (config.baseUrl || "").replace(/\/$/, "");
    const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
    if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
      throw new UrlError(this.baseUrl);
    }
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers
    };
    this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
    if (this.options.responseEncoding === "base64") {
      this.headers["Upstash-Encoding"] = "base64";
    }
    this.retry = typeof config.retry === "boolean" && !config.retry ? {
      attempts: 1,
      backoff: /* @__PURE__ */ __name(() => 0, "backoff")
    } : {
      attempts: config.retry?.retries ?? 5,
      backoff: config.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
    };
  }
  mergeTelemetry(telemetry) {
    this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
    this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
    this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
  }
  async request(req) {
    const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
    const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
    const isEventStream = requestHeaders.Accept === "text/event-stream";
    const signal = req.signal ?? this.options.signal;
    const isSignalFunction = typeof signal === "function";
    const requestOptions = {
      cache: this.options.cache,
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(req.body),
      keepalive: this.options.keepAlive,
      agent: this.options.agent,
      signal: isSignalFunction ? signal() : signal,
      /**
       * Fastly specific
       */
      backend: this.options.backend
    };
    if (!this.hasCredentials) {
      console.warn(
        "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
      );
    }
    if (this.readYourWrites) {
      const newHeader = this.upstashSyncToken;
      this.headers["upstash-sync-token"] = newHeader;
    }
    let res = null;
    let error = null;
    for (let i = 0; i <= this.retry.attempts; i++) {
      try {
        res = await fetch(requestUrl, requestOptions);
        break;
      } catch (error_) {
        if (requestOptions.signal?.aborted && isSignalFunction) {
          throw error_;
        } else if (requestOptions.signal?.aborted) {
          const myBlob = new Blob([
            JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" })
          ]);
          const myOptions = {
            status: 200,
            statusText: requestOptions.signal.reason ?? "Aborted"
          };
          res = new Response(myBlob, myOptions);
          break;
        }
        error = error_;
        if (i < this.retry.attempts) {
          await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
        }
      }
    }
    if (!res) {
      throw error ?? new Error("Exhausted all retries");
    }
    if (!res.ok) {
      let body2;
      const rawBody2 = await res.text();
      try {
        body2 = JSON.parse(rawBody2);
      } catch (error2) {
        throw new UpstashJSONParseError(rawBody2, { cause: error2 });
      }
      throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
    }
    if (this.readYourWrites) {
      const headers = res.headers;
      this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
    }
    if (isEventStream && req && req.onMessage && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      (async () => {
        try {
          let buffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            if (buffer.length > MAX_BUFFER_SIZE) {
              throw new Error("Buffer size exceeded (1MB)");
            }
            for (const line2 of lines) {
              if (line2.startsWith("data: ")) {
                const data = line2.slice(6);
                req.onMessage?.(data);
              }
            }
          }
        } catch (error2) {
          if (error2 instanceof Error && error2.name === "AbortError") {
          } else {
            console.error("Stream reading error:", error2);
          }
        } finally {
          try {
            await reader.cancel();
          } catch {
          }
        }
      })();
      return { result: 1 };
    }
    let body;
    const rawBody = await res.text();
    try {
      body = JSON.parse(rawBody);
    } catch (error2) {
      throw new UpstashJSONParseError(rawBody, { cause: error2 });
    }
    if (this.readYourWrites) {
      const headers = res.headers;
      this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
    }
    if (this.options.responseEncoding === "base64") {
      if (Array.isArray(body)) {
        return body.map(({ result: result2, error: error2 }) => ({
          result: decode(result2),
          error: error2
        }));
      }
      const result = decode(body.result);
      return { result, error: body.error };
    }
    return body;
  }
};
function base64decode(b64) {
  let dec = "";
  try {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    dec = new TextDecoder().decode(bytes);
  } catch {
    dec = b64;
  }
  return dec;
}
__name(base64decode, "base64decode");
function decode(raw) {
  let result = void 0;
  switch (typeof raw) {
    case "undefined": {
      return raw;
    }
    case "number": {
      result = raw;
      break;
    }
    case "object": {
      if (Array.isArray(raw)) {
        result = raw.map(
          (v2) => typeof v2 === "string" ? base64decode(v2) : Array.isArray(v2) ? v2.map((element) => decode(element)) : v2
        );
      } else {
        result = null;
      }
      break;
    }
    case "string": {
      result = raw === "OK" ? "OK" : base64decode(raw);
      break;
    }
    default: {
      break;
    }
  }
  return result;
}
__name(decode, "decode");
function merge(obj, key, value) {
  if (!value) {
    return obj;
  }
  obj[key] = obj[key] ? [obj[key], value].join(",") : value;
  return obj;
}
__name(merge, "merge");
var defaultSerializer = /* @__PURE__ */ __name((c) => {
  switch (typeof c) {
    case "string":
    case "number":
    case "boolean": {
      return c;
    }
    default: {
      return JSON.stringify(c);
    }
  }
}, "defaultSerializer");
var Command = class {
  static {
    __name(this, "Command");
  }
  command;
  serialize;
  deserialize;
  headers;
  path;
  onMessage;
  isStreaming;
  signal;
  /**
   * Create a new command instance.
   *
   * You can define a custom `deserialize` function. By default we try to deserialize as json.
   */
  constructor(command, opts) {
    this.serialize = defaultSerializer;
    this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse2 : (x2) => x2;
    this.command = command.map((c) => this.serialize(c));
    this.headers = opts?.headers;
    this.path = opts?.path;
    this.onMessage = opts?.streamOptions?.onMessage;
    this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
    this.signal = opts?.streamOptions?.signal;
    if (opts?.latencyLogging) {
      const originalExec = this.exec.bind(this);
      this.exec = async (client) => {
        const start = performance.now();
        const result = await originalExec(client);
        const end = performance.now();
        const loggerResult = (end - start).toFixed(2);
        console.log(
          `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
        );
        return result;
      };
    }
  }
  /**
   * Execute the command using a client.
   */
  async exec(client) {
    const { result, error } = await client.request({
      body: this.command,
      path: this.path,
      upstashSyncToken: client.upstashSyncToken,
      headers: this.headers,
      onMessage: this.onMessage,
      isStreaming: this.isStreaming,
      signal: this.signal
    });
    if (error) {
      throw new UpstashError(error);
    }
    if (result === void 0) {
      throw new TypeError("Request did not return a result");
    }
    return this.deserialize(result);
  }
};
var ExecCommand = class extends Command {
  static {
    __name(this, "ExecCommand");
  }
  constructor(cmd, opts) {
    const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
    super(normalizedCmd, opts);
  }
};
var FIELD_TYPES = [
  "TEXT",
  "U64",
  "I64",
  "F64",
  "BOOL",
  "DATE",
  "KEYWORD",
  "FACET"
];
function isFieldType(value) {
  return typeof value === "string" && FIELD_TYPES.includes(value);
}
__name(isFieldType, "isFieldType");
function isDetailedField(value) {
  return typeof value === "object" && value !== null && "type" in value && isFieldType(value.type);
}
__name(isDetailedField, "isDetailedField");
function isNestedSchema(value) {
  return typeof value === "object" && value !== null && !isDetailedField(value);
}
__name(isNestedSchema, "isNestedSchema");
function flattenSchema(schema, pathPrefix = []) {
  const fields = [];
  for (const [key, value] of Object.entries(schema)) {
    const currentPath = [...pathPrefix, key];
    const pathString = currentPath.join(".");
    if (isFieldType(value)) {
      fields.push({
        path: pathString,
        type: value
      });
    } else if (isDetailedField(value)) {
      fields.push({
        path: pathString,
        type: value.type,
        fast: "fast" in value ? value.fast : void 0,
        noTokenize: "noTokenize" in value ? value.noTokenize : void 0,
        noStem: "noStem" in value ? value.noStem : void 0,
        from: "from" in value ? value.from : void 0
      });
    } else if (isNestedSchema(value)) {
      const nestedFields = flattenSchema(value, currentPath);
      fields.push(...nestedFields);
    }
  }
  return fields;
}
__name(flattenSchema, "flattenSchema");
function deserializeQueryResponse(rawResponse) {
  return rawResponse.map((itemRaw) => {
    const raw = itemRaw;
    const key = raw[0];
    const score = Number(raw[1]);
    const rawFields = raw[2];
    if (rawFields === void 0) {
      return { key, score };
    }
    if (!Array.isArray(rawFields) || rawFields.length === 0) {
      return { key, score, data: {} };
    }
    let data = {};
    for (const fieldRaw of rawFields) {
      const key2 = fieldRaw[0];
      const value = fieldRaw[1];
      const pathParts = key2.split(".");
      if (pathParts.length === 1) {
        data[key2] = value;
      } else {
        let currentObj = data;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const pathPart = pathParts[i];
          if (!(pathPart in currentObj)) {
            currentObj[pathPart] = {};
          }
          currentObj = currentObj[pathPart];
        }
        currentObj[pathParts.at(-1)] = value;
      }
    }
    if ("$" in data) {
      data = data["$"];
    }
    return { key, score, data };
  });
}
__name(deserializeQueryResponse, "deserializeQueryResponse");
function deserializeDescribeResponse(rawResponse) {
  const description = {};
  for (let i = 0; i < rawResponse.length; i += 2) {
    const descriptor = rawResponse[i];
    switch (descriptor) {
      case "name": {
        description["name"] = rawResponse[i + 1];
        break;
      }
      case "type": {
        description["dataType"] = rawResponse[i + 1].toLowerCase();
        break;
      }
      case "prefixes": {
        description["prefixes"] = rawResponse[i + 1];
        break;
      }
      case "language": {
        description["language"] = rawResponse[i + 1];
        break;
      }
      case "schema": {
        const schema = {};
        for (const fieldDescription of rawResponse[i + 1]) {
          const fieldName = fieldDescription[0];
          const fieldInfo = { type: fieldDescription[1] };
          if (fieldDescription.length > 2) {
            for (let j = 2; j < fieldDescription.length; j++) {
              const fieldOption = fieldDescription[j];
              switch (fieldOption) {
                case "NOSTEM": {
                  fieldInfo.noStem = true;
                  break;
                }
                case "NOTOKENIZE": {
                  fieldInfo.noTokenize = true;
                  break;
                }
                case "FAST": {
                  fieldInfo.fast = true;
                  break;
                }
                case "FROM": {
                  fieldInfo.from = fieldDescription[++j];
                  break;
                }
              }
            }
          }
          schema[fieldName] = fieldInfo;
        }
        description["schema"] = schema;
        break;
      }
    }
  }
  return description;
}
__name(deserializeDescribeResponse, "deserializeDescribeResponse");
function parseCountResponse(rawResponse) {
  return typeof rawResponse === "number" ? rawResponse : Number.parseInt(rawResponse, 10);
}
__name(parseCountResponse, "parseCountResponse");
function deserializeAggregateResponse(rawResponse) {
  return parseAggregationArray(rawResponse);
}
__name(deserializeAggregateResponse, "deserializeAggregateResponse");
function parseAggregationArray(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "string") {
        result[key] = value[0] === "buckets" ? parseBucketsValue(value) : parseStatsValue(value);
      } else {
        result[key] = parseAggregationArray(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}
__name(parseAggregationArray, "parseAggregationArray");
function coerceNumericString(value) {
  if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}
__name(coerceNumericString, "coerceNumericString");
function parseStatsValue(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    if (Array.isArray(value) && value.length > 0) {
      if (typeof value[0] === "string") {
        result[key] = parseStatsValue(value);
      } else if (Array.isArray(value[0]) && typeof value[0][0] === "string") {
        result[key] = value.map((item) => parseStatsValue(item));
      } else {
        result[key] = value;
      }
    } else {
      result[key] = coerceNumericString(value);
    }
  }
  return result;
}
__name(parseStatsValue, "parseStatsValue");
function parseBucketsValue(arr) {
  if (arr[0] === "buckets" && Array.isArray(arr[1])) {
    const result = {
      buckets: arr[1].map((bucket) => {
        const bucketObj = {};
        for (let i = 0; i < bucket.length; i += 2) {
          const key = bucket[i];
          const value = bucket[i + 1];
          bucketObj[key] = Array.isArray(value) && value.length > 0 && typeof value[0] === "string" ? parseStatsValue(value) : value;
        }
        return bucketObj;
      })
    };
    for (let i = 2; i < arr.length; i += 2) {
      result[arr[i]] = arr[i + 1];
    }
    return result;
  }
  return arr;
}
__name(parseBucketsValue, "parseBucketsValue");
function buildQueryCommand(redisCommand, name, options) {
  const query = JSON.stringify(options?.filter ?? {});
  const command = [redisCommand, name, query];
  if (options?.limit !== void 0) {
    command.push("LIMIT", options.limit.toString());
  }
  if (options?.offset !== void 0) {
    command.push("OFFSET", options.offset.toString());
  }
  if (options?.select && Object.keys(options.select).length === 0) {
    command.push("NOCONTENT");
  }
  if (options) {
    if ("orderBy" in options && options.orderBy) {
      command.push("ORDERBY");
      for (const [field, direction] of Object.entries(options.orderBy)) {
        command.push(field, direction);
      }
    } else if ("scoreFunc" in options && options.scoreFunc) {
      command.push("SCOREFUNC", ...buildScoreFunc(options.scoreFunc));
    }
  }
  if (options?.highlight) {
    command.push(
      "HIGHLIGHT",
      "FIELDS",
      options.highlight.fields.length.toString(),
      ...options.highlight.fields
    );
    if (options.highlight.preTag && options.highlight.postTag) {
      command.push("TAGS", options.highlight.preTag, options.highlight.postTag);
    }
  }
  if (options?.select && Object.keys(options.select).length > 0) {
    command.push(
      "SELECT",
      Object.keys(options.select).length.toString(),
      ...Object.keys(options.select)
    );
  }
  return command;
}
__name(buildQueryCommand, "buildQueryCommand");
function buildScoreFunc(scoreBy) {
  const result = [];
  if (typeof scoreBy === "string") {
    result.push("FIELDVALUE", scoreBy);
  } else if ("fields" in scoreBy) {
    if (scoreBy.combineMode) {
      result.push("COMBINEMODE", scoreBy.combineMode.toUpperCase());
    }
    if (scoreBy.scoreMode) {
      result.push("SCOREMODE", scoreBy.scoreMode.toUpperCase());
    }
    for (const field of scoreBy.fields) {
      result.push(...buildScoreFuncField(field));
    }
  } else {
    result.push(...buildScoreFuncField(scoreBy));
  }
  return result;
}
__name(buildScoreFunc, "buildScoreFunc");
function buildScoreFuncField(field) {
  const result = [];
  if (typeof field === "string") {
    result.push("FIELDVALUE", field);
  } else {
    if (field.scoreMode) {
      result.push("SCOREMODE", field.scoreMode.toUpperCase());
    }
    result.push("FIELDVALUE", field.field);
    if (field.modifier) {
      result.push("MODIFIER", field.modifier.toUpperCase());
    }
    if (field.factor !== void 0) {
      result.push("FACTOR", field.factor.toString());
    }
    if (field.missing !== void 0) {
      result.push("MISSING", field.missing.toString());
    }
  }
  return result;
}
__name(buildScoreFuncField, "buildScoreFuncField");
function buildCreateIndexCommand(params) {
  const { name, schema, dataType, prefix, language, skipInitialScan, existsOk } = params;
  const prefixArray = Array.isArray(prefix) ? prefix : [prefix];
  const payload = [
    name,
    ...skipInitialScan ? ["SKIPINITIALSCAN"] : [],
    ...existsOk ? ["EXISTSOK"] : [],
    "ON",
    dataType.toUpperCase(),
    "PREFIX",
    prefixArray.length.toString(),
    ...prefixArray,
    ...language ? ["LANGUAGE", language] : [],
    "SCHEMA"
  ];
  const fields = flattenSchema(schema);
  for (const field of fields) {
    payload.push(field.path, field.type);
    if (field.fast) {
      payload.push("FAST");
    }
    if (field.noTokenize) {
      payload.push("NOTOKENIZE");
    }
    if (field.noStem) {
      payload.push("NOSTEM");
    }
    if (field.from) {
      payload.push("FROM", field.from);
    }
  }
  return ["SEARCH.CREATE", ...payload];
}
__name(buildCreateIndexCommand, "buildCreateIndexCommand");
function buildAggregateCommand(name, options) {
  const query = JSON.stringify(options?.filter ?? {});
  const aggregations = JSON.stringify(options.aggregations);
  return ["SEARCH.AGGREGATE", name, query, aggregations];
}
__name(buildAggregateCommand, "buildAggregateCommand");
var SearchIndex = class {
  static {
    __name(this, "SearchIndex");
  }
  name;
  schema;
  client;
  constructor({ name, schema, client }) {
    this.name = name;
    this.schema = schema;
    this.client = client;
  }
  async waitIndexing() {
    const command = ["SEARCH.WAITINDEXING", this.name];
    return await new ExecCommand(command).exec(this.client);
  }
  async describe() {
    const command = ["SEARCH.DESCRIBE", this.name];
    const rawResult = await new ExecCommand(command).exec(
      this.client
    );
    if (!rawResult) return null;
    return deserializeDescribeResponse(rawResult);
  }
  async query(options) {
    const command = buildQueryCommand("SEARCH.QUERY", this.name, options);
    const rawResult = await new ExecCommand(command).exec(
      this.client
    );
    if (!rawResult) return rawResult;
    return deserializeQueryResponse(rawResult);
  }
  async aggregate(options) {
    const command = buildAggregateCommand(this.name, options);
    const rawResult = await new ExecCommand(
      command
    ).exec(this.client);
    return deserializeAggregateResponse(rawResult);
  }
  async count({ filter }) {
    const command = buildQueryCommand("SEARCH.COUNT", this.name, { filter });
    const rawResult = await new ExecCommand(command).exec(
      this.client
    );
    return { count: parseCountResponse(rawResult) };
  }
  async drop() {
    const command = ["SEARCH.DROP", this.name];
    const result = await new ExecCommand(command).exec(this.client);
    return result;
  }
  async addAlias({ alias }) {
    const command = ["SEARCH.ALIASADD", alias, this.name];
    const result = await new ExecCommand(command).exec(this.client);
    return result;
  }
};
async function createIndex(client, params) {
  const { name, schema } = params;
  const createIndexCommand = buildCreateIndexCommand(params);
  await new ExecCommand(createIndexCommand).exec(client);
  return initIndex(client, { name, schema });
}
__name(createIndex, "createIndex");
function initIndex(client, params) {
  const { name, schema } = params;
  return new SearchIndex({ name, schema, client });
}
__name(initIndex, "initIndex");
async function listAliases(client) {
  const command = ["SEARCH.LISTALIASES"];
  const rawResult = await new ExecCommand(command).exec(client);
  if (rawResult === 0 || Array.isArray(rawResult) && rawResult.length === 0) {
    return {};
  }
  if (!Array.isArray(rawResult)) {
    return {};
  }
  const aliases = {};
  for (const pair of rawResult) {
    if (Array.isArray(pair) && pair.length === 2) {
      const [alias, index2] = pair;
      aliases[alias] = index2;
    }
  }
  return aliases;
}
__name(listAliases, "listAliases");
async function addAlias(client, { indexName, alias }) {
  const command = ["SEARCH.ALIASADD", alias, indexName];
  const result = await new ExecCommand(command).exec(client);
  return result;
}
__name(addAlias, "addAlias");
async function delAlias(client, { alias }) {
  const command = ["SEARCH.ALIASDEL", alias];
  const result = await new ExecCommand(command).exec(client);
  return result;
}
__name(delAlias, "delAlias");
function deserialize(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      obj[key] = JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
__name(deserialize, "deserialize");
var HRandFieldCommand = class extends Command {
  static {
    __name(this, "HRandFieldCommand");
  }
  constructor(cmd, opts) {
    const command = ["hrandfield", cmd[0]];
    if (typeof cmd[1] === "number") {
      command.push(cmd[1]);
    }
    if (cmd[2]) {
      command.push("WITHVALUES");
    }
    super(command, {
      // @ts-expect-error to silence compiler
      deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
      ...opts
    });
  }
};
var AppendCommand = class extends Command {
  static {
    __name(this, "AppendCommand");
  }
  constructor(cmd, opts) {
    super(["append", ...cmd], opts);
  }
};
var BitCountCommand = class extends Command {
  static {
    __name(this, "BitCountCommand");
  }
  constructor([key, start, end], opts) {
    const command = ["bitcount", key];
    if (typeof start === "number") {
      command.push(start);
    }
    if (typeof end === "number") {
      command.push(end);
    }
    super(command, opts);
  }
};
var BitFieldCommand = class {
  static {
    __name(this, "BitFieldCommand");
  }
  constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
    this.client = client;
    this.opts = opts;
    this.execOperation = execOperation;
    this.command = ["bitfield", ...args];
  }
  command;
  chain(...args) {
    this.command.push(...args);
    return this;
  }
  get(...args) {
    return this.chain("get", ...args);
  }
  set(...args) {
    return this.chain("set", ...args);
  }
  incrby(...args) {
    return this.chain("incrby", ...args);
  }
  overflow(overflow) {
    return this.chain("overflow", overflow);
  }
  exec() {
    const command = new Command(this.command, this.opts);
    return this.execOperation(command);
  }
};
var BitOpCommand = class extends Command {
  static {
    __name(this, "BitOpCommand");
  }
  constructor(cmd, opts) {
    super(["bitop", ...cmd], opts);
  }
};
var BitPosCommand = class extends Command {
  static {
    __name(this, "BitPosCommand");
  }
  constructor(cmd, opts) {
    super(["bitpos", ...cmd], opts);
  }
};
var ClientSetInfoCommand = class extends Command {
  static {
    __name(this, "ClientSetInfoCommand");
  }
  constructor([attribute, value], opts) {
    super(["CLIENT", "SETINFO", attribute.toUpperCase(), value], opts);
  }
};
var CopyCommand = class extends Command {
  static {
    __name(this, "CopyCommand");
  }
  constructor([key, destinationKey, opts], commandOptions) {
    super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
      ...commandOptions,
      deserialize(result) {
        if (result > 0) {
          return "COPIED";
        }
        return "NOT_COPIED";
      }
    });
  }
};
var DBSizeCommand = class extends Command {
  static {
    __name(this, "DBSizeCommand");
  }
  constructor(opts) {
    super(["dbsize"], opts);
  }
};
var DecrCommand = class extends Command {
  static {
    __name(this, "DecrCommand");
  }
  constructor(cmd, opts) {
    super(["decr", ...cmd], opts);
  }
};
var DecrByCommand = class extends Command {
  static {
    __name(this, "DecrByCommand");
  }
  constructor(cmd, opts) {
    super(["decrby", ...cmd], opts);
  }
};
var DelCommand = class extends Command {
  static {
    __name(this, "DelCommand");
  }
  constructor(cmd, opts) {
    super(["del", ...cmd], opts);
  }
};
var EchoCommand = class extends Command {
  static {
    __name(this, "EchoCommand");
  }
  constructor(cmd, opts) {
    super(["echo", ...cmd], opts);
  }
};
var EvalROCommand = class extends Command {
  static {
    __name(this, "EvalROCommand");
  }
  constructor([script, keys, args], opts) {
    super(["eval_ro", script, keys.length, ...keys, ...args ?? []], opts);
  }
};
var EvalCommand = class extends Command {
  static {
    __name(this, "EvalCommand");
  }
  constructor([script, keys, args], opts) {
    super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
  }
};
var EvalshaROCommand = class extends Command {
  static {
    __name(this, "EvalshaROCommand");
  }
  constructor([sha, keys, args], opts) {
    super(["evalsha_ro", sha, keys.length, ...keys, ...args ?? []], opts);
  }
};
var EvalshaCommand = class extends Command {
  static {
    __name(this, "EvalshaCommand");
  }
  constructor([sha, keys, args], opts) {
    super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
  }
};
var ExistsCommand = class extends Command {
  static {
    __name(this, "ExistsCommand");
  }
  constructor(cmd, opts) {
    super(["exists", ...cmd], opts);
  }
};
var ExpireCommand = class extends Command {
  static {
    __name(this, "ExpireCommand");
  }
  constructor(cmd, opts) {
    super(["expire", ...cmd.filter(Boolean)], opts);
  }
};
var ExpireAtCommand = class extends Command {
  static {
    __name(this, "ExpireAtCommand");
  }
  constructor(cmd, opts) {
    super(["expireat", ...cmd], opts);
  }
};
var FCallCommand = class extends Command {
  static {
    __name(this, "FCallCommand");
  }
  constructor([functionName, keys, args], opts) {
    super(["fcall", functionName, ...keys ? [keys.length, ...keys] : [0], ...args ?? []], opts);
  }
};
var FCallRoCommand = class extends Command {
  static {
    __name(this, "FCallRoCommand");
  }
  constructor([functionName, keys, args], opts) {
    super(
      ["fcall_ro", functionName, ...keys ? [keys.length, ...keys] : [0], ...args ?? []],
      opts
    );
  }
};
var FlushAllCommand = class extends Command {
  static {
    __name(this, "FlushAllCommand");
  }
  constructor(args, opts) {
    const command = ["flushall"];
    if (args && args.length > 0 && args[0].async) {
      command.push("async");
    }
    super(command, opts);
  }
};
var FlushDBCommand = class extends Command {
  static {
    __name(this, "FlushDBCommand");
  }
  constructor([opts], cmdOpts) {
    const command = ["flushdb"];
    if (opts?.async) {
      command.push("async");
    }
    super(command, cmdOpts);
  }
};
var FunctionDeleteCommand = class extends Command {
  static {
    __name(this, "FunctionDeleteCommand");
  }
  constructor([libraryName], opts) {
    super(["function", "delete", libraryName], opts);
  }
};
var FunctionFlushCommand = class extends Command {
  static {
    __name(this, "FunctionFlushCommand");
  }
  constructor(opts) {
    super(["function", "flush"], opts);
  }
};
var FunctionListCommand = class extends Command {
  static {
    __name(this, "FunctionListCommand");
  }
  constructor([args], opts) {
    const command = ["function", "list"];
    if (args?.libraryName) {
      command.push("libraryname", args.libraryName);
    }
    if (args?.withCode) {
      command.push("withcode");
    }
    super(command, { deserialize: deserialize2, ...opts });
  }
};
function deserialize2(result) {
  if (!Array.isArray(result)) return [];
  return result.map((libRaw) => {
    const lib = kvArrayToObject(libRaw);
    const functionsParsed = lib.functions.map(
      (fnRaw) => kvArrayToObject(fnRaw)
    );
    return {
      libraryName: lib.library_name,
      engine: lib.engine,
      functions: functionsParsed.map((fn) => ({
        name: fn.name,
        description: fn.description ?? void 0,
        flags: fn.flags
      })),
      libraryCode: lib.library_code
    };
  });
}
__name(deserialize2, "deserialize2");
var FunctionLoadCommand = class extends Command {
  static {
    __name(this, "FunctionLoadCommand");
  }
  constructor([args], opts) {
    super(["function", "load", ...args.replace ? ["replace"] : [], args.code], opts);
  }
};
var FunctionStatsCommand = class extends Command {
  static {
    __name(this, "FunctionStatsCommand");
  }
  constructor(opts) {
    super(["function", "stats"], { deserialize: deserialize3, ...opts });
  }
};
function deserialize3(result) {
  const rawEngines = kvArrayToObject(kvArrayToObject(result).engines);
  const parsedEngines = Object.fromEntries(
    Object.entries(rawEngines).map(([key, value]) => [key, kvArrayToObject(value)])
  );
  const final = {
    engines: Object.fromEntries(
      Object.entries(parsedEngines).map(([key, value]) => [
        key,
        {
          librariesCount: value.libraries_count,
          functionsCount: value.functions_count
        }
      ])
    )
  };
  return final;
}
__name(deserialize3, "deserialize3");
var GeoAddCommand = class extends Command {
  static {
    __name(this, "GeoAddCommand");
  }
  constructor([key, arg1, ...arg2], opts) {
    const command = ["geoadd", key];
    if ("nx" in arg1 && arg1.nx) {
      command.push("nx");
    } else if ("xx" in arg1 && arg1.xx) {
      command.push("xx");
    }
    if ("ch" in arg1 && arg1.ch) {
      command.push("ch");
    }
    if ("latitude" in arg1 && arg1.latitude) {
      command.push(arg1.longitude, arg1.latitude, arg1.member);
    }
    command.push(
      ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
    );
    super(command, opts);
  }
};
var GeoDistCommand = class extends Command {
  static {
    __name(this, "GeoDistCommand");
  }
  constructor([key, member1, member2, unit = "M"], opts) {
    super(["GEODIST", key, member1, member2, unit], opts);
  }
};
var GeoHashCommand = class extends Command {
  static {
    __name(this, "GeoHashCommand");
  }
  constructor(cmd, opts) {
    const [key] = cmd;
    const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
    super(["GEOHASH", key, ...members], opts);
  }
};
var GeoPosCommand = class extends Command {
  static {
    __name(this, "GeoPosCommand");
  }
  constructor(cmd, opts) {
    const [key] = cmd;
    const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
    super(["GEOPOS", key, ...members], {
      deserialize: /* @__PURE__ */ __name((result) => transform(result), "deserialize"),
      ...opts
    });
  }
};
function transform(result) {
  const final = [];
  for (const pos of result) {
    if (!pos?.[0] || !pos?.[1]) {
      continue;
    }
    final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
  }
  return final;
}
__name(transform, "transform");
var GeoSearchCommand = class extends Command {
  static {
    __name(this, "GeoSearchCommand");
  }
  constructor([key, centerPoint, shape, order, opts], commandOptions) {
    const command = ["GEOSEARCH", key];
    if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
      command.push(centerPoint.type, centerPoint.member);
    }
    if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
      command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
    }
    if (shape.type === "BYRADIUS" || shape.type === "byradius") {
      command.push(shape.type, shape.radius, shape.radiusType);
    }
    if (shape.type === "BYBOX" || shape.type === "bybox") {
      command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
    }
    command.push(order);
    if (opts?.count) {
      command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
    }
    const transform2 = /* @__PURE__ */ __name((result) => {
      if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
        return result.map((member) => {
          try {
            return { member: JSON.parse(member) };
          } catch {
            return { member };
          }
        });
      }
      return result.map((members) => {
        let counter = 1;
        const obj = {};
        try {
          obj.member = JSON.parse(members[0]);
        } catch {
          obj.member = members[0];
        }
        if (opts.withDist) {
          obj.dist = Number.parseFloat(members[counter++]);
        }
        if (opts.withHash) {
          obj.hash = members[counter++].toString();
        }
        if (opts.withCoord) {
          obj.coord = {
            long: Number.parseFloat(members[counter][0]),
            lat: Number.parseFloat(members[counter][1])
          };
        }
        return obj;
      });
    }, "transform2");
    super(
      [
        ...command,
        ...opts?.withCoord ? ["WITHCOORD"] : [],
        ...opts?.withDist ? ["WITHDIST"] : [],
        ...opts?.withHash ? ["WITHHASH"] : []
      ],
      {
        deserialize: transform2,
        ...commandOptions
      }
    );
  }
};
var GeoSearchStoreCommand = class extends Command {
  static {
    __name(this, "GeoSearchStoreCommand");
  }
  constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
    const command = ["GEOSEARCHSTORE", destination, key];
    if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
      command.push(centerPoint.type, centerPoint.member);
    }
    if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
      command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
    }
    if (shape.type === "BYRADIUS" || shape.type === "byradius") {
      command.push(shape.type, shape.radius, shape.radiusType);
    }
    if (shape.type === "BYBOX" || shape.type === "bybox") {
      command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
    }
    command.push(order);
    if (opts?.count) {
      command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
    }
    super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
  }
};
var GetCommand = class extends Command {
  static {
    __name(this, "GetCommand");
  }
  constructor(cmd, opts) {
    super(["get", ...cmd], opts);
  }
};
var GetBitCommand = class extends Command {
  static {
    __name(this, "GetBitCommand");
  }
  constructor(cmd, opts) {
    super(["getbit", ...cmd], opts);
  }
};
var GetDelCommand = class extends Command {
  static {
    __name(this, "GetDelCommand");
  }
  constructor(cmd, opts) {
    super(["getdel", ...cmd], opts);
  }
};
var GetExCommand = class extends Command {
  static {
    __name(this, "GetExCommand");
  }
  constructor([key, opts], cmdOpts) {
    const command = ["getex", key];
    if (opts) {
      if ("ex" in opts && typeof opts.ex === "number") {
        command.push("ex", opts.ex);
      } else if ("px" in opts && typeof opts.px === "number") {
        command.push("px", opts.px);
      } else if ("exat" in opts && typeof opts.exat === "number") {
        command.push("exat", opts.exat);
      } else if ("pxat" in opts && typeof opts.pxat === "number") {
        command.push("pxat", opts.pxat);
      } else if ("persist" in opts && opts.persist) {
        command.push("persist");
      }
    }
    super(command, cmdOpts);
  }
};
var GetRangeCommand = class extends Command {
  static {
    __name(this, "GetRangeCommand");
  }
  constructor(cmd, opts) {
    super(["getrange", ...cmd], opts);
  }
};
var GetSetCommand = class extends Command {
  static {
    __name(this, "GetSetCommand");
  }
  constructor(cmd, opts) {
    super(["getset", ...cmd], opts);
  }
};
var HDelCommand = class extends Command {
  static {
    __name(this, "HDelCommand");
  }
  constructor(cmd, opts) {
    super(["hdel", ...cmd], opts);
  }
};
var HExistsCommand = class extends Command {
  static {
    __name(this, "HExistsCommand");
  }
  constructor(cmd, opts) {
    super(["hexists", ...cmd], opts);
  }
};
var HExpireCommand = class extends Command {
  static {
    __name(this, "HExpireCommand");
  }
  constructor(cmd, opts) {
    const [key, fields, seconds, option] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(
      [
        "hexpire",
        key,
        seconds,
        ...option ? [option] : [],
        "FIELDS",
        fieldArray.length,
        ...fieldArray
      ],
      opts
    );
  }
};
var HExpireAtCommand = class extends Command {
  static {
    __name(this, "HExpireAtCommand");
  }
  constructor(cmd, opts) {
    const [key, fields, timestamp2, option] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(
      [
        "hexpireat",
        key,
        timestamp2,
        ...option ? [option] : [],
        "FIELDS",
        fieldArray.length,
        ...fieldArray
      ],
      opts
    );
  }
};
var HExpireTimeCommand = class extends Command {
  static {
    __name(this, "HExpireTimeCommand");
  }
  constructor(cmd, opts) {
    const [key, fields] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
  }
};
var HPersistCommand = class extends Command {
  static {
    __name(this, "HPersistCommand");
  }
  constructor(cmd, opts) {
    const [key, fields] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
  }
};
var HPExpireCommand = class extends Command {
  static {
    __name(this, "HPExpireCommand");
  }
  constructor(cmd, opts) {
    const [key, fields, milliseconds, option] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(
      [
        "hpexpire",
        key,
        milliseconds,
        ...option ? [option] : [],
        "FIELDS",
        fieldArray.length,
        ...fieldArray
      ],
      opts
    );
  }
};
var HPExpireAtCommand = class extends Command {
  static {
    __name(this, "HPExpireAtCommand");
  }
  constructor(cmd, opts) {
    const [key, fields, timestamp2, option] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(
      [
        "hpexpireat",
        key,
        timestamp2,
        ...option ? [option] : [],
        "FIELDS",
        fieldArray.length,
        ...fieldArray
      ],
      opts
    );
  }
};
var HPExpireTimeCommand = class extends Command {
  static {
    __name(this, "HPExpireTimeCommand");
  }
  constructor(cmd, opts) {
    const [key, fields] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
  }
};
var HPTtlCommand = class extends Command {
  static {
    __name(this, "HPTtlCommand");
  }
  constructor(cmd, opts) {
    const [key, fields] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
  }
};
var HGetCommand = class extends Command {
  static {
    __name(this, "HGetCommand");
  }
  constructor(cmd, opts) {
    super(["hget", ...cmd], opts);
  }
};
function deserialize4(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
      obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
__name(deserialize4, "deserialize4");
var HGetAllCommand = class extends Command {
  static {
    __name(this, "HGetAllCommand");
  }
  constructor(cmd, opts) {
    super(["hgetall", ...cmd], {
      deserialize: /* @__PURE__ */ __name((result) => deserialize4(result), "deserialize"),
      ...opts
    });
  }
};
function deserialize5(fields, result) {
  if (result.every((field) => field === null)) {
    return null;
  }
  const obj = {};
  for (const [i, field] of fields.entries()) {
    try {
      obj[field] = JSON.parse(result[i]);
    } catch {
      obj[field] = result[i];
    }
  }
  return obj;
}
__name(deserialize5, "deserialize5");
var HMGetCommand = class extends Command {
  static {
    __name(this, "HMGetCommand");
  }
  constructor([key, ...fields], opts) {
    super(["hmget", key, ...fields], {
      deserialize: /* @__PURE__ */ __name((result) => deserialize5(fields, result), "deserialize"),
      ...opts
    });
  }
};
var HGetDelCommand = class extends Command {
  static {
    __name(this, "HGetDelCommand");
  }
  constructor([key, ...fields], opts) {
    super(["hgetdel", key, "FIELDS", fields.length, ...fields], {
      deserialize: /* @__PURE__ */ __name((result) => deserialize5(fields.map(String), result), "deserialize"),
      ...opts
    });
  }
};
var HGetExCommand = class extends Command {
  static {
    __name(this, "HGetExCommand");
  }
  constructor([key, opts, ...fields], cmdOpts) {
    const command = ["hgetex", key];
    if ("ex" in opts && typeof opts.ex === "number") {
      command.push("EX", opts.ex);
    } else if ("px" in opts && typeof opts.px === "number") {
      command.push("PX", opts.px);
    } else if ("exat" in opts && typeof opts.exat === "number") {
      command.push("EXAT", opts.exat);
    } else if ("pxat" in opts && typeof opts.pxat === "number") {
      command.push("PXAT", opts.pxat);
    } else if ("persist" in opts && opts.persist) {
      command.push("PERSIST");
    }
    command.push("FIELDS", fields.length, ...fields);
    super(command, {
      deserialize: /* @__PURE__ */ __name((result) => deserialize5(fields.map(String), result), "deserialize"),
      ...cmdOpts
    });
  }
};
var HIncrByCommand = class extends Command {
  static {
    __name(this, "HIncrByCommand");
  }
  constructor(cmd, opts) {
    super(["hincrby", ...cmd], opts);
  }
};
var HIncrByFloatCommand = class extends Command {
  static {
    __name(this, "HIncrByFloatCommand");
  }
  constructor(cmd, opts) {
    super(["hincrbyfloat", ...cmd], opts);
  }
};
var HKeysCommand = class extends Command {
  static {
    __name(this, "HKeysCommand");
  }
  constructor([key], opts) {
    super(["hkeys", key], opts);
  }
};
var HLenCommand = class extends Command {
  static {
    __name(this, "HLenCommand");
  }
  constructor(cmd, opts) {
    super(["hlen", ...cmd], opts);
  }
};
var HMSetCommand = class extends Command {
  static {
    __name(this, "HMSetCommand");
  }
  constructor([key, kv], opts) {
    super(["hmset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
  }
};
var HScanCommand = class extends Command {
  static {
    __name(this, "HScanCommand");
  }
  constructor([key, cursor, cmdOpts], opts) {
    const command = ["hscan", key, cursor];
    if (cmdOpts?.match) {
      command.push("match", cmdOpts.match);
    }
    if (typeof cmdOpts?.count === "number") {
      command.push("count", cmdOpts.count);
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...opts
    });
  }
};
var HSetCommand = class extends Command {
  static {
    __name(this, "HSetCommand");
  }
  constructor([key, kv], opts) {
    super(["hset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
  }
};
var HSetExCommand = class extends Command {
  static {
    __name(this, "HSetExCommand");
  }
  constructor([key, opts, kv], cmdOpts) {
    const command = ["hsetex", key];
    if (opts.conditional) {
      command.push(opts.conditional.toUpperCase());
    }
    if (opts.expiration) {
      if ("ex" in opts.expiration && typeof opts.expiration.ex === "number") {
        command.push("EX", opts.expiration.ex);
      } else if ("px" in opts.expiration && typeof opts.expiration.px === "number") {
        command.push("PX", opts.expiration.px);
      } else if ("exat" in opts.expiration && typeof opts.expiration.exat === "number") {
        command.push("EXAT", opts.expiration.exat);
      } else if ("pxat" in opts.expiration && typeof opts.expiration.pxat === "number") {
        command.push("PXAT", opts.expiration.pxat);
      } else if ("keepttl" in opts.expiration && opts.expiration.keepttl) {
        command.push("KEEPTTL");
      }
    }
    const entries = Object.entries(kv);
    command.push("FIELDS", entries.length);
    for (const [field, value] of entries) {
      command.push(field, value);
    }
    super(command, cmdOpts);
  }
};
var HSetNXCommand = class extends Command {
  static {
    __name(this, "HSetNXCommand");
  }
  constructor(cmd, opts) {
    super(["hsetnx", ...cmd], opts);
  }
};
var HStrLenCommand = class extends Command {
  static {
    __name(this, "HStrLenCommand");
  }
  constructor(cmd, opts) {
    super(["hstrlen", ...cmd], opts);
  }
};
var HTtlCommand = class extends Command {
  static {
    __name(this, "HTtlCommand");
  }
  constructor(cmd, opts) {
    const [key, fields] = cmd;
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
  }
};
var HValsCommand = class extends Command {
  static {
    __name(this, "HValsCommand");
  }
  constructor(cmd, opts) {
    super(["hvals", ...cmd], opts);
  }
};
var IncrCommand = class extends Command {
  static {
    __name(this, "IncrCommand");
  }
  constructor(cmd, opts) {
    super(["incr", ...cmd], opts);
  }
};
var IncrByCommand = class extends Command {
  static {
    __name(this, "IncrByCommand");
  }
  constructor(cmd, opts) {
    super(["incrby", ...cmd], opts);
  }
};
var IncrByFloatCommand = class extends Command {
  static {
    __name(this, "IncrByFloatCommand");
  }
  constructor(cmd, opts) {
    super(["incrbyfloat", ...cmd], opts);
  }
};
var JsonArrAppendCommand = class extends Command {
  static {
    __name(this, "JsonArrAppendCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.ARRAPPEND", ...cmd], opts);
  }
};
var JsonArrIndexCommand = class extends Command {
  static {
    __name(this, "JsonArrIndexCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.ARRINDEX", ...cmd], opts);
  }
};
var JsonArrInsertCommand = class extends Command {
  static {
    __name(this, "JsonArrInsertCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.ARRINSERT", ...cmd], opts);
  }
};
var JsonArrLenCommand = class extends Command {
  static {
    __name(this, "JsonArrLenCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
  }
};
var JsonArrPopCommand = class extends Command {
  static {
    __name(this, "JsonArrPopCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.ARRPOP", ...cmd], opts);
  }
};
var JsonArrTrimCommand = class extends Command {
  static {
    __name(this, "JsonArrTrimCommand");
  }
  constructor(cmd, opts) {
    const path = cmd[1] ?? "$";
    const start = cmd[2] ?? 0;
    const stop = cmd[3] ?? 0;
    super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
  }
};
var JsonClearCommand = class extends Command {
  static {
    __name(this, "JsonClearCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.CLEAR", ...cmd], opts);
  }
};
var JsonDelCommand = class extends Command {
  static {
    __name(this, "JsonDelCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.DEL", ...cmd], opts);
  }
};
var JsonForgetCommand = class extends Command {
  static {
    __name(this, "JsonForgetCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.FORGET", ...cmd], opts);
  }
};
var JsonGetCommand = class extends Command {
  static {
    __name(this, "JsonGetCommand");
  }
  constructor(cmd, opts) {
    const command = ["JSON.GET"];
    if (typeof cmd[1] === "string") {
      command.push(...cmd);
    } else {
      command.push(cmd[0]);
      if (cmd[1]) {
        if (cmd[1].indent) {
          command.push("INDENT", cmd[1].indent);
        }
        if (cmd[1].newline) {
          command.push("NEWLINE", cmd[1].newline);
        }
        if (cmd[1].space) {
          command.push("SPACE", cmd[1].space);
        }
      }
      command.push(...cmd.slice(2));
    }
    super(command, opts);
  }
};
var JsonMergeCommand = class extends Command {
  static {
    __name(this, "JsonMergeCommand");
  }
  constructor(cmd, opts) {
    const command = ["JSON.MERGE", ...cmd];
    super(command, opts);
  }
};
var JsonMGetCommand = class extends Command {
  static {
    __name(this, "JsonMGetCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
  }
};
var JsonMSetCommand = class extends Command {
  static {
    __name(this, "JsonMSetCommand");
  }
  constructor(cmd, opts) {
    const command = ["JSON.MSET"];
    for (const c of cmd) {
      command.push(c.key, c.path, c.value);
    }
    super(command, opts);
  }
};
var JsonNumIncrByCommand = class extends Command {
  static {
    __name(this, "JsonNumIncrByCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.NUMINCRBY", ...cmd], opts);
  }
};
var JsonNumMultByCommand = class extends Command {
  static {
    __name(this, "JsonNumMultByCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.NUMMULTBY", ...cmd], opts);
  }
};
var JsonObjKeysCommand = class extends Command {
  static {
    __name(this, "JsonObjKeysCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.OBJKEYS", ...cmd], opts);
  }
};
var JsonObjLenCommand = class extends Command {
  static {
    __name(this, "JsonObjLenCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.OBJLEN", ...cmd], opts);
  }
};
var JsonRespCommand = class extends Command {
  static {
    __name(this, "JsonRespCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.RESP", ...cmd], opts);
  }
};
var JsonSetCommand = class extends Command {
  static {
    __name(this, "JsonSetCommand");
  }
  constructor(cmd, opts) {
    const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
    if (cmd[3]) {
      if (cmd[3].nx) {
        command.push("NX");
      } else if (cmd[3].xx) {
        command.push("XX");
      }
    }
    super(command, opts);
  }
};
var JsonStrAppendCommand = class extends Command {
  static {
    __name(this, "JsonStrAppendCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.STRAPPEND", ...cmd], opts);
  }
};
var JsonStrLenCommand = class extends Command {
  static {
    __name(this, "JsonStrLenCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.STRLEN", ...cmd], opts);
  }
};
var JsonToggleCommand = class extends Command {
  static {
    __name(this, "JsonToggleCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.TOGGLE", ...cmd], opts);
  }
};
var JsonTypeCommand = class extends Command {
  static {
    __name(this, "JsonTypeCommand");
  }
  constructor(cmd, opts) {
    super(["JSON.TYPE", ...cmd], opts);
  }
};
var KeysCommand = class extends Command {
  static {
    __name(this, "KeysCommand");
  }
  constructor(cmd, opts) {
    super(["keys", ...cmd], opts);
  }
};
var LIndexCommand = class extends Command {
  static {
    __name(this, "LIndexCommand");
  }
  constructor(cmd, opts) {
    super(["lindex", ...cmd], opts);
  }
};
var LInsertCommand = class extends Command {
  static {
    __name(this, "LInsertCommand");
  }
  constructor(cmd, opts) {
    super(["linsert", ...cmd], opts);
  }
};
var LLenCommand = class extends Command {
  static {
    __name(this, "LLenCommand");
  }
  constructor(cmd, opts) {
    super(["llen", ...cmd], opts);
  }
};
var LMoveCommand = class extends Command {
  static {
    __name(this, "LMoveCommand");
  }
  constructor(cmd, opts) {
    super(["lmove", ...cmd], opts);
  }
};
var LmPopCommand = class extends Command {
  static {
    __name(this, "LmPopCommand");
  }
  constructor(cmd, opts) {
    const [numkeys, keys, direction, count] = cmd;
    super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
  }
};
var LPopCommand = class extends Command {
  static {
    __name(this, "LPopCommand");
  }
  constructor(cmd, opts) {
    super(["lpop", ...cmd], opts);
  }
};
var LPosCommand = class extends Command {
  static {
    __name(this, "LPosCommand");
  }
  constructor(cmd, opts) {
    const args = ["lpos", cmd[0], cmd[1]];
    if (typeof cmd[2]?.rank === "number") {
      args.push("rank", cmd[2].rank);
    }
    if (typeof cmd[2]?.count === "number") {
      args.push("count", cmd[2].count);
    }
    if (typeof cmd[2]?.maxLen === "number") {
      args.push("maxLen", cmd[2].maxLen);
    }
    super(args, opts);
  }
};
var LPushCommand = class extends Command {
  static {
    __name(this, "LPushCommand");
  }
  constructor(cmd, opts) {
    super(["lpush", ...cmd], opts);
  }
};
var LPushXCommand = class extends Command {
  static {
    __name(this, "LPushXCommand");
  }
  constructor(cmd, opts) {
    super(["lpushx", ...cmd], opts);
  }
};
var LRangeCommand = class extends Command {
  static {
    __name(this, "LRangeCommand");
  }
  constructor(cmd, opts) {
    super(["lrange", ...cmd], opts);
  }
};
var LRemCommand = class extends Command {
  static {
    __name(this, "LRemCommand");
  }
  constructor(cmd, opts) {
    super(["lrem", ...cmd], opts);
  }
};
var LSetCommand = class extends Command {
  static {
    __name(this, "LSetCommand");
  }
  constructor(cmd, opts) {
    super(["lset", ...cmd], opts);
  }
};
var LTrimCommand = class extends Command {
  static {
    __name(this, "LTrimCommand");
  }
  constructor(cmd, opts) {
    super(["ltrim", ...cmd], opts);
  }
};
var MGetCommand = class extends Command {
  static {
    __name(this, "MGetCommand");
  }
  constructor(cmd, opts) {
    const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
    super(["mget", ...keys], opts);
  }
};
var MSetCommand = class extends Command {
  static {
    __name(this, "MSetCommand");
  }
  constructor([kv], opts) {
    super(["mset", ...Object.entries(kv).flatMap(([key, value]) => [key, value])], opts);
  }
};
var MSetNXCommand = class extends Command {
  static {
    __name(this, "MSetNXCommand");
  }
  constructor([kv], opts) {
    super(["msetnx", ...Object.entries(kv).flat()], opts);
  }
};
var PersistCommand = class extends Command {
  static {
    __name(this, "PersistCommand");
  }
  constructor(cmd, opts) {
    super(["persist", ...cmd], opts);
  }
};
var PExpireCommand = class extends Command {
  static {
    __name(this, "PExpireCommand");
  }
  constructor(cmd, opts) {
    super(["pexpire", ...cmd], opts);
  }
};
var PExpireAtCommand = class extends Command {
  static {
    __name(this, "PExpireAtCommand");
  }
  constructor(cmd, opts) {
    super(["pexpireat", ...cmd], opts);
  }
};
var PfAddCommand = class extends Command {
  static {
    __name(this, "PfAddCommand");
  }
  constructor(cmd, opts) {
    super(["pfadd", ...cmd], opts);
  }
};
var PfCountCommand = class extends Command {
  static {
    __name(this, "PfCountCommand");
  }
  constructor(cmd, opts) {
    super(["pfcount", ...cmd], opts);
  }
};
var PfMergeCommand = class extends Command {
  static {
    __name(this, "PfMergeCommand");
  }
  constructor(cmd, opts) {
    super(["pfmerge", ...cmd], opts);
  }
};
var PingCommand = class extends Command {
  static {
    __name(this, "PingCommand");
  }
  constructor(cmd, opts) {
    const command = ["ping"];
    if (cmd?.[0] !== void 0) {
      command.push(cmd[0]);
    }
    super(command, opts);
  }
};
var PSetEXCommand = class extends Command {
  static {
    __name(this, "PSetEXCommand");
  }
  constructor(cmd, opts) {
    super(["psetex", ...cmd], opts);
  }
};
var PTtlCommand = class extends Command {
  static {
    __name(this, "PTtlCommand");
  }
  constructor(cmd, opts) {
    super(["pttl", ...cmd], opts);
  }
};
var PublishCommand = class extends Command {
  static {
    __name(this, "PublishCommand");
  }
  constructor(cmd, opts) {
    super(["publish", ...cmd], opts);
  }
};
var RandomKeyCommand = class extends Command {
  static {
    __name(this, "RandomKeyCommand");
  }
  constructor(opts) {
    super(["randomkey"], opts);
  }
};
var RenameCommand = class extends Command {
  static {
    __name(this, "RenameCommand");
  }
  constructor(cmd, opts) {
    super(["rename", ...cmd], opts);
  }
};
var RenameNXCommand = class extends Command {
  static {
    __name(this, "RenameNXCommand");
  }
  constructor(cmd, opts) {
    super(["renamenx", ...cmd], opts);
  }
};
var RPopCommand = class extends Command {
  static {
    __name(this, "RPopCommand");
  }
  constructor(cmd, opts) {
    super(["rpop", ...cmd], opts);
  }
};
var RPushCommand = class extends Command {
  static {
    __name(this, "RPushCommand");
  }
  constructor(cmd, opts) {
    super(["rpush", ...cmd], opts);
  }
};
var RPushXCommand = class extends Command {
  static {
    __name(this, "RPushXCommand");
  }
  constructor(cmd, opts) {
    super(["rpushx", ...cmd], opts);
  }
};
var SAddCommand = class extends Command {
  static {
    __name(this, "SAddCommand");
  }
  constructor(cmd, opts) {
    super(["sadd", ...cmd], opts);
  }
};
var ScanCommand = class extends Command {
  static {
    __name(this, "ScanCommand");
  }
  constructor([cursor, opts], cmdOpts) {
    const command = ["scan", cursor];
    if (opts?.match) {
      command.push("match", opts.match);
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count);
    }
    if (opts && "withType" in opts && opts.withType === true) {
      command.push("withtype");
    } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
      command.push("type", opts.type);
    }
    super(command, {
      // @ts-expect-error ignore types here
      deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
      ...cmdOpts
    });
  }
};
var SCardCommand = class extends Command {
  static {
    __name(this, "SCardCommand");
  }
  constructor(cmd, opts) {
    super(["scard", ...cmd], opts);
  }
};
var ScriptExistsCommand = class extends Command {
  static {
    __name(this, "ScriptExistsCommand");
  }
  constructor(hashes, opts) {
    super(["script", "exists", ...hashes], {
      deserialize: /* @__PURE__ */ __name((result) => result, "deserialize"),
      ...opts
    });
  }
};
var ScriptFlushCommand = class extends Command {
  static {
    __name(this, "ScriptFlushCommand");
  }
  constructor([opts], cmdOpts) {
    const cmd = ["script", "flush"];
    if (opts?.sync) {
      cmd.push("sync");
    } else if (opts?.async) {
      cmd.push("async");
    }
    super(cmd, cmdOpts);
  }
};
var ScriptLoadCommand = class extends Command {
  static {
    __name(this, "ScriptLoadCommand");
  }
  constructor(args, opts) {
    super(["script", "load", ...args], opts);
  }
};
var SDiffCommand = class extends Command {
  static {
    __name(this, "SDiffCommand");
  }
  constructor(cmd, opts) {
    super(["sdiff", ...cmd], opts);
  }
};
var SDiffStoreCommand = class extends Command {
  static {
    __name(this, "SDiffStoreCommand");
  }
  constructor(cmd, opts) {
    super(["sdiffstore", ...cmd], opts);
  }
};
var SetCommand = class extends Command {
  static {
    __name(this, "SetCommand");
  }
  constructor([key, value, opts], cmdOpts) {
    const command = ["set", key, value];
    if (opts) {
      if ("nx" in opts && opts.nx) {
        command.push("nx");
      } else if ("xx" in opts && opts.xx) {
        command.push("xx");
      }
      if ("get" in opts && opts.get) {
        command.push("get");
      }
      if ("ex" in opts && typeof opts.ex === "number") {
        command.push("ex", opts.ex);
      } else if ("px" in opts && typeof opts.px === "number") {
        command.push("px", opts.px);
      } else if ("exat" in opts && typeof opts.exat === "number") {
        command.push("exat", opts.exat);
      } else if ("pxat" in opts && typeof opts.pxat === "number") {
        command.push("pxat", opts.pxat);
      } else if ("keepTtl" in opts && opts.keepTtl) {
        command.push("keepTtl");
      }
    }
    super(command, cmdOpts);
  }
};
var SetBitCommand = class extends Command {
  static {
    __name(this, "SetBitCommand");
  }
  constructor(cmd, opts) {
    super(["setbit", ...cmd], opts);
  }
};
var SetExCommand = class extends Command {
  static {
    __name(this, "SetExCommand");
  }
  constructor(cmd, opts) {
    super(["setex", ...cmd], opts);
  }
};
var SetNxCommand = class extends Command {
  static {
    __name(this, "SetNxCommand");
  }
  constructor(cmd, opts) {
    super(["setnx", ...cmd], opts);
  }
};
var SetRangeCommand = class extends Command {
  static {
    __name(this, "SetRangeCommand");
  }
  constructor(cmd, opts) {
    super(["setrange", ...cmd], opts);
  }
};
var SInterCommand = class extends Command {
  static {
    __name(this, "SInterCommand");
  }
  constructor(cmd, opts) {
    super(["sinter", ...cmd], opts);
  }
};
var SInterCardCommand = class extends Command {
  static {
    __name(this, "SInterCardCommand");
  }
  constructor(cmd, cmdOpts) {
    const [keys, opts] = cmd;
    const command = ["sintercard", keys.length, ...keys];
    if (opts?.limit !== void 0) {
      command.push("LIMIT", opts.limit);
    }
    super(command, cmdOpts);
  }
};
var SInterStoreCommand = class extends Command {
  static {
    __name(this, "SInterStoreCommand");
  }
  constructor(cmd, opts) {
    super(["sinterstore", ...cmd], opts);
  }
};
var SIsMemberCommand = class extends Command {
  static {
    __name(this, "SIsMemberCommand");
  }
  constructor(cmd, opts) {
    super(["sismember", ...cmd], opts);
  }
};
var SMembersCommand = class extends Command {
  static {
    __name(this, "SMembersCommand");
  }
  constructor(cmd, opts) {
    super(["smembers", ...cmd], opts);
  }
};
var SMIsMemberCommand = class extends Command {
  static {
    __name(this, "SMIsMemberCommand");
  }
  constructor(cmd, opts) {
    super(["smismember", cmd[0], ...cmd[1]], opts);
  }
};
var SMoveCommand = class extends Command {
  static {
    __name(this, "SMoveCommand");
  }
  constructor(cmd, opts) {
    super(["smove", ...cmd], opts);
  }
};
var SPopCommand = class extends Command {
  static {
    __name(this, "SPopCommand");
  }
  constructor([key, count], opts) {
    const command = ["spop", key];
    if (typeof count === "number") {
      command.push(count);
    }
    super(command, opts);
  }
};
var SRandMemberCommand = class extends Command {
  static {
    __name(this, "SRandMemberCommand");
  }
  constructor([key, count], opts) {
    const command = ["srandmember", key];
    if (typeof count === "number") {
      command.push(count);
    }
    super(command, opts);
  }
};
var SRemCommand = class extends Command {
  static {
    __name(this, "SRemCommand");
  }
  constructor(cmd, opts) {
    super(["srem", ...cmd], opts);
  }
};
var SScanCommand = class extends Command {
  static {
    __name(this, "SScanCommand");
  }
  constructor([key, cursor, opts], cmdOpts) {
    const command = ["sscan", key, cursor];
    if (opts?.match) {
      command.push("match", opts.match);
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count);
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...cmdOpts
    });
  }
};
var StrLenCommand = class extends Command {
  static {
    __name(this, "StrLenCommand");
  }
  constructor(cmd, opts) {
    super(["strlen", ...cmd], opts);
  }
};
var SUnionCommand = class extends Command {
  static {
    __name(this, "SUnionCommand");
  }
  constructor(cmd, opts) {
    super(["sunion", ...cmd], opts);
  }
};
var SUnionStoreCommand = class extends Command {
  static {
    __name(this, "SUnionStoreCommand");
  }
  constructor(cmd, opts) {
    super(["sunionstore", ...cmd], opts);
  }
};
var TimeCommand = class extends Command {
  static {
    __name(this, "TimeCommand");
  }
  constructor(opts) {
    super(["time"], opts);
  }
};
var TouchCommand = class extends Command {
  static {
    __name(this, "TouchCommand");
  }
  constructor(cmd, opts) {
    super(["touch", ...cmd], opts);
  }
};
var TtlCommand = class extends Command {
  static {
    __name(this, "TtlCommand");
  }
  constructor(cmd, opts) {
    super(["ttl", ...cmd], opts);
  }
};
var TypeCommand = class extends Command {
  static {
    __name(this, "TypeCommand");
  }
  constructor(cmd, opts) {
    super(["type", ...cmd], opts);
  }
};
var UnlinkCommand = class extends Command {
  static {
    __name(this, "UnlinkCommand");
  }
  constructor(cmd, opts) {
    super(["unlink", ...cmd], opts);
  }
};
var XAckCommand = class extends Command {
  static {
    __name(this, "XAckCommand");
  }
  constructor([key, group, id], opts) {
    const ids = Array.isArray(id) ? [...id] : [id];
    super(["XACK", key, group, ...ids], opts);
  }
};
var XAckDelCommand = class extends Command {
  static {
    __name(this, "XAckDelCommand");
  }
  constructor([key, group, opts, ...ids], cmdOpts) {
    const command = ["XACKDEL", key, group];
    command.push(opts.toUpperCase(), "IDS", ids.length, ...ids);
    super(command, cmdOpts);
  }
};
var XAddCommand = class extends Command {
  static {
    __name(this, "XAddCommand");
  }
  constructor([key, id, entries, opts], commandOptions) {
    const command = ["XADD", key];
    if (opts) {
      if (opts.nomkStream) {
        command.push("NOMKSTREAM");
      }
      if (opts.trim) {
        command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
        if (opts.trim.limit !== void 0) {
          command.push("LIMIT", opts.trim.limit);
        }
      }
    }
    command.push(id);
    for (const [k, v2] of Object.entries(entries)) {
      command.push(k, v2);
    }
    super(command, commandOptions);
  }
};
var XAutoClaim = class extends Command {
  static {
    __name(this, "XAutoClaim");
  }
  constructor([key, group, consumer, minIdleTime, start, options], opts) {
    const commands = [];
    if (options?.count) {
      commands.push("COUNT", options.count);
    }
    if (options?.justId) {
      commands.push("JUSTID");
    }
    super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
  }
};
var XClaimCommand = class extends Command {
  static {
    __name(this, "XClaimCommand");
  }
  constructor([key, group, consumer, minIdleTime, id, options], opts) {
    const ids = Array.isArray(id) ? [...id] : [id];
    const commands = [];
    if (options?.idleMS) {
      commands.push("IDLE", options.idleMS);
    }
    if (options?.idleMS) {
      commands.push("TIME", options.timeMS);
    }
    if (options?.retryCount) {
      commands.push("RETRYCOUNT", options.retryCount);
    }
    if (options?.force) {
      commands.push("FORCE");
    }
    if (options?.justId) {
      commands.push("JUSTID");
    }
    if (options?.lastId) {
      commands.push("LASTID", options.lastId);
    }
    super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
  }
};
var XDelCommand = class extends Command {
  static {
    __name(this, "XDelCommand");
  }
  constructor([key, ids], opts) {
    const cmds = Array.isArray(ids) ? [...ids] : [ids];
    super(["XDEL", key, ...cmds], opts);
  }
};
var XDelExCommand = class extends Command {
  static {
    __name(this, "XDelExCommand");
  }
  constructor([key, opts, ...ids], cmdOpts) {
    const command = ["XDELEX", key];
    if (opts) {
      command.push(opts.toUpperCase());
    }
    command.push("IDS", ids.length, ...ids);
    super(command, cmdOpts);
  }
};
var XGroupCommand = class extends Command {
  static {
    __name(this, "XGroupCommand");
  }
  constructor([key, opts], commandOptions) {
    const command = ["XGROUP"];
    switch (opts.type) {
      case "CREATE": {
        command.push("CREATE", key, opts.group, opts.id);
        if (opts.options) {
          if (opts.options.MKSTREAM) {
            command.push("MKSTREAM");
          }
          if (opts.options.ENTRIESREAD !== void 0) {
            command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
          }
        }
        break;
      }
      case "CREATECONSUMER": {
        command.push("CREATECONSUMER", key, opts.group, opts.consumer);
        break;
      }
      case "DELCONSUMER": {
        command.push("DELCONSUMER", key, opts.group, opts.consumer);
        break;
      }
      case "DESTROY": {
        command.push("DESTROY", key, opts.group);
        break;
      }
      case "SETID": {
        command.push("SETID", key, opts.group, opts.id);
        if (opts.options?.ENTRIESREAD !== void 0) {
          command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
        }
        break;
      }
      default: {
        throw new Error("Invalid XGROUP");
      }
    }
    super(command, commandOptions);
  }
};
var XInfoCommand = class extends Command {
  static {
    __name(this, "XInfoCommand");
  }
  constructor([key, options], opts) {
    const cmds = [];
    if (options.type === "CONSUMERS") {
      cmds.push("CONSUMERS", key, options.group);
    } else {
      cmds.push("GROUPS", key);
    }
    super(["XINFO", ...cmds], opts);
  }
};
var XLenCommand = class extends Command {
  static {
    __name(this, "XLenCommand");
  }
  constructor(cmd, opts) {
    super(["XLEN", ...cmd], opts);
  }
};
var XPendingCommand = class extends Command {
  static {
    __name(this, "XPendingCommand");
  }
  constructor([key, group, start, end, count, options], opts) {
    const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
    super(
      [
        "XPENDING",
        key,
        group,
        ...options?.idleTime ? ["IDLE", options.idleTime] : [],
        start,
        end,
        count,
        ...consumers
      ],
      opts
    );
  }
};
function deserialize6(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
__name(deserialize6, "deserialize6");
var XRangeCommand = class extends Command {
  static {
    __name(this, "XRangeCommand");
  }
  constructor([key, start, end, count], opts) {
    const command = ["XRANGE", key, start, end];
    if (typeof count === "number") {
      command.push("COUNT", count);
    }
    super(command, {
      deserialize: /* @__PURE__ */ __name((result) => deserialize6(result), "deserialize"),
      ...opts
    });
  }
};
var UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
var XReadCommand = class extends Command {
  static {
    __name(this, "XReadCommand");
  }
  constructor([key, id, options], opts) {
    if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
      throw new Error(UNBALANCED_XREAD_ERR);
    }
    const commands = [];
    if (typeof options?.count === "number") {
      commands.push("COUNT", options.count);
    }
    if (typeof options?.blockMS === "number") {
      commands.push("BLOCK", options.blockMS);
    }
    commands.push(
      "STREAMS",
      ...Array.isArray(key) ? [...key] : [key],
      ...Array.isArray(id) ? [...id] : [id]
    );
    super(["XREAD", ...commands], opts);
  }
};
var UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
var XReadGroupCommand = class extends Command {
  static {
    __name(this, "XReadGroupCommand");
  }
  constructor([group, consumer, key, id, options], opts) {
    if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
      throw new Error(UNBALANCED_XREADGROUP_ERR);
    }
    const commands = [];
    if (typeof options?.count === "number") {
      commands.push("COUNT", options.count);
    }
    if (typeof options?.blockMS === "number") {
      commands.push("BLOCK", options.blockMS);
    }
    if (typeof options?.NOACK === "boolean" && options.NOACK) {
      commands.push("NOACK");
    }
    commands.push(
      "STREAMS",
      ...Array.isArray(key) ? [...key] : [key],
      ...Array.isArray(id) ? [...id] : [id]
    );
    super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
  }
};
var XRevRangeCommand = class extends Command {
  static {
    __name(this, "XRevRangeCommand");
  }
  constructor([key, end, start, count], opts) {
    const command = ["XREVRANGE", key, end, start];
    if (typeof count === "number") {
      command.push("COUNT", count);
    }
    super(command, {
      deserialize: /* @__PURE__ */ __name((result) => deserialize7(result), "deserialize"),
      ...opts
    });
  }
};
function deserialize7(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
__name(deserialize7, "deserialize7");
var XTrimCommand = class extends Command {
  static {
    __name(this, "XTrimCommand");
  }
  constructor([key, options], opts) {
    const { limit: limit2, strategy, threshold, exactness = "~" } = options;
    super(["XTRIM", key, strategy, exactness, threshold, ...limit2 ? ["LIMIT", limit2] : []], opts);
  }
};
var ZAddCommand = class extends Command {
  static {
    __name(this, "ZAddCommand");
  }
  constructor([key, arg1, ...arg2], opts) {
    const command = ["zadd", key];
    if ("nx" in arg1 && arg1.nx) {
      command.push("nx");
    } else if ("xx" in arg1 && arg1.xx) {
      command.push("xx");
    }
    if ("ch" in arg1 && arg1.ch) {
      command.push("ch");
    }
    if ("incr" in arg1 && arg1.incr) {
      command.push("incr");
    }
    if ("lt" in arg1 && arg1.lt) {
      command.push("lt");
    } else if ("gt" in arg1 && arg1.gt) {
      command.push("gt");
    }
    if ("score" in arg1 && "member" in arg1) {
      command.push(arg1.score, arg1.member);
    }
    command.push(...arg2.flatMap(({ score, member }) => [score, member]));
    super(command, opts);
  }
};
var ZCardCommand = class extends Command {
  static {
    __name(this, "ZCardCommand");
  }
  constructor(cmd, opts) {
    super(["zcard", ...cmd], opts);
  }
};
var ZCountCommand = class extends Command {
  static {
    __name(this, "ZCountCommand");
  }
  constructor(cmd, opts) {
    super(["zcount", ...cmd], opts);
  }
};
var ZIncrByCommand = class extends Command {
  static {
    __name(this, "ZIncrByCommand");
  }
  constructor(cmd, opts) {
    super(["zincrby", ...cmd], opts);
  }
};
var ZInterStoreCommand = class extends Command {
  static {
    __name(this, "ZInterStoreCommand");
  }
  constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zinterstore", destination, numKeys];
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys);
    } else {
      command.push(keyOrKeys);
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights);
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight);
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate);
      }
    }
    super(command, cmdOpts);
  }
};
var ZLexCountCommand = class extends Command {
  static {
    __name(this, "ZLexCountCommand");
  }
  constructor(cmd, opts) {
    super(["zlexcount", ...cmd], opts);
  }
};
var ZPopMaxCommand = class extends Command {
  static {
    __name(this, "ZPopMaxCommand");
  }
  constructor([key, count], opts) {
    const command = ["zpopmax", key];
    if (typeof count === "number") {
      command.push(count);
    }
    super(command, opts);
  }
};
var ZPopMinCommand = class extends Command {
  static {
    __name(this, "ZPopMinCommand");
  }
  constructor([key, count], opts) {
    const command = ["zpopmin", key];
    if (typeof count === "number") {
      command.push(count);
    }
    super(command, opts);
  }
};
var ZRangeCommand = class extends Command {
  static {
    __name(this, "ZRangeCommand");
  }
  constructor([key, min, max, opts], cmdOpts) {
    const command = ["zrange", key, min, max];
    if (opts?.byScore) {
      command.push("byscore");
    }
    if (opts?.byLex) {
      command.push("bylex");
    }
    if (opts?.rev) {
      command.push("rev");
    }
    if (opts?.count !== void 0 && opts.offset !== void 0) {
      command.push("limit", opts.offset, opts.count);
    }
    if (opts?.withScores) {
      command.push("withscores");
    }
    super(command, cmdOpts);
  }
};
var ZRankCommand = class extends Command {
  static {
    __name(this, "ZRankCommand");
  }
  constructor(cmd, opts) {
    super(["zrank", ...cmd], opts);
  }
};
var ZRemCommand = class extends Command {
  static {
    __name(this, "ZRemCommand");
  }
  constructor(cmd, opts) {
    super(["zrem", ...cmd], opts);
  }
};
var ZRemRangeByLexCommand = class extends Command {
  static {
    __name(this, "ZRemRangeByLexCommand");
  }
  constructor(cmd, opts) {
    super(["zremrangebylex", ...cmd], opts);
  }
};
var ZRemRangeByRankCommand = class extends Command {
  static {
    __name(this, "ZRemRangeByRankCommand");
  }
  constructor(cmd, opts) {
    super(["zremrangebyrank", ...cmd], opts);
  }
};
var ZRemRangeByScoreCommand = class extends Command {
  static {
    __name(this, "ZRemRangeByScoreCommand");
  }
  constructor(cmd, opts) {
    super(["zremrangebyscore", ...cmd], opts);
  }
};
var ZRevRankCommand = class extends Command {
  static {
    __name(this, "ZRevRankCommand");
  }
  constructor(cmd, opts) {
    super(["zrevrank", ...cmd], opts);
  }
};
var ZScanCommand = class extends Command {
  static {
    __name(this, "ZScanCommand");
  }
  constructor([key, cursor, opts], cmdOpts) {
    const command = ["zscan", key, cursor];
    if (opts?.match) {
      command.push("match", opts.match);
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count);
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...cmdOpts
    });
  }
};
var ZScoreCommand = class extends Command {
  static {
    __name(this, "ZScoreCommand");
  }
  constructor(cmd, opts) {
    super(["zscore", ...cmd], opts);
  }
};
var ZUnionCommand = class extends Command {
  static {
    __name(this, "ZUnionCommand");
  }
  constructor([numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zunion", numKeys];
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys);
    } else {
      command.push(keyOrKeys);
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights);
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight);
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate);
      }
      if (opts.withScores) {
        command.push("withscores");
      }
    }
    super(command, cmdOpts);
  }
};
var ZUnionStoreCommand = class extends Command {
  static {
    __name(this, "ZUnionStoreCommand");
  }
  constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zunionstore", destination, numKeys];
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys);
    } else {
      command.push(keyOrKeys);
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights);
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight);
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate);
      }
    }
    super(command, cmdOpts);
  }
};
var ZDiffStoreCommand = class extends Command {
  static {
    __name(this, "ZDiffStoreCommand");
  }
  constructor(cmd, opts) {
    super(["zdiffstore", ...cmd], opts);
  }
};
var ZMScoreCommand = class extends Command {
  static {
    __name(this, "ZMScoreCommand");
  }
  constructor(cmd, opts) {
    const [key, members] = cmd;
    super(["zmscore", key, ...members], opts);
  }
};
var Pipeline = class {
  static {
    __name(this, "Pipeline");
  }
  client;
  commands;
  commandOptions;
  multiExec;
  constructor(opts) {
    this.client = opts.client;
    this.commands = [];
    this.commandOptions = opts.commandOptions;
    this.multiExec = opts.multiExec ?? false;
    if (this.commandOptions?.latencyLogging) {
      const originalExec = this.exec.bind(this);
      this.exec = async (options) => {
        const start = performance.now();
        const result = await (options ? originalExec(options) : originalExec());
        const end = performance.now();
        const loggerResult = (end - start).toFixed(2);
        console.log(
          `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
        );
        return result;
      };
    }
  }
  exec = /* @__PURE__ */ __name(async (options) => {
    if (this.commands.length === 0) {
      throw new Error("Pipeline is empty");
    }
    const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
    const res = await this.client.request({
      path,
      body: Object.values(this.commands).map((c) => c.command)
    });
    return options?.keepErrors ? res.map(({ error, result }, i) => {
      return {
        error,
        result: this.commands[i].deserialize(result)
      };
    }) : res.map(({ error, result }, i) => {
      if (error) {
        throw new UpstashError(
          `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
        );
      }
      return this.commands[i].deserialize(result);
    });
  }, "exec");
  /**
   * Returns the length of pipeline before the execution
   */
  length() {
    return this.commands.length;
  }
  /**
   * Pushes a command into the pipeline and returns a chainable instance of the
   * pipeline
   */
  chain(command) {
    this.commands.push(command);
    return this;
  }
  /**
   * @see https://redis.io/commands/append
   */
  append = /* @__PURE__ */ __name((...args) => this.chain(new AppendCommand(args, this.commandOptions)), "append");
  /**
   * @see https://redis.io/commands/bitcount
   */
  bitcount = /* @__PURE__ */ __name((...args) => this.chain(new BitCountCommand(args, this.commandOptions)), "bitcount");
  /**
   * Returns an instance that can be used to execute `BITFIELD` commands on one key.
   *
   * @example
   * ```typescript
   * redis.set("mykey", 0);
   * const result = await redis.pipeline()
   *   .bitfield("mykey")
   *   .set("u4", 0, 16)
   *   .incr("u4", "#1", 1)
   *   .exec();
   * console.log(result); // [[0, 1]]
   * ```
   *
   * @see https://redis.io/commands/bitfield
   */
  bitfield = /* @__PURE__ */ __name((...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this)), "bitfield");
  /**
   * @see https://redis.io/commands/bitop
   */
  bitop = /* @__PURE__ */ __name((op, destinationKey, sourceKey, ...sourceKeys) => this.chain(
    new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
  ), "bitop");
  /**
   * @see https://redis.io/commands/bitpos
   */
  bitpos = /* @__PURE__ */ __name((...args) => this.chain(new BitPosCommand(args, this.commandOptions)), "bitpos");
  /**
   * @see https://redis.io/commands/client-setinfo
   */
  clientSetinfo = /* @__PURE__ */ __name((...args) => this.chain(new ClientSetInfoCommand(args, this.commandOptions)), "clientSetinfo");
  /**
   * @see https://redis.io/commands/copy
   */
  copy = /* @__PURE__ */ __name((...args) => this.chain(new CopyCommand(args, this.commandOptions)), "copy");
  /**
   * @see https://redis.io/commands/zdiffstore
   */
  zdiffstore = /* @__PURE__ */ __name((...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions)), "zdiffstore");
  /**
   * @see https://redis.io/commands/dbsize
   */
  dbsize = /* @__PURE__ */ __name(() => this.chain(new DBSizeCommand(this.commandOptions)), "dbsize");
  /**
   * @see https://redis.io/commands/decr
   */
  decr = /* @__PURE__ */ __name((...args) => this.chain(new DecrCommand(args, this.commandOptions)), "decr");
  /**
   * @see https://redis.io/commands/decrby
   */
  decrby = /* @__PURE__ */ __name((...args) => this.chain(new DecrByCommand(args, this.commandOptions)), "decrby");
  /**
   * @see https://redis.io/commands/del
   */
  del = /* @__PURE__ */ __name((...args) => this.chain(new DelCommand(args, this.commandOptions)), "del");
  /**
   * @see https://redis.io/commands/echo
   */
  echo = /* @__PURE__ */ __name((...args) => this.chain(new EchoCommand(args, this.commandOptions)), "echo");
  /**
   * @see https://redis.io/commands/eval_ro
   */
  evalRo = /* @__PURE__ */ __name((...args) => this.chain(new EvalROCommand(args, this.commandOptions)), "evalRo");
  /**
   * @see https://redis.io/commands/eval
   */
  eval = /* @__PURE__ */ __name((...args) => this.chain(new EvalCommand(args, this.commandOptions)), "eval");
  /**
   * @see https://redis.io/commands/evalsha_ro
   */
  evalshaRo = /* @__PURE__ */ __name((...args) => this.chain(new EvalshaROCommand(args, this.commandOptions)), "evalshaRo");
  /**
   * @see https://redis.io/commands/evalsha
   */
  evalsha = /* @__PURE__ */ __name((...args) => this.chain(new EvalshaCommand(args, this.commandOptions)), "evalsha");
  /**
   * @see https://redis.io/commands/exists
   */
  exists = /* @__PURE__ */ __name((...args) => this.chain(new ExistsCommand(args, this.commandOptions)), "exists");
  /**
   * @see https://redis.io/commands/expire
   */
  expire = /* @__PURE__ */ __name((...args) => this.chain(new ExpireCommand(args, this.commandOptions)), "expire");
  /**
   * @see https://redis.io/commands/expireat
   */
  expireat = /* @__PURE__ */ __name((...args) => this.chain(new ExpireAtCommand(args, this.commandOptions)), "expireat");
  /**
   * @see https://redis.io/commands/flushall
   */
  flushall = /* @__PURE__ */ __name((args) => this.chain(new FlushAllCommand(args, this.commandOptions)), "flushall");
  /**
   * @see https://redis.io/commands/flushdb
   */
  flushdb = /* @__PURE__ */ __name((...args) => this.chain(new FlushDBCommand(args, this.commandOptions)), "flushdb");
  /**
   * @see https://redis.io/commands/geoadd
   */
  geoadd = /* @__PURE__ */ __name((...args) => this.chain(new GeoAddCommand(args, this.commandOptions)), "geoadd");
  /**
   * @see https://redis.io/commands/geodist
   */
  geodist = /* @__PURE__ */ __name((...args) => this.chain(new GeoDistCommand(args, this.commandOptions)), "geodist");
  /**
   * @see https://redis.io/commands/geopos
   */
  geopos = /* @__PURE__ */ __name((...args) => this.chain(new GeoPosCommand(args, this.commandOptions)), "geopos");
  /**
   * @see https://redis.io/commands/geohash
   */
  geohash = /* @__PURE__ */ __name((...args) => this.chain(new GeoHashCommand(args, this.commandOptions)), "geohash");
  /**
   * @see https://redis.io/commands/geosearch
   */
  geosearch = /* @__PURE__ */ __name((...args) => this.chain(new GeoSearchCommand(args, this.commandOptions)), "geosearch");
  /**
   * @see https://redis.io/commands/geosearchstore
   */
  geosearchstore = /* @__PURE__ */ __name((...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions)), "geosearchstore");
  /**
   * @see https://redis.io/commands/get
   */
  get = /* @__PURE__ */ __name((...args) => this.chain(new GetCommand(args, this.commandOptions)), "get");
  /**
   * @see https://redis.io/commands/getbit
   */
  getbit = /* @__PURE__ */ __name((...args) => this.chain(new GetBitCommand(args, this.commandOptions)), "getbit");
  /**
   * @see https://redis.io/commands/getdel
   */
  getdel = /* @__PURE__ */ __name((...args) => this.chain(new GetDelCommand(args, this.commandOptions)), "getdel");
  /**
   * @see https://redis.io/commands/getex
   */
  getex = /* @__PURE__ */ __name((...args) => this.chain(new GetExCommand(args, this.commandOptions)), "getex");
  /**
   * @see https://redis.io/commands/getrange
   */
  getrange = /* @__PURE__ */ __name((...args) => this.chain(new GetRangeCommand(args, this.commandOptions)), "getrange");
  /**
   * @see https://redis.io/commands/getset
   */
  getset = /* @__PURE__ */ __name((key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions)), "getset");
  /**
   * @see https://redis.io/commands/hdel
   */
  hdel = /* @__PURE__ */ __name((...args) => this.chain(new HDelCommand(args, this.commandOptions)), "hdel");
  /**
   * @see https://redis.io/commands/hexists
   */
  hexists = /* @__PURE__ */ __name((...args) => this.chain(new HExistsCommand(args, this.commandOptions)), "hexists");
  /**
   * @see https://redis.io/commands/hexpire
   */
  hexpire = /* @__PURE__ */ __name((...args) => this.chain(new HExpireCommand(args, this.commandOptions)), "hexpire");
  /**
   * @see https://redis.io/commands/hexpireat
   */
  hexpireat = /* @__PURE__ */ __name((...args) => this.chain(new HExpireAtCommand(args, this.commandOptions)), "hexpireat");
  /**
   * @see https://redis.io/commands/hexpiretime
   */
  hexpiretime = /* @__PURE__ */ __name((...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions)), "hexpiretime");
  /**
   * @see https://redis.io/commands/httl
   */
  httl = /* @__PURE__ */ __name((...args) => this.chain(new HTtlCommand(args, this.commandOptions)), "httl");
  /**
   * @see https://redis.io/commands/hpexpire
   */
  hpexpire = /* @__PURE__ */ __name((...args) => this.chain(new HPExpireCommand(args, this.commandOptions)), "hpexpire");
  /**
   * @see https://redis.io/commands/hpexpireat
   */
  hpexpireat = /* @__PURE__ */ __name((...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions)), "hpexpireat");
  /**
   * @see https://redis.io/commands/hpexpiretime
   */
  hpexpiretime = /* @__PURE__ */ __name((...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions)), "hpexpiretime");
  /**
   * @see https://redis.io/commands/hpttl
   */
  hpttl = /* @__PURE__ */ __name((...args) => this.chain(new HPTtlCommand(args, this.commandOptions)), "hpttl");
  /**
   * @see https://redis.io/commands/hpersist
   */
  hpersist = /* @__PURE__ */ __name((...args) => this.chain(new HPersistCommand(args, this.commandOptions)), "hpersist");
  /**
   * @see https://redis.io/commands/hget
   */
  hget = /* @__PURE__ */ __name((...args) => this.chain(new HGetCommand(args, this.commandOptions)), "hget");
  /**
   * @see https://redis.io/commands/hgetall
   */
  hgetall = /* @__PURE__ */ __name((...args) => this.chain(new HGetAllCommand(args, this.commandOptions)), "hgetall");
  /**
   * @see https://redis.io/commands/hgetdel
   */
  hgetdel = /* @__PURE__ */ __name((...args) => this.chain(new HGetDelCommand(args, this.commandOptions)), "hgetdel");
  /**
   * @see https://redis.io/commands/hgetex
   */
  hgetex = /* @__PURE__ */ __name((...args) => this.chain(new HGetExCommand(args, this.commandOptions)), "hgetex");
  /**
   * @see https://redis.io/commands/hincrby
   */
  hincrby = /* @__PURE__ */ __name((...args) => this.chain(new HIncrByCommand(args, this.commandOptions)), "hincrby");
  /**
   * @see https://redis.io/commands/hincrbyfloat
   */
  hincrbyfloat = /* @__PURE__ */ __name((...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions)), "hincrbyfloat");
  /**
   * @see https://redis.io/commands/hkeys
   */
  hkeys = /* @__PURE__ */ __name((...args) => this.chain(new HKeysCommand(args, this.commandOptions)), "hkeys");
  /**
   * @see https://redis.io/commands/hlen
   */
  hlen = /* @__PURE__ */ __name((...args) => this.chain(new HLenCommand(args, this.commandOptions)), "hlen");
  /**
   * @see https://redis.io/commands/hmget
   */
  hmget = /* @__PURE__ */ __name((...args) => this.chain(new HMGetCommand(args, this.commandOptions)), "hmget");
  /**
   * @see https://redis.io/commands/hmset
   */
  hmset = /* @__PURE__ */ __name((key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions)), "hmset");
  /**
   * @see https://redis.io/commands/hrandfield
   */
  hrandfield = /* @__PURE__ */ __name((key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions)), "hrandfield");
  /**
   * @see https://redis.io/commands/hscan
   */
  hscan = /* @__PURE__ */ __name((...args) => this.chain(new HScanCommand(args, this.commandOptions)), "hscan");
  /**
   * @see https://redis.io/commands/hset
   */
  hset = /* @__PURE__ */ __name((key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions)), "hset");
  /**
   * @see https://redis.io/commands/hsetex
   */
  hsetex = /* @__PURE__ */ __name((...args) => this.chain(new HSetExCommand(args, this.commandOptions)), "hsetex");
  /**
   * @see https://redis.io/commands/hsetnx
   */
  hsetnx = /* @__PURE__ */ __name((key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions)), "hsetnx");
  /**
   * @see https://redis.io/commands/hstrlen
   */
  hstrlen = /* @__PURE__ */ __name((...args) => this.chain(new HStrLenCommand(args, this.commandOptions)), "hstrlen");
  /**
   * @see https://redis.io/commands/hvals
   */
  hvals = /* @__PURE__ */ __name((...args) => this.chain(new HValsCommand(args, this.commandOptions)), "hvals");
  /**
   * @see https://redis.io/commands/incr
   */
  incr = /* @__PURE__ */ __name((...args) => this.chain(new IncrCommand(args, this.commandOptions)), "incr");
  /**
   * @see https://redis.io/commands/incrby
   */
  incrby = /* @__PURE__ */ __name((...args) => this.chain(new IncrByCommand(args, this.commandOptions)), "incrby");
  /**
   * @see https://redis.io/commands/incrbyfloat
   */
  incrbyfloat = /* @__PURE__ */ __name((...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions)), "incrbyfloat");
  /**
   * @see https://redis.io/commands/keys
   */
  keys = /* @__PURE__ */ __name((...args) => this.chain(new KeysCommand(args, this.commandOptions)), "keys");
  /**
   * @see https://redis.io/commands/lindex
   */
  lindex = /* @__PURE__ */ __name((...args) => this.chain(new LIndexCommand(args, this.commandOptions)), "lindex");
  /**
   * @see https://redis.io/commands/linsert
   */
  linsert = /* @__PURE__ */ __name((key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions)), "linsert");
  /**
   * @see https://redis.io/commands/llen
   */
  llen = /* @__PURE__ */ __name((...args) => this.chain(new LLenCommand(args, this.commandOptions)), "llen");
  /**
   * @see https://redis.io/commands/lmove
   */
  lmove = /* @__PURE__ */ __name((...args) => this.chain(new LMoveCommand(args, this.commandOptions)), "lmove");
  /**
   * @see https://redis.io/commands/lpop
   */
  lpop = /* @__PURE__ */ __name((...args) => this.chain(new LPopCommand(args, this.commandOptions)), "lpop");
  /**
   * @see https://redis.io/commands/lmpop
   */
  lmpop = /* @__PURE__ */ __name((...args) => this.chain(new LmPopCommand(args, this.commandOptions)), "lmpop");
  /**
   * @see https://redis.io/commands/lpos
   */
  lpos = /* @__PURE__ */ __name((...args) => this.chain(new LPosCommand(args, this.commandOptions)), "lpos");
  /**
   * @see https://redis.io/commands/lpush
   */
  lpush = /* @__PURE__ */ __name((key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions)), "lpush");
  /**
   * @see https://redis.io/commands/lpushx
   */
  lpushx = /* @__PURE__ */ __name((key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions)), "lpushx");
  /**
   * @see https://redis.io/commands/lrange
   */
  lrange = /* @__PURE__ */ __name((...args) => this.chain(new LRangeCommand(args, this.commandOptions)), "lrange");
  /**
   * @see https://redis.io/commands/lrem
   */
  lrem = /* @__PURE__ */ __name((key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions)), "lrem");
  /**
   * @see https://redis.io/commands/lset
   */
  lset = /* @__PURE__ */ __name((key, index2, value) => this.chain(new LSetCommand([key, index2, value], this.commandOptions)), "lset");
  /**
   * @see https://redis.io/commands/ltrim
   */
  ltrim = /* @__PURE__ */ __name((...args) => this.chain(new LTrimCommand(args, this.commandOptions)), "ltrim");
  /**
   * @see https://redis.io/commands/mget
   */
  mget = /* @__PURE__ */ __name((...args) => this.chain(new MGetCommand(args, this.commandOptions)), "mget");
  /**
   * @see https://redis.io/commands/mset
   */
  mset = /* @__PURE__ */ __name((kv) => this.chain(new MSetCommand([kv], this.commandOptions)), "mset");
  /**
   * @see https://redis.io/commands/msetnx
   */
  msetnx = /* @__PURE__ */ __name((kv) => this.chain(new MSetNXCommand([kv], this.commandOptions)), "msetnx");
  /**
   * @see https://redis.io/commands/persist
   */
  persist = /* @__PURE__ */ __name((...args) => this.chain(new PersistCommand(args, this.commandOptions)), "persist");
  /**
   * @see https://redis.io/commands/pexpire
   */
  pexpire = /* @__PURE__ */ __name((...args) => this.chain(new PExpireCommand(args, this.commandOptions)), "pexpire");
  /**
   * @see https://redis.io/commands/pexpireat
   */
  pexpireat = /* @__PURE__ */ __name((...args) => this.chain(new PExpireAtCommand(args, this.commandOptions)), "pexpireat");
  /**
   * @see https://redis.io/commands/pfadd
   */
  pfadd = /* @__PURE__ */ __name((...args) => this.chain(new PfAddCommand(args, this.commandOptions)), "pfadd");
  /**
   * @see https://redis.io/commands/pfcount
   */
  pfcount = /* @__PURE__ */ __name((...args) => this.chain(new PfCountCommand(args, this.commandOptions)), "pfcount");
  /**
   * @see https://redis.io/commands/pfmerge
   */
  pfmerge = /* @__PURE__ */ __name((...args) => this.chain(new PfMergeCommand(args, this.commandOptions)), "pfmerge");
  /**
   * @see https://redis.io/commands/ping
   */
  ping = /* @__PURE__ */ __name((args) => this.chain(new PingCommand(args, this.commandOptions)), "ping");
  /**
   * @see https://redis.io/commands/psetex
   */
  psetex = /* @__PURE__ */ __name((key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions)), "psetex");
  /**
   * @see https://redis.io/commands/pttl
   */
  pttl = /* @__PURE__ */ __name((...args) => this.chain(new PTtlCommand(args, this.commandOptions)), "pttl");
  /**
   * @see https://redis.io/commands/publish
   */
  publish = /* @__PURE__ */ __name((...args) => this.chain(new PublishCommand(args, this.commandOptions)), "publish");
  /**
   * @see https://redis.io/commands/randomkey
   */
  randomkey = /* @__PURE__ */ __name(() => this.chain(new RandomKeyCommand(this.commandOptions)), "randomkey");
  /**
   * @see https://redis.io/commands/rename
   */
  rename = /* @__PURE__ */ __name((...args) => this.chain(new RenameCommand(args, this.commandOptions)), "rename");
  /**
   * @see https://redis.io/commands/renamenx
   */
  renamenx = /* @__PURE__ */ __name((...args) => this.chain(new RenameNXCommand(args, this.commandOptions)), "renamenx");
  /**
   * @see https://redis.io/commands/rpop
   */
  rpop = /* @__PURE__ */ __name((...args) => this.chain(new RPopCommand(args, this.commandOptions)), "rpop");
  /**
   * @see https://redis.io/commands/rpush
   */
  rpush = /* @__PURE__ */ __name((key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions)), "rpush");
  /**
   * @see https://redis.io/commands/rpushx
   */
  rpushx = /* @__PURE__ */ __name((key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions)), "rpushx");
  /**
   * @see https://redis.io/commands/sadd
   */
  sadd = /* @__PURE__ */ __name((key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions)), "sadd");
  /**
   * @see https://redis.io/commands/scan
   */
  scan = /* @__PURE__ */ __name((...args) => this.chain(new ScanCommand(args, this.commandOptions)), "scan");
  /**
   * @see https://redis.io/commands/scard
   */
  scard = /* @__PURE__ */ __name((...args) => this.chain(new SCardCommand(args, this.commandOptions)), "scard");
  /**
   * @see https://redis.io/commands/script-exists
   */
  scriptExists = /* @__PURE__ */ __name((...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions)), "scriptExists");
  /**
   * @see https://redis.io/commands/script-flush
   */
  scriptFlush = /* @__PURE__ */ __name((...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions)), "scriptFlush");
  /**
   * @see https://redis.io/commands/script-load
   */
  scriptLoad = /* @__PURE__ */ __name((...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions)), "scriptLoad");
  /*)*
   * @see https://redis.io/commands/sdiff
   */
  sdiff = /* @__PURE__ */ __name((...args) => this.chain(new SDiffCommand(args, this.commandOptions)), "sdiff");
  /**
   * @see https://redis.io/commands/sdiffstore
   */
  sdiffstore = /* @__PURE__ */ __name((...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions)), "sdiffstore");
  /**
   * @see https://redis.io/commands/set
   */
  set = /* @__PURE__ */ __name((key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions)), "set");
  /**
   * @see https://redis.io/commands/setbit
   */
  setbit = /* @__PURE__ */ __name((...args) => this.chain(new SetBitCommand(args, this.commandOptions)), "setbit");
  /**
   * @see https://redis.io/commands/setex
   */
  setex = /* @__PURE__ */ __name((key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions)), "setex");
  /**
   * @see https://redis.io/commands/setnx
   */
  setnx = /* @__PURE__ */ __name((key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions)), "setnx");
  /**
   * @see https://redis.io/commands/setrange
   */
  setrange = /* @__PURE__ */ __name((...args) => this.chain(new SetRangeCommand(args, this.commandOptions)), "setrange");
  /**
   * @see https://redis.io/commands/sinter
   */
  sinter = /* @__PURE__ */ __name((...args) => this.chain(new SInterCommand(args, this.commandOptions)), "sinter");
  /**
   * @see https://redis.io/commands/sintercard
   */
  sintercard = /* @__PURE__ */ __name((...args) => this.chain(new SInterCardCommand(args, this.commandOptions)), "sintercard");
  /**
   * @see https://redis.io/commands/sinterstore
   */
  sinterstore = /* @__PURE__ */ __name((...args) => this.chain(new SInterStoreCommand(args, this.commandOptions)), "sinterstore");
  /**
   * @see https://redis.io/commands/sismember
   */
  sismember = /* @__PURE__ */ __name((key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions)), "sismember");
  /**
   * @see https://redis.io/commands/smembers
   */
  smembers = /* @__PURE__ */ __name((...args) => this.chain(new SMembersCommand(args, this.commandOptions)), "smembers");
  /**
   * @see https://redis.io/commands/smismember
   */
  smismember = /* @__PURE__ */ __name((key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions)), "smismember");
  /**
   * @see https://redis.io/commands/smove
   */
  smove = /* @__PURE__ */ __name((source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions)), "smove");
  /**
   * @see https://redis.io/commands/spop
   */
  spop = /* @__PURE__ */ __name((...args) => this.chain(new SPopCommand(args, this.commandOptions)), "spop");
  /**
   * @see https://redis.io/commands/srandmember
   */
  srandmember = /* @__PURE__ */ __name((...args) => this.chain(new SRandMemberCommand(args, this.commandOptions)), "srandmember");
  /**
   * @see https://redis.io/commands/srem
   */
  srem = /* @__PURE__ */ __name((key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions)), "srem");
  /**
   * @see https://redis.io/commands/sscan
   */
  sscan = /* @__PURE__ */ __name((...args) => this.chain(new SScanCommand(args, this.commandOptions)), "sscan");
  /**
   * @see https://redis.io/commands/strlen
   */
  strlen = /* @__PURE__ */ __name((...args) => this.chain(new StrLenCommand(args, this.commandOptions)), "strlen");
  /**
   * @see https://redis.io/commands/sunion
   */
  sunion = /* @__PURE__ */ __name((...args) => this.chain(new SUnionCommand(args, this.commandOptions)), "sunion");
  /**
   * @see https://redis.io/commands/sunionstore
   */
  sunionstore = /* @__PURE__ */ __name((...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions)), "sunionstore");
  /**
   * @see https://redis.io/commands/time
   */
  time = /* @__PURE__ */ __name(() => this.chain(new TimeCommand(this.commandOptions)), "time");
  /**
   * @see https://redis.io/commands/touch
   */
  touch = /* @__PURE__ */ __name((...args) => this.chain(new TouchCommand(args, this.commandOptions)), "touch");
  /**
   * @see https://redis.io/commands/ttl
   */
  ttl = /* @__PURE__ */ __name((...args) => this.chain(new TtlCommand(args, this.commandOptions)), "ttl");
  /**
   * @see https://redis.io/commands/type
   */
  type = /* @__PURE__ */ __name((...args) => this.chain(new TypeCommand(args, this.commandOptions)), "type");
  /**
   * @see https://redis.io/commands/unlink
   */
  unlink = /* @__PURE__ */ __name((...args) => this.chain(new UnlinkCommand(args, this.commandOptions)), "unlink");
  /**
   * @see https://redis.io/commands/zadd
   */
  zadd = /* @__PURE__ */ __name((...args) => {
    if ("score" in args[1]) {
      return this.chain(
        new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
      );
    }
    return this.chain(
      new ZAddCommand(
        [args[0], args[1], ...args.slice(2)],
        this.commandOptions
      )
    );
  }, "zadd");
  /**
   * @see https://redis.io/commands/xadd
   */
  xadd = /* @__PURE__ */ __name((...args) => this.chain(new XAddCommand(args, this.commandOptions)), "xadd");
  /**
   * @see https://redis.io/commands/xack
   */
  xack = /* @__PURE__ */ __name((...args) => this.chain(new XAckCommand(args, this.commandOptions)), "xack");
  /**
   * @see https://redis.io/commands/xackdel
   */
  xackdel = /* @__PURE__ */ __name((...args) => this.chain(new XAckDelCommand(args, this.commandOptions)), "xackdel");
  /**
   * @see https://redis.io/commands/xdel
   */
  xdel = /* @__PURE__ */ __name((...args) => this.chain(new XDelCommand(args, this.commandOptions)), "xdel");
  /**
   * @see https://redis.io/commands/xdelex
   */
  xdelex = /* @__PURE__ */ __name((...args) => this.chain(new XDelExCommand(args, this.commandOptions)), "xdelex");
  /**
   * @see https://redis.io/commands/xgroup
   */
  xgroup = /* @__PURE__ */ __name((...args) => this.chain(new XGroupCommand(args, this.commandOptions)), "xgroup");
  /**
   * @see https://redis.io/commands/xread
   */
  xread = /* @__PURE__ */ __name((...args) => this.chain(new XReadCommand(args, this.commandOptions)), "xread");
  /**
   * @see https://redis.io/commands/xreadgroup
   */
  xreadgroup = /* @__PURE__ */ __name((...args) => this.chain(new XReadGroupCommand(args, this.commandOptions)), "xreadgroup");
  /**
   * @see https://redis.io/commands/xinfo
   */
  xinfo = /* @__PURE__ */ __name((...args) => this.chain(new XInfoCommand(args, this.commandOptions)), "xinfo");
  /**
   * @see https://redis.io/commands/xlen
   */
  xlen = /* @__PURE__ */ __name((...args) => this.chain(new XLenCommand(args, this.commandOptions)), "xlen");
  /**
   * @see https://redis.io/commands/xpending
   */
  xpending = /* @__PURE__ */ __name((...args) => this.chain(new XPendingCommand(args, this.commandOptions)), "xpending");
  /**
   * @see https://redis.io/commands/xclaim
   */
  xclaim = /* @__PURE__ */ __name((...args) => this.chain(new XClaimCommand(args, this.commandOptions)), "xclaim");
  /**
   * @see https://redis.io/commands/xautoclaim
   */
  xautoclaim = /* @__PURE__ */ __name((...args) => this.chain(new XAutoClaim(args, this.commandOptions)), "xautoclaim");
  /**
   * @see https://redis.io/commands/xtrim
   */
  xtrim = /* @__PURE__ */ __name((...args) => this.chain(new XTrimCommand(args, this.commandOptions)), "xtrim");
  /**
   * @see https://redis.io/commands/xrange
   */
  xrange = /* @__PURE__ */ __name((...args) => this.chain(new XRangeCommand(args, this.commandOptions)), "xrange");
  /**
   * @see https://redis.io/commands/xrevrange
   */
  xrevrange = /* @__PURE__ */ __name((...args) => this.chain(new XRevRangeCommand(args, this.commandOptions)), "xrevrange");
  /**
   * @see https://redis.io/commands/zcard
   */
  zcard = /* @__PURE__ */ __name((...args) => this.chain(new ZCardCommand(args, this.commandOptions)), "zcard");
  /**
   * @see https://redis.io/commands/zcount
   */
  zcount = /* @__PURE__ */ __name((...args) => this.chain(new ZCountCommand(args, this.commandOptions)), "zcount");
  /**
   * @see https://redis.io/commands/zincrby
   */
  zincrby = /* @__PURE__ */ __name((key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions)), "zincrby");
  /**
   * @see https://redis.io/commands/zinterstore
   */
  zinterstore = /* @__PURE__ */ __name((...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions)), "zinterstore");
  /**
   * @see https://redis.io/commands/zlexcount
   */
  zlexcount = /* @__PURE__ */ __name((...args) => this.chain(new ZLexCountCommand(args, this.commandOptions)), "zlexcount");
  /**
   * @see https://redis.io/commands/zmscore
   */
  zmscore = /* @__PURE__ */ __name((...args) => this.chain(new ZMScoreCommand(args, this.commandOptions)), "zmscore");
  /**
   * @see https://redis.io/commands/zpopmax
   */
  zpopmax = /* @__PURE__ */ __name((...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions)), "zpopmax");
  /**
   * @see https://redis.io/commands/zpopmin
   */
  zpopmin = /* @__PURE__ */ __name((...args) => this.chain(new ZPopMinCommand(args, this.commandOptions)), "zpopmin");
  /**
   * @see https://redis.io/commands/zrange
   */
  zrange = /* @__PURE__ */ __name((...args) => this.chain(new ZRangeCommand(args, this.commandOptions)), "zrange");
  /**
   * @see https://redis.io/commands/zrank
   */
  zrank = /* @__PURE__ */ __name((key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions)), "zrank");
  /**
   * @see https://redis.io/commands/zrem
   */
  zrem = /* @__PURE__ */ __name((key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions)), "zrem");
  /**
   * @see https://redis.io/commands/zremrangebylex
   */
  zremrangebylex = /* @__PURE__ */ __name((...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions)), "zremrangebylex");
  /**
   * @see https://redis.io/commands/zremrangebyrank
   */
  zremrangebyrank = /* @__PURE__ */ __name((...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions)), "zremrangebyrank");
  /**
   * @see https://redis.io/commands/zremrangebyscore
   */
  zremrangebyscore = /* @__PURE__ */ __name((...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions)), "zremrangebyscore");
  /**
   * @see https://redis.io/commands/zrevrank
   */
  zrevrank = /* @__PURE__ */ __name((key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions)), "zrevrank");
  /**
   * @see https://redis.io/commands/zscan
   */
  zscan = /* @__PURE__ */ __name((...args) => this.chain(new ZScanCommand(args, this.commandOptions)), "zscan");
  /**
   * @see https://redis.io/commands/zscore
   */
  zscore = /* @__PURE__ */ __name((key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions)), "zscore");
  /**
   * @see https://redis.io/commands/zunionstore
   */
  zunionstore = /* @__PURE__ */ __name((...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions)), "zunionstore");
  /**
   * @see https://redis.io/commands/zunion
   */
  zunion = /* @__PURE__ */ __name((...args) => this.chain(new ZUnionCommand(args, this.commandOptions)), "zunion");
  /**
   * @see https://redis.io/commands/?group=json
   */
  get json() {
    return {
      /**
       * @see https://redis.io/commands/json.arrappend
       */
      arrappend: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)), "arrappend"),
      /**
       * @see https://redis.io/commands/json.arrindex
       */
      arrindex: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)), "arrindex"),
      /**
       * @see https://redis.io/commands/json.arrinsert
       */
      arrinsert: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)), "arrinsert"),
      /**
       * @see https://redis.io/commands/json.arrlen
       */
      arrlen: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)), "arrlen"),
      /**
       * @see https://redis.io/commands/json.arrpop
       */
      arrpop: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)), "arrpop"),
      /**
       * @see https://redis.io/commands/json.arrtrim
       */
      arrtrim: /* @__PURE__ */ __name((...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)), "arrtrim"),
      /**
       * @see https://redis.io/commands/json.clear
       */
      clear: /* @__PURE__ */ __name((...args) => this.chain(new JsonClearCommand(args, this.commandOptions)), "clear"),
      /**
       * @see https://redis.io/commands/json.del
       */
      del: /* @__PURE__ */ __name((...args) => this.chain(new JsonDelCommand(args, this.commandOptions)), "del"),
      /**
       * @see https://redis.io/commands/json.forget
       */
      forget: /* @__PURE__ */ __name((...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)), "forget"),
      /**
       * @see https://redis.io/commands/json.get
       */
      get: /* @__PURE__ */ __name((...args) => this.chain(new JsonGetCommand(args, this.commandOptions)), "get"),
      /**
       * @see https://redis.io/commands/json.merge
       */
      merge: /* @__PURE__ */ __name((...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)), "merge"),
      /**
       * @see https://redis.io/commands/json.mget
       */
      mget: /* @__PURE__ */ __name((...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)), "mget"),
      /**
       * @see https://redis.io/commands/json.mset
       */
      mset: /* @__PURE__ */ __name((...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)), "mset"),
      /**
       * @see https://redis.io/commands/json.numincrby
       */
      numincrby: /* @__PURE__ */ __name((...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)), "numincrby"),
      /**
       * @see https://redis.io/commands/json.nummultby
       */
      nummultby: /* @__PURE__ */ __name((...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)), "nummultby"),
      /**
       * @see https://redis.io/commands/json.objkeys
       */
      objkeys: /* @__PURE__ */ __name((...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)), "objkeys"),
      /**
       * @see https://redis.io/commands/json.objlen
       */
      objlen: /* @__PURE__ */ __name((...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)), "objlen"),
      /**
       * @see https://redis.io/commands/json.resp
       */
      resp: /* @__PURE__ */ __name((...args) => this.chain(new JsonRespCommand(args, this.commandOptions)), "resp"),
      /**
       * @see https://redis.io/commands/json.set
       */
      set: /* @__PURE__ */ __name((...args) => this.chain(new JsonSetCommand(args, this.commandOptions)), "set"),
      /**
       * @see https://redis.io/commands/json.strappend
       */
      strappend: /* @__PURE__ */ __name((...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)), "strappend"),
      /**
       * @see https://redis.io/commands/json.strlen
       */
      strlen: /* @__PURE__ */ __name((...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)), "strlen"),
      /**
       * @see https://redis.io/commands/json.toggle
       */
      toggle: /* @__PURE__ */ __name((...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)), "toggle"),
      /**
       * @see https://redis.io/commands/json.type
       */
      type: /* @__PURE__ */ __name((...args) => this.chain(new JsonTypeCommand(args, this.commandOptions)), "type")
    };
  }
  get functions() {
    return {
      /**
       * @see https://redis.io/docs/latest/commands/function-load/
       */
      load: /* @__PURE__ */ __name((...args) => this.chain(new FunctionLoadCommand(args, this.commandOptions)), "load"),
      /**
       * @see https://redis.io/docs/latest/commands/function-list/
       */
      list: /* @__PURE__ */ __name((...args) => this.chain(new FunctionListCommand(args, this.commandOptions)), "list"),
      /**
       * @see https://redis.io/docs/latest/commands/function-delete/
       */
      delete: /* @__PURE__ */ __name((...args) => this.chain(new FunctionDeleteCommand(args, this.commandOptions)), "delete"),
      /**
       * @see https://redis.io/docs/latest/commands/function-flush/
       */
      flush: /* @__PURE__ */ __name(() => this.chain(new FunctionFlushCommand(this.commandOptions)), "flush"),
      /**
       * @see https://redis.io/docs/latest/commands/function-stats/
       */
      stats: /* @__PURE__ */ __name(() => this.chain(new FunctionStatsCommand(this.commandOptions)), "stats"),
      /**
       * @see https://redis.io/docs/latest/commands/fcall/
       */
      call: /* @__PURE__ */ __name((...args) => this.chain(new FCallCommand(args, this.commandOptions)), "call"),
      /**
       * @see https://redis.io/docs/latest/commands/fcall_ro/
       */
      callRo: /* @__PURE__ */ __name((...args) => this.chain(new FCallRoCommand(args, this.commandOptions)), "callRo")
    };
  }
};
var EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
  "scan",
  "keys",
  "flushdb",
  "flushall",
  "dbsize",
  "hscan",
  "hgetall",
  "hkeys",
  "lrange",
  "sscan",
  "smembers",
  "xrange",
  "xrevrange",
  "zscan",
  "zrange",
  "exec"
]);
function createAutoPipelineProxy(_redis, namespace = "root") {
  const redis2 = _redis;
  if (!redis2.autoPipelineExecutor) {
    redis2.autoPipelineExecutor = new AutoPipelineExecutor(redis2);
  }
  return new Proxy(redis2, {
    get: /* @__PURE__ */ __name((redis22, command) => {
      if (command === "pipelineCounter") {
        return redis22.autoPipelineExecutor.pipelineCounter;
      }
      if (namespace === "root" && command === "json") {
        return createAutoPipelineProxy(redis22, "json");
      }
      if (namespace === "root" && command === "functions") {
        return createAutoPipelineProxy(redis22, "functions");
      }
      if (namespace === "root") {
        const commandInRedisButNotPipeline = command in redis22 && !(command in redis22.autoPipelineExecutor.pipeline);
        const isCommandExcluded = EXCLUDE_COMMANDS.has(command);
        if (commandInRedisButNotPipeline || isCommandExcluded) {
          return redis22[command];
        }
      }
      const pipeline = redis22.autoPipelineExecutor.pipeline;
      const targetFunction = namespace === "json" ? pipeline.json[command] : namespace === "functions" ? pipeline.functions[command] : pipeline[command];
      const isFunction = typeof targetFunction === "function";
      if (isFunction) {
        return (...args) => {
          return redis22.autoPipelineExecutor.withAutoPipeline((pipeline2) => {
            const targetFunction2 = namespace === "json" ? pipeline2.json[command] : namespace === "functions" ? pipeline2.functions[command] : pipeline2[command];
            targetFunction2(...args);
          });
        };
      }
      return targetFunction;
    }, "get")
  });
}
__name(createAutoPipelineProxy, "createAutoPipelineProxy");
var AutoPipelineExecutor = class {
  static {
    __name(this, "AutoPipelineExecutor");
  }
  pipelinePromises = /* @__PURE__ */ new WeakMap();
  activePipeline = null;
  indexInCurrentPipeline = 0;
  redis;
  pipeline;
  // only to make sure that proxy can work
  pipelineCounter = 0;
  // to keep track of how many times a pipeline was executed
  constructor(redis2) {
    this.redis = redis2;
    this.pipeline = redis2.pipeline();
  }
  async withAutoPipeline(executeWithPipeline) {
    const pipeline = this.activePipeline ?? this.redis.pipeline();
    if (!this.activePipeline) {
      this.activePipeline = pipeline;
      this.indexInCurrentPipeline = 0;
    }
    const index2 = this.indexInCurrentPipeline++;
    executeWithPipeline(pipeline);
    const pipelineDone = this.deferExecution().then(() => {
      if (!this.pipelinePromises.has(pipeline)) {
        const pipelinePromise = pipeline.exec({ keepErrors: true });
        this.pipelineCounter += 1;
        this.pipelinePromises.set(pipeline, pipelinePromise);
        this.activePipeline = null;
      }
      return this.pipelinePromises.get(pipeline);
    });
    const results = await pipelineDone;
    const commandResult = results[index2];
    if (commandResult.error) {
      throw new UpstashError(`Command failed: ${commandResult.error}`);
    }
    return commandResult.result;
  }
  async deferExecution() {
    await Promise.resolve();
    await Promise.resolve();
  }
};
var PSubscribeCommand = class extends Command {
  static {
    __name(this, "PSubscribeCommand");
  }
  constructor(cmd, opts) {
    const sseHeaders = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    };
    super([], {
      ...opts,
      headers: sseHeaders,
      path: ["psubscribe", ...cmd],
      streamOptions: {
        isStreaming: true,
        onMessage: opts?.streamOptions?.onMessage,
        signal: opts?.streamOptions?.signal
      }
    });
  }
};
var Subscriber = class extends EventTarget {
  static {
    __name(this, "Subscriber");
  }
  subscriptions;
  client;
  listeners;
  opts;
  constructor(client, channels, isPattern = false, opts) {
    super();
    this.client = client;
    this.subscriptions = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.opts = opts;
    for (const channel of channels) {
      if (isPattern) {
        this.subscribeToPattern(channel);
      } else {
        this.subscribeToChannel(channel);
      }
    }
  }
  subscribeToChannel(channel) {
    const controller = new AbortController();
    const command = new SubscribeCommand([channel], {
      streamOptions: {
        signal: controller.signal,
        onMessage: /* @__PURE__ */ __name((data) => this.handleMessage(data, false), "onMessage")
      }
    });
    command.exec(this.client).catch((error) => {
      if (error.name !== "AbortError") {
        this.dispatchToListeners("error", error);
      }
    });
    this.subscriptions.set(channel, {
      command,
      controller,
      isPattern: false
    });
  }
  subscribeToPattern(pattern) {
    const controller = new AbortController();
    const command = new PSubscribeCommand([pattern], {
      streamOptions: {
        signal: controller.signal,
        onMessage: /* @__PURE__ */ __name((data) => this.handleMessage(data, true), "onMessage")
      }
    });
    command.exec(this.client).catch((error) => {
      if (error.name !== "AbortError") {
        this.dispatchToListeners("error", error);
      }
    });
    this.subscriptions.set(pattern, {
      command,
      controller,
      isPattern: true
    });
  }
  handleMessage(data, isPattern) {
    const messageData = data.replace(/^data:\s*/, "");
    const firstCommaIndex = messageData.indexOf(",");
    const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
    const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
    if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
      const type = messageData.slice(0, firstCommaIndex);
      if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
        const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
        const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
        const messageStr = messageData.slice(thirdCommaIndex + 1);
        try {
          const message = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
          this.dispatchToListeners("pmessage", { pattern, channel, message });
          this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
        } catch (error) {
          this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
        }
      } else {
        const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
        const messageStr = messageData.slice(secondCommaIndex + 1);
        try {
          if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
            const count = Number.parseInt(messageStr);
            this.dispatchToListeners(type, count);
          } else {
            const message = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
            this.dispatchToListeners(type, { channel, message });
            this.dispatchToListeners(`${type}:${channel}`, { channel, message });
          }
        } catch (error) {
          this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
        }
      }
    }
  }
  dispatchToListeners(type, data) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }
  on(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, /* @__PURE__ */ new Set());
    }
    this.listeners.get(type)?.add(listener);
  }
  removeAllListeners() {
    this.listeners.clear();
  }
  async unsubscribe(channels) {
    if (channels) {
      for (const channel of channels) {
        const subscription = this.subscriptions.get(channel);
        if (subscription) {
          try {
            subscription.controller.abort();
          } catch {
          }
          this.subscriptions.delete(channel);
        }
      }
    } else {
      for (const subscription of this.subscriptions.values()) {
        try {
          subscription.controller.abort();
        } catch {
        }
      }
      this.subscriptions.clear();
      this.removeAllListeners();
    }
  }
  getSubscribedChannels() {
    return [...this.subscriptions.keys()];
  }
};
var SubscribeCommand = class extends Command {
  static {
    __name(this, "SubscribeCommand");
  }
  constructor(cmd, opts) {
    const sseHeaders = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    };
    super([], {
      ...opts,
      headers: sseHeaders,
      path: ["subscribe", ...cmd],
      streamOptions: {
        isStreaming: true,
        onMessage: opts?.streamOptions?.onMessage,
        signal: opts?.streamOptions?.signal
      }
    });
  }
};
var parseWithTryCatch = /* @__PURE__ */ __name((str2) => {
  try {
    return JSON.parse(str2);
  } catch {
    return str2;
  }
}, "parseWithTryCatch");
var Script = class {
  static {
    __name(this, "Script");
  }
  script;
  /**
   * @deprecated This property is initialized to an empty string and will be set in the init method
   * asynchronously. Do not use this property immidiately after the constructor.
   *
   * This property is only exposed for backwards compatibility and will be removed in the
   * future major release.
   */
  sha1;
  initPromise;
  redis;
  constructor(redis2, script) {
    this.redis = redis2;
    this.script = script;
    this.sha1 = "";
    void this.init(script);
  }
  /**
   * Initialize the script by computing its SHA-1 hash.
   */
  init(script) {
    if (!this.initPromise) {
      this.initPromise = this.digest(script).then((sha1) => {
        this.sha1 = sha1;
      });
    }
    return this.initPromise;
  }
  /**
   * Send an `EVAL` command to redis.
   */
  async eval(keys, args) {
    await this.init(this.script);
    return await this.redis.eval(this.script, keys, args);
  }
  /**
   * Calculates the sha1 hash of the script and then calls `EVALSHA`.
   */
  async evalsha(keys, args) {
    await this.init(this.script);
    return await this.redis.evalsha(this.sha1, keys, args);
  }
  /**
   * Optimistically try to run `EVALSHA` first.
   * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
   *
   * Following calls will be able to use the cached script
   */
  async exec(keys, args) {
    await this.init(this.script);
    const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
      if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
        return await this.redis.eval(this.script, keys, args);
      }
      throw error;
    });
    return res;
  }
  /**
   * Compute the sha1 hash of the script and return its hex representation.
   */
  async digest(s) {
    const data = new TextEncoder().encode(s);
    const hashBuffer = await subtle.digest("SHA-1", data);
    const hashArray = [...new Uint8Array(hashBuffer)];
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
};
var ScriptRO = class {
  static {
    __name(this, "ScriptRO");
  }
  script;
  /**
   * @deprecated This property is initialized to an empty string and will be set in the init method
   * asynchronously. Do not use this property immidiately after the constructor.
   *
   * This property is only exposed for backwards compatibility and will be removed in the
   * future major release.
   */
  sha1;
  initPromise;
  redis;
  constructor(redis2, script) {
    this.redis = redis2;
    this.sha1 = "";
    this.script = script;
    void this.init(script);
  }
  init(script) {
    if (!this.initPromise) {
      this.initPromise = this.digest(script).then((sha1) => {
        this.sha1 = sha1;
      });
    }
    return this.initPromise;
  }
  /**
   * Send an `EVAL_RO` command to redis.
   */
  async evalRo(keys, args) {
    await this.init(this.script);
    return await this.redis.evalRo(this.script, keys, args);
  }
  /**
   * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
   */
  async evalshaRo(keys, args) {
    await this.init(this.script);
    return await this.redis.evalshaRo(this.sha1, keys, args);
  }
  /**
   * Optimistically try to run `EVALSHA_RO` first.
   * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
   *
   * Following calls will be able to use the cached script
   */
  async exec(keys, args) {
    await this.init(this.script);
    const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
      if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
        return await this.redis.evalRo(this.script, keys, args);
      }
      throw error;
    });
    return res;
  }
  /**
   * Compute the sha1 hash of the script and return its hex representation.
   */
  async digest(s) {
    const data = new TextEncoder().encode(s);
    const hashBuffer = await subtle.digest("SHA-1", data);
    const hashArray = [...new Uint8Array(hashBuffer)];
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
};
var Redis = class {
  static {
    __name(this, "Redis");
  }
  client;
  opts;
  enableTelemetry;
  enableAutoPipelining;
  /**
   * Create a new redis client
   *
   * @example
   * ```typescript
   * const redis = new Redis({
   *  url: "<UPSTASH_REDIS_REST_URL>",
   *  token: "<UPSTASH_REDIS_REST_TOKEN>",
   * });
   * ```
   */
  constructor(client, opts) {
    this.client = client;
    this.opts = opts;
    this.enableTelemetry = opts?.enableTelemetry ?? true;
    if (opts?.readYourWrites === false) {
      this.client.readYourWrites = false;
    }
    this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
  }
  get readYourWritesSyncToken() {
    return this.client.upstashSyncToken;
  }
  set readYourWritesSyncToken(session) {
    this.client.upstashSyncToken = session;
  }
  get json() {
    return {
      /**
       * @see https://redis.io/commands/json.arrappend
       */
      arrappend: /* @__PURE__ */ __name((...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client), "arrappend"),
      /**
       * @see https://redis.io/commands/json.arrindex
       */
      arrindex: /* @__PURE__ */ __name((...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client), "arrindex"),
      /**
       * @see https://redis.io/commands/json.arrinsert
       */
      arrinsert: /* @__PURE__ */ __name((...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client), "arrinsert"),
      /**
       * @see https://redis.io/commands/json.arrlen
       */
      arrlen: /* @__PURE__ */ __name((...args) => new JsonArrLenCommand(args, this.opts).exec(this.client), "arrlen"),
      /**
       * @see https://redis.io/commands/json.arrpop
       */
      arrpop: /* @__PURE__ */ __name((...args) => new JsonArrPopCommand(args, this.opts).exec(this.client), "arrpop"),
      /**
       * @see https://redis.io/commands/json.arrtrim
       */
      arrtrim: /* @__PURE__ */ __name((...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client), "arrtrim"),
      /**
       * @see https://redis.io/commands/json.clear
       */
      clear: /* @__PURE__ */ __name((...args) => new JsonClearCommand(args, this.opts).exec(this.client), "clear"),
      /**
       * @see https://redis.io/commands/json.del
       */
      del: /* @__PURE__ */ __name((...args) => new JsonDelCommand(args, this.opts).exec(this.client), "del"),
      /**
       * @see https://redis.io/commands/json.forget
       */
      forget: /* @__PURE__ */ __name((...args) => new JsonForgetCommand(args, this.opts).exec(this.client), "forget"),
      /**
       * @see https://redis.io/commands/json.get
       */
      get: /* @__PURE__ */ __name((...args) => new JsonGetCommand(args, this.opts).exec(this.client), "get"),
      /**
       * @see https://redis.io/commands/json.merge
       */
      merge: /* @__PURE__ */ __name((...args) => new JsonMergeCommand(args, this.opts).exec(this.client), "merge"),
      /**
       * @see https://redis.io/commands/json.mget
       */
      mget: /* @__PURE__ */ __name((...args) => new JsonMGetCommand(args, this.opts).exec(this.client), "mget"),
      /**
       * @see https://redis.io/commands/json.mset
       */
      mset: /* @__PURE__ */ __name((...args) => new JsonMSetCommand(args, this.opts).exec(this.client), "mset"),
      /**
       * @see https://redis.io/commands/json.numincrby
       */
      numincrby: /* @__PURE__ */ __name((...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client), "numincrby"),
      /**
       * @see https://redis.io/commands/json.nummultby
       */
      nummultby: /* @__PURE__ */ __name((...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client), "nummultby"),
      /**
       * @see https://redis.io/commands/json.objkeys
       */
      objkeys: /* @__PURE__ */ __name((...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client), "objkeys"),
      /**
       * @see https://redis.io/commands/json.objlen
       */
      objlen: /* @__PURE__ */ __name((...args) => new JsonObjLenCommand(args, this.opts).exec(this.client), "objlen"),
      /**
       * @see https://redis.io/commands/json.resp
       */
      resp: /* @__PURE__ */ __name((...args) => new JsonRespCommand(args, this.opts).exec(this.client), "resp"),
      /**
       * @see https://redis.io/commands/json.set
       */
      set: /* @__PURE__ */ __name((...args) => new JsonSetCommand(args, this.opts).exec(this.client), "set"),
      /**
       * @see https://redis.io/commands/json.strappend
       */
      strappend: /* @__PURE__ */ __name((...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client), "strappend"),
      /**
       * @see https://redis.io/commands/json.strlen
       */
      strlen: /* @__PURE__ */ __name((...args) => new JsonStrLenCommand(args, this.opts).exec(this.client), "strlen"),
      /**
       * @see https://redis.io/commands/json.toggle
       */
      toggle: /* @__PURE__ */ __name((...args) => new JsonToggleCommand(args, this.opts).exec(this.client), "toggle"),
      /**
       * @see https://redis.io/commands/json.type
       */
      type: /* @__PURE__ */ __name((...args) => new JsonTypeCommand(args, this.opts).exec(this.client), "type")
    };
  }
  get functions() {
    return {
      /**
       * @see https://redis.io/docs/latest/commands/function-load/
       */
      load: /* @__PURE__ */ __name((...args) => new FunctionLoadCommand(args, this.opts).exec(this.client), "load"),
      /**
       * @see https://redis.io/docs/latest/commands/function-list/
       */
      list: /* @__PURE__ */ __name((...args) => new FunctionListCommand(args, this.opts).exec(this.client), "list"),
      /**
       * @see https://redis.io/docs/latest/commands/function-delete/
       */
      delete: /* @__PURE__ */ __name((...args) => new FunctionDeleteCommand(args, this.opts).exec(this.client), "delete"),
      /**
       * @see https://redis.io/docs/latest/commands/function-flush/
       */
      flush: /* @__PURE__ */ __name(() => new FunctionFlushCommand(this.opts).exec(this.client), "flush"),
      /**
       * @see https://redis.io/docs/latest/commands/function-stats/
       *
       * Note: `running_script` field is not supported and therefore not included in the type.
       */
      stats: /* @__PURE__ */ __name(() => new FunctionStatsCommand(this.opts).exec(this.client), "stats"),
      /**
       * @see https://redis.io/docs/latest/commands/fcall/
       */
      call: /* @__PURE__ */ __name((...args) => new FCallCommand(args, this.opts).exec(this.client), "call"),
      /**
       * @see https://redis.io/docs/latest/commands/fcall_ro/
       */
      callRo: /* @__PURE__ */ __name((...args) => new FCallRoCommand(args, this.opts).exec(this.client), "callRo")
    };
  }
  /**
   * Wrap a new middleware around the HTTP client.
   */
  use = /* @__PURE__ */ __name((middleware) => {
    const makeRequest = this.client.request.bind(this.client);
    this.client.request = (req) => middleware(req, makeRequest);
  }, "use");
  /**
   * Technically this is not private, we can hide it from intellisense by doing this
   */
  addTelemetry = /* @__PURE__ */ __name((telemetry) => {
    if (!this.enableTelemetry) {
      return;
    }
    try {
      this.client.mergeTelemetry(telemetry);
    } catch {
    }
  }, "addTelemetry");
  /**
   * Creates a new script.
   *
   * Scripts offer the ability to optimistically try to execute a script without having to send the
   * entire script to the server. If the script is loaded on the server, it tries again by sending
   * the entire script. Afterwards, the script is cached on the server.
   *
   * @param script - The script to create
   * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
   * @returns A new script
   *
   * @example
   * ```ts
   * const redis = new Redis({...})
   *
   * const script = redis.createScript<string>("return ARGV[1];")
   * const arg1 = await script.eval([], ["Hello World"])
   * expect(arg1, "Hello World")
   * ```
   * @example
   * ```ts
   * const redis = new Redis({...})
   *
   * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
   * const arg1 = await script.evalRo([], ["Hello World"])
   * expect(arg1, "Hello World")
   * ```
   */
  createScript(script, opts) {
    return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script);
  }
  get search() {
    return {
      createIndex: /* @__PURE__ */ __name((params) => {
        return createIndex(this.client, params);
      }, "createIndex"),
      index: /* @__PURE__ */ __name((params) => {
        return initIndex(this.client, params);
      }, "index"),
      alias: {
        list: /* @__PURE__ */ __name(() => {
          return listAliases(this.client);
        }, "list"),
        add: /* @__PURE__ */ __name(({ indexName, alias }) => {
          return addAlias(this.client, { indexName, alias });
        }, "add"),
        delete: /* @__PURE__ */ __name(({ alias }) => {
          return delAlias(this.client, { alias });
        }, "delete")
      }
    };
  }
  /**
   * Create a new pipeline that allows you to send requests in bulk.
   *
   * @see {@link Pipeline}
   */
  pipeline = /* @__PURE__ */ __name(() => new Pipeline({
    client: this.client,
    commandOptions: this.opts,
    multiExec: false
  }), "pipeline");
  autoPipeline = /* @__PURE__ */ __name(() => {
    return createAutoPipelineProxy(this);
  }, "autoPipeline");
  /**
   * Create a new transaction to allow executing multiple steps atomically.
   *
   * All the commands in a transaction are serialized and executed sequentially. A request sent by
   * another client will never be served in the middle of the execution of a Redis Transaction. This
   * guarantees that the commands are executed as a single isolated operation.
   *
   * @see {@link Pipeline}
   */
  multi = /* @__PURE__ */ __name(() => new Pipeline({
    client: this.client,
    commandOptions: this.opts,
    multiExec: true
  }), "multi");
  /**
   * Returns an instance that can be used to execute `BITFIELD` commands on one key.
   *
   * @example
   * ```typescript
   * redis.set("mykey", 0);
   * const result = await redis.bitfield("mykey")
   *   .set("u4", 0, 16)
   *   .incr("u4", "#1", 1)
   *   .exec();
   * console.log(result); // [0, 1]
   * ```
   *
   * @see https://redis.io/commands/bitfield
   */
  bitfield = /* @__PURE__ */ __name((...args) => new BitFieldCommand(args, this.client, this.opts), "bitfield");
  /**
   * @see https://redis.io/commands/append
   */
  append = /* @__PURE__ */ __name((...args) => new AppendCommand(args, this.opts).exec(this.client), "append");
  /**
   * @see https://redis.io/commands/bitcount
   */
  bitcount = /* @__PURE__ */ __name((...args) => new BitCountCommand(args, this.opts).exec(this.client), "bitcount");
  /**
   * @see https://redis.io/commands/bitop
   */
  bitop = /* @__PURE__ */ __name((op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
    this.client
  ), "bitop");
  /**
   * @see https://redis.io/commands/bitpos
   */
  bitpos = /* @__PURE__ */ __name((...args) => new BitPosCommand(args, this.opts).exec(this.client), "bitpos");
  /**
   * @see https://redis.io/commands/client-setinfo
   */
  clientSetinfo = /* @__PURE__ */ __name((...args) => new ClientSetInfoCommand(args, this.opts).exec(this.client), "clientSetinfo");
  /**
   * @see https://redis.io/commands/copy
   */
  copy = /* @__PURE__ */ __name((...args) => new CopyCommand(args, this.opts).exec(this.client), "copy");
  /**
   * @see https://redis.io/commands/dbsize
   */
  dbsize = /* @__PURE__ */ __name(() => new DBSizeCommand(this.opts).exec(this.client), "dbsize");
  /**
   * @see https://redis.io/commands/decr
   */
  decr = /* @__PURE__ */ __name((...args) => new DecrCommand(args, this.opts).exec(this.client), "decr");
  /**
   * @see https://redis.io/commands/decrby
   */
  decrby = /* @__PURE__ */ __name((...args) => new DecrByCommand(args, this.opts).exec(this.client), "decrby");
  /**
   * @see https://redis.io/commands/del
   */
  del = /* @__PURE__ */ __name((...args) => new DelCommand(args, this.opts).exec(this.client), "del");
  /**
   * @see https://redis.io/commands/echo
   */
  echo = /* @__PURE__ */ __name((...args) => new EchoCommand(args, this.opts).exec(this.client), "echo");
  /**
   * @see https://redis.io/commands/eval_ro
   */
  evalRo = /* @__PURE__ */ __name((...args) => new EvalROCommand(args, this.opts).exec(this.client), "evalRo");
  /**
   * @see https://redis.io/commands/eval
   */
  eval = /* @__PURE__ */ __name((...args) => new EvalCommand(args, this.opts).exec(this.client), "eval");
  /**
   * @see https://redis.io/commands/evalsha_ro
   */
  evalshaRo = /* @__PURE__ */ __name((...args) => new EvalshaROCommand(args, this.opts).exec(this.client), "evalshaRo");
  /**
   * @see https://redis.io/commands/evalsha
   */
  evalsha = /* @__PURE__ */ __name((...args) => new EvalshaCommand(args, this.opts).exec(this.client), "evalsha");
  /**
   * Generic method to execute any Redis command.
   */
  exec = /* @__PURE__ */ __name((args) => new ExecCommand(args, this.opts).exec(this.client), "exec");
  /**
   * @see https://redis.io/commands/exists
   */
  exists = /* @__PURE__ */ __name((...args) => new ExistsCommand(args, this.opts).exec(this.client), "exists");
  /**
   * @see https://redis.io/commands/expire
   */
  expire = /* @__PURE__ */ __name((...args) => new ExpireCommand(args, this.opts).exec(this.client), "expire");
  /**
   * @see https://redis.io/commands/expireat
   */
  expireat = /* @__PURE__ */ __name((...args) => new ExpireAtCommand(args, this.opts).exec(this.client), "expireat");
  /**
   * @see https://redis.io/commands/flushall
   */
  flushall = /* @__PURE__ */ __name((args) => new FlushAllCommand(args, this.opts).exec(this.client), "flushall");
  /**
   * @see https://redis.io/commands/flushdb
   */
  flushdb = /* @__PURE__ */ __name((...args) => new FlushDBCommand(args, this.opts).exec(this.client), "flushdb");
  /**
   * @see https://redis.io/commands/geoadd
   */
  geoadd = /* @__PURE__ */ __name((...args) => new GeoAddCommand(args, this.opts).exec(this.client), "geoadd");
  /**
   * @see https://redis.io/commands/geopos
   */
  geopos = /* @__PURE__ */ __name((...args) => new GeoPosCommand(args, this.opts).exec(this.client), "geopos");
  /**
   * @see https://redis.io/commands/geodist
   */
  geodist = /* @__PURE__ */ __name((...args) => new GeoDistCommand(args, this.opts).exec(this.client), "geodist");
  /**
   * @see https://redis.io/commands/geohash
   */
  geohash = /* @__PURE__ */ __name((...args) => new GeoHashCommand(args, this.opts).exec(this.client), "geohash");
  /**
   * @see https://redis.io/commands/geosearch
   */
  geosearch = /* @__PURE__ */ __name((...args) => new GeoSearchCommand(args, this.opts).exec(this.client), "geosearch");
  /**
   * @see https://redis.io/commands/geosearchstore
   */
  geosearchstore = /* @__PURE__ */ __name((...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client), "geosearchstore");
  /**
   * @see https://redis.io/commands/get
   */
  get = /* @__PURE__ */ __name((...args) => new GetCommand(args, this.opts).exec(this.client), "get");
  /**
   * @see https://redis.io/commands/getbit
   */
  getbit = /* @__PURE__ */ __name((...args) => new GetBitCommand(args, this.opts).exec(this.client), "getbit");
  /**
   * @see https://redis.io/commands/getdel
   */
  getdel = /* @__PURE__ */ __name((...args) => new GetDelCommand(args, this.opts).exec(this.client), "getdel");
  /**
   * @see https://redis.io/commands/getex
   */
  getex = /* @__PURE__ */ __name((...args) => new GetExCommand(args, this.opts).exec(this.client), "getex");
  /**
   * @see https://redis.io/commands/getrange
   */
  getrange = /* @__PURE__ */ __name((...args) => new GetRangeCommand(args, this.opts).exec(this.client), "getrange");
  /**
   * @see https://redis.io/commands/getset
   */
  getset = /* @__PURE__ */ __name((key, value) => new GetSetCommand([key, value], this.opts).exec(this.client), "getset");
  /**
   * @see https://redis.io/commands/hdel
   */
  hdel = /* @__PURE__ */ __name((...args) => new HDelCommand(args, this.opts).exec(this.client), "hdel");
  /**
   * @see https://redis.io/commands/hexists
   */
  hexists = /* @__PURE__ */ __name((...args) => new HExistsCommand(args, this.opts).exec(this.client), "hexists");
  /**
   * @see https://redis.io/commands/hexpire
   */
  hexpire = /* @__PURE__ */ __name((...args) => new HExpireCommand(args, this.opts).exec(this.client), "hexpire");
  /**
   * @see https://redis.io/commands/hexpireat
   */
  hexpireat = /* @__PURE__ */ __name((...args) => new HExpireAtCommand(args, this.opts).exec(this.client), "hexpireat");
  /**
   * @see https://redis.io/commands/hexpiretime
   */
  hexpiretime = /* @__PURE__ */ __name((...args) => new HExpireTimeCommand(args, this.opts).exec(this.client), "hexpiretime");
  /**
   * @see https://redis.io/commands/httl
   */
  httl = /* @__PURE__ */ __name((...args) => new HTtlCommand(args, this.opts).exec(this.client), "httl");
  /**
   * @see https://redis.io/commands/hpexpire
   */
  hpexpire = /* @__PURE__ */ __name((...args) => new HPExpireCommand(args, this.opts).exec(this.client), "hpexpire");
  /**
   * @see https://redis.io/commands/hpexpireat
   */
  hpexpireat = /* @__PURE__ */ __name((...args) => new HPExpireAtCommand(args, this.opts).exec(this.client), "hpexpireat");
  /**
   * @see https://redis.io/commands/hpexpiretime
   */
  hpexpiretime = /* @__PURE__ */ __name((...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client), "hpexpiretime");
  /**
   * @see https://redis.io/commands/hpttl
   */
  hpttl = /* @__PURE__ */ __name((...args) => new HPTtlCommand(args, this.opts).exec(this.client), "hpttl");
  /**
   * @see https://redis.io/commands/hpersist
   */
  hpersist = /* @__PURE__ */ __name((...args) => new HPersistCommand(args, this.opts).exec(this.client), "hpersist");
  /**
   * @see https://redis.io/commands/hget
   */
  hget = /* @__PURE__ */ __name((...args) => new HGetCommand(args, this.opts).exec(this.client), "hget");
  /**
   * @see https://redis.io/commands/hgetall
   */
  hgetall = /* @__PURE__ */ __name((...args) => new HGetAllCommand(args, this.opts).exec(this.client), "hgetall");
  /**
   * @see https://redis.io/commands/hgetdel
   */
  hgetdel = /* @__PURE__ */ __name((...args) => new HGetDelCommand(args, this.opts).exec(this.client), "hgetdel");
  /**
   * @see https://redis.io/commands/hgetex
   */
  hgetex = /* @__PURE__ */ __name((...args) => new HGetExCommand(args, this.opts).exec(this.client), "hgetex");
  /**
   * @see https://redis.io/commands/hincrby
   */
  hincrby = /* @__PURE__ */ __name((...args) => new HIncrByCommand(args, this.opts).exec(this.client), "hincrby");
  /**
   * @see https://redis.io/commands/hincrbyfloat
   */
  hincrbyfloat = /* @__PURE__ */ __name((...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client), "hincrbyfloat");
  /**
   * @see https://redis.io/commands/hkeys
   */
  hkeys = /* @__PURE__ */ __name((...args) => new HKeysCommand(args, this.opts).exec(this.client), "hkeys");
  /**
   * @see https://redis.io/commands/hlen
   */
  hlen = /* @__PURE__ */ __name((...args) => new HLenCommand(args, this.opts).exec(this.client), "hlen");
  /**
   * @see https://redis.io/commands/hmget
   */
  hmget = /* @__PURE__ */ __name((...args) => new HMGetCommand(args, this.opts).exec(this.client), "hmget");
  /**
   * @see https://redis.io/commands/hmset
   */
  hmset = /* @__PURE__ */ __name((key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client), "hmset");
  /**
   * @see https://redis.io/commands/hrandfield
   */
  hrandfield = /* @__PURE__ */ __name((key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client), "hrandfield");
  /**
   * @see https://redis.io/commands/hscan
   */
  hscan = /* @__PURE__ */ __name((...args) => new HScanCommand(args, this.opts).exec(this.client), "hscan");
  /**
   * @see https://redis.io/commands/hset
   */
  hset = /* @__PURE__ */ __name((key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client), "hset");
  /**
   * @see https://redis.io/commands/hsetex
   */
  hsetex = /* @__PURE__ */ __name((...args) => new HSetExCommand(args, this.opts).exec(this.client), "hsetex");
  /**
   * @see https://redis.io/commands/hsetnx
   */
  hsetnx = /* @__PURE__ */ __name((key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client), "hsetnx");
  /**
   * @see https://redis.io/commands/hstrlen
   */
  hstrlen = /* @__PURE__ */ __name((...args) => new HStrLenCommand(args, this.opts).exec(this.client), "hstrlen");
  /**
   * @see https://redis.io/commands/hvals
   */
  hvals = /* @__PURE__ */ __name((...args) => new HValsCommand(args, this.opts).exec(this.client), "hvals");
  /**
   * @see https://redis.io/commands/incr
   */
  incr = /* @__PURE__ */ __name((...args) => new IncrCommand(args, this.opts).exec(this.client), "incr");
  /**
   * @see https://redis.io/commands/incrby
   */
  incrby = /* @__PURE__ */ __name((...args) => new IncrByCommand(args, this.opts).exec(this.client), "incrby");
  /**
   * @see https://redis.io/commands/incrbyfloat
   */
  incrbyfloat = /* @__PURE__ */ __name((...args) => new IncrByFloatCommand(args, this.opts).exec(this.client), "incrbyfloat");
  /**
   * @see https://redis.io/commands/keys
   */
  keys = /* @__PURE__ */ __name((...args) => new KeysCommand(args, this.opts).exec(this.client), "keys");
  /**
   * @see https://redis.io/commands/lindex
   */
  lindex = /* @__PURE__ */ __name((...args) => new LIndexCommand(args, this.opts).exec(this.client), "lindex");
  /**
   * @see https://redis.io/commands/linsert
   */
  linsert = /* @__PURE__ */ __name((key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client), "linsert");
  /**
   * @see https://redis.io/commands/llen
   */
  llen = /* @__PURE__ */ __name((...args) => new LLenCommand(args, this.opts).exec(this.client), "llen");
  /**
   * @see https://redis.io/commands/lmove
   */
  lmove = /* @__PURE__ */ __name((...args) => new LMoveCommand(args, this.opts).exec(this.client), "lmove");
  /**
   * @see https://redis.io/commands/lpop
   */
  lpop = /* @__PURE__ */ __name((...args) => new LPopCommand(args, this.opts).exec(this.client), "lpop");
  /**
   * @see https://redis.io/commands/lmpop
   */
  lmpop = /* @__PURE__ */ __name((...args) => new LmPopCommand(args, this.opts).exec(this.client), "lmpop");
  /**
   * @see https://redis.io/commands/lpos
   */
  lpos = /* @__PURE__ */ __name((...args) => new LPosCommand(args, this.opts).exec(this.client), "lpos");
  /**
   * @see https://redis.io/commands/lpush
   */
  lpush = /* @__PURE__ */ __name((key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client), "lpush");
  /**
   * @see https://redis.io/commands/lpushx
   */
  lpushx = /* @__PURE__ */ __name((key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client), "lpushx");
  /**
   * @see https://redis.io/commands/lrange
   */
  lrange = /* @__PURE__ */ __name((...args) => new LRangeCommand(args, this.opts).exec(this.client), "lrange");
  /**
   * @see https://redis.io/commands/lrem
   */
  lrem = /* @__PURE__ */ __name((key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client), "lrem");
  /**
   * @see https://redis.io/commands/lset
   */
  lset = /* @__PURE__ */ __name((key, index2, value) => new LSetCommand([key, index2, value], this.opts).exec(this.client), "lset");
  /**
   * @see https://redis.io/commands/ltrim
   */
  ltrim = /* @__PURE__ */ __name((...args) => new LTrimCommand(args, this.opts).exec(this.client), "ltrim");
  /**
   * @see https://redis.io/commands/mget
   */
  mget = /* @__PURE__ */ __name((...args) => new MGetCommand(args, this.opts).exec(this.client), "mget");
  /**
   * @see https://redis.io/commands/mset
   */
  mset = /* @__PURE__ */ __name((kv) => new MSetCommand([kv], this.opts).exec(this.client), "mset");
  /**
   * @see https://redis.io/commands/msetnx
   */
  msetnx = /* @__PURE__ */ __name((kv) => new MSetNXCommand([kv], this.opts).exec(this.client), "msetnx");
  /**
   * @see https://redis.io/commands/persist
   */
  persist = /* @__PURE__ */ __name((...args) => new PersistCommand(args, this.opts).exec(this.client), "persist");
  /**
   * @see https://redis.io/commands/pexpire
   */
  pexpire = /* @__PURE__ */ __name((...args) => new PExpireCommand(args, this.opts).exec(this.client), "pexpire");
  /**
   * @see https://redis.io/commands/pexpireat
   */
  pexpireat = /* @__PURE__ */ __name((...args) => new PExpireAtCommand(args, this.opts).exec(this.client), "pexpireat");
  /**
   * @see https://redis.io/commands/pfadd
   */
  pfadd = /* @__PURE__ */ __name((...args) => new PfAddCommand(args, this.opts).exec(this.client), "pfadd");
  /**
   * @see https://redis.io/commands/pfcount
   */
  pfcount = /* @__PURE__ */ __name((...args) => new PfCountCommand(args, this.opts).exec(this.client), "pfcount");
  /**
   * @see https://redis.io/commands/pfmerge
   */
  pfmerge = /* @__PURE__ */ __name((...args) => new PfMergeCommand(args, this.opts).exec(this.client), "pfmerge");
  /**
   * @see https://redis.io/commands/ping
   */
  ping = /* @__PURE__ */ __name((args) => new PingCommand(args, this.opts).exec(this.client), "ping");
  /**
   * @see https://redis.io/commands/psetex
   */
  psetex = /* @__PURE__ */ __name((key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client), "psetex");
  /**
   * @see https://redis.io/commands/psubscribe
   */
  psubscribe = /* @__PURE__ */ __name((patterns) => {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    return new Subscriber(this.client, patternArray, true, this.opts);
  }, "psubscribe");
  /**
   * @see https://redis.io/commands/pttl
   */
  pttl = /* @__PURE__ */ __name((...args) => new PTtlCommand(args, this.opts).exec(this.client), "pttl");
  /**
   * @see https://redis.io/commands/publish
   */
  publish = /* @__PURE__ */ __name((...args) => new PublishCommand(args, this.opts).exec(this.client), "publish");
  /**
   * @see https://redis.io/commands/randomkey
   */
  randomkey = /* @__PURE__ */ __name(() => new RandomKeyCommand().exec(this.client), "randomkey");
  /**
   * @see https://redis.io/commands/rename
   */
  rename = /* @__PURE__ */ __name((...args) => new RenameCommand(args, this.opts).exec(this.client), "rename");
  /**
   * @see https://redis.io/commands/renamenx
   */
  renamenx = /* @__PURE__ */ __name((...args) => new RenameNXCommand(args, this.opts).exec(this.client), "renamenx");
  /**
   * @see https://redis.io/commands/rpop
   */
  rpop = /* @__PURE__ */ __name((...args) => new RPopCommand(args, this.opts).exec(this.client), "rpop");
  /**
   * @see https://redis.io/commands/rpush
   */
  rpush = /* @__PURE__ */ __name((key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client), "rpush");
  /**
   * @see https://redis.io/commands/rpushx
   */
  rpushx = /* @__PURE__ */ __name((key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client), "rpushx");
  /**
   * @see https://redis.io/commands/sadd
   */
  sadd = /* @__PURE__ */ __name((key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client), "sadd");
  scan(cursor, opts) {
    return new ScanCommand([cursor, opts], this.opts).exec(this.client);
  }
  /**
   * @see https://redis.io/commands/scard
   */
  scard = /* @__PURE__ */ __name((...args) => new SCardCommand(args, this.opts).exec(this.client), "scard");
  /**
   * @see https://redis.io/commands/script-exists
   */
  scriptExists = /* @__PURE__ */ __name((...args) => new ScriptExistsCommand(args, this.opts).exec(this.client), "scriptExists");
  /**
   * @see https://redis.io/commands/script-flush
   */
  scriptFlush = /* @__PURE__ */ __name((...args) => new ScriptFlushCommand(args, this.opts).exec(this.client), "scriptFlush");
  /**
   * @see https://redis.io/commands/script-load
   */
  scriptLoad = /* @__PURE__ */ __name((...args) => new ScriptLoadCommand(args, this.opts).exec(this.client), "scriptLoad");
  /**
   * @see https://redis.io/commands/sdiff
   */
  sdiff = /* @__PURE__ */ __name((...args) => new SDiffCommand(args, this.opts).exec(this.client), "sdiff");
  /**
   * @see https://redis.io/commands/sdiffstore
   */
  sdiffstore = /* @__PURE__ */ __name((...args) => new SDiffStoreCommand(args, this.opts).exec(this.client), "sdiffstore");
  /**
   * @see https://redis.io/commands/set
   */
  set = /* @__PURE__ */ __name((key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client), "set");
  /**
   * @see https://redis.io/commands/setbit
   */
  setbit = /* @__PURE__ */ __name((...args) => new SetBitCommand(args, this.opts).exec(this.client), "setbit");
  /**
   * @see https://redis.io/commands/setex
   */
  setex = /* @__PURE__ */ __name((key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client), "setex");
  /**
   * @see https://redis.io/commands/setnx
   */
  setnx = /* @__PURE__ */ __name((key, value) => new SetNxCommand([key, value], this.opts).exec(this.client), "setnx");
  /**
   * @see https://redis.io/commands/setrange
   */
  setrange = /* @__PURE__ */ __name((...args) => new SetRangeCommand(args, this.opts).exec(this.client), "setrange");
  /**
   * @see https://redis.io/commands/sinter
   */
  sinter = /* @__PURE__ */ __name((...args) => new SInterCommand(args, this.opts).exec(this.client), "sinter");
  /**
   * @see https://redis.io/commands/sintercard
   */
  sintercard = /* @__PURE__ */ __name((...args) => new SInterCardCommand(args, this.opts).exec(this.client), "sintercard");
  /**
   * @see https://redis.io/commands/sinterstore
   */
  sinterstore = /* @__PURE__ */ __name((...args) => new SInterStoreCommand(args, this.opts).exec(this.client), "sinterstore");
  /**
   * @see https://redis.io/commands/sismember
   */
  sismember = /* @__PURE__ */ __name((key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client), "sismember");
  /**
   * @see https://redis.io/commands/smismember
   */
  smismember = /* @__PURE__ */ __name((key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client), "smismember");
  /**
   * @see https://redis.io/commands/smembers
   */
  smembers = /* @__PURE__ */ __name((...args) => new SMembersCommand(args, this.opts).exec(this.client), "smembers");
  /**
   * @see https://redis.io/commands/smove
   */
  smove = /* @__PURE__ */ __name((source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client), "smove");
  /**
   * @see https://redis.io/commands/spop
   */
  spop = /* @__PURE__ */ __name((...args) => new SPopCommand(args, this.opts).exec(this.client), "spop");
  /**
   * @see https://redis.io/commands/srandmember
   */
  srandmember = /* @__PURE__ */ __name((...args) => new SRandMemberCommand(args, this.opts).exec(this.client), "srandmember");
  /**
   * @see https://redis.io/commands/srem
   */
  srem = /* @__PURE__ */ __name((key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client), "srem");
  /**
   * @see https://redis.io/commands/sscan
   */
  sscan = /* @__PURE__ */ __name((...args) => new SScanCommand(args, this.opts).exec(this.client), "sscan");
  /**
   * @see https://redis.io/commands/strlen
   */
  strlen = /* @__PURE__ */ __name((...args) => new StrLenCommand(args, this.opts).exec(this.client), "strlen");
  /**
   * @see https://redis.io/commands/subscribe
   */
  subscribe = /* @__PURE__ */ __name((channels) => {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    return new Subscriber(this.client, channelArray, false, this.opts);
  }, "subscribe");
  /**
   * @see https://redis.io/commands/sunion
   */
  sunion = /* @__PURE__ */ __name((...args) => new SUnionCommand(args, this.opts).exec(this.client), "sunion");
  /**
   * @see https://redis.io/commands/sunionstore
   */
  sunionstore = /* @__PURE__ */ __name((...args) => new SUnionStoreCommand(args, this.opts).exec(this.client), "sunionstore");
  /**
   * @see https://redis.io/commands/time
   */
  time = /* @__PURE__ */ __name(() => new TimeCommand().exec(this.client), "time");
  /**
   * @see https://redis.io/commands/touch
   */
  touch = /* @__PURE__ */ __name((...args) => new TouchCommand(args, this.opts).exec(this.client), "touch");
  /**
   * @see https://redis.io/commands/ttl
   */
  ttl = /* @__PURE__ */ __name((...args) => new TtlCommand(args, this.opts).exec(this.client), "ttl");
  /**
   * @see https://redis.io/commands/type
   */
  type = /* @__PURE__ */ __name((...args) => new TypeCommand(args, this.opts).exec(this.client), "type");
  /**
   * @see https://redis.io/commands/unlink
   */
  unlink = /* @__PURE__ */ __name((...args) => new UnlinkCommand(args, this.opts).exec(this.client), "unlink");
  /**
   * @see https://redis.io/commands/xadd
   */
  xadd = /* @__PURE__ */ __name((...args) => new XAddCommand(args, this.opts).exec(this.client), "xadd");
  /**
   * @see https://redis.io/commands/xack
   */
  xack = /* @__PURE__ */ __name((...args) => new XAckCommand(args, this.opts).exec(this.client), "xack");
  /**
   * @see https://redis.io/commands/xackdel
   */
  xackdel = /* @__PURE__ */ __name((...args) => new XAckDelCommand(args, this.opts).exec(this.client), "xackdel");
  /**
   * @see https://redis.io/commands/xdel
   */
  xdel = /* @__PURE__ */ __name((...args) => new XDelCommand(args, this.opts).exec(this.client), "xdel");
  /**
   * @see https://redis.io/commands/xdelex
   */
  xdelex = /* @__PURE__ */ __name((...args) => new XDelExCommand(args, this.opts).exec(this.client), "xdelex");
  /**
   * @see https://redis.io/commands/xgroup
   */
  xgroup = /* @__PURE__ */ __name((...args) => new XGroupCommand(args, this.opts).exec(this.client), "xgroup");
  /**
   * @see https://redis.io/commands/xread
   */
  xread = /* @__PURE__ */ __name((...args) => new XReadCommand(args, this.opts).exec(this.client), "xread");
  /**
   * @see https://redis.io/commands/xreadgroup
   */
  xreadgroup = /* @__PURE__ */ __name((...args) => new XReadGroupCommand(args, this.opts).exec(this.client), "xreadgroup");
  /**
   * @see https://redis.io/commands/xinfo
   */
  xinfo = /* @__PURE__ */ __name((...args) => new XInfoCommand(args, this.opts).exec(this.client), "xinfo");
  /**
   * @see https://redis.io/commands/xlen
   */
  xlen = /* @__PURE__ */ __name((...args) => new XLenCommand(args, this.opts).exec(this.client), "xlen");
  /**
   * @see https://redis.io/commands/xpending
   */
  xpending = /* @__PURE__ */ __name((...args) => new XPendingCommand(args, this.opts).exec(this.client), "xpending");
  /**
   * @see https://redis.io/commands/xclaim
   */
  xclaim = /* @__PURE__ */ __name((...args) => new XClaimCommand(args, this.opts).exec(this.client), "xclaim");
  /**
   * @see https://redis.io/commands/xautoclaim
   */
  xautoclaim = /* @__PURE__ */ __name((...args) => new XAutoClaim(args, this.opts).exec(this.client), "xautoclaim");
  /**
   * @see https://redis.io/commands/xtrim
   */
  xtrim = /* @__PURE__ */ __name((...args) => new XTrimCommand(args, this.opts).exec(this.client), "xtrim");
  /**
   * @see https://redis.io/commands/xrange
   */
  xrange = /* @__PURE__ */ __name((...args) => new XRangeCommand(args, this.opts).exec(this.client), "xrange");
  /**
   * @see https://redis.io/commands/xrevrange
   */
  xrevrange = /* @__PURE__ */ __name((...args) => new XRevRangeCommand(args, this.opts).exec(this.client), "xrevrange");
  /**
   * @see https://redis.io/commands/zadd
   */
  zadd = /* @__PURE__ */ __name((...args) => {
    if ("score" in args[1]) {
      return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
        this.client
      );
    }
    return new ZAddCommand(
      [args[0], args[1], ...args.slice(2)],
      this.opts
    ).exec(this.client);
  }, "zadd");
  /**
   * @see https://redis.io/commands/zcard
   */
  zcard = /* @__PURE__ */ __name((...args) => new ZCardCommand(args, this.opts).exec(this.client), "zcard");
  /**
   * @see https://redis.io/commands/zcount
   */
  zcount = /* @__PURE__ */ __name((...args) => new ZCountCommand(args, this.opts).exec(this.client), "zcount");
  /**
   * @see https://redis.io/commands/zdiffstore
   */
  zdiffstore = /* @__PURE__ */ __name((...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client), "zdiffstore");
  /**
   * @see https://redis.io/commands/zincrby
   */
  zincrby = /* @__PURE__ */ __name((key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client), "zincrby");
  /**
   * @see https://redis.io/commands/zinterstore
   */
  zinterstore = /* @__PURE__ */ __name((...args) => new ZInterStoreCommand(args, this.opts).exec(this.client), "zinterstore");
  /**
   * @see https://redis.io/commands/zlexcount
   */
  zlexcount = /* @__PURE__ */ __name((...args) => new ZLexCountCommand(args, this.opts).exec(this.client), "zlexcount");
  /**
   * @see https://redis.io/commands/zmscore
   */
  zmscore = /* @__PURE__ */ __name((...args) => new ZMScoreCommand(args, this.opts).exec(this.client), "zmscore");
  /**
   * @see https://redis.io/commands/zpopmax
   */
  zpopmax = /* @__PURE__ */ __name((...args) => new ZPopMaxCommand(args, this.opts).exec(this.client), "zpopmax");
  /**
   * @see https://redis.io/commands/zpopmin
   */
  zpopmin = /* @__PURE__ */ __name((...args) => new ZPopMinCommand(args, this.opts).exec(this.client), "zpopmin");
  /**
   * @see https://redis.io/commands/zrange
   */
  zrange = /* @__PURE__ */ __name((...args) => new ZRangeCommand(args, this.opts).exec(this.client), "zrange");
  /**
   * @see https://redis.io/commands/zrank
   */
  zrank = /* @__PURE__ */ __name((key, member) => new ZRankCommand([key, member], this.opts).exec(this.client), "zrank");
  /**
   * @see https://redis.io/commands/zrem
   */
  zrem = /* @__PURE__ */ __name((key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client), "zrem");
  /**
   * @see https://redis.io/commands/zremrangebylex
   */
  zremrangebylex = /* @__PURE__ */ __name((...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client), "zremrangebylex");
  /**
   * @see https://redis.io/commands/zremrangebyrank
   */
  zremrangebyrank = /* @__PURE__ */ __name((...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client), "zremrangebyrank");
  /**
   * @see https://redis.io/commands/zremrangebyscore
   */
  zremrangebyscore = /* @__PURE__ */ __name((...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client), "zremrangebyscore");
  /**
   * @see https://redis.io/commands/zrevrank
   */
  zrevrank = /* @__PURE__ */ __name((key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client), "zrevrank");
  /**
   * @see https://redis.io/commands/zscan
   */
  zscan = /* @__PURE__ */ __name((...args) => new ZScanCommand(args, this.opts).exec(this.client), "zscan");
  /**
   * @see https://redis.io/commands/zscore
   */
  zscore = /* @__PURE__ */ __name((key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client), "zscore");
  /**
   * @see https://redis.io/commands/zunion
   */
  zunion = /* @__PURE__ */ __name((...args) => new ZUnionCommand(args, this.opts).exec(this.client), "zunion");
  /**
   * @see https://redis.io/commands/zunionstore
   */
  zunionstore = /* @__PURE__ */ __name((...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client), "zunionstore");
};
var VERSION2 = "v1.30.2";
var BUILD = /* @__PURE__ */ Symbol("build");
var TextFieldBuilder = class _TextFieldBuilder {
  static {
    __name(this, "_TextFieldBuilder");
  }
  _noTokenize;
  _noStem;
  _from;
  constructor(noTokenize = { noTokenize: false }, noStem = { noStem: false }, from = { from: null }) {
    this._noTokenize = noTokenize;
    this._noStem = noStem;
    this._from = from;
  }
  noTokenize() {
    return new _TextFieldBuilder({ noTokenize: true }, this._noStem, this._from);
  }
  noStem() {
    return new _TextFieldBuilder(this._noTokenize, { noStem: true }, this._from);
  }
  from(field) {
    return new _TextFieldBuilder(this._noTokenize, this._noStem, { from: field });
  }
  [BUILD]() {
    return {
      type: "TEXT",
      ...this._noTokenize.noTokenize ? { noTokenize: true } : {},
      ...this._noStem.noStem ? { noStem: true } : {},
      ...this._from.from ? { from: this._from.from } : {}
    };
  }
};
var NumericFieldBuilder = class _NumericFieldBuilder {
  static {
    __name(this, "_NumericFieldBuilder");
  }
  type;
  _from;
  constructor(type, from = { from: null }) {
    this.type = type;
    this._from = from;
  }
  from(field) {
    return new _NumericFieldBuilder(this.type, { from: field });
  }
  [BUILD]() {
    return this._from.from ? {
      type: this.type,
      fast: true,
      from: this._from.from
    } : {
      type: this.type,
      fast: true
    };
  }
};
var BoolFieldBuilder = class _BoolFieldBuilder {
  static {
    __name(this, "_BoolFieldBuilder");
  }
  _fast;
  _from;
  constructor(fast = { fast: false }, from = { from: null }) {
    this._fast = fast;
    this._from = from;
  }
  fast() {
    return new _BoolFieldBuilder({ fast: true }, this._from);
  }
  from(field) {
    return new _BoolFieldBuilder(this._fast, { from: field });
  }
  [BUILD]() {
    const hasFast = this._fast.fast;
    const hasFrom = Boolean(this._from.from);
    if (hasFast && hasFrom) {
      return {
        type: "BOOL",
        fast: true,
        from: this._from.from
      };
    }
    if (hasFast) {
      return {
        type: "BOOL",
        fast: true
      };
    }
    if (hasFrom) {
      return {
        type: "BOOL",
        from: this._from.from
      };
    }
    return { type: "BOOL" };
  }
};
var DateFieldBuilder = class _DateFieldBuilder {
  static {
    __name(this, "_DateFieldBuilder");
  }
  _fast;
  _from;
  constructor(fast = { fast: false }, from = { from: null }) {
    this._fast = fast;
    this._from = from;
  }
  fast() {
    return new _DateFieldBuilder({ fast: true }, this._from);
  }
  from(field) {
    return new _DateFieldBuilder(this._fast, { from: field });
  }
  [BUILD]() {
    const hasFast = this._fast.fast;
    const hasFrom = Boolean(this._from.from);
    if (hasFast && hasFrom) {
      return {
        type: "DATE",
        fast: true,
        from: this._from.from
      };
    }
    if (hasFast) {
      return {
        type: "DATE",
        fast: true
      };
    }
    if (hasFrom) {
      return {
        type: "DATE",
        from: this._from.from
      };
    }
    return { type: "DATE" };
  }
};
var KeywordFieldBuilder = class {
  static {
    __name(this, "KeywordFieldBuilder");
  }
  [BUILD]() {
    return { type: "KEYWORD" };
  }
};
var FacetFieldBuilder = class {
  static {
    __name(this, "FacetFieldBuilder");
  }
  [BUILD]() {
    return { type: "FACET" };
  }
};
if (typeof atob === "undefined") {
  global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
}
var Redis2 = class _Redis extends Redis {
  static {
    __name(this, "_Redis");
  }
  /**
   * Create a new redis client by providing a custom `Requester` implementation
   *
   * @example
   * ```ts
   *
   * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
   *
   *  const requester: Requester = {
   *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
   *      // ...
   *    }
   *  }
   *
   * const redis = new Redis(requester)
   * ```
   */
  constructor(configOrRequester) {
    if ("request" in configOrRequester) {
      super(configOrRequester);
      return;
    }
    if (!configOrRequester.url) {
      console.warn(
        `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
      );
    } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
      console.warn(
        "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
      );
    }
    if (!configOrRequester.token) {
      console.warn(
        `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
      );
    } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
      console.warn(
        "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
      );
    }
    const client = new HttpClient({
      baseUrl: configOrRequester.url,
      retry: configOrRequester.retry,
      headers: { authorization: `Bearer ${configOrRequester.token}` },
      agent: configOrRequester.agent,
      responseEncoding: configOrRequester.responseEncoding,
      cache: configOrRequester.cache ?? "no-store",
      signal: configOrRequester.signal,
      keepAlive: configOrRequester.keepAlive,
      readYourWrites: configOrRequester.readYourWrites
    });
    const safeEnv = typeof process === "object" && process && typeof process.env === "object" && process.env ? process.env : {};
    super(client, {
      automaticDeserialization: configOrRequester.automaticDeserialization,
      enableTelemetry: configOrRequester.enableTelemetry ?? !safeEnv.UPSTASH_DISABLE_TELEMETRY,
      latencyLogging: configOrRequester.latencyLogging,
      enableAutoPipelining: configOrRequester.enableAutoPipelining
    });
    const nodeVersion = typeof process === "object" && process ? process.version : void 0;
    this.addTelemetry({
      runtime: (
        // @ts-expect-error to silence compiler
        typeof EdgeRuntime === "string" ? "edge-light" : nodeVersion ? `node@${nodeVersion}` : "unknown"
      ),
      platform: safeEnv.UPSTASH_CONSOLE ? "console" : safeEnv.VERCEL ? "vercel" : safeEnv.AWS_REGION ? "aws" : "unknown",
      sdk: `@upstash/redis@${VERSION2}`
    });
    if (this.enableAutoPipelining) {
      return this.autoPipeline();
    }
  }
  /**
   * Create a new Upstash Redis instance from environment variables.
   *
   * Use this to automatically load connection secrets from your environment
   * variables. For instance when using the Vercel integration.
   *
   * This tries to load connection details from your environment using `process.env`:
   * - URL: `UPSTASH_REDIS_REST_URL` or fallback to `KV_REST_API_URL`
   * - Token: `UPSTASH_REDIS_REST_TOKEN` or fallback to `KV_REST_API_TOKEN`
   *
   * The fallback variables provide compatibility with Vercel KV and other platforms
   * that may use different naming conventions.
   */
  static fromEnv(config) {
    if (typeof process !== "object" || !process || typeof process.env !== "object" || !process.env) {
      throw new TypeError(
        '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
      );
    }
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    if (!url) {
      console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
    }
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!token) {
      console.warn(
        "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
      );
    }
    return new _Redis({ ...config, url, token });
  }
};
var redis = env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN ? new Redis2({ url: env.UPSTASH_REDIS_URL, token: env.UPSTASH_REDIS_TOKEN }) : void 0;
async function once(key, ttlSec) {
  if (!redis) return true;
  const r = await redis.set(key, "1", { nx: true, ex: ttlSec });
  return r === "OK";
}
__name(once, "once");
var store = /* @__PURE__ */ new Map();
async function setCache(key, value, ttlMs) {
  if (redis) {
    await redis.set(key, JSON.stringify(value), { ex: Math.ceil(ttlMs / 1e3) });
    return;
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
__name(setCache, "setCache");
async function getCache(key) {
  if (redis) {
    const v2 = await redis.get(key);
    return v2 ? JSON.parse(v2) : void 0;
  }
  const e = store.get(key);
  if (!e) return void 0;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return void 0;
  }
  return e.value;
}
__name(getCache, "getCache");
var BASE = "https://v3.football.api-sports.io";
var CHELSEA_TEAM_ID = 49;
async function af(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" }
  });
  if (!res.ok) {
    return { response: [], errors: [`http_${res.status}`] };
  }
  return await res.json();
}
__name(af, "af");
async function getChelseaFixtures(opts) {
  const params = new URLSearchParams();
  params.set("team", String(CHELSEA_TEAM_ID));
  if (opts.next) params.set("next", String(opts.next));
  if (opts.last) params.set("last", String(opts.last));
  if (opts.season) params.set("season", String(opts.season));
  const path = `/fixtures?${params.toString()}`;
  const key = `fixtures:chelsea:${params.toString()}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const json6 = await af(path);
  const fixtures = (json6.response || []).map((r) => {
    const home = r?.teams?.home?.name || "Home";
    const away = r?.teams?.away?.name || "Away";
    const isChelseaHome = r?.teams?.home?.id === CHELSEA_TEAM_ID;
    return {
      id: r?.fixture?.id,
      date: r?.fixture?.date,
      competition: r?.league?.name || "",
      venue: r?.fixture?.venue?.name || "",
      home,
      away,
      isChelseaHome,
      opponent: isChelseaHome ? away : home,
      status: r?.fixture?.status?.short || "NS"
    };
  });
  const data = { fixtures, citation: `${BASE}${path}` };
  await setCache(key, data, 15 * 60 * 1e3);
  return data;
}
__name(getChelseaFixtures, "getChelseaFixtures");
function pickStat(stats, type) {
  if (!Array.isArray(stats)) return null;
  const row = stats.find(
    (s) => (s?.type || "").toLowerCase() === type.toLowerCase()
  );
  return row ? row.value : null;
}
__name(pickStat, "pickStat");
function toNumber(v2) {
  if (v2 === null || v2 === void 0) return null;
  if (typeof v2 === "number") return isFinite(v2) ? v2 : null;
  const s = String(v2).replace("%", "").trim();
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}
__name(toNumber, "toNumber");
async function getMatchStats(fixtureId) {
  const key = `matchstats:${fixtureId}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const path = `/fixtures/statistics?fixture=${fixtureId}`;
  const json6 = await af(path);
  const chelseaEntry = (json6.response || []).find(
    (e) => e?.team?.id === CHELSEA_TEAM_ID
  );
  const stats = chelseaEntry?.statistics || [];
  const team = chelseaEntry ? "home" : "unknown";
  const data = {
    fixtureId,
    team,
    possession: toNumber(pickStat(stats, "Ball Possession")),
    shotsTotal: toNumber(pickStat(stats, "Total Shots")),
    shotsOnTarget: toNumber(pickStat(stats, "Shots on Goal")),
    corners: toNumber(pickStat(stats, "Corner Kicks")),
    fouls: toNumber(pickStat(stats, "Fouls")),
    xg: toNumber(pickStat(stats, "expected_goals")),
    passAccuracy: toNumber(pickStat(stats, "Passes %")),
    citation: `${BASE}${path}`
  };
  await setCache(key, data, 10 * 60 * 1e3);
  return data;
}
__name(getMatchStats, "getMatchStats");
var to = Object.create;
var Ce = Object.defineProperty;
var ro = Object.getOwnPropertyDescriptor;
var no = Object.getOwnPropertyNames;
var io = Object.getPrototypeOf;
var so = Object.prototype.hasOwnProperty;
var oo = /* @__PURE__ */ __name((r, e, t) => e in r ? Ce(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t, "oo");
var a = /* @__PURE__ */ __name((r, e) => Ce(r, "name", { value: e, configurable: true }), "a");
var z = /* @__PURE__ */ __name((r, e) => () => (r && (e = r(r = 0)), e), "z");
var I = /* @__PURE__ */ __name((r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports), "I");
var ie = /* @__PURE__ */ __name((r, e) => {
  for (var t in e)
    Ce(r, t, { get: e[t], enumerable: true });
}, "ie");
var An = /* @__PURE__ */ __name((r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i of no(e)) !so.call(r, i) && i !== t && Ce(r, i, { get: /* @__PURE__ */ __name(() => e[i], "get"), enumerable: !(n = ro(e, i)) || n.enumerable });
  return r;
}, "An");
var Te = /* @__PURE__ */ __name((r, e, t) => (t = r != null ? to(io(r)) : {}, An(e || !r || !r.__esModule ? Ce(t, "default", {
  value: r,
  enumerable: true
}) : t, r)), "Te");
var N = /* @__PURE__ */ __name((r) => An(Ce({}, "__esModule", { value: true }), r), "N");
var _ = /* @__PURE__ */ __name((r, e, t) => oo(r, typeof e != "symbol" ? e + "" : e, t), "_");
var In = I((nt) => {
  "use strict";
  p();
  nt.byteLength = uo;
  nt.toByteArray = ho;
  nt.fromByteArray = po;
  var ae = [], te = [], ao = typeof Uint8Array < "u" ? Uint8Array : Array, Pt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (ve = 0, Cn = Pt.length; ve < Cn; ++ve)
    ae[ve] = Pt[ve], te[Pt.charCodeAt(ve)] = ve;
  var ve, Cn;
  te[45] = 62;
  te[95] = 63;
  function Tn(r) {
    var e = r.length;
    if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  __name(Tn, "Tn");
  a(
    Tn,
    "getLens"
  );
  function uo(r) {
    var e = Tn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  __name(uo, "uo");
  a(uo, "byteLength");
  function co(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  __name(co, "co");
  a(co, "_byteLength");
  function ho(r) {
    var e, t = Tn(r), n = t[0], i = t[1], s = new ao(co(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
    for (c = 0; c < u; c += 4) e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i === 2 && (e = te[r.charCodeAt(c)] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = te[r.charCodeAt(
      c
    )] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  __name(ho, "ho");
  a(ho, "toByteArray");
  function lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  __name(lo, "lo");
  a(lo, "tripletToBase64");
  function fo(r, e, t) {
    for (var n, i = [], s = e; s < t; s += 3) n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(lo(n));
    return i.join(
      ""
    );
  }
  __name(fo, "fo");
  a(fo, "encodeChunk");
  function po(r) {
    for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s) i.push(fo(r, o, o + s > u ? u : o + s));
    return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
  }
  __name(po, "po");
  a(po, "fromByteArray");
});
var Pn = I((Bt) => {
  p();
  Bt.read = function(r, e, t, n, i) {
    var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, h = c >> 1, l = -7, d = t ? i - 1 : 0, b = t ? -1 : 1, C = r[e + d];
    for (d += b, s = C & (1 << -l) - 1, C >>= -l, l += u; l > 0; s = s * 256 + r[e + d], d += b, l -= 8) ;
    for (o = s & (1 << -l) - 1, s >>= -l, l += n; l > 0; o = o * 256 + r[e + d], d += b, l -= 8) ;
    if (s === 0) s = 1 - h;
    else {
      if (s === c) return o ? NaN : (C ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - h;
    }
    return (C ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Bt.write = function(r, e, t, n, i, s) {
    var o, u, c, h = s * 8 - i - 1, l = (1 << h) - 1, d = l >> 1, b = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, C = n ? 0 : s - 1, B = n ? 1 : -1, W = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = l) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + d >= 1 ? e += b / c : e += b * Math.pow(2, 1 - d), e * c >= 2 && (o++, c /= 2), o + d >= l ? (u = 0, o = l) : o + d >= 1 ? (u = (e * c - 1) * Math.pow(
      2,
      i
    ), o = o + d) : (u = e * Math.pow(2, d - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + C] = u & 255, C += B, u /= 256, i -= 8) ;
    for (o = o << i | u, h += i; h > 0; r[t + C] = o & 255, C += B, o /= 256, h -= 8) ;
    r[t + C - B] |= W * 128;
  };
});
var $n = I((Le) => {
  "use strict";
  p();
  var Lt = In(), Pe = Pn(), Bn = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
  Le.Buffer = f;
  Le.SlowBuffer = So;
  Le.INSPECT_MAX_BYTES = 50;
  var it = 2147483647;
  Le.kMaxLength = it;
  f.TYPED_ARRAY_SUPPORT = yo();
  !f.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function yo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(
        r,
        e
      ), r.foo() === 42;
    } catch {
      return false;
    }
  }
  __name(yo, "yo");
  a(yo, "typedArraySupport");
  Object.defineProperty(
    f.prototype,
    "parent",
    { enumerable: true, get: a(function() {
      if (f.isBuffer(this)) return this.buffer;
    }, "get") }
  );
  Object.defineProperty(f.prototype, "offset", { enumerable: true, get: a(
    function() {
      if (f.isBuffer(this)) return this.byteOffset;
    },
    "get"
  ) });
  function fe(r) {
    if (r > it) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(
      r
    );
    return Object.setPrototypeOf(e, f.prototype), e;
  }
  __name(fe, "fe");
  a(fe, "createBuffer");
  function f(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string") throw new TypeError('The "string" argument must be of type string. Received type number');
      return Dt(r);
    }
    return Mn(
      r,
      e,
      t
    );
  }
  __name(f, "f");
  a(f, "Buffer");
  f.poolSize = 8192;
  function Mn(r, e, t) {
    if (typeof r == "string") return go(
      r,
      e
    );
    if (ArrayBuffer.isView(r)) return wo(r);
    if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(r.buffer, SharedArrayBuffer)))
      return Ft(r, e, t);
    if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return f.from(n, e, t);
    let i = bo(r);
    if (i) return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return f.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  __name(Mn, "Mn");
  a(Mn, "from");
  f.from = function(r, e, t) {
    return Mn(r, e, t);
  };
  Object.setPrototypeOf(f.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(
    f,
    Uint8Array
  );
  function Dn(r) {
    if (typeof r != "number") throw new TypeError('"size" argument must be of type number');
    if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  __name(Dn, "Dn");
  a(Dn, "assertSize");
  function mo(r, e, t) {
    return Dn(r), r <= 0 ? fe(r) : e !== void 0 ? typeof t == "string" ? fe(r).fill(e, t) : fe(r).fill(e) : fe(r);
  }
  __name(mo, "mo");
  a(
    mo,
    "alloc"
  );
  f.alloc = function(r, e, t) {
    return mo(r, e, t);
  };
  function Dt(r) {
    return Dn(r), fe(
      r < 0 ? 0 : kt(r) | 0
    );
  }
  __name(Dt, "Dt");
  a(Dt, "allocUnsafe");
  f.allocUnsafe = function(r) {
    return Dt(r);
  };
  f.allocUnsafeSlow = function(r) {
    return Dt(r);
  };
  function go(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !f.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
    let t = kn(r, e) | 0, n = fe(t), i = n.write(r, e);
    return i !== t && (n = n.slice(0, i)), n;
  }
  __name(go, "go");
  a(go, "fromString");
  function Rt(r) {
    let e = r.length < 0 ? 0 : kt(r.length) | 0, t = fe(e);
    for (let n = 0; n < e; n += 1) t[n] = r[n] & 255;
    return t;
  }
  __name(Rt, "Rt");
  a(Rt, "fromArrayLike");
  function wo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return Ft(e.buffer, e.byteOffset, e.byteLength);
    }
    return Rt(r);
  }
  __name(wo, "wo");
  a(wo, "fromArrayView");
  function Ft(r, e, t) {
    if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === void 0 && t === void 0 ? n = new Uint8Array(
      r
    ) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(r, e, t), Object.setPrototypeOf(
      n,
      f.prototype
    ), n;
  }
  __name(Ft, "Ft");
  a(Ft, "fromArrayBuffer");
  function bo(r) {
    if (f.isBuffer(r)) {
      let e = kt(
        r.length
      ) | 0, t = fe(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0)
      return typeof r.length != "number" || Ot(r.length) ? fe(0) : Rt(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return Rt(r.data);
  }
  __name(bo, "bo");
  a(bo, "fromObject");
  function kt(r) {
    if (r >= it) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + it.toString(16) + " bytes");
    return r | 0;
  }
  __name(kt, "kt");
  a(kt, "checked");
  function So(r) {
    return +r != r && (r = 0), f.alloc(+r);
  }
  __name(So, "So");
  a(So, "SlowBuffer");
  f.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== f.prototype;
  }, "isBuffer");
  f.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = f.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = f.from(t, t.offset, t.byteLength)), !f.isBuffer(e) || !f.isBuffer(t)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (e === t) return 0;
    let n = e.length, i = t.length;
    for (let s = 0, o = Math.min(n, i); s < o; ++s) if (e[s] !== t[s]) {
      n = e[s], i = t[s];
      break;
    }
    return n < i ? -1 : i < n ? 1 : 0;
  }, "compare");
  f.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  f.concat = a(function(e, t) {
    if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (e.length === 0) return f.alloc(0);
    let n;
    if (t === void 0) for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
    let i = f.allocUnsafe(t), s = 0;
    for (n = 0; n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array)) s + o.length > i.length ? (f.isBuffer(
        o
      ) || (o = f.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
      else if (f.isBuffer(
        o
      )) o.copy(i, s);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i;
  }, "concat");
  function kn(r, e) {
    if (f.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r);
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0) return 0;
    let i = false;
    for (; ; ) switch (e) {
      case "ascii":
      case "latin1":
      case "binary":
        return t;
      case "utf8":
      case "utf-8":
        return Mt(r).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t * 2;
      case "hex":
        return t >>> 1;
      case "base64":
        return Gn(r).length;
      default:
        if (i) return n ? -1 : Mt(r).length;
        e = ("" + e).toLowerCase(), i = true;
    }
  }
  __name(kn, "kn");
  a(kn, "byteLength");
  f.byteLength = kn;
  function xo(r, e, t) {
    let n = false;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
    for (r || (r = "utf8"); ; ) switch (r) {
      case "hex":
        return Lo(
          this,
          e,
          t
        );
      case "utf8":
      case "utf-8":
        return On(this, e, t);
      case "ascii":
        return Po(
          this,
          e,
          t
        );
      case "latin1":
      case "binary":
        return Bo(this, e, t);
      case "base64":
        return To(
          this,
          e,
          t
        );
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Ro(this, e, t);
      default:
        if (n) throw new TypeError("Unknown encoding: " + r);
        r = (r + "").toLowerCase(), n = true;
    }
  }
  __name(xo, "xo");
  a(
    xo,
    "slowToString"
  );
  f.prototype._isBuffer = true;
  function Ee(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  __name(Ee, "Ee");
  a(Ee, "swap");
  f.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2) Ee(this, t, t + 1);
    return this;
  }, "swap16");
  f.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4) Ee(this, t, t + 3), Ee(this, t + 1, t + 2);
    return this;
  }, "swap32");
  f.prototype.swap64 = a(function() {
    let e = this.length;
    if (e % 8 !== 0) throw new RangeError(
      "Buffer size must be a multiple of 64-bits"
    );
    for (let t = 0; t < e; t += 8) Ee(this, t, t + 7), Ee(this, t + 1, t + 6), Ee(this, t + 2, t + 5), Ee(this, t + 3, t + 4);
    return this;
  }, "swap64");
  f.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? On(
      this,
      0,
      e
    ) : xo.apply(this, arguments);
  }, "toString");
  f.prototype.toLocaleString = f.prototype.toString;
  f.prototype.equals = a(function(e) {
    if (!f.isBuffer(e)) throw new TypeError(
      "Argument must be a Buffer"
    );
    return this === e ? true : f.compare(this, e) === 0;
  }, "equals");
  f.prototype.inspect = a(function() {
    let e = "", t = Le.INSPECT_MAX_BYTES;
    return e = this.toString(
      "hex",
      0,
      t
    ).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Bn && (f.prototype[Bn] = f.prototype.inspect);
  f.prototype.compare = a(function(e, t, n, i, s) {
    if (ue(e, Uint8Array) && (e = f.from(e, e.offset, e.byteLength)), !f.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length) throw new RangeError("out of range index");
    if (i >= s && t >= n) return 0;
    if (i >= s) return -1;
    if (t >= n) return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e) return 0;
    let o = s - i, u = n - t, c = Math.min(o, u), h = this.slice(i, s), l = e.slice(t, n);
    for (let d = 0; d < c; ++d)
      if (h[d] !== l[d]) {
        o = h[d], u = l[d];
        break;
      }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Un(r, e, t, n, i) {
    if (r.length === 0) return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, Ot(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i) return -1;
      t = r.length - 1;
    } else if (t < 0) if (i) t = 0;
    else return -1;
    if (typeof e == "string" && (e = f.from(e, n)), f.isBuffer(e)) return e.length === 0 ? -1 : Ln(r, e, t, n, i);
    if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : Ln(
      r,
      [e],
      t,
      n,
      i
    );
    throw new TypeError("val must be string, number or Buffer");
  }
  __name(Un, "Un");
  a(Un, "bidirectionalIndexOf");
  function Ln(r, e, t, n, i) {
    let s = 1, o = r.length, u = e.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2) return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(l, d) {
      return s === 1 ? l[d] : l.readUInt16BE(d * s);
    }
    __name(c, "c");
    a(c, "read");
    let h;
    if (i) {
      let l = -1;
      for (h = t; h < o; h++) if (c(r, h) === c(e, l === -1 ? 0 : h - l)) {
        if (l === -1 && (l = h), h - l + 1 === u) return l * s;
      } else l !== -1 && (h -= h - l), l = -1;
    } else for (t + u > o && (t = o - u), h = t; h >= 0; h--) {
      let l = true;
      for (let d = 0; d < u; d++)
        if (c(r, h + d) !== c(e, d)) {
          l = false;
          break;
        }
      if (l) return h;
    }
    return -1;
  }
  __name(Ln, "Ln");
  a(Ln, "arrayIndexOf");
  f.prototype.includes = a(function(e, t, n) {
    return this.indexOf(e, t, n) !== -1;
  }, "includes");
  f.prototype.indexOf = a(function(e, t, n) {
    return Un(this, e, t, n, true);
  }, "indexOf");
  f.prototype.lastIndexOf = a(function(e, t, n) {
    return Un(this, e, t, n, false);
  }, "lastIndexOf");
  function vo(r, e, t, n) {
    t = Number(t) || 0;
    let i = r.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0; o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (Ot(u))
        return o;
      r[t + o] = u;
    }
    return o;
  }
  __name(vo, "vo");
  a(vo, "hexWrite");
  function Eo(r, e, t, n) {
    return st(Mt(
      e,
      r.length - t
    ), r, t, n);
  }
  __name(Eo, "Eo");
  a(Eo, "utf8Write");
  function _o(r, e, t, n) {
    return st(ko(e), r, t, n);
  }
  __name(_o, "_o");
  a(_o, "asciiWrite");
  function Ao(r, e, t, n) {
    return st(Gn(e), r, t, n);
  }
  __name(Ao, "Ao");
  a(Ao, "base64Write");
  function Co(r, e, t, n) {
    return st(Uo(e, r.length - t), r, t, n);
  }
  __name(Co, "Co");
  a(Co, "ucs2Write");
  f.prototype.write = a(function(e, t, n, i) {
    if (t === void 0) i = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string") i = t, n = this.length, t = 0;
    else if (isFinite(t)) t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError(
      "Attempt to write outside buffer bounds"
    );
    i || (i = "utf8");
    let o = false;
    for (; ; ) switch (i) {
      case "hex":
        return vo(this, e, t, n);
      case "utf8":
      case "utf-8":
        return Eo(this, e, t, n);
      case "ascii":
      case "latin1":
      case "binary":
        return _o(this, e, t, n);
      case "base64":
        return Ao(
          this,
          e,
          t,
          n
        );
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Co(this, e, t, n);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i);
        i = ("" + i).toLowerCase(), o = true;
    }
  }, "write");
  f.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function To(r, e, t) {
    return e === 0 && t === r.length ? Lt.fromByteArray(r) : Lt.fromByteArray(r.slice(e, t));
  }
  __name(To, "To");
  a(To, "base64Slice");
  function On(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i = e;
    for (; i < t; ) {
      let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i + u <= t) {
        let c, h, l, d;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i + 1], (c & 192) === 128 && (d = (s & 31) << 6 | c & 63, d > 127 && (o = d));
            break;
          case 3:
            c = r[i + 1], h = r[i + 2], (c & 192) === 128 && (h & 192) === 128 && (d = (s & 15) << 12 | (c & 63) << 6 | h & 63, d > 2047 && (d < 55296 || d > 57343) && (o = d));
            break;
          case 4:
            c = r[i + 1], h = r[i + 2], l = r[i + 3], (c & 192) === 128 && (h & 192) === 128 && (l & 192) === 128 && (d = (s & 15) << 18 | (c & 63) << 12 | (h & 63) << 6 | l & 63, d > 65535 && d < 1114112 && (o = d));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
    }
    return Io(n);
  }
  __name(On, "On");
  a(On, "utf8Slice");
  var Rn = 4096;
  function Io(r) {
    let e = r.length;
    if (e <= Rn) return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (; n < e; ) t += String.fromCharCode.apply(String, r.slice(n, n += Rn));
    return t;
  }
  __name(Io, "Io");
  a(Io, "decodeCodePointsArray");
  function Po(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i] & 127);
    return n;
  }
  __name(Po, "Po");
  a(Po, "asciiSlice");
  function Bo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i]);
    return n;
  }
  __name(Bo, "Bo");
  a(Bo, "latin1Slice");
  function Lo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let s = e; s < t; ++s) i += Oo[r[s]];
    return i;
  }
  __name(Lo, "Lo");
  a(Lo, "hexSlice");
  function Ro(r, e, t) {
    let n = r.slice(e, t), i = "";
    for (let s = 0; s < n.length - 1; s += 2) i += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i;
  }
  __name(Ro, "Ro");
  a(Ro, "utf16leSlice");
  f.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i = this.subarray(
      e,
      t
    );
    return Object.setPrototypeOf(i, f.prototype), i;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + e > t) throw new RangeError(
      "Trying to access beyond buffer length"
    );
  }
  __name(q, "q");
  a(q, "checkOffset");
  f.prototype.readUintLE = f.prototype.readUIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
    return i;
  }, "readUIntLE");
  f.prototype.readUintBE = f.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e + --t], s = 1;
    for (; t > 0 && (s *= 256); ) i += this[e + --t] * s;
    return i;
  }, "readUIntBE");
  f.prototype.readUint8 = f.prototype.readUInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e];
  }, "readUInt8");
  f.prototype.readUint16LE = f.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  f.prototype.readUint16BE = f.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  f.prototype.readUint32LE = f.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  f.prototype.readUint32BE = f.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  f.prototype.readBigUInt64LE = ge(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && We(e, this.length - 8);
    let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  f.prototype.readBigUInt64BE = ge(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && We(e, this.length - 8);
    let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(
      i
    ) << BigInt(32)) + BigInt(s);
  }, "readBigUInt64BE"));
  f.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); )
      i += this[e + o] * s;
    return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
  }, "readIntLE");
  f.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = t, s = 1, o = this[e + --i];
    for (; i > 0 && (s *= 256); ) o += this[e + --i] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  f.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  f.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  f.prototype.readInt16BE = a(
    function(e, t) {
      e = e >>> 0, t || q(e, 2, this.length);
      let n = this[e + 1] | this[e] << 8;
      return n & 32768 ? n | 4294901760 : n;
    },
    "readInt16BE"
  );
  f.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  f.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  f.prototype.readBigInt64LE = ge(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && We(
      e,
      this.length - 8
    );
    let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(
      i
    ) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  f.prototype.readBigInt64BE = ge(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && We(e, this.length - 8);
    let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i) << BigInt(32)) + BigInt(
      this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
    );
  }, "readBigInt64BE"));
  f.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(
      this,
      e,
      true,
      23,
      4
    );
  }, "readFloatLE");
  f.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  f.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  f.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, false, 52, 8);
  }, "readDoubleBE");
  function Y(r, e, t, n, i, s) {
    if (!f.isBuffer(
      r
    )) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < s) throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length) throw new RangeError(
      "Index out of range"
    );
  }
  __name(Y, "Y");
  a(Y, "checkInt");
  f.prototype.writeUintLE = f.prototype.writeUIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      Y(
        this,
        e,
        t,
        n,
        u,
        0
      );
    }
    let s = 1, o = 0;
    for (this[t] = e & 255; ++o < n && (s *= 256); ) this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  f.prototype.writeUintBE = f.prototype.writeUIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      Y(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  f.prototype.writeUint8 = f.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  f.prototype.writeUint16LE = f.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(
      this,
      e,
      t,
      2,
      65535,
      0
    ), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  f.prototype.writeUint16BE = f.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(
      this,
      e,
      t,
      2,
      65535,
      0
    ), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  f.prototype.writeUint32LE = f.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  f.prototype.writeUint32BE = f.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Nn(r, e, t, n, i) {
    Hn(
      e,
      n,
      i,
      r,
      t,
      7
    );
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  __name(Nn, "Nn");
  a(Nn, "wrtBigUInt64LE");
  function qn(r, e, t, n, i) {
    Hn(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  __name(qn, "qn");
  a(qn, "wrtBigUInt64BE");
  f.prototype.writeBigUInt64LE = ge(a(function(e, t = 0) {
    return Nn(this, e, t, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64LE"));
  f.prototype.writeBigUInt64BE = ge(a(function(e, t = 0) {
    return qn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64BE"));
  f.prototype.writeIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(
        2,
        8 * n - 1
      );
      Y(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255; ++s < n && (o *= 256); ) e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  f.prototype.writeIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(
        2,
        8 * n - 1
      );
      Y(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  f.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(
      this,
      e,
      t,
      1,
      127,
      -128
    ), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  f.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  f.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  f.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  f.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  f.prototype.writeBigInt64LE = ge(a(function(e, t = 0) {
    return Nn(this, e, t, -BigInt(
      "0x8000000000000000"
    ), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  f.prototype.writeBigInt64BE = ge(a(function(e, t = 0) {
    return qn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64BE"));
  function Qn(r, e, t, n, i, s) {
    if (t + n > r.length) throw new RangeError("Index out of range");
    if (t < 0) throw new RangeError(
      "Index out of range"
    );
  }
  __name(Qn, "Qn");
  a(Qn, "checkIEEE754");
  function Wn(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Qn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(
      r,
      e,
      t,
      n,
      23,
      4
    ), t + 4;
  }
  __name(Wn, "Wn");
  a(Wn, "writeFloat");
  f.prototype.writeFloatLE = a(function(e, t, n) {
    return Wn(
      this,
      e,
      t,
      true,
      n
    );
  }, "writeFloatLE");
  f.prototype.writeFloatBE = a(function(e, t, n) {
    return Wn(
      this,
      e,
      t,
      false,
      n
    );
  }, "writeFloatBE");
  function jn(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Qn(
      r,
      e,
      t,
      8,
      17976931348623157e292,
      -17976931348623157e292
    ), Pe.write(r, e, t, n, 52, 8), t + 8;
  }
  __name(jn, "jn");
  a(jn, "writeDouble");
  f.prototype.writeDoubleLE = a(function(e, t, n) {
    return jn(
      this,
      e,
      t,
      true,
      n
    );
  }, "writeDoubleLE");
  f.prototype.writeDoubleBE = a(function(e, t, n) {
    return jn(
      this,
      e,
      t,
      false,
      n
    );
  }, "writeDoubleBE");
  f.prototype.copy = a(function(e, t, n, i) {
    if (!f.isBuffer(
      e
    )) throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0) return 0;
    if (t < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (i < 0) throw new RangeError(
      "sourceEnd out of bounds"
    );
    i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
    let s = i - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
  }, "copy");
  f.prototype.fill = a(function(e, t, n, i) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !f.isEncoding(i)) throw new TypeError("Unknown encoding: " + i);
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (e = o);
      }
    } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
    if (n <= t) return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number") for (s = t; s < n; ++s)
      this[s] = e;
    else {
      let o = f.isBuffer(e) ? e : f.from(e, i), u = o.length;
      if (u === 0) throw new TypeError(
        'The value "' + e + '" is invalid for argument "value"'
      );
      for (s = 0; s < n - t; ++s) this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Ie = {};
  function Ut(r, e, t) {
    var n;
    Ie[r] = (n = class extends t {
      static {
        __name(this, "n");
      }
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: e.apply(this, arguments),
          writable: true,
          configurable: true
        }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value: s,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  __name(Ut, "Ut");
  a(Ut, "E");
  Ut("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Ut("ERR_INVALID_ARG_TYPE", function(r, e) {
    return `The "${r}" argument must be of type number. Received type ${typeof e}`;
  }, TypeError);
  Ut("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = Fn(String(t)) : typeof t == "bigint" && (i = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = Fn(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
  }, RangeError);
  function Fn(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3) e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(
      0,
      t
    )}${e}`;
  }
  __name(Fn, "Fn");
  a(Fn, "addNumericalSeparator");
  function Fo(r, e, t) {
    Be(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && We(e, r.length - (t + 1));
  }
  __name(Fo, "Fo");
  a(Fo, "checkBounds");
  function Hn(r, e, t, n, i, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Ie.ERR_OUT_OF_RANGE(
        "value",
        u,
        r
      );
    }
    Fo(n, i, s);
  }
  __name(Hn, "Hn");
  a(Hn, "checkIntBI");
  function Be(r, e) {
    if (typeof r != "number")
      throw new Ie.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  __name(Be, "Be");
  a(Be, "validateNumber");
  function We(r, e, t) {
    throw Math.floor(r) !== r ? (Be(r, t), new Ie.ERR_OUT_OF_RANGE(
      t || "offset",
      "an integer",
      r
    )) : e < 0 ? new Ie.ERR_BUFFER_OUT_OF_BOUNDS() : new Ie.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  __name(We, "We");
  a(We, "boundsError");
  var Mo = /[^+/0-9A-Za-z-_]/g;
  function Do(r) {
    if (r = r.split("=")[0], r = r.trim().replace(Mo, ""), r.length < 2) return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  __name(Do, "Do");
  a(Do, "base64clean");
  function Mt(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i = null, s = [];
    for (let o = 0; o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(
            239,
            191,
            189
          ), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else i && (e -= 3) > -1 && s.push(
        239,
        191,
        189
      );
      if (i = null, t < 128) {
        if ((e -= 1) < 0) break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0) break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0) break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0) break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return s;
  }
  __name(Mt, "Mt");
  a(
    Mt,
    "utf8ToBytes"
  );
  function ko(r) {
    let e = [];
    for (let t = 0; t < r.length; ++t) e.push(r.charCodeAt(
      t
    ) & 255);
    return e;
  }
  __name(ko, "ko");
  a(ko, "asciiToBytes");
  function Uo(r, e) {
    let t, n, i, s = [];
    for (let o = 0; o < r.length && !((e -= 2) < 0); ++o) t = r.charCodeAt(o), n = t >> 8, i = t % 256, s.push(i), s.push(n);
    return s;
  }
  __name(Uo, "Uo");
  a(Uo, "utf16leToBytes");
  function Gn(r) {
    return Lt.toByteArray(Do(r));
  }
  __name(Gn, "Gn");
  a(Gn, "base64ToBytes");
  function st(r, e, t, n) {
    let i;
    for (i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)
      e[i + t] = r[i];
    return i;
  }
  __name(st, "st");
  a(st, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  __name(ue, "ue");
  a(ue, "isInstance");
  function Ot(r) {
    return r !== r;
  }
  __name(Ot, "Ot");
  a(Ot, "numberIsNaN");
  var Oo = (function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      let n = t * 16;
      for (let i = 0; i < 16; ++i) e[n + i] = r[t] + r[i];
    }
    return e;
  })();
  function ge(r) {
    return typeof BigInt > "u" ? No : r;
  }
  __name(ge, "ge");
  a(ge, "defineBigIntMethod");
  function No() {
    throw new Error("BigInt not supported");
  }
  __name(No, "No");
  a(No, "BufferBigIntNotDefined");
});
var S;
var x;
var v;
var g;
var y;
var m;
var p = z(() => {
  "use strict";
  S = globalThis, x = globalThis.setImmediate ?? ((r) => setTimeout(
    r,
    0
  )), v = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), g = globalThis.crypto ?? {};
  g.subtle ?? (g.subtle = {});
  y = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : $n().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var we = I((Xc, Nt) => {
  "use strict";
  p();
  var Re = typeof Reflect == "object" ? Reflect : null, Vn = Re && typeof Re.apply == "function" ? Re.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), ot;
  Re && typeof Re.ownKeys == "function" ? ot = Re.ownKeys : Object.getOwnPropertySymbols ? ot = a(function(e) {
    return Object.getOwnPropertyNames(
      e
    ).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : ot = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function qo(r) {
    console && console.warn && console.warn(r);
  }
  __name(qo, "qo");
  a(qo, "ProcessEmitWarning");
  var zn = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function L() {
    L.init.call(this);
  }
  __name(L, "L");
  a(L, "EventEmitter");
  Nt.exports = L;
  Nt.exports.once = Ho;
  L.EventEmitter = L;
  L.prototype._events = void 0;
  L.prototype._eventsCount = 0;
  L.prototype._maxListeners = void 0;
  var Kn = 10;
  function at(r) {
    if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  __name(at, "at");
  a(at, "checkListener");
  Object.defineProperty(L, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return Kn;
  }, "get"), set: a(function(r) {
    if (typeof r != "number" || r < 0 || zn(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
    Kn = r;
  }, "set") });
  L.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  L.prototype.setMaxListeners = a(
    function(e) {
      if (typeof e != "number" || e < 0 || zn(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
      return this._maxListeners = e, this;
    },
    "setMaxListeners"
  );
  function Yn(r) {
    return r._maxListeners === void 0 ? L.defaultMaxListeners : r._maxListeners;
  }
  __name(Yn, "Yn");
  a(Yn, "_getMaxListeners");
  L.prototype.getMaxListeners = a(function() {
    return Yn(this);
  }, "getMaxListeners");
  L.prototype.emit = a(function(e) {
    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
    var i = e === "error", s = this._events;
    if (s !== void 0) i = i && s.error === void 0;
    else if (!i) return false;
    if (i) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === void 0) return false;
    if (typeof c == "function") Vn(c, this, t);
    else for (var h = c.length, l = ti(c, h), n = 0; n < h; ++n) Vn(
      l[n],
      this,
      t
    );
    return true;
  }, "emit");
  function Zn(r, e, t, n) {
    var i, s, o;
    if (at(t), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit(
      "newListener",
      e,
      t.listener ? t.listener : t
    ), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(
      t
    ) : o.push(t), i = Yn(r), i > 0 && o.length > i && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, qo(u);
    }
    return r;
  }
  __name(Zn, "Zn");
  a(Zn, "_addListener");
  L.prototype.addListener = a(function(e, t) {
    return Zn(this, e, t, false);
  }, "addListener");
  L.prototype.on = L.prototype.addListener;
  L.prototype.prependListener = a(function(e, t) {
    return Zn(this, e, t, true);
  }, "prependListener");
  function Qo() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  __name(Qo, "Qo");
  a(
    Qo,
    "onceWrapper"
  );
  function Jn(r, e, t) {
    var n = {
      fired: false,
      wrapFn: void 0,
      target: r,
      type: e,
      listener: t
    }, i = Qo.bind(n);
    return i.listener = t, n.wrapFn = i, i;
  }
  __name(Jn, "Jn");
  a(Jn, "_onceWrap");
  L.prototype.once = a(function(e, t) {
    return at(t), this.on(e, Jn(this, e, t)), this;
  }, "once");
  L.prototype.prependOnceListener = a(function(e, t) {
    return at(t), this.prependListener(e, Jn(
      this,
      e,
      t
    )), this;
  }, "prependOnceListener");
  L.prototype.removeListener = a(
    function(e, t) {
      var n, i, s, o, u;
      if (at(t), i = this._events, i === void 0) return this;
      if (n = i[e], n === void 0) return this;
      if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
      else if (typeof n != "function") {
        for (s = -1, o = n.length - 1; o >= 0; o--) if (n[o] === t || n[o].listener === t) {
          u = n[o].listener, s = o;
          break;
        }
        if (s < 0) return this;
        s === 0 ? n.shift() : Wo(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
      }
      return this;
    },
    "removeListener"
  );
  L.prototype.off = L.prototype.removeListener;
  L.prototype.removeAllListeners = a(function(e) {
    var t, n, i;
    if (n = this._events, n === void 0) return this;
    if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i = 0; i < s.length; ++i) o = s[i], o !== "removeListener" && this.removeAllListeners(o);
      return this.removeAllListeners(
        "removeListener"
      ), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function") this.removeListener(e, t);
    else if (t !== void 0) for (i = t.length - 1; i >= 0; i--) this.removeListener(e, t[i]);
    return this;
  }, "removeAllListeners");
  function Xn(r, e, t) {
    var n = r._events;
    if (n === void 0) return [];
    var i = n[e];
    return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? jo(i) : ti(i, i.length);
  }
  __name(Xn, "Xn");
  a(Xn, "_listeners");
  L.prototype.listeners = a(function(e) {
    return Xn(this, e, true);
  }, "listeners");
  L.prototype.rawListeners = a(function(e) {
    return Xn(this, e, false);
  }, "rawListeners");
  L.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : ei.call(r, e);
  };
  L.prototype.listenerCount = ei;
  function ei(r) {
    var e = this._events;
    if (e !== void 0) {
      var t = e[r];
      if (typeof t == "function") return 1;
      if (t !== void 0) return t.length;
    }
    return 0;
  }
  __name(ei, "ei");
  a(ei, "listenerCount");
  L.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? ot(this._events) : [];
  }, "eventNames");
  function ti(r, e) {
    for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
    return t;
  }
  __name(ti, "ti");
  a(ti, "arrayClone");
  function Wo(r, e) {
    for (; e + 1 < r.length; e++) r[e] = r[e + 1];
    r.pop();
  }
  __name(Wo, "Wo");
  a(Wo, "spliceOne");
  function jo(r) {
    for (var e = new Array(r.length), t = 0; t < e.length; ++t)
      e[t] = r[t].listener || r[t];
    return e;
  }
  __name(jo, "jo");
  a(jo, "unwrapListeners");
  function Ho(r, e) {
    return new Promise(
      function(t, n) {
        function i(o) {
          r.removeListener(e, s), n(o);
        }
        __name(i, "i");
        a(i, "errorListener");
        function s() {
          typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(
            arguments
          ));
        }
        __name(s, "s");
        a(s, "resolver"), ri(r, e, s, { once: true }), e !== "error" && Go(r, i, { once: true });
      }
    );
  }
  __name(Ho, "Ho");
  a(Ho, "once");
  function Go(r, e, t) {
    typeof r.on == "function" && ri(r, "error", e, t);
  }
  __name(Go, "Go");
  a(
    Go,
    "addErrorHandlerIfEventEmitter"
  );
  function ri(r, e, t, n) {
    if (typeof r.on == "function")
      n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function") r.addEventListener(
      e,
      a(/* @__PURE__ */ __name(function i(s) {
        n.once && r.removeEventListener(e, i), t(s);
      }, "i"), "wrapListener")
    );
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  __name(ri, "ri");
  a(ri, "eventTargetAgnosticAddListener");
});
var je = {};
ie(je, { default: /* @__PURE__ */ __name(() => $o, "default") });
var $o;
var He = z(() => {
  "use strict";
  p();
  $o = {};
});
function Ge(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, h = 0, l = 0, d = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], b = a(
    (A, w) => A >>> w | A << 32 - w,
    "rrot"
  ), C = new Uint32Array(64), B = new Uint8Array(64), W = a(() => {
    for (let R = 0, G = 0; R < 16; R++, G += 4) C[R] = B[G] << 24 | B[G + 1] << 16 | B[G + 2] << 8 | B[G + 3];
    for (let R = 16; R < 64; R++) {
      let G = b(C[R - 15], 7) ^ b(C[R - 15], 18) ^ C[R - 15] >>> 3, he = b(C[R - 2], 17) ^ b(C[R - 2], 19) ^ C[R - 2] >>> 10;
      C[R] = C[R - 16] + G + C[R - 7] + he | 0;
    }
    let A = e, w = t, P = n, V = i, k = s, j = o, ce = u, ee = c;
    for (let R = 0; R < 64; R++) {
      let G = b(
        k,
        6
      ) ^ b(k, 11) ^ b(k, 25), he = k & j ^ ~k & ce, ye = ee + G + he + d[R] + C[R] | 0, xe = b(A, 2) ^ b(A, 13) ^ b(A, 22), me = A & w ^ A & P ^ w & P, se = xe + me | 0;
      ee = ce, ce = j, j = k, k = V + ye | 0, V = P, P = w, w = A, A = ye + se | 0;
    }
    e = e + A | 0, t = t + w | 0, n = n + P | 0, i = i + V | 0, s = s + k | 0, o = o + j | 0, u = u + ce | 0, c = c + ee | 0, l = 0;
  }, "process"), X = a((A) => {
    typeof A == "string" && (A = new TextEncoder().encode(A));
    for (let w = 0; w < A.length; w++) B[l++] = A[w], l === 64 && W();
    h += A.length;
  }, "add"), de = a(() => {
    if (B[l++] = 128, l == 64 && W(), l + 8 > 64) {
      for (; l < 64; ) B[l++] = 0;
      W();
    }
    for (; l < 58; ) B[l++] = 0;
    let A = h * 8;
    B[l++] = A / 1099511627776 & 255, B[l++] = A / 4294967296 & 255, B[l++] = A >>> 24, B[l++] = A >>> 16 & 255, B[l++] = A >>> 8 & 255, B[l++] = A & 255, W();
    let w = new Uint8Array(32);
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === void 0 ? { add: X, digest: de } : (X(r), de());
}
__name(Ge, "Ge");
var ni = z(
  () => {
    "use strict";
    p();
    a(Ge, "sha256");
  }
);
var O;
var $e;
var ii = z(() => {
  "use strict";
  p();
  O = class O2 {
    static {
      __name(this, "O2");
    }
    constructor() {
      _(
        this,
        "_dataLength",
        0
      );
      _(this, "_bufferLength", 0);
      _(this, "_state", new Int32Array(4));
      _(
        this,
        "_buffer",
        new ArrayBuffer(68)
      );
      _(this, "_buffer8");
      _(this, "_buffer32");
      this._buffer8 = new Uint8Array(
        this._buffer,
        0,
        68
      ), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(e).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let t = O2.hexChars, n = O2.hexOut, i, s, o, u;
      for (u = 0; u < 4; u += 1) for (s = u * 8, i = e[u], o = 0; o < 8; o += 2) n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(i & 15), i >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i = e[1], s = e[2], o = e[3];
      n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(O2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
      for (o = 0; o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128) t[i++] = s;
        else if (s < 2048) t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
        else if (s < 55296 || s > 56319) t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error("Unicode standard supports code points up to U+10FFFF");
          t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        }
        i >= 64 && (this._dataLength += 64, O2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e.charCodeAt(o++);
        if (i < 64) break;
        this._dataLength += 64, O2._md5cycle(
          this._state,
          n
        ), i = 0;
      }
      return this._bufferLength = i, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e[o++];
        if (i < 64) break;
        this._dataLength += 64, O2._md5cycle(
          this._state,
          n
        ), i = 0;
      }
      return this._bufferLength = i, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let t = e.buffer, n = e.state, i = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1) this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(O2.buffer32Identity.subarray(s), s), t > 55 && (O2._md5cycle(this._state, i), i.set(O2.buffer32Identity)), o <= 4294967295)
        i[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null) return;
        let c = parseInt(
          u[2],
          16
        ), h = parseInt(u[1], 16) || 0;
        i[14] = c, i[15] = h;
      }
      return O2._md5cycle(this._state, i), e ? this._state : O2._hex(this._state);
    }
  };
  a(O, "Md5"), _(O, "stateIdentity", new Int32Array(
    [1732584193, -271733879, -1732584194, 271733878]
  )), _(O, "buffer32Identity", new Int32Array(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  )), _(O, "hexChars", "0123456789abcdef"), _(O, "hexOut", []), _(O, "onePassHasher", new O());
  $e = O;
});
var qt = {};
ie(qt, { createHash: /* @__PURE__ */ __name(() => Ko, "createHash"), createHmac: /* @__PURE__ */ __name(() => zo, "createHmac"), randomBytes: /* @__PURE__ */ __name(() => Vo, "randomBytes") });
function Vo(r) {
  return g.getRandomValues(y.alloc(r));
}
__name(Vo, "Vo");
function Ko(r) {
  if (r === "sha256") return { update: a(
    function(e) {
      return { digest: a(function() {
        return y.from(Ge(e));
      }, "digest") };
    },
    "update"
  ) };
  if (r === "md5") return { update: a(function(e) {
    return { digest: a(function() {
      return typeof e == "string" ? $e.hashStr(e) : $e.hashByteArray(e);
    }, "digest") };
  }, "update") };
  throw new Error(
    `Hash type '${r}' not supported`
  );
}
__name(Ko, "Ko");
function zo(r, e) {
  if (r !== "sha256") throw new Error(
    `Only sha256 is supported (requested: '${r}')`
  );
  return { update: a(function(t) {
    return {
      digest: a(function() {
        typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(t));
        let n = e.length;
        if (n > 64) e = Ge(e);
        else if (n < 64) {
          let c = new Uint8Array(64);
          c.set(e), e = c;
        }
        let i = new Uint8Array(64), s = new Uint8Array(
          64
        );
        for (let c = 0; c < 64; c++) i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
        let o = new Uint8Array(t.length + 64);
        o.set(i, 0), o.set(t, 64);
        let u = new Uint8Array(96);
        return u.set(s, 0), u.set(
          Ge(o),
          64
        ), y.from(Ge(u));
      }, "digest")
    };
  }, "update") };
}
__name(zo, "zo");
var Qt = z(() => {
  "use strict";
  p();
  ni();
  ii();
  a(Vo, "randomBytes");
  a(Ko, "createHash");
  a(zo, "createHmac");
});
var jt = I((si) => {
  "use strict";
  p();
  si.parse = function(r, e) {
    return new Wt(r, e).parse();
  };
  var ut = class ut2 {
    static {
      __name(this, "ut2");
    }
    constructor(e, t) {
      this.source = e, this.transform = t || Yo, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(e);
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(
        t
      ), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[") for (; !this.isEof(); ) {
        var e = this.nextCharacter();
        if (e.value === "=") break;
      }
    }
    parse(e) {
      var t, n, i;
      for (this.consumeDimensions(); !this.isEof(); ) if (t = this.nextCharacter(), t.value === "{" && !i) this.dimension++, this.dimension > 1 && (n = new ut2(this.source.substr(this.position - 1), this.transform), this.entries.push(
        n.parse(true)
      ), this.position += n.position - 2);
      else if (t.value === "}" && !i) {
        if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
      } else t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(
        t.value
      );
      if (this.dimension !== 0) throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(ut, "ArrayParser");
  var Wt = ut;
  function Yo(r) {
    return r;
  }
  __name(Yo, "Yo");
  a(Yo, "identity");
});
var Ht = I((mh, oi) => {
  p();
  var Zo = jt();
  oi.exports = { create: a(function(r, e) {
    return { parse: a(
      function() {
        return Zo.parse(r, e);
      },
      "parse"
    ) };
  }, "create") };
});
var ci = I((bh, ui) => {
  "use strict";
  p();
  var Jo = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Xo = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, ea = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, ta = /^-?infinity$/;
  ui.exports = a(function(e) {
    if (ta.test(e)) return Number(e.replace("i", "I"));
    var t = Jo.exec(e);
    if (!t) return ra(e) || null;
    var n = !!t[8], i = parseInt(t[1], 10);
    n && (i = ai(i));
    var s = parseInt(
      t[2],
      10
    ) - 1, o = t[3], u = parseInt(t[4], 10), c = parseInt(t[5], 10), h = parseInt(t[6], 10), l = t[7];
    l = l ? 1e3 * parseFloat(l) : 0;
    var d, b = na(e);
    return b != null ? (d = new Date(Date.UTC(
      i,
      s,
      o,
      u,
      c,
      h,
      l
    )), Gt(i) && d.setUTCFullYear(i), b !== 0 && d.setTime(d.getTime() - b)) : (d = new Date(
      i,
      s,
      o,
      u,
      c,
      h,
      l
    ), Gt(i) && d.setFullYear(i)), d;
  }, "parseDate");
  function ra(r) {
    var e = Xo.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = ai(t));
      var i = parseInt(
        e[2],
        10
      ) - 1, s = e[3], o = new Date(t, i, s);
      return Gt(t) && o.setFullYear(t), o;
    }
  }
  __name(ra, "ra");
  a(ra, "getDate");
  function na(r) {
    if (r.endsWith("+00")) return 0;
    var e = ea.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z") return 0;
      var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(
        e[3] || 0,
        10
      ) * 60 + parseInt(e[4] || 0, 10);
      return i * n * 1e3;
    }
  }
  __name(na, "na");
  a(na, "timeZoneOffset");
  function ai(r) {
    return -(r - 1);
  }
  __name(ai, "ai");
  a(ai, "bcYearToNegativeYear");
  function Gt(r) {
    return r >= 0 && r < 100;
  }
  __name(Gt, "Gt");
  a(
    Gt,
    "is0To99"
  );
});
var li = I((vh, hi) => {
  p();
  hi.exports = sa;
  var ia = Object.prototype.hasOwnProperty;
  function sa(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) ia.call(
        t,
        n
      ) && (r[n] = t[n]);
    }
    return r;
  }
  __name(sa, "sa");
  a(sa, "extend");
});
var di = I((Ah, pi) => {
  "use strict";
  p();
  var oa = li();
  pi.exports = Fe;
  function Fe(r) {
    if (!(this instanceof Fe)) return new Fe(r);
    oa(this, wa(r));
  }
  __name(Fe, "Fe");
  a(Fe, "PostgresInterval");
  var aa = ["seconds", "minutes", "hours", "days", "months", "years"];
  Fe.prototype.toPostgres = function() {
    var r = aa.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t + " " + e;
    }, this).join(" ");
  };
  var ua = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, ca = ["years", "months", "days"], ha = ["hours", "minutes", "seconds"];
  Fe.prototype.toISOString = Fe.prototype.toISO = function() {
    var r = ca.map(t, this).join(""), e = ha.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i + ua[n];
    }
    __name(t, "t");
  };
  var $t = "([+-]?\\d+)", la = $t + "\\s+years?", fa = $t + "\\s+mons?", pa = $t + "\\s+days?", da = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", ya = new RegExp([
    la,
    fa,
    pa,
    da
  ].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), fi = {
    years: 2,
    months: 4,
    days: 6,
    hours: 9,
    minutes: 10,
    seconds: 11,
    milliseconds: 12
  }, ma = ["hours", "minutes", "seconds", "milliseconds"];
  function ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(
      e,
      10
    ) / 1e3;
  }
  __name(ga, "ga");
  a(ga, "parseMilliseconds");
  function wa(r) {
    if (!r) return {};
    var e = ya.exec(
      r
    ), t = e[8] === "-";
    return Object.keys(fi).reduce(function(n, i) {
      var s = fi[i], o = e[s];
      return !o || (o = i === "milliseconds" ? ga(o) : parseInt(o, 10), !o) || (t && ~ma.indexOf(i) && (o *= -1), n[i] = o), n;
    }, {});
  }
  __name(wa, "wa");
  a(wa, "parse");
});
var mi = I((Ih, yi) => {
  "use strict";
  p();
  yi.exports = a(function(e) {
    if (/^\\x/.test(e)) return new y(
      e.substr(2),
      "hex"
    );
    for (var t = "", n = 0; n < e.length; ) if (e[n] !== "\\") t += e[n], ++n;
    else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
    else {
      for (var i = 1; n + i < e.length && e[n + i] === "\\"; ) i++;
      for (var s = 0; s < Math.floor(i / 2); ++s) t += "\\";
      n += Math.floor(i / 2) * 2;
    }
    return new y(t, "binary");
  }, "parseBytea");
});
var Ei = I((Lh, vi) => {
  p();
  var Ve = jt(), Ke = Ht(), ct = ci(), wi = di(), bi = mi();
  function ht(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  __name(ht, "ht");
  a(ht, "allowNull");
  function Si(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  __name(Si, "Si");
  a(Si, "parseBool");
  function ba(r) {
    return r ? Ve.parse(r, Si) : null;
  }
  __name(ba, "ba");
  a(ba, "parseBoolArray");
  function Sa(r) {
    return parseInt(r, 10);
  }
  __name(Sa, "Sa");
  a(Sa, "parseBaseTenInt");
  function Vt(r) {
    return r ? Ve.parse(r, ht(Sa)) : null;
  }
  __name(Vt, "Vt");
  a(Vt, "parseIntegerArray");
  function xa(r) {
    return r ? Ve.parse(r, ht(function(e) {
      return xi(e).trim();
    })) : null;
  }
  __name(xa, "xa");
  a(xa, "parseBigIntegerArray");
  var va = a(function(r) {
    if (!r) return null;
    var e = Ke.create(r, function(t) {
      return t !== null && (t = Zt(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), Kt = a(function(r) {
    if (!r)
      return null;
    var e = Ke.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r) return null;
    var e = Ke.create(r);
    return e.parse();
  }, "parseStringArray"), zt = a(function(r) {
    if (!r) return null;
    var e = Ke.create(r, function(t) {
      return t !== null && (t = ct(t)), t;
    });
    return e.parse();
  }, "parseDateArray"), Ea = a(function(r) {
    if (!r) return null;
    var e = Ke.create(r, function(t) {
      return t !== null && (t = wi(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), _a2 = a(function(r) {
    return r ? Ve.parse(r, ht(bi)) : null;
  }, "parseByteAArray"), Yt = a(function(r) {
    return parseInt(
      r,
      10
    );
  }, "parseInteger"), xi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), gi = a(
    function(r) {
      return r ? Ve.parse(r, ht(JSON.parse)) : null;
    },
    "parseJsonArray"
  ), Zt = a(function(r) {
    return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(r[1]) });
  }, "parsePoint"), Aa = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(") return null;
    for (var e = "(", t = "", n = false, i = 2; i < r.length - 1; i++) {
      if (n || (e += r[i]), r[i] === ")") {
        n = true;
        continue;
      } else if (!n) continue;
      r[i] !== "," && (t += r[i]);
    }
    var s = Zt(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), Ca = a(function(r) {
    r(
      20,
      xi
    ), r(21, Yt), r(23, Yt), r(26, Yt), r(700, parseFloat), r(701, parseFloat), r(16, Si), r(
      1082,
      ct
    ), r(1114, ct), r(1184, ct), r(600, Zt), r(651, re), r(718, Aa), r(1e3, ba), r(1001, _a2), r(
      1005,
      Vt
    ), r(1007, Vt), r(1028, Vt), r(1016, xa), r(1017, va), r(1021, Kt), r(1022, Kt), r(1231, Kt), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(1115, zt), r(
      1182,
      zt
    ), r(1185, zt), r(1186, wi), r(1187, Ea), r(17, bi), r(114, JSON.parse.bind(JSON)), r(
      3802,
      JSON.parse.bind(JSON)
    ), r(199, gi), r(3807, gi), r(3907, re), r(2951, re), r(791, re), r(
      1183,
      re
    ), r(1270, re);
  }, "init");
  vi.exports = { init: Ca };
});
var Ai = I((Mh, _i) => {
  "use strict";
  p();
  var Z = 1e6;
  function Ta(r) {
    var e = r.readInt32BE(
      0
    ), t = r.readUInt32BE(4), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i = "", s, o, u, c, h, l;
    {
      if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", h = 6 - u.length, l = 0; l < h; l++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", h = 6 - u.length, l = 0; l < h; l++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", h = 6 - u.length, l = 0; l < h; l++) c += "0";
      i = c + u + i;
    }
    return s = e % Z, o = 4294967296 * s + t, u = "" + o % Z, n + u + i;
  }
  __name(Ta, "Ta");
  a(Ta, "readInt8");
  _i.exports = Ta;
});
var Bi = I((Uh, Pi) => {
  p();
  var Ia = Ai(), F = a(function(r, e, t, n, i) {
    t = t || 0, n = n || false, i = i || function(C, B, W) {
      return C * Math.pow(2, W) + B;
    };
    var s = t >> 3, o = a(function(C) {
      return n ? ~C & 255 : C;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var h = 0;
    t % 8 + e >= 8 && (h = i(0, o(r[s]) & u, c));
    for (var l = e + t >> 3, d = s + 1; d < l; d++) h = i(h, o(r[d]), 8);
    var b = (e + t) % 8;
    return b > 0 && (h = i(h, o(r[l]) >> 8 - b, b)), h;
  }, "parseBits"), Ii = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i = F(r, 1), s = F(r, t, 1);
    if (s === 0) return 0;
    var o = 1, u = a(function(h, l, d) {
      h === 0 && (h = 1);
      for (var b = 1; b <= d; b++) o /= 2, (l & 1 << d - b) > 0 && (h += o);
      return h;
    }, "parsePrecisionBits"), c = F(r, e, t + 1, false, u);
    return s == Math.pow(2, t + 1) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), Pa = a(function(r) {
    return F(r, 1) == 1 ? -1 * (F(r, 15, 1, true) + 1) : F(r, 15, 1);
  }, "parseInt16"), Ci = a(function(r) {
    return F(r, 1) == 1 ? -1 * (F(
      r,
      31,
      1,
      true
    ) + 1) : F(r, 31, 1);
  }, "parseInt32"), Ba = a(function(r) {
    return Ii(r, 23, 8);
  }, "parseFloat32"), La = a(function(r) {
    return Ii(r, 52, 11);
  }, "parseFloat64"), Ra = a(function(r) {
    var e = F(r, 16, 32);
    if (e == 49152) return NaN;
    for (var t = Math.pow(1e4, F(r, 16, 16)), n = 0, i = [], s = F(r, 16), o = 0; o < s; o++) n += F(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, F(r, 16, 48));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Ti = a(function(r, e) {
    var t = F(
      e,
      1
    ), n = F(e, 63, 1), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
    return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
      return this.usec;
    }, i.setMicroSeconds = function(s) {
      this.usec = s;
    }, i.getUTCMicroSeconds = function() {
      return this.usec;
    }, i;
  }, "parseDate"), ze = a(function(r) {
    for (var e = F(r, 32), t = F(r, 32, 32), n = F(r, 32, 64), i = 96, s = [], o = 0; o < e; o++) s[o] = F(r, 32, i), i += 32, i += 32;
    var u = a(function(h) {
      var l = F(r, 32, i);
      if (i += 32, l == 4294967295) return null;
      var d;
      if (h == 23 || h == 20) return d = F(r, l * 8, i), i += l * 8, d;
      if (h == 25) return d = r.toString(this.encoding, i >> 3, (i += l << 3) >> 3), d;
      console.log("ERROR: ElementType not implemented: " + h);
    }, "parseElement"), c = a(function(h, l) {
      var d = [], b;
      if (h.length > 1) {
        var C = h.shift();
        for (b = 0; b < C; b++) d[b] = c(h, l);
        h.unshift(
          C
        );
      } else for (b = 0; b < h[0]; b++) d[b] = u(l);
      return d;
    }, "parse");
    return c(s, n);
  }, "parseArray"), Fa = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), Ma = a(function(r) {
    return r === null ? null : F(r, 8) > 0;
  }, "parseBool"), Da = a(function(r) {
    r(20, Ia), r(21, Pa), r(23, Ci), r(
      26,
      Ci
    ), r(1700, Ra), r(700, Ba), r(701, La), r(16, Ma), r(1114, Ti.bind(null, false)), r(1184, Ti.bind(
      null,
      true
    )), r(1e3, ze), r(1007, ze), r(1016, ze), r(1008, ze), r(1009, ze), r(25, Fa);
  }, "init");
  Pi.exports = { init: Da };
});
var Ri = I((qh, Li) => {
  p();
  Li.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = I((Ze) => {
  p();
  var ka = Ei(), Ua = Bi(), Oa = Ht(), Na = Ri();
  Ze.getTypeParser = qa;
  Ze.setTypeParser = Qa;
  Ze.arrayParser = Oa;
  Ze.builtins = Na;
  var Ye = { text: {}, binary: {} };
  function Fi(r) {
    return String(
      r
    );
  }
  __name(Fi, "Fi");
  a(Fi, "noParse");
  function qa(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Fi;
  }
  __name(qa, "qa");
  a(
    qa,
    "getTypeParser"
  );
  function Qa(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  __name(Qa, "Qa");
  a(Qa, "setTypeParser");
  ka.init(function(r, e) {
    Ye.text[r] = e;
  });
  Ua.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var Xe = I((Gh, Jt) => {
  "use strict";
  p();
  Jt.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), Wa = Me.getTypeParser(
    20,
    "text"
  ), ja = Me.getTypeParser(1016, "text");
  Jt.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(23, "text") : Wa), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : ja);
  });
});
var et = I((Vh, Di) => {
  "use strict";
  p();
  var Ha = (Qt(), N(qt)), Ga = Xe();
  function $a(r) {
    var e = r.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return '"' + e + '"';
  }
  __name($a, "$a");
  a($a, "escapeElement");
  function Mi(r) {
    for (var e = "{", t = 0; t < r.length; t++) t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + Mi(r[t]) : r[t] instanceof y ? e += "\\\\x" + r[t].toString("hex") : e += $a(lt2(r[t]));
    return e = e + "}", e;
  }
  __name(Mi, "Mi");
  a(Mi, "arrayString");
  var lt2 = a(function(r, e) {
    if (r == null) return null;
    if (r instanceof y) return r;
    if (ArrayBuffer.isView(r)) {
      var t = y.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(
        r.byteOffset,
        r.byteOffset + r.byteLength
      );
    }
    return r instanceof Date ? Ga.parseInputDatesAsUTC ? za(r) : Ka(r) : Array.isArray(r) ? Mi(r) : typeof r == "object" ? Va(r, e) : r.toString();
  }, "prepareValue");
  function Va(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), lt2(r.toPostgres(lt2), e);
    }
    return JSON.stringify(r);
  }
  __name(Va, "Va");
  a(Va, "prepareObject");
  function H(r, e) {
    for (r = "" + r; r.length < e; ) r = "0" + r;
    return r;
  }
  __name(H, "H");
  a(
    H,
    "pad"
  );
  function Ka(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i = H(t, 4) + "-" + H(r.getMonth() + 1, 2) + "-" + H(r.getDate(), 2) + "T" + H(r.getHours(), 2) + ":" + H(r.getMinutes(), 2) + ":" + H(r.getSeconds(), 2) + "." + H(
      r.getMilliseconds(),
      3
    );
    return e < 0 ? (i += "-", e *= -1) : i += "+", i += H(Math.floor(e / 60), 2) + ":" + H(e % 60, 2), n && (i += " BC"), i;
  }
  __name(Ka, "Ka");
  a(Ka, "dateToString");
  function za(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = H(e, 4) + "-" + H(r.getUTCMonth() + 1, 2) + "-" + H(r.getUTCDate(), 2) + "T" + H(r.getUTCHours(), 2) + ":" + H(r.getUTCMinutes(), 2) + ":" + H(r.getUTCSeconds(), 2) + "." + H(r.getUTCMilliseconds(), 3);
    return n += "+00:00", t && (n += " BC"), n;
  }
  __name(za, "za");
  a(za, "dateToStringUTC");
  function Ya(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  __name(Ya, "Ya");
  a(Ya, "normalizeQueryConfig");
  var Xt = a(function(r) {
    return Ha.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Za = a(function(r, e, t) {
    var n = Xt(e + r), i = Xt(y.concat([y.from(n), t]));
    return "md5" + i;
  }, "postgresMd5PasswordHash");
  Di.exports = { prepareValue: a(function(e) {
    return lt2(
      e
    );
  }, "prepareValueWrapper"), normalizeQueryConfig: Ya, postgresMd5PasswordHash: Za, md5: Xt };
});
var qi = I((Yh, Ni) => {
  "use strict";
  p();
  var er = (Qt(), N(qt));
  function Ja(r) {
    if (r.indexOf(
      "SCRAM-SHA-256"
    ) === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = er.randomBytes(18).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  __name(Ja, "Ja");
  a(Ja, "startSession");
  function Xa(r, e, t) {
    if (r.message !== "SASLInitialResponse") throw new Error(
      "SASL: Last message was not SASLInitialResponse"
    );
    if (typeof e != "string") throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
    );
    if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = ru(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i = y.from(n.salt, "base64"), s = su(
      e,
      i,
      n.iteration
    ), o = De(s, "Client Key"), u = iu(o), c = "n=*,r=" + r.clientNonce, h = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, l = "c=biws,r=" + n.nonce, d = c + "," + h + "," + l, b = De(u, d), C = Oi(
      o,
      b
    ), B = C.toString("base64"), W = De(s, "Server Key"), X = De(W, d);
    r.message = "SASLResponse", r.serverSignature = X.toString("base64"), r.response = l + ",p=" + B;
  }
  __name(Xa, "Xa");
  a(Xa, "continueSession");
  function eu(r, e) {
    if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = nu(
      e
    );
    if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  __name(eu, "eu");
  a(eu, "finalizeSession");
  function tu(r) {
    if (typeof r != "string") throw new TypeError("SASL: text must be a string");
    return r.split("").map(
      (e, t) => r.charCodeAt(t)
    ).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  __name(tu, "tu");
  a(tu, "isPrintableChars");
  function ki(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  __name(ki, "ki");
  a(ki, "isBase64");
  function Ui(r) {
    if (typeof r != "string") throw new TypeError(
      "SASL: attribute pairs text must be a string"
    );
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  __name(Ui, "Ui");
  a(Ui, "parseAttributePairs");
  function ru(r) {
    let e = Ui(
      r
    ), t = e.get("r");
    if (t) {
      if (!tu(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ki(n)) throw new Error(
        "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64"
      );
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i = e.get("i");
    if (i) {
      if (!/^[1-9][0-9]*$/.test(i)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  __name(ru, "ru");
  a(ru, "parseServerFirstMessage");
  function nu(r) {
    let t = Ui(r).get("v");
    if (t) {
      if (!ki(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else throw new Error(
      "SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing"
    );
    return { serverSignature: t };
  }
  __name(nu, "nu");
  a(nu, "parseServerFinalMessage");
  function Oi(r, e) {
    if (!y.isBuffer(r)) throw new TypeError(
      "first argument must be a Buffer"
    );
    if (!y.isBuffer(e)) throw new TypeError("second argument must be a Buffer");
    if (r.length !== e.length) throw new Error("Buffer lengths must match");
    if (r.length === 0) throw new Error("Buffers cannot be empty");
    return y.from(r.map((t, n) => r[n] ^ e[n]));
  }
  __name(Oi, "Oi");
  a(Oi, "xorBuffers");
  function iu(r) {
    return er.createHash(
      "sha256"
    ).update(r).digest();
  }
  __name(iu, "iu");
  a(iu, "sha256");
  function De(r, e) {
    return er.createHmac(
      "sha256",
      r
    ).update(e).digest();
  }
  __name(De, "De");
  a(De, "hmacSha256");
  function su(r, e, t) {
    for (var n = De(
      r,
      y.concat([e, y.from([0, 0, 0, 1])])
    ), i = n, s = 0; s < t - 1; s++) n = De(r, n), i = Oi(i, n);
    return i;
  }
  __name(su, "su");
  a(su, "Hi");
  Ni.exports = { startSession: Ja, continueSession: Xa, finalizeSession: eu };
});
var tr = {};
ie(tr, { join: /* @__PURE__ */ __name(() => ou, "join") });
function ou(...r) {
  return r.join("/");
}
__name(ou, "ou");
var rr = z(() => {
  "use strict";
  p();
  a(ou, "join");
});
var nr = {};
ie(nr, { stat: /* @__PURE__ */ __name(() => au, "stat") });
function au(r, e) {
  e(new Error("No filesystem"));
}
__name(au, "au");
var ir = z(
  () => {
    "use strict";
    p();
    a(au, "stat");
  }
);
var sr = {};
ie(sr, { default: /* @__PURE__ */ __name(() => uu, "default") });
var uu;
var or = z(() => {
  "use strict";
  p();
  uu = {};
});
var Qi = {};
ie(Qi, { StringDecoder: /* @__PURE__ */ __name(() => ar, "StringDecoder") });
var ur;
var ar;
var Wi = z(() => {
  "use strict";
  p();
  ur = class ur {
    static {
      __name(this, "ur");
    }
    constructor(e) {
      _(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(ur, "StringDecoder");
  ar = ur;
});
var $i = I((ol, Gi) => {
  "use strict";
  p();
  var { Transform: cu } = (or(), N(sr)), { StringDecoder: hu } = (Wi(), N(Qi)), be = /* @__PURE__ */ Symbol("last"), ft = /* @__PURE__ */ Symbol("decoder");
  function lu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[ft].write(r).split(this.matcher), n.length === 1) return t();
      n.shift(), this.overflow = false;
    } else this[be] += this[ft].write(r), n = this[be].split(this.matcher);
    this[be] = n.pop();
    for (let i = 0; i < n.length; i++) try {
      Hi(this, this.mapper(n[i]));
    } catch (s) {
      return t(
        s
      );
    }
    if (this.overflow = this[be].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error("maximum buffer reached"));
      return;
    }
    t();
  }
  __name(lu, "lu");
  a(lu, "transform");
  function fu(r) {
    if (this[be] += this[ft].end(), this[be]) try {
      Hi(this, this.mapper(this[be]));
    } catch (e) {
      return r(e);
    }
    r();
  }
  __name(fu, "fu");
  a(fu, "flush");
  function Hi(r, e) {
    e !== void 0 && r.push(e);
  }
  __name(Hi, "Hi");
  a(Hi, "push");
  function ji(r) {
    return r;
  }
  __name(ji, "ji");
  a(ji, "noop");
  function pu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ji, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ji);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = lu, t.flush = fu, t.readableObjectMode = true;
    let n = new cu(t);
    return n[be] = "", n[ft] = new hu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
      this._writableState.errorEmitted = false, s(i);
    }, n;
  }
  __name(pu, "pu");
  a(pu, "split");
  Gi.exports = pu;
});
var zi = I((cl, pe) => {
  "use strict";
  p();
  var Vi = (rr(), N(tr)), du = (or(), N(sr)).Stream, yu = $i(), Ki = (He(), N(je)), mu = 5432, pt = m.platform === "win32", tt = m.stderr, gu = 56, wu = 7, bu = 61440, Su = 32768;
  function xu(r) {
    return (r & bu) == Su;
  }
  __name(xu, "xu");
  a(xu, "isRegFile");
  var ke = [
    "host",
    "port",
    "database",
    "user",
    "password"
  ], cr = ke.length, vu = ke[cr - 1];
  function hr() {
    var r = tt instanceof du && tt.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      tt.write(Ki.format.apply(Ki, e));
    }
  }
  __name(hr, "hr");
  a(hr, "warn");
  Object.defineProperty(
    pe.exports,
    "isWin",
    { get: a(function() {
      return pt;
    }, "get"), set: a(function(r) {
      pt = r;
    }, "set") }
  );
  pe.exports.warnTo = function(r) {
    var e = tt;
    return tt = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (pt ? Vi.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : Vi.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : pt ? true : (e = e || "<unkn>", xu(r.mode) ? r.mode & (gu | wu) ? (hr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (hr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var Eu = pe.exports.match = function(r, e) {
    return ke.slice(0, -1).reduce(function(t, n, i) {
      return i == 1 && Number(r[n] || mu) === Number(
        e[n]
      ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i = e.pipe(yu());
    function s(c) {
      var h = _u(c);
      h && Au(h) && Eu(r, h) && (n = h[vu], i.end());
    }
    __name(s, "s");
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), hr("WARNING: error on reading file: %s", c), t(void 0);
    }, "onErr");
    e.on("error", u), i.on("data", s).on("end", o).on("error", u);
  };
  var _u = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/)) return null;
    for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(function(l, d, b) {
      var C = r.substring(d, b);
      Object.hasOwnProperty.call(
        m.env,
        "PGPASS_NO_DEESCAPE"
      ) || (C = C.replace(/\\([:\\])/g, "$1")), o[ke[l]] = C;
    }, "addToObj"), h = 0; h < r.length - 1; h += 1) {
      if (e = r.charAt(h + 1), t = r.charAt(h), u = n == cr - 1, u) {
        c(n, i);
        break;
      }
      h >= 0 && e == ":" && t !== "\\" && (c(n, i, h + 1), i = h + 2, n += 1);
    }
    return o = Object.keys(o).length === cr ? o : null, o;
  }, Au = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0; t < ke.length; t += 1) {
      var n = e[t], i = r[ke[t]] || "", s = n(i);
      if (!s) return false;
    }
    return true;
  };
});
var Zi = I((pl, lr) => {
  "use strict";
  p();
  var fl = (rr(), N(tr)), Yi = (ir(), N(nr)), dt = zi();
  lr.exports = function(r, e) {
    var t = dt.getFileName();
    Yi.stat(t, function(n, i) {
      if (n || !dt.usePgPass(i, t)) return e(void 0);
      var s = Yi.createReadStream(t);
      dt.getPassword(
        r,
        s,
        e
      );
    });
  };
  lr.exports.warnTo = dt.warnTo;
});
var mt = I((yl, Ji) => {
  "use strict";
  p();
  var Cu = Je();
  function yt(r) {
    this._types = r || Cu, this.text = {}, this.binary = {};
  }
  __name(yt, "yt");
  a(yt, "TypeOverrides");
  yt.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  yt.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  yt.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Ji.exports = yt;
});
var Xi = {};
ie(Xi, { default: /* @__PURE__ */ __name(() => Tu, "default") });
var Tu;
var es = z(() => {
  "use strict";
  p();
  Tu = {};
});
var ts = {};
ie(ts, { parse: /* @__PURE__ */ __name(() => fr, "parse") });
function fr(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(t.length), {
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: h,
    search: l,
    searchParams: d,
    hash: b
  } = new URL(n);
  s = decodeURIComponent(s), i = decodeURIComponent(
    i
  ), h = decodeURIComponent(h);
  let C = i + ":" + s, B = e ? Object.fromEntries(d.entries()) : l;
  return {
    href: r,
    protocol: t,
    auth: C,
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: h,
    search: l,
    query: B,
    hash: b
  };
}
__name(fr, "fr");
var pr = z(() => {
  "use strict";
  p();
  a(fr, "parse");
});
var ns = I((xl, rs) => {
  "use strict";
  p();
  var Iu = (pr(), N(ts)), dr = (ir(), N(nr));
  function yr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = Iu.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(
      /\%25(\d\d)/g,
      "%$1"
    ) : r, true), t = e.query;
    for (var n in t) Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i = (e.auth || ":").split(":");
    if (t.user = i[0], t.password = i.splice(1).join(":"), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(
        o[0]
      ), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(0) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = dr.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = dr.readFileSync(
      t.sslkey
    ).toString()), t.sslrootcert && (t.ssl.ca = dr.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  __name(yr, "yr");
  a(yr, "parse");
  rs.exports = yr;
  yr.parse = yr;
});
var gt = I((_l, os) => {
  "use strict";
  p();
  var Pu = (es(), N(Xi)), ss = Xe(), is2 = ns().parse, $ = a(
    function(r, e, t) {
      return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || ss[r];
    },
    "val"
  ), Bu = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return ss.ssl;
  }, "readSSLConfigFromEnvironment"), Ue = a(
    function(r) {
      return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    },
    "quoteParamValue"
  ), ne2 = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Ue(n));
  }, "add"), gr = class gr {
    static {
      __name(this, "gr");
    }
    constructor(e) {
      e = typeof e == "string" ? is2(e) : e || {}, e.connectionString && (e = Object.assign({}, e, is2(e.connectionString))), this.user = $("user", e), this.database = $("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(
        $("port", e),
        10
      ), this.host = $("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: $("password", e)
      }), this.binary = $("binary", e), this.options = $("options", e), this.ssl = typeof e.ssl > "u" ? Bu() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = $("client_encoding", e), this.replication = $("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = $("application_name", e, "PGAPPNAME"), this.fallback_application_name = $("fallback_application_name", e, false), this.statement_timeout = $("statement_timeout", e, false), this.lock_timeout = $(
        "lock_timeout",
        e,
        false
      ), this.idle_in_transaction_session_timeout = $("idle_in_transaction_session_timeout", e, false), this.query_timeout = $("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne2(t, this, "user"), ne2(t, this, "password"), ne2(t, this, "port"), ne2(t, this, "application_name"), ne2(t, this, "fallback_application_name"), ne2(t, this, "connect_timeout"), ne2(
        t,
        this,
        "options"
      );
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne2(t, n, "sslmode"), ne2(t, n, "sslca"), ne2(t, n, "sslkey"), ne2(t, n, "sslcert"), ne2(t, n, "sslrootcert"), this.database && t.push("dbname=" + Ue(this.database)), this.replication && t.push("replication=" + Ue(this.replication)), this.host && t.push("host=" + Ue(this.host)), this.isDomainSocket) return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Ue(this.client_encoding)), Pu.lookup(this.host, function(i, s) {
        return i ? e(i, null) : (t.push("hostaddr=" + Ue(s)), e(null, t.join(" ")));
      });
    }
  };
  a(gr, "ConnectionParameters");
  var mr = gr;
  os.exports = mr;
});
var cs = I((Tl, us) => {
  "use strict";
  p();
  var Lu = Je(), as = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, br = class br {
    static {
      __name(this, "br");
    }
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = as.exec(e.text) : t = as.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(t[2], 10), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(
        t[2],
        10
      )));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(e.length), n = 0, i = e.length; n < i; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i = e.length; n < i; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](
          s
        ) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0; t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = Lu.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(br, "Result");
  var wr = br;
  us.exports = wr;
});
var ps = I((Bl, fs) => {
  "use strict";
  p();
  var { EventEmitter: Ru } = we(), hs = cs(), ls = et(), xr = class xr extends Ru {
    static {
      __name(this, "xr");
    }
    constructor(e, t, n) {
      super(), e = ls.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new hs(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new hs(
        this._rowMode,
        this.types
      ), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(e.fields);
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(e), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback) return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError) return this.handleError(
        this._canceledDueToError,
        e
      );
      if (this.callback) try {
        this.callback(null, this._results);
      } catch (t) {
        m.nextTick(() => {
          throw t;
        });
      }
      this.emit("end", this._results);
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string") return new Error("A query must have either text or a name. Supplying neither is unsupported.");
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute(
        { portal: this.portal, rows: t }
      ), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: ls.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe(
        { type: "P", name: this.portal || "" }
      ), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {
    }
  };
  a(xr, "Query");
  var Sr = xr;
  fs.exports = Sr;
});
var ys = {};
ie(ys, { Socket: /* @__PURE__ */ __name(() => _e, "Socket"), isIP: /* @__PURE__ */ __name(() => Fu, "isIP") });
function Fu(r) {
  return 0;
}
__name(Fu, "Fu");
var ds;
var Mu;
var E;
var _e;
var wt = z(() => {
  "use strict";
  p();
  ds = Te(we(), 1);
  a(Fu, "isIP");
  Mu = a((r) => r.replace(
    /^[^.]+\./,
    "api."
  ), "transformHost"), E = class E2 extends ds.EventEmitter {
    static {
      __name(this, "E2");
    }
    constructor() {
      super(...arguments);
      _(this, "opts", {});
      _(this, "connecting", false);
      _(this, "pending", true);
      _(
        this,
        "writable",
        true
      );
      _(this, "encrypted", false);
      _(this, "authorized", false);
      _(this, "destroyed", false);
      _(
        this,
        "ws",
        null
      );
      _(this, "writeBuffer");
      _(this, "tlsState", 0);
      _(this, "tlsRead");
      _(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return E2.opts.poolQueryViaFetch ?? E2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      E2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return E2.opts.fetchEndpoint ?? E2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      E2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return E2.opts.fetchFunction ?? E2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      E2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return E2.opts.webSocketConstructor ?? E2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      E2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? E2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return E2.opts.wsProxy ?? E2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      E2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? E2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return E2.opts.coalesceWrites ?? E2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      E2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? E2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return E2.opts.useSecureWebSocket ?? E2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      E2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? E2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return E2.opts.forceDisablePgSSL ?? E2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      E2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? E2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return E2.opts.disableSNI ?? E2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      E2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? E2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get pipelineConnect() {
      return E2.opts.pipelineConnect ?? E2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      E2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? E2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return E2.opts.subtls ?? E2.defaults.subtls;
    }
    static set subtls(t) {
      E2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? E2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return E2.opts.pipelineTLS ?? E2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      E2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? E2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return E2.opts.rootCerts ?? E2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      E2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? E2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i = this.wsProxy;
      if (i === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i) {
      this.connecting = true, i && this.once("connect", i);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, h = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (l) => {
          this.emit("error", l), this.emit("close");
        }), c.addEventListener("message", (l) => {
          if (this.tlsState === 0) {
            let d = y.from(l.data);
            this.emit(
              "data",
              d
            );
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), h ? s() : c.addEventListener(
          "open",
          s
        );
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let h = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(h), o(this.ws);
        else try {
          this.ws = new WebSocket(
            h
          ), o(this.ws);
        } catch {
          this.ws = new __unstable_WebSocket(h), o(this.ws);
        }
      } catch (c) {
        let l = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(l, { headers: { Upgrade: "websocket" } }).then((d) => {
          if (this.ws = d.webSocket, this.ws == null) throw c;
          this.ws.accept(), o(
            this.ws,
            true
          );
        }).catch((d) => {
          this.emit("error", new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${d.message}`)), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === void 0) throw new Error("For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information.");
      this.tlsState = 1;
      let n = this.subtls.TrustedCert.fromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(
        i
      ), o = this.rawWrite.bind(this), [u, c] = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit(
        "secureConnection",
        this
      ), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t = await this.tlsRead();
        if (t === void 0) break;
        {
          let n = y.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws.send(t);
        return;
      }
      if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(
        () => {
          this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
        },
        0
      );
      else {
        let n = new Uint8Array(this.writeBuffer.length + t.length);
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i = (s) => {
    }) {
      return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = y.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t,
          n,
          i
        );
      }) : (this.tlsWrite(t), i()), true);
    }
    end(t = y.alloc(0), n = "utf8", i = () => {
    }) {
      return this.write(t, n, () => {
        this.ws.close(), i();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(E, "Socket"), _(E, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t) => "https://" + Mu(t) + "/sql", "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false
  }), _(E, "opts", {});
  _e = E;
});
var Yr = I((T) => {
  "use strict";
  p();
  Object.defineProperty(T, "__esModule", { value: true });
  T.NoticeMessage = T.DataRowMessage = T.CommandCompleteMessage = T.ReadyForQueryMessage = T.NotificationResponseMessage = T.BackendKeyDataMessage = T.AuthenticationMD5Password = T.ParameterStatusMessage = T.ParameterDescriptionMessage = T.RowDescriptionMessage = T.Field = T.CopyResponse = T.CopyDataMessage = T.DatabaseError = T.copyDone = T.emptyQuery = T.replicationStart = T.portalSuspended = T.noData = T.closeComplete = T.bindComplete = T.parseComplete = void 0;
  T.parseComplete = { name: "parseComplete", length: 5 };
  T.bindComplete = { name: "bindComplete", length: 5 };
  T.closeComplete = { name: "closeComplete", length: 5 };
  T.noData = { name: "noData", length: 5 };
  T.portalSuspended = { name: "portalSuspended", length: 5 };
  T.replicationStart = { name: "replicationStart", length: 4 };
  T.emptyQuery = { name: "emptyQuery", length: 4 };
  T.copyDone = { name: "copyDone", length: 4 };
  var kr = class kr extends Error {
    static {
      __name(this, "kr");
    }
    constructor(e, t, n) {
      super(
        e
      ), this.length = t, this.name = n;
    }
  };
  a(kr, "DatabaseError");
  var vr = kr;
  T.DatabaseError = vr;
  var Ur = class Ur {
    static {
      __name(this, "Ur");
    }
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Ur, "CopyDataMessage");
  var Er = Ur;
  T.CopyDataMessage = Er;
  var Or = class Or {
    static {
      __name(this, "Or");
    }
    constructor(e, t, n, i) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
    }
  };
  a(Or, "CopyResponse");
  var _r = Or;
  T.CopyResponse = _r;
  var Nr = class Nr {
    static {
      __name(this, "Nr");
    }
    constructor(e, t, n, i, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Nr, "Field");
  var Ar = Nr;
  T.Field = Ar;
  var qr = class qr {
    static {
      __name(this, "qr");
    }
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(
        this.fieldCount
      );
    }
  };
  a(qr, "RowDescriptionMessage");
  var Cr = qr;
  T.RowDescriptionMessage = Cr;
  var Qr = class Qr {
    static {
      __name(this, "Qr");
    }
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(Qr, "ParameterDescriptionMessage");
  var Tr = Qr;
  T.ParameterDescriptionMessage = Tr;
  var Wr = class Wr {
    static {
      __name(this, "Wr");
    }
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(Wr, "ParameterStatusMessage");
  var Ir = Wr;
  T.ParameterStatusMessage = Ir;
  var jr = class jr {
    static {
      __name(this, "jr");
    }
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(jr, "AuthenticationMD5Password");
  var Pr = jr;
  T.AuthenticationMD5Password = Pr;
  var Hr = class Hr {
    static {
      __name(this, "Hr");
    }
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(
    Hr,
    "BackendKeyDataMessage"
  );
  var Br = Hr;
  T.BackendKeyDataMessage = Br;
  var Gr = class Gr {
    static {
      __name(this, "Gr");
    }
    constructor(e, t, n, i) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
    }
  };
  a(Gr, "NotificationResponseMessage");
  var Lr = Gr;
  T.NotificationResponseMessage = Lr;
  var $r = class $r {
    static {
      __name(this, "$r");
    }
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a($r, "ReadyForQueryMessage");
  var Rr = $r;
  T.ReadyForQueryMessage = Rr;
  var Vr = class Vr {
    static {
      __name(this, "Vr");
    }
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(Vr, "CommandCompleteMessage");
  var Fr = Vr;
  T.CommandCompleteMessage = Fr;
  var Kr = class Kr {
    static {
      __name(this, "Kr");
    }
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(Kr, "DataRowMessage");
  var Mr = Kr;
  T.DataRowMessage = Mr;
  var zr = class zr {
    static {
      __name(this, "zr");
    }
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(zr, "NoticeMessage");
  var Dr = zr;
  T.NoticeMessage = Dr;
});
var ms = I((bt) => {
  "use strict";
  p();
  Object.defineProperty(bt, "__esModule", { value: true });
  bt.Writer = void 0;
  var Jr = class Jr {
    static {
      __name(this, "Jr");
    }
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(e);
    }
    ensure(e) {
      var t = this.buffer.length - this.offset;
      if (t < e) {
        var n = this.buffer, i = n.length + (n.length >> 1) + e;
        this.buffer = y.allocUnsafe(
          i
        ), n.copy(this.buffer);
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e) this.ensure(1);
      else {
        var t = y.byteLength(e);
        this.ensure(t + 1), this.buffer.write(
          e,
          this.offset,
          "utf-8"
        ), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      var t = y.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(e.length), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      var t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(this.size), t;
    }
  };
  a(Jr, "Writer");
  var Zr = Jr;
  bt.Writer = Zr;
});
var ws = I((xt) => {
  "use strict";
  p();
  Object.defineProperty(xt, "__esModule", { value: true });
  xt.serialize = void 0;
  var Xr = ms(), M = new Xr.Writer(), Du = a((r) => {
    M.addInt16(3).addInt16(
      0
    );
    for (let n of Object.keys(r)) M.addCString(n).addCString(r[n]);
    M.addCString("client_encoding").addCString("UTF8");
    var e = M.addCString("").flush(), t = e.length + 4;
    return new Xr.Writer().addInt32(t).add(e).flush();
  }, "startup"), ku = a(() => {
    let r = y.allocUnsafe(8);
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), Uu = a((r) => M.addCString(r).flush(112), "password"), Ou = a(function(r, e) {
    return M.addCString(r).addInt32(
      y.byteLength(e)
    ).addString(e), M.flush(112);
  }, "sendSASLInitialResponseMessage"), Nu = a(
    function(r) {
      return M.addString(r).flush(112);
    },
    "sendSCRAMClientFinalMessage"
  ), qu = a(
    (r) => M.addCString(r).flush(81),
    "query"
  ), gs = [], Qu = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || gs;
    for (var n = t.length, i = M.addCString(e).addCString(r.text).addInt16(n), s = 0; s < n; s++) i.addInt32(t[s]);
    return M.flush(80);
  }, "parse"), Oe = new Xr.Writer(), Wu = a(function(r, e) {
    for (let t = 0; t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (M.addInt16(0), Oe.addInt32(-1)) : n instanceof y ? (M.addInt16(1), Oe.addInt32(n.length), Oe.add(n)) : (M.addInt16(0), Oe.addInt32(y.byteLength(
        n
      )), Oe.addString(n));
    }
  }, "writeValues"), ju = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || gs, s = i.length;
    return M.addCString(e).addCString(t), M.addInt16(s), Wu(i, r.valueMapper), M.addInt16(s), M.add(Oe.flush()), M.addInt16(n ? 1 : 0), M.flush(66);
  }, "bind"), Hu = y.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Gu = a((r) => {
    if (!r || !r.portal && !r.rows) return Hu;
    let e = r.portal || "", t = r.rows || 0, n = y.byteLength(e), i = 4 + n + 1 + 4, s = y.allocUnsafe(1 + i);
    return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), $u = a((r, e) => {
    let t = y.allocUnsafe(16);
    return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(5678, 6), t.writeInt32BE(
      r,
      8
    ), t.writeInt32BE(e, 12), t;
  }, "cancel"), en = a(
    (r, e) => {
      let n = 4 + y.byteLength(e) + 1, i = y.allocUnsafe(1 + n);
      return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
    },
    "cstringMessage"
  ), Vu = M.addCString("P").flush(68), Ku = M.addCString("S").flush(68), zu = a((r) => r.name ? en(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Vu : Ku, "describe"), Yu = a(
    (r) => {
      let e = `${r.type}${r.name || ""}`;
      return en(67, e);
    },
    "close"
  ), Zu = a((r) => M.add(r).flush(
    100
  ), "copyData"), Ju = a((r) => en(102, r), "copyFail"), St = a((r) => y.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Xu = St(72), ec = St(83), tc = St(88), rc = St(99), nc = {
    startup: Du,
    password: Uu,
    requestSsl: ku,
    sendSASLInitialResponseMessage: Ou,
    sendSCRAMClientFinalMessage: Nu,
    query: qu,
    parse: Qu,
    bind: ju,
    execute: Gu,
    describe: zu,
    close: Yu,
    flush: a(() => Xu, "flush"),
    sync: a(
      () => ec,
      "sync"
    ),
    end: a(() => tc, "end"),
    copyData: Zu,
    copyDone: a(() => rc, "copyDone"),
    copyFail: Ju,
    cancel: $u
  };
  xt.serialize = nc;
});
var bs = I((vt) => {
  "use strict";
  p();
  Object.defineProperty(vt, "__esModule", { value: true });
  vt.BufferReader = void 0;
  var ic = y.allocUnsafe(0), rn = class rn {
    static {
      __name(this, "rn");
    }
    constructor(e = 0) {
      this.offset = e, this.buffer = ic, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (; this.buffer[t++] !== 0; ) ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(rn, "BufferReader");
  var tn = rn;
  vt.BufferReader = tn;
});
var vs = I((Et) => {
  "use strict";
  p();
  Object.defineProperty(Et, "__esModule", { value: true });
  Et.Parser = void 0;
  var D = Yr(), sc = bs(), nn = 1, oc = 4, Ss = nn + oc, xs = y.allocUnsafe(0), on = class on {
    static {
      __name(this, "on");
    }
    constructor(e) {
      if (this.buffer = xs, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new sc.BufferReader(), e?.mode === "binary") throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
      for (; i + Ss <= n; ) {
        let s = this.buffer[i], o = this.buffer.readUInt32BE(
          i + nn
        ), u = nn + o;
        if (u + i <= n) {
          let c = this.handlePacket(i + Ss, s, o, this.buffer);
          t(c), i += u;
        } else
          break;
      }
      i === n ? (this.buffer = xs, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (; t >= s; ) s *= 2;
            i = y.allocUnsafe(s);
          }
          this.buffer.copy(
            i,
            0,
            this.bufferOffset,
            this.bufferOffset + this.bufferLength
          ), this.buffer = i, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i) {
      switch (t) {
        case 50:
          return D.bindComplete;
        case 49:
          return D.parseComplete;
        case 51:
          return D.closeComplete;
        case 110:
          return D.noData;
        case 115:
          return D.portalSuspended;
        case 99:
          return D.copyDone;
        case 87:
          return D.replicationStart;
        case 73:
          return D.emptyQuery;
        case 68:
          return this.parseDataRowMessage(
            e,
            n,
            i
          );
        case 67:
          return this.parseCommandCompleteMessage(e, n, i);
        case 90:
          return this.parseReadyForQueryMessage(e, n, i);
        case 65:
          return this.parseNotificationMessage(
            e,
            n,
            i
          );
        case 82:
          return this.parseAuthenticationResponse(e, n, i);
        case 83:
          return this.parseParameterStatusMessage(e, n, i);
        case 75:
          return this.parseBackendKeyData(e, n, i);
        case 69:
          return this.parseErrorMessage(e, n, i, "error");
        case 78:
          return this.parseErrorMessage(
            e,
            n,
            i,
            "notice"
          );
        case 84:
          return this.parseRowDescriptionMessage(e, n, i);
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i);
        case 71:
          return this.parseCopyInMessage(
            e,
            n,
            i
          );
        case 72:
          return this.parseCopyOutMessage(e, n, i);
        case 100:
          return this.parseCopyData(
            e,
            n,
            i
          );
        default:
          return new D.DatabaseError("received invalid response: " + t.toString(
            16
          ), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.string(1);
      return new D.ReadyForQueryMessage(t, i);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring();
      return new D.CommandCompleteMessage(
        t,
        i
      );
    }
    parseCopyData(e, t, n) {
      let i = n.slice(e, e + (t - 4));
      return new D.CopyDataMessage(
        t,
        i
      );
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyInResponse");
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new D.CopyResponse(t, i, s, o);
      for (let c = 0; c < o; c++) u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new D.NotificationResponseMessage(t, i, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new D.RowDescriptionMessage(t, i);
      for (let o = 0; o < i; o++) s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.int32(), n = this.reader.int16(), i = this.reader.int32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new D.Field(e, t, n, i, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int16(), s = new D.ParameterDescriptionMessage(t, i);
      for (let o = 0; o < i; o++) s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new Array(i);
      for (let o = 0; o < i; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new D.DataRowMessage(
        t,
        s
      );
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring(), s = this.reader.cstring();
      return new D.ParameterStatusMessage(t, i, s);
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.int32();
      return new D.BackendKeyDataMessage(t, i, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let u = this.reader.bytes(4);
            return new D.AuthenticationMD5Password(t, u);
          }
          break;
        case 10:
          s.name = "authenticationSASL", s.mechanisms = [];
          let o;
          do
            o = this.reader.cstring(), o && s.mechanisms.push(o);
          while (o);
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (; o !== "\0"; ) s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i === "notice" ? new D.NoticeMessage(
        t,
        u
      ) : new D.DatabaseError(u, t, i);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(on, "Parser");
  var sn = on;
  Et.Parser = sn;
});
var an = I((Se) => {
  "use strict";
  p();
  Object.defineProperty(Se, "__esModule", { value: true });
  Se.DatabaseError = Se.serialize = Se.parse = void 0;
  var ac = Yr();
  Object.defineProperty(
    Se,
    "DatabaseError",
    { enumerable: true, get: a(function() {
      return ac.DatabaseError;
    }, "get") }
  );
  var uc = ws();
  Object.defineProperty(Se, "serialize", { enumerable: true, get: a(function() {
    return uc.serialize;
  }, "get") });
  var cc = vs();
  function hc(r, e) {
    let t = new cc.Parser();
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  __name(hc, "hc");
  a(hc, "parse");
  Se.parse = hc;
});
var Es = {};
ie(Es, { connect: /* @__PURE__ */ __name(() => lc, "connect") });
function lc({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
__name(lc, "lc");
var _s = z(() => {
  "use strict";
  p();
  a(lc, "connect");
});
var hn = I((tf, Ts) => {
  "use strict";
  p();
  var As = (wt(), N(ys)), fc = we().EventEmitter, {
    parse: pc,
    serialize: Q
  } = an(), Cs = Q.flush(), dc = Q.sync(), yc = Q.end(), cn = class cn extends fc {
    static {
      __name(this, "cn");
    }
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new As.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(
        e,
        t
      ), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(
          true,
          n._keepAliveInitialDelayMillis
        ), n.emit("connect");
      });
      let i = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl) return this.attachListeners(this.stream);
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (_s(), N(Es));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(
          c,
          n.ssl
        ), "key" in n.ssl && (c.key = n.ssl.key)), As.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (h) {
          return n.emit("error", h);
        }
        n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on("end", () => {
        this.emit("end");
      }), pc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(
        e,
        t
      ));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(e));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(
        e
      ));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Cs);
    }
    sync() {
      this._ending = true, this._send(Cs), this._send(dc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(yc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(cn, "Connection");
  var un = cn;
  Ts.exports = un;
});
var Bs = I((of, Ps) => {
  "use strict";
  p();
  var mc = we().EventEmitter, sf = (He(), N(je)), gc = et(), ln = qi(), wc = Zi(), bc = mt(), Sc = gt(), Is = ps(), xc = Xe(), vc = hn(), fn = class fn extends mc {
    static {
      __name(this, "fn");
    }
    constructor(e) {
      super(), this.connectionParameters = new Sc(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || S.Promise, this._types = new bc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new vc({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || xc.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a(
        (n) => {
          m.nextTick(() => {
            n.handleError(e, this.connection);
          });
        },
        "enqueueError"
      );
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(() => {
          e(i);
        });
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(n), n.once("end", () => {
        let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(
          i
        )), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i) => {
          i ? n(i) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on(
        "errorMessage",
        this._handleErrorMessage.bind(this)
      ), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(this)), e.on(
        "emptyQuery",
        this._handleEmptyQuery.bind(this)
      ), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(
        () => this.password()
      ).then((n) => {
        if (n !== void 0) {
          if (typeof n != "string") {
            t.emit("error", new TypeError("Password must be a string"));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : wc(
        this.connectionParameters,
        (n) => {
          n !== void 0 && (this.connectionParameters.password = this.password = n), e();
        }
      );
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(() => {
        let t = gc.postgresMd5PasswordHash(
          this.user,
          this.password,
          e.salt
        );
        this.connection.password(t);
      });
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = ln.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e) {
      ln.continueSession(this.saslSession, this.password, e.data), this.connection.sendSCRAMClientFinalMessage(
        this.saslSession.response
      );
    }
    _handleAuthSASLFinal(e) {
      ln.finalizeSession(
        this.saslSession,
        e.data
      ), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting)
        return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(
          e
        );
        return;
      }
      this.activeQuery = null, t.handleError(e, this.connection);
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(
        e
      );
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(
        this.connection
      );
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(e, this.connection);
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(
        e.statement_timeout,
        10
      ))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(
        e.idle_in_transaction_session_timeout,
        10
      ))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(
            e.processID,
            e.secretKey
          );
        });
      } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(
        /"/g,
        '""'
      ) + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i = 0; i < e.length; i++) {
        var s = e[i];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
        this.readyForQuery = false, this.hasExecuted = true;
        let e = this.activeQuery.submit(this.connection);
        e && m.nextTick(() => {
          this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
        });
      } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i, s, o, u, c;
      if (e == null) throw new TypeError("Client was passed a null or undefined query");
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Is(
        e,
        t,
        n
      ), i.callback || (s = new this._Promise((h, l) => {
        i.callback = (d, b) => d ? l(d) : h(b);
      }))), o && (c = i.callback, u = setTimeout(() => {
        var h = new Error("Query read timeout");
        m.nextTick(
          () => {
            i.handleError(h, this.connection);
          }
        ), c(h), i.callback = () => {
        };
        var l = this.queryQueue.indexOf(i);
        l > -1 && this.queryQueue.splice(l, 1), this._pulseQueryQueue();
      }, o), i.callback = (h, l) => {
        clearTimeout(u), c(h, l);
      }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i.handleError(
          new Error("Client was closed and is not queryable"),
          this.connection
        );
      }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(
        () => {
          i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
        }
      ), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting) if (e) e();
      else return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
      else return new this._Promise((t) => {
        this.connection.once("end", t);
      });
    }
  };
  a(fn, "Client");
  var _t = fn;
  _t.Query = Is;
  Ps.exports = _t;
});
var Ms = I((cf, Fs) => {
  "use strict";
  p();
  var Ec = we().EventEmitter, Ls = a(function() {
  }, "NOOP"), Rs = a(
    (r, e) => {
      let t = r.findIndex(e);
      return t === -1 ? void 0 : r.splice(t, 1)[0];
    },
    "removeWhere"
  ), yn = class yn {
    static {
      __name(this, "yn");
    }
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(yn, "IdleItem");
  var pn = yn, mn = class mn {
    static {
      __name(this, "mn");
    }
    constructor(e) {
      this.callback = e;
    }
  };
  a(mn, "PendingItem");
  var Ne = mn;
  function _c() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  __name(_c, "_c");
  a(_c, "throwOnDoubleRelease");
  function At(r, e) {
    if (e) return { callback: e, result: void 0 };
    let t, n, i = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(
        o
      ), o;
    });
    return { callback: i, result: s };
  }
  __name(At, "At");
  a(At, "promisify");
  function Ac(r, e) {
    return a(
      /* @__PURE__ */ __name(function t(n) {
        n.client = e, e.removeListener("error", t), e.on("error", () => {
          r.log("additional client error after disconnection due to error", n);
        }), r._remove(e), r.emit("error", n, e);
      }, "t"),
      "idleListener"
    );
  }
  __name(Ac, "Ac");
  a(Ac, "makeIdleListener");
  var gn = class gn extends Ec {
    static {
      __name(this, "gn");
    }
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(
        this.options,
        "password",
        { configurable: true, enumerable: false, writable: true, value: e.password }
      ), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t || Ct().Client, this.Promise = this.options.Promise || S.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log(
          "pulse queue on ending"
        ), this._idle.length && this._idle.slice().map((t) => {
          this._remove(
            t.client
          );
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(t.timeoutId);
        let n = t.client;
        n.ref && n.ref();
        let i = t.idleListener;
        return this._acquireClient(n, e, i, false);
      }
      if (!this._isFull()) return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = Rs(this._idle, (n) => n.client === e);
      t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter((n) => n !== e), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i) : this.Promise.reject(
          i
        );
      }
      let t = At(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis)
          return this._pendingQueue.push(new Ne(t.callback)), n;
        let i = a((u, c, h) => {
          clearTimeout(
            o
          ), t.callback(u, c, h);
        }, "queueCallback"), s = new Ne(i), o = setTimeout(() => {
          Rs(
            this._pendingQueue,
            (u) => u.callback === i
          ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return this._pendingQueue.push(s), n;
      }
      return this.newClient(new Ne(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(t);
      let n = Ac(this, t);
      this.log("checking client timeout");
      let i, s = false;
      this.options.connectionTimeoutMillis && (i = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i && clearTimeout(i), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o.message = "Connection terminated due to connection timeout"), this._pulseQueue(), e.timedOut || e.callback(
          o,
          void 0,
          Ls
        );
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((h) => h.client === t) !== -1 && this._acquireClient(
                t,
                new Ne((h, l, d) => d()),
                n,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u.unref(), t.once(
              "end",
              () => clearTimeout(u)
            );
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i) {
      i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(
        e,
        e.release
      ) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
        if (s) return e.release(s), t.callback(s, void 0, Ls);
        t.callback(void 0, e, e.release);
      }) : t.callback(
        void 0,
        e,
        e.release
      );
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i) => {
        n && _c(), n = true, this._release(
          e,
          t,
          i
        );
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new pn(e, t, s)), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = At(this.Promise, e);
        return x(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = void 0);
      let i = At(this.Promise, n);
      return n = i.callback, this.connect((s, o) => {
        if (s)
          return n(s);
        let u = false, c = a((h) => {
          u || (u = true, o.release(h), n(h));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (h, l) => {
            if (this.log("query dispatched"), o.removeListener("error", c), !u) return u = true, o.release(h), h ? n(h) : n(
              void 0,
              l
            );
          });
        } catch (h) {
          return o.release(h), n(h);
        }
      }), i.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = At(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(gn, "Pool");
  var dn = gn;
  Fs.exports = dn;
});
var Ds = {};
ie(Ds, { default: /* @__PURE__ */ __name(() => Cc, "default") });
var Cc;
var ks = z(() => {
  "use strict";
  p();
  Cc = {};
});
var Us = I((pf, Tc) => {
  Tc.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: {
    "buffer-writer": "2.0.0",
    "packet-reader": "1.0.0",
    "pg-connection-string": "^2.5.0",
    "pg-pool": "^3.5.2",
    "pg-protocol": "^1.5.0",
    "pg-types": "^2.1.0",
    pgpass: "1.x"
  }, devDependencies: { async: "2.6.4", bluebird: "3.5.2", co: "4.6.0", "pg-copy-streams": "0.3.0" }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: {
    "pg-native": { optional: true }
  }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var qs = I((df, Ns) => {
  "use strict";
  p();
  var Os = we().EventEmitter, Ic = (He(), N(je)), wn = et(), qe = Ns.exports = function(r, e, t) {
    Os.call(this), r = wn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  Ic.inherits(
    qe,
    Os
  );
  var Pc = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  qe.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e) for (var t in e) {
      var n = Pc[t] || t;
      r[n] = e[t];
    }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  qe.prototype.then = function(r, e) {
    return this._getPromise().then(r, e);
  };
  qe.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  qe.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once(
        "error",
        e
      );
    }.bind(this)), this._promise);
  };
  qe.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(
      function(s, o, u) {
        if (r.native.arrayMode = false, x(function() {
          e.emit("_done");
        }), s) return e.handleError(s);
        e._emitRowEvents && (u.length > 1 ? o.forEach((c, h) => {
          c.forEach((l) => {
            e.emit(
              "row",
              l,
              u[h]
            );
          });
        }) : o.forEach(function(c) {
          e.emit("row", c, u);
        })), e.state = "end", e.emit(
          "end",
          u
        ), e.callback && e.callback(null, u);
      },
      "after"
    );
    if (m.domain && (t = m.domain.bind(
      t
    )), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error(
        "You supplied %s (%s)",
        this.name,
        this.name.length
      ), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(wn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(
        this.name,
        this.text,
        n.length,
        function(s) {
          return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
        }
      );
    } else if (this.values) {
      if (!Array.isArray(this.values)) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i = this.values.map(wn.prepareValue);
      r.native.query(this.text, i, t);
    } else r.native.query(this.text, t);
  };
});
var Hs = I((wf, js) => {
  "use strict";
  p();
  var Bc = (ks(), N(Ds)), Lc = mt(), gf = Us(), Qs = we().EventEmitter, Rc = (He(), N(je)), Fc = gt(), Ws = qs(), J = js.exports = function(r) {
    Qs.call(this), r = r || {}, this._Promise = r.Promise || S.Promise, this._types = new Lc(r.types), this.native = new Bc({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new Fc(
      r
    );
    this.user = e.user, Object.defineProperty(this, "password", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: e.password
    }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  J.Query = Ws;
  Rc.inherits(J, Qs);
  J.prototype._errorAllQueries = function(r) {
    let e = a(
      (t) => {
        m.nextTick(() => {
          t.native = this.native, t.handleError(r);
        });
      },
      "enqueueError"
    );
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  J.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t) return r(
        t
      );
      e.native.connect(n, function(i) {
        if (i) return e.native.end(), r(i);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  J.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise(
      (e, t) => {
        this._connect((n) => {
          n ? t(n) : e();
        });
      }
    );
  };
  J.prototype.query = function(r, e, t) {
    var n, i, s, o, u;
    if (r == null) throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new Ws(r, e, t), !n.callback) {
      let c, h;
      i = new this._Promise((l, d) => {
        c = l, h = d;
      }), n.callback = (l, d) => l ? h(l) : c(d);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error("Query read timeout");
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {
      };
      var h = this._queryQueue.indexOf(n);
      h > -1 && this._queryQueue.splice(h, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, h) => {
      clearTimeout(o), u(c, h);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i) : (this._queryQueue.push(
      n
    ), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client has encountered a connection error and is not queryable")
      );
    }), i);
  };
  J.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once(
      "connect",
      this.end.bind(this, r)
    );
    var t;
    return r || (t = new this._Promise(function(n, i) {
      r = a((s) => s ? i(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error(
        "Connection terminated"
      )), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  J.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  J.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once(
        "_done",
        function() {
          t._pulseQueryQueue();
        }
      );
    }
  };
  J.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  J.prototype.ref = function() {
  };
  J.prototype.unref = function() {
  };
  J.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(r, e, t);
  };
  J.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var bn = I((xf, Gs) => {
  "use strict";
  p();
  Gs.exports = Hs();
});
var Ct = I((Ef, rt) => {
  "use strict";
  p();
  var Mc = Bs(), Dc = Xe(), kc = hn(), Uc = Ms(), { DatabaseError: Oc } = an(), Nc = a((r) => {
    var e;
    return e = class extends Uc {
      static {
        __name(this, "e");
      }
      constructor(n) {
        super(n, r);
      }
    }, a(e, "BoundPool"), e;
  }, "poolFactory"), Sn = a(function(r) {
    this.defaults = Dc, this.Client = r, this.Query = this.Client.Query, this.Pool = Nc(this.Client), this._pools = [], this.Connection = kc, this.types = Je(), this.DatabaseError = Oc;
  }, "PG");
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? rt.exports = new Sn(bn()) : (rt.exports = new Sn(Mc), Object.defineProperty(rt.exports, "native", { configurable: true, enumerable: false, get() {
    var r = null;
    try {
      r = new Sn(bn());
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") throw e;
    }
    return Object.defineProperty(rt.exports, "native", { value: r }), r;
  } }));
});
p();
var Tt = Te(Ct());
wt();
p();
pr();
wt();
var Ks = Te(et());
var zs = Te(mt());
var xn = class xn2 extends Error {
  static {
    __name(this, "xn2");
  }
  constructor() {
    super(...arguments);
    _(this, "name", "NeonDbError");
    _(this, "severity");
    _(this, "code");
    _(this, "detail");
    _(this, "hint");
    _(
      this,
      "position"
    );
    _(this, "internalPosition");
    _(this, "internalQuery");
    _(this, "where");
    _(this, "schema");
    _(this, "table");
    _(this, "column");
    _(this, "dataType");
    _(
      this,
      "constraint"
    );
    _(this, "file");
    _(this, "line");
    _(this, "routine");
    _(this, "sourceError");
  }
};
a(xn, "NeonDbError");
var Ae = xn;
var $s = "transaction() expects an array of queries, or a function returning an array of queries";
var qc = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Ys(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i,
  readOnly: s,
  deferrable: o,
  queryCallback: u,
  resultCallback: c
} = {}) {
  if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let h;
  try {
    h = fr(r);
  } catch {
    throw new Error("Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r));
  }
  let {
    protocol: l,
    username: d,
    password: b,
    hostname: C,
    port: B,
    pathname: W
  } = h;
  if (l !== "postgres:" && l !== "postgresql:" || !d || !b || !C || !W) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function X(A, ...w) {
    let P, V;
    if (typeof A == "string") P = A, V = w[1], w = w[0] ?? [];
    else {
      P = "";
      for (let j = 0; j < A.length; j++)
        P += A[j], j < w.length && (P += "$" + (j + 1));
    }
    w = w.map((j) => (0, Ks.prepareValue)(j));
    let k = {
      query: P,
      params: w
    };
    return u && u(k), Qc(de, k, V);
  }
  __name(X, "X");
  a(X, "resolve"), X.transaction = async (A, w) => {
    if (typeof A == "function" && (A = A(X)), !Array.isArray(A)) throw new Error($s);
    A.forEach((k) => {
      if (k[Symbol.toStringTag] !== "NeonQueryPromise") throw new Error($s);
    });
    let P = A.map((k) => k.parameterizedQuery), V = A.map((k) => k.opts ?? {});
    return de(P, V, w);
  };
  async function de(A, w, P) {
    let {
      fetchEndpoint: V,
      fetchFunction: k
    } = _e, j = typeof V == "function" ? V(C, B) : V, ce = Array.isArray(A) ? { queries: A } : A, ee = n ?? {}, R = e ?? false, G = t ?? false, he = i, ye = s, xe = o;
    P !== void 0 && (P.fetchOptions !== void 0 && (ee = { ...ee, ...P.fetchOptions }), P.arrayMode !== void 0 && (R = P.arrayMode), P.fullResults !== void 0 && (G = P.fullResults), P.isolationLevel !== void 0 && (he = P.isolationLevel), P.readOnly !== void 0 && (ye = P.readOnly), P.deferrable !== void 0 && (xe = P.deferrable)), w !== void 0 && !Array.isArray(w) && w.fetchOptions !== void 0 && (ee = { ...ee, ...w.fetchOptions });
    let me = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" };
    Array.isArray(A) && (he !== void 0 && (me["Neon-Batch-Isolation-Level"] = he), ye !== void 0 && (me["Neon-Batch-Read-Only"] = String(ye)), xe !== void 0 && (me["Neon-Batch-Deferrable"] = String(
      xe
    )));
    let se;
    try {
      se = await (k ?? fetch)(j, {
        method: "POST",
        body: JSON.stringify(ce),
        headers: me,
        ...ee
      });
    } catch (oe) {
      let U = new Ae(`Error connecting to database: ${oe.message}`);
      throw U.sourceError = oe, U;
    }
    if (se.ok) {
      let oe = await se.json();
      if (Array.isArray(A)) {
        let U = oe.results;
        if (!Array.isArray(U)) throw new Ae("Neon internal error: unexpected result format");
        return U.map((K, le) => {
          let It = w[le] ?? {}, Xs = It.arrayMode ?? R, eo = It.fullResults ?? G;
          return Vs(K, {
            arrayMode: Xs,
            fullResults: eo,
            parameterizedQuery: A[le],
            resultCallback: c,
            types: It.types
          });
        });
      } else {
        let U = w ?? {}, K = U.arrayMode ?? R, le = U.fullResults ?? G;
        return Vs(
          oe,
          { arrayMode: K, fullResults: le, parameterizedQuery: A, resultCallback: c, types: U.types }
        );
      }
    } else {
      let { status: oe } = se;
      if (oe === 400) {
        let U = await se.json(), K = new Ae(U.message);
        for (let le of qc)
          K[le] = U[le] ?? void 0;
        throw K;
      } else {
        let U = await se.text();
        throw new Ae(`Server error (HTTP status ${oe}): ${U}`);
      }
    }
  }
  __name(de, "de");
  return a(de, "execute"), X;
}
__name(Ys, "Ys");
a(Ys, "neon");
function Qc(r, e, t) {
  return { [Symbol.toStringTag]: "NeonQueryPromise", parameterizedQuery: e, opts: t, then: a(
    (n, i) => r(e, t).then(n, i),
    "then"
  ), catch: a((n) => r(e, t).catch(n), "catch"), finally: a((n) => r(
    e,
    t
  ).finally(n), "finally") };
}
__name(Qc, "Qc");
a(Qc, "createNeonQueryPromise");
function Vs(r, {
  arrayMode: e,
  fullResults: t,
  parameterizedQuery: n,
  resultCallback: i,
  types: s
}) {
  let o = new zs.default(
    s
  ), u = r.fields.map((l) => l.name), c = r.fields.map((l) => o.getTypeParser(l.dataTypeID)), h = e === true ? r.rows.map((l) => l.map((d, b) => d === null ? null : c[b](d))) : r.rows.map((l) => Object.fromEntries(
    l.map((d, b) => [u[b], d === null ? null : c[b](d)])
  ));
  return i && i(n, r, h, { arrayMode: e, fullResults: t }), t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = h, r._parsers = c, r._types = o, r) : h;
}
__name(Vs, "Vs");
a(Vs, "processQueryResult");
var Js = Te(gt());
var Qe = Te(Ct());
var En = class En2 extends Tt.Client {
  static {
    __name(this, "En2");
  }
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i = this.config?.host !== void 0 || this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
    if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect) return o;
    let h = this.connection;
    if (u && h.on("connect", () => h.stream.emit("data", "S")), c) {
      h.removeAllListeners(
        "authenticationCleartextPassword"
      ), h.removeAllListeners("readyForQuery"), h.once(
        "readyForQuery",
        () => h.on("readyForQuery", this._handleReadyForQuery.bind(this))
      );
      let l = this.ssl ? "sslconnect" : "connect";
      h.on(l, () => {
        this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    let n = this.saslSession, i = this.password, s = t.data;
    if (n.message !== "SASLInitialResponse" || typeof i != "string" || typeof s != "string") throw new Error("SASL: protocol error");
    let o = Object.fromEntries(s.split(",").map((U) => {
      if (!/^.=/.test(U)) throw new Error("SASL: Invalid attribute pair entry");
      let K = U[0], le = U.substring(2);
      return [K, le];
    })), u = o.r, c = o.s, h = o.i;
    if (!u || !/^[!-+--~]+$/.test(u)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!c || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64");
    if (!h || !/^[1-9][0-9]*$/.test(h)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count");
    if (!u.startsWith(n.clientNonce)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce"
    );
    if (u.length === n.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let l = parseInt(h, 10), d = y.from(c, "base64"), b = new TextEncoder(), C = b.encode(i), B = await g.subtle.importKey("raw", C, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]), W = new Uint8Array(await g.subtle.sign("HMAC", B, y.concat([d, y.from(
      [0, 0, 0, 1]
    )]))), X = W;
    for (var de = 0; de < l - 1; de++) W = new Uint8Array(await g.subtle.sign(
      "HMAC",
      B,
      W
    )), X = y.from(X.map((U, K) => X[K] ^ W[K]));
    let A = X, w = await g.subtle.importKey(
      "raw",
      A,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), P = new Uint8Array(await g.subtle.sign("HMAC", w, b.encode("Client Key"))), V = await g.subtle.digest(
      "SHA-256",
      P
    ), k = "n=*,r=" + n.clientNonce, j = "r=" + u + ",s=" + c + ",i=" + l, ce = "c=biws,r=" + u, ee = k + "," + j + "," + ce, R = await g.subtle.importKey(
      "raw",
      V,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var G = new Uint8Array(await g.subtle.sign("HMAC", R, b.encode(ee))), he = y.from(P.map((U, K) => P[K] ^ G[K])), ye = he.toString("base64");
    let xe = await g.subtle.importKey(
      "raw",
      A,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), me = await g.subtle.sign(
      "HMAC",
      xe,
      b.encode("Server Key")
    ), se = await g.subtle.importKey("raw", me, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var oe = y.from(await g.subtle.sign(
      "HMAC",
      se,
      b.encode(ee)
    ));
    n.message = "SASLResponse", n.serverSignature = oe.toString("base64"), n.response = ce + ",p=" + ye, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(En, "NeonClient");
var vn = En;
function Wc(r, e) {
  if (e) return {
    callback: e,
    result: void 0
  };
  let t, n, i = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i, result: s };
}
__name(Wc, "Wc");
a(Wc, "promisify");
var _n = class _n2 extends Tt.Pool {
  static {
    __name(this, "_n2");
  }
  constructor() {
    super(...arguments);
    _(this, "Client", vn);
    _(this, "hasFetchUnsupportedListeners", false);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i) {
    if (!_e.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function")
      return super.query(t, n, i);
    typeof n == "function" && (i = n, n = void 0);
    let s = Wc(
      this.Promise,
      i
    );
    i = s.callback;
    try {
      let o = new Js.default(this.options), u = encodeURIComponent, c = encodeURI, h = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, l = typeof t == "string" ? t : t.text, d = n ?? t.values ?? [];
      Ys(h, { fullResults: true, arrayMode: t.rowMode === "array" })(l, d, { types: t.types ?? this.options?.types }).then((C) => i(void 0, C)).catch((C) => i(
        C
      ));
    } catch (o) {
      i(o);
    }
    return s.result;
  }
};
a(_n, "NeonPool");
var export_ClientBase = Qe.ClientBase;
var export_Connection = Qe.Connection;
var export_DatabaseError = Qe.DatabaseError;
var export_Query = Qe.Query;
var export_defaults = Qe.defaults;
var export_types = Qe.types;
var entityKind = /* @__PURE__ */ Symbol.for("drizzle:entityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}
__name(is, "is");
var ConsoleLogWriter = class {
  static {
    __name(this, "ConsoleLogWriter");
  }
  static [entityKind] = "ConsoleLogWriter";
  write(message) {
    console.log(message);
  }
};
var DefaultLogger = class {
  static {
    __name(this, "DefaultLogger");
  }
  static [entityKind] = "DefaultLogger";
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p2) => {
      try {
        return JSON.stringify(p2);
      } catch {
        return String(p2);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
var NoopLogger = class {
  static {
    __name(this, "NoopLogger");
  }
  static [entityKind] = "NoopLogger";
  logQuery() {
  }
};
var QueryPromise = class {
  static {
    __name(this, "QueryPromise");
  }
  static [entityKind] = "QueryPromise";
  [Symbol.toStringTag] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};
var Column = class {
  static {
    __name(this, "Column");
  }
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};
var ColumnBuilder = class {
  static {
    __name(this, "ColumnBuilder");
  }
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "") return;
    this.config.name = name;
  }
};
var TableName = /* @__PURE__ */ Symbol.for("drizzle:Name");
var ForeignKeyBuilder = class {
  static {
    __name(this, "ForeignKeyBuilder");
  }
  static [entityKind] = "PgForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
var ForeignKey = class {
  static {
    __name(this, "ForeignKey");
  }
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "PgForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};
function iife(fn, ...args) {
  return fn(...args);
}
__name(iife, "iife");
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
__name(uniqueKeyName, "uniqueKeyName");
var UniqueConstraintBuilder = class {
  static {
    __name(this, "UniqueConstraintBuilder");
  }
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "PgUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
var UniqueOnConstraintBuilder = class {
  static {
    __name(this, "UniqueOnConstraintBuilder");
  }
  static [entityKind] = "PgUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
var UniqueConstraint = class {
  static {
    __name(this, "UniqueConstraint");
  }
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  static [entityKind] = "PgUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
__name(parsePgArrayValue, "parsePgArrayValue");
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
__name(parsePgNestedArray, "parsePgNestedArray");
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
__name(parsePgArray, "parsePgArray");
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}
__name(makePgArray, "makePgArray");
var PgColumnBuilder = class extends ColumnBuilder {
  static {
    __name(this, "PgColumnBuilder");
  }
  foreignKeyConfigs = [];
  static [entityKind] = "PgColumnBuilder";
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
var PgColumn = class extends Column {
  static {
    __name(this, "PgColumn");
  }
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "PgColumn";
};
var ExtraConfigColumn = class extends PgColumn {
  static {
    __name(this, "ExtraConfigColumn");
  }
  static [entityKind] = "ExtraConfigColumn";
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
var IndexedColumn = class {
  static {
    __name(this, "IndexedColumn");
  }
  static [entityKind] = "IndexedColumn";
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
var PgArrayBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgArrayBuilder");
  }
  static [entityKind] = "PgArrayBuilder";
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
var PgArray = class _PgArray extends PgColumn {
  static {
    __name(this, "_PgArray");
  }
  constructor(table, config, baseColumn, range) {
    super(table, config);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  size;
  static [entityKind] = "PgArray";
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v2) => this.baseColumn.mapFromDriverValue(v2));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a2 = value.map(
      (v2) => v2 === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v2, true) : this.baseColumn.mapToDriverValue(v2)
    );
    if (isNestedArray) return a2;
    return makePgArray(a2);
  }
};
var PgEnumObjectColumnBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgEnumObjectColumnBuilder");
  }
  static [entityKind] = "PgEnumObjectColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumObjectColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumObjectColumn(
      table,
      this.config
    );
  }
};
var PgEnumObjectColumn = class extends PgColumn {
  static {
    __name(this, "PgEnumObjectColumn");
  }
  static [entityKind] = "PgEnumObjectColumn";
  enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
var isPgEnumSym = /* @__PURE__ */ Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
__name(isPgEnum, "isPgEnum");
var PgEnumColumnBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgEnumColumnBuilder");
  }
  static [entityKind] = "PgEnumColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
var PgEnumColumn = class extends PgColumn {
  static {
    __name(this, "PgEnumColumn");
  }
  static [entityKind] = "PgEnumColumn";
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
var Subquery = class {
  static {
    __name(this, "Subquery");
  }
  static [entityKind] = "Subquery";
  constructor(sql2, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
var WithSubquery = class extends Subquery {
  static {
    __name(this, "WithSubquery");
  }
  static [entityKind] = "WithSubquery";
};
var version = "0.45.2";
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};
var ViewBaseConfig = /* @__PURE__ */ Symbol.for("drizzle:ViewBaseConfig");
var Schema = /* @__PURE__ */ Symbol.for("drizzle:Schema");
var Columns = /* @__PURE__ */ Symbol.for("drizzle:Columns");
var ExtraConfigColumns = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = /* @__PURE__ */ Symbol.for("drizzle:OriginalName");
var BaseName = /* @__PURE__ */ Symbol.for("drizzle:BaseName");
var IsAlias = /* @__PURE__ */ Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
  static {
    __name(this, "Table");
  }
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
function getTableName(table) {
  return table[TableName];
}
__name(getTableName, "getTableName");
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}
__name(getTableUniqueName, "getTableUniqueName");
var FakePrimitiveParam = class {
  static {
    __name(this, "FakePrimitiveParam");
  }
  static [entityKind] = "FakePrimitiveParam";
};
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
__name(isSQLWrapper, "isSQLWrapper");
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
__name(mergeQueries, "mergeQueries");
var StringChunk = class {
  static {
    __name(this, "StringChunk");
  }
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
var SQL = class _SQL {
  static {
    __name(this, "_SQL");
  }
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(
          schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
        );
      }
    }
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  /** @internal */
  usedTables = [];
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p2] of chunk.entries()) {
          result.push(p2);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
var Name = class {
  static {
    __name(this, "Name");
  }
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
__name(isDriverValueEncoder, "isDriverValueEncoder");
var noopDecoder = {
  mapFromDriverValue: /* @__PURE__ */ __name((value) => value, "mapFromDriverValue")
};
var noopEncoder = {
  mapToDriverValue: /* @__PURE__ */ __name((value) => value, "mapToDriverValue")
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var Param = class {
  static {
    __name(this, "Param");
  }
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
__name(sql, "sql");
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  __name(empty, "empty");
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  __name(fromList, "fromList");
  sql2.fromList = fromList;
  function raw(str2) {
    return new SQL([new StringChunk(str2)]);
  }
  __name(raw, "raw");
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  __name(join, "join");
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  __name(identifier, "identifier");
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  __name(placeholder2, "placeholder2");
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  __name(param2, "param2");
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    static {
      __name(this, "Aliased");
    }
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
  static {
    __name(this, "Placeholder");
  }
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
};
function fillPlaceholders(params, values) {
  return params.map((p2) => {
    if (is(p2, Placeholder)) {
      if (!(p2.name in values)) {
        throw new Error(`No value for placeholder "${p2.name}" was provided`);
      }
      return values[p2.name];
    }
    if (is(p2, Param) && is(p2.value, Placeholder)) {
      if (!(p2.value.name in values)) {
        throw new Error(`No value for placeholder "${p2.value.name}" was provided`);
      }
      return p2.encoder.mapToDriverValue(values[p2.value.name]);
    }
    return p2;
  });
}
__name(fillPlaceholders, "fillPlaceholders");
var IsDrizzleView = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleView");
var View = class {
  static {
    __name(this, "View");
  }
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};
var ColumnAliasProxyHandler = class {
  static {
    __name(this, "ColumnAliasProxyHandler");
  }
  constructor(table) {
    this.table = table;
  }
  static [entityKind] = "ColumnAliasProxyHandler";
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
};
var TableAliasProxyHandler = class {
  static {
    __name(this, "TableAliasProxyHandler");
  }
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  static [entityKind] = "TableAliasProxyHandler";
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
};
var RelationTableAliasProxyHandler = class {
  static {
    __name(this, "RelationTableAliasProxyHandler");
  }
  constructor(alias) {
    this.alias = alias;
  }
  static [entityKind] = "RelationTableAliasProxyHandler";
  get(target, prop) {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }
    return target[prop];
  }
};
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
__name(aliasedTable, "aliasedTable");
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
__name(aliasedTableColumn, "aliasedTableColumn");
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
__name(mapColumnsInAliasedSQLToAlias, "mapColumnsInAliasedSQLToAlias");
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}
__name(mapColumnsInSQLToAlias, "mapColumnsInSQLToAlias");
var SelectionProxyHandler = class _SelectionProxyHandler {
  static {
    __name(this, "_SelectionProxyHandler");
  }
  static [entityKind] = "SelectionProxyHandler";
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new _SelectionProxyHandler(this.config));
  }
};
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else if (is(field, Subquery)) {
        decoder = field._.sql.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
__name(mapResultRow, "mapResultRow");
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
__name(orderSelectedFields, "orderSelectedFields");
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index2, key] of leftKeys.entries()) {
    if (key !== rightKeys[index2]) {
      return false;
    }
  }
  return true;
}
__name(haveSameKeys, "haveSameKeys");
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
__name(mapUpdateSet, "mapUpdateSet");
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
__name(applyMixins, "applyMixins");
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
__name(getTableColumns, "getTableColumns");
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
__name(getTableLikeName, "getTableLikeName");
function getColumnNameAndConfig(a2, b) {
  return {
    name: typeof a2 === "string" && a2.length > 0 ? a2 : "",
    config: typeof a2 === "object" ? a2 : b
  };
}
__name(getColumnNameAndConfig, "getColumnNameAndConfig");
function isConfig(data) {
  if (typeof data !== "object" || data === null) return false;
  if (data.constructor.name !== "Object") return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined") return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined") return false;
    return true;
  }
  if (Object.keys(data).length === 0) return true;
  return false;
}
__name(isConfig, "isConfig");
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
var PgIntColumnBaseBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgIntColumnBaseBuilder");
  }
  static [entityKind] = "PgIntColumnBaseBuilder";
  generatedAlwaysAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "always",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "always"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
  generatedByDefaultAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "byDefault",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "byDefault"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
};
var PgBigInt53Builder = class extends PgIntColumnBaseBuilder {
  static {
    __name(this, "PgBigInt53Builder");
  }
  static [entityKind] = "PgBigInt53Builder";
  constructor(name) {
    super(name, "number", "PgBigInt53");
  }
  /** @internal */
  build(table) {
    return new PgBigInt53(table, this.config);
  }
};
var PgBigInt53 = class extends PgColumn {
  static {
    __name(this, "PgBigInt53");
  }
  static [entityKind] = "PgBigInt53";
  getSQLType() {
    return "bigint";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var PgBigInt64Builder = class extends PgIntColumnBaseBuilder {
  static {
    __name(this, "PgBigInt64Builder");
  }
  static [entityKind] = "PgBigInt64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigInt64");
  }
  /** @internal */
  build(table) {
    return new PgBigInt64(
      table,
      this.config
    );
  }
};
var PgBigInt64 = class extends PgColumn {
  static {
    __name(this, "PgBigInt64");
  }
  static [entityKind] = "PgBigInt64";
  getSQLType() {
    return "bigint";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigint(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}
__name(bigint, "bigint");
var PgBigSerial53Builder = class extends PgColumnBuilder {
  static {
    __name(this, "PgBigSerial53Builder");
  }
  static [entityKind] = "PgBigSerial53Builder";
  constructor(name) {
    super(name, "number", "PgBigSerial53");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial53(
      table,
      this.config
    );
  }
};
var PgBigSerial53 = class extends PgColumn {
  static {
    __name(this, "PgBigSerial53");
  }
  static [entityKind] = "PgBigSerial53";
  getSQLType() {
    return "bigserial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var PgBigSerial64Builder = class extends PgColumnBuilder {
  static {
    __name(this, "PgBigSerial64Builder");
  }
  static [entityKind] = "PgBigSerial64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigSerial64");
    this.config.hasDefault = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial64(
      table,
      this.config
    );
  }
};
var PgBigSerial64 = class extends PgColumn {
  static {
    __name(this, "PgBigSerial64");
  }
  static [entityKind] = "PgBigSerial64";
  getSQLType() {
    return "bigserial";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigserial(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}
__name(bigserial, "bigserial");
var PgBooleanBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgBooleanBuilder");
  }
  static [entityKind] = "PgBooleanBuilder";
  constructor(name) {
    super(name, "boolean", "PgBoolean");
  }
  /** @internal */
  build(table) {
    return new PgBoolean(table, this.config);
  }
};
var PgBoolean = class extends PgColumn {
  static {
    __name(this, "PgBoolean");
  }
  static [entityKind] = "PgBoolean";
  getSQLType() {
    return "boolean";
  }
};
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}
__name(boolean, "boolean");
var PgCharBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgCharBuilder");
  }
  static [entityKind] = "PgCharBuilder";
  constructor(name, config) {
    super(name, "string", "PgChar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgChar(
      table,
      this.config
    );
  }
};
var PgChar = class extends PgColumn {
  static {
    __name(this, "PgChar");
  }
  static [entityKind] = "PgChar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
function char(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgCharBuilder(name, config);
}
__name(char, "char");
var PgCidrBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgCidrBuilder");
  }
  static [entityKind] = "PgCidrBuilder";
  constructor(name) {
    super(name, "string", "PgCidr");
  }
  /** @internal */
  build(table) {
    return new PgCidr(table, this.config);
  }
};
var PgCidr = class extends PgColumn {
  static {
    __name(this, "PgCidr");
  }
  static [entityKind] = "PgCidr";
  getSQLType() {
    return "cidr";
  }
};
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}
__name(cidr, "cidr");
var PgCustomColumnBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgCustomColumnBuilder");
  }
  static [entityKind] = "PgCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "PgCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new PgCustomColumn(
      table,
      this.config
    );
  }
};
var PgCustomColumn = class extends PgColumn {
  static {
    __name(this, "PgCustomColumn");
  }
  static [entityKind] = "PgCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
function customType(customTypeParams) {
  return (a2, b) => {
    const { name, config } = getColumnNameAndConfig(a2, b);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}
__name(customType, "customType");
var PgDateColumnBaseBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgDateColumnBaseBuilder");
  }
  static [entityKind] = "PgDateColumnBaseBuilder";
  defaultNow() {
    return this.default(sql`now()`);
  }
};
var PgDateBuilder = class extends PgDateColumnBaseBuilder {
  static {
    __name(this, "PgDateBuilder");
  }
  static [entityKind] = "PgDateBuilder";
  constructor(name) {
    super(name, "date", "PgDate");
  }
  /** @internal */
  build(table) {
    return new PgDate(table, this.config);
  }
};
var PgDate = class extends PgColumn {
  static {
    __name(this, "PgDate");
  }
  static [entityKind] = "PgDate";
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return new Date(value);
    return value;
  }
  mapToDriverValue(value) {
    return value.toISOString();
  }
};
var PgDateStringBuilder = class extends PgDateColumnBaseBuilder {
  static {
    __name(this, "PgDateStringBuilder");
  }
  static [entityKind] = "PgDateStringBuilder";
  constructor(name) {
    super(name, "string", "PgDateString");
  }
  /** @internal */
  build(table) {
    return new PgDateString(
      table,
      this.config
    );
  }
};
var PgDateString = class extends PgColumn {
  static {
    __name(this, "PgDateString");
  }
  static [entityKind] = "PgDateString";
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    return value.toISOString().slice(0, -14);
  }
};
function date(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}
__name(date, "date");
var PgDoublePrecisionBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgDoublePrecisionBuilder");
  }
  static [entityKind] = "PgDoublePrecisionBuilder";
  constructor(name) {
    super(name, "number", "PgDoublePrecision");
  }
  /** @internal */
  build(table) {
    return new PgDoublePrecision(
      table,
      this.config
    );
  }
};
var PgDoublePrecision = class extends PgColumn {
  static {
    __name(this, "PgDoublePrecision");
  }
  static [entityKind] = "PgDoublePrecision";
  getSQLType() {
    return "double precision";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }
};
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}
__name(doublePrecision, "doublePrecision");
var PgInetBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgInetBuilder");
  }
  static [entityKind] = "PgInetBuilder";
  constructor(name) {
    super(name, "string", "PgInet");
  }
  /** @internal */
  build(table) {
    return new PgInet(table, this.config);
  }
};
var PgInet = class extends PgColumn {
  static {
    __name(this, "PgInet");
  }
  static [entityKind] = "PgInet";
  getSQLType() {
    return "inet";
  }
};
function inet(name) {
  return new PgInetBuilder(name ?? "");
}
__name(inet, "inet");
var PgIntegerBuilder = class extends PgIntColumnBaseBuilder {
  static {
    __name(this, "PgIntegerBuilder");
  }
  static [entityKind] = "PgIntegerBuilder";
  constructor(name) {
    super(name, "number", "PgInteger");
  }
  /** @internal */
  build(table) {
    return new PgInteger(table, this.config);
  }
};
var PgInteger = class extends PgColumn {
  static {
    __name(this, "PgInteger");
  }
  static [entityKind] = "PgInteger";
  getSQLType() {
    return "integer";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseInt(value);
    }
    return value;
  }
};
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}
__name(integer, "integer");
var PgIntervalBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgIntervalBuilder");
  }
  static [entityKind] = "PgIntervalBuilder";
  constructor(name, intervalConfig) {
    super(name, "string", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }
  /** @internal */
  build(table) {
    return new PgInterval(table, this.config);
  }
};
var PgInterval = class extends PgColumn {
  static {
    __name(this, "PgInterval");
  }
  static [entityKind] = "PgInterval";
  fields = this.config.intervalConfig.fields;
  precision = this.config.intervalConfig.precision;
  getSQLType() {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
};
function interval(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgIntervalBuilder(name, config);
}
__name(interval, "interval");
var PgJsonBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgJsonBuilder");
  }
  static [entityKind] = "PgJsonBuilder";
  constructor(name) {
    super(name, "json", "PgJson");
  }
  /** @internal */
  build(table) {
    return new PgJson(table, this.config);
  }
};
var PgJson = class extends PgColumn {
  static {
    __name(this, "PgJson");
  }
  static [entityKind] = "PgJson";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
function json(name) {
  return new PgJsonBuilder(name ?? "");
}
__name(json, "json");
var PgJsonbBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgJsonbBuilder");
  }
  static [entityKind] = "PgJsonbBuilder";
  constructor(name) {
    super(name, "json", "PgJsonb");
  }
  /** @internal */
  build(table) {
    return new PgJsonb(table, this.config);
  }
};
var PgJsonb = class extends PgColumn {
  static {
    __name(this, "PgJsonb");
  }
  static [entityKind] = "PgJsonb";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "jsonb";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}
__name(jsonb, "jsonb");
var PgLineBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgLineBuilder");
  }
  static [entityKind] = "PgLineBuilder";
  constructor(name) {
    super(name, "array", "PgLine");
  }
  /** @internal */
  build(table) {
    return new PgLineTuple(
      table,
      this.config
    );
  }
};
var PgLineTuple = class extends PgColumn {
  static {
    __name(this, "PgLineTuple");
  }
  static [entityKind] = "PgLine";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a2, b, c] = value.slice(1, -1).split(",");
    return [Number.parseFloat(a2), Number.parseFloat(b), Number.parseFloat(c)];
  }
  mapToDriverValue(value) {
    return `{${value[0]},${value[1]},${value[2]}}`;
  }
};
var PgLineABCBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgLineABCBuilder");
  }
  static [entityKind] = "PgLineABCBuilder";
  constructor(name) {
    super(name, "json", "PgLineABC");
  }
  /** @internal */
  build(table) {
    return new PgLineABC(
      table,
      this.config
    );
  }
};
var PgLineABC = class extends PgColumn {
  static {
    __name(this, "PgLineABC");
  }
  static [entityKind] = "PgLineABC";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a2, b, c] = value.slice(1, -1).split(",");
    return { a: Number.parseFloat(a2), b: Number.parseFloat(b), c: Number.parseFloat(c) };
  }
  mapToDriverValue(value) {
    return `{${value.a},${value.b},${value.c}}`;
  }
};
function line(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}
__name(line, "line");
var PgMacaddrBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgMacaddrBuilder");
  }
  static [entityKind] = "PgMacaddrBuilder";
  constructor(name) {
    super(name, "string", "PgMacaddr");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr(table, this.config);
  }
};
var PgMacaddr = class extends PgColumn {
  static {
    __name(this, "PgMacaddr");
  }
  static [entityKind] = "PgMacaddr";
  getSQLType() {
    return "macaddr";
  }
};
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}
__name(macaddr, "macaddr");
var PgMacaddr8Builder = class extends PgColumnBuilder {
  static {
    __name(this, "PgMacaddr8Builder");
  }
  static [entityKind] = "PgMacaddr8Builder";
  constructor(name) {
    super(name, "string", "PgMacaddr8");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr8(table, this.config);
  }
};
var PgMacaddr8 = class extends PgColumn {
  static {
    __name(this, "PgMacaddr8");
  }
  static [entityKind] = "PgMacaddr8";
  getSQLType() {
    return "macaddr8";
  }
};
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}
__name(macaddr8, "macaddr8");
var PgNumericBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgNumericBuilder");
  }
  static [entityKind] = "PgNumericBuilder";
  constructor(name, precision, scale) {
    super(name, "string", "PgNumeric");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumeric(table, this.config);
  }
};
var PgNumeric = class extends PgColumn {
  static {
    __name(this, "PgNumeric");
  }
  static [entityKind] = "PgNumeric";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    return String(value);
  }
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
var PgNumericNumberBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgNumericNumberBuilder");
  }
  static [entityKind] = "PgNumericNumberBuilder";
  constructor(name, precision, scale) {
    super(name, "number", "PgNumericNumber");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumericNumber(
      table,
      this.config
    );
  }
};
var PgNumericNumber = class extends PgColumn {
  static {
    __name(this, "PgNumericNumber");
  }
  static [entityKind] = "PgNumericNumber";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") return value;
    return Number(value);
  }
  mapToDriverValue = String;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
var PgNumericBigIntBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgNumericBigIntBuilder");
  }
  static [entityKind] = "PgNumericBigIntBuilder";
  constructor(name, precision, scale) {
    super(name, "bigint", "PgNumericBigInt");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumericBigInt(
      table,
      this.config
    );
  }
};
var PgNumericBigInt = class extends PgColumn {
  static {
    __name(this, "PgNumericBigInt");
  }
  static [entityKind] = "PgNumericBigInt";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue = BigInt;
  mapToDriverValue = String;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
function numeric(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  const mode = config?.mode;
  return mode === "number" ? new PgNumericNumberBuilder(name, config?.precision, config?.scale) : mode === "bigint" ? new PgNumericBigIntBuilder(name, config?.precision, config?.scale) : new PgNumericBuilder(name, config?.precision, config?.scale);
}
__name(numeric, "numeric");
var PgPointTupleBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgPointTupleBuilder");
  }
  static [entityKind] = "PgPointTupleBuilder";
  constructor(name) {
    super(name, "array", "PgPointTuple");
  }
  /** @internal */
  build(table) {
    return new PgPointTuple(
      table,
      this.config
    );
  }
};
var PgPointTuple = class extends PgColumn {
  static {
    __name(this, "PgPointTuple");
  }
  static [entityKind] = "PgPointTuple";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x2, y2] = value.slice(1, -1).split(",");
      return [Number.parseFloat(x2), Number.parseFloat(y2)];
    }
    return [value.x, value.y];
  }
  mapToDriverValue(value) {
    return `(${value[0]},${value[1]})`;
  }
};
var PgPointObjectBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgPointObjectBuilder");
  }
  static [entityKind] = "PgPointObjectBuilder";
  constructor(name) {
    super(name, "json", "PgPointObject");
  }
  /** @internal */
  build(table) {
    return new PgPointObject(
      table,
      this.config
    );
  }
};
var PgPointObject = class extends PgColumn {
  static {
    __name(this, "PgPointObject");
  }
  static [entityKind] = "PgPointObject";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x2, y2] = value.slice(1, -1).split(",");
      return { x: Number.parseFloat(x2), y: Number.parseFloat(y2) };
    }
    return value;
  }
  mapToDriverValue(value) {
    return `(${value.x},${value.y})`;
  }
};
function point(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}
__name(point, "point");
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
__name(hexToBytes, "hexToBytes");
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
__name(bytesToFloat64, "bytesToFloat64");
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x2 = bytesToFloat64(bytes, offset);
    offset += 8;
    const y2 = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x2, y2];
  }
  throw new Error("Unsupported geometry type");
}
__name(parseEWKB, "parseEWKB");
var PgGeometryBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgGeometryBuilder");
  }
  static [entityKind] = "PgGeometryBuilder";
  constructor(name) {
    super(name, "array", "PgGeometry");
  }
  /** @internal */
  build(table) {
    return new PgGeometry(
      table,
      this.config
    );
  }
};
var PgGeometry = class extends PgColumn {
  static {
    __name(this, "PgGeometry");
  }
  static [entityKind] = "PgGeometry";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    return parseEWKB(value);
  }
  mapToDriverValue(value) {
    return `point(${value[0]} ${value[1]})`;
  }
};
var PgGeometryObjectBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgGeometryObjectBuilder");
  }
  static [entityKind] = "PgGeometryObjectBuilder";
  constructor(name) {
    super(name, "json", "PgGeometryObject");
  }
  /** @internal */
  build(table) {
    return new PgGeometryObject(
      table,
      this.config
    );
  }
};
var PgGeometryObject = class extends PgColumn {
  static {
    __name(this, "PgGeometryObject");
  }
  static [entityKind] = "PgGeometryObject";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    const parsed = parseEWKB(value);
    return { x: parsed[0], y: parsed[1] };
  }
  mapToDriverValue(value) {
    return `point(${value.x} ${value.y})`;
  }
};
function geometry(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}
__name(geometry, "geometry");
var PgRealBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgRealBuilder");
  }
  static [entityKind] = "PgRealBuilder";
  constructor(name, length) {
    super(name, "number", "PgReal");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new PgReal(table, this.config);
  }
};
var PgReal = class extends PgColumn {
  static {
    __name(this, "PgReal");
  }
  static [entityKind] = "PgReal";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "real";
  }
  mapFromDriverValue = /* @__PURE__ */ __name((value) => {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }, "mapFromDriverValue");
};
function real(name) {
  return new PgRealBuilder(name ?? "");
}
__name(real, "real");
var PgSerialBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgSerialBuilder");
  }
  static [entityKind] = "PgSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSerial(table, this.config);
  }
};
var PgSerial = class extends PgColumn {
  static {
    __name(this, "PgSerial");
  }
  static [entityKind] = "PgSerial";
  getSQLType() {
    return "serial";
  }
};
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}
__name(serial, "serial");
var PgSmallIntBuilder = class extends PgIntColumnBaseBuilder {
  static {
    __name(this, "PgSmallIntBuilder");
  }
  static [entityKind] = "PgSmallIntBuilder";
  constructor(name) {
    super(name, "number", "PgSmallInt");
  }
  /** @internal */
  build(table) {
    return new PgSmallInt(table, this.config);
  }
};
var PgSmallInt = class extends PgColumn {
  static {
    __name(this, "PgSmallInt");
  }
  static [entityKind] = "PgSmallInt";
  getSQLType() {
    return "smallint";
  }
  mapFromDriverValue = /* @__PURE__ */ __name((value) => {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }, "mapFromDriverValue");
};
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}
__name(smallint, "smallint");
var PgSmallSerialBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgSmallSerialBuilder");
  }
  static [entityKind] = "PgSmallSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSmallSerial(
      table,
      this.config
    );
  }
};
var PgSmallSerial = class extends PgColumn {
  static {
    __name(this, "PgSmallSerial");
  }
  static [entityKind] = "PgSmallSerial";
  getSQLType() {
    return "smallserial";
  }
};
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}
__name(smallserial, "smallserial");
var PgTextBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgTextBuilder");
  }
  static [entityKind] = "PgTextBuilder";
  constructor(name, config) {
    super(name, "string", "PgText");
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgText(table, this.config);
  }
};
var PgText = class extends PgColumn {
  static {
    __name(this, "PgText");
  }
  static [entityKind] = "PgText";
  enumValues = this.config.enumValues;
  getSQLType() {
    return "text";
  }
};
function text(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgTextBuilder(name, config);
}
__name(text, "text");
var PgTimeBuilder = class extends PgDateColumnBaseBuilder {
  static {
    __name(this, "PgTimeBuilder");
  }
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTime");
    this.withTimezone = withTimezone;
    this.precision = precision;
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  static [entityKind] = "PgTimeBuilder";
  /** @internal */
  build(table) {
    return new PgTime(table, this.config);
  }
};
var PgTime = class extends PgColumn {
  static {
    __name(this, "PgTime");
  }
  static [entityKind] = "PgTime";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
function time(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}
__name(time, "time");
var PgTimestampBuilder = class extends PgDateColumnBaseBuilder {
  static {
    __name(this, "PgTimestampBuilder");
  }
  static [entityKind] = "PgTimestampBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "date", "PgTimestamp");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestamp(table, this.config);
  }
};
var PgTimestamp = class extends PgColumn {
  static {
    __name(this, "PgTimestamp");
  }
  static [entityKind] = "PgTimestamp";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return new Date(this.withTimezone ? value : value + "+0000");
    return value;
  }
  mapToDriverValue = /* @__PURE__ */ __name((value) => {
    return value.toISOString();
  }, "mapToDriverValue");
};
var PgTimestampStringBuilder = class extends PgDateColumnBaseBuilder {
  static {
    __name(this, "PgTimestampStringBuilder");
  }
  static [entityKind] = "PgTimestampStringBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTimestampString");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestampString(
      table,
      this.config
    );
  }
};
var PgTimestampString = class extends PgColumn {
  static {
    __name(this, "PgTimestampString");
  }
  static [entityKind] = "PgTimestampString";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    const shortened = value.toISOString().slice(0, -1).replace("T", " ");
    if (this.withTimezone) {
      const offset = value.getTimezoneOffset();
      const sign = offset <= 0 ? "+" : "-";
      return `${shortened}${sign}${Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")}`;
    }
    return shortened;
  }
};
function timestamp(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}
__name(timestamp, "timestamp");
var PgUUIDBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgUUIDBuilder");
  }
  static [entityKind] = "PgUUIDBuilder";
  constructor(name) {
    super(name, "string", "PgUUID");
  }
  /**
   * Adds `default gen_random_uuid()` to the column definition.
   */
  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }
  /** @internal */
  build(table) {
    return new PgUUID(table, this.config);
  }
};
var PgUUID = class extends PgColumn {
  static {
    __name(this, "PgUUID");
  }
  static [entityKind] = "PgUUID";
  getSQLType() {
    return "uuid";
  }
};
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}
__name(uuid, "uuid");
var PgVarcharBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgVarcharBuilder");
  }
  static [entityKind] = "PgVarcharBuilder";
  constructor(name, config) {
    super(name, "string", "PgVarchar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgVarchar(
      table,
      this.config
    );
  }
};
var PgVarchar = class extends PgColumn {
  static {
    __name(this, "PgVarchar");
  }
  static [entityKind] = "PgVarchar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
function varchar(a2, b = {}) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgVarcharBuilder(name, config);
}
__name(varchar, "varchar");
var PgBinaryVectorBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgBinaryVectorBuilder");
  }
  static [entityKind] = "PgBinaryVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgBinaryVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgBinaryVector(
      table,
      this.config
    );
  }
};
var PgBinaryVector = class extends PgColumn {
  static {
    __name(this, "PgBinaryVector");
  }
  static [entityKind] = "PgBinaryVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `bit(${this.dimensions})`;
  }
};
function bit(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgBinaryVectorBuilder(name, config);
}
__name(bit, "bit");
var PgHalfVectorBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgHalfVectorBuilder");
  }
  static [entityKind] = "PgHalfVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgHalfVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgHalfVector(
      table,
      this.config
    );
  }
};
var PgHalfVector = class extends PgColumn {
  static {
    __name(this, "PgHalfVector");
  }
  static [entityKind] = "PgHalfVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `halfvec(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v2) => Number.parseFloat(v2));
  }
};
function halfvec(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgHalfVectorBuilder(name, config);
}
__name(halfvec, "halfvec");
var PgSparseVectorBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgSparseVectorBuilder");
  }
  static [entityKind] = "PgSparseVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgSparseVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgSparseVector(
      table,
      this.config
    );
  }
};
var PgSparseVector = class extends PgColumn {
  static {
    __name(this, "PgSparseVector");
  }
  static [entityKind] = "PgSparseVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `sparsevec(${this.dimensions})`;
  }
};
function sparsevec(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgSparseVectorBuilder(name, config);
}
__name(sparsevec, "sparsevec");
var PgVectorBuilder = class extends PgColumnBuilder {
  static {
    __name(this, "PgVectorBuilder");
  }
  static [entityKind] = "PgVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgVector(
      table,
      this.config
    );
  }
};
var PgVector = class extends PgColumn {
  static {
    __name(this, "PgVector");
  }
  static [entityKind] = "PgVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `vector(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v2) => Number.parseFloat(v2));
  }
};
function vector(a2, b) {
  const { name, config } = getColumnNameAndConfig(a2, b);
  return new PgVectorBuilder(name, config);
}
__name(vector, "vector");
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}
__name(getPgColumnBuilders, "getPgColumnBuilders");
var InlineForeignKeys = /* @__PURE__ */ Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = /* @__PURE__ */ Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
  static {
    __name(this, "PgTable");
  }
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys,
    EnableRLS
  });
  /**@internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
  /** @internal */
  [Table.Symbol.ExtraConfigColumns] = {};
};
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: /* @__PURE__ */ __name(() => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }, "enableRLS")
  });
}
__name(pgTableWithSchema, "pgTableWithSchema");
var pgTable = /* @__PURE__ */ __name((name, columns, extraConfig) => {
  return pgTableWithSchema(name, columns, extraConfig, void 0);
}, "pgTable");
var IndexBuilderOn = class {
  static {
    __name(this, "IndexBuilderOn");
  }
  constructor(unique, name) {
    this.unique = unique;
    this.name = name;
  }
  static [entityKind] = "PgIndexBuilderOn";
  on(...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }),
      this.unique,
      false,
      this.name
    );
  }
  onOnly(...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = it.defaultConfig;
        return clonedIndexedColumn;
      }),
      this.unique,
      true,
      this.name
    );
  }
  /**
   * Specify what index method to use. Choices are `btree`, `hash`, `gist`, `spgist`, `gin`, `brin`, or user-installed access methods like `bloom`. The default method is `btree.
   *
   * If you have the `pg_vector` extension installed in your database, you can use the `hnsw` and `ivfflat` options, which are predefined types.
   *
   * **You can always specify any string you want in the method, in case Drizzle doesn't have it natively in its types**
   *
   * @param method The name of the index method to be used
   * @param columns
   * @returns
   */
  using(method, ...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }),
      this.unique,
      true,
      this.name,
      method
    );
  }
};
var IndexBuilder = class {
  static {
    __name(this, "IndexBuilder");
  }
  static [entityKind] = "PgIndexBuilder";
  /** @internal */
  config;
  constructor(columns, unique, only, name, method = "btree") {
    this.config = {
      name,
      columns,
      unique,
      only,
      method
    };
  }
  concurrently() {
    this.config.concurrently = true;
    return this;
  }
  with(obj) {
    this.config.with = obj;
    return this;
  }
  where(condition) {
    this.config.where = condition;
    return this;
  }
  /** @internal */
  build(table) {
    return new Index(this.config, table);
  }
};
var Index = class {
  static {
    __name(this, "Index");
  }
  static [entityKind] = "PgIndex";
  config;
  constructor(config, table) {
    this.config = { ...config, table };
  }
};
function index(name) {
  return new IndexBuilderOn(false, name);
}
__name(index, "index");
var PrimaryKeyBuilder = class {
  static {
    __name(this, "PrimaryKeyBuilder");
  }
  static [entityKind] = "PgPrimaryKeyBuilder";
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
var PrimaryKey = class {
  static {
    __name(this, "PrimaryKey");
  }
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "PgPrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
__name(toSnakeCase, "toSnakeCase");
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
__name(toCamelCase, "toCamelCase");
function noopCase(input) {
  return input;
}
__name(noopCase, "noopCase");
var CasingCache = class {
  static {
    __name(this, "CasingCache");
  }
  static [entityKind] = "CasingCache";
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName) return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
};
var DrizzleError = class extends Error {
  static {
    __name(this, "DrizzleError");
  }
  static [entityKind] = "DrizzleError";
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
};
var DrizzleQueryError = class _DrizzleQueryError extends Error {
  static {
    __name(this, "_DrizzleQueryError");
  }
  constructor(query, params, cause) {
    super(`Failed query: ${query}
params: ${params}`);
    this.query = query;
    this.params = params;
    this.cause = cause;
    Error.captureStackTrace(this, _DrizzleQueryError);
    if (cause) this.cause = cause;
  }
};
var TransactionRollbackError = class extends DrizzleError {
  static {
    __name(this, "TransactionRollbackError");
  }
  static [entityKind] = "TransactionRollbackError";
  constructor() {
    super({ message: "Rollback" });
  }
};
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
__name(bindIfParam, "bindIfParam");
var eq = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
}, "eq");
var ne = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
}, "ne");
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
__name(and, "and");
function or2(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
__name(or2, "or2");
function not(condition) {
  return sql`not ${condition}`;
}
__name(not, "not");
var gt2 = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
}, "gt2");
var gte = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
}, "gte");
var lt = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
}, "lt");
var lte = /* @__PURE__ */ __name((left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
}, "lte");
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v2) => bindIfParam(v2, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
__name(inArray, "inArray");
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v2) => bindIfParam(v2, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
__name(notInArray, "notInArray");
function isNull(value) {
  return sql`${value} is null`;
}
__name(isNull, "isNull");
function isNotNull(value) {
  return sql`${value} is not null`;
}
__name(isNotNull, "isNotNull");
function exists(subquery) {
  return sql`exists ${subquery}`;
}
__name(exists, "exists");
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
__name(notExists, "notExists");
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
__name(between, "between");
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
__name(notBetween, "notBetween");
function like(column, value) {
  return sql`${column} like ${value}`;
}
__name(like, "like");
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
__name(notLike, "notLike");
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
__name(ilike, "ilike");
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}
__name(notIlike, "notIlike");
function asc(column) {
  return sql`${column} asc`;
}
__name(asc, "asc");
function desc(column) {
  return sql`${column} desc`;
}
__name(desc, "desc");
var Relation = class {
  static {
    __name(this, "Relation");
  }
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  static [entityKind] = "Relation";
  referencedTableName;
  fieldName;
};
var Relations = class {
  static {
    __name(this, "Relations");
  }
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
  static [entityKind] = "Relations";
};
var One = class _One extends Relation {
  static {
    __name(this, "_One");
  }
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  static [entityKind] = "One";
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
var Many = class _Many extends Relation {
  static {
    __name(this, "_Many");
  }
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
  }
  static [entityKind] = "Many";
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt: gt2,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or: or2,
    sql
  };
}
__name(getOperators, "getOperators");
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
__name(getOrderByOperators, "getOrderByOperators");
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey) {
            tableConfig.primaryKey.push(...primaryKey);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
__name(extractTablesRelationalConfig, "extractTablesRelationalConfig");
function createOne(sourceTable) {
  return /* @__PURE__ */ __name(function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  }, "one");
}
__name(createOne, "createOne");
function createMany(sourceTable) {
  return /* @__PURE__ */ __name(function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  }, "many");
}
__name(createMany, "createMany");
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
__name(normalizeRelation, "normalizeRelation");
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
__name(createTableRelationsHelpers, "createTableRelationsHelpers");
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}
__name(mapRelationalRow, "mapRelationalRow");
var PgViewBase = class extends View {
  static {
    __name(this, "PgViewBase");
  }
  static [entityKind] = "PgViewBase";
};
var PgDialect = class {
  static {
    __name(this, "PgDialect");
  }
  static [entityKind] = "PgDialect";
  /** @internal */
  casing;
  constructor(config) {
    this.casing = new CasingCache(config?.casing);
  }
  async migrate(migrations, session, config) {
    const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationsSchema = typeof config === "string" ? "drizzle" : config.migrationsSchema ?? "drizzle";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
    await session.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`);
    await session.execute(migrationTableCreate);
    const dbMigrations = await session.all(
      sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} order by created_at desc limit 1`
    );
    const lastDbMigration = dbMigrations[0];
    await session.transaction(async (tx) => {
      for await (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.execute(sql.raw(stmt));
          }
          await tx.execute(
            sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
  escapeName(name) {
    return `"${name.replace(/"/g, '""')}"`;
  }
  escapeParam(num) {
    return `$${num + 1}`;
  }
  escapeString(str2) {
    return `'${str2.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length) return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    );
    const setSize = columnNames.length;
    return sql.join(columnNames.flatMap((colName, i) => {
      const col = tableColumns[colName];
      const onUpdateFnResult = col.onUpdateFn?.();
      const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
      const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      if (i < setSize - 1) {
        return [res, sql.raw(", ")];
      }
      return [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, from, joins }) {
    const withSql = this.buildWithCTE(withList);
    const tableName = table[PgTable.Symbol.Name];
    const tableSchema = table[PgTable.Symbol.Schema];
    const origTableName = table[PgTable.Symbol.OriginalName];
    const alias = tableName === origTableName ? void 0 : tableName;
    const tableSql = sql`${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}`;
    const setSql = this.buildUpdateSet(table, set);
    const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
    const joinsSql = this.buildJoins(joins);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: !from })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}update ${tableSql} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, PgColumn)) {
                  return sql.identifier(this.casing.getColumnCasing(c));
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        if (isSingleTable) {
          chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
        } else {
          chunk.push(field);
        }
      } else if (is(field, Subquery)) {
        const entries = Object.entries(field._.selectedFields);
        if (entries.length === 1) {
          const entry = entries[0][1];
          const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: /* @__PURE__ */ __name((v2) => entry.mapFromDriverValue(v2), "mapFromDriverValue") } : entry.sql.decoder;
          if (fieldDecoder) {
            field._.sql.decoder = fieldDecoder;
          }
        }
        chunk.push(field);
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildJoins(joins) {
    if (!joins || joins.length === 0) {
      return void 0;
    }
    const joinsArray = [];
    for (const [index2, joinMeta] of joins.entries()) {
      if (index2 === 0) {
        joinsArray.push(sql` `);
      }
      const table = joinMeta.table;
      const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
      const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
      if (is(table, PgTable)) {
        const tableName = table[PgTable.Symbol.Name];
        const tableSchema = table[PgTable.Symbol.Schema];
        const origTableName = table[PgTable.Symbol.OriginalName];
        const alias = tableName === origTableName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
        );
      } else if (is(table, View)) {
        const viewName = table[ViewBaseConfig].name;
        const viewSchema = table[ViewBaseConfig].schema;
        const origViewName = table[ViewBaseConfig].originalName;
        const alias = viewName === origViewName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
        );
      } else {
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table}${onSql}`
        );
      }
      if (index2 < joins.length - 1) {
        joinsArray.push(sql` `);
      }
    }
    return sql.join(joinsArray);
  }
  buildFromTable(table) {
    if (is(table, Table) && table[Table.Symbol.IsAlias]) {
      let fullName = sql`${sql.identifier(table[Table.Symbol.OriginalName])}`;
      if (table[Table.Symbol.Schema]) {
        fullName = sql`${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
      }
      return sql`${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
    }
    return table;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit: limit2,
    offset,
    lockingClause,
    distinct,
    setOperators
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, PgViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    let distinctSql;
    if (distinct) {
      distinctSql = distinct === true ? sql` distinct` : sql` distinct on (${sql.join(distinct.on, sql`, `)})`;
    }
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = this.buildFromTable(table);
    const joinsSql = this.buildJoins(joins);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      orderBySql = sql` order by ${sql.join(orderBy, sql`, `)}`;
    }
    let groupBySql;
    if (groupBy && groupBy.length > 0) {
      groupBySql = sql` group by ${sql.join(groupBy, sql`, `)}`;
    }
    const limitSql = typeof limit2 === "object" || typeof limit2 === "number" && limit2 >= 0 ? sql` limit ${limit2}` : void 0;
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const lockingClauseSql = sql.empty();
    if (lockingClause) {
      const clauseSql = sql` for ${sql.raw(lockingClause.strength)}`;
      if (lockingClause.config.of) {
        clauseSql.append(
          sql` of ${sql.join(
            Array.isArray(lockingClause.config.of) ? lockingClause.config.of : [lockingClause.config.of],
            sql`, `
          )}`
        );
      }
      if (lockingClause.config.noWait) {
        clauseSql.append(sql` nowait`);
      } else if (lockingClause.config.skipLocked) {
        clauseSql.append(sql` skip locked`);
      }
      lockingClauseSql.append(clauseSql);
    }
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClauseSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit: limit2, orderBy, offset }
  }) {
    const leftChunk = sql`(${leftSelect.getSQL()}) `;
    const rightChunk = sql`(${rightSelect.getSQL()})`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const singleOrderBy of orderBy) {
        if (is(singleOrderBy, PgColumn)) {
          orderByValues.push(sql.identifier(singleOrderBy.name));
        } else if (is(singleOrderBy, SQL)) {
          for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
            const chunk = singleOrderBy.queryChunks[i];
            if (is(chunk, PgColumn)) {
              singleOrderBy.queryChunks[i] = sql.identifier(chunk.name);
            }
          }
          orderByValues.push(sql`${singleOrderBy}`);
        } else {
          orderByValues.push(sql`${singleOrderBy}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
    }
    const limitSql = typeof limit2 === "object" || typeof limit2 === "number" && limit2 >= 0 ? sql` limit ${limit2}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select, overridingSystemValue_ }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(([_2, col]) => !col.shouldDisableInsert());
    const insertOrder = colEntries.map(
      ([, column]) => sql.identifier(this.casing.getColumnCasing(column))
    );
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
              valueList.push(defaultValue);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
              valueList.push(newValue);
            } else {
              valueList.push(sql`default`);
            }
          } else {
            valueList.push(colValue);
          }
        }
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const withSql = this.buildWithCTE(withList);
    const valuesSql = sql.join(valuesSqlList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : void 0;
    const overridingSql = overridingSystemValue_ === true ? sql`overriding system value ` : void 0;
    return sql`${withSql}insert into ${table} ${insertOrder} ${overridingSql}${valuesSql}${onConflictSql}${returningSql}`;
  }
  buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
    const concurrentlySql = concurrently ? sql` concurrently` : void 0;
    const withNoDataSql = withNoData ? sql` with no data` : void 0;
    return sql`refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
  }
  prepareTyping(encoder) {
    if (is(encoder, PgJsonb) || is(encoder, PgJson)) {
      return "json";
    } else if (is(encoder, PgNumeric)) {
      return "decimal";
    } else if (is(encoder, PgTime)) {
      return "time";
    } else if (is(encoder, PgTimestamp) || is(encoder, PgTimestampString)) {
      return "timestamp";
    } else if (is(encoder, PgDate) || is(encoder, PgDateString)) {
      return "date";
    } else if (is(encoder, PgUUID)) {
      return "uuid";
    } else {
      return "none";
    }
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      prepareTyping: this.prepareTyping,
      invokeSource
    });
  }
  // buildRelationalQueryWithPK({
  // 	fullSchema,
  // 	schema,
  // 	tableNamesMap,
  // 	table,
  // 	tableConfig,
  // 	queryConfig: config,
  // 	tableAlias,
  // 	isRoot = false,
  // 	joinOn,
  // }: {
  // 	fullSchema: Record<string, unknown>;
  // 	schema: TablesRelationalConfig;
  // 	tableNamesMap: Record<string, string>;
  // 	table: PgTable;
  // 	tableConfig: TableRelationalConfig;
  // 	queryConfig: true | DBQueryConfig<'many', true>;
  // 	tableAlias: string;
  // 	isRoot?: boolean;
  // 	joinOn?: SQL;
  // }): BuildRelationalQueryResult<PgTable, PgColumn> {
  // 	// For { "<relation>": true }, return a table with selection of all columns
  // 	if (config === true) {
  // 		const selectionEntries = Object.entries(tableConfig.columns);
  // 		const selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = selectionEntries.map((
  // 			[key, value],
  // 		) => ({
  // 			dbKey: value.name,
  // 			tsKey: key,
  // 			field: value as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection,
  // 		};
  // 	}
  // 	// let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// let selectionForBuild = selection;
  // 	const aliasedColumns = Object.fromEntries(
  // 		Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]),
  // 	);
  // 	const aliasedRelations = Object.fromEntries(
  // 		Object.entries(tableConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]),
  // 	);
  // 	const aliasedFields = Object.assign({}, aliasedColumns, aliasedRelations);
  // 	let where, hasUserDefinedWhere;
  // 	if (config.where) {
  // 		const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, operators) : config.where;
  // 		where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
  // 		hasUserDefinedWhere = !!where;
  // 	}
  // 	where = and(joinOn, where);
  // 	// const fieldsSelection: { tsKey: string; value: PgColumn | SQL.Aliased; isExtra?: boolean }[] = [];
  // 	let joins: Join[] = [];
  // 	let selectedColumns: string[] = [];
  // 	// Figure out which columns to select
  // 	if (config.columns) {
  // 		let isIncludeMode = false;
  // 		for (const [field, value] of Object.entries(config.columns)) {
  // 			if (value === undefined) {
  // 				continue;
  // 			}
  // 			if (field in tableConfig.columns) {
  // 				if (!isIncludeMode && value === true) {
  // 					isIncludeMode = true;
  // 				}
  // 				selectedColumns.push(field);
  // 			}
  // 		}
  // 		if (selectedColumns.length > 0) {
  // 			selectedColumns = isIncludeMode
  // 				? selectedColumns.filter((c) => config.columns?.[c] === true)
  // 				: Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
  // 		}
  // 	} else {
  // 		// Select all columns if selection is not specified
  // 		selectedColumns = Object.keys(tableConfig.columns);
  // 	}
  // 	// for (const field of selectedColumns) {
  // 	// 	const column = tableConfig.columns[field]! as PgColumn;
  // 	// 	fieldsSelection.push({ tsKey: field, value: column });
  // 	// }
  // 	let initiallySelectedRelations: {
  // 		tsKey: string;
  // 		queryConfig: true | DBQueryConfig<'many', false>;
  // 		relation: Relation;
  // 	}[] = [];
  // 	// let selectedRelations: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// Figure out which relations to select
  // 	if (config.with) {
  // 		initiallySelectedRelations = Object.entries(config.with)
  // 			.filter((entry): entry is [typeof entry[0], NonNullable<typeof entry[1]>] => !!entry[1])
  // 			.map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey]! }));
  // 	}
  // 	const manyRelations = initiallySelectedRelations.filter((r) =>
  // 		is(r.relation, Many)
  // 		&& (schema[tableNamesMap[r.relation.referencedTable[Table.Symbol.Name]]!]?.primaryKey.length ?? 0) > 0
  // 	);
  // 	// If this is the last Many relation (or there are no Many relations), we are on the innermost subquery level
  // 	const isInnermostQuery = manyRelations.length < 2;
  // 	const selectedExtras: {
  // 		tsKey: string;
  // 		value: SQL.Aliased;
  // 	}[] = [];
  // 	// Figure out which extras to select
  // 	if (isInnermostQuery && config.extras) {
  // 		const extras = typeof config.extras === 'function'
  // 			? config.extras(aliasedFields, { sql })
  // 			: config.extras;
  // 		for (const [tsKey, value] of Object.entries(extras)) {
  // 			selectedExtras.push({
  // 				tsKey,
  // 				value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
  // 			});
  // 		}
  // 	}
  // 	// Transform `fieldsSelection` into `selection`
  // 	// `fieldsSelection` shouldn't be used after this point
  // 	// for (const { tsKey, value, isExtra } of fieldsSelection) {
  // 	// 	selection.push({
  // 	// 		dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey]!.name,
  // 	// 		tsKey,
  // 	// 		field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
  // 	// 		relationTableTsKey: undefined,
  // 	// 		isJson: false,
  // 	// 		isExtra,
  // 	// 		selection: [],
  // 	// 	});
  // 	// }
  // 	let orderByOrig = typeof config.orderBy === 'function'
  // 		? config.orderBy(aliasedFields, orderByOperators)
  // 		: config.orderBy ?? [];
  // 	if (!Array.isArray(orderByOrig)) {
  // 		orderByOrig = [orderByOrig];
  // 	}
  // 	const orderBy = orderByOrig.map((orderByValue) => {
  // 		if (is(orderByValue, Column)) {
  // 			return aliasedTableColumn(orderByValue, tableAlias) as PgColumn;
  // 		}
  // 		return mapColumnsInSQLToAlias(orderByValue, tableAlias);
  // 	});
  // 	const limit = isInnermostQuery ? config.limit : undefined;
  // 	const offset = isInnermostQuery ? config.offset : undefined;
  // 	// For non-root queries without additional config except columns, return a table with selection
  // 	if (
  // 		!isRoot
  // 		&& initiallySelectedRelations.length === 0
  // 		&& selectedExtras.length === 0
  // 		&& !where
  // 		&& orderBy.length === 0
  // 		&& limit === undefined
  // 		&& offset === undefined
  // 	) {
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection: selectedColumns.map((key) => ({
  // 				dbKey: tableConfig.columns[key]!.name,
  // 				tsKey: key,
  // 				field: tableConfig.columns[key] as PgColumn,
  // 				relationTableTsKey: undefined,
  // 				isJson: false,
  // 				selection: [],
  // 			})),
  // 		};
  // 	}
  // 	const selectedRelationsWithoutPK:
  // 	// Process all relations without primary keys, because they need to be joined differently and will all be on the same query level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of initiallySelectedRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length > 0) {
  // 			continue;
  // 		}
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithoutPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 			nestedQueryRelation: relation,
  // 		});
  // 		const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier('data')}`.as(selectedRelationTsKey);
  // 		joins.push({
  // 			on: sql`true`,
  // 			table: new Subquery(builtRelation.sql as SQL, {}, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: true,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	const oneRelations = initiallySelectedRelations.filter((r): r is typeof r & { relation: One } =>
  // 		is(r.relation, One)
  // 	);
  // 	// Process all One relations with PKs, because they can all be joined on the same level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of oneRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length === 0) {
  // 			continue;
  // 		}
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const field = sql`case when ${sql.identifier(relationTableAlias)} is null then null else json_build_array(${
  // 			sql.join(
  // 				builtRelation.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelation.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: is(builtRelation.sql, SQL)
  // 				? new Subquery(builtRelation.sql, {}, relationTableAlias)
  // 				: aliasedTable(builtRelation.sql, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: is(builtRelation.sql, SQL),
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	let distinct: PgSelectConfig['distinct'];
  // 	let tableFrom: PgTable | Subquery = table;
  // 	// Process first Many relation - each one requires a nested subquery
  // 	const manyRelation = manyRelations[0];
  // 	if (manyRelation) {
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			relation,
  // 		} = manyRelation;
  // 		distinct = {
  // 			on: tableConfig.primaryKey.map((c) => aliasedTableColumn(c as PgColumn, tableAlias)),
  // 		};
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelationJoin = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const builtRelationSelectionField = sql`case when ${
  // 			sql.identifier(relationTableAlias)
  // 		} is null then '[]' else json_agg(json_build_array(${
  // 			sql.join(
  // 				builtRelationJoin.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		})) over (partition by ${sql.join(distinct.on, sql`, `)}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelationJoin.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: isLateralJoin
  // 				? new Subquery(builtRelationJoin.sql as SQL, {}, relationTableAlias)
  // 				: aliasedTable(builtRelationJoin.sql as PgTable, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: isLateralJoin,
  // 		});
  // 		// Build the "from" subquery with the remaining Many relations
  // 		const builtTableFrom = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table,
  // 			tableConfig,
  // 			queryConfig: {
  // 				...config,
  // 				where: undefined,
  // 				orderBy: undefined,
  // 				limit: undefined,
  // 				offset: undefined,
  // 				with: manyRelations.slice(1).reduce<NonNullable<typeof config['with']>>(
  // 					(result, { tsKey, queryConfig: configValue }) => {
  // 						result[tsKey] = configValue;
  // 						return result;
  // 					},
  // 					{},
  // 				),
  // 			},
  // 			tableAlias,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field: builtRelationSelectionField,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelationJoin.selection,
  // 		});
  // 		// selection = builtTableFrom.selection.map((item) =>
  // 		// 	is(item.field, SQL.Aliased)
  // 		// 		? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 		// 		: item
  // 		// );
  // 		// selectionForBuild = [{
  // 		// 	dbKey: '*',
  // 		// 	tsKey: '*',
  // 		// 	field: sql`${sql.identifier(tableAlias)}.*`,
  // 		// 	selection: [],
  // 		// 	isJson: false,
  // 		// 	relationTableTsKey: undefined,
  // 		// }];
  // 		// const newSelectionItem: (typeof selection)[number] = {
  // 		// 	dbKey: selectedRelationTsKey,
  // 		// 	tsKey: selectedRelationTsKey,
  // 		// 	field,
  // 		// 	relationTableTsKey: relationTableTsName,
  // 		// 	isJson: true,
  // 		// 	selection: builtRelationJoin.selection,
  // 		// };
  // 		// selection.push(newSelectionItem);
  // 		// selectionForBuild.push(newSelectionItem);
  // 		tableFrom = is(builtTableFrom.sql, PgTable)
  // 			? builtTableFrom.sql
  // 			: new Subquery(builtTableFrom.sql, {}, tableAlias);
  // 	}
  // 	if (selectedColumns.length === 0 && selectedRelations.length === 0 && selectedExtras.length === 0) {
  // 		throw new DrizzleError(`No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")`);
  // 	}
  // 	let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'];
  // 	function prepareSelectedColumns() {
  // 		return selectedColumns.map((key) => ({
  // 			dbKey: tableConfig.columns[key]!.name,
  // 			tsKey: key,
  // 			field: tableConfig.columns[key] as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	function prepareSelectedExtras() {
  // 		return selectedExtras.map((item) => ({
  // 			dbKey: item.value.fieldAlias,
  // 			tsKey: item.tsKey,
  // 			field: item.value,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	if (isRoot) {
  // 		selection = [
  // 			...prepareSelectedColumns(),
  // 			...prepareSelectedExtras(),
  // 		];
  // 	}
  // 	if (hasUserDefinedWhere || orderBy.length > 0) {
  // 		tableFrom = new Subquery(
  // 			this.buildSelectQuery({
  // 				table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 				fields: {},
  // 				fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 					path: [],
  // 					field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 				})),
  // 				joins,
  // 				distinct,
  // 			}),
  // 			{},
  // 			tableAlias,
  // 		);
  // 		selectionForBuild = selection.map((item) =>
  // 			is(item.field, SQL.Aliased)
  // 				? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 				: item
  // 		);
  // 		joins = [];
  // 		distinct = undefined;
  // 	}
  // 	const result = this.buildSelectQuery({
  // 		table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 		fields: {},
  // 		fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 			path: [],
  // 			field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 		})),
  // 		where,
  // 		limit,
  // 		offset,
  // 		joins,
  // 		orderBy,
  // 		distinct,
  // 	});
  // 	return {
  // 		tableTsKey: tableConfig.tsName,
  // 		sql: result,
  // 		selection,
  // 	};
  // }
  buildRelationalQueryWithoutPK({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit2, offset, orderBy = [], where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig2]) => ({ tsKey, queryConfig: queryConfig2, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit2 = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQueryWithoutPK({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
        joins.push({
          on: sql`true`,
          table: new Subquery(builtRelation.sql, {}, relationTableAlias),
          alias: relationTableAlias,
          joinType: "left",
          lateral: true
        });
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_build_array(${sql.join(
        selection.map(
          ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_agg(${field}${orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0}), '[]'::json)`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit2 !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [{
            path: [],
            field: sql.raw("*")
          }],
          where,
          limit: limit2,
          offset,
          orderBy,
          setOperators: []
        });
        where = void 0;
        limit2 = void 0;
        offset = void 0;
        orderBy = [];
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, PgTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit: limit2,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit: limit2,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
};
var TypedQueryBuilder = class {
  static {
    __name(this, "TypedQueryBuilder");
  }
  static [entityKind] = "TypedQueryBuilder";
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
};
var PgSelectBuilder = class {
  static {
    __name(this, "PgSelectBuilder");
  }
  static [entityKind] = "PgSelectBuilder";
  fields;
  session;
  dialect;
  withList = [];
  distinct;
  constructor(config) {
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    if (config.withList) {
      this.withList = config.withList;
    }
    this.distinct = config.distinct;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  /**
   * Specify the table, subquery, or other target that you're
   * building a select query against.
   *
   * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM | Postgres from documentation}
   */
  from(source) {
    const isPartialSelect = !!this.fields;
    const src = source;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(src, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(src._.selectedFields).map((key) => [key, src[key]])
      );
    } else if (is(src, PgViewBase)) {
      fields = src[ViewBaseConfig].selectedFields;
    } else if (is(src, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(src);
    }
    return new PgSelectBase({
      table: src,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    }).setToken(this.authToken);
  }
};
var PgSelectQueryBuilderBase = class extends TypedQueryBuilder {
  static {
    __name(this, "PgSelectQueryBuilderBase");
  }
  static [entityKind] = "PgSelectQueryBuilder";
  _;
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  session;
  dialect;
  cacheConfig = void 0;
  usedTables = /* @__PURE__ */ new Set();
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields,
      config: this.config
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
    for (const item of extractUsedTable(table)) this.usedTables.add(item);
  }
  /** @internal */
  getUsedTables() {
    return [...this.usedTables];
  }
  createJoin(joinType, lateral) {
    return (table, on) => {
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      for (const item of extractUsedTable(table)) this.usedTables.add(item);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      this.config.joins.push({ on, table, joinType, alias: tableName, lateral });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "cross":
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  leftJoin = this.createJoin("left", false);
  /**
   * Executes a `left join lateral` operation by adding subquery to the current query.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  leftJoinLateral = this.createJoin("left", true);
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  rightJoin = this.createJoin("right", false);
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  innerJoin = this.createJoin("inner", false);
  /**
   * Executes an `inner join lateral` operation, creating a new table by combining rows from two queries that have matching values.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  innerJoinLateral = this.createJoin("inner", true);
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  fullJoin = this.createJoin("full", false);
  /**
   * Executes a `cross join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
   *
   * @param table the table to join.
   *
   * @example
   *
   * ```ts
   * // Select all users, each user with every pet
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .crossJoin(pets)
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .crossJoin(pets)
   * ```
   */
  crossJoin = this.createJoin("cross", false);
  /**
   * Executes a `cross join lateral` operation by combining rows from two queries into a new table.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves all rows from both main and joined queries, merging all rows from each query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join-lateral}
   *
   * @param table the query to join.
   */
  crossJoinLateral = this.createJoin("cross", true);
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getPgSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/pg-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/pg-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/pg-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `intersect all` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets including all duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
   *
   * @example
   *
   * ```ts
   * // Select all products and quantities that are ordered by both regular and VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered
   * })
   * .from(regularCustomerOrders)
   * .intersectAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { intersectAll } from 'drizzle-orm/pg-core'
   *
   * await intersectAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  intersectAll = this.createSetOperator("intersect", true);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/pg-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /**
   * Adds `except all` set operator to the query.
   *
   * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
   *
   * @example
   *
   * ```ts
   * // Select all products that are ordered by regular customers but not by VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered,
   * })
   * .from(regularCustomerOrders)
   * .exceptAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered,
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { exceptAll } from 'drizzle-orm/pg-core'
   *
   * await exceptAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  exceptAll = this.createSetOperator("except", true);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit2) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit2;
    } else {
      this.config.limit = limit2;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /**
   * Adds a `for` clause to the query.
   *
   * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
   *
   * See docs: {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE}
   *
   * @param strength the lock strength.
   * @param config the lock configuration.
   */
  for(strength, config = {}) {
    this.config.lockingClause = { strength, config };
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    const usedTables = [];
    usedTables.push(...extractUsedTable(this.config.table));
    if (this.config.joins) {
      for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
    }
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
  $withCache(config) {
    this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
    return this;
  }
};
var PgSelectBase = class extends PgSelectQueryBuilderBase {
  static {
    __name(this, "PgSelectBase");
  }
  static [entityKind] = "PgSelect";
  /** @internal */
  _prepare(name) {
    const { session, config, dialect, joinsNotNullableMap, authToken, cacheConfig, usedTables } = this;
    if (!session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const { fields } = config;
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const fieldsList = orderSelectedFields(fields);
      const query = session.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name, true, void 0, {
        type: "select",
        tables: [...usedTables]
      }, cacheConfig);
      query.joinsNotNullableMap = joinsNotNullableMap;
      return query.setToken(authToken);
    });
  }
  /**
   * Create a prepared statement for this query. This allows
   * the database to remember this query for the given session
   * and call it by name, rather than specifying the full query.
   *
   * {@link https://www.postgresql.org/docs/current/sql-prepare.html | Postgres prepare documentation}
   */
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = /* @__PURE__ */ __name((placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  }, "execute");
};
applyMixins(PgSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
__name(createSetOperator, "createSetOperator");
var getPgSetOperators = /* @__PURE__ */ __name(() => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
}), "getPgSetOperators");
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var intersectAll = createSetOperator("intersect", true);
var except = createSetOperator("except", false);
var exceptAll = createSetOperator("except", true);
var QueryBuilder = class {
  static {
    __name(this, "QueryBuilder");
  }
  static [entityKind] = "PgQueryBuilder";
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, PgDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, PgDialect) ? void 0 : dialect;
  }
  $with = /* @__PURE__ */ __name((alias, selection) => {
    const queryBuilder = this;
    const as = /* @__PURE__ */ __name((qb) => {
      if (typeof qb === "function") {
        qb = qb(queryBuilder);
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    }, "as");
    return { as };
  }, "$with");
  with(...queries) {
    const self = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    __name(select, "select");
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        distinct: true
      });
    }
    __name(selectDistinct, "selectDistinct");
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        distinct: { on }
      });
    }
    __name(selectDistinctOn, "selectDistinctOn");
    return { select, selectDistinct, selectDistinctOn };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect()
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: { on }
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new PgDialect(this.dialectConfig);
    }
    return this.dialect;
  }
};
function extractUsedTable(table) {
  if (is(table, PgTable)) {
    return [table[Schema] ? `${table[Schema]}.${table[Table.Symbol.BaseName]}` : table[Table.Symbol.BaseName]];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}
__name(extractUsedTable, "extractUsedTable");
var PgDeleteBase = class extends QueryPromise {
  static {
    __name(this, "PgDeleteBase");
  }
  constructor(table, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  static [entityKind] = "PgDelete";
  config;
  cacheConfig;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * await db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * await db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * await db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
        type: "delete",
        tables: extractUsedTable(this.config.table)
      }, this.cacheConfig);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = /* @__PURE__ */ __name((placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  }, "execute");
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
};
var PgInsertBuilder = class {
  static {
    __name(this, "PgInsertBuilder");
  }
  constructor(table, session, dialect, withList, overridingSystemValue_) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
    this.overridingSystemValue_ = overridingSystemValue_;
  }
  static [entityKind] = "PgInsertBuilder";
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  overridingSystemValue() {
    this.overridingSystemValue_ = true;
    return this;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new PgInsertBase(
      this.table,
      mappedValues,
      this.session,
      this.dialect,
      this.withList,
      false,
      this.overridingSystemValue_
    ).setToken(this.authToken);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new PgInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
  }
};
var PgInsertBase = class extends QueryPromise {
  static {
    __name(this, "PgInsertBase");
  }
  constructor(table, values, session, dialect, withList, select, overridingSystemValue_) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, withList, select, overridingSystemValue_ };
  }
  static [entityKind] = "PgInsert";
  config;
  cacheConfig;
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (config.target === void 0) {
      this.config.onConflict = sql`do nothing`;
    } else {
      let targetColumn = "";
      targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
      const whereSql = config.where ? sql` where ${config.where}` : void 0;
      this.config.onConflict = sql`(${sql.raw(targetColumn)})${whereSql} do nothing`;
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     targetWhere: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    if (config.where && (config.targetWhere || config.setWhere)) {
      throw new Error(
        'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
      );
    }
    const whereSql = config.where ? sql` where ${config.where}` : void 0;
    const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
    const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    let targetColumn = "";
    targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
    this.config.onConflict = sql`(${sql.raw(targetColumn)})${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }, this.cacheConfig);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = /* @__PURE__ */ __name((placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  }, "execute");
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
};
var PgRefreshMaterializedView = class extends QueryPromise {
  static {
    __name(this, "PgRefreshMaterializedView");
  }
  constructor(view, session, dialect) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { view };
  }
  static [entityKind] = "PgRefreshMaterializedView";
  config;
  concurrently() {
    if (this.config.withNoData !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.concurrently = true;
    return this;
  }
  withNoData() {
    if (this.config.concurrently !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.withNoData = true;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildRefreshMaterializedViewQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, name, true);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = /* @__PURE__ */ __name((placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  }, "execute");
};
var PgUpdateBuilder = class {
  static {
    __name(this, "PgUpdateBuilder");
  }
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "PgUpdateBuilder";
  authToken;
  setToken(token) {
    this.authToken = token;
    return this;
  }
  set(values) {
    return new PgUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    ).setToken(this.authToken);
  }
};
var PgUpdateBase = class extends QueryPromise {
  static {
    __name(this, "PgUpdateBase");
  }
  constructor(table, set, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList, joins: [] };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  static [entityKind] = "PgUpdate";
  config;
  tableName;
  joinsNotNullableMap;
  cacheConfig;
  from(source) {
    const src = source;
    const tableName = getTableLikeName(src);
    if (typeof tableName === "string") {
      this.joinsNotNullableMap[tableName] = true;
    }
    this.config.from = src;
    return this;
  }
  getTableLikeFields(table) {
    if (is(table, PgTable)) {
      return table[Table.Symbol.Columns];
    } else if (is(table, Subquery)) {
      return table._.selectedFields;
    }
    return table[ViewBaseConfig].selectedFields;
  }
  createJoin(joinType) {
    return (table, on) => {
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (typeof on === "function") {
        const from = this.config.from && !is(this.config.from, SQL) ? this.getTableLikeFields(this.config.from) : void 0;
        on = on(
          new Proxy(
            this.config.table[Table.Symbol.Columns],
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          ),
          from && new Proxy(
            from,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  leftJoin = this.createJoin("left");
  rightJoin = this.createJoin("right");
  innerJoin = this.createJoin("inner");
  fullJoin = this.createJoin("full");
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * await db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * await db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields) {
    if (!fields) {
      fields = Object.assign({}, this.config.table[Table.Symbol.Columns]);
      if (this.config.from) {
        const tableName = getTableLikeName(this.config.from);
        if (typeof tableName === "string" && this.config.from && !is(this.config.from, SQL)) {
          const fromFields = this.getTableLikeFields(this.config.from);
          fields[tableName] = fromFields;
        }
        for (const join of this.config.joins) {
          const tableName2 = getTableLikeName(join.table);
          if (typeof tableName2 === "string" && !is(join.table, SQL)) {
            const fromFields = this.getTableLikeFields(join.table);
            fields[tableName2] = fromFields;
          }
        }
      }
    }
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
      type: "insert",
      tables: extractUsedTable(this.config.table)
    }, this.cacheConfig);
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = /* @__PURE__ */ __name((placeholderValues) => {
    return this._prepare().execute(placeholderValues, this.authToken);
  }, "execute");
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
};
var PgCountBuilder = class _PgCountBuilder extends SQL {
  static {
    __name(this, "_PgCountBuilder");
  }
  constructor(params) {
    super(_PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    this.params = params;
    this.mapWith(Number);
    this.session = params.session;
    this.sql = _PgCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  token;
  static [entityKind] = "PgCountBuilder";
  [Symbol.toStringTag] = "PgCountBuilder";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
  }
  /** @intrnal */
  setToken(token) {
    this.token = token;
    return this;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql, this.token)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
};
var RelationalQueryBuilder = class {
  static {
    __name(this, "RelationalQueryBuilder");
  }
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
  }
  static [entityKind] = "PgRelationalQueryBuilder";
  findMany(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    );
  }
  findFirst(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
};
var PgRelationalQuery = class extends QueryPromise {
  static {
    __name(this, "PgRelationalQuery");
  }
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config;
    this.mode = mode;
  }
  static [entityKind] = "PgRelationalQuery";
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const { query, builtQuery } = this._toSQL();
      return this.session.prepareQuery(
        builtQuery,
        void 0,
        name,
        true,
        (rawRows, mapColumnValue) => {
          const rows = rawRows.map(
            (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
          );
          if (this.mode === "first") {
            return rows[0];
          }
          return rows;
        }
      );
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  _getQuery() {
    return this.dialect.buildRelationalQueryWithoutPK({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
  }
  /** @internal */
  getSQL() {
    return this._getQuery().sql;
  }
  _toSQL() {
    const query = this._getQuery();
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute() {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(void 0, this.authToken);
    });
  }
};
var PgRaw = class extends QueryPromise {
  static {
    __name(this, "PgRaw");
  }
  constructor(execute, sql2, query, mapBatchResult) {
    super();
    this.execute = execute;
    this.sql = sql2;
    this.query = query;
    this.mapBatchResult = mapBatchResult;
  }
  static [entityKind] = "PgRaw";
  /** @internal */
  getSQL() {
    return this.sql;
  }
  getQuery() {
    return this.query;
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
  /** @internal */
  isResponseInArrayMode() {
    return false;
  }
};
var PgDatabase = class {
  static {
    __name(this, "PgDatabase");
  }
  constructor(dialect, session, schema) {
    this.dialect = dialect;
    this.session = session;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap,
      session
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {},
      session
    };
    this.query = {};
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        this.query[tableName] = new RelationalQueryBuilder(
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session
        );
      }
    }
    this.$cache = { invalidate: /* @__PURE__ */ __name(async (_params) => {
    }, "invalidate") };
  }
  static [entityKind] = "PgDatabase";
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with = /* @__PURE__ */ __name((alias, selection) => {
    const self = this;
    const as = /* @__PURE__ */ __name((qb) => {
      if (typeof qb === "function") {
        qb = qb(new QueryBuilder(self.dialect));
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    }, "as");
    return { as };
  }, "$with");
  $count(source, filters) {
    return new PgCountBuilder({ source, filters, session: this.session });
  }
  $cache;
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    __name(select, "select");
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    __name(selectDistinct, "selectDistinct");
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: { on }
      });
    }
    __name(selectDistinctOn, "selectDistinctOn");
    function update(table) {
      return new PgUpdateBuilder(table, self.session, self.dialect, queries);
    }
    __name(update, "update");
    function insert(table) {
      return new PgInsertBuilder(table, self.session, self.dialect, queries);
    }
    __name(insert, "insert");
    function delete_(table) {
      return new PgDeleteBase(table, self.session, self.dialect, queries);
    }
    __name(delete_, "delete_");
    return { select, selectDistinct, selectDistinctOn, update, insert, delete: delete_ };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: { on }
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new PgUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(table) {
    return new PgInsertBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(table) {
    return new PgDeleteBase(table, this.session, this.dialect);
  }
  refreshMaterializedView(view) {
    return new PgRefreshMaterializedView(view, this.session, this.dialect);
  }
  authToken;
  execute(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    const builtQuery = this.dialect.sqlToQuery(sequel);
    const prepared = this.session.prepareQuery(
      builtQuery,
      void 0,
      void 0,
      false
    );
    return new PgRaw(
      () => prepared.execute(void 0, this.authToken),
      sequel,
      builtQuery,
      (result) => prepared.mapResult(result, true)
    );
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
};
var Cache = class {
  static {
    __name(this, "Cache");
  }
  static [entityKind] = "Cache";
};
var NoopCache = class extends Cache {
  static {
    __name(this, "NoopCache");
  }
  strategy() {
    return "all";
  }
  static [entityKind] = "NoopCache";
  async get(_key) {
    return void 0;
  }
  async put(_hashedQuery, _response, _tables, _config) {
  }
  async onMutate(_params) {
  }
};
async function hashQuery(sql2, params) {
  const dataToHash = `${sql2}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
__name(hashQuery, "hashQuery");
var PgPreparedQuery = class {
  static {
    __name(this, "PgPreparedQuery");
  }
  constructor(query, cache, queryMetadata, cacheConfig) {
    this.query = query;
    this.cache = cache;
    this.queryMetadata = queryMetadata;
    this.cacheConfig = cacheConfig;
    if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
      this.cacheConfig = { enable: true, autoInvalidate: true };
    }
    if (!this.cacheConfig?.enable) {
      this.cacheConfig = void 0;
    }
  }
  authToken;
  getQuery() {
    return this.query;
  }
  mapResult(response, _isFromBatch) {
    return response;
  }
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  static [entityKind] = "PgPreparedQuery";
  /** @internal */
  joinsNotNullableMap;
  /** @internal */
  async queryWithCache(queryString, params, query) {
    if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.cacheConfig && !this.cacheConfig.enable) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
      try {
        const [res] = await Promise.all([
          query(),
          this.cache.onMutate({ tables: this.queryMetadata.tables })
        ]);
        return res;
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (!this.cacheConfig) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.queryMetadata.type === "select") {
      const fromCache = await this.cache.get(
        this.cacheConfig.tag ?? await hashQuery(queryString, params),
        this.queryMetadata.tables,
        this.cacheConfig.tag !== void 0,
        this.cacheConfig.autoInvalidate
      );
      if (fromCache === void 0) {
        let result;
        try {
          result = await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
        await this.cache.put(
          this.cacheConfig.tag ?? await hashQuery(queryString, params),
          result,
          // make sure we send tables that were used in a query only if user wants to invalidate it on each write
          this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
          this.cacheConfig.tag !== void 0,
          this.cacheConfig.config
        );
        return result;
      }
      return fromCache;
    }
    try {
      return await query();
    } catch (e) {
      throw new DrizzleQueryError(queryString, params, e);
    }
  }
};
var PgSession = class {
  static {
    __name(this, "PgSession");
  }
  constructor(dialect) {
    this.dialect = dialect;
  }
  static [entityKind] = "PgSession";
  /** @internal */
  execute(query, token) {
    return tracer.startActiveSpan("drizzle.operation", () => {
      const prepared = tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.prepareQuery(
          this.dialect.sqlToQuery(query),
          void 0,
          void 0,
          false
        );
      });
      return prepared.setToken(token).execute(void 0, token);
    });
  }
  all(query) {
    return this.prepareQuery(
      this.dialect.sqlToQuery(query),
      void 0,
      void 0,
      false
    ).all();
  }
  /** @internal */
  async count(sql2, token) {
    const res = await this.execute(sql2, token);
    return Number(
      res[0]["count"]
    );
  }
};
var PgTransaction = class extends PgDatabase {
  static {
    __name(this, "PgTransaction");
  }
  constructor(dialect, session, schema, nestedIndex = 0) {
    super(dialect, session, schema);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  static [entityKind] = "PgTransaction";
  rollback() {
    throw new TransactionRollbackError();
  }
  /** @internal */
  getTransactionConfigSQL(config) {
    const chunks = [];
    if (config.isolationLevel) {
      chunks.push(`isolation level ${config.isolationLevel}`);
    }
    if (config.accessMode) {
      chunks.push(config.accessMode);
    }
    if (typeof config.deferrable === "boolean") {
      chunks.push(config.deferrable ? "deferrable" : "not deferrable");
    }
    return sql.raw(chunks.join(" "));
  }
  setTransaction(config) {
    return this.session.execute(sql`set transaction ${this.getTransactionConfigSQL(config)}`);
  }
};
var rawQueryConfig = {
  arrayMode: false,
  fullResults: true
};
var queryConfig = {
  arrayMode: true,
  fullResults: true
};
var NeonHttpPreparedQuery = class extends PgPreparedQuery {
  static {
    __name(this, "NeonHttpPreparedQuery");
  }
  constructor(client, query, logger, cache, queryMetadata, cacheConfig, fields, _isResponseInArrayMode, customResultMapper) {
    super(query, cache, queryMetadata, cacheConfig);
    this.client = client;
    this.logger = logger;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
    this.clientQuery = client.query ?? client;
  }
  static [entityKind] = "NeonHttpPreparedQuery";
  clientQuery;
  /** @internal */
  async execute(placeholderValues = {}, token = this.authToken) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    const { fields, clientQuery, query, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      return this.queryWithCache(query.sql, params, async () => {
        return clientQuery(
          query.sql,
          params,
          token === void 0 ? rawQueryConfig : {
            ...rawQueryConfig,
            authToken: token
          }
        );
      });
    }
    const result = await this.queryWithCache(query.sql, params, async () => {
      return await clientQuery(
        query.sql,
        params,
        token === void 0 ? queryConfig : {
          ...queryConfig,
          authToken: token
        }
      );
    });
    return this.mapResult(result);
  }
  mapResult(result) {
    if (!this.fields && !this.customResultMapper) {
      return result;
    }
    const rows = result.rows;
    if (this.customResultMapper) {
      return this.customResultMapper(rows);
    }
    return rows.map((row) => mapResultRow(this.fields, row, this.joinsNotNullableMap));
  }
  all(placeholderValues = {}) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    return this.clientQuery(
      this.query.sql,
      params,
      this.authToken === void 0 ? rawQueryConfig : {
        ...rawQueryConfig,
        authToken: this.authToken
      }
    ).then((result) => result.rows);
  }
  /** @internal */
  values(placeholderValues = {}, token) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    return this.clientQuery(this.query.sql, params, { arrayMode: true, fullResults: true, authToken: token }).then((result) => result.rows);
  }
  /** @internal */
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
};
var NeonHttpSession = class extends PgSession {
  static {
    __name(this, "NeonHttpSession");
  }
  constructor(client, dialect, schema, options = {}) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.options = options;
    this.clientQuery = client.query ?? client;
    this.logger = options.logger ?? new NoopLogger();
    this.cache = options.cache ?? new NoopCache();
  }
  static [entityKind] = "NeonHttpSession";
  clientQuery;
  logger;
  cache;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return new NeonHttpPreparedQuery(
      this.client,
      query,
      this.logger,
      this.cache,
      queryMetadata,
      cacheConfig,
      fields,
      isResponseInArrayMode,
      customResultMapper
    );
  }
  async batch(queries) {
    const preparedQueries = [];
    const builtQueries = [];
    for (const query of queries) {
      const preparedQuery = query._prepare();
      const builtQuery = preparedQuery.getQuery();
      preparedQueries.push(preparedQuery);
      builtQueries.push(
        this.clientQuery(builtQuery.sql, builtQuery.params, {
          fullResults: true,
          arrayMode: preparedQuery.isResponseInArrayMode()
        })
      );
    }
    const batchResults = await this.client.transaction(builtQueries, queryConfig);
    return batchResults.map((result, i) => preparedQueries[i].mapResult(result, true));
  }
  // change return type to QueryRows<true>
  async query(query, params) {
    this.logger.logQuery(query, params);
    const result = await this.clientQuery(query, params, { arrayMode: true, fullResults: true });
    return result;
  }
  // change return type to QueryRows<false>
  async queryObjects(query, params) {
    return this.clientQuery(query, params, { arrayMode: false, fullResults: true });
  }
  /** @internal */
  async count(sql2, token) {
    const res = await this.execute(sql2, token);
    return Number(
      res["rows"][0]["count"]
    );
  }
  async transaction(_transaction, _config = {}) {
    throw new Error("No transactions support in neon-http driver");
  }
};
var NeonTransaction = class extends PgTransaction {
  static {
    __name(this, "NeonTransaction");
  }
  static [entityKind] = "NeonHttpTransaction";
  async transaction(_transaction) {
    throw new Error("No transactions support in neon-http driver");
  }
};
var NeonHttpDriver = class {
  static {
    __name(this, "NeonHttpDriver");
  }
  constructor(client, dialect, options = {}) {
    this.client = client;
    this.dialect = dialect;
    this.options = options;
    this.initMappers();
  }
  static [entityKind] = "NeonHttpDriver";
  createSession(schema) {
    return new NeonHttpSession(this.client, this.dialect, schema, {
      logger: this.options.logger,
      cache: this.options.cache
    });
  }
  initMappers() {
    export_types.setTypeParser(export_types.builtins.TIMESTAMPTZ, (val) => val);
    export_types.setTypeParser(export_types.builtins.TIMESTAMP, (val) => val);
    export_types.setTypeParser(export_types.builtins.DATE, (val) => val);
    export_types.setTypeParser(export_types.builtins.INTERVAL, (val) => val);
    export_types.setTypeParser(1231, (val) => val);
    export_types.setTypeParser(1115, (val) => val);
    export_types.setTypeParser(1185, (val) => val);
    export_types.setTypeParser(1187, (val) => val);
    export_types.setTypeParser(1182, (val) => val);
  }
};
function wrap(target, token, cb, deep) {
  return new Proxy(target, {
    get(target2, p2) {
      const element = target2[p2];
      if (typeof element !== "function" && (typeof element !== "object" || element === null)) return element;
      if (deep) return wrap(element, token, cb);
      if (p2 === "query") return wrap(element, token, cb, true);
      return new Proxy(element, {
        apply(target3, thisArg, argArray) {
          const res = target3.call(thisArg, ...argArray);
          if (typeof res === "object" && res !== null && "setToken" in res && typeof res.setToken === "function") {
            res.setToken(token);
          }
          return cb(target3, p2, res);
        }
      });
    }
  });
}
__name(wrap, "wrap");
var NeonHttpDatabase = class extends PgDatabase {
  static {
    __name(this, "NeonHttpDatabase");
  }
  static [entityKind] = "NeonHttpDatabase";
  $withAuth(token) {
    this.authToken = token;
    return wrap(this, token, (target, p2, res) => {
      if (p2 === "with") {
        return wrap(res, token, (_2, __, res2) => res2);
      }
      return res;
    });
  }
  async batch(batch) {
    return this.session.batch(batch);
  }
};
function construct(client, config = {}) {
  const dialect = new PgDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new NeonHttpDriver(client, dialect, { logger, cache: config.cache });
  const session = driver.createSession(schema);
  const db2 = new NeonHttpDatabase(
    dialect,
    session,
    schema
  );
  db2.$client = client;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
__name(construct, "construct");
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const instance = Ys(params[0]);
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client) return construct(client, drizzleConfig);
    if (typeof connection === "object") {
      const { connectionString, ...options } = connection;
      const instance2 = Ys(connectionString, options);
      return construct(instance2, drizzleConfig);
    }
    const instance = Ys(connection);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
__name(drizzle, "drizzle");
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  __name(mock, "mock");
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));
var schema_exports = {};
__export(schema_exports, {
  conversations: /* @__PURE__ */ __name(() => conversations, "conversations"),
  messages: /* @__PURE__ */ __name(() => messages, "messages"),
  newsCache: /* @__PURE__ */ __name(() => newsCache, "newsCache"),
  oauthTokens: /* @__PURE__ */ __name(() => oauthTokens, "oauthTokens"),
  quotes: /* @__PURE__ */ __name(() => quotes, "quotes"),
  statCache: /* @__PURE__ */ __name(() => statCache, "statCache"),
  users: /* @__PURE__ */ __name(() => users, "users")
});
var users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  platform: text("platform").notNull(),
  username: text("username"),
  isChelseaFan: boolean("is_chelsea_fan").default(false),
  rivalIntensity: smallint("rival_intensity").default(0),
  favoritePlayer: text("favorite_player"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  platformIdx: index("users_platform_idx").on(table.platform, table.id)
}));
var conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  platform: text("platform").notNull(),
  currentTone: text("current_tone").$type().default("professional"),
  lastActive: timestamp("last_active").defaultNow()
});
var messages = pgTable("messages", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  convoId: uuid("convo_id").references(() => conversations.id, { onDelete: "cascade" }),
  platformMessageId: text("platform_message_id"),
  direction: text("direction").$type().notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  modelUsed: text("model_used"),
  tokenUsage: integer("token_usage"),
  createdAt: timestamp("created_at").defaultNow()
});
var quotes = pgTable("quotes", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  player: text("player").notNull(),
  content: text("content").notNull(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow()
});
var newsCache = pgTable("news_cache", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  player: text("player"),
  data: jsonb("data"),
  expiresAt: timestamp("expires_at")
});
var statCache = pgTable("stat_cache", {
  key: text("key").primaryKey(),
  data: jsonb("data"),
  expiresAt: timestamp("expires_at")
});
var oauthTokens = pgTable("oauth_tokens", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" }),
  platform: text("platform").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});
if (typeof globalThis.WebSocket !== "undefined") {
  _e.webSocketConstructor = globalThis.WebSocket;
}
var _db = null;
function getDb() {
  if (_db) return _db;
  const sql2 = Ys(env.NEON_DATABASE_URL);
  _db = drizzle(sql2, { schema: schema_exports });
  return _db;
}
__name(getDb, "getDb");
var db = new Proxy({}, {
  get(_target, prop) {
    return getDb()[prop];
  }
});
var dashboard_default = withErrorLogging(/* @__PURE__ */ __name(async function handler2() {
  const [upcomingRes, recentRes, recentPosts] = await Promise.all([
    getChelseaFixtures({ next: 5 }),
    getChelseaFixtures({ last: 1 }),
    db.select().from(messages).where(eq(messages.direction, "out")).orderBy(desc(messages.createdAt)).limit(10)
  ]);
  const last = recentRes.fixtures[0];
  const stats = last ? await getMatchStats(last.id) : null;
  return new Response(
    JSON.stringify({
      upcoming: upcomingRes.fixtures,
      lastFixture: last || null,
      lastStats: stats,
      recentPosts: recentPosts.map((r) => ({
        id: String(r.id),
        content: r.content,
        createdAt: r.createdAt,
        modelUsed: r.modelUsed
      }))
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}, "handler2"));
var BASE_VOICE = /* @__PURE__ */ __name((tone) => `
You are the Chelsea FC tweet writer for the BlueBanter bot.
Voice: ${tone === "savage" ? "confident, witty, SecretScout-style banter. Never cruel. Never hateful. Never about race, gender, or protected traits. Keep it football." : "calm, analytical, fan-friendly, enthusiastic but measured."}
Hard rules:
- Output ONE tweet only. Plain text. No quotes around it.
- MAX 270 characters (leave room for safety).
- Always end with "#CFC \u{1F499}".
- Never invent stats. Only use numbers explicitly provided in the user message.
- If the user message contains no usable facts, output exactly: SKIP
- Never mention other clubs in a derogatory, discriminatory way. Banter about football only.
- No hashtag spam. One or two hashtags max, with #CFC always last.
`.trim(), "BASE_VOICE");
var tweetPrompts = {
  match_preview: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a MATCH PREVIEW tweet.
Structure: opponent + competition + date + a hook (kick-off, venue, or a key storyline).`, "system"),
    user: /* @__PURE__ */ __name((d) => `Opponent: ${d.opponent}
Competition: ${d.competition}
Date (local): ${d.date}
Venue: ${d.venue ?? "TBD"}
Hook: ${d.hook ?? "none"}`, "user")
  },
  live_update: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a LIVE MATCH UPDATE tweet.
Structure: minute + event (goal / card / sub) + scoreline + one supporting stat (possession or xG).`, "system"),
    user: /* @__PURE__ */ __name((d) => `Minute: ${d.minute}
Event: ${d.event}
Scorer/actor: ${d.actor ?? "n/a"}
Score: ${d.score}
Possession: ${d.possession ?? "n/a"}%
xG: ${d.xg ?? "n/a"}`, "user")
  },
  post_match: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a POST-MATCH tweet.
Structure: final scoreline + possession + xG + shots + MOTM (if provided).`, "system"),
    user: /* @__PURE__ */ __name((d) => `Final: ${d.score}
Possession: ${d.possession}%
xG: ${d.xg}
Shots (on target / total): ${d.shotsOnTarget}/${d.shotsTotal}
MOTM: ${d.motm ?? "n/a"} (${d.motmRating ?? "n/a"})`, "user")
  },
  player_stat: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a PLAYER STAT highlight tweet.
Structure: player name + standout number(s) + short context.`, "system"),
    user: /* @__PURE__ */ __name((d) => `Player: ${d.player}
Season: ${d.season}
Goals: ${d.goals ?? "n/a"}
Assists: ${d.assists ?? "n/a"}
Appearances: ${d.apps ?? "n/a"}
Extra stat (tackles, xG, pass%, key passes...): ${d.extra ?? "n/a"}`, "user")
  },
  transfer_news: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a TRANSFER NEWS tweet.
Structure: player + direction (in/out/linked) + fee (if known) + source.
If reliability is 'rumor', use softening language like "reports" or "linked with".`, "system"),
    user: /* @__PURE__ */ __name((d) => `Player: ${d.player}
Direction: ${d.direction}
Fee: ${d.fee ?? "undisclosed"}
From/To: ${d.counterparty ?? "n/a"}
Reliability: ${d.reliability ?? "rumor"}
Source: ${d.source ?? "n/a"}`, "user")
  },
  weekly_deep_dive: {
    system: /* @__PURE__ */ __name((tone) => `${BASE_VOICE(tone)}
Task: Write a WEEKLY DEEP-DIVE tweet.
Structure: a thematic insight (form, a player arc, a tactical trend) backed by one or two numbers.`, "system"),
    user: /* @__PURE__ */ __name((d) => `Theme: ${d.theme}
Key numbers: ${d.numbers}
Window: ${d.window ?? "last 5 matches"}`, "user")
  }
};
var SUFFIX = "#CFC \u{1F499}";
function normalizeTweet(raw) {
  let t = (raw || "").trim();
  if (t === "SKIP") return "";
  t = t.replace(/^["“'`]+|["”'`]+$/g, "");
  t = t.replace(/\s+/g, " ").trim();
  if (!/#CFC/i.test(t)) t = `${t} ${SUFFIX}`.trim();
  if (!t.includes("\u{1F499}")) t = `${t} \u{1F499}`.trim();
  if (t.length > 280) {
    const suffixRe = /\s*#CFC\s*💙\s*$/i;
    const body = t.replace(suffixRe, "").trim();
    const maxBody = 280 - (SUFFIX.length + 1);
    const trimmed = body.slice(0, maxBody - 1).replace(/\s+\S*$/, "") + "\u2026";
    t = `${trimmed} ${SUFFIX}`;
  }
  return t;
}
__name(normalizeTweet, "normalizeTweet");
function buildTweetMessages(kind2, tone, data) {
  const spec = tweetPrompts[kind2];
  return [
    { role: "system", content: spec.system(tone) },
    { role: "user", content: spec.user(data) }
  ];
}
__name(buildTweetMessages, "buildTweetMessages");
var VALID_KINDS = [
  "match_preview",
  "live_update",
  "post_match",
  "player_stat",
  "transfer_news",
  "weekly_deep_dive"
];
var generate_tweet_default = withErrorLogging(/* @__PURE__ */ __name(async function handler3(req) {
  if (req.method !== "POST") {
    return json2({ error: "POST only" }, 405);
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return json2({ error: "invalid JSON" }, 400);
  }
  if (!body || !VALID_KINDS.includes(body.kind)) {
    return json2({ error: "invalid kind", allowed: VALID_KINDS }, 400);
  }
  const tone = body.tone === "savage" ? "savage" : "professional";
  const messages2 = buildTweetMessages(body.kind, tone, body.data || {});
  const res = await routeAndChat({ messages: messages2 });
  const tweet = normalizeTweet(res.content);
  return json2({
    kind: body.kind,
    tone,
    model: res.model,
    tweet,
    length: tweet.length
  });
}, "handler3"));
function json2(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
__name(json2, "json2");
var prewarm_default = withErrorLogging(/* @__PURE__ */ __name(async function handler4() {
  const started = Date.now();
  const ms2 = Date.now() - started;
  return new Response("ok", { status: 200, headers: { "x-prewarm-ms": String(ms2), "Cache-Control": "no-store" } });
}, "handler4"));
function createAuthUrl(clientId, redirectUri, state) {
  const u = new URL("https://twitter.com/i/oauth2/authorize");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "tweet.read tweet.write users.read offline.access");
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", state);
  u.searchParams.set("code_challenge_method", "plain");
  return u.toString();
}
__name(createAuthUrl, "createAuthUrl");
function basicAuthHeader(user, pass) {
  const raw = `${user}:${pass}`;
  const b64 = typeof globalThis.btoa === "function" ? globalThis.btoa(raw) : Buffer.from(raw, "utf8").toString("base64");
  return `Basic ${b64}`;
}
__name(basicAuthHeader, "basicAuthHeader");
async function publishTweet(token, text2) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: text2 })
  });
  const json6 = await res.json();
  return { id: json6?.data?.id || "" };
}
__name(publishTweet, "publishTweet");
async function startOAuth(state) {
  const url = createAuthUrl(env.X_CLIENT_ID || "", env.X_REDIRECT_URI || "", state);
  return { url, verifier: state };
}
__name(startOAuth, "startOAuth");
async function completeOAuth(state, code) {
  const clientId = env.X_CLIENT_ID || "";
  const clientSecret = env.X_CLIENT_SECRET || "";
  const redirectUri = env.X_REDIRECT_URI || "";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: state
  });
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  if (clientSecret) headers.Authorization = basicAuthHeader(clientId, clientSecret);
  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body
  });
  const json6 = await res.json();
  const accessToken = json6?.access_token || "";
  const refreshToken = json6?.refresh_token || void 0;
  const expiresIn = json6?.expires_in || 0;
  const expiresAt = new Date(Date.now() + Number(expiresIn || 0) * 1e3);
  await db.insert(oauthTokens).values({ platform: "x", accessToken, refreshToken: refreshToken || null, expiresAt });
  return { accessToken, refreshToken, expiresAt };
}
__name(completeOAuth, "completeOAuth");
async function getLatestToken(userId) {
  const rows = await db.select().from(oauthTokens).orderBy(desc(oauthTokens.createdAt)).limit(1);
  if (!rows[0]) return null;
  return { accessToken: rows[0].accessToken, refreshToken: rows[0].refreshToken || void 0, expiresAt: rows[0].expiresAt || void 0 };
}
__name(getLatestToken, "getLatestToken");
async function refreshAccessToken(rt) {
  const clientId = env.X_CLIENT_ID || "";
  const clientSecret = env.X_CLIENT_SECRET || "";
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rt,
    client_id: clientId
  });
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  if (clientSecret) headers.Authorization = basicAuthHeader(clientId, clientSecret);
  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body
  });
  const json6 = await res.json();
  const accessToken = json6?.access_token || "";
  const refreshToken = json6?.refresh_token || void 0;
  const expiresIn = json6?.expires_in || 0;
  const expiresAt = new Date(Date.now() + Number(expiresIn || 0) * 1e3);
  await db.insert(oauthTokens).values({ platform: "x", accessToken, refreshToken: refreshToken || null, expiresAt });
  return { accessToken, refreshToken, expiresAt };
}
__name(refreshAccessToken, "refreshAccessToken");
async function ensureAccessToken() {
  const tok = await getLatestToken();
  if (!tok) return null;
  const soon = tok.expiresAt ? tok.expiresAt.getTime() - Date.now() < 6e4 : false;
  if (soon && tok.refreshToken) {
    const r = await refreshAccessToken(tok.refreshToken);
    return r.accessToken;
  }
  return tok.accessToken;
}
__name(ensureAccessToken, "ensureAccessToken");
async function publishTweetForUser(text2) {
  const at = await ensureAccessToken();
  if (!at) return { id: "" };
  return publishTweet(at, text2);
}
__name(publishTweetForUser, "publishTweetForUser");
var flags_default = {
  savage_mode_enabled: false,
  image_generation_enabled: true,
  publish_draft_only: true
};
var fixtures_default = withErrorLogging(/* @__PURE__ */ __name(async function handler5() {
  const { fixtures } = await getChelseaFixtures({ next: 1 });
  const next = fixtures[0];
  if (!next) {
    return json3({ skipped: "no upcoming fixture" });
  }
  const dateLocal = new Date(next.date).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
  const m2 = buildTweetMessages("match_preview", "professional", {
    opponent: next.opponent,
    competition: next.competition,
    date: dateLocal,
    venue: next.venue,
    hook: next.isChelseaHome ? "Home fixture at the Bridge." : "Away day."
  });
  const llm = await routeAndChat({ messages: m2 });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json3({ skipped: "llm produced SKIP" });
  let tweetId = "";
  if (!flags_default.publish_draft_only) {
    const idKey = `tweet:fixtures:${next.id}`;
    const firstTime = await once(idKey, 24 * 60 * 60);
    if (firstTime) {
      const res = await publishTweetForUser(tweet);
      tweetId = res.id || "";
    }
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model
  });
  return json3({
    fixtureId: next.id,
    opponent: next.opponent,
    date: next.date,
    tweet,
    posted: Boolean(tweetId),
    tweetId
  });
}, "handler5"));
function json3(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
__name(json3, "json3");
var weekly_default = withErrorLogging(/* @__PURE__ */ __name(async function handler6() {
  const { fixtures } = await getChelseaFixtures({ last: 5 });
  if (!fixtures.length) return json4({ skipped: "no recent fixtures" });
  const summary = fixtures.map((f) => `${f.opponent} (${f.competition}) [${f.status}]`).join(", ");
  const m2 = buildTweetMessages("weekly_deep_dive", "professional", {
    theme: "Form across the last 5 matches",
    numbers: summary,
    window: "last 5 matches"
  });
  const llm = await routeAndChat({ messages: m2 });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json4({ skipped: "llm produced SKIP" });
  let tweetId = "";
  if (!flags_default.publish_draft_only) {
    const weekKey = `tweet:weekly:${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`;
    const firstTime = await once(weekKey, 7 * 24 * 60 * 60);
    if (firstTime) {
      const res = await publishTweetForUser(tweet);
      tweetId = res.id || "";
    }
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model
  });
  return json4({ tweet, posted: Boolean(tweetId), tweetId });
}, "handler6"));
function json4(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
__name(json4, "json4");
async function getLiveEvents(input) {
  const key = `live:${input.matchId || "latest"}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const url = input.matchId ? `https://v3.football.api-sports.io/fixtures?id=${input.matchId}` : `https://v3.football.api-sports.io/fixtures?live=all`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" }
  });
  const json6 = await res.json();
  const data = {
    events: json6.response || [],
    matchId: input.matchId,
    citation: url
  };
  await setCache(key, data, 1e4);
  return data;
}
__name(getLiveEvents, "getLiveEvents");
async function getPlayerStats(input) {
  const key = `stats:${input.name}:${input.season || ""}`;
  const hot = await getCache(key);
  if (hot) return hot;
  const warm = await db.select().from(statCache).where(eq(statCache.key, key)).limit(1);
  if (warm[0] && warm[0].expiresAt && warm[0].expiresAt > /* @__PURE__ */ new Date()) {
    const data2 = warm[0].data;
    await setCache(key, data2, 6e4);
    return data2;
  }
  const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(
    input.name
  )}${input.season ? `&season=${input.season}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" }
  });
  const json6 = await res.json();
  const data = {
    name: input.name,
    season: input.season,
    stats: json6.response || [],
    citation: url
  };
  await setCache(key, data, 6 * 60 * 60 * 1e3);
  await db.insert(statCache).values({ key, data, expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1e3) }).onConflictDoUpdate({
    target: statCache.key,
    set: { data, expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1e3) }
  });
  return data;
}
__name(getPlayerStats, "getPlayerStats");
async function fetchQuotes(input) {
  const key = `quotes:${input.player}:${input.days || 0}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const tavilyUrl = "https://api.tavily.com/search";
  const body = {
    api_key: env.TAVILY_API_KEY || "",
    query: `${input.player} quotes site:x.com OR site:twitter.com`,
    max_results: 5
  };
  const res = await fetch(tavilyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json6 = await res.json();
  const data = {
    player: input.player,
    quotes: json6.results || [],
    citation: tavilyUrl
  };
  await setCache(key, data, 24 * 60 * 60 * 1e3);
  return data;
}
__name(fetchQuotes, "fetchQuotes");
async function fetchNews(input) {
  const key = `news:${input.player || "all"}:${input.hours || 0}`;
  const hot = await getCache(key);
  if (hot) return hot;
  const warm = await db.select().from(newsCache).limit(1);
  if (warm[0] && warm[0].expiresAt && warm[0].expiresAt > /* @__PURE__ */ new Date()) {
    const data2 = warm[0].data;
    await setCache(key, data2, 6e4);
    return data2;
  }
  const feedUrl = "https://www.chelseafc.com/en/news/latest.rss";
  const feedRes = await fetch(feedUrl);
  const xml = await feedRes.text();
  const items = parseRssItems(xml);
  const data = {
    player: input.player,
    articles: items,
    citation: feedUrl
  };
  await setCache(key, data, 4 * 60 * 60 * 1e3);
  await db.insert(newsCache).values({
    player: input.player || null,
    data,
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1e3)
  });
  return data;
}
__name(fetchNews, "fetchNews");
function parseRssItems(xml) {
  const items = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, 20)) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const guid = extractTag(block, "guid");
    const description = extractTag(block, "description");
    items.push({
      title,
      link,
      pubDate,
      guid,
      contentSnippet: description
    });
  }
  return items;
}
__name(parseRssItems, "parseRssItems");
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m2 = xml.match(re);
  if (!m2) return "";
  return stripCdata(m2[1]).trim();
}
__name(extractTag, "extractTag");
function stripCdata(s) {
  const v2 = s.replace(/^<!\[CDATA\[/i, "").replace(/\]\]>$/i, "");
  return v2.replace(/<[^>]+>/g, "");
}
__name(stripCdata, "stripCdata");
async function fetchExpertCommentary(input) {
  const key = `commentary:${input.player}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const tavilyUrl = "https://api.tavily.com/search";
  const body = {
    api_key: env.TAVILY_API_KEY || "",
    query: `${input.player} analysis site:youtube.com`,
    max_results: 5
  };
  const res = await fetch(tavilyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json6 = await res.json();
  const data = {
    player: input.player,
    items: json6.results || [],
    citation: tavilyUrl
  };
  await setCache(key, data, 48 * 60 * 60 * 1e3);
  return data;
}
__name(fetchExpertCommentary, "fetchExpertCommentary");
async function generateImage2(input) {
  const key = `image:${input.prompt}:${input.style}`;
  const cached = await getCache(key);
  if (cached) return cached;
  const gen = await generateImage({
    prompt: `${input.style} ${input.prompt}`,
    size: "1024x1024"
  });
  const data = {
    url: gen.url || "",
    prompt: input.prompt,
    style: input.style,
    citation: gen.model
  };
  await setCache(key, data, 24 * 60 * 60 * 1e3);
  return data;
}
__name(generateImage2, "generateImage2");
var LIVE_STATUSES = /* @__PURE__ */ new Set(["1H", "2H", "ET", "HT", "BT", "P"]);
var FINAL_STATUSES = /* @__PURE__ */ new Set(["FT", "AET", "PEN"]);
var match_day_default = withErrorLogging(/* @__PURE__ */ __name(async function handler7() {
  const live = await getLiveEvents({});
  const events = live.events || [];
  const chelseaGame = events.find(
    (e) => e?.teams?.home?.id === CHELSEA_TEAM_ID || e?.teams?.away?.id === CHELSEA_TEAM_ID
  );
  if (!chelseaGame) return json5({ skipped: "no chelsea fixture live" });
  const status = chelseaGame?.fixture?.status?.short || "";
  const fixtureId = chelseaGame?.fixture?.id || 0;
  const homeGoals = chelseaGame?.goals?.home ?? 0;
  const awayGoals = chelseaGame?.goals?.away ?? 0;
  const score = `${homeGoals}-${awayGoals}`;
  const minute = chelseaGame?.fixture?.status?.elapsed ?? null;
  if (LIVE_STATUSES.has(status)) {
    return await handleLive({ fixtureId, score, minute, status });
  }
  if (FINAL_STATUSES.has(status)) {
    return await handlePostMatch({ fixtureId, score });
  }
  return json5({ skipped: `status=${status}`, fixtureId });
}, "handler7"));
async function handleLive(args) {
  const key = `tweet:live:${args.fixtureId}:${args.score}`;
  const firstTime = await once(key, 20 * 60);
  if (!firstTime) return json5({ skipped: "already tweeted this scoreline" });
  const stats = await getMatchStats(args.fixtureId);
  const m2 = buildTweetMessages("live_update", "professional", {
    minute: args.minute ?? args.status,
    event: "Score update",
    actor: "n/a",
    score: args.score,
    possession: stats.possession,
    xg: stats.xg
  });
  const llm = await routeAndChat({ messages: m2 });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json5({ skipped: "llm produced SKIP" });
  let tweetId = "";
  if (!flags_default.publish_draft_only) {
    const res = await publishTweetForUser(tweet);
    tweetId = res.id || "";
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model
  });
  return json5({ type: "live", tweet, posted: Boolean(tweetId), tweetId });
}
__name(handleLive, "handleLive");
async function handlePostMatch(args) {
  const key = `tweet:postmatch:${args.fixtureId}`;
  const firstTime = await once(key, 24 * 60 * 60);
  if (!firstTime) return json5({ skipped: "post-match already sent" });
  const stats = await getMatchStats(args.fixtureId);
  const m2 = buildTweetMessages("post_match", "professional", {
    score: args.score,
    possession: stats.possession ?? "n/a",
    xg: stats.xg ?? "n/a",
    shotsOnTarget: stats.shotsOnTarget ?? "n/a",
    shotsTotal: stats.shotsTotal ?? "n/a",
    motm: "n/a",
    motmRating: "n/a"
  });
  const llm = await routeAndChat({ messages: m2 });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json5({ skipped: "llm produced SKIP" });
  let tweetId = "";
  if (!flags_default.publish_draft_only) {
    const res = await publishTweetForUser(tweet);
    tweetId = res.id || "";
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model
  });
  return json5({ type: "post_match", tweet, posted: Boolean(tweetId), tweetId });
}
__name(handlePostMatch, "handlePostMatch");
function json5(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
__name(json5, "json5");
var auth_default = withErrorLogging(/* @__PURE__ */ __name(async function handler8(req) {
  const state = crypto.randomUUID();
  const { url } = await startOAuth(state);
  return Response.redirect(url, 302);
}, "handler8"));
var callback_default = withErrorLogging(/* @__PURE__ */ __name(async function handler9(req) {
  const u = new URL(req.url);
  const state = u.searchParams.get("state") || "";
  const code = u.searchParams.get("code") || "";
  const t = await completeOAuth(state, code);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}, "handler9"));
var publish_default = withErrorLogging(/* @__PURE__ */ __name(async function handler10(req) {
  const u = new URL(req.url);
  const text2 = u.searchParams.get("text") || "BlueBanter test post";
  const confirm = u.searchParams.get("confirm") || "0";
  if (confirm !== "1") {
    return new Response(JSON.stringify({ preview: text2, note: "Set confirm=1 to post" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const res = await publishTweetForUser(text2);
  return new Response(JSON.stringify({ id: res.id || "" }), { status: 200, headers: { "Content-Type": "application/json" } });
}, "handler10"));
var tools_default = withErrorLogging(/* @__PURE__ */ __name(async function handler11(req) {
  const u = new URL(req.url);
  const player = u.searchParams.get("player") || "Chelsea";
  const matchId = u.searchParams.get("matchId") || void 0;
  const prompt = u.searchParams.get("prompt") || `${player} banter`;
  const live = await getLiveEvents({ matchId });
  const stats = await getPlayerStats({ name: player });
  const news = await fetchNews({ player });
  const quotes2 = await fetchQuotes({ player });
  const expert = await fetchExpertCommentary({ player });
  const image = await generateImage2({ prompt, style: "chelsea" });
  const body = JSON.stringify({
    ok: true,
    citations: [
      live.citation,
      stats.citation,
      news.citation,
      quotes2.citation,
      expert.citation
    ].filter(Boolean),
    counts: {
      live: (live.events || []).length,
      stats: (stats.stats || []).length,
      news: (news.articles || []).length,
      quotes: (quotes2.quotes || []).length,
      expert: (expert.items || []).length
    },
    imageUrl: image.url
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}, "handler11"));
function setProcessEnv(env2) {
  const g2 = globalThis;
  if (!g2.process) g2.process = {};
  const normalized = {};
  for (const [k, v2] of Object.entries(env2 || {})) {
    normalized[k] = v2;
    if (k.startsWith("env.")) {
      normalized[k.slice(4)] = v2;
    }
  }
  const nested = env2?.env;
  if (nested && typeof nested === "object") {
    for (const [k, v2] of Object.entries(nested)) {
      normalized[k] = v2;
    }
  }
  g2.process.env = { ...g2.process.env || {}, ...normalized };
}
__name(setProcessEnv, "setProcessEnv");
function notFound() {
  return new Response("Not Found", { status: 404 });
}
__name(notFound, "notFound");
function serveDashboard() {
  return new Response(public_default, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
__name(serveDashboard, "serveDashboard");
async function callHandler(handler12, req) {
  if (handler12.length === 0) return handler12();
  return handler12(req);
}
__name(callHandler, "callHandler");
var worker_default = {
  async fetch(req, env2) {
    setProcessEnv(env2);
    const url = new URL(req.url);
    const p2 = url.pathname;
    if (p2 === "/" || p2 === "/index.html") return serveDashboard();
    if (p2 === "/api/index") return callHandler(api_default, req);
    if (p2 === "/api/dashboard") return callHandler(dashboard_default, req);
    if (p2 === "/api/generate-tweet") return callHandler(generate_tweet_default, req);
    if (p2 === "/api/cron/prewarm") return callHandler(prewarm_default, req);
    if (p2 === "/api/cron/fixtures") return callHandler(fixtures_default, req);
    if (p2 === "/api/cron/weekly") return callHandler(weekly_default, req);
    if (p2 === "/api/cron/match-day") return callHandler(match_day_default, req);
    if (p2 === "/api/x/auth") return callHandler(auth_default, req);
    if (p2 === "/api/x/callback") return callHandler(callback_default, req);
    if (p2 === "/api/x/publish") return callHandler(publish_default, req);
    if (p2 === "/api/test/tools") return callHandler(tools_default, req);
    return notFound();
  },
  async scheduled(event, env2) {
    setProcessEnv(env2);
    const cron = event.cron;
    if (cron === "*/5 * * * *") {
      await callHandler(prewarm_default, new Request("https://local/api/cron/prewarm"));
      await callHandler(match_day_default, new Request("https://local/api/cron/match-day"));
      return;
    }
    if (cron === "0 7 * * *") {
      await callHandler(fixtures_default, new Request("https://local/api/cron/fixtures"));
      return;
    }
    if (cron === "0 9 * * 1") {
      await callHandler(weekly_default, new Request("https://local/api/cron/weekly"));
    }
  }
};

// node_modules/.pnpm/wrangler@4.84.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/.pnpm/wrangler@4.84.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-4pUQYo/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/.pnpm/wrangler@4.84.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-4pUQYo/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
//# sourceMappingURL=worker.js.map
