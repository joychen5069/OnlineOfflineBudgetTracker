//create offline code here
let db;
// create a new db request for a "budget" database.
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.results;

    // create object store called "pending" and set autoIncrement to true
    db.createObjectStore('pending', { autoIncrement: true });
    //   budgetPending.createIndex('pendingIndex', 'pending')
};

request.onsuccess = function (event) {
    db = event.target.result;

    //if user is online, check for pending
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (error) {
    // log error here if it fails
    console.log('Error: ', error)
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(['pending'], 'readwrite');
    // access your pending object store
    const budgetPending = transaction.objectStore('pending')
    // add record to your store with add method.
    budgetPending.add(record)
}

//create function to check database for pending transactions
function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(['pending', 'readwrite'])
    // access your pending object store
    const budgetPending = transaction.objectStore('pending');
    // get all pending records
    const getAll = budgetPending.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
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
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
