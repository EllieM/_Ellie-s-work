/* PAGE EVENTS */

$( '#cachePage' ).live( 'pageinit', function(event) {
    explorer.init(); 
});

$( '#cachePage' ).live( 'pagebeforeshow', function(event) {
    
    if (currentDir && currentDir.name != root.name)
        $('#backBtn').show();
    else
        $('#backBtn').hide();
});

/* EXPLORER */
var explorer = {
    init: function() {
        this.bindEvents();
    },    
    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        explorer.receivedEvent('deviceready');
        
	    $('#backBtn').hide();
	    getFileSystem();
	    clickItemAction();        
        
        // window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, failFS);       
    },
    
    receivedEvent: function(id) {
        // console.log('Received Event: ' + id);
    },
};

