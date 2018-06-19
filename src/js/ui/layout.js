module.exports = class Layout {
    constructor(container) {
        this._$container = container;
    }

    build() {
        const $operateArea = this._$container.find('#operateArea'),
            operateAreaHeight = $operateArea.height(),
            rowHeight = operateAreaHeight/5;
        console.log(rowHeight);
    }
};