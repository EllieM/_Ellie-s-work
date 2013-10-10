/*** PAGE EVENTS ***/

// Navigation - Data Sources
$( '#navPage' ).live( 'pageinit', function(event) {
    console.log("#navPage pageinit");
    
    DataSources.init({
	   template: $('#dsTempl').html(),
	   container: $('ul.dataSources')	
	});
});

$( '#navPage' ).live( 'pageshow', function(event) {
    console.log("#navPage pageshow");
    
    if (DataSources.initialized == false) {
        $.mobile.loading( 'show' );
    }
    
    Breadcrumb.render({
        container: $('#navBreadcrumb'),
        name: 'reset',
        href: 'reset'
    });     
});


// Projects (list of projects, folders and documents) page events
$( '#projects' ).live( 'pagebeforeshow', function(event) {
    $('ul.projects').empty();
    $('ul.projects').listview("refresh");
});

$( '#projects' ).live( 'pageshow', function(event) {
  $.mobile.loading( 'show' );
  
  // clear filter
  $('input[data-type="search"]').val("");
  // trigger change
  // $('input[data-type="search"]').trigger("change");
    
  var selDS = $.mobile.pageData.dsId;
  var selPrj = $.mobile.pageData.prjId;
  var name = $.mobile.pageData.name;
    
  //  href="#projects?dsId={{dsId}}&prjId={{prjId}}&name={{name}}" 
  var href = "#projects?dsId=" + selDS + "&prjId=" + selPrj + "&name=" + name;
  // var currentUrl = $.mobile.activePage.data('url');
      
  Breadcrumb.render({
     container: $('#projectsBreadcrumb'),
     name: name,
     href: href
  });      
    
  Projects.init({
	   container: $('ul.projects'),
       prjTemplate: $('#projectsTempl').html(),
       docTemplate: $('#documentsTempl').html(),
       selDataSource: selDS,
       selProject: selPrj
	});
});

$( '#prj_popup' ).live('popupafteropen', function(event) {
    
    console.log('popupafteropen');
    // $(this).append("Add some HTML!");
    // $(this).html("Or replace the HTML contents.");
});


// DocumentDetails page events
$( '#document' ).live( 'pageinit', function(event) {
    console.log("#document pageinit");
    
    _tolito = TolitoProgressBar('progressbar')
            .setOuterTheme('b')
            .setInnerTheme('e')
            .isMini(true)
            .setMax(100)
            .setStartFrom(0)
            .showCounter(true)
            .logOptions()
            .build();
});

$( '#document' ).live('pagebeforeshow', function(event) {
    _tolito.setValue(0);
    
});

$( '#document' ).live( 'pageshow', function(event) {

  var selDS = $.mobile.pageData.dsId;
  var docId = $.mobile.pageData.docId;
  var name = $.mobile.pageData.name;
  var href = "#";
      
  Breadcrumb.render({
     container: $('#documentBreadcrumb'),
     name: name,
     href: href
  });       
    
  Document.init({
	   container: $('#documentContent'),
       selDataSource: selDS,
       docId: docId
	})       
});

/**************************************************************************************************/

/*** BIZ LOGIC ***/
var DataSources = {
    
	init: function( config ) {
        console.log('DataSources init...');
        
		this.template = config.template;
		this.container = config.container;
        this.url = "https://remotedev.mcscad.com:444/ws/DataSources?type=pw";
        this.initialized = false;
        
		this.fetch();
	},

	fetch : function() {
		var self = this;
        
		$.getJSON(self.url, function(json) {
            // console.log('Fetched dataSources:');
            // console.log(json);
            
    		var arr = $.map(json, function(ds){
    			return {
    				dsId : ds.id,
                    label : ds.label,
                    name: ds.label,
                    type: ds.type
    			};
    		});
            
            // filter the doubles
            self.dataSources = $.grep(arr, function (n, i) { 
                return n.type == null; 
            });            
            
			self.render();
            self.initialized = true;
            $.mobile.loading( 'hide' );
		});     
	},
       
	render: function() {
		var templ = Handlebars.compile( this.template );
		this.container.append(templ( this.dataSources ));
		this.container.listview("refresh");
	}    
}

