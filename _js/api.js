// buddybuild API JS customizations
require(['gitbook', 'jquery'], function(gitbook, $) {
  gitbook.events.on('page.change', function() {
    BB.tocInit();
    parseEndpoint();
    BB.makeCodeSamplesFancy();
    BB.enableSyntaxHighlighting();
    BB.initEditTooltip();
    BB.initScroll();
  });

  gitbook.events.bind('start', function(e, config) {
    BB.updateToolbarButtons();
  });
});

var paramTypes = ['headers', 'path', 'query', 'body'];
var paramTitles = {
  headers:  "Header Parameters",
  path:     "Path parameters",
  query:    "Query parameters",
  body:     "Body parameters",
};

function fancyTokens (str) {
  return str.replace(/(^|[^a-zA-Z0-9]):([a-zA-Z0-9_\-]+):([^a-zA-Z0-9]|$)/g, '$1<span class="apitoken">$2</span>$3');
}

function makeDefinition (config) {
  var out = Mustache.render(`
  <div class="listingblock">
    <div class="content">
      <pre class="highlight apimethod api{{ method }}"><code class="language-url" data-lang="url">{{ base }}<b class="endpoint">{{ endpoint }}</b></code></pre>
    </div>
  </div>
`,
    config
  );

  return out;
}

function makeParams (config) {
  var out = '<table class="params">\n';

  for (var i in paramTypes) {
    var type = paramTypes[i];
    if (Object.keys(config.params[type]).length) {
      var list = config.params[type];
      out += '<tr class="head"><td class="head" colspan="3">'
          + paramTitles[type]
          + '</td></tr>\n';

      for (var j in list) {
        out += '<tr>';

        var param = list[j];
        var hasDesc = (param.desc != null && param.desc.length)
            ? true : false;
        var hasDef = (param.def != null && param.def.length)
            ? true : false;

        out += Mustache.render(
          '<td class="name valign-top">{{ name }}'
          + (param.req ? '<span class="req"></span>' : '')
          + '</td>\n',
          param
        );

        out += Mustache.render(
          '<td class="type valign-top"'
          + (hasDesc ? '' : ' colspan="2"')
          + '>{{ type }}'
          + (hasDef ? '<span class="default" title="default">{{def}}</span>' : '')
          + '</td>\n',
          param
        );

        if (hasDesc) {
          out += Mustache.render(
            '<td class="desc valign-top">{{ desc }}</td>\n',
            param
          );
        }

        out += '</tr>\n\n';
      }
    }
  }
  out += '</table>\n';

  out = fancyTokens(out);

  return out;
}

function makeTryme (config) {
  return;
  var out = '<h3 id="_parameters">Try it out!</h3>\n\n'
    + '<form method="post" id="tryme">\n';

  for (var i in paramTypes) {
    var type = paramTypes[i];
    if (Object.keys(config.params[type]).length) {
      var list = config.params[type];
      out += '<h6 class="params">' + paramTitles[type] + '</h6>\n';

      out += '<table class="fields">\n';

      for (var j in list) {
        var param = list[j];
        var fieldName = type + "-" + param.name;
        out += '<tr>\n'
          + '<td class="name valign-top">'
          + '<label for="' + fieldName + '">'
          + Mustache.render("{{ name }}", param)
          + (param.req ? '<span class="req"></span>' : '')
          + '</label>'
          + '</td>\n'
          + '<td class="field">'
          + '<input name="' + fieldName + '"'
          + (param.cue.length ? ' placeholder="' + param.cue + '"' : '')
          + '>'
          + '</td></tr>\n';
      }
      out += '</table>\n\n';
    }
  }
  out = fancyTokens(out);

  out += '<h5 class="tryme">The request</h5>\n\n'
    + '<div class="tryblock apimethod api' + config.method + '">\n'
    + '<code>'
    + '<input disabled="disabled" value="I am disabled">\n'
    + '<button type="submit">Go</button>\n'
    + '</form>\n';

  return out;
}

function parseEndpoint() {
  var endpoint,
      config,
      src         = $("#endpoint"),
      hasEndpoint = (src.length ? true : false),
      definition  = $(".definition.placeholder"),
      parameters  = $(".parameters.placeholder"),
      tryme       = $(".tryme.placeholder");

  if (!hasEndpoint) { return }

  config = eval( "(" + $(".content pre", src).html() + ")" );

  definition.after($( makeDefinition(config) ));
  parameters.after($( makeParams(config) ));
  tryme.after($( makeTryme(config) ));

  src.remove();
  definition.remove()
  parameters.remove();
  tryme.remove();
}
