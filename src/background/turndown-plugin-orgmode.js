var turndownPluginOrgmode = (function (exports) {
'use strict';

var emDelimiter = '/'
var strongDelimiter = '*'

function heading(turndownService) {
  turndownService.addRule("heading", {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

    replacement: function (content, node, options) {
      var hLevel = Number(node.nodeName.charAt(1))

      if (options.headingStyle === 'setext' && hLevel < 3) {
        var underline = (hLevel === 1 ? '=' : '-').repeat(content.length)
        return (
          '\n\n' + content + '\n' + underline + '\n\n'
        )
      } else {
        return '\n\n' + '*'.repeat(hLevel) + ' ' + content + '\n\n'
      }
    }
  })
}

function inlineLink(turndownService) {
  turndownService.addRule("inlineLink", {
    filter: function (node, options) {
      return (
        options.linkStyle === 'inlined' &&
        node.nodeName === 'A' &&
        node.getAttribute('href')
      )
    },
    replacement: function (content, node) {
      var href = node.getAttribute('href')
      var title = cleanAttribute(node.getAttribute('title'))
      if (title) title = ' "' + title + '"'
      return '[[' + href + title + '][' + content + ']]'
    }
  })
}

function emphasis(turndownService) {
  turndownService.addRule("emphasis", {
    filter: ['em', 'i'],
    replacement: function (content, node, options) {
      if (!content.trim()) return ''
      return emDelimiter + content + emDelimiter
    }
  })
}

function strong(turndownService) {
  turndownService.addRule("strong", {
    filter: ['strong', 'b'],
    replacement: function (content, node, options) {
      if (!content.trim()) return ''
      return strongDelimiter + content + strongDelimiter
    }
  })
}

function codeBlock(turndownService) {
  turndownService.addRule("codeBlock", {
    filter: function (node, options) {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      )
    },
    replacement: function (content, node, options) {
      var className = node.firstChild.getAttribute('class') || '';
      var language = (className.match(/language-(\S+)/) || [null, ''])[1];
      var code = node.firstChild.textContent;

      return (
        '\n\n' + '#+BEGINE_SRC ' + language + '\n' +
        code.replace(/\n$/, '') +
        '\n' + '#+END_SRC' + '\n\n'
      )
    }
  })
}

function code(turndownService) {
  turndownService.addRule("code", {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling;
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

      return node.nodeName === 'CODE' && !isCodeBlock
    },

    replacement: function (content) {
      if (!content) return ''
      content = content.replace(/\r?\n|\r/g, ' ');

      var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? ' ' : '';

      return '#+BEGIN_EXAMPLE\n' + content + '\n#+END_EXAMPLE'
    }
  })
}

function pre(turndownService) {
  turndownService.addRule('pre', {
    filter: function (node, tdopts) {
      return node.nodeName == 'PRE' && (!node.firstChild || node.firstChild.nodeName != 'CODE');
    },
    replacement: function (content, node, tdopts) {
      return convertToFencedCodeBlock(node, tdopts);
    }
  });
}

function convertToFencedCodeBlock(node, options) {
  node.innerHTML = node.innerHTML.replaceAll('<br-keep></br-keep>', '<br>');
  const langMatch = node.id?.match(/code-lang-(.+)/);
  const language = langMatch?.length > 0 ? langMatch[1] : '';

  var code;

  if (language) {
    var div = document.createElement('div');
    document.body.appendChild(div);
    div.appendChild(node);
    code = node.innerText;
    div.remove();
  } else {
    code = node.innerHTML;
  }

  return (
    '\n\n' + '#+BEGIN_SRC ' + language + '\n' +
    code.replace(/\n$/, '') +
    '\n' + '#+END_SRC' + '\n\n'
  )
}

function orgmode (turndownService) {
  turndownService.use([
    heading,
    inlineLink,
    emphasis,
    strong,
    codeBlock,
    code,
    pre,
  ]);
}


exports.orgmode = orgmode;
exports.heading = heading;
exports.inlineLink = inlineLink;
exports.emphasis = emphasis;
exports.strong = strong;
exports.codeBlock = codeBlock;
exports.code = code;
exports.pre = pre

return exports;

}({}));
