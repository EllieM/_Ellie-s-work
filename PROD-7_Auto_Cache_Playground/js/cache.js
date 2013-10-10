/* GLOBAL */

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function putCache() {
    localStorage.setCacheItem("usersFavoriteColor", "blue", { minutes: 1 });
    alert("Cached 'usersFavoriteColor: blue' for 1 min...");
}
    
function getCache() {
    
    var color = localStorage.getCacheItem("usersFavoriteColor"); 
    if (color)
        alert('usersFavoriteColor: ' + color);
    else
        alert('Cache expired...');
}

function getCount() {
    alert(localStorage.length);
}

function getCountOfCachedItems(key) {
    // console.log(key);
    var cache =  localStorage.getCacheItem(key); 
    if(cache) {
        var count = 0;
        
        if (cache.hasOwnProperty('project'))
            count += cache.project.length;
        
        if (cache.hasOwnProperty('document'))
            count += cache.document.length;
        
        return count;
    } else {
        return "N/A";
    }    
}

//--------------------------------

function startCaching() {
    console.log('startCaching');
}

function cancelCaching() {
    console.log('cancelCaching');
}

function calcFactorial (n)
{ 
    var result = factorial (n);
    console.log(result);
}

function factorial (n)
{ 
    if(n==0) 
        return(1);
    return (n * factorial (n-1) );
}
//--------------------------------

var CacheManager = {

	init: function( config ) {
        console.log('CacheManager init');
        
        this.url = "https://remotedev.mcscad.com:444/ws/DataSources/pw.ProjectWise_S4/Navigation/Project";
        console.log(this.url);
        
        this.cancelFlag = false;
        this.cachedKeys = 0;
        this.docsToCache = 0;
        this.cachedDocs = 0;
        
        // this.printAllCachedKeys();
		this.fetch();
	},

    fetch : function() {       
        console.log('CacheManager fetch');
        var cache =  localStorage.getCacheItem(this.url); 
        
        if(cache) {
            console.log('CacheManager yes cache');
        } else {
            console.log('CacheManager no cache');
            this.getFromWeb(this.url);
        }
	},
    
    getFromWeb: function(keyUrl) {
        console.log('CacheManager getFromWeb');
		var self = this;
        // var urlToUse = (self.tempUrl == null) ? self.url : self.tempUrl;
        
        if (self.cancelFlag) {
            return;
        }
        
        $.ajax({
            url: keyUrl,
            dataType: "json",
            timeout: 10000,
            // async: false,
            
            beforeSend: function (xhr){ 
                xhr.setRequestHeader('Authorization', make_base_auth(username, password)); 
            },
            success: function (json) {
                // console.log(json);
                localStorage.setCacheItem(keyUrl, json, { days: 7 });
                
                self.cachedKeys++ ;
                $('#cachedKeysCount').text(self.cachedKeys);
                
                var con = $('#targetText');
                con.append("\n"+ keyUrl);
                con.scrollTop(
                        con[0].scrollHeight - con.height()
                    );              
                
                if (json.hasOwnProperty('document')) {
                    $.each(json.document, function() {
                        
                        self.docsToCache++ ;
                        $('#docsToCacheCount').text(self.docsToCache);
                        
                        var doc = $('#targetTextDoc');
                        doc.append("\n"+ this.$id);
                        doc.scrollTop(
                                doc[0].scrollHeight - doc.height()
                            );                           
                        
                        //if (this.mimetype == "text/plain") {
                        //if (this.name == "AllDGNLinkSets") {
                        if (this.mimetype == "application/pdf") {  
                            
                            console.log(this.$id);
                            console.log(this.name);                            
                            
                            CacheManager.downloadFile(this.$id, this.name);
                        }
                    });
                }
                
                // recursively cache all children
                if (json.hasOwnProperty('project')) {
                    
        			$.each(json.project, function() {
                        var newKeyUrl =  self.url + "/" + this.$id;
                        
                        //if (!self.cancelFlag) {
                            CacheManager.getFromWeb(newKeyUrl);
                        //}                                
                        
        			});
                } 
            },
            error: function (jqXHR, error_textStatus, errorThrown) {
                console.log(jqXHR);
            },
            complete: function() { 
                console.log('complete');
            }
        });              
    },
    
    downloadFile: function(docId, docName) {
        var self = this;
        var url = encodeURI("https://pwadmin:pwadmin@remotedev.mcscad.com:444/ws/DataSources/pw.ProjectWise_S4/Files/document/" + docId);
        var filePath = window.bentleyFS + "/" + docName;
        
        var ft = new FileTransfer();
        // ft.onprogress = this.ft_progress;
        ft.download(
            url,
            filePath,
            function(entry) {
                console.log("download complete: " + entry.fullPath);
                self.cachedDocs++ ;
                $('#cachedDocsCount').text(self.cachedDocs);                
            },
            function(error) {
                // alert("download error source " + error.source);
                // alert("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );            
        
    },
    
    cancelCaching: function() {  
        this.cancelFlag = true;
        console.log('cancelCaching');
        
        // $.ajaxSetup( { global: true } );
        
        var con = $('#targetText');
        con.text('- caching cancelled -');        
	},
    
    deleteCache: function() {       
        console.log('deleteCache');
        localStorage.clear();
        
        $('#targetText').text('');
        $('#cachedKeysCount').text(0);
        
        $('#targetTextDoc').text('');
        $('#docsToCacheCount').text(0);
        $('#cachedDocsCount').text(0);
	},
    
    printAllCachedKeys: function() {
        var con = $('#targetText');
        
        Object.keys(localStorage)
          .forEach(function(key){
              /* Delete localstorage keys starting with a certain word
               if (/^(todo-)|(note-)/.test(key)) {
                   localStorage.removeItem(key);
               }
              */
              
              // class="ui-disabled"
              if (key.indexOf('https') != -1) {
                  console.log(key);

                  con.append("\n"+ key);
                  con.scrollTop(
                        con[0].scrollHeight - con.height()
                  );                     
              }
           });
    }
    
}