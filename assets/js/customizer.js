(function(){
  var svgNS = 'http://www.w3.org/2000/svg';

  var PALETTE = [
    { name: 'Rosa', hex: '#EFAFC4' },
    { name: 'Orange', hex: '#E08E45' },
    { name: 'Svart', hex: '#1F1B19' },
    { name: 'Vit', hex: '#FBF8F2' },
    { name: 'Ljusblå', hex: '#A9C9DE' },
    { name: 'Mörkblå', hex: '#2C4A6E' },
    { name: 'Turkos', hex: '#4FB6AE' },
    { name: 'Senapsgul', hex: '#E4B94E' },
    { name: 'Skogsgrön', hex: '#4A6B4D' },
    { name: 'Rost', hex: '#A9645C' },
    { name: 'Sand', hex: '#E8DCC4' },
    { name: 'Grå', hex: '#8C8279' }
  ];

  var PRODUCT_DIMS = {
    buff: { outerRx: 108, outerRy: 132, innerRx: 64, innerRy: 88, label: 'Buff', price: 199 },
    pannband: { outerRx: 132, outerRy: 78, innerRx: 96, innerRy: 42, label: 'Pannband', price: 149 }
  };

  var STRIPE_BANDS = { thin: 16, classic: 9, wide: 5 };
  var STRIPE_WORDS = { thin: 'tunna', classic: 'klassiska', wide: 'breda' };

  var state = {
    product: 'buff',
    pattern: 'randig',
    stripeWidth: 'classic',
    color1: '#EFAFC4',
    color1Name: 'Rosa',
    color2: '#E08E45',
    color2Name: 'Orange',
    qty: 1
  };

  var row1, row2;

  function selectSwatch(container, activeEl) {
    container.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('is-selected'); });
    activeEl.classList.add('is-selected');
  }

  function buildSwatchRow(containerId, initialHex, onChange) {
    var container = document.getElementById(containerId);
    PALETTE.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.style.background = c.hex;
      btn.title = c.name;
      btn.setAttribute('aria-label', c.name);
      btn.dataset.hex = c.hex;
      if (c.hex.toLowerCase() === initialHex.toLowerCase()) btn.classList.add('is-selected');
      btn.addEventListener('click', function () {
        selectSwatch(container, btn);
        onChange(c.hex, c.name);
      });
      container.appendChild(btn);
    });

    var customWrap = document.createElement('label');
    customWrap.className = 'swatch swatch-custom';
    customWrap.title = 'Egen färg';
    var input = document.createElement('input');
    input.type = 'color';
    input.value = initialHex;
    input.addEventListener('input', function () {
      selectSwatch(container, customWrap);
      onChange(input.value, 'Egen färg');
    });
    customWrap.appendChild(input);
    container.appendChild(customWrap);

    return { container: container, customInput: input, customWrap: customWrap };
  }

  function syncSwatchSelection(row, hex) {
    var matched = null;
    row.container.querySelectorAll('.swatch:not(.swatch-custom)').forEach(function (s) {
      if (s.dataset.hex && s.dataset.hex.toLowerCase() === hex.toLowerCase()) matched = s;
    });
    if (matched) {
      selectSwatch(row.container, matched);
    } else {
      row.customInput.value = hex;
      selectSwatch(row.container, row.customWrap);
    }
  }

  function wirePillGroup(containerId, handler) {
    var container = document.getElementById(containerId);
    container.querySelectorAll('.pill-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.pill-btn').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        handler(btn.dataset.value);
      });
    });
  }

  function setPillActive(containerId, value) {
    var container = document.getElementById(containerId);
    container.querySelectorAll('.pill-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.value === value);
    });
  }

  function updatePatternUI() {
    var isStripe = state.pattern === 'randig';
    document.getElementById('stripe-width-group').hidden = !isStripe;
    document.getElementById('color-field-2').hidden = !isStripe;
    document.getElementById('swap-colors').hidden = !isStripe;
    document.getElementById('color-step-number').textContent = isStripe ? '4' : '3';
    document.getElementById('color1-sub').textContent = isStripe ? ' (bas)' : '';
  }

  function render() {
    var dims = PRODUCT_DIMS[state.product];

    var maskOuter = document.getElementById('mask-outer');
    var maskInner = document.getElementById('mask-inner');
    maskOuter.setAttribute('rx', dims.outerRx);
    maskOuter.setAttribute('ry', dims.outerRy);
    maskInner.setAttribute('rx', dims.innerRx);
    maskInner.setAttribute('ry', dims.innerRy);

    var stripesGroup = document.getElementById('stripes-group');
    stripesGroup.innerHTML = '';

    if (state.pattern === 'helfargad') {
      var rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('width', '300');
      rect.setAttribute('height', '300');
      rect.setAttribute('fill', state.color1);
      stripesGroup.appendChild(rect);
    } else {
      var bands = STRIPE_BANDS[state.stripeWidth] || 9;
      var bandH = 300 / bands;
      for (var i = 0; i < bands; i++) {
        var r = document.createElementNS(svgNS, 'rect');
        r.setAttribute('x', '0');
        r.setAttribute('y', (i * bandH - 0.5).toFixed(2));
        r.setAttribute('width', '300');
        r.setAttribute('height', (bandH + 1).toFixed(2));
        r.setAttribute('fill', i % 2 === 0 ? state.color1 : state.color2);
        stripesGroup.appendChild(r);
      }
    }

    var patternLabel = state.pattern === 'randig'
      ? ('Randig (' + STRIPE_WORDS[state.stripeWidth] + ' ränder)')
      : 'Helfärgad';
    var colorsLabel = state.pattern === 'randig'
      ? (state.color1Name + ' & ' + state.color2Name)
      : state.color1Name;
    var price = dims.price * state.qty;

    document.getElementById('preview-caption').textContent =
      'Din ' + dims.label.toLowerCase() + ' — ' + (state.pattern === 'randig' ? 'randig' : 'helfärgad');
    document.getElementById('sum-product').textContent = dims.label;
    document.getElementById('sum-pattern').textContent = patternLabel;
    document.getElementById('sum-colors').textContent = colorsLabel;
    document.getElementById('sum-qty').textContent = state.qty;
    document.getElementById('sum-price').textContent = price + ' kr';

    var subject = encodeURIComponent('Beställning: ' + dims.label + ' (' + colorsLabel + ')');
    var body = encodeURIComponent([
      'Hej P&B UF!',
      '',
      'Jag vill gärna beställa:',
      'Produkt: ' + dims.label,
      'Mönster: ' + patternLabel,
      'Färger: ' + colorsLabel,
      'Antal: ' + state.qty,
      'Uppskattat pris: ' + price + ' kr',
      '',
      'Mvh,'
    ].join('\n'));
    document.getElementById('order-btn').setAttribute(
      'href', 'mailto:hej@pbuf.se?subject=' + subject + '&body=' + body
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    row1 = buildSwatchRow('swatches-1', state.color1, function (hex, name) {
      state.color1 = hex; state.color1Name = name; render();
    });
    row2 = buildSwatchRow('swatches-2', state.color2, function (hex, name) {
      state.color2 = hex; state.color2Name = name; render();
    });

    wirePillGroup('choice-product', function (v) { state.product = v; render(); });
    wirePillGroup('choice-pattern', function (v) { state.pattern = v; updatePatternUI(); render(); });
    wirePillGroup('choice-stripe-width', function (v) { state.stripeWidth = v; render(); });

    document.getElementById('swap-colors').addEventListener('click', function () {
      var c = state.color1, n = state.color1Name;
      state.color1 = state.color2; state.color1Name = state.color2Name;
      state.color2 = c; state.color2Name = n;
      syncSwatchSelection(row1, state.color1);
      syncSwatchSelection(row2, state.color2);
      render();
    });

    var qtyValue = document.getElementById('qty-value');
    document.getElementById('qty-minus').addEventListener('click', function () {
      state.qty = Math.max(1, state.qty - 1);
      qtyValue.textContent = state.qty;
      render();
    });
    document.getElementById('qty-plus').addEventListener('click', function () {
      state.qty = Math.min(10, state.qty + 1);
      qtyValue.textContent = state.qty;
      render();
    });

    document.querySelectorAll('.combo-build').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.combo-card');
        var c1 = card.dataset.c1, c2 = card.dataset.c2, pattern = card.dataset.pattern || 'randig';
        var found1 = PALETTE.filter(function (p) { return p.hex.toLowerCase() === c1.toLowerCase(); })[0];
        var found2 = PALETTE.filter(function (p) { return p.hex.toLowerCase() === c2.toLowerCase(); })[0];

        state.pattern = pattern;
        state.color1 = c1; state.color1Name = found1 ? found1.name : 'Egen färg';
        state.color2 = c2; state.color2Name = found2 ? found2.name : 'Egen färg';

        setPillActive('choice-pattern', pattern);
        updatePatternUI();
        syncSwatchSelection(row1, c1);
        syncSwatchSelection(row2, c2);
        render();

        document.getElementById('bygg-din-egen').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    updatePatternUI();
    render();
  });
})();
