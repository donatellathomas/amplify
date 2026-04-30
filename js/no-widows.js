/**
 * Ties the last two words with a nbsp so a lone word cannot sit on its own final line.
 * Plain copy + paragraphs with manual <br> only (no nested markup).
 */
(function () {
  function tieLastTwoWords(raw) {
    var text = raw.trim();
    if (!text) return raw;
    var words = text.split(/\s+/).filter(Boolean);
    var n = words.length;
    if (n < 2) return raw;
    if (n === 2) return words[0] + "\u00A0" + words[1];
    var last = words.pop();
    var prev = words.pop();
    return words.join(" ") + " " + prev + "\u00A0" + last;
  }

  function fixBrSeparatedBlock(el) {
    var nodes = Array.from(el.childNodes);
    var i;
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (
        n.nodeType === 1 &&
        n.tagName !== "BR"
      ) {
        return false;
      }
    }
    var html = "";
    var buf = "";
    function flush() {
      if (buf.trim()) html += tieLastTwoWords(buf);
      buf = "";
    }
    for (i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType === 3) {
        buf += node.textContent;
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        flush();
        html += "<br />";
      }
    }
    flush();
    el.innerHTML = html;
    return true;
  }

  function fixElement(el) {
    if (!el || !el.children) return;

    var nonBrKids = [];
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (c.tagName !== "BR") nonBrKids.push(c);
    }
    if (nonBrKids.length > 0) {
      nonBrKids.forEach(fixElement);
      return;
    }

    var hasBr = false;
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n.tagName === "BR") {
        hasBr = true;
        break;
      }
    }
    if (hasBr) {
      fixBrSeparatedBlock(el);
      return;
    }

    if (!el.textContent.trim()) return;
    el.textContent = tieLastTwoWords(el.textContent);
  }

  var selector = [
    "main p",
    "main li",
    "main h1",
    "main h2",
    "main h3",
    ".footer p",
    ".footer h3",
    ".electric-intro__lead",
    ".timeline-mile__title",
  ].join(", ");

  document.querySelectorAll(selector).forEach(fixElement);
})();
