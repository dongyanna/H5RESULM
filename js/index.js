/*
* 关于audio的一些常用属性[这些东西在video中同样也有]：
*   duration：播放的总时间(单位：S)
*   currentTime：当前已经播放的时间(单位：S)
*   ended：是否已经播放完成
*   paused：当前是否为暂停状态
*   volume：控制音量
* 事件
*   canplay：可以正常播放（但是播放过程中可能出现卡顿）
*   canplaythrough：资源加载完毕，可以顺畅的播放了
*   ended：播放完成
*   loadedmetadata：资源的基础信息已经加载完成
*   loadeddata：整个资源都已经加载完成
*   pause：出发了暂停
*   play：触发了播放
*   onplaying：正在播放中
*
* 方法：
* pause():暂停
* play()：播放
* */
let loadingRender=(function () {
    let $loadingBox=$('.loadingBox'),
        $current=$loadingBox.find('.current');
    let imgData=["img/icon.png","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png","img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png","img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png","img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg","img/zf_cubeTip.png","img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png","img/zf_messageChat.png","img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png","img/zf_outline.png","img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png","img/zf_phoneLogo.png","img/zf_return.png","img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg","img/zf_styleTip1.png","img/zf_styleTip2.png","img/zf_teacher1.png","img/zf_teacher2.png","img/zf_teacher3.jpg","img/zf_teacher4.png","img/zf_teacher5.png","img/zf_teacher6.png","img/zf_teacherTip.png"];

    let n=0,
        len=imgData.length;
    let run=function run(callback) {

        imgData.forEach(item=>{
            let tempImg= new Image;//创建一个临时图片
            tempImg.onload=()=>{
                tempImg=null;
                $current.css('width',((++n)/len)*100+'%');

                //加载完成，执行回调函数(让当前的loading页面消失)
                if(n===len){
                    clearTimeout(delatTimer);
                    callback && callback();
                }
            };
            tempImg.src=item;
        })
    };

    //设置最长等待时间（假设10s，到达10s我们看加载多少了，如果已经达到了百分之九十以上，
    // 我们可以正常访问内容；如果不足这个比例，直接提示用户当前网络不好稍后重试即可）
    let delatTimer=null;
    let maxDelay=function maxDelay(callback) {
        delatTimer=setTimeout(()=>{
            if(n/len>=0.9){
                $current.css('width','100%')
                callback && callback();
                return;
            }
            alert('当前网络状况不佳，请稍后再试')
            //window.location.href='http://www.qq.com';//此时我们不应该继续加载图片，而是让其关掉页面或者是跳转到其他页面
        },100000)
    };

    //完成后要做的事
    let done=function done() {
        let timer=setTimeout(()=>{//真实项目中，一般加载完我们会在加载页面停留一秒钟再移除，进入下一个环节
            $loadingBox.remove();
        },1000)

    };

    return{
        init:function () {
            $loadingBox.css('display','block');
            run(done);
            maxDelay(done);
            phoneRender.init();
        }
    }

})();

let phoneRender=(function () {
    let $phoneBox=$('.phoneBox'),
        $time=$phoneBox.find('span'),
        $answer=$phoneBox.find('.answer'),
        $answerMarkLink=$answer.find('.markLink'),
        $hang=$phoneBox.find('.hang'),
        $hangMarkLink=$hang.find('.markLink'),
        answerBell=$('#answerBell')[0],//把获取的结果转换成远程JS对象，jQuery和Zpto中都没有提供音视频的方法，所以我们要用js
        introduction=$('#introduction')[0];
    let answerMarkTouch=function answerMarkTouch() {
        $answer.remove();
        answerBell.pause();//让音乐 暂停
        $(answerBell).remove();//一定要先暂停播放再移除，否则即使移除掉，浏览器也会播放音乐

        //显示hang
        $hang.css('transform','translateY(0rem)');
        introduction.play();
        introduction.volume=0.3
        $time.css('display','block');

        computedTime();
    };

    let autoTimer=null;
    //计算播放时间
    let computedTime=function computedTime() {
        let duration=0;//总时间
        //我们让audio播放，他首先会去加载资源，部分资源加载完成才会播放，才会计算出总时间duration等信息，
        // 所以我们可以把获取信息放到canplay事件中，或者不这么写，把duration放在定时器中过一秒种后再获取也可以
        // introduction.oncanplay=function(){
        //     duration=introduction.duration;
        // };
        autoTimer=setInterval(()=>{
            let duration=introduction.duration;
            let val=introduction.currentTime;//当前时间
            if(val>=duration){
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute=Math.floor((val/60)),
                second=Math.floor(val-minute*60);
            minute=minute<10?'0'+minute:minute;
            second=second<10?'0'+second:second;
            $time.html(`${minute}:${second}`)
        },1000)

    };

    let closePhone=function closePhone() {
        clearInterval(autoTimer)
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();
        messageRender.init();

    };
    return{
        init:function () {
            $phoneBox.css('display','block');
            answerBell.play();//让音频播放
            answerBell.volume=0.3;//让音乐小点声音
           ;
            //点击answerMark，移动端click事件会有300ms延迟，我们可以用zepto的tap方法
            // $answerMarkLink.on('click',answerMarkTouch);
            // $hangMarkLink.on('click',closePhone);
            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);


        }
    }
})();

