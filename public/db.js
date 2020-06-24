//create offline code here
let db;

// create a new db request for a "budget" database.
const request = window.indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  const budgetPending = db.createObjectStore('budget', { autoIncrement: true });
  budgetPending.createIndex('pendingIndex', 'pending');
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (error) {
  // log error here
  console.log('ERROR:', error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(['budget'], 'readwrite');
  // access your pending object store
  const budgetPending = transaction.objectStore('budget');
  // add record to your store with add method.
  budgetPending.add(record);
};

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(['budget'], 'readwrite');
  const budgetPending = transaction.objectStore('budget');
  // const pendingIndex = budgetPending.index("pendingIndex")
  // console.log("checkDatabase -> pendingIndex", pendingIndex)
  const getRequest = budgetPending.getAll();
  // getRequest.onsuccess = () => {
  //   console.log(getRequest.result);
  // };
  // access your pending object store
  // get all records from store and set to a variable
  getRequest.onsuccess = function () {
    if (getRequest.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getRequest.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(['budget'], 'readwrite');
          // access your pending object store
          const budgetPending = transaction.objectStore('budget');
          // clear all items in your store
          budgetPending.clear();
        });
    }
  };
};

// listen for app coming back online
window.addEventListener('online', checkDatabase);
