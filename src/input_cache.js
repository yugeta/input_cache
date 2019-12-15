;$$input_cache = (function(){

  // ----------
  // options
  var __options = {
    inputs    : [],     // 入力データ保存対象の項目一覧(selector値の登録)
    max_cache : 100,    // cache登録の最大件数
    eventMode : "blur", // 入力項目の発動イベント種類 [ "blur" , "keyup" ]

    history_count : 5,  // Historyの表示件数 (default : 5)
    matchType : "fromt-match", // ["fromt-match"(前方一致)*default , "full"(全部一致 or blank)]
    wait      : 500,     // 別システム連動の為の発動を遅らせるwait値（仮）

    cache_name : "input_cache",
    _eol:0  // 終了用フラグ（削除しても問題なし）
  };


  // ----------
  // Ajax
  var AJAX = function(options){
    if(!options){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return;}
		// open メソッド;
		var option = this.setOption(options);

		// queryデータ
		var data = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		// 実行
		httpoj.open( option.method , option.url , option.async );
		// type
		if(option.type){
			httpoj.setRequestHeader('Content-Type', option.type);
		}
		
		// onload-check
		httpoj.onreadystatechange = function(){
			//readyState値は4で受信完了;
			if (this.readyState==4 && httpoj.status == 200){
				//コールバック
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			//send メソッド
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
		
  };
	AJAX.prototype.dataOption = {
		url:"",
		query:{},
		querys:[],
		data:{},
		form:{},
		async:"true",
		method:"POST",
		type:"application/x-www-form-urlencoded",
		onSuccess:function(res){},
		onError:function(res){}
	};
	AJAX.prototype.option = {};
	AJAX.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
	};
	AJAX.prototype.setOption = function(options){
		var option = {};
		for(var i in this.dataOption){
			if(typeof options[i] != "undefined"){
				option[i] = options[i];
			}
			else{
				option[i] = this.dataOption[i];
			}
		}
		return option;
	};
	AJAX.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){

			// data = option.data;
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}
		return data;
	};

	AJAX.prototype.loadHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new AJAX({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML = div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	AJAX.prototype.orderScripts = function(scripts , target){
		if(!scripts.childNodes.length){return;}
		
		var trash = document.createElement("div");
		var newScript = document.createElement("script");
		if(scripts.childNodes[0].innerHTML){newScript.innerHTML = scripts.childNodes[0].innerHTML;}

		// Attributes
		var attrs = scripts.childNodes[0].attributes;
		for(var i=0; i<attrs.length; i++){
			newScript.setAttribute(attrs[i].name , attrs[i].value);
		}

		// script実行（読み込み）
		target.appendChild(newScript);
		trash.appendChild(scripts.childNodes[0]);
		this.orderScripts(scripts , target);

	};

	AJAX.prototype.addHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new AJAX({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML += div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	AJAX.prototype.lastModified = function(path , callback){
		if(!path || !callback){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return}

		httpoj.open("get" , path);
		httpoj.onreadystatechange = (function(callback){
			if (httpoj.readyState == 4 && httpoj.status == 200) {
				var date = new Date(httpoj.getResponseHeader("last-modified"));
				var res = {
					date : date,
					y : date.getFullYear(),
					m : date.getMonth() + 1,
					d : date.getDate(),
					h : date.getHours(),
					i : date.getMinutes(),
					s : date.getSeconds()
				};
				callback(res);
			}
		}).bind(this,callback);
		httpoj.send(null);
	};


  // ----------
  // Library
  var LIB   = function (){};
 
  LIB.prototype.event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };

  // 起動scriptタグを選択
  LIB.prototype.currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return this.currentScriptTag = scripts[scripts.length-1].src;
  })();

  // [共通関数] URL情報分解
	LIB.prototype.urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };

  //指定したエレメントの座標を取得
	LIB.prototype.pos = function(e,t){

		//エレメント確認処理
		if(!e){return null;}

		//途中指定のエレメントチェック（指定がない場合はbody）
		if(typeof(t)=='undefined' || t==null){
			t = document.body;
		}

		//デフォルト座標
		var pos={x:0,y:0};
		do{
			//指定エレメントでストップする。
			if(e == t){break}

			//対象エレメントが存在しない場合はその辞典で終了
			if(typeof(e)=='undefined' || e==null){return pos;}

			//座標を足し込む
			pos.x += e.offsetLeft;
			pos.y += e.offsetTop;
		}

		//上位エレメントを参照する
		while(e = e.offsetParent);

		//最終座標を返す
		return pos;
  };
  
  // 配列（連想配列）のソート
  LIB.prototype.hash_sort = function(val){
    // json化して戻すことで、元データの書き換えを防ぐ
    var hash = JSON.parse(JSON.stringify(val));
    
    // 連想配列処理
    if(typeof hash === "object"){
      var flg = 0;
      for(var i in hash){
        if(typeof hash[i] === "object"){
          hash[i] = JSON.stringify(hashSort(hash[i]));
        }
        flg++;
      }
      if(flg <= 1){console.log(hash);
        return JSON.stringify(hash)}
      if(typeof hash.length === "undefined"){
        var keys = Object.keys(hash).sort();
        var newHash = {};
        for(var i=0; i<keys.length; i++){
          newHash[keys[i]] = hash[keys[i]];
        }
        return newHash;
      }
      else{
        hash.sort(function(a,b){
          if( a < b ) return -1;
          if( a > b ) return 1;
          return 0;
        });
        return hash;
      }
    }
    // その他タイプはそのまま返す
   else{
      return hash;
    }
  }
  // ２つのハッシュデータの同一比較
  LIB.prototype.hash_compare = function(data1 , data2){
    data1 = this.hash_sort(data1);
    data2 = this.hash_sort(data2);
    if(JSON.stringify(data1) === JSON.stringify(data2)){
      return true;
    }
    else{
      return false;
    }
  };
  LIB.prototype.upperSelector = function(elm , selectors) {
    selectors = (typeof selectors === "object") ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement) {
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }
  


  // ----------
  // setup
  var MAIN = function(options){

    if(!options){return;}
    this.options = this.setOptions(options);

    var lib  = new LIB();
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , (function(e){this.set(e)}).bind(this));break;
      default            : lib.event(window , "load" , (function(e){this.set(e)}).bind(this));break;
    }
  };

  // optionsセット
  MAIN.prototype.setOptions = function(options){
    if(!options){return __options}
    var lib = new LIB();

    var res = {};
    for(var i in __options){
      res[i] = __options[i];
    }
    for(var i in options){
      res[i] = options[i];
    }

    // 起動IDを保持
    window.$$input_cache_num = (typeof window.$$input_cache_num === "undefined") ? 0 : window.$$input_cache_num+1;
    res.id = String(+new Date()) +"."+ window.$$input_cache_num;

    // 起動プログラムを保持
    var src = lib.currentScriptTag;
    if(typeof src === "string"){
      var urlinfo = lib.urlinfo(src);
      res.module = {
        src : src,
        dir : urlinfo.dir,
        file : urlinfo.file
      };
    }
    else{
      res.module = {
        sec : null,
        file : null
      };
    }

    return res;
  };




  // イベント、属性セット
  MAIN.prototype.set = function(e){
    // lists-template
    this.getTemplate();

    // css
    this.setCss();
    
    // element初期設定
    this.setElement(this.options);

    // cacheデータ初期設定）
    this.cache_migration();

  };

  MAIN.prototype.getTemplate = function(){
    if(!this.options.module.dir){return}
    new AJAX({
      url : this.options.module.dir+"template.html",
      onSuccess : (function(res){
        if(!res){
          console.log("Error : input_cache : not-template-file. ("+ this.options.module.dir+"lists.html" +")");
          return;
        }
        this.options.template = res;

        // History機能
        this.history();
      }).bind(this)
    });
  };

  MAIN.prototype.setCss = function(){
    if(!this.options.module.dir){return}
    var file = this.options.module.file.replace(".js" , ".css");
    
    var head = document.querySelector("head");
    if(!head){return}

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = this.options.module.dir + file +"?"+ (+new Date());

    head.appendChild(link);
  };

  MAIN.prototype.setElement = function(options){
    if(!options){return}
    if(typeof options.inputs === "undefined" || !options.inputs.length){return}
    var lib = new LIB();

    for(var i=0; i<options.inputs.length; i++){
      var elm = document.querySelector(options.inputs[i].selector);
      if(!elm){continue}
      switch(this.options.eventMode){
        case "blur":
          lib.event(elm , "blur" , (function(e){this.event_input(e.target)}).bind(this));
          break;
        case "keyup":
        default:
          lib.event(elm , "keyup" , (function(e){this.event_input(e.target)}).bind(this));
          break;
      }
    }
  };


  


  // Events -----
  MAIN.prototype.event_input = function(elm){

    // 全ての対象項目のデータをcacheセーブ
    this.cache_save();

    // 
    if(this.options.wait){
      setTimeout((function(elm){this.check(elm)}).bind(this,elm) , this.options.wait);
    }
    else{
      this.check();
    }

  };

  MAIN.prototype.check = function(elm){
    // 入力された内容とマッチするデータがあるか検索
    var datas = this.cache_all_check(elm);

    // 対象項目がある場合のリスト表示
    if(datas && datas.length){
      this.viewLists(datas , elm);
    }
    else{
      this.closeLists();
    }
  };

  // Cache -----

  // 入力項目に対象データがあるか検索
  MAIN.prototype.cache_all_check = function(elm){
    if(elm && elm.value === ""){return false;}

    var elements = this.getElements_notEmpty();
    if(!elements || !elements.length){return false;}

    // storage-data領域からマッチするリストを抽出
    var datas = this.cache_load("data");
    if(!datas || !datas.length){return;}
    var res = [];
    for(var i=0; i<datas.length; i++){
      var flg = 0;
      for(var j=0; j<elements.length; j++){
        if(typeof datas[i].data[elements[j].selector] === "undefined"){continue;}
        // 現在入力項目の場合は、前方一致
        if(this.options.matchType === "fromt-match"){
          var reg = new RegExp("^"+elements[j].element.value);
          if(reg.exec(datas[i].data[elements[j].selector])){
            flg++;
          }
        }
        // 現在入力項目以外は、全部一致
        else{
          if(datas[i].data[elements[j].selector] === elements[j].element.value){
            flg++;
          }
        }
      }
      if(flg === elements.length){
        res.push(datas[i]);
      }
    }
    return res;
  };

  // 対象項目中の入力フォームから空ではない項目を抽出する
  MAIN.prototype.getElements_notEmpty = function(){
    var datas = [];
    for(var i=0; i<this.options.inputs.length; i++){
      var elm = document.querySelector(this.options.inputs[i].selector);
      if(!elm){continue;}
      if(elm.value === ""){continue}
      datas.push({
        selector : this.options.inputs[i].selector,
        element  : elm
      });
    }
    return datas;
  };

  // cacheデータから、空ではない項目を抽出する
  MAIN.prototype.getCache_notEmpty = function(){
    var cache = this.cache_load("cache");
    if(!cache || typeof cache.data === "undefined"){return [];}
    var datas = [];
    for(var i in cache.data){
      var elm = document.querySelector(i);
      if(!elm){continue;}
      if(cache.data[i] === ""){continue}
      datas.push({
        selector : i,
        element  : elm,
        value    : cache.data[i]
      });
    }
    return datas;
  };


  // cacheデータをdata領域に移行する（同じデータが存在している場合は日付のみ書き換える）
  MAIN.prototype.cache_migration = function(){
    var name_cache = this.options.cache_name +"_cache";
    var name_data  = this.options.cache_name +"_data";

    var ls_cache = this.cache_load("cache");
    if(!ls_cache || typeof ls_cache.data === "undefined"){return}

    var ls_data = this.cache_load("data");
    ls_data = (ls_data) ? ls_data : [];

    
    var elements = this.options.inputs;

    // 入力が全て空の時はマイグレーション処理ナシ
    var empty = 0;
    for(var j=0; j<elements.length; j++){
      if(ls_cache.data[elements[j].selector] === ""){empty++;}
    }
    if(empty === elements.length){return;}

    for(var i=0; i<ls_data.length; i++){
      var cnt = 0;
      for(var j=0; j<elements.length; j++){
        if(ls_data[i].data[elements[j].selector] === ls_cache.data[elements[j].selector]){cnt++;}
        
      }
      // 全ての項目で同じ入力値
      if(cnt === elements.length){
        ls_cache.count = ls_data[i].count;
        ls_cache.id    = ls_data[i].id;
        ls_data.splice(i,1);
        break;
      }
    }
    ls_cache.count = (typeof ls_cache.count === "undefined") ? 1 : ls_cache.count+1;
    
    ls_data = this.cache_max(ls_data);
    ls_data.push(ls_cache);
    localStorage.setItem(name_data , JSON.stringify(ls_data));
    localStorage.removeItem(name_cache);
  };
  
  MAIN.prototype.cache_make = function(){
    if(!this.options.inputs.length){return false;}
    var data = {};
    for(var i=0; i<this.options.inputs.length; i++){
      var elm = document.querySelector(this.options.inputs[i].selector);
      if(!elm){continue;}
      data[this.options.inputs[i].selector] = elm.value;
    }
    return data;
  };

  MAIN.prototype.cache_save = function(type , datas){
    type = (type === "data") ? "data" : "cache";
    var data = this.cache_make();
    var name = this.options.cache_name +"_"+ type;
    var datas = (datas) ? datas : {
      id : this.options.id,
      time : (+new Date()),
      data : data
    };
    localStorage.setItem(name , JSON.stringify(datas));
  };

  MAIN.prototype.cache_max = function(datas){
    if(!datas){return null}
    if(datas.length-1 > this.options.max_cache){
      datas.sort(function(a,b){
        a.count = (typeof a.count === "undefined") ? 1 : a.count;
        b.count = (typeof b.count === "undefined") ? 1 : b.count;
        // if( a.count < b.count ) return -1;
        // if( a.count > b.count ) return 1;
        if( a.time < b.time ) return -1;
        if( a.time > b.time ) return 1;
      });
      return datas.splice((datas.length - this.options.max_cache) , this.options.max_cache);
    }
    else{
      return datas;
    }
  };

  MAIN.prototype.cache_load = function(type , id){
    type = (type === "data") ? "data" : "cache";
    var name = this.options.cache_name +"_"+ type;
    var ls = localStorage.getItem(name);
    if(ls && id){
      var datas = JSON.parse(ls);
      for(var i=0; i<datas.length; i++){
        if(datas[i].id === id){
          return datas[i];
        }
      }
      return null;
    }
    else if(ls){
      return JSON.parse(ls);
    }
    else{
      return null;
    }
  };

  MAIN.prototype.cache_remove = function(id){
    if(!id){return}
    var datas = this.cache_load("data");
    if(!datas || !datas.length){return}
    for(var i=0; i<datas.length; i++){
      if(datas[i].id === id){
        delete datas[i];
        datas.splice(i,1);
        this.cache_save("data" , datas);
        break;
      }
    }
  };

  // View -----

  MAIN.prototype.closeLists = function(){
    var viewed = document.querySelector(".input-cache-base");
    if(viewed){
      viewed.parentNode.removeChild(viewed);
    }
  }

  MAIN.prototype.viewLists = function(datas , elm){
    if(typeof this.options.template === "undefined" || !this.options.template){return}
    this.closeLists();
    var lib = new LIB();

    var tmp = String(this.options.template);

    var base = document.createElement("div");
    base.className = "input-cache-base";
    base.innerHTML = tmp;
    document.body.appendChild(base);
    
    // header
    var header = base.querySelector(".input-cache-header");
    var title  = base.querySelector(".input-cache-title");
    if(header && title){
      lib.event(title, "click" , function(){
        if(base.getAttribute("data-lists-view") === "1"){
          base.removeAttribute("data-lists-view");
        }
        else{
          base.setAttribute("data-lists-view","1");
        }
      });
    }

    // close
    var close = base.querySelector(".input-cache-close");
    if(close){
      lib.event(close , "click" , (function(e){this.closeLists()}).bind(this));
    }

    // count
    var cnt = base.querySelector(".input-cache-count");
    if(cnt){
      cnt.textContent = datas.length;
    }

    // lists
    var ul = base.querySelector(".input-cache-lists");
    if(ul){
      var li_temp = ul.innerHTML;
      for(var i=0; i<datas.length; i++){
        ul.insertAdjacentHTML("beforeend",li_temp);
        var lis = ul.querySelectorAll("li");
        var li = lis[lis.length-1];

        li.setAttribute("data-id" , datas[i].id);
  
        var arr = []
        for(var j=0; j<this.options.inputs.length; j++){
          if(typeof datas[i].data[this.options.inputs[j].selector] === "undefined"
          || !datas[i].data[this.options.inputs[j].selector]){continue;}
          if(typeof this.options.inputs[j].view !== "undefined"
          && this.options.inputs[j].view === "hidden"){continue;}
          arr.push(datas[i].data[this.options.inputs[j].selector]);
        }
        if(!arr.length){continue;}

        // data
        var elm_data = li.querySelector(".input-cache-data");
        if(elm_data){
          elm_data.textContent = arr.join("/");
          lib.event(elm_data , "click" , (function(e){this.click_cacheLists(e.currentTarget)}).bind(this));
        }

        // remove
        var elm_remove = li.querySelector(".input-cache-remove");
        lib.event(elm_remove , "click" , (function(e){this.removeList(e.currentTarget)}).bind(this));
      }
      var lis = ul.querySelectorAll("li");
      ul.removeChild(lis[0]);
    }
  }

  // キャッシュリストをクリックした時のデータ保管処理
  MAIN.prototype.click_cacheLists = function(elm){
    if(!elm){return;}
    var li = new LIB().upperSelector(elm , "li");
    if(!li){return}
    var id = li.getAttribute("data-id");
    var data = this.cache_load("data" , id);
    for(var i=0; i<this.options.inputs.length; i++){
      var target = document.querySelector(this.options.inputs[i].selector);
      if(!target){continue}
      if(typeof data.data[this.options.inputs[i].selector] === "undefined"){continue}
      if(data.data[this.options.inputs[i].selector] === ""){continue}
      target.value = data.data[this.options.inputs[i].selector];
    }
    // close
    this.closeLists();
  };


  MAIN.prototype.removeList = function(elm){
    if(!elm){return;}
    var li = new LIB().upperSelector(elm , "li");
    if(!li){return;}
    var id = li.getAttribute("data-id");
    li.parentNode.removeChild(li);
    this.cache_remove(id);

    // count
    var cnt = document.querySelector(".input-cache-base .input-cache-count");
    if(cnt){
      var lists = document.querySelectorAll(".input-cache-base .input-cache-lists li");
      cnt.textContent = lists.length;
    }
  };

  // ページ読み込み直後に直近入力リストを表示
  MAIN.prototype.history = function(){
    // 直近リストを取得
    var datas = this.cache_history();
    if(!datas || !datas.length){return;}
// console.log(datas);
    this.viewLists(datas);
  };
  MAIN.prototype.cache_history = function(){
    // キャッシュデータを取得
    var datas = this.cache_load("data");
    if(!datas || !datas.length){return null;}

// console.log(this.options.history_count);
// console.log(datas);
// console.log(datas.splice(0,this.options.history_count));

    // time順にsort
    datas = datas.sort(function(a,b){
      if(a.time < b.time){return -1}
      if(a.time > b.time){return 1}
      return 0;
    });
    return datas.splice(0,this.options.history_count);
  };

  return MAIN;
})();