let messageRender=(function () {
    let $messageBox=$('.messageBox'),
        $wrapper=$messageBox.find('.wrapper'),
        $messageList=$wrapper.find('li'),
        $keyBoard=$messageBox.find('.keyBoard'),
        $textInp=$keyBoard.find('span'),
        $submit=$keyBoard.find('.submit');
    let demonMusic=$('#demonMusic')[0];

    let step=-1,//记录当前展示信息的索引
        total=$messageList.length+1,//记录的是信息总条数,自己也发一条，所以加1
        autoTimer=null,
        inteval=2000;//记录多久发一条信息（信息相继出现的间隔时间）
    //展示信息
    let tt=0
    let showMessage=function showMessage() {
        ++step;
        if(step===2){
            //已经展示两条了，此时我们先结束自动发送信息，让键盘出来，开始手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur=$messageList.eq(step);//获得当前需要操作的li
        $cur.addClass('active');
        if(step>=3){
            //展示的条数已经是四条或者四条以上了，此时我们让wrapper向上移动（移动的距离是新展示这一条的高度）
            // let curH=$cur[0].offsetHeight,//当前展示的高度值
            //     wraT=parseFloat($wrapper.css('top'));//获取ul的高度
            // $wrapper.css('top',wraT-curH);
            //能用transform的不要用纯css，因为transform开启了硬件加速，所以我们把上面的三行代码注释掉，用下面的方法
            //JS中基于CSS获取transform，得到的结果是一个矩阵,不好操作，我们可以先在外面定义一个变量tt=0,0+当前li的高度，就是我要设置的transform的向上位移值
            let curH=$cur[0].offsetHeight;
            tt-=curH;
            $wrapper.css('transform',`translateY(${tt}px)`)
        };
        if(step>=total-1){
            //已经展示完了，结束定时器
            clearTimeout(autoTimer);
            closeMessage();
        }
    };

    //手动发送
    let handleSend=function handleSend() {
        //transitionend：1.监听当前元素transition动画结束的事件;
        // 2.并且有几个样式属性改变且执行了过渡效果，事件就会被触发执行几次
        //用one做事件绑定，只让其触发一次
        $keyBoard.css('transform','translateY(0rem)').
        one('transitionend',()=>{
            let str='好的，马上介绍！',
                n=-1,
                textTimer=null;
                textTimer=setInterval(()=>{
                    let orginHTML=$textInp.html();
                    $textInp.html(orginHTML+str[++n]);
                    if(n>=str.length-1){
                        clearInterval(textTimer);
                        $submit.css('display','block')
                    }


                },100)
        })
    };

    //点击submit做的事情
    let handleSubmit=function handleSubmit() {
        $(` <li class="self">
                <i class="arrow"></i>
                <img src="img/zf_messageStudent.png" alt="" class="pic">
               ${$textInp.html()}
            </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList=$wrapper.find('li');//把新的li放到页面中，我们此时应该重新获取一下li，让$messageList和页面中的li整对用，方便后期根据索引展示对应的li
        //该消失的消失
        $textInp.html('');
        $submit.css('display','none');
        $keyBoard.css('transform','translateY(3.7rem)');

        //继续向下展示剩余的消息
        autoTimer=setInterval(showMessage,inteval);//重新执行动画
    };


    //关掉message区域
    let closeMessage=function closeMessage() {
        let delayTimer=setTimeout(()=>{
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer)
            cubeRender.init();
        },inteval)

    };
    return{
        init:function () {
            $messageBox.css('display','block');
            demonMusic.play();
            demonMusic.volume=0.3;
            //加载模块立即展示一条信息，后期间隔interval再发送一条信息
            showMessage();
            autoTimer=setInterval(showMessage,inteval);
            $submit.tap(handleSubmit)

        }
    }
})();
let cubeRender=(function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');

    //=>手指控住旋转
    let start = function start(ev) {
        //=>记录手指按在位置的起始坐标
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    };
    let move = function move(ev) {
        //=>用最新手指的位置-起始的位置，记录X/Y轴的偏移
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    };
    let end = function end(ev) {
        //=>获取CHANGE/ROTATE值
        let {changeX, changeY, rotateX, rotateY} = this,
            isMove = false;
        //=>验证是否发生移动（判断滑动误差）
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        //=>只有发生移动再处理
        if (isMove) {
            //1.左右滑=>CHANGE-X=>ROTATE-Y (正比:CHANGE越大ROTATE越大)
            //2.上下滑=>CHANGE-Y=>ROTATE-X (反比:CHANGE越大ROTATE越小)
            //3.为了让每一次操作旋转角度小一点，我们可以把移动距离的1/3作为旋转的角度即可
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            //=>赋值给魔方盒子
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //=>让当前旋转的角度成为下一次起始的角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
        //=>清空其它记录的自定义属性值
        ['strX', 'strY', 'changeX', 'changeY'].forEach(item => this[item] = null);
    };
    return {
        init:function () {
            $cubeBox.css('display','block');

            //记录初始的旋转角度（存储在自定义属性上
            $cube[0].rotateX=-35;
            $cube[0].rotateY=35;
            //手指操作cube，让cube跟着旋转
            $cube.on('touchstart',start).
            on('touchmove',move).
            on('touchend',end);

            //点击每一个面跳转到详情区域对应的页面
            $cubeList.tap(function () {
                $cubeBox.css('display','none');
                //跳转到详情区域，通过传递点击li的索引，让其定位到具体的slide
                let index=$(this).index();//获取它的索引
                detailRender.init(index);
            });
        }
    }
})();
let detailRender=(function () {
    let $detailBox=$('.detailBox'),
        swiper=null;
    let $dl=$('.page1>dl');

    let swiperInit=function swiperInit() {
        swiper= new Swiper('.swiper-container',{
            //initialSlide:1//初始slide的索引
            //direction : 'vertical'/'horizontal'横向切换或者纵向切换
            effect: 'coverflow',
            onInit:move,
            onTransitionEnd:move
            //loop:true,//swiper有一个bug，3D切换设置loop为true的时候偶尔会出现无法切换的情况（2D效果没问题）
            //swiper的无缝切换原理：把真实第一张克隆一份放到末尾，把真实最后一张也克隆一份放到最开始,就是说假如真实slide有5个，wrapper中有7个
            // onInit:(swiper)=>{
            //     //初始化成功回调函数,参数是当前初始化的实例
            // },
            // onTransitionEnd:(swiper)=>{
            //     //切换动画完成执行的回调函数，参数是当前初始化的实例
            // }
            //实例的私有属性：1.activeIndex:当前展示slide块的索引2.slides：获取所有的slide（数组）
            //实例的公有方法 1.slideTo： 切换到指定索引的slide
        })
    };
    let move=function move(swiper) {
        //swiper：当前创建的实例
        //1.判断当前是否为第一个slide：如果是让3D菜单展开，不是的话手起3D菜单
        let activeIn=swiper.activeIndex,
            slideAry=swiper.slides;
        if (activeIn === 0) {
            //=>PAGE1
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $dl.makisu('open');
        } else {
            //=>OTHER PAGE
            $dl.makisu({
                selector: 'dd',
                speed: 0
            });
            $dl.makisu('close');
        }
        //滑动到哪一个页面，把当前页面设置对应的id，其余页面移除id即可
        slideAry.forEach((item,index)=>{
            if(activeIn===index){
                item.id=`page${index+1}`;
                return;
            }
            item.id=null;
        })

    };
    return{
        init:function (index) {
            $detailBox.css('display','block');
            if(!swiper){//防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index,0);//直接运动到具体的slide页面，swiper中提供的方法。第一个参数是索引，第二个参数是速度，这边设置为0是为了让进详情页面的时候把翻页的那个动画取消，因为跳过不好看

        }
    }

})();
loadingRender.init();



/*开发中由于当前项目板块众多，每一个模块都是一个单例，我们最好规划一种机制：通过标识的判断让程序
只执行对应板块内容，这样开发哪个板块，我们就把标识改为啥，我们可以通过HASH路由控制*/
// let url=window.location.href,//获取当前页面的url地址  ，如果写window.location.href='xxx'这种写法是让其跳转到某个页面
//     well=url.indexOf('#'),
//     hash=well===-1?null:url.substr(well+1);
//     switch (hash) {
//         case 'loading':
//             loadingRender.init();
//             break;
//         case 'phone':
//             phoneRender.init();
//             break;
//         case 'message':
//             messageRender.init();
//             break;
//         case 'cube':
//             cubeRender.init();
//             break;
//         case 'detail':
//             cubeRender.init();
//             break;
//         default:
//             loadingRender.init();
//     }



























