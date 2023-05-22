
// This only defines high-level behaviour of the Mode like folding etc.
ace.define('ace/mode/portugol', ['require', 'exports', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/custom_highlight_rules'], (acequire, exports) => {
  const oop = acequire('ace/lib/oop');
  const TextMode = acequire('ace/mode/text').Mode;
  const CustomHighlightRules = acequire('ace/mode/portugol_highlight_rules').CustomHighlightRules;

  var Mode = function() {
    this.HighlightRules = CustomHighlightRules;
  };

  oop.inherits(Mode, TextMode); // ACE's way of doing inheritance
  
  exports.Mode = Mode; // eslint-disable-line no-param-reassign
});

// This is where we really create the highlighting rules
ace.define('ace/mode/portugol_highlight_rules', ['require', 'exports', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], (acequire, exports) => {
  const oop = acequire('ace/lib/oop');
  const TextHighlightRules = acequire('ace/mode/text_highlight_rules').TextHighlightRules;

  const CustomHighlightRules = function CustomHighlightRules() {
    //this.$rules = new TextHighlightRules().getRules(); // Use Text's rules as a base

    //TODO: jogar erro quando não bate os highlight
    this.$rules = {
      start: [
        {
          token: "entity.name.function",
          regex: "([a-zA-Z])(_sub|_add|_zero|_retorna)"
        },
        {
          token: "entity.name.function",
          regex: "([a-zA-Z])(_mult_|_div_|_maior_|_menor_)([a-zA-Z])"
        },
        {
          token: "keyword.operator",
          regex: "(senao)|(se)|(faca)|(va_para)|(=)"
        },
        {
          token: "constant.numeric",
          regex: "[0-9]"
        },
        {
          token: "comment.line",
          regex: "(#)(.*)"
        }
      ]
    }
  };

  oop.inherits(CustomHighlightRules, TextHighlightRules);

  exports.CustomHighlightRules = CustomHighlightRules;
});