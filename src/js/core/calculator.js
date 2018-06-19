module.exports = class Calculator {

    constructor(container) {
        /** 历史栈 */
        this.historyArr = [];
        /** 当前操作栈 */
        this.currentOperateArr = [
            {
                value: '0',
                operator: '',
                type: 'operate',
                active: true
            }
        ];
        /** 最外层容器 */
        this._$container = container;
    }

    /** 入口方法 */
    init() {
        this._operateBtnEventBind();
        this._viewAreaEventBind();
        this._viewAreaRender();
    }

    /** 绑定操作区域事件 */
    _viewAreaEventBind() {
        let startY,
            $viewArea = this._$container.find('#viewArea'),
            $viewScrollContainer = this._$container.find('#viewScrollContainer');
        this._$container.on('touchstart', '#viewArea', function (event) {
            let touch = event.originalEvent.targetTouches[0];
            startY = touch.pageY;
        }).on('touchmove', '#viewArea', function (event) {
            let touch = event.originalEvent.targetTouches[0],
                curY = touch.pageY,
                diffY = (curY - startY)/10,
                absY = Math.abs(diffY),
                curB = $viewScrollContainer.css('bottom'),
                padH = parseFloat($viewArea.css('padding').indexOf('px')===-1?$viewArea.css('padding'):$viewArea.css('padding').substring(0,$viewArea.css('padding').indexOf('px'))) * 2,
                diffH = $viewScrollContainer.height() - $viewArea.height() - padH;
            curB = parseInt(curB.indexOf('px')===-1?curB:curB.substring(0, curB.indexOf('px')));
            if(diffH<0) return;

            if(diffY<0){
                if(curB>=0){
                    $viewScrollContainer.css('bottom', '0');
                }else{
                    $viewScrollContainer.css('bottom', (curB + absY) + 'px');
                }
            }else if(diffY>0){
                if(Math.abs(curB)>=diffH){
                    $viewScrollContainer.css('bottom', -diffH+'px');
                }else{
                    $viewScrollContainer.css('bottom', (curB - absY) + 'px');
                }
            }
        });
    }

    /** 绑定操作区按钮事件 */
    _operateBtnEventBind() {
        let self = this;
        this._$container.on('click', '#operateArea .button', function () {
            let type = $(this).attr('data-type'),
                value = $(this).attr('data-val');
            switch (type) {
                case 'num': {
                    self._operateNumInput(value);break;
                }
                case 'operate': {
                    self._operateInput(value);break;
                }
            }
        })
    }

    /** 数字输入处理 */
    _operateNumInput(val) {
        let currentObj;
        for(let i in this.currentOperateArr){
            if(this.currentOperateArr[i].active) {
                currentObj = this.currentOperateArr[i];
                break;
            }
        }
        if('result' === currentObj.type){
            this._pushHistory();
            this.currentOperateArr = [{
                value: ''+val,
                operator: '',
                type: 'operate',
                active: true
            }]
        }else{
            let numStr = currentObj.value;
            currentObj.value = parseInt(numStr)===0?''+val:numStr+''+val;
        }
        this._calculatorHandler();
    }

    /** 操作符输入处理 */
    _operateInput(val) {
        let currentObj;
        for(let i in this.currentOperateArr){
            if(this.currentOperateArr[i].active) {
                currentObj = this.currentOperateArr[i];
                break;
            }
        }
        if('+'===val||'*'===val||'/'===val||'-'===val){
            if('result' === currentObj.type){
                this._pushHistory();
                this.currentOperateArr = [{
                    value: Math.abs(currentObj.value),
                    operator: parseFloat(currentObj.value)<0?'-':'',
                    type: 'operate',
                    active: false
                },{
                    value: '',
                    operator: val,
                    type: 'operate',
                    active: true
                }]
            }else{
                if(('0'===currentObj.value&&'-'===val)||(''===currentObj.value)) {
                    currentObj.operator = val;
                }else{
                    for(let i in this.currentOperateArr){
                        this.currentOperateArr[i].active = false;
                    }
                    this.currentOperateArr.push({
                        value: '',
                        operator: val,
                        type: 'operate',
                        active: true
                    })
                }
            }
            this._calculatorHandler();
        }else if('='===val){
            this._calculatorHandler(true);
        }else if('.'===val||'%'===val||'backspace'===val){
            if('result'===currentObj.type) return;
            let numStr = currentObj.value;
            currentObj.value = val==='.'?(numStr.indexOf('.')===-1?numStr+'.':numStr):val==='%'?
                numStr.indexOf('.')===-1?parseInt(numStr)/100:parseFloat(numStr)/100:
                numStr.length===1?'0':numStr.substring(0, numStr.length-1);
            this._calculatorHandler();
        }else if('allClear'===val){
            this.historyArr = [];
            this.currentOperateArr = [
                {
                    value: '0',
                    operator: '',
                    type: 'operate',
                    active: true
                }
            ];
            this._viewAreaRender();
        }
    }

    /** 推入历史栈 */
    _pushHistory() {
        this.historyArr.push(this.currentOperateArr);
    }

    /** 计算器核心逻辑 */
    _calculatorHandler(fromEqual) {
        let origNum = 0, resultIndex=-1;
        for(let i in this.currentOperateArr) {
            if(this.currentOperateArr[i].type!=='result')
                origNum = calc(origNum, this.currentOperateArr[i]);
            else
                resultIndex = i;
        }
        if(resultIndex!==-1){
            this.currentOperateArr.splice(resultIndex, 1);
        }
        if(fromEqual){
            for(let i in this.currentOperateArr){
                this.currentOperateArr[i].active = false;
            }
        }
        this.currentOperateArr.push({
            value: origNum,
            operator: '=',
            type: 'result',
            active: fromEqual!==undefined
        });
        function calc(orig, operateObj) {
            let result = orig;
            if(!isNaN(parseFloat(operateObj.value)))
                switch (operateObj.operator) {
                    case '-': {
                        result = parseFloat(orig) - parseFloat(operateObj.value);
                        break;
                    }
                    case '/': {
                        result = parseFloat(operateObj.value)===0?'不能除以0':parseFloat(orig) / parseFloat(operateObj.value);
                        break;
                    }
                    case '*': {
                        result = parseFloat(orig) * parseFloat(operateObj.value);
                        break;
                    }
                    default: {
                        result = parseFloat(orig) + parseFloat(operateObj.value);
                    }
                }
            return result;
        }
        this._viewAreaRender();
    }

    /** 结果渲染 */
    _viewAreaRender() {
        let $viewScrollContainer = this._$container.find('#viewScrollContainer'),
            $CurOperateArea = this._$container.find('#currentOperateArea'),
            $HistoryArea = this._$container.find('#historyArea'),
            hisHtml='',curHtml='';
        for(let i in this.historyArr){
            let tmp = this.historyArr[i];
            hisHtml+=`<li class="history-item">`;
            for(let j in tmp){
                hisHtml+=`<div class="history-item-row">${tmp[j].operator==='/'?'÷':tmp[j].operator==='*'?'×':tmp[j].operator} ${tmp[j].value}</div>`;
            }
            hisHtml+=`</li>`;
        }
        for(let i in this.currentOperateArr){
            let tmp = this.currentOperateArr[i];
            curHtml+=`<div class="view-row ${tmp.active?'active':''}"><span>${tmp.operator==='/'?'÷':tmp.operator==='*'?'×':tmp.operator}</span><span>${tmp.value}</span></div>`;
        }
        $CurOperateArea.html(curHtml);
        $HistoryArea.html(hisHtml);
        $viewScrollContainer.css('bottom', '0');
    }
};