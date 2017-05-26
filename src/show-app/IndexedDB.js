;(function(){

	var indexedDB 	  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
		IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
		dbName 	  = "PurchasesDB",
		categoryStore="category",
		itemsStore="items"

	function logerr(err){
		console.log(err);
	}

	function connectDB(f){
		var request = indexedDB.open(dbName, 1);
		request.onerror = logerr;
		request.onsuccess = function(){
			f(request.result);
		}
		request.onupgradeneeded = function(e){
			e.currentTarget.result.createObjectStore(categoryStore, { keyPath: "id" });
			e.currentTarget.result.createObjectStore(itemsStore, { keyPath: "id" });
			connectDB(f);
		}
	}

	function getFile(store,file, f){
		connectDB(function(db){
			var request = db.transaction([store], "readonly").objectStore(store).get(file);
			request.onerror = logerr;
			request.onsuccess = function(){
				f(request.result ? request.result : -1);
			}
		});
	}

	function getStorage(storeName,f){
		connectDB(function(db){
			var rows = {},
				store = db.transaction([storeName], "readonly").objectStore(storeName);

			if(store.mozGetAll)
				store.mozGetAll().onsuccess = function(e){
					f(e.target.result);
				};
			else
				store.openCursor().onsuccess = function(e) {
					var cursor = e.target.result;
					if(cursor){
						rows[cursor.value.id]=cursor.value;
						cursor.continue();
					}
					else {
						f(rows);
					}
				};
		});
	}

	function setFile(storeName,file){
		connectDB(function(db){
			var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(file);
			request.onerror = logerr;
			request.onsuccess = function(){
				return request.result;
			}
		});
	}

	function delFile(storeName,file){
		connectDB(function(db){
			var request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(file);
			request.onerror = logerr;
			request.onsuccess = function(){
				console.log("File delete from DB:", file);
			}
		});
	}

	window.IndexedDB={
		getFile,
		getStorage,
		setFile,
		delFile,
		CATEGORY_STORE:categoryStore,
		ITEMS_STORE:itemsStore
	}
})();
