/*
var ADODB = require('node-adodb'),  connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=node-adodb.mdb;'); // 全局调试开关，默认关闭 ADODB.debug = true; // 不带返回的查询 connection  .execute('INSERT INTO Users(UserName, UserSex, UserAge) VALUES ("Newton", "Male", 25)')  .on('done', function (data){    console.log('Result:'.green.bold, JSON.stringify(data, null, '  ').bold);  })  .on('fail', function (data){    // TODO 逻辑处理   });  // 带返回标识的查询 connection  .executeScalar(    'INSERT INTO Users(UserName, UserSex, UserAge) VALUES ("Newton", "Male", 25)',    'SELECT @@Identity AS id'  )  .on('done', function (data){    console.log('Result:'.green.bold, JSON.stringify(data, null, '  ').bold);  })  .on('fail', function (data){    // TODO 逻辑处理   }); // 带返回的查询 connection  .query('SELECT * FROM Users')  .on('done', function (data){    console.log('Result:'.green.bold, JSON.stringify(data, null, '  ').bold);  })  .on('fail', function (data){    // TODO 逻辑处理   });
*/
"use strict";
var adodb = require('node-adodb');
var conn = adodb.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/data.mdb;', function(e, r) {
	if(e) console.log(e);
});
	
adodb.debug = false;	
module.exports = {
	'conn' : conn,
	'page' : function(PageNo, PageSize, PageUrl) {
		var PageNo = PageNo * 1 || 1;
		var PageSize = PageSize || 15;
		var PageUrl = PageUrl || "?";
		var DataCount = 0;
		this.Query = function(sql, callFunc){
			var CountSql = sql.split(/ ORDER/i)[0].replace(/^select(.*?) from (.*?)$/i, "SELECT COUNT(*) AS `num` FROM $2");
			conn.query(CountSql).on('done', function(re) {
				DataCount = re.records[0].num;
				var newSql = sql.replace(/SELECT\s/i, "SELECT TOP " + PageSize + " ");
				if(PageNo > 1) {
					newSql = newSql.replace(/FROM ([^\s]+)(.*)$/i, function(a, b, c) {
						return "FROM " + b + " WHERE `ID` " + (/DESC/i.test(c) ? "<" : ">") + 
						" (SELECT " + (/DESC/i.test(c) ? 'MIN' : 'MAX') + 
						"(`ID`) FROM (SELECT TOP " + (PageNo - 1) * PageSize + " `ID` FROM " + b + c + "))" + c.replace(/WHERE/i, 'AND');
					});
				}
				conn.query(newSql).on('done', function(r) {
					callFunc(r.records, Show(DataCount));
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
}