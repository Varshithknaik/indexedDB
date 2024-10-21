import {
  get,
  set,
  getMany,
  setMany,
  update,
  del,
  clear,
  keys,
  values,
  entries,
  createStore,
} from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';
//methods return Promises
//default DB name is 'keyval-store' (like a document DB)
//default store name is 'keyval'    (like a Collection in the DB)

(function init() {
  //app is running now
  // console.log(get);

  const st = createStore('myDB' , 'myStore')

  set('user_id' , Date.now()).then(() => {
    console.log('saved the user_id');
    // overwrites old values for the same key;
  }).catch(console.warn)

  const myObj = {
    id : 123,
    name: 'steve',
    email: 'steve@work.org'
  }

  set('info' , myObj , st).then(() => {
    console.log('saved the info');
  }).catch(console.warn);

  const pup = [{ type: 'Boxer' }, { type: 'Great Pyrenees' }];

  const blob = new Blob([JSON.stringify(pup , null , 2)], { type: 'application/json' }); 

  set('puppies' , blob , st)

  get('info').then((data) => {
    console.log(data.id , data.email)
    // set() to update the key
  }).catch(console.warn)

  update('user_id' , (val) => {
    return val - 10000;
  }).then((data) => {
    console.log('Update is completed')
  }).catch(console.warn);

  set('nope' , 567);

  del('nope').then(() => {
    console.log('successfully deleted')
  }).catch(console.warn)

  keys().then((resp) => {
    console.log('keys',resp)
  })

  values().then((resp) => {
    console.log('values', resp);
  })

  entries().then((resp) => {
    console.log(resp , resp.length);
  })

})();