var Projects = {

	init: function( config ) {
        console.log('Projects init...');
  
        this.container = config.container;
        this.prjTemplate = config.prjTemplate;
        this.docTemplate = config.docTemplate;
		
        this.selDataSource = config.selDataSource;
        this.selProject = config.selProject;
        
        // GET DataSources/{dataSource}/Navigation/{class}?properties={properties}
        this.tempURL = "https://remotedev.mcscad.com:444/ws/DataSources/" + this.selDataSource + "/Navigation/Project";
        
        this.url = "https://remotedev.mcscad.com:444/ws/DataSources/" + this.selDataSource + "/Navigation/Project";
        if (this.selProject && this.selProject != "undefined") {
            this.url += "/" + this.selProject;
        }
        
        console.log(this.url);
		this.fetch();
	},
    
    getImage: function(mimetype) {
        if (mimetype == "application/msword") return "doc";
        if (mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
        
        if (mimetype == "application/vnd.ms-excel") return "xls";
        if (mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "xls";
        
        if (mimetype == "application/vnd.ms-powerpoint") return "ppt";
        if (mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
        
        if (mimetype == "application/zip") return "zip";
        if (mimetype == "application/pdf") return "pdf";
        
        if (mimetype == "text/rtf") return "rtf";
        if (mimetype == "text/plain") return "txt";
        
        if (mimetype == "image/gif") return "gif";
        if (mimetype == "image/png") return "png";
        if (mimetype == "image/jpg") return "jpg";
        if (mimetype == "image/jpeg") return "jpg";
        
        return "default";
	},    

    fetch : function() {
        
        /* ENABLE */
        var cache =  localStorage.getCacheItem(this.url); 
        
        if(cache) {
            this.processData(cache);
            $.mobile.loading( 'hide' ); 
        } else {
            console.log('key not found: ' + this.url);
            this.getFromWeb();
        }
	},
    
    getFromWeb: function() {
		var self = this;

        $.ajax({
            url: self.url,
            dataType: "json",
            timeout: 60000,
            // cache: true,
            // async: false, 
            
            beforeSend: function (xhr){ 
                xhr.setRequestHeader('Authorization', make_base_auth(username, password)); 
            },
            success: function (json) {
                // console.log(json);
                self.processData(json);
                /* ENABLE */
                localStorage.setCacheItem(self.url, json, { days: 7 });
            },
            
            // error: function (xhr, textStatus, error) {
            error: function (jqXHR, error_textStatus, errorThrown) {
                // self.renderPrj();  
                $(self.container).html("<li>Timeout or Access Denied</li>");
                self.container.listview("refresh");
            },
            complete: function() { 
                $.mobile.loading( 'hide' ); 
            }
        });              
    },    
    
    processData: function(json) {
        var self = this;
        console.log(json);
        
        if (json.hasOwnProperty('project')) {
            // console.log(json.project);

			self.projects = $.map(json.project, function(prj) {
                var count = getCountOfCachedItems(self.tempURL + "/" + prj.$id);
                var isFolder = (prj.environment_id > 0) ? false : true;
                // console.log(prj);
                
				return {
					dsId: self.selDataSource,
                    prjId: prj.$id,
                    name : prj.name,
                    image:  (isFolder) ? "folder" : "prj",
                    itemCount: count,
                    counterStyle: (count == "N/A") ? "counterRed" : "counterGreen"
				};
			});
			self.renderPrj();  
        }
        
        if (json.hasOwnProperty('document')) {
            // console.log(json.document);
            // console.log(self.selDataSource);
   
			self.documents = $.map(json.document, function(doc){
                
				return {
                    dsId: self.selDataSource,
                    prjId: self.selProject,
                    docId: doc.$id,
                    image: self.getImage(doc.mimetype),
                    name: doc.name,
                    create_time: doc.create_time,
                    file_update_time: doc.file_update_time,
                    custom_attributes: doc.custom_attributes
				};
			});
			self.renderDoc();  
        }                
        
        self.container.listview("refresh");
    },

	renderPrj: function() {
		var templ = Handlebars.compile( this.prjTemplate );
		this.container.append(templ( this.projects ));
	},
	renderDoc: function() {
		var templ = Handlebars.compile( this.docTemplate );
		this.container.append(templ( this.documents ));
	}
}

var Document = {

	init: function( config ) {
        console.log('Document init...');
        // console.log(config.docId);
  
        this.container = config.container;
        this.selDataSource = config.selDataSource;
        this.docId = config.docId;
		
		this.fetch();
	},

	fetch : function(){
		var self = this;
        $("#documentContent").html('');
        
        var data = Projects.documents;
        var propName = 'docId';
        
        for (var i = 0; i < data.length; i++) {
            if (data[i][propName] !== null && data[i][propName] == self.docId) {
                self.document =  data[i]; 
            }
        }
        
        self.render();
	},
    
    downloadFile : function(){
        
        var url = encodeURI("https://pwadmin:pwadmin@remotedev.mcscad.com:444/ws/DataSources/" + this.selDataSource + "/Files/document/" + this.docId);
        var filePath = window.bentleyFS + "/" + this.document.name;
        
        var ft = new FileTransfer();
        ft.onprogress = this.ft_progress;
        ft.download(
            url,
            filePath,
            function(entry) {
                alert("download complete: " + entry.fullPath);
            },
            function(error) {
                // alert("download error source " + error.source);
                // alert("download error target " + error.target);
                alert("upload error code" + error.code);
            }
        );    
    },
    
     ft_progress : function (result){
        var percent = result.loaded / result.total * 100;
        percent = Math.round(percent);
        _tolito.setValue(percent);
     },
    
	render: function() {      
        // console.log(this.document);
        
        var docContent = $("#documentContent");
        docContent.append("<p><b>name</b>: " + this.document.name + "</p>");
        docContent.append("<p><b>create_time</b>: " + this.document.create_time + "</p>");
        docContent.append("<p><b>file_update_time</b>: " + this.document.file_update_time + "</p>");
        
        if (this.document.custom_attributes) {
            docContent.append("<hr/>");
            docContent.append("<p>custom attributes:</p>");
            
            $.each(this.document.custom_attributes, function (idx, attr) {
                docContent.append("<p><b>" + attr.name + "</b>: " + attr.value +"</p>");
            });            
        }
	}
}

var Breadcrumb = {
    
    init: function(config) {
        // console.log('Breadcrumb init...');
        
		this.template = config.template;
        this.historyItems = [];
    },
    
	render: function(item) {
        // console.log(item);
		var self = this;
        
        $(item.container).empty();
        item.container.append('<li><a href="#mainPage" title="Home"><img src="css/icons/home.gif" alt="Home" class="home" /></a></li>');
        item.container.append('<li><a href="#navPage">Data Sources</a></li>');
          
        // adjust our historyItems
        self.calc(item.name, item.href);
        
        // render
		var templ = Handlebars.compile( self.template );
		item.container.append(templ( self.historyItems ));
	},
    
    calc: function(name, href) {
        var self = this;
        // calc all items in the control
        // 1. add only if href is not alreay in the list
        // 2. remove all trailing items
        
        // loop over each value in the array.
        var found = null;
        $.each(self.historyItems, function( index, value ) {
            if (value.href == href) {
                found = {"id": index, "href": value}
                return;
            }
        }); 
        
        // console.log(self.historyItems);
        if (href == 'reset') {
            // if we're reseting leave only the hard-codded first two items
            self.historyItems = []; 
            return;
        } 
        else if (found != null) {
            self.historyItems = $.grep(self.historyItems, function(value, index) {
                return index <= found.id;
            }); 
        } 
        else {
            self.historyItems.push({"name": name, "href": href})    
        }
    }
};
