import { uid } from './uid.js';
console.log(uid());

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
    buildList();
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

  document.getElementById('btnUpdate').addEventListener('click' , (ev) => {
    ev.preventDefault();

    const name = document.getElementById('name').value.trim();
    const country = document.getElementById('country').value.trim();
    const age = parseInt( document.getElementById('age').value );
    const owned = document.getElementById('isOwned').checked;

    const key = document.whiskeyForm.getAttribute('data-key');

    if(key){
      const whiskey = {
        id: key,
        name,
        country,
        age,
        owned
      }
  
      const tx = makeTX( 'whiskeyStore' , 'readwrite');
      tx.oncomplete = (ev) => {
        console.log(ev)
        buildList()
        clearForm();
      }
      const store = tx.objectStore('whiskeyStore');
      const request = store.put(whiskey);

      request.onsuccess = (ev) => {
        console.log('successfully updated an object');
        // move on to next request in the reansaction or commit the transaction
      }

      request.onerror = (err) => {
        console.log('error in request to delete');
      }

    }
  })

  document.getElementById('btnDelete').addEventListener('click' , (ev) => {
    ev.preventDefault();

    const key = document.whiskeyForm.getAttribute('data-key');

    if(key){
      const tx = makeTX( 'whiskeyStore' , 'readwrite');
      tx.oncomplete = (ev) => {
        console.log(ev)
        buildList()
        clearForm();
      }
      const store = tx.objectStore('whiskeyStore');
      const request = store.delete(key);  //request a delete

      request.onsuccess = (ev) => {
        console.log('successfully deleted an object');
        // move on to next request in the reansaction or commit the transaction
      }

      request.onerror = (err) => {
        console.log('error in request to delete');
      }
    }

  })

  document.getElementById('btnAdd').addEventListener('click' , (ev) => {
    ev.preventDefault();
    // one of the form buttons was clicked;
    const name = document.getElementById('name').value.trim();
    const country = document.getElementById('country').value.trim();
    const age = parseInt( document.getElementById('age').value );
    const owned = document.getElementById('isOwned').checked;

    const whiskey = {
      id: uid(),
      name,
      country,
      age,
      owned
    }

    const tx = makeTX( 'whiskeyStore' , 'readwrite');

    tx.oncomplete = (ev) => {
      console.log(ev)
      buildList()
      clearForm();
    }

    const store = tx.objectStore('whiskeyStore');

    const request = store.add(whiskey);

    request.onsuccess = (ev) => {
      console.log(ev, 'successfully added an object')
    }

    request.onerror = (err) => {
      console.log('error in request to add');
    }
  })

  document.querySelector(".wList").addEventListener('click' , (ev) => {
    const li = ev.target.closest('[data-key]');
    const id = li.getAttribute('data-key');
    const tx = makeTX('whiskeyStore' , 'readonly');

    tx.oncomplete = (ev) => {
      // get transaction complete
    }

    const store = tx.objectStore('whiskeyStore');
    console.log(id);
    const req = store.get(id);
    req.onsuccess = (ev) => {
      const request = ev.target;
      const whiskey = request.result;

      document.getElementById('name').value = whiskey.name;
      document.getElementById('country').value = whiskey.country;
      document.getElementById('age').value = whiskey.age;
      document.getElementById('isOwned').checked = whiskey.owned;

      document.whiskeyForm.setAttribute('data-key' , whiskey.id);
    }

    req.onerror = (err) => {
      console.warn(err)
    }
  })

  function buildList(){
    // use getAll to get an array of objects from our store
    const list = document.querySelector('.wList');
    list.innerHTML = `<li>Loading...</li>`;

    const tx = makeTX('whiskeyStore' , 'readonly');
    tx.oncomplete = (ev) => {
      // transaction for reading all object is complete

    }

    const store = tx.objectStore('whiskeyStore');
    const getReq = store.getAll();
    // returns an array 
    // options can pass in a key or a keyRange
    getReq.onsuccess = (ev) => {
      // getAll was successful
      const request = ev.target;  //request === getReq === ev.target
      console.log({request});

      list.innerHTML = request.result.map(whiskey => {
        return `<li data-key="${whiskey.id}"> <span> ${ whiskey.name  } </span> ${ whiskey.age  } </li>`
      }).join("\n")
    }

    getReq.onerror = (err) => {
      console.warn(err);
    }
  }

  function makeTX(storeName , mode){
    const tx = db.transaction(storeName , mode);

    tx.onerror = (err) => {
      console.warn(err);
    }

    return tx;
  }

  function clearForm(ev){
    if(ev) ev.preventDefault();
    document.whiskeyForm.reset();
    document.whiskeyForm.removeAttribute('data-key');
  }
})()