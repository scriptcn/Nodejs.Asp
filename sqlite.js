/*
1. new sqlite3.Database(filename,[mode],[callback])
返回数据库对象并且自动打开和连接数据库
它没有独立打开数据库的方法
2. sqlite3.verbose()
集成数据库的执行模式，以便于调试，它没有重置的方法。
3. Database#close([callback])
关闭和释放数据库对象
4. Database#run(sql,param,...],[callback])
运行指定参数的SQL语句，完成之后调用回调函数，它不返回任何数据，在回调函数里面有一个参数，SQL语句执行成功，则参数的值为null,反之为一个错误的对象，它返回的是数据库的操作对象。在这个回调函数里面当中的this,里面包含有lastId(插入的ID)和change(操作影响的行数,如果执行SQL语句失败，则change的值永远为0);

5. Database#get(sql,[param,...],[callback])
运行指定参数的SQL语句，完成过后调用回调函数。如果执行成功，则回调函数中的第一个参数为null,第二个参数为结果集中的第一行数据，反之则回调函数中只有一个参数，只参数为一个错误的对象。

6. Database#all(sql,[param,...],[callback])
运行指定参数的SQL语句，完成过后调用回调函数。如果执行成功，则回调函数中的第一个参数为null,第二个参数为查询的结果集，反之，则只有一个参数，且参数的值为一个错误的对象。

7. Database#prepare(sql,[param,...],[callback])
预执行绑定指定参数的SQL语句，返回一个Statement对象，如果执行成功，则回调函数的第一个参数为null,反之为一个错误的对象。
*/

"use strict";
var sqlite3 = require('sqlite3');
var conn = new sqlite3.Database('./data/guestbook.db3',  sqlite3.OPEN_READWRITE, function(e, r) {
	if(e) console.log(e);
});

process.on('exit', function() {
	//conn.close();
});

module.exports = {
	'conn' : conn,
	'page' : function(PageNo, PageSize, PageUrl) {
		var PageNo = PageNo * 1 || 1;
		var PageSize = PageSize || 15;
		var PageUrl = PageUrl || "?";
		var DataCount = 0;
		this.Query = function(sql, callFunc){
			var CountSql = sql.split(/ ORDER/i)[0].replace(/^select(.*?) from (.*?)$/i, "SELECT COUNT(*) AS `num` FROM $2");
			conn.get(CountSql, function(e, re) {
				DataCount = re.num;
				var newSql = sql + ' LIMIT ' + (PageNo - 1) * PageSize + ',' + PageSize;
				conn.all(newSql, function(e, r) {
					callFunc(r, Show(DataCount));
				});
			});
		}
		function Show(DataCount){
			var reData = [];
			var MaxPage = Math.ceil(DataCount / PageSize);
			reData.push("<span>" + DataCount + "</span><span>" + PageNo + "/" + MaxPage + "</span>");
			reData.push("<span>" + (PageNo < 7 ? "First" : "<a href='" + PageUrl + "page=1'>First</a>") + "</span>");
			reData.push("<span>" + (PageNo == 1 ? "Previous" : "<a href='" + PageUrl + "page=" + (PageNo - 1) + "'>Previous</a>") + "</span>");
			var start = (function(){
				if(PageNo - 5 <= 0) {
					return 1;
				} else if(MaxPage - PageNo < 5) {
					return MaxPage - 9 > 1 ? MaxPage - 9 : 1;
				} else {
					return PageNo - 5;
				}
				
			})();
			var end = (function() {
				return PageNo + (PageNo - 5 <= 0 ? (10 - PageNo) : 4);
			})();
			for(var k = start; k <= end && k <= MaxPage; k ++){
				reData.push("<span>" + (k == PageNo ? (k < 10 ? "0" + k : k) : "<a href='" + PageUrl + "page=" + k + "'>" + (k < 10 ? "0" + k : k) + "</a>") + "</span>");
			}
			reData.push("<span>" + (PageNo == MaxPage ? "Next" : "<a href='" + PageUrl + "page=" + (PageNo + 1) + "'>Next</a>") + "</span>");
			reData.push("<span>" + (PageNo > MaxPage - 5 ? "Last" : "<a href='" + PageUrl + "page=" + MaxPage + "'>Last</a>") + "</span>");
			return reData.join("");
		}
	}
};