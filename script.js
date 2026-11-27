(function () {
  'use strict';

  /* ---- Configuración: cambia estos datos ---- */
  var TIENDA_WHATSAPP = '18295893248'; // número de la tienda, con código de país y sin signos
  var MONEDA = '$';

  var PRODUCTOS = [
    ['Espinaca', 5.03, 'pr8.png', 'Verduras'], ['Manzanas', 5.09, 'pr1.png', 'Frutas'],
    ['Naranja agria', 15, 'pr2.png', 'Frutas'], ['Uvas frescas', 15, 'pr3.png', 'Frutas'],
    ['Mora brasileña', 25.49, 'pr4.png', 'Frutas'], ['Fresas rojas', 18.18, 'pr5.png', 'Frutas'],
    ['Frutal para jugos', 52.13, 'frutas varidas.png', 'Canastas'], ['Canasta vegetariana', 34, 'canasta vegetariana.png', 'Canastas'],
    ['Mangos', 2, 'mango.png', 'Frutas'], ['Pera', 3.05, 'pera.png', 'Frutas'],
    ['Guineos maduros', 0.9, 'pr6.png', 'Frutas'], ['Manzana verde', 1.02, 'manzana verde.png', 'Frutas'],
    ['Ensalada mixta', 4, 'mixto.png', 'Verduras'], ['Piña', 9.01, 'piña.png', 'Frutas'],
    ['Plato de frutas', 6.5, 'plato de frutas.png', 'Canastas'], ['Sandía', 4.95, 'sandia.png', 'Frutas'],
    ['Tomates', 5.02, 'tomates.png', 'Verduras'], ['Zanahoria persa', 2, 'zanahoria.png', 'Verduras'],
    ['Sazón natural', 1, 'sazon natural.png', 'Despensa'], ['Aguacate', 2, 'aguacate.png', 'Verduras'],
    ['Cereza amarga', 3, 'cereza amarga.png', 'Frutas'], ['Limón', 4, 'limon.png', 'Frutas'],
    ['Frambuesas', 9, 'Franbuesas.png', 'Frutas'], ['Granada', 5, 'granada.png', 'Frutas']
  ].map(function (p, i) { return { id: i, name: p[0], price: p[1], img: p[2], cat: p[3] }; });

  var $ = function (id) { return document.getElementById(id); };
  var money = function (n) { return MONEDA + n.toFixed(2); };
  var cart = {}, cat = 'Todos', query = '', sort = '';

  try { cart = JSON.parse(localStorage.getItem('fdv-cart')) || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem('fdv-cart', JSON.stringify(cart)); } catch (e) {} }
  function byId(id) { return PRODUCTOS[id]; }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }

  /* ---- Categorías ---- */
  var cats = ['Todos'].concat(PRODUCTOS.map(function (p) { return p.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
  function renderCats() {
    $('catNav').innerHTML = cats.map(function (c) {
      return '<button type="button" data-cat="' + c + '" aria-pressed="' + (c === cat) + '">' + c + '</button>';
    }).join('');
  }
  $('catNav').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.cat; renderCats(); renderGrid();
    $('productos').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---- Catálogo ---- */
  function renderGrid() {
    var q = norm(query);
    var list = PRODUCTOS.filter(function (p) {
      return (cat === 'Todos' || p.cat === cat) && (!q || norm(p.name).indexOf(q) > -1);
    });
    if (sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
    if (sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });
    if (sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    $('resultInfo').textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
    $('grid').innerHTML = list.length ? list.map(function (p) {
      var n = cart[p.id] || 0;
      return '<article class="card"><div class="pic"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
        '<small>' + p.cat + '</small><h3>' + esc(p.name) + '</h3><div class="price">' + money(p.price) + '</div>' +
        (n ? '<div class="qty"><button type="button" data-act="dec" data-id="' + p.id + '" aria-label="Quitar una unidad">&minus;</button><span>' + n + '</span><button type="button" data-act="inc" data-id="' + p.id + '" aria-label="Agregar una unidad">+</button></div>'
           : '<button class="add" type="button" data-act="inc" data-id="' + p.id + '">Agregar al carrito</button>') + '</article>';
    }).join('') : '<p class="empty">No encontramos productos con esa búsqueda. Prueba con otra palabra o elige otra categoría.</p>';
  }

  /* ---- Carrito ---- */
  function change(id, d) {
    var n = (cart[id] || 0) + d;
    if (n <= 0) delete cart[id]; else cart[id] = n;
    save(); renderAll();
    if (d > 0 && n === 1) toast(byId(id).name + ' agregado al carrito');
  }
  function renderCart() {
    var ids = Object.keys(cart), total = 0, count = 0;
    $('cartList').innerHTML = ids.length ? ids.map(function (k) {
      var p = byId(k), n = cart[k]; total += p.price * n; count += n;
      return '<div class="line"><img src="' + esc(p.img) + '" alt=""><div><h4>' + esc(p.name) + '</h4><small>' + money(p.price) + ' c/u</small>' +
        '<div class="qty"><button type="button" data-act="dec" data-id="' + k + '" aria-label="Quitar una unidad">&minus;</button><span>' + n + '</span><button type="button" data-act="inc" data-id="' + k + '" aria-label="Agregar una unidad">+</button></div></div><b>' + money(p.price * n) + '</b></div>';
    }).join('') : '<p class="empty">Tu carrito está vacío. Agrega productos desde el catálogo.</p>';
    $('cartFoot').hidden = !ids.length;
    $('cartCount').textContent = count;
    $('cartTotal').textContent = $('cartTotalTop').textContent = money(total);
  }
  function renderAll() { renderGrid(); renderCart(); }

  function act(e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    change(+b.dataset.id, b.dataset.act === 'inc' ? 1 : -1);
  }
  $('grid').addEventListener('click', act);
  $('cartList').addEventListener('click', act);

  function setDrawer(open) {
    $('drawer').classList.toggle('open', open);
    $('drawer').setAttribute('aria-hidden', !open);
    $('scrim').hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('closeCart').focus(); else $('openCart').focus();
  }
  $('openCart').addEventListener('click', function () { setDrawer(true); });
  $('closeCart').addEventListener('click', function () { setDrawer(false); });
  $('scrim').addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
  $('clearCart').addEventListener('click', function () { cart = {}; save(); renderAll(); });

  /* ---- Pedido por WhatsApp ---- */
  $('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('oName').value.trim(), phone = $('oPhone').value.trim(), addr = $('oAddr').value.trim();
    if (!name || !phone || !addr) { $('orderErr').textContent = 'Completa nombre, teléfono y dirección para enviar el pedido.'; return; }
    $('orderErr').textContent = '';
    var total = 0, lines = Object.keys(cart).map(function (k) {
      var p = byId(k), n = cart[k]; total += p.price * n;
      return '- ' + n + ' x ' + p.name + ' (' + money(p.price * n) + ')';
    });
    var msg = 'Hola, quiero hacer este pedido:\n\n' + lines.join('\n') + '\n\nTotal estimado: ' + money(total) +
      '\n\nNombre: ' + name + '\nTeléfono: ' + phone + '\nDirección: ' + addr + '\nPago: ' + $('oPay').value;
    window.open('https://wa.me/' + TIENDA_WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    toast('Pedido listo. Confírmalo en WhatsApp.');
  });

  /* ---- Búsqueda y orden ---- */
  $('q').addEventListener('input', function () { query = this.value; renderGrid(); });
  $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); $('productos').scrollIntoView({ behavior: 'smooth' }); });
  $('sort').addEventListener('change', function () { sort = this.value; renderGrid(); });

  var tt;
  function toast(t) {
    var el = $('toast'); el.textContent = t; el.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  $('yr').textContent = new Date().getFullYear();
  renderCats(); renderAll();
})();