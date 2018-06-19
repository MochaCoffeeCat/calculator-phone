window.$ = require('./libs/jquery.min');

// const Layout = require('./ui/layout');
const Calculartor = require('./core/calculator');

// const layout = new Layout($('#calculator'));
//     layout.build();
const calculartor = new Calculartor($('#calculator'));
    calculartor.init();