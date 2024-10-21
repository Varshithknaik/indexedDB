const IDB = (function init(){
  let db = null;
  let objectStore = null;
  let DBOpenReq = indexedDB.open( 'WhiskeyDB' , 6);

  DBOpenReq.addEventListener('error' , (err) => {
    // Error occured while trying to open DB
    console.warn(err);
  })

  DBOpenReq.addEventListener('success' , (ev) => {
    // DB has been opened... after upgradeneeded
    db = ev.target.result;
    console.log('success' ,db);
  })

  DBOpenReq.addEventListener('upgradeneeded' , (ev) => {
    // first time opening this DB
    // OR a new version was passed into open()
    db = ev.target.result;
    const oldVersion = ev.oldVersion;
    const newVersion = ev.newVersion || db.version;

    console.log('DB updated from version' , oldVersion , 'to' , newVersion );
    console.log('upgrade' , db);

    if(!db.objectStoreNames.contains('whiskeyStore')){
      objectStore = db.createObjectStore('whiskeyStore' , {
        keyPath : 'id'
      })
    }

    // objectStore = db.createObjectStore('foobar')

    if( db.objectStoreNames.contains('foobar') ){
      db.deleteObjectStore('foobar');
    }
  })

  document.whiskeyForm.addEventListener('submit' , (ev) => {
    ev.preventDefault();
    // one of the form buttons was clicked;
  })
})()