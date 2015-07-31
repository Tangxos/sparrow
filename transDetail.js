/**
 * Created by JIANMING241 on 15-6-23.
 */
$class('moneyFundIndex').extends('F').via(function() {
    this.CODES = {
        SUCCESS: "000000", // 000000：登录成功
        TIMEOUT: "200001", // 200001: 用户未登录台州
        UN_OPEN: "200002",  // 200002：未开户
        UN_BIND: "200003"   // 200003：未绑定基金帐户（已开户）
    };
    var beforeOneMonthDate = new Date();
    beforeOneMonthDate.setMonth(beforeOneMonthDate.getMonth()-1);
    this.dataParam = {
        startDate:beforeOneMonthDate.format('yyyyMMdd'),
        endDate:new Date().format('yyyyMMdd'),
        recordNo:10,
        pageNo:1
    };
    this.pageSize = 0; // 总页数

    this.sending = false; // 是否正在发送请求

    // 超级现金宝信息查询
    this.getDetail = function(data){
        /*var res = {"retCode": "000000", "retMsg": "成功", "total":100, list: [
            {
                "totalIncome":"123.00",
                "bankAcc":"6225382289991999",
                "occurIncome":"5.60",
                "realUnregShare":"10",
                "usableAmount":"5000.00",
                "validShare":"2000",
                "forzenShare":"0",
                "realRedeemShare":"2000",
                "registShare":"2000",
                "totalAssets":"1231241"
            }
        ]};
        this.callbacks['C_getDetail'].call(this, res);
        return;*/

        var param = {"ffFunctionCode":"FUND_QUERY_002"};
        $.extend(param, data || {});
        this.sending = true;
        this.request({
            url: 'WORK_SMBP_ESB',
            data: param,
            success: "C_getDetail"
        });
    };
    // 超级现金宝交易明细查询
    this.getData = function(data){

        /*var res = {"retCode": "000000", "retMsg": "成功", "total":100, list: [
            {
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"1500.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            },{
                "applyDate":"2012-12-15",
                "amount":"2000.00",
                "tradeCode":"p001",
                "tradeName":"充值",
                "state":"-12.00",
                "remaining":"1988.00"
            }
        ]};
        this.callbacks['C_getData'].call(this, res);
        return;*/


        var param = {"ffFunctionCode":"FUND_QUERY_004"};
        $.extend(param, data || {});
        this.request({
            url: 'WORK_SMBP_ESB',
            data: param,
            success: "C_getData",
            error: "error"
        });
    };

    // 构造方法
    this.construct = function() {
        this.getParent().construct.apply(this, Array.prototype.slice.call(arguments));
        var $_ = this;
        $_.init();

        //转账成功之后，跳转过来需要清空input框
        $$.EventListener.onBack = function(url,data){
            try{
                data = typeof data == 'string' ? JSON.parse(data) : data;
            }catch(e){}
        };
        $$.Native.setHeader({
            title: document.title || "",
            isBack: true,
            backCallback: function(){
                // 跳转到基金宝宝产品详情页
                new F().gotoAnyDoorJJBB();
            },
            isClose: true,
            closeCallback: function () {
                $$.Native.backToRootModule();
            }
        });
    };

    /**
     * 页面初始化函数
     */
    this.init = function(){
        var self = this;
        var totalAssetsParam = $$.getQueryString("total");
        // 判断是否有total的url参数，如果有则直接填充到总资产元素，反之调用接口取值填充
        if(totalAssetsParam){
            $("#totalAssets").text("￥"+F.formatCurrency(totalAssetsParam));
        }else{
            self.getDetail();
        }

        self.initData();
        var windowHt = $(window).height(), scrollTop = 0, bodyHeight = 0;
        //$("#wrapBox").css("min-height","800px");
        $(".content-fixed1").on("scroll", function(){
            // 如果正在发送请求中，则返回
            if(self.sending) return;

            scrollTop = $(this).scrollTop();
            bodyHeight = this.scrollHeight;
            if(((scrollTop + windowHt + 30) > bodyHeight) && (self.dataParam.pageNo < self.pageSize)){
                self.dataParam.pageNo++;
                self.getData(self.dataParam);
            }
        });
    };
    // 数据初始化
    this.initData = function(){
        this.dataParam.pageNo = 1;
        this.getData(this.dataParam);
    };
    this.maxValue = 100;
    this.minValue = -100;
    this.currDate = null;
    this.callbacks = {
        error:function(data) {
            $$.Native.tip({
                text:data.retMsg
            });
        },
        C_getData: function(res){
            var self = this;
            self.sending = false;
            self.pageSize = Math.ceil(Number(res.total) / self.dataParam.recordNo);
            //if(res.retCode == this.CODES.SUCCESS){
                var isFirst = self.dataParam.pageNo == 1;
                var dateMap = {};
                var isBeforeDate = false;
                $.each(res.list, function(index,item){
                    item.applyDate = F.stringToDate(F.dateConvert(item.applyDate)).format("yy-MM-dd");
                    /*if(index === 0 && self.currDate === item.applyDate){
                        isBeforeDate = true;
                    }*/
                    if(dateMap[item.applyDate]){
                        dateMap[item.applyDate].push(item);
                    }else{
                        dateMap[item.applyDate] = [item];
                    }
                    self.currDate = item.applyDate;
                });

                if(isFirst){
                    this.render('temp-tpl', {dateMap: dateMap}, '#temp-box');
                    // 如果首次加载时，总数页大于1页，则去加载第二页的数据
                    if(self.pageSize > 1){
                        self.dataParam.pageNo++;
                        self.getData(self.dataParam);
                    }
                }else{
                    $("#temp-box").append(_.template($("#temp-tpl").html())({dateMap: dateMap, isBeforeDate: isBeforeDate}));
                }

            /*}else{
                this.commonTip(res);
            }*/
        },
        C_getDetail: function(res){
            //if(res.retCode == this.CODES.SUCCESS){
                var totalValue = 0;
                $.each(res.list, function(i, item){
                    totalValue += Number(item.totalAssets);
                });
                $("#totalAssets").text("￥"+F.formatCurrency(totalValue));
            /*}else{
                this.commonTip(res);
            }*/
        }
    };
    // 选择时间
    this.selectDate = function() {
        var oldStartDate = this.dataParam.startDate;
        var oldEndDate = this.dataParam.endDate;
        var self = this;
        $$.Native.selectDate({
            format: 'Y-m-d',
            type:"1",
            completeValue:oldEndDate,
            completeCallback:function(date){
                $("#endDate").text(date);
                self.dataParam.endDate = date;
                if(self.validateDate()) {
                    if (oldStartDate !== self.dataParam.startDate || oldEndDate !== self.dataParam.endDate) {
                        self.initData();
                    }
                }
            },
            startValue:oldStartDate,
            startCallback:function(date){
                $("#startDate").text(date);
                self.dataParam.startDate = date;
            }
        });
    };
    //时间验证
    this.validateDate = function(){
        var curDate = new Date();
        var begin = new Date(this.dataParam.startDate),
            end = new Date(this.dataParam.endDate);
        var day = (end-begin)/(24*3600*1000);
        if(begin===null || begin===""){
            $$.Native.tip({"text":"开始日期不能为空"});
            return false;
        }
        else if(end===null || end===""){
            $$.Native.tip({"text":"结束日期不能为空"});
            return false;
        }
        else if(begin>end){
            $$.Native.tip({"text":"开始日期不能大于结束日期"});
            return false;
        }
        else if(end>curDate){
            $$.Native.tip({"text":"结束日期大于当前日期"});
            return false;
        }
        else if(day > 90){
            $$.Native.tip({"text":"查询时间不能大于90天"});
            return false;
        }
        else{
            return true;
        }
    };
    this.events = {
        'tap #submitBtn.active':'nextSubmit',
        'input #fundPassword': 'fundPasswordInput',
        'touchstart .progress-bar': 'progressAddActive',
        'touchend .progress-bar': 'progressRMActive',
        'touchcancel .progress-bar': 'progressRMActive',
        'tap .open-item': 'openItem',
        'tap #btnSelectTime':'funSelectTime',	//选择时间页面效果显示
        'tap #btnCancelTime':'funCancelTime',	//取消选择时间页面效果显示
        'tap #selectDate':'funSelectDate'	//选择时间逻辑事件
    };
    this.handlersTime = new Date().getTime();

    this.handlers = {
        openItem: function(e, elem){
            var nextEl = elem.next();
            nextEl.siblings(".open-detail").hide();
            nextEl.parents(".table-point-box").siblings().find(".open-detail").hide();
            if(nextEl.is(":hidden")){
                nextEl.show();
            }else{
                nextEl.hide();
            }
        },
        //点击选择时间
        funSelectTime: function(events,element){
            var today = new Date();
            this.dataParam.endDate = today.format('yyyyMMdd');
            this.dataParam.startDate  = new Date(today.getTime()-(30*24*60*60*1000)).format('yyyyMMdd');
            $("#endDate").text(this.dataParam.endDate);
            $("#startDate").text(this.dataParam.startDate);
            element.hide();
            $("#timeRow").show();
        },
        // 点击取消选择时间
        funCancelTime: function(events,element){
            var today = new Date();
            var endDate = today.format('yyyyMMdd');
            var startDate  = new Date(today.getTime()-(30*24*60*60*1000)).format('yyyyMMdd');
            if(this.dataParam.startDate !== startDate || this.dataParam.endDate !== endDate ){
                this.initData();
            }

            $("#timeRow").hide();
            $("#btnSelectTime").show();
        },
        // 选择时间查询交易记录
        funSelectDate:function(){
            this.selectDate();
        },
        nextSubmit: function(){
            // 1000毫秒内防重复执行
            if((new Date().getTime() - this.handlersTime) < 1000) { return; }
            this.handlersTime = new Date().getTime();

            this.doFundLogin();
        },
        fundPasswordInput: function(event, elem){
            if(elem.val() == 8){
                this.linkFundAccount({
                    password: elem.val()
                });
            }
        },
        progressAddActive: function(event, elem){
            elem.addClass("trigger");
        },
        progressRMActive: function(event, elem){
            elem.removeClass("trigger");
        }
    };

    /**
     * 回调函数没有数据返回的提示
     * @param data 回调返回数据
     */
    this.commonTip = function(data){
        //有返回信息
        var msgText = data.ReturnMessage || data.retMsg;
        if(msgText){
            $$.Native.tip({"text":msgText});
        }
        else
        {
            $$.Native.tip({"text":"系统繁忙，请稍后再试！"});
        }
    };

});

var obj = new moneyFundIndex();