var app = {
    
    // constructor
    initialize: function() {
        this.bindEvents();
        
        /*** GLOBAL SETTINGS ***/
        $.mobile.changePage.defaults.allowSamePageTransition = true;
        
        $(document).bind("pagebeforechange", function( event, data ) {
           $.mobile.pageData = (data && data.options && data.options.pageData)
           ? data.options.pageData
           : null;
        });        
    },

    // Bind any events that are required on startup. 
    // Common events are: 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.hide();
        
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, failFS);        
    },
    
    receivedEvent: function(id) {
        // console.log('Received Event: ' + id);
    }
};

/* Secondary file system */ 
function failFS() {
    // alert("failed to get filesystem");
}

function gotFS(fileSystem) {

    // save the file system for later access
    // console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
    window.rootFS.getDirectory("mcs_storage", {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail);
}

function onGetDirectorySuccess(dir) { 
    // alert("Created dir " + dir.name); 
    window.bentleyFS = dir.fullPath;
} 

function onGetDirectoryFail(error) { 
     // alert("Error creating directory " + error.code); 
} 


/* GLOBAL */ 
var _tolito = null;

/* UI */
function extPrjDlgContent(dsId, prjId) {
    
    // console.log('dsId: ' + dsId);
    console.log('prjId: ' + prjId);
    
    //---------------------------------------------------------
    // go thru the cache and find the specific project settings
    //---------------------------------------------------------
    for (var key in localStorage){
        
        if (key.indexOf('http') >= 0) {
            
           var cache =  localStorage.getCacheItem(key); 
            
           if (cache && cache.hasOwnProperty('project')) {
               
               $.each(cache.project, function (idx, prj) {
                   
                   if (prj.$id == prjId) {
                       var dialogContent = $("#projectDialogContent");
                       dialogContent.html("<p>Name: <b>" + prj.name +"</b></p>");
                       dialogContent.append("<p>Create time: " + prj.create_time +"</p>");
                       dialogContent.append("<p>Update time: " + prj.update_time +"</p>");
                       dialogContent.append("<p>Environment id: " + prj.environment_id +"</p>");
                       dialogContent.append("<p>Rich project: " + prj.is_rich_project +"</p>");
                       
                       if (prj.custom_properties) {
                           dialogContent.append("<hr/>");
                           dialogContent.append("Custom properties:");
                           
                           $.each(prj.custom_properties, function (idx, prop) {
                               dialogContent.append("<p>" + prop.name + ": " + prop.value +"</p>");
                           });
                           
                       } 
                   }
               });
           } 
        }    
    }
        
    $("#prj_popup").popup("open");
}