/*
1. new sqlite3.Database(filename,[mode],[callback])
�������ݿ�������Զ��򿪺��������ݿ�
��û�ж��������ݿ�ķ���
2. sqlite3.verbose()
�������ݿ��ִ��ģʽ���Ա��ڵ��ԣ���û�����õķ�����
3. Database#close([callback])
�رպ��ͷ����ݿ����
4. Database#run(sql,param,...],[callback])
����ָ��������SQL��䣬���֮����ûص����������������κ����ݣ��ڻص�����������һ��������SQL���ִ�гɹ����������ֵΪnull,��֮Ϊһ������Ķ��������ص������ݿ�Ĳ�������������ص��������浱�е�this,���������lastId(�����ID)��change(����Ӱ�������,���ִ��SQL���ʧ�ܣ���change��ֵ��ԶΪ0);

5. Database#get(sql,[param,...],[callback])
����ָ��������SQL��䣬��ɹ�����ûص����������ִ�гɹ�����ص������еĵ�һ������Ϊnull,�ڶ�������Ϊ������еĵ�һ�����ݣ���֮��ص�������ֻ��һ��������ֻ����Ϊһ������Ķ���

6. Database#all(sql,[param,...],[callback])
����ָ��������SQL��䣬��ɹ�����ûص����������ִ�гɹ�����ص������еĵ�һ������Ϊnull,�ڶ�������Ϊ��ѯ�Ľ��������֮����ֻ��һ���������Ҳ�����ֵΪһ������Ķ���

7. Database#prepare(sql,[param,...],[callback])
Ԥִ�а�ָ��������SQL��䣬����һ��Statement�������ִ�гɹ�����ص������ĵ�һ������Ϊnull,��֮Ϊһ������Ķ���
